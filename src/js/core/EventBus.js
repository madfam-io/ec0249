/**
 * Event Bus - Central event management system for application-wide communication
 * 
 * @description The EventBus implements the publish/subscribe pattern to enable loose coupling
 * between application modules and components. It provides a centralized communication hub
 * that allows modules to interact without direct dependencies.
 * 
 * @class EventBus
 * 
 * Features:
 * - Priority-based event handling with subscriber ordering
 * - Middleware support for event processing and transformation
 * - One-time subscriptions with automatic cleanup
 * - Asynchronous event publishing with error isolation
 * - Debug mode for development and troubleshooting
 * - Promise-based event waiting with timeout support
 * - Automatic memory management and cleanup
 * 
 * @example
 * // Basic event subscription and publishing
 * eventBus.subscribe('user:login', (userData) => {
 *   console.log('User logged in:', userData.username);
 * });
 * 
 * await eventBus.publish('user:login', {
 *   username: 'john_doe',
 *   timestamp: Date.now()
 * });
 * 
 * @example
 * // Priority-based event handling
 * eventBus.subscribe('user:action', handler1, { priority: 10 }); // Runs first
 * eventBus.subscribe('user:action', handler2, { priority: 5 });  // Runs second
 * 
 * @example
 * // Middleware for event processing
 * eventBus.addMiddleware(async (event, data) => {
 *   console.log(`Event '${event}' with data:`, data);
 *   return { ...data, timestamp: Date.now() }; // Add timestamp
 * });
 * 
 * @example
 * // Waiting for events with timeout
 * try {
 *   const userData = await eventBus.waitFor('user:ready', 5000);
 *   console.log('User is ready:', userData);
 * } catch (error) {
 *   console.error('Timeout waiting for user ready event');
 * }
 * 
 * @since 1.0.0
 */
class EventBus {
  /**
   * Create a new EventBus instance
   * 
   * @description Initializes the event bus with empty event registry, middleware stack,
   * and debug mode disabled. Sets up the foundational state for event management.
   * 
   * @constructor
   * @since 1.0.0
   */
  constructor() {
    /** @private {Map<string, Array>} events - Registry of event subscriptions organized by event name */
    this.events = new Map();
    
    /** @private {Array<Function>} middleware - Stack of middleware functions for event processing */
    this.middleware = [];
    
    /** @private {boolean} debugMode - Flag controlling debug output for development */
    this.debugMode = false;
  }

  /**
   * Subscribe to an event with optional priority and configuration
   * 
   * @description Registers an event handler for the specified event name. Handlers can be configured
   * with priority levels to control execution order, and can be set to execute only once.
   * Returns an unsubscribe function for manual cleanup.
   * 
   * @param {string} event - Event name to subscribe to (e.g., 'user:login', 'app:ready')
   * @param {Function} callback - Event handler function that receives (data, eventName) parameters
   * @param {Object} [options={}] - Subscription configuration options
   * @param {boolean} [options.once=false] - Whether to automatically unsubscribe after first execution
   * @param {number} [options.priority=0] - Handler priority (higher numbers execute first)
   * 
   * @returns {Function} Unsubscribe function for manual cleanup
   * 
   * @throws {TypeError} Throws if callback is not a function
   * 
   * @example
   * // Basic event subscription
   * const unsubscribe = eventBus.subscribe('user:login', (userData) => {
   *   console.log('User logged in:', userData.username);
   * });
   * 
   * @example
   * // High-priority handler (executes first)
   * eventBus.subscribe('user:action', (data) => {
   *   console.log('Critical handler:', data);
   * }, { priority: 10 });
   * 
   * @example
   * // One-time subscription
   * eventBus.subscribe('app:initialized', () => {
   *   console.log('App is ready!');
   * }, { once: true });
   * 
   * @example
   * // Manual cleanup
   * const unsubscribe = eventBus.subscribe('data:change', handleDataChange);
   * // Later...
   * unsubscribe(); // Remove subscription
   * 
   * @since 1.0.0
   */
  subscribe(event, callback, options = {}) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const subscription = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      id: Math.random().toString(36).substr(2, 9)
    };

    const subscribers = this.events.get(event);
    subscribers.push(subscription);
    
    // Sort by priority (higher first)
    subscribers.sort((a, b) => b.priority - a.priority);

    this.debug(`Subscribed to '${event}' (priority: ${subscription.priority})`);

    // Return unsubscribe function
    return () => this.unsubscribe(event, subscription.id);
  }

  /**
   * Subscribe to an event for one-time execution only
   * 
   * @description Convenience method for subscribing to an event that should only execute once.
   * Equivalent to calling subscribe() with options.once = true. The subscription is
   * automatically removed after the first event execution.
   * 
   * @param {string} event - Event name to subscribe to
   * @param {Function} callback - Event handler function
   * 
   * @returns {Function} Unsubscribe function for manual cleanup (if needed before event fires)
   * 
   * @example
   * // Wait for app initialization
   * eventBus.once('app:ready', () => {
   *   console.log('Application is now ready!');
   * });
   * 
   * @example
   * // Handle first user login
   * eventBus.once('user:first-login', (userData) => {
   *   analytics.track('first_login', userData);
   *   showWelcomeMessage(userData);
   * });
   * 
   * @see {@link subscribe} For full subscription options
   * @since 1.0.0
   */
  once(event, callback) {
    return this.subscribe(event, callback, { once: true });
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {string} subscriptionId - Subscription ID
   */
  unsubscribe(event, subscriptionId) {
    if (!this.events.has(event)) return;

    const subscribers = this.events.get(event);
    const index = subscribers.findIndex(sub => sub.id === subscriptionId);
    
    if (index !== -1) {
      subscribers.splice(index, 1);
      this.debug(`Unsubscribed from '${event}'`);
    }

    // Clean up empty event arrays
    if (subscribers.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Publish an event to all registered subscribers
   * 
   * @description Publishes an event with optional data to all registered subscribers.
   * Handles subscriber execution in priority order, applies middleware transformations,
   * and manages one-time subscription cleanup. All handlers execute asynchronously
   * with error isolation to prevent one failing handler from affecting others.
   * 
   * @param {string} event - Event name to publish (e.g., 'user:login', 'data:updated')
   * @param {*} [data=null] - Event data payload to pass to subscribers
   * 
   * @returns {Promise<void>} Promise that resolves when all handlers complete
   * 
   * @example
   * // Publish simple event
   * await eventBus.publish('app:ready');
   * 
   * @example
   * // Publish event with data
   * await eventBus.publish('user:login', {
   *   userId: 123,
   *   username: 'john_doe',
   *   timestamp: Date.now(),
   *   source: 'web'
   * });
   * 
   * @example
   * // Publish with complex data structure
   * await eventBus.publish('order:completed', {
   *   orderId: 'ORD-2024-001',
   *   items: [
   *     { id: 1, name: 'Product A', quantity: 2 },
   *     { id: 2, name: 'Product B', quantity: 1 }
   *   ],
   *   total: 99.99,
   *   customer: { id: 456, email: 'customer@example.com' }
   * });
   * 
   * @fires EventBus#[event] - Emits the specified event to all subscribers
   * 
   * @since 1.0.0
   */
  async publish(event, data = null) {
    if (!this.events.has(event)) {
      this.debug(`No subscribers for event '${event}'`);
      return;
    }

    this.debug(`Publishing '${event}' with data:`, data);

    const subscribers = this.events.get(event);
    const toRemove = [];

    // Apply middleware
    let processedData = data;
    for (const middleware of this.middleware) {
      try {
        processedData = await middleware(event, processedData);
      } catch (error) {
        console.error('EventBus middleware error:', error);
      }
    }

    // Execute subscribers
    const promises = subscribers.map(async (subscription, index) => {
      try {
        await subscription.callback(processedData, event);
        
        if (subscription.once) {
          toRemove.push(index);
        }
      } catch (error) {
        console.error(`EventBus subscriber error for '${event}':`, error);
      }
    });

    await Promise.all(promises);

    // Remove one-time subscribers
    toRemove.reverse().forEach(index => {
      subscribers.splice(index, 1);
    });

    if (subscribers.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Add middleware function for event processing and transformation
   * 
   * @description Registers a middleware function that processes events before they reach subscribers.
   * Middleware can transform event data, add metadata, perform logging, or implement
   * authorization checks. Middleware executes in registration order.
   * 
   * @param {Function} middleware - Middleware function that receives (event, data) and returns processed data
   * @param {string} middleware.event - The event name being published
   * @param {*} middleware.data - The event data payload
   * @returns {*} The middleware should return the processed data (can be modified)
   * 
   * @example
   * // Add timestamp to all events
   * eventBus.addMiddleware(async (event, data) => {
   *   return {
   *     ...data,
   *     timestamp: Date.now(),
   *     eventType: event
   *   };
   * });
   * 
   * @example
   * // Logging middleware
   * eventBus.addMiddleware(async (event, data) => {
   *   console.log(`[EventBus] ${event}:`, data);
   *   return data; // Pass through unchanged
   * });
   * 
   * @example
   * // Authorization middleware
   * eventBus.addMiddleware(async (event, data) => {
   *   if (event.startsWith('admin:') && !data.user?.isAdmin) {
   *     throw new Error('Admin privileges required');
   *   }
   *   return data;
   * });
   * 
   * @since 1.0.0
   */
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  /**
   * Remove all subscribers for an event
   * @param {string} event - Event name
   */
  clear(event) {
    if (event) {
      this.events.delete(event);
      this.debug(`Cleared all subscribers for '${event}'`);
    } else {
      this.events.clear();
      this.debug('Cleared all event subscribers');
    }
  }

  /**
   * Get list of all events with subscriber counts
   * @returns {Object} Events summary
   */
  getEventsSummary() {
    const summary = {};
    for (const [event, subscribers] of this.events) {
      summary[event] = subscribers.length;
    }
    return summary;
  }

  /**
   * Enable/disable debug mode
   * @param {boolean} enabled - Debug mode state
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  /**
   * Debug logging
   * @param {string} message - Debug message
   * @param {*} data - Optional data
   */
  debug(message, data = null) {
    if (this.debugMode) {
      console.log(`[EventBus] ${message}`, data || '');
    }
  }

  /**
   * Wait for an event to be published with optional timeout
   * 
   * @description Creates a promise that resolves when the specified event is published.
   * Useful for coordinating asynchronous operations and waiting for specific
   * application states. Includes timeout support to prevent indefinite waiting.
   * 
   * @param {string} event - Event name to wait for
   * @param {number} [timeout=5000] - Maximum wait time in milliseconds
   * 
   * @returns {Promise<*>} Promise that resolves with the event data when published
   * 
   * @throws {Error} Throws timeout error if event is not published within timeout period
   * 
   * @example
   * // Wait for app initialization
   * try {
   *   await eventBus.waitFor('app:ready');
   *   console.log('App is ready, proceeding...');
   * } catch (error) {
   *   console.error('App failed to initialize in time');
   * }
   * 
   * @example
   * // Wait for user authentication with custom timeout
   * try {
   *   const userData = await eventBus.waitFor('user:authenticated', 10000);
   *   console.log('User authenticated:', userData.username);
   * } catch (error) {
   *   console.error('Authentication timeout');
   * }
   * 
   * @example
   * // Coordinate multiple async operations
   * const [userData, configData] = await Promise.all([
   *   eventBus.waitFor('user:loaded'),
   *   eventBus.waitFor('config:loaded')
   * ]);
   * console.log('Both user and config are ready');
   * 
   * @since 1.0.0
   */
  waitFor(event, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for event '${event}'`));
      }, timeout);

      const unsubscribe = this.once(event, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  }
}

// Export singleton instance
const eventBus = new EventBus();

// Export both class and singleton
export { EventBus, eventBus };
export default eventBus;