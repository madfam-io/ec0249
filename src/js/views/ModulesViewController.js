/**
 * Modules View Controller - Manages the learning modules interface
 * Handles module navigation, content display, and progress tracking
 */
import BaseViewController from './BaseViewController.js';

class ModulesViewController extends BaseViewController {
  constructor(viewId, app) {
    super(viewId, app);
    this.currentModule = 'module1';
    this.currentLesson = null;
    this.contentEngine = null;
  }

  async onInitialize() {
    // Get content engine from app modules or service container
    this.contentEngine = this.getModule('contentEngine') || this.app.modules?.get('contentEngine');
    
    if (!this.contentEngine) {
      console.warn('[ModulesViewController] ContentEngine not available yet - will retry during module loading');
    } else {
      console.log('[ModulesViewController] ContentEngine successfully retrieved');
    }
  }

  bindEvents() {
    // Module navigation
    this.findElements('.module-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const moduleId = item.getAttribute('data-module');
        if (moduleId) {
          this.showModule(moduleId);
        }
      });
    });

    // Lesson navigation
    this.findElements('.lesson-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const lessonId = item.getAttribute('data-lesson');
        if (lessonId) {
          this.showLesson(lessonId);
        }
      });
    });

    // Content navigation buttons
    this.findElements('[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.getAttribute('data-action');
        this.handleContentAction(action, button);
      });
    });

    // Subscribe to section changes
    this.subscribe('app:section-change', (data) => {
      if (data.section && data.section.startsWith('module')) {
        this.showModule(data.section);
      }
    });
  }

  async onShow() {
    // Check if we should show module overview grid or specific module content
    if (!this.currentModule || this.currentModule === 'overview') {
      await this.renderModuleGrid();
    } else {
      // Ensure content is loaded for current module
      await this.loadModuleContent();
    }
  }

  async onRender() {
    // Check if we should show module overview grid or specific module content
    if (!this.currentModule || this.currentModule === 'overview') {
      await this.renderModuleGrid();
    } else {
      // Update module navigation
      this.updateModuleNavigation();
      
      // Render current module content
      await this.renderCurrentModule();
      
      // Update progress indicators
      this.updateProgressIndicators();
    }
  }

  /**
   * Show a specific module
   */
  async showModule(moduleId) {
    if (this.currentModule === moduleId) return;
    
    this.currentModule = moduleId;
    this.currentLesson = null;
    
    // Update navigation
    this.updateModuleNavigation();
    
    // Load and render module content
    await this.loadModuleContent();
    await this.renderCurrentModule();
    
    // Update URL state
    this.emit('app:state-change', { 
      currentSection: moduleId 
    });
  }

  /**
   * Show a specific lesson within the current module
   */
  async showLesson(lessonId) {
    if (!this.currentModule || !this.moduleContent) {
      console.warn('[ModulesViewController] Cannot show lesson without current module');
      return;
    }

    this.currentLesson = lessonId;
    
    // Find lesson data
    let lessonData = null;
    if (Array.isArray(this.moduleContent.lessons)) {
      lessonData = this.moduleContent.lessons.find(lesson => lesson.id === lessonId);
    } else if (this.moduleContent.lessons) {
      lessonData = this.moduleContent.lessons[lessonId];
    }

    if (!lessonData) {
      console.warn(`[ModulesViewController] Lesson ${lessonId} not found in module ${this.currentModule}`);
      return;
    }
    
    // Render lesson content
    await this.renderLessonContent(lessonId, lessonData);
    
    // Update lesson navigation
    this.updateLessonNavigation();
    
    // Track progress
    this.trackLessonProgress(lessonId);
    
    // Update URL to include lesson
    this.emit('app:state-change', { 
      currentSection: `${this.currentModule}/${lessonId}` 
    });
  }

  /**
   * Load content for the current module
   */
  async loadModuleContent() {
    // Retry getting ContentEngine if not available during initialization
    if (!this.contentEngine) {
      this.contentEngine = this.getModule('contentEngine') || this.app.modules?.get('contentEngine');
    }
    
    if (!this.contentEngine) {
      console.error('[ModulesViewController] ContentEngine not available - cannot load module content');
      this.showNotification('Error: ContentEngine no disponible', 'error');
      return;
    }
    
    try {
      console.log(`[ModulesViewController] Loading content for ${this.currentModule}`);
      
      // Load module content from ContentEngine
      const moduleContent = await this.contentEngine.getModuleContent(this.currentModule);
      
      if (moduleContent) {
        this.moduleContent = moduleContent;
        console.log(`[ModulesViewController] Successfully loaded content for ${this.currentModule}:`, moduleContent.title);
      } else {
        console.warn(`[ModulesViewController] No content found for ${this.currentModule}`);
        this.showNotification(`No se encontró contenido para ${this.currentModule}`, 'warning');
      }
    } catch (error) {
      console.error(`[ModulesViewController] Failed to load ${this.currentModule}:`, error);
      this.showNotification('Error al cargar el contenido del módulo', 'error');
    }
  }

  /**
   * Render the current module content
   */
  async renderCurrentModule() {
    // Use the modules-grid container for module content as well
    const contentContainer = this.findElement('.modules-grid');
    if (!contentContainer || !this.moduleContent) return;

    try {
      // Clear existing content
      contentContainer.innerHTML = '';
      
      // Create module content wrapper
      const moduleWrapper = this.createElement('div', ['module-content-wrapper']);
      
      // Add back button
      const backButton = this.createElement('button', ['btn', 'btn-secondary', 'back-button']);
      backButton.innerHTML = '← Volver a Módulos';
      backButton.addEventListener('click', () => {
        this.currentModule = null;
        this.renderModuleGrid();
      });
      moduleWrapper.appendChild(backButton);
      
      // Render module overview (now async due to video content)
      const overviewSection = await this.createModuleOverview();
      moduleWrapper.appendChild(overviewSection);
      
      // Render lessons list
      const lessonsSection = this.createLessonsSection();
      moduleWrapper.appendChild(lessonsSection);
      
      // Render module activities
      const activitiesSection = this.createActivitiesSection();
      moduleWrapper.appendChild(activitiesSection);
      
      contentContainer.appendChild(moduleWrapper);
      
    } catch (error) {
      console.error('[ModulesViewController] Failed to render module:', error);
      contentContainer.innerHTML = '<div class="error-message">Error al cargar el contenido</div>';
    }
  }

  /**
   * Create module overview section
   */
  async createModuleOverview() {
    const section = this.createElement('section', ['module-overview']);
    
    const title = this.createElement('h2', ['module-title']);
    title.textContent = this.moduleContent.title || `Módulo ${this.currentModule.slice(-1)}`;
    
    const description = this.createElement('p', ['module-description']);
    description.textContent = this.moduleContent.description || 'Descripción del módulo';
    
    const metadata = this.createElement('div', ['module-metadata']);
    metadata.innerHTML = `
      <span class="duration">⏱️ ${this.moduleContent.duration || 'N/A'}</span>
      <span class="level">📊 ${this.moduleContent.competencyLevel || 'Nivel 5'}</span>
      ${this.moduleContent.element ? `<span class="element">🎯 ${this.moduleContent.element}</span>` : ''}
    `;
    
    section.appendChild(title);
    section.appendChild(description);
    section.appendChild(metadata);

    // Add module intro video if available
    if (this.moduleContent.overview && this.moduleContent.overview.media && this.moduleContent.overview.media.introVideo) {
      const videoSection = await this.createVideoSection(this.moduleContent.overview.media);
      if (videoSection) {
        section.appendChild(videoSection);
      }
    }
    
    return section;
  }

  /**
   * Create lessons section
   */
  createLessonsSection() {
    const section = this.createElement('section', ['lessons-section']);
    
    const title = this.createElement('h3', ['section-title']);
    title.textContent = 'Lecciones';
    section.appendChild(title);
    
    const lessonsList = this.createElement('div', ['lessons-list']);
    
    if (this.moduleContent.lessons) {
      // Handle both array and object formats
      if (Array.isArray(this.moduleContent.lessons)) {
        this.moduleContent.lessons.forEach((lesson, index) => {
          const lessonCard = this.createLessonCard(lesson.id || `lesson${index + 1}`, lesson);
          lessonsList.appendChild(lessonCard);
        });
      } else {
        Object.entries(this.moduleContent.lessons).forEach(([lessonId, lesson]) => {
          const lessonCard = this.createLessonCard(lessonId, lesson);
          lessonsList.appendChild(lessonCard);
        });
      }
    }
    
    section.appendChild(lessonsList);
    return section;
  }

  /**
   * Create lesson card
   */
  createLessonCard(lessonId, lesson) {
    const card = this.createElement('div', ['lesson-card']);
    card.setAttribute('data-lesson', lessonId);
    
    // Progress indicator
    const progressIndicator = this.createElement('div', ['lesson-progress']);
    const isCompleted = this.isLessonCompleted(lessonId);
    progressIndicator.innerHTML = isCompleted ? '✅' : '⏳';
    
    // Video indicator if lesson has video content
    const hasVideo = lesson.videoId || (lesson.media && (lesson.media.introVideo || lesson.media.lessonVideo || lesson.media.ethicsVideo || lesson.media.skillsVideo));
    if (hasVideo) {
      const videoIndicator = this.createElement('div', ['video-indicator']);
      videoIndicator.innerHTML = '🎥';
      videoIndicator.title = 'Esta lección incluye contenido en video';
      card.appendChild(videoIndicator);
    }
    
    // Lesson type indicator
    const typeIndicator = this.createElement('div', ['lesson-type']);
    const typeIcon = lesson.type === 'practice' ? '💪' : (lesson.type === 'theory' ? '📚' : '📝');
    typeIndicator.innerHTML = typeIcon;
    typeIndicator.title = lesson.type === 'practice' ? 'Práctica' : (lesson.type === 'theory' ? 'Teoría' : 'Evaluación');
    
    // Lesson info
    const info = this.createElement('div', ['lesson-info']);
    info.innerHTML = `
      <h4 class="lesson-title">${lesson.title}</h4>
      <p class="lesson-overview">${lesson.description || lesson.overview || ''}</p>
      <div class="lesson-metadata">
        <span class="lesson-duration">🕒 ${lesson.duration || 'N/A'}</span>
        <span class="lesson-type-badge">${typeIcon} ${lesson.type === 'practice' ? 'Práctica' : (lesson.type === 'theory' ? 'Teoría' : 'Evaluación')}</span>
        ${hasVideo ? '<span class="video-badge">🎥 Con Video</span>' : ''}
      </div>
    `;
    
    // Action button
    const actionButton = this.createElement('button', ['btn', 'btn-primary']);
    actionButton.textContent = isCompleted ? 'Revisar' : 'Comenzar';
    actionButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showLesson(lessonId);
    });
    
    card.appendChild(progressIndicator);
    card.appendChild(typeIndicator);
    card.appendChild(info);
    card.appendChild(actionButton);
    
    // Make card clickable
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        this.showLesson(lessonId);
      }
    });
    
    return card;
  }

  /**
   * Create activities section
   */
  createActivitiesSection() {
    const section = this.createElement('section', ['activities-section']);
    
    const title = this.createElement('h3', ['section-title']);
    title.textContent = 'Actividades y Recursos';
    section.appendChild(title);
    
    const activitiesList = this.createElement('div', ['activities-list']);
    
    // Assessment activity
    const assessmentCard = this.createActivityCard(
      'assessment',
      'Evaluación de Conocimientos',
      'Prueba tus conocimientos con preguntas de opción múltiple',
      'quiz'
    );
    
    // Templates activity
    const templatesCard = this.createActivityCard(
      'templates',
      'Plantillas de Documentos',
      'Accede a las plantillas oficiales del módulo',
      'documents'
    );
    
    activitiesList.appendChild(assessmentCard);
    activitiesList.appendChild(templatesCard);
    
    section.appendChild(activitiesList);
    return section;
  }

  /**
   * Create activity card
   */
  createActivityCard(activityType, title, description, icon) {
    const card = this.createElement('div', ['activity-card']);
    card.setAttribute('data-activity', activityType);
    
    const iconElement = this.createElement('div', ['activity-icon']);
    iconElement.textContent = this.getActivityIcon(icon);
    
    const info = this.createElement('div', ['activity-info']);
    info.innerHTML = `
      <h4 class="activity-title">${title}</h4>
      <p class="activity-description">${description}</p>
    `;
    
    const actionButton = this.createElement('button', ['btn', 'btn-outline']);
    actionButton.textContent = 'Acceder';
    actionButton.addEventListener('click', () => {
      this.handleActivityAction(activityType);
    });
    
    card.appendChild(iconElement);
    card.appendChild(info);
    card.appendChild(actionButton);
    
    return card;
  }

  /**
   * Get icon for activity type
   */
  getActivityIcon(iconType) {
    const icons = {
      quiz: '📝',
      documents: '📄',
      simulation: '🎭',
      video: '🎥',
      reading: '📚'
    };
    return icons[iconType] || '📋';
  }

  /**
   * Render lesson content
   */
  async renderLessonContent(lessonId, lessonData) {
    // Use the modules-grid container for lesson content
    const contentContainer = this.findElement('.modules-grid');
    if (!contentContainer) return;

    try {
      // Clear existing content
      contentContainer.innerHTML = '';
      
      // Create lesson content wrapper
      const lessonWrapper = this.createElement('div', ['lesson-content-wrapper']);
      
      // Add navigation breadcrumb
      const breadcrumb = this.createElement('div', ['lesson-breadcrumb']);
      breadcrumb.innerHTML = `
        <button class="btn btn-link" data-action="back-to-modules">Módulos</button>
        <span class="breadcrumb-separator">></span>
        <button class="btn btn-link" data-action="back-to-module">${this.moduleContent.title}</button>
        <span class="breadcrumb-separator">></span>
        <span class="current-lesson">${lessonData.title}</span>
      `;
      lessonWrapper.appendChild(breadcrumb);
      
      // Add lesson header
      const lessonHeader = this.createLessonHeader(lessonData);
      lessonWrapper.appendChild(lessonHeader);

      // Add lesson progress indicator
      const progressSection = this.createLessonProgressSection(lessonId);
      lessonWrapper.appendChild(progressSection);

      // Render video content if available
      if (lessonData.videoId) {
        const videoSection = await this.createLessonVideoSection(lessonData);
        if (videoSection) {
          lessonWrapper.appendChild(videoSection);
        }
      }
      
      // Render lesson content sections
      if (lessonData.content) {
        const contentSection = this.createLessonContentSection(lessonData.content);
        lessonWrapper.appendChild(contentSection);
      }

      // Add lesson activities
      const activitiesSection = this.createLessonActivitiesSection(lessonId, lessonData);
      lessonWrapper.appendChild(activitiesSection);

      // Add lesson navigation (previous/next)
      const navigationSection = this.createLessonNavigationSection(lessonId);
      lessonWrapper.appendChild(navigationSection);
      
      contentContainer.appendChild(lessonWrapper);
      
      // Bind navigation events
      this.bindLessonNavigationEvents();
      
    } catch (error) {
      console.error('[ModulesViewController] Failed to render lesson:', error);
      contentContainer.innerHTML = '<div class="error-message">Error al cargar la lección</div>';
    }
  }

  /**
   * Create lesson progress section
   */
  createLessonProgressSection(lessonId) {
    const section = this.createElement('div', ['lesson-progress-section']);
    
    const progressService = this.getService('ProgressService');
    const progress = progressService ? progressService.getLessonProgress(this.currentModule, lessonId) : 0;
    const isCompleted = this.isLessonCompleted(lessonId);
    
    section.innerHTML = `
      <div class="lesson-progress-bar">
        <div class="progress-label">Progreso de la lección</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="progress-text">${progress}% completado</div>
      </div>
      <div class="lesson-status ${isCompleted ? 'completed' : 'in-progress'}">
        ${isCompleted ? '✅ Completado' : '⏳ En progreso'}
      </div>
    `;
    
    return section;
  }

  /**
   * Create lesson video section
   */
  async createLessonVideoSection(lessonData) {
    if (!lessonData.videoId) return null;
    
    const section = this.createElement('div', ['lesson-video-section']);
    
    const videoIntro = this.createElement('div', ['lesson-video-introduction']);
    videoIntro.innerHTML = `
      <h4>🎥 Video de la Lección</h4>
      <p>${lessonData.title}</p>
    `;
    
    const videoContainer = this.createElement('div', ['lesson-video-player']);
    videoContainer.id = `video-player-${lessonData.id}`;
    
    section.appendChild(videoIntro);
    section.appendChild(videoContainer);
    
    // Initialize video player
    setTimeout(() => {
      this.initializeVideoPlayer(videoContainer, {
        videoId: lessonData.videoId,
        title: lessonData.title,
        id: lessonData.id
      });
    }, 100);
    
    return section;
  }

  /**
   * Create lesson content section
   */
  createLessonContentSection(contentData) {
    const section = this.createElement('div', ['lesson-content-section']);
    
    if (Array.isArray(contentData)) {
      contentData.forEach(item => {
        const contentItem = this.createElement('div', ['content-item']);
        contentItem.innerHTML = `
          <h4>${item.title || ''}</h4>
          <p>${item.text || ''}</p>
        `;
        section.appendChild(contentItem);
      });
    } else if (typeof contentData === 'object') {
      Object.entries(contentData).forEach(([key, item]) => {
        const contentItem = this.createElement('div', ['content-item']);
        contentItem.innerHTML = `
          <h4>${item.title || key}</h4>
          <p>${item.text || ''}</p>
        `;
        section.appendChild(contentItem);
      });
    }
    
    return section;
  }

  /**
   * Create lesson activities section
   */
  createLessonActivitiesSection(lessonId, lessonData) {
    const section = this.createElement('div', ['lesson-activities-section']);
    
    const title = this.createElement('h3');
    title.textContent = 'Actividades de la Lección';
    section.appendChild(title);
    
    const activitiesList = this.createElement('div', ['activities-list']);
    
    // Knowledge check activity
    const knowledgeCheck = this.createElement('div', ['activity-card']);
    knowledgeCheck.innerHTML = `
      <div class="activity-icon">📝</div>
      <div class="activity-info">
        <h4>Verificación de Conocimientos</h4>
        <p>Responde algunas preguntas sobre el contenido de esta lección</p>
      </div>
      <button class="btn btn-primary" data-action="start-quiz" data-lesson="${lessonId}">Iniciar Quiz</button>
    `;
    
    // Notes activity
    const notesActivity = this.createElement('div', ['activity-card']);
    notesActivity.innerHTML = `
      <div class="activity-icon">📓</div>
      <div class="activity-info">
        <h4>Tomar Notas</h4>
        <p>Anota tus reflexiones y puntos importantes de la lección</p>
      </div>
      <button class="btn btn-secondary" data-action="take-notes" data-lesson="${lessonId}">Abrir Notas</button>
    `;
    
    activitiesList.appendChild(knowledgeCheck);
    activitiesList.appendChild(notesActivity);
    section.appendChild(activitiesList);
    
    return section;
  }

  /**
   * Create lesson navigation section
   */
  createLessonNavigationSection(lessonId) {
    const section = this.createElement('div', ['lesson-navigation-section']);
    
    const prevLesson = this.getPreviousLesson(lessonId);
    const nextLesson = this.getNextLesson(lessonId);
    
    const navigation = this.createElement('div', ['lesson-navigation']);
    
    // Previous lesson button
    if (prevLesson) {
      const prevButton = this.createElement('button', ['btn', 'btn-secondary', 'prev-lesson']);
      prevButton.innerHTML = `← ${prevLesson.title}`;
      prevButton.addEventListener('click', () => this.showLesson(prevLesson.id));
      navigation.appendChild(prevButton);
    }
    
    // Complete lesson button
    const completeButton = this.createElement('button', ['btn', 'btn-success', 'complete-lesson']);
    completeButton.innerHTML = '✅ Marcar como Completado';
    completeButton.addEventListener('click', () => this.completeLessonAndNext());
    navigation.appendChild(completeButton);
    
    // Next lesson button
    if (nextLesson) {
      const nextButton = this.createElement('button', ['btn', 'btn-primary', 'next-lesson']);
      nextButton.innerHTML = `${nextLesson.title} →`;
      nextButton.addEventListener('click', () => this.showLesson(nextLesson.id));
      navigation.appendChild(nextButton);
    }
    
    section.appendChild(navigation);
    return section;
  }

  /**
   * Get previous lesson
   */
  getPreviousLesson(currentLessonId) {
    if (!this.moduleContent.lessons) return null;
    
    const lessons = Array.isArray(this.moduleContent.lessons) 
      ? this.moduleContent.lessons 
      : Object.values(this.moduleContent.lessons);
    
    const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);
    return currentIndex > 0 ? lessons[currentIndex - 1] : null;
  }

  /**
   * Get next lesson
   */
  getNextLesson(currentLessonId) {
    if (!this.moduleContent.lessons) return null;
    
    const lessons = Array.isArray(this.moduleContent.lessons) 
      ? this.moduleContent.lessons 
      : Object.values(this.moduleContent.lessons);
    
    const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);
    return currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  }

  /**
   * Bind lesson navigation events
   */
  bindLessonNavigationEvents() {
    // Breadcrumb navigation
    this.findElements('[data-action="back-to-modules"]').forEach(button => {
      button.addEventListener('click', () => {
        this.currentModule = null;
        this.currentLesson = null;
        this.renderModuleGrid();
      });
    });

    this.findElements('[data-action="back-to-module"]').forEach(button => {
      button.addEventListener('click', () => {
        this.currentLesson = null;
        this.renderCurrentModule();
      });
    });

    // Activity buttons
    this.findElements('[data-action="start-quiz"]').forEach(button => {
      button.addEventListener('click', () => {
        const lessonId = button.dataset.lesson;
        this.startLessonQuiz(lessonId);
      });
    });

    this.findElements('[data-action="take-notes"]').forEach(button => {
      button.addEventListener('click', () => {
        const lessonId = button.dataset.lesson;
        this.openLessonNotes(lessonId);
      });
    });
  }

  /**
   * Start lesson quiz
   */
  startLessonQuiz(lessonId) {
    this.showNotification('Quiz de lección en desarrollo', 'info');
    // TODO: Implement lesson quiz functionality
  }

  /**
   * Open lesson notes
   */
  openLessonNotes(lessonId) {
    this.showNotification('Sistema de notas en desarrollo', 'info');
    // TODO: Implement lesson notes functionality
  }

  /**
   * Initialize video player for lesson content
   */
  async initializeVideoPlayer(container, videoData) {
    try {
      // Get MediaRenderer for video initialization
      const mediaRenderer = this.getModule('mediaRenderer');
      if (!mediaRenderer) {
        console.warn('[ModulesViewController] MediaRenderer not available for video');
        this.showVideoFallback(container, videoData);
        return;
      }

      // Create video configuration
      const videoConfig = {
        id: videoData.videoId,
        title: videoData.title,
        type: 'youtube',
        placement: 'lesson_content'
      };

      // Create video element
      const videoElement = await mediaRenderer.createMediaFromSection(videoConfig);
      if (videoElement) {
        container.appendChild(videoElement);
        console.log('[ModulesViewController] Video player initialized for lesson:', videoData.title);
      } else {
        this.showVideoFallback(container, videoData);
      }
    } catch (error) {
      console.error('[ModulesViewController] Failed to initialize video player:', error);
      this.showVideoFallback(container, videoData);
    }
  }

  /**
   * Show video fallback content
   */
  showVideoFallback(container, videoData) {
    if (!container) return;

    container.innerHTML = `
      <div class="video-fallback">
        <div class="video-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon">🎥</div>
            <h4>Video temporalmente no disponible</h4>
            <p>El contenido del video "${videoData.title}" estará disponible próximamente.</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create lesson header
   */
  createLessonHeader(lessonContent) {
    const header = this.createElement('div', ['lesson-header']);
    
    const title = this.createElement('h2', ['lesson-title']);
    title.textContent = lessonContent.title;
    
    const overview = this.createElement('p', ['lesson-overview']);
    overview.textContent = lessonContent.overview || '';
    
    const metadata = this.createElement('div', ['lesson-metadata']);
    metadata.innerHTML = `
      <span class="duration">⏱️ ${lessonContent.duration || 'N/A'}</span>
      <span class="module">${this.currentModule.toUpperCase()}</span>
    `;
    
    header.appendChild(title);
    header.appendChild(overview);
    header.appendChild(metadata);
    
    return header;
  }

  /**
   * Create video section from media content
   */
  async createVideoSection(mediaContent) {
    if (!mediaContent) return null;

    const mediaRenderer = this.getModule('mediaRenderer');
    if (!mediaRenderer) {
      console.warn('[ModulesViewController] MediaRenderer not available');
      return null;
    }

    const videoSection = this.createElement('section', ['video-section']);
    
    // Handle different video types
    for (const [mediaKey, mediaData] of Object.entries(mediaContent)) {
      if (mediaData && mediaData.type === 'youtube') {
        try {
          const videoElement = await mediaRenderer.createMediaFromSection(mediaData);
          videoSection.appendChild(videoElement);
          break; // Only show first video found
        } catch (error) {
          console.error('[ModulesViewController] Failed to create video element:', error);
        }
      }
    }

    return videoSection.children.length > 0 ? videoSection : null;
  }

  /**
   * Create objectives section
   */
  createObjectivesSection(objectives) {
    const section = this.createElement('section', ['objectives-section']);
    
    const title = this.createElement('h3', ['section-title']);
    title.textContent = 'Objetivos de Aprendizaje';
    
    const list = this.createElement('ul', ['objectives-list']);
    objectives.forEach(objective => {
      const item = this.createElement('li', ['objective-item']);
      item.textContent = objective;
      list.appendChild(item);
    });
    
    section.appendChild(title);
    section.appendChild(list);
    
    return section;
  }

  /**
   * Create activities section for lessons
   */
  createLessonActivitiesSection(activities) {
    const section = this.createElement('section', ['lesson-activities-section']);
    
    const title = this.createElement('h3', ['section-title']);
    title.textContent = 'Actividades de la Lección';
    
    const activitiesList = this.createElement('div', ['lesson-activities-list']);
    
    activities.forEach(activity => {
      const activityCard = this.createElement('div', ['activity-card']);
      activityCard.innerHTML = `
        <div class="activity-header">
          <h4 class="activity-title">${activity.title}</h4>
          <span class="activity-type">${activity.type}</span>
        </div>
        <p class="activity-description">${activity.description}</p>
        <button class="btn btn-outline activity-btn">Realizar Actividad</button>
      `;
      activitiesList.appendChild(activityCard);
    });
    
    section.appendChild(title);
    section.appendChild(activitiesList);
    
    return section;
  }

  /**
   * Create content section
   */
  createContentSection(sectionId, section) {
    const sectionElement = this.createElement('section', ['content-section']);
    sectionElement.setAttribute('data-section', sectionId);
    
    if (section.title) {
      const title = this.createElement('h3', ['section-title']);
      title.textContent = section.title;
      sectionElement.appendChild(title);
    }
    
    if (section.text) {
      const text = this.createElement('p', ['section-text']);
      text.textContent = section.text;
      sectionElement.appendChild(text);
    }
    
    if (section.keyPoints) {
      const pointsList = this.createElement('ul', ['key-points']);
      section.keyPoints.forEach(point => {
        const listItem = this.createElement('li');
        listItem.textContent = point;
        pointsList.appendChild(listItem);
      });
      sectionElement.appendChild(pointsList);
    }
    
    if (section.timeline) {
      const timeline = this.createTimeline(section.timeline);
      sectionElement.appendChild(timeline);
    }
    
    return sectionElement;
  }

  /**
   * Create timeline component
   */
  createTimeline(timelineData) {
    const timeline = this.createElement('div', ['timeline']);
    
    timelineData.forEach(item => {
      const timelineItem = this.createElement('div', ['timeline-item']);
      timelineItem.innerHTML = `
        <div class="timeline-period">${item.period}</div>
        <div class="timeline-description">${item.description}</div>
      `;
      timeline.appendChild(timelineItem);
    });
    
    return timeline;
  }

  /**
   * Update module navigation
   */
  updateModuleNavigation() {
    this.findElements('.module-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeItem = this.findElement(`[data-module="${this.currentModule}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  /**
   * Update lesson navigation
   */
  updateLessonNavigation() {
    this.findElements('.lesson-item').forEach(item => {
      item.classList.remove('active');
    });
    
    if (this.currentLesson) {
      const activeLesson = this.findElement(`[data-lesson="${this.currentLesson}"]`);
      if (activeLesson) {
        activeLesson.classList.add('active');
      }
    }
  }

  /**
   * Update progress indicators
   */
  updateProgressIndicators() {
    const progressService = this.getService('ProgressService');
    if (!progressService) return;
    
    // Update module progress bars
    this.findElements('.module-progress-bar').forEach(bar => {
      const moduleId = bar.getAttribute('data-module');
      if (moduleId) {
        const progress = progressService.getModuleProgress(moduleId);
        bar.style.width = `${progress}%`;
      }
    });
  }

  /**
   * Handle content action buttons
   */
  handleContentAction(action, button) {
    switch (action) {
      case 'next-lesson':
        this.goToNextLesson();
        break;
      case 'prev-lesson':
        this.goToPreviousLesson();
        break;
      case 'complete-lesson':
        this.completeLessonAndNext();
        break;
      case 'bookmark':
        this.bookmarkContent();
        break;
      case 'take-notes':
        this.openNotesDialog();
        break;
      default:
        console.warn('[ModulesViewController] Unknown action:', action);
    }
  }

  /**
   * Handle activity actions
   */
  handleActivityAction(activityType) {
    switch (activityType) {
      case 'assessment':
        this.emit('app:view-change', { view: 'assessment' });
        break;
      case 'templates':
        this.emit('app:view-change', { view: 'portfolio' });
        break;
      case 'simulation':
        this.openSimulation();
        break;
      default:
        console.warn('[ModulesViewController] Unknown activity:', activityType);
    }
  }

  /**
   * Check if lesson is completed
   */
  isLessonCompleted(lessonId) {
    const progressService = this.getService('ProgressService');
    if (!progressService) return false;
    
    return progressService.isLessonCompleted(this.currentModule, lessonId);
  }

  /**
   * Track lesson progress
   */
  trackLessonProgress(lessonId) {
    const progressService = this.getService('ProgressService');
    if (progressService) {
      progressService.markLessonStarted(this.currentModule, lessonId);
    }
  }

  /**
   * Go to next lesson
   */
  goToNextLesson() {
    // Implementation for lesson navigation
    this.showNotification('Navegación de lecciones en desarrollo', 'info');
  }

  /**
   * Go to previous lesson
   */
  goToPreviousLesson() {
    // Implementation for lesson navigation
    this.showNotification('Navegación de lecciones en desarrollo', 'info');
  }

  /**
   * Complete lesson and go to next
   */
  completeLessonAndNext() {
    if (this.currentLesson) {
      const progressService = this.getService('ProgressService');
      if (progressService) {
        progressService.markLessonCompleted(this.currentModule, this.currentLesson);
        this.showNotification('¡Lección completada!', 'success');
        this.goToNextLesson();
      }
    }
  }

  /**
   * Bookmark current content
   */
  bookmarkContent() {
    this.showNotification('Marcadores en desarrollo', 'info');
  }

  /**
   * Open notes dialog
   */
  openNotesDialog() {
    this.showNotification('Sistema de notas en desarrollo', 'info');
  }

  /**
   * Open simulation
   */
  openSimulation() {
    this.showNotification('Simulaciones en desarrollo', 'info');
  }

  /**
   * Show specific section within modules view
   */
  async showSection(sectionId) {
    if (sectionId.startsWith('module')) {
      await this.showModule(sectionId);
    } else if (sectionId === 'overview') {
      this.currentModule = null;
      await this.renderModuleGrid();
    }
  }

  /**
   * Render module overview grid
   */
  async renderModuleGrid() {
    const modulesGrid = this.findElement('.modules-grid');
    if (!modulesGrid) {
      console.warn('[ModulesViewController] Module grid container not found');
      return;
    }

    try {
      // Get progress service for dynamic progress data
      const progressService = this.getService('ProgressService');
      
      // Get ContentEngine for module data
      const contentEngine = this.getModule('contentEngine') || this.app.modules?.get('contentEngine');
      
      // Module definitions with enhanced data
      const moduleDefinitions = [
        {
          id: 'module1',
          number: 1,
          title: 'Fundamentos de Consultoría',
          description: 'Conceptos básicos, ética y habilidades interpersonales necesarias para la consultoría profesional.',
          icon: '🎯',
          lessons: 3,
          color: 'green',
          duration: '2-3 horas',
          competencyLevel: 'Nivel 5'
        },
        {
          id: 'module2',
          number: 2,
          title: 'Identificación del Problema',
          description: 'Elemento 1: Técnicas de entrevista, cuestionarios e investigación de campo para identificar situaciones problemáticas.',
          icon: '🔍',
          templates: 8,
          color: 'blue',
          duration: '4-5 horas',
          competencyLevel: 'Nivel 5'
        },
        {
          id: 'module3',
          number: 3,
          title: 'Desarrollo de Soluciones',
          description: 'Elemento 2: Análisis de impacto y diseño de soluciones efectivas con justificación costo-beneficio.',
          icon: '💡',
          templates: 2,
          color: 'purple',
          duration: '3-4 horas',
          competencyLevel: 'Nivel 5'
        },
        {
          id: 'module4',
          number: 4,
          title: 'Presentación de Propuestas',
          description: 'Elemento 3: Preparación y presentación profesional de propuestas de solución.',
          icon: '📋',
          templates: 5,
          color: 'orange',
          duration: '3-4 horas',
          competencyLevel: 'Nivel 5'
        }
      ];

      // Get dynamic progress data
      const modules = moduleDefinitions.map(module => {
        let status = 'available';
        let progress = 0;
        let isUnlocked = true;
        
        if (progressService) {
          status = progressService.getModuleStatus(module.id) || 'available';
          progress = progressService.calculateModuleProgress(module.id) || 0;
          isUnlocked = progressService.isModuleUnlocked(module.id);
        }
        
        // Module 1 is always unlocked, others depend on previous module completion
        if (module.number === 1) {
          isUnlocked = true;
        } else if (progressService) {
          const previousModuleId = `module${module.number - 1}`;
          isUnlocked = progressService.isModuleCompleted(previousModuleId);
        }
        
        return { ...module, status, progress, isUnlocked };
      });

      // Render module grid
      modulesGrid.innerHTML = modules.map(module => this.createModuleCard(module)).join('');
      
      // Add click handlers for module cards
      this.bindModuleCardEvents();
      
      console.log('[ModulesViewController] Module grid rendered with', modules.length, 'modules');
    } catch (error) {
      console.error('[ModulesViewController] Failed to render module grid:', error);
      modulesGrid.innerHTML = '<div class="error-message">Error al cargar los módulos</div>';
    }
  }

  /**
   * Create module card HTML
   */
  createModuleCard(module) {
    const statusInfo = this.getModuleStatusInfo(module.status, module.isUnlocked);
    const resourceText = module.lessons ? `${module.lessons} lecciones` : `${module.templates} plantillas`;
    
    return `
      <div class="module-card module-${module.number} ${module.isUnlocked ? '' : 'locked'}" data-module="${module.number}">
        <div class="module-header">
          <div class="module-icon ${module.color}">${module.icon}</div>
          <div class="module-status ${module.status}"></div>
          ${!module.isUnlocked ? '<div class="lock-overlay">🔒</div>' : ''}
        </div>
        <div class="module-content">
          <h3 class="module-title">Módulo ${module.number}: ${module.title}</h3>
          <p class="module-description">${module.description}</p>
          <div class="module-metadata">
            <span class="duration">⏱️ ${module.duration}</span>
            <span class="level">📊 ${module.competencyLevel}</span>
          </div>
          <div class="module-stats">
            <span>${resourceText}</span>
            <span class="status-text ${statusInfo.class}">
              ${statusInfo.text}
            </span>
          </div>
          <div class="module-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${module.progress}%"></div>
            </div>
            <span class="progress-text">${module.progress}% completado</span>
          </div>
          <div class="module-actions">
            ${this.getModuleActionButton(module)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get module status information
   */
  getModuleStatusInfo(status, isUnlocked) {
    if (!isUnlocked) {
      return { text: 'Bloqueado', class: 'text-secondary' };
    }
    
    switch (status) {
      case 'completed':
        return { text: 'Completado', class: 'text-success' };
      case 'in_progress':
        return { text: 'En progreso', class: 'text-warning' };
      case 'available':
      default:
        return { text: 'Disponible', class: 'text-info' };
    }
  }

  /**
   * Get module action button
   */
  getModuleActionButton(module) {
    if (!module.isUnlocked) {
      return '<button class="btn btn-secondary" disabled>🔒 Bloqueado</button>';
    }
    
    switch (module.status) {
      case 'completed':
        return `<button class="btn btn-outline" data-action="enter-module" data-module="${module.id}">Revisar</button>`;
      case 'in_progress':
        return `<button class="btn btn-primary" data-action="enter-module" data-module="${module.id}">Continuar</button>`;
      case 'available':
      default:
        return `<button class="btn btn-primary" data-action="enter-module" data-module="${module.id}">Comenzar</button>`;
    }
  }

  /**
   * Bind module card click events
   */
  bindModuleCardEvents() {
    // Module card clicks
    this.findElements('.module-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking on button
        if (e.target.closest('button')) return;
        
        const moduleNum = card.dataset.module;
        if (moduleNum && !card.classList.contains('locked')) {
          this.showModule(`module${moduleNum}`);
        }
      });
    });

    // Action buttons
    this.findElements('[data-action="enter-module"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const moduleId = button.dataset.module;
        if (moduleId) {
          this.showModule(moduleId);
        }
      });
    });
  }

  onLanguageUpdate() {
    super.onLanguageUpdate();
    
    // Reload content in new language
    this.loadModuleContent().then(() => {
      this.renderCurrentModule();
    });
  }
}

export default ModulesViewController;