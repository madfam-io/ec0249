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

    // Sample quiz questions about consulting ethics
    const questions = section.questions || [
      {
        id: 'q1',
        question: '¿Cuál es el principio más importante en la ética de consultoría?',
        options: [
          'Maximizar ganancias',
          'Confidencialidad y honestidad',
          'Completar proyectos rápidamente',
          'Impresionar al cliente'
        ],
        correct: 1,
        explanation: 'La confidencialidad y honestidad son fundamentales para mantener la confianza del cliente.'
      },
      {
        id: 'q2', 
        question: '¿Qué debe hacer un consultor si identifica un conflicto de intereses?',
        options: [
          'Ignorarlo si es menor',
          'Informar al cliente inmediatamente',
          'Resolverlo secretamente',
          'Continuar sin mencionar nada'
        ],
        correct: 1,
        explanation: 'Los conflictos de interés deben ser comunicados transparentemente al cliente.'
      }
    ];

    let currentQuestion = 0;
    let userAnswers = [];
    let score = 0;

    container.innerHTML = `
      <div class="quiz-activity">
        <div class="quiz-header">
          <h4>📝 ${section.title || 'Quiz de Verificación'}</h4>
          <div class="quiz-progress">
            <span class="question-counter">Pregunta <span class="current">1</span> de <span class="total">${questions.length}</span></span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(1/questions.length) * 100}%"></div>
            </div>
          </div>
        </div>
        
        <div class="quiz-content">
          <div class="question-container">
            <h5 class="question-text">${questions[0].question}</h5>
            <div class="options-container">
              ${questions[0].options.map((option, index) => `
                <label class="option-label" data-option="${index}">
                  <input type="radio" name="quiz-option" value="${index}">
                  <span class="option-text">${option}</span>
                  <span class="option-indicator"></span>
                </label>
              `).join('')}
            </div>
          </div>
          
          <div class="quiz-controls">
            <button class="btn btn-secondary prev-question" disabled>Anterior</button>
            <button class="btn btn-primary next-question" disabled>Siguiente</button>
            <button class="btn btn-success submit-quiz" style="display: none;">Enviar Respuestas</button>
          </div>
        </div>
        
        <div class="quiz-results" style="display: none;">
          <div class="results-summary">
            <h5>Resultados del Quiz</h5>
            <div class="score-display">
              <span class="score-number">0</span>/<span class="total-questions">${questions.length}</span>
            </div>
            <p class="score-message"></p>
          </div>
          <div class="detailed-results"></div>
          <button class="btn btn-primary retry-quiz">Intentar de Nuevo</button>
        </div>
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
    
    // Create a simple sorting activity for consulting phases
    const phases = section.items || [
      { id: 'identification', text: 'Identificación del problema', order: 1 },
      { id: 'analysis', text: 'Análisis de situación', order: 2 },
      { id: 'solution', text: 'Desarrollo de soluciones', order: 3 },
      { id: 'presentation', text: 'Presentación de propuesta', order: 4 }
    ];
    
    // Shuffle the items for the activity
    const shuffledPhases = [...phases].sort(() => Math.random() - 0.5);
    
    container.innerHTML = `
      <div class="drag-drop-activity">
        <h4>🎯 ${section.title || 'Ordena las Fases de Consultoría'}</h4>
        <p class="activity-instruction">Arrastra los elementos para ordenar las fases del proceso de consultoría correctamente:</p>
        
        <div class="drag-drop-area">
          <div class="draggable-items">
            ${shuffledPhases.map(phase => `
              <div class="draggable-item" draggable="true" data-id="${phase.id}" data-order="${phase.order}">
                <span class="drag-handle">⋮⋮</span>
                <span class="item-text">${phase.text}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="drop-zone">
            <p class="drop-hint">Suelta los elementos aquí en el orden correcto</p>
          </div>
        </div>
        
        <div class="activity-controls">
          <button class="btn btn-primary check-answer" disabled>Verificar Orden</button>
          <button class="btn btn-secondary reset-activity">Reiniciar</button>
        </div>
        
        <div class="activity-feedback" style="display: none;"></div>
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
    const draggableItems = element.querySelectorAll('.draggable-item');
    const dropZone = element.querySelector('.drop-zone');
    const checkButton = element.querySelector('.check-answer');
    const resetButton = element.querySelector('.reset-activity');
    const feedback = element.querySelector('.activity-feedback');
    
    let draggedElement = null;
    let droppedItems = [];

    // Drag start
    const handleDragStart = (e) => {
      draggedElement = e.target;
      e.target.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.target.outerHTML);
    };

    // Drag end
    const handleDragEnd = (e) => {
      e.target.style.opacity = '1';
      draggedElement = null;
    };

    // Drop zone events
    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dropZone.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
      dropZone.classList.remove('drag-over');
    };

    const handleDrop = (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      
      if (draggedElement) {
        // Clone the element and add to drop zone
        const clonedElement = draggedElement.cloneNode(true);
        clonedElement.draggable = false;
        clonedElement.classList.add('dropped-item');
        
        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item';
        removeBtn.innerHTML = '✕';
        removeBtn.onclick = () => {
          clonedElement.remove();
          updateCheckButton();
          updateDropHint();
        };
        clonedElement.appendChild(removeBtn);
        
        dropZone.appendChild(clonedElement);
        droppedItems.push(clonedElement);
        
        // Hide original item
        draggedElement.style.display = 'none';
        
        updateCheckButton();
        updateDropHint();
      }
    };

    // Check answer functionality
    const checkAnswer = () => {
      const droppedItems = Array.from(dropZone.querySelectorAll('.dropped-item'));
      const correctOrder = droppedItems.every((item, index) => {
        return parseInt(item.dataset.order) === index + 1;
      });

      feedback.style.display = 'block';
      
      if (correctOrder && droppedItems.length > 0) {
        feedback.innerHTML = `
          <div class="feedback-success">
            <span class="feedback-icon">✅</span>
            <p><strong>¡Correcto!</strong> Has ordenado las fases del proceso de consultoría correctamente.</p>
          </div>
        `;
        eventBus.publish('activity:completed', {
          type: 'drag-drop',
          score: 100,
          correct: true
        });
      } else {
        feedback.innerHTML = `
          <div class="feedback-error">
            <span class="feedback-icon">❌</span>
            <p><strong>Incorrecto.</strong> Revisa el orden de las fases. Recuerda: primero identificar, luego analizar, desarrollar soluciones y finalmente presentar.</p>
          </div>
        `;
      }
    };

    // Reset functionality
    const resetActivity = () => {
      // Clear drop zone
      dropZone.innerHTML = '<p class="drop-hint">Suelta los elementos aquí en el orden correcto</p>';
      
      // Show all draggable items
      draggableItems.forEach(item => {
        item.style.display = 'flex';
      });
      
      // Reset state
      droppedItems = [];
      feedback.style.display = 'none';
      checkButton.disabled = true;
    };

    // Update check button state
    const updateCheckButton = () => {
      const hasDroppedItems = dropZone.querySelectorAll('.dropped-item').length > 0;
      checkButton.disabled = !hasDroppedItems;
    };

    // Update drop hint
    const updateDropHint = () => {
      const dropHint = dropZone.querySelector('.drop-hint');
      const hasDroppedItems = dropZone.querySelectorAll('.dropped-item').length > 0;
      
      if (dropHint) {
        dropHint.style.display = hasDroppedItems ? 'none' : 'block';
      }
    };

    // Bind events
    draggableItems.forEach(item => {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
    });

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    checkButton.addEventListener('click', checkAnswer);
    resetButton.addEventListener('click', resetActivity);

    // Store listeners for cleanup
    listeners.push(
      { element: dropZone, event: 'dragover', handler: handleDragOver },
      { element: dropZone, event: 'dragleave', handler: handleDragLeave },
      { element: dropZone, event: 'drop', handler: handleDrop },
      { element: checkButton, event: 'click', handler: checkAnswer },
      { element: resetButton, event: 'click', handler: resetActivity }
    );

    console.log('[InteractiveRenderer] Drag and drop functionality activated');
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