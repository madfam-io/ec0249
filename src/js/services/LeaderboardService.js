/**
 * Leaderboard Service - Social Learning and Competition Features
 * 
 * @description Manages leaderboards, social comparisons, and competitive learning
 * features for the EC0249 platform. Provides ranking systems, peer comparison,
 * and social motivation features to enhance user engagement.
 * 
 * @class LeaderboardService
 * @extends Module
 * 
 * Features:
 * - Global and module-specific leaderboards
 * - Real-time ranking updates
 * - Achievement-based scoring
 * - Anonymous competition with privacy protection
 * - Social comparison and motivation
 * - Performance analytics and insights
 * 
 * Leaderboard Types:
 * - Points leaderboard: Based on achievement points
 * - Module completion: Module-specific rankings
 * - Streak leaderboard: Daily activity streaks
 * - Speed rankings: Completion time rankings
 * 
 * @example
 * // Get global leaderboard
 * const rankings = await leaderboardService.getGlobalLeaderboard();
 * 
 * @example
 * // Update user score
 * await leaderboardService.updateUserScore(userId, newPoints);
 * 
 * @since 2.0.0
 */
import Module from '../core/Module.js';

class LeaderboardService extends Module {
  /**
   * Create a new LeaderboardService instance
   */
  constructor() {
    super('LeaderboardService', ['StorageService', 'EventBus'], {
      maxLeaderboardSize: 100,
      updateInterval: 300000, // 5 minutes
      anonymousMode: true, // Protect user privacy
      enableSocialFeatures: true
    });

    this.leaderboards = new Map();
    this.userScores = new Map();
    this.userRankings = new Map();
    this.socialStats = new Map();
    this.lastUpdate = 0;
  }

  async onInitialize() {
    this.storage = this.service('StorageService');
    this.eventBus = this.service('EventBus');

    // Subscribe to achievement events
    this.subscribe('achievement:unlocked', this.handleAchievementUnlocked.bind(this));
    this.subscribe('level:up', this.handleLevelUp.bind(this));
    this.subscribe('quiz:completed', this.handleQuizCompleted.bind(this));
    this.subscribe('module:completed', this.handleModuleCompleted.bind(this));

    // Initialize leaderboards
    await this.initializeLeaderboards();
    
    // Load user data
    await this.loadUserData();

    console.log('[LeaderboardService] Initialized');
  }

  /**
   * Initialize leaderboard structures
   */
  async initializeLeaderboards() {
    // Global points leaderboard
    this.leaderboards.set('global_points', {
      type: 'points',
      title: 'Ranking Global de Puntos',
      description: 'Los usuarios con más puntos de logros',
      icon: '🏆',
      entries: [],
      lastUpdate: Date.now()
    });

    // Module completion leaderboards
    ['module1', 'module2', 'module3', 'module4'].forEach(moduleId => {
      this.leaderboards.set(`${moduleId}_completion`, {
        type: 'completion',
        moduleId,
        title: `Ranking ${moduleId.toUpperCase()}`,
        description: `Usuarios que han completado ${moduleId}`,
        icon: '📚',
        entries: [],
        lastUpdate: Date.now()
      });
    });

    // Streak leaderboard
    this.leaderboards.set('streak_leaders', {
      type: 'streak',
      title: 'Rachas de Actividad',
      description: 'Usuarios con las mejores rachas diarias',
      icon: '🔥',
      entries: [],
      lastUpdate: Date.now()
    });

    // Speed leaderboard
    this.leaderboards.set('speed_learners', {
      type: 'speed',
      title: 'Aprendices Rápidos',
      description: 'Usuarios con mejor tiempo de completación',
      icon: '⚡',
      entries: [],
      lastUpdate: Date.now()
    });
  }

  /**
   * Handle achievement unlocked events
   */
  async handleAchievementUnlocked(data) {
    const userId = this.getCurrentUserId();
    const points = data.points || 0;
    
    await this.updateUserScore(userId, points, 'achievement');
    await this.updateLeaderboards();
  }

  /**
   * Handle level up events
   */
  async handleLevelUp(data) {
    const userId = this.getCurrentUserId();
    const bonusPoints = data.newLevel * 10; // Bonus points for leveling up
    
    await this.updateUserScore(userId, bonusPoints, 'level_bonus');
    await this.updateLeaderboards();
  }

  /**
   * Handle quiz completion
   */
  async handleQuizCompleted(data) {
    const userId = this.getCurrentUserId();
    const score = data.score || 0;
    
    // Award points based on quiz performance
    const points = Math.round(score / 10); // 1 point per 10% score
    
    await this.updateUserScore(userId, points, 'quiz_completion');
    await this.updateModuleProgress(userId, data.assessmentId, score);
    await this.updateLeaderboards();
  }

  /**
   * Handle module completion
   */
  async handleModuleCompleted(data) {
    const userId = this.getCurrentUserId();
    const moduleId = data.moduleId;
    
    // Award significant points for module completion
    const points = 100;
    
    await this.updateUserScore(userId, points, 'module_completion');
    await this.markModuleCompleted(userId, moduleId);
    await this.updateLeaderboards();
  }

  /**
   * Update user score
   */
  async updateUserScore(userId, additionalPoints, source = 'unknown') {
    if (!this.userScores.has(userId)) {
      this.userScores.set(userId, {
        userId,
        totalPoints: 0,
        level: 1,
        streak: 0,
        modulesCompleted: 0,
        lastActivity: Date.now(),
        displayName: this.generateAnonymousName(userId),
        joined: Date.now()
      });
    }

    const userScore = this.userScores.get(userId);
    userScore.totalPoints += additionalPoints;
    userScore.lastActivity = Date.now();
    
    // Calculate level based on points
    userScore.level = Math.floor(userScore.totalPoints / 100) + 1;

    console.log(`[LeaderboardService] User ${userId} gained ${additionalPoints} points from ${source}`);
    
    await this.saveUserData();
  }

  /**
   * Update module progress
   */
  async updateModuleProgress(userId, assessmentId, score) {
    // Extract module ID from assessment ID
    const moduleMatch = assessmentId.match(/^(module\d+)/);
    if (!moduleMatch) return;

    const moduleId = moduleMatch[1];
    const userScore = this.userScores.get(userId);
    
    if (userScore) {
      if (!userScore.moduleScores) {
        userScore.moduleScores = {};
      }
      
      userScore.moduleScores[moduleId] = Math.max(
        userScore.moduleScores[moduleId] || 0,
        score
      );
    }
  }

  /**
   * Mark module as completed
   */
  async markModuleCompleted(userId, moduleId) {
    const userScore = this.userScores.get(userId);
    
    if (userScore) {
      if (!userScore.completedModules) {
        userScore.completedModules = [];
      }
      
      if (!userScore.completedModules.includes(moduleId)) {
        userScore.completedModules.push(moduleId);
        userScore.modulesCompleted = userScore.completedModules.length;
      }
    }
  }

  /**
   * Update all leaderboards
   */
  async updateLeaderboards() {
    const now = Date.now();
    
    // Rate limit updates
    if (now - this.lastUpdate < this.getConfig('updateInterval')) {
      return;
    }
    
    this.lastUpdate = now;

    // Update global points leaderboard
    await this.updateGlobalPointsLeaderboard();
    
    // Update module leaderboards
    await this.updateModuleLeaderboards();
    
    // Update streak leaderboard
    await this.updateStreakLeaderboard();
    
    // Update speed leaderboard
    await this.updateSpeedLeaderboard();

    // Save updated leaderboards
    await this.saveLeaderboards();

    console.log('[LeaderboardService] Leaderboards updated');
  }

  /**
   * Update global points leaderboard
   */
  async updateGlobalPointsLeaderboard() {
    const globalLeaderboard = this.leaderboards.get('global_points');
    
    const sortedUsers = Array.from(this.userScores.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, this.getConfig('maxLeaderboardSize'))
      .map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        displayName: user.displayName,
        totalPoints: user.totalPoints,
        level: user.level,
        lastActivity: user.lastActivity
      }));

    globalLeaderboard.entries = sortedUsers;
    globalLeaderboard.lastUpdate = Date.now();
  }

  /**
   * Update module completion leaderboards
   */
  async updateModuleLeaderboards() {
    ['module1', 'module2', 'module3', 'module4'].forEach(moduleId => {
      const leaderboard = this.leaderboards.get(`${moduleId}_completion`);
      
      const moduleUsers = Array.from(this.userScores.values())
        .filter(user => user.completedModules && user.completedModules.includes(moduleId))
        .sort((a, b) => {
          // Sort by module score, then by completion time
          const scoreA = (a.moduleScores && a.moduleScores[moduleId]) || 0;
          const scoreB = (b.moduleScores && b.moduleScores[moduleId]) || 0;
          
          if (scoreA !== scoreB) {
            return scoreB - scoreA; // Higher score first
          }
          
          return a.lastActivity - b.lastActivity; // Earlier completion first
        })
        .slice(0, this.getConfig('maxLeaderboardSize'))
        .map((user, index) => ({
          rank: index + 1,
          userId: user.userId,
          displayName: user.displayName,
          moduleScore: (user.moduleScores && user.moduleScores[moduleId]) || 0,
          completedAt: user.lastActivity
        }));

      leaderboard.entries = moduleUsers;
      leaderboard.lastUpdate = Date.now();
    });
  }

  /**
   * Update streak leaderboard
   */
  async updateStreakLeaderboard() {
    const streakLeaderboard = this.leaderboards.get('streak_leaders');
    
    const sortedUsers = Array.from(this.userScores.values())
      .sort((a, b) => b.streak - a.streak)
      .slice(0, this.getConfig('maxLeaderboardSize'))
      .map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        displayName: user.displayName,
        streak: user.streak,
        lastActivity: user.lastActivity
      }));

    streakLeaderboard.entries = sortedUsers;
    streakLeaderboard.lastUpdate = Date.now();
  }

  /**
   * Update speed leaderboard
   */
  async updateSpeedLeaderboard() {
    const speedLeaderboard = this.leaderboards.get('speed_learners');
    
    // This would need more detailed timing data from actual usage
    // For now, we'll use a simplified version based on points per day
    const sortedUsers = Array.from(this.userScores.values())
      .map(user => {
        const daysActive = Math.max(1, Math.floor((Date.now() - user.joined) / (1000 * 60 * 60 * 24)));
        const pointsPerDay = user.totalPoints / daysActive;
        
        return {
          ...user,
          pointsPerDay
        };
      })
      .sort((a, b) => b.pointsPerDay - a.pointsPerDay)
      .slice(0, this.getConfig('maxLeaderboardSize'))
      .map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        displayName: user.displayName,
        pointsPerDay: Math.round(user.pointsPerDay),
        totalPoints: user.totalPoints
      }));

    speedLeaderboard.entries = sortedUsers;
    speedLeaderboard.lastUpdate = Date.now();
  }

  /**
   * Get leaderboard by type
   */
  getLeaderboard(type) {
    return this.leaderboards.get(type);
  }

  /**
   * Get all leaderboards
   */
  getAllLeaderboards() {
    return Array.from(this.leaderboards.entries()).map(([id, leaderboard]) => ({
      id,
      ...leaderboard
    }));
  }

  /**
   * Get user's ranking in a specific leaderboard
   */
  getUserRanking(userId, leaderboardType) {
    const leaderboard = this.leaderboards.get(leaderboardType);
    if (!leaderboard) return null;

    const userEntry = leaderboard.entries.find(entry => entry.userId === userId);
    return userEntry ? userEntry.rank : null;
  }

  /**
   * Get user's position relative to others
   */
  getUserComparison(userId) {
    const userScore = this.userScores.get(userId);
    if (!userScore) return null;

    const totalUsers = this.userScores.size;
    const usersWithLowerPoints = Array.from(this.userScores.values())
      .filter(user => user.totalPoints < userScore.totalPoints).length;

    const percentile = totalUsers > 1 ? Math.round((usersWithLowerPoints / (totalUsers - 1)) * 100) : 100;

    return {
      totalUsers,
      percentile,
      rank: this.getUserRanking(userId, 'global_points'),
      totalPoints: userScore.totalPoints,
      level: userScore.level
    };
  }

  /**
   * Generate anonymous display name
   */
  generateAnonymousName(userId) {
    const adjectives = [
      'Brillante', 'Rápido', 'Inteligente', 'Dedicado', 'Persistente',
      'Creativo', 'Ingenioso', 'Eficiente', 'Constante', 'Determinado'
    ];
    
    const nouns = [
      'Consultor', 'Estudiante', 'Aprendiz', 'Analista', 'Experto',
      'Investigador', 'Especialista', 'Profesional', 'Estratega', 'Mentor'
    ];

    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const adjIndex = Math.abs(hash) % adjectives.length;
    const nounIndex = Math.abs(hash >> 8) % nouns.length;
    const number = Math.abs(hash >> 16) % 1000;

    return `${adjectives[adjIndex]} ${nouns[nounIndex]} ${number}`;
  }

  /**
   * Get current user ID (simple implementation for demo)
   */
  getCurrentUserId() {
    // In a real implementation, this would get the actual user ID
    // For demo purposes, we'll use a session-based ID
    if (!this.currentUserId) {
      this.currentUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }
    return this.currentUserId;
  }

  /**
   * Load user data from storage
   */
  async loadUserData() {
    try {
      const userData = await this.storage.get('leaderboard_user_data');
      if (userData) {
        this.userScores = new Map(userData.userScores || []);
        this.currentUserId = userData.currentUserId;
      }

      const leaderboardData = await this.storage.get('leaderboard_data');
      if (leaderboardData) {
        leaderboardData.forEach(([key, value]) => {
          this.leaderboards.set(key, value);
        });
      }
    } catch (error) {
      console.warn('[LeaderboardService] Failed to load user data:', error);
    }
  }

  /**
   * Save user data to storage
   */
  async saveUserData() {
    try {
      await this.storage.set('leaderboard_user_data', {
        userScores: Array.from(this.userScores.entries()),
        currentUserId: this.currentUserId,
        lastUpdate: Date.now()
      });
    } catch (error) {
      console.warn('[LeaderboardService] Failed to save user data:', error);
    }
  }

  /**
   * Save leaderboards to storage
   */
  async saveLeaderboards() {
    try {
      await this.storage.set('leaderboard_data', Array.from(this.leaderboards.entries()));
    } catch (error) {
      console.warn('[LeaderboardService] Failed to save leaderboards:', error);
    }
  }

  /**
   * Get social stats for motivation
   */
  getSocialStats() {
    const currentUserId = this.getCurrentUserId();
    const userComparison = this.getUserComparison(currentUserId);
    const globalRank = this.getUserRanking(currentUserId, 'global_points');

    return {
      userComparison,
      globalRank,
      totalCompetitors: this.userScores.size,
      encouragementMessage: this.getEncouragementMessage(userComparison)
    };
  }

  /**
   * Get personalized encouragement message
   */
  getEncouragementMessage(comparison) {
    if (!comparison) return '¡Comienza tu viaje de aprendizaje!';

    const { percentile } = comparison;

    if (percentile >= 90) {
      return '¡Excelente! Estás entre los mejores estudiantes.';
    } else if (percentile >= 75) {
      return '¡Muy bien! Estás en el grupo de alto rendimiento.';
    } else if (percentile >= 50) {
      return '¡Buen progreso! Continúa así para mejorar tu ranking.';
    } else if (percentile >= 25) {
      return '¡Sigue adelante! Cada logro te acerca a la cima.';
    } else {
      return '¡Cada gran viaje comienza con un primer paso!';
    }
  }

  async onDestroy() {
    await this.saveUserData();
    await this.saveLeaderboards();
    
    this.leaderboards.clear();
    this.userScores.clear();
    this.userRankings.clear();
  }
}

export default LeaderboardService;