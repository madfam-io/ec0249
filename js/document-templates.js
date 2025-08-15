// EC0249 Document Template System
class DocumentTemplateSystem {
  constructor(app) {
    this.app = app;
    this.i18n = app.i18n; // Reference to the i18n manager
    this.templates = this.initializeTemplates();
    this.currentDocument = null;
    this.userDocuments = {};
  }

  getLocalizedTemplate(templateId) {
    // Get localized template data using i18n
    if (!this.i18n) return null;
    
    const templateKey = `templates.${templateId}`;
    const title = this.i18n.t(`${templateKey}.title`);
    const description = this.i18n.t(`${templateKey}.description`);
    const criteria = this.i18n.t(`${templateKey}.criteria`);
    
    return {
      title,
      description, 
      criteria: Array.isArray(criteria) ? criteria : []
    };
  }

  getLocalizedSection(templateId, sectionId) {
    // Get localized section data
    if (!this.i18n) return null;
    
    const sectionKey = `templates.${templateId}.sections.${sectionId}`;
    return {
      title: this.i18n.t(`${sectionKey}.title`),
      placeholder: this.i18n.t(`${sectionKey}.placeholder`),
      guidance: this.i18n.t(`${sectionKey}.guidance`)
    };
  }

  initializeTemplates() {
    return {
      // Element 1 Templates (8 documents)
      elemento1_documento_problema: {
        id: 'elemento1_documento_problema',
        element: 1,
        template: {
          sections: [
            {
              id: 'resumen_ejecutivo',
              required: true,
              type: 'textarea'
            },
            {
              id: 'descripcion_problema',
              required: true,
              type: 'textarea'
            },
            {
              id: 'alcance',
              required: true,
              type: 'textarea'
            },
            {
              id: 'impacto',
              required: true,
              type: 'textarea'
            },
            {
              id: 'stakeholders',
              required: true,
              type: 'textarea'
            }
          ]
        }
      },
      
      // Additional templates can be added here following the same pattern
      // elemento1_documento_metodos: { ... },
      // elemento1_documento_requerimientos: { ... },
      // etc.
      
      // Additional templates will be implemented progressively
      elemento1_afectacion_detectada: {
        id: 'elemento1_afectacion_detectada',
        element: 1,
        template: {
          sections: [
            { id: 'afectacion_detectada', required: true, type: 'textarea' },
            { id: 'impacto_organizacional', required: true, type: 'textarea' },
            { id: 'area_afectada', required: true, type: 'textarea' }
          ]
        }
      },

      elemento2_reporte_afectaciones: {
        id: 'elemento2_reporte_afectaciones',
        element: 2,
        template: {
          sections: [
            { id: 'resumen_afectaciones', required: true, type: 'textarea' },
            { id: 'analisis_impacto', required: true, type: 'textarea' },
            { id: 'recomendaciones', required: true, type: 'textarea' }
          ]
        }
      },

      elemento3_propuesta_trabajo: {
        id: 'elemento3_propuesta_trabajo',
        element: 3,
        template: {
          sections: [
            { id: 'resumen_ejecutivo', required: true, type: 'textarea' },
            { id: 'objetivos', required: true, type: 'textarea' },
            { id: 'metodologia', required: true, type: 'textarea' },
            { id: 'cronograma', required: true, type: 'textarea' },
            { id: 'presupuesto', required: true, type: 'textarea' }
          ]
        }
      }

    };
  }

  getTemplate(templateId) {
    const baseTemplate = this.templates[templateId];
    if (!baseTemplate) return null;

    // Get localized metadata
    const localized = this.getLocalizedTemplate(templateId);
    
    // Create the complete template with localized content
    return {
      ...baseTemplate,
      title: localized?.title || templateId,
      description: localized?.description || '',
      criteria: localized?.criteria || [],
      template: {
        ...baseTemplate.template,
        sections: baseTemplate.template.sections.map(section => {
          const localizedSection = this.getLocalizedSection(templateId, section.id);
          return {
            ...section,
            title: localizedSection?.title || section.id,
            placeholder: localizedSection?.placeholder || '',
            guidance: localizedSection?.guidance || ''
          };
        })
      }
    };
  }

  openTemplate(templateId) {
    const template = this.getTemplate(templateId);
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return;
    }

    this.currentDocument = {
      templateId: templateId,
      data: {},
      lastModified: new Date()
    };

    this.renderTemplateEditor(template);
  }

  renderTemplateEditor(template) {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
      <div class="document-editor">
        <div class="editor-header">
          <button class="btn btn-secondary" onclick="history.back()">← Volver</button>
          <h1>📝 ${template.title}</h1>
          <div class="editor-actions">
            <button class="btn btn-secondary" onclick="ec0249App.documentSystem.saveDocument()">💾 Guardar</button>
            <button class="btn btn-secondary" onclick="ec0249App.documentSystem.previewDocument()">👁️ Vista Previa</button>
            <button class="btn btn-primary" onclick="ec0249App.documentSystem.exportDocument()">📄 Exportar PDF</button>
          </div>
        </div>

        <div class="editor-sidebar">
          <div class="template-info">
            <h3>Información del Documento</h3>
            <p><strong>Elemento:</strong> ${template.element}</p>
            <p><strong>Descripción:</strong> ${template.description}</p>
            
            <h4>Criterios de Evaluación:</h4>
            <ul class="criteria-list">
              ${template.criteria.map(criterion => `<li>${criterion}</li>`).join('')}
            </ul>
          </div>
          
          <div class="template-progress">
            <h4>Progreso del Documento</h4>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%" id="documentProgress"></div>
            </div>
            <p><span id="progressText">0%</span> completado</p>
          </div>
        </div>

        <div class="editor-content">
          <form id="documentForm" class="document-form">
            ${this.renderTemplateSections(template.template.sections)}
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="ec0249App.documentSystem.saveDraft()">
                Guardar Borrador
              </button>
              <button type="button" class="btn btn-success" onclick="ec0249App.documentSystem.finalizeDocument()">
                Finalizar Documento
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.setupFormHandlers();
  }

  renderTemplateSections(sections) {
    return sections.map(section => {
      switch(section.type) {
        case 'textarea':
          return this.renderTextareaSection(section);
        case 'complex':
          return this.renderComplexSection(section);
        case 'repeatable':
          return this.renderRepeatableSection(section);
        default:
          return this.renderTextSection(section);
      }
    }).join('');
  }

  renderTextareaSection(section) {
    return `
      <div class="form-section" data-section="${section.id}">
        <label class="section-label ${section.required ? 'required' : ''}">
          ${section.title}
          ${section.required ? '<span class="required-mark">*</span>' : ''}
        </label>
        ${section.guidance ? `<p class="guidance">${section.guidance}</p>` : ''}
        <textarea 
          id="${section.id}" 
          name="${section.id}"
          placeholder="${section.placeholder || ''}"
          ${section.required ? 'required' : ''}
          rows="6"
          class="form-textarea"
        ></textarea>
        <div class="character-count">
          <span class="count">0</span> caracteres
        </div>
      </div>
    `;
  }

  renderComplexSection(section) {
    return `
      <div class="form-section complex-section" data-section="${section.id}">
        <h3 class="section-title ${section.required ? 'required' : ''}">
          ${section.title}
          ${section.required ? '<span class="required-mark">*</span>' : ''}
        </h3>
        ${section.guidance ? `<p class="guidance">${section.guidance}</p>` : ''}
        <div class="complex-fields">
          ${section.fields.map(field => this.renderField(field, section.id)).join('')}
        </div>
      </div>
    `;
  }

  renderRepeatableSection(section) {
    return `
      <div class="form-section repeatable-section" data-section="${section.id}">
        <div class="section-header">
          <h3 class="section-title ${section.required ? 'required' : ''}">
            ${section.title}
            ${section.required ? '<span class="required-mark">*</span>' : ''}
          </h3>
          <button type="button" class="btn btn-sm btn-primary" onclick="ec0249App.documentSystem.addRepeatableItem('${section.id}')">
            + Agregar Elemento
          </button>
        </div>
        ${section.guidance ? `<p class="guidance">${section.guidance}</p>` : ''}
        <div class="repeatable-items" id="${section.id}_items">
          <!-- Repeatable items will be added here -->
        </div>
      </div>
    `;
  }

  renderField(field, parentId) {
    const fieldId = `${parentId}_${field.name}`;
    
    switch(field.type) {
      case 'textarea':
        return `
          <div class="field-group">
            <label for="${fieldId}" class="${field.required ? 'required' : ''}">${field.title}</label>
            <textarea id="${fieldId}" name="${fieldId}" ${field.required ? 'required' : ''} rows="4"></textarea>
          </div>
        `;
      case 'select':
        return `
          <div class="field-group">
            <label for="${fieldId}" class="${field.required ? 'required' : ''}">${field.title}</label>
            <select id="${fieldId}" name="${fieldId}" ${field.required ? 'required' : ''}>
              <option value="">Seleccionar...</option>
              ${field.options.map(option => `<option value="${option}">${option}</option>`).join('')}
            </select>
          </div>
        `;
      default:
        return `
          <div class="field-group">
            <label for="${fieldId}" class="${field.required ? 'required' : ''}">${field.title}</label>
            <input type="text" id="${fieldId}" name="${fieldId}" ${field.required ? 'required' : ''} />
          </div>
        `;
    }
  }

  setupFormHandlers() {
    // Auto-save functionality
    const form = document.getElementById('documentForm');
    if (form) {
      form.addEventListener('input', this.debounce(() => {
        this.updateProgress();
        this.autoSave();
      }, 1000));
    }

    // Character counting for textareas
    document.querySelectorAll('.form-textarea').forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        const counter = e.target.parentNode.querySelector('.character-count .count');
        if (counter) {
          counter.textContent = e.target.value.length;
        }
      });
    });
  }

  addRepeatableItem(sectionId) {
    const template = this.templates[this.currentDocument.templateId];
    const section = template.template.sections.find(s => s.id === sectionId);
    if (!section) return;

    const container = document.getElementById(`${sectionId}_items`);
    const itemIndex = container.children.length;
    
    const itemHtml = `
      <div class="repeatable-item" data-index="${itemIndex}">
        <div class="item-header">
          <h4>Elemento ${itemIndex + 1}</h4>
          <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.repeatable-item').remove()">
            Eliminar
          </button>
        </div>
        <div class="item-fields">
          ${section.fields.map(field => this.renderField({
            ...field,
            name: `${field.name}_${itemIndex}`
          }, sectionId)).join('')}
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHtml);
  }

  updateProgress() {
    const form = document.getElementById('documentForm');
    if (!form) return;

    const requiredFields = form.querySelectorAll('[required]');
    const completedFields = Array.from(requiredFields).filter(field => {
      return field.value.trim() !== '';
    });

    const progress = Math.round((completedFields.length / requiredFields.length) * 100);
    
    const progressBar = document.getElementById('documentProgress');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${progress}%`;
  }

  autoSave() {
    if (this.currentDocument) {
      const formData = new FormData(document.getElementById('documentForm'));
      const data = {};
      
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      this.currentDocument.data = data;
      this.currentDocument.lastModified = new Date();
      
      // Save to localStorage
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    const documentsKey = `ec0249_documents_${this.app.userId || 'anonymous'}`;
    let savedDocuments = JSON.parse(localStorage.getItem(documentsKey) || '{}');
    
    if (this.currentDocument) {
      savedDocuments[this.currentDocument.templateId] = this.currentDocument;
      localStorage.setItem(documentsKey, JSON.stringify(savedDocuments));
    }
  }

  saveDocument() {
    this.autoSave();
    this.app.showNotification('Documento guardado exitosamente', 'success');
  }

  previewDocument() {
    // Generate preview of the document
    console.log('Generating document preview...');
  }

  exportDocument() {
    // Export document as PDF
    console.log('Exporting document as PDF...');
    this.app.showNotification('Funcionalidad de exportación en desarrollo', 'info');
  }

  finalizeDocument() {
    const progress = this.calculateProgress();
    if (progress < 100) {
      this.app.showNotification('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    this.autoSave();
    this.currentDocument.status = 'completed';
    this.currentDocument.completedDate = new Date();
    this.saveToLocalStorage();
    
    this.app.showNotification('Documento finalizado exitosamente', 'success');
  }

  calculateProgress() {
    const form = document.getElementById('documentForm');
    if (!form) return 0;

    const requiredFields = form.querySelectorAll('[required]');
    const completedFields = Array.from(requiredFields).filter(field => {
      return field.value.trim() !== '';
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.ec0249App) {
    window.ec0249App.documentSystem = new DocumentTemplateSystem(window.ec0249App);
  }
});