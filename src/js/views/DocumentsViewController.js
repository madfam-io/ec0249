/**
 * Documents View Controller - Template Browsing and Document Creation
 * 
 * @description Dedicated controller for browsing all EC0249 document templates,
 * organized by competency elements. Provides template discovery, preview,
 * and document creation functionality with search and filtering capabilities.
 * 
 * @class DocumentsViewController
 * @extends BaseViewController
 * 
 * Key Features:
 * - Template browsing organized by EC0249 elements
 * - Advanced search and filtering functionality
 * - Template preview and metadata display
 * - Direct document creation from templates
 * - Integration with DocumentEngine
 * - Responsive grid layout
 * 
 * Navigation:
 * - Accessible via sidebar "Plantillas" navigation
 * - Direct URL access via /documents section
 * - Integration with portfolio workflow
 * 
 * @version 2.0.0
 * @since 2.0.0
 */
import BaseViewController from './BaseViewController.js';

class DocumentsViewController extends BaseViewController {
  constructor(viewId, app) {
    super(viewId, app);
    
    this.documentEngine = null;
    this.progressService = null;
    this.i18nService = null;
    
    // Filter and search state
    this.filters = {
      element: 'all',      // 'all', 'element1', 'element2', 'element3'
      difficulty: 'all',   // 'all', 'beginner', 'intermediate', 'advanced'
      status: 'all',       // 'all', 'new', 'in-progress', 'completed'
      required: 'all',     // 'all', 'required', 'optional'
      search: ''
    };
    
    // Template data cache
    this.allTemplates = [];
    this.filteredTemplates = [];
  }

  async onInitialize() {
    // Get required services
    this.documentEngine = this.getModule('documentEngine');
    this.progressService = this.getService('ProgressService');
    this.i18nService = this.getService('I18nService');
    
    if (!this.documentEngine) {
      console.warn('[DocumentsViewController] DocumentEngine not available yet');
    }
    
    console.log('[DocumentsViewController] Initialized');
  }

  async onShow() {
    // Load template data when view is shown with retry mechanism
    await this.loadTemplateDataWithRetry();
    
    console.log('[DocumentsViewController] View shown');
  }

  async onRender() {
    if (!this.element) {
      console.warn('[DocumentsViewController] No element available for rendering');
      return;
    }

    console.log('[DocumentsViewController] Rendering documents view');
    
    // Clear existing content
    this.element.innerHTML = '';
    
    // Create main structure
    const container = this.createElement('div', ['documents-view']);
    
    // Add page header
    container.appendChild(this.createPageHeader());
    
    // Add filters section
    container.appendChild(this.createFiltersSection());
    
    // Add templates grid
    container.appendChild(this.createTemplatesGrid());
    
    // Add footer actions
    container.appendChild(this.createFooterActions());
    
    this.element.appendChild(container);
    
    // Bind event listeners
    this.bindEvents();
    
    // Apply initial filtering
    this.applyFilters();
    
    console.log('[DocumentsViewController] Rendering completed');
  }

  /**
   * Create page header section
   */
  createPageHeader() {
    const header = this.createElement('div', ['page-header']);
    
    header.innerHTML = `
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <span class="page-icon">📋</span>
            Plantillas de Documentos EC0249
          </h1>
          <p class="page-description">
            Explora todas las plantillas organizadas por elementos de competencia. 
            Crea documentos profesionales siguiendo los estándares EC0249.
          </p>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-number">${this.allTemplates.length}</div>
            <div class="stat-label">Plantillas Disponibles</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${this.getCompletedTemplatesCount()}</div>
            <div class="stat-label">Documentos Creados</div>
          </div>
        </div>
      </div>
    `;
    
    return header;
  }

  /**
   * Create filters section
   */
  createFiltersSection() {
    const section = this.createElement('div', ['filters-section']);
    
    section.innerHTML = `
      <div class="filters-header">
        <h3 class="filters-title">
          <span class="filters-icon">🔍</span>
          Filtrar Plantillas
        </h3>
        <button class="btn btn-outline btn-sm clear-filters" data-action="clear-filters">
          <span class="btn-icon">🗑️</span>
          Limpiar Filtros
        </button>
      </div>
      
      <div class="filters-grid">
        <div class="filter-group">
          <label for="elementFilter" class="filter-label">Elemento de Competencia</label>
          <select id="elementFilter" class="filter-select" data-filter="element">
            <option value="all">Todos los Elementos</option>
            <option value="element1">Elemento 1: Identificación</option>
            <option value="element2">Elemento 2: Desarrollo</option>
            <option value="element3">Elemento 3: Presentación</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="statusFilter" class="filter-label">Estado</label>
          <select id="statusFilter" class="filter-select" data-filter="status">
            <option value="all">Todos los Estados</option>
            <option value="new">No iniciado</option>
            <option value="in-progress">En progreso</option>
            <option value="completed">Completado</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="requiredFilter" class="filter-label">Tipo</label>
          <select id="requiredFilter" class="filter-select" data-filter="required">
            <option value="all">Todos los Tipos</option>
            <option value="required">Obligatorios</option>
            <option value="optional">Opcionales</option>
          </select>
        </div>
        
        <div class="filter-group search-group">
          <label for="searchFilter" class="filter-label">Buscar</label>
          <input 
            type="text" 
            id="searchFilter" 
            class="filter-input" 
            placeholder="Buscar plantillas..." 
            data-filter="search"
          />
        </div>
      </div>
      
      <div class="active-filters" id="activeFilters" style="display: none;">
        <span class="active-filters-label">Filtros activos:</span>
        <div class="active-filters-list"></div>
      </div>
    `;
    
    return section;
  }

  /**
   * Create templates grid
   */
  createTemplatesGrid() {
    const grid = this.createElement('div', ['templates-section']);
    
    grid.innerHTML = `
      <div class="templates-header">
        <h3 class="section-title">Plantillas Disponibles</h3>
        <div class="view-toggles">
          <button class="btn btn-sm view-toggle active" data-view="grid" title="Vista de cuadrícula">
            <span class="btn-icon">⊞</span>
          </button>
          <button class="btn btn-sm view-toggle" data-view="list" title="Vista de lista">
            <span class="btn-icon">☰</span>
          </button>
        </div>
      </div>
      
      <div class="templates-container">
        <div id="templatesGrid" class="templates-grid view-grid">
          <!-- Templates will be populated here -->
        </div>
        
        <div id="noResults" class="no-results" style="display: none;">
          <div class="no-results-icon">🔍</div>
          <h4>No se encontraron plantillas</h4>
          <p>Intenta ajustar tus filtros de búsqueda o explorar diferentes elementos.</p>
          <button class="btn btn-secondary" data-action="clear-filters">Limpiar Filtros</button>
        </div>
      </div>
    `;
    
    return grid;
  }

  /**
   * Create footer actions
   */
  createFooterActions() {
    const footer = this.createElement('div', ['documents-footer']);
    
    footer.innerHTML = `
      <div class="footer-content">
        <div class="footer-info">
          <p class="footer-text">
            <span class="info-icon">💡</span>
            Las plantillas marcadas como "Obligatorias" son requeridas para la certificación EC0249.
          </p>
        </div>
        <div class="footer-actions">
          <button class="btn btn-outline" data-action="view-portfolio">
            <span class="btn-icon">📂</span>
            Ver Mi Portafolio
          </button>
          <button class="btn btn-outline" data-action="view-progress">
            <span class="btn-icon">📊</span>
            Ver Mi Progreso
          </button>
        </div>
      </div>
    `;
    
    return footer;
  }

  /**
   * Load template data from DocumentEngine
   */
  /**
   * Load template data with retry mechanism for DocumentEngine availability
   */
  async loadTemplateDataWithRetry() {
    const maxRetries = 5;
    const retryDelay = 500; // 500ms
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (await this.loadTemplateData()) {
          // Success - templates loaded
          if (this.allTemplates.length > 0) {
            // Re-render if templates were loaded after initial render
            this.renderTemplateCards();
            this.updateHeaderStats();
          }
          return;
        }
        
        // Wait before retry
        if (attempt < maxRetries - 1) {
          console.log(`[DocumentsViewController] Retry ${attempt + 1}/${maxRetries} for DocumentEngine...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.error(`[DocumentsViewController] Attempt ${attempt + 1} failed:`, error);
      }
    }
    
    console.warn('[DocumentsViewController] Failed to load templates after all retries');
    this.showLoadingError();
  }

  /**
   * Load template data from DocumentEngine
   * @returns {boolean} True if successful, false if DocumentEngine not available
   */
  async loadTemplateData() {
    try {
      if (!this.documentEngine) {
        // Try to get DocumentEngine
        this.documentEngine = this.getModule('documentEngine');
        if (!this.documentEngine) {
          return false; // Not available yet
        }
      }

      // Get all available templates
      this.allTemplates = await this.documentEngine.getAvailableTemplates() || [];
      
      // Enrich templates with status information
      this.allTemplates = this.allTemplates.map(template => ({
        ...template,
        status: this.getTemplateStatus(template.id),
        userProgress: this.getTemplateProgress(template.id)
      }));
      
      console.log(`[DocumentsViewController] Loaded ${this.allTemplates.length} templates`);
      return true;
      
    } catch (error) {
      console.error('[DocumentsViewController] Failed to load template data:', error);
      this.allTemplates = [];
      return false;
    }
  }

  /**
   * Get template status based on user progress
   */
  getTemplateStatus(templateId) {
    // Check if user has created a document from this template
    const storageService = this.getService('StorageService');
    if (!storageService) return 'new';

    try {
      const userDocuments = storageService.getData('user_documents') || {};
      const document = Object.values(userDocuments).find(doc => doc.templateId === templateId);
      
      if (!document) return 'new';
      
      if (document.status === 'completed') return 'completed';
      if (document.content && document.content.length > 0) return 'in-progress';
      
      return 'new';
    } catch (error) {
      console.error('[DocumentsViewController] Error checking template status:', error);
      return 'new';
    }
  }

  /**
   * Get template progress percentage
   */
  getTemplateProgress(templateId) {
    const status = this.getTemplateStatus(templateId);
    if (status === 'completed') return 100;
    if (status === 'in-progress') return 50; // Simplified progress calculation
    return 0;
  }

  /**
   * Get count of completed templates
   */
  getCompletedTemplatesCount() {
    return this.allTemplates.filter(template => 
      this.getTemplateStatus(template.id) === 'completed'
    ).length;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Filter controls
    this.findElements('.filter-select, .filter-input').forEach(control => {
      const eventType = control.type === 'text' ? 'input' : 'change';
      control.addEventListener(eventType, (e) => {
        this.updateFilter(e.target);
      });
    });
    
    // View toggles
    this.findElements('.view-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleView(toggle.dataset.view);
      });
    });
    
    // Action buttons
    this.findElements('[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleAction(button.dataset.action, button);
      });
    });
    
    // Template cards (will be bound after rendering)
    this.bindTemplateCardEvents();
  }

  /**
   * Bind events for template cards
   */
  bindTemplateCardEvents() {
    this.findElements('.template-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.template-actions')) {
          return; // Let action buttons handle their own events
        }
        
        const templateId = card.dataset.templateId;
        if (templateId) {
          this.previewTemplate(templateId);
        }
      });
    });
    
    // Template action buttons
    this.findElements('.template-action').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const action = button.dataset.action;
        const templateId = button.dataset.templateId;
        
        if (action && templateId) {
          this.handleTemplateAction(action, templateId, button);
        }
      });
    });
  }

  /**
   * Update filter value and apply filtering
   */
  updateFilter(control) {
    const filterType = control.dataset.filter;
    this.filters[filterType] = control.value;
    
    this.applyFilters();
    this.updateActiveFiltersDisplay();
  }

  /**
   * Apply current filters to templates
   */
  applyFilters() {
    this.filteredTemplates = this.allTemplates.filter(template => {
      // Element filter
      if (this.filters.element !== 'all' && template.element !== this.filters.element) {
        return false;
      }
      
      // Status filter
      if (this.filters.status !== 'all' && template.status !== this.filters.status) {
        return false;
      }
      
      // Required filter
      if (this.filters.required !== 'all') {
        const isRequired = template.required === true;
        if (this.filters.required === 'required' && !isRequired) return false;
        if (this.filters.required === 'optional' && isRequired) return false;
      }
      
      // Search filter
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        const searchable = [
          template.title,
          template.description,
          template.category,
          template.element
        ].join(' ').toLowerCase();
        
        if (!searchable.includes(searchTerm)) return false;
      }
      
      return true;
    });
    
    this.renderTemplateCards();
  }

  /**
   * Render template cards
   */
  renderTemplateCards() {
    const grid = this.findElement('#templatesGrid');
    const noResults = this.findElement('#noResults');
    
    if (!grid) return;
    
    if (this.filteredTemplates.length === 0) {
      grid.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    grid.innerHTML = this.filteredTemplates.map(template => 
      this.createTemplateCard(template)
    ).join('');
    
    // Rebind events for new cards
    this.bindTemplateCardEvents();
  }

  /**
   * Create individual template card
   */
  createTemplateCard(template) {
    const statusConfig = this.getStatusConfig(template.status);
    const elementConfig = this.getElementConfig(template.element);
    
    return `
      <div class="template-card ${template.status}" data-template-id="${template.id}">
        <div class="template-header">
          <div class="template-meta">
            <span class="template-element ${elementConfig.class}">${elementConfig.label}</span>
            ${template.required ? '<span class="template-required">Obligatorio</span>' : '<span class="template-optional">Opcional</span>'}
          </div>
          <div class="template-status ${statusConfig.class}" title="${statusConfig.label}">
            ${statusConfig.icon}
          </div>
        </div>
        
        <div class="template-content">
          <h4 class="template-title">${template.title}</h4>
          <p class="template-description">${template.description}</p>
          
          <div class="template-details">
            <div class="template-info">
              <span class="template-time">
                <span class="info-icon">⏱️</span>
                ${template.estimatedTime || 30} min
              </span>
              ${template.videoSupport ? '<span class="template-video"><span class="info-icon">🎥</span>Con video</span>' : ''}
            </div>
            
            ${template.userProgress > 0 ? `
              <div class="template-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${template.userProgress}%"></div>
                </div>
                <span class="progress-text">${template.userProgress}%</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="template-actions">
          <button class="btn btn-primary template-action" 
                  data-action="create-document" 
                  data-template-id="${template.id}">
            <span class="btn-icon">${template.status === 'completed' ? '✏️' : '➕'}</span>
            ${template.status === 'completed' ? 'Editar' : 'Crear'} Documento
          </button>
          <button class="btn btn-outline btn-sm template-action" 
                  data-action="preview-template" 
                  data-template-id="${template.id}">
            <span class="btn-icon">👁️</span>
            Vista Previa
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Get status configuration
   */
  getStatusConfig(status) {
    const configs = {
      'new': { icon: '📝', label: 'No iniciado', class: 'status-new' },
      'in-progress': { icon: '⏳', label: 'En progreso', class: 'status-progress' },
      'completed': { icon: '✅', label: 'Completado', class: 'status-completed' }
    };
    return configs[status] || configs['new'];
  }

  /**
   * Get element configuration
   */
  getElementConfig(elementId) {
    const configs = {
      'element1': { label: 'E1: Identificación', class: 'element-1' },
      'element2': { label: 'E2: Desarrollo', class: 'element-2' },
      'element3': { label: 'E3: Presentación', class: 'element-3' }
    };
    return configs[elementId] || { label: elementId, class: 'element-default' };
  }

  /**
   * Handle general actions
   */
  async handleAction(action, button) {
    switch (action) {
      case 'clear-filters':
        this.clearFilters();
        break;
      
      case 'view-portfolio':
        await this.app.switchView('portfolio');
        break;
      
      case 'view-progress':
        await this.app.switchView('portfolio');
        await this.app.switchSection('progress');
        break;
      
      default:
        console.warn(`[DocumentsViewController] Unknown action: ${action}`);
    }
  }

  /**
   * Handle template-specific actions
   */
  async handleTemplateAction(action, templateId, button) {
    switch (action) {
      case 'create-document':
        await this.createDocument(templateId);
        break;
      
      case 'preview-template':
        this.previewTemplate(templateId);
        break;
      
      default:
        console.warn(`[DocumentsViewController] Unknown template action: ${action}`);
    }
  }

  /**
   * Create document from template
   */
  async createDocument(templateId) {
    if (!this.documentEngine) {
      this.showNotification('Motor de documentos no disponible', 'error');
      return;
    }

    try {
      // Navigate to portfolio view and open the template
      await this.app.switchView('portfolio');
      
      // Find the portfolio controller and open the template
      const portfolioController = this.app.viewManager?.getController('portfolio');
      if (portfolioController && typeof portfolioController.openDocumentTemplate === 'function') {
        await portfolioController.openDocumentTemplate(templateId);
      } else {
        console.warn('[DocumentsViewController] Could not access portfolio controller');
        this.showNotification('Error al abrir el editor de documentos', 'error');
      }
      
    } catch (error) {
      console.error('[DocumentsViewController] Failed to create document:', error);
      this.showNotification('Error al crear el documento', 'error');
    }
  }

  /**
   * Preview template
   */
  previewTemplate(templateId) {
    // TODO: Implement template preview functionality
    this.showNotification(`Vista previa de plantilla ${templateId} en desarrollo`, 'info');
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    // Reset filter values
    this.filters = {
      element: 'all',
      difficulty: 'all', 
      status: 'all',
      required: 'all',
      search: ''
    };
    
    // Update UI controls
    this.findElements('.filter-select').forEach(select => {
      const filterType = select.dataset.filter;
      select.value = this.filters[filterType];
    });
    
    this.findElements('.filter-input').forEach(input => {
      const filterType = input.dataset.filter;
      input.value = this.filters[filterType];
    });
    
    // Apply filters
    this.applyFilters();
    this.updateActiveFiltersDisplay();
  }

  /**
   * Update active filters display
   */
  updateActiveFiltersDisplay() {
    const activeFilters = this.findElement('#activeFilters');
    const filtersList = this.findElement('.active-filters-list');
    
    if (!activeFilters || !filtersList) return;
    
    const activeFilterItems = [];
    
    // Check each filter for active state
    Object.entries(this.filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        let label = '';
        switch (key) {
          case 'element':
            label = `Elemento: ${this.getElementConfig(value).label}`;
            break;
          case 'status':
            label = `Estado: ${this.getStatusConfig(value).label}`;
            break;
          case 'required':
            label = `Tipo: ${value === 'required' ? 'Obligatorios' : 'Opcionales'}`;
            break;
          case 'search':
            label = `Búsqueda: "${value}"`;
            break;
        }
        
        if (label) {
          activeFilterItems.push(`
            <span class="active-filter-item" data-filter="${key}">
              ${label}
              <button class="remove-filter" data-filter="${key}">×</button>
            </span>
          `);
        }
      }
    });
    
    if (activeFilterItems.length > 0) {
      filtersList.innerHTML = activeFilterItems.join('');
      activeFilters.style.display = 'flex';
      
      // Bind remove filter events
      filtersList.querySelectorAll('.remove-filter').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const filterType = button.dataset.filter;
          this.removeFilter(filterType);
        });
      });
    } else {
      activeFilters.style.display = 'none';
    }
  }

  /**
   * Remove specific filter
   */
  removeFilter(filterType) {
    this.filters[filterType] = filterType === 'search' ? '' : 'all';
    
    // Update corresponding UI control
    const control = this.findElement(`[data-filter="${filterType}"]`);
    if (control) {
      control.value = this.filters[filterType];
    }
    
    this.applyFilters();
    this.updateActiveFiltersDisplay();
  }

  /**
   * Toggle view mode (grid/list)
   */
  toggleView(viewMode) {
    // Update toggle buttons
    this.findElements('.view-toggle').forEach(toggle => {
      toggle.classList.remove('active');
    });
    
    const activeToggle = this.findElement(`[data-view="${viewMode}"]`);
    if (activeToggle) {
      activeToggle.classList.add('active');
    }
    
    // Update grid class
    const grid = this.findElement('#templatesGrid');
    if (grid) {
      grid.className = `templates-grid view-${viewMode}`;
    }
  }

  async onLanguageUpdate() {
    super.onLanguageUpdate();
  }

  /**
   * Update header statistics after templates load
   */
  updateHeaderStats() {
    const totalTemplatesElement = this.findElement('.stat-card .stat-number');
    const completedTemplatesElement = this.findElements('.stat-card .stat-number')[1];
    
    if (totalTemplatesElement) {
      totalTemplatesElement.textContent = this.allTemplates.length;
    }
    if (completedTemplatesElement) {
      completedTemplatesElement.textContent = this.getCompletedTemplatesCount();
    }
  }

  /**
   * Show loading error state
   */
  showLoadingError() {
    const grid = this.findElement('#templatesGrid');
    const noResults = this.findElement('#noResults');
    
    if (grid && noResults) {
      grid.style.display = 'none';
      noResults.style.display = 'block';
      noResults.innerHTML = `
        <div class="no-results-icon">⚠️</div>
        <h4>Error al cargar plantillas</h4>
        <p>No se pudieron cargar las plantillas. Verifica tu conexión o recarga la página.</p>
        <button class="btn btn-primary" onclick="location.reload()">Recargar Página</button>
      `;
    }
  }
}

export default DocumentsViewController;
