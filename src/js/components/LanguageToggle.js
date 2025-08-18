/**
 * Language Toggle Component - Reusable language switching UI
 */
import BaseComponent from './BaseComponent.js';

class LanguageToggle extends BaseComponent {
  constructor(element, options = {}) {
    super('LanguageToggle', element, {
      dependencies: ['I18nService'],
      config: {},
      events: {
        'click .language-toggle-btn': 'handleToggleClick',
        'change .language-select': 'handleSelectChange',
        'click .language-option': 'handleOptionClick'
      },
      autoMount: true,
      reactive: true,
      // Component-specific configuration
      showText: options.showText !== false,
      showIcon: options.showIcon !== false,
      showNativeName: options.showNativeName || false,
      orientation: options.orientation || 'horizontal',
      size: options.size || 'medium',
      style: options.style || 'button'
    });

    this.i18nService = null;
    this.isDropdownOpen = false;
    
    // Store bound event handler references for proper cleanup
    this.boundHandleOutsideClick = null;
    this.boundHandleLanguageChange = null;
    this.outsideClickListenerActive = false;
  }

  async onInitialize() {
    console.log('[LanguageToggle] Starting initialization...');
    
    try {
      // Attempt to resolve service with detailed logging
      try {
        this.i18nService = this.service('I18nService');
        console.log('[LanguageToggle] I18nService resolved:', !!this.i18nService);
      } catch (serviceError) {
        console.warn('[LanguageToggle] Failed to resolve I18nService:', serviceError);
        this.i18nService = null;
      }

      // Listen for language changes with null checks - store bound reference
      if (this.i18nService && typeof this.i18nService.addLanguageChangeListener === 'function') {
        if (!this.boundHandleLanguageChange) {
          this.boundHandleLanguageChange = this.handleLanguageChange.bind(this);
        }
        this.i18nService.addLanguageChangeListener(this.boundHandleLanguageChange);
        console.log('[LanguageToggle] Language change listener added');
      } else {
        console.warn('[LanguageToggle] I18nService not ready for event listeners');
      }

      // Initialize data with error handling
      console.log('[LanguageToggle] Updating component data...');
      this.updateData();

      // Close dropdown on outside click - use BaseComponent helper for tracking
      if (!this.outsideClickListenerActive) {
        this.boundHandleOutsideClick = this.handleOutsideClick.bind(this);
        document.addEventListener('click', this.boundHandleOutsideClick);
        this.registerExternalListener(document, 'click', this.boundHandleOutsideClick, 'document.outsideClick');
        this.outsideClickListenerActive = true;
        console.log('[LanguageToggle] Outside click listener added');
      }
    } catch (error) {
      console.error('[LanguageToggle] Error during initialization:', error);
      // Set fallback data for basic functionality
      this.setFallbackData();
    }

    console.log('[LanguageToggle] Calling super.onInitialize()...');
    await super.onInitialize();
    console.log('[LanguageToggle] Initialization complete');
  }

  /**
   * Update component data from service
   */
  updateData() {
    console.log('[LanguageToggle] updateData called');
    try {
      // Check if I18nService is available and has required methods
      if (!this.i18nService || !this.isI18nServiceReady()) {
        console.warn('[LanguageToggle] I18nService not ready, using fallback data');
        console.log('[LanguageToggle] I18nService state:', {
          exists: !!this.i18nService,
          ready: this.i18nService ? this.isI18nServiceReady() : false
        });
        this.setFallbackData();
        return;
      }

      // Test direct service calls with detailed logging
      console.log('[LanguageToggle] 🧪 Testing getCurrentLanguage...');
      const currentLanguage = this.i18nService.getCurrentLanguage();
      console.log('[LanguageToggle] 🎯 getCurrentLanguage result:', { 
        type: typeof currentLanguage, 
        value: currentLanguage, 
        stringLength: currentLanguage?.length 
      });
      
      console.log('[LanguageToggle] 🧪 Testing getSupportedLanguages...');
      const supportedLanguages = this.i18nService.getSupportedLanguages();
      console.log('[LanguageToggle] 🎯 getSupportedLanguages result:', { 
        type: typeof supportedLanguages, 
        isArray: Array.isArray(supportedLanguages),
        length: supportedLanguages?.length,
        content: supportedLanguages 
      });

      console.log('[LanguageToggle] Service response:', { currentLanguage, supportedLanguages });

      // Validate service responses
      if (!currentLanguage || !Array.isArray(supportedLanguages) || supportedLanguages.length === 0) {
        console.warn('[LanguageToggle] Invalid service response, using fallback data');
        this.setFallbackData();
        return;
      }

      const languagesData = supportedLanguages.map(lang => ({
        code: lang,
        label: this.getLanguageDisplayNameSafe(lang),
        nativeName: this.getLanguageNativeNameSafe(lang),
        active: lang === currentLanguage
      }));

      console.log('[LanguageToggle] Setting component data:', { currentLanguage, supportedLanguages, languagesData });

      this.setData({
        currentLanguage,
        supportedLanguages,
        isDropdownOpen: this.isDropdownOpen,
        languages: languagesData
      });
    } catch (error) {
      console.error('[LanguageToggle] Error updating data:', error);
      this.setFallbackData();
    }
  }

  /**
   * Check if I18nService has all required methods
   */
  isI18nServiceReady() {
    const requiredMethods = ['getCurrentLanguage', 'getSupportedLanguages', 'getLanguageDisplayName'];
    return requiredMethods.every(method => typeof this.i18nService[method] === 'function');
  }

  /**
   * Get language display name with fallback
   */
  getLanguageDisplayNameSafe(lang) {
    try {
      return this.i18nService.getLanguageDisplayName(lang);
    } catch (error) {
      return this.getDefaultLanguageDisplayName(lang);
    }
  }

  /**
   * Get language native name with fallback
   */
  getLanguageNativeNameSafe(lang) {
    try {
      if (typeof this.i18nService.getLanguageNativeName === 'function') {
        return this.i18nService.getLanguageNativeName(lang);
      }
    } catch (error) {
      // Fallback to display name
    }
    return this.getDefaultLanguageDisplayName(lang);
  }

  /**
   * Set fallback data when services are unavailable
   */
  setFallbackData() {
    const fallbackLanguages = ['es', 'en'];
    const fallbackCurrentLanguage = 'es';

    this.setData({
      currentLanguage: fallbackCurrentLanguage,
      supportedLanguages: fallbackLanguages,
      isDropdownOpen: this.isDropdownOpen,
      languages: fallbackLanguages.map(lang => ({
        code: lang,
        label: this.getDefaultLanguageDisplayName(lang),
        nativeName: this.getDefaultLanguageDisplayName(lang),
        active: lang === fallbackCurrentLanguage
      }))
    });
  }

  /**
   * Get default language display name
   */
  getDefaultLanguageDisplayName(lang) {
    const defaultNames = {
      es: 'Español',
      en: 'English'
    };
    return defaultNames[lang] || lang.toUpperCase();
  }

  /**
   * Get translation with fallback
   */
  getTranslationSafe(key, fallback) {
    try {
      if (this.i18nService && typeof this.i18nService.t === 'function') {
        return this.i18nService.t(key) || fallback;
      }
    } catch (error) {
      console.warn('[LanguageToggle] Translation error for key:', key, error);
    }
    return fallback;
  }

  /**
   * Generate component template with fallback support
   * @returns {string} HTML template
   */
  defaultTemplate() {
    const { style, showText, showIcon, showNativeName, orientation, size } = this.componentConfig;
    const { languages = [], currentLanguage = 'es', isDropdownOpen = false } = this.data || {};

    // Enhanced debugging for render state
    console.log('[LanguageToggle] Rendering template:', {
      hasLanguages: languages && languages.length > 0,
      currentLanguage,
      showIcon,
      showText,
      serviceReady: this.i18nService && this.isI18nServiceReady(),
      componentConfig: this.componentConfig
    });

    // If no languages data, use clean fallback
    if (!languages || languages.length === 0) {
      console.log('[LanguageToggle] 🚨 Using fallback template - NO LANGUAGES DATA');
      
      return `
        <div class="language-toggle-component language-toggle-fallback">
          <button class="language-toggle-btn" title="Language Toggle" aria-label="Language Toggle">
            <span class="language-icon">🌐</span>
            <span class="language-text">ES</span>
          </button>
        </div>
      `;
    }

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
    // Ensure we have valid data
    const safeLanguages = Array.isArray(languages) ? languages : [];
    const safeCurrentLanguage = currentLanguage || 'es';
    
    // Add proper defaults for showText and showIcon
    const shouldShowIcon = showIcon !== false; // Default to true unless explicitly false
    const shouldShowText = showText !== false; // Default to true unless explicitly false
    
    const currentLang = safeLanguages.find(l => l.code === safeCurrentLanguage) || { 
      code: safeCurrentLanguage, 
      label: this.getDefaultLanguageDisplayName(safeCurrentLanguage) 
    };
    
    const title = this.getTranslationSafe('language.toggle', 'Toggle language');

    return `
      <div class="${classes}">
        <button class="language-toggle-btn" title="${title}" aria-label="${title}">
          ${shouldShowIcon ? '<span class="language-icon">🌐</span>' : ''}
          ${shouldShowText ? `<span class="language-text">${currentLang?.code.toUpperCase() || safeCurrentLanguage.toUpperCase()}</span>` : ''}
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
    const safeLanguages = Array.isArray(languages) ? languages : [];
    const safeCurrentLanguage = currentLanguage || 'es';
    const title = this.getTranslationSafe('language.toggle', 'Toggle language');
    
    const options = safeLanguages.map(lang => 
      `<option value="${lang.code || lang}" ${(lang.code || lang) === safeCurrentLanguage ? 'selected' : ''}>
        ${lang.label || this.getDefaultLanguageDisplayName(lang.code || lang)}
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
    const safeLanguages = Array.isArray(languages) ? languages : [];
    const safeCurrentLanguage = currentLanguage || 'es';
    
    // Add proper defaults for showText, showIcon, and showNativeName
    const shouldShowIcon = showIcon !== false; // Default to true unless explicitly false
    const shouldShowText = showText !== false; // Default to true unless explicitly false
    const shouldShowNativeName = showNativeName === true; // Default to false unless explicitly true
    
    const currentLang = safeLanguages.find(l => l.code === safeCurrentLanguage) || {
      code: safeCurrentLanguage,
      label: this.getDefaultLanguageDisplayName(safeCurrentLanguage)
    };
    
    const title = this.getTranslationSafe('language.toggle', 'Toggle language');

    const options = safeLanguages
      .filter(lang => (lang.code || lang) !== safeCurrentLanguage)
      .map(lang => {
        const langCode = lang.code || lang;
        const langLabel = lang.label || this.getDefaultLanguageDisplayName(langCode);
        const langNative = lang.nativeName || langLabel;
        
        return `
          <button 
            class="language-option" 
            data-language="${langCode}"
            title="${langLabel}"
            aria-label="${langLabel}"
          >
            <span class="language-code">${langCode.toUpperCase()}</span>
            <span class="language-label">${langLabel}</span>
            ${shouldShowNativeName ? `<span class="language-native">${langNative}</span>` : ''}
          </button>
        `;
      }).join('');

    return `
      <div class="${classes}">
        <button class="language-toggle-btn" title="${title}" aria-label="${title}" aria-expanded="${this.isDropdownOpen}">
          ${shouldShowIcon ? '<span class="language-icon">🌐</span>' : ''}
          ${shouldShowText ? `<span class="language-text">${currentLang?.code.toUpperCase()}</span>` : ''}
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
      // Validate service state before proceeding
      if (!this.i18nService) {
        console.error('[LanguageToggle] I18nService not available');
        return;
      }
      
      if (this.i18nService.state !== 'initialized') {
        console.warn('[LanguageToggle] I18nService not initialized, state:', this.i18nService.state);
        return;
      }
      
      // Add animation class
      this.element.classList.add('changing');
      setTimeout(() => {
        this.element.classList.remove('changing');
      }, 300);

      try {
        await this.i18nService.toggleLanguage();
        console.log('[LanguageToggle] Language toggled successfully');
      } catch (error) {
        console.error('[LanguageToggle] Language toggle error:', error);
        // Optionally show user feedback
        this.showErrorFeedback('Failed to change language');
      }
    }
  }

  /**
   * Show error feedback to user
   * @param {string} message - Error message
   */
  showErrorFeedback(message) {
    console.warn('[LanguageToggle]', message);
    // Could emit an event for app-wide error handling
    this.emit('language-toggle:error', { message });
  }

  /**
   * Handle select change
   * @param {Event} event - Change event
   */
  async handleSelectChange(event) {
    const language = event.target.value;
    
    // Validate service state
    if (!this.i18nService || this.i18nService.state !== 'initialized') {
      console.warn('[LanguageToggle] I18nService not ready for select change');
      return;
    }
    
    try {
      await this.i18nService.setLanguage(language);
    } catch (error) {
      console.error('[LanguageToggle] Language select error:', error);
      this.showErrorFeedback('Failed to change language');
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
    
    // Validate service state
    if (!this.i18nService || this.i18nService.state !== 'initialized') {
      console.warn('[LanguageToggle] I18nService not ready for option click');
      return;
    }
    
    try {
      await this.i18nService.setLanguage(language);
      this.closeDropdown();
    } catch (error) {
      console.error('[LanguageToggle] Language option error:', error);
      this.showErrorFeedback('Failed to change language');
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
    console.log('[LanguageToggle] Starting destruction and cleanup...');
    
    // Remove language change listener using stored bound reference
    if (this.i18nService && this.boundHandleLanguageChange && 
        typeof this.i18nService.removeLanguageChangeListener === 'function') {
      try {
        this.i18nService.removeLanguageChangeListener(this.boundHandleLanguageChange);
        console.log('[LanguageToggle] Language change listener removed');
      } catch (error) {
        console.warn('[LanguageToggle] Failed to remove language change listener:', error);
      }
    }
    
    // Clear bound references
    this.boundHandleOutsideClick = null;
    this.boundHandleLanguageChange = null;
    this.outsideClickListenerActive = false;
    
    // BaseComponent.onDestroy() will handle the document click listener cleanup
    await super.onDestroy();
    console.log('[LanguageToggle] Destruction complete');
  }
}

export default LanguageToggle;