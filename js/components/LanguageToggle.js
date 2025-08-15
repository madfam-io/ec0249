/**
 * Language Toggle Component - Reusable language switching UI
 */
import BaseComponent from './BaseComponent.js';

class LanguageToggle extends BaseComponent {
  constructor(element, options = {}) {
    super('LanguageToggle', element, {
      dependencies: ['I18nService'],
      config: {
        showText: options.showText !== false,
        showIcon: options.showIcon !== false,
        showNativeName: options.showNativeName || false,
        orientation: options.orientation || 'horizontal',
        size: options.size || 'medium',
        style: options.style || 'button' // button, select, dropdown
      },
      events: {
        'click .language-toggle-btn': 'handleToggleClick',
        'change .language-select': 'handleSelectChange',
        'click .language-option': 'handleOptionClick'
      },
      autoMount: true,
      reactive: true
    });

    this.i18nService = null;
    this.isDropdownOpen = false;
  }

  async onInitialize() {
    this.i18nService = this.service('I18nService');

    // Listen for language changes
    this.i18nService.addLanguageChangeListener(this.handleLanguageChange.bind(this));

    // Initialize data
    this.updateData();

    // Close dropdown on outside click
    document.addEventListener('click', this.handleOutsideClick.bind(this));

    await super.onInitialize();
  }

  /**
   * Update component data from service
   */
  updateData() {
    const currentLanguage = this.i18nService.getCurrentLanguage();
    const supportedLanguages = this.i18nService.getSupportedLanguages();

    this.setData({
      currentLanguage,
      supportedLanguages,
      isDropdownOpen: this.isDropdownOpen,
      languages: supportedLanguages.map(lang => ({
        code: lang,
        label: this.i18nService.getLanguageDisplayName(lang),
        nativeName: this.i18nService.getLanguageNativeName(lang),
        active: lang === currentLanguage
      }))
    });
  }

  /**
   * Generate component template
   * @returns {string} HTML template
   */
  defaultTemplate() {
    const { style, showText, showIcon, showNativeName, orientation, size } = this.componentConfig;
    const { languages, currentLanguage, isDropdownOpen } = this.data;

    const classes = [
      'language-toggle-component',
      `language-toggle-${style}`,
      `language-toggle-${orientation}`,
      `language-toggle-${size}`,
      isDropdownOpen ? 'dropdown-open' : ''
    ].join(' ');

    switch (style) {
      case 'select':
        return this.renderSelectStyle(classes, languages, currentLanguage);
      case 'dropdown':
        return this.renderDropdownStyle(classes, languages, currentLanguage, showText, showIcon, showNativeName);
      default:
        return this.renderButtonStyle(classes, languages, currentLanguage, showText, showIcon);
    }
  }

  /**
   * Render button style
   * @param {string} classes - CSS classes
   * @param {Array} languages - Available languages
   * @param {string} currentLanguage - Current language
   * @param {boolean} showText - Show text
   * @param {boolean} showIcon - Show icon
   * @returns {string} HTML
   */
  renderButtonStyle(classes, languages, currentLanguage, showText, showIcon) {
    const currentLang = languages.find(l => l.code === currentLanguage);
    const title = this.i18nService.t('language.toggle');

    return `
      <div class="${classes}">
        <button class="language-toggle-btn" title="${title}" aria-label="${title}">
          ${showIcon ? '<span class="language-icon">🌐</span>' : ''}
          ${showText ? `<span class="language-text">${currentLang?.code.toUpperCase() || currentLanguage.toUpperCase()}</span>` : ''}
        </button>
      </div>
    `;
  }

  /**
   * Render select style
   * @param {string} classes - CSS classes
   * @param {Array} languages - Available languages
   * @param {string} currentLanguage - Current language
   * @returns {string} HTML
   */
  renderSelectStyle(classes, languages, currentLanguage) {
    const title = this.i18nService.t('language.toggle');
    
    const options = languages.map(lang => 
      `<option value="${lang.code}" ${lang.code === currentLanguage ? 'selected' : ''}>
        ${lang.label}
      </option>`
    ).join('');

    return `
      <div class="${classes}">
        <select class="language-select" title="${title}" aria-label="${title}">
          ${options}
        </select>
      </div>
    `;
  }

  /**
   * Render dropdown style
   * @param {string} classes - CSS classes
   * @param {Array} languages - Available languages
   * @param {string} currentLanguage - Current language
   * @param {boolean} showText - Show text
   * @param {boolean} showIcon - Show icon
   * @param {boolean} showNativeName - Show native names
   * @returns {string} HTML
   */
  renderDropdownStyle(classes, languages, currentLanguage, showText, showIcon, showNativeName) {
    const currentLang = languages.find(l => l.code === currentLanguage);
    const title = this.i18nService.t('language.toggle');

    const options = languages
      .filter(lang => lang.code !== currentLanguage)
      .map(lang => `
        <button 
          class="language-option" 
          data-language="${lang.code}"
          title="${lang.label}"
          aria-label="${lang.label}"
        >
          <span class="language-code">${lang.code.toUpperCase()}</span>
          <span class="language-label">${lang.label}</span>
          ${showNativeName ? `<span class="language-native">${lang.nativeName}</span>` : ''}
        </button>
      `).join('');

    return `
      <div class="${classes}">
        <button class="language-toggle-btn" title="${title}" aria-label="${title}" aria-expanded="${this.isDropdownOpen}">
          ${showIcon ? '<span class="language-icon">🌐</span>' : ''}
          ${showText ? `<span class="language-text">${currentLang?.code.toUpperCase()}</span>` : ''}
          <span class="dropdown-arrow">▼</span>
        </button>
        <div class="language-dropdown ${this.isDropdownOpen ? 'open' : ''}" role="menu">
          ${options}
        </div>
      </div>
    `;
  }

  /**
   * Get component styles
   * @returns {string} CSS styles
   */
  async getStyles() {
    return `
      .language-toggle-component {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .language-toggle-btn,
      .language-option {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 0.5rem;
        background: var(--bg-secondary, #ffffff);
        color: var(--text-primary, #111827);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
      }

      .language-toggle-btn:hover,
      .language-option:hover {
        background: var(--bg-primary, #f9fafb);
        transform: scale(1.02);
      }

      .language-toggle-btn:active,
      .language-option:active {
        transform: scale(0.98);
      }

      .language-select {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 0.5rem;
        background: var(--bg-secondary, #ffffff);
        color: var(--text-primary, #111827);
        cursor: pointer;
        font-size: 0.875rem;
      }

      .language-icon {
        font-size: 1.1rem;
        line-height: 1;
      }

      .language-text,
      .language-code {
        font-weight: 600;
        letter-spacing: 0.025em;
      }

      .dropdown-arrow {
        font-size: 0.75rem;
        transition: transform 0.2s ease;
      }

      .dropdown-open .dropdown-arrow {
        transform: rotate(180deg);
      }

      /* Dropdown */
      .language-dropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        left: 0;
        min-width: 100%;
        background: var(--bg-secondary, #ffffff);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-0.5rem);
        transition: all 0.2s ease;
        z-index: 50;
        overflow: hidden;
      }

      .language-dropdown.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .language-option {
        width: 100%;
        border: none;
        border-radius: 0;
        padding: 0.75rem 1rem;
        text-align: left;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }

      .language-option:hover {
        background: var(--primary, #3b82f6);
        color: white;
        transform: none;
      }

      .language-option:not(:last-child) {
        border-bottom: 1px solid var(--border, #e5e7eb);
      }

      .language-label {
        font-size: 0.875rem;
        font-weight: 500;
      }

      .language-native {
        font-size: 0.75rem;
        opacity: 0.7;
      }

      /* Size variations */
      .language-toggle-small .language-toggle-btn,
      .language-toggle-small .language-option,
      .language-toggle-small .language-select {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }

      .language-toggle-large .language-toggle-btn,
      .language-toggle-large .language-option,
      .language-toggle-large .language-select {
        padding: 0.75rem 1rem;
        font-size: 1rem;
      }

      /* Orientation variations */
      .language-toggle-vertical {
        flex-direction: column;
      }

      .language-toggle-vertical .language-dropdown {
        top: 0;
        left: calc(100% + 0.5rem);
      }

      /* Accessibility */
      .language-toggle-btn:focus,
      .language-option:focus,
      .language-select:focus {
        outline: 2px solid var(--primary, #3b82f6);
        outline-offset: 2px;
      }

      /* Animation */
      .language-toggle-component.changing .language-icon {
        animation: languageRotate 0.3s ease;
      }

      @keyframes languageRotate {
        0% { transform: rotate(0deg); }
        50% { transform: rotate(180deg); }
        100% { transform: rotate(360deg); }
      }

      /* Mobile responsiveness */
      @media (max-width: 640px) {
        .language-dropdown {
          right: 0;
          left: auto;
          min-width: 150px;
        }
      }

      /* Dark theme adjustments */
      .theme-dark .language-dropdown {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
      }
    `;
  }

  /**
   * Handle toggle button click
   * @param {Event} event - Click event
   */
  async handleToggleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.componentConfig.style === 'dropdown') {
      this.toggleDropdown();
    } else {
      // Add animation class
      this.element.classList.add('changing');
      setTimeout(() => {
        this.element.classList.remove('changing');
      }, 300);

      try {
        await this.i18nService.toggleLanguage();
      } catch (error) {
        console.error('Language toggle error:', error);
      }
    }
  }

  /**
   * Handle select change
   * @param {Event} event - Change event
   */
  async handleSelectChange(event) {
    const language = event.target.value;
    
    try {
      await this.i18nService.setLanguage(language);
    } catch (error) {
      console.error('Language select error:', error);
    }
  }

  /**
   * Handle dropdown option click
   * @param {Event} event - Click event
   */
  async handleOptionClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const language = event.currentTarget.dataset.language;
    
    try {
      await this.i18nService.setLanguage(language);
      this.closeDropdown();
    } catch (error) {
      console.error('Language option error:', error);
    }
  }

  /**
   * Handle outside click to close dropdown
   * @param {Event} event - Click event
   */
  handleOutsideClick(event) {
    if (this.isDropdownOpen && !this.element.contains(event.target)) {
      this.closeDropdown();
    }
  }

  /**
   * Toggle dropdown visibility
   */
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.updateData();
  }

  /**
   * Close dropdown
   */
  closeDropdown() {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
      this.updateData();
    }
  }

  /**
   * Handle language change from service
   * @param {Object} data - Language change data
   */
  handleLanguageChange(data) {
    this.updateData();
    
    // Close dropdown if open
    this.closeDropdown();
    
    // Emit component event
    this.emit('language-toggle:changed', {
      component: this.name,
      language: data.language,
      previousLanguage: data.previousLanguage
    });
  }

  /**
   * Set language programmatically
   * @param {string} language - Language code
   * @returns {Promise} Set language promise
   */
  async setLanguage(language) {
    return this.i18nService.setLanguage(language);
  }

  /**
   * Get current language
   * @returns {string} Current language
   */
  getCurrentLanguage() {
    return this.i18nService.getCurrentLanguage();
  }

  /**
   * Get supported languages
   * @returns {Array} Supported languages
   */
  getSupportedLanguages() {
    return this.i18nService.getSupportedLanguages();
  }

  async onDestroy() {
    // Remove outside click listener
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
    
    await super.onDestroy();
  }
}

export default LanguageToggle;