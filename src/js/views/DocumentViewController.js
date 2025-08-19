/**
 * Document View Controller - Direct document access via URLs
 * 
 * @description Handles navigation to individual document templates via clean URLs.
 * Provides direct access to all 15 EC0249 document templates with proper state
 * management and integration with the document editor system.
 * 
 * @class DocumentViewController
 * @extends BaseViewController
 * 
 * Key Features:
 * - Direct URL access to any of the 15 document templates
 * - Document creation, editing, and viewing modes
 * - State management and persistence
 * - Integration with DocumentEditor component
 * - Breadcrumb navigation and context awareness
 * 
 * Supported URLs:
 * - /document/problem_description - Create new problem description
 * - /document/template_id/edit - Create/edit document
 * - /document/template_id/doc_id - View existing document
 * - /document/template_id/doc_id/edit - Edit existing document
 * 
 * @version 2.0.0
 * @since 2.0.0
 */
import BaseViewController from './BaseViewController.js';

class DocumentViewController extends BaseViewController {
  constructor() {
    super('DocumentViewController', {
      dependencies: ['DocumentEngine', 'RouterService', 'ProgressService', 'I18nService'],
      events: {
        'document:close': 'handleDocumentClose',
        'document:save': 'handleDocumentSave', 
        'document:export': 'handleDocumentExport',
        'video:play': 'handleVideoPlay'
      },
      autoMount: true
    });

    this.documentEngine = null;
    this.routerService = null;
    this.progressService = null;
    this.i18nService = null;
    
    // Document state
    this.currentDocument = null;
    this.currentTemplate = null;
    this.documentEditor = null;
    this.documentInfo = null;
    
    // UI state
    this.isLoading = false;
    this.hasError = false;
    this.errorMessage = '';
  }

  async onInitialize() {
    console.log('[DocumentViewController] Initializing...');
    
    try {
      // Get required services
      this.documentEngine = this.service('DocumentEngine');
      this.routerService = this.service('RouterService');
      this.progressService = this.service('ProgressService');
      this.i18nService = this.service('I18nService');

      if (!this.documentEngine || !this.routerService) {
        throw new Error('Required services not available');
      }

      // Subscribe to router events
      this.subscribe('router:navigate', this.handleRouteChange.bind(this));
      
      console.log('[DocumentViewController] Initialized successfully');
    } catch (error) {
      console.error('[DocumentViewController] Initialization failed:', error);
      this.setError('Error al inicializar el controlador de documentos');
    }
  }

  async handleRouteChange(event) {
    const { path, params } = event;
    
    // Only handle document routes
    if (!this.routerService.isDocumentRoute()) {
      return;
    }
    
    console.log('[DocumentViewController] Handling document route:', path, params);
    
    try {
      this.setLoading(true);
      
      // Get document information from route
      this.documentInfo = this.routerService.getDocumentRouteInfo();
      
      if (!this.documentInfo || !this.documentInfo.templateId) {
        throw new Error('Invalid document route - no template ID');
      }
      
      // Load and display document
      await this.loadDocument(this.documentInfo);
      
      this.setLoading(false);
    } catch (error) {
      console.error('[DocumentViewController] Route handling failed:', error);
      this.setError('Error al cargar el documento');
      this.setLoading(false);
    }
  }

  async loadDocument(documentInfo) {
    const { templateId, documentId, isEdit, isNew } = documentInfo;
    
    console.log('[DocumentViewController] Loading document:', documentInfo);
    
    try {
      // Get template
      this.currentTemplate = this.documentEngine.getTemplate(templateId);
      if (!this.currentTemplate) {
        throw new Error(`Template '${templateId}' not found`);
      }
      
      // Load or create document
      if (documentId && !isNew) {
        // Load existing document
        this.currentDocument = this.documentEngine.getDocument(documentId);
        if (!this.currentDocument) {
          throw new Error(`Document '${documentId}' not found`);
        }
      } else {
        // Create new document
        this.currentDocument = this.documentEngine.createDocument(templateId);
      }
      
      // Initialize document editor
      await this.initializeDocumentEditor();
      
      // Update page title and metadata
      this.updatePageMetadata();
      
      console.log('[DocumentViewController] Document loaded successfully');
    } catch (error) {
      console.error('[DocumentViewController] Document loading failed:', error);
      throw error;
    }
  }

  async initializeDocumentEditor() {
    try {
      // Create document editor container
      const editorContainer = this.createEditorContainer();
      
      // Import DocumentEditor dynamically
      const { default: DocumentEditor } = await import('../components/DocumentEditor.js');
      
      // Create document editor instance
      this.documentEditor = new DocumentEditor(editorContainer, {
        templateId: this.currentTemplate.id,
        documentId: this.currentDocument.id,
        isNew: !this.documentInfo.documentId
      });
      
      // Initialize editor
      await this.documentEditor.initialize(this.container, this.eventBus);
      
      // Mount editor if not auto-mounted
      if (!this.documentEditor.mounted) {
        await this.documentEditor.mount();
      }
      
      console.log('[DocumentViewController] Document editor initialized');
    } catch (error) {
      console.error('[DocumentViewController] Editor initialization failed:', error);
      throw error;
    }
  }

  createEditorContainer() {
    // Remove existing editor container
    const existingContainer = document.getElementById('document-view-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Create new container
    const container = document.createElement('div');
    container.id = 'document-view-container';
    container.className = 'document-view-container';
    
    // Add to document body
    document.body.appendChild(container);
    
    return container;
  }

  updatePageMetadata() {
    if (!this.currentTemplate) return;
    
    // Update page title
    document.title = `${this.currentTemplate.title} - EC0249 Platform`;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = `${this.currentTemplate.title} - ${this.currentTemplate.description || 'Documento del estándar EC0249'}`;
    
    // Add breadcrumb data
    this.updateBreadcrumbs();
  }

  updateBreadcrumbs() {
    // Emit breadcrumb update event for navigation components
    this.emit('breadcrumbs:update', {
      items: [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Documentos', path: '/portfolio' },
        { label: this.currentTemplate.elementName, path: this.getElementPath() },
        { label: this.currentTemplate.title, path: this.routerService.currentRoute, active: true }
      ]
    });
  }

  getElementPath() {
    if (!this.currentTemplate) return '/portfolio';
    
    const elementMap = {
      'E0875': '/portfolio/element1',
      'E0876': '/portfolio/element2', 
      'E0877': '/portfolio/element3'
    };
    
    return elementMap[this.currentTemplate.element] || '/portfolio';
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.hasError = false;
    this.updateLoadingState();
  }

  setError(message) {
    this.hasError = true;
    this.errorMessage = message;
    this.isLoading = false;
    this.updateLoadingState();
  }

  updateLoadingState() {
    // Emit loading state for UI components
    this.emit('document:loading', {
      isLoading: this.isLoading,
      hasError: this.hasError,
      errorMessage: this.errorMessage
    });
    
    // Update any loading indicators
    if (this.isLoading) {
      this.showLoadingOverlay();
    } else {
      this.hideLoadingOverlay();
    }
    
    if (this.hasError) {
      this.showErrorState();
    }
  }

  showLoadingOverlay() {
    let overlay = document.getElementById('document-loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'document-loading-overlay';
      overlay.className = 'document-loading-overlay';
      overlay.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">Cargando documento...</div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('document-loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  showErrorState() {
    // Create error overlay
    let errorOverlay = document.getElementById('document-error-overlay');
    if (!errorOverlay) {
      errorOverlay = document.createElement('div');
      errorOverlay.id = 'document-error-overlay';
      errorOverlay.className = 'document-error-overlay';
      document.body.appendChild(errorOverlay);
    }
    
    errorOverlay.innerHTML = `
      <div class="error-content">
        <div class="error-icon">❌</div>
        <h3 class="error-title">Error al cargar documento</h3>
        <p class="error-message">${this.errorMessage}</p>
        <div class="error-actions">
          <button class="btn btn-primary" onclick="location.reload()">
            Reintentar
          </button>
          <button class="btn btn-secondary" onclick="history.back()">
            Volver
          </button>
        </div>
      </div>
    `;
    errorOverlay.style.display = 'flex';
  }

  // Event handlers
  async handleDocumentClose(event) {
    console.log('[DocumentViewController] Document close requested');
    
    // Navigate back to portfolio or appropriate view
    const elementPath = this.getElementPath();
    this.routerService.navigate(elementPath);
    
    // Clean up document editor
    await this.cleanupDocumentEditor();
  }

  async handleDocumentSave(event) {
    console.log('[DocumentViewController] Document save event:', event);
    
    // Update progress if needed
    if (this.progressService && this.currentDocument) {
      await this.progressService.updateDocumentProgress(
        this.currentDocument.id, 
        this.currentDocument.completionPercentage || 0
      );
    }
  }

  async handleDocumentExport(event) {
    console.log('[DocumentViewController] Document export event:', event);
    // Export handling is done by the DocumentEditor
  }

  async handleVideoPlay(event) {
    console.log('[DocumentViewController] Video play requested:', event);
    
    // Emit video play event for video components
    this.emit('video:open', {
      videoId: event.videoId,
      context: 'document',
      documentId: this.currentDocument?.id,
      templateId: this.currentTemplate?.id
    });
  }

  async cleanupDocumentEditor() {
    if (this.documentEditor) {
      try {
        await this.documentEditor.destroy();
        this.documentEditor = null;
      } catch (error) {
        console.error('[DocumentViewController] Editor cleanup failed:', error);
      }
    }
    
    // Remove editor container
    const container = document.getElementById('document-view-container');
    if (container) {
      container.remove();
    }
    
    // Remove loading/error overlays
    const loadingOverlay = document.getElementById('document-loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
    
    const errorOverlay = document.getElementById('document-error-overlay');
    if (errorOverlay) {
      errorOverlay.remove();
    }
  }

  // Public API methods
  
  /**
   * Navigate to a specific document
   * @param {string} templateId - Template identifier
   * @param {Object} options - Navigation options
   */
  navigateToDocument(templateId, options = {}) {
    this.routerService.navigateToDocument(templateId, options);
  }

  /**
   * Get current document information
   * @returns {Object|null} Current document info
   */
  getCurrentDocumentInfo() {
    return {
      document: this.currentDocument,
      template: this.currentTemplate,
      routeInfo: this.documentInfo,
      isLoading: this.isLoading,
      hasError: this.hasError
    };
  }

  /**
   * Check if a document is currently loaded
   * @returns {boolean} True if document is loaded
   */
  hasDocumentLoaded() {
    return !!(this.currentDocument && this.currentTemplate && this.documentEditor);
  }

  async onDestroy() {
    console.log('[DocumentViewController] Destroying...');
    
    // Clean up document editor
    await this.cleanupDocumentEditor();
    
    // Clear state
    this.currentDocument = null;
    this.currentTemplate = null;
    this.documentInfo = null;
    
    await super.onDestroy();
  }
}

export default DocumentViewController;