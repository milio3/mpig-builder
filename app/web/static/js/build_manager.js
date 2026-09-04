/**
 * build_manager.js - Gestor de Persistencia, Modales y Exportador/Importador de Builds
 */

let pendingActionAfterWarning = null;

// ==========================================================================
// 1. Guardado en Base de Datos SQLite
// ==========================================================================

function openSaveBuildModal() {
  // Comprobar si sobran puntos sin gastar
  const unspent = getHeroesWithUnspentPoints();
  if (unspent.length > 0) {
    pendingActionAfterWarning = 'save_db';
    showUnspentWarningModal(unspent);
    return;
  }
  proceedOpenSaveBuildModal();
}

function proceedOpenSaveBuildModal() {
  document.getElementById('save_build_title').value = '';
  document.getElementById('save_build_desc').value = '';
  document.getElementById('save_build_level_display').textContent = `Nv. ${SkillState.state.heroLevel}`;
  document.getElementById('modal_save_build').style.display = 'flex';
  document.getElementById('save_build_title').focus();
}

function closeSaveBuildModal() {
  document.getElementById('modal_save_build').style.display = 'none';
}

async function handleSaveBuildSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('save_build_title').value.trim();
  const description = document.getElementById('save_build_desc').value.trim();
  const heroLevel = SkillState.state.heroLevel;
  const buildData = SkillState.state.builds;

  const btn = document.getElementById('btn_submit_save');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    const saved = await ApiClient.saveBuild({
      title,
      description: description || null,
      hero_level: heroLevel,
      build_data: buildData
    });

    closeSaveBuildModal();
    showSkillToastNotice(`✅ ¡Build "${saved.title}" guardada con éxito en la base de datos! (Código: ${saved.share_code})`);
  } catch (err) {
    alert(`Error al guardar en la base de datos: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Confirmar y Guardar';
  }
}

// ==========================================================================
// 2. Carga y Gestión de Builds desde la Base de Datos SQLite
// ==========================================================================

async function openLoadBuildModal() {
  const modal = document.getElementById('modal_load_build');
  const container = document.getElementById('saved_builds_list_container');
  modal.style.display = 'flex';
  container.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #64748b;">Consultando base de datos...</div>';

  try {
    const builds = await ApiClient.listBuilds();
    if (builds.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #94a3b8;">
          No hay ninguna build guardada en la base de datos todavía.<br/>
          <span style="font-size: 0.78rem; color: #64748b;">Distribuye tus puntos y pulsa "Guardar BD" para registrar la primera.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = builds.map(b => `
      <div class="saved-build-item" id="build_row_${b.id}">
        <div class="saved-build-meta">
          <span class="saved-build-title">${escapeHtml(b.title)}</span>
          <div class="saved-build-sub">
            <span style="color: #38bdf8; font-weight: 700;">Nv. ${b.hero_level}</span>
            <span>•</span>
            <span style="font-family: monospace; color: #a5b4fc;">${b.share_code}</span>
            <span>•</span>
            <span>${new Date(b.created_at).toLocaleDateString()}</span>
          </div>
          ${b.description ? `<p style="font-size: 0.75rem; color: #cbd5e1; margin-top: 4px;">${escapeHtml(b.description)}</p>` : ''}
        </div>
        <div class="saved-build-actions">
          <button class="btn btn-primary" onclick="loadBuildFromDb(${b.id})" title="Cargar esta build">
            Cargar
          </button>
          <button class="btn btn-outline" style="color: #fca5a5; border-color: #7f1d1d;" onclick="deleteBuildFromDb(${b.id})" title="Eliminar de la BD">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: #ef4444; padding: 1rem;">Error: ${escapeHtml(err.message)}</div>`;
  }
}

function closeLoadBuildModal() {
  document.getElementById('modal_load_build').style.display = 'none';
}

async function loadBuildFromDb(buildId) {
  try {
    const build = await ApiClient.getBuild(String(buildId));
    SkillState.setHeroLevel(build.hero_level);
    SkillState.state.builds = build.build_data;
    if (window.renderSkillPlanner) window.renderSkillPlanner();
    closeLoadBuildModal();
    showSkillToastNotice(`✨ Build "${build.title}" cargada correctamente.`);
  } catch (err) {
    alert(`Error al cargar build: ${err.message}`);
  }
}

async function deleteBuildFromDb(buildId) {
  if (!confirm('¿Seguro que deseas eliminar esta build de la base de datos?')) return;
  try {
    await ApiClient.deleteBuild(buildId);
    const row = document.getElementById(`build_row_${buildId}`);
    if (row) row.remove();
    showSkillToastNotice('Build eliminada de la base de datos.');
  } catch (err) {
    alert(`Error al eliminar: ${err.message}`);
  }
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
  const exportSec = document.getElementById('share_export_section');
  const importSec = document.getElementById('share_import_section');
  const title = document.getElementById('modal_share_title');

  modal.style.display = 'flex';

  if (mode === 'export') {
    title.textContent = 'Exportar Configuración de Habilidades';
    exportSec.style.display = 'block';
    importSec.style.display = 'none';

    const buildExport = {
      version: '1.0.0',
      level: SkillState.state.heroLevel,
      builds: SkillState.state.builds
    };

    const jsonStr = JSON.stringify(buildExport, null, 2);
    document.getElementById('export_json_area').value = jsonStr;

    // Generar código compacto Base64 seguro
    const compactPayload = {
      lvl: SkillState.state.heroLevel,
      b: SkillState.state.builds
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(compactPayload))));
    const code = `MPIG-B${SkillState.state.heroLevel}-${b64.substring(0, 16).toUpperCase()}`;
    document.getElementById('export_share_code').value = code;
  } else {
    title.textContent = 'Importar Build';
    exportSec.style.display = 'none';
    importSec.style.display = 'block';
    document.getElementById('import_input_area').value = '';
    document.getElementById('import_input_area').focus();
  }
}

function closeShareModal() {
  document.getElementById('modal_share').style.display = 'none';
}

function copyShareCode() {
  const code = document.getElementById('export_share_code').value;
  navigator.clipboard.writeText(code).then(() => {
    showSkillToastNotice('📋 ¡Código copiado al portapapeles!');
  });
}

function copyBuildJson() {
  const jsonText = document.getElementById('export_json_area').value;
  navigator.clipboard.writeText(jsonText).then(() => {
    showSkillToastNotice('📋 ¡JSON copiado al portapapeles!');
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

  try {
    let parsed = null;
    if (input.startsWith('{')) {
      parsed = JSON.parse(input);
    } else if (input.startsWith('MPIG-')) {
      // Buscar si es un código guardado en base de datos
      ApiClient.getBuild(input).then(b => {
        SkillState.setHeroLevel(b.hero_level);
        SkillState.state.builds = b.build_data;
        if (window.renderSkillPlanner) window.renderSkillPlanner();
        closeShareModal();
        showSkillToastNotice(`✅ Build "${b.title}" importada desde la base de datos.`);
      }).catch(() => {
        alert('Código de build no reconocido en la base de datos.');
      });
      return;
    }

    if (parsed) {
      const lvl = parsed.level || parsed.lvl || 80;
      const buildsData = parsed.builds || parsed.b;
      if (buildsData) {
        SkillState.setHeroLevel(lvl);
        SkillState.state.builds = buildsData;
        if (window.renderSkillPlanner) window.renderSkillPlanner();
        closeShareModal();
        showSkillToastNotice('✅ Build JSON importada correctamente.');
      } else {
        alert('Formato JSON no válido.');
      }
    }
  } catch (err) {
    alert(`Error al procesar la importación: ${err.message}`);
  }
}

// ==========================================================================
// 4. Advertencia de Puntos sin Gastar
// ==========================================================================

function getHeroesWithUnspentPoints() {
  if (!SkillState.masterData) return [];
  const list = [];
  ['KNIGHT', 'WARRIOR', 'ASSASSIN', 'ARCHER', 'MAGE'].forEach(hId => {
    const pts = SkillState.getHeroStatPoints(hId);
    if (pts.remaining > 0) {
      const hero = SkillState.masterData.heroes[hId];
      list.push({
        heroId: hId,
        name: hero.name_en || hero.name,
        color: hero.theme_color,
        remaining: pts.remaining
      });
    }
  });
  return list;
}

function showUnspentWarningModal(unspent) {
  const listCont = document.getElementById('unspent_warning_list');
  listCont.innerHTML = unspent.map(u => `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <strong style="color: ${u.color}; font-size: 0.85rem;">${escapeHtml(u.name)}:</strong>
      <span style="color: #38bdf8; font-weight: 800; font-size: 0.85rem;">${u.remaining} pts sin asignar</span>
    </div>
  `).join('');
  document.getElementById('modal_unspent_warning').style.display = 'flex';
}

function closeUnspentWarningModal() {
  document.getElementById('modal_unspent_warning').style.display = 'none';
  pendingActionAfterWarning = null;
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
  if (pendingActionAfterWarning === 'save_db') {
    proceedOpenSaveBuildModal();
  } else if (pendingActionAfterWarning === 'export_share') {
    proceedOpenShareModal('export');
  }
  pendingActionAfterWarning = null;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
