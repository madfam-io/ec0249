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
import ContentEngine from './engines/ContentEngine.js';
import AssessmentEngine from './engines/AssessmentEngine.js';
import DocumentEngine from './engines/DocumentEngine.js';
import SimulationEngine from './engines/SimulationEngine.js';

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
    container.singleton('EventBus', () => eventBus, {
      factory: true
    });
    
    container.singleton('ConfigManager', () => this.config, {
      factory: true
    });
    
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
      dependencies: ['EventBus'],
      factory: true
    });
    
    container.singleton('ThemeService', ThemeService, {
      dependencies: ['StorageService', 'EventBus']
    });
    
    container.singleton('I18nService', I18nService, {
      dependencies: ['StorageService', 'EventBus']
    });

    // Register engine modules
    container.singleton('ContentEngine', ContentEngine, {
      dependencies: ['StateManager', 'I18nService', 'StorageService', 'EventBus']
    });

    container.singleton('AssessmentEngine', AssessmentEngine, {
      dependencies: ['StateManager', 'I18nService', 'StorageService', 'EventBus']
    });

    container.singleton('DocumentEngine', DocumentEngine, {
      dependencies: ['StateManager', 'I18nService', 'StorageService', 'EventBus']
    });

    container.singleton('SimulationEngine', SimulationEngine, {
      dependencies: ['StateManager', 'I18nService', 'StorageService', 'EventBus']
    });

    // Register application instance for services that need it
    container.singleton('App', () => this, {
      factory: true
    });

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
    try {
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
    } catch (error) {
      console.error('[App] Error initializing state:', error);
      throw error;
    }
  }

  /**
   * Initialize UI components
   */
  async initializeComponents() {
    try {
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
        console.log('[App] ThemeToggle component initialized');
      } else {
        console.warn('[App] ThemeToggle element not found');
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
        console.log('[App] LanguageToggle component initialized');
      } else {
        console.warn('[App] LanguageToggle element not found');
      }

      console.log('[App] UI components initialized');
    } catch (error) {
      console.error('[App] Error initializing components:', error);
      // Continue initialization even if components fail
    }
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
    // Navigation tabs handling
    document.addEventListener('click', (e) => {
      const navTab = e.target.closest('.nav-tab');
      if (navTab) {
        const view = navTab.dataset.view;
        if (view) {
          this.switchView(view);
        }
        return;
      }

      // Sidebar navigation handling
      const sidebarLink = e.target.closest('.sidebar-nav a');
      if (sidebarLink) {
        e.preventDefault();
        const section = sidebarLink.dataset.section;
        if (section) {
          this.switchSection(section);
        }
        return;
      }

      // Module card clicks
      const moduleCard = e.target.closest('.module-card');
      if (moduleCard) {
        const moduleNum = moduleCard.dataset.module;
        if (moduleNum) {
          this.openModule(moduleNum);
        }
        return;
      }

      // Action button handling
      const actionButton = e.target.closest('[data-action]');
      if (actionButton) {
        const action = actionButton.dataset.action;
        this.handleAction(action, actionButton);
        return;
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
    // Initialize ContentEngine for lesson content rendering
    const contentEngine = container.resolve('ContentEngine');
    await contentEngine.initialize(container, eventBus);
    this.modules.set('contentEngine', contentEngine);

    // Initialize AssessmentEngine for knowledge verification
    const assessmentEngine = container.resolve('AssessmentEngine');
    await assessmentEngine.initialize(container, eventBus);
    this.modules.set('assessmentEngine', assessmentEngine);

    // Initialize DocumentEngine for template-based document generation
    const documentEngine = container.resolve('DocumentEngine');
    await documentEngine.initialize(container, eventBus);
    this.modules.set('documentEngine', documentEngine);

    // Initialize SimulationEngine for interview and presentation practice
    const simulationEngine = container.resolve('SimulationEngine');
    await simulationEngine.initialize(container, eventBus);
    this.modules.set('simulationEngine', simulationEngine);

    // Expose engines globally for legacy compatibility
    if (typeof window !== 'undefined') {
      window.contentEngine = contentEngine;
      window.assessmentEngine = assessmentEngine;
      window.documentEngine = documentEngine;
      window.simulationEngine = simulationEngine;
    }

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

    // Handle section-specific content loading
    await this.loadSectionContent(sectionName);

    // Emit section change event
    eventBus.publish('app:section-change', {
      section: sectionName,
      previousSection: this.appState.currentSection
    });

    this.appState.currentSection = sectionName;
  }

  /**
   * Load content for specific section
   * @param {string} sectionName - Section name
   */
  async loadSectionContent(sectionName) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;

    try {
      switch (sectionName) {
        case 'overview':
          // Switch to dashboard view for overview
          if (this.appState.currentView !== 'dashboard') {
            this.switchView('dashboard');
          }
          break;

        case 'module1':
        case 'module2':
        case 'module3':
        case 'module4':
          await this.loadModuleContent(sectionName);
          break;

        case 'documents':
          await this.loadDocumentTemplates();
          break;

        case 'progress':
          await this.loadProgressContent();
          break;

        default:
          console.log(`[App] Section ${sectionName} - content loading not implemented`);
      }
    } catch (error) {
      console.error(`[App] Error loading section content for ${sectionName}:`, error);
      this.showNotification('Error al cargar el contenido', 'error');
    }
  }

  /**
   * Load module content using ContentEngine
   * @param {string} moduleId - Module identifier
   */
  async loadModuleContent(moduleId) {
    const contentEngine = this.modules.get('contentEngine');
    if (!contentEngine) {
      this.showNotification('Motor de contenido no disponible', 'error');
      return;
    }

    const contentArea = document.getElementById('contentArea');
    
    // Create module content configuration
    const contentConfig = {
      id: moduleId,
      type: 'module',
      title: this.getModuleTitle(moduleId),
      overview: this.getModuleOverview(moduleId)
    };

    try {
      // Load and render content
      await contentEngine.loadContent(contentConfig);
      await contentEngine.renderContent(contentArea, null, {
        transition: 'fadeIn'
      });
    } catch (error) {
      console.error(`[App] Error loading module content:`, error);
      this.showNotification('Error al cargar el módulo', 'error');
    }
  }

  /**
   * Load document templates using DocumentEngine
   */
  async loadDocumentTemplates() {
    const documentEngine = this.modules.get('documentEngine');
    if (!documentEngine) {
      this.showNotification('Motor de documentos no disponible', 'error');
      return;
    }

    const contentArea = document.getElementById('contentArea');
    
    // Create template listing HTML
    const templates = Array.from(documentEngine.templates.values());
    
    contentArea.innerHTML = `
      <div class="templates-view">
        <h1>Plantillas de Documentos EC0249</h1>
        <p>Todas las plantillas necesarias para completar tu certificación están aquí.</p>
        
        <div class="templates-grid">
          ${templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
              <div class="template-header">
                <div class="template-icon">${template.icon || '📄'}</div>
                <div class="template-element">${template.element}</div>
              </div>
              <h3>${template.title}</h3>
              <p>${template.description}</p>
              <div class="template-meta">
                <span>⏱️ ${template.estimatedTime} min</span>
                <span class="template-status">📝 Disponible</span>
              </div>
              <button class="btn btn-primary" onclick="ec0249App.createDocument('${template.id}')">
                Crear Documento
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Load progress content
   */
  async loadProgressContent() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
      <div class="progress-view">
        <h1>Mi Progreso de Certificación</h1>
        <p>Seguimiento detallado de tu avance hacia la certificación EC0249.</p>
        
        <div class="progress-summary">
          <div class="progress-card">
            <h3>Progreso General</h3>
            <div class="circular-progress">
              <div class="progress-circle">
                <span class="progress-number">15%</span>
              </div>
            </div>
            <p>Has completado 1 de 4 módulos</p>
          </div>
        </div>
        
        <div class="modules-progress">
          <h2>Progreso por Módulo</h2>
          <!-- Module progress details will be added here -->
        </div>
      </div>
    `;
  }

  /**
   * Get module title by ID
   */
  getModuleTitle(moduleId) {
    const titles = {
      'module1': 'Fundamentos de Consultoría',
      'module2': 'Identificación del Problema',
      'module3': 'Desarrollo de Soluciones',
      'module4': 'Presentación de Propuestas'
    };
    return titles[moduleId] || 'Módulo';
  }

  /**
   * Get module overview by ID
   */
  getModuleOverview(moduleId) {
    const overviews = {
      'module1': 'Conceptos básicos, ética y habilidades interpersonales necesarias para la consultoría profesional.',
      'module2': 'Elemento 1: Técnicas de entrevista, cuestionarios e investigación de campo para identificar situaciones problemáticas.',
      'module3': 'Elemento 2: Análisis de impacto y diseño de soluciones efectivas con justificación costo-beneficio.',
      'module4': 'Elemento 3: Preparación y presentación profesional de propuestas de solución.'
    };
    return overviews[moduleId] || 'Descripción del módulo.';
  }

  /**
   * Create new document using DocumentEngine
   * @param {string} templateId - Template identifier
   */
  async createDocument(templateId) {
    const documentEngine = this.modules.get('documentEngine');
    if (!documentEngine) {
      this.showNotification('Motor de documentos no disponible', 'error');
      return;
    }

    try {
      const document = documentEngine.createDocument(templateId);
      this.showNotification(`Documento "${document.title}" creado exitosamente`, 'success');
      
      // TODO: Open document editor
      console.log('Created document:', document);
    } catch (error) {
      console.error('Error creating document:', error);
      this.showNotification('Error al crear el documento', 'error');
    }
  }

  /**
   * Open a learning module
   * @param {string} moduleNum - Module number
   */
  openModule(moduleNum) {
    console.log(`[App] Opening module: ${moduleNum}`);
    
    // Switch to modules view if not already there
    if (this.appState.currentView !== 'modules') {
      this.switchView('modules');
    }

    // Switch to specific module section
    this.switchSection(`module${moduleNum}`);
    
    eventBus.publish('module:open', { module: moduleNum });
  }

  /**
   * Handle action button clicks
   * @param {string} action - Action identifier
   * @param {HTMLElement} button - Button element
   */
  async handleAction(action, button) {
    console.log(`[App] Handling action: ${action}`);

    // Get i18n service for notifications (with fallback)
    let i18n = null;
    try {
      i18n = this.getService('I18nService');
    } catch (error) {
      // I18nService not ready yet
    }

    try {
      switch (action) {
        case 'continue-learning':
          this.switchView('modules');
          this.switchSection('module1');
          break;

        case 'explore-modules':
          this.switchView('modules');
          break;

        case 'view-templates':
          this.switchSection('documents');
          break;

        case 'start-simulation':
          this.switchView('assessment');
          // TODO: Start simulation with SimulationEngine
          this.showNotification(i18n ? i18n.t('common.underConstruction') : 'Esta funcionalidad está en construcción', 'info');
          break;

        case 'start-knowledge-test':
          // TODO: Start assessment with AssessmentEngine
          this.showNotification(i18n ? i18n.t('common.underConstruction') : 'Esta funcionalidad está en construcción', 'info');
          break;

        case 'manage-portfolio':
          this.switchView('portfolio');
          break;

        case 'view-roadmap':
          this.showNotification(i18n ? i18n.t('common.comingSoon') : 'Próximamente disponible', 'info');
          break;

        case 'view-element-1':
        case 'view-element-2':
        case 'view-element-3':
          // TODO: Show element-specific documents
          this.switchSection('documents');
          break;

        default:
          console.warn(`[App] Unknown action: ${action}`);
          this.showNotification('Función en desarrollo', 'info');
      }
    } catch (error) {
      console.error(`[App] Error handling action ${action}:`, error);
      this.showNotification('Error al ejecutar la acción', 'error');
    }
  }

  /**
   * Render current view
   */
  renderCurrentView() {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.add('hidden');
    });

    // Show current view
    const currentViewElement = document.getElementById(`${this.appState.currentView}View`);
    if (currentViewElement) {
      currentViewElement.classList.remove('hidden');
    }

    // Update navigation UI
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    const activeTab = document.querySelector(`[data-view="${this.appState.currentView}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected', 'true');
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

    // Update modules grid
    this.renderModulesGrid();
  }

  /**
   * Render modules grid with current data
   */
  renderModulesGrid() {
    const modulesGrid = document.querySelector('#modulesView .modules-grid');
    if (!modulesGrid) return;

    const modules = [
      {
        id: 'module1',
        number: 1,
        title: 'Fundamentos de Consultoría',
        description: 'Conceptos básicos, ética y habilidades interpersonales necesarias para la consultoría profesional.',
        icon: '🎯',
        status: 'available',
        progress: 25,
        lessons: 4,
        color: 'green'
      },
      {
        id: 'module2',
        number: 2,
        title: 'Identificación del Problema',
        description: 'Elemento 1: Técnicas de entrevista, cuestionarios e investigación de campo para identificar situaciones problemáticas.',
        icon: '🔍',
        status: 'locked',
        progress: 0,
        lessons: 8,
        color: 'blue'
      },
      {
        id: 'module3',
        number: 3,
        title: 'Desarrollo de Soluciones',
        description: 'Elemento 2: Análisis de impacto y diseño de soluciones efectivas con justificación costo-beneficio.',
        icon: '💡',
        status: 'locked',
        progress: 0,
        lessons: 4,
        color: 'purple'
      },
      {
        id: 'module4',
        number: 4,
        title: 'Presentación de Propuestas',
        description: 'Elemento 3: Preparación y presentación profesional de propuestas de solución.',
        icon: '📋',
        status: 'locked',
        progress: 0,
        lessons: 6,
        color: 'orange'
      }
    ];

    modulesGrid.innerHTML = modules.map(module => `
      <div class="module-card module-${module.number}" data-module="${module.number}">
        <div class="module-header">
          <div class="module-icon ${module.color}">${module.icon}</div>
          <div class="module-status ${module.status}"></div>
        </div>
        <div class="module-content">
          <h3 class="module-title">Módulo ${module.number}: ${module.title}</h3>
          <p class="module-description">${module.description}</p>
          <div class="module-stats">
            <span>${module.lessons} lecciones</span>
            <span class="status-text ${module.status === 'available' ? 'text-success' : module.status === 'locked' ? 'text-secondary' : 'text-warning'}">
              ${module.status === 'available' ? 'Disponible' : module.status === 'locked' ? 'Bloqueado' : 'En progreso'}
            </span>
          </div>
          <div class="module-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${module.progress}%"></div>
            </div>
            <span class="progress-text">${module.progress}% completado</span>
          </div>
          <div class="module-actions">
            ${module.status === 'available' ? 
              `<button class="btn btn-primary" onclick="ec0249App.openModule('${module.number}')">Continuar</button>` :
              module.status === 'locked' ? 
                `<button class="btn btn-secondary" disabled>Bloqueado</button>` :
                `<button class="btn btn-primary" onclick="ec0249App.openModule('${module.number}')">Continuar</button>`
            }
          </div>
        </div>
      </div>
    `).join('');
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