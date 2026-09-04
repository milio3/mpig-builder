/**
 * ui.js - Interfaz Visual, Eventos y Renderizado del Planificador de Habilidades
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await ApiClient.getMetadata();
    SkillState.init(data);
    initTopBarEvents();
    initFloatingTooltip();
    renderSkillPlanner();
  } catch (err) {
    document.getElementById('skills_heroes_container').innerHTML = `
      <div style="grid-column: 1 / -1; color: #ef4444; padding: 2rem; text-align: center;">
        <h3>Error al inicializar MPIG Builder</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
});

// ==========================================================================
// 1. Eventos de la Barra Superior
// ==========================================================================

function initTopBarEvents() {
  const lvlInput = document.getElementById('common_hero_level');
  const lvlRange = document.getElementById('common_hero_level_range');

  if (lvlInput && lvlRange) {
    lvlInput.addEventListener('input', e => {
      const val = parseInt(e.target.value) || 80;
      lvlRange.value = val;
      SkillState.setHeroLevel(val);
    });

    lvlRange.addEventListener('input', e => {
      const val = parseInt(e.target.value) || 80;
      lvlInput.value = val;
      SkillState.setHeroLevel(val);
    });
  }
}

function setCommonHeroLevel(lvl) {
  const lvlInput = document.getElementById('common_hero_level');
  const lvlRange = document.getElementById('common_hero_level_range');
  if (lvlInput) lvlInput.value = lvl;
  if (lvlRange) lvlRange.value = lvl;
  SkillState.setHeroLevel(lvl);
}

function maxAllHeroesSkills() {
  SkillState.maxAllHeroesSkills();
}

function resetAllHeroesSkills() {
  if (confirm('¿Seguro que deseas reiniciar los puntos de todos los héroes?')) {
    SkillState.resetAll();
  }
}

function maxHeroSkills(heroId) {
  SkillState.maxHeroSkills(heroId);
}

// ==========================================================================
// 2. Renderizado del Árbol de Habilidades (5 Columnas)
// ==========================================================================

function renderSkillPlanner() {
  const data = SkillState.masterData;
  if (!data) return;

  const container = document.getElementById('skills_heroes_container');
  if (!container) return;

  const statPtsPerHero = document.getElementById('stat_points_per_hero');
  if (statPtsPerHero) {
    statPtsPerHero.textContent = Math.max(0, SkillState.state.heroLevel - 1);
  }

  const heroes = ['KNIGHT', 'WARRIOR', 'ASSASSIN', 'ARCHER', 'MAGE'];
  let html = '';

  heroes.forEach(hId => {
    const hero = data.heroes[hId];
    const pts = SkillState.getHeroStatPoints(hId);
    const hb = SkillState.state.builds[hId];
    const heroNameEn = hero.name_en || hero.name;

    const hasAnyInvested = Object.values(hb.actives).some(v => v > 0) || Object.values(hb.passives).some(v => v > 0);

    html += `
      <div class="hero-column" id="hero_col_${hId}">
        <div class="hero-col-header">
          <div class="hero-avatar-box" style="border-color: ${hero.theme_color};">
            <img src="/static/${hero.avatar}" alt="${heroNameEn}" class="hero-avatar-img" />
          </div>
          <div class="hero-header-info">
            <div class="hero-title-text" style="color: ${hero.theme_color};">${heroNameEn}</div>
            <div class="hero-header-subrow">
              <div class="hero-points-display" id="hero_pts_pill_${hId}">
                <strong style="color: #38bdf8;">${pts.remaining}</strong> / ${pts.total} <span style="color: var(--text-dim); font-size: 0.72rem;">pts</span>
              </div>
              <button class="btn-hero-auto" onclick="maxHeroSkills('${hId}')" title="Asignar puntos de ${heroNameEn} (hasta 4 activas máx)">
                <svg class="tw-icon-sm" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd" />
                </svg>
                <span>Max Puntos</span>
              </button>
            </div>
          </div>
        </div>

        <div class="hero-skill-rows">
    `;

    // 9 Filas
    for (let r = 0; r < 9; r++) {
      const unlockLvl = data.row_unlock_levels[r];
      const isLocked = SkillState.state.heroLevel < unlockLvl;
      const activeGroup = data.active_group_by_row[r];
      const passiveIds = data.passive_ids_by_row[r];

      html += `
        <div class="skill-row-container ${isLocked ? 'is-row-locked' : ''}">
          <div class="skill-row-label">
            <span>Tier ${unlockLvl}</span>
            ${isLocked ? `<span style="color: #ef4444; font-size: 0.58rem;">🔒 Nv.${unlockLvl}</span>` : ''}
          </div>
          <div class="skill-slots-pair">
      `;

      if (activeGroup > 0) {
        // Izquierda: Activa
        const actSkill = hero.actives.find(a => a.skill_group === activeGroup);
        const actLvl = hb.actives[actSkill.id] || 0;
        const isCapped = actLvl > 0 && actLvl >= actSkill.max_level;
        const isInvested = actLvl > 0 && !isCapped;

        let stateClass = '';
        if (isLocked) {
          stateClass = 'is-locked';
        } else if (isCapped) {
          stateClass = 'is-capped';
        } else if (isInvested) {
          stateClass = 'is-lit is-invested';
        } else {
          stateClass = hasAnyInvested ? 'is-dimmed' : 'is-lit';
        }

        const elemSvg = getSkillElementSvg(actSkill.elem || 'PHYSICAL');

        html += `
          <div class="skill-card ${stateClass}"
               onclick="handleCardClick(event, '${hId}', false, '${actSkill.id}')"
               oncontextmenu="handleCardRightClick(event, '${hId}', false, '${actSkill.id}')"
               data-hero="${hId}" data-is-passive="false" data-key="${actSkill.id}">
            ${isLocked ? `<div class="skill-lock-overlay">🔒 ${unlockLvl}</div>` : ''}
            <div class="skill-type-col">
              ${elemSvg}
            </div>
            <div class="skill-icon-frame">
              <img src="/static/${actSkill.icon}" class="skill-icon-img" alt="${actSkill.name}" />
            </div>
            <div class="skill-card-right">
              <button class="btn-card-max" onclick="handleCardMaxClick(event, '${hId}', false, '${actSkill.id}')" title="Maximizar esta habilidad">MAX</button>
              <div class="skill-level-badge">Lv.${actLvl}/${actSkill.max_level}</div>
            </div>
          </div>
        `;

        // Derecha: Pasiva
        const pIndex = passiveIds[0] - 1;
        const abId = hero.passives[pIndex];
        const abInfo = data.abilities[String(abId)];
        const pKey = 'P' + (pIndex + 1);
        const pLvl = hb.passives[pKey] || 0;
        const currentCap = SkillState.getPassiveCurrentCap(abInfo.max_level, SkillState.state.heroLevel);
        const isPassCapped = pLvl > 0 && pLvl >= currentCap;
        const isPassInvested = pLvl > 0 && !isPassCapped;

        let passStateClass = '';
        if (isLocked) {
          passStateClass = 'is-locked';
        } else if (isPassCapped) {
          passStateClass = 'is-capped';
        } else if (isPassInvested) {
          passStateClass = 'is-lit is-invested';
        } else {
          passStateClass = hasAnyInvested ? 'is-dimmed' : 'is-lit';
        }

        html += `
          <div class="skill-card ${passStateClass}"
               onclick="handleCardClick(event, '${hId}', true, '${pKey}')"
               oncontextmenu="handleCardRightClick(event, '${hId}', true, '${pKey}')"
               data-hero="${hId}" data-is-passive="true" data-key="${pKey}">
            ${isLocked ? `<div class="skill-lock-overlay">🔒 ${unlockLvl}</div>` : ''}
            <div class="skill-type-col">
              <span class="passive-placeholder"></span>
            </div>
            <div class="skill-icon-frame">
              <img src="/static/${abInfo.icon}" class="skill-icon-img" alt="${abInfo.name}" />
            </div>
            <div class="skill-card-right">
              <button class="btn-card-max" onclick="handleCardMaxClick(event, '${hId}', true, '${pKey}')" title="Maximizar esta habilidad">MAX</button>
              <div class="skill-level-badge">Lv.${pLvl}/${currentCap}</div>
            </div>
          </div>
        `;
      } else {
        // Ambas son Pasivas
        passiveIds.forEach(pId => {
          const pIndex = pId - 1;
          const abId = hero.passives[pIndex];
          const abInfo = data.abilities[String(abId)];
          const pKey = 'P' + (pIndex + 1);
          const pLvl = hb.passives[pKey] || 0;
          const currentCap = SkillState.getPassiveCurrentCap(abInfo.max_level, SkillState.state.heroLevel);
          const isPassCapped = pLvl > 0 && pLvl >= currentCap;
          const isPassInvested = pLvl > 0 && !isPassCapped;

          let passStateClass = '';
          if (isLocked) {
            passStateClass = 'is-locked';
          } else if (isPassCapped) {
            passStateClass = 'is-capped';
          } else if (isPassInvested) {
            passStateClass = 'is-lit is-invested';
          } else {
            passStateClass = hasAnyInvested ? 'is-dimmed' : 'is-lit';
          }

          html += `
            <div class="skill-card ${passStateClass}"
                 onclick="handleCardClick(event, '${hId}', true, '${pKey}')"
                 oncontextmenu="handleCardRightClick(event, '${hId}', true, '${pKey}')"
                 data-hero="${hId}" data-is-passive="true" data-key="${pKey}">
              ${isLocked ? `<div class="skill-lock-overlay">🔒 ${unlockLvl}</div>` : ''}
              <div class="skill-type-col">
                <span class="passive-placeholder"></span>
              </div>
              <div class="skill-icon-frame">
                <img src="/static/${abInfo.icon}" class="skill-icon-img" alt="${abInfo.name}" />
              </div>
              <div class="skill-card-right">
                <button class="btn-card-max" onclick="handleCardMaxClick(event, '${hId}', true, '${pKey}')" title="Maximizar esta habilidad">MAX</button>
                <div class="skill-level-badge">Lv.${pLvl}/${currentCap}</div>
              </div>
            </div>
          `;
        });
      }

      html += `
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ==========================================================================
// 3. Manejadores de Click y Atajos
// ==========================================================================

function handleCardClick(event, heroId, isPassive, key) {
  if (event && event.shiftKey) {
    SkillState.maxSingleSkill(heroId, isPassive, key);
  } else {
    SkillState.levelUpSkill(heroId, isPassive, key);
  }
}

function handleCardMaxClick(event, heroId, isPassive, key) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  SkillState.maxSingleSkill(heroId, isPassive, key);
}

function handleCardRightClick(event, heroId, isPassive, key) {
  if (event) event.preventDefault();
  SkillState.levelDownSkill(heroId, isPassive, key);
}

// ==========================================================================
// 4. Iconos Vectoriales SVG para Tipos de Daño Activo
// ==========================================================================

function getSkillElementSvg(elem) {
  if (elem === 'FIRE') {
    return `<span class="active-type-icon elem-fire" title="Activa: Daño Fuego (Elemental)">
      <svg class="tw-dmg-icon" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.75 12a7.5 7.5 0 1014.901-2.09 9.75 9.75 0 00-4.636-5.839 8.243 8.243 0 00-4.052-1.785zM12 14a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clip-rule="evenodd"/>
      </svg>
    </span>`;
  } else if (elem === 'COLD') {
    return `<span class="active-type-icon elem-cold" title="Activa: Daño Frío (Elemental)">
      <svg class="tw-dmg-icon" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM6.166 4.045a.75.75 0 011.06 0l2.122 2.122a.75.75 0 01-1.06 1.06L6.166 5.106a.75.75 0 010-1.06zm11.668 0a.75.75 0 010 1.06l-2.122 2.122a.75.75 0 11-1.06-1.06l2.122-2.122a.75.75 0 011.06 0zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM1.5 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H2.25A.75.75 0 011.5 12zm18 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5h-2.25A.75.75 0 0119.5 12zm-12.274 5.794a.75.75 0 010 1.06l-2.122 2.122a.75.75 0 11-1.06-1.06l2.122-2.122a.75.75 0 011.06 0zm9.548 0a.75.75 0 011.06 0l2.122 2.122a.75.75 0 01-1.06 1.06l-2.122-2.122a.75.75 0 010-1.06zM12 19.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75z" clip-rule="evenodd"/>
      </svg>
    </span>`;
  } else if (elem === 'LIGHTNING') {
    return `<span class="active-type-icon elem-lightning" title="Activa: Daño Rayo (Elemental)">
      <svg class="tw-dmg-icon" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd"/>
      </svg>
    </span>`;
  } else if (elem === 'CHAOS') {
    return `<span class="active-type-icon elem-chaos" title="Activa: Daño Caos (Elemental)">
      <svg class="tw-dmg-icon" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25zM12 6a6 6 0 106 6 6 6 0 00-6-6zm0 3a3 3 0 103 3 3 3 0 00-3-3z" clip-rule="evenodd"/>
      </svg>
    </span>`;
  } else {
    return `<span class="active-type-icon elem-physical" title="Activa: Daño Físico">
      <svg class="tw-dmg-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.707 9.293l-2-2a.999.999 0 00-1.414 0L14 9.586l-1.293-1.293a1 1 0 00-1.414 1.414L12.586 11l-4.293 4.293-1.414-1.414a1 1 0 00-1.414 1.414l1.414 1.414-2.586 2.586a1 1 0 101.414 1.414l2.586-2.586 1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414L13 12.414l1.293 1.293a1 1 0 001.414-1.414L14.414 11l3.293-3.293a.999.999 0 000-1.414zM4.293 9.293a.999.999 0 000 1.414L7.586 14l-1.293 1.293a1 1 0 001.414 1.414L9 15.414l4.293 4.293a1 1 0 001.414-1.414l-4.293-4.293 1.293-1.293a1 1 0 00-1.414-1.414L9 12.586 5.707 9.293a.999.999 0 00-1.414 0z"/>
      </svg>
    </span>`;
  }
}

// ==========================================================================
// 5. Tooltip Flotante de Alta Definición
// ==========================================================================

function initFloatingTooltip() {
  const tooltip = document.getElementById('skill_floating_tooltip');
  if (!tooltip) return;

  document.addEventListener('mouseover', e => {
    const card = e.target.closest('.skill-card');
    if (!card) {
      tooltip.style.display = 'none';
      return;
    }

    const heroId = card.dataset.hero;
    const isPassive = card.dataset.isPassive === 'true';
    const key = card.dataset.key;
    const data = SkillState.masterData;
    if (!data) return;

    const hero = data.heroes[heroId];
    const hb = SkillState.state.builds[heroId];

    if (isPassive) {
      const pIndex = parseInt(key.replace('P', '')) - 1;
      const abId = hero.passives[pIndex];
      const abInfo = data.abilities[String(abId)];
      const currentLvl = hb.passives[key] || 0;
      const currentCap = SkillState.getPassiveCurrentCap(abInfo.max_level, SkillState.state.heroLevel);
      const nextUnlockLvl = SkillState.getNextPassiveCapHeroLevel(abInfo.max_level, SkillState.state.heroLevel);
      const currentVal = (currentLvl * abInfo.step).toFixed(abInfo.is_flat ? 0 : 1);
      const stepVal = abInfo.step.toFixed(abInfo.is_flat ? 0 : 1);
      const isCapped = currentLvl >= currentCap;

      let capLine = '';
      if (currentCap < abInfo.max_level) {
        capLine = `Límite actual Nv.${currentCap} / final Nv.${abInfo.max_level} · Nv.${currentCap + 1} se desbloquea al nivel ${nextUnlockLvl} del personaje`;
      } else {
        capLine = `Límite actual Nv.${currentCap} / final Nv.${abInfo.max_level} · ¡Tope máximo alcanzado!`;
      }

      tooltip.innerHTML = `
        <div class="tip-preview-col">
          <div class="skill-card ${isCapped && currentLvl > 0 ? 'is-capped' : ''}" style="width: 48px; min-height: 48px; pointer-events: none;">
            <div class="skill-icon-frame">
              <img src="/static/${abInfo.icon}" class="skill-icon-img" alt="${abInfo.name}" />
            </div>
            <div class="skill-level-badge">Lv.${currentLvl}/${currentCap}</div>
          </div>
        </div>
        <div class="tip-info-col">
          <div class="tip-stat-title">${abInfo.name} +${stepVal}${abInfo.unit} por nivel (actual +${currentVal}${abInfo.unit})</div>
          <div class="tip-cap-line">${capLine}</div>
          <div class="tip-desc-text" style="margin-top: 4px;">${abInfo.description}</div>
          <div style="font-size: 0.70rem; color: #94a3b8; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
            🖱️ <strong>Click:</strong> +1 · <strong>MAX / Shift+Click:</strong> Nivel Máximo · <strong>Click Der:</strong> -1
          </div>
        </div>
      `;
    } else {
      const actSkill = hero.actives.find(a => a.id === key);
      const currentLvl = hb.actives[key] || 0;
      const isCapped = currentLvl >= actSkill.max_level;
      const activeCount = Object.keys(hb.actives).filter(k => (hb.actives[k] || 0) > 0).length;

      let elemBadgeClass = 'phys';
      let elemBadgeText = 'Físico';
      if (actSkill.elem === 'FIRE') { elemBadgeClass = 'fire'; elemBadgeText = '🔥 Fuego (Elemental)'; }
      else if (actSkill.elem === 'COLD') { elemBadgeClass = 'cold'; elemBadgeText = '❄️ Frío (Elemental)'; }
      else if (actSkill.elem === 'LIGHTNING') { elemBadgeClass = 'light'; elemBadgeText = '⚡ Rayo (Elemental)'; }
      else if (actSkill.elem === 'CHAOS') { elemBadgeClass = 'chaos'; elemBadgeText = '🌀 Caos (Elemental)'; }

      tooltip.innerHTML = `
        <div class="tip-preview-col">
          <div class="skill-card ${isCapped && currentLvl > 0 ? 'is-capped' : ''}" style="width: 48px; min-height: 48px; pointer-events: none;">
            <div class="skill-icon-frame">
              <img src="/static/${actSkill.icon}" class="skill-icon-img" alt="${actSkill.name}" />
            </div>
            <div class="skill-level-badge">Lv.${currentLvl}/${actSkill.max_level}</div>
          </div>
        </div>
        <div class="tip-info-col">
          <div class="tip-stat-title">${actSkill.name} (Nv. ${currentLvl}/${actSkill.max_level})</div>
          <div style="display: flex; align-items: center; gap: 0.4rem; margin: 2px 0;">
            <span class="tip-elem-badge ${elemBadgeClass}">${elemBadgeText}</span>
            <span class="tip-cd-line">⏱️ ${actSkill.cooldown}s</span>
            <span style="margin-left: auto; font-size: 0.72rem; color: #cbd5e1; background: rgba(0,0,0,0.4); padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
              Activas equipadas: <strong style="color: ${activeCount >= 4 && currentLvl === 0 ? '#f87171' : '#38bdf8'};">${activeCount}/4</strong>
            </span>
          </div>
          <div class="tip-desc-text">${actSkill.description}</div>
          <div class="tip-cap-line">Tope Nv.${actSkill.max_level} · Desbloquea a Nv.${actSkill.unlock_level}</div>
          <div style="font-size: 0.70rem; color: #94a3b8; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
            🖱️ <strong>Click:</strong> +1 · <strong>MAX / Shift+Click:</strong> Nivel Máximo · <strong>Click Der:</strong> -1
          </div>
        </div>
      `;
    }

    tooltip.style.display = 'flex';
    positionFloatingTooltip(e);
  });

  document.addEventListener('mousemove', e => {
    if (tooltip.style.display === 'flex') {
      positionFloatingTooltip(e);
    }
  });

  document.addEventListener('mouseout', e => {
    if (!e.relatedTarget || !e.relatedTarget.closest('.skill-card')) {
      tooltip.style.display = 'none';
    }
  });
}

function positionFloatingTooltip(e) {
  const tooltip = document.getElementById('skill_floating_tooltip');
  if (!tooltip) return;

  const tipW = tooltip.offsetWidth || 480;
  const tipH = tooltip.offsetHeight || 160;
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  let left = e.clientX + 16;
  let top = e.clientY + 16;

  if (left + tipW > winW - 12) {
    left = e.clientX - tipW - 16;
  }
  if (top + tipH > winH - 12) {
    top = winH - tipH - 12;
  }
  if (top < 10) top = 10;
  if (left < 10) left = 10;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

// ==========================================================================
// 6. Notificaciones Toast
// ==========================================================================

function showSkillToastNotice(msg) {
  const toast = document.getElementById('skill_toast_notice');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// Exportar funciones globales
window.renderSkillPlanner = renderSkillPlanner;
window.showSkillToastNotice = showSkillToastNotice;
