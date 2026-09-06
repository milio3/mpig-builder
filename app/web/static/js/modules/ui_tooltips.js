/**
 * ui_tooltips.js - Módulo de Tooltips Ricos y Flotantes de Habilidades
 */

function initFloatingTooltip() {
  const container = document.getElementById('skills_heroes_container');
  if (!container) return;

  container.addEventListener('mouseover', e => {
    const card = e.target.closest('.skill-card');
    if (card) {
      if (card === window._currentTooltipCard) return;
      window._currentTooltipCard = card;
      showSkillTooltip(card, e);
    }
  });

  container.addEventListener('mousemove', e => {
    const tooltip = document.getElementById('skill_floating_tooltip');
    if (tooltip && tooltip.style.display !== 'none') {
      positionSkillTooltip(tooltip, e.clientX, e.clientY);
    }
  });

  container.addEventListener('mouseout', e => {
    const card = e.target.closest('.skill-card');
    if (card) {
      if (e.relatedTarget && card.contains(e.relatedTarget)) {
        return;
      }
      window._currentTooltipCard = null;
      hideSkillTooltip();
    }
  });
}

function showSkillTooltip(card, e) {
  const tooltip = document.getElementById('skill_floating_tooltip');
  if (!tooltip) return;

  const heroId = card.dataset.hero;
  const isPassive = card.dataset.isPassive === 'true';
  const key = card.dataset.key;
  const data = SkillState.masterData || SkillState.metadata;
  if (!data) return;

  const hero = data.heroes[heroId];
  if (!hero) return;

  const isEn = (window.I18N && window.I18N.currentLang === 'en') || document.documentElement.lang === 'en';
  let skill = null;
  let currentLevel = 0;
  let maxLevel = 0;
  let isAct = false;

  if (isPassive) {
    const pNum = parseInt(key.replace('P', ''), 10);
    const abId = hero.passives[pNum - 1];
    skill = data.abilities[String(abId)];
    currentLevel = (SkillState.state.builds[heroId] && SkillState.state.builds[heroId].passives[key]) || 0;
    maxLevel = SkillState.getPassiveCurrentCap(skill.max_level, SkillState.state.heroLevel);
  } else {
    isAct = true;
    skill = hero.actives.find(a => a.id === key);
    currentLevel = (SkillState.state.builds[heroId] && SkillState.state.builds[heroId].actives[key]) || 0;
    maxLevel = skill.max_level;
  }

  if (!skill) return;

  const sName = isEn ? (skill.name_en || skill.name) : skill.name;
  const sDesc = isEn ? (skill.description_en || skill.description || skill.desc || '') : (skill.description || skill.desc || '');

  document.getElementById('tip_icon').src = '/static/' + skill.icon;
  document.getElementById('tip_title').textContent = sName;

  // Se elimina el icono superior derecho en el tooltip de habilidad activa para evitar redundancia con tip_type
  const headerBadge = document.getElementById('tip_header_badge');
  if (headerBadge) {
    headerBadge.innerHTML = '';
    headerBadge.style.display = 'none';
  }

  // Tipo y Nivel con icono de elemento para habilidades activas
  const tipTypeBox = document.getElementById('tip_type');
  const lvlPrefix = isEn ? 'LV' : 'NV';
  const rawElem = (skill.elem || 'PHYSICAL').toLowerCase();
  const elemKey = rawElem === 'lightning' ? 'elem_lightning' : (rawElem === 'physical' ? 'elem_physical' : 'elem_' + rawElem);
  const localizedElem = (window.I18N && window.I18N.t(elemKey)) || (window.I18N && window.I18N.t('elem_' + rawElem)) || skill.elem_name;

  if (isAct && window.getElementBadgeHtml) {
    const elemLabel = isEn ? localizedElem : (skill.elem_name || 'Activa');
    tipTypeBox.innerHTML = `
      <div class="tip-type-row">
        ${window.getElementBadgeHtml(skill.elem, elemLabel, 'tip-type-elem-badge')}
        <span class="tip-type-label">${elemLabel}</span>
        <span class="tip-type-sep">·</span>
        <span class="tip-type-lvl">${lvlPrefix} ${currentLevel}/${maxLevel}</span>
      </div>
    `;
  } else {
    tipTypeBox.innerHTML = `
      <div class="tip-type-row">
        <span class="tip-type-label tip-label-passive">${isEn ? 'Passive' : 'Pasiva'}</span>
        <span class="tip-type-sep">·</span>
        <span class="tip-type-lvl">${lvlPrefix} ${currentLevel}/${maxLevel}</span>
      </div>
    `;
  }

  document.getElementById('tip_desc').textContent = sDesc;

  // Atributos para habilidades activas (Cooldown, Elemento, Efecto)
  const attrBox = document.getElementById('tip_attributes');
  if (attrBox) {
    if (isAct) {
      let attrHtml = '';
      const badgeElemName = isEn ? localizedElem : skill.elem_name;
      if (badgeElemName) {
        attrHtml += `<span class="tip-elem-badge elem-${rawElem}">${badgeElemName}</span>`;
      }
      if (skill.cooldown) {
        attrHtml += `<span class="tip-cd-badge">${skill.cooldown}s CD</span>`;
      }
      if (skill.effect) {
        attrHtml += `<span class="tip-effect-badge">${skill.effect}</span>`;
      }
      attrBox.innerHTML = attrHtml;
      attrBox.style.display = attrHtml ? 'flex' : 'none';
    } else {
      attrBox.innerHTML = '';
      attrBox.style.display = 'none';
    }
  }


  // Datos reales de estadísticas y escalado por nivel
  const statsBox = document.getElementById('tip_stats');
  if (statsBox) {
    let statsHtml = '';
    const curEffLabel = isEn ? 'Current effect:' : 'Efecto actual:';
    const nextEffLabel = isEn ? 'Next level:' : 'Siguiente nivel:';
    const perLvlLabel = isEn ? 'per level' : 'por nivel';
    const maxReachedLabel = isEn ? 'Maximum level reached' : 'Nivel máximo alcanzado';
    const perLvlUnit = isEn ? 'lvl' : 'nv';

    if (isPassive) {
      const stepVal = skill.step || 0;
      const unit = skill.unit || '%';
      if (currentLevel > 0) {
        const curEffect = (currentLevel * stepVal).toFixed(1).replace(/\.0$/, '');
        statsHtml += `<div class="tip-stat-row"><span class="tip-stat-lbl">${curEffLabel}</span> <strong class="tip-stat-val">+${curEffect}${unit}</strong></div>`;
      }
      if (currentLevel < maxLevel) {
        const nextEffect = ((currentLevel + 1) * stepVal).toFixed(1).replace(/\.0$/, '');
        statsHtml += `<div class="tip-stat-row"><span class="tip-stat-lbl">${nextEffLabel}</span> <span class="tip-stat-next">+${nextEffect}${unit} (+${stepVal}${unit}/${perLvlUnit})</span></div>`;
      } else {
        statsHtml += `<div class="tip-stat-row tip-stat-maxed">${maxReachedLabel}</div>`;
      }
    } else {
      if (skill.step_value) {
        statsHtml += `<div class="tip-stat-row"><span class="tip-stat-lbl">${nextEffLabel}</span> <span class="tip-stat-next">+${skill.step_value}% ${perLvlLabel}</span></div>`;
      }
    }
    statsBox.innerHTML = statsHtml;
    statsBox.style.display = statsHtml ? 'flex' : 'none';
  }

  tooltip.style.display = 'block';
  positionSkillTooltip(tooltip, e.clientX, e.clientY);
}

function hideSkillTooltip() {
  const tooltip = document.getElementById('skill_floating_tooltip');
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

function positionSkillTooltip(tooltip, clientX, clientY) {
  const pad = 14;
  let left = clientX + pad;
  let top = clientY + pad;

  const tipW = tooltip.offsetWidth || 260;
  const tipH = tooltip.offsetHeight || 160;

  if (left + tipW > window.innerWidth - 10) {
    left = clientX - tipW - pad;
  }
  if (top + tipH > window.innerHeight - 10) {
    top = clientY - tipH - pad;
  }
  if (top < 10) top = 10;
  if (left < 10) left = 10;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function getSkillElementSvg(elem) {
  if (window.Icons && typeof window.Icons.getElementSvg === 'function') {
    return window.Icons.getElementSvg(elem);
  }
  const el = (elem || 'PHYSICAL').toLowerCase();
  return `<div class="elem-badge elem-${el}" title="${el}"><svg class="tw-icon-xs" aria-hidden="true"><use href="#elem-${el}"></use></svg></div>`;
}

window.hideSkillTooltip = hideSkillTooltip;
window.showSkillTooltip = showSkillTooltip;
window.initFloatingTooltip = initFloatingTooltip;

