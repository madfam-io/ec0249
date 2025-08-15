/**
 * Content Engine - Interactive lesson content rendering and management
 * Handles dynamic content display, multimedia integration, and interactive elements
 */
import Module from '../core/Module.js';

class ContentEngine extends Module {
  constructor() {
    super('ContentEngine', ['StateManager', 'I18nService', 'StorageService'], {
      autoSave: true,
      saveInterval: 30000, // 30 seconds
      renderTimeout: 5000,
      defaultTransition: 'fadeIn',
      supportedMediaTypes: ['video', 'audio', 'image', 'interactive', 'quiz', 'simulation']
    });

    this.currentContent = null;
    this.contentCache = new Map();
    this.mediaElements = new Map();
    this.interactiveElements = new Map();
    this.contentHistory = [];
    this.renderQueue = [];
    this.isRendering = false;
  }

  async onInitialize() {
    this.stateManager = this.service('StateManager');
    this.i18n = this.service('I18nService');
    this.storage = this.service('StorageService');

    // Subscribe to content events
    this.subscribe('content:load', this.handleContentLoad.bind(this));
    this.subscribe('content:render', this.handleContentRender.bind(this));
    this.subscribe('content:navigate', this.handleContentNavigate.bind(this));
    this.subscribe('progress:update', this.handleProgressUpdate.bind(this));
    this.subscribe('media:play', this.handleMediaPlay.bind(this));
    this.subscribe('interactive:activate', this.handleInteractiveActivate.bind(this));

    // Load saved progress
    await this.loadProgress();

    console.log('[ContentEngine] Initialized');
  }

  /**
   * Load and render lesson content
   * @param {Object} contentConfig - Content configuration
   * @returns {Promise} Load promise
   */
  async loadContent(contentConfig) {
    try {
      this.emit('content:loading', { contentId: contentConfig.id });

      // Check cache first
      let content = this.contentCache.get(contentConfig.id);
      
      if (!content) {
        content = await this.fetchContent(contentConfig);
        this.contentCache.set(contentConfig.id, content);
      }

      // Process content for current language
      content = await this.localizeContent(content);

      // Validate content structure
      this.validateContent(content);

      this.currentContent = content;
      
      // Add to history
      this.contentHistory.push({
        id: content.id,
        timestamp: Date.now(),
        progress: content.progress || 0
      });

      // Emit content loaded event
      this.emit('content:loaded', { 
        content: content,
        fromCache: this.contentCache.has(contentConfig.id)
      });

      return content;

    } catch (error) {
      console.error('[ContentEngine] Failed to load content:', error);
      this.emit('content:error', { 
        error: error.message,
        contentId: contentConfig.id 
      });
      throw error;
    }
  }

  /**
   * Render content in target container
   * @param {HTMLElement} container - Target container
   * @param {Object} content - Content to render
   * @param {Object} options - Render options
   * @returns {Promise} Render promise
   */
  async renderContent(container, content = null, options = {}) {
    if (this.isRendering) {
      this.renderQueue.push({ container, content, options });
      return;
    }

    this.isRendering = true;
    const renderContent = content || this.currentContent;
    
    if (!renderContent) {
      console.warn('[ContentEngine] No content to render');
      this.isRendering = false;
      return;
    }

    try {
      this.emit('content:rendering', { 
        contentId: renderContent.id,
        container: container.id || container.className
      });

      // Clear previous content
      this.clearContainer(container);

      // Create content structure
      const contentElement = await this.createContentElement(renderContent, options);

      // Apply transition
      await this.applyTransition(container, contentElement, options.transition);

      // Initialize interactive elements
      await this.initializeInteractiveElements(contentElement, renderContent);

      // Initialize media elements
      await this.initializeMediaElements(contentElement, renderContent);

      // Track content view
      this.trackContentView(renderContent);

      this.emit('content:rendered', { 
        contentId: renderContent.id,
        duration: Date.now() - this.renderStartTime
      });

    } catch (error) {
      console.error('[ContentEngine] Render failed:', error);
      this.showErrorContent(container, error);
    } finally {
      this.isRendering = false;
      
      // Process render queue
      if (this.renderQueue.length > 0) {
        const next = this.renderQueue.shift();
        this.renderContent(next.container, next.content, next.options);
      }
    }
  }

  /**
   * Create content element from content data
   * @param {Object} content - Content data
   * @param {Object} options - Creation options
   * @returns {Promise<HTMLElement>} Content element
   */
  async createContentElement(content, options = {}) {
    const contentElement = document.createElement('div');
    contentElement.className = `content-container content-${content.type || 'default'}`;
    contentElement.setAttribute('data-content-id', content.id);

    // Add content header
    if (content.title || content.overview) {
      const header = this.createContentHeader(content);
      contentElement.appendChild(header);
    }

    // Add objectives if present
    if (content.objectives && content.objectives.length > 0) {
      const objectives = this.createObjectivesSection(content.objectives);
      contentElement.appendChild(objectives);
    }

    // Add main content sections
    if (content.sections && content.sections.length > 0) {
      for (const section of content.sections) {
        const sectionElement = await this.createContentSection(section, content);
        contentElement.appendChild(sectionElement);
      }
    }

    // Add interactive elements
    if (content.interactions && content.interactions.length > 0) {
      for (const interaction of content.interactions) {
        const interactionElement = await this.createInteractiveElement(interaction);
        contentElement.appendChild(interactionElement);
      }
    }

    // Add navigation if needed
    if (content.navigation !== false) {
      const navigation = this.createContentNavigation(content);
      contentElement.appendChild(navigation);
    }

    return contentElement;
  }

  /**
   * Create content header
   * @param {Object} content - Content data
   * @returns {HTMLElement} Header element
   */
  createContentHeader(content) {
    const header = document.createElement('header');
    header.className = 'content-header';

    if (content.title) {
      const title = document.createElement('h1');
      title.className = 'content-title';
      title.textContent = content.title;
      header.appendChild(title);
    }

    if (content.overview) {
      const overview = document.createElement('p');
      overview.className = 'content-overview';
      overview.textContent = content.overview;
      header.appendChild(overview);
    }

    if (content.duration) {
      const duration = document.createElement('div');
      duration.className = 'content-duration';
      duration.innerHTML = `<span class="duration-icon">⏱️</span> ${content.duration} ${this.i18n.t('common.minutes')}`;
      header.appendChild(duration);
    }

    return header;
  }

  /**
   * Create objectives section
   * @param {Array} objectives - Learning objectives
   * @returns {HTMLElement} Objectives element
   */
  createObjectivesSection(objectives) {
    const section = document.createElement('section');
    section.className = 'content-objectives';

    const title = document.createElement('h3');
    title.textContent = this.i18n.t('lesson.objectives');
    section.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'objectives-list';

    objectives.forEach(objective => {
      const item = document.createElement('li');
      item.className = 'objective-item';
      item.innerHTML = `<span class="objective-icon">🎯</span> ${objective}`;
      list.appendChild(item);
    });

    section.appendChild(list);
    return section;
  }

  /**
   * Create content section - Enhanced for Module 1 rich content
   * @param {Object} section - Section data
   * @param {Object} parentContent - Parent content context
   * @returns {Promise<HTMLElement>} Section element
   */
  async createContentSection(section, parentContent) {
    const sectionElement = document.createElement('section');
    sectionElement.className = `content-section section-${section.type || 'default'}`;
    sectionElement.setAttribute('data-section-id', section.id);

    // Handle Module 1 content structure
    if (parentContent.type === 'lesson' && parentContent.content) {
      return this.createLessonContentSection(parentContent, sectionElement);
    }

    if (section.title) {
      const title = document.createElement('h3');
      title.className = 'section-title';
      title.textContent = section.title;
      sectionElement.appendChild(title);
    }

    // Process section content based on type
    const contentElement = await this.createSectionContent(section, parentContent);
    sectionElement.appendChild(contentElement);

    return sectionElement;
  }

  /**
   * Create section content based on type
   * @param {Object} section - Section data
   * @param {Object} parentContent - Parent content context
   * @returns {Promise<HTMLElement>} Content element
   */
  async createSectionContent(section, parentContent) {
    const contentDiv = document.createElement('div');
    contentDiv.className = 'section-content';

    switch (section.type) {
      case 'text':
        contentDiv.innerHTML = this.processTextContent(section.content);
        break;

      case 'video':
        const videoElement = await this.createVideoElement(section);
        contentDiv.appendChild(videoElement);
        break;

      case 'audio':
        const audioElement = await this.createAudioElement(section);
        contentDiv.appendChild(audioElement);
        break;

      case 'interactive':
        const interactiveElement = await this.createInteractiveElement(section);
        contentDiv.appendChild(interactiveElement);
        break;

      case 'quiz':
        const quizElement = await this.createQuizElement(section);
        contentDiv.appendChild(quizElement);
        break;

      case 'case-study':
        const caseStudyElement = await this.createCaseStudyElement(section);
        contentDiv.appendChild(caseStudyElement);
        break;

      default:
        contentDiv.innerHTML = this.processTextContent(section.content || '');
    }

    return contentDiv;
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
    
    // Process content for i18n placeholders
    content = content.replace(/\{\{i18n:([\w.]+)\}\}/g, (match, key) => {
      return this.i18n.t(key);
    });

    return content;
  }

  /**
   * Create video element
   * @param {Object} section - Section with video data
   * @returns {Promise<HTMLElement>} Video element
   */
  async createVideoElement(section) {
    const container = document.createElement('div');
    container.className = 'video-container';

    const video = document.createElement('video');
    video.className = 'content-video';
    video.controls = true;
    video.preload = 'metadata';

    if (section.poster) {
      video.poster = section.poster;
    }

    if (section.src) {
      video.src = section.src;
    } else if (section.sources) {
      section.sources.forEach(source => {
        const sourceElement = document.createElement('source');
        sourceElement.src = source.src;
        sourceElement.type = source.type;
        video.appendChild(sourceElement);
      });
    }

    // Add video event listeners
    video.addEventListener('loadedmetadata', () => {
      this.emit('media:loaded', { type: 'video', element: video, section });
    });

    video.addEventListener('play', () => {
      this.emit('media:play', { type: 'video', element: video, section });
      this.trackMediaInteraction('video_play', section.id);
    });

    video.addEventListener('ended', () => {
      this.emit('media:ended', { type: 'video', element: video, section });
      this.trackMediaInteraction('video_complete', section.id);
    });

    container.appendChild(video);

    // Add transcript if available
    if (section.transcript) {
      const transcript = this.createTranscriptElement(section.transcript);
      container.appendChild(transcript);
    }

    return container;
  }

  /**
   * Create audio element
   * @param {Object} section - Section with audio data
   * @returns {Promise<HTMLElement>} Audio element
   */
  async createAudioElement(section) {
    const container = document.createElement('div');
    container.className = 'audio-container';

    const audio = document.createElement('audio');
    audio.className = 'content-audio';
    audio.controls = true;
    audio.preload = 'metadata';

    if (section.src) {
      audio.src = section.src;
    }

    // Add audio event listeners
    audio.addEventListener('play', () => {
      this.emit('media:play', { type: 'audio', element: audio, section });
      this.trackMediaInteraction('audio_play', section.id);
    });

    audio.addEventListener('ended', () => {
      this.emit('media:ended', { type: 'audio', element: audio, section });
      this.trackMediaInteraction('audio_complete', section.id);
    });

    container.appendChild(audio);
    return container;
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
   * Apply transition effect
   * @param {HTMLElement} container - Container element
   * @param {HTMLElement} content - Content element
   * @param {string} transition - Transition type
   * @returns {Promise} Transition promise
   */
  async applyTransition(container, content, transition = null) {
    const transitionType = transition || this.getConfig('defaultTransition');
    
    content.style.opacity = '0';
    container.appendChild(content);

    // Force reflow
    content.offsetHeight;

    return new Promise(resolve => {
      content.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
      
      switch (transitionType) {
        case 'fadeIn':
          content.style.opacity = '1';
          break;
        
        case 'slideIn':
          content.style.transform = 'translateY(-20px)';
          content.style.opacity = '1';
          setTimeout(() => {
            content.style.transform = 'translateY(0)';
          }, 10);
          break;
        
        default:
          content.style.opacity = '1';
      }

      setTimeout(resolve, 300);
    });
  }

  /**
   * Clear container content
   * @param {HTMLElement} container - Container to clear
   */
  clearContainer(container) {
    // Cleanup media elements
    const mediaElements = container.querySelectorAll('video, audio');
    mediaElements.forEach(media => {
      media.pause();
      media.src = '';
      media.load();
    });

    // Cleanup interactive elements
    const interactiveElements = container.querySelectorAll('[data-interactive-type]');
    interactiveElements.forEach(element => {
      this.cleanupInteractiveElement(element);
    });

    // Clear content
    container.innerHTML = '';
  }

  /**
   * Track content view for analytics
   * @param {Object} content - Content data
   */
  trackContentView(content) {
    this.emit('analytics:track', {
      event: 'content_view',
      contentId: content.id,
      contentType: content.type,
      timestamp: Date.now()
    });
  }

  /**
   * Track media interaction
   * @param {string} action - Interaction action
   * @param {string} sectionId - Section ID
   */
  trackMediaInteraction(action, sectionId) {
    this.emit('analytics:track', {
      event: action,
      sectionId: sectionId,
      timestamp: Date.now()
    });
  }

  /**
   * Event Handlers
   */
  async handleContentLoad(data) {
    await this.loadContent(data.contentConfig);
  }

  async handleContentRender(data) {
    const container = document.getElementById(data.containerId) || data.container;
    if (container) {
      await this.renderContent(container, data.content, data.options);
    }
  }

  handleContentNavigate(data) {
    // Handle content navigation
    this.emit('content:navigate', data);
  }

  handleProgressUpdate(data) {
    // Update content progress
    if (this.currentContent) {
      this.currentContent.progress = data.progress;
      this.saveProgress();
    }
  }

  handleMediaPlay(data) {
    // Handle media play events
    console.log('[ContentEngine] Media play:', data);
  }

  handleInteractiveActivate(data) {
    // Handle interactive element activation
    console.log('[ContentEngine] Interactive activate:', data);
  }

  /**
   * Progress management
   */
  async loadProgress() {
    try {
      const progress = await this.storage.get('content_progress');
      if (progress) {
        this.contentHistory = progress.history || [];
      }
    } catch (error) {
      console.warn('[ContentEngine] Failed to load progress:', error);
    }
  }

  async saveProgress() {
    try {
      await this.storage.set('content_progress', {
        history: this.contentHistory,
        lastUpdate: Date.now()
      });
    } catch (error) {
      console.warn('[ContentEngine] Failed to save progress:', error);
    }
  }

  /**
   * Create lesson content section with rich Module 1 structure
   * @param {Object} content - Lesson content data
   * @param {HTMLElement} container - Container element
   * @returns {HTMLElement} Rendered content element
   */
  createLessonContentSection(content, container) {
    // Clear container
    container.innerHTML = '';
    container.className = 'lesson-content-container';

    // Handle different content types from Module 1
    if (content.content) {
      Object.entries(content.content).forEach(([key, sectionData]) => {
        const sectionElement = this.createRichContentSection(key, sectionData);
        container.appendChild(sectionElement);
      });
    }

    // Add activities if present
    if (content.activities && content.activities.length > 0) {
      const activitiesSection = this.createActivitiesSection(content.activities);
      container.appendChild(activitiesSection);
    }

    // Add assessment info if present
    if (content.assessment) {
      const assessmentSection = this.createAssessmentSection(content.assessment);
      container.appendChild(assessmentSection);
    }

    return container;
  }

  /**
   * Create rich content section based on Module 1 content structure
   * @param {string} sectionKey - Section key (e.g., 'introduction', 'history')
   * @param {Object} sectionData - Section data
   * @returns {HTMLElement} Section element
   */
  createRichContentSection(sectionKey, sectionData) {
    const section = document.createElement('section');
    section.className = `rich-content-section section-${sectionKey}`;
    section.setAttribute('data-section-key', sectionKey);

    // Add section title
    if (sectionData.title) {
      const title = document.createElement('h3');
      title.className = 'section-title';
      title.textContent = sectionData.title;
      section.appendChild(title);
    }

    // Handle different section types
    switch (sectionKey) {
      case 'introduction':
        section.appendChild(this.createIntroductionContent(sectionData));
        break;
      case 'history':
        section.appendChild(this.createHistoryTimeline(sectionData));
        break;
      case 'types':
        section.appendChild(this.createTypesContent(sectionData));
        break;
      case 'characteristics':
        section.appendChild(this.createCharacteristicsContent(sectionData));
        break;
      case 'process':
        section.appendChild(this.createProcessContent(sectionData));
        break;
      case 'ethicalFoundations':
        section.appendChild(this.createEthicalFoundationsContent(sectionData));
        break;
      case 'codeOfEthics':
        section.appendChild(this.createCodeOfEthicsContent(sectionData));
        break;
      case 'confidentiality':
        section.appendChild(this.createConfidentialityContent(sectionData));
        break;
      case 'conflictManagement':
        section.appendChild(this.createConflictManagementContent(sectionData));
        break;
      case 'communication':
        section.appendChild(this.createCommunicationContent(sectionData));
        break;
      case 'activeListening':
        section.appendChild(this.createActiveListeningContent(sectionData));
        break;
      case 'groupFacilitation':
        section.appendChild(this.createGroupFacilitationContent(sectionData));
        break;
      case 'conflictResolution':
        section.appendChild(this.createConflictResolutionContent(sectionData));
        break;
      case 'changeManagement':
        section.appendChild(this.createChangeManagementContent(sectionData));
        break;
      default:
        section.appendChild(this.createGenericContent(sectionData));
    }

    return section;
  }

  /**
   * Create introduction content with key points
   */
  createIntroductionContent(data) {
    const container = document.createElement('div');
    container.className = 'introduction-content';

    if (data.text) {
      const text = document.createElement('p');
      text.className = 'introduction-text';
      text.textContent = data.text;
      container.appendChild(text);
    }

    if (data.keyPoints && data.keyPoints.length > 0) {
      const pointsContainer = document.createElement('div');
      pointsContainer.className = 'key-points';
      
      const pointsTitle = document.createElement('h4');
      pointsTitle.textContent = 'Puntos Clave';
      pointsContainer.appendChild(pointsTitle);

      const pointsList = document.createElement('ul');
      pointsList.className = 'key-points-list';
      
      data.keyPoints.forEach(point => {
        const item = document.createElement('li');
        item.innerHTML = `<span class="point-icon">✓</span> ${point}`;
        pointsList.appendChild(item);
      });

      pointsContainer.appendChild(pointsList);
      container.appendChild(pointsContainer);
    }

    return container;
  }

  /**
   * Create history timeline
   */
  createHistoryTimeline(data) {
    const container = document.createElement('div');
    container.className = 'history-timeline';

    if (data.timeline && data.timeline.length > 0) {
      const timeline = document.createElement('div');
      timeline.className = 'timeline';

      data.timeline.forEach((period, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        timelineItem.innerHTML = `
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <h5 class="timeline-period">${period.period}</h5>
            <p class="timeline-description">${period.description}</p>
          </div>
        `;
        
        timeline.appendChild(timelineItem);
      });

      container.appendChild(timeline);
    }

    return container;
  }

  /**
   * Create activities section
   */
  createActivitiesSection(activities) {
    const section = document.createElement('section');
    section.className = 'activities-section';

    const title = document.createElement('h3');
    title.textContent = 'Actividades de Aprendizaje';
    section.appendChild(title);

    const activitiesContainer = document.createElement('div');
    activitiesContainer.className = 'activities-container';

    activities.forEach(activity => {
      const activityCard = document.createElement('div');
      activityCard.className = `activity-card activity-${activity.type}`;
      
      activityCard.innerHTML = `
        <div class="activity-header">
          <span class="activity-icon">${this.getActivityIcon(activity.type)}</span>
          <h4 class="activity-title">${activity.title}</h4>
        </div>
        <p class="activity-description">${activity.description}</p>
        <button class="btn btn-primary start-activity" data-activity-type="${activity.type}">
          Iniciar Actividad
        </button>
      `;

      activitiesContainer.appendChild(activityCard);
    });

    section.appendChild(activitiesContainer);
    return section;
  }

  /**
   * Create assessment section
   */
  createAssessmentSection(assessment) {
    const section = document.createElement('section');
    section.className = 'assessment-section';

    const title = document.createElement('h3');
    title.textContent = 'Evaluación';
    section.appendChild(title);

    const assessmentCard = document.createElement('div');
    assessmentCard.className = 'assessment-card';
    
    assessmentCard.innerHTML = `
      <div class="assessment-info">
        <p><strong>Tipo:</strong> ${this.getAssessmentTypeLabel(assessment.type)}</p>
        ${assessment.questions ? `<p><strong>Preguntas:</strong> ${assessment.questions}</p>` : ''}
        ${assessment.scenarios ? `<p><strong>Escenarios:</strong> ${assessment.scenarios}</p>` : ''}
        ${assessment.activities ? `<p><strong>Actividades:</strong> ${assessment.activities}</p>` : ''}
        <p><strong>Puntuación mínima:</strong> ${assessment.passingScore}%</p>
      </div>
      <button class="btn btn-primary start-assessment" data-assessment-type="${assessment.type}">
        Iniciar Evaluación
      </button>
    `;

    section.appendChild(assessmentCard);
    return section;
  }

  /**
   * Helper methods for content creation
   */
  getActivityIcon(type) {
    const icons = {
      reflection: '🤔',
      case_study: '📊',
      scenario: '🎭',
      document: '📝',
      roleplay: '🎪',
      practice: '🏃‍♂️'
    };
    return icons[type] || '📚';
  }

  getAssessmentTypeLabel(type) {
    const labels = {
      quiz: 'Cuestionario',
      scenario_based: 'Basado en Escenarios',
      practical: 'Evaluación Práctica'
    };
    return labels[type] || 'Evaluación';
  }

  /**
   * Create generic content for fallback
   */
  createGenericContent(data) {
    const container = document.createElement('div');
    container.className = 'generic-content';

    if (data.text) {
      const text = document.createElement('p');
      text.textContent = data.text;
      container.appendChild(text);
    }

    return container;
  }

  /**
   * Utility methods
   */
  async fetchContent(contentConfig) {
    const { id, type, source = 'i18n' } = contentConfig;

    try {
      switch (source) {
        case 'i18n':
          return await this.fetchI18nContent(id, type);
        case 'api':
          return await this.fetchAPIContent(id, type);
        case 'file':
          return await this.fetchFileContent(id, type);
        default:
          // Fallback to mock structure for compatibility
          return {
            id: contentConfig.id,
            type: contentConfig.type || 'lesson',
            title: contentConfig.title,
            overview: contentConfig.overview,
            duration: contentConfig.duration,
            objectives: contentConfig.objectives || [],
            sections: contentConfig.sections || [],
            interactions: contentConfig.interactions || [],
            navigation: contentConfig.navigation !== false
          };
      }
    } catch (error) {
      console.error(`[ContentEngine] Failed to fetch content ${id}:`, error);
      // Return fallback content
      return {
        id: contentConfig.id,
        type: 'error',
        title: 'Content Loading Error',
        overview: 'Failed to load content',
        sections: [{
          type: 'error',
          content: 'Unable to load the requested content. Please try again later.'
        }]
      };
    }
  }

  /**
   * Fetch content from i18n translations
   * @param {string} id - Content ID (e.g., 'module1.lessons.lesson1_1')
   * @param {string} type - Content type
   * @returns {Promise<Object>} Content data
   */
  async fetchI18nContent(id, type) {
    try {
      const content = this.i18n.getTranslation(id, this.i18n.getCurrentLanguage());
      
      if (!content) {
        throw new Error(`Content not found for key: ${id}`);
      }

      return {
        id,
        type: type || 'lesson',
        source: 'i18n',
        ...content,
        metadata: {
          language: this.i18n.getCurrentLanguage(),
          fetchedAt: Date.now()
        }
      };
    } catch (error) {
      console.error(`[ContentEngine] Failed to fetch i18n content ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch content from API
   * @param {string} id - Content ID
   * @param {string} type - Content type
   * @returns {Promise<Object>} Content data
   */
  async fetchAPIContent(id, type) {
    // Placeholder for future API integration
    throw new Error('API content fetching not implemented yet');
  }

  /**
   * Fetch content from file
   * @param {string} id - Content ID
   * @param {string} type - Content type
   * @returns {Promise<Object>} Content data
   */
  async fetchFileContent(id, type) {
    // Placeholder for future file-based content
    throw new Error('File content fetching not implemented yet');
  }

  async localizeContent(content) {
    // Process content for current language
    if (content.title) {
      content.title = this.i18n.t(content.title, {}, content.title);
    }
    
    if (content.overview) {
      content.overview = this.i18n.t(content.overview, {}, content.overview);
    }

    return content;
  }

  validateContent(content) {
    if (!content.id) {
      throw new Error('Content must have an ID');
    }
    
    if (!content.title) {
      throw new Error('Content must have a title');
    }
  }

  showErrorContent(container, error) {
    container.innerHTML = `
      <div class="content-error">
        <h3>⚠️ Error al cargar contenido</h3>
        <p>${error.message}</p>
        <button onclick="location.reload()">Reintentar</button>
      </div>
    `;
  }

  cleanupInteractiveElement(element) {
    // Remove event listeners and cleanup interactive elements
    const listeners = element._eventListeners || [];
    listeners.forEach(({ event, handler }) => {
      element.removeEventListener(event, handler);
    });
  }

  async onDestroy() {
    // Cleanup
    this.contentCache.clear();
    this.mediaElements.clear();
    this.interactiveElements.clear();
    this.contentHistory = [];
    this.renderQueue = [];
  }
}

export default ContentEngine;