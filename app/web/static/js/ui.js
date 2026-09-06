/**
 * ui.js - Entrada Principal de UI y Coordinación de Eventos
 * Seccionado por módulos en /static/js/modules/
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await ApiClient.getMetadata();
    SkillState.init(data);
    initTopBarEvents();
    initFloatingTooltip();
    
    // Sincronizar input de nivel con el estado restaurado (redondeado a múltiplos de 5)
    setCommonHeroLevel(SkillState.state.heroLevel || 80);

    // Sincronizar selector de límite de activas con el estado restaurado (1-4)
    setActiveSkillsLimit(SkillState.state.maxActivesPerHero || 4);
    
    // Render inicial
    renderSkillPlanner();
    
    // Cargar builds de la comunidad
    if (window.updateCommunityBuilds) {
      window.updateCommunityBuilds();
    }

    // Comprobar si hay parámetro ?build= en la URL para cargar automáticamente
    const urlParams = new URLSearchParams(window.location.search);
    const buildCode = urlParams.get('build');
    if (buildCode && window.loadBuildFromDb) {
      setTimeout(async () => {
        try {
          const b = await ApiClient.getBuild(buildCode);
          if (b && b.id) {
            loadBuildFromDb(b.id);
          }
        } catch (e) {
          console.warn('No se pudo cargar la build de la URL:', e);
        }
      }, 100);
    }
  } catch (err) {
    const c = document.getElementById('skills_heroes_container');
    if (c) {
      c.innerHTML = `
        <div style="grid-column: 1 / -1; color: #ef4444; padding: 2rem; text-align: center;">
          <h3>Error al inicializar MPIG Builder</h3>
          <p>${err.message}</p>
        </div>
      `;
    }
  }
});

function initTopBarEvents() {
  const lvlSlider = document.getElementById('common_hero_level_range');
  const lvlInput = document.getElementById('common_hero_level');

  if (lvlSlider) {
    lvlSlider.addEventListener('input', e => {
      let val = parseInt(e.target.value, 10);
      val = Math.round(val / 5) * 5;
      if (val < 5) val = 5;
      if (val > 100) val = 100;
      setCommonHeroLevel(val);
    });
  }
}

function setCommonHeroLevel(lvl) {
  let val = parseInt(lvl, 10) || 80;
  val = Math.round(val / 5) * 5;
  if (val < 5) val = 5;
  if (val > 100) val = 100;

  SkillState.setHeroLevel(val);
  const lvlInput = document.getElementById('common_hero_level');
  const lvlSlider = document.getElementById('common_hero_level_range');
  if (lvlInput) lvlInput.value = val;
  if (lvlSlider) lvlSlider.value = val;

  document.querySelectorAll('.preset-buttons-wrap .btn-preset').forEach(btn => {
    const fnAttr = btn.getAttribute('onclick') || '';
    if (fnAttr.includes('setCommonHeroLevel')) {
      const btnVal = parseInt(btn.textContent.trim(), 10);
      btn.classList.toggle('is-active', btnVal === val);
    }
  });
}

function setActiveSkillsLimit(limit) {
  let val = parseInt(limit, 10) || 4;
  if (val < 1) val = 1;
  if (val > 4) val = 4;

  if (typeof SkillState !== 'undefined' && SkillState.setActiveSkillsLimit) {
    SkillState.setActiveSkillsLimit(val);
  }

  const limitInput = document.getElementById('common_active_skills_limit');
  if (limitInput) limitInput.value = val;

  document.querySelectorAll('.btn-preset-active-limit').forEach(btn => {
    const btnLimit = parseInt(btn.getAttribute('data-limit') || btn.textContent.trim(), 10);
    btn.classList.toggle('is-active', btnLimit === val);
  });
}


