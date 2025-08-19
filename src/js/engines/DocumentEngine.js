/**
 * Document Engine - Template-based document generation system
 * Handles creation, validation, and management of EC0249 required deliverables
 */
import Module from '../core/Module.js';
import TemplateLoader from '../templates/TemplateLoader.js';

class DocumentEngine extends Module {
  constructor() {
    super('DocumentEngine', ['StateManager', 'I18nService', 'StorageService'], {
      autoSave: true,
      saveInterval: 30000,
      validationMode: 'strict',
      templateVersion: '1.0',
      exportFormats: ['html', 'pdf', 'docx'],
      qualityThresholds: {
        completeness: 85,
        accuracy: 90,
        compliance: 95
      }
    });

    this.templateLoader = new TemplateLoader();
    this.templates = new Map();
    this.documents = new Map();
    this.validationRules = new Map();
    this.userDocuments = new Map();
    this.documentHistory = new Map();
  }

  async onInitialize() {
    this.stateManager = this.service('StateManager');
    this.i18n = this.service('I18nService');
    this.storage = this.service('StorageService');

    // Subscribe to document events
    this.subscribe('document:create', this.handleDocumentCreate.bind(this));
    this.subscribe('document:save', this.handleDocumentSave.bind(this));
    this.subscribe('document:validate', this.handleDocumentValidate.bind(this));
    this.subscribe('document:export', this.handleDocumentExport.bind(this));

    // Load document templates and user documents
    await this.loadTemplateDefinitions();
    await this.loadUserDocuments();

    console.log('[DocumentEngine] Initialized');
  }

  /**
   * Load all 15 EC0249 document templates
   */
  async loadTemplateDefinitions() {
    try {
      // Load templates using the TemplateLoader
      this.templates = await this.templateLoader.loadAllTemplates();
      
      // Validate all templates
      let validTemplates = 0;
      for (const template of this.templates.values()) {
        if (this.templateLoader.validateTemplate(template)) {
          validTemplates++;
        }
      }

      console.log(`[DocumentEngine] Loaded ${this.templates.size} templates (${validTemplates} valid)`);
      
      // Log all template IDs for debugging
      const templateIds = Array.from(this.templates.keys());
      console.log('[DocumentEngine] Available template IDs:', templateIds);
      
      // Log template statistics
      const stats = this.templateLoader.getStatistics();
      console.log('[DocumentEngine] Template statistics:', stats);
      
    } catch (error) {
      console.error('[DocumentEngine] Failed to load template definitions:', error);
      throw error;
    }
  }

  /**
   * Create new document from template
   * @param {string} templateId - Template identifier
   * @param {Object} initialData - Initial document data
   * @returns {Object} Document instance
   */
  createDocument(templateId, initialData = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const documentId = this.generateDocumentId(templateId);
    const document = {
      id: documentId,
      templateId: templateId,
      title: template.title,
      element: template.element,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      completionPercentage: 0,
      data: this.initializeDocumentData(template, initialData),
      metadata: {
        estimatedTime: template.estimatedTime,
        timeSpent: 0,
        lastSection: null,
        validationResults: null,
        videoSupport: template.videoSupport || null
      }
    };

    this.documents.set(documentId, document);
    this.userDocuments.set(documentId, document);

    this.emit('document:created', {
      documentId: documentId,
      templateId: templateId,
      timestamp: Date.now()
    });

    return document;
  }

  /**
   * Initialize document data structure from template
   */
  initializeDocumentData(template, initialData) {
    const data = { ...initialData };
    
    template.sections.forEach(section => {
      if (!data[section.id]) {
        switch (section.type) {
          case 'structured':
            data[section.id] = {};
            section.subsections?.forEach(subsection => {
              data[section.id][subsection.id] = this.getDefaultValue(subsection.type);
            });
            break;
          
          case 'matrix':
          case 'table':
            data[section.id] = [];
            break;
          
          case 'list':
            data[section.id] = [];
            break;
          
          case 'form_fields':
            data[section.id] = {};
            section.fields?.forEach(field => {
              data[section.id][field.name] = '';
            });
            break;
          
          default:
            data[section.id] = '';
        }
      }
    });

    return data;
  }

  /**
   * Get default value for field type
   */
  getDefaultValue(type) {
    switch (type) {
      case 'list':
        return [];
      case 'table':
      case 'matrix':
        return [];
      case 'textarea':
      case 'text':
        return '';
      case 'number':
        return 0;
      case 'date':
        return '';
      case 'boolean':
        return false;
      default:
        return '';
    }
  }

  /**
   * Save document
   * @param {string} documentId - Document identifier
   * @param {Object} data - Document data
   */
  async saveDocument(documentId, data) {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Update document
    document.data = { ...document.data, ...data };
    document.updatedAt = Date.now();
    document.version += 1;

    // Calculate completion percentage
    document.completionPercentage = this.calculateCompletionPercentage(document);

    // Update status based on completion
    if (document.completionPercentage >= 100) {
      document.status = 'completed';
    } else if (document.completionPercentage > 0) {
      document.status = 'in_progress';
    }

    // Save to storage
    await this.saveUserDocuments();

    this.emit('document:saved', {
      documentId: documentId,
      completionPercentage: document.completionPercentage,
      status: document.status,
      timestamp: Date.now()
    });

    return document;
  }

  /**
   * Calculate document completion percentage
   */
  calculateCompletionPercentage(document) {
    const template = this.templates.get(document.templateId);
    if (!template) return 0;

    let totalSections = 0;
    let completedSections = 0;

    template.sections.forEach(section => {
      totalSections++;
      
      if (this.isSectionComplete(section, document.data[section.id])) {
        completedSections++;
      }
    });

    return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  }

  /**
   * Check if section is complete
   */
  isSectionComplete(section, data) {
    if (!section.required) return true;
    if (!data) return false;

    switch (section.type) {
      case 'textarea':
      case 'text':
        return data.length >= (section.validation?.minLength || 10);
      
      case 'list':
        return Array.isArray(data) && data.length >= (section.validation?.minItems || 1);
      
      case 'table':
      case 'matrix':
        return Array.isArray(data) && data.length >= (section.validation?.minRows || 1);
      
      case 'structured':
        if (!section.subsections) return true;
        return section.subsections.every(subsection => {
          const subData = data[subsection.id];
          return this.isSectionComplete(subsection, subData);
        });
      
      case 'form_fields':
        if (!section.fields) return true;
        return section.fields.every(field => {
          return data[field.name] && data[field.name].trim().length > 0;
        });
      
      default:
        return data && data.toString().trim().length > 0;
    }
  }

  /**
   * Validate document
   * @param {string} documentId - Document identifier
   * @returns {Object} Validation results
   */
  validateDocument(documentId) {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    const template = this.templates.get(document.templateId);
    const validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      completionPercentage: document.completionPercentage,
      sectionsValidated: 0,
      sectionsWithErrors: 0
    };

    template.sections.forEach(section => {
      validationResults.sectionsValidated++;
      
      const sectionData = document.data[section.id];
      const sectionValidation = this.validateSection(section, sectionData);
      
      if (!sectionValidation.isValid) {
        validationResults.sectionsWithErrors++;
        validationResults.isValid = false;
        validationResults.errors.push({
          sectionId: section.id,
          sectionTitle: section.title,
          errors: sectionValidation.errors
        });
      }

      if (sectionValidation.warnings.length > 0) {
        validationResults.warnings.push({
          sectionId: section.id,
          sectionTitle: section.title,
          warnings: sectionValidation.warnings
        });
      }
    });

    // Update document metadata
    document.metadata.validationResults = validationResults;

    this.emit('document:validated', {
      documentId: documentId,
      validationResults: validationResults,
      timestamp: Date.now()
    });

    return validationResults;
  }

  /**
   * Validate individual section
   */
  validateSection(section, data) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check required validation
    if (section.required && !data) {
      result.isValid = false;
      result.errors.push('Esta sección es obligatoria');
      return result;
    }

    if (!section.validation) return result;

    // Validate based on section type and validation rules
    switch (section.type) {
      case 'textarea':
      case 'text':
        if (section.validation.minLength && data.length < section.validation.minLength) {
          result.isValid = false;
          result.errors.push(`Mínimo ${section.validation.minLength} caracteres requeridos`);
        }
        if (section.validation.maxLength && data.length > section.validation.maxLength) {
          result.warnings.push(`Se recomienda no exceder ${section.validation.maxLength} caracteres`);
        }
        break;
      
      case 'list':
        if (section.validation.minItems && data.length < section.validation.minItems) {
          result.isValid = false;
          result.errors.push(`Mínimo ${section.validation.minItems} elementos requeridos`);
        }
        break;
      
      case 'table':
      case 'matrix':
        if (section.validation.minRows && data.length < section.validation.minRows) {
          result.isValid = false;
          result.errors.push(`Mínimo ${section.validation.minRows} filas requeridas`);
        }
        break;
    }

    return result;
  }

  /**
   * Export document
   * @param {string} documentId - Document identifier
   * @param {string} format - Export format (html, pdf, docx)
   * @returns {Promise} Export promise
   */
  async exportDocument(documentId, format = 'html') {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    const template = this.templates.get(document.templateId);
    
    switch (format) {
      case 'html':
        return this.exportToHTML(document, template);
      case 'pdf':
        return this.exportToPDF(document, template);
      case 'docx':
        return this.exportToDocx(document, template);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export to PDF
   */
  async exportToPDF(document, template) {
    // First generate HTML content
    const htmlExport = this.exportToHTML(document, template);
    
    try {
      // Generate PDF using browser print functionality (opens print dialog)
      const pdfResult = await this.generatePDFContent(htmlExport.content, document, template);
      
      // Return the PDF result (which opens browser print dialog)
      return pdfResult;
      
    } catch (error) {
      console.error('[DocumentEngine] PDF export failed:', error);
      // Fallback to HTML export
      return {
        ...htmlExport,
        filename: htmlExport.filename.replace('.html', '_pdf_fallback.html'),
        note: 'PDF export failed - exported as HTML instead'
      };
    }
  }

  /**
   * Generate PDF content using browser print API
   */
  async generatePDFContent(htmlContent, document, template) {
    return new Promise((resolve, reject) => {
      // Create a hidden iframe for PDF generation
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 210mm;
        height: 297mm;
      `;
      
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument;
      
      // Enhanced PDF styles
      const pdfStyles = `
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          
          @media print {
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12pt;
              line-height: 1.4;
              color: #000;
              background: white;
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
              border-bottom: 1pt solid #e2e8f0;
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
              border: 1pt solid #a0aec0;
              padding: 6pt;
              text-align: left;
              vertical-align: top;
            }
            
            .table th {
              background-color: #edf2f7;
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
              color: #4a5568;
              margin-bottom: 10pt;
            }
            
            .footer {
              position: fixed;
              bottom: 10mm;
              left: 20mm;
              right: 20mm;
              font-size: 10pt;
              color: #718096;
              text-align: center;
              border-top: 1pt solid #e2e8f0;
              padding-top: 5pt;
            }
            
            .page-break {
              page-break-before: always;
            }
          }
        </style>
      `;
      
      // Enhanced HTML content with metadata
      const enhancedHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${document.title} - EC0249</title>
          ${pdfStyles}
        </head>
        <body>
          ${htmlContent}
          <div class="footer">
            <p>EC0249 - Proporcionar servicios de consultoría general | Generado el ${new Date().toLocaleDateString('es-ES')} | Página <span class="page-number"></span></p>
          </div>
        </body>
        </html>
      `;
      
      iframeDoc.open();
      iframeDoc.write(enhancedHtml);
      iframeDoc.close();
      
      // Wait for content to load
      iframe.onload = () => {
        try {
          // Use browser's print to PDF functionality
          iframe.contentWindow.print();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
          
          // Return PDF-ready HTML content that user can save via browser
          // This triggers the browser's print dialog where user can "Save as PDF"
          resolve({
            content: enhancedHtml,
            filename: `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`,
            mimeType: 'text/html',
            isPrintReady: true,
            note: 'PDF generated via browser print dialog - use "Save as PDF" option'
          });
          
        } catch (error) {
          document.body.removeChild(iframe);
          reject(error);
        }
      };
      
      iframe.onerror = (error) => {
        document.body.removeChild(iframe);
        reject(error);
      };
    });
  }

  /**
   * Export to HTML
   */
  exportToHTML(document, template) {
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${document.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section-title { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f2f2f2; }
          .list { margin: 10px 0; }
          .list li { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${document.title}</h1>
          <p><strong>Elemento:</strong> ${template.element} - ${template.elementName || ''}</p>
          <p><strong>Fecha de creación:</strong> ${new Date(document.createdAt).toLocaleDateString()}</p>
          <p><strong>Última actualización:</strong> ${new Date(document.updatedAt).toLocaleDateString()}</p>
        </div>
        
        ${this.renderDocumentSectionsHTML(template, document)}
      </body>
      </html>
    `;

    return {
      content: html,
      filename: `${document.templateId}_${document.id}.html`,
      mimeType: 'text/html'
    };
  }

  /**
   * Render document sections as HTML
   */
  renderDocumentSectionsHTML(template, document) {
    return template.sections.map(section => {
      const data = document.data[section.id];
      return `
        <div class="section">
          <h2 class="section-title">${section.title}</h2>
          ${this.renderSectionDataHTML(section, data)}
        </div>
      `;
    }).join('');
  }

  /**
   * Render section data as HTML
   */
  renderSectionDataHTML(section, data) {
    switch (section.type) {
      case 'textarea':
      case 'text':
        return `<p>${data || ''}</p>`;
      
      case 'list':
        if (!Array.isArray(data) || data.length === 0) return '<p>No hay elementos</p>';
        return `<ul class="list">${data.map(item => `<li>${item}</li>`).join('')}</ul>`;
      
      case 'table':
      case 'matrix':
        if (!Array.isArray(data) || data.length === 0) return '<p>No hay datos</p>';
        const headers = section.headers || Object.keys(data[0] || {});
        return `
          <table class="table">
            <thead>
              <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.map(row => `<tr>${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        `;
      
      case 'structured':
        if (!section.subsections) return '<p>No hay datos</p>';
        return section.subsections.map(subsection => `
          <h3>${subsection.title}</h3>
          ${this.renderSectionDataHTML(subsection, data[subsection.id])}
        `).join('');
      
      default:
        return `<p>${data || ''}</p>`;
    }
  }

  /**
   * Export to DOCX format
   * Note: This is a placeholder implementation that exports to HTML format
   * A full DOCX implementation would require a library like docx.js
   */
  async exportToDocx(document, template) {
    try {
      console.log('[DocumentEngine] DOCX export requested - using HTML fallback');
      
      // For now, export as HTML with DOCX-friendly formatting
      const htmlExport = this.exportToHTML(document, template);
      
      // Modify the export to be more DOCX-compatible
      const docxCompatibleHTML = this.convertHTMLForDOCX(htmlExport.content);
      
      return {
        content: docxCompatibleHTML,
        filename: `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.html`,
        mimeType: 'text/html',
        note: 'Exported as HTML format - DOCX export requires additional library'
      };
      
    } catch (error) {
      console.error('[DocumentEngine] DOCX export failed:', error);
      throw new Error(`DOCX export failed: ${error.message}`);
    }
  }

  /**
   * Convert HTML to be more DOCX-compatible
   */
  convertHTMLForDOCX(htmlContent) {
    // Add DOCX-compatible styling and structure
    return htmlContent
      .replace(/<div class="document-container">/g, '<div style="width: 21cm; margin: 0 auto; padding: 2cm; font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6;">')
      .replace(/<h1>/g, '<h1 style="font-size: 18pt; font-weight: bold; margin-bottom: 1em;">')
      .replace(/<h2>/g, '<h2 style="font-size: 16pt; font-weight: bold; margin: 1.5em 0 1em 0;">')
      .replace(/<h3>/g, '<h3 style="font-size: 14pt; font-weight: bold; margin: 1em 0 0.5em 0;">')
      .replace(/<p>/g, '<p style="margin-bottom: 1em;">')
      .replace(/<ul>/g, '<ul style="margin: 1em 0; padding-left: 2em;">')
      .replace(/<ol>/g, '<ol style="margin: 1em 0; padding-left: 2em;">')
      .replace(/<table>/g, '<table style="border-collapse: collapse; width: 100%; margin: 1em 0;">')
      .replace(/<th>/g, '<th style="border: 1px solid #333; padding: 8px; background-color: #f5f5f5; font-weight: bold;">')
      .replace(/<td>/g, '<td style="border: 1px solid #333; padding: 8px;">');
  }

  /**
   * Utility methods
   */
  generateDocumentId(templateId) {
    return `${templateId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getTemplate(templateId) {
    return this.templates.get(templateId);
  }

  getDocument(documentId) {
    return this.documents.get(documentId);
  }

  getUserDocuments() {
    return Array.from(this.userDocuments.values());
  }

  getDocumentsByElement(elementId) {
    return this.getUserDocuments().filter(doc => {
      const template = this.templates.get(doc.templateId);
      return template && template.element === elementId;
    });
  }

  getDocumentsByStatus(status) {
    return this.getUserDocuments().filter(doc => doc.status === status);
  }

  getAvailableTemplates() {
    return Array.from(this.templates.values());
  }

  getElementTemplates(elementId) {
    return Array.from(this.templates.values()).filter(template => template.element === elementId);
  }

  /**
   * Event handlers
   */
  handleDocumentCreate(data) {
    console.log('[DocumentEngine] Document created:', data);
  }

  handleDocumentSave(data) {
    console.log('[DocumentEngine] Document saved:', data);
  }

  handleDocumentValidate(data) {
    console.log('[DocumentEngine] Document validated:', data);
  }

  handleDocumentExport(data) {
    console.log('[DocumentEngine] Document exported:', data);
  }

  /**
   * Storage methods
   */
  async loadUserDocuments() {
    try {
      const savedDocuments = await this.storage.get('user_documents');
      if (savedDocuments) {
        savedDocuments.forEach(doc => {
          this.documents.set(doc.id, doc);
          this.userDocuments.set(doc.id, doc);
        });
      }
    } catch (error) {
      console.warn('[DocumentEngine] Failed to load user documents:', error);
    }
  }

  async saveUserDocuments() {
    try {
      const documents = Array.from(this.userDocuments.values());
      await this.storage.set('user_documents', documents);
      
      // Emit event for UI updates
      this.emit('documents:saved', {
        count: documents.length,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.warn('[DocumentEngine] Failed to save user documents:', error);
      throw error;
    }
  }

  async onDestroy() {
    this.templates.clear();
    this.documents.clear();
    this.userDocuments.clear();
    this.documentHistory.clear();
  }
}

export default DocumentEngine;