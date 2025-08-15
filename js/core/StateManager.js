/**
 * State Manager - Centralized state management with reactive updates
 * Provides immutable state, actions, and reactive subscriptions
 */
class StateManager {
  constructor(initialState = {}, options = {}) {
    this.state = this.deepFreeze({ ...initialState });
    this.listeners = new Map();
    this.middlewares = [];
    this.history = options.enableHistory ? [this.state] : null;
    this.maxHistorySize = options.maxHistorySize || 50;
    this.debugMode = options.debug || false;
    this.actionLog = [];
  }

  /**
   * Get current state (immutable)
   * @param {string} path - Optional path to specific state property
   * @returns {*} State value
   */
  getState(path = null) {
    if (path) {
      return this.getNestedValue(this.state, path);
    }
    return this.state;
  }

  /**
   * Set state with action dispatch
   * @param {string} action - Action name
   * @param {*} payload - Action payload
   * @returns {Promise} Dispatch promise
   */
  async dispatch(action, payload = null) {
    const actionObj = {
      type: action,
      payload,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };

    this.debug(`Dispatching action: ${action}`, payload);

    try {
      // Apply middleware
      let processedAction = actionObj;
      for (const middleware of this.middlewares) {
        processedAction = await middleware(processedAction, this.state);
        if (!processedAction) {
          this.debug(`Action ${action} canceled by middleware`);
          return;
        }
      }

      // Create new state
      const newState = await this.reduceState(this.state, processedAction);
      
      if (newState !== this.state) {
        this.updateState(newState, processedAction);
      }
    } catch (error) {
      console.error(`State dispatch error for action '${action}':`, error);
      throw error;
    }
  }

  /**
   * Update state and notify listeners
   * @param {Object} newState - New state
   * @param {Object} action - Action that triggered update
   */
  updateState(newState, action) {
    const previousState = this.state;
    this.state = this.deepFreeze(newState);

    // Add to history
    if (this.history) {
      this.history.push(this.state);
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }
    }

    // Log action
    this.actionLog.push({
      ...action,
      previousState: previousState,
      newState: this.state
    });

    // Keep action log size manageable
    if (this.actionLog.length > 100) {
      this.actionLog.shift();
    }

    this.debug(`State updated by action: ${action.type}`);

    // Notify listeners
    this.notifyListeners(previousState, this.state, action);
  }

  /**
   * Reduce state based on action (override in subclasses)
   * @param {Object} state - Current state
   * @param {Object} action - Action object
   * @returns {Object} New state
   */
  async reduceState(state, action) {
    // Default implementation - override in subclasses or use middleware
    switch (action.type) {
      case 'SET_STATE':
        return { ...state, ...action.payload };
      
      case 'SET_PROPERTY':
        return this.setNestedValue(state, action.payload.path, action.payload.value);
      
      case 'MERGE_STATE':
        return this.deepMerge(state, action.payload);
      
      default:
        console.warn(`Unhandled action type: ${action.type}`);
        return state;
    }
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Listener function
   * @param {Object} options - Subscription options
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener, options = {}) {
    const id = Math.random().toString(36).substr(2, 9);
    const subscription = {
      listener,
      immediate: options.immediate !== false,
      filter: options.filter || null,
      path: options.path || null,
      once: options.once || false,
      id
    };

    this.listeners.set(id, subscription);

    // Call immediately if requested
    if (subscription.immediate) {
      try {
        this.callListener(subscription, null, this.state, null);
      } catch (error) {
        console.error('Immediate state listener error:', error);
      }
    }

    this.debug(`Subscribed to state changes (ID: ${id})`);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(id);
      this.debug(`Unsubscribed from state changes (ID: ${id})`);
    };
  }

  /**
   * Subscribe to specific path changes
   * @param {string} path - State path to watch
   * @param {Function} listener - Listener function
   * @param {Object} options - Subscription options
   * @returns {Function} Unsubscribe function
   */
  watch(path, listener, options = {}) {
    return this.subscribe(listener, { ...options, path });
  }

  /**
   * Notify all listeners of state changes
   * @param {Object} previousState - Previous state
   * @param {Object} newState - New state
   * @param {Object} action - Action that triggered change
   */
  notifyListeners(previousState, newState, action) {
    const listenersToRemove = [];

    for (const [id, subscription] of this.listeners) {
      try {
        // Check if listener should be called
        if (this.shouldCallListener(subscription, previousState, newState, action)) {
          this.callListener(subscription, previousState, newState, action);
          
          if (subscription.once) {
            listenersToRemove.push(id);
          }
        }
      } catch (error) {
        console.error('State listener error:', error);
      }
    }

    // Remove one-time listeners
    listenersToRemove.forEach(id => this.listeners.delete(id));
  }

  /**
   * Check if listener should be called
   * @param {Object} subscription - Subscription object
   * @param {Object} previousState - Previous state
   * @param {Object} newState - New state
   * @param {Object} action - Action object
   * @returns {boolean} Should call
   */
  shouldCallListener(subscription, previousState, newState, action) {
    // Path-specific subscription
    if (subscription.path) {
      const prevValue = this.getNestedValue(previousState, subscription.path);
      const newValue = this.getNestedValue(newState, subscription.path);
      if (prevValue === newValue) {
        return false;
      }
    }

    // Filter function
    if (subscription.filter && !subscription.filter(action, newState, previousState)) {
      return false;
    }

    return true;
  }

  /**
   * Call a listener function
   * @param {Object} subscription - Subscription object
   * @param {Object} previousState - Previous state
   * @param {Object} newState - New state
   * @param {Object} action - Action object
   */
  callListener(subscription, previousState, newState, action) {
    if (subscription.path) {
      const prevValue = previousState ? this.getNestedValue(previousState, subscription.path) : undefined;
      const newValue = this.getNestedValue(newState, subscription.path);
      subscription.listener(newValue, prevValue, action);
    } else {
      subscription.listener(newState, previousState, action);
    }
  }

  /**
   * Add middleware
   * @param {Function} middleware - Middleware function
   */
  addMiddleware(middleware) {
    this.middlewares.push(middleware);
  }

  /**
   * Create a selector function
   * @param {Function} selectorFn - Selector function
   * @returns {Function} Memoized selector
   */
  createSelector(selectorFn) {
    let lastState = null;
    let lastResult = null;

    return () => {
      if (this.state !== lastState) {
        lastState = this.state;
        lastResult = selectorFn(this.state);
      }
      return lastResult;
    };
  }

  /**
   * Undo last action (if history is enabled)
   * @returns {boolean} Success status
   */
  undo() {
    if (!this.history || this.history.length < 2) {
      return false;
    }

    this.history.pop(); // Remove current state
    const previousState = this.history[this.history.length - 1];
    
    this.state = this.deepFreeze(previousState);
    this.notifyListeners(this.state, previousState, { type: 'UNDO', timestamp: Date.now() });
    
    this.debug('State undone');
    return true;
  }

  /**
   * Get action history
   * @returns {Array} Action log
   */
  getActionHistory() {
    return [...this.actionLog];
  }

  /**
   * Clear action history
   */
  clearHistory() {
    this.actionLog = [];
    if (this.history) {
      this.history = [this.state];
    }
  }

  /**
   * Get nested value from object
   * @param {Object} obj - Object to traverse
   * @param {string} path - Dot-notation path
   * @returns {*} Value at path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested value in object (immutable)
   * @param {Object} obj - Object to modify
   * @param {string} path - Dot-notation path
   * @param {*} value - Value to set
   * @returns {Object} New object with updated value
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      current[key] = { ...current[key] };
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return result;
  }

  /**
   * Deep merge objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Deep freeze object
   * @param {Object} obj - Object to freeze
   * @returns {Object} Frozen object
   */
  deepFreeze(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Object.isFrozen(obj)) {
      return obj;
    }

    // Freeze properties
    Object.keys(obj).forEach(prop => {
      if (obj[prop] && typeof obj[prop] === 'object') {
        this.deepFreeze(obj[prop]);
      }
    });

    return Object.freeze(obj);
  }

  /**
   * Debug logging
   * @param {string} message - Debug message
   * @param {*} data - Optional data
   */
  debug(message, data = null) {
    if (this.debugMode) {
      console.log(`[StateManager] ${message}`, data || '');
    }
  }

  /**
   * Reset state to initial value
   * @param {Object} newInitialState - New initial state
   */
  reset(newInitialState = null) {
    if (newInitialState) {
      this.state = this.deepFreeze({ ...newInitialState });
    } else if (this.history && this.history.length > 0) {
      this.state = this.deepFreeze(this.history[0]);
    }

    this.clearHistory();
    this.notifyListeners(null, this.state, { type: 'RESET', timestamp: Date.now() });
    this.debug('State reset');
  }
}

export default StateManager;