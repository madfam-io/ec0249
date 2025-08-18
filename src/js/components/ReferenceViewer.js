/**
 * Reference Viewer Component - Display and manage reference documents
 * Handles viewing of non-fillable reference materials including the EC0249 academic manual
 */
import BaseComponent from './BaseComponent.js';

class ReferenceViewer extends BaseComponent {
  constructor(element, options = {}) {
    super('ReferenceViewer', element, {
      dependencies: ['I18nService'],
      events: {
        'click .reference-item': 'handleReferenceClick',
        'click .download-btn': 'handleDownload',
        'click .close-viewer': 'handleClose'
      },
      autoMount: true,
      reactive: true
    });

    this.i18nService = null;
    this.currentDocument = null;
    this.referenceDocuments = [
      {
        id: 'manual-academico',
        title: 'Manual Académico EC0249',
        description: 'Manual académico completo para la competencia EC0249 - Proporcionar servicios de consultoría general',
        type: 'manual',
        format: 'tex',
        filePath: '/manual-academico-ec0249.tex',
        pdfPath: '/reference/raw/1M - MANUAL DEL PARTICIPANTE EC0249  C&D.pdf',
        category: 'academic',
        icon: '📚',
        downloadable: true,
        viewable: true,
        sections: [
          'Introducción al estándar EC0249',
          'Fundamentos teóricos de consultoría',
          'Elemento 1: Identificación de problemas',
          'Elemento 2: Desarrollo de soluciones',
          'Elemento 3: Presentación de propuestas',
          'Evaluación y certificación'
        ]
      },
      {
        id: 'ficha-estandar',
        title: 'Ficha del Estándar EC0249',
        description: 'Documento oficial del estándar de competencia EC0249',
        type: 'standard',
        format: 'pdf',
        filePath: '/reference/raw/1M - Ficha Estándar EC0249.pdf',
        category: 'official',
        icon: '📋',
        downloadable: true,
        viewable: true
      },
      {
        id: 'formatos-evaluacion',
        title: 'Formatos de Evaluación',
        description: 'Formatos sugeridos para productos de evaluación del EC0249',
        type: 'templates',
        format: 'docx',
        filePath: '/reference/raw/1M - FORMATO SUGERIDO  PRODUCTOS PARA EVALUACIÓN DEL EC0249.docx',
        category: 'evaluation',
        icon: '📝',
        downloadable: true,
        viewable: false
      },
      {
        id: 'formatos-elementos',
        title: 'Formatos por Elementos',
        description: 'Formatos sugeridos para productos de los elementos 1, 2 y 3',
        type: 'templates',
        format: 'xlsx',
        filePath: '/reference/raw/1M - FORMATOS SUGERIDOS PRODUCTOS ELEMENTOS 1, 2 Y 3 EC0249.xlsx',
        category: 'evaluation',
        icon: '📊',
        downloadable: true,
        viewable: false
      },
      {
        id: 'resumen-teorico',
        title: 'Resumen Contenido Teórico',
        description: 'Resumen del contenido teórico del estándar EC0249',
        type: 'summary',
        format: 'pdf',
        filePath: '/reference/raw/1M - RESUMEN CONTENIDO TEÓRICO EC0249.pdf',
        category: 'theory',
        icon: '📖',
        downloadable: true,
        viewable: true
      }
    ];
  }

  async onInitialize() {
    console.log('[ReferenceViewer] Initializing...');
    
    try {
      this.i18nService = this.service('I18nService');
      
      // Set initial data
      this.setData({
        referenceDocuments: this.referenceDocuments,
        currentDocument: this.currentDocument,
        categories: this.getCategories()
      });
      
      console.log('[ReferenceViewer] Initialized with', this.referenceDocuments.length, 'reference documents');
    } catch (error) {
      console.error('[ReferenceViewer] Initialization failed:', error);
    }
  }

  getCategories() {
    const categories = [...new Set(this.referenceDocuments.map(doc => doc.category))];
    return categories.map(cat => ({
      id: cat,
      name: this.getCategoryName(cat),
      documents: this.referenceDocuments.filter(doc => doc.category === cat)
    }));
  }

  getCategoryName(category) {
    const names = {
      academic: 'Material Académico',
      official: 'Documentos Oficiales',
      evaluation: 'Formatos de Evaluación',
      theory: 'Contenido Teórico'
    };
    return names[category] || category;
  }

  defaultTemplate() {
    const { referenceDocuments, currentDocument, categories } = this.data;

    if (currentDocument) {
      return this.renderDocumentViewer(currentDocument);
    }

    return `
      <div class="reference-viewer">
        ${this.renderHeader()}
        ${this.renderDocumentGrid(categories)}
      </div>
    `;
  }

  renderHeader() {
    return `
      <header class="reference-header">
        <div class="header-content">
          <h1 class="reference-title">
            <span class="title-icon">📚</span>
            Materiales de Referencia EC0249
          </h1>
          <p class="reference-description">
            Accede a manuales, documentos oficiales y materiales de apoyo para el estándar EC0249
          </p>
        </div>
      </header>
    `;
  }

  renderDocumentGrid(categories) {
    return `
      <div class="reference-content">
        ${categories.map(category => `
          <section class="reference-category">
            <h2 class="category-title">${category.name}</h2>
            <div class="documents-grid">
              ${category.documents.map(doc => this.renderDocumentCard(doc)).join('')}
            </div>
          </section>
        `).join('')}
      </div>
    `;
  }

  renderDocumentCard(document) {
    return `
      <div class="reference-item document-card" data-document-id="${document.id}">
        <div class="card-header">
          <span class="document-icon">${document.icon}</span>
          <div class="document-type">${document.format.toUpperCase()}</div>
        </div>
        <div class="card-content">
          <h3 class="document-title">${document.title}</h3>
          <p class="document-description">${document.description}</p>
          ${document.sections ? `
            <div class="document-sections">
              <p class="sections-label">Contenido:</p>
              <ul class="sections-list">
                ${document.sections.slice(0, 3).map(section => `<li>${section}</li>`).join('')}
                ${document.sections.length > 3 ? `<li>y ${document.sections.length - 3} más...</li>` : ''}
              </ul>
            </div>
          ` : ''}
        </div>
        <div class="card-actions">
          ${document.viewable ? `
            <button class="btn btn-primary view-btn" data-action="view">
              <span class="btn-icon">👁️</span>
              Ver
            </button>
          ` : ''}
          ${document.downloadable ? `
            <button class="btn btn-secondary download-btn" data-document-id="${document.id}">
              <span class="btn-icon">⬇️</span>
              Descargar
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderDocumentViewer(document) {
    return `
      <div class="document-viewer">
        <header class="viewer-header">
          <div class="viewer-title">
            <span class="document-icon">${document.icon}</span>
            <h1>${document.title}</h1>
          </div>
          <div class="viewer-actions">
            <button class="btn btn-secondary download-btn" data-document-id="${document.id}">
              <span class="btn-icon">⬇️</span>
              Descargar
            </button>
            <button class="btn btn-ghost close-viewer">
              <span class="btn-icon">✕</span>
              Cerrar
            </button>
          </div>
        </header>
        
        <div class="viewer-content">
          ${this.renderDocumentContent(document)}
        </div>
      </div>
    `;
  }

  renderDocumentContent(document) {
    switch (document.format) {
      case 'pdf':
        return this.renderPDFViewer(document);
      case 'tex':
        return this.renderTeXViewer(document);
      default:
        return this.renderGenericViewer(document);
    }
  }

  renderPDFViewer(document) {
    return `
      <div class="pdf-viewer">
        <div class="pdf-container">
          <iframe 
            src="${document.pdfPath || document.filePath}" 
            width="100%" 
            height="800px"
            style="border: none; border-radius: 8px;"
            title="${document.title}">
            <p>Su navegador no soporta la visualización de PDFs. 
               <a href="${document.pdfPath || document.filePath}" target="_blank">Haga clic aquí para descargar el documento</a>
            </p>
          </iframe>
        </div>
      </div>
    `;
  }

  renderTeXViewer(document) {
    return `
      <div class="tex-viewer">
        <div class="tex-info">
          <h3>Manual Académico EC0249</h3>
          <p>Este es el código fuente LaTeX del manual académico completo.</p>
          
          <div class="tex-actions">
            <button class="btn btn-primary" onclick="this.showTeXSource('${document.id}')">
              <span class="btn-icon">📄</span>
              Ver Código Fuente
            </button>
            ${document.pdfPath ? `
              <button class="btn btn-secondary" onclick="this.viewPDF('${document.pdfPath}')">
                <span class="btn-icon">📖</span>
                Ver PDF Compilado
              </button>
            ` : ''}
          </div>
          
          <div class="manual-sections">
            <h4>Contenido del Manual:</h4>
            <ul class="sections-list">
              ${document.sections.map(section => `<li>${section}</li>`).join('')}
            </ul>
          </div>
          
          <div class="usage-info">
            <h4>Uso del Manual:</h4>
            <ul>
              <li>📖 <strong>Consulta</strong>: Material de referencia para conceptos teóricos</li>
              <li>🎯 <strong>Preparación</strong>: Guía para la certificación EC0249</li>
              <li>📚 <strong>Estudio</strong>: Contenido académico estructurado por elementos</li>
              <li>✅ <strong>Evaluación</strong>: Criterios y rubros de evaluación</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  renderGenericViewer(document) {
    return `
      <div class="generic-viewer">
        <div class="viewer-message">
          <h3>Documento: ${document.title}</h3>
          <p>${document.description}</p>
          <p>Este tipo de archivo (${document.format.toUpperCase()}) se puede descargar para su visualización externa.</p>
          
          <div class="download-section">
            <button class="btn btn-primary download-btn" data-document-id="${document.id}">
              <span class="btn-icon">⬇️</span>
              Descargar ${document.format.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  handleReferenceClick(event) {
    const card = event.target.closest('.reference-item');
    if (!card) return;

    const documentId = card.getAttribute('data-document-id');
    const document = this.referenceDocuments.find(doc => doc.id === documentId);

    if (document) {
      if (event.target.closest('.view-btn')) {
        this.viewDocument(document);
      } else if (event.target.closest('.download-btn')) {
        this.downloadDocument(document);
      } else if (document.viewable) {
        // Default action is to view if viewable
        this.viewDocument(document);
      }
    }
  }

  viewDocument(document) {
    console.log('[ReferenceViewer] Viewing document:', document.title);
    
    this.currentDocument = document;
    this.setData({
      ...this.data,
      currentDocument: document
    });
  }

  handleDownload(event) {
    const documentId = event.target.closest('[data-document-id]').getAttribute('data-document-id');
    const document = this.referenceDocuments.find(doc => doc.id === documentId);
    
    if (document) {
      this.downloadDocument(document);
    }
  }

  downloadDocument(document) {
    console.log('[ReferenceViewer] Downloading document:', document.title);
    
    try {
      // For now, create a link to download the file
      // In a real implementation, you'd handle the file serving properly
      const link = document.createElement('a');
      
      // Use PDF path if available, otherwise use file path
      const downloadPath = document.pdfPath || document.filePath;
      
      link.href = downloadPath;
      link.download = `${document.title}.${document.format}`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showSuccess(`Descargando: ${document.title}`);
      
    } catch (error) {
      console.error('[ReferenceViewer] Download failed:', error);
      this.showError('Error al descargar el documento');
    }
  }

  handleClose(event) {
    if (event.target.classList.contains('close-viewer')) {
      // Close the entire reference viewer
      this.emit('reference-viewer:close');
    } else {
      // Just close the current document view
      this.currentDocument = null;
      this.setData({
        ...this.data,
        currentDocument: null
      });
    }
  }

  showTeXSource(documentId) {
    const document = this.referenceDocuments.find(doc => doc.id === documentId);
    if (document) {
      // Open the LaTeX source in a new window
      window.open(document.filePath, '_blank');
    }
  }

  viewPDF(pdfPath) {
    // Open the PDF in a new window
    window.open(pdfPath, '_blank');
  }

  showSuccess(message) {
    console.log(`[ReferenceViewer] Success: ${message}`);
    this.emit('notification', { type: 'success', message });
  }

  showError(message) {
    console.error(`[ReferenceViewer] Error: ${message}`);
    this.emit('notification', { type: 'error', message });
  }

  async getStyles() {
    return `
      .reference-viewer {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      /* Header */
      .reference-header {
        text-align: center;
        margin-bottom: 3rem;
        padding: 2rem 0;
        border-bottom: 1px solid var(--border, #e5e7eb);
      }

      .reference-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin: 0 0 1rem 0;
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary, #111827);
      }

      .title-icon {
        font-size: 2.5rem;
      }

      .reference-description {
        font-size: 1.125rem;
        color: var(--text-secondary, #6b7280);
        max-width: 600px;
        margin: 0 auto;
      }

      /* Categories */
      .reference-category {
        margin-bottom: 3rem;
      }

      .category-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary, #111827);
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--primary, #3b82f6);
      }

      /* Document Grid */
      .documents-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
      }

      /* Document Cards */
      .document-card {
        background: var(--bg-secondary, #ffffff);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.2s ease;
        cursor: pointer;
      }

      .document-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border-color: var(--primary, #3b82f6);
      }

      .card-header {
        padding: 1.5rem 1.5rem 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .document-icon {
        font-size: 2rem;
      }

      .document-type {
        background: var(--primary, #3b82f6);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .card-content {
        padding: 1rem 1.5rem;
      }

      .document-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary, #111827);
      }

      .document-description {
        margin: 0 0 1rem 0;
        color: var(--text-secondary, #6b7280);
        line-height: 1.5;
      }

      .document-sections {
        margin-top: 1rem;
      }

      .sections-label {
        font-weight: 600;
        color: var(--text-primary, #111827);
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
      }

      .sections-list {
        margin: 0;
        padding-left: 1rem;
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
      }

      .sections-list li {
        margin: 0.25rem 0;
      }

      .card-actions {
        padding: 1rem 1.5rem 1.5rem;
        display: flex;
        gap: 0.75rem;
      }

      /* Document Viewer */
      .document-viewer {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-primary, #f8fafc);
        z-index: 1000;
        display: flex;
        flex-direction: column;
      }

      .viewer-header {
        background: var(--bg-secondary, #ffffff);
        border-bottom: 1px solid var(--border, #e5e7eb);
        padding: 1.5rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .viewer-title {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .viewer-title h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary, #111827);
      }

      .viewer-actions {
        display: flex;
        gap: 1rem;
      }

      .viewer-content {
        flex: 1;
        overflow: auto;
        padding: 2rem;
      }

      /* PDF Viewer */
      .pdf-viewer {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .pdf-container {
        flex: 1;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      /* TeX Viewer */
      .tex-viewer {
        max-width: 800px;
        margin: 0 auto;
      }

      .tex-info {
        background: var(--bg-secondary, #ffffff);
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .tex-info h3 {
        margin: 0 0 1rem 0;
        color: var(--text-primary, #111827);
        font-size: 1.5rem;
      }

      .tex-actions {
        margin: 1.5rem 0;
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .manual-sections,
      .usage-info {
        margin: 2rem 0;
      }

      .manual-sections h4,
      .usage-info h4 {
        margin: 0 0 1rem 0;
        color: var(--text-primary, #111827);
        font-size: 1.125rem;
        font-weight: 600;
      }

      .usage-info ul {
        list-style: none;
        padding: 0;
      }

      .usage-info li {
        margin: 0.75rem 0;
        padding: 0.5rem;
        background: var(--bg-primary, #f8fafc);
        border-radius: 6px;
      }

      /* Generic Viewer */
      .generic-viewer {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      .viewer-message {
        text-align: center;
        max-width: 500px;
        padding: 2rem;
        background: var(--bg-secondary, #ffffff);
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .download-section {
        margin-top: 2rem;
      }

      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
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

      .btn-ghost {
        background: transparent;
        color: var(--gray-600, #4b5563);
        border-color: transparent;
      }

      .btn-ghost:hover {
        background: var(--gray-100, #f3f4f6);
      }

      .btn-icon {
        font-size: 1rem;
        line-height: 1;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .reference-viewer {
          padding: 1rem;
        }

        .documents-grid {
          grid-template-columns: 1fr;
        }

        .viewer-header {
          padding: 1rem;
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .viewer-actions {
          justify-content: space-between;
        }

        .viewer-content {
          padding: 1rem;
        }

        .tex-actions {
          flex-direction: column;
        }

        .card-actions {
          flex-direction: column;
        }
      }
    `;
  }
}

export default ReferenceViewer;