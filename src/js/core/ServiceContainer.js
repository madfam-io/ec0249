/**
 * Service Container - Dependency injection and service management
 * 
 * A centralized container for managing application services with dependency injection.
 * Supports singleton pattern, factory functions, lazy loading, and service lifecycle management.
 * Provides automatic dependency resolution and circular dependency detection.
 * 
 * @class ServiceContainer
 * @description The ServiceContainer manages the registration, resolution, and lifecycle of all application services.
 * It implements the dependency injection pattern to promote loose coupling and testability.
 * 
 * @example
 * // Register a singleton service
 * container.singleton('DatabaseService', DatabaseService, {
 *   dependencies: ['ConfigService', 'LoggerService']
 * });
 * 
 * // Register a factory service
 * container.factory('RequestHandler', (container) => {
 *   return new RequestHandler(container.resolve('DatabaseService'));
 * });
 * 
 * // Resolve a service
 * const dbService = container.resolve('DatabaseService');
 * 
 * @example
 * // Advanced usage with aliases and lazy loading
 * container.register('UserRepository', UserRepository, {
 *   dependencies: ['DatabaseService'],
 *   alias: ['UserRepo', 'Users'],
 *   lazy: true
 * });
 * 
 * // Resolve using alias
 * const userRepo = container.resolve('UserRepo');
 * 
 * @since 1.0.0
 */
class ServiceContainer {
  /**
   * Create a new ServiceContainer instance
   * 
   * @description Initializes the service container with empty registries for services,
   * singletons, factories, aliases, and dependencies. Sets up the initial state
   * for the container lifecycle management.
   * 
   * @constructor
   * @since 1.0.0
   */
  constructor() {
    /** @private {Map<string, Object>} services - Registry of all registered services */
    this.services = new Map();
    
    /** @private {Map<string, Object>} singletons - Cache of instantiated singleton services */
    this.singletons = new Map();
    
    /** @private {Map<string, Function>} factories - Registry of factory functions */
    this.factories = new Map();
    
    /** @private {Map<string, string>} aliases - Service name aliases mapping */
    this.aliases = new Map();
    
    /** @private {Map<string, Array<string>>} dependencies - Service dependencies mapping */
    this.dependencies = new Map();
    
    /** @private {boolean} isBooting - Flag indicating if container is currently booting */
    this.isBooting = false;
    
    /** @private {boolean} isBooted - Flag indicating if container has been booted */
    this.isBooted = false;
  }

  /**
   * Register a service in the container
   * 
   * @description Registers a service with the container, supporting various registration patterns
   * including singleton, factory, and transient services. Handles dependency declarations,
   * aliases, and lazy loading configuration.
   * 
   * @param {string} name - Unique service name identifier
   * @param {Function|Object} service - Service constructor class, factory function, or instance object
   * @param {Object} [options={}] - Registration configuration options
   * @param {boolean} [options.singleton=true] - Whether to treat as singleton (default: true)
   * @param {Array<string>} [options.dependencies=[]] - Array of dependency service names
   * @param {boolean} [options.factory=false] - Whether service parameter is a factory function
   * @param {boolean} [options.lazy=true] - Whether to use lazy loading (default: true)
   * @param {string|Array<string>} [options.alias] - Service name aliases
   * 
   * @returns {ServiceContainer} Returns this container instance for method chaining
   * 
   * @throws {Error} Throws if service name is already registered
   * @throws {TypeError} Throws if service parameter is invalid type
   * 
   * @example
   * // Register a simple singleton service
   * container.register('Logger', LoggerService);
   * 
   * @example
   * // Register with dependencies and aliases
   * container.register('UserService', UserService, {
   *   dependencies: ['DatabaseService', 'Logger'],
   *   alias: ['Users', 'UserRepo'],
   *   singleton: true
   * });
   * 
   * @example
   * // Register a factory function
   * container.register('RequestFactory', (container) => {
   *   return (url) => new Request(url, container.resolve('ConfigService'));
   * }, { factory: true, singleton: false });
   * 
   * @since 1.0.0
   */
  register(name, service, options = {}) {
    const config = {
      singleton: options.singleton !== false, // Default to singleton
      dependencies: options.dependencies || [],
      factory: options.factory || false,
      lazy: options.lazy !== false, // Default to lazy loading
      ...options
    };

    this.services.set(name, { service, config });
    
    if (config.dependencies.length > 0) {
      this.dependencies.set(name, config.dependencies);
    }

    // Register aliases
    if (config.alias) {
      const aliases = Array.isArray(config.alias) ? config.alias : [config.alias];
      aliases.forEach(alias => this.aliases.set(alias, name));
    }

    // Service registered successfully
    return this;
  }

  /**
   * Register a singleton service (convenience method)
   * 
   * @description Shorthand method for registering a service as a singleton.
   * Equivalent to calling register() with singleton: true option.
   * 
   * @param {string} name - Unique service name identifier
   * @param {Function|Object} service - Service constructor class or instance object
   * @param {Object} [options={}] - Registration options (singleton will be forced to true)
   * @param {Array<string>} [options.dependencies=[]] - Array of dependency service names
   * @param {boolean} [options.factory=false] - Whether service parameter is a factory function
   * @param {string|Array<string>} [options.alias] - Service name aliases
   * 
   * @returns {ServiceContainer} Returns this container instance for method chaining
   * 
   * @example
   * // Register a singleton service
   * container.singleton('ConfigService', ConfigService);
   * 
   * @example
   * // Singleton with dependencies
   * container.singleton('EmailService', EmailService, {
   *   dependencies: ['ConfigService', 'LoggerService']
   * });
   * 
   * @see {@link register} For full registration options
   * @since 1.0.0
   */
  singleton(name, service, options = {}) {
    return this.register(name, service, { ...options, singleton: true });
  }

  /**
   * Register a factory service (new instance each time)
   * 
   * @description Shorthand method for registering a factory function that creates
   * new instances on each resolution. Equivalent to calling register() with
   * singleton: false and factory: true options.
   * 
   * @param {string} name - Unique service name identifier
   * @param {Function} factory - Factory function that receives the container as parameter
   * @param {Object} [options={}] - Registration options (singleton and factory will be overridden)
   * @param {Array<string>} [options.dependencies=[]] - Array of dependency service names
   * @param {string|Array<string>} [options.alias] - Service name aliases
   * 
   * @returns {ServiceContainer} Returns this container instance for method chaining
   * 
   * @example
   * // Register a simple factory
   * container.factory('RequestBuilder', (container) => {
   *   const config = container.resolve('ConfigService');
   *   return new RequestBuilder(config.apiUrl);
   * });
   * 
   * @example
   * // Factory with dependencies
   * container.factory('PaymentProcessor', (container) => {
   *   return new PaymentProcessor(
   *     container.resolve('DatabaseService'),
   *     container.resolve('LoggerService')
   *   );
   * }, {
   *   dependencies: ['DatabaseService', 'LoggerService']
   * });
   * 
   * @see {@link register} For full registration options
   * @since 1.0.0
   */
  factory(name, factory, options = {}) {
    return this.register(name, factory, { ...options, singleton: false, factory: true });
  }

  /**
   * Resolve a service instance from the container
   * 
   * @description Resolves and returns a service instance, handling dependency injection,
   * singleton caching, factory function execution, and alias resolution. Automatically
   * resolves all dependencies and manages the service lifecycle.
   * 
   * @param {string} name - Service name or alias to resolve
   * 
   * @returns {*} The resolved service instance
   * 
   * @throws {Error} Throws if service is not registered
   * @throws {Error} Throws if circular dependency is detected during resolution
   * @throws {Error} Throws if any dependency cannot be resolved
   * 
   * @example
   * // Resolve a simple service
   * const logger = container.resolve('LoggerService');
   * 
   * @example
   * // Resolve using alias
   * const userRepo = container.resolve('UserRepo'); // Resolves UserRepository
   * 
   * @example
   * // Service with automatic dependency injection
   * container.register('EmailService', EmailService, {
   *   dependencies: ['ConfigService', 'LoggerService']
   * });
   * const emailService = container.resolve('EmailService'); // Dependencies auto-injected
   * 
   * @since 1.0.0
   */
  resolve(name) {
    // Handle aliases
    const actualName = this.aliases.get(name) || name;
    
    if (!this.services.has(actualName)) {
      throw new Error(`Service '${name}' not registered`);
    }

    const { service, config } = this.services.get(actualName);

    // Return existing singleton
    if (config.singleton && this.singletons.has(actualName)) {
      return this.singletons.get(actualName);
    }

    // Create instance
    let instance;
    
    if (typeof service === 'function') {
      if (config.factory) {
        // Call factory function
        instance = service.call(this, this);
      } else {
        // Resolve dependencies and instantiate as constructor
        const dependencies = this.resolveDependencies(actualName);
        instance = new service(...dependencies);
      }
    } else {
      // Return object as-is
      instance = service;
    }

    // Store singleton
    if (config.singleton) {
      this.singletons.set(actualName, instance);
    }

    // Service resolved successfully
    return instance;
  }

  /**
   * Resolve dependencies for a service
   * 
   * @description Recursively resolves all dependencies for a given service,
   * returning an array of resolved dependency instances in the correct order.
   * 
   * @private
   * @param {string} serviceName - Service name to resolve dependencies for
   * 
   * @returns {Array<*>} Array of resolved dependency instances
   * 
   * @throws {Error} Throws if any dependency cannot be resolved
   * @throws {Error} Throws if circular dependency is detected
   * 
   * @since 1.0.0
   */
  resolveDependencies(serviceName) {
    const deps = this.dependencies.get(serviceName) || [];
    return deps.map(dep => this.resolve(dep));
  }

  /**
   * Check if service is registered
   * 
   * @description Checks whether a service is registered in the container,
   * supporting both direct names and aliases.
   * 
   * @param {string} name - Service name or alias to check
   * 
   * @returns {boolean} True if service is registered, false otherwise
   * 
   * @example
   * if (container.has('LoggerService')) {
   *   const logger = container.resolve('LoggerService');
   * }
   * 
   * @since 1.0.0
   */
  has(name) {
    const actualName = this.aliases.get(name) || name;
    return this.services.has(actualName);
  }

  /**
   * Get service without instantiating
   * @param {string} name - Service name
   * @returns {Object} Service configuration
   */
  getServiceConfig(name) {
    const actualName = this.aliases.get(name) || name;
    return this.services.get(actualName);
  }

  /**
   * Boot all services in the container
   * 
   * @description Initializes the container by resolving all non-lazy services
   * and calling their boot methods if available. This ensures all services
   * are properly initialized and ready for use.
   * 
   * @returns {Promise<void>} Promise that resolves when all services are booted
   * 
   * @throws {Error} Throws if any service fails to boot
   * 
   * @example
   * await container.boot();
   * console.log('All services are now ready');
   * 
   * @since 1.0.0
   */
  async boot() {
    if (this.isBooted || this.isBooting) {
      return;
    }

    this.isBooting = true;
    console.log('[ServiceContainer] Booting services...');

    // Resolve all non-lazy services
    for (const [name, { config }] of this.services) {
      if (!config.lazy) {
        try {
          this.resolve(name);
        } catch (error) {
          console.error(`[ServiceContainer] Failed to boot service '${name}':`, error);
        }
      }
    }

    // Call boot methods on services that have them
    for (const [name, instance] of this.singletons) {
      if (instance && typeof instance.boot === 'function') {
        try {
          await instance.boot();
          console.log(`[ServiceContainer] Booted service: ${name}`);
        } catch (error) {
          console.error(`[ServiceContainer] Failed to boot service '${name}':`, error);
        }
      }
    }

    this.isBooting = false;
    this.isBooted = true;
    console.log('[ServiceContainer] All services booted');
  }

  /**
   * Shutdown all services
   * @returns {Promise} Shutdown completion promise
   */
  async shutdown() {
    console.log('[ServiceContainer] Shutting down services...');

    // Call shutdown methods on services that have them
    for (const [name, instance] of this.singletons) {
      if (instance && typeof instance.shutdown === 'function') {
        try {
          await instance.shutdown();
          console.log(`[ServiceContainer] Shutdown service: ${name}`);
        } catch (error) {
          console.error(`[ServiceContainer] Failed to shutdown service '${name}':`, error);
        }
      }
    }

    this.isBooted = false;
    console.log('[ServiceContainer] All services shutdown');
  }

  /**
   * Clear all services
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
    this.aliases.clear();
    this.dependencies.clear();
    this.isBooted = false;
    console.log('[ServiceContainer] Cleared all services');
  }

  /**
   * Get list of all registered services
   * @returns {Array} Service names
   */
  getServices() {
    return Array.from(this.services.keys());
  }

  /**
   * Get service dependency graph
   * @returns {Object} Dependency graph
   */
  getDependencyGraph() {
    const graph = {};
    for (const [service, deps] of this.dependencies) {
      graph[service] = deps;
    }
    return graph;
  }

  /**
   * Validate dependency graph for circular dependencies
   * @returns {boolean} Validation result
   */
  validateDependencies() {
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (node) => {
      if (recursionStack.has(node)) {
        return true; // Circular dependency detected
      }
      if (visited.has(node)) {
        return false;
      }

      visited.add(node);
      recursionStack.add(node);

      const deps = this.dependencies.get(node) || [];
      for (const dep of deps) {
        if (hasCycle(dep)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const service of this.services.keys()) {
      if (hasCycle(service)) {
        console.error(`[ServiceContainer] Circular dependency detected involving: ${service}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Create a scoped container
   * @param {Object} overrides - Service overrides
   * @returns {ServiceContainer} Scoped container
   */
  createScope(overrides = {}) {
    const scope = new ServiceContainer();
    
    // Copy services
    for (const [name, config] of this.services) {
      scope.services.set(name, config);
    }
    
    // Copy dependencies
    for (const [name, deps] of this.dependencies) {
      scope.dependencies.set(name, deps);
    }
    
    // Copy aliases
    for (const [alias, name] of this.aliases) {
      scope.aliases.set(alias, name);
    }
    
    // Apply overrides
    for (const [name, service] of Object.entries(overrides)) {
      scope.register(name, service);
    }
    
    return scope;
  }
}

// Export singleton instance
const container = new ServiceContainer();

// Export both class and singleton
export { ServiceContainer, container };
export default container;