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
    this.themeService = this.service('ThemeService');
    this.i18nService = this.service('I18nService');

    // Listen for theme changes
    this.themeService.addThemeChangeListener(this.handleThemeChange.bind(this));
    this.i18nService.addLanguageChangeListener(this.handleLanguageChange.bind(this));

    // Initialize data
    this.updateData();

    await super.onInitialize();
  }

  /**
   * Update component data from services
   */
  updateData() {
    const currentTheme = this.themeService.getCurrentTheme();
    const availableThemes = this.themeService.getAvailableThemes();

    this.setData({
      currentTheme,
      availableThemes,
      themes: availableThemes.map(theme => ({
        value: theme,
        label: this.themeService.getThemeDisplayName(theme),
        icon: this.themeService.getThemeIcon(theme),
        active: theme === currentTheme
      }))
    });
  }

  /**
   * Generate component template
   * @returns {string} HTML template
   */
  defaultTemplate() {
    const { style, showText, showIcon, orientation, size } = this.componentConfig;
    const { themes = [], currentTheme = 'auto' } = this.data || {};

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
    const currentThemeData = themes.find(t => t.value === currentTheme) || { icon: '🎨', label: currentTheme };
    const title = this.i18nService ? this.i18nService.t('theme.toggle') : 'Toggle theme';

    return `
      <div class="${classes}">
        <button class="theme-toggle-btn" title="${title}" aria-label="${title}">
          ${showIcon ? `<span class="theme-icon">${currentThemeData?.icon || '🎨'}</span>` : ''}
          ${showText ? `<span class="theme-text">${currentThemeData?.label || currentTheme}</span>` : ''}
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
    const title = this.i18nService ? this.i18nService.t('theme.toggle') : 'Toggle theme';
    
    const options = themes.map(theme => 
      `<option value="${theme.value}" ${theme.value === currentTheme ? 'selected' : ''}>
        ${theme.label}
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
    const tabs = themes.map(theme => `
      <button 
        class="theme-tab ${theme.active ? 'active' : ''}" 
        data-theme="${theme.value}"
        title="${theme.label}"
        aria-label="${theme.label}"
      >
        ${showIcon ? `<span class="theme-icon">${theme.icon}</span>` : ''}
        ${showText ? `<span class="theme-text">${theme.label}</span>` : ''}
      </button>
    `).join('');

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