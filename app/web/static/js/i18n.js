/**
 * i18n.js - Sistema de Internacionalización Liviano (Español / English)
 * Maneja el cambio dinámico de idioma para MPiG-Bulder.
 */

const I18N = {
  currentLang: localStorage.getItem('mpig_lang') || 'es',

  translations: {
    es: {
      brand_title: 'MPiG-Builder',
      brand_subtitle: 'Crea y comparte tus builds de My Party is Grinding',
      header_subtitle_prefix: 'Crea y comparte tus builds de',
      steam_link_title: 'Ver My Party is Grinding en Steam',
      group_level: 'Nivel Grupo:',
      active_skills_label: 'Habilidades activas desbloqueadas',
      actives_total_label: 'Activas:',
      actives_tracker_title: 'Límite de habilidades activas por héroe',
      actives_max_tag: 'MÁX',
      hero_actives_badge_title: 'Habilidades activas equipadas ({0} de {1} máx)',
      hero_actives_max_title: 'Máximo de habilidades activas alcanzado para este héroe',
      skill_active_capped_title: 'Bloqueada: Ya has alcanzado el límite de habilidades activas en este héroe. Reduce nivel en otra activa para equipar esta.',
      skill_active_limit_toast: '¡Límite alcanzado! {0} ya tiene equipadas {1} habilidades activas.',
      points_per_hero: 'Party Selection / Puntos:',
      pts_unit: 'pts',
      btn_max_all: 'Max Todo',
      btn_max_all_title: 'Maximizar automáticamente puntos de todos los héroes',
      btn_save: 'Guardar BD',
      btn_save_title: 'Guardar esta configuración en la base de datos SQLite',
      btn_library: 'Biblioteca',
      btn_library_title: 'Ver todas las builds guardadas en la biblioteca',
      btn_builds: 'Biblioteca',
      btn_builds_title: 'Ver todas las builds guardadas en la biblioteca',
      btn_reset: 'Reset',
      btn_reset_title: 'Reiniciar todos los puntos de todos los héroes',
      reset_confirm: '¿Seguro que deseas reiniciar los puntos de todos los héroes?',
      lang_switch_title: 'Cambiar idioma / Change language',
      quick_preset_title: 'Ajustar nivel a',
      hero_max_points: 'Max Puntos',
      hero_max_points_title: 'Maximizar puntos de este héroe',

      // Roles y Héroes
      role_KNIGHT: 'Tanque Principal & Protector',
      role_WARRIOR: 'Luchador Melee & Berserker',
      role_ASSASSIN: 'DPS Rápido & Crítico',
      role_ARCHER: 'Tirador a Distancia & Rango',
      role_MAGE: 'Archihechicero Elemental',
      hero_KNIGHT: 'Caballero',
      hero_WARRIOR: 'Guerrero',
      hero_ASSASSIN: 'Asesina',
      hero_ARCHER: 'Arquera',
      hero_MAGE: 'Maga',

      // Secciones
      section_new_build: 'NUEVA BUILD',
      section_community_builds: 'BUILDS DE LA COMUNIDAD',
      sort_label: 'Ordenar:',
      sort_votes: 'Más votadas',
      sort_recent: 'Más recientes',
      view_all_library: 'Ver todas en Biblioteca',
      view_all_library_title: 'Abrir biblioteca completa de builds',
      loading_master_data: 'Cargando datos maestros desde la base de datos...',

      // Propósitos / Tipo de Build
      purpose_advance: 'Avance',
      purpose_boss: 'Jefes',
      purpose_farm: 'Farming',
      modal_save_label_author: 'Autor',
      placeholder_build_author: 'Tu apodo o nombre (ej: Milio)',
      modal_save_label_purpose: 'Tipo de build',
      filter_recent: 'Últimas builds',
      filter_level_desc: 'Nivel descendente',
      filter_votes: 'Más votadas',
      build_by_author: 'Por {0}',
      btn_vote: 'Votar',
      btn_voted: 'Votado',
      btn_share: 'Compartir',
      share_copied_toast: '¡Enlace de la build copiado al portapapeles!',

      // Solicitud de Borrado
      modal_deletion_title: 'Solicitar Borrado',
      modal_deletion_sub: 'Auditoría y control de contenido',
      deletion_target_label: 'Build a reportar:',
      deletion_reason_label: 'Motivo o justificación del borrado',
      placeholder_deletion_reason: 'Indica el motivo (ej: build duplicada, contenido desactualizado)...',
      btn_send_deletion_request: 'Enviar Solicitud',
      deletion_sent_toast: 'Solicitud de borrado registrada con éxito para auditoría.',

      tier_label: 'Tier',
      level_abbr: 'NV',
      active_skill: 'Activa',
      passive_skill: 'Pasiva',
      skill_maxed: 'Maximizada',
      locked_req: 'Req. Nivel',

      // Tooltips & Estadísticas
      tooltip_current_effect: 'Efecto actual:',
      tooltip_next_level: 'Siguiente nivel:',
      tooltip_per_level: 'por nivel',
      tooltip_max_cap_reached: 'Nivel máximo alcanzado',
      tooltip_current: 'actual',
      tooltip_cap_info: 'Límite actual Nv.{0} / final Nv.{1} · Nv.{2} se desbloquea al nivel {3} del personaje',
      tooltip_cap_reached: 'Límite actual Nv.{0} / final Nv.{1} · ¡Tope máximo alcanzado!',
      tooltip_equipped_actives: 'Activas equipadas',
      tooltip_cap_unlock: 'Tope Nv.{0} · Desbloquea a Nv.{1}',
      tooltip_controls_hint: 'Click: +1 · MAX / Shift+Click: Nivel Máximo · Click Der: -1',
      req_level: 'Nivel requerido:',
      pts_invested_of: 'puntos invertidos de',

      // Elementos canónicos
      legend_actives: 'ACTIVAS:',
      elem_phys: 'Físico',
      elem_physical: 'Físico',
      elem_phys_desc: 'Habilidades de Daño Físico',
      elem_fire: 'Fuego',
      elem_fire_desc: 'Habilidades de Daño de Fuego',
      elem_cold: 'Frío',
      elem_cold_desc: 'Habilidades de Daño de Frío',
      elem_light: 'Rayo',
      elem_lightning: 'Rayo',
      elem_light_desc: 'Habilidades de Daño Eléctrico',
      elem_chaos: 'Caos',
      elem_chaos_desc: 'Habilidades de Daño de Caos',


      // Footer
      footer_click_left: 'Clic izquierdo',
      footer_add_level: '+1 nivel',
      footer_max_level: 'Nivel máximo',
      footer_click_right: 'Clic derecho',
      footer_sub_level: '-1 nivel',
      hint_left_click_title: 'Un clic añade 1 punto de nivel',
      hint_shift_click_title: 'Shift + Clic asigna todos los niveles posibles',
      hint_right_click_title: 'Clic derecho resta 1 punto de nivel',

      // Botones de acción
      btn_load: 'Cargar',
      btn_load_build: 'Cargar Build',
      btn_load_action: 'Cargar',
      btn_delete_action: 'Eliminar',
      recent_builds_empty: 'No hay builds guardadas todavía.',

      // Modales
      modal_save_title: 'Guardar build',
      modal_save_sub: 'Guarda y comparte tus builds',
      modal_save_label_name: 'Nombre de la Build',
      modal_save_label_desc: 'Notas Tácticas y Estrategia',
      placeholder_build_author: 'Tu nombre',
      modal_save_summary_level: 'Nivel Registrado',
      btn_confirm_save: 'Guardar build',
      btn_cancel: 'Cancelar',
      btn_close: 'Cerrar',
      btn_new_build: 'Nueva Build',

      modal_load_title: 'Biblioteca de Builds Guardadas',
      modal_load_sub: 'Librería de builds de My party is Grinding',
      library_search_placeholder: 'Buscar build por nombre o código...',
      library_loading: 'Consultando biblioteca de SQLite...',
      library_empty_title: 'Biblioteca de Builds Vacía',
      library_empty_desc: 'No hay ninguna build registrada aún. Configura los talentos de tu party y pulsa "Guardar BD" para registrar la primera.',

      modal_share_title: 'Compartir e Intercambiar Builds',
      modal_share_sub: 'Transfiere tus composiciones mediante código compacto o archivo JSON',
      tab_export: 'Exportar Build',
      tab_import: 'Importar Build',
      label_share_code: 'Código Compacto de Compartir',
      label_json_def: 'Definición JSON Completa',
      btn_copy_code: 'Copiar Código',
      btn_copy_json: 'Copiar JSON',
      btn_download_json: 'Descargar Archivo .json',
      label_import_input: 'Pega tu Código o JSON de Build',
      help_import_input: 'Admite tanto códigos compactos (ej. MPIG-B80-...) como bloques de exportación JSON estructurado.',
      btn_apply_import: 'Cargar e Importar Build',

      modal_unspent_title: 'Puntos de Talento Disponibles',
      modal_unspent_sub: 'Hay héroes en la party que aún tienen puntos sin invertir',
      modal_unspent_desc: 'Para optimizar al máximo tu build, se recomienda gastar todos los puntos disponibles antes de guardarla o exportarla:',
      btn_back_assign: 'Volver y Asignar',
      btn_auto_assign_proceed: 'Auto-Asignar y Continuar',
      btn_ignore_proceed: 'Continuar de Todos Modos',

      modal_reset_title: '¿Reiniciar Habilidades?',
      modal_reset_sub: 'Restablecimiento total de talentos',
      modal_reset_desc: 'Esta acción restablecerá a 0 todos los puntos invertidos en las habilidades de los 5 personajes. Los puntos se reintegrarán inmediatamente a tu reserva para que puedas redistribuirlos.',
      btn_confirm_reset: 'Confirmar Reinicio',

      // Placeholders & Labels
      placeholder_build_name: 'Ej: Meta Endgame 80 - Fuego y Crítico',
      placeholder_build_desc: 'Detalles de rotación, sinergias elementales o equipo recomendado...',
      placeholder_import_input: 'Pega aquí el código MPIG-B80-... o el bloque JSON exportado...',
      modal_optional: 'Opcional'
    },

    en: {
      brand_title: 'MPiG-Builder',
      brand_subtitle: 'Create and share your My Party is Grinding builds',
      header_subtitle_prefix: 'Create and share your builds for',
      steam_link_title: 'View My Party is Grinding on Steam',
      group_level: 'Group Level:',
      active_skills_label: 'Unlocked active skills',
      actives_total_label: 'Actives:',
      actives_tracker_title: 'Active skills limit per hero',
      actives_max_tag: 'MAX',
      hero_actives_badge_title: 'Equipped active skills ({0} of {1} max)',
      hero_actives_max_title: 'Max active skills reached for this hero',
      skill_active_capped_title: 'Locked: You have reached the active skill limit on this hero. Lower another active to equip this one.',
      skill_active_limit_toast: 'Limit reached! {0} already has {1} active skills equipped.',
      points_per_hero: 'Party Selection / Points:',
      pts_unit: 'pts',
      btn_max_all: 'Max All',
      btn_max_all_title: 'Automatically maximize skills for all heroes',
      btn_save: 'Save Build',
      btn_save_title: 'Save this build configuration to SQLite database',
      btn_library: 'Library',
      btn_library_title: 'View all builds saved in the library',
      btn_builds: 'Library',
      btn_builds_title: 'View all builds saved in the library',
      btn_reset: 'Reset',
      btn_reset_title: 'Reset all skill points for all heroes',
      reset_confirm: 'Are you sure you want to reset all skill points for all heroes?',
      lang_switch_title: 'Change language / Cambiar idioma',
      quick_preset_title: 'Set level to',
      hero_max_points: 'Max Points',
      hero_max_points_title: 'Maximize points for this hero',

      // Roles and Heroes
      role_KNIGHT: 'Main Tank & Protector',
      role_WARRIOR: 'Melee Fighter & Berserker',
      role_ASSASSIN: 'Burst DPS & Critical Striker',
      role_ARCHER: 'Ranged Marksman & Sniper',
      role_MAGE: 'Elemental Archmage',
      hero_KNIGHT: 'Knight',
      hero_WARRIOR: 'Warrior',
      hero_ASSASSIN: 'Assassin',
      hero_ARCHER: 'Archer',
      hero_MAGE: 'Mage',

      // Sections
      section_new_build: 'NEW BUILD',
      section_community_builds: 'COMMUNITY BUILDS',
      sort_label: 'Sort by:',
      sort_votes: 'Most Voted',
      sort_recent: 'Most Recent',
      view_all_library: 'View all in Library',
      view_all_library_title: 'Open full builds library',
      loading_master_data: 'Loading master data from database...',

      // Purposes / Build Type
      purpose_advance: 'Progression',
      purpose_boss: 'Bosses',
      purpose_farm: 'Farming',
      modal_save_label_author: 'Author',
      placeholder_build_author: 'Your nickname or name (e.g. Milio)',
      modal_save_label_purpose: 'Build Type',
      filter_recent: 'Latest builds',
      filter_level_desc: 'Highest level',
      filter_votes: 'Most voted',
      build_by_author: 'By {0}',
      btn_vote: 'Vote',
      btn_voted: 'Voted',
      btn_share: 'Share',
      share_copied_toast: 'Build link copied to clipboard!',

      // Deletion Request
      modal_deletion_title: 'Request Deletion',
      modal_deletion_sub: 'Audit and content moderation',
      deletion_target_label: 'Target Build:',
      deletion_reason_label: 'Reason for deletion request',
      placeholder_deletion_reason: 'State the reason (e.g. duplicate build, outdated)...',
      btn_send_deletion_request: 'Send Request',
      deletion_sent_toast: 'Deletion request recorded for audit.',

      tier_label: 'Tier',
      level_abbr: 'LV',
      active_skill: 'Active',
      passive_skill: 'Passive',
      skill_maxed: 'Maxed',
      locked_req: 'Req. Level',

      // Tooltips & Stats
      tooltip_current_effect: 'Current effect:',
      tooltip_next_level: 'Next level:',
      tooltip_per_level: 'per level',
      tooltip_max_cap_reached: 'Maximum level reached',
      tooltip_current: 'current',
      tooltip_cap_info: 'Current cap Lv.{0} / final Lv.{1} · Lv.{2} unlocks at hero level {3}',
      tooltip_cap_reached: 'Current cap Lv.{0} / final Lv.{1} · Maximum cap reached!',
      tooltip_equipped_actives: 'Equipped actives',
      tooltip_cap_unlock: 'Cap Lv.{0} · Unlocks at Lv.{1}',
      tooltip_controls_hint: 'Click: +1 · MAX / Shift+Click: Max Level · Right Click: -1',
      req_level: 'Required level:',
      pts_invested_of: 'points invested of',

      // Elements
      legend_actives: 'ACTIVES:',
      elem_phys: 'Physical',
      elem_physical: 'Physical',
      elem_phys_desc: 'Physical Damage Skills',
      elem_fire: 'Fire',
      elem_fire_desc: 'Fire Damage Skills',
      elem_cold: 'Cold',
      elem_cold_desc: 'Cold Damage Skills',
      elem_light: 'Lightning',
      elem_lightning: 'Lightning',
      elem_light_desc: 'Lightning Damage Skills',
      elem_chaos: 'Chaos',
      elem_chaos_desc: 'Chaos Damage Skills',


      // Footer
      footer_click_left: 'Left click',
      footer_add_level: '+1 level',
      footer_max_level: 'Max level',
      footer_click_right: 'Right click',
      footer_sub_level: '-1 level',
      hint_left_click_title: 'One click adds 1 level point',
      hint_shift_click_title: 'Shift + Click allocates all available levels',
      hint_right_click_title: 'Right click removes 1 level point',

      // Buttons
      btn_load: 'Load',
      btn_load_build: 'Load Build',
      btn_load_action: 'Load',
      btn_delete_action: 'Delete',
      recent_builds_empty: 'No saved builds yet.',

      // Modals
      modal_save_title: 'Save build',
      modal_save_sub: 'Save and share your builds',
      modal_save_label_name: 'Build Name',
      modal_save_label_desc: 'Tactical Notes & Strategy',
      placeholder_build_author: 'Your name',
      modal_save_summary_level: 'Registered Level',
      btn_confirm_save: 'Save build',
      btn_cancel: 'Cancel',
      btn_close: 'Close',
      btn_new_build: 'New Build',

      modal_load_title: 'Saved Builds Library',
      modal_load_sub: 'My party is Grinding build library',
      library_search_placeholder: 'Search build by name or code...',
      library_loading: 'Querying SQLite library...',
      library_empty_title: 'Empty Builds Library',
      library_empty_desc: 'No builds registered yet. Configure your party talents and click "Save Build" to store it here.',

      modal_share_title: 'Share & Transfer Builds',
      modal_share_sub: 'Transfer your compositions via compact code or JSON file',
      tab_export: 'Export Build',
      tab_import: 'Import Build',
      label_share_code: 'Compact Share Code',
      label_json_def: 'Complete JSON Definition',
      btn_copy_code: 'Copy Code',
      btn_copy_json: 'Copy JSON',
      btn_download_json: 'Download .json File',
      label_import_input: 'Paste your Build Code or JSON',
      help_import_input: 'Accepts both compact codes (e.g. MPIG-B80-...) and structured JSON export blocks.',
      btn_apply_import: 'Load & Import Build',

      modal_unspent_title: 'Available Talent Points',
      modal_unspent_sub: 'Some heroes in your party still have unallocated points',
      modal_unspent_desc: 'To maximize your build, it is recommended to spend all points before saving or exporting:',
      btn_back_assign: 'Back & Allocate',
      btn_auto_assign_proceed: 'Auto-Assign & Proceed',
      btn_ignore_proceed: 'Continue Anyway',

      modal_reset_title: 'Reset All Skills?',
      modal_reset_sub: 'Complete talent reset',
      modal_reset_desc: 'This will reset all skill points invested in all 5 heroes to 0. Points will be immediately returned to your pool for reallocation.',
      btn_confirm_reset: 'Confirm Reset',

      // Placeholders & Labels
      placeholder_build_name: 'Ex: Endgame 80 Meta - Fire & Crit',
      placeholder_build_desc: 'Rotation details, elemental synergies or recommended gear...',
      placeholder_import_input: 'Paste MPIG-B80-... code or exported JSON block here...',
      modal_optional: 'Optional'
    }
  },

  t(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    return this.translations.es[key] || key;
  },

  setLanguage(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    this.currentLang = lang;
    localStorage.setItem('mpig_lang', lang);
    document.documentElement.lang = lang;
    this.applyTranslations();

    // Resetear tarjeta tooltip actual y ocultar flotante para refrescar en el nuevo idioma
    window._currentTooltipCard = null;
    if (window.hideSkillTooltip) {
      window.hideSkillTooltip();
    }

    if (window.renderSkillPlanner) {
      window.renderSkillPlanner();
    }
    if (window.updateCommunityBuilds) {
      window.updateCommunityBuilds();
    }
    if (window.refreshActiveBuildHeader) {
      window.refreshActiveBuildHeader();
    }
  },


  toggleLanguage() {
    this.setLanguage(this.currentLang === 'es' ? 'en' : 'es');
  },

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      // Si este elemento es el título de la build y hay una build activa, no sobreescribir con section_new_build
      if (el.id === 'active_build_name_display' && window.currentActiveBuild) {
        return;
      }
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text) el.textContent = text;
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const text = this.t(key);
      if (text) el.setAttribute('title', text);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text) el.setAttribute('placeholder', text);
    });

    const langToggleBtn = document.getElementById('btn_lang_toggle');
    if (langToggleBtn) {
      langToggleBtn.innerHTML = `
        <span class="lang-code ${this.currentLang === 'es' ? 'active' : ''}">ES</span>
        <span class="lang-divider">/</span>
        <span class="lang-code ${this.currentLang === 'en' ? 'active' : ''}">EN</span>
      `;
    }

    if (window.refreshActiveBuildHeader) {
      window.refreshActiveBuildHeader();
    }
  },

  init() {
    document.documentElement.lang = this.currentLang;
    this.applyTranslations();
  }
};

window.I18N = I18N;
document.addEventListener('DOMContentLoaded', () => {
  I18N.init();
});
