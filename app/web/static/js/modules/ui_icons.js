/**
 * ui_icons.js - Catálogo Centralizado de Iconos SVG de MPiG-Builder
 * Integra y consume el Sprite SVG modular definido en components/icons.html
 */

const Icons = {
  /**
   * Genera el marcado SVG usando el Sprite centralizado
   * @param {string} name - Identificador del símbolo SVG (sin prefijo 'icon-' o nombre completo)
   * @param {string} className - Clases CSS del elemento <svg>
   * @param {string} extraAttrs - Atributos adicionales (title, aria-label, etc.)
   * @returns {string} Código HTML del <svg>
   */
  use(name, className = 'tw-icon-sm', extraAttrs = '') {
    const symbolId = name.startsWith('elem-') || name.startsWith('icon-') ? name : `icon-${name}`;
    return `<svg class="${className}" aria-hidden="true" ${extraAttrs}><use href="#${symbolId}"></use></svg>`;
  },

  /**
   * Genera el badge circular de elemento de daño de habilidad activa
   * @param {string} elem - Nombre del elemento (PHYSICAL, FIRE, COLD, LIGHTNING, CHAOS)
   * @param {string} title - Título del badge
   * @param {string} extraClass - Clase adicional para el badge
   * @returns {string} Código HTML del badge
   */
  getElementBadge(elem, title = '', extraClass = '') {
    const el = (elem || 'PHYSICAL').toLowerCase();
    const safeTitle = title ? `title="${title}"` : '';
    const iconClass = extraClass.includes('tip-type-elem-badge') ? 'tw-active-icon' : 'tw-active-icon';
    return `<div class="skill-active-badge elem-${el} ${extraClass}" ${safeTitle}><svg class="${iconClass}" aria-hidden="true"><use href="#elem-${el}"></use></svg></div>`;
  },

  /**
   * Genera el icono de elemento de habilidad para tooltips y tarjetas
   * @param {string} elem - Nombre del elemento
   * @param {string} extraClass - Clase adicional
   * @returns {string} Código HTML del badge de elemento
   */
  getElementSvg(elem, extraClass = '') {
    const el = (elem || 'PHYSICAL').toLowerCase();
    const titleMap = {
      physical: 'Físico',
      fire: 'Fuego',
      cold: 'Frío',
      lightning: 'Rayo',
      chaos: 'Caos'
    };
    const title = titleMap[el] || 'Elemento';
    return `<div class="elem-badge elem-${el} ${extraClass}" title="${title}"><svg class="tw-icon-xs" aria-hidden="true"><use href="#elem-${el}"></use></svg></div>`;
  }
};

// Exposición global y compatibilidad hacia atrás
window.Icons = Icons;
window.getElementBadgeHtml = (elem, title, extraClass) => Icons.getElementBadge(elem, title, extraClass);
window.getSkillElementSvg = (elem) => Icons.getElementSvg(elem);
