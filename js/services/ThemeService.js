/**
 * Theme Service - Modular theme management
 * Handles theme switching, persistence, and system integration
 */
import Module from '../core/Module.js';

class ThemeService extends Module {
  constructor() {
    super('ThemeService', ['StorageService', 'EventBus'], {
      themes: ['auto', 'light', 'dark'],
      defaultTheme: 'auto',
      storageKey: 'ec0249_theme',
      cssAttribute: 'data-theme',
      transitions: true,
      systemPreferenceSupport: true
    });

    this.currentTheme = this.getConfig('defaultTheme');
    this.systemPreference = null;
    this.mediaQuery = null;
    this.themeChangeListeners = new Set();
  }

  async onInitialize() {
    this.storage = this.service('StorageService');
    
    // Load saved theme
    await this.loadTheme();
    
    // Setup system preference detection
    this.setupSystemPreferenceDetection();
    
    // Apply initial theme
    this.applyTheme();
    
    // Subscribe to theme-related events
    this.subscribe('theme:change', this.handleThemeChange.bind(this));
    this.subscribe('theme:toggle', this.toggleTheme.bind(this));
    this.subscribe('theme:set', this.setTheme.bind(this));
  }

  /**
   * Load theme from storage
   */
  async loadTheme() {
    try {
      const savedTheme = await this.storage.get(this.getConfig('storageKey'));
      if (savedTheme && this.isValidTheme(savedTheme)) {
        this.currentTheme = savedTheme;
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }

  /**
   * Setup system preference detection
   */
  setupSystemPreferenceDetection() {
    if (!this.getConfig('systemPreferenceSupport') || !window.matchMedia) {
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemPreference = this.mediaQuery.matches ? 'dark' : 'light';

    // Listen for system preference changes
    const handleChange = (e) => {
      this.systemPreference = e.matches ? 'dark' : 'light';
      if (this.currentTheme === 'auto') {
        this.applyTheme();
        this.notifyThemeChange();
      }
    };

    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      this.mediaQuery.addListener(handleChange);
    }
  }

  /**
   * Get current effective theme
   * @returns {string} Effective theme name
   */
  getEffectiveTheme() {
    if (this.currentTheme === 'auto') {
      return this.systemPreference || 'light';
    }
    return this.currentTheme;
  }

  /**
   * Get current theme setting
   * @returns {string} Current theme setting
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get all available themes
   * @returns {Array} Available themes
   */
  getAvailableThemes() {
    return [...this.getConfig('themes')];
  }

  /**
   * Check if theme is valid
   * @param {string} theme - Theme name
   * @returns {boolean} Validity
   */
  isValidTheme(theme) {
    return this.getConfig('themes').includes(theme);
  }

  /**
   * Set theme
   * @param {string} theme - Theme name
   * @returns {Promise} Set theme promise
   */
  async setTheme(theme) {
    if (!this.isValidTheme(theme)) {
      throw new Error(`Invalid theme: ${theme}`);
    }

    if (this.currentTheme === theme) {
      return;
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = theme;

    // Apply theme
    this.applyTheme();

    // Save to storage
    try {
      await this.storage.set(this.getConfig('storageKey'), theme);
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }

    // Notify listeners
    this.notifyThemeChange(previousTheme);

    // Emit event
    this.emit('theme:changed', {
      theme: this.currentTheme,
      previousTheme,
      effectiveTheme: this.getEffectiveTheme()
    });
  }

  /**
   * Toggle theme
   * @returns {Promise} Toggle theme promise
   */
  async toggleTheme() {
    const themes = this.getConfig('themes');
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    await this.setTheme(nextTheme);
  }

  /**
   * Apply theme to DOM
   */
  applyTheme() {
    const effectiveTheme = this.getEffectiveTheme();
    const attribute = this.getConfig('cssAttribute');

    // Apply to document element
    document.documentElement.setAttribute(attribute, this.currentTheme);

    // Add effective theme class for CSS targeting
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.documentElement.classList.add(`theme-${effectiveTheme}`);

    // Handle transitions
    if (this.getConfig('transitions')) {
      this.handleThemeTransition();
    }
  }

  /**
   * Handle theme transition animations
   */
  handleThemeTransition() {
    const transitionClass = 'theme-transitioning';
    document.documentElement.classList.add(transitionClass);

    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove(transitionClass);
    }, 300);
  }

  /**
   * Add theme change listener
   * @param {Function} listener - Listener function
   * @returns {Function} Remove listener function
   */
  addThemeChangeListener(listener) {
    this.themeChangeListeners.add(listener);
    return () => this.themeChangeListeners.delete(listener);
  }

  /**
   * Notify theme change listeners
   * @param {string} previousTheme - Previous theme
   */
  notifyThemeChange(previousTheme = null) {
    const data = {
      theme: this.currentTheme,
      previousTheme,
      effectiveTheme: this.getEffectiveTheme(),
      systemPreference: this.systemPreference
    };

    this.themeChangeListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Theme change listener error:', error);
      }
    });
  }

  /**
   * Handle theme change event
   * @param {Object} data - Event data
   */
  async handleThemeChange(data) {
    if (data.theme) {
      await this.setTheme(data.theme);
    }
  }

  /**
   * Get theme display name
   * @param {string} theme - Theme name
   * @returns {string} Display name
   */
  getThemeDisplayName(theme) {
    const i18n = this.container.has('I18nService') ? this.service('I18nService') : null;
    
    if (i18n) {
      return i18n.t(`theme.${theme}`, theme);
    }

    // Fallback display names
    const displayNames = {
      auto: 'Auto',
      light: 'Light',
      dark: 'Dark'
    };

    return displayNames[theme] || theme;
  }

  /**
   * Get theme icon
   * @param {string} theme - Theme name
   * @returns {string} Theme icon
   */
  getThemeIcon(theme) {
    const icons = {
      auto: '🔄',
      light: '☀️',
      dark: '🌙'
    };

    return icons[theme] || '🎨';
  }

  /**
   * Create theme CSS variables
   * @param {string} theme - Theme name
   * @returns {Object} CSS variables
   */
  getThemeVariables(theme = null) {
    const effectiveTheme = theme || this.getEffectiveTheme();
    
    // Base theme variables - can be extended/overridden
    const variables = {
      light: {
        '--bg-primary': '#f9fafb',
        '--bg-secondary': '#ffffff',
        '--text-primary': '#111827',
        '--text-secondary': '#6b7280',
        '--border': '#e5e7eb',
        '--primary': '#3b82f6',
        '--primary-hover': '#2563eb'
      },
      dark: {
        '--bg-primary': '#111827',
        '--bg-secondary': '#1f2937',
        '--text-primary': '#f9fafb',
        '--text-secondary': '#9ca3af',
        '--border': '#374151',
        '--primary': '#60a5fa',
        '--primary-hover': '#3b82f6'
      }
    };

    return variables[effectiveTheme] || variables.light;
  }

  /**
   * Apply custom theme variables
   * @param {Object} variables - CSS variables
   */
  applyThemeVariables(variables) {
    const root = document.documentElement;
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  /**
   * Reset theme to default
   * @returns {Promise} Reset promise
   */
  async resetTheme() {
    await this.setTheme(this.getConfig('defaultTheme'));
  }

  /**
   * Get theme state for persistence
   * @returns {Object} Theme state
   */
  getState() {
    return {
      currentTheme: this.currentTheme,
      effectiveTheme: this.getEffectiveTheme(),
      systemPreference: this.systemPreference,
      availableThemes: this.getAvailableThemes()
    };
  }

  async onDestroy() {
    // Clean up media query listener
    if (this.mediaQuery) {
      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener('change', this.handleSystemPreferenceChange);
      } else {
        this.mediaQuery.removeListener(this.handleSystemPreferenceChange);
      }
    }

    // Clear listeners
    this.themeChangeListeners.clear();
  }
}

export default ThemeService;