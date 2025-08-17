/**
 * Theme Toggle Component - Reusable theme switching UI
 */
import BaseComponent from './BaseComponent.js';

class ThemeToggle extends BaseComponent {
  constructor(element, options = {}) {
    super('ThemeToggle', element, {
      dependencies: ['ThemeService', 'I18nService'],
      config: {
        showText: options.showText !== false,
        showIcon: options.showIcon !== false,
        orientation: options.orientation || 'horizontal', // horizontal, vertical
        size: options.size || 'medium', // small, medium, large
        style: options.style || 'button' // button, select, tabs
      },
      events: {
        'click .theme-toggle-btn': 'handleToggleClick',
        'change .theme-select': 'handleSelectChange'
      },
      autoMount: true,
      reactive: true
    });

    this.themeService = null;
    this.i18nService = null;
  }

  async onInitialize() {
    console.log('[ThemeToggle] Starting initialization...');
    
    try {
      // Attempt to resolve services with detailed logging
      try {
        this.themeService = this.service('ThemeService');
        console.log('[ThemeToggle] ThemeService resolved:', !!this.themeService);
      } catch (serviceError) {
        console.warn('[ThemeToggle] Failed to resolve ThemeService:', serviceError);
        this.themeService = null;
      }

      try {
        this.i18nService = this.service('I18nService');
        console.log('[ThemeToggle] I18nService resolved:', !!this.i18nService);
      } catch (serviceError) {
        console.warn('[ThemeToggle] Failed to resolve I18nService:', serviceError);
        this.i18nService = null;
      }

      // Listen for theme changes with null checks
      if (this.themeService && typeof this.themeService.addThemeChangeListener === 'function') {
        this.themeService.addThemeChangeListener(this.handleThemeChange.bind(this));
        console.log('[ThemeToggle] Theme change listener added');
      } else {
        console.warn('[ThemeToggle] ThemeService not ready for event listeners');
      }

      if (this.i18nService && typeof this.i18nService.addLanguageChangeListener === 'function') {
        this.i18nService.addLanguageChangeListener(this.handleLanguageChange.bind(this));
        console.log('[ThemeToggle] Language change listener added');
      } else {
        console.warn('[ThemeToggle] I18nService not ready for event listeners');
      }

      // Initialize data with error handling
      console.log('[ThemeToggle] Updating component data...');
      this.updateData();
    } catch (error) {
      console.error('[ThemeToggle] Error during initialization:', error);
      // Set fallback data for basic functionality
      this.setFallbackData();
    }

    console.log('[ThemeToggle] Calling super.onInitialize()...');
    await super.onInitialize();
    
    // If services weren't available, set up a retry mechanism
    if (!this.themeService || !this.isThemeServiceReady()) {
      console.log('[ThemeToggle] Services not ready, setting up retry mechanism...');
      this.setupServiceRetry();
    }
    
    console.log('[ThemeToggle] Initialization complete');
  }

  /**
   * Setup retry mechanism for service dependencies
   */
  setupServiceRetry() {
    // Listen for app initialization complete event
    if (this.eventBus) {
      this.eventBus.subscribe('app:initialized', () => {
        console.log('[ThemeToggle] App initialized, retrying service setup...');
        this.retryServiceSetup();
      });
    }
    
    // Also try after a short delay
    setTimeout(() => {
      console.log('[ThemeToggle] Delayed retry of service setup...');
      this.retryServiceSetup();
    }, 1000);
  }

  /**
   * Retry service setup
   */
  async retryServiceSetup() {
    try {
      if (!this.themeService) {
        this.themeService = this.service('ThemeService');
        console.log('[ThemeToggle] ThemeService resolved on retry:', !!this.themeService);
      }

      if (!this.i18nService) {
        this.i18nService = this.service('I18nService');
        console.log('[ThemeToggle] I18nService resolved on retry:', !!this.i18nService);
      }

      // Setup event listeners if they weren't set up before
      if (this.themeService && typeof this.themeService.addThemeChangeListener === 'function') {
        this.themeService.addThemeChangeListener(this.handleThemeChange.bind(this));
        console.log('[ThemeToggle] Theme change listener added on retry');
      }

      if (this.i18nService && typeof this.i18nService.addLanguageChangeListener === 'function') {
        this.i18nService.addLanguageChangeListener(this.handleLanguageChange.bind(this));
        console.log('[ThemeToggle] Language change listener added on retry');
      }

      // Update data and re-render
      this.updateData();
      if (this.mounted) {
        await this.render();
      }
    } catch (error) {
      console.warn('[ThemeToggle] Service retry failed:', error);
    }
  }

  /**
   * Update component data from services
   */
  updateData() {
    console.log('[ThemeToggle] updateData called');
    try {
      // Check if ThemeService is available and has required methods
      if (!this.themeService || !this.isThemeServiceReady()) {
        console.warn('[ThemeToggle] ThemeService not ready, using fallback data');
        console.log('[ThemeToggle] ThemeService state:', {
          exists: !!this.themeService,
          ready: this.themeService ? this.isThemeServiceReady() : false
        });
        this.setFallbackData();
        return;
      }

      const currentTheme = this.themeService.getCurrentTheme();
      const availableThemes = this.themeService.getAvailableThemes();

      console.log('[ThemeToggle] Service response:', { currentTheme, availableThemes });

      // Validate service responses
      if (!currentTheme || !Array.isArray(availableThemes) || availableThemes.length === 0) {
        console.warn('[ThemeToggle] Invalid service response, using fallback data');
        this.setFallbackData();
        return;
      }

      const themesData = availableThemes.map(theme => ({
        value: theme,
        label: this.getThemeDisplayNameSafe(theme),
        icon: this.getThemeIconSafe(theme),
        active: theme === currentTheme
      }));

      console.log('[ThemeToggle] Setting component data:', { currentTheme, availableThemes, themesData });

      this.setData({
        currentTheme,
        availableThemes,
        themes: themesData
      });
    } catch (error) {
      console.error('[ThemeToggle] Error updating data:', error);
      this.setFallbackData();
    }
  }

  /**
   * Check if ThemeService has all required methods
   */
  isThemeServiceReady() {
    const requiredMethods = ['getCurrentTheme', 'getAvailableThemes', 'getThemeDisplayName', 'getThemeIcon'];
    return requiredMethods.every(method => typeof this.themeService[method] === 'function');
  }

  /**
   * Get theme display name with fallback
   */
  getThemeDisplayNameSafe(theme) {
    try {
      return this.themeService.getThemeDisplayName(theme);
    } catch (error) {
      return this.getDefaultThemeDisplayName(theme);
    }
  }

  /**
   * Get theme icon with fallback
   */
  getThemeIconSafe(theme) {
    try {
      return this.themeService.getThemeIcon(theme);
    } catch (error) {
      return this.getDefaultThemeIcon(theme);
    }
  }

  /**
   * Set fallback data when services are unavailable
   */
  setFallbackData() {
    const fallbackThemes = ['auto', 'light', 'dark'];
    const fallbackCurrentTheme = 'auto';

    this.setData({
      currentTheme: fallbackCurrentTheme,
      availableThemes: fallbackThemes,
      themes: fallbackThemes.map(theme => ({
        value: theme,
        label: this.getDefaultThemeDisplayName(theme),
        icon: this.getDefaultThemeIcon(theme),
        active: theme === fallbackCurrentTheme
      }))
    });
  }

  /**
   * Get default theme display name
   */
  getDefaultThemeDisplayName(theme) {
    const defaultNames = {
      auto: 'Auto',
      light: 'Light',
      dark: 'Dark'
    };
    return defaultNames[theme] || theme.charAt(0).toUpperCase() + theme.slice(1);
  }

  /**
   * Get default theme icon
   */
  getDefaultThemeIcon(theme) {
    const defaultIcons = {
      auto: '🔄',
      light: '☀️',
      dark: '🌙'
    };
    return defaultIcons[theme] || '🎨';
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
      console.warn('[ThemeToggle] Translation error for key:', key, error);
    }
    return fallback;
  }

  /**
   * Generate component template with fallback support
   * @returns {string} HTML template
   */
  defaultTemplate() {
    const { style, showText, showIcon, orientation, size } = this.componentConfig;
    const { themes = [], currentTheme = 'auto' } = this.data || {};

    // Enhanced debugging for render state
    console.log('[ThemeToggle] Rendering template:', {
      hasThemes: themes && themes.length > 0,
      currentTheme,
      showIcon,
      showText,
      serviceReady: this.themeService && this.isThemeServiceReady()
    });

    // If we have no data or empty themes, provide a meaningful fallback
    if (!themes || themes.length === 0) {
      console.log('[ThemeToggle] Rendering with enhanced fallback data due to empty themes');
      
      return `
        <div class="theme-toggle-component theme-toggle-fallback theme-toggle-${style}" style="display: inline-flex; align-items: center; min-height: 44px;">
          <button class="theme-toggle-btn" title="Theme Toggle" aria-label="Theme Toggle" 
                  style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; 
                         border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #ffffff; 
                         color: #111827; cursor: pointer; font-size: 0.875rem; font-weight: 500;">
            ${showIcon ? '<span class="theme-icon" style="font-size: 1.1rem;">🔄</span>' : ''}
            ${showText ? '<span class="theme-text" style="font-weight: 600;">Auto</span>' : 'Theme'}
          </button>
        </div>
      `;
    }

    const classes = [
      'theme-toggle-component',
      `theme-toggle-${style}`,
      `theme-toggle-${orientation}`,
      `theme-toggle-${size}`
    ].join(' ');

    switch (style) {
      case 'select':
        return this.renderSelectStyle(classes, themes, currentTheme);
      case 'tabs':
        return this.renderTabsStyle(classes, themes, showText, showIcon);
      default:
        return this.renderButtonStyle(classes, themes, currentTheme, showText, showIcon);
    }
  }

  /**
   * Render button style
   * @param {string} classes - CSS classes
   * @param {Array} themes - Available themes
   * @param {string} currentTheme - Current theme
   * @param {boolean} showText - Show text
   * @param {boolean} showIcon - Show icon
   * @returns {string} HTML
   */
  renderButtonStyle(classes, themes, currentTheme, showText, showIcon) {
    // Ensure we have valid data
    const safeThemes = Array.isArray(themes) ? themes : [];
    const safeCurrentTheme = currentTheme || 'auto';
    
    const currentThemeData = safeThemes.find(t => t.value === safeCurrentTheme) || { 
      icon: this.getDefaultThemeIcon(safeCurrentTheme), 
      label: this.getDefaultThemeDisplayName(safeCurrentTheme) 
    };
    
    const title = this.getTranslationSafe('theme.toggle', 'Toggle theme');

    return `
      <div class="${classes}">
        <button class="theme-toggle-btn" title="${title}" aria-label="${title}">
          ${showIcon ? `<span class="theme-icon">${currentThemeData?.icon || '🎨'}</span>` : ''}
          ${showText ? `<span class="theme-text">${currentThemeData?.label || safeCurrentTheme}</span>` : ''}
        </button>
      </div>
    `;
  }

  /**
   * Render select style
   * @param {string} classes - CSS classes
   * @param {Array} themes - Available themes
   * @param {string} currentTheme - Current theme
   * @returns {string} HTML
   */
  renderSelectStyle(classes, themes, currentTheme) {
    const safeThemes = Array.isArray(themes) ? themes : [];
    const safeCurrentTheme = currentTheme || 'auto';
    const title = this.getTranslationSafe('theme.toggle', 'Toggle theme');
    
    const options = safeThemes.map(theme => 
      `<option value="${theme.value || theme}" ${(theme.value || theme) === safeCurrentTheme ? 'selected' : ''}>
        ${theme.label || this.getDefaultThemeDisplayName(theme.value || theme)}
      </option>`
    ).join('');

    return `
      <div class="${classes}">
        <select class="theme-select" title="${title}" aria-label="${title}">
          ${options}
        </select>
      </div>
    `;
  }

  /**
   * Render tabs style
   * @param {string} classes - CSS classes
   * @param {Array} themes - Available themes
   * @param {boolean} showText - Show text
   * @param {boolean} showIcon - Show icon
   * @returns {string} HTML
   */
  renderTabsStyle(classes, themes, showText, showIcon) {
    const safeThemes = Array.isArray(themes) ? themes : [];
    
    const tabs = safeThemes.map(theme => {
      const themeValue = theme.value || theme;
      const themeLabel = theme.label || this.getDefaultThemeDisplayName(themeValue);
      const themeIcon = theme.icon || this.getDefaultThemeIcon(themeValue);
      const isActive = theme.active || false;
      
      return `
        <button 
          class="theme-tab ${isActive ? 'active' : ''}" 
          data-theme="${themeValue}"
          title="${themeLabel}"
          aria-label="${themeLabel}"
        >
          ${showIcon ? `<span class="theme-icon">${themeIcon}</span>` : ''}
          ${showText ? `<span class="theme-text">${themeLabel}</span>` : ''}
        </button>
      `;
    }).join('');

    return `
      <div class="${classes}">
        <div class="theme-tabs" role="tablist">
          ${tabs}
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
      .theme-toggle-component {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .theme-toggle-btn,
      .theme-tab {
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
      }

      .theme-toggle-btn:hover,
      .theme-tab:hover {
        background: var(--bg-primary, #f9fafb);
        transform: scale(1.02);
      }

      .theme-toggle-btn:active,
      .theme-tab:active {
        transform: scale(0.98);
      }

      .theme-tab.active {
        background: var(--primary, #3b82f6);
        color: white;
        border-color: var(--primary, #3b82f6);
      }

      .theme-select {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 0.5rem;
        background: var(--bg-secondary, #ffffff);
        color: var(--text-primary, #111827);
        cursor: pointer;
        font-size: 0.875rem;
      }

      .theme-icon {
        font-size: 1.1rem;
        line-height: 1;
      }

      .theme-text {
        font-weight: 600;
        letter-spacing: 0.025em;
      }

      /* Size variations */
      .theme-toggle-small .theme-toggle-btn,
      .theme-toggle-small .theme-tab,
      .theme-toggle-small .theme-select {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }

      .theme-toggle-large .theme-toggle-btn,
      .theme-toggle-large .theme-tab,
      .theme-toggle-large .theme-select {
        padding: 0.75rem 1rem;
        font-size: 1rem;
      }

      /* Orientation variations */
      .theme-toggle-vertical {
        flex-direction: column;
      }

      .theme-toggle-tabs .theme-tabs {
        display: flex;
        gap: 0.25rem;
        background: var(--bg-primary, #f9fafb);
        padding: 0.25rem;
        border-radius: 0.75rem;
      }

      .theme-toggle-tabs .theme-tab {
        border: none;
        border-radius: 0.5rem;
        background: transparent;
      }

      .theme-toggle-tabs .theme-tab:hover {
        background: var(--bg-secondary, #ffffff);
      }

      /* Animation */
      .theme-toggle-component.changing .theme-icon {
        animation: themeRotate 0.3s ease;
      }

      @keyframes themeRotate {
        0% { transform: rotate(0deg); }
        50% { transform: rotate(180deg); }
        100% { transform: rotate(360deg); }
      }

      /* Accessibility */
      .theme-toggle-btn:focus,
      .theme-tab:focus,
      .theme-select:focus {
        outline: 2px solid var(--primary, #3b82f6);
        outline-offset: 2px;
      }

      /* Dark theme adjustments */
      .theme-dark .theme-toggle-component {
        /* Dark theme specific styles */
      }
    `;
  }

  /**
   * Handle toggle button click
   * @param {Event} event - Click event
   */
  async handleToggleClick(event) {
    event.preventDefault();
    
    // Add animation class
    this.element.classList.add('changing');
    setTimeout(() => {
      this.element.classList.remove('changing');
    }, 300);

    try {
      await this.themeService.toggleTheme();
    } catch (error) {
      console.error('Theme toggle error:', error);
    }
  }

  /**
   * Handle select change
   * @param {Event} event - Change event
   */
  async handleSelectChange(event) {
    const theme = event.target.value;
    
    try {
      await this.themeService.setTheme(theme);
    } catch (error) {
      console.error('Theme select error:', error);
    }
  }

  /**
   * Handle tab click
   * @param {Event} event - Click event
   */
  async handleTabClick(event) {
    if (!event.target.classList.contains('theme-tab')) return;
    
    const theme = event.target.dataset.theme;
    
    try {
      await this.themeService.setTheme(theme);
    } catch (error) {
      console.error('Theme tab error:', error);
    }
  }

  /**
   * Handle theme change from service
   * @param {Object} data - Theme change data
   */
  handleThemeChange(data) {
    this.updateData();
    
    // Emit component event
    this.emit('theme-toggle:changed', {
      component: this.name,
      theme: data.theme,
      previousTheme: data.previousTheme
    });
  }

  /**
   * Handle language change from service
   * @param {Object} data - Language change data
   */
  handleLanguageChange(data) {
    this.updateData();
  }

  /**
   * Set theme programmatically
   * @param {string} theme - Theme name
   * @returns {Promise} Set theme promise
   */
  async setTheme(theme) {
    return this.themeService.setTheme(theme);
  }

  /**
   * Get current theme
   * @returns {string} Current theme
   */
  getCurrentTheme() {
    return this.themeService.getCurrentTheme();
  }

  /**
   * Get available themes
   * @returns {Array} Available themes
   */
  getAvailableThemes() {
    return this.themeService.getAvailableThemes();
  }

  // Override events binding for tabs style
  bindEvents() {
    super.bindEvents();
    
    if (this.componentConfig.style === 'tabs') {
      const tabs = this.findAll('.theme-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', this.handleTabClick.bind(this));
      });
    }
  }
}

export default ThemeToggle;