/**
 * build_manager.js - Gestor de Persistencia, Modales y Exportador/Importador de Builds
 * Implementa la Build Library profesional, modales unificados y cero emojis.
 */

let pendingActionAfterWarning = null;
let cachedLibraryBuilds = [];

// ==========================================================================
// 1. Guardado en Base de Datos SQLite
// ==========================================================================

function openSaveBuildModal() {
  const unspent = getHeroesWithUnspentPoints();
  if (unspent.length > 0) {
    pendingActionAfterWarning = 'save_db';
    showUnspentWarningModal(unspent);
    return;
  }
  proceedOpenSaveBuildModal();
}

function openSaveBuildModalFromLibrary() {
  closeLoadBuildModal();
  openSaveBuildModal();
}

function proceedOpenSaveBuildModal() {
  document.getElementById('save_build_title').value = '';
  document.getElementById('save_build_desc').value = '';
  
  // Rellenar autor guardado previamente en localStorage
  const savedAuthor = localStorage.getItem('mpig_author') || '';
  const authorInput = document.getElementById('save_build_author');
  if (authorInput) authorInput.value = savedAuthor;

  // Resetear propósito a Avance por defecto
  const purposeSelect = document.getElementById('save_build_purpose');
  if (purposeSelect) {
    purposeSelect.value = 'Avance';
    handlePurposeSelectChange(purposeSelect);
  }

  const lvlAbbr = window.I18N ? window.I18N.t('level_abbr') : 'NV';
  document.getElementById('save_build_level_display').textContent = `${lvlAbbr}. ${SkillState.state.heroLevel}`;
  
  // Renderizar resumen contextual de los 5 héroes en rejilla de 5 columnas con colores temáticos
  const partyContainer = document.getElementById('save_build_party_summary');
  if (partyContainer && SkillState.masterData) {
    partyContainer.innerHTML = renderPartySummaryHtml(SkillState.state.builds);
  }

  document.getElementById('modal_save_build').style.display = 'flex';
  document.getElementById('save_build_title').focus();
}

function handlePurposeSelectChange(selectEl) {
  if (!selectEl) return;
  const val = selectEl.value;
  selectEl.classList.remove('purpose-opt-advance', 'purpose-opt-boss', 'purpose-opt-farm');
  if (val === 'Jefes') {
    selectEl.classList.add('purpose-opt-boss');
  } else if (val === 'Farming' || val === 'Farmeo') {
    selectEl.classList.add('purpose-opt-farm');
  } else {
    selectEl.classList.add('purpose-opt-advance');
  }
}
window.handlePurposeSelectChange = handlePurposeSelectChange;

function closeSaveBuildModal() {
  document.getElementById('modal_save_build').style.display = 'none';
}

async function handleSaveBuildSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('save_build_title').value.trim();
  const description = document.getElementById('save_build_desc').value.trim();
  const authorInput = document.getElementById('save_build_author');
  const author = authorInput ? (authorInput.value.trim() || 'Anónimo') : 'Anónimo';
  const purposeInput = document.getElementById('save_build_purpose');
  const purpose = purposeInput ? (purposeInput.value || 'Avance') : 'Avance';
  const heroLevel = SkillState.state.heroLevel;
  const buildData = SkillState.state.builds;

  // Recordar autor para futuras builds
  if (author && author !== 'Anónimo') {
    localStorage.setItem('mpig_author', author);
  }

  const btn = document.getElementById('btn_submit_save');
  btn.disabled = true;
  btn.classList.add('is-loading');

  try {
    const saved = await ApiClient.saveBuild({
      title,
      description: description || null,
      author,
      purpose,
      hero_level: heroLevel,
      build_data: buildData
    });

    closeSaveBuildModal();
    const isEn = window.I18N && window.I18N.currentLang === 'en';
    const notice = isEn
      ? `Build "${saved.title}" successfully saved! (Code: ${saved.share_code})`
      : `¡Build "${saved.title}" guardada con éxito en la base de datos! (Código: ${saved.share_code})`;
    showSkillToastNotice(notice);
    
    // Activar la build guardada en la cabecera dinámica
    setActiveBuild(saved);

    // Actualizar builds de la comunidad y cache de biblioteca
    cachedLibraryBuilds = [];
    if (window.updateCommunityBuilds) {
      window.updateCommunityBuilds();
    }
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.classList.remove('is-loading');
  }
}


// ==========================================================================
// 2. Build Library (Biblioteca de Builds Guardadas)
// ==========================================================================

async function openLoadBuildModal() {
  const modal = document.getElementById('modal_load_build');
  const container = document.getElementById('saved_builds_list_container');
  const searchInput = document.getElementById('library_search_input');
  if (searchInput) searchInput.value = '';

  modal.style.display = 'flex';
  
  const loadingTxt = window.I18N ? window.I18N.t('library_loading') : 'Consultando biblioteca de SQLite...';
  container.innerHTML = `
    <div class="library-loading-state">
      <div class="spinner"></div>
      <span>${loadingTxt}</span>
    </div>
  `;

  try {
    const builds = await ApiClient.listBuilds();
    cachedLibraryBuilds = builds || [];
    renderLibraryBuilds(cachedLibraryBuilds);
  } catch (err) {
    container.innerHTML = `<div class="library-error-state">Error: ${escapeHtml(err.message)}</div>`;
  }
}

function closeLoadBuildModal() {
  document.getElementById('modal_load_build').style.display = 'none';
}

let currentLibrarySort = 'recent';

function changeLibrarySort(sort) {
  currentLibrarySort = sort || 'recent';
  applyLibraryFilterAndSort();
}
window.changeLibrarySort = changeLibrarySort;

function filterBuildsList(query) {
  applyLibraryFilterAndSort();
}

function applyLibraryFilterAndSort() {
  const query = (document.getElementById('library_search_input')?.value || '').trim().toLowerCase();
  let builds = [...cachedLibraryBuilds];

  if (query) {
    builds = builds.filter(b => 
      (b.title && b.title.toLowerCase().includes(query)) ||
      (b.author && b.author.toLowerCase().includes(query)) ||
      (b.purpose && b.purpose.toLowerCase().includes(query))
    );
  }

  if (currentLibrarySort === 'level_desc') {
    builds.sort((a, b) => (b.hero_level || 0) - (a.hero_level || 0));
  } else if (currentLibrarySort === 'votes') {
    builds.sort((a, b) => (b.votes || 0) - (a.votes || 0));
  } else {
    // recent
    builds.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }

  renderLibraryBuilds(builds);
}

function renderLibraryBuilds(builds) {
  const container = document.getElementById('saved_builds_list_container');
  if (!container) return;

  if (!builds || builds.length === 0) {
    const isEn = window.I18N && window.I18N.currentLang === 'en';
    const emptyTitle = isEn ? 'Empty Builds Library' : 'Biblioteca de Builds Vacía';
    const emptyDesc = isEn 
      ? 'No builds registered yet. Configure your party talents and click "Save Build" to store it here.'
      : 'No hay ninguna build registrada aún. Configura los talentos de tu party y pulsa "Guardar build" para registrar la primera.';
    const newBuildTxt = isEn ? 'Create New Build' : 'Crear Nueva Build';

    container.innerHTML = `
      <div class="library-empty-box">
        <div class="library-empty-icon" aria-hidden="true">
          <svg>
            <use href="#icon-book"></use>
          </svg>
        </div>
        <h4 class="library-empty-title">${emptyTitle}</h4>
        <p class="library-empty-desc">${emptyDesc}</p>
        <button type="button" class="btn-modern btn-modern-success" onclick="openSaveBuildModalFromLibrary()">
          <svg class="tw-icon-sm">
            <use href="#icon-plus"></use>
          </svg>
          <span>${newBuildTxt}</span>
        </button>
      </div>
    `;
    return;
  }

  const isEn = window.I18N && window.I18N.currentLang === 'en';
  const loadTxt = isEn ? 'Load' : 'Cargar';
  const lvlAbbr = isEn ? 'LV' : 'NV';
  const loadTitle = isEn ? 'Load this build into planner' : 'Cargar esta build en el planificador';
  const reportTitle = isEn ? 'Report / Request deletion' : 'Reportar / Solicitar borrado';
  const shareTitle = isEn ? 'Share build' : 'Compartir build';

  container.innerHTML = builds.map(b => {
    const formattedDate = formatDateDmy(b.updated_at || b.created_at);
    const purposeBadge = getPurposeBadgeHtml(b.purpose);
    const authorName = escapeHtml(b.author || 'Anónimo');

    return `
      <div class="library-build-card" id="build_card_${b.id}">
        <div class="library-card-header">
          <div class="library-card-title-col">
            <div class="library-title-row">
              <!-- Nivel, tipo, autor a la derecha del tipo y título a la derecha del autor -->
              <span class="library-level-badge">${lvlAbbr}. ${b.hero_level}</span>
              ${purposeBadge}
              <span class="library-author-tag">${window.I18N ? window.I18N.t('build_by_author').replace('{0}', authorName) : `Por ${authorName}`}</span>
              <strong class="library-build-name">${escapeHtml(b.title)}</strong>
            </div>
          </div>

          <div class="library-card-actions">
            <!-- Fecha situada a la izquierda del botón de compartir -->
            <span class="library-date-text">${formattedDate}</span>

            <!-- Botón Compartir Build -->
            <button type="button" class="btn-community-share" onclick="shareBuildByCode('${b.share_code}', '${escapeHtml(b.title).replace(/'/g, "\\'")}', event)" title="${shareTitle}">
              <svg class="tw-icon-share">
                <use href="#icon-share"></use>
              </svg>
            </button>

            <!-- Votar Build (Verde) -->
            <button type="button" class="btn-community-vote vote-btn-build-${b.id} ${hasVotedBuild(b.id) ? 'has-voted' : ''}" onclick="handleVoteBuild(${b.id}, event)" title="${window.I18N ? window.I18N.t('btn_vote') : 'Votar'}">
              <svg class="tw-icon-vote">
                <use href="#icon-heart"></use>
              </svg>
              <span class="vote-count">${b.votes || 0}</span>
            </button>

            <!-- Cargar Build (Cian) -->
            <button type="button" class="btn-community-load" onclick="loadBuildFromDb(${b.id})" title="${loadTitle}">
              <svg class="tw-icon-load">
                <use href="#icon-load"></use>
              </svg>
              <span>${loadTxt}</span>
            </button>

            <!-- Solicitar Borrado (Rojo) -->
            <button type="button" class="btn-community-report" onclick="openDeletionRequestModal(${b.id}, '${escapeHtml(b.title).replace(/'/g, "\\'")}', '${b.share_code}')" title="${reportTitle}">
              <svg class="tw-icon-report">
                <use href="#icon-report"></use>
              </svg>
            </button>
          </div>
        </div>

        ${b.description ? `<p class="library-card-desc">${escapeHtml(b.description)}</p>` : ''}
      </div>
    `;
  }).join('');
}

function formatDateDmy(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getPurposeBadgeHtml(purpose) {
  const p = purpose || 'Avance';
  let cls = 'purpose-advance';
  let i18nKey = 'purpose_advance';
  if (p === 'Jefes') {
    cls = 'purpose-boss';
    i18nKey = 'purpose_boss';
  } else if (p === 'Farmeo' || p === 'Farming') {
    cls = 'purpose-farm';
    i18nKey = 'purpose_farm';
  }
  const label = window.I18N ? window.I18N.t(i18nKey) : (p === 'Farmeo' ? 'Farming' : p);
  return `<span class="purpose-badge ${cls}">${label}</span>`;
}

function renderPartySummaryHtml(buildData) {
  if (!buildData || !SkillState.masterData) return '';
  const heroes = ['KNIGHT', 'WARRIOR', 'ASSASSIN', 'ARCHER', 'MAGE'];
  const isEn = (window.I18N && window.I18N.currentLang === 'en') || document.documentElement.lang === 'en';

  return `
    <div class="summary-party-5cols">
      ${heroes.map(hId => {
        const hero = SkillState.masterData.heroes[hId];
        const hb = buildData[hId] || { actives: {}, passives: {} };
        const spentAct = Object.values(hb.actives || {}).reduce((a, b) => a + b, 0);
        const spentPass = Object.values(hb.passives || {}).reduce((a, b) => a + b, 0);
        const totalSpent = spentAct + spentPass;
        const heroName = window.I18N ? window.I18N.t('hero_' + hId) : (isEn ? (hero.name_en || hero.name) : hero.name);

        return `
          <div class="summary-hero-col hero-border-${hId.toLowerCase()}" title="${heroName}: ${totalSpent} pts">
            <span class="summary-hero-name hero-text-${hId.toLowerCase()}">${heroName}</span>
            <span class="summary-hero-pts">${totalSpent} <small>pts</small></span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}


async function loadBuildFromDb(buildId) {
  try {
    const build = await ApiClient.getBuild(String(buildId));
    SkillState.setHeroLevel(build.hero_level);
    SkillState.state.builds = build.build_data;
    if (window.renderSkillPlanner) window.renderSkillPlanner();
    closeLoadBuildModal();
    
    // Activar cabecera dinámica con nombre, autor, cometido y fecha
    setActiveBuild(build);

    const isEn = window.I18N && window.I18N.currentLang === 'en';
    showSkillToastNotice(isEn ? `Build "${build.title}" loaded successfully.` : `Build "${build.title}" cargada correctamente.`);
  } catch (err) {
    alert(`Error al cargar build: ${err.message}`);
  }
}


function promptDeleteBuild(buildId) {
  const confirmBox = document.getElementById(`delete_confirm_${buildId}`);
  if (confirmBox) confirmBox.style.display = 'flex';
}

function cancelDeleteBuild(buildId) {
  const confirmBox = document.getElementById(`delete_confirm_${buildId}`);
  if (confirmBox) confirmBox.style.display = 'none';
}

async function confirmDeleteBuild(buildId) {
  try {
    await ApiClient.deleteBuild(buildId);
    const card = document.getElementById(`build_card_${buildId}`);
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        card.remove();
        cachedLibraryBuilds = cachedLibraryBuilds.filter(b => b.id !== buildId);
        if (cachedLibraryBuilds.length === 0) {
          renderLibraryBuilds([]);
        }
      }, 200);
    }
    const isEn = window.I18N && window.I18N.currentLang === 'en';
    showSkillToastNotice(isEn ? 'Build deleted from library.' : 'Build eliminada de la biblioteca.');
  } catch (err) {
    alert(`Error al eliminar build: ${err.message}`);
  }
}

function copyLibraryCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    const isEn = window.I18N && window.I18N.currentLang === 'en';
    showSkillToastNotice(isEn ? 'Share code copied to clipboard!' : '¡Código de build copiado al portapapeles!');
  });
}

// ==========================================================================
// 3. Compartir / Exportar e Importar Código o JSON
// ==========================================================================

function openShareModal(mode) {
  if (mode === 'export') {
    const unspent = getHeroesWithUnspentPoints();
    if (unspent.length > 0) {
      pendingActionAfterWarning = 'export_share';
      showUnspentWarningModal(unspent);
      return;
    }
  }
  proceedOpenShareModal(mode);
}

function proceedOpenShareModal(mode) {
  const modal = document.getElementById('modal_share');
  modal.style.display = 'flex';

  // Generar datos de exportación
  const buildExport = {
    version: '1.0.0',
    level: SkillState.state.heroLevel,
    builds: SkillState.state.builds
  };

  const jsonStr = JSON.stringify(buildExport, null, 2);
  const jsonArea = document.getElementById('export_json_area');
  if (jsonArea) jsonArea.value = jsonStr;

  const compactPayload = {
    lvl: SkillState.state.heroLevel,
    b: SkillState.state.builds
  };
  let code = '';
  try {
    const rawJson = JSON.stringify(compactPayload);
    const b64 = btoa(unescape(encodeURIComponent(rawJson)));
    code = `MPIG-${b64}`;
  } catch (e) {
    code = `MPIG-B${SkillState.state.heroLevel}`;
  }
  const codeInput = document.getElementById('export_share_code');
  if (codeInput) codeInput.value = code;

  switchShareTab(mode || 'export');
}

function closeShareModal() {
  document.getElementById('modal_share').style.display = 'none';
}

function switchShareTab(tab) {
  const tabBtnExport = document.getElementById('tab_btn_export');
  const tabBtnImport = document.getElementById('tab_btn_import');
  const exportSec = document.getElementById('share_export_section');
  const importSec = document.getElementById('share_import_section');

  if (tab === 'export') {
    if (tabBtnExport) tabBtnExport.classList.add('active');
    if (tabBtnImport) tabBtnImport.classList.remove('active');
    if (exportSec) exportSec.style.display = 'block';
    if (importSec) importSec.style.display = 'none';
  } else {
    if (tabBtnImport) tabBtnImport.classList.add('active');
    if (tabBtnExport) tabBtnExport.classList.remove('active');
    if (exportSec) exportSec.style.display = 'none';
    if (importSec) importSec.style.display = 'block';
    const importInput = document.getElementById('import_input_area');
    if (importInput) {
      importInput.value = '';
      setTimeout(() => importInput.focus(), 100);
    }
  }
}

function copyShareCode() {
  const code = document.getElementById('export_share_code').value;
  navigator.clipboard.writeText(code).then(() => {
    const isEn = window.I18N && window.I18N.currentLang === 'en';
    showSkillToastNotice(isEn ? 'Share code copied to clipboard!' : '¡Código copiado al portapapeles!');
  });
}

function copyBuildJson() {
  const jsonText = document.getElementById('export_json_area').value;
  navigator.clipboard.writeText(jsonText).then(() => {
    const isEn = window.I18N && window.I18N.currentLang === 'en';
    showSkillToastNotice(isEn ? 'JSON definition copied to clipboard!' : '¡JSON copiado al portapapeles!');
  });
}

function downloadBuildJson() {
  const jsonText = document.getElementById('export_json_area').value;
  const blob = new Blob([jsonText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mpig_build_lvl${SkillState.state.heroLevel}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function applyImportedBuild() {
  const input = document.getElementById('import_input_area').value.trim();
  if (!input) return;

  const isEn = window.I18N && window.I18N.currentLang === 'en';

  const applyPayload = (payload, sourceTitle) => {
    const lvl = payload.level || payload.lvl || 80;
    const buildsData = payload.builds || payload.b;
    if (buildsData) {
      SkillState.setHeroLevel(lvl);
      SkillState.state.builds = buildsData;
      if (window.renderSkillPlanner) window.renderSkillPlanner();
      closeShareModal();
      const msg = sourceTitle 
        ? (isEn ? `Build "${sourceTitle}" loaded successfully.` : `Build "${sourceTitle}" importada con éxito.`)
        : (isEn ? 'Build imported successfully.' : '¡Build importada correctamente!');
      showSkillToastNotice(msg);
      return true;
    }
    return false;
  };

  // 1. Intentar como JSON directo
  if (input.startsWith('{')) {
    try {
      const parsed = JSON.parse(input);
      if (applyPayload(parsed)) return;
    } catch (e) {
      alert(isEn ? 'Invalid JSON format.' : 'Formato JSON no válido.');
      return;
    }
  }

  // 2. Intentar como código Base64 autocontenido (MPIG-...)
  if (input.startsWith('MPIG-')) {
    const b64Part = input.substring(5);
    try {
      const decodedJson = decodeURIComponent(escape(atob(b64Part)));
      const parsed = JSON.parse(decodedJson);
      if (applyPayload(parsed)) return;
    } catch (e) {
      // No era base64 directo, intentar consultar en SQLite por share_code
    }

    // 3. Consultar en SQLite por share_code o ID
    ApiClient.getBuild(input).then(b => {
      applyPayload(b.build_data ? { lvl: b.hero_level, b: b.build_data } : b, b.title);
      setActiveBuild(b);
    }).catch(() => {
      alert(isEn ? 'Build code not recognized in database.' : 'Código de build no reconocido en la base de datos.');
    });
    return;
  }

  // Si es un ID numérico de base de datos
  if (/^\d+$/.test(input)) {
    ApiClient.getBuild(input).then(b => {
      applyPayload(b.build_data ? { lvl: b.hero_level, b: b.build_data } : b, b.title);
      setActiveBuild(b);
    }).catch(() => {
      alert(isEn ? 'Build ID not found.' : 'ID de build no encontrado.');
    });
    return;
  }

  alert(isEn ? 'Unrecognized build format.' : 'Formato de build no reconocido.');
}

// ==========================================================================
// 4. Advertencia de Puntos sin Gastar
// ==========================================================================

function getHeroesWithUnspentPoints() {
  if (!SkillState.masterData) return [];
  const list = [];
  const isEn = window.I18N && window.I18N.currentLang === 'en';
  ['KNIGHT', 'WARRIOR', 'ASSASSIN', 'ARCHER', 'MAGE'].forEach(hId => {
    const pts = SkillState.getHeroStatPoints(hId);
    if (pts.remaining > 0) {
      const hero = SkillState.masterData.heroes[hId];
      const hName = isEn ? (hero.name_en || hero.name) : (window.I18N ? window.I18N.t('hero_' + hId) : hero.name);
      list.push({
        heroId: hId,
        name: hName,
        avatar: hero.avatar,
        color: hero.theme_color,
        remaining: pts.remaining
      });
    }
  });
  return list;
}

function showUnspentWarningModal(unspent) {
  const listCont = document.getElementById('unspent_warning_list');
  const isEn = window.I18N && window.I18N.currentLang === 'en';
  const unspentTxt = isEn ? 'unallocated pts' : 'pts sin asignar';

  listCont.innerHTML = unspent.map(u => `
    <div class="unspent-hero-item">
      <div class="unspent-hero-ident">
        <img src="/static/${u.avatar}" alt="${escapeHtml(u.name)}" class="unspent-hero-avatar" />
        <strong style="color: ${u.color}; font-size: 0.88rem;">${escapeHtml(u.name)}</strong>
      </div>
      <span class="unspent-hero-pts">${u.remaining} ${unspentTxt}</span>
    </div>
  `).join('');

  document.getElementById('modal_unspent_warning').style.display = 'flex';
}

function dismissUnspentWarningModal() {
  document.getElementById('modal_unspent_warning').style.display = 'none';
  pendingActionAfterWarning = null;
}

function closeUnspentWarningModal() {
  document.getElementById('modal_unspent_warning').style.display = 'none';
}

function autoAssignAndProceed() {
  SkillState.maxAllHeroesSkills();
  closeUnspentWarningModal();
  executePendingAction();
}

function forceProceedAction() {
  closeUnspentWarningModal();
  executePendingAction();
}

function executePendingAction() {
  const action = pendingActionAfterWarning;
  pendingActionAfterWarning = null;
  if (action === 'save_db') {
    proceedOpenSaveBuildModal();
  } else if (action === 'export_share') {
    proceedOpenShareModal('export');
  }
}

// ==========================================================================
// 5. Modal de Confirmación de Reset Destructivo
// ==========================================================================

function openConfirmResetModal() {
  const modal = document.getElementById('modal_confirm_reset');
  if (modal) modal.style.display = 'flex';
}

function closeConfirmResetModal() {
  const modal = document.getElementById('modal_confirm_reset');
  if (modal) modal.style.display = 'none';
}

function executeResetAllConfirmed() {
  SkillState.resetAll();
  closeConfirmResetModal();
  const isEn = window.I18N && window.I18N.currentLang === 'en';
  showSkillToastNotice(isEn ? 'All hero skills reset to 0.' : 'Todas las habilidades de la party han sido reiniciadas a 0.');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==========================================================================
// 6. Build Activa en Cabecera Dinámica y Compartir
// ==========================================================================

let currentActiveBuild = null;

function setActiveBuild(build) {
  currentActiveBuild = build;
  window.currentActiveBuild = build;
  refreshActiveBuildHeader();
}

function refreshActiveBuildHeader() {
  window.currentActiveBuild = currentActiveBuild;
  const titleDisplay = document.getElementById('active_build_name_display');
  const metaCluster = document.getElementById('active_build_meta_cluster');
  const actionsCluster = document.getElementById('active_build_actions_cluster');
  const purposePill = document.getElementById('active_build_purpose_pill');
  const authorDisplay = document.getElementById('active_build_author_display');
  const dateDisplay = document.getElementById('active_build_date_display');
  const icon = document.querySelector('.builder-panel-title-icon');

  if (!currentActiveBuild) {
    if (titleDisplay) {
      titleDisplay.setAttribute('data-i18n', 'section_new_build');
      titleDisplay.textContent = window.I18N ? window.I18N.t('section_new_build') : 'NUEVA BUILD';
    }
    if (metaCluster) metaCluster.style.display = 'none';
    if (actionsCluster) actionsCluster.style.display = 'none';
    if (icon) {
      icon.innerHTML = '<path d="M12 4v16m8-8H4" />';
    }
    return;
  }

  // Quitar atributo data-i18n para que las traducciones no pisen el título de la build cargada
  if (titleDisplay) {
    titleDisplay.removeAttribute('data-i18n');
    titleDisplay.textContent = currentActiveBuild.title;
  }
  if (metaCluster) metaCluster.style.display = 'inline-flex';
  if (actionsCluster) actionsCluster.style.display = 'inline-flex';
  if (icon) {
    icon.innerHTML = '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />';
  }

  const p = currentActiveBuild.purpose || 'Avance';
  let cls = 'purpose-advance';
  let i18nKey = 'purpose_advance';
  if (p === 'Jefes') {
    cls = 'purpose-boss';
    i18nKey = 'purpose_boss';
  } else if (p === 'Farmeo') {
    cls = 'purpose-farm';
    i18nKey = 'purpose_farm';
  }
  if (purposePill) {
    purposePill.className = `purpose-badge ${cls}`;
    purposePill.textContent = window.I18N ? window.I18N.t(i18nKey) : p;
  }

  if (authorDisplay) {
    const byTxt = window.I18N ? window.I18N.t('build_by_author').replace('{0}', currentActiveBuild.author || 'Anónimo') : `Por ${currentActiveBuild.author || 'Anónimo'}`;
    authorDisplay.textContent = byTxt;
  }

  if (dateDisplay) {
    dateDisplay.textContent = formatDateDmy(currentActiveBuild.updated_at || currentActiveBuild.created_at);
  }
}

function resetToNewBuildMode() {
  currentActiveBuild = null;
  window.currentActiveBuild = null;
  refreshActiveBuildHeader();
  SkillState.resetAll();
  const isEn = window.I18N && window.I18N.currentLang === 'en';
  showSkillToastNotice(isEn ? 'Started new build.' : 'Modo Nueva Build activado.');
}

async function shareCurrentActiveBuild() {
  if (!currentActiveBuild) return;
  const shareCode = currentActiveBuild.share_code;
  const url = `${window.location.origin}${window.location.pathname}?build=${encodeURIComponent(shareCode)}`;
  const title = `MPiG-Builder - ${currentActiveBuild.title}`;
  const isEn = window.I18N && window.I18N.currentLang === 'en';

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: `Build de talentos: ${currentActiveBuild.title}`,
        url
      });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    const toastMsg = window.I18N ? window.I18N.t('share_copied_toast') : '¡Enlace de la build copiado al portapapeles!';
    showSkillToastNotice(toastMsg);
  } catch (err) {
    prompt('Copia el siguiente enlace:', url);
  }
}

// ==========================================================================
// 7. Sistema de Votación y Solicitudes de Borrado
// ==========================================================================

function getVotedBuilds() {
  try {
    return JSON.parse(localStorage.getItem('mpig_voted_builds') || '[]');
  } catch {
    return [];
  }
}

function hasVotedBuild(buildId) {
  return getVotedBuilds().includes(Number(buildId));
}

function markBuildVoted(buildId) {
  const voted = getVotedBuilds();
  if (!voted.includes(Number(buildId))) {
    voted.push(Number(buildId));
    localStorage.setItem('mpig_voted_builds', JSON.stringify(voted));
  }
}

async function handleVoteBuild(buildId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const isEn = window.I18N && window.I18N.currentLang === 'en';
  if (hasVotedBuild(buildId)) {
    showSkillToastNotice(isEn ? 'You have already voted for this build.' : 'Ya has votado esta build.');
    return;
  }

  try {
    const res = await ApiClient.voteBuild(buildId);
    markBuildVoted(buildId);
    
    // Actualizar contadores visuales en pantalla
    document.querySelectorAll(`.vote-btn-build-${buildId}`).forEach(btn => {
      btn.classList.add('has-voted');
      const countEl = btn.querySelector('.vote-count');
      if (countEl) countEl.textContent = res.votes;
    });

    showSkillToastNotice(isEn ? 'Vote registered! Thank you.' : '¡Voto registrado! Muchas gracias.');
  } catch (err) {
    showSkillToastNotice(err.message);
  }
}

function openDeletionRequestModal(buildId, title, code) {
  document.getElementById('deletion_target_build_id').value = buildId;
  document.getElementById('deletion_target_build_title').textContent = title || '--';
  document.getElementById('deletion_target_build_code').textContent = code || '';
  document.getElementById('deletion_request_reason').value = '';
  document.getElementById('modal_deletion_request').style.display = 'flex';
  document.getElementById('deletion_request_reason').focus();
}

function closeDeletionRequestModal() {
  document.getElementById('modal_deletion_request').style.display = 'none';
}

async function handleDeletionRequestSubmit(event) {
  event.preventDefault();
  const buildId = document.getElementById('deletion_target_build_id').value;
  const reason = document.getElementById('deletion_request_reason').value.trim();
  const btn = document.getElementById('btn_submit_deletion');
  const isEn = window.I18N && window.I18N.currentLang === 'en';

  if (!reason || reason.length < 5) {
    alert(isEn ? 'Please specify a reason (at least 5 characters).' : 'Por favor indica un motivo de al menos 5 caracteres.');
    return;
  }

  btn.disabled = true;
  try {
    await ApiClient.requestDeletion(buildId, reason);
    closeDeletionRequestModal();
    const msg = window.I18N ? window.I18N.t('deletion_sent_toast') : 'Solicitud de borrado registrada con éxito para auditoría.';
    showSkillToastNotice(msg);
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    btn.disabled = false;
  }
}

// ==========================================================================
// 8. Panel Comunitario Inferior (Votaciones, Filtro y Máx 5)
// ==========================================================================

let currentCommunitySort = 'votes';

function changeCommunitySort(sort) {
  currentCommunitySort = sort || 'votes';
  updateCommunityBuilds();
}

async function updateCommunityBuilds() {
  const list = document.getElementById('bottom_recent_builds_list');
  const panel = document.getElementById('bottom_recent_builds_panel');
  if (!list || !panel) return;

  try {
    const builds = await ApiClient.listBuilds({ sort: currentCommunitySort, limit: 5 });
    if (!builds || builds.length === 0) {
      panel.style.display = 'none';
      return;
    }

    const isEn = window.I18N && window.I18N.currentLang === 'en';
    const lvlAbbr = isEn ? 'LV' : 'NV';
    const loadBtnTxt = isEn ? 'Load' : 'Cargar';
    const voteBtnTxt = isEn ? 'Vote' : 'Votar';
    const reportTitle = isEn ? 'Report / Request deletion' : 'Reportar / Solicitar borrado';

    let html = '';
    builds.forEach(b => {
      const bTitle = escapeHtml(b.title);
      const bAuthor = escapeHtml(b.author || 'Anónimo');
      const bPurpose = b.purpose || 'Avance';
      const bVotes = b.votes || 0;
      const hasVoted = hasVotedBuild(b.id);
      const dateStr = formatDateDmy(b.updated_at || b.created_at);
      const purposeBadge = getPurposeBadgeHtml(bPurpose);

      html += `
        <div class="recent-build-row-item" id="community_build_item_${b.id}">
          <div class="recent-build-single-line" onclick="loadBuildFromDb(${b.id})">
            <span class="recent-build-level-badge">${lvlAbbr}. ${b.hero_level}</span>
            ${purposeBadge}
            <strong class="recent-build-title-text">${bTitle}</strong>
            <span class="recent-build-dot">•</span>
            <span class="recent-build-author">${window.I18N ? window.I18N.t('build_by_author').replace('{0}', bAuthor) : `Por ${bAuthor}`}</span>
            <span class="recent-build-dot">•</span>
            <span class="recent-build-date">${dateStr}</span>
          </div>

          <div class="recent-build-actions-cluster">
            <!-- Botón Compartir (reemplaza a la píldora de código) -->
            <button type="button" class="btn-community-share" onclick="shareBuildByCode('${b.share_code}', '${escapeHtml(b.title).replace(/'/g, "\\'")}', event)" title="${isEn ? 'Share build' : 'Compartir build'}">
              <svg class="tw-icon-share">
                <use href="#icon-share"></use>
              </svg>
            </button>

            <!-- Botón de Votar (Verde) -->
            <button type="button" class="btn-community-vote vote-btn-build-${b.id} ${hasVoted ? 'has-voted' : ''}" onclick="handleVoteBuild(${b.id}, event)" title="${voteBtnTxt}">
              <svg class="tw-icon-vote">
                <use href="#icon-heart"></use>
              </svg>
              <span class="vote-count">${bVotes}</span>
            </button>

            <!-- Botón Cargar (Cian) -->
            <button type="button" class="btn-community-load" onclick="loadBuildFromDb(${b.id})">
              <svg class="tw-icon-load">
                <use href="#icon-load"></use>
              </svg>
              <span>${loadBtnTxt}</span>
            </button>

            <!-- Botón Solicitar Borrado (Rojo) -->
            <button type="button" class="btn-community-report" onclick="openDeletionRequestModal(${b.id}, '${escapeHtml(b.title).replace(/'/g, "\\'")}', '${b.share_code}')" title="${reportTitle}">
              <svg class="tw-icon-report">
                <use href="#icon-report"></use>
              </svg>
            </button>
          </div>
        </div>
      `;
    });
    list.innerHTML = html;
    panel.style.display = 'block';
  } catch (err) {
    panel.style.display = 'none';
  }
}

function shareBuildByCode(shareCode, title, event) {
  if (event) event.stopPropagation();
  const url = `${window.location.origin}${window.location.pathname}?build=${encodeURIComponent(shareCode)}`;
  const isEn = (window.I18N && window.I18N.currentLang === 'en') || document.documentElement.lang === 'en';

  if (navigator.share) {
    navigator.share({
      title: `MPiG-Builder - ${title || 'Build'}`,
      text: isEn ? `Check out this build for My Party is Grinding: ${title || ''}` : `Echa un vistazo a esta build de My Party is Grinding: ${title || ''}`,
      url: url
    }).catch(() => {
      copyShareUrl(url, isEn);
    });
  } else {
    copyShareUrl(url, isEn);
  }
}

function copyShareUrl(url, isEn) {
  navigator.clipboard.writeText(url).then(() => {
    const msg = isEn ? 'Build link copied to clipboard!' : '¡Enlace de la build copiado al portapapeles!';
    showSkillToastNotice(msg);
  }).catch(() => {
    prompt(isEn ? 'Copy this link:' : 'Copia este enlace:', url);
  });
}

// Exportar globalmente
window.shareBuildByCode = shareBuildByCode;
window.updateCommunityBuilds = updateCommunityBuilds;
window.changeCommunitySort = changeCommunitySort;
window.handleVoteBuild = handleVoteBuild;
window.openDeletionRequestModal = openDeletionRequestModal;
window.closeDeletionRequestModal = closeDeletionRequestModal;
window.handleDeletionRequestSubmit = handleDeletionRequestSubmit;
window.setActiveBuild = setActiveBuild;
window.refreshActiveBuildHeader = refreshActiveBuildHeader;
window.resetToNewBuildMode = resetToNewBuildMode;
window.shareCurrentActiveBuild = shareCurrentActiveBuild;
window.openSaveBuildModal = openSaveBuildModal;
window.closeSaveBuildModal = closeSaveBuildModal;
window.handleSaveBuildSubmit = handleSaveBuildSubmit;
window.openLoadBuildModal = openLoadBuildModal;
window.closeLoadBuildModal = closeLoadBuildModal;
window.openSaveBuildModalFromLibrary = openSaveBuildModalFromLibrary;
window.filterBuildsList = filterBuildsList;
window.loadBuildFromDb = loadBuildFromDb;
window.promptDeleteBuild = promptDeleteBuild;
window.cancelDeleteBuild = cancelDeleteBuild;
window.confirmDeleteBuild = confirmDeleteBuild;
window.copyLibraryCode = copyLibraryCode;
window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.switchShareTab = switchShareTab;
window.copyShareCode = copyShareCode;
window.copyBuildJson = copyBuildJson;
window.downloadBuildJson = downloadBuildJson;
window.applyImportedBuild = applyImportedBuild;
window.dismissUnspentWarningModal = dismissUnspentWarningModal;
window.closeUnspentWarningModal = closeUnspentWarningModal;
window.autoAssignAndProceed = autoAssignAndProceed;
window.forceProceedAction = forceProceedAction;
window.openConfirmResetModal = openConfirmResetModal;
window.closeConfirmResetModal = closeConfirmResetModal;
window.executeResetAllConfirmed = executeResetAllConfirmed;

