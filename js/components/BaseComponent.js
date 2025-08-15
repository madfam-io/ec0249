/**
 * Base Component - Foundation for all UI components
 * Provides lifecycle management, event handling, and templating
 */
import Module from '../core/Module.js';

class BaseComponent extends Module {
  constructor(name, element = null, options = {}) {
    super(name, options.dependencies || [], options.config || {});
    
    this.element = element;
    this.template = options.template || null;
    this.data = options.data || {};
    this.events = options.events || {};
    this.children = new Map();
    this.mounted = false;
    this.destroyed = false;
    
    // Component-specific configuration
    this.componentConfig = {
      autoMount: options.autoMount !== false,
      reactive: options.reactive !== false,
      isolateStyles: options.isolateStyles || false,
      shadowDOM: options.shadowDOM || false,
      ...options
    };
  }

  async onInitialize() {
    // Auto-mount if enabled and element exists
    if (this.componentConfig.autoMount && this.element) {
      await this.mount();
    }
  }

  /**
   * Mount component to DOM
   * @param {HTMLElement} element - Target element (optional)
   * @returns {Promise} Mount promise
   */
  async mount(element = null) {
    if (this.mounted) {
      console.warn(`Component '${this.name}' is already mounted`);
      return;
    }

    if (element) {
      this.element = element;
    }

    if (!this.element) {
      throw new Error(`Component '${this.name}' cannot mount without an element`);
    }

    try {
      // Setup shadow DOM if enabled
      if (this.componentConfig.shadowDOM) {
        this.shadowRoot = this.element.attachShadow({ mode: 'open' });
      }

      // Call before mount hook
      await this.beforeMount();

      // Render component
      await this.render();

      // Bind events
      this.bindEvents();

      // Mount child components
      await this.mountChildren();

      this.mounted = true;

      // Call after mount hook
      await this.afterMount();

      // Emit mount event
      this.emit('component:mounted', { 
        component: this.name, 
        element: this.element 
      });

      console.log(`[Component] Mounted: ${this.name}`);
    } catch (error) {
      console.error(`[Component] Failed to mount '${this.name}':`, error);
      throw error;
    }
  }

  /**
   * Unmount component from DOM
   * @returns {Promise} Unmount promise
   */
  async unmount() {
    if (!this.mounted) {
      return;
    }

    try {
      // Call before unmount hook
      await this.beforeUnmount();

      // Unmount child components
      await this.unmountChildren();

      // Unbind events
      this.unbindEvents();

      // Clear element content
      if (this.element) {
        if (this.shadowRoot) {
          this.shadowRoot.innerHTML = '';
        } else {
          this.element.innerHTML = '';
        }
      }

      this.mounted = false;

      // Call after unmount hook
      await this.afterUnmount();

      // Emit unmount event
      this.emit('component:unmounted', { 
        component: this.name 
      });

      console.log(`[Component] Unmounted: ${this.name}`);
    } catch (error) {
      console.error(`[Component] Failed to unmount '${this.name}':`, error);
      throw error;
    }
  }

  /**
   * Render component
   * @returns {Promise} Render promise
   */
  async render() {
    if (!this.element) {
      throw new Error(`Component '${this.name}' cannot render without an element`);
    }

    try {
      const html = await this.generateHTML();
      const target = this.shadowRoot || this.element;
      
      target.innerHTML = html;

      // Apply styles if isolated
      if (this.componentConfig.isolateStyles) {
        await this.applyStyles();
      }

      // Update reactive bindings
      if (this.componentConfig.reactive) {
        this.updateReactiveBindings();
      }

      // Emit render event
      this.emit('component:rendered', { 
        component: this.name,
        html: html.length 
      });
    } catch (error) {
      console.error(`[Component] Render error in '${this.name}':`, error);
      throw error;
    }
  }

  /**
   * Generate HTML content
   * @returns {Promise<string>} HTML string
   */
  async generateHTML() {
    if (typeof this.template === 'function') {
      return await this.template(this.data, this);
    } else if (typeof this.template === 'string') {
      return this.interpolateTemplate(this.template, this.data);
    } else {
      // Override in subclasses
      return this.defaultTemplate();
    }
  }

  /**
   * Default template - override in subclasses
   * @returns {string} Default HTML
   */
  defaultTemplate() {
    return `<div class="${this.name.toLowerCase()}-component"></div>`;
  }

  /**
   * Interpolate template with data
   * @param {string} template - Template string
   * @param {Object} data - Data object
   * @returns {string} Interpolated HTML
   */
  interpolateTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * Apply component styles
   * @returns {Promise} Style application promise
   */
  async applyStyles() {
    const styles = await this.getStyles();
    if (!styles) return;

    if (this.shadowRoot) {
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      this.shadowRoot.appendChild(styleElement);
    } else {
      // Apply scoped styles to document head
      const styleId = `${this.name}-component-styles`;
      if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = this.scopeStyles(styles);
        document.head.appendChild(styleElement);
      }
    }
  }

  /**
   * Get component styles - override in subclasses
   * @returns {Promise<string>} CSS styles
   */
  async getStyles() {
    return null;
  }

  /**
   * Scope styles to component
   * @param {string} css - CSS string
   * @returns {string} Scoped CSS
   */
  scopeStyles(css) {
    const className = `.${this.name.toLowerCase()}-component`;
    return css.replace(/([^{}]+)\{/g, (match, selector) => {
      return `${className} ${selector.trim()}{`;
    });
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    for (const [selector, handler] of Object.entries(this.events)) {
      this.bindEvent(selector, handler);
    }
  }

  /**
   * Bind single event
   * @param {string} selector - Event selector (e.g., 'click .button')
   * @param {Function|string} handler - Event handler
   */
  bindEvent(selector, handler) {
    const [eventType, elementSelector] = selector.split(' ', 2);
    const target = this.shadowRoot || this.element;
    
    let elements;
    if (elementSelector) {
      elements = target.querySelectorAll(elementSelector);
    } else {
      elements = [target];
    }

    const handlerFunction = typeof handler === 'string' ? this[handler].bind(this) : handler;

    elements.forEach(element => {
      element.addEventListener(eventType, handlerFunction);
    });
  }

  /**
   * Unbind event listeners
   */
  unbindEvents() {
    // Remove all event listeners by cloning elements
    // This is a simple approach - could be optimized with explicit tracking
    if (this.element && !this.shadowRoot) {
      const clone = this.element.cloneNode(true);
      this.element.parentNode?.replaceChild(clone, this.element);
      this.element = clone;
    }
  }

  /**
   * Update reactive data bindings
   */
  updateReactiveBindings() {
    const target = this.shadowRoot || this.element;
    const bindingElements = target.querySelectorAll('[data-bind]');

    bindingElements.forEach(element => {
      const bindingKey = element.getAttribute('data-bind');
      const value = this.getNestedData(bindingKey);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = value || '';
      } else {
        element.textContent = value || '';
      }
    });
  }

  /**
   * Get nested data value
   * @param {string} path - Data path
   * @returns {*} Data value
   */
  getNestedData(path) {
    return path.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : null;
    }, this.data);
  }

  /**
   * Set component data
   * @param {string|Object} key - Data key or data object
   * @param {*} value - Data value
   */
  setData(key, value = null) {
    if (typeof key === 'object') {
      Object.assign(this.data, key);
    } else {
      this.data[key] = value;
    }

    // Re-render if reactive and mounted
    if (this.componentConfig.reactive && this.mounted) {
      this.render();
    }
  }

  /**
   * Get component data
   * @param {string} key - Data key
   * @returns {*} Data value
   */
  getData(key = null) {
    return key ? this.getNestedData(key) : { ...this.data };
  }

  /**
   * Add child component
   * @param {string} name - Child name
   * @param {BaseComponent} component - Child component
   */
  addChildComponent(name, component) {
    this.children.set(name, component);
    component.parent = this;

    // Mount if parent is already mounted
    if (this.mounted) {
      component.mount();
    }
  }

  /**
   * Remove child component
   * @param {string} name - Child name
   * @returns {Promise} Removal promise
   */
  async removeChildComponent(name) {
    const child = this.children.get(name);
    if (child) {
      await child.unmount();
      this.children.delete(name);
      child.parent = null;
    }
  }

  /**
   * Mount all child components
   * @returns {Promise} Mount promise
   */
  async mountChildren() {
    const promises = Array.from(this.children.values()).map(child => {
      if (!child.mounted) {
        return child.mount();
      }
    });
    await Promise.all(promises);
  }

  /**
   * Unmount all child components
   * @returns {Promise} Unmount promise
   */
  async unmountChildren() {
    const promises = Array.from(this.children.values()).map(child => child.unmount());
    await Promise.all(promises);
  }

  /**
   * Find element within component
   * @param {string} selector - CSS selector
   * @returns {HTMLElement} Found element
   */
  find(selector) {
    const target = this.shadowRoot || this.element;
    return target?.querySelector(selector) || null;
  }

  /**
   * Find all elements within component
   * @param {string} selector - CSS selector
   * @returns {NodeList} Found elements
   */
  findAll(selector) {
    const target = this.shadowRoot || this.element;
    return target?.querySelectorAll(selector) || [];
  }

  /**
   * Check if component is mounted
   * @returns {boolean} Mount status
   */
  isMounted() {
    return this.mounted;
  }

  // Lifecycle hooks - override in subclasses
  async beforeMount() {}
  async afterMount() {}
  async beforeUnmount() {}
  async afterUnmount() {}

  async onDestroy() {
    if (this.mounted) {
      await this.unmount();
    }
    this.destroyed = true;
  }
}

export default BaseComponent;