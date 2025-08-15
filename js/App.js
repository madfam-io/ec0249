/**
 * EC0249 Educational Platform - Modular Application Bootstrap
 * Main application class that orchestrates all modules and services
 */
import { container } from './core/ServiceContainer.js';
import { eventBus } from './core/EventBus.js';
import StateManager from './core/StateManager.js';
import ThemeService from './services/ThemeService.js';
import I18nService from './services/I18nService.js';
import StorageService from './services/StorageService.js';
import ThemeToggle from './components/ThemeToggle.js';
import LanguageToggle from './components/LanguageToggle.js';
import AppConfig, { ConfigManager } from './config/AppConfig.js';

class EC0249App {
  constructor(config = {}) {
    this.config = new ConfigManager({ ...AppConfig, ...config });
    this.state = null;
    this.services = new Map();
    this.components = new Map();
    this.modules = new Map();
    this.initialized = false;
    this.destroyed = false;
    
    // Application state
    this.appState = {
      currentView: 'dashboard',
      currentSection: 'overview',
      userProgress: {
        module1: { theory: 0, practice: 0, assessment: false },
        module2: { theory: 0, practice: 0, assessment: false },
        module3: { theory: 0, practice: 0, assessment: false },
        module4: { theory: 0, practice: 0, assessment: false }
      },
      portfolioItems: [],
      preferences: {
        theme: this.config.get('theme.defaultTheme'),
        language: this.config.get('i18n.defaultLanguage'),
        notifications: true,
        autoSave: true
      }
    };
  }

  /**
   * Initialize the application
   * @returns {Promise} Initialization promise
   */
  async initialize() {
    if (this.initialized) {
      console.warn('Application already initialized');
      return;
    }

    console.log('[App] Initializing EC0249 Educational Platform...');

    try {
      // Initialize core systems
      await this.initializeCore();
      
      // Register services
      await this.registerServices();
      
      // Boot services
      await this.bootServices();
      
      // Initialize state management
      await this.initializeState();
      
      // Initialize UI components
      await this.initializeComponents();
      
      // Load user data
      await this.loadUserData();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize modules
      await this.initializeModules();
      
      // Render initial view
      this.renderCurrentView();
      
      this.initialized = true;
      
      // Emit initialization complete event
      eventBus.publish('app:initialized', {
        timestamp: Date.now(),
        version: this.config.get('app.version')
      });
      
      console.log('[App] Initialization complete');
    } catch (error) {
      console.error('[App] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize core systems
   */
  async initializeCore() {
    // Configure event bus
    if (this.config.get('events.debug')) {
      eventBus.setDebugMode(true);
    }

    // Add event middleware
    const eventMiddleware = this.config.get('events.middleware', []);
    eventMiddleware.forEach(middleware => {
      eventBus.addMiddleware(middleware);
    });

    console.log('[App] Core systems initialized');
  }

  /**
   * Register all services in the container
   */
  async registerServices() {
    // Register core services
    container.singleton('EventBus', () => eventBus);
    
    container.singleton('ConfigManager', () => this.config);
    
    container.singleton('StorageService', StorageService, {
      dependencies: ['EventBus']
    });
    
    container.singleton('StateManager', () => {
      return new StateManager(this.appState, {
        enableHistory: this.config.get('state.enableHistory'),
        maxHistorySize: this.config.get('state.maxHistorySize'),
        debug: this.config.get('state.debug')
      });
    }, {
      dependencies: ['EventBus']
    });
    
    container.singleton('ThemeService', ThemeService, {
      dependencies: ['StorageService', 'EventBus']
    });
    
    container.singleton('I18nService', I18nService, {
      dependencies: ['StorageService', 'EventBus']
    });

    // Register application instance for services that need it
    container.singleton('App', () => this);

    console.log('[App] Services registered');
  }

  /**
   * Boot all services
   */
  async bootServices() {
    await container.boot();
    console.log('[App] Services booted');
  }

  /**
   * Initialize state management
   */
  async initializeState() {
    this.state = container.resolve('StateManager');
    
    // Add state middleware
    const stateMiddleware = this.config.get('state.middleware', []);
    stateMiddleware.forEach(middleware => {
      this.state.addMiddleware(middleware);
    });

    // Subscribe to state changes for persistence
    if (this.config.get('state.persistState')) {
      this.state.subscribe((newState, prevState, action) => {
        this.persistState(newState, action);
      });
    }

    console.log('[App] State management initialized');
  }

  /**
   * Initialize UI components
   */
  async initializeComponents() {
    // Initialize theme toggle
    const themeToggleElement = document.getElementById('themeToggle');
    if (themeToggleElement) {
      const themeToggle = new ThemeToggle(themeToggleElement, {
        style: 'button',
        showIcon: true,
        showText: false
      });
      
      await themeToggle.initialize(container, eventBus);
      this.components.set('themeToggle', themeToggle);
    }

    // Initialize language toggle
    const languageToggleElement = document.getElementById('languageToggle');
    if (languageToggleElement) {
      const languageToggle = new LanguageToggle(languageToggleElement, {
        style: 'button',
        showIcon: true,
        showText: true
      });
      
      await languageToggle.initialize(container, eventBus);
      this.components.set('languageToggle', languageToggle);
    }

    console.log('[App] UI components initialized');
  }

  /**
   * Load user data from storage
   */
  async loadUserData() {
    const storage = container.resolve('StorageService');
    
    try {
      // Load user progress
      const savedProgress = await storage.get('userProgress');
      if (savedProgress) {
        await this.state.dispatch('SET_PROPERTY', {
          path: 'userProgress',
          value: savedProgress
        });
      }

      // Load user preferences
      const savedPreferences = await storage.get('preferences');
      if (savedPreferences) {
        await this.state.dispatch('SET_PROPERTY', {
          path: 'preferences',
          value: { ...this.appState.preferences, ...savedPreferences }
        });
      }

      // Load portfolio items
      const savedPortfolio = await storage.get('portfolioItems');
      if (savedPortfolio) {
        await this.state.dispatch('SET_PROPERTY', {
          path: 'portfolioItems',
          value: savedPortfolio
        });
      }

      console.log('[App] User data loaded');
    } catch (error) {
      console.warn('[App] Failed to load user data:', error);
    }
  }

  /**
   * Persist state to storage
   * @param {Object} state - Application state
   * @param {Object} action - Action that triggered the change
   */
  async persistState(state, action) {
    const storage = container.resolve('StorageService');
    const persistKeys = this.config.get('state.persistKeys', []);

    try {
      for (const key of persistKeys) {
        if (state[key] !== undefined) {
          await storage.set(key, state[key]);
        }
      }
    } catch (error) {
      console.warn('[App] Failed to persist state:', error);
    }
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Navigation handling
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        if (view) {
          this.switchView(view);
        }
      });
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.dataset.section;
        if (section) {
          this.switchSection(section);
        }
      });
    });

    // Module card clicks
    document.addEventListener('click', (e) => {
      const moduleCard = e.target.closest('.module-card');
      if (moduleCard) {
        const moduleNum = moduleCard.dataset.module;
        if (moduleNum) {
          this.openModule(moduleNum);
        }
      }
    });

    // Subscribe to application events
    eventBus.subscribe('app:view-change', this.handleViewChange.bind(this));
    eventBus.subscribe('app:section-change', this.handleSectionChange.bind(this));
    eventBus.subscribe('theme:changed', this.handleThemeChange.bind(this));
    eventBus.subscribe('language:changed', this.handleLanguageChange.bind(this));

    console.log('[App] Event listeners setup');
  }

  /**
   * Initialize application modules
   */
  async initializeModules() {
    // This would initialize learning modules, document systems, etc.
    // For now, we'll keep the existing module system
    console.log('[App] Modules initialized');
  }

  /**
   * Switch application view
   * @param {string} viewName - View name
   */
  async switchView(viewName) {
    if (this.appState.currentView === viewName) return;

    await this.state.dispatch('SET_PROPERTY', {
      path: 'currentView',
      value: viewName
    });

    // Update navigation UI
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    // Render new view
    this.renderCurrentView();

    // Emit view change event
    eventBus.publish('app:view-change', {
      view: viewName,
      previousView: this.appState.currentView
    });

    this.appState.currentView = viewName;
  }

  /**
   * Switch application section
   * @param {string} sectionName - Section name
   */
  async switchSection(sectionName) {
    if (this.appState.currentSection === sectionName) return;

    await this.state.dispatch('SET_PROPERTY', {
      path: 'currentSection',
      value: sectionName
    });

    // Update sidebar UI
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      link.classList.toggle('active', link.dataset.section === sectionName);
    });

    // Render section content
    this.renderCurrentView();

    // Emit section change event
    eventBus.publish('app:section-change', {
      section: sectionName,
      previousSection: this.appState.currentSection
    });

    this.appState.currentSection = sectionName;
  }

  /**
   * Open a learning module
   * @param {string} moduleNum - Module number
   */
  openModule(moduleNum) {
    // Implementation would depend on module system
    console.log(`[App] Opening module: ${moduleNum}`);
    eventBus.publish('module:open', { module: moduleNum });
  }

  /**
   * Render current view
   */
  renderCurrentView() {
    // Hide all views
    document.querySelectorAll('[id$="View"]').forEach(view => {
      view.classList.add('hidden');
    });

    // Show current view
    const currentViewElement = document.getElementById(`${this.appState.currentView}View`);
    if (currentViewElement) {
      currentViewElement.classList.remove('hidden');
    }

    // Update view-specific content
    this.updateViewContent();
  }

  /**
   * Update view-specific content based on i18n
   */
  updateViewContent() {
    const i18n = container.resolve('I18nService');
    
    // Update page title
    document.title = i18n.t('app.title');

    // Update navigation
    const navMappings = {
      'dashboard': 'navigation.dashboard',
      'modules': 'navigation.modules',
      'assessment': 'navigation.assessment',
      'portfolio': 'navigation.portfolio'
    };

    Object.entries(navMappings).forEach(([view, key]) => {
      const tab = document.querySelector(`[data-view="${view}"]`);
      if (tab) {
        tab.textContent = i18n.t(key);
      }
    });

    // Update view-specific content
    switch (this.appState.currentView) {
      case 'dashboard':
        this.updateDashboardContent();
        break;
      case 'modules':
        this.updateModulesContent();
        break;
      case 'assessment':
        this.updateAssessmentContent();
        break;
      case 'portfolio':
        this.updatePortfolioContent();
        break;
    }
  }

  /**
   * Update dashboard content
   */
  updateDashboardContent() {
    const i18n = container.resolve('I18nService');
    
    const welcomeTitle = document.querySelector('#dashboardView h1');
    if (welcomeTitle) {
      welcomeTitle.textContent = i18n.t('dashboard.welcome');
    }

    const welcomeSubtitle = document.querySelector('#dashboardView .hero-subtitle');
    if (welcomeSubtitle) {
      welcomeSubtitle.textContent = i18n.t('dashboard.subtitle');
    }
  }

  /**
   * Update modules content
   */
  updateModulesContent() {
    const i18n = container.resolve('I18nService');
    
    const modulesTitle = document.querySelector('#modulesView h1');
    if (modulesTitle) {
      modulesTitle.textContent = i18n.t('modules.title');
    }

    const modulesSubtitle = document.querySelector('#modulesView > p');
    if (modulesSubtitle) {
      modulesSubtitle.textContent = i18n.t('modules.subtitle');
    }
  }

  /**
   * Update assessment content
   */
  updateAssessmentContent() {
    const i18n = container.resolve('I18nService');
    
    const assessmentTitle = document.querySelector('#assessmentView h1');
    if (assessmentTitle) {
      assessmentTitle.textContent = i18n.t('assessment.title');
    }
  }

  /**
   * Update portfolio content
   */
  updatePortfolioContent() {
    const i18n = container.resolve('I18nService');
    
    const portfolioTitle = document.querySelector('#portfolioView h1');
    if (portfolioTitle) {
      portfolioTitle.textContent = i18n.t('portfolio.title');
    }
  }

  /**
   * Event Handlers
   */
  handleViewChange(data) {
    console.log(`[App] View changed to: ${data.view}`);
  }

  handleSectionChange(data) {
    console.log(`[App] Section changed to: ${data.section}`);
  }

  handleThemeChange(data) {
    console.log(`[App] Theme changed to: ${data.theme}`);
    // Update preferences in state
    this.state.dispatch('SET_PROPERTY', {
      path: 'preferences.theme',
      value: data.theme
    });
  }

  handleLanguageChange(data) {
    console.log(`[App] Language changed to: ${data.language}`);
    // Update preferences in state
    this.state.dispatch('SET_PROPERTY', {
      path: 'preferences.language',
      value: data.language
    });
    
    // Update all UI content
    this.updateViewContent();
  }

  /**
   * Show notification to user
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, warning, error)
   */
  showNotification(message, type = 'info') {
    eventBus.publish('notification:show', {
      message,
      type,
      timestamp: Date.now()
    });
  }

  /**
   * Get application state
   * @param {string} path - State path (optional)
   * @returns {*} State value
   */
  getState(path = null) {
    return this.state.getState(path);
  }

  /**
   * Update application state
   * @param {string} action - Action type
   * @param {*} payload - Action payload
   * @returns {Promise} Dispatch promise
   */
  setState(action, payload) {
    return this.state.dispatch(action, payload);
  }

  /**
   * Get service instance
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  getService(name) {
    return container.resolve(name);
  }

  /**
   * Get component instance
   * @param {string} name - Component name
   * @returns {*} Component instance
   */
  getComponent(name) {
    return this.components.get(name);
  }

  /**
   * Destroy the application
   * @returns {Promise} Destruction promise
   */
  async destroy() {
    if (this.destroyed) {
      return;
    }

    console.log('[App] Destroying application...');

    try {
      // Destroy components
      for (const component of this.components.values()) {
        await component.destroy();
      }
      this.components.clear();

      // Destroy modules
      for (const module of this.modules.values()) {
        await module.destroy();
      }
      this.modules.clear();

      // Shutdown services
      await container.shutdown();

      // Clear event listeners
      eventBus.clear();

      this.destroyed = true;
      console.log('[App] Application destroyed');
    } catch (error) {
      console.error('[App] Destruction failed:', error);
      throw error;
    }
  }

  /**
   * Get application info
   * @returns {Object} Application information
   */
  getInfo() {
    return {
      name: this.config.get('app.name'),
      version: this.config.get('app.version'),
      initialized: this.initialized,
      destroyed: this.destroyed,
      services: container.getServices(),
      components: Array.from(this.components.keys()),
      modules: Array.from(this.modules.keys()),
      currentView: this.appState.currentView,
      currentSection: this.appState.currentSection
    };
  }
}

export default EC0249App;