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
        'click .close-btn': 'handleClose'
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
    // Save when the user stops typing
    this.debouncedSave = this.debounce(() => {
      if (this.isDirty) {
        this.saveDocument();
      }
    }, this.autoSaveDelay);

    // Periodic auto-save as backup
    this.autoSaveInterval = setInterval(() => {
      if (this.isDirty) {
        this.saveDocument();
      }
    }, 30000); // Every 30 seconds
  }

  defaultTemplate() {
    if (!this.template || !this.document) {
      return this.renderLoadingState();
    }

    return `
      <div class="document-editor">
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
          <p>Cargando editor de documentos...</p>
        </div>
      </div>
    `;
  }

  renderHeader() {
    const { document, template } = this.data;
    return `
      <header class="editor-header">
        <div class="header-main">
          <div class="document-info">
            <h1 class="document-title">${template.title}</h1>
            <div class="document-metadata">
              <span class="element-badge">${template.element}</span>
              <span class="status-badge status-${document.status}">${this.getStatusLabel(document.status)}</span>
              ${this.isDirty ? '<span class="dirty-indicator">• Sin guardar</span>' : '<span class="saved-indicator">✓ Guardado</span>'}
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary validate-btn" title="Validar documento">
              <span class="btn-icon">✓</span>
              Validar
            </button>
            <button class="btn btn-primary save-btn" title="Guardar documento">
              <span class="btn-icon">💾</span>
              Guardar
            </button>
            <button class="btn btn-secondary export-btn" title="Exportar documento">
              <span class="btn-icon">📄</span>
              Exportar
            </button>
            <button class="btn btn-ghost close-btn" title="Cerrar editor">
              <span class="btn-icon">✕</span>
            </button>
          </div>
        </div>
        ${template.description ? `<p class="document-description">${template.description}</p>` : ''}
        ${template.videoSupport ? this.renderVideoSupport(template.videoSupport) : ''}
      </header>
    `;
  }

  renderVideoSupport(videoSupport) {
    return `
      <div class="video-support">
        <div class="video-info">
          <span class="video-icon">📹</span>
          <span class="video-title">${videoSupport.title}</span>
          <button class="btn btn-sm btn-outline video-btn" data-video-id="${videoSupport.id}">
            Ver Video Explicativo
          </button>
        </div>
      </div>
    `;
  }

  renderProgressBar() {
    const { document } = this.data;
    const progress = document.completionPercentage || 0;
    
    return `
      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-label">Progreso del documento</span>
          <span class="progress-value">${progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
    `;
  }

  renderForm() {
    const { template, document } = this.data;
    
    return `
      <form class="document-form" autocomplete="off">
        ${template.sections.map(section => this.renderSection(section, document.data[section.id])).join('')}
      </form>
    `;
  }

  renderSection(section, data) {
    const sectionId = `section-${section.id}`;
    const isRequired = section.required ? 'required' : '';
    const isComplete = this.isSectionComplete(section, data);
    
    return `
      <div class="form-section ${isRequired}" data-section="${section.id}">
        <div class="section-header">
          <h3 class="section-title">
            ${section.title}
            ${section.required ? '<span class="required-indicator">*</span>' : ''}
            ${isComplete ? '<span class="complete-indicator">✓</span>' : ''}
          </h3>
          ${section.description ? `<p class="section-description">${section.description}</p>` : ''}
        </div>
        <div class="section-content">
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
      case 'matrix':
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
    const maxLength = section.validation?.maxLength || '';
    
    return `
      <div class="field-group">
        <input 
          type="text" 
          class="field-input text-input" 
          data-section="${section.id}"
          value="${this.escapeHtml(value)}"
          placeholder="${section.placeholder || ''}"
          ${maxLength ? `maxlength="${maxLength}"` : ''}
          ${section.required ? 'required' : ''}
        />
        ${this.renderFieldValidation(section, value)}
      </div>
    `;
  }

  renderTextareaField(section, data) {
    const value = data || '';
    const minLength = section.validation?.minLength || 0;
    const maxLength = section.validation?.maxLength || '';
    
    return `
      <div class="field-group">
        <textarea 
          class="field-input textarea-input" 
          data-section="${section.id}"
          placeholder="${section.placeholder || ''}"
          rows="6"
          ${maxLength ? `maxlength="${maxLength}"` : ''}
          ${section.required ? 'required' : ''}
        >${this.escapeHtml(value)}</textarea>
        <div class="field-meta">
          <span class="char-count">${value.length}${maxLength ? `/${maxLength}` : ''} caracteres</span>
          ${minLength ? `<span class="min-length">Mínimo: ${minLength} caracteres</span>` : ''}
        </div>
        ${this.renderFieldValidation(section, value)}
      </div>
    `;
  }

  renderListField(section, data) {
    const items = Array.isArray(data) ? data : [];
    
    return `
      <div class="field-group list-field">
        <div class="list-items">
          ${items.map((item, index) => `
            <div class="list-item" data-index="${index}">
              <input 
                type="text" 
                class="field-input list-item-input" 
                data-section="${section.id}"
                data-index="${index}"
                value="${this.escapeHtml(item)}"
                placeholder="Elemento ${index + 1}"
              />
              <button type="button" class="btn btn-sm btn-danger remove-item-btn" data-index="${index}">
                <span class="btn-icon">🗑️</span>
              </button>
            </div>
          `).join('')}
        </div>
        <button type="button" class="btn btn-sm btn-secondary add-item-btn" data-section="${section.id}">
          <span class="btn-icon">+</span>
          Agregar elemento
        </button>
        ${this.renderFieldValidation(section, items)}
      </div>
    `;
  }

  renderTableField(section, data) {
    const rows = Array.isArray(data) ? data : [];
    const headers = section.headers || ['Columna 1', 'Columna 2', 'Columna 3'];
    
    return `
      <div class="field-group table-field">
        <div class="table-container">
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
                        class="field-input table-cell-input" 
                        data-section="${section.id}"
                        data-row="${rowIndex}"
                        data-column="${header}"
                        value="${this.escapeHtml(row[header] || '')}"
                        placeholder="${header}"
                      />
                    </td>
                  `).join('')}
                  <td class="actions-cell">
                    <button type="button" class="btn btn-sm btn-danger remove-row-btn" data-row="${rowIndex}">
                      <span class="btn-icon">🗑️</span>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <button type="button" class="btn btn-sm btn-secondary add-row-btn" data-section="${section.id}">
          <span class="btn-icon">+</span>
          Agregar fila
        </button>
        ${this.renderFieldValidation(section, rows)}
      </div>
    `;
  }

  renderStructuredField(section, data) {
    if (!section.subsections) return '';
    
    return `
      <div class="structured-field">
        ${section.subsections.map(subsection => {
          const subsectionData = data?.[subsection.id];
          return `
            <div class="subsection" data-subsection="${subsection.id}">
              <h4 class="subsection-title">${subsection.title}</h4>
              ${this.renderSectionFields(subsection, subsectionData)}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderFormFields(section, data) {
    if (!section.fields) return '';
    
    return `
      <div class="form-fields">
        ${section.fields.map(field => {
          const fieldData = data?.[field.name] || '';
          return `
            <div class="form-field">
              <label class="field-label">${field.label}</label>
              <input 
                type="${field.type || 'text'}" 
                class="field-input form-field-input" 
                data-section="${section.id}"
                data-field="${field.name}"
                value="${this.escapeHtml(fieldData)}"
                placeholder="${field.placeholder || ''}"
                ${field.required ? 'required' : ''}
              />
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderFieldValidation(section, value) {
    if (!section.validation) return '';
    
    const validation = section.validation;
    let validationHtml = '<div class="field-validation">';
    
    if (validation.required && (!value || (Array.isArray(value) && value.length === 0))) {
      validationHtml += '<span class="validation-error">Este campo es obligatorio</span>';
    }
    
    if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
      validationHtml += `<span class="validation-warning">Se requieren al menos ${validation.minLength} caracteres</span>`;
    }
    
    if (validation.minItems && Array.isArray(value) && value.length < validation.minItems) {
      validationHtml += `<span class="validation-warning">Se requieren al menos ${validation.minItems} elementos</span>`;
    }
    
    if (validation.minRows && Array.isArray(value) && value.length < validation.minRows) {
      validationHtml += `<span class="validation-warning">Se requieren al menos ${validation.minRows} filas</span>`;
    }
    
    validationHtml += '</div>';
    return validationHtml;
  }

  renderFooter() {
    const { template } = this.data;
    
    return `
      <footer class="editor-footer">
        <div class="footer-info">
          <p class="template-info">
            <strong>Elemento:</strong> ${template.element} - ${template.elementName || ''}
          </p>
          ${template.estimatedTime ? `<p class="time-info">Tiempo estimado: ${template.estimatedTime} minutos</p>` : ''}
        </div>
        <div class="footer-actions">
          <button class="btn btn-secondary cancel-btn close-btn">Cancelar</button>
          <button class="btn btn-primary save-btn">Guardar y Continuar</button>
        </div>
      </footer>
    `;
  }

  renderValidationResults() {
    if (!this.validationResults) return '';
    
    const { validationResults } = this;
    
    return `
      <div class="validation-results ${validationResults.isValid ? 'valid' : 'invalid'}">
        <div class="validation-header">
          <h3>Resultados de Validación</h3>
          <span class="validation-status ${validationResults.isValid ? 'valid' : 'invalid'}">
            ${validationResults.isValid ? '✓ Válido' : '✗ Contiene errores'}
          </span>
        </div>
        
        ${validationResults.errors.length > 0 ? `
          <div class="validation-errors">
            <h4>Errores encontrados:</h4>
            <ul>
              ${validationResults.errors.map(error => `
                <li>
                  <strong>${error.sectionTitle}:</strong>
                  <ul>
                    ${error.errors.map(err => `<li>${err}</li>`).join('')}
                  </ul>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${validationResults.warnings.length > 0 ? `
          <div class="validation-warnings">
            <h4>Advertencias:</h4>
            <ul>
              ${validationResults.warnings.map(warning => `
                <li>
                  <strong>${warning.sectionTitle}:</strong>
                  <ul>
                    ${warning.warnings.map(warn => `<li>${warn}</li>`).join('')}
                  </ul>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div class="validation-summary">
          <p>Progreso: ${validationResults.completionPercentage}% completado</p>
          <p>Secciones validadas: ${validationResults.sectionsValidated}</p>
          ${validationResults.sectionsWithErrors > 0 ? `<p>Secciones con errores: ${validationResults.sectionsWithErrors}</p>` : ''}
        </div>
      </div>
    `;
  }

  // Event handlers
  handleFieldChange(event) {
    const input = event.target;
    const sectionId = input.getAttribute('data-section');
    
    if (!sectionId) return;
    
    this.updateDocumentData(input);
    this.markAsDirty();
    this.debouncedSave();
  }

  updateDocumentData(input) {
    const sectionId = input.getAttribute('data-section');
    const section = this.template.sections.find(s => s.id === sectionId);
    
    if (!section) return;
    
    let value;
    
    switch (section.type) {
      case 'list':
        value = this.updateListData(input);
        break;
      case 'table':
      case 'matrix':
        value = this.updateTableData(input);
        break;
      case 'structured':
        value = this.updateStructuredData(input);
        break;
      case 'form_fields':
        value = this.updateFormFieldsData(input);
        break;
      default:
        value = input.value;
    }
    
    // Update document data
    if (!this.document.data) this.document.data = {};
    this.document.data[sectionId] = value;
    
    // Update completion percentage
    this.updateProgress();
  }

  updateListData(input) {
    const sectionId = input.getAttribute('data-section');
    const index = parseInt(input.getAttribute('data-index'));
    const currentData = this.document.data[sectionId] || [];
    
    currentData[index] = input.value;
    return currentData.filter(item => item.trim() !== ''); // Remove empty items
  }

  updateTableData(input) {
    const sectionId = input.getAttribute('data-section');
    const rowIndex = parseInt(input.getAttribute('data-row'));
    const column = input.getAttribute('data-column');
    const currentData = this.document.data[sectionId] || [];
    
    if (!currentData[rowIndex]) {
      currentData[rowIndex] = {};
    }
    
    currentData[rowIndex][column] = input.value;
    return currentData;
  }

  updateStructuredData(input) {
    const sectionId = input.getAttribute('data-section');
    const subsectionEl = input.closest('[data-subsection]');
    const subsectionId = subsectionEl?.getAttribute('data-subsection');
    
    if (!subsectionId) return this.document.data[sectionId];
    
    const currentData = this.document.data[sectionId] || {};
    currentData[subsectionId] = input.value;
    return currentData;
  }

  updateFormFieldsData(input) {
    const sectionId = input.getAttribute('data-section');
    const fieldName = input.getAttribute('data-field');
    const currentData = this.document.data[sectionId] || {};
    
    currentData[fieldName] = input.value;
    return currentData;
  }

  handleAddRow(event) {
    const button = event.target.closest('.add-row-btn');
    const sectionId = button.getAttribute('data-section');
    const section = this.template.sections.find(s => s.id === sectionId);
    
    if (!section || !section.headers) return;
    
    const currentData = this.document.data[sectionId] || [];
    const newRow = {};
    section.headers.forEach(header => {
      newRow[header] = '';
    });
    
    currentData.push(newRow);
    this.document.data[sectionId] = currentData;
    
    this.markAsDirty();
    this.render();
  }

  handleRemoveRow(event) {
    const button = event.target.closest('.remove-row-btn');
    const rowIndex = parseInt(button.getAttribute('data-row'));
    const table = button.closest('.table-field');
    const sectionId = table.querySelector('.add-row-btn').getAttribute('data-section');
    
    const currentData = this.document.data[sectionId] || [];
    currentData.splice(rowIndex, 1);
    this.document.data[sectionId] = currentData;
    
    this.markAsDirty();
    this.render();
  }

  handleAddItem(event) {
    const button = event.target.closest('.add-item-btn');
    const sectionId = button.getAttribute('data-section');
    
    const currentData = this.document.data[sectionId] || [];
    currentData.push('');
    this.document.data[sectionId] = currentData;
    
    this.markAsDirty();
    this.render();
  }

  handleRemoveItem(event) {
    const button = event.target.closest('.remove-item-btn');
    const index = parseInt(button.getAttribute('data-index'));
    const listField = button.closest('.list-field');
    const sectionId = listField.querySelector('.add-item-btn').getAttribute('data-section');
    
    const currentData = this.document.data[sectionId] || [];
    currentData.splice(index, 1);
    this.document.data[sectionId] = currentData;
    
    this.markAsDirty();
    this.render();
  }

  async handleSave(event) {
    event.preventDefault();
    await this.saveDocument();
  }

  async handleValidate(event) {
    event.preventDefault();
    
    try {
      this.validationResults = this.documentEngine.validateDocument(this.documentId);
      
      // Update display
      this.setData({
        ...this.data,
        validationResults: this.validationResults
      });
      
      if (this.validationResults.isValid) {
        this.showSuccess('Documento validado correctamente');
      } else {
        this.showWarning(`Documento contiene ${this.validationResults.errors.length} errores`);
      }
      
    } catch (error) {
      console.error('[DocumentEditor] Validation failed:', error);
      this.showError('Error al validar el documento');
    }
  }

  async handleExport(event) {
    event.preventDefault();
    
    try {
      // Save before export
      await this.saveDocument();
      
      // Show export options
      this.showExportOptions();
      
    } catch (error) {
      console.error('[DocumentEditor] Export failed:', error);
      this.showError('Error al exportar el documento');
    }
  }

  handleClose(event) {
    event.preventDefault();
    
    if (this.isDirty) {
      if (confirm('Hay cambios sin guardar. ¿Desea guardar antes de cerrar?')) {
        this.saveDocument().then(() => {
          this.closeEditor();
        });
        return;
      }
    }
    
    this.closeEditor();
  }

  // Helper methods
  async saveDocument() {
    try {
      // Update document timestamp
      this.document.updatedAt = Date.now();
      
      // Save using DocumentEngine
      await this.documentEngine.saveDocument(this.documentId, this.document.data);
      
      // Mark as clean
      this.markAsClean();
      
      // Update progress
      this.updateProgress();
      
      this.showSuccess('Documento guardado correctamente');
      
    } catch (error) {
      console.error('[DocumentEditor] Save failed:', error);
      this.showError('Error al guardar el documento');
    }
  }

  updateProgress() {
    if (this.documentEngine) {
      const completionPercentage = this.documentEngine.calculateCompletionPercentage(this.document);
      this.document.completionPercentage = completionPercentage;
      
      // Update progress bar
      const progressFill = this.findElement('.progress-fill');
      const progressValue = this.findElement('.progress-value');
      
      if (progressFill) progressFill.style.width = `${completionPercentage}%`;
      if (progressValue) progressValue.textContent = `${completionPercentage}%`;
    }
  }

  markAsDirty() {
    if (!this.isDirty) {
      this.isDirty = true;
      this.updateDirtyIndicator();
    }
  }

  markAsClean() {
    if (this.isDirty) {
      this.isDirty = false;
      this.updateDirtyIndicator();
    }
  }

  updateDirtyIndicator() {
    const dirtyIndicator = this.findElement('.dirty-indicator');
    const savedIndicator = this.findElement('.saved-indicator');
    
    if (this.isDirty) {
      if (savedIndicator) savedIndicator.style.display = 'none';
      if (dirtyIndicator) dirtyIndicator.style.display = 'inline';
    } else {
      if (dirtyIndicator) dirtyIndicator.style.display = 'none';
      if (savedIndicator) savedIndicator.style.display = 'inline';
    }
  }

  isSectionComplete(section, data) {
    if (!section.required) return true;
    
    return this.documentEngine.isSectionComplete(section, data);
  }

  showExportOptions() {
    // Create export modal
    const exportModal = document.createElement('div');
    exportModal.className = 'export-modal';
    exportModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Exportar Documento</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Seleccione el formato de exportación:</p>
          <div class="export-options">
            <button class="btn btn-primary export-option" data-format="html">
              <span class="btn-icon">🌐</span>
              HTML
            </button>
            <button class="btn btn-primary export-option" data-format="pdf">
              <span class="btn-icon">📄</span>
              PDF
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(exportModal);
    
    // Handle export option selection
    exportModal.addEventListener('click', async (e) => {
      if (e.target.classList.contains('export-option')) {
        const format = e.target.getAttribute('data-format');
        await this.exportDocument(format);
        document.body.removeChild(exportModal);
      } else if (e.target.classList.contains('modal-close')) {
        document.body.removeChild(exportModal);
      }
    });
  }

  async exportDocument(format) {
    try {
      if (format === 'pdf') {
        // Use native browser print-to-PDF for better compatibility
        await this.exportToPDF();
      } else {
        // Use DocumentEngine for other formats
        const exportResult = await this.documentEngine.exportDocument(this.documentId, format);
        
        // Create download link
        const blob = new Blob([exportResult.content], { type: exportResult.mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = exportResult.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
      }
      
      this.showSuccess(`Documento exportado como ${format.toUpperCase()}`);
      
    } catch (error) {
      console.error('[DocumentEditor] Export failed:', error);
      this.showError('Error al exportar el documento');
    }
  }

  async exportToPDF() {
    // Create a print-optimized window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      throw new Error('No se pudo abrir ventana de impresión. Verifique que las ventanas emergentes estén permitidas.');
    }

    try {
      // Get document data for export
      const exportResult = await this.documentEngine.exportDocument(this.documentId, 'html');
      
      // Enhanced PDF-ready styles
      const pdfStyles = `
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          
          @media print {
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.4;
              color: #000;
              background: white;
              margin: 0;
              padding: 0;
            }
            
            .header {
              border-bottom: 2pt solid #333;
              padding-bottom: 10pt;
              margin-bottom: 15pt;
              page-break-inside: avoid;
            }
            
            .header h1 {
              font-size: 18pt;
              font-weight: bold;
              margin: 0 0 5pt 0;
              color: #1a365d;
            }
            
            .section {
              margin-bottom: 15pt;
              page-break-inside: avoid;
            }
            
            .section-title {
              font-size: 14pt;
              font-weight: bold;
              color: #2d3748;
              border-bottom: 1pt solid #ccc;
              padding-bottom: 3pt;
              margin-bottom: 8pt;
            }
            
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 8pt 0;
              font-size: 11pt;
            }
            
            .table th,
            .table td {
              border: 1pt solid #666;
              padding: 6pt;
              text-align: left;
              vertical-align: top;
            }
            
            .table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            
            .list {
              margin: 8pt 0;
              padding-left: 15pt;
            }
            
            .list li {
              margin: 3pt 0;
            }
            
            .metadata {
              font-size: 10pt;
              color: #666;
              margin-bottom: 10pt;
            }
            
            /* Hide screen-only elements */
            .no-print {
              display: none !important;
            }
            
            /* Ensure proper page breaks */
            .page-break {
              page-break-before: always;
            }
            
            /* EC0249 Branding */
            .ec0249-header {
              text-align: center;
              margin-bottom: 20pt;
              padding: 10pt;
              border: 2pt solid #1a365d;
            }
            
            .ec0249-logo {
              font-size: 16pt;
              font-weight: bold;
              color: #1a365d;
            }
            
            .certification-info {
              font-size: 10pt;
              color: #666;
              margin-top: 5pt;
            }
          }
          
          @media screen {
            body {
              padding: 20px;
              max-width: 21cm;
              margin: 0 auto;
            }
          }
        </style>
      `;
      
      // Create complete HTML document
      const printContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${this.document.title} - EC0249</title>
          ${pdfStyles}
        </head>
        <body>
          <div class="ec0249-header">
            <div class="ec0249-logo">EC0249</div>
            <div class="certification-info">Proporcionar servicios de consultoría general</div>
          </div>
          
          ${exportResult.content.match(/<body[^>]*>(.*)<\/body>/s)?.[1] || exportResult.content}
          
          <div class="page-break"></div>
          <div style="text-align: center; font-size: 10pt; color: #666; margin-top: 20pt;">
            <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
            <p>EC0249 - Plataforma Educativa | Documento ID: ${this.documentId}</p>
          </div>
        </body>
        </html>
      `;
      
      // Write content to print window
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          
          // Close window after print dialog
          printWindow.onafterprint = () => {
            printWindow.close();
          };
          
          // Fallback: close after 10 seconds
          setTimeout(() => {
            if (!printWindow.closed) {
              printWindow.close();
            }
          }, 10000);
        }, 500);
      };
      
    } catch (error) {
      printWindow.close();
      throw error;
    }
  }

  closeEditor() {
    this.emit('document-editor:close', {
      documentId: this.documentId,
      saved: !this.isDirty
    });
  }

  getStatusLabel(status) {
    const labels = {
      draft: 'Borrador',
      in_progress: 'En Progreso',
      completed: 'Completado',
      reviewed: 'Revisado'
    };
    return labels[status] || 'Borrador';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  showSuccess(message) {
    console.log(`[DocumentEditor] Success: ${message}`);
    // Emit notification event
    this.emit('notification', { type: 'success', message });
  }

  showError(message) {
    console.error(`[DocumentEditor] Error: ${message}`);
    // Emit notification event
    this.emit('notification', { type: 'error', message });
  }

  showWarning(message) {
    console.warn(`[DocumentEditor] Warning: ${message}`);
    // Emit notification event
    this.emit('notification', { type: 'warning', message });
  }

  async getStyles() {
    return `
      .document-editor {
        max-width: 1200px;
        margin: 0 auto;
        background: var(--bg-secondary, #ffffff);
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .document-editor.loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
      }

      .loading-content {
        text-align: center;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--primary, #3b82f6);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Header */
      .editor-header {
        background: var(--bg-primary, #f8fafc);
        border-bottom: 1px solid var(--border, #e5e7eb);
        padding: 1.5rem 2rem;
      }

      .header-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .document-info h1 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary, #111827);
        font-size: 1.5rem;
        font-weight: 600;
      }

      .document-metadata {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .element-badge, .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .element-badge {
        background: var(--primary, #3b82f6);
        color: white;
      }

      .status-badge {
        background: var(--gray-200, #e5e7eb);
        color: var(--gray-700, #374151);
      }

      .status-badge.status-completed {
        background: var(--green-100, #dcfce7);
        color: var(--green-700, #15803d);
      }

      .status-badge.status-in_progress {
        background: var(--yellow-100, #fef3c7);
        color: var(--yellow-700, #a16207);
      }

      .dirty-indicator {
        color: var(--orange-600, #ea580c);
        font-weight: 500;
      }

      .saved-indicator {
        color: var(--green-600, #16a34a);
        font-weight: 500;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }

      .document-description {
        margin: 0 0 1rem 0;
        color: var(--text-secondary, #6b7280);
      }

      /* Video Support */
      .video-support {
        background: var(--blue-50, #eff6ff);
        border: 1px solid var(--blue-200, #bfdbfe);
        border-radius: 8px;
        padding: 1rem;
      }

      .video-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .video-icon {
        font-size: 1.2rem;
      }

      .video-title {
        flex: 1;
        font-weight: 500;
        color: var(--blue-700, #1d4ed8);
      }

      /* Progress */
      .progress-section {
        background: var(--bg-secondary, #ffffff);
        border-bottom: 1px solid var(--border, #e5e7eb);
        padding: 1rem 2rem;
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .progress-label {
        font-weight: 500;
        color: var(--text-primary, #111827);
      }

      .progress-value {
        font-weight: 600;
        color: var(--primary, #3b82f6);
      }

      .progress-bar {
        height: 8px;
        background: var(--gray-200, #e5e7eb);
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary, #3b82f6), var(--blue-400, #60a5fa));
        transition: width 0.3s ease;
      }

      /* Form */
      .document-form {
        padding: 2rem;
      }

      .form-section {
        margin-bottom: 2.5rem;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 8px;
        overflow: hidden;
      }

      .form-section.required {
        border-left: 4px solid var(--primary, #3b82f6);
      }

      .section-header {
        background: var(--gray-50, #f9fafb);
        padding: 1.5rem;
        border-bottom: 1px solid var(--border, #e5e7eb);
      }

      .section-title {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary, #111827);
        font-size: 1.125rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .required-indicator {
        color: var(--red-500, #ef4444);
      }

      .complete-indicator {
        color: var(--green-500, #10b981);
      }

      .section-description {
        margin: 0;
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
      }

      .section-content {
        padding: 1.5rem;
      }

      /* Field Groups */
      .field-group {
        margin-bottom: 1.5rem;
      }

      .field-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        font-size: 0.875rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .field-input:focus {
        outline: none;
        border-color: var(--primary, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .textarea-input {
        resize: vertical;
        min-height: 120px;
        font-family: inherit;
      }

      .field-meta {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
        font-size: 0.75rem;
        color: var(--text-secondary, #6b7280);
      }

      /* Lists */
      .list-field .list-items {
        margin-bottom: 1rem;
      }

      .list-item {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .list-item-input {
        flex: 1;
      }

      /* Tables */
      .table-container {
        overflow-x: auto;
        margin-bottom: 1rem;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
      }

      .data-table th,
      .data-table td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--border, #e5e7eb);
        text-align: left;
      }

      .data-table th {
        background: var(--gray-50, #f9fafb);
        font-weight: 600;
        color: var(--text-primary, #111827);
      }

      .table-cell-input {
        border: none;
        padding: 0.5rem;
        width: 100%;
      }

      .actions-column {
        width: 80px;
      }

      .actions-cell {
        text-align: center;
      }

      /* Structured Fields */
      .structured-field .subsection {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid var(--gray-200, #e5e7eb);
        border-radius: 6px;
        background: var(--gray-25, #fafafa);
      }

      .subsection-title {
        margin: 0 0 1rem 0;
        color: var(--text-primary, #111827);
        font-size: 1rem;
        font-weight: 600;
      }

      /* Form Fields */
      .form-fields .form-field {
        margin-bottom: 1rem;
      }

      .field-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-primary, #111827);
      }

      /* Validation */
      .field-validation {
        margin-top: 0.5rem;
      }

      .validation-error {
        display: block;
        color: var(--red-600, #dc2626);
        font-size: 0.75rem;
        font-weight: 500;
      }

      .validation-warning {
        display: block;
        color: var(--amber-600, #d97706);
        font-size: 0.75rem;
      }

      .validation-results {
        margin: 2rem;
        padding: 1.5rem;
        border-radius: 8px;
      }

      .validation-results.valid {
        background: var(--green-50, #f0fdf4);
        border: 1px solid var(--green-200, #bbf7d0);
      }

      .validation-results.invalid {
        background: var(--red-50, #fef2f2);
        border: 1px solid var(--red-200, #fecaca);
      }

      .validation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .validation-status.valid {
        color: var(--green-700, #15803d);
        font-weight: 600;
      }

      .validation-status.invalid {
        color: var(--red-700, #b91c1c);
        font-weight: 600;
      }

      /* Footer */
      .editor-footer {
        background: var(--bg-primary, #f8fafc);
        border-top: 1px solid var(--border, #e5e7eb);
        padding: 1.5rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .footer-info {
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
      }

      .footer-actions {
        display: flex;
        gap: 1rem;
      }

      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: 1px solid transparent;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn:hover {
        transform: translateY(-1px);
      }

      .btn:active {
        transform: translateY(0);
      }

      .btn-primary {
        background: var(--primary, #3b82f6);
        color: white;
        border-color: var(--primary, #3b82f6);
      }

      .btn-primary:hover {
        background: var(--blue-600, #2563eb);
        border-color: var(--blue-600, #2563eb);
      }

      .btn-secondary {
        background: var(--gray-100, #f3f4f6);
        color: var(--gray-700, #374151);
        border-color: var(--gray-300, #d1d5db);
      }

      .btn-secondary:hover {
        background: var(--gray-200, #e5e7eb);
      }

      .btn-danger {
        background: var(--red-500, #ef4444);
        color: white;
        border-color: var(--red-500, #ef4444);
      }

      .btn-danger:hover {
        background: var(--red-600, #dc2626);
      }

      .btn-ghost {
        background: transparent;
        color: var(--gray-600, #4b5563);
        border-color: transparent;
      }

      .btn-ghost:hover {
        background: var(--gray-100, #f3f4f6);
      }

      .btn-outline {
        background: transparent;
        color: var(--primary, #3b82f6);
        border-color: var(--primary, #3b82f6);
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
        line-height: 1;
      }

      /* Export Modal */
      .export-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal-content {
        background: var(--bg-secondary, #ffffff);
        border-radius: 12px;
        max-width: 400px;
        width: 100%;
        margin: 1rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 1.5rem 0;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--gray-500, #6b7280);
        line-height: 1;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .export-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1rem;
      }

      .export-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        text-align: center;
      }

      .export-option .btn-icon {
        font-size: 1.5rem;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .document-editor {
          margin: 0;
          border-radius: 0;
        }

        .editor-header {
          padding: 1rem;
        }

        .header-main {
          flex-direction: column;
          gap: 1rem;
        }

        .header-actions {
          width: 100%;
          justify-content: space-between;
        }

        .document-form {
          padding: 1rem;
        }

        .section-content {
          padding: 1rem;
        }

        .editor-footer {
          padding: 1rem;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-actions {
          width: 100%;
          justify-content: space-between;
        }

        .table-container {
          font-size: 0.75rem;
        }

        .export-options {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  async onDestroy() {
    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    // Save if dirty
    if (this.isDirty) {
      await this.saveDocument();
    }
    
    await super.onDestroy();
  }
}

export default DocumentEditor;