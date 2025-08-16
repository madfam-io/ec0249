/**
 * Base View Controller - Common functionality for all view controllers
 * Provides standard methods for view management and UI updates
 */
import { eventBus } from '../core/EventBus.js';

class BaseViewController {
  constructor(viewId, app) {
    this.viewId = viewId;
    this.app = app;
    this.element = null;
    this.isActive = false;
    this.initialized = false;
  }

  /**
   * Initialize the view controller
   */
  async initialize() {
    if (this.initialized) return;

    this.element = document.getElementById(`${this.viewId}View`);
    if (!this.element) {
      console.warn(`[${this.constructor.name}] View element not found: ${this.viewId}View`);
      return;
    }

    await this.onInitialize();
    this.bindEvents();
    this.initialized = true;
  }

  /**
   * Override in subclasses for specific initialization
   */
  async onInitialize() {
    // Override in subclasses
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Override in subclasses
  }

  /**
   * Show this view
   */
  show() {
    if (!this.element) return;

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.add('hidden');
    });

    // Show this view
    this.element.classList.remove('hidden');
    this.isActive = true;

    // Update navigation
    this.updateNavigation();

    // Trigger view-specific show logic
    this.onShow();
  }

  /**
   * Hide this view
   */
  hide() {
    if (!this.element) return;
    
    this.element.classList.add('hidden');
    this.isActive = false;
    this.onHide();
  }

  /**
   * Override in subclasses for show logic
   */
  onShow() {
    // Override in subclasses
  }

  /**
   * Override in subclasses for hide logic
   */
  onHide() {
    // Override in subclasses
  }

  /**
   * Update navigation state
   */
  updateNavigation() {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    const activeTab = document.querySelector(`[data-view="${this.viewId}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected', 'true');
    }
  }

  /**
   * Render view content
   */
  async render() {
    if (!this.element || !this.isActive) return;
    await this.onRender();
  }

  /**
   * Override in subclasses for rendering logic
   */
  async onRender() {
    // Override in subclasses
  }

  /**
   * Update view with current language
   */
  updateLanguage() {
    if (!this.isActive) return;
    this.onLanguageUpdate();
  }

  /**
   * Override in subclasses for language updates
   */
  onLanguageUpdate() {
    // Update i18n text content
    const i18nElements = this.element?.querySelectorAll('[data-i18n]');
    if (i18nElements && this.app.services.get('I18nService')) {
      const i18n = this.app.services.get('I18nService');
      i18nElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = i18n.t(key);
      });
    }
  }

  /**
   * Get service from app
   */
  getService(serviceName) {
    return this.app.services.get(serviceName);
  }

  /**
   * Get module from app
   */
  getModule(moduleName) {
    return this.app.modules.get(moduleName);
  }

  /**
   * Emit event
   */
  emit(eventName, data) {
    eventBus.publish(eventName, data);
  }

  /**
   * Subscribe to event
   */
  subscribe(eventName, handler) {
    return eventBus.subscribe(eventName, handler);
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    this.emit('notification:show', { message, type });
  }

  /**
   * Create element with classes and attributes
   */
  createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag);
    
    if (classes.length > 0) {
      element.classList.add(...classes);
    }
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    
    return element;
  }

  /**
   * Find element within this view
   */
  findElement(selector) {
    return this.element?.querySelector(selector);
  }

  /**
   * Find all elements within this view
   */
  findElements(selector) {
    return this.element?.querySelectorAll(selector) || [];
  }

  /**
   * Clear view content
   */
  clearContent() {
    if (this.element) {
      this.element.innerHTML = '';
    }
  }

  /**
   * Show specific section within this view
   * @param {string} sectionId - Section identifier
   * Default implementation - override in subclasses for specific behavior
   */
  async showSection(sectionId) {
    console.log(`[${this.constructor.name}] Default showSection called for: ${sectionId}`);
    
    // Default behavior: just log the section change
    // Subclasses should override this method for specific section handling
    
    return Promise.resolve();
  }

  /**
   * Destroy the view controller
   */
  destroy() {
    this.hide();
    this.initialized = false;
    this.element = null;
  }
}

export default BaseViewController;