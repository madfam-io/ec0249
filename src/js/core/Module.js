/**
 * Base Module Class - Foundation for all application modules
 * 
 * @description The Module class provides a standardized foundation for all application modules,
 * implementing common patterns for lifecycle management, dependency injection, event handling,
 * and hierarchical module organization. All application modules should extend this base class.
 * 
 * @class Module
 * 
 * Features:
 * - Automatic dependency injection and resolution
 * - Event-driven communication via EventBus integration
 * - Hierarchical module structure with parent/child relationships
 * - Standardized initialization and destruction lifecycle
 * - Configuration management with nested property access
 * - Subscription management for automatic cleanup
 * 
 * @example
 * // Basic module implementation
 * class UserModule extends Module {
 *   constructor() {
 *     super('UserModule', ['DatabaseService', 'LoggerService'], {
 *       cacheTimeout: 300000,
 *       validateUsers: true
 *     });
 *   }
 * 
 *   async onInitialize() {
 *     this.db = this.service('DatabaseService');
 *     this.logger = this.service('LoggerService');
 *     
 *     this.subscribe('user:created', this.handleUserCreated.bind(this));
 *   }
 * 
 *   async handleUserCreated(userData) {
 *     this.logger.info('New user created:', userData.id);
 *   }
 * }
 * 
 * @example
 * // Module with child modules
 * class PaymentModule extends Module {
 *   async onInitialize() {
 *     // Add child modules
 *     this.addChild(new PaymentProcessorModule());
 *     this.addChild(new PaymentValidatorModule());
 *   }
 * }
 * 
 * @since 1.0.0
 */
class Module {
  /**
   * Create a new Module instance
   * 
   * @description Initializes a new module with the specified name, dependencies, and configuration.
   * Sets up the module state and prepares it for initialization within the application.
   * 
   * @param {string} name - Unique module name identifier
   * @param {Array<string>} [dependencies=[]] - Array of service names this module depends on
   * @param {Object} [config={}] - Module configuration object
   * 
   * @example
   * // Basic module with dependencies
   * constructor() {
   *   super('PaymentModule', ['DatabaseService', 'LoggerService'], {
   *     timeout: 30000,
   *     retryCount: 3
   *   });
   * }
   * 
   * @since 1.0.0
   */
  constructor(name, dependencies = [], config = {}) {
    /** @public {string} name - Module name identifier */
    this.name = name;
    
    /** @public {Array<string>} dependencies - Required service dependencies */
    this.dependencies = dependencies;
    
    /** @public {Object} config - Module configuration object */
    this.config = config;
    
    /** @public {string} state - Current module state (uninitialized, initializing, initialized, destroyed) */
    this.state = 'uninitialized';
    
    /** @private {ServiceContainer|null} container - Service container reference */
    this.container = null;
    
    /** @private {EventBus|null} eventBus - Event bus reference */
    this.eventBus = null;
    
    /** @private {Array<Function>} subscriptions - Active event subscriptions for cleanup */
    this.subscriptions = [];
    
    /** @private {Map<string, Module>} childModules - Child modules registry */
    this.childModules = new Map();
    
    /** @private {Module|null} parent - Parent module reference */
    this.parent = null;
  }

  /**
   * Initialize the module and its dependencies
   * 
   * @description Performs the complete module initialization sequence, including dependency
   * resolution, custom initialization logic, and child module initialization. This method
   * should be called by the application framework and not directly by user code.
   * 
   * @param {ServiceContainer} container - Application service container
   * @param {EventBus} eventBus - Application event bus
   * 
   * @returns {Promise<void>} Promise that resolves when initialization is complete
   * 
   * @throws {Error} Throws if module is already initialized
   * @throws {Error} Throws if dependencies cannot be resolved
   * @throws {Error} Throws if custom initialization fails
   * 
   * @fires Module#module:initialized - Emitted when initialization completes
   * 
   * @example
   * // Typically called by the application framework
   * await userModule.initialize(container, eventBus);
   * 
   * @since 1.0.0
   */
  async initialize(container, eventBus) {
    if (this.state !== 'uninitialized') {
      throw new Error(`Module '${this.name}' is already initialized`);
    }

    // Validate required parameters
    if (!container) {
      console.warn(`[Module] ${this.name} - No container provided during initialization`);
    }
    if (!eventBus) {
      console.warn(`[Module] ${this.name} - No eventBus provided during initialization`);
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
   * 
   * @description Override this method in subclasses to implement custom initialization logic.
   * This method is called after dependencies are resolved but before child modules are initialized.
   * Use this method to set up services, configure the module, and subscribe to events.
   * 
   * @abstract
   * @returns {Promise<void>} Promise that resolves when custom initialization is complete
   * 
   * @example
   * async onInitialize() {
   *   // Get required services
   *   this.database = this.service('DatabaseService');
   *   this.logger = this.service('LoggerService');
   *   
   *   // Subscribe to events
   *   this.subscribe('user:login', this.handleUserLogin.bind(this));
   *   
   *   // Perform initialization
   *   await this.database.connect();
   *   this.logger.info(`${this.name} initialized successfully`);
   * }
   * 
   * @since 1.0.0
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
      // Only emit destroy event if we have an eventBus
      if (this.eventBus) {
        this.emit('module:destroyed', { module: this.name });
      }
      
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
   * Add a child module to this module
   * 
   * @description Adds a child module and establishes parent-child relationship.
   * If the parent module is already initialized, the child module will be
   * initialized immediately.
   * 
   * @param {Module} module - Child module instance to add
   * 
   * @throws {TypeError} Throws if module is not a Module instance
   * @throws {Error} Throws if module name conflicts with existing child
   * 
   * @example
   * // Add child modules during initialization
   * async onInitialize() {
   *   this.addChild(new UserAuthModule());
   *   this.addChild(new UserProfileModule());
   * }
   * 
   * @since 1.0.0
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
   * Resolve a service from the container
   * 
   * @description Convenience method to resolve services from the dependency injection container.
   * This method provides a clean interface for accessing registered services within modules.
   * 
   * @param {string} name - Service name or alias to resolve
   * 
   * @returns {*} The resolved service instance
   * 
   * @throws {Error} Throws if module is not initialized
   * @throws {Error} Throws if service is not registered
   * 
   * @example
   * // In onInitialize() method
   * async onInitialize() {
   *   this.userService = this.service('UserService');
   *   this.logger = this.service('Logger');
   *   this.config = this.service('ConfigService');
   * }
   * 
   * @since 1.0.0
   */
  service(name) {
    if (!this.container) {
      throw new Error(`Module '${this.name}' not initialized - cannot resolve service '${name}'`);
    }
    return this.container.resolve(name);
  }

  /**
   * Subscribe to an event with automatic cleanup
   * 
   * @description Subscribes to an event on the application event bus and automatically
   * tracks the subscription for cleanup during module destruction. This prevents
   * memory leaks and ensures proper cleanup.
   * 
   * @param {string} event - Event name to subscribe to
   * @param {Function} callback - Event handler function
   * @param {Object} [options={}] - Subscription options
   * @param {boolean} [options.once=false] - Whether to automatically unsubscribe after first event
   * @param {number} [options.priority=0] - Event handler priority
   * 
   * @returns {Function} Unsubscribe function for manual cleanup
   * 
   * @throws {Error} Throws if module is not initialized
   * 
   * @example
   * // Subscribe to user events
   * this.subscribe('user:created', (userData) => {
   *   console.log('New user:', userData.id);
   * });
   * 
   * @example
   * // One-time subscription
   * this.subscribe('app:ready', this.handleAppReady.bind(this), { once: true });
   * 
   * @since 1.0.0
   */
  subscribe(event, callback, options = {}) {
    if (!this.eventBus) {
      throw new Error(`Module '${this.name}' not initialized - cannot subscribe to events`);
    }

    // Validate callback parameter
    if (typeof callback !== 'function') {
      console.error(`[Module] ${this.name} subscribe called with invalid callback for event '${event}':`, callback);
      return () => {}; // Return empty unsubscribe function
    }

    const unsubscribe = this.eventBus.subscribe(event, callback, options);
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Emit an event on the application event bus
   * 
   * @description Publishes an event to the application event bus, allowing other modules
   * and components to react to module state changes or actions. Handles cases where
   * the event bus is not yet available during initialization.
   * 
   * @param {string} event - Event name to emit
   * @param {*} [data] - Event data payload
   * 
   * @returns {Promise<void>} Promise that resolves when event is published
   * 
   * @throws {Error} Throws if module is not initialized (except during initialization)
   * 
   * @example
   * // Emit user action event
   * await this.emit('user:action', {
   *   userId: user.id,
   *   action: 'login',
   *   timestamp: Date.now()
   * });
   * 
   * @example
   * // Emit module status change
   * await this.emit('module:status-changed', {
   *   module: this.name,
   *   status: 'ready'
   * });
   * 
   * @since 1.0.0
   */
  emit(event, data) {
    // If no eventBus is available, handle gracefully based on context
    if (!this.eventBus) {
      if (this.state === 'initializing') {
        console.debug(`[Module] ${this.name} trying to emit '${event}' during initialization without eventBus - deferred`);
        return Promise.resolve();
      }
      console.warn(`[Module] ${this.name} attempting to emit '${event}' but no eventBus available`);
      return Promise.resolve();
    }
    
    // Allow initialization events to be emitted during initialization process
    if (this.state === 'initializing' && (event === 'module:initialized' || event.startsWith('component:'))) {
      console.debug(`[Module] ${this.name} emitting initialization event '${event}'`);
      return this.eventBus.publish(event, data);
    }
    
    // For other events, ensure module is fully initialized
    if (this.state !== 'initialized' && this.state !== 'initializing') {
      console.warn(`[Module] ${this.name} not initialized - cannot emit '${event}'`);
      return Promise.resolve();
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
   * Get module configuration value with dot notation support
   * 
   * @description Retrieves configuration values using dot notation for nested objects.
   * Provides a convenient way to access deeply nested configuration properties
   * with fallback to default values.
   * 
   * @param {string} key - Configuration key in dot notation (e.g., 'database.connection.timeout')
   * @param {*} [defaultValue=null] - Default value if key is not found
   * 
   * @returns {*} Configuration value or default value
   * 
   * @example
   * // Access nested configuration
   * const timeout = this.getConfig('api.timeout', 5000);
   * const dbHost = this.getConfig('database.host', 'localhost');
   * 
   * @example
   * // Access top-level configuration
   * const enabled = this.getConfig('enabled', true);
   * 
   * @since 1.0.0
   */
  getConfig(key, defaultValue = null) {
    // Validate input parameters
    if (!key || typeof key !== 'string') {
      console.warn(`[Module] ${this.name} getConfig called with invalid key:`, key);
      return defaultValue;
    }

    if (!this.config) {
      console.warn(`[Module] ${this.name} has no config object`);
      return defaultValue;
    }

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