/**
 * BaseComponent - Foundation for All UI Components
 * 
 * @description The BaseComponent class provides a comprehensive foundation for all
 * UI components in the EC0249 platform. It implements common patterns for component
 * lifecycle management, event handling, templating, reactive data binding, and
 * styling encapsulation. All UI components should extend this base class.
 * 
 * @class BaseComponent
 * @extends Module
 * 
 * Key Features:
 * - Component lifecycle management (mount, unmount, render)
 * - Reactive data binding with automatic re-rendering
 * - Template-based rendering with variable interpolation
 * - Event handling with automatic cleanup
 * - CSS encapsulation and scoped styling
 * - Shadow DOM support for true encapsulation
 * - Parent-child component relationships
 * - State management and persistence
 * 
 * Component Lifecycle:
 * 1. Construction: Component setup and configuration
 * 2. Mounting: DOM attachment and initialization
 * 3. Rendering: Template processing and DOM updates
 * 4. Operation: User interaction and state changes
 * 5. Unmounting: Cleanup and resource release
 * 
 * Template Features:
 * - Function-based templates with data injection
 * - String templates with variable interpolation
 * - Reactive updates on data changes
 * - Conditional rendering support
 * 
 * @example
 * // Basic component implementation
 * class UserCard extends BaseComponent {
 *   constructor(element, options) {
 *     super('UserCard', element, {
 *       template: this.template,
 *       events: {
 *         'click .edit-btn': 'handleEdit',
 *         'change .user-input': 'handleInputChange'
 *       },
 *       reactive: true
 *     });
 *   }
 * 
 *   template(data) {
 *     return `
 *       <div class="user-card">
 *         <h3>${data.name}</h3>
 *         <p>${data.email}</p>
 *         <button class="edit-btn">Edit</button>
 *       </div>
 *     `;
 *   }
 * }
 * 
 * @since 1.0.0
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
    
    // Track event listeners for proper cleanup
    this.eventListeners = new Map(); // Store element -> [{ type, handler, selector }]
    
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
   * Mount component to DOM element
   * 
   * @description Attaches the component to a DOM element and initializes all
   * component features including rendering, event binding, and child component
   * mounting. This method should be called to activate the component.
   * 
   * @param {HTMLElement} [element=null] - Target DOM element (uses constructor element if null)
   * 
   * @returns {Promise<void>} Promise that resolves when mounting is complete
   * 
   * @throws {Error} Throws if component is already mounted
   * @throws {Error} Throws if no target element is available
   * @throws {Error} Throws if mounting process fails
   * 
   * @fires BaseComponent#component:mounted - Emitted when mounting completes
   * 
   * @example
   * const component = new UserCard();
   * await component.mount(document.getElementById('user-container'));
   * 
   * @since 1.0.0
   */
  async mount(element = null) {
    console.log(`[Component] 🚀 ${this.name} - Starting mount process...`);
    
    if (this.mounted) {
      console.warn(`[Component] ⚠️  ${this.name} is already mounted`);
      return;
    }

    if (element) {
      this.element = element;
      console.log(`[Component] 📍 ${this.name} - Element provided:`, element);
    }

    if (!this.element) {
      console.error(`[Component] ❌ ${this.name} - No element available for mounting`);
      throw new Error(`Component '${this.name}' cannot mount without an element`);
    }

    console.log(`[Component] 📋 ${this.name} - Element before mount:`, {
      id: this.element.id,
      className: this.element.className,
      innerHTML: this.element.innerHTML,
      data: this.data
    });

    try {
      // Setup shadow DOM if enabled
      if (this.componentConfig.shadowDOM) {
        this.shadowRoot = this.element.attachShadow({ mode: 'open' });
        console.log(`[Component] 🌑 ${this.name} - Shadow DOM created`);
      }

      // Call before mount hook
      console.log(`[Component] 🔄 ${this.name} - Calling beforeMount hook...`);
      await this.beforeMount();

      // Render component
      console.log(`[Component] 🎨 ${this.name} - Starting render...`);
      await this.render();

      console.log(`[Component] 📋 ${this.name} - Element after render:`, {
        innerHTML: this.element.innerHTML,
        childCount: this.element.children.length
      });

      // Bind events
      console.log(`[Component] 🔗 ${this.name} - Binding events...`);
      this.bindEvents();

      // Mount child components
      console.log(`[Component] 👶 ${this.name} - Mounting children...`);
      await this.mountChildren();

      this.mounted = true;

      // Call after mount hook
      console.log(`[Component] ✅ ${this.name} - Calling afterMount hook...`);
      await this.afterMount();

      // Emit mount event
      this.emit('component:mounted', { 
        component: this.name, 
        element: this.element 
      });

      console.log(`[Component] 🎉 ${this.name} - Successfully mounted!`);
    } catch (error) {
      console.error(`[Component] 💥 ${this.name} - Mount failed:`, error);
      console.log(`[Component] 🔍 ${this.name} - Debug info:`, {
        element: !!this.element,
        data: this.data,
        config: this.componentConfig
      });
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
   * Render component template and update DOM
   * 
   * @description Processes the component template, applies data binding,
   * updates the DOM content, and applies styling. This method is called
   * automatically during mounting and can be called manually for updates.
   * 
   * @returns {Promise<void>} Promise that resolves when rendering is complete
   * 
   * @throws {Error} Throws if component is not mounted to an element
   * @throws {Error} Throws if template processing fails
   * 
   * @fires BaseComponent#component:rendered - Emitted when rendering completes
   * 
   * @example
   * // Manual re-render after data change
   * component.setData('name', 'New Name');
   * await component.render();
   * 
   * @since 1.0.0
   */
  async render() {
    if (!this.element) {
      throw new Error(`Component '${this.name}' cannot render without an element`);
    }

    try {
      const html = await this.generateHTML();
      const target = this.shadowRoot || this.element;
      
      // Enhanced debug logging for component rendering
      const htmlPreview = html.substring(0, 200);
      console.log(`[Component] ${this.name} rendering:`, {
        htmlLength: html.length,
        preview: htmlPreview,
        targetElement: target?.tagName,
        hasData: Object.keys(this.data).length > 0,
        data: this.data
      });
      
      if (html.length < 50) {
        console.warn(`[Component] ${this.name} rendered very minimal content (possible issue):`, htmlPreview);
      }
      
      target.innerHTML = html;

      // Apply styles if isolated
      if (this.componentConfig.isolateStyles) {
        await this.applyStyles();
      }

      // Re-bind events after content replacement (critical for re-renders)
      if (this.mounted) {
        console.log(`[Component] 🔗 ${this.name} - Re-binding events after re-render...`);
        // Clear old event listeners first to prevent memory leaks
        this.unbindEvents();
        this.bindEvents();
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
      // Log component state for debugging
      console.log(`[Component] ${this.name} debug info:`, {
        mounted: this.mounted,
        data: this.data,
        element: !!this.element,
        services: this.dependencies
      });
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
    const componentClass = `${this.name.toLowerCase()}-component`;
    console.log(`[BaseComponent] Using default template for ${this.name}`);
    
    // Provide a visible fallback for debugging
    return `
      <div class="${componentClass}" style="display: inline-flex; align-items: center; min-height: 44px; padding: 0.5rem; border: 1px dashed #ccc; background: #f9f9f9;">
        <span style="font-size: 0.8rem; color: #666;">Loading ${this.name}...</span>
      </div>
    `;
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
      // Add event listener
      element.addEventListener(eventType, handlerFunction);
      
      // Track for cleanup
      if (!this.eventListeners.has(element)) {
        this.eventListeners.set(element, []);
      }
      this.eventListeners.get(element).push({
        type: eventType,
        handler: handlerFunction,
        selector: elementSelector || 'self'
      });
    });
  }

  /**
   * Register external event listener for automatic cleanup
   * @param {Element} element - Target element (e.g., document, window)
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler (already bound)
   * @param {string} description - Description for logging
   */
  registerExternalListener(element, eventType, handler, description = 'external') {
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({
      type: eventType,
      handler: handler,
      selector: description
    });
    console.log(`[BaseComponent] ${this.name} - Registered ${eventType} listener on ${description}`);
  }

  /**
   * Unbind event listeners
   */
  unbindEvents() {
    console.log(`[BaseComponent] ${this.name} - Unbinding ${this.eventListeners.size} event listeners...`);
    
    // Remove tracked event listeners
    for (const [element, listeners] of this.eventListeners) {
      listeners.forEach(({ type, handler, selector }) => {
        try {
          element.removeEventListener(type, handler);
          console.log(`[BaseComponent] ${this.name} - Removed ${type} listener from ${selector}`);
        } catch (error) {
          console.warn(`[BaseComponent] ${this.name} - Failed to remove ${type} listener:`, error);
        }
      });
    }
    
    // Clear tracking
    this.eventListeners.clear();
    console.log(`[BaseComponent] ${this.name} - Event listeners cleanup complete`);
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
   * Set component data with automatic re-rendering
   * 
   * @description Updates component data and triggers re-rendering if reactive
   * mode is enabled. Supports both single key-value updates and bulk object
   * updates for efficient data management.
   * 
   * @param {string|Object} key - Data key in dot notation or data object for bulk update
   * @param {*} [value=null] - Data value (ignored if key is an object)
   * 
   * @example
   * // Single value update
   * component.setData('user.name', 'John Doe');
   * 
   * @example
   * // Bulk update
   * component.setData({
   *   'user.name': 'John Doe',
   *   'user.email': 'john@example.com',
   *   'user.active': true
   * });
   * 
   * @since 1.0.0
   */
  setData(key, value = null) {
    const previousData = { ...this.data };
    
    if (typeof key === 'object') {
      Object.assign(this.data, key);
      console.log(`[Component] 📝 ${this.name} - setData (object):`, {
        previousData,
        newData: this.data,
        keys: Object.keys(key)
      });
    } else {
      this.data[key] = value;
      console.log(`[Component] 📝 ${this.name} - setData (key/value):`, {
        key, value,
        previousData,
        newData: this.data
      });
    }

    // Log data changes for debugging components with issues
    const hasSignificantData = Object.keys(this.data).length > 0 && 
      Object.values(this.data).some(v => v !== null && v !== undefined && v !== '');
    
    if (!hasSignificantData && this.name.includes('Toggle')) {
      console.warn(`[Component] ⚠️  ${this.name} has minimal data:`, this.data);
    } else if (this.name.includes('Toggle')) {
      console.log(`[Component] ✅ ${this.name} has good data:`, this.data);
    }

    // Re-render if reactive and mounted
    if (this.componentConfig.reactive && this.mounted) {
      console.log(`[Component] 🔄 ${this.name} - Triggering re-render due to data change`);
      this.render();
    } else {
      console.log(`[Component] ⏸️  ${this.name} - No re-render (reactive: ${this.componentConfig.reactive}, mounted: ${this.mounted})`);
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