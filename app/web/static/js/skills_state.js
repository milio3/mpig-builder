/**
 * skills_state.js - Motor de Estado y Lógica de Negocio de MPIG Builder
 * Maneja el cálculo de puntos, reglas de progresión, y el límite de 4 activas por personaje.
 */

const SkillState = {
  masterData: null,

  state: {
    heroLevel: 80,
    builds: {
      'KNIGHT': { actives: {}, passives: {} },
      'WARRIOR': { actives: {}, passives: {} },
      'ASSASSIN': { actives: {}, passives: {} },
      'ARCHER': { actives: {}, passives: {} },
      'MAGE': { actives: {}, passives: {} }
    }
  },

  init(data) {
    this.masterData = data;
    this.resetAll();
  },

  getPassiveCurrentCap(finalMax, heroLevel) {
    if (finalMax <= 0) return 0;
    return Math.min(finalMax, 5 + Math.floor(heroLevel / 10));
  },

  getNextPassiveCapHeroLevel(finalMax, currentHeroLevel) {
    const currentCap = this.getPassiveCurrentCap(finalMax, currentHeroLevel);
    if (currentCap >= finalMax) return currentHeroLevel;
    const requiredHeroLevel = ((currentCap + 1) - 5) * 10;
    return Math.max(requiredHeroLevel, currentHeroLevel + 1);
  },

  getHeroStatPoints(heroId) {
    const total = Math.max(0, this.state.heroLevel - 1);
    const hb = this.state.builds[heroId];
    if (!hb) return { total, spent: 0, remaining: total };

    const spentActives = Object.values(hb.actives).reduce((a, b) => a + b, 0);
    const spentPassives = Object.values(hb.passives).reduce((a, b) => a + b, 0);
    const spent = spentActives + spentPassives;
    return {
      total,
      spent,
      remaining: Math.max(0, total - spent)
    };
  },

  setHeroLevel(newLevel) {
    newLevel = Math.max(1, Math.min(100, parseInt(newLevel) || 80));
    this.state.heroLevel = newLevel;

    // Ajustar niveles de pasivas que pudieran superar el nuevo tope
    if (this.masterData) {
      Object.keys(this.state.builds).forEach(hId => {
        const hero = this.masterData.heroes[hId];
        const hb = this.state.builds[hId];

        // Verificar activas desbloqueadas
        hero.actives.forEach(act => {
          if (newLevel < act.unlock_level) {
            hb.actives[act.id] = 0;
          }
        });

        // Verificar pasivas desbloqueadas y topes
        hero.passives.forEach((abId, pIdx) => {
          const pKey = 'P' + (pIdx + 1);
          const abInfo = this.masterData.abilities[String(abId)];
          const unlockLvl = this.masterData.row_unlock_levels.find((ul, r) => 
            this.masterData.passive_ids_by_row[r].includes(pIdx + 1)
          ) || 1;

          if (newLevel < unlockLvl) {
            hb.passives[pKey] = 0;
          } else {
            const cap = this.getPassiveCurrentCap(abInfo.max_level, newLevel);
            if ((hb.passives[pKey] || 0) > cap) {
              hb.passives[pKey] = cap;
            }
          }
        });
      });
    }

    if (window.renderSkillPlanner) {
      window.renderSkillPlanner();
    }
  },

  levelUpSkill(heroId, isPassive, key) {
    if (!this.masterData) return;
    const hero = this.masterData.heroes[heroId];
    const hb = this.state.builds[heroId];
    const pts = this.getHeroStatPoints(heroId);

    if (pts.remaining <= 0) return;

    if (isPassive) {
      const pIndex = parseInt(key.replace('P', '')) - 1;
      const abId = hero.passives[pIndex];
      const abInfo = this.masterData.abilities[String(abId)];
      const cap = this.getPassiveCurrentCap(abInfo.max_level, this.state.heroLevel);
      const unlockLvl = this.masterData.row_unlock_levels.find((ul, r) => 
        this.masterData.passive_ids_by_row[r].includes(pIndex + 1)
      ) || 1;

      if (this.state.heroLevel < unlockLvl) return;

      const currentLvl = hb.passives[key] || 0;
      if (currentLvl < cap) {
        hb.passives[key] = currentLvl + 1;
        if (window.renderSkillPlanner) window.renderSkillPlanner();
      }
    } else {
      const actSkill = hero.actives.find(a => a.id === key);
      if (this.state.heroLevel < actSkill.unlock_level) return;

      const currentLvl = hb.actives[key] || 0;
      if (currentLvl === 0) {
        // Regla: Máximo 4 habilidades activas equipadas por personaje
        const activeCount = Object.keys(hb.actives).filter(k => (hb.actives[k] || 0) > 0).length;
        if (activeCount >= 4) {
          if (window.showSkillToastNotice) {
            window.showSkillToastNotice(`⚠️ Límite: ${hero.name_en || hero.name} solo puede equipar 4 habilidades activas simultáneamente.`);
          }
          return;
        }
      }

      if (currentLvl < actSkill.max_level) {
        hb.actives[key] = currentLvl + 1;
        if (window.renderSkillPlanner) window.renderSkillPlanner();
      }
    }
  },

  levelDownSkill(heroId, isPassive, key) {
    const hb = this.state.builds[heroId];
    if (!hb) return;

    if (isPassive) {
      const currentLvl = hb.passives[key] || 0;
      if (currentLvl > 0) {
        hb.passives[key] = currentLvl - 1;
        if (window.renderSkillPlanner) window.renderSkillPlanner();
      }
    } else {
      const currentLvl = hb.actives[key] || 0;
      if (currentLvl > 0) {
        hb.actives[key] = currentLvl - 1;
        if (window.renderSkillPlanner) window.renderSkillPlanner();
      }
    }
  },

  maxSingleSkill(heroId, isPassive, key) {
    if (!this.masterData) return;
    const hero = this.masterData.heroes[heroId];
    const hb = this.state.builds[heroId];
    const ptsRemaining = this.getHeroStatPoints(heroId).remaining;
    if (ptsRemaining <= 0) return;

    if (isPassive) {
      const pIndex = parseInt(key.replace('P', '')) - 1;
      const abId = hero.passives[pIndex];
      const abInfo = this.masterData.abilities[String(abId)];
      const cap = this.getPassiveCurrentCap(abInfo.max_level, this.state.heroLevel);
      const unlockLvl = this.masterData.row_unlock_levels.find((ul, r) => 
        this.masterData.passive_ids_by_row[r].includes(pIndex + 1)
      ) || 1;

      if (this.state.heroLevel < unlockLvl) return;

      const currentLvl = hb.passives[key] || 0;
      const needed = cap - currentLvl;
      if (needed > 0) {
        const toAdd = Math.min(needed, ptsRemaining);
        hb.passives[key] = currentLvl + toAdd;
        if (window.renderSkillPlanner) window.renderSkillPlanner();
      }
    } else {
      const actSkill = hero.actives.find(a => a.id === key);
      if (this.state.heroLevel < actSkill.unlock_level) return;

      const currentLvl = hb.actives[key] || 0;
      if (currentLvl === 0) {
        // Regla: Máximo 4 habilidades activas equipadas por personaje
        const activeCount = Object.keys(hb.actives).filter(k => (hb.actives[k] || 0) > 0).length;
        if (activeCount >= 4) {
          if (window.showSkillToastNotice) {
            window.showSkillToastNotice(`⚠️ Límite: ${hero.name_en || hero.name} solo puede equipar 4 habilidades activas simultáneamente.`);
          }
          return;
        }
      }

      const needed = actSkill.max_level - currentLvl;
      if (needed > 0) {
        const toAdd = Math.min(needed, ptsRemaining);
        hb.actives[key] = currentLvl + toAdd;
        if (window.renderSkillPlanner) window.renderSkillPlanner();
      }
    }
  },

  maxHeroSkills(heroId) {
    if (!this.masterData) return;
    const hero = this.masterData.heroes[heroId];
    const hb = this.state.builds[heroId];

    // 1. Determinar qué 4 activas maximizar (prioridad a las ya iniciadas)
    const selectedActives = [];
    hero.actives.forEach(act => {
      if ((hb.actives[act.id] || 0) > 0) {
        selectedActives.push(act.id);
      }
    });

    if (selectedActives.length < 4) {
      for (const act of hero.actives) {
        if (!selectedActives.includes(act.id) && this.state.heroLevel >= act.unlock_level) {
          selectedActives.push(act.id);
          if (selectedActives.length >= 4) break;
        }
      }
    }

    // 2. Subir las (hasta 4) activas seleccionadas a su tope
    selectedActives.forEach(actId => {
      const act = hero.actives.find(a => a.id === actId);
      while ((hb.actives[act.id] || 0) < act.max_level && this.getHeroStatPoints(heroId).remaining > 0) {
        hb.actives[act.id] = (hb.actives[act.id] || 0) + 1;
      }
    });

    // Asegurar que las otras activas queden en 0 si no fueron seleccionadas
    hero.actives.forEach(act => {
      if (!selectedActives.includes(act.id) && !(hb.actives[act.id] > 0)) {
        hb.actives[act.id] = 0;
      }
    });

    // 3. Maximizar pasivas desbloqueadas con los puntos restantes
    hero.passives.forEach((abId, pIdx) => {
      const pKey = 'P' + (pIdx + 1);
      const abInfo = this.masterData.abilities[String(abId)];
      const cap = this.getPassiveCurrentCap(abInfo.max_level, this.state.heroLevel);
      const unlockLvl = this.masterData.row_unlock_levels.find((ul, r) => 
        this.masterData.passive_ids_by_row[r].includes(pIdx + 1)
      ) || 1;

      if (this.state.heroLevel >= unlockLvl) {
        while ((hb.passives[pKey] || 0) < cap && this.getHeroStatPoints(heroId).remaining > 0) {
          hb.passives[pKey] = (hb.passives[pKey] || 0) + 1;
        }
      }
    });

    if (window.renderSkillPlanner) window.renderSkillPlanner();
  },

  maxAllHeroesSkills() {
    ['KNIGHT', 'WARRIOR', 'ASSASSIN', 'ARCHER', 'MAGE'].forEach(hId => this.maxHeroSkills(hId));
  },

  resetHero(heroId) {
    this.state.builds[heroId] = { actives: {}, passives: {} };
    if (window.renderSkillPlanner) window.renderSkillPlanner();
  },

  resetAll() {
    ['KNIGHT', 'WARRIOR', 'ASSASSIN', 'ARCHER', 'MAGE'].forEach(hId => {
      this.state.builds[hId] = { actives: {}, passives: {} };
    });
    if (window.renderSkillPlanner) window.renderSkillPlanner();
  }
};
