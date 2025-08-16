/**
 * I18n Service - Modular internationalization service
 * Handles translations, language switching, and localization
 */
import Module from '../core/Module.js';

class I18nService extends Module {
  constructor() {
    super('I18nService', ['StorageService', 'EventBus'], {
      defaultLanguage: 'es',
      fallbackLanguage: 'es',
      supportedLanguages: ['es', 'en'],
      storageKey: 'ec0249_language',
      translationsPath: '/translations/',
      autoDetectLanguage: true,
      interpolationPattern: /\{\{(\w+)\}\}/g
    });

    this.currentLanguage = this.getConfig('defaultLanguage');
    this.translations = new Map();
    this.loadedLanguages = new Set();
    this.loadingPromises = new Map();
    this.changeListeners = new Set();
    this.isReady = false;
    this.readyPromise = null;
  }

  async onInitialize() {
    this.storage = this.service('StorageService');
    
    // Load saved language or detect from browser
    await this.initializeLanguage();
    
    try {
      // Load initial translations
      console.log(`[I18nService] Loading primary language: ${this.currentLanguage}`);
      await this.loadLanguage(this.currentLanguage);
      console.log(`[I18nService] Successfully loaded primary language: ${this.currentLanguage}`);
      this.isReady = true;
    } catch (error) {
      console.error(`[I18nService] Failed to load primary language ${this.currentLanguage}:`, error);
      console.warn(`[I18nService] Using fallback translations for ${this.currentLanguage}`);
      // Set some basic fallback translations
      this.translations.set(this.currentLanguage, {
        app: { title: 'EC0249 Educational Platform' },
        navigation: { dashboard: 'Dashboard', modules: 'Modules', assessment: 'Assessment', portfolio: 'Portfolio' },
        dashboard: { welcome: 'Welcome', subtitle: 'Educational Platform' },
        theme: { auto: 'Auto', light: 'Light', dark: 'Dark' },
        common: { underConstruction: 'Under Construction', comingSoon: 'Coming Soon' }
      });
      this.loadedLanguages.add(this.currentLanguage);
      this.isReady = true;
    }
    
    // Preload fallback if different
    if (this.currentLanguage !== this.getConfig('fallbackLanguage')) {
      try {
        await this.loadLanguage(this.getConfig('fallbackLanguage'));
      } catch (error) {
        console.warn(`[I18nService] Could not preload fallback language:`, error);
      }
    }

    // Subscribe to language events
    this.subscribe('language:change', this.handleLanguageChange.bind(this));
    this.subscribe('language:toggle', this.toggleLanguage.bind(this));
    this.subscribe('language:set', this.setLanguage.bind(this));

    // Update DOM lang attribute
    this.updateDocumentLanguage();
  }

  /**
   * Initialize language from storage or detection
   */
  async initializeLanguage() {
    try {
      // Try to load from storage first
      const savedLanguage = await this.storage.get(this.getConfig('storageKey'));
      if (savedLanguage && this.isSupportedLanguage(savedLanguage)) {
        this.currentLanguage = savedLanguage;
        return;
      }
    } catch (error) {
      console.warn('Failed to load language from storage:', error);
    }

    // Auto-detect from browser if enabled
    if (this.getConfig('autoDetectLanguage')) {
      const detectedLanguage = this.detectBrowserLanguage();
      if (detectedLanguage) {
        this.currentLanguage = detectedLanguage;
      }
    }
  }

  /**
   * Detect browser language
   * @returns {string|null} Detected language or null
   */
  detectBrowserLanguage() {
    const browserLanguages = [
      navigator.language,
      ...navigator.languages
    ].map(lang => lang.slice(0, 2));

    return browserLanguages.find(lang => 
      this.isSupportedLanguage(lang)
    ) || null;
  }

  /**
   * Check if language is supported
   * @param {string} language - Language code
   * @returns {boolean} Support status
   */
  isSupportedLanguage(language) {
    return this.getConfig('supportedLanguages').includes(language);
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   * @returns {Array} Supported language codes
   */
  getSupportedLanguages() {
    return [...this.getConfig('supportedLanguages')];
  }

  /**
   * Set language
   * @param {string} language - Language code
   * @returns {Promise} Set language promise
   */
  async setLanguage(language) {
    if (!this.isSupportedLanguage(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }

    if (this.currentLanguage === language) {
      return;
    }

    const previousLanguage = this.currentLanguage;
    
    // Load translations if not already loaded
    await this.loadLanguage(language);

    this.currentLanguage = language;

    // Update document language
    this.updateDocumentLanguage();

    // Save to storage
    try {
      await this.storage.set(this.getConfig('storageKey'), language);
    } catch (error) {
      console.warn('Failed to save language to storage:', error);
    }

    // Notify listeners
    this.notifyLanguageChange(previousLanguage);

    // Translate page immediately after language change
    this.translatePage();

    // Emit event
    this.emit('language:changed', {
      language: this.currentLanguage,
      previousLanguage
    });
  }

  /**
   * Toggle between supported languages
   * @returns {Promise} Toggle promise
   */
  async toggleLanguage() {
    const languages = this.getSupportedLanguages();
    const currentIndex = languages.indexOf(this.currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLanguage = languages[nextIndex];

    await this.setLanguage(nextLanguage);
  }

  /**
   * Load language translations
   * @param {string} language - Language code
   * @returns {Promise} Load promise
   */
  async loadLanguage(language) {
    if (this.loadedLanguages.has(language)) {
      return;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(language)) {
      return this.loadingPromises.get(language);
    }

    const loadPromise = this.fetchTranslations(language);
    this.loadingPromises.set(language, loadPromise);

    try {
      const translations = await loadPromise;
      this.translations.set(language, translations);
      this.loadedLanguages.add(language);
      
      console.log(`[I18nService] Loaded translations for: ${language}`);
    } catch (error) {
      console.error(`[I18nService] Failed to load translations for ${language}:`, error);
      throw error;
    } finally {
      this.loadingPromises.delete(language);
    }
  }

  /**
   * Fetch translations from file
   * @param {string} language - Language code
   * @returns {Promise<Object>} Translations object
   */
  async fetchTranslations(language) {
    const path = `${this.getConfig('translationsPath')}${language}.json`;
    
    console.log(`[I18nService] Attempting to fetch translations from: ${path}`);
    
    try {
      const response = await fetch(path);
      console.log(`[I18nService] Fetch response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const translations = await response.json();
      console.log(`[I18nService] Successfully loaded ${Object.keys(translations).length} translation sections`);
      return translations;
    } catch (error) {
      console.error(`[I18nService] Failed to fetch translations from ${path}:`, error);
      throw new Error(`Failed to fetch translations from ${path}: ${error.message}`);
    }
  }

  /**
   * Translate a key
   * @param {string} key - Translation key (dot notation)
   * @param {Object} variables - Interpolation variables
   * @param {string} language - Language code (optional)
   * @returns {string} Translated text
   */
  t(key, variables = {}, language = null) {
    const lang = language || this.currentLanguage;
    let value = this.getTranslation(key, lang);

    // Fallback to default language
    if (value === null && lang !== this.getConfig('fallbackLanguage')) {
      value = this.getTranslation(key, this.getConfig('fallbackLanguage'));
    }

    // Return key if no translation found, but don't log as error during initialization
    if (value === null) {
      if (this.loadedLanguages.has(lang)) {
        console.warn(`[I18nService] Translation not found for key: ${key}`);
      }
      return key;
    }

    // Interpolate variables
    return this.interpolate(value, variables);
  }

  /**
   * Get raw translation value
   * @param {string} key - Translation key
   * @param {string} language - Language code
   * @returns {*} Translation value or null
   */
  getTranslation(key, language) {
    const translations = this.translations.get(language);
    if (!translations) {
      return null;
    }

    return this.getNestedValue(translations, key);
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to traverse
   * @param {string} path - Dot notation path
   * @returns {*} Value or null
   */
  getNestedValue(obj, path) {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * Interpolate variables in translation
   * @param {string} template - Translation template
   * @param {Object} variables - Variables to interpolate
   * @returns {string} Interpolated string
   */
  interpolate(template, variables) {
    if (typeof template !== 'string') {
      return template;
    }

    return template.replace(this.getConfig('interpolationPattern'), (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  /**
   * Translate DOM elements with data-i18n attributes
   */
  translateDOM() {
    if (!this.isReady) {
      console.warn('[I18nService] translateDOM called before service is ready');
      return;
    }
    
    const elements = document.querySelectorAll('[data-i18n]');
    console.log(`[I18nService] Translating ${elements.length} DOM elements`);
    
    let translated = 0;
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Only update if we have a real translation (not just the key)
      if (translation !== key) {
        const attrKey = element.getAttribute('data-i18n-attr');
        if (attrKey) {
          element.setAttribute(attrKey, translation);
        } else {
          element.textContent = translation;
        }
        translated++;
      }
    });
    
    console.log(`[I18nService] Successfully translated ${translated}/${elements.length} elements`);
  }

  /**
   * Translate placeholders
   */
  translatePlaceholders() {
    const elements = document.querySelectorAll('[data-i18n-placeholder]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });
  }

  /**
   * Translate titles and tooltips
   */
  translateTitles() {
    const elements = document.querySelectorAll('[data-i18n-title]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });
  }

  /**
   * Translate entire page
   */
  translatePage() {
    if (!this.isReady) {
      console.warn('[I18nService] translatePage called before service is ready');
      return;
    }
    
    console.log('[I18nService] Translating entire page');
    this.translateDOM();
    this.translatePlaceholders();
    this.translateTitles();
    console.log('[I18nService] Page translation complete');
  }

  /**
   * Update document language attribute
   */
  updateDocumentLanguage() {
    document.documentElement.lang = this.currentLanguage;
  }

  /**
   * Add language change listener
   * @param {Function} listener - Listener function
   * @returns {Function} Remove listener function
   */
  addLanguageChangeListener(listener) {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  /**
   * Notify language change listeners
   * @param {string} previousLanguage - Previous language
   */
  notifyLanguageChange(previousLanguage) {
    const data = {
      language: this.currentLanguage,
      previousLanguage,
      supportedLanguages: this.getSupportedLanguages()
    };

    this.changeListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Language change listener error:', error);
      }
    });
  }

  /**
   * Handle language change event
   * @param {Object} data - Event data
   */
  async handleLanguageChange(data) {
    if (data.language) {
      await this.setLanguage(data.language);
    }
  }

  /**
   * Get language display name
   * @param {string} language - Language code
   * @returns {string} Display name
   */
  getLanguageDisplayName(language) {
    return this.t(`language.${language}`, {}, language) || language.toUpperCase();
  }

  /**
   * Get language native name
   * @param {string} language - Language code
   * @returns {string} Native name
   */
  getLanguageNativeName(language) {
    const nativeNames = {
      es: 'Español',
      en: 'English',
      fr: 'Français',
      de: 'Deutsch',
      it: 'Italiano',
      pt: 'Português'
    };

    return nativeNames[language] || language.toUpperCase();
  }

  /**
   * Format number according to locale
   * @param {number} number - Number to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted number
   */
  formatNumber(number, options = {}) {
    try {
      return new Intl.NumberFormat(this.currentLanguage, options).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Format date according to locale
   * @param {Date} date - Date to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date
   */
  formatDate(date, options = {}) {
    try {
      return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
    } catch (error) {
      return date.toString();
    }
  }

  /**
   * Get language state for persistence
   * @returns {Object} Language state
   */
  getState() {
    return {
      currentLanguage: this.currentLanguage,
      supportedLanguages: this.getSupportedLanguages(),
      loadedLanguages: Array.from(this.loadedLanguages)
    };
  }

  async onDestroy() {
    // Clear listeners
    this.changeListeners.clear();
    
    // Clear translations
    this.translations.clear();
    this.loadedLanguages.clear();
    this.loadingPromises.clear();
  }
}

export default I18nService;