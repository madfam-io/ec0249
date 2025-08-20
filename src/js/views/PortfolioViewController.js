/**
 * Portfolio View Controller - Manages the document portfolio and certification tracking
 * Handles document generation, portfolio management, and certification pathway
 */
import BaseViewController from './BaseViewController.js';
import ReferenceViewer from '../components/ReferenceViewer.js';

class PortfolioViewController extends BaseViewController {
  constructor(viewId, app) {
    super(viewId, app);
    this.documentEngine = null;
    this.currentElement = 'element1';
    this.portfolioData = new Map();
    this.documentFilters = {
      element: 'all',
      status: 'all',
      search: ''
    };
    this.referenceViewer = null;
    this.shouldShowElementContent = false;
  }

  async onInitialize() {
    // Get document engine
    this.documentEngine = this.getModule('documentEngine');
    if (!this.documentEngine) {
      console.warn('[PortfolioViewController] DocumentEngine not available yet - will be available after modules initialization');
    } else {
      console.log('[PortfolioViewController] DocumentEngine available:', !!this.documentEngine);
      console.log('[PortfolioViewController] DocumentEngine state:', this.documentEngine.state);
      console.log('[PortfolioViewController] DocumentEngine templates loaded:', this.documentEngine.templates?.size || 0);
      
      // List available template IDs for debugging
      if (this.documentEngine.templates && this.documentEngine.templates.size > 0) {
        const templateIds = Array.from(this.documentEngine.templates.keys());
        console.log('[PortfolioViewController] Available template IDs:', templateIds);
      }
    }
  }

  bindEvents() {
    // Element navigation items (.element-nav-item)
    this.findElements('.element-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const elementId = item.getAttribute('data-element');
        if (elementId) {
          this.showElement(elementId);
        }
      });
    });

    // Element navigation cards (.element-nav-card)
    this.findElements('.element-nav-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const elementId = card.getAttribute('data-element');
        if (elementId) {
          this.showElement(elementId);
        }
      });
    });

    // Note: Static "Ver Documentos" buttons with data-action="view-element-X" 
    // are handled by App.js event delegation. Don't bind to them here to avoid conflicts.

    // Document template cards
    this.findElements('.template-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const templateId = card.getAttribute('data-template');
        if (templateId) {
          this.openDocumentTemplate(templateId);
        }
      });
    });

    // Portfolio action buttons
    this.findElements('[data-portfolio-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.getAttribute('data-portfolio-action');
        this.handlePortfolioAction(action, button);
      });
    });

    // Filter controls
    this.findElements('.filter-control').forEach(control => {
      control.addEventListener('change', (e) => {
        this.updateFilters(e.target);
      });
    });

    // Search input
    const searchInput = this.findElement('#portfolio-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.documentFilters.search = e.target.value;
        this.filterDocuments();
      });
    }

    // Reference docs button
    this.findElements('.reference-docs-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.openReferenceViewer();
      });
    });
  }

  async onShow() {
    // Load portfolio data when view is shown
    await this.loadPortfolioData();
    
    // Listen for portfolio refresh events
    this.subscribe('portfolio:refresh', this.handlePortfolioRefresh.bind(this));
    
    // Listen for browser navigation events
    this.subscribe('router:popstate', this.handleRouterNavigation.bind(this));
    
    // Check URL for specific element routing
    this.handleElementRouting();
  }

  /**
   * Handle element routing based on URL
   */
  handleElementRouting() {
    const currentPath = window.location.pathname;
    console.log(`[PortfolioViewController] Checking URL for element routing: ${currentPath}`);
    
    // Get router service for document route detection
    const routerService = this.getService('RouterService');
    
    // Check for document-specific routes first
    if (routerService && routerService.isDocumentRoute()) {
      const documentInfo = routerService.getDocumentRouteInfo();
      console.log(`[PortfolioViewController] Document route detected:`, documentInfo);
      
      if (documentInfo) {
        this.handleDocumentRoute(documentInfo);
        return;
      }
    }
    
    // Extract element from URL patterns like /portfolio/element1, /portfolio/element2, etc.
    const elementMatch = currentPath.match(/\/portfolio\/element([1-3])/);
    
    if (elementMatch) {
      const elementNumber = elementMatch[1];
      const elementId = `element${elementNumber}`;
      
      console.log(`[PortfolioViewController] URL indicates element: ${elementId}`);
      
      // Set current element and show element content instead of overview
      this.currentElement = elementId;
      this.shouldShowElementContent = true;
    } else {
      console.log(`[PortfolioViewController] URL shows portfolio overview`);
      this.shouldShowElementContent = false;
    }
  }

  /**
   * Handle document-specific routing
   * @param {Object} documentInfo - Document route information
   */
  async handleDocumentRoute(documentInfo) {
    const { templateId, documentId, isEdit, element } = documentInfo;
    
    console.log(`[PortfolioViewController] Handling document route:`, documentInfo);
    
    if (!templateId) {
      console.warn('[PortfolioViewController] No template ID in document route');
      return;
    }
    
    // Set element context if provided
    if (element) {
      this.currentElement = element;
      this.shouldShowElementContent = true;
    }
    
    // Wait for document engine to be available
    if (!this.documentEngine) {
      console.log('[PortfolioViewController] Waiting for DocumentEngine...');
      await this.waitForDocumentEngine();
    }
    
    if (!this.documentEngine) {
      console.error('[PortfolioViewController] DocumentEngine not available for document route');
      this.showNotification('Motor de documentos no disponible', 'error');
      return;
    }
    
    // Open the document based on route parameters
    if (documentId) {
      // Open existing document
      this.editDocument(documentId);
    } else {
      // Open template for new document creation
      await this.openDocumentTemplate(templateId);
    }
  }

  /**
   * Wait for DocumentEngine to become available
   * @returns {Promise} Resolves when DocumentEngine is available
   */
  async waitForDocumentEngine() {
    return new Promise((resolve) => {
      const checkEngine = () => {
        this.documentEngine = this.getModule('documentEngine');
        if (this.documentEngine) {
          console.log('[PortfolioViewController] DocumentEngine now available');
          resolve();
        } else {
          setTimeout(checkEngine, 100);
        }
      };
      checkEngine();
    });
  }

  /**
   * Handle router navigation events (back/forward buttons)
   */
  async handleRouterNavigation() {
    console.log('[PortfolioViewController] Router navigation detected, updating view...');
    
    // Re-check URL routing when browser navigation occurs
    this.handleElementRouting();
    
    // Re-render the view to reflect URL changes
    await this.onRender();
  }

  /**
   * Handle portfolio refresh event
   */
  async handlePortfolioRefresh() {
    console.log('[PortfolioViewController] Refreshing portfolio data...');
    await this.loadPortfolioData();
    await this.onRender();
  }

  async onRender() {
    console.log('[PortfolioViewController] onRender called');
    
    // Ensure proper DOM structure exists
    this.ensurePortfolioStructure();
    
    // Render portfolio overview
    this.renderPortfolioOverview();
    
    // Render current element content
    await this.renderCurrentElement();
    
    // Update certification progress
    this.updateCertificationProgress();
    
    // Show element content if URL indicates it, otherwise show overview
    if (this.shouldShowElementContent) {
      this.showElementSection();
    } else {
      this.hideElementSection();
    }
    
    // Re-bind events after content changes
    this.bindEvents();
    
    console.log('[PortfolioViewController] onRender completed');
  }

  /**
   * Ensure portfolio DOM structure exists
   */
  ensurePortfolioStructure() {
    if (!this.element) {
      console.warn('[PortfolioViewController] No element available for structure creation');
      return;
    }
    
    console.log('[PortfolioViewController] Ensuring portfolio structure...');
    
    // Check if we already have the dynamic structure
    let portfolioWrapper = this.findElement('.portfolio-wrapper');
    
    if (!portfolioWrapper) {
      console.log('[PortfolioViewController] Creating dynamic portfolio structure...');
      
      // Create wrapper for all portfolio content
      portfolioWrapper = this.createElement('div', ['portfolio-wrapper']);
      
      // Move existing static content to overview container
      const existingOverview = this.findElement('.portfolio-overview');
      if (existingOverview) {
        // Clone the existing overview content
        const clonedOverview = existingOverview.cloneNode(true);
        clonedOverview.classList.add('dynamic-overview');
        portfolioWrapper.appendChild(clonedOverview);
      } else {
        // Create new overview container if none exists
        const portfolioOverview = this.createElement('div', ['portfolio-overview', 'dynamic-overview']);
        portfolioWrapper.appendChild(portfolioOverview);
      }
      
      // Create element content container (initially hidden)
      const elementContent = this.createElement('div', ['element-content']);
      elementContent.style.display = 'none';
      elementContent.setAttribute('data-element', this.currentElement);
      portfolioWrapper.appendChild(elementContent);
      
      // Insert the wrapper after the existing content
      if (existingOverview && existingOverview.parentNode) {
        existingOverview.parentNode.insertBefore(portfolioWrapper, existingOverview.nextSibling);
      } else {
        this.element.appendChild(portfolioWrapper);
      }
      
      console.log('[PortfolioViewController] Dynamic portfolio structure created');
    } else {
      console.log('[PortfolioViewController] Portfolio structure already exists');
    }
    
    // Ensure we have both required containers
    const portfolioOverview = this.findElement('.portfolio-wrapper .portfolio-overview');
    const elementContent = this.findElement('.element-content');
    
    if (!portfolioOverview) {
      console.error('[PortfolioViewController] Portfolio overview container missing');
    }
    
    if (!elementContent) {
      console.error('[PortfolioViewController] Element content container missing');
    }
    
    console.log('[PortfolioViewController] Portfolio structure check complete');
  }

  /**
   * Load portfolio data and user documents
   */
  async loadPortfolioData() {
    try {
      const storageService = this.getService('StorageService');
      if (storageService) {
        // Load saved documents
        const savedDocuments = await storageService.getData('user_documents') || {};
        this.portfolioData.clear();
        
        Object.entries(savedDocuments).forEach(([docId, docData]) => {
          this.portfolioData.set(docId, docData);
        });
        
        console.log(`[PortfolioViewController] Loaded ${this.portfolioData.size} documents`);
      }
    } catch (error) {
      console.error('[PortfolioViewController] Failed to load portfolio data:', error);
    }
  }

  /**
   * Render portfolio overview
   */
  renderPortfolioOverview() {
    const overviewContainer = this.findElement('.portfolio-overview');
    if (!overviewContainer) return;

    // Clear existing content
    overviewContainer.innerHTML = '';

    // Create certification progress section
    const progressSection = this.createCertificationProgressSection();
    overviewContainer.appendChild(progressSection);

    // Create quick stats section
    const statsSection = this.createQuickStatsSection();
    overviewContainer.appendChild(statsSection);

    // Create elements navigation section
    const navSection = this.createElementsNavigationSection();
    overviewContainer.appendChild(navSection);
  }

  /**
   * Create certification progress section
   */
  createCertificationProgressSection() {
    const section = this.createElement('section', ['certification-progress-section']);
    
    const title = this.createElement('h2', ['section-title']);
    title.textContent = 'Progreso de Certificación EC0249';
    section.appendChild(title);

    const progressCard = this.createElement('div', ['certification-card']);
    
    const overallProgress = this.calculateCertificationProgress();
    progressCard.innerHTML = `
      <div class="certification-header">
        <h3>Proporcionar servicios de consultoría general</h3>
        <span class="certification-code">EC0249</span>
      </div>
      <div class="certification-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${overallProgress}%"></div>
        </div>
        <span class="progress-text">${overallProgress}% completado</span>
      </div>
      <div class="certification-elements">
        ${this.renderElementsProgress()}
      </div>
    `;

    section.appendChild(progressCard);
    return section;
  }

  /**
   * Render elements progress
   */
  renderElementsProgress() {
    const elements = [
      { id: 'element1', code: 'E0875', name: 'Identificar problemas de la organización', templates: 8 },
      { id: 'element2', code: 'E0876', name: 'Desarrollar soluciones integrales', templates: 2 },
      { id: 'element3', code: 'E0877', name: 'Presentar propuestas de solución', templates: 5 }
    ];

    return elements.map(element => {
      const completed = this.getElementCompletedDocuments(element.id);
      const progress = Math.round((completed / element.templates) * 100);
      
      return `
        <div class="element-progress" data-element="${element.id}">
          <div class="element-info">
            <span class="element-code">${element.code}</span>
            <span class="element-name">${element.name}</span>
          </div>
          <div class="element-stats">
            <span class="completion">${completed}/${element.templates} documentos</span>
            <div class="progress-bar small">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Create quick stats section
   */
  createQuickStatsSection() {
    const section = this.createElement('section', ['quick-stats-section']);
    
    const title = this.createElement('h3', ['section-title']);
    title.textContent = 'Resumen del Portafolio';
    section.appendChild(title);

    const statsGrid = this.createElement('div', ['stats-grid']);

    const stats = [
      {
        icon: '📄',
        value: this.portfolioData.size,
        label: 'Documentos creados',
        color: 'blue'
      },
      {
        icon: '✅',
        value: this.getCompletedDocumentsCount(),
        label: 'Documentos completados',
        color: 'green'
      },
      {
        icon: '📋',
        value: 15,
        label: 'Plantillas disponibles',
        color: 'purple'
      },
      {
        icon: '🎯',
        value: `${this.calculateCertificationProgress()}%`,
        label: 'Progreso certificación',
        color: 'orange'
      }
    ];

    stats.forEach(stat => {
      const statCard = this.createElement('div', ['stat-card', `stat-${stat.color}`]);
      statCard.innerHTML = `
        <div class="stat-icon">${stat.icon}</div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      `;
      statsGrid.appendChild(statCard);
    });

    section.appendChild(statsGrid);
    return section;
  }

  /**
   * Create elements navigation section
   */
  createElementsNavigationSection() {
    const section = this.createElement('section', ['elements-navigation-section']);
    
    const title = this.createElement('h3', ['section-title']);
    title.textContent = 'Elementos de Competencia';
    section.appendChild(title);

    const elementsGrid = this.createElement('div', ['elements-grid']);

    const elements = [
      {
        id: 'element1',
        code: 'E0875',
        title: 'Identificación de Problemas',
        description: 'Documentos para identificar y analizar problemas organizacionales',
        templates: 8,
        color: 'blue'
      },
      {
        id: 'element2',
        code: 'E0876',
        title: 'Desarrollo de Soluciones',
        description: 'Documentos para el desarrollo de soluciones integrales',
        templates: 2,
        color: 'green'
      },
      {
        id: 'element3',
        code: 'E0877',
        title: 'Presentación de Propuestas',
        description: 'Documentos para la presentación de propuestas de solución',
        templates: 5,
        color: 'orange'
      }
    ];

    elements.forEach(element => {
      const elementCard = this.createElement('div', ['element-nav-card', `element-${element.color}`]);
      elementCard.setAttribute('data-element', element.id);
      
      const completed = this.getElementCompletedDocuments(element.id);
      const progress = Math.round((completed / element.templates) * 100);
      
      elementCard.innerHTML = `
        <div class="element-header">
          <span class="element-code">${element.code}</span>
          <div class="element-progress-indicator">
            <span class="progress-value">${progress}%</span>
          </div>
        </div>
        <h4 class="element-title">${element.title}</h4>
        <p class="element-description">${element.description}</p>
        <div class="element-footer">
          <span class="template-count">${element.templates} plantillas</span>
          <button class="btn btn-sm btn-primary" data-element="${element.id}">Ver Documentos</button>
        </div>
      `;
      
      elementsGrid.appendChild(elementCard);
    });

    section.appendChild(elementsGrid);
    return section;
  }

  /**
   * Render current element content
   */
  async renderCurrentElement() {
    console.log(`[PortfolioViewController] renderCurrentElement called for: ${this.currentElement}`);
    
    const elementContainer = this.findElement('.element-content');
    if (!elementContainer) {
      console.warn('[PortfolioViewController] No .element-content container found');
      return;
    }

    console.log('[PortfolioViewController] Element container found, rendering content');
    
    // Clear existing content
    elementContainer.innerHTML = '';

    // Create element header
    const header = this.createElementHeader();
    elementContainer.appendChild(header);

    // Create templates section
    const templatesSection = await this.createTemplatesSection();
    elementContainer.appendChild(templatesSection);

    // Create documents section
    const documentsSection = this.createDocumentsSection();
    elementContainer.appendChild(documentsSection);
    
    // Re-bind events for the new content
    this.bindElementContentEvents();
    
    console.log(`[PortfolioViewController] Element content rendered for: ${this.currentElement}`);
  }

  /**
   * Bind events for element content
   */
  bindElementContentEvents() {
    console.log('[PortfolioViewController] Binding element content events...');
    
    // Bind template card events within element content
    const elementContent = this.findElement('.element-content');
    if (elementContent) {
      // Template card clicks
      const templateCards = elementContent.querySelectorAll('.template-card');
      templateCards.forEach(card => {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          const templateId = card.getAttribute('data-template');
          if (templateId) {
            console.log(`[PortfolioViewController] Template card clicked: ${templateId}`);
            this.openDocumentTemplate(templateId);
          }
        });
      });
      
      // Reference docs button
      const referenceButtons = elementContent.querySelectorAll('.reference-docs-btn');
      referenceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('[PortfolioViewController] Reference docs button clicked');
          this.openReferenceViewer();
        });
      });
      
      // Document action buttons
      const actionButtons = elementContent.querySelectorAll('[data-portfolio-action]');
      actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const action = button.getAttribute('data-portfolio-action');
          console.log(`[PortfolioViewController] Portfolio action clicked: ${action}`);
          this.handlePortfolioAction(action, button);
        });
      });
      
      console.log(`[PortfolioViewController] Bound events for ${templateCards.length} template cards, ${referenceButtons.length} reference buttons, ${actionButtons.length} action buttons`);
    }
  }

  /**
   * Create element header
   */
  createElementHeader() {
    const header = this.createElement('div', ['element-header']);
    
    // Apply element-specific data attribute for CSS theming
    const elementDataAttr = this.currentElement;
    header.setAttribute('data-element', elementDataAttr);
    
    const elementInfo = this.getElementInfo(this.currentElement);
    const documentsCount = this.getElementDocuments(this.currentElement).length;
    const completionPercentage = Math.round((documentsCount / elementInfo.templates) * 100);
    
    header.innerHTML = `
      <div class="element-title-section">
        <h2>${elementInfo.title}</h2>
        <span class="element-code">${elementInfo.code}</span>
      </div>
      <p class="element-description">${elementInfo.description}</p>
      <div class="element-stats">
        <span class="templates-available">📋 ${elementInfo.templates} plantillas disponibles</span>
        <span class="documents-created">📄 ${documentsCount} documentos creados</span>
        <span class="completion-rate">📊 ${completionPercentage}% completado</span>
      </div>
    `;
    
    return header;
  }

  /**
   * Create templates section
   */
  async createTemplatesSection() {
    const section = this.createElement('section', ['templates-section']);
    
    const header = this.createElement('div', ['templates-header']);
    header.innerHTML = `
      <div class="section-header-content">
        <h3 class="section-title">Documentos del Elemento</h3>
        <div class="section-actions">
          <button class="btn btn-outline btn-sm reference-docs-btn">
            <span class="btn-icon">📚</span>
            Material de Referencia
          </button>
        </div>
      </div>
      <style>
        .templates-header .section-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .section-actions {
          display: flex;
          gap: 0.5rem;
        }
        .btn-outline {
          background: transparent;
          color: var(--primary, #3b82f6);
          border: 1px solid var(--primary, #3b82f6);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          text-decoration: none;
        }
        .btn-outline:hover {
          background: var(--primary, #3b82f6);
          color: white;
        }
        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }
        .btn-icon {
          font-size: 1rem;
        }
      </style>
    `;
    section.appendChild(header);

    const templatesGrid = this.createElement('div', ['templates-grid']);

    if (this.documentEngine) {
      try {
        console.log('[PortfolioViewController] Loading templates for element:', this.currentElement);
        console.log('[PortfolioViewController] DocumentEngine templates available:', this.documentEngine.templates?.size || 0);
        
        // Map element names to EC0249 element IDs
        const elementIdMap = {
          'element1': 'E0875',
          'element2': 'E0876', 
          'element3': 'E0877'
        };
        
        const ec0249ElementId = elementIdMap[this.currentElement] || this.currentElement;
        console.log('[PortfolioViewController] Mapped element ID:', this.currentElement, '->', ec0249ElementId);
        
        const templates = await this.documentEngine.getElementTemplates(ec0249ElementId);
        console.log('[PortfolioViewController] Templates found for element:', templates?.length || 0);
        
        if (templates && templates.length > 0) {
          templates.forEach(template => {
            console.log('[PortfolioViewController] Creating card for template:', template.id, template.title);
            const templateCard = this.createTemplateCard(template);
            templatesGrid.appendChild(templateCard);
          });
        } else {
          console.warn('[PortfolioViewController] No templates found for element:', this.currentElement);
          templatesGrid.innerHTML = '<div class="info-message">No hay plantillas disponibles para este elemento</div>';
        }
      } catch (error) {
        console.error('[PortfolioViewController] Failed to load templates:', error);
        templatesGrid.innerHTML = '<div class="error-message">Error al cargar plantillas</div>';
      }
    } else {
      console.warn('[PortfolioViewController] DocumentEngine not available when trying to load templates');
      templatesGrid.innerHTML = '<div class="error-message">Motor de documentos no disponible</div>';
    }

    section.appendChild(templatesGrid);
    return section;
  }

  /**
   * Create template card
   */
  createTemplateCard(template) {
    const card = this.createElement('div', ['template-card']);
    card.setAttribute('data-template', template.id);

    // Check if user has created this document
    const userDocument = this.getUserDocument(template.id);
    const hasDocument = userDocument !== null;
    const statusClass = hasDocument ? 'completed' : 'pending';
    const statusIcon = hasDocument ? '✅' : '📝';
    const statusText = hasDocument ? 'Completado' : 'Pendiente';

    // Add estimated time and video support indicators
    const hasVideo = template.videoSupport && template.videoSupport.id;
    const estimatedTime = template.estimatedTime || 30;

    card.innerHTML = `
      <div class="template-header">
        <h4 class="template-title">${template.title}</h4>
        <div class="template-status ${statusClass}" title="${statusText}">
          ${statusIcon}
        </div>
      </div>
      <p class="template-description">${template.description}</p>
      <div class="template-metadata">
        <span class="template-category">${template.category || 'General'}</span>
        <span class="template-required ${template.required ? 'required' : 'optional'}">
          ${template.required ? '🔴 Obligatorio' : '🔵 Opcional'}
        </span>
        ${hasVideo ? '<span class="template-video">🎥 Video disponible</span>' : ''}
        <span class="template-time">⏱️ ${estimatedTime} min</span>
      </div>
      <div class="template-actions">
        <button class="btn btn-primary btn-sm" title="${hasDocument ? 'Editar documento existente' : 'Crear nuevo documento'}">
          <span class="btn-icon">${hasDocument ? '✏️' : '➕'}</span>
          ${hasDocument ? 'Editar' : 'Crear'} Documento
        </button>
        ${hasDocument ? '<button class="btn btn-secondary btn-sm" title="Exportar como PDF"><span class="btn-icon">📄</span>Ver PDF</button>' : ''}
      </div>
    `;

    return card;
  }

  /**
   * Create documents section
   */
  createDocumentsSection() {
    const section = this.createElement('section', ['documents-section']);
    
    const header = this.createElement('div', ['documents-header']);
    header.innerHTML = `
      <h3 class="section-title">Mis Documentos</h3>
      <div class="documents-controls">
        <input type="text" id="portfolio-search" placeholder="Buscar documentos..." class="search-input">
        <select class="filter-control" data-filter="status">
          <option value="all">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="completed">Completado</option>
          <option value="reviewed">Revisado</option>
        </select>
      </div>
    `;
    section.appendChild(header);

    const documentsList = this.createElement('div', ['documents-list']);
    documentsList.id = 'documents-list';
    
    // Render documents for current element
    this.renderDocumentsList(documentsList);
    
    section.appendChild(documentsList);
    return section;
  }

  /**
   * Render documents list
   */
  renderDocumentsList(container) {
    container.innerHTML = '';
    
    const elementDocuments = this.getElementDocuments(this.currentElement);
    const filteredDocuments = this.applyDocumentFilters(elementDocuments);
    
    if (filteredDocuments.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📄</div>
          <h4>No hay documentos</h4>
          <p>Comienza creando tu primer documento usando las plantillas disponibles.</p>
        </div>
      `;
      return;
    }

    filteredDocuments.forEach(document => {
      const documentCard = this.createDocumentCard(document);
      container.appendChild(documentCard);
    });
  }

  /**
   * Create document card
   */
  createDocumentCard(document) {
    const card = this.createElement('div', ['document-card']);
    card.setAttribute('data-document', document.id);

    const lastModified = new Date(document.lastModified || document.createdAt);
    const progress = this.calculateDocumentProgress(document);

    card.innerHTML = `
      <div class="document-header">
        <h4 class="document-title">${document.title}</h4>
        <div class="document-status status-${document.status || 'draft'}">
          ${this.getStatusLabel(document.status || 'draft')}
        </div>
      </div>
      <p class="document-template">${document.templateName}</p>
      <div class="document-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="progress-text">${progress}% completado</span>
      </div>
      <div class="document-metadata">
        <span class="last-modified">Modificado: ${lastModified.toLocaleDateString()}</span>
        <span class="word-count">${document.content?.length || 0} caracteres</span>
      </div>
      <div class="document-actions">
        <button class="btn btn-primary btn-sm" data-portfolio-action="edit-document" data-document-id="${document.id}">
          Editar
        </button>
        <button class="btn btn-secondary btn-sm" data-portfolio-action="export-document" data-document-id="${document.id}">
          Exportar
        </button>
        <button class="btn btn-danger btn-sm" data-portfolio-action="delete-document" data-document-id="${document.id}">
          Eliminar
        </button>
      </div>
    `;

    return card;
  }

  /**
   * Show specific element
   */
  async showElement(elementId) {
    console.log(`[PortfolioViewController] showElement called with: ${elementId}`);
    
    // Always update the current element (don't skip if same, as we might need to re-render)
    this.currentElement = elementId;
    this.shouldShowElementContent = true;
    console.log(`[PortfolioViewController] Current element set to: ${this.currentElement}`);
    
    try {
      // Update element navigation
      this.updateElementNavigation();
      
      // Update URL to reflect current element  
      const newUrl = `/portfolio/${elementId}`;
      if (window.location.pathname !== newUrl) {
        window.history.pushState(null, '', newUrl);
        console.log(`[PortfolioViewController] URL updated to: ${newUrl}`);
      }
      
      // Ensure element content container exists and is visible
      this.showElementSection();
      
      // Re-render current element content
      console.log(`[PortfolioViewController] Rendering element content for: ${elementId}`);
      await this.renderCurrentElement();
      
      console.log(`[PortfolioViewController] Element ${elementId} shown successfully`);
      
    } catch (error) {
      console.error(`[PortfolioViewController] Error showing element ${elementId}:`, error);
      // Fallback to overview if element display fails
      this.hideElementSection();
      throw error;
    }
  }

  /**
   * Open document template
   */
  async openDocumentTemplate(templateId) {
    if (!this.documentEngine) {
      this.showNotification('Motor de documentos no disponible', 'error');
      return;
    }

    try {
      // Check if user already has this document
      const existingDocument = this.getUserDocument(templateId);
      
      // Update URL to reflect the document being opened
      const routerService = this.getService('RouterService');
      if (routerService) {
        if (existingDocument) {
          // Navigate to existing document
          routerService.navigateToDocument(templateId, {
            documentId: existingDocument.id,
            edit: true
          });
        } else {
          // Navigate to new document creation
          routerService.navigateToDocument(templateId, {
            edit: true
          });
        }
      }
      
      if (existingDocument) {
        // Edit existing document
        this.editDocument(existingDocument.id);
      } else {
        // Create new document from template
        await this.createDocumentFromTemplate(templateId);
      }
    } catch (error) {
      console.error('[PortfolioViewController] Failed to open template:', error);
      this.showNotification('Error al abrir la plantilla', 'error');
    }
  }

  /**
   * Create document from template
   */
  async createDocumentFromTemplate(templateId) {
    const template = await this.documentEngine.getTemplate(templateId);
    if (!template) {
      this.showNotification('Plantilla no encontrada', 'error');
      return;
    }

    // Open document editor
    this.emit('app:open-document-editor', {
      templateId: templateId,
      template: template,
      isNew: true
    });
  }

  /**
   * Edit existing document
   */
  editDocument(documentId) {
    const document = this.portfolioData.get(documentId);
    if (!document) {
      this.showNotification('Documento no encontrado', 'error');
      return;
    }

    // Open document editor
    this.emit('app:open-document-editor', {
      documentId: documentId,
      document: document,
      isNew: false
    });
  }

  /**
   * Handle portfolio actions
   */
  handlePortfolioAction(action, button) {
    const documentId = button.getAttribute('data-document-id');
    
    switch (action) {
      case 'edit-document':
        if (documentId) this.editDocument(documentId);
        break;
      case 'export-document':
        if (documentId) this.exportDocument(documentId);
        break;
      case 'delete-document':
        if (documentId) this.deleteDocument(documentId);
        break;
      case 'generate-portfolio-report':
        this.generatePortfolioReport();
        break;
      case 'export-all-documents':
        this.exportAllDocuments();
        break;
      default:
        console.warn('[PortfolioViewController] Unknown portfolio action:', action);
    }
  }

  /**
   * Export document
   */
  exportDocument(documentId) {
    this.showNotification('Exportación de documentos en desarrollo', 'info');
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      // Remove from portfolio data
      this.portfolioData.delete(documentId);
      
      // Save to storage
      const storageService = this.getService('StorageService');
      if (storageService) {
        const documents = Object.fromEntries(this.portfolioData);
        await storageService.setData('user_documents', documents);
      }
      
      // Re-render documents list
      const documentsList = this.findElement('#documents-list');
      if (documentsList) {
        this.renderDocumentsList(documentsList);
      }
      
      this.showNotification('Documento eliminado', 'success');
      
    } catch (error) {
      console.error('[PortfolioViewController] Failed to delete document:', error);
      this.showNotification('Error al eliminar documento', 'error');
    }
  }

  /**
   * Update filters
   */
  updateFilters(control) {
    const filterType = control.getAttribute('data-filter');
    this.documentFilters[filterType] = control.value;
    this.filterDocuments();
  }

  /**
   * Filter documents
   */
  filterDocuments() {
    const documentsList = this.findElement('#documents-list');
    if (documentsList) {
      this.renderDocumentsList(documentsList);
    }
  }

  /**
   * Apply document filters
   */
  applyDocumentFilters(documents) {
    return documents.filter(doc => {
      // Status filter
      if (this.documentFilters.status !== 'all' && doc.status !== this.documentFilters.status) {
        return false;
      }
      
      // Search filter
      if (this.documentFilters.search) {
        const searchTerm = this.documentFilters.search.toLowerCase();
        return doc.title.toLowerCase().includes(searchTerm) ||
               doc.templateName?.toLowerCase().includes(searchTerm);
      }
      
      return true;
    });
  }

  /**
   * Update element navigation
   */
  updateElementNavigation() {
    this.findElements('.element-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeItem = this.findElement(`[data-element="${this.currentElement}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  /**
   * Update certification progress
   */
  updateCertificationProgress() {
    const progressBar = this.findElement('.certification-progress .progress-fill');
    const progressText = this.findElement('.certification-progress .progress-text');
    
    if (progressBar && progressText) {
      const progress = this.calculateCertificationProgress();
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${progress}% completado`;
    }
  }

  /**
   * Helper methods
   */
  getElementInfo(elementId) {
    const elementInfo = {
      element1: {
        code: 'E0875',
        title: 'Identificación de Problemas',
        description: 'Identificar problemas de la organización mediante el uso de herramientas de diagnóstico',
        templates: 8
      },
      element2: {
        code: 'E0876',
        title: 'Desarrollo de Soluciones',
        description: 'Desarrollar soluciones integrales para la organización',
        templates: 2
      },
      element3: {
        code: 'E0877',
        title: 'Presentación de Propuestas',
        description: 'Presentar propuestas de solución a la organización',
        templates: 5
      }
    };
    return elementInfo[elementId] || elementInfo.element1;
  }

  getElementDocuments(elementId) {
    return Array.from(this.portfolioData.values())
      .filter(doc => doc.elementId === elementId);
  }

  getUserDocument(templateId) {
    return Array.from(this.portfolioData.values())
      .find(doc => doc.templateId === templateId) || null;
  }

  getElementCompletedDocuments(elementId) {
    return this.getElementDocuments(elementId)
      .filter(doc => doc.status === 'completed').length;
  }

  getCompletedDocumentsCount() {
    return Array.from(this.portfolioData.values())
      .filter(doc => doc.status === 'completed').length;
  }

  calculateDocumentProgress(document) {
    if (!document.content) return 0;
    // Simple progress calculation based on content length
    // In a real implementation, this would be more sophisticated
    const estimatedLength = 500; // Estimated characters for completion
    return Math.min(100, Math.round((document.content.length / estimatedLength) * 100));
  }

  calculateCertificationProgress() {
    const totalTemplates = 15; // Total EC0249 templates
    const completedDocuments = this.getCompletedDocumentsCount();
    return Math.round((completedDocuments / totalTemplates) * 100);
  }

  getStatusLabel(status) {
    const labels = {
      draft: 'Borrador',
      completed: 'Completado',
      reviewed: 'Revisado',
      submitted: 'Enviado'
    };
    return labels[status] || 'Borrador';
  }

  generatePortfolioReport() {
    this.showNotification('Generación de reportes en desarrollo', 'info');
  }

  exportAllDocuments() {
    this.showNotification('Exportación masiva en desarrollo', 'info');
  }

  /**
   * Show templates overview (documents section)
   */
  async showTemplatesOverview() {
    console.log('[PortfolioViewController] Showing templates overview');
    
    // Render dedicated templates page instead of portfolio overview
    await this.renderTemplatesPage();
  }

  /**
   * Render dedicated templates page
   */
  async renderTemplatesPage() {
    const container = this.findElement('.view-content');
    if (!container) {
      console.warn('[PortfolioViewController] No view content container found');
      return;
    }

    container.innerHTML = '';

    // Create templates page header
    const header = this.createElement('div', ['templates-header']);
    header.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">
          <span class="page-icon">📋</span>
          Plantillas de Documentos EC0249
        </h1>
        <p class="page-description">
          Accede a todas las plantillas organizadas por elementos de competencia. 
          Crea documentos profesionales siguiendo los estándares EC0249.
        </p>
      </div>
    `;
    container.appendChild(header);

    // Create filters section
    const filtersSection = this.createElement('div', ['templates-filters']);
    filtersSection.innerHTML = `
      <div class="filters-header">
        <h3>Filtrar Plantillas</h3>
      </div>
      <div class="filters-grid">
        <select class="filter-select" data-filter="element">
          <option value="all">Todos los Elementos</option>
          <option value="element1">Elemento 1: Identificación</option>
          <option value="element2">Elemento 2: Desarrollo</option>
          <option value="element3">Elemento 3: Presentación</option>
        </select>
        <input type="text" class="filter-search" placeholder="Buscar plantillas..." data-filter="search">
        <button class="btn btn-secondary reset-filters">Limpiar Filtros</button>
      </div>
    `;
    container.appendChild(filtersSection);

    // Create templates grid
    const templatesGrid = this.createElement('div', ['templates-grid']);
    await this.renderAllTemplatesGrid(templatesGrid);
    container.appendChild(templatesGrid);

    // Bind template page events
    this.bindTemplatePageEvents();
  }

  /**
   * Render all templates in grid format
   */
  async renderAllTemplatesGrid(container) {
    if (!this.documentEngine) {
      console.warn('[PortfolioViewController] DocumentEngine not available');
      container.innerHTML = '<div class="loading-message">Cargando plantillas...</div>';
      return;
    }

    const elements = [
      { id: 'element1', title: 'Elemento 1: Identificación del Problema' },
      { id: 'element2', title: 'Elemento 2: Desarrollo de Soluciones' },
      { id: 'element3', title: 'Elemento 3: Presentación de Propuestas' }
    ];

    container.innerHTML = '';

    for (const element of elements) {
      // Create element section
      const elementSection = this.createElement('div', ['element-templates-section']);
      elementSection.innerHTML = `
        <div class="element-section-header">
          <h3 class="element-section-title">${element.title}</h3>
          <span class="element-badge">${element.id.toUpperCase()}</span>
        </div>
      `;

      // Get templates for this element
      const templates = await this.getTemplatesForElement(element.id);
      const templatesContainer = this.createElement('div', ['element-templates-grid']);

      if (templates.length === 0) {
        templatesContainer.innerHTML = `
          <div class="no-templates-message">
            <span class="no-templates-icon">📝</span>
            <p>No hay plantillas disponibles para este elemento</p>
          </div>
        `;
      } else {
        templates.forEach(template => {
          const templateCard = this.createElement('div', ['template-card', 'enhanced']);
          templateCard.innerHTML = `
            <div class="template-card-header">
              <div class="template-icon">${template.icon || '📄'}</div>
              <div class="template-status ${this.getTemplateStatus(template.id)}"></div>
            </div>
            <div class="template-card-body">
              <h4 class="template-title">${template.title}</h4>
              <p class="template-description">${template.description}</p>
              <div class="template-metadata">
                <span class="template-element">${element.id.toUpperCase()}</span>
                <span class="template-difficulty">${template.difficulty || 'Intermedio'}</span>
              </div>
            </div>
            <div class="template-card-footer">
              <button class="btn btn-primary template-action" data-template="${template.id}">
                Crear Documento
              </button>
              <button class="btn btn-outline template-preview" data-template="${template.id}">
                Vista Previa
              </button>
            </div>
          `;
          templatesContainer.appendChild(templateCard);
        });
      }

      elementSection.appendChild(templatesContainer);
      container.appendChild(elementSection);
    }
  }

  /**
   * Get templates for specific element
   */
  async getTemplatesForElement(elementId) {
    if (!this.documentEngine) return [];

    try {
      const templates = await this.documentEngine.getAvailableTemplates();
      return templates.filter(template => template.element === elementId);
    } catch (error) {
      console.error('[PortfolioViewController] Failed to get templates:', error);
      return [];
    }
  }

  /**
   * Get template status (used, new, etc.)
   */
  getTemplateStatus(templateId) {
    const savedDoc = this.portfolioData.get(templateId);
    if (savedDoc) {
      return savedDoc.completed ? 'completed' : 'in-progress';
    }
    return 'new';
  }

  /**
   * Bind events for template page
   */
  bindTemplatePageEvents() {
    // Filter event listeners
    const elementFilter = this.findElement('[data-filter="element"]');
    const searchFilter = this.findElement('[data-filter="search"]');
    const resetButton = this.findElement('.reset-filters');

    if (elementFilter) {
      elementFilter.addEventListener('change', () => this.applyTemplateFilters());
    }

    if (searchFilter) {
      searchFilter.addEventListener('input', () => this.applyTemplateFilters());
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => this.resetTemplateFilters());
    }

    // Template action buttons
    this.findElements('.template-action').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const templateId = button.getAttribute('data-template');
        if (templateId) {
          this.openDocumentTemplate(templateId);
        }
      });
    });

    // Template preview buttons
    this.findElements('.template-preview').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const templateId = button.getAttribute('data-template');
        if (templateId) {
          this.previewTemplate(templateId);
        }
      });
    });
  }

  /**
   * Apply template filters
   */
  applyTemplateFilters() {
    const elementFilter = this.findElement('[data-filter="element"]');
    const searchFilter = this.findElement('[data-filter="search"]');
    
    const selectedElement = elementFilter?.value || 'all';
    const searchTerm = searchFilter?.value.toLowerCase() || '';

    const templateCards = this.findElements('.template-card');
    templateCards.forEach(card => {
      const templateElement = card.querySelector('.template-element')?.textContent.toLowerCase();
      const templateTitle = card.querySelector('.template-title')?.textContent.toLowerCase();
      const templateDesc = card.querySelector('.template-description')?.textContent.toLowerCase();

      let elementMatch = selectedElement === 'all' || templateElement?.includes(selectedElement.replace('element', ''));
      let searchMatch = !searchTerm || 
                       templateTitle?.includes(searchTerm) || 
                       templateDesc?.includes(searchTerm);

      card.style.display = (elementMatch && searchMatch) ? 'block' : 'none';
    });

    // Hide empty element sections
    const elementSections = this.findElements('.element-templates-section');
    elementSections.forEach(section => {
      const visibleCards = section.querySelectorAll('.template-card[style*="block"], .template-card:not([style*="none"])');
      section.style.display = visibleCards.length > 0 ? 'block' : 'none';
    });
  }

  /**
   * Reset template filters
   */
  resetTemplateFilters() {
    const elementFilter = this.findElement('[data-filter="element"]');
    const searchFilter = this.findElement('[data-filter="search"]');

    if (elementFilter) elementFilter.value = 'all';
    if (searchFilter) searchFilter.value = '';

    this.applyTemplateFilters();
  }

  /**
   * Preview template
   */
  previewTemplate(templateId) {
    this.showNotification(`Vista previa de plantilla ${templateId} en desarrollo`, 'info');
    // TODO: Implement template preview functionality
  }

  /**
   * Open reference viewer
   */
  async openReferenceViewer() {
    console.log('[PortfolioViewController] Opening reference viewer...');
    
    try {
      // Create reference viewer container if it doesn't exist
      let viewerContainer = document.getElementById('reference-viewer-container');
      if (!viewerContainer) {
        viewerContainer = document.createElement('div');
        viewerContainer.id = 'reference-viewer-container';
        viewerContainer.className = 'reference-viewer-overlay';
        document.body.appendChild(viewerContainer);
      }

      // Clear existing viewer
      if (this.referenceViewer) {
        try {
          await this.referenceViewer.destroy();
        } catch (error) {
          console.warn('[PortfolioViewController] Error destroying existing reference viewer:', error);
        }
        this.referenceViewer = null;
      }

      // Create new reference viewer
      this.referenceViewer = new ReferenceViewer(viewerContainer);
      
      // Initialize the viewer with container and event bus parameters
      try {
        await this.referenceViewer.initialize(this.app.container, this.app.eventBus);
        console.log('[PortfolioViewController] ReferenceViewer initialized successfully');
        
        // Ensure the component is mounted if autoMount failed
        if (!this.referenceViewer.mounted) {
          console.log('[PortfolioViewController] Manually mounting ReferenceViewer...');
          await this.referenceViewer.mount();
        }
      } catch (initError) {
        console.error('[PortfolioViewController] ReferenceViewer initialization failed:', initError);
        throw new Error(`Failed to initialize reference viewer: ${initError.message}`);
      }
      
      // Add CSS overlay styles
      viewerContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-primary, #f8fafc);
        z-index: 1000;
        overflow-y: auto;
      `;

      // Listen for close events through the eventBus after initialization
      if (this.app.eventBus) {
        this.app.eventBus.subscribe('reference-viewer:close', () => {
          this.closeReferenceViewer();
        });
      }

      console.log('[PortfolioViewController] Reference viewer opened successfully');
      
    } catch (error) {
      console.error('[PortfolioViewController] Failed to open reference viewer:', error);
      this.showNotification('Error al abrir el visor de referencias', 'error');
    }
  }

  /**
   * Close reference viewer
   */
  async closeReferenceViewer() {
    console.log('[PortfolioViewController] Closing reference viewer...');
    
    try {
      // Destroy viewer component
      if (this.referenceViewer) {
        await this.referenceViewer.destroy();
        this.referenceViewer = null;
      }

      // Remove viewer container
      const viewerContainer = document.getElementById('reference-viewer-container');
      if (viewerContainer) {
        document.body.removeChild(viewerContainer);
      }

      console.log('[PortfolioViewController] Reference viewer closed successfully');
      
    } catch (error) {
      console.error('[PortfolioViewController] Failed to close reference viewer:', error);
    }
  }

  /**
   * Show progress overview
   */
  async showProgressOverview() {
    console.log('[PortfolioViewController] Showing progress overview');
    
    // Re-render to show portfolio overview
    await this.onRender();
    
    // Scroll to certification progress section
    const progressSection = this.findElement('.certification-progress-section');
    if (progressSection) {
      progressSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Show specific section within portfolio view
   */
  async showSection(sectionId) {
    console.log(`[PortfolioViewController] Showing section: ${sectionId}`);
    
    // Wait for proper initialization if needed
    if (!this.element) {
      console.log('[PortfolioViewController] Waiting for element initialization...');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Ensure proper structure exists
    this.ensurePortfolioStructure();
    
    try {
      switch (sectionId) {
        case 'element1':
        case 'element2':
        case 'element3':
          console.log(`[PortfolioViewController] Processing element section: ${sectionId}`);
          // Set current element first
          this.currentElement = sectionId;
          this.shouldShowElementContent = true;
          
          // Hide portfolio overview and show element content
          this.showElementSection();
          await this.showElement(sectionId);
          
          console.log(`[PortfolioViewController] Element section ${sectionId} displayed successfully`);
          break;
        
        case 'documents':
          console.log('[PortfolioViewController] Processing documents section');
          // Show general documents/templates view
          this.hideElementSection();
          await this.showTemplatesOverview();
          break;
        
        case 'progress':
          console.log('[PortfolioViewController] Processing progress section');
          // Show portfolio progress view
          this.hideElementSection();
          await this.showProgressOverview();
          break;
        
        default:
          // Default to overview if section not recognized
          console.log(`[PortfolioViewController] Unknown section ${sectionId}, showing overview`);
          this.shouldShowElementContent = false;
          this.hideElementSection();
          await this.onRender();
      }
    } catch (error) {
      console.error(`[PortfolioViewController] Error showing section ${sectionId}:`, error);
      // Fallback to overview on error
      this.hideElementSection();
      await this.onRender();
    }
  }

  /**
   * Show element section (hide overview, show element content)
   */
  showElementSection() {
    console.log('[PortfolioViewController] Showing element section...');
    
    // Ensure proper structure exists first
    this.ensurePortfolioStructure();
    
    // Hide static overview (from index.html)
    const staticOverview = this.findElement('.portfolio-overview:not(.dynamic-overview)');
    if (staticOverview) {
      staticOverview.style.display = 'none';
      console.log('[PortfolioViewController] Static overview hidden');
    }
    
    // Hide dynamic overview (created by controller)
    const dynamicOverview = this.findElement('.portfolio-wrapper .portfolio-overview');
    if (dynamicOverview) {
      dynamicOverview.style.display = 'none';
      console.log('[PortfolioViewController] Dynamic overview hidden');
    }
    
    // Show element content
    let elementContent = this.findElement('.element-content');
    if (!elementContent) {
      // Create element content if it doesn't exist
      console.log('[PortfolioViewController] Creating missing element content container');
      const wrapper = this.findElement('.portfolio-wrapper') || this.element;
      if (wrapper) {
        elementContent = this.createElement('div', ['element-content']);
        elementContent.style.display = 'none';
        wrapper.appendChild(elementContent);
      }
    }
    
    if (elementContent) {
      elementContent.style.display = 'block';
      elementContent.setAttribute('data-element', this.currentElement);
      console.log('[PortfolioViewController] Element content shown');
    } else {
      console.error('[PortfolioViewController] Unable to create or find element content container');
    }
    
    // Hide competency elements section (from index.html)
    const competencyElements = this.findElement('.competency-elements');
    if (competencyElements) {
      competencyElements.style.display = 'none';
      console.log('[PortfolioViewController] Competency elements hidden');
    }
  }
  
  /**
   * Hide element section (show overview, hide element content)
   */
  hideElementSection() {
    console.log('[PortfolioViewController] Hiding element section...');
    
    // Reset element content visibility state
    this.shouldShowElementContent = false;
    
    // Show static overview (from index.html)
    const staticOverview = this.findElement('.portfolio-overview:not(.dynamic-overview)');
    if (staticOverview) {
      staticOverview.style.display = 'block';
      console.log('[PortfolioViewController] Static overview shown');
    }
    
    // Show dynamic overview (created by controller)
    const dynamicOverview = this.findElement('.portfolio-wrapper .portfolio-overview');
    if (dynamicOverview) {
      dynamicOverview.style.display = 'block';
      console.log('[PortfolioViewController] Dynamic overview shown');
    }
    
    // Hide element content
    const elementContent = this.findElement('.element-content');
    if (elementContent) {
      elementContent.style.display = 'none';
      console.log('[PortfolioViewController] Element content hidden');
    }
    
    // Show competency elements section (from index.html) 
    const competencyElements = this.findElement('.competency-elements');
    if (competencyElements) {
      competencyElements.style.display = 'block';
      console.log('[PortfolioViewController] Competency elements shown');
    }
  }

  onLanguageUpdate() {
    super.onLanguageUpdate();
    
    // Reload portfolio content in new language
    this.loadPortfolioData().then(() => {
      this.onRender();
    });
  }
}

export default PortfolioViewController;