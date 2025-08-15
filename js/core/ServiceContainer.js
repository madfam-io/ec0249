/**
 * Service Container - Dependency injection and service management
 * Provides centralized service registration and resolution
 */
class ServiceContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
    this.factories = new Map();
    this.aliases = new Map();
    this.dependencies = new Map();
    this.isBooting = false;
    this.isBooted = false;
  }

  /**
   * Register a service
   * @param {string} name - Service name
   * @param {Function|Object} service - Service class/factory or instance
   * @param {Object} options - Registration options
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

    console.log(`[ServiceContainer] Registered service: ${name}`);
    return this;
  }

  /**
   * Register a singleton service
   * @param {string} name - Service name
   * @param {Function|Object} service - Service class or instance
   * @param {Object} options - Registration options
   */
  singleton(name, service, options = {}) {
    return this.register(name, service, { ...options, singleton: true });
  }

  /**
   * Register a factory service (new instance each time)
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   * @param {Object} options - Registration options
   */
  factory(name, factory, options = {}) {
    return this.register(name, factory, { ...options, singleton: false, factory: true });
  }

  /**
   * Resolve a service
   * @param {string} name - Service name
   * @returns {*} Service instance
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
    
    if (config.factory) {
      // Call factory function
      instance = service.call(this, this);
    } else if (typeof service === 'function') {
      // Resolve dependencies and instantiate
      const dependencies = this.resolveDependencies(actualName);
      instance = new service(...dependencies);
    } else {
      // Return object as-is
      instance = service;
    }

    // Store singleton
    if (config.singleton) {
      this.singletons.set(actualName, instance);
    }

    console.log(`[ServiceContainer] Resolved service: ${actualName}`);
    return instance;
  }

  /**
   * Resolve dependencies for a service
   * @param {string} serviceName - Service name
   * @returns {Array} Resolved dependencies
   */
  resolveDependencies(serviceName) {
    const deps = this.dependencies.get(serviceName) || [];
    return deps.map(dep => this.resolve(dep));
  }

  /**
   * Check if service is registered
   * @param {string} name - Service name
   * @returns {boolean} Registration status
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
   * Boot all services
   * @returns {Promise} Boot completion promise
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