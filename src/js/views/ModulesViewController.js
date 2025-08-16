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
    // Get content engine
    this.contentEngine = this.getModule('contentEngine');
    if (!this.contentEngine) {
      console.warn('[ModulesViewController] ContentEngine not available yet - will be available after modules initialization');
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
    // Ensure content is loaded for current module
    await this.loadModuleContent();
  }

  async onRender() {
    // Update module navigation
    this.updateModuleNavigation();
    
    // Render current module content
    await this.renderCurrentModule();
    
    // Update progress indicators
    this.updateProgressIndicators();
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
    this.currentLesson = lessonId;
    
    // Render lesson content
    await this.renderLessonContent(lessonId);
    
    // Update lesson navigation
    this.updateLessonNavigation();
    
    // Track progress
    this.trackLessonProgress(lessonId);
  }

  /**
   * Load content for the current module
   */
  async loadModuleContent() {
    if (!this.contentEngine) return;
    
    try {
      // Load module content from ContentEngine
      const moduleContent = await this.contentEngine.getModuleContent(this.currentModule);
      
      if (moduleContent) {
        this.moduleContent = moduleContent;
      } else {
        console.warn(`[ModulesViewController] No content found for ${this.currentModule}`);
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
    const contentContainer = this.findElement('.module-content');
    if (!contentContainer || !this.moduleContent) return;

    try {
      // Clear existing content
      contentContainer.innerHTML = '';
      
      // Render module overview (now async due to video content)
      const overviewSection = await this.createModuleOverview();
      contentContainer.appendChild(overviewSection);
      
      // Render lessons list
      const lessonsSection = this.createLessonsSection();
      contentContainer.appendChild(lessonsSection);
      
      // Render module activities
      const activitiesSection = this.createActivitiesSection();
      contentContainer.appendChild(activitiesSection);
      
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
      Object.entries(this.moduleContent.lessons).forEach(([lessonId, lesson]) => {
        const lessonCard = this.createLessonCard(lessonId, lesson);
        lessonsList.appendChild(lessonCard);
      });
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
    const hasVideo = lesson.media && (lesson.media.introVideo || lesson.media.lessonVideo || lesson.media.ethicsVideo || lesson.media.skillsVideo);
    if (hasVideo) {
      const videoIndicator = this.createElement('div', ['video-indicator']);
      videoIndicator.innerHTML = '🎥';
      videoIndicator.title = 'Esta lección incluye contenido en video';
      card.appendChild(videoIndicator);
    }
    
    // Lesson info
    const info = this.createElement('div', ['lesson-info']);
    info.innerHTML = `
      <h4 class="lesson-title">${lesson.title}</h4>
      <p class="lesson-overview">${lesson.overview || ''}</p>
      <div class="lesson-metadata">
        <span class="lesson-duration">🕒 ${lesson.duration || 'N/A'}</span>
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
    card.appendChild(info);
    card.appendChild(actionButton);
    
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
  async renderLessonContent(lessonId) {
    const contentContainer = this.findElement('.lesson-content');
    if (!contentContainer) return;

    try {
      const lessonContent = await this.contentEngine.getLessonContent(this.currentModule, lessonId);
      
      if (lessonContent) {
        contentContainer.innerHTML = '';
        
        // Add lesson header
        const lessonHeader = this.createLessonHeader(lessonContent);
        contentContainer.appendChild(lessonHeader);

        // Render video content first if available
        if (lessonContent.media) {
          const videoSection = await this.createVideoSection(lessonContent.media);
          if (videoSection) {
            contentContainer.appendChild(videoSection);
          }
        }
        
        // Render lesson sections
        if (lessonContent.content) {
          Object.entries(lessonContent.content).forEach(([sectionId, section]) => {
            const sectionElement = this.createContentSection(sectionId, section);
            contentContainer.appendChild(sectionElement);
          });
        }

        // Add objectives if available
        if (lessonContent.objectives && lessonContent.objectives.length > 0) {
          const objectivesSection = this.createObjectivesSection(lessonContent.objectives);
          contentContainer.appendChild(objectivesSection);
        }

        // Add activities if available
        if (lessonContent.activities && lessonContent.activities.length > 0) {
          const activitiesSection = this.createLessonActivitiesSection(lessonContent.activities);
          contentContainer.appendChild(activitiesSection);
        }
      }
    } catch (error) {
      console.error('[ModulesViewController] Failed to render lesson:', error);
      contentContainer.innerHTML = '<div class="error-message">Error al cargar la lección</div>';
    }
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
    }
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