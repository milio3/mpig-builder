/**
 * ui_render.js - Módulo de Renderizado del Árbol de Habilidades y Paneles
 */

function getElementBadgeHtml(elem, elemName = '', extraClass = '') {
  if (window.Icons && typeof window.Icons.getElementBadge === 'function') {
    return window.Icons.getElementBadge(elem, elemName, extraClass);
  }
  const norm = (elem || 'PHYSICAL').toUpperCase();
  const isEn = window.I18N && window.I18N.currentLang === 'en';
  let elemKey = 'physical';
  let label = isEn ? 'Physical' : (elemName || 'Físico');

  if (norm === 'FIRE') {
    elemKey = 'fire';
    label = isEn ? 'Fire' : (elemName || 'Fuego');
  } else if (norm === 'COLD' || norm === 'ICE') {
    elemKey = 'cold';
    label = isEn ? 'Cold' : (elemName || 'Frío');
  } else if (norm === 'LIGHTNING' || norm === 'ELEC') {
    elemKey = 'lightning';
    label = isEn ? 'Lightning' : (elemName || 'Rayo');
  } else if (norm === 'CHAOS') {
    elemKey = 'chaos';
    label = isEn ? 'Chaos' : (elemName || 'Caos');
  }

  const titlePrefix = isEn ? 'Active Skill' : 'Habilidad Activa';
  return `<div class="skill-active-badge elem-${elemKey} ${extraClass}" title="${titlePrefix} · ${label}"><svg class="tw-active-icon" aria-hidden="true"><use href="#elem-${elemKey}"></use></svg></div>`;
}
window.getElementBadgeHtml = getElementBadgeHtml;

function renderSkillPlanner() {
  const data = SkillState.masterData || SkillState.metadata;
  if (!data) return;

  const container = document.getElementById('skills_heroes_container');
  if (!container) return;

  // Actualizar monitor de nivel y puntos en la barra de control
  const statPtsPerHero = document.getElementById('stat_points_per_hero');
  const ptsBadge = document.getElementById('top_points_badge');
  const newPts = Math.max(0, SkillState.state.heroLevel - 1);
  if (statPtsPerHero) {
    statPtsPerHero.textContent = newPts;
  }

  // Sincronizar selectores de barra de control
  const maxHeroActives = SkillState.state.maxActivesPerHero || 4;
  const activeLimitInput = document.getElementById('common_active_skills_limit');
  if (activeLimitInput) {
    activeLimitInput.value = maxHeroActives;
  }
  document.querySelectorAll('.btn-preset-active-limit').forEach(btn => {
    const btnLimit = parseInt(btn.getAttribute('data-limit') || btn.textContent.trim(), 10);
    btn.classList.toggle('is-active', btnLimit === maxHeroActives);
  });
  document.querySelectorAll('.preset-buttons-wrap .btn-preset').forEach(btn => {
    const fnAttr = btn.getAttribute('onclick') || '';
    if (fnAttr.includes('setCommonHeroLevel')) {
      const btnVal = parseInt(btn.textContent.trim(), 10);
      btn.classList.toggle('is-active', btnVal === SkillState.state.heroLevel);
    }
  });

  const isEn = window.I18N && window.I18N.currentLang === 'en';
  const tierLabel = window.I18N ? window.I18N.t('tier_label') : 'Tier';
  const lvlAbbr = window.I18N ? window.I18N.t('level_abbr') : (isEn ? 'LV' : 'NV');
  const reqLvlPrefix = isEn ? 'Required level:' : 'Nivel requerido:';

  // 1. Guía Lateral Discreta de Niveles con Leyenda de Elementos de Activas
  let html = `
    <aside class="tree-tiers-sidebar" aria-label="${isEn ? 'Levels & Active Skills Legend' : 'Niveles y Leyenda de Activas'}">
      <div class="tree-tiers-header">
        <span class="tree-tiers-header-title">${lvlAbbr}</span>
      </div>
      <div class="tree-tiers-rows">
  `;

  for (let r = 0; r < 9; r++) {
    const unlockLvl = data.row_unlock_levels[r];
    const isLocked = SkillState.state.heroLevel < unlockLvl;
    html += `
      <div class="tree-tier-guide-item ${isLocked ? 'is-locked' : ''}" title="${reqLvlPrefix} ${unlockLvl}">
        <span class="tree-tier-num">${unlockLvl}</span>
      </div>
    `;
  }

  html += `
      </div>
    </aside>
  `;

  // 2. Columnas de los 5 Héroes
  const heroes = ['KNIGHT', 'WARRIOR', 'ASSASSIN', 'ARCHER', 'MAGE'];

  heroes.forEach(hId => {
    const hero = data.heroes[hId];
    const pts = SkillState.getHeroStatPoints(hId);
    const hb = SkillState.state.builds[hId];
    
    // Nombres en femenino cuando aplique según i18n
    const heroName = window.I18N ? window.I18N.t('hero_' + hId) : (isEn ? (hero.name_en || hero.name) : hero.name);
    const pctSpent = pts.total > 0 ? Math.min(100, Math.round((pts.spent / pts.total) * 100)) : 0;
    const hasAnyInvested = Object.values(hb.actives).some(v => v > 0) || Object.values(hb.passives).some(v => v > 0);
    const isMobileSelected = (hId === currentMobileHero);

    // Contabilizar activas equipadas por este héroe según límite dinámico
    const heroActiveCount = Object.keys(hb.actives).filter(k => (hb.actives[k] || 0) > 0).length;
    const isHeroActiveMax = heroActiveCount >= maxHeroActives;

    html += `
      <section class="hero-column hero-class-${hId.toLowerCase()} ${isMobileSelected ? 'mobile-active' : ''}" id="hero_col_${hId}" aria-label="Panel de ${heroName}">
        <!-- Cabecera del Héroe Limpia con Puntos Invertidos en Una Sola Línea -->
        <header class="hero-col-header">
          <div class="hero-header-top">
            <div class="hero-avatar-box">
              <img src="/static/${hero.avatar}" alt="${heroName}" class="hero-avatar-img" />
            </div>
            <div class="hero-header-single-line">
              <div class="hero-name-cluster">
                <span class="hero-name-badge">${heroName}</span>
                <span class="hero-actives-plain ${heroActiveCount === 0 ? 'is-zero' : ''} ${isHeroActiveMax ? 'is-max' : ''}"
                      title="${isHeroActiveMax ? (isEn ? `Max ${maxHeroActives} active skills reached for this hero` : `Máximo de ${maxHeroActives} habilidades activas alcanzado para este héroe`) : (isEn ? `Equipped active skills: ${heroActiveCount}/${maxHeroActives}` : `Habilidades activas equipadas: ${heroActiveCount}/${maxHeroActives}`)}">
                  <svg class="tw-icon-actives-plain" aria-hidden="true">
                    <use href="#icon-bolt"></use>
                  </svg>
                  <span class="hero-actives-plain-num">${heroActiveCount}</span>
                </span>
              </div>
              ${(pts.spent >= pts.total && pts.total > 0) ? `
                <div class="hero-pts-completed" title="${pts.spent} / ${pts.total} ${isEn ? 'points completed' : 'puntos completados'}">
                  <svg class="tw-icon-check-xs" aria-hidden="true">
                    <use href="#icon-check"></use>
                  </svg>
                </div>
              ` : `
                <div class="hero-pts-display" title="${pts.spent} ${isEn ? 'points invested of' : 'puntos invertidos de'} ${pts.total}">
                  <span class="hero-pts-cur">${pts.spent}</span>
                  <span class="hero-pts-sep">/</span>
                  <span class="hero-pts-max">${pts.total}</span>
                  <span class="hero-pts-label">pts</span>
                </div>
              `}
            </div>
          </div>
          <div class="hero-bar-track" title="${pctSpent}%">
            <div class="hero-bar-fill" style="width: ${pctSpent}%;"></div>
          </div>
        </header>


        <!-- 9 Filas de Habilidades Recogidas -->
        <div class="hero-skill-rows">
    `;

    // Icono estándar para todas las habilidades activas (en esquina del botón)
    for (let r = 0; r < 9; r++) {
      const unlockLvl = data.row_unlock_levels[r];
      const isLocked = SkillState.state.heroLevel < unlockLvl;
      const activeGroup = data.active_group_by_row[r];
      const passiveIds = data.passive_ids_by_row[r];

      html += `
        <div class="skill-row-container ${isLocked ? 'is-row-locked' : ''}">
          <div class="skill-slots-pair">
      `;

      if (activeGroup > 0) {
        // Slot Izquierdo: Activa (con icono según elemento: Físico, Fuego, Frío, Eléctrico, Caos)
        const actSkill = hero.actives.find(a => a.skill_group === activeGroup);
        const actLvl = hb.actives[actSkill.id] || 0;
        const isCapped = actLvl > 0 && actLvl >= actSkill.max_level;
        const isInvested = actLvl > 0 && !isCapped;
        const progressPct = actSkill.max_level > 0 ? Math.min(100, Math.round((actLvl / actSkill.max_level) * 100)) : 0;
        const isCappedByHeroMax = isHeroActiveMax && actLvl === 0;

        let stateClass = '';
        if (isLocked) {
          stateClass = 'is-locked';
        } else if (isCappedByHeroMax) {
          stateClass = 'is-active-capped-out';
        } else if (isCapped) {
          stateClass = 'is-capped';
        } else if (isInvested) {
          stateClass = 'is-invested';
        } else {
          stateClass = hasAnyInvested ? 'is-dimmed' : 'is-available';
        }

        const actSkillName = isEn ? (actSkill.name_en || actSkill.name) : actSkill.name;

        html += `
          <div class="skill-card skill-card-active ${stateClass} ${isCappedByHeroMax ? 'is-hero-actives-max' : ''}"
               onclick="handleCardClick(event, '${hId}', false, '${actSkill.id}')"
               oncontextmenu="handleCardRightClick(event, '${hId}', false, '${actSkill.id}')"
               data-hero="${hId}" data-is-passive="false" data-key="${actSkill.id}"
               data-active-capped="${isCappedByHeroMax ? 'true' : 'false'}">
            ${isLocked ? `<div class="skill-lock-overlay"><svg class="tw-lock-icon" aria-hidden="true"><use href="#icon-lock"></use></svg><span>${unlockLvl}</span></div>` : ''}
            ${isCappedByHeroMax ? `<div class="skill-actives-max-badge" title="${isEn ? `Max ${maxHeroActives} active skills reached for this hero` : `Máximo de ${maxHeroActives} habilidades activas alcanzado para este héroe`}">${isEn ? `MÁX ${maxHeroActives}` : `MÁX ${maxHeroActives}`}</div>` : ''}
            <div class="skill-icon-frame">
              <img src="/static/${actSkill.icon}" class="skill-icon-img" alt="${actSkillName}" />
            </div>
            <div class="skill-card-body">
              <span class="skill-level-val"><strong class="lvl-val">${actLvl}</strong><span class="lvl-max">/${actSkill.max_level}</span></span>
            </div>
            ${getElementBadgeHtml(actSkill.elem, actSkill.elem_name)}
            <div class="skill-progress-track">
              <div class="skill-progress-bar ${isCapped ? 'is-capped' : ''}" style="width: ${progressPct}%;"></div>
            </div>
          </div>
        `;

        // Slot Derecho: Pasiva
        const pIndex = passiveIds[0] - 1;
        const abId = hero.passives[pIndex];
        const abInfo = data.abilities[String(abId)];
        const pKey = 'P' + (pIndex + 1);
        const pLvl = hb.passives[pKey] || 0;
        const currentCap = SkillState.getPassiveCurrentCap(abInfo.max_level, SkillState.state.heroLevel);
        const isPassCapped = pLvl > 0 && pLvl >= currentCap;
        const isPassInvested = pLvl > 0 && !isPassCapped;
        const passProgressPct = currentCap > 0 ? Math.min(100, Math.round((pLvl / currentCap) * 100)) : 0;

        let passStateClass = '';
        if (isLocked) {
          passStateClass = 'is-locked';
        } else if (isPassCapped) {
          passStateClass = 'is-capped';
        } else if (isPassInvested) {
          passStateClass = 'is-invested';
        } else {
          passStateClass = hasAnyInvested ? 'is-dimmed' : 'is-available';
        }

        const abInfoName = isEn ? (abInfo.name_en || abInfo.name) : abInfo.name;

        html += `
          <div class="skill-card skill-card-passive ${passStateClass}"
               onclick="handleCardClick(event, '${hId}', true, '${pKey}')"
               oncontextmenu="handleCardRightClick(event, '${hId}', true, '${pKey}')"
               data-hero="${hId}" data-is-passive="true" data-key="${pKey}">
            ${isLocked ? `<div class="skill-lock-overlay"><svg class="tw-lock-icon" aria-hidden="true"><use href="#icon-lock"></use></svg><span>${unlockLvl}</span></div>` : ''}
            <div class="skill-icon-frame">
              <img src="/static/${abInfo.icon}" class="skill-icon-img" alt="${abInfoName}" />
            </div>
            <div class="skill-card-body">
              <span class="skill-level-val"><strong class="lvl-val">${pLvl}</strong><span class="lvl-max">/${currentCap}</span></span>
            </div>
            <div class="skill-progress-track">
              <div class="skill-progress-bar ${isPassCapped ? 'is-capped' : ''}" style="width: ${passProgressPct}%;"></div>
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
          const passProgressPct = currentCap > 0 ? Math.min(100, Math.round((pLvl / currentCap) * 100)) : 0;

          let passStateClass = '';
          if (isLocked) {
            passStateClass = 'is-locked';
          } else if (isPassCapped) {
            passStateClass = 'is-capped';
          } else if (isPassInvested) {
            passStateClass = 'is-invested';
          } else {
            passStateClass = hasAnyInvested ? 'is-dimmed' : 'is-available';
          }

          const abInfoName = isEn ? (abInfo.name_en || abInfo.name) : abInfo.name;

          html += `
            <div class="skill-card skill-card-passive ${passStateClass}"
                 onclick="handleCardClick(event, '${hId}', true, '${pKey}')"
                 oncontextmenu="handleCardRightClick(event, '${hId}', true, '${pKey}')"
                 data-hero="${hId}" data-is-passive="true" data-key="${pKey}">
              ${isLocked ? `<div class="skill-lock-overlay"><svg class="tw-lock-icon" aria-hidden="true"><use href="#icon-lock"></use></svg><span>${unlockLvl}</span></div>` : ''}
              <div class="skill-icon-frame">
                <img src="/static/${abInfo.icon}" class="skill-icon-img" alt="${abInfoName}" />
              </div>
              <div class="skill-card-body">
                <span class="skill-level-val"><strong class="lvl-val">${pLvl}</strong><span class="lvl-max">/${currentCap}</span></span>
              </div>
              <div class="skill-progress-track">
                <div class="skill-progress-bar ${isPassCapped ? 'is-capped' : ''}" style="width: ${passProgressPct}%;"></div>
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
      </section>
    `;
  });

  container.innerHTML = html;
}

window.renderSkillPlanner = renderSkillPlanner;
