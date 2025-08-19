/**
 * Document Editor Component - Interactive fillable document interface
 * Provides form-based editing for EC0249 document templates with real-time saving
 */
import BaseComponent from './BaseComponent.js';

class DocumentEditor extends BaseComponent {
  constructor(element, options = {}) {
    super('DocumentEditor', element, {
      dependencies: ['DocumentEngine', 'StorageService', 'I18nService'],
      events: {
        'input .field-input': 'handleFieldChange',
        'change .field-input': 'handleFieldChange',
        'click .add-row-btn': 'handleAddRow',
        'click .remove-row-btn': 'handleRemoveRow',
        'click .add-item-btn': 'handleAddItem',
        'click .remove-item-btn': 'handleRemoveItem',
        'click .save-btn': 'handleSave',
        'click .export-btn': 'handleExport',
        'click .validate-btn': 'handleValidate',
        'click .close-btn': 'handleClose',
        'click .document-close-btn': 'handleClose',
        'click .watch-video-btn': 'handleVideoPlay'
      },
      autoMount: true,
      reactive: true
    });

    this.documentEngine = null;
    this.storageService = null;
    this.i18nService = null;
    
    // Editor state
    this.templateId = options.templateId || null;
    this.documentId = options.documentId || null;
    this.isNewDocument = options.isNew || false;
    this.document = null;
    this.template = null;
    this.isDirty = false;
    this.autoSaveInterval = null;
    this.validationResults = null;

    // Auto-save configuration
    this.autoSaveDelay = 2000; // 2 seconds after last change
    this.autoSaveTimer = null;
  }

  async onInitialize() {
    console.log('[DocumentEditor] Initializing...');
    
    try {
      // Get required services
      this.documentEngine = this.service('DocumentEngine');
      this.storageService = this.service('StorageService');
      this.i18nService = this.service('I18nService');

      if (!this.documentEngine) {
        throw new Error('DocumentEngine service not available');
      }

      // Load document and template
      await this.loadDocumentData();
      
      // Setup auto-save
      this.setupAutoSave();
      
      console.log('[DocumentEditor] Initialized successfully');
    } catch (error) {
      console.error('[DocumentEditor] Initialization failed:', error);
      this.showError('Error al inicializar el editor de documentos');
    }
  }

  async loadDocumentData() {
    try {
      if (this.isNewDocument && this.templateId) {
        // Create new document from template
        this.template = this.documentEngine.getTemplate(this.templateId);
        if (!this.template) {
          throw new Error(`Template ${this.templateId} not found`);
        }
        
        this.document = this.documentEngine.createDocument(this.templateId);
        this.documentId = this.document.id;
        
        console.log('[DocumentEditor] Created new document:', this.documentId);
      } else if (this.documentId) {
        // Load existing document
        this.document = this.documentEngine.getDocument(this.documentId);
        if (!this.document) {
          throw new Error(`Document ${this.documentId} not found`);
        }
        
        this.template = this.documentEngine.getTemplate(this.document.templateId);
        this.templateId = this.document.templateId;
        
        console.log('[DocumentEditor] Loaded existing document:', this.documentId);
      } else {
        throw new Error('No template or document specified');
      }

      // Set component data
      this.setData({
        document: this.document,
        template: this.template,
        isNewDocument: this.isNewDocument,
        isDirty: this.isDirty,
        validationResults: this.validationResults
      });

    } catch (error) {
      console.error('[DocumentEditor] Failed to load document data:', error);
      throw error;
    }
  }

  setupAutoSave() {
    // Set up auto-save interval
    this.autoSaveInterval = setInterval(() => {
      if (this.isDirty) {
        this.saveDocument();
      }
    }, 30000); // Every 30 seconds
  }

  defaultTemplate() {
    console.log('[DocumentEditor] defaultTemplate called - template:', !!this.template, 'document:', !!this.document);
    
    if (!this.template || !this.document) {
      console.log('[DocumentEditor] Rendering loading state');
      return this.renderLoadingState();
    }

    console.log('[DocumentEditor] Rendering full editor');
    return `
      <div class="document-editor" data-element="${this.template.element}">
        ${this.renderHeader()}
        ${this.renderProgressBar()}
        ${this.renderForm()}
        ${this.renderFooter()}
        ${this.renderValidationResults()}
      </div>
    `;
  }

  renderLoadingState() {
    return `
      <div class="document-editor loading">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">Cargando documento...</div>
        </div>
      </div>
    `;
  }

  renderHeader() {
    const { template } = this;
    
    return `
      <div class="document-editor-header">
        <div class="document-header-content">
          <div class="document-title-section">
            <h2 class="document-title">${template.title}</h2>
            <button class="document-close-btn" data-action="close">
              <span>✕</span>
            </button>
          </div>
          <div class="document-meta">
            <div class="element-badge">${template.elementName}</div>
            <div class="document-time">
              <span>⏱️</span>
              <span>${template.estimatedTime} min</span>
            </div>
            <div class="document-status">
              <span>📝</span>
              <span>${this.isNewDocument ? 'Nuevo documento' : 'Editando documento'}</span>
            </div>
          </div>
        </div>
        ${template.videoSupport ? this.renderVideoSupport(template.videoSupport) : ''}
      </div>
    `;
  }

  renderVideoSupport(videoSupport) {
    return `
      <div class="document-video-section">
        <div class="video-header">
          <div class="video-icon">📹</div>
          <h4 class="video-title">${videoSupport.title}</h4>
        </div>
        <p class="video-description">${videoSupport.description}</p>
        <button class="watch-video-btn" data-video-id="${videoSupport.id}">
          <span>▶️</span>
          <span>Ver video explicativo</span>
        </button>
      </div>
    `;
  }

  renderProgressBar() {
    const completedSections = this.getCompletedSections();
    const totalSections = this.template.sections.length;
    const percentage = Math.round((completedSections / totalSections) * 100);
    
    return `
      <div class="document-progress-section">
        <div class="progress-header">
          <span class="progress-label">Progreso del documento</span>
          <span class="progress-percentage">${percentage}%</span>
        </div>
        <div class="document-progress-bar">
          <div class="document-progress-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }

  getCompletedSections() {
    if (!this.document || !this.template) return 0;
    
    return this.template.sections.filter(section => {
      const sectionData = this.document.data[section.id];
      return sectionData && this.isSectionComplete(section, sectionData);
    }).length;
  }

  isSectionComplete(section, data) {
    if (!data) return false;
    
    switch (section.type) {
      case 'text':
      case 'textarea':
        return data && data.toString().trim().length > 0;
      case 'list':
        return Array.isArray(data) && data.length > 0;
      case 'table':
        return Array.isArray(data) && data.length > 0;
      case 'structured':
        return data && Object.keys(data).length > 0;
      default:
        return !!data;
    }
  }

  renderForm() {
    const { template, document } = this;
    
    return `
      <div class="document-form-content">
        ${template.sections.map(section => this.renderSection(section, document.data[section.id])).join('')}
      </div>
    `;
  }

  renderSection(section, data) {
    const isCompleted = this.isSectionComplete(section, data);
    
    return `
      <div class="document-section" data-section="${section.id}">
        <div class="section-header" data-toggle-section="${section.id}">
          <h3 class="section-title">${section.title}</h3>
          <button class="section-toggle">▼</button>
        </div>
        <div class="section-content" data-section-content="${section.id}">
          ${section.description ? `<p class="section-description">${section.description}</p>` : ''}
          ${this.renderSectionFields(section, data)}
        </div>
      </div>
    `;
  }

  renderSectionFields(section, data) {
    switch (section.type) {
      case 'text':
        return this.renderTextField(section, data);
      case 'textarea':
        return this.renderTextareaField(section, data);
      case 'list':
        return this.renderListField(section, data);
      case 'table':
        return this.renderTableField(section, data);
      case 'structured':
        return this.renderStructuredField(section, data);
      case 'form_fields':
        return this.renderFormFields(section, data);
      default:
        return this.renderTextField(section, data);
    }
  }

  renderTextField(section, data) {
    const value = data || '';
    const fieldId = `field-${section.id}`;
    const maxLength = section.maxLength || 500;
    const isRequired = section.required;
    const validation = this.validateField(section, value);
    
    return `
      <div class="field-group">
        <label class="field-label" for="${fieldId}">
          ${section.title}
          ${isRequired ? '<span class="field-required">*</span>' : ''}
        </label>
        ${section.description ? `<p class="field-description">${section.description}</p>` : ''}
        <input 
          type="text" 
          id="${fieldId}"
          class="field-input${validation.isValid ? '' : ' error'}"
          data-field="${section.id}"
          value="${value}"
          placeholder="${section.placeholder || ''}"
          maxlength="${maxLength}"
          ${isRequired ? 'required' : ''}
        />
        ${this.renderFieldValidation(section, value)}
      </div>
    `;
  }

  renderTextareaField(section, data) {
    const value = data || '';
    const fieldId = `field-${section.id}`;
    const maxLength = section.maxLength || 2000;
    const minRows = section.minRows || 4;
    const isRequired = section.required;
    const validation = this.validateField(section, value);
    
    return `
      <div class="field-group">
        <label class="field-label" for="${fieldId}">
          ${section.title}
          ${isRequired ? '<span class="field-required">*</span>' : ''}
        </label>
        ${section.description ? `<p class="field-description">${section.description}</p>` : ''}
        <textarea 
          id="${fieldId}"
          class="field-input${validation.isValid ? '' : ' error'}"
          data-field="${section.id}"
          placeholder="${section.placeholder || ''}"
          maxlength="${maxLength}"
          rows="${minRows}"
          ${isRequired ? 'required' : ''}
        >${value}</textarea>
        <div class="field-char-count ${value.length > maxLength * 0.8 ? 'warning' : ''}">
          ${value.length}/${maxLength} caracteres
        </div>
        ${this.renderFieldValidation(section, value)}
      </div>
    `;
  }

  renderListField(section, data) {
    const items = Array.isArray(data) ? data : [];
    const fieldId = `field-${section.id}`;
    const isRequired = section.required;
    
    return `
      <div class="field-group">
        <label class="field-label">
          ${section.title}
          ${isRequired ? '<span class="field-required">*</span>' : ''}
        </label>
        ${section.description ? `<p class="field-description">${section.description}</p>` : ''}
        <div class="field-list" data-field="${section.id}">
          <div class="list-header">
            <h4 class="list-title">${section.title}</h4>
            <button type="button" class="add-item-btn" data-action="add-item" data-field="${section.id}">
              <span>+</span>
              <span>Agregar elemento</span>
            </button>
          </div>
          <div class="list-items">
            ${items.map((item, index) => `
              <div class="list-item" data-index="${index}">
                <input 
                  type="text" 
                  class="list-item-input"
                  value="${item}"
                  data-field="${section.id}"
                  data-index="${index}"
                  placeholder="Ingrese elemento..."
                />
                <button type="button" class="remove-item-btn" data-action="remove-item" data-field="${section.id}" data-index="${index}">
                  <span>✕</span>
                </button>
              </div>
            `).join('')}
            ${items.length === 0 ? '<div class="list-empty">No hay elementos agregados</div>' : ''}
          </div>
        </div>
        ${this.renderFieldValidation(section, items)}
      </div>
    `;
  }

  renderTableField(section, data) {
    const rows = Array.isArray(data) ? data : [];
    const headers = section.headers || [];
    const fieldId = `field-${section.id}`;
    const isRequired = section.required;
    
    return `
      <div class="field-group">
        <label class="field-label">
          ${section.title}
          ${isRequired ? '<span class="field-required">*</span>' : ''}
        </label>
        ${section.description ? `<p class="field-description">${section.description}</p>` : ''}
        <div class="field-table" data-field="${section.id}">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  ${headers.map(header => `<th>${header}</th>`).join('')}
                  <th class="actions-column">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${rows.map((row, rowIndex) => `
                  <tr data-row="${rowIndex}">
                    ${headers.map((header, colIndex) => `
                      <td>
                        <input 
                          type="text" 
                          class="table-cell-input"
                          value="${row[colIndex] || ''}"
                          data-field="${section.id}"
                          data-row="${rowIndex}"
                          data-col="${colIndex}"
                          placeholder="${header}"
                        />
                      </td>
                    `).join('')}
                    <td>
                      <button type="button" class="remove-row-btn" data-action="remove-row" data-field="${section.id}" data-row="${rowIndex}">
                        <span>🗑️</span>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <button type="button" class="add-row-btn" data-action="add-row" data-field="${section.id}">
            <span>+</span>
            <span>Agregar fila</span>
          </button>
        </div>
        ${this.renderFieldValidation(section, rows)}
      </div>
    `;
  }

  renderStructuredField(section, data) {
    const structuredData = data || {};
    const subsections = section.subsections || [];
    
    return `
      <div class="field-group">
        <div class="structured-field" data-field="${section.id}">
          <div class="structured-field-header">
            <h4 class="structured-field-title">${section.title}</h4>
          </div>
          ${subsections.map(subsection => {
            const subsectionData = structuredData[subsection.id] || {};
            return `
              <div class="subsection" data-subsection="${subsection.id}">
                <h5 class="subsection-title">${subsection.title}</h5>
                ${this.renderSectionFields(subsection, subsectionData)}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderFormFields(section, data) {
    // This would handle complex form field collections
    // For now, render as structured field
    return this.renderStructuredField(section, data);
  }

  renderFieldValidation(section, value) {
    const validation = this.validateField(section, value);
    
    if (validation.isValid) {
      return '';
    }
    
    return `
      <div class="field-validation error">
        <span class="validation-icon">⚠️</span>
        <span>${validation.message}</span>
      </div>
    `;
  }

  validateField(section, value) {
    // Basic validation logic
    if (section.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return {
        isValid: false,
        message: 'Este campo es obligatorio'
      };
    }
    
    if (section.minLength && typeof value === 'string' && value.length < section.minLength) {
      return {
        isValid: false,
        message: `Mínimo ${section.minLength} caracteres requeridos`
      };
    }
    
    if (section.maxLength && typeof value === 'string' && value.length > section.maxLength) {
      return {
        isValid: false,
        message: `Máximo ${section.maxLength} caracteres permitidos`
      };
    }
    
    return { isValid: true };
  }

  renderFooter() {
    return `
      <div class="document-editor-footer">
        <div class="footer-info">
          <div class="auto-save-status">
            <div class="save-indicator${this.isDirty ? ' saving' : ''}"></div>
            <span>${this.isDirty ? 'Guardando...' : 'Documento guardado'}</span>
          </div>
          <div class="document-stats">
            <span>${this.getCompletedSections()}/${this.template.sections.length} secciones completadas</span>
          </div>
        </div>
        <div class="footer-actions">
          <button type="button" class="doc-action-btn secondary validate-btn" data-action="validate">
            <span>✓</span>
            <span>Validar</span>
          </button>
          <button type="button" class="doc-action-btn primary save-btn" data-action="save">
            <span>💾</span>
            <span>Guardar</span>
          </button>
          <button type="button" class="doc-action-btn success export-btn" data-action="export">
            <span>📄</span>
            <span>Exportar</span>
          </button>
          <button type="button" class="doc-action-btn secondary close-btn" data-action="close">
            <span>✕</span>
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    `;
  }

  renderValidationResults() {
    if (!this.validationResults || this.validationResults.length === 0) {
      return '';
    }
    
    return `
      <div class="validation-results">
        <h4>Resultados de validación</h4>
        ${this.validationResults.map(result => `
          <div class="validation-item ${result.type}">
            <span class="validation-icon">${result.type === 'error' ? '❌' : '⚠️'}</span>
            <span>${result.message}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Event handlers
  async handleFieldChange(event) {
    const target = event.target;
    const fieldId = target.dataset.field;
    const value = target.value;
    
    if (!fieldId) return;
    
    // Update document data
    if (!this.document.data[fieldId]) {
      this.document.data[fieldId] = '';
    }
    
    if (target.dataset.index !== undefined) {
      // Handle list item changes
      const index = parseInt(target.dataset.index);
      if (!Array.isArray(this.document.data[fieldId])) {
        this.document.data[fieldId] = [];
      }
      this.document.data[fieldId][index] = value;
    } else if (target.dataset.row !== undefined && target.dataset.col !== undefined) {
      // Handle table cell changes
      const row = parseInt(target.dataset.row);
      const col = parseInt(target.dataset.col);
      if (!Array.isArray(this.document.data[fieldId])) {
        this.document.data[fieldId] = [];
      }
      if (!Array.isArray(this.document.data[fieldId][row])) {
        this.document.data[fieldId][row] = [];
      }
      this.document.data[fieldId][row][col] = value;
    } else {
      // Handle simple field changes
      this.document.data[fieldId] = value;
    }
    
    // Mark as dirty and schedule auto-save
    this.isDirty = true;
    this.scheduleAutoSave();
    
    console.log('[DocumentEditor] Field changed:', fieldId, value);
  }

  async handleSave(event) {
    event?.preventDefault();
    
    try {
      console.log('[DocumentEditor] Saving document...');
      await this.documentEngine.saveDocument(this.document);
      this.isDirty = false;
      console.log('[DocumentEditor] Document saved successfully');
      this.render(); // Re-render to show updated state
    } catch (error) {
      console.error('[DocumentEditor] Save failed:', error);
    }
  }

  async handleExport(event) {
    event?.preventDefault();
    
    try {
      console.log('[DocumentEditor] Exporting document...');
      await this.documentEngine.exportDocument(this.document, 'pdf');
    } catch (error) {
      console.error('[DocumentEditor] Export failed:', error);
    }
  }

  async handleValidate(event) {
    event?.preventDefault();
    
    try {
      console.log('[DocumentEditor] Validating document...');
      const validation = await this.documentEngine.validateDocument(this.document);
      this.validationResults = validation.results;
      this.render(); // Re-render to show validation results
    } catch (error) {
      console.error('[DocumentEditor] Validation failed:', error);
    }
  }

  handleClose(event) {
    event?.preventDefault();
    
    if (this.isDirty) {
      if (confirm('Hay cambios sin guardar. ¿Desea guardar antes de cerrar?')) {
        this.handleSave();
      }
    }
    
    // Emit close event
    this.emit('document:close', { documentId: this.documentId });
  }

  handleVideoPlay(event) {
    event?.preventDefault();
    
    const videoId = event.target.dataset.videoId;
    if (videoId) {
      this.emit('video:play', { videoId });
    }
  }

  handleAddRow(event) {
    event?.preventDefault();
    
    const button = event.target;
    const fieldId = button.dataset.fieldId;
    
    if (!fieldId) {
      console.error('[DocumentEditor] No field ID found for add row action');
      return;
    }
    
    // Initialize field data if it doesn't exist
    if (!Array.isArray(this.document.data[fieldId])) {
      this.document.data[fieldId] = [];
    }
    
    // Add a new empty row (array)
    this.document.data[fieldId].push([]);
    
    // Mark as dirty and schedule auto-save
    this.isDirty = true;
    this.scheduleAutoSave();
    
    // Re-render to show the new row
    this.render();
    
    console.log('[DocumentEditor] Row added to field:', fieldId);
  }

  handleRemoveRow(event) {
    event?.preventDefault();
    
    const button = event.target;
    const fieldId = button.dataset.fieldId;
    const rowIndex = parseInt(button.dataset.rowIndex);
    
    if (!fieldId) {
      console.error('[DocumentEditor] No field ID found for remove row action');
      return;
    }
    
    if (isNaN(rowIndex)) {
      console.error('[DocumentEditor] No valid row index found for remove row action');
      return;
    }
    
    // Initialize field data if it doesn't exist
    if (!Array.isArray(this.document.data[fieldId])) {
      this.document.data[fieldId] = [];
    }
    
    // Remove the row at the specified index
    if (rowIndex >= 0 && rowIndex < this.document.data[fieldId].length) {
      this.document.data[fieldId].splice(rowIndex, 1);
      
      // Mark as dirty and schedule auto-save
      this.isDirty = true;
      this.scheduleAutoSave();
      
      // Re-render to show the updated table
      this.render();
      
      console.log('[DocumentEditor] Row removed from field:', fieldId, 'at index:', rowIndex);
    } else {
      console.error('[DocumentEditor] Invalid row index for removal:', rowIndex);
    }
  }

  handleAddItem(event) {
    event?.preventDefault();
    
    const button = event.target;
    const fieldId = button.dataset.fieldId;
    
    if (!fieldId) {
      console.error('[DocumentEditor] No field ID found for add item action');
      return;
    }
    
    // Initialize field data if it doesn't exist
    if (!Array.isArray(this.document.data[fieldId])) {
      this.document.data[fieldId] = [];
    }
    
    // Add a new empty item to the list
    this.document.data[fieldId].push('');
    
    // Mark as dirty and schedule auto-save
    this.isDirty = true;
    this.scheduleAutoSave();
    
    // Re-render to show the new item
    this.render();
    
    console.log('[DocumentEditor] Item added to field:', fieldId);
  }

  handleRemoveItem(event) {
    event?.preventDefault();
    
    const button = event.target;
    const fieldId = button.dataset.fieldId;
    const itemIndex = parseInt(button.dataset.itemIndex);
    
    if (!fieldId) {
      console.error('[DocumentEditor] No field ID found for remove item action');
      return;
    }
    
    if (isNaN(itemIndex)) {
      console.error('[DocumentEditor] No valid item index found for remove item action');
      return;
    }
    
    // Initialize field data if it doesn't exist
    if (!Array.isArray(this.document.data[fieldId])) {
      this.document.data[fieldId] = [];
    }
    
    // Remove the item at the specified index
    if (itemIndex >= 0 && itemIndex < this.document.data[fieldId].length) {
      this.document.data[fieldId].splice(itemIndex, 1);
      
      // Mark as dirty and schedule auto-save
      this.isDirty = true;
      this.scheduleAutoSave();
      
      // Re-render to show the updated list
      this.render();
      
      console.log('[DocumentEditor] Item removed from field:', fieldId, 'at index:', itemIndex);
    } else {
      console.error('[DocumentEditor] Invalid item index for removal:', itemIndex);
    }
  }

  scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      if (this.isDirty) {
        this.handleSave();
      }
    }, this.autoSaveDelay);
  }

  showError(message) {
    console.error('[DocumentEditor]', message);
    // Could emit an error event here for notification system
  }

  showSuccess(message) {
    console.log('[DocumentEditor]', message);
    // Could emit a success event here for notification system
  }

  async onDestroy() {
    // Clear auto-save interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    // Save if dirty
    if (this.isDirty) {
      await this.handleSave();
    }
    
    await super.onDestroy();
  }
}

export default DocumentEditor;