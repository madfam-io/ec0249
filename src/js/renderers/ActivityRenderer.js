/**
 * Activity Renderer - Handles rendering of learning activities and assessments
 * Extracted from ContentEngine for better modularity
 */
import { eventBus } from '../core/EventBus.js';

class ActivityRenderer {
  constructor(i18n) {
    this.i18n = i18n;
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
   * Create activities section
   * @param {Array} activities - Learning activities
   * @returns {HTMLElement} Activities section
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

      // Add click listener
      const button = activityCard.querySelector('.start-activity');
      button.addEventListener('click', () => {
        this.handleActivityStart(activity);
      });

      activitiesContainer.appendChild(activityCard);
    });

    section.appendChild(activitiesContainer);
    return section;
  }

  /**
   * Create assessment section
   * @param {Object} assessment - Assessment data
   * @returns {HTMLElement} Assessment section
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

    // Add click listener
    const button = assessmentCard.querySelector('.start-assessment');
    button.addEventListener('click', () => {
      this.handleAssessmentStart(assessment);
    });

    section.appendChild(assessmentCard);
    return section;
  }

  /**
   * Create content navigation
   * @param {Object} content - Content data
   * @returns {HTMLElement} Navigation element
   */
  createContentNavigation(content) {
    const nav = document.createElement('nav');
    nav.className = 'content-navigation';

    const navContainer = document.createElement('div');
    navContainer.className = 'nav-container';

    // Previous/Next buttons
    const prevButton = document.createElement('button');
    prevButton.className = 'nav-button nav-previous';
    prevButton.innerHTML = '← Anterior';
    prevButton.addEventListener('click', () => {
      this.handleNavigationClick('previous', content);
    });

    const nextButton = document.createElement('button');
    nextButton.className = 'nav-button nav-next';
    nextButton.innerHTML = 'Siguiente →';
    nextButton.addEventListener('click', () => {
      this.handleNavigationClick('next', content);
    });

    // Progress indicator
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = `${content.progress || 0}%`;
    
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);

    const progressText = document.createElement('span');
    progressText.className = 'progress-text';
    progressText.textContent = `${content.progress || 0}% completado`;
    progressContainer.appendChild(progressText);

    navContainer.appendChild(prevButton);
    navContainer.appendChild(progressContainer);
    navContainer.appendChild(nextButton);
    nav.appendChild(navContainer);

    return nav;
  }

  /**
   * Handle activity start
   * @param {Object} activity - Activity data
   */
  handleActivityStart(activity) {
    eventBus.publish('activity:start', {
      activityType: activity.type,
      activityId: activity.id || activity.type,
      activityData: activity
    });
  }

  /**
   * Handle assessment start
   * @param {Object} assessment - Assessment data
   */
  handleAssessmentStart(assessment) {
    eventBus.publish('assessment:start', {
      assessmentType: assessment.type,
      assessmentId: assessment.id || assessment.type,
      assessmentData: assessment
    });
  }

  /**
   * Handle navigation click
   * @param {string} direction - Navigation direction
   * @param {Object} content - Content data
   */
  handleNavigationClick(direction, content) {
    eventBus.publish('content:navigate', {
      direction,
      contentId: content.id,
      currentProgress: content.progress || 0
    });
  }

  /**
   * Get activity icon
   * @param {string} type - Activity type
   * @returns {string} Icon emoji
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

  /**
   * Get assessment type label
   * @param {string} type - Assessment type
   * @returns {string} Label
   */
  getAssessmentTypeLabel(type) {
    const labels = {
      quiz: 'Cuestionario',
      scenario_based: 'Basado en Escenarios',
      practical: 'Evaluación Práctica'
    };
    return labels[type] || 'Evaluación';
  }

  /**
   * Update progress display
   * @param {HTMLElement} container - Container element
   * @param {number} progress - Progress percentage
   */
  updateProgress(container, progress) {
    const progressFill = container.querySelector('.progress-fill');
    const progressText = container.querySelector('.progress-text');
    
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${progress}% completado`;
    }
  }

  /**
   * Show activity completion
   * @param {HTMLElement} container - Container element
   * @param {Object} activity - Activity data
   */
  showActivityCompletion(container, activity) {
    const completionBanner = document.createElement('div');
    completionBanner.className = 'activity-completion';
    completionBanner.innerHTML = `
      <div class="completion-content">
        <span class="completion-icon">✅</span>
        <h4>¡Actividad Completada!</h4>
        <p>Has completado exitosamente: ${activity.title}</p>
      </div>
    `;
    
    container.appendChild(completionBanner);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      completionBanner.remove();
    }, 5000);
  }

  /**
   * Show assessment results
   * @param {HTMLElement} container - Container element
   * @param {Object} results - Assessment results
   */
  showAssessmentResults(container, results) {
    const resultsBanner = document.createElement('div');
    resultsBanner.className = `assessment-results ${results.passed ? 'passed' : 'failed'}`;
    
    const icon = results.passed ? '🎉' : '📚';
    const message = results.passed ? '¡Felicidades!' : 'Continúa estudiando';
    
    resultsBanner.innerHTML = `
      <div class="results-content">
        <span class="results-icon">${icon}</span>
        <h4>${message}</h4>
        <p>Puntuación: ${results.score}% (Mínimo: ${results.passingScore}%)</p>
        ${!results.passed ? '<p>Revisa el material y vuelve a intentarlo.</p>' : ''}
      </div>
    `;
    
    container.appendChild(resultsBanner);
  }
}

export default ActivityRenderer;