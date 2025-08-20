/**
 * Achievement System - Gamification and Progress Tracking Component
 * 
 * @description Comprehensive achievement and gamification system for the EC0249 platform.
 * Provides badges, points, streaks, and motivational features to enhance user engagement
 * and learning outcomes. Integrates with ProgressService for learning analytics.
 * 
 * Features:
 * - 15+ unique achievements across 5 categories
 * - Points-based reward system (10-200 points per achievement)
 * - Daily activity streaks with visual indicators
 * - Progress milestones and completion tracking
 * - Animated achievement notifications
 * - Persistent storage and analytics
 * 
 * @class AchievementSystem
 * @since 2.0.0
 */

class AchievementSystem {
  constructor() {
    this.achievements = new Map();
    this.userProgress = {
      points: 0,
      level: 1,
      streak: 0,
      unlockedAchievements: [],
      lastActivity: null,
      firstVisit: null,
      stats: {
        videosWatched: 0,
        lessonsCompleted: 0,
        modulesCompleted: 0,
        quizzesCompleted: 0,
        documentsGenerated: 0,
        perfectScores: 0,
        totalTimeSpent: 0
      }
    };
    
    this.levelThresholds = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3250, 4100, 5000];
    this.streakMultiplier = 1;
    this.notificationQueue = [];
    this.isInitialized = false;
    
    this.initializeAchievements();
  }

  /**
   * Initialize the achievement system
   */
  async initialize(container, eventBus) {
    this.container = container;
    this.eventBus = eventBus;
    
    // Get required services
    this.storageService = container.resolve('StorageService');
    this.progressService = container.resolve('ProgressService');
    
    // Load user progress from storage
    await this.loadUserProgress();
    
    // Set up event listeners
    this.bindEvents();
    
    // Create notification container
    this.createNotificationContainer();
    
    // Mark first visit if new user
    if (!this.userProgress.firstVisit) {
      this.userProgress.firstVisit = new Date().toISOString();
      await this.saveUserProgress();
    }
    
    this.isInitialized = true;
    console.log('[AchievementSystem] Initialized with', this.achievements.size, 'achievements');
    
    return this;
  }

  /**
   * Initialize all achievement definitions
   */
  initializeAchievements() {
    // Category 1: First Steps & Onboarding
    this.addAchievement('welcome', {
      title: 'Bienvenido al EC0249',
      description: 'Accediste por primera vez a la plataforma educativa',
      category: 'first_steps',
      icon: '👋',
      points: 10,
      rarity: 'common',
      conditions: ['first_visit']
    });

    this.addAchievement('first_video', {
      title: 'Primer Video',
      description: 'Viste tu primer video educativo completo',
      category: 'first_steps',
      icon: '🎥',
      points: 25,
      rarity: 'common',
      conditions: ['videos_watched >= 1']
    });

    this.addAchievement('first_lesson', {
      title: 'Primera Lección',
      description: 'Completaste tu primera lección',
      category: 'first_steps',
      icon: '📚',
      points: 50,
      rarity: 'common',
      conditions: ['lessons_completed >= 1']
    });

    this.addAchievement('first_quiz', {
      title: 'Primera Evaluación',
      description: 'Completaste tu primera evaluación de conocimientos',
      category: 'first_steps',
      icon: '📝',
      points: 75,
      rarity: 'common',
      conditions: ['quizzes_completed >= 1']
    });

    // Category 2: Module Completion
    this.addAchievement('module1_master', {
      title: 'Maestro de Fundamentos',
      description: 'Completaste el Módulo 1: Fundamentos de Consultoría',
      category: 'modules',
      icon: '🎯',
      points: 100,
      rarity: 'uncommon',
      conditions: ['module1_completed']
    });

    this.addAchievement('module2_detective', {
      title: 'Detective de Problemas',
      description: 'Completaste el Módulo 2: Identificación del Problema',
      category: 'modules',
      icon: '🔍',
      points: 150,
      rarity: 'uncommon',
      conditions: ['module2_completed']
    });

    this.addAchievement('module3_innovator', {
      title: 'Innovador de Soluciones',
      description: 'Completaste el Módulo 3: Desarrollo de Soluciones',
      category: 'modules',
      icon: '💡',
      points: 150,
      rarity: 'uncommon',
      conditions: ['module3_completed']
    });

    this.addAchievement('module4_presenter', {
      title: 'Presentador Experto',
      description: 'Completaste el Módulo 4: Presentación de Propuestas',
      category: 'modules',
      icon: '📋',
      points: 150,
      rarity: 'uncommon',
      conditions: ['module4_completed']
    });

    // Category 3: Learning Streaks
    this.addAchievement('streak_3', {
      title: 'Constancia',
      description: '3 días consecutivos de actividad en la plataforma',
      category: 'streaks',
      icon: '🔥',
      points: 60,
      rarity: 'uncommon',
      conditions: ['streak >= 3']
    });

    this.addAchievement('streak_7', {
      title: 'Dedicación',
      description: '7 días consecutivos de actividad en la plataforma',
      category: 'streaks',
      icon: '💪',
      points: 120,
      rarity: 'rare',
      conditions: ['streak >= 7']
    });

    this.addAchievement('streak_30', {
      title: 'Compromiso Total',
      description: '30 días consecutivos de actividad en la plataforma',
      category: 'streaks',
      icon: '👑',
      points: 300,
      rarity: 'legendary',
      conditions: ['streak >= 30']
    });

    // Category 4: Performance & Excellence
    this.addAchievement('perfectionist', {
      title: 'Perfeccionista',
      description: 'Obtuviste calificación perfecta en 5 evaluaciones',
      category: 'performance',
      icon: '💯',
      points: 200,
      rarity: 'rare',
      conditions: ['perfect_scores >= 5']
    });

    this.addAchievement('video_enthusiast', {
      title: 'Entusiasta Visual',
      description: 'Viste 15 videos educativos completos',
      category: 'performance',
      icon: '📺',
      points: 100,
      rarity: 'uncommon',
      conditions: ['videos_watched >= 15']
    });

    this.addAchievement('document_generator', {
      title: 'Generador de Documentos',
      description: 'Creaste 10 documentos usando las plantillas',
      category: 'performance',
      icon: '📄',
      points: 150,
      rarity: 'rare',
      conditions: ['documents_generated >= 10']
    });

    // Category 5: Completion & Mastery
    this.addAchievement('half_way_hero', {
      title: 'Héroe de Medio Camino',
      description: 'Completaste el 50% de todo el contenido',
      category: 'completion',
      icon: '⭐',
      points: 175,
      rarity: 'rare',
      conditions: ['overall_progress >= 50']
    });

    this.addAchievement('ec0249_graduate', {
      title: 'Graduado EC0249',
      description: 'Completaste todos los módulos y estás listo para la certificación',
      category: 'completion',
      icon: '🎓',
      points: 500,
      rarity: 'legendary',
      conditions: ['overall_progress >= 100']
    });
  }

  /**
   * Add achievement definition
   */
  addAchievement(id, achievement) {
    this.achievements.set(id, {
      id,
      ...achievement,
      unlocked: false,
      unlockedDate: null
    });
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Listen for learning progress events
    this.eventBus.subscribe('video:completed', this.handleVideoCompleted.bind(this));
    this.eventBus.subscribe('lesson:completed', this.handleLessonCompleted.bind(this));
    this.eventBus.subscribe('quiz:completed', this.handleQuizCompleted.bind(this));
    this.eventBus.subscribe('quiz:perfect_score', this.handlePerfectScore.bind(this));
    this.eventBus.subscribe('module:completed', this.handleModuleCompleted.bind(this));
    this.eventBus.subscribe('document:generated', this.handleDocumentGenerated.bind(this));
    this.eventBus.subscribe('progress:updated', this.handleProgressUpdated.bind(this));
    
    // Listen for daily activity
    this.trackDailyActivity();
  }

  /**
   * Handle video completion
   */
  async handleVideoCompleted(data) {
    this.userProgress.stats.videosWatched++;
    await this.checkAndUnlockAchievements();
    await this.saveUserProgress();
  }

  /**
   * Handle lesson completion
   */
  async handleLessonCompleted(data) {
    this.userProgress.stats.lessonsCompleted++;
    await this.checkAndUnlockAchievements();
    await this.saveUserProgress();
  }

  /**
   * Handle quiz completion
   */
  async handleQuizCompleted(data) {
    this.userProgress.stats.quizzesCompleted++;
    
    if (data.score === 100) {
      this.userProgress.stats.perfectScores++;
    }
    
    await this.checkAndUnlockAchievements();
    await this.saveUserProgress();
  }

  /**
   * Handle perfect score achievement
   */
  async handlePerfectScore(data) {
    this.userProgress.stats.perfectScores++;
    await this.checkAndUnlockAchievements();
    await this.saveUserProgress();
  }

  /**
   * Handle module completion
   */
  async handleModuleCompleted(data) {
    this.userProgress.stats.modulesCompleted++;
    await this.checkAndUnlockAchievements();
    await this.saveUserProgress();
  }

  /**
   * Handle document generation
   */
  async handleDocumentGenerated(data) {
    this.userProgress.stats.documentsGenerated++;
    await this.checkAndUnlockAchievements();
    await this.saveUserProgress();
  }

  /**
   * Handle progress updates
   */
  async handleProgressUpdated(data) {
    await this.checkAndUnlockAchievements();
  }

  /**
   * Track daily activity and streaks
   */
  trackDailyActivity() {
    const today = new Date().toDateString();
    const lastActivity = this.userProgress.lastActivity;
    
    if (lastActivity !== today) {
      // Calculate streak
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date();
        const dayDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          // Consecutive day
          this.userProgress.streak++;
        } else if (dayDiff > 1) {
          // Streak broken
          this.userProgress.streak = 1;
        }
        // If dayDiff === 0, same day - no change needed
      } else {
        // First day
        this.userProgress.streak = 1;
      }
      
      this.userProgress.lastActivity = today;
      this.saveUserProgress();
      this.checkAndUnlockAchievements();
    }
  }

  /**
   * Check and unlock eligible achievements
   */
  async checkAndUnlockAchievements() {
    const newUnlocks = [];
    
    for (const [id, achievement] of this.achievements.entries()) {
      if (!this.userProgress.unlockedAchievements.includes(id)) {
        if (await this.evaluateConditions(achievement.conditions)) {
          await this.unlockAchievement(id);
          newUnlocks.push(achievement);
        }
      }
    }
    
    return newUnlocks;
  }

  /**
   * Evaluate achievement conditions
   */
  async evaluateConditions(conditions) {
    for (const condition of conditions) {
      if (!await this.evaluateCondition(condition)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate single condition
   */
  async evaluateCondition(condition) {
    // Handle first visit
    if (condition === 'first_visit') {
      return !!this.userProgress.firstVisit;
    }
    
    // Handle module completions
    if (condition.endsWith('_completed')) {
      const moduleId = condition.replace('_completed', '');
      if (this.progressService) {
        return this.progressService.isModuleCompleted(moduleId);
      }
      return false;
    }
    
    // Handle numeric conditions
    const numericMatch = condition.match(/(\w+)\s*(>=|<=|>|<|==)\s*(\d+)/);
    if (numericMatch) {
      const [, field, operator, value] = numericMatch;
      const currentValue = this.getUserStatValue(field);
      const targetValue = parseInt(value);
      
      switch (operator) {
        case '>=': return currentValue >= targetValue;
        case '<=': return currentValue <= targetValue;
        case '>': return currentValue > targetValue;
        case '<': return currentValue < targetValue;
        case '==': return currentValue === targetValue;
        default: return false;
      }
    }
    
    // Handle overall progress
    if (condition.startsWith('overall_progress')) {
      const match = condition.match(/overall_progress\s*(>=|<=|>|<|==)\s*(\d+)/);
      if (match && this.progressService) {
        const [, operator, value] = match;
        const currentProgress = this.progressService.progress?.overall || 0;
        const targetProgress = parseInt(value);
        
        switch (operator) {
          case '>=': return currentProgress >= targetProgress;
          case '<=': return currentProgress <= targetProgress;
          case '>': return currentProgress > targetProgress;
          case '<': return currentProgress < targetProgress;
          case '==': return currentProgress === targetProgress;
          default: return false;
        }
      }
    }
    
    return false;
  }

  /**
   * Get user stat value by field name
   */
  getUserStatValue(field) {
    switch (field) {
      case 'videos_watched': return this.userProgress.stats.videosWatched;
      case 'lessons_completed': return this.userProgress.stats.lessonsCompleted;
      case 'modules_completed': return this.userProgress.stats.modulesCompleted;
      case 'quizzes_completed': return this.userProgress.stats.quizzesCompleted;
      case 'documents_generated': return this.userProgress.stats.documentsGenerated;
      case 'perfect_scores': return this.userProgress.stats.perfectScores;
      case 'streak': return this.userProgress.streak;
      case 'points': return this.userProgress.points;
      case 'level': return this.userProgress.level;
      default: return 0;
    }
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || this.userProgress.unlockedAchievements.includes(achievementId)) {
      return;
    }
    
    // Mark as unlocked
    achievement.unlocked = true;
    achievement.unlockedDate = new Date().toISOString();
    this.userProgress.unlockedAchievements.push(achievementId);
    
    // Award points with streak multiplier
    const points = Math.round(achievement.points * this.getStreakMultiplier());
    this.userProgress.points += points;
    
    // Check for level up
    const newLevel = this.calculateLevel(this.userProgress.points);
    const leveledUp = newLevel > this.userProgress.level;
    this.userProgress.level = newLevel;
    
    // Show notification
    this.showAchievementNotification(achievement, points, leveledUp);
    
    // Emit events
    this.eventBus.publish('achievement:unlocked', { 
      achievement, 
      points, 
      leveledUp,
      newLevel: this.userProgress.level
    });
    
    if (leveledUp) {
      this.eventBus.publish('level:up', { 
        oldLevel: newLevel - 1, 
        newLevel,
        totalPoints: this.userProgress.points
      });
    }
    
    await this.saveUserProgress();
    
    console.log(`[AchievementSystem] Unlocked: ${achievement.title} (+${points} points)`);
  }

  /**
   * Calculate level from points
   */
  calculateLevel(points) {
    for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
      if (points >= this.levelThresholds[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Get streak multiplier
   */
  getStreakMultiplier() {
    if (this.userProgress.streak >= 30) return 2.0;
    if (this.userProgress.streak >= 14) return 1.5;
    if (this.userProgress.streak >= 7) return 1.3;
    if (this.userProgress.streak >= 3) return 1.1;
    return 1.0;
  }

  /**
   * Create notification container
   */
  createNotificationContainer() {
    if (document.getElementById('achievement-notifications')) return;
    
    const container = document.createElement('div');
    container.id = 'achievement-notifications';
    container.className = 'achievement-notifications';
    document.body.appendChild(container);
  }

  /**
   * Show achievement notification
   */
  showAchievementNotification(achievement, points, leveledUp) {
    const container = document.getElementById('achievement-notifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `achievement-notification ${achievement.rarity}`;
    notification.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
          <div class="achievement-title">¡Logro Desbloqueado!</div>
          <div class="achievement-name">${achievement.title}</div>
          <div class="achievement-description">${achievement.description}</div>
          <div class="achievement-points">+${points} puntos</div>
          ${leveledUp ? `<div class="level-up">¡Subiste al nivel ${this.userProgress.level}!</div>` : ''}
        </div>
        <button class="achievement-close" aria-label="Cerrar notificación">&times;</button>
      </div>
    `;
    
    // Add close functionality
    const closeButton = notification.querySelector('.achievement-close');
    closeButton.addEventListener('click', () => {
      this.removeNotification(notification);
    });
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        this.removeNotification(notification);
      }
    }, 8000);
    
    // Add to container with animation
    container.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
    
    // Play achievement sound (if enabled)
    this.playAchievementSound(achievement.rarity);
  }

  /**
   * Remove notification with animation
   */
  removeNotification(notification) {
    notification.classList.add('removing');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Play achievement sound (optional)
   */
  playAchievementSound(rarity) {
    // Could implement sound effects based on rarity
    // For now, just console log for testing
    console.log(`[AchievementSystem] 🎵 Playing ${rarity} achievement sound`);
  }

  /**
   * Get user achievements summary
   */
  getUserSummary() {
    const unlockedCount = this.userProgress.unlockedAchievements.length;
    const totalCount = this.achievements.size;
    const completionPercentage = Math.round((unlockedCount / totalCount) * 100);
    
    return {
      points: this.userProgress.points,
      level: this.userProgress.level,
      streak: this.userProgress.streak,
      achievementsUnlocked: unlockedCount,
      totalAchievements: totalCount,
      completionPercentage,
      nextLevelPoints: this.levelThresholds[this.userProgress.level] || 'MAX',
      pointsToNextLevel: Math.max(0, (this.levelThresholds[this.userProgress.level] || 0) - this.userProgress.points),
      streakMultiplier: this.getStreakMultiplier(),
      stats: { ...this.userProgress.stats }
    };
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category) {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.category === category)
      .map(achievement => ({
        ...achievement,
        unlocked: this.userProgress.unlockedAchievements.includes(achievement.id)
      }));
  }

  /**
   * Get all achievements with unlock status
   */
  getAllAchievements() {
    return Array.from(this.achievements.values())
      .map(achievement => ({
        ...achievement,
        unlocked: this.userProgress.unlockedAchievements.includes(achievement.id)
      }))
      .sort((a, b) => {
        // Sort by unlocked status first, then by category
        if (a.unlocked !== b.unlocked) {
          return b.unlocked - a.unlocked;
        }
        return a.category.localeCompare(b.category);
      });
  }

  /**
   * Load user progress from storage
   */
  async loadUserProgress() {
    try {
      const saved = await this.storageService.get('achievement_progress');
      if (saved) {
        this.userProgress = { ...this.userProgress, ...saved };
        console.log('[AchievementSystem] Loaded user progress');
      }
    } catch (error) {
      console.warn('[AchievementSystem] Failed to load progress:', error);
    }
  }

  /**
   * Save user progress to storage
   */
  async saveUserProgress() {
    try {
      await this.storageService.set('achievement_progress', this.userProgress);
    } catch (error) {
      console.warn('[AchievementSystem] Failed to save progress:', error);
    }
  }

  /**
   * Reset all progress (for testing)
   */
  async resetProgress() {
    this.userProgress = {
      points: 0,
      level: 1,
      streak: 0,
      unlockedAchievements: [],
      lastActivity: null,
      firstVisit: new Date().toISOString(),
      stats: {
        videosWatched: 0,
        lessonsCompleted: 0,
        modulesCompleted: 0,
        quizzesCompleted: 0,
        documentsGenerated: 0,
        perfectScores: 0,
        totalTimeSpent: 0
      }
    };
    
    // Reset achievement unlock status
    for (const achievement of this.achievements.values()) {
      achievement.unlocked = false;
      achievement.unlockedDate = null;
    }
    
    await this.saveUserProgress();
    console.log('[AchievementSystem] Progress reset');
  }

  /**
   * Destroy achievement system
   */
  destroy() {
    // Remove notification container
    const container = document.getElementById('achievement-notifications');
    if (container) {
      container.remove();
    }
    
    console.log('[AchievementSystem] Destroyed');
  }
}

export default AchievementSystem;