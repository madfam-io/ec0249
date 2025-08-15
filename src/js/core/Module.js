/**
 * Base Module Class - Foundation for all application modules
 * Provides common lifecycle, dependency injection, and event handling
 */
class Module {
  constructor(name, dependencies = [], config = {}) {
    this.name = name;
    this.dependencies = dependencies;
    this.config = config;
    this.state = 'uninitialized'; // uninitialized, initializing, initialized, destroyed
    this.container = null;
    this.eventBus = null;
    this.subscriptions = [];
    this.childModules = new Map();
    this.parent = null;
  }

  /**
   * Initialize the module
   * @param {ServiceContainer} container - Service container
   * @param {EventBus} eventBus - Event bus
   * @returns {Promise} Initialization promise
   */
  async initialize(container, eventBus) {
    if (this.state !== 'uninitialized') {
      throw new Error(`Module '${this.name}' is already initialized`);
    }

    this.state = 'initializing';
    this.container = container;
    this.eventBus = eventBus;

    try {
      // Resolve dependencies
      await this.resolveDependencies();
      
      // Call custom initialization
      await this.onInitialize();
      
      // Initialize child modules
      await this.initializeChildren();
      
      this.state = 'initialized';
      this.emit('module:initialized', { module: this.name });
      
      console.log(`[Module] Initialized: ${this.name}`);
    } catch (error) {
      this.state = 'uninitialized';
      console.error(`[Module] Failed to initialize '${this.name}':`, error);
      throw error;
    }
  }

  /**
   * Custom initialization hook - override in subclasses
   * @returns {Promise} Initialization promise
   */
  async onInitialize() {
    // Override in subclasses
  }

  /**
   * Resolve module dependencies
   * @returns {Promise} Resolution promise
   */
  async resolveDependencies() {
    for (const dep of this.dependencies) {
      if (!this.container.has(dep)) {
        throw new Error(`Dependency '${dep}' not found for module '${this.name}'`);
      }
    }
  }

  /**
   * Initialize child modules
   * @returns {Promise} Initialization promise
   */
  async initializeChildren() {
    const promises = Array.from(this.childModules.values()).map(child => 
      child.initialize(this.container, this.eventBus)
    );
    await Promise.all(promises);
  }

  /**
   * Destroy the module
   * @returns {Promise} Destruction promise
   */
  async destroy() {
    if (this.state === 'destroyed') {
      return;
    }

    try {
      // Destroy child modules first
      await this.destroyChildren();
      
      // Custom cleanup
      await this.onDestroy();
      
      // Clear subscriptions
      this.clearSubscriptions();
      
      this.state = 'destroyed';
      this.emit('module:destroyed', { module: this.name });
      
      console.log(`[Module] Destroyed: ${this.name}`);
    } catch (error) {
      console.error(`[Module] Failed to destroy '${this.name}':`, error);
      throw error;
    }
  }

  /**
   * Custom destruction hook - override in subclasses
   * @returns {Promise} Destruction promise
   */
  async onDestroy() {
    // Override in subclasses
  }

  /**
   * Destroy child modules
   * @returns {Promise} Destruction promise
   */
  async destroyChildren() {
    const promises = Array.from(this.childModules.values()).map(child => child.destroy());
    await Promise.all(promises);
    this.childModules.clear();
  }

  /**
   * Add a child module
   * @param {Module} module - Child module
   */
  addChild(module) {
    module.parent = this;
    this.childModules.set(module.name, module);
    
    // Initialize if parent is already initialized
    if (this.state === 'initialized') {
      module.initialize(this.container, this.eventBus);
    }
  }

  /**
   * Remove a child module
   * @param {string} name - Module name
   * @returns {Promise} Removal promise
   */
  async removeChild(name) {
    const child = this.childModules.get(name);
    if (child) {
      await child.destroy();
      this.childModules.delete(name);
      child.parent = null;
    }
  }

  /**
   * Get a service from the container
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  service(name) {
    if (!this.container) {
      throw new Error(`Module '${this.name}' not initialized - cannot resolve service '${name}'`);
    }
    return this.container.resolve(name);
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @param {Object} options - Subscription options
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback, options = {}) {
    if (!this.eventBus) {
      throw new Error(`Module '${this.name}' not initialized - cannot subscribe to events`);
    }

    const unsubscribe = this.eventBus.subscribe(event, callback, options);
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {Promise} Publication promise
   */
  emit(event, data) {
    if (!this.eventBus) {
      // During initialization, eventBus might not be ready yet - log but don't throw
      if (this.state === 'initializing') {
        console.debug(`[Module] ${this.name} trying to emit '${event}' during initialization - deferred`);
        return Promise.resolve();
      }
      throw new Error(`Module '${this.name}' not initialized - cannot emit events`);
    }
    return this.eventBus.publish(event, data);
  }

  /**
   * Clear all subscriptions
   */
  clearSubscriptions() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }

  /**
   * Get module configuration value
   * @param {string} key - Configuration key
   * @param {*} defaultValue - Default value
   * @returns {*} Configuration value
   */
  getConfig(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * Set module configuration value
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   */
  setConfig(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let current = this.config;
    
    for (const k of keys) {
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[lastKey] = value;
  }

  /**
   * Check if module is initialized
   * @returns {boolean} Initialization status
   */
  isInitialized() {
    return this.state === 'initialized';
  }

  /**
   * Get module info
   * @returns {Object} Module information
   */
  getInfo() {
    return {
      name: this.name,
      state: this.state,
      dependencies: this.dependencies,
      children: Array.from(this.childModules.keys()),
      parent: this.parent?.name || null,
      subscriptions: this.subscriptions.length
    };
  }

  /**
   * Create a child module
   * @param {string} name - Module name
   * @param {Array} dependencies - Module dependencies
   * @param {Object} config - Module configuration
   * @returns {Module} Child module
   */
  createChild(name, dependencies = [], config = {}) {
    const child = new Module(name, dependencies, config);
    this.addChild(child);
    return child;
  }

  /**
   * Wait for module to be initialized
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Initialization promise
   */
  waitForInitialization(timeout = 5000) {
    if (this.isInitialized()) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Module '${this.name}' initialization timeout`));
      }, timeout);

      const unsubscribe = this.subscribe('module:initialized', (data) => {
        if (data.module === this.name) {
          clearTimeout(timer);
          unsubscribe();
          resolve();
        }
      });
    });
  }
}

export default Module;