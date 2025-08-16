/**
 * Interactive Renderer - Handles interactive elements and content
 * Extracted from ContentEngine for better modularity
 */
import { eventBus } from '../core/EventBus.js';

class InteractiveRenderer {
  constructor() {
    this.interactiveElements = new Map();
  }

  /**
   * Create interactive element
   * @param {Object} section - Section with interactive data
   * @returns {Promise<HTMLElement>} Interactive element
   */
  async createInteractiveElement(section) {
    const container = document.createElement('div');
    container.className = 'interactive-container';
    container.setAttribute('data-interactive-type', section.interactiveType || 'default');

    switch (section.interactiveType) {
      case 'drag-drop':
        return this.createDragDropElement(section);
      
      case 'hotspot':
        return this.createHotspotElement(section);
      
      case 'timeline':
        return this.createTimelineElement(section);
      
      case 'simulation':
        return this.createSimulationElement(section);
      
      default:
        container.innerHTML = '<p>Elemento interactivo en desarrollo</p>';
        return container;
    }
  }

  /**
   * Create quiz element
   * @param {Object} section - Section with quiz data
   * @returns {Promise<HTMLElement>} Quiz element
   */
  async createQuizElement(section) {
    const container = document.createElement('div');
    container.className = 'quiz-container';
    container.setAttribute('data-quiz-id', section.id);

    // This will be expanded in the Knowledge Verification System
    container.innerHTML = `
      <div class="quiz-placeholder">
        <h4>📝 ${section.title || 'Verificación de Conocimiento'}</h4>
        <p>Sistema de evaluación en desarrollo</p>
      </div>
    `;

    return container;
  }

  /**
   * Create case study element
   * @param {Object} section - Section with case study data
   * @returns {Promise<HTMLElement>} Case study element
   */
  async createCaseStudyElement(section) {
    const container = document.createElement('div');
    container.className = 'case-study-container';

    const header = document.createElement('div');
    header.className = 'case-study-header';
    header.innerHTML = `
      <h4 class="case-study-title">📋 ${section.title}</h4>
      <p class="case-study-description">${section.description || ''}</p>
    `;

    const content = document.createElement('div');
    content.className = 'case-study-content';
    content.innerHTML = this.processTextContent(section.content);

    const questions = document.createElement('div');
    questions.className = 'case-study-questions';
    
    if (section.questions && section.questions.length > 0) {
      const questionsTitle = document.createElement('h5');
      questionsTitle.textContent = 'Preguntas de Reflexión:';
      questions.appendChild(questionsTitle);

      const questionsList = document.createElement('ol');
      section.questions.forEach(question => {
        const item = document.createElement('li');
        item.textContent = question;
        questionsList.appendChild(item);
      });
      questions.appendChild(questionsList);
    }

    container.appendChild(header);
    container.appendChild(content);
    container.appendChild(questions);

    return container;
  }

  /**
   * Create drag and drop element
   * @param {Object} section - Section data
   * @returns {HTMLElement} Drag and drop element
   */
  createDragDropElement(section) {
    const container = document.createElement('div');
    container.className = 'drag-drop-container';
    
    container.innerHTML = `
      <div class="drag-drop-placeholder">
        <h4>🎯 ${section.title || 'Actividad de Arrastrar y Soltar'}</h4>
        <p>Elemento interactivo en desarrollo</p>
      </div>
    `;
    
    return container;
  }

  /**
   * Create hotspot element
   * @param {Object} section - Section data
   * @returns {HTMLElement} Hotspot element
   */
  createHotspotElement(section) {
    const container = document.createElement('div');
    container.className = 'hotspot-container';
    
    container.innerHTML = `
      <div class="hotspot-placeholder">
        <h4>📍 ${section.title || 'Puntos de Interés'}</h4>
        <p>Elemento interactivo en desarrollo</p>
      </div>
    `;
    
    return container;
  }

  /**
   * Create timeline element
   * @param {Object} section - Section data
   * @returns {HTMLElement} Timeline element
   */
  createTimelineElement(section) {
    const container = document.createElement('div');
    container.className = 'timeline-container';
    
    container.innerHTML = `
      <div class="timeline-placeholder">
        <h4>📅 ${section.title || 'Línea de Tiempo Interactiva'}</h4>
        <p>Elemento interactivo en desarrollo</p>
      </div>
    `;
    
    return container;
  }

  /**
   * Create simulation element
   * @param {Object} section - Section data
   * @returns {HTMLElement} Simulation element
   */
  createSimulationElement(section) {
    const container = document.createElement('div');
    container.className = 'simulation-container';
    
    container.innerHTML = `
      <div class="simulation-placeholder">
        <h4>🎮 ${section.title || 'Simulación Interactiva'}</h4>
        <p>Elemento interactivo en desarrollo</p>
      </div>
    `;
    
    return container;
  }

  /**
   * Initialize interactive elements in container
   * @param {HTMLElement} container - Container element
   * @param {Object} content - Content data
   */
  async initializeInteractiveElements(container, content) {
    const interactiveElements = container.querySelectorAll('[data-interactive-type]');
    
    interactiveElements.forEach(element => {
      this.setupInteractiveElement(element, content);
    });
  }

  /**
   * Setup interactive element
   * @param {HTMLElement} element - Interactive element
   * @param {Object} content - Content data
   */
  setupInteractiveElement(element, content) {
    const interactiveType = element.getAttribute('data-interactive-type');
    const elementId = `${content.id}_${interactiveType}_${Date.now()}`;
    
    element.setAttribute('data-element-id', elementId);
    
    // Store reference for cleanup
    this.interactiveElements.set(elementId, element);
    
    // Add event listeners based on type
    this.addInteractiveEventListeners(element, interactiveType);
  }

  /**
   * Add event listeners to interactive element
   * @param {HTMLElement} element - Interactive element
   * @param {string} type - Interactive type
   */
  addInteractiveEventListeners(element, type) {
    const listeners = [];
    
    switch (type) {
      case 'drag-drop':
        this.setupDragDropListeners(element, listeners);
        break;
      case 'hotspot':
        this.setupHotspotListeners(element, listeners);
        break;
      case 'timeline':
        this.setupTimelineListeners(element, listeners);
        break;
      case 'simulation':
        this.setupSimulationListeners(element, listeners);
        break;
    }
    
    // Store listeners for cleanup
    element._eventListeners = listeners;
  }

  /**
   * Setup drag and drop listeners
   * @param {HTMLElement} element - Element
   * @param {Array} listeners - Listeners array
   */
  setupDragDropListeners(element, listeners) {
    // Placeholder for drag and drop functionality
    console.log('[InteractiveRenderer] Drag and drop listeners setup');
  }

  /**
   * Setup hotspot listeners
   * @param {HTMLElement} element - Element
   * @param {Array} listeners - Listeners array
   */
  setupHotspotListeners(element, listeners) {
    // Placeholder for hotspot functionality
    console.log('[InteractiveRenderer] Hotspot listeners setup');
  }

  /**
   * Setup timeline listeners
   * @param {HTMLElement} element - Element
   * @param {Array} listeners - Listeners array
   */
  setupTimelineListeners(element, listeners) {
    // Placeholder for timeline functionality
    console.log('[InteractiveRenderer] Timeline listeners setup');
  }

  /**
   * Setup simulation listeners
   * @param {HTMLElement} element - Element
   * @param {Array} listeners - Listeners array
   */
  setupSimulationListeners(element, listeners) {
    // Placeholder for simulation functionality
    console.log('[InteractiveRenderer] Simulation listeners setup');
  }

  /**
   * Process text content for security and formatting
   * @param {string} content - Raw text content
   * @returns {string} Processed content
   */
  processTextContent(content) {
    if (!content) return '';

    // Basic HTML sanitization (in production, use DOMPurify)
    const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 
                        'strong', 'em', 'br', 'div', 'span', 'blockquote', 'code', 'pre'];
    
    return content;
  }

  /**
   * Cleanup interactive element
   * @param {HTMLElement} element - Element to cleanup
   */
  cleanupInteractiveElement(element) {
    // Remove event listeners and cleanup interactive elements
    const listeners = element._eventListeners || [];
    listeners.forEach(({ event, handler }) => {
      element.removeEventListener(event, handler);
    });
    
    const elementId = element.getAttribute('data-element-id');
    if (elementId) {
      this.interactiveElements.delete(elementId);
    }
  }

  /**
   * Cleanup all interactive elements in container
   * @param {HTMLElement} container - Container element
   */
  cleanupInteractiveElements(container) {
    const interactiveElements = container.querySelectorAll('[data-interactive-type]');
    interactiveElements.forEach(element => {
      this.cleanupInteractiveElement(element);
    });
  }

  /**
   * Destroy all interactive elements
   */
  destroy() {
    this.interactiveElements.clear();
  }
}

export default InteractiveRenderer;