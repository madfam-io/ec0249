/**
 * Interactive Renderer Component - Dynamic Learning Activities
 * 
 * @description Renders interactive learning elements including drag-and-drop activities,
 * matching exercises, sorting tasks, and other engaging learning experiences.
 * Optimized for both desktop and mobile interfaces with touch support.
 * 
 * Features:
 * - Drag and drop activities with touch support
 * - Matching exercises and sorting tasks
 * - Real-time feedback and validation
 * - Mobile-first responsive design
 * - Accessibility compliance
 * - Progress tracking integration
 * 
 * @class InteractiveRenderer
 * @since 2.0.0
 */

class InteractiveRenderer {
  constructor(container, eventBus) {
    this.container = container;
    this.eventBus = eventBus;
    this.currentActivity = null;
    this.activityData = null;
    this.userResponses = new Map();
    this.isCompleted = false;
    this.isTouchDevice = 'ontouchstart' in window;
    
    this.init();
  }

  /**
   * Initialize interactive renderer
   */
  init() {
    this.createInteractiveContainer();
    this.bindEvents();
    
    console.log('[InteractiveRenderer] Initialized');
  }

  /**
   * Create interactive activity container
   */
  createInteractiveContainer() {
    this.element = document.createElement('div');
    this.element.className = 'interactive-activity-container';
    this.element.innerHTML = `
      <div class="activity-header">
        <div class="activity-title-section">
          <h3 class="activity-title"></h3>
          <p class="activity-description"></p>
        </div>
        <div class="activity-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span class="progress-text">0%</span>
        </div>
      </div>
      
      <div class="activity-content">
        <!-- Dynamic content will be inserted here -->
      </div>
      
      <div class="activity-controls">
        <button class="btn btn-secondary reset-activity" disabled>
          <span class="btn-icon">🔄</span>
          <span class="btn-text">Reiniciar</span>
        </button>
        <button class="btn btn-primary check-answers" disabled>
          <span class="btn-icon">✓</span>
          <span class="btn-text">Verificar</span>
        </button>
        <button class="btn btn-success continue-activity" disabled style="display: none;">
          <span class="btn-icon">→</span>
          <span class="btn-text">Continuar</span>
        </button>
      </div>
      
      <div class="activity-feedback" style="display: none;">
        <div class="feedback-content">
          <div class="feedback-icon"></div>
          <div class="feedback-text">
            <h4 class="feedback-title"></h4>
            <p class="feedback-message"></p>
          </div>
        </div>
      </div>
    `;

    if (this.container) {
      this.container.appendChild(this.element);
    }

    // Store references to key elements
    this.titleElement = this.element.querySelector('.activity-title');
    this.descriptionElement = this.element.querySelector('.activity-description');
    this.contentElement = this.element.querySelector('.activity-content');
    this.progressBar = this.element.querySelector('.progress-fill');
    this.progressText = this.element.querySelector('.progress-text');
    this.resetButton = this.element.querySelector('.reset-activity');
    this.checkButton = this.element.querySelector('.check-answers');
    this.continueButton = this.element.querySelector('.continue-activity');
    this.feedbackElement = this.element.querySelector('.activity-feedback');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Control buttons
    this.resetButton.addEventListener('click', () => this.resetActivity());
    this.checkButton.addEventListener('click', () => this.checkAnswers());
    this.continueButton.addEventListener('click', () => this.continueToNext());
  }

  /**
   * Load and render an interactive activity
   */
  loadActivity(activityConfig) {
    if (!activityConfig || !activityConfig.type) {
      console.error('[InteractiveRenderer] Invalid activity configuration');
      return;
    }

    this.currentActivity = activityConfig.type;
    this.activityData = activityConfig;
    this.userResponses.clear();
    this.isCompleted = false;

    // Update header
    this.titleElement.textContent = activityConfig.title || 'Actividad Interactiva';
    this.descriptionElement.textContent = activityConfig.description || '';

    // Reset UI state
    this.updateProgress(0);
    this.resetButton.disabled = true;
    this.checkButton.disabled = true;
    this.hideFeedback();
    this.continueButton.style.display = 'none';

    // Render activity based on type
    switch (activityConfig.type) {
      case 'drag_drop':
        this.renderDragDropActivity(activityConfig);
        break;
      case 'matching':
        this.renderMatchingActivity(activityConfig);
        break;
      case 'sorting':
        this.renderSortingActivity(activityConfig);
        break;
      case 'categorization':
        this.renderCategorizationActivity(activityConfig);
        break;
      default:
        console.warn('[InteractiveRenderer] Unknown activity type:', activityConfig.type);
        this.renderGenericActivity(activityConfig);
    }

    // Emit activity loaded event
    this.eventBus?.publish('interactive:loaded', {
      type: this.currentActivity,
      title: activityConfig.title
    });
  }

  /**
   * Render drag and drop activity
   */
  renderDragDropActivity(config) {
    const { items, dropZones, instructions } = config;

    this.contentElement.innerHTML = `
      <div class="drag-drop-activity">
        <div class="activity-instructions">
          <p>${instructions || 'Arrastra los elementos a las zonas correspondientes'}</p>
        </div>
        
        <div class="drag-drop-layout">
          <div class="draggable-items">
            <h4>Elementos</h4>
            <div class="items-container">
              ${items.map((item, index) => `
                <div class="draggable-item" 
                     data-item-id="${item.id}" 
                     data-index="${index}"
                     draggable="true"
                     tabindex="0"
                     role="button"
                     aria-label="Arrastrar elemento: ${item.text}">
                  <div class="item-content">
                    ${item.icon ? `<span class="item-icon">${item.icon}</span>` : ''}
                    <span class="item-text">${item.text}</span>
                  </div>
                  <div class="drag-handle" aria-hidden="true">⋮⋮</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="drop-zones">
            <h4>Zonas de Destino</h4>
            <div class="zones-container">
              ${dropZones.map((zone, index) => `
                <div class="drop-zone" 
                     data-zone-id="${zone.id}"
                     data-index="${index}"
                     role="region"
                     aria-label="Zona de destino: ${zone.label}">
                  <div class="zone-header">
                    <span class="zone-label">${zone.label}</span>
                    <span class="zone-count">0/${zone.maxItems || '∞'}</span>
                  </div>
                  <div class="zone-content">
                    <div class="zone-placeholder">
                      ${zone.placeholder || 'Suelta elementos aquí'}
                    </div>
                    <div class="dropped-items"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupDragDropInteractions();
  }

  /**
   * Render matching activity
   */
  renderMatchingActivity(config) {
    const { leftItems, rightItems, instructions } = config;

    this.contentElement.innerHTML = `
      <div class="matching-activity">
        <div class="activity-instructions">
          <p>${instructions || 'Conecta los elementos relacionados'}</p>
        </div>
        
        <div class="matching-layout">
          <div class="matching-column left-column">
            <h4>Conceptos</h4>
            ${leftItems.map((item, index) => `
              <div class="matching-item left-item" 
                   data-item-id="${item.id}"
                   data-index="${index}"
                   tabindex="0"
                   role="button"
                   aria-label="Concepto: ${item.text}">
                <div class="item-content">
                  ${item.icon ? `<span class="item-icon">${item.icon}</span>` : ''}
                  <span class="item-text">${item.text}</span>
                </div>
                <div class="connection-point right" data-side="left"></div>
              </div>
            `).join('')}
          </div>
          
          <div class="matching-connections">
            <svg class="connections-svg">
              <!-- Connection lines will be drawn here -->
            </svg>
          </div>
          
          <div class="matching-column right-column">
            <h4>Definiciones</h4>
            ${rightItems.map((item, index) => `
              <div class="matching-item right-item" 
                   data-item-id="${item.id}"
                   data-index="${index}"
                   tabindex="0"
                   role="button"
                   aria-label="Definición: ${item.text}">
                <div class="connection-point left" data-side="right"></div>
                <div class="item-content">
                  ${item.icon ? `<span class="item-icon">${item.icon}</span>` : ''}
                  <span class="item-text">${item.text}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.setupMatchingInteractions();
  }

  /**
   * Render sorting activity
   */
  renderSortingActivity(config) {
    const { items, targetOrder, instructions } = config;
    
    // Shuffle items for initial presentation
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    this.contentElement.innerHTML = `
      <div class="sorting-activity">
        <div class="activity-instructions">
          <p>${instructions || 'Ordena los elementos en la secuencia correcta'}</p>
        </div>
        
        <div class="sorting-container">
          <div class="sortable-list">
            ${shuffledItems.map((item, index) => `
              <div class="sortable-item" 
                   data-item-id="${item.id}"
                   data-original-order="${item.order}"
                   data-current-index="${index}"
                   draggable="true"
                   tabindex="0"
                   role="listitem"
                   aria-label="Elemento ${index + 1}: ${item.text}">
                <div class="sort-handle" aria-hidden="true">⋮⋮</div>
                <div class="item-content">
                  <span class="item-number">${index + 1}</span>
                  ${item.icon ? `<span class="item-icon">${item.icon}</span>` : ''}
                  <span class="item-text">${item.text}</span>
                </div>
                <div class="move-controls">
                  <button class="move-up" aria-label="Mover arriba" tabindex="-1">↑</button>
                  <button class="move-down" aria-label="Mover abajo" tabindex="-1">↓</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.setupSortingInteractions();
  }

  /**
   * Render categorization activity
   */
  renderCategorizationActivity(config) {
    const { items, categories, instructions } = config;

    this.contentElement.innerHTML = `
      <div class="categorization-activity">
        <div class="activity-instructions">
          <p>${instructions || 'Clasifica los elementos en las categorías correctas'}</p>
        </div>
        
        <div class="categorization-layout">
          <div class="uncategorized-items">
            <h4>Elementos para Clasificar</h4>
            <div class="items-pool">
              ${items.map((item, index) => `
                <div class="categorizable-item" 
                     data-item-id="${item.id}"
                     data-category="${item.category}"
                     data-index="${index}"
                     draggable="true"
                     tabindex="0"
                     role="button"
                     aria-label="Elemento: ${item.text}">
                  <div class="item-content">
                    ${item.icon ? `<span class="item-icon">${item.icon}</span>` : ''}
                    <span class="item-text">${item.text}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="category-containers">
            ${categories.map((category, index) => `
              <div class="category-container" 
                   data-category-id="${category.id}"
                   data-index="${index}">
                <div class="category-header">
                  <h4 class="category-title">
                    ${category.icon ? `<span class="category-icon">${category.icon}</span>` : ''}
                    ${category.name}
                  </h4>
                  <span class="category-count">0 elementos</span>
                </div>
                <div class="category-content">
                  <div class="category-placeholder">
                    ${category.description || 'Arrastra elementos aquí'}
                  </div>
                  <div class="categorized-items"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.setupCategorizationInteractions();
  }

  /**
   * Setup drag and drop interactions
   */
  setupDragDropInteractions() {
    const draggableItems = this.contentElement.querySelectorAll('.draggable-item');
    const dropZones = this.contentElement.querySelectorAll('.drop-zone');

    // Setup draggable items
    draggableItems.forEach(item => {
      // Mouse/touch drag events
      item.addEventListener('dragstart', this.handleDragStart.bind(this));
      item.addEventListener('dragend', this.handleDragEnd.bind(this));
      
      // Touch events for mobile
      if (this.isTouchDevice) {
        item.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        item.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        item.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
      }
      
      // Keyboard navigation
      item.addEventListener('keydown', this.handleItemKeydown.bind(this));
    });

    // Setup drop zones
    dropZones.forEach(zone => {
      zone.addEventListener('dragover', this.handleDragOver.bind(this));
      zone.addEventListener('drop', this.handleDrop.bind(this));
      zone.addEventListener('dragenter', this.handleDragEnter.bind(this));
      zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    });

    this.enableActivityControls();
  }

  /**
   * Setup matching interactions
   */
  setupMatchingInteractions() {
    const leftItems = this.contentElement.querySelectorAll('.left-item');
    const rightItems = this.contentElement.querySelectorAll('.right-item');
    const svg = this.contentElement.querySelector('.connections-svg');
    
    this.connections = new Map();
    this.selectedItem = null;

    // Setup connection interactions
    [...leftItems, ...rightItems].forEach(item => {
      item.addEventListener('click', this.handleMatchingClick.bind(this));
      item.addEventListener('keydown', this.handleMatchingKeydown.bind(this));
    });

    // Setup SVG for drawing connections
    this.setupConnectionSVG(svg);
    this.enableActivityControls();
  }

  /**
   * Setup sorting interactions
   */
  setupSortingInteractions() {
    const sortableItems = this.contentElement.querySelectorAll('.sortable-item');
    const container = this.contentElement.querySelector('.sortable-list');

    // Setup sortable functionality
    sortableItems.forEach(item => {
      item.addEventListener('dragstart', this.handleSortDragStart.bind(this));
      item.addEventListener('dragend', this.handleSortDragEnd.bind(this));
      item.addEventListener('keydown', this.handleSortKeydown.bind(this));
      
      // Move button controls
      const moveUp = item.querySelector('.move-up');
      const moveDown = item.querySelector('.move-down');
      
      moveUp?.addEventListener('click', () => this.moveSortItem(item, -1));
      moveDown?.addEventListener('click', () => this.moveSortItem(item, 1));
    });

    container.addEventListener('dragover', this.handleSortDragOver.bind(this));
    container.addEventListener('drop', this.handleSortDrop.bind(this));

    this.enableActivityControls();
  }

  /**
   * Setup categorization interactions
   */
  setupCategorizationInteractions() {
    const items = this.contentElement.querySelectorAll('.categorizable-item');
    const categories = this.contentElement.querySelectorAll('.category-container');

    // Setup draggable items
    items.forEach(item => {
      item.addEventListener('dragstart', this.handleCategoryDragStart.bind(this));
      item.addEventListener('dragend', this.handleCategoryDragEnd.bind(this));
      item.addEventListener('keydown', this.handleCategoryKeydown.bind(this));
    });

    // Setup category drop zones
    categories.forEach(category => {
      category.addEventListener('dragover', this.handleCategoryDragOver.bind(this));
      category.addEventListener('drop', this.handleCategoryDrop.bind(this));
      category.addEventListener('dragenter', this.handleCategoryDragEnter.bind(this));
      category.addEventListener('dragleave', this.handleCategoryDragLeave.bind(this));
    });

    this.enableActivityControls();
  }

  /**
   * Handle drag start
   */
  handleDragStart(e) {
    this.draggedElement = e.target.closest('.draggable-item, .sortable-item, .categorizable-item');
    this.draggedElement.classList.add('dragging');
    
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.draggedElement.outerHTML);
    }
  }

  /**
   * Handle drag end
   */
  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
      this.draggedElement = null;
    }
    
    // Remove drag over states
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  }

  /**
   * Handle drag over
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  /**
   * Handle drag enter
   */
  handleDragEnter(e) {
    e.preventDefault();
    const dropZone = e.currentTarget;
    dropZone.classList.add('drag-over');
  }

  /**
   * Handle drag leave
   */
  handleDragLeave(e) {
    const dropZone = e.currentTarget;
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('drag-over');
    }
  }

  /**
   * Handle drop
   */
  handleDrop(e) {
    e.preventDefault();
    
    const dropZone = e.currentTarget;
    dropZone.classList.remove('drag-over');
    
    if (!this.draggedElement) return;

    // Check if drop is valid
    if (this.isValidDrop(this.draggedElement, dropZone)) {
      this.performDrop(this.draggedElement, dropZone);
      this.updateProgress();
      this.checkActivityCompletion();
    }
  }

  /**
   * Check if drop is valid
   */
  isValidDrop(item, dropZone) {
    const zoneId = dropZone.dataset.zoneId;
    const zoneData = this.activityData.dropZones?.find(z => z.id === zoneId);
    
    if (!zoneData) return false;
    
    // Check max items limit
    const droppedItems = dropZone.querySelectorAll('.dropped-items .draggable-item');
    if (zoneData.maxItems && droppedItems.length >= zoneData.maxItems) {
      return false;
    }
    
    return true;
  }

  /**
   * Perform drop operation
   */
  performDrop(item, dropZone) {
    const droppedItemsContainer = dropZone.querySelector('.dropped-items');
    const placeholder = dropZone.querySelector('.zone-placeholder');
    
    // Move item to drop zone
    droppedItemsContainer.appendChild(item);
    
    // Update zone count
    this.updateZoneCount(dropZone);
    
    // Hide placeholder if items present
    if (droppedItemsContainer.children.length > 0) {
      placeholder.style.display = 'none';
    }
    
    // Store user response
    const itemId = item.dataset.itemId;
    const zoneId = dropZone.dataset.zoneId;
    this.userResponses.set(itemId, zoneId);
  }

  /**
   * Update zone count display
   */
  updateZoneCount(dropZone) {
    const countElement = dropZone.querySelector('.zone-count');
    const droppedItems = dropZone.querySelectorAll('.dropped-items .draggable-item');
    const zoneData = this.activityData.dropZones?.find(z => z.id === dropZone.dataset.zoneId);
    const maxItems = zoneData?.maxItems || '∞';
    
    countElement.textContent = `${droppedItems.length}/${maxItems}`;
  }

  /**
   * Enable activity controls
   */
  enableActivityControls() {
    this.resetButton.disabled = false;
    this.checkButton.disabled = false;
  }

  /**
   * Update activity progress
   */
  updateProgress(percentage = null) {
    if (percentage === null) {
      percentage = this.calculateProgress();
    }
    
    this.progressBar.style.width = `${percentage}%`;
    this.progressText.textContent = `${Math.round(percentage)}%`;
    
    // Update progress bar color based on completion
    if (percentage === 100) {
      this.progressBar.classList.add('complete');
    } else {
      this.progressBar.classList.remove('complete');
    }
  }

  /**
   * Calculate activity progress
   */
  calculateProgress() {
    switch (this.currentActivity) {
      case 'drag_drop':
        const totalItems = this.activityData.items?.length || 0;
        const placedItems = this.userResponses.size;
        return totalItems > 0 ? (placedItems / totalItems) * 100 : 0;
        
      case 'matching':
        const totalMatches = this.activityData.leftItems?.length || 0;
        const madeMatches = this.connections?.size || 0;
        return totalMatches > 0 ? (madeMatches / totalMatches) * 100 : 0;
        
      case 'sorting':
        const sortedCorrectly = this.calculateSortingProgress();
        return sortedCorrectly;
        
      case 'categorization':
        const totalCategorizableItems = this.activityData.items?.length || 0;
        const categorizedItems = this.userResponses.size;
        return totalCategorizableItems > 0 ? (categorizedItems / totalCategorizableItems) * 100 : 0;
        
      default:
        return 0;
    }
  }

  /**
   * Check if activity is completed
   */
  checkActivityCompletion() {
    const progress = this.calculateProgress();
    if (progress >= 100) {
      this.checkButton.textContent = 'Verificar Respuestas';
      this.checkButton.classList.add('pulse');
    }
  }

  /**
   * Check answers and provide feedback
   */
  checkAnswers() {
    const results = this.validateAnswers();
    this.showFeedback(results);
    
    if (results.isCorrect) {
      this.isCompleted = true;
      this.continueButton.style.display = 'inline-flex';
      this.checkButton.disabled = true;
      
      // Emit completion event
      this.eventBus?.publish('interactive:completed', {
        type: this.currentActivity,
        score: results.score,
        timeSpent: Date.now() - this.startTime
      });
    }
  }

  /**
   * Validate user answers
   */
  validateAnswers() {
    switch (this.currentActivity) {
      case 'drag_drop':
        return this.validateDragDropAnswers();
      case 'matching':
        return this.validateMatchingAnswers();
      case 'sorting':
        return this.validateSortingAnswers();
      case 'categorization':
        return this.validateCategorizationAnswers();
      default:
        return { isCorrect: false, score: 0, feedback: 'Tipo de actividad no soportado' };
    }
  }

  /**
   * Validate drag and drop answers
   */
  validateDragDropAnswers() {
    const correctAnswers = new Map();
    this.activityData.items.forEach(item => {
      correctAnswers.set(item.id, item.correctZone);
    });

    let correct = 0;
    let total = correctAnswers.size;
    const mistakes = [];

    for (const [itemId, userZone] of this.userResponses) {
      const correctZone = correctAnswers.get(itemId);
      if (userZone === correctZone) {
        correct++;
      } else {
        mistakes.push({
          item: this.activityData.items.find(i => i.id === itemId),
          userAnswer: userZone,
          correctAnswer: correctZone
        });
      }
    }

    const score = Math.round((correct / total) * 100);
    const isCorrect = score >= 80; // 80% threshold for completion

    return {
      isCorrect,
      score,
      correct,
      total,
      mistakes,
      feedback: this.generateDragDropFeedback(isCorrect, score, mistakes)
    };
  }

  /**
   * Generate feedback for drag and drop activity
   */
  generateDragDropFeedback(isCorrect, score, mistakes) {
    if (isCorrect) {
      return {
        title: '¡Excelente trabajo!',
        message: `Has completado la actividad correctamente con una puntuación del ${score}%.`,
        type: 'success'
      };
    } else {
      const mistakeCount = mistakes.length;
      return {
        title: 'Casi lo tienes',
        message: `Puntuación: ${score}%. ${mistakeCount} elemento${mistakeCount > 1 ? 's' : ''} necesita${mistakeCount > 1 ? 'n' : ''} ser reubicado${mistakeCount > 1 ? 's' : ''}.`,
        type: 'partial'
      };
    }
  }

  /**
   * Show feedback to user
   */
  showFeedback(results) {
    const { feedback, isCorrect } = results;
    
    this.feedbackElement.style.display = 'block';
    this.feedbackElement.className = `activity-feedback ${feedback.type}`;
    
    const icon = this.feedbackElement.querySelector('.feedback-icon');
    const title = this.feedbackElement.querySelector('.feedback-title');
    const message = this.feedbackElement.querySelector('.feedback-message');
    
    // Set feedback content based on result type
    switch (feedback.type) {
      case 'success':
        icon.textContent = '🎉';
        break;
      case 'partial':
        icon.textContent = '📝';
        break;
      case 'error':
        icon.textContent = '❌';
        break;
      default:
        icon.textContent = 'ℹ️';
    }
    
    title.textContent = feedback.title;
    message.textContent = feedback.message;
    
    // Scroll feedback into view
    this.feedbackElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }

  /**
   * Hide feedback
   */
  hideFeedback() {
    this.feedbackElement.style.display = 'none';
  }

  /**
   * Reset activity to initial state
   */
  resetActivity() {
    this.userResponses.clear();
    this.isCompleted = false;
    this.hideFeedback();
    
    // Reset specific activity elements
    switch (this.currentActivity) {
      case 'drag_drop':
        this.resetDragDropActivity();
        break;
      case 'matching':
        this.resetMatchingActivity();
        break;
      case 'sorting':
        this.resetSortingActivity();
        break;
      case 'categorization':
        this.resetCategorizationActivity();
        break;
    }
    
    this.updateProgress(0);
    this.checkButton.disabled = false;
    this.checkButton.classList.remove('pulse');
    this.continueButton.style.display = 'none';
    
    // Emit reset event
    this.eventBus?.publish('interactive:reset', {
      type: this.currentActivity
    });
  }

  /**
   * Reset drag and drop activity
   */
  resetDragDropActivity() {
    const itemsContainer = this.contentElement.querySelector('.items-container');
    const dropZones = this.contentElement.querySelectorAll('.drop-zone');
    
    // Move all items back to original container
    dropZones.forEach(zone => {
      const droppedItems = zone.querySelectorAll('.dropped-items .draggable-item');
      droppedItems.forEach(item => {
        itemsContainer.appendChild(item);
      });
      
      // Reset zone display
      const placeholder = zone.querySelector('.zone-placeholder');
      placeholder.style.display = 'block';
      this.updateZoneCount(zone);
    });
  }

  /**
   * Continue to next activity or section
   */
  continueToNext() {
    this.eventBus?.publish('interactive:continue', {
      type: this.currentActivity,
      completed: this.isCompleted
    });
  }

  /**
   * Render generic activity fallback
   */
  renderGenericActivity(config) {
    this.contentElement.innerHTML = `
      <div class="generic-activity">
        <div class="activity-placeholder">
          <div class="placeholder-icon">🎯</div>
          <h3>Actividad Interactiva</h3>
          <p>Esta actividad está en desarrollo. Por favor, intenta más tarde.</p>
        </div>
      </div>
    `;
  }

  /**
   * Destroy interactive renderer
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.userResponses.clear();
    this.connections?.clear();
    
    console.log('[InteractiveRenderer] Destroyed');
  }
}

export default InteractiveRenderer;