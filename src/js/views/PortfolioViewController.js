/**
 * Portfolio View Controller - Manages the document portfolio and certification tracking
 * Handles document generation, portfolio management, and certification pathway
 */
import BaseViewController from './BaseViewController.js';

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
  }

  async onInitialize() {
    // Get document engine
    this.documentEngine = this.getModule('documentEngine');
    if (!this.documentEngine) {
      console.warn('[PortfolioViewController] DocumentEngine not available yet - will be available after modules initialization');
    }
  }

  bindEvents() {
    // Element navigation
    this.findElements('.element-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const elementId = item.getAttribute('data-element');
        if (elementId) {
          this.showElement(elementId);
        }
      });
    });

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
  }

  async onShow() {
    // Load portfolio data when view is shown
    await this.loadPortfolioData();
  }

  async onRender() {
    // Render portfolio overview
    this.renderPortfolioOverview();
    
    // Render current element content
    await this.renderCurrentElement();
    
    // Update certification progress
    this.updateCertificationProgress();
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
          <button class="btn btn-sm btn-primary">Ver Documentos</button>
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
    const elementContainer = this.findElement('.element-content');
    if (!elementContainer) return;

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
  }

  /**
   * Create element header
   */
  createElementHeader() {
    const header = this.createElement('div', ['element-header']);
    
    const elementInfo = this.getElementInfo(this.currentElement);
    header.innerHTML = `
      <div class="element-title-section">
        <h2>${elementInfo.title}</h2>
        <span class="element-code">${elementInfo.code}</span>
      </div>
      <p class="element-description">${elementInfo.description}</p>
      <div class="element-stats">
        <span class="templates-available">${elementInfo.templates} plantillas disponibles</span>
        <span class="documents-created">${this.getElementDocuments(this.currentElement).length} documentos creados</span>
      </div>
    `;
    
    return header;
  }

  /**
   * Create templates section
   */
  async createTemplatesSection() {
    const section = this.createElement('section', ['templates-section']);
    
    const title = this.createElement('h3', ['section-title']);
    title.textContent = 'Plantillas de Documentos';
    section.appendChild(title);

    const templatesGrid = this.createElement('div', ['templates-grid']);

    if (this.documentEngine) {
      try {
        const templates = await this.documentEngine.getElementTemplates(this.currentElement);
        
        templates.forEach(template => {
          const templateCard = this.createTemplateCard(template);
          templatesGrid.appendChild(templateCard);
        });
      } catch (error) {
        console.error('[PortfolioViewController] Failed to load templates:', error);
        templatesGrid.innerHTML = '<div class="error-message">Error al cargar plantillas</div>';
      }
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

    card.innerHTML = `
      <div class="template-header">
        <h4 class="template-title">${template.title}</h4>
        <div class="template-status ${hasDocument ? 'completed' : 'pending'}">
          ${hasDocument ? '✅' : '📝'}
        </div>
      </div>
      <p class="template-description">${template.description}</p>
      <div class="template-metadata">
        <span class="template-category">${template.category || 'General'}</span>
        <span class="template-required ${template.required ? 'required' : 'optional'}">
          ${template.required ? 'Obligatorio' : 'Opcional'}
        </span>
      </div>
      <div class="template-actions">
        <button class="btn btn-primary btn-sm">
          ${hasDocument ? 'Editar' : 'Crear'} Documento
        </button>
        ${hasDocument ? '<button class="btn btn-secondary btn-sm">Ver PDF</button>' : ''}
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
    if (this.currentElement === elementId) return;
    
    this.currentElement = elementId;
    
    // Update element navigation
    this.updateElementNavigation();
    
    // Re-render current element content
    await this.renderCurrentElement();
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
   * Show specific section within portfolio view
   */
  async showSection(sectionId) {
    if (sectionId.startsWith('element')) {
      await this.showElement(sectionId);
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