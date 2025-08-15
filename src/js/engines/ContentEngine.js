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
   * Create content section
   * @param {Object} section - Section data
   * @param {Object} parentContent - Parent content context
   * @returns {Promise<HTMLElement>} Section element
   */
  async createContentSection(section, parentContent) {
    const sectionElement = document.createElement('section');
    sectionElement.className = `content-section section-${section.type || 'default'}`;
    sectionElement.setAttribute('data-section-id', section.id);

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
   * Utility methods
   */
  async fetchContent(contentConfig) {
    // This would typically fetch from an API or load from files
    // For now, return a mock structure
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