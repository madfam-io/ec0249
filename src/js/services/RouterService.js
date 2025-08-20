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
        '/modules/module1': 'modules',
        '/modules/module2': 'modules',
        '/modules/module3': 'modules',
        '/modules/module4': 'modules',
        '/assessment': 'assessment',
        '/portfolio': 'portfolio',
        '/documents': 'documents',
        '/progress': 'progress',
        '/portfolio/documents': 'portfolio',
        '/portfolio/element1': 'portfolio',
        '/portfolio/element2': 'portfolio',
        '/portfolio/element3': 'portfolio',
        '/portfolio/progress': 'portfolio',
        // Document-specific routes
        '/portfolio/documents/:templateId': 'portfolio',
        '/portfolio/documents/:templateId/edit': 'portfolio',
        '/portfolio/documents/:templateId/:documentId': 'portfolio',
        '/portfolio/documents/:templateId/:documentId/edit': 'portfolio',
        // Element-specific document routes
        '/portfolio/element1/:templateId': 'portfolio',
        '/portfolio/element2/:templateId': 'portfolio', 
        '/portfolio/element3/:templateId': 'portfolio',
        // Individual document routes - All 15 EC0249 templates
        '/document/problem_description': 'document',
        '/document/current_situation_impact': 'document',
        '/document/information_integration': 'document',
        '/document/methodology_report': 'document',
        '/document/interview_guide': 'document',
        '/document/questionnaire': 'document',
        '/document/documentary_search_program': 'document',
        '/document/field_visit_report': 'document',
        '/document/impact_analysis_report': 'document',
        '/document/solution_design': 'document',
        '/document/work_proposal': 'document',
        '/document/detailed_solution_description': 'document',
        '/document/work_plan_presentation': 'document',
        '/document/activity_development_plan': 'document',
        '/document/agreement_record': 'document',
        // Document routes with parameters
        '/document/:templateId': 'document',
        '/document/:templateId/edit': 'document',
        '/document/:templateId/:documentId': 'document',
        '/document/:templateId/:documentId/edit': 'document'
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
    } else {
      // Emit initial navigation event for the current route
      const currentPath = this.getConfig('useHashRouting') 
        ? window.location.hash.slice(1) || '/'
        : window.location.pathname;
        
      console.log(`[RouterService] Emitting initial navigation event for: ${currentPath}`);
      
      this.emit('router:navigate', {
        path: currentPath,
        route: this.currentRoute,
        params: this.currentParams,
        options: { initial: true }
      });
      
      // Emit initial navigation state
      this.emitNavigationStateUpdate();
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
    
    console.log(`[RouterService] Parsed URL "${path}" → route: "${this.currentRoute}"`);
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
    
    console.warn(`[RouterService] No route match found for: "${path}"`);
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
        
        // Emit navigation state update for UI components
        this.emitNavigationStateUpdate();
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
    
    // Also emit navigation state update for UI synchronization
    this.emitNavigationStateUpdate();
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
    
    // Update URL with section parameter using proper path logic
    const currentPath = window.location.pathname;
    const newPath = this.addSectionToPath(currentPath, data.section);
    
    // Only navigate if the path actually changes
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
    // Generate proper URL paths based on section type
    if (section.startsWith('module')) {
      return `/modules/${section}`;
    } else if (section === 'documents' || section === 'progress' || section.startsWith('element')) {
      return `/portfolio/${section}`;
    } else if (section === 'overview') {
      return '/dashboard';
    } else {
      // Default fallback - keep current path
      return path;
    }
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
   * Navigate to document template
   * @param {string} templateId - Template identifier
   * @param {Object} options - Navigation options
   */
  navigateToDocument(templateId, options = {}) {
    const { element, documentId, edit = false } = options;
    
    let path;
    if (element) {
      path = `/portfolio/${element}/${templateId}`;
    } else if (documentId) {
      path = `/portfolio/documents/${templateId}/${documentId}`;
      if (edit) path += '/edit';
    } else {
      path = `/portfolio/documents/${templateId}`;
      if (edit) path += '/edit';
    }
    
    this.navigate(path, options);
  }

  /**
   * Check if current route is a document route
   * @returns {boolean} True if current route is for a document
   */
  isDocumentRoute() {
    const path = window.location.pathname;
    return path.includes('/portfolio/documents/') || 
           path.match(/\/portfolio\/element[123]\/\w+/);
  }

  /**
   * Get document route information
   * @returns {Object|null} Document route data or null
   */
  getDocumentRouteInfo() {
    const path = window.location.pathname;
    const params = this.currentParams;
    
    // Check for document routes
    if (path.includes('/portfolio/documents/')) {
      return {
        type: 'document',
        templateId: params.templateId,
        documentId: params.documentId || null,
        isEdit: path.endsWith('/edit'),
        element: null
      };
    }
    
    // Check for element-specific routes
    const elementMatch = path.match(/\/portfolio\/(element[123])\/(\w+)/);
    if (elementMatch) {
      return {
        type: 'element-document',
        element: elementMatch[1],
        templateId: elementMatch[2],
        documentId: null,
        isEdit: false
      };
    }
    
    return null;
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

  /**
   * Navigate to a document by template ID
   * @param {string} templateId - Template identifier
   * @param {Object} options - Navigation options
   * @param {string} options.mode - 'view' or 'edit'
   * @param {string} options.documentId - Specific document ID
   * @param {boolean} options.replace - Replace current history entry
   */
  navigateToDocument(templateId, options = {}) {
    const { mode = 'edit', documentId, replace = false } = options;
    
    let path;
    if (documentId) {
      path = mode === 'edit' 
        ? `/document/${templateId}/${documentId}/edit`
        : `/document/${templateId}/${documentId}`;
    } else {
      path = mode === 'edit'
        ? `/document/${templateId}/edit`
        : `/document/${templateId}`;
    }
    
    this.navigate(path, { replace });
  }

  /**
   * Check if current route is document-related
   * @returns {boolean} True if current route is a document route
   */
  isDocumentRoute() {
    if (!this.currentRoute) return false;
    return this.currentRoute.includes('/document/') || 
           this.currentParams.templateId;
  }

  /**
   * Extract document information from current route
   * @returns {Object|null} Document route information
   */
  getDocumentRouteInfo() {
    if (!this.isDocumentRoute()) return null;
    
    return {
      templateId: this.currentParams.templateId,
      documentId: this.currentParams.documentId,
      isEdit: this.currentRoute.includes('/edit'),
      isNew: !this.currentParams.documentId,
      path: this.currentRoute
    };
  }

  /**
   * Get all available document routes
   * @returns {Array} List of all document template routes
   */
  getDocumentRoutes() {
    return [
      'problem_description',
      'current_situation_impact', 
      'information_integration',
      'methodology_report',
      'interview_guide',
      'questionnaire',
      'documentary_search_program',
      'field_visit_report',
      'impact_analysis_report',
      'solution_design',
      'work_proposal',
      'detailed_solution_description',
      'work_plan_presentation',
      'activity_development_plan',
      'agreement_record'
    ];
  }

  /**
   * Navigate to document from element context
   * @param {string} elementId - Element ID (element1, element2, element3)
   * @param {string} templateId - Template identifier
   * @param {Object} options - Navigation options
   */
  navigateToElementDocument(elementId, templateId, options = {}) {
    const path = `/portfolio/${elementId}/${templateId}`;
    this.navigate(path, options);
  }

  /**
   * Build document URL without navigating
   * @param {string} templateId - Template identifier
   * @param {Object} options - URL options
   * @returns {string} Document URL
   */
  buildDocumentURL(templateId, options = {}) {
    const { mode = 'edit', documentId, baseURL = '' } = options;
    
    let path;
    if (documentId) {
      path = mode === 'edit' 
        ? `/document/${templateId}/${documentId}/edit`
        : `/document/${templateId}/${documentId}`;
    } else {
      path = mode === 'edit'
        ? `/document/${templateId}/edit`
        : `/document/${templateId}`;
    }
    
    return baseURL + path;
  }

  /**
   * Emit navigation state update for UI components
   */
  emitNavigationStateUpdate() {
    const currentPath = window.location.pathname;
    const navigationState = {
      path: currentPath,
      route: this.currentRoute,
      params: this.currentParams,
      activeView: this.getActiveView(currentPath),
      activeSection: this.getActiveSection(currentPath),
      breadcrumb: this.getBreadcrumb(currentPath)
    };
    
    this.emit('router:navigation-state-changed', navigationState);
    
    console.log('[RouterService] Navigation state updated:', navigationState);
  }

  /**
   * Get active view from current path
   * @param {string} path - Current path
   * @returns {string} Active view name
   */
  getActiveView(path) {
    if (path.startsWith('/modules')) return 'modules';
    if (path.startsWith('/assessment')) return 'assessment';
    if (path.startsWith('/portfolio')) return 'portfolio';
    if (path.startsWith('/documents')) return 'documents';
    if (path.startsWith('/progress')) return 'progress';
    if (path.startsWith('/document')) return 'document';
    return 'dashboard';
  }

  /**
   * Get active section from current path
   * @param {string} path - Current path
   * @returns {string|null} Active section name
   */
  getActiveSection(path) {
    // Module sections
    if (path.includes('/modules/module1')) return 'module1';
    if (path.includes('/modules/module2')) return 'module2';
    if (path.includes('/modules/module3')) return 'module3';
    if (path.includes('/modules/module4')) return 'module4';
    
    // Portfolio sections
    if (path.includes('/portfolio/documents')) return 'documents';
    if (path.includes('/portfolio/progress')) return 'progress';
    if (path.includes('/portfolio/element1')) return 'element1';
    if (path.includes('/portfolio/element2')) return 'element2';
    if (path.includes('/portfolio/element3')) return 'element3';
    
    return null;
  }

  /**
   * Generate breadcrumb for current path
   * @param {string} path - Current path
   * @returns {Array} Breadcrumb items
   */
  getBreadcrumb(path) {
    const breadcrumb = [{ label: 'Inicio', path: '/dashboard' }];
    
    if (path.startsWith('/modules')) {
      breadcrumb.push({ label: 'Módulos', path: '/modules' });
      if (path.includes('/module1')) breadcrumb.push({ label: 'Módulo 1', path: '/modules/module1' });
      if (path.includes('/module2')) breadcrumb.push({ label: 'Módulo 2', path: '/modules/module2' });
      if (path.includes('/module3')) breadcrumb.push({ label: 'Módulo 3', path: '/modules/module3' });
      if (path.includes('/module4')) breadcrumb.push({ label: 'Módulo 4', path: '/modules/module4' });
    } else if (path.startsWith('/portfolio')) {
      breadcrumb.push({ label: 'Portafolio', path: '/portfolio' });
      if (path.includes('/documents')) breadcrumb.push({ label: 'Documentos', path: '/portfolio/documents' });
      if (path.includes('/progress')) breadcrumb.push({ label: 'Mi Progreso', path: '/portfolio/progress' });
      if (path.includes('/element1')) breadcrumb.push({ label: 'Elemento 1', path: '/portfolio/element1' });
      if (path.includes('/element2')) breadcrumb.push({ label: 'Elemento 2', path: '/portfolio/element2' });
      if (path.includes('/element3')) breadcrumb.push({ label: 'Elemento 3', path: '/portfolio/element3' });
    } else if (path.startsWith('/assessment')) {
      breadcrumb.push({ label: 'Evaluación', path: '/assessment' });
    }
    
    return breadcrumb;
  }

  async onDestroy() {
    // Remove event listeners
    window.removeEventListener('popstate', this.handlePopState.bind(this));
    
    // Clear history
    this.clearHistory();
  }
}

export default RouterService;