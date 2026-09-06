/**
 * ui_modals.js - Módulo de Notificaciones Toast y Enlaces Auxiliares
 */

function showSkillToastNotice(msg) {
  const toast = document.getElementById('skill_toast_notice');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

window.showSkillToastNotice = showSkillToastNotice;

/**
 * Muestra una alerta con el diseño visual de la web en un modal centrado.
 * Reemplaza los alert() nativos del navegador.
 */
function showSystemAlert(message, title = null, type = 'info') {
  const modal = document.getElementById('modal_system_alert');
  if (!modal) {
    console.warn('[Alert]', message);
    return;
  }
  const titleEl = document.getElementById('modal_system_alert_title');
  const msgEl = document.getElementById('modal_system_alert_msg');
  const iconBadge = document.getElementById('modal_system_alert_icon_badge');
  const isEn = window.I18N && window.I18N.currentLang === 'en';

  if (titleEl) {
    if (title) {
      titleEl.textContent = title;
    } else if (type === 'error') {
      titleEl.textContent = isEn ? 'Error Notice' : 'Aviso de Error';
    } else {
      titleEl.textContent = isEn ? 'System Notice' : 'Aviso del Sistema';
    }
  }

  if (msgEl) {
    msgEl.textContent = message;
  }

  if (iconBadge) {
    if (type === 'error') {
      iconBadge.className = 'modal-icon-badge modal-icon-rose';
      iconBadge.innerHTML = `<svg class="tw-modal-icon"><use href="#icon-warning"></use></svg>`;
    } else {
      iconBadge.className = 'modal-icon-badge modal-icon-cyan';
      iconBadge.innerHTML = `<svg class="tw-modal-icon"><use href="#icon-info"></use></svg>`;
    }
  }

  modal.style.display = 'flex';
}

function closeSystemAlertModal() {
  const modal = document.getElementById('modal_system_alert');
  if (modal) modal.style.display = 'none';
}

window.showSystemAlert = showSystemAlert;
window.closeSystemAlertModal = closeSystemAlertModal;

// Interceptar alert() nativo para que cualquier llamada residual use el modal de la web
window.alert = function(msg) {
  showSystemAlert(msg);
};


