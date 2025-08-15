/**
 * Event Bus - Central event management system
 * Provides publish/subscribe pattern for loose coupling between modules
 */
class EventBus {
  constructor() {
    this.events = new Map();
    this.middleware = [];
    this.debugMode = false;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @param {Object} options - Options (once, priority)
   * @returns {Function} Unsubscribe function
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
   * Subscribe to event only once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
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
   * Publish an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {Promise} Promise that resolves when all handlers complete
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
   * Add middleware to process events
   * @param {Function} middleware - Middleware function
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
   * Wait for an event to be published
   * @param {string} event - Event name
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Promise that resolves with event data
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