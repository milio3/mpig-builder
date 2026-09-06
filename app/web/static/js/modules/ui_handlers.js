/**
 * ui_handlers.js - Módulo de Interacciones de Ratón y Asignación de Puntos
 */

let currentMobileHero = 'KNIGHT';

function handleCardClick(event, heroId, isPassive, skillKey) {
  event.preventDefault();
  event.stopPropagation();

  if (event.shiftKey) {
    // Shift + Clic -> Nivel Máximo
    SkillState.maxSingleSkill(heroId, isPassive, skillKey);
  } else {
    // Clic Normal -> +1 Nivel
    SkillState.levelUpSkill(heroId, isPassive, skillKey);
  }
}

function handleCardRightClick(event, heroId, isPassive, skillKey) {
  event.preventDefault();
  event.stopPropagation();
  // Clic Derecho -> -1 Nivel
  SkillState.levelDownSkill(heroId, isPassive, skillKey);
}

function handleCardMaxClick(event, heroId, isPassive, skillKey) {
  event.preventDefault();
  event.stopPropagation();
  // Botón MAX -> Nivel Máximo
  SkillState.maxSingleSkill(heroId, isPassive, skillKey);
}

function maxHeroSkills(heroId) {
  SkillState.maxHeroSkills(heroId);
}

function maxAllHeroesSkills() {
  SkillState.maxAllHeroesSkills();
}

function resetAllHeroesSkills() {
  if (typeof openConfirmResetModal === 'function') {
    openConfirmResetModal();
  } else {
    const m = document.getElementById('modal_confirm_reset');
    if (m) m.style.display = 'flex';
  }
}

function selectMobileHero(heroId) {
  currentMobileHero = heroId;
  document.querySelectorAll('.mobile-hero-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.hero === heroId);
  });
  document.querySelectorAll('.hero-column').forEach(col => {
    col.classList.toggle('mobile-active', col.id === `hero_col_${heroId}`);
  });
}

function setActiveSkillsLimit(limit) {
  if (typeof SkillState !== 'undefined' && SkillState.setActiveSkillsLimit) {
    SkillState.setActiveSkillsLimit(limit);
  }
}

