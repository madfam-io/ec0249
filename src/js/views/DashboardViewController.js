/**
 * Dashboard View Controller - Manages the main dashboard interface
 * Handles progress display, module overview, and quick navigation
 */
import BaseViewController from './BaseViewController.js';

class DashboardViewController extends BaseViewController {
  constructor(viewId, app) {
    super(viewId, app);
    this.progressData = null;
  }

  async onInitialize() {
    // Load user progress data
    await this.loadProgressData();
  }

  bindEvents() {
    // Module card clicks
    this.findElements('.module-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const moduleId = card.getAttribute('data-module');
        if (moduleId) {
          this.navigateToModule(moduleId);
        }
      });
    });

    // Action button clicks
    this.findElements('[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.getAttribute('data-action');
        this.handleAction(action);
      });
    });

    // Subscribe to progress updates
    this.subscribe('progress:updated', (data) => {
      this.updateProgressDisplay(data);
    });
  }

  async onShow() {
    // Refresh dashboard data when shown
    await this.refreshDashboard();
  }

  async onRender() {
    // Update progress displays
    this.updateOverallProgress();
    this.updateModuleProgress();
    this.updateRecommendations();
  }

  /**
   * Load user progress data
   */
  async loadProgressData() {
    try {
      const progressService = this.getService('ProgressService');
      if (progressService) {
        this.progressData = await progressService.getUserProgress();
      }
    } catch (error) {
      console.error('[DashboardViewController] Failed to load progress data:', error);
    }
  }

  /**
   * Refresh dashboard with latest data
   */
  async refreshDashboard() {
    await this.loadProgressData();
    await this.onRender();
  }

  /**
   * Update overall progress display
   */
  updateOverallProgress() {
    const overallProgressElement = this.findElement('#overallProgress');
    const overallProgressBar = this.findElement('#overallProgressBar');

    if (!this.progressData || !overallProgressElement || !overallProgressBar) return;

    const overallProgress = this.calculateOverallProgress();
    
    overallProgressElement.textContent = `${overallProgress}%`;
    overallProgressBar.style.width = `${overallProgress}%`;
  }

  /**
   * Calculate overall progress percentage
   */
  calculateOverallProgress() {
    if (!this.progressData) return 0;

    const modules = ['module1', 'module2', 'module3', 'module4'];
    let totalProgress = 0;
    let moduleCount = 0;

    modules.forEach(moduleId => {
      if (this.progressData[moduleId]) {
        const moduleProgress = this.calculateModuleProgress(this.progressData[moduleId]);
        totalProgress += moduleProgress;
        moduleCount++;
      }
    });

    return moduleCount > 0 ? Math.round(totalProgress / moduleCount) : 0;
  }

  /**
   * Calculate progress for a single module
   */
  calculateModuleProgress(moduleData) {
    if (!moduleData) return 0;
    
    const theory = moduleData.theory || 0;
    const practice = moduleData.practice || 0;
    const assessment = moduleData.assessment ? 100 : 0;
    
    // Weight: theory 40%, practice 40%, assessment 20%
    return Math.round((theory * 0.4) + (practice * 0.4) + (assessment * 0.2));
  }

  /**
   * Update individual module progress displays
   */
  updateModuleProgress() {
    const moduleCards = this.findElements('.module-card');
    
    moduleCards.forEach(card => {
      const moduleId = `module${card.getAttribute('data-module')}`;
      const progressBar = card.querySelector('.progress-fill');
      const progressText = card.querySelector('.progress-text');
      const statusText = card.querySelector('.status-text');
      
      if (!progressBar || !progressText || !this.progressData) return;
      
      const moduleData = this.progressData[moduleId];
      const progress = this.calculateModuleProgress(moduleData);
      
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${progress}% completado`;
      
      // Update status
      if (statusText) {
        if (progress === 0) {
          statusText.textContent = 'Bloqueado';
          statusText.className = 'status-text text-secondary';
          card.querySelector('.module-status').className = 'module-status locked';
        } else if (progress < 100) {
          statusText.textContent = 'En progreso';
          statusText.className = 'status-text text-warning';
          card.querySelector('.module-status').className = 'module-status available';
        } else {
          statusText.textContent = 'Completado';
          statusText.className = 'status-text text-success';
          card.querySelector('.module-status').className = 'module-status completed';
        }
      }
    });
  }

  /**
   * Update next steps recommendations
   */
  updateRecommendations() {
    const stepsList = this.findElement('.steps-list');
    if (!stepsList || !this.progressData) return;

    const recommendations = this.generateRecommendations();
    
    stepsList.innerHTML = '';
    recommendations.forEach(rec => {
      const stepItem = this.createElement('li', ['step-item']);
      stepItem.innerHTML = `
        <span class="step-icon">${rec.completed ? '✅' : '⏳'}</span>
        <span>${rec.text}</span>
      `;
      stepsList.appendChild(stepItem);
    });
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (!this.progressData) {
      return [
        { completed: false, text: 'Comenzar con el Módulo 1: Fundamentos de Consultoría' },
        { completed: false, text: 'Completar la primera lección introductoria' },
        { completed: false, text: 'Familiarizarse con la plataforma' }
      ];
    }

    const module1Progress = this.calculateModuleProgress(this.progressData.module1);
    const module2Progress = this.calculateModuleProgress(this.progressData.module2);
    
    if (module1Progress === 0) {
      recommendations.push(
        { completed: false, text: 'Comenzar con el Módulo 1: Fundamentos de Consultoría' },
        { completed: false, text: 'Completar la lección de introducción a la consultoría' },
        { completed: false, text: 'Revisar el código de ética y confidencialidad' }
      );
    } else if (module1Progress < 100) {
      recommendations.push(
        { completed: true, text: 'Módulo 1 iniciado correctamente' },
        { completed: false, text: 'Continuar con las lecciones pendientes del Módulo 1' },
        { completed: false, text: 'Completar la evaluación del Módulo 1' }
      );
    } else if (module2Progress === 0) {
      recommendations.push(
        { completed: true, text: 'Módulo 1 completado exitosamente' },
        { completed: false, text: 'Iniciar Módulo 2: Identificación de Problemas' },
        { completed: false, text: 'Familiarizarse con las plantillas de documentos' }
      );
    }

    return recommendations.slice(0, 4); // Limit to 4 recommendations
  }

  /**
   * Handle action button clicks
   */
  handleAction(action) {
    switch (action) {
      case 'continue-learning':
        this.continuelearning();
        break;
      case 'explore-modules':
        this.emit('app:view-change', { view: 'modules' });
        break;
      case 'view-templates':
        this.emit('app:view-change', { view: 'portfolio' });
        break;
      case 'start-simulation':
        this.emit('app:view-change', { view: 'assessment' });
        break;
      case 'view-roadmap':
        this.showRoadmap();
        break;
      case 'show-welcome-video':
        this.showWelcomeVideo();
        break;
      case 'start-learning':
        this.startLearning();
        break;
      case 'continue-module':
        this.continueCurrentModule();
        break;
      default:
        console.warn('[DashboardViewController] Unknown action:', action);
    }
  }

  /**
   * Continue learning based on current progress
   */
  continuelearning() {
    if (!this.progressData) {
      this.navigateToModule('1');
      return;
    }

    const module1Progress = this.calculateModuleProgress(this.progressData.module1);
    const module2Progress = this.calculateModuleProgress(this.progressData.module2);
    
    if (module1Progress < 100) {
      this.navigateToModule('1');
    } else if (module2Progress < 100) {
      this.navigateToModule('2');
    } else {
      this.navigateToModule('3');
    }
  }

  /**
   * Navigate to a specific module
   */
  navigateToModule(moduleId) {
    this.emit('app:view-change', { view: 'modules' });
    setTimeout(() => {
      this.emit('app:section-change', { section: `module${moduleId}` });
    }, 100);
  }

  /**
   * Show learning roadmap
   */
  showRoadmap() {
    this.showNotification('Mapa de ruta en desarrollo', 'info');
  }

  /**
   * Update progress display when progress data changes
   */
  updateProgressDisplay(data) {
    if (data && data.progress) {
      this.progressData = data.progress;
      this.updateOverallProgress();
      this.updateModuleProgress();
      this.updateRecommendations();
    }
  }

  /**
   * Show welcome video modal
   */
  async showWelcomeVideo() {
    try {
      const welcomeVideoData = this.i18n.getTranslation('dashboard.welcomeVideo');
      if (!welcomeVideoData) {
        console.warn('[DashboardViewController] Welcome video data not found');
        return;
      }

      const mediaRenderer = this.getModule('mediaRenderer');
      if (!mediaRenderer) {
        console.warn('[DashboardViewController] MediaRenderer not available');
        return;
      }

      // Create modal for welcome video
      const modal = this.createElement('div', ['modal', 'welcome-video-modal']);
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>Bienvenido a la Plataforma EC0249</h3>
            <button class="modal-close" aria-label="Cerrar">&times;</button>
          </div>
          <div class="modal-body">
            <div id="welcomeVideoContainer"></div>
          </div>
        </div>
      `;

      // Create video element
      const videoContainer = modal.querySelector('#welcomeVideoContainer');
      const videoElement = await mediaRenderer.createMediaFromSection(welcomeVideoData);
      videoContainer.appendChild(videoElement);

      // Add to DOM
      document.body.appendChild(modal);

      // Add event listeners
      const closeButton = modal.querySelector('.modal-close');
      closeButton.addEventListener('click', () => {
        this.closeWelcomeVideo(modal);
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeWelcomeVideo(modal);
        }
      });

      // Show modal
      modal.style.display = 'flex';
      
    } catch (error) {
      console.error('[DashboardViewController] Failed to show welcome video:', error);
    }
  }

  /**
   * Close welcome video modal
   */
  closeWelcomeVideo(modal) {
    if (modal && modal.parentNode) {
      modal.style.display = 'none';
      setTimeout(() => {
        modal.parentNode.removeChild(modal);
      }, 300);
    }
  }

  onLanguageUpdate() {
    super.onLanguageUpdate();
    
    // Update dynamic content that depends on language
    this.updateRecommendations();
  }
}

export default DashboardViewController;