/**
 * Gamification Dashboard - Comprehensive Achievements and Social Features
 * 
 * @description Interactive dashboard component displaying achievements, leaderboards,
 * streaks, and social comparison features. Provides a complete gamification
 * overview to motivate users and enhance engagement.
 * 
 * @class GamificationDashboard
 * 
 * Features:
 * - Achievement showcase with progress tracking
 * - Leaderboard rankings and social comparison
 * - Learning streaks with visual indicators
 * - Points and level progression display
 * - Motivational messages and encouragement
 * - Interactive achievement unlocking
 * 
 * @example
 * // Initialize dashboard
 * const dashboard = new GamificationDashboard(containerElement);
 * await dashboard.initialize(container, eventBus);
 * 
 * @since 2.0.0
 */

class GamificationDashboard {
  /**
   * Create a new GamificationDashboard instance
   * @param {HTMLElement} container - Container element for the dashboard
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      showLeaderboards: true,
      showAchievements: true,
      showStreaks: true,
      refreshInterval: 60000, // 1 minute
      ...options
    };

    this.achievementSystem = null;
    this.leaderboardService = null;
    this.progressService = null;
    this.i18n = null;
    this.eventBus = null;

    this.refreshTimer = null;
    this.mounted = false;
  }

  /**
   * Initialize the dashboard with services
   */
  async initialize(container, eventBus) {
    this.container = container;
    this.eventBus = eventBus;

    // Get required services
    this.achievementSystem = container.resolve('AchievementSystem');
    this.leaderboardService = container.resolve('LeaderboardService');
    this.progressService = container.resolve('ProgressService');
    this.i18n = container.resolve('I18nService');

    // Subscribe to gamification events
    this.eventBus.subscribe('achievement:unlocked', this.handleAchievementUnlocked.bind(this));
    this.eventBus.subscribe('level:up', this.handleLevelUp.bind(this));
    this.eventBus.subscribe('streak:updated', this.handleStreakUpdated.bind(this));

    // Initial render
    await this.render();

    // Set up auto-refresh
    this.startAutoRefresh();

    this.mounted = true;
    console.log('[GamificationDashboard] Initialized');
  }

  /**
   * Render the complete dashboard
   */
  async render() {
    if (!this.container) return;

    const userSummary = this.achievementSystem.getUserSummary();
    const socialStats = this.leaderboardService.getSocialStats();
    const leaderboards = this.leaderboardService.getAllLeaderboards();

    this.container.innerHTML = `
      <div class="gamification-dashboard">
        ${this.renderUserStatsSection(userSummary, socialStats)}
        ${this.renderStreakSection(userSummary)}
        ${this.renderAchievementsSection(userSummary)}
        ${this.renderLeaderboardsSection(leaderboards)}
        ${this.renderMotivationSection(socialStats)}
      </div>
    `;

    // Add event listeners
    this.attachEventListeners();
  }

  /**
   * Render user statistics section
   */
  renderUserStatsSection(userSummary, socialStats) {
    return `
      <div class="gamification-section user-stats-section">
        <h3 class="section-title">
          <span class="section-icon">📊</span>
          Estadísticas de Progreso
        </h3>
        
        <div class="stats-grid">
          <div class="stat-card points-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
              <div class="stat-value">${userSummary.points}</div>
              <div class="stat-label">Puntos Totales</div>
              <div class="stat-sublabel">Nivel ${userSummary.level}</div>
            </div>
          </div>
          
          <div class="stat-card achievements-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-value">${userSummary.achievementsUnlocked}</div>
              <div class="stat-label">Logros Desbloqueados</div>
              <div class="stat-sublabel">${userSummary.completionPercentage}% completado</div>
            </div>
          </div>
          
          <div class="stat-card ranking-card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-value">#${socialStats.globalRank || 'N/A'}</div>
              <div class="stat-label">Ranking Global</div>
              <div class="stat-sublabel">Top ${socialStats.userComparison?.percentile || 0}%</div>
            </div>
          </div>
          
          <div class="stat-card streak-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-value">${userSummary.streak}</div>
              <div class="stat-label">Racha Actual</div>
              <div class="stat-sublabel">días consecutivos</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render streak section with visual progress
   */
  renderStreakSection(userSummary) {
    const streak = userSummary.streak;
    const nextMilestone = this.getNextStreakMilestone(streak);
    const progressToNextMilestone = this.getStreakProgress(streak, nextMilestone);

    return `
      <div class="gamification-section streak-section">
        <h3 class="section-title">
          <span class="section-icon">🔥</span>
          Racha de Aprendizaje
        </h3>
        
        <div class="streak-display">
          <div class="streak-main">
            <div class="streak-flame ${streak > 0 ? 'active' : ''}">🔥</div>
            <div class="streak-text">
              <div class="streak-number">${streak}</div>
              <div class="streak-label">días consecutivos</div>
            </div>
          </div>
          
          ${nextMilestone ? `
            <div class="streak-progress">
              <div class="progress-label">
                Próximo hito: ${nextMilestone} días
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressToNextMilestone}%"></div>
              </div>
              <div class="progress-text">
                ${nextMilestone - streak} días restantes
              </div>
            </div>
          ` : `
            <div class="streak-achievement">
              <div class="achievement-badge legendary">
                <span>🎉</span>
                <span>¡Racha Legendaria!</span>
              </div>
            </div>
          `}
        </div>
        
        <div class="streak-tips">
          <h4>💡 Consejos para mantener tu racha:</h4>
          <ul>
            <li>Dedica al menos 15 minutos diarios al aprendizaje</li>
            <li>Completa una lección o actividad cada día</li>
            <li>Revisa contenido previo si no tienes tiempo para algo nuevo</li>
            <li>Usa recordatorios para mantener el hábito</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Render achievements section
   */
  renderAchievementsSection(userSummary) {
    const achievements = this.achievementSystem.getAllAchievements();
    const categories = this.groupAchievementsByCategory(achievements);

    return `
      <div class="gamification-section achievements-section">
        <h3 class="section-title">
          <span class="section-icon">🏅</span>
          Logros y Reconocimientos
        </h3>
        
        <div class="achievements-overview">
          <div class="achievements-progress">
            <div class="progress-circle">
              <div class="progress-number">${userSummary.achievementsUnlocked}</div>
              <div class="progress-total">/${userSummary.totalAchievements}</div>
            </div>
            <div class="progress-label">Logros Desbloqueados</div>
          </div>
          
          <div class="achievements-stats">
            <div class="achievement-stat">
              <span class="stat-value">${userSummary.points}</span>
              <span class="stat-label">Puntos Ganados</span>
            </div>
            <div class="achievement-stat">
              <span class="stat-value">${userSummary.level}</span>
              <span class="stat-label">Nivel Actual</span>
            </div>
          </div>
        </div>

        <div class="achievements-categories">
          ${Object.entries(categories).map(([category, categoryAchievements]) => `
            <div class="achievement-category">
              <h4 class="category-title">
                ${this.getCategoryIcon(category)} ${this.getCategoryTitle(category)}
              </h4>
              <div class="achievements-grid">
                ${categoryAchievements.slice(0, 4).map(achievement => this.renderAchievementCard(achievement)).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="achievements-actions">
          <button class="btn btn-secondary" data-action="view-all-achievements">
            Ver Todos los Logros
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render leaderboards section
   */
  renderLeaderboardsSection(leaderboards) {
    const globalLeaderboard = leaderboards.find(lb => lb.id === 'global_points');
    const currentUserId = this.leaderboardService.getCurrentUserId();

    return `
      <div class="gamification-section leaderboards-section">
        <h3 class="section-title">
          <span class="section-icon">🏆</span>
          Clasificaciones y Competencia
        </h3>
        
        ${globalLeaderboard ? `
          <div class="leaderboard-card">
            <h4 class="leaderboard-title">
              ${globalLeaderboard.icon} ${globalLeaderboard.title}
            </h4>
            <div class="leaderboard-entries">
              ${globalLeaderboard.entries.slice(0, 5).map((entry, index) => `
                <div class="leaderboard-entry ${entry.userId === currentUserId ? 'current-user' : ''}">
                  <div class="entry-rank">
                    ${this.getRankDisplay(entry.rank)}
                  </div>
                  <div class="entry-info">
                    <div class="entry-name">${entry.displayName}</div>
                    <div class="entry-stats">
                      Nivel ${entry.level} • ${entry.totalPoints} puntos
                    </div>
                  </div>
                  ${entry.userId === currentUserId ? '<div class="current-user-badge">Tú</div>' : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="leaderboard-actions">
          <button class="btn btn-secondary" data-action="view-all-leaderboards">
            Ver Todas las Clasificaciones
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render motivation section
   */
  renderMotivationSection(socialStats) {
    return `
      <div class="gamification-section motivation-section">
        <h3 class="section-title">
          <span class="section-icon">💪</span>
          Motivación y Progreso
        </h3>
        
        <div class="motivation-card">
          <div class="motivation-icon">🌟</div>
          <div class="motivation-content">
            <div class="motivation-message">
              ${socialStats.encouragementMessage}
            </div>
            <div class="motivation-stats">
              Competir con ${socialStats.totalCompetitors} estudiantes
            </div>
          </div>
        </div>
        
        <div class="daily-goals">
          <h4>🎯 Objetivos de Hoy</h4>
          <div class="goals-list">
            <div class="goal-item">
              <input type="checkbox" id="goal-lesson" />
              <label for="goal-lesson">Completar una lección</label>
            </div>
            <div class="goal-item">
              <input type="checkbox" id="goal-video" />
              <label for="goal-video">Ver un video educativo</label>
            </div>
            <div class="goal-item">
              <input type="checkbox" id="goal-assessment" />
              <label for="goal-assessment">Realizar una evaluación</label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render individual achievement card
   */
  renderAchievementCard(achievement) {
    return `
      <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} ${achievement.rarity}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${achievement.title}</div>
          <div class="achievement-description">${achievement.description}</div>
          <div class="achievement-points">${achievement.points} puntos</div>
        </div>
        ${achievement.unlocked ? '<div class="achievement-check">✅</div>' : ''}
      </div>
    `;
  }

  /**
   * Group achievements by category
   */
  groupAchievementsByCategory(achievements) {
    return achievements.reduce((groups, achievement) => {
      const category = achievement.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(achievement);
      return groups;
    }, {});
  }

  /**
   * Get category display information
   */
  getCategoryIcon(category) {
    const icons = {
      first_steps: '🌱',
      modules: '📚',
      streaks: '🔥',
      performance: '⭐',
      completion: '🎓'
    };
    return icons[category] || '🏆';
  }

  getCategoryTitle(category) {
    const titles = {
      first_steps: 'Primeros Pasos',
      modules: 'Dominio de Módulos',
      streaks: 'Constancia',
      performance: 'Rendimiento',
      completion: 'Completación'
    };
    return titles[category] || 'General';
  }

  /**
   * Get next streak milestone
   */
  getNextStreakMilestone(currentStreak) {
    const milestones = [3, 7, 14, 30, 60, 100];
    return milestones.find(milestone => milestone > currentStreak);
  }

  /**
   * Calculate progress to next streak milestone
   */
  getStreakProgress(currentStreak, nextMilestone) {
    if (!nextMilestone) return 100;
    const previousMilestone = this.getPreviousStreakMilestone(nextMilestone);
    const range = nextMilestone - previousMilestone;
    const progress = currentStreak - previousMilestone;
    return Math.max(0, Math.min(100, (progress / range) * 100));
  }

  /**
   * Get previous streak milestone
   */
  getPreviousStreakMilestone(milestone) {
    const milestones = [0, 3, 7, 14, 30, 60];
    const index = milestones.indexOf(milestone);
    return index > 0 ? milestones[index - 1] : 0;
  }

  /**
   * Get rank display with special formatting
   */
  getRankDisplay(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const dashboard = this.container.querySelector('.gamification-dashboard');
    if (!dashboard) return;

    dashboard.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (!action) return;

      switch (action) {
        case 'view-all-achievements':
          this.openAchievementsModal();
          break;
        case 'view-all-leaderboards':
          this.openLeaderboardsModal();
          break;
      }
    });
  }

  /**
   * Event handlers
   */
  async handleAchievementUnlocked(data) {
    // Refresh the achievements section
    await this.render();
  }

  async handleLevelUp(data) {
    // Show level up celebration
    this.showLevelUpCelebration(data.newLevel);
    await this.render();
  }

  async handleStreakUpdated(data) {
    // Update streak display
    await this.render();
  }

  /**
   * Show level up celebration
   */
  showLevelUpCelebration(newLevel) {
    const celebration = document.createElement('div');
    celebration.className = 'level-up-celebration';
    celebration.innerHTML = `
      <div class="celebration-content">
        <div class="celebration-icon">🎉</div>
        <div class="celebration-title">¡Subiste de Nivel!</div>
        <div class="celebration-level">Nivel ${newLevel}</div>
        <div class="celebration-message">¡Sigue así, estás progresando excelente!</div>
      </div>
    `;

    document.body.appendChild(celebration);

    // Remove after animation
    setTimeout(() => {
      if (celebration.parentNode) {
        celebration.parentNode.removeChild(celebration);
      }
    }, 3000);
  }

  /**
   * Open achievements modal
   */
  openAchievementsModal() {
    // TODO: Implement comprehensive achievements modal
    console.log('[GamificationDashboard] Opening achievements modal');
  }

  /**
   * Open leaderboards modal
   */
  openLeaderboardsModal() {
    // TODO: Implement comprehensive leaderboards modal
    console.log('[GamificationDashboard] Opening leaderboards modal');
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.render();
    }, this.options.refreshInterval);
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Destroy the dashboard
   */
  destroy() {
    this.stopAutoRefresh();
    
    if (this.container) {
      this.container.innerHTML = '';
    }

    this.mounted = false;
    console.log('[GamificationDashboard] Destroyed');
  }
}

export default GamificationDashboard;