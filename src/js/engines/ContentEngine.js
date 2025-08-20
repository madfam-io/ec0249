/**
 * Content Engine - Interactive Educational Content Rendering and Management
 * 
 * @description The ContentEngine is responsible for loading, rendering, and managing
 * interactive educational content for the EC0249 platform. It provides a comprehensive
 * system for handling multimedia content, interactive elements, activities, and assessments
 * with support for multiple content types and rendering strategies.
 * 
 * @class ContentEngine
 * @extends Module
 * 
 * Key Features:
 * - Dynamic content loading with caching and progress tracking
 * - Multi-format content rendering (text, video, audio, interactive)
 * - Modular renderer architecture (SectionRenderer, MediaRenderer, etc.)
 * - Content transition effects and animations
 * - Automatic content history and analytics tracking
 * - Progress persistence and state management
 * - Responsive design and accessibility support
 * 
 * Content Types Supported:
 * - Lesson content with structured sections
 * - Interactive multimedia elements
 * - Activities and exercises
 * - Assessment integration
 * - Navigation and progress tracking
 * 
 * Renderer Components:
 * - SectionRenderer: Handles content sections and text formatting
 * - MediaRenderer: Manages video, audio, and image content
 * - InteractiveRenderer: Handles interactive elements and widgets
 * - ActivityRenderer: Renders activities and exercises
 * - ContentLoader: Handles content fetching and caching
 * 
 * @example
 * // Load and render lesson content
 * const contentConfig = {
 *   id: 'module1-lesson1',
 *   type: 'lesson',
 *   title: 'Introduction to Consulting',
 *   sections: [...],
 *   activities: [...]
 * };
 * 
 * await contentEngine.loadContent(contentConfig);
 * await contentEngine.renderContent(containerElement);
 * 
 * @example
 * // Listen for content events
 * contentEngine.subscribe('content:loaded', (data) => {
 *   console.log('Content loaded:', data.content.id);
 * });
 * 
 * @since 2.0.0
 */
import Module from '../core/Module.js';
import SectionRenderer from '../renderers/SectionRenderer.js';
import MediaRenderer from '../renderers/MediaRenderer.js';
import InteractiveRenderer from '../renderers/InteractiveRenderer.js';
import ActivityRenderer from '../renderers/ActivityRenderer.js';
import ContentLoader from '../loaders/ContentLoader.js';

class ContentEngine extends Module {
  /**
   * Create a new ContentEngine instance
   * 
   * @description Initializes the ContentEngine with configuration for content rendering,
   * media handling, transitions, and auto-save functionality. Sets up the foundation
   * for modular content rendering with specialized renderer components.
   * 
   * @constructor
   * 
   * Configuration Options:
   * - autoSave: Enables automatic progress saving
   * - saveInterval: Auto-save interval in milliseconds
   * - renderTimeout: Maximum time for rendering operations
   * - defaultTransition: Default transition effect for content changes
   * - supportedMediaTypes: Array of supported media formats
   * 
   * @since 2.0.0
   */
  constructor() {
    super('ContentEngine', ['StateManager', 'I18nService', 'StorageService'], {
      autoSave: true,
      saveInterval: 30000, // 30 seconds
      renderTimeout: 5000,
      defaultTransition: 'fadeIn',
      supportedMediaTypes: ['video', 'audio', 'image', 'interactive', 'quiz', 'simulation']
    });

    this.currentContent = null;
    this.mediaElements = new Map();
    this.interactiveElements = new Map();
    this.contentHistory = [];
    this.renderQueue = [];
    this.isRendering = false;

    // Renderer and loader instances
    this.sectionRenderer = null;
    this.mediaRenderer = null;
    this.interactiveRenderer = null;
    this.activityRenderer = null;
    this.contentLoader = null;
  }

  async onInitialize() {
    this.stateManager = this.service('StateManager');
    this.i18n = this.service('I18nService');
    this.storage = this.service('StorageService');

    // Initialize renderers and loaders
    this.sectionRenderer = new SectionRenderer(this.i18n);
    this.mediaRenderer = new MediaRenderer();
    this.interactiveRenderer = new InteractiveRenderer();
    this.activityRenderer = new ActivityRenderer(this.i18n);
    this.contentLoader = new ContentLoader(this.i18n);

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
   * Load educational content from configuration
   * 
   * @description Loads content data using the ContentLoader, handles caching,
   * progress tracking, and content history management. The loaded content
   * is prepared for rendering and stored in the engine state.
   * 
   * @param {Object} contentConfig - Content configuration object
   * @param {string} contentConfig.id - Unique content identifier
   * @param {string} contentConfig.type - Content type ('lesson', 'activity', 'assessment')
   * @param {string} [contentConfig.title] - Content title
   * @param {string} [contentConfig.overview] - Content overview/description
   * @param {Array} [contentConfig.sections] - Content sections array
   * @param {Array} [contentConfig.activities] - Activities array
   * @param {Object} [contentConfig.assessment] - Assessment configuration
   * 
   * @returns {Promise<Object>} Promise that resolves to the loaded content object
   * 
   * @throws {Error} Throws if content configuration is invalid
   * @throws {Error} Throws if content loading fails
   * 
   * @fires ContentEngine#content:loading - Emitted when loading starts
   * @fires ContentEngine#content:loaded - Emitted when loading completes
   * @fires ContentEngine#content:error - Emitted if loading fails
   * 
   * @example
   * // Load lesson content
   * const content = await contentEngine.loadContent({
   *   id: 'module1-lesson1',
   *   type: 'lesson',
   *   title: 'Introduction to Consulting Ethics'
   * });
   * 
   * @since 2.0.0
   */
  async loadContent(contentConfig) {
    try {
      this.emit('content:loading', { contentId: contentConfig.id });

      // Use ContentLoader to load content
      const content = await this.contentLoader.loadContent(contentConfig);

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
        fromCache: this.contentLoader.getCachedContent(contentConfig.id) !== null
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
   * Render content in target DOM container
   * 
   * @description Renders loaded content into the specified DOM container using
   * the modular renderer architecture. Handles content structure creation,
   * transition effects, interactive element initialization, and media setup.
   * 
   * @param {HTMLElement} container - Target DOM container element
   * @param {Object} [content=null] - Content object to render (uses current content if null)
   * @param {Object} [options={}] - Rendering options
   * @param {string} [options.transition] - Transition effect ('fadeIn', 'slideIn')
   * @param {boolean} [options.clearContainer=true] - Whether to clear container first
   * @param {boolean} [options.initializeInteractive=true] - Whether to initialize interactive elements
   * 
   * @returns {Promise<void>} Promise that resolves when rendering is complete
   * 
   * @throws {Error} Throws if container is not a valid DOM element
   * @throws {Error} Throws if no content is available to render
   * @throws {Error} Throws if rendering fails
   * 
   * @fires ContentEngine#content:rendering - Emitted when rendering starts
   * @fires ContentEngine#content:rendered - Emitted when rendering completes
   * 
   * @example
   * // Render with custom transition
   * await contentEngine.renderContent(containerElement, null, {
   *   transition: 'slideIn'
   * });
   * 
   * @since 2.0.0
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
      this.renderStartTime = Date.now();
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
      await this.interactiveRenderer.initializeInteractiveElements(contentElement, renderContent);

      // Initialize media elements
      await this.mediaRenderer.initializeMediaElements(contentElement, renderContent);

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
      const header = this.activityRenderer.createContentHeader(content);
      contentElement.appendChild(header);
    }

    // Add objectives if present
    if (content.objectives && content.objectives.length > 0) {
      const objectives = this.activityRenderer.createObjectivesSection(content.objectives);
      contentElement.appendChild(objectives);
    }

    // Add video content if present
    if (content.video || content.videoId) {
      const videoSection = this.createVideoSection(content);
      contentElement.appendChild(videoSection);
    }

    // Add main content sections
    if (content.sections && content.sections.length > 0) {
      for (const section of content.sections) {
        const sectionElement = await this.sectionRenderer.createContentSection(section, content);
        contentElement.appendChild(sectionElement);
      }
    }

    // Add interactive elements
    if (content.interactions && content.interactions.length > 0) {
      for (const interaction of content.interactions) {
        const interactionElement = await this.interactiveRenderer.createInteractiveElement(interaction);
        contentElement.appendChild(interactionElement);
      }
    }

    // Handle Module 1 content structure
    if (content.type === 'lesson' && content.content) {
      const lessonContent = this.sectionRenderer.createLessonContentSection(content, contentElement);
    }

    // Add activities if present
    if (content.activities && content.activities.length > 0) {
      const activitiesSection = this.activityRenderer.createActivitiesSection(content.activities);
      contentElement.appendChild(activitiesSection);
    }

    // Add assessment info if present
    if (content.assessment) {
      const assessmentSection = this.activityRenderer.createAssessmentSection(content.assessment);
      contentElement.appendChild(assessmentSection);
    }

    // Add navigation if needed
    if (content.navigation !== false) {
      const navigation = this.activityRenderer.createContentNavigation(content);
      contentElement.appendChild(navigation);
    }

    return contentElement;
  }

  /**
   * Create video section for content
   * @param {Object} content - Content with video information
   * @returns {HTMLElement} Video section element
   */
  createVideoSection(content) {
    const videoSection = document.createElement('div');
    videoSection.className = 'lesson-video-section';
    
    // Create video container with unique ID
    const videoId = content.videoId || content.video?.id || content.id + '_video';
    const videoContainer = document.createElement('div');
    videoContainer.id = `video-player-${videoId}`;
    videoContainer.className = 'lesson-video-player';
    
    // Create video introduction if video has title/description
    const videoTitle = content.video?.title || content.videoTitle;
    const videoDescription = content.video?.description || content.videoDescription;
    
    if (videoTitle || videoDescription) {
      const introDiv = document.createElement('div');
      introDiv.className = 'lesson-video-introduction';
      
      if (videoTitle) {
        const titleElement = document.createElement('h4');
        titleElement.textContent = `🎥 ${videoTitle}`;
        introDiv.appendChild(titleElement);
      }
      
      if (videoDescription) {
        const descElement = document.createElement('p');
        descElement.textContent = videoDescription;
        introDiv.appendChild(descElement);
      }
      
      videoSection.appendChild(introDiv);
    }
    
    videoSection.appendChild(videoContainer);
    
    // Schedule video player initialization
    setTimeout(() => {
      this.initializeVideoPlayer(videoContainer, content);
    }, 100);
    
    return videoSection;
  }

  /**
   * Initialize video player for content
   * @param {HTMLElement} container - Video container element
   * @param {Object} content - Content with video configuration
   */
  async initializeVideoPlayer(container, content) {
    // Defensive check for container and content
    if (!container || !content) {
      console.warn('[ContentEngine] Invalid container or content for video player initialization');
      return;
    }

    // Check if module is properly initialized
    if (!this.container || !this.eventBus) {
      console.warn('[ContentEngine] Module not properly initialized, skipping video player setup');
      return;
    }

    try {
      // Import VideoPlayer dynamically to avoid circular dependencies
      const { default: VideoPlayer } = await import('../components/VideoPlayer.js');
      const { getVideoConfig } = await import('../config/VideoConfig.js');
      
      // Create video player instance with error boundary
      const videoPlayer = new VideoPlayer({
        placement: 'lesson_content',
        showTitle: false, // Already shown in introduction
        showDescription: false,
        trackProgress: true
      });
      
      // Mount and initialize with proper error handling
      try {
        videoPlayer.mount(container);
        await videoPlayer.initialize(this.container, this.eventBus);
      } catch (initError) {
        console.error('[ContentEngine] Failed to mount/initialize video player:', initError);
        // Show fallback content
        this.showVideoFallback(container, content);
        return;
      }
      
      // Load video configuration
      let videoConfig = null;
      
      if (content.video && typeof content.video === 'object') {
        // Video config provided directly
        videoConfig = content.video;
      } else if (content.videoId) {
        // Look up video by ID in module configuration
        try {
          videoConfig = await this.getVideoConfigForContent(content);
        } catch (configError) {
          console.warn('[ContentEngine] Failed to get video config:', configError);
        }
      }
      
      if (videoConfig && videoConfig.id) {
        try {
          videoPlayer.loadVideo(videoConfig);
          console.log('[ContentEngine] Video player initialized for:', videoConfig.title);
        } catch (loadError) {
          console.error('[ContentEngine] Failed to load video:', loadError);
          this.showVideoFallback(container, content, videoConfig);
        }
      } else {
        console.warn('[ContentEngine] No valid video configuration found for content:', content.id);
        this.showVideoFallback(container, content);
      }
      
    } catch (error) {
      console.error('[ContentEngine] Failed to initialize video player:', error);
      this.showVideoFallback(container, content);
    }
  }

  /**
   * Show fallback content when video player fails
   * @param {HTMLElement} container - Video container element
   * @param {Object} content - Content object
   * @param {Object} [videoConfig] - Video configuration if available
   */
  showVideoFallback(container, content, videoConfig = null) {
    if (!container) return;

    const fallbackHtml = `
      <div class="video-fallback">
        <div class="video-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon">🎥</div>
            <h4>Video temporalmente no disponible</h4>
            <p>El contenido del video estará disponible próximamente.</p>
            ${videoConfig ? `<p class="video-title">${videoConfig.title}</p>` : ''}
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = fallbackHtml;
  }

  /**
   * Get video configuration for content
   * @param {Object} content - Content object
   * @returns {Object|null} Video configuration
   */
  async getVideoConfigForContent(content) {
    try {
      // Use dynamic import instead of require() for ES modules
      const { getVideoConfig, getModuleVideos } = await import('../config/VideoConfig.js');
      
      // Try to match content to video based on module and lesson structure
      if (content.moduleId && content.lessonId) {
        return getVideoConfig(content.moduleId, content.lessonId);
      }
      
      // Try to get video by content ID pattern matching
      if (content.id) {
        const moduleMatch = content.id.match(/module(\d+)/);
        const lessonMatch = content.id.match(/lesson(\d+_\d+)/);
        
        if (moduleMatch) {
          const moduleNum = parseInt(moduleMatch[1]);
          const moduleKey = `module${moduleNum}`;
          
          if (lessonMatch) {
            const lessonKey = `lesson${lessonMatch[1]}`;
            return getVideoConfig(moduleKey, lessonKey);
          } else {
            // Return module overview video
            return getVideoConfig(moduleKey);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('[ContentEngine] Error getting video config:', error);
      return null;
    }
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
    this.mediaRenderer.cleanupMediaElements(container);

    // Cleanup interactive elements
    this.interactiveRenderer.cleanupInteractiveElements(container);

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
   * Get module content by module ID
   * @param {string} moduleId - Module identifier (module1, module2, etc.)
   * @returns {Promise<Object|null>} Module content or null if not found
   */
  async getModuleContent(moduleId) {
    try {
      const moduleData = this.getModuleData(moduleId);
      if (!moduleData) {
        console.warn(`[ContentEngine] No content found for module: ${moduleId}`);
        return null;
      }

      // Track content access
      this.trackContentView({
        id: moduleId,
        type: 'module',
        title: moduleData.title
      });

      return moduleData;
    } catch (error) {
      console.error(`[ContentEngine] Failed to get module content for ${moduleId}:`, error);
      return null;
    }
  }

  /**
   * Get static module data structure
   * @param {string} moduleId - Module identifier
   * @returns {Object|null} Module data structure
   */
  getModuleData(moduleId) {
    const moduleContent = {
      module1: {
        id: 'module1',
        title: 'Módulo 1: Fundamentos de Consultoría',
        description: 'Conceptos básicos, ética y habilidades interpersonales necesarias para la consultoría profesional.',
        duration: '2-3 horas',
        objectives: [
          'Comprender los conceptos fundamentales de la consultoría',
          'Dominar los principios éticos del consultor profesional',
          'Desarrollar habilidades interpersonales clave',
          'Conocer los diferentes tipos de servicios de consultoría'
        ],
        lessons: [
          {
            id: 'lesson1_1',
            title: 'Introducción a los Servicios de Consultoría',
            duration: '30 min',
            type: 'theory',
            description: 'Definición, tipos y características de la consultoría profesional.',
            videoId: 'k_T7rmWpwd8',
            content: [
              {
                type: 'overview',
                title: 'Conceptos Fundamentales',
                text: 'La consultoría es un servicio profesional que ayuda a las organizaciones a mejorar su rendimiento y resolver problemas específicos.'
              }
            ]
          },
          {
            id: 'lesson1_2', 
            title: 'Ética y Confidencialidad',
            duration: '25 min',
            type: 'theory',
            description: 'Principios éticos y normas de confidencialidad en consultoría.',
            videoId: 'fXhSlqGJU8s',
            content: [
              {
                type: 'overview',
                title: 'Código de Ética',
                text: 'Los consultores deben mantener altos estándares éticos y proteger la confidencialidad de la información del cliente.'
              }
            ]
          },
          {
            id: 'lesson1_3',
            title: 'Habilidades Interpersonales',
            duration: '35 min', 
            type: 'practice',
            description: 'Desarrollo de habilidades de comunicación y relación con clientes.',
            videoId: 'Q73vPkE8n3k',
            content: [
              {
                type: 'skills',
                title: 'Comunicación Efectiva',
                text: 'Las habilidades interpersonales son fundamentales para establecer relaciones de confianza con los clientes.'
              }
            ]
          }
        ],
        activities: [
          {
            id: 'activity1_1',
            title: 'Casos de Estudio Éticos',
            type: 'case_study',
            description: 'Analiza situaciones éticas comunes en consultoría'
          }
        ],
        assessment: {
          id: 'assessment1',
          title: 'Evaluación Módulo 1',
          questions: 10,
          passingScore: 80
        }
      },
      module2: {
        id: 'module2',
        title: 'Módulo 2: Identificación del Problema',
        description: 'Elemento 1: Identificar la situación/problema planteado. 8 productos requeridos.',
        duration: '4-5 horas',
        objectives: [
          'Identificar y analizar problemas organizacionales',
          'Aplicar metodologías de diagnóstico',
          'Elaborar documentos de identificación del problema',
          'Preparar entrevistas con clientes potenciales'
        ],
        lessons: [
          {
            id: 'lesson2_1',
            title: 'Metodologías de Diagnóstico',
            duration: '45 min',
            type: 'theory',
            description: 'Técnicas y herramientas para identificar problemas organizacionales.',
            videoId: 'ztP58PpCuzs',
            content: [
              {
                type: 'methodology',
                title: 'Herramientas de Diagnóstico',
                text: 'Existen diversas metodologías para identificar y analizar problemas en las organizaciones.'
              }
            ]
          }
        ],
        templates: [
          'brief_service_description',
          'client_interview_guide', 
          'problem_description_document',
          'information_request_document',
          'interview_activity_document',
          'field_visit_document',
          'situation_analysis_document',
          'client_interview_document'
        ]
      },
      module3: {
        id: 'module3', 
        title: 'Módulo 3: Desarrollo de Soluciones',
        description: 'Elemento 2: Desarrollar opciones de solución. 2 productos requeridos.',
        duration: '3-4 horas',
        objectives: [
          'Desarrollar opciones de solución viables',
          'Realizar análisis costo-beneficio',
          'Crear propuestas de solución profesionales'
        ],
        lessons: [
          {
            id: 'lesson3_1',
            title: 'Generación de Alternativas',
            duration: '40 min',
            type: 'theory',
            description: 'Técnicas para desarrollar múltiples opciones de solución.',
            videoId: 'rJQbxkkN_fY',
            content: [
              {
                type: 'strategy',
                title: 'Desarrollo de Soluciones',
                text: 'Es importante desarrollar múltiples alternativas de solución para ofrecer al cliente.'
              }
            ]
          }
        ],
        templates: [
          'solution_proposal_document',
          'cost_benefit_document'
        ]
      },
      module4: {
        id: 'module4',
        title: 'Módulo 4: Presentación de la Propuesta',
        description: 'Elemento 3: Presentar la propuesta de solución. 5 productos requeridos.',
        duration: '3-4 horas', 
        objectives: [
          'Preparar presentaciones profesionales',
          'Manejar objeciones y negociaciones',
          'Cerrar acuerdos de consultoría'
        ],
        lessons: [
          {
            id: 'lesson4_1',
            title: 'Técnicas de Presentación',
            duration: '35 min',
            type: 'theory',
            description: 'Habilidades para presentar propuestas de manera efectiva.',
            videoId: 'n0HvLAhKy5I',
            content: [
              {
                type: 'presentation',
                title: 'Presentación Efectiva',
                text: 'Una presentación clara y convincente es clave para el éxito de la propuesta.'
              }
            ]
          }
        ],
        templates: [
          'presentation_document',
          'proposal_presentation_visual_aids',
          'negotiation_document', 
          'work_proposal_document',
          'service_proposal_document'
        ]
      }
    };

    return moduleContent[moduleId] || null;
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
      const previousProgress = this.currentContent.progress || 0;
      this.currentContent.progress = data.progress;
      this.saveProgress();
      
      // Emit achievement events based on progress
      this.checkAchievementProgress(data, previousProgress);
    }
  }

  /**
   * Check for achievement-worthy progress and emit appropriate events
   * @param {Object} data - Progress data
   * @param {number} previousProgress - Previous progress value
   */
  checkAchievementProgress(data, previousProgress) {
    const currentProgress = data.progress || 0;
    
    // Lesson completion (100% progress)
    if (currentProgress === 100 && previousProgress < 100) {
      this.emit('lesson:completed', {
        contentId: this.currentContent.id,
        contentType: this.currentContent.type,
        moduleId: this.extractModuleId(this.currentContent.id),
        timestamp: Date.now(),
        timeSpent: data.timeSpent || 0
      });
      
      console.log('[ContentEngine] Lesson completed:', this.currentContent.id);
    }
    
    // Module completion check
    if (data.moduleCompleted) {
      this.emit('module:completed', {
        moduleId: data.moduleId,
        timestamp: Date.now(),
        lessonsCompleted: data.lessonsInModule || 1
      });
      
      console.log('[ContentEngine] Module completed:', data.moduleId);
    }
    
    // First lesson milestone
    if (currentProgress >= 25 && previousProgress < 25) {
      this.emit('progress:milestone', {
        type: 'lesson_quarter',
        contentId: this.currentContent.id,
        progress: currentProgress
      });
    }
  }

  /**
   * Extract module ID from content ID
   * @param {string} contentId - Content identifier
   * @returns {string} Module identifier
   */
  extractModuleId(contentId) {
    // Extract module ID from content ID (e.g., 'module1-lesson1' -> 'module1')
    const match = contentId.match(/^(module\d+)/);
    return match ? match[1] : 'unknown';
  }

  handleMediaPlay(data) {
    // Handle media play events
    console.log('[ContentEngine] Media play:', data);
    
    // Track video completion for achievements
    if (data.type === 'video' && data.completed) {
      this.emit('video:completed', {
        videoId: data.videoId,
        contentId: this.currentContent?.id,
        moduleId: this.extractModuleId(this.currentContent?.id || ''),
        timestamp: Date.now(),
        duration: data.duration || 0
      });
      
      console.log('[ContentEngine] Video completed:', data.videoId);
    }
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
  showErrorContent(container, error) {
    container.innerHTML = `
      <div class="content-error">
        <h3>⚠️ Error al cargar contenido</h3>
        <p>${error.message}</p>
        <button onclick="location.reload()">Reintentar</button>
      </div>
    `;
  }

  async onDestroy() {
    // Cleanup
    this.contentLoader?.clearCache();
    this.interactiveRenderer?.destroy();
    this.mediaElements.clear();
    this.interactiveElements.clear();
    this.contentHistory = [];
    this.renderQueue = [];
  }
}

export default ContentEngine;