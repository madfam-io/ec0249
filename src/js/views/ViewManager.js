/**
 * View Manager - Coordinates all view controllers
 * Handles view transitions, routing, and lifecycle management
 */
import { eventBus } from '../core/EventBus.js';
import DashboardViewController from './DashboardViewController.js';
import ModulesViewController from './ModulesViewController.js';
import AssessmentViewController from './AssessmentViewController.js';
import PortfolioViewController from './PortfolioViewController.js';

class ViewManager {
  constructor(app) {
    this.app = app;
    this.controllers = new Map();
    this.currentController = null;
    this.currentView = 'dashboard';
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

    // Show initial view
    await this.showView(this.currentView);

    this.initialized = true;
    console.log('[ViewManager] Initialized with', this.controllers.size, 'view controllers');
  }

  /**
   * Bind navigation event handlers
   */
  bindNavigationEvents() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = tab.getAttribute('data-view');
        if (viewId) {
          this.showView(viewId);
        }
      });
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        if (section) {
          this.showSection(section);
        }
      });
    });

    // Listen for view change events
    eventBus.subscribe('app:view-change', (data) => {
      this.showView(data.view);
    });

    eventBus.subscribe('app:section-change', (data) => {
      this.showSection(data.section);
    });
  }

  /**
   * Show a specific view
   */
  async showView(viewId) {
    if (!this.controllers.has(viewId)) {
      console.warn(`[ViewManager] Unknown view: ${viewId}`);
      return;
    }

    // Hide current controller
    if (this.currentController) {
      this.currentController.hide();
    }

    // Show new controller
    const controller = this.controllers.get(viewId);
    controller.show();
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

    console.log(`[ViewManager] Switched to view: ${viewId}`);
  }

  /**
   * Show a specific section within the current view
   */
  async showSection(sectionId) {
    if (!this.currentController) return;

    // Update section-specific content
    if (typeof this.currentController.showSection === 'function') {
      await this.currentController.showSection(sectionId);
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