/**
 * Router Service - URL routing and browser history management
 * Handles navigation, deep linking, and browser back/forward buttons
 */
import Module from '../core/Module.js';

class RouterService extends Module {
  constructor() {
    super('RouterService', ['EventBus'], {
      basePath: '',
      defaultRoute: '/dashboard',
      useHashRouting: false,
      enablePushState: true,
      routes: {
        '/': 'dashboard',
        '/dashboard': 'dashboard',
        '/modules': 'modules',
        '/modules/:moduleId': 'modules',
        '/modules/:sectionId': 'modules',
        '/assessment': 'assessment',
        '/portfolio': 'portfolio',
        '/portfolio/:sectionId': 'portfolio'
      }
    });

    this.currentRoute = null;
    this.currentParams = {};
    this.routeHistory = [];
    this.navigationInProgress = false;
  }

  async onInitialize() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Parse initial route
    this.parseInitialRoute();
    
    // Subscribe to navigation events
    this.subscribe('app:view-change', this.handleViewChange.bind(this));
    this.subscribe('app:section-change', this.handleSectionChange.bind(this));
    
    console.log('[RouterService] Initialized with current route:', this.currentRoute);
  }

  /**
   * Setup browser event listeners
   */
  setupEventListeners() {
    // Handle browser back/forward
    window.addEventListener('popstate', this.handlePopState.bind(this));
    
    // Handle initial page load
    window.addEventListener('load', () => {
      this.parseCurrentURL();
    });
  }

  /**
   * Parse initial route from URL
   */
  parseInitialRoute() {
    this.parseCurrentURL();
    
    // If no route matches, redirect to default
    if (!this.currentRoute) {
      this.navigate(this.getConfig('defaultRoute'), { replace: true });
    }
  }

  /**
   * Parse current URL and extract route information
   */
  parseCurrentURL() {
    const path = this.getConfig('useHashRouting') 
      ? window.location.hash.slice(1) || '/'
      : window.location.pathname;
    
    this.currentRoute = this.matchRoute(path);
    this.currentParams = this.extractParams(path);
  }

  /**
   * Match URL path to route pattern
   * @param {string} path - URL path
   * @returns {string|null} Matched route or null
   */
  matchRoute(path) {
    const routes = this.getConfig('routes');
    
    // Exact match first
    if (routes[path]) {
      return routes[path];
    }
    
    // Pattern matching for dynamic routes
    for (const [pattern, view] of Object.entries(routes)) {
      if (this.matchPattern(pattern, path)) {
        return view;
      }
    }
    
    return null;
  }

  /**
   * Match URL pattern with parameters
   * @param {string} pattern - Route pattern
   * @param {string} path - Actual path
   * @returns {boolean} Whether pattern matches
   */
  matchPattern(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    
    if (patternParts.length !== pathParts.length) {
      return false;
    }
    
    return patternParts.every((part, index) => {
      return part.startsWith(':') || part === pathParts[index];
    });
  }

  /**
   * Extract parameters from URL path
   * @param {string} path - URL path
   * @returns {Object} Extracted parameters
   */
  extractParams(path) {
    const routes = this.getConfig('routes');
    const params = {};
    
    for (const [pattern, view] of Object.entries(routes)) {
      if (this.matchPattern(pattern, path)) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        
        patternParts.forEach((part, index) => {
          if (part.startsWith(':')) {
            const paramName = part.slice(1);
            params[paramName] = pathParts[index];
          }
        });
        break;
      }
    }
    
    return params;
  }

  /**
   * Navigate to a new route
   * @param {string} path - Target path
   * @param {Object} options - Navigation options
   */
  navigate(path, options = {}) {
    if (this.navigationInProgress) return;
    
    this.navigationInProgress = true;
    
    try {
      const { replace = false, silent = false } = options;
      
      // Update browser URL
      if (this.getConfig('enablePushState')) {
        if (replace) {
          window.history.replaceState({}, '', path);
        } else {
          window.history.pushState({}, '', path);
        }
      } else if (this.getConfig('useHashRouting')) {
        window.location.hash = path;
      }
      
      // Update internal state
      this.parseCurrentURL();
      
      // Add to history
      this.routeHistory.push({
        path,
        timestamp: Date.now(),
        params: this.currentParams
      });
      
      // Emit navigation event
      if (!silent) {
        this.emit('router:navigate', {
          path,
          route: this.currentRoute,
          params: this.currentParams,
          options
        });
      }
      
      console.log(`[RouterService] Navigated to: ${path}`);
    } finally {
      this.navigationInProgress = false;
    }
  }

  /**
   * Handle browser back/forward navigation
   * @param {PopStateEvent} event - Browser popstate event
   */
  handlePopState(event) {
    this.parseCurrentURL();
    
    this.emit('router:popstate', {
      route: this.currentRoute,
      params: this.currentParams,
      state: event.state
    });
  }

  /**
   * Handle application view changes
   * @param {Object} data - View change data
   */
  handleViewChange(data) {
    if (this.navigationInProgress) return;
    
    const path = this.getPathForView(data.view);
    if (path) {
      this.navigate(path, { silent: true });
    }
  }

  /**
   * Handle application section changes
   * @param {Object} data - Section change data
   */
  handleSectionChange(data) {
    if (this.navigationInProgress) return;
    
    // Update URL with section parameter if applicable
    const currentPath = window.location.pathname;
    const newPath = this.addSectionToPath(currentPath, data.section);
    
    if (newPath !== currentPath) {
      this.navigate(newPath, { silent: true });
    }
  }

  /**
   * Get URL path for view
   * @param {string} view - View name
   * @returns {string|null} URL path
   */
  getPathForView(view) {
    const routes = this.getConfig('routes');
    
    for (const [path, routeView] of Object.entries(routes)) {
      if (routeView === view && !path.includes(':')) {
        return path;
      }
    }
    
    return null;
  }

  /**
   * Add section parameter to path
   * @param {string} path - Current path
   * @param {string} section - Section name
   * @returns {string} Updated path
   */
  addSectionToPath(path, section) {
    // For now, use query parameters for sections
    const url = new URL(window.location);
    url.searchParams.set('section', section);
    return url.pathname + url.search;
  }

  /**
   * Get current route information
   * @returns {Object} Current route data
   */
  getCurrentRoute() {
    return {
      path: window.location.pathname,
      route: this.currentRoute,
      params: this.currentParams,
      query: this.getQueryParams()
    };
  }

  /**
   * Get query parameters
   * @returns {Object} Query parameters
   */
  getQueryParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
    
    return params;
  }

  /**
   * Go back in history
   */
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.navigate(this.getConfig('defaultRoute'));
    }
  }

  /**
   * Go forward in history
   */
  goForward() {
    window.history.forward();
  }

  /**
   * Get route history
   * @returns {Array} Route history
   */
  getHistory() {
    return [...this.routeHistory];
  }

  /**
   * Clear route history
   */
  clearHistory() {
    this.routeHistory = [];
  }

  async onDestroy() {
    // Remove event listeners
    window.removeEventListener('popstate', this.handlePopState.bind(this));
    
    // Clear history
    this.clearHistory();
  }
}

export default RouterService;