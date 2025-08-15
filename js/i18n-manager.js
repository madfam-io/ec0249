// Internationalization Manager for EC0249 Educational Platform
class I18nManager {
  constructor() {
    this.currentLanguage = 'es';
    this.translations = {};
    this.fallbackLanguage = 'es';
    this.supportedLanguages = ['es', 'en'];
    this.loadedLanguages = new Set();
  }

  async init() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('ec0249_language');
    if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else {
      // Detect browser language
      const browserLang = navigator.language.slice(0, 2);
      if (this.supportedLanguages.includes(browserLang)) {
        this.currentLanguage = browserLang;
      }
    }

    // Load initial language
    await this.loadLanguage(this.currentLanguage);
    
    // Preload fallback language if different
    if (this.currentLanguage !== this.fallbackLanguage) {
      await this.loadLanguage(this.fallbackLanguage);
    }

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLanguage;
  }

  async loadLanguage(language) {
    if (this.loadedLanguages.has(language)) {
      return;
    }

    try {
      const response = await fetch(`./js/translations/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${language} translations`);
      }
      
      const translations = await response.json();
      this.translations[language] = translations;
      this.loadedLanguages.add(language);
    } catch (error) {
      console.error(`Error loading translations for ${language}:`, error);
      
      // If loading fails and it's not the fallback, try to load fallback
      if (language !== this.fallbackLanguage && !this.loadedLanguages.has(this.fallbackLanguage)) {
        await this.loadLanguage(this.fallbackLanguage);
      }
    }
  }

  async changeLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.error(`Unsupported language: ${language}`);
      return false;
    }

    // Load language if not already loaded
    if (!this.loadedLanguages.has(language)) {
      await this.loadLanguage(language);
    }

    this.currentLanguage = language;
    localStorage.setItem('ec0249_language', language);
    document.documentElement.lang = language;

    // Trigger language change event
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language }
    }));

    return true;
  }

  t(key, variables = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];

    // Navigate through the nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to default language
        value = this.translations[this.fallbackLanguage];
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            // Return key if translation not found
            console.warn(`Translation not found for key: ${key}`);
            return key;
          }
        }
        break;
      }
    }

    // If value is not a string, return the key
    if (typeof value !== 'string') {
      console.warn(`Translation for key "${key}" is not a string`);
      return key;
    }

    // Replace variables in the translation
    return this.interpolate(value, variables);
  }

  interpolate(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getSupportedLanguages() {
    return [...this.supportedLanguages];
  }

  isLanguageLoaded(language) {
    return this.loadedLanguages.has(language);
  }

  // Helper method to translate DOM elements with data-i18n attribute
  translateDOM() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Check if element has data-i18n-attr to translate attributes
      const attrKey = element.getAttribute('data-i18n-attr');
      if (attrKey) {
        element.setAttribute(attrKey, translation);
      } else {
        // Translate text content
        element.textContent = translation;
      }
    });
  }

  // Helper method to translate placeholder text
  translatePlaceholders() {
    const elements = document.querySelectorAll('[data-i18n-placeholder]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      element.placeholder = translation;
    });
  }

  // Helper method to translate titles and tooltips
  translateTitles() {
    const elements = document.querySelectorAll('[data-i18n-title]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.t(key);
      element.title = translation;
    });
  }

  // Complete DOM translation
  translatePage() {
    this.translateDOM();
    this.translatePlaceholders();
    this.translateTitles();
  }

  // Get language display name
  getLanguageDisplayName(language) {
    const displayNames = {
      'es': this.t('language.spanish'),
      'en': this.t('language.english')
    };
    return displayNames[language] || language;
  }

  // Toggle between supported languages
  toggleLanguage() {
    const currentIndex = this.supportedLanguages.indexOf(this.currentLanguage);
    const nextIndex = (currentIndex + 1) % this.supportedLanguages.length;
    const nextLanguage = this.supportedLanguages[nextIndex];
    
    return this.changeLanguage(nextLanguage);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18nManager;
}