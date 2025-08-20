/**
 * ViewManager - Application View Coordination and Navigation System
 * 
 * @description The ViewManager serves as the central coordinator for all view controllers
 * in the EC0249 platform. It handles view transitions, routing, lifecycle management,
 * and navigation state synchronization. The ViewManager implements the Controller pattern
 * to manage complex view interactions and maintain application state consistency.
 * 
 * @class ViewManager
 * 
 * Key Responsibilities:
 * - View controller instantiation and lifecycle management
 * - Navigation coordination and URL routing
 * - View transition animations and effects
 * - State synchronization between views and application
 * - Event handling for navigation actions
 * - Section management within views
 * 
 * Supported Views:
 * - Dashboard: Overview and quick access
 * - Modules: Learning content and progress
 * - Assessment: Testing and evaluation
 * - Portfolio: Work samples and certification
 * 
 * Navigation Features:
 * - Tab-based navigation
 * - Sidebar section navigation
 * - Programmatic navigation
 * - Browser history integration
 * - Deep linking support
 * 
 * @example
 * // Initialize ViewManager
 * const viewManager = new ViewManager(appInstance);
 * await viewManager.initialize();
 * 
 * @example
 * // Navigate to specific view and section
 * await viewManager.navigate('modules', 'module2');
 * 
 * @since 2.0.0
 */
import { eventBus } from '../core/EventBus.js';
import DashboardViewController from './DashboardViewController.js';
import ModulesViewController from './ModulesViewController.js';
import AssessmentViewController from './AssessmentViewController.js';
import PortfolioViewController from './PortfolioViewController.js';
import DocumentViewController from './DocumentViewController.js';
import DocumentsViewController from './DocumentsViewController.js';
import ProgressViewController from './ProgressViewController.js';

class ViewManager {
  /**
   * Create a new ViewManager instance
   * 
   * @description Initializes the ViewManager with application reference and
   * sets up the foundation for view controller management. Prepares the
   * system for view registration and navigation coordination.
   * 
   * @param {EC0249App} app - Main application instance for coordination
   * 
   * @since 2.0.0
   */
  constructor(app) {
    /** @private {EC0249App} app - Application instance reference */
    this.app = app;
    
    /** @private {Map<string, Object>} controllers - View controller registry */
    this.controllers = new Map();
    
    /** @private {Object|null} currentController - Currently active view controller */
    this.currentController = null;
    
    /** @private {string} currentView - Current view identifier */
    this.currentView = app.appState ? app.appState.currentView : 'dashboard';
    
    /** @private {boolean} initialized - Initialization status flag */
    this.initialized = false;
  }

  /**
   * Initialize view manager and all controllers
   */
  async initialize() {
    if (this.initialized) return;

    // Create view controllers
    this.controllers.set('dashboard', new DashboardViewController('dashboard', this.app));
    this.controllers.set('modules', new ModulesViewController('modules', this.app));
    this.controllers.set('assessment', new AssessmentViewController('assessment', this.app));
    this.controllers.set('portfolio', new PortfolioViewController('portfolio', this.app));
    this.controllers.set('documents', new DocumentsViewController('documents', this.app));
    this.controllers.set('progress', new ProgressViewController('progress', this.app));
    this.controllers.set('document', new DocumentViewController());

    // Initialize all controllers
    for (const [viewId, controller] of this.controllers) {
      try {
        await controller.initialize();
      } catch (error) {
        console.error(`[ViewManager] Failed to initialize ${viewId} controller:`, error);
      }
    }

    // Set up navigation handlers
    this.bindNavigationEvents();

    // Sync with current app state during initialization
    this.syncWithAppState();

    // Show initial view
    await this.showView(this.currentView);

    this.initialized = true;
    console.log('[ViewManager] Initialized with', this.controllers.size, 'view controllers');
  }

  /**
   * Sync ViewManager state with current app state
   */
  syncWithAppState() {
    if (!this.app.appState) {
      console.warn('[ViewManager] No app state available for synchronization');
      return;
    }

    const appCurrentView = this.app.appState.currentView;
    const appCurrentSection = this.app.appState.currentSection;

    console.log(`[ViewManager] Syncing with app state - view: ${appCurrentView}, section: ${appCurrentSection}`);
    console.log(`[ViewManager] Current ViewManager state - view: ${this.currentView}`);

    // Update ViewManager state to match app state
    if (appCurrentView && appCurrentView !== this.currentView) {
      console.log(`[ViewManager] Updating ViewManager view from ${this.currentView} to ${appCurrentView}`);
      this.currentView = appCurrentView;
    }

    console.log('[ViewManager] State synchronization complete');
  }

  /**
   * Bind navigation event handlers
   */
  bindNavigationEvents() {
    // Navigation events are handled by App.js to prevent duplicate listeners
    // This method is kept for view-specific event binding if needed

    // Listen for view change events
    eventBus.subscribe('app:view-change', (data) => {
      this.showView(data.view);
    });

    eventBus.subscribe('app:section-change', (data) => {
      this.showSection(data.section);
    });

    // Listen for router navigation to handle document routes
    eventBus.subscribe('router:navigate', this.handleRouterNavigation.bind(this));
  }

  /**
   * Handle router navigation events for document routing
   * @param {Object} data - Router navigation data
   */
  async handleRouterNavigation(data) {
    const { route, path, params } = data;
    
    // Handle direct document routes
    if (route === 'document') {
      console.log('[ViewManager] Direct document route detected:', path);
      
      // The DocumentViewController will handle this automatically
      // since it subscribes to router events
      return;
    }
    
    // Handle portfolio document routes
    if (route !== 'portfolio') return;
    
    // If this is a document route, make sure portfolio view is active
    const routerService = this.app.getService('RouterService');
    if (routerService && routerService.isDocumentRoute()) {
      // Switch to portfolio view if not already there
      if (this.currentView !== 'portfolio') {
        await this.showView('portfolio');
      }
      
      // The PortfolioViewController will handle the document-specific routing
      console.log('[ViewManager] Portfolio document route detected, delegating to PortfolioViewController');
    }
  }

  /**
   * Show a specific view with proper transition handling
   * 
   * @description Transitions from the current view to the specified view,
   * handling controller lifecycle, state updates, and event emission.
   * Ensures smooth transitions and proper cleanup of previous view.
   * 
   * @param {string} viewId - Target view identifier ('dashboard', 'modules', 'assessment', 'portfolio')
   * 
   * @returns {Promise<void>} Promise that resolves when view transition is complete
   * 
   * @throws {Error} Throws if view ID is not registered
   * 
   * @fires ViewManager#view:changed - Emitted when view transition completes
   * 
   * @example
   * await viewManager.showView('modules');
   * 
   * @since 2.0.0
   */
  async showView(viewId) {
    console.log(`[ViewManager] showView called with: ${viewId}`);
    
    if (!this.controllers.has(viewId)) {
      console.warn(`[ViewManager] Unknown view: ${viewId}`);
      return;
    }

    // Hide current controller
    if (this.currentController) {
      console.log(`[ViewManager] Hiding current controller: ${this.currentView}`);
      this.currentController.hide();
    }

    // Show new controller
    const controller = this.controllers.get(viewId);
    console.log(`[ViewManager] Showing controller: ${viewId}`);
    controller.show();
    
    console.log(`[ViewManager] Rendering controller: ${viewId}`);
    await controller.render();

    this.currentController = controller;
    this.currentView = viewId;

    // Update app state
    if (this.app.appState) {
      this.app.appState.currentView = viewId;
    }

    // Emit view change event
    eventBus.publish('view:changed', { 
      view: viewId, 
      controller: controller 
    });

    console.log(`[ViewManager] Successfully switched to view: ${viewId}`);
  }

  /**
   * Show a specific section within the current view
   * 
   * @description Updates the current view to display a specific section,
   * coordinating with the active view controller and updating navigation
   * state. Maintains section context and synchronizes UI elements.
   * 
   * @param {string} sectionId - Target section identifier
   * 
   * @returns {Promise<void>} Promise that resolves when section change is complete
   * 
   * @fires ViewManager#section:changed - Emitted when section changes
   * 
   * @example
   * await viewManager.showSection('module2');
   * 
   * @since 2.0.0
   */
  async showSection(sectionId) {
    if (!this.currentController) {
      console.warn(`[ViewManager] No current controller available for section: ${sectionId}`);
      return;
    }

    console.log(`[ViewManager] Showing section: ${sectionId} (current view: ${this.currentView})`);

    // Determine which view this section belongs to
    const targetView = this.getSectionView(sectionId);
    console.log(`[ViewManager] Target view for section ${sectionId}: ${targetView}`);
    
    // Switch to target view if not already there
    if (targetView && targetView !== this.currentView) {
      console.log(`[ViewManager] Switching from ${this.currentView} to ${targetView} for section ${sectionId}`);
      await this.showView(targetView);
    }

    // Update section-specific content
    // For dedicated views (documents, progress), the view switch is sufficient
    // For section-based views (portfolio, modules), call showSection
    if (targetView && (targetView === 'documents' || targetView === 'progress')) {
      console.log(`[ViewManager] Section ${sectionId} uses dedicated view ${targetView} - no additional section handling needed`);
    } else if (typeof this.currentController.showSection === 'function') {
      console.log(`[ViewManager] Calling showSection(${sectionId}) on ${this.currentView} controller`);
      await this.currentController.showSection(sectionId);
      console.log(`[ViewManager] showSection(${sectionId}) completed on ${this.currentView} controller`);
    } else {
      console.warn(`[ViewManager] Current controller (${this.currentView}) does not support showSection for ${sectionId}`);
    }

    // Update app state
    if (this.app.appState) {
      this.app.appState.currentSection = sectionId;
    }

    // Update sidebar navigation
    this.updateSidebarNavigation(sectionId);

    // Emit section change event
    eventBus.publish('section:changed', { 
      section: sectionId, 
      view: this.currentView 
    });
    
    console.log(`[ViewManager] Section change to ${sectionId} completed`);
  }

  /**
   * Determine which view a section belongs to
   * @param {string} sectionId - Section identifier
   * @returns {string|null} View identifier or null if section stays on current view
   */
  getSectionView(sectionId) {
    // Section-to-view mapping
    const sectionViewMap = {
      // Module sections go to modules view
      'module1': 'modules',
      'module2': 'modules', 
      'module3': 'modules',
      'module4': 'modules',
      
      // Documents section goes to dedicated documents view
      'documents': 'documents',
      
      // Element sections go to portfolio view
      'element1': 'portfolio',
      'element2': 'portfolio',
      'element3': 'portfolio',
      
      // Progress section goes to dedicated progress view
      'progress': 'progress',
      
      // Overview stays on dashboard
      'overview': 'dashboard'
    };

    return sectionViewMap[sectionId] || null;
  }

  /**
   * Update sidebar navigation state
   */
  updateSidebarNavigation(sectionId) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  /**
   * Get current view controller
   */
  getCurrentController() {
    return this.currentController;
  }

  /**
   * Get view controller by ID
   */
  getController(viewId) {
    return this.controllers.get(viewId);
  }

  /**
   * Update all views with current language
   */
  updateLanguage() {
    for (const controller of this.controllers.values()) {
      controller.updateLanguage();
    }
  }

  /**
   * Refresh current view
   */
  async refreshCurrentView() {
    if (this.currentController) {
      await this.currentController.render();
    }
  }

  /**
   * Navigate to a specific view and section
   */
  async navigate(viewId, sectionId = null) {
    await this.showView(viewId);
    if (sectionId) {
      await this.showSection(sectionId);
    }
  }

  /**
   * Get navigation state
   */
  getNavigationState() {
    return {
      currentView: this.currentView,
      currentSection: this.app.appState?.currentSection,
      availableViews: Array.from(this.controllers.keys())
    };
  }

  /**
   * Check if view exists
   */
  hasView(viewId) {
    return this.controllers.has(viewId);
  }

  /**
   * Destroy view manager and all controllers
   */
  destroy() {
    for (const controller of this.controllers.values()) {
      controller.destroy();
    }
    this.controllers.clear();
    this.currentController = null;
    this.initialized = false;
  }
}

export default ViewManager;