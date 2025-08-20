/**
 * Progress View Controller - Learning Analytics and Progress Tracking
 * 
 * @description Dedicated controller for displaying detailed learning progress,
 * analytics, and certification readiness assessment. Provides comprehensive
 * insights into user performance, achievements, and learning path progression.
 * 
 * @class ProgressViewController
 * @extends BaseViewController
 * 
 * Key Features:
 * - Comprehensive progress analytics and visualization
 * - Module-by-module progress breakdown
 * - Certification readiness assessment
 * - Achievement and milestone tracking
 * - Time tracking and study patterns
 * - Performance metrics and trends
 * 
 * Navigation:
 * - Accessible via sidebar "Mi Progreso" navigation
 * - Direct URL access via /progress section
 * - Integration with portfolio and documents workflow
 * 
 * @version 2.0.0
 * @since 2.0.0
 */
import BaseViewController from './BaseViewController.js';

class ProgressViewController extends BaseViewController {
  constructor(viewId, app) {
    super(viewId, app);
    
    this.progressService = null;
    this.i18nService = null;
    
    // Progress data cache
    this.progressData = null;
    this.achievementsData = null;
    this.moduleStats = null;
  }

  async onInitialize() {
    // Get required services
    this.progressService = this.getService('ProgressService');
    this.i18nService = this.getService('I18nService');
    
    if (!this.progressService) {
      console.warn('[ProgressViewController] ProgressService not available yet');
    }
    
    console.log('[ProgressViewController] Initialized');
  }

  async onShow() {
    // Load progress data when view is shown
    await this.loadProgressData();
    
    console.log('[ProgressViewController] View shown');
  }

  async onRender() {
    if (!this.element) {
      console.warn('[ProgressViewController] No element available for rendering');
      return;
    }

    console.log('[ProgressViewController] Rendering progress view');
    
    // Clear existing content
    this.element.innerHTML = '';
    
    // Create main structure
    const container = this.createElement('div', ['progress-view']);
    
    // Add page header
    container.appendChild(this.createPageHeader());
    
    // Add overall progress section
    container.appendChild(this.createOverallProgressSection());
    
    // Add modules breakdown section
    container.appendChild(this.createModulesBreakdownSection());
    
    // Add achievements section
    container.appendChild(this.createAchievementsSection());
    
    // Add certification readiness section
    container.appendChild(this.createCertificationSection());
    
    // Add study insights section
    container.appendChild(this.createStudyInsightsSection());
    
    this.element.appendChild(container);
    
    // Bind event listeners
    this.bindEvents();
    
    console.log('[ProgressViewController] Rendering completed');
  }

  /**
   * Create page header section
   */
  createPageHeader() {
    const header = this.createElement('div', ['page-header']);
    
    const overallProgress = this.progressData ? this.progressData.overall : 0;
    const level = this.progressData ? this.progressData.level : 1;
    const streak = this.progressData ? this.progressData.streak : 0;
    
    header.innerHTML = `
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <span class="page-icon">📊</span>
            Mi Progreso de Certificación EC0249
          </h1>
          <p class="page-description">
            Seguimiento detallado de tu avance hacia la certificación 
            "Proporcionar servicios de consultoría general".
          </p>
        </div>
        <div class="header-stats">
          <div class="stat-card primary">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-number">${overallProgress}%</div>
              <div class="stat-label">Progreso General</div>
            </div>
          </div>
          <div class="stat-card secondary">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-number">${level}</div>
              <div class="stat-label">Nivel Actual</div>
            </div>
          </div>
          <div class="stat-card tertiary">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-number">${streak}</div>
              <div class="stat-label">Días Consecutivos</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return header;
  }

  /**
   * Create overall progress section
   */
  createOverallProgressSection() {
    const section = this.createElement('div', ['progress-section', 'overall-progress']);
    
    const overallProgress = this.progressData ? this.progressData.overall : 0;
    const xp = this.progressData ? this.progressData.xp : 0;
    const level = this.progressData ? this.progressData.level : 1;
    const nextLevelXP = level * 100;
    const currentLevelXP = (level - 1) * 100;
    const levelProgress = Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
    
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">📈</span>
          Progreso General
        </h2>
      </div>
      
      <div class="overall-stats">
        <div class="progress-circle-container">
          <div class="progress-circle" data-progress="${overallProgress}">
            <div class="progress-inner">
              <div class="progress-number">${overallProgress}%</div>
              <div class="progress-label">Completado</div>
            </div>
            <svg class="progress-ring" width="160" height="160">
              <circle class="progress-ring-bg" cx="80" cy="80" r="70" />
              <circle class="progress-ring-fill" cx="80" cy="80" r="70" 
                      style="stroke-dasharray: ${2 * Math.PI * 70}; 
                             stroke-dashoffset: ${2 * Math.PI * 70 * (1 - overallProgress / 100)}" />
            </svg>
          </div>
        </div>
        
        <div class="progress-details">
          <div class="progress-item">
            <div class="progress-item-header">
              <span class="progress-item-title">Experiencia Total</span>
              <span class="progress-item-value">${xp} XP</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${levelProgress}%"></div>
            </div>
            <div class="progress-item-subtitle">
              ${nextLevelXP - xp} XP para nivel ${level + 1}
            </div>
          </div>
          
          <div class="milestones-grid">
            <div class="milestone ${overallProgress >= 25 ? 'completed' : 'pending'}">
              <div class="milestone-icon">${overallProgress >= 25 ? '✅' : '⏳'}</div>
              <div class="milestone-text">
                <div class="milestone-title">Fundamentos</div>
                <div class="milestone-subtitle">25% completado</div>
              </div>
            </div>
            <div class="milestone ${overallProgress >= 50 ? 'completed' : 'pending'}">
              <div class="milestone-icon">${overallProgress >= 50 ? '✅' : '⏳'}</div>
              <div class="milestone-text">
                <div class="milestone-title">Intermedio</div>
                <div class="milestone-subtitle">50% completado</div>
              </div>
            </div>
            <div class="milestone ${overallProgress >= 75 ? 'completed' : 'pending'}">
              <div class="milestone-icon">${overallProgress >= 75 ? '✅' : '⏳'}</div>
              <div class="milestone-text">
                <div class="milestone-title">Avanzado</div>
                <div class="milestone-subtitle">75% completado</div>
              </div>
            </div>
            <div class="milestone ${overallProgress >= 100 ? 'completed' : 'pending'}">
              <div class="milestone-icon">${overallProgress >= 100 ? '🎓' : '⏳'}</div>
              <div class="milestone-text">
                <div class="milestone-title">Certificación</div>
                <div class="milestone-subtitle">100% completado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return section;
  }

  /**
   * Create modules breakdown section
   */
  createModulesBreakdownSection() {
    const section = this.createElement('div', ['progress-section', 'modules-breakdown']);
    
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">📚</span>
          Progreso por Módulo
        </h2>
      </div>
      
      <div class="modules-grid">
        ${this.createModuleCards()}
      </div>
    `;
    
    return section;
  }

  /**
   * Create module progress cards
   */
  createModuleCards() {
    const modules = [
      {
        id: 'module1',
        title: 'Módulo 1: Fundamentos',
        description: 'Conceptos básicos, ética y habilidades interpersonales',
        icon: '🎯',
        weight: 25,
        color: 'blue'
      },
      {
        id: 'module2', 
        title: 'Módulo 2: Identificación',
        description: 'Técnicas para identificar problemas organizacionales',
        icon: '🔍',
        weight: 35,
        color: 'green'
      },
      {
        id: 'module3',
        title: 'Módulo 3: Desarrollo',
        description: 'Desarrollo de soluciones integrales y efectivas',
        icon: '💡',
        weight: 20,
        color: 'orange'
      },
      {
        id: 'module4',
        title: 'Módulo 4: Presentación', 
        description: 'Presentación profesional de propuestas',
        icon: '📋',
        weight: 20,
        color: 'purple'
      }
    ];

    return modules.map(module => {
      const moduleData = this.getModuleData(module.id);
      const progress = moduleData ? this.calculateModuleProgress(moduleData) : 0;
      const status = this.getModuleStatus(module.id);
      
      return `
        <div class="module-card ${status} ${module.color}" data-module="${module.id}">
          <div class="module-header">
            <div class="module-icon">${module.icon}</div>
            <div class="module-status-indicator ${status}"></div>
          </div>
          
          <div class="module-content">
            <h3 class="module-title">${module.title}</h3>
            <p class="module-description">${module.description}</p>
            
            <div class="module-progress">
              <div class="progress-header">
                <span class="progress-percentage">${progress}%</span>
                <span class="progress-weight">${module.weight}% del total</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
              </div>
            </div>
            
            <div class="module-details">
              ${this.createModuleDetails(module.id, moduleData)}
            </div>
          </div>
          
          <div class="module-actions">
            <button class="btn btn-sm btn-outline" data-action="view-module" data-module="${module.id}">
              ${status === 'locked' ? 'Bloqueado' : status === 'completed' ? 'Revisar' : 'Continuar'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Create achievements section
   */
  createAchievementsSection() {
    const section = this.createElement('div', ['progress-section', 'achievements-section']);
    
    const achievements = this.achievementsData || [];
    const totalAchievements = 15; // Total possible achievements
    const completedAchievements = achievements.length;
    const achievementProgress = Math.round((completedAchievements / totalAchievements) * 100);
    
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">🏆</span>
          Logros y Reconocimientos
        </h2>
        <div class="achievements-summary">
          <span class="achievements-count">${completedAchievements}/${totalAchievements}</span>
          <span class="achievements-percentage">(${achievementProgress}%)</span>
        </div>
      </div>
      
      <div class="achievements-overview">
        <div class="recent-achievements">
          <h3 class="subsection-title">Logros Recientes</h3>
          <div class="achievements-list">
            ${this.createRecentAchievements()}
          </div>
        </div>
        
        <div class="achievements-categories">
          <h3 class="subsection-title">Por Categoría</h3>
          <div class="categories-grid">
            ${this.createAchievementCategories()}
          </div>
        </div>
      </div>
      
      <div class="achievements-actions">
        <button class="btn btn-outline" data-action="view-all-achievements">
          <span class="btn-icon">🏅</span>
          Ver Todos los Logros
        </button>
      </div>
    `;
    
    return section;
  }

  /**
   * Create certification readiness section
   */
  createCertificationSection() {
    const section = this.createElement('div', ['progress-section', 'certification-section']);
    
    const readiness = this.calculateCertificationReadiness();
    
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">🎓</span>
          Estado de Certificación
        </h2>
      </div>
      
      <div class="certification-status ${readiness.level}">
        <div class="certification-badge">
          <div class="badge-icon">${readiness.icon}</div>
          <div class="badge-content">
            <div class="badge-title">${readiness.title}</div>
            <div class="badge-subtitle">${readiness.subtitle}</div>
          </div>
        </div>
        
        <div class="certification-details">
          <div class="requirements-checklist">
            <h4>Requisitos de Certificación</h4>
            <div class="checklist">
              ${this.createCertificationChecklist()}
            </div>
          </div>
          
          <div class="next-steps">
            <h4>Próximos Pasos</h4>
            <div class="steps-list">
              ${this.createNextSteps()}
            </div>
          </div>
        </div>
      </div>
    `;
    
    return section;
  }

  /**
   * Create study insights section
   */
  createStudyInsightsSection() {
    const section = this.createElement('div', ['progress-section', 'study-insights']);
    
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">📊</span>
          Análisis de Estudio
        </h2>
      </div>
      
      <div class="insights-grid">
        <div class="insight-card">
          <div class="insight-header">
            <span class="insight-icon">📅</span>
            <span class="insight-title">Actividad Semanal</span>
          </div>
          <div class="insight-content">
            ${this.createActivityChart()}
          </div>
        </div>
        
        <div class="insight-card">
          <div class="insight-header">
            <span class="insight-icon">⏱️</span>
            <span class="insight-title">Tiempo de Estudio</span>
          </div>
          <div class="insight-content">
            ${this.createTimeStats()}
          </div>
        </div>
        
        <div class="insight-card">
          <div class="insight-header">
            <span class="insight-icon">💡</span>
            <span class="insight-title">Recomendaciones</span>
          </div>
          <div class="insight-content">
            ${this.createRecommendations()}
          </div>
        </div>
      </div>
    `;
    
    return section;
  }

  /**
   * Load progress data from services
   */
  async loadProgressData() {
    try {
      if (this.progressService) {
        this.progressData = this.progressService.getOverallProgress();
        this.achievementsData = this.progressService.getAchievements();
        this.moduleStats = this.progressService.getUserStats();
      }
      
      console.log('[ProgressViewController] Progress data loaded');
      
    } catch (error) {
      console.error('[ProgressViewController] Failed to load progress data:', error);
      this.progressData = { overall: 0, level: 1, streak: 0, xp: 0 };
      this.achievementsData = [];
      this.moduleStats = {};
    }
  }

  /**
   * Get module data
   */
  getModuleData(moduleId) {
    return this.progressData?.modules?.[moduleId] || null;
  }

  /**
   * Calculate module progress
   */
  calculateModuleProgress(moduleData) {
    if (!moduleData) return 0;
    
    // Simple calculation based on completion status
    const components = ['theory', 'practice', 'assessment', 'documents', 'presentation'];
    let completed = 0;
    let total = 0;
    
    components.forEach(component => {
      if (moduleData.hasOwnProperty(component)) {
        total++;
        if (typeof moduleData[component] === 'boolean' && moduleData[component]) {
          completed++;
        } else if (typeof moduleData[component] === 'number' && moduleData[component] >= 80) {
          completed++;
        }
      }
    });
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  /**
   * Get module status
   */
  getModuleStatus(moduleId) {
    if (!this.progressService) return 'locked';
    return this.progressService.getModuleStatus(moduleId);
  }

  /**
   * Create module details
   */
  createModuleDetails(moduleId, moduleData) {
    if (!moduleData) {
      return '<div class="module-detail">Sin datos disponibles</div>';
    }
    
    const details = [];
    
    if (moduleData.theory !== undefined) {
      details.push(`<div class="module-detail">
        <span class="detail-icon">📖</span>
        <span class="detail-text">Teoría: ${moduleData.theory}%</span>
      </div>`);
    }
    
    if (moduleData.practice !== undefined) {
      details.push(`<div class="module-detail">
        <span class="detail-icon">🔧</span>
        <span class="detail-text">Práctica: ${moduleData.practice}%</span>
      </div>`);
    }
    
    if (moduleData.assessment !== undefined) {
      details.push(`<div class="module-detail">
        <span class="detail-icon">✅</span>
        <span class="detail-text">Evaluación: ${moduleData.assessment ? 'Aprobada' : 'Pendiente'}</span>
      </div>`);
    }
    
    return details.join('');
  }

  /**
   * Calculate certification readiness
   */
  calculateCertificationReadiness() {
    const overallProgress = this.progressData ? this.progressData.overall : 0;
    
    if (overallProgress >= 100) {
      return {
        level: 'ready',
        icon: '🎓',
        title: 'Listo para Certificación',
        subtitle: 'Has completado todos los requisitos'
      };
    } else if (overallProgress >= 80) {
      return {
        level: 'almost',
        icon: '🎯',
        title: 'Casi Listo',
        subtitle: 'Te faltan pocos pasos para completar'
      };
    } else if (overallProgress >= 50) {
      return {
        level: 'progress',
        icon: '📈',
        title: 'En Progreso',
        subtitle: 'Has avanzado significativamente'
      };
    } else {
      return {
        level: 'beginning',
        icon: '🌱',
        title: 'Comenzando',
        subtitle: 'Continúa con tu aprendizaje'
      };
    }
  }

  /**
   * Create certification checklist
   */
  createCertificationChecklist() {
    const requirements = [
      { id: 'modules', label: 'Completar todos los módulos', completed: this.progressData?.overall >= 100 },
      { id: 'assessments', label: 'Aprobar todas las evaluaciones', completed: false },
      { id: 'documents', label: 'Generar documentos requeridos', completed: false },
      { id: 'simulations', label: 'Completar simulaciones', completed: false }
    ];
    
    return requirements.map(req => `
      <div class="checklist-item ${req.completed ? 'completed' : 'pending'}">
        <span class="checklist-icon">${req.completed ? '✅' : '⏳'}</span>
        <span class="checklist-text">${req.label}</span>
      </div>
    `).join('');
  }

  /**
   * Create next steps
   */
  createNextSteps() {
    const overallProgress = this.progressData ? this.progressData.overall : 0;
    
    let steps = [];
    
    if (overallProgress < 25) {
      steps.push('Completar Módulo 1: Fundamentos');
      steps.push('Practicar con los ejercicios básicos');
    } else if (overallProgress < 50) {
      steps.push('Avanzar en Módulo 2: Identificación');
      steps.push('Crear primeros documentos requeridos');
    } else if (overallProgress < 75) {
      steps.push('Completar Módulo 3: Desarrollo');
      steps.push('Realizar simulaciones de práctica');
    } else if (overallProgress < 100) {
      steps.push('Finalizar Módulo 4: Presentación');
      steps.push('Revisar y pulir documentos');
    } else {
      steps.push('Solicitar evaluación oficial');
      steps.push('Preparar portafolio final');
    }
    
    return steps.map((step, index) => `
      <div class="step-item">
        <span class="step-number">${index + 1}</span>
        <span class="step-text">${step}</span>
      </div>
    `).join('');
  }

  /**
   * Create recent achievements
   */
  createRecentAchievements() {
    if (!this.achievementsData || this.achievementsData.length === 0) {
      return '<div class="no-achievements">Aún no tienes logros. ¡Continúa estudiando!</div>';
    }
    
    return this.achievementsData.slice(0, 3).map(achievement => `
      <div class="achievement-item">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
          <div class="achievement-title">${achievement.title}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
        <div class="achievement-xp">+${achievement.xp} XP</div>
      </div>
    `).join('');
  }

  /**
   * Create achievement categories
   */
  createAchievementCategories() {
    const categories = [
      { id: 'first_steps', name: 'Primeros Pasos', icon: '🌱', count: 0 },
      { id: 'modules', name: 'Módulos', icon: '📚', count: 0 },
      { id: 'streaks', name: 'Constancia', icon: '🔥', count: 0 },
      { id: 'performance', name: 'Rendimiento', icon: '⭐', count: 0 }
    ];
    
    return categories.map(category => `
      <div class="category-item">
        <div class="category-icon">${category.icon}</div>
        <div class="category-name">${category.name}</div>
        <div class="category-count">${category.count}</div>
      </div>
    `).join('');
  }

  /**
   * Create activity chart placeholder
   */
  createActivityChart() {
    return `
      <div class="chart-placeholder">
        <div class="chart-bars">
          <div class="chart-bar" style="height: 60%"></div>
          <div class="chart-bar" style="height: 40%"></div>
          <div class="chart-bar" style="height: 80%"></div>
          <div class="chart-bar" style="height: 30%"></div>
          <div class="chart-bar" style="height: 90%"></div>
          <div class="chart-bar" style="height: 50%"></div>
          <div class="chart-bar" style="height: 70%"></div>
        </div>
        <div class="chart-labels">
          <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
        </div>
      </div>
    `;
  }

  /**
   * Create time statistics
   */
  createTimeStats() {
    const totalTime = 45; // minutes - placeholder
    const avgSession = 15; // minutes - placeholder
    
    return `
      <div class="time-stats">
        <div class="time-stat">
          <div class="time-value">${totalTime}min</div>
          <div class="time-label">Esta semana</div>
        </div>
        <div class="time-stat">
          <div class="time-value">${avgSession}min</div>
          <div class="time-label">Promedio por sesión</div>
        </div>
      </div>
    `;
  }

  /**
   * Create recommendations
   */
  createRecommendations() {
    const recommendations = [
      'Mantén una rutina de estudio diaria',
      'Completa las evaluaciones pendientes',
      'Practica con las simulaciones'
    ];
    
    return recommendations.map(rec => `
      <div class="recommendation-item">
        <span class="recommendation-icon">💡</span>
        <span class="recommendation-text">${rec}</span>
      </div>
    `).join('');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Action buttons
    this.findElements('[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleAction(button.dataset.action, button);
      });
    });
    
    // Module cards
    this.findElements('[data-module]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return;
        
        const moduleId = card.dataset.module;
        this.viewModule(moduleId);
      });
    });
  }

  /**
   * Handle general actions
   */
  async handleAction(action, button) {
    switch (action) {
      case 'view-module':
        const moduleId = button.dataset.module;
        await this.viewModule(moduleId);
        break;
      
      case 'view-all-achievements':
        this.viewAllAchievements();
        break;
      
      default:
        console.warn(`[ProgressViewController] Unknown action: ${action}`);
    }
  }

  /**
   * View specific module
   */
  async viewModule(moduleId) {
    await this.app.switchView('modules');
    await this.app.switchSection(moduleId);
  }

  /**
   * View all achievements
   */
  viewAllAchievements() {
    // TODO: Implement achievements modal or navigate to dedicated view
    this.showNotification('Vista completa de logros en desarrollo', 'info');
  }

  async onLanguageUpdate() {
    super.onLanguageUpdate();
    await this.onRender();
  }
}

export default ProgressViewController;