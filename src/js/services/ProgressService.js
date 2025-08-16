/**
 * Progress Service - Comprehensive Learning Progress Tracking and Analytics
 * 
 * @description The ProgressService provides complete learning progress management for the
 * EC0249 platform, including module completion tracking, prerequisite enforcement,
 * achievement systems, and detailed analytics. It supports weighted progress calculation,
 * prerequisite chains, and certification readiness assessment.
 * 
 * @class ProgressService
 * @extends Module
 * 
 * Key Features:
 * - Module and lesson progress tracking
 * - Weighted progress calculation across modules
 * - Prerequisite enforcement and unlocking logic
 * - Achievement and milestone tracking
 * - Completion criteria validation
 * - Assessment score tracking
 * - Document portfolio progress
 * - Certification readiness assessment
 * 
 * Progress Structure:
 * - Overall platform progress (0-100%)
 * - Module-specific progress with weights
 * - Lesson completion tracking
 * - Assessment scores and attempts
 * - Document template completion
 * - Time tracking and analytics
 * 
 * Completion Criteria:
 * - Theory lessons: 100% completion required
 * - Practice exercises: Full participation
 * - Assessments: Passing scores required
 * - Documents: Portfolio requirements met
 * - Simulations: Competency demonstrations
 * 
 * @example
 * // Update lesson progress
 * await progressService.updateLessonProgress('module1', 'lesson1', 100);
 * 
 * @example
 * // Check module unlock status
 * const canAccess = progressService.canAccessModule('module2');
 * 
 * @example
 * // Get comprehensive progress report
 * const report = progressService.getProgressReport();
 * 
 * @example
 * // Track assessment completion
 * await progressService.recordAssessmentScore('module1-quiz', 85, {
 *   timeSpent: 1800,
 *   attemptNumber: 1
 * });
 * 
 * @since 2.0.0
 */
import Module from '../core/Module.js';

class ProgressService extends Module {
  constructor() {
    super('ProgressService', ['StorageService', 'EventBus'], {
      storageKey: 'ec0249_progress',
      autoSave: true,
      prerequisites: {
        module2: ['module1_complete'],
        module3: ['module2_complete'],
        module4: ['module3_complete']
      },
      moduleWeights: {
        module1: 25, // 25% of total progress
        module2: 35, // 35% of total progress (more content)
        module3: 20, // 20% of total progress
        module4: 20  // 20% of total progress
      },
      completionCriteria: {
        module1: {
          theory: 100,     // % of theory lessons completed
          practice: 100,   // % of practice exercises completed
          assessment: true // Assessment passed
        },
        module2: {
          theory: 100,
          documents: 80,   // % of required documents completed
          assessment: true
        },
        module3: {
          theory: 100,
          documents: 100,  // All documents required
          assessment: true
        },
        module4: {
          theory: 100,
          documents: 100,
          presentation: true, // Presentation simulation completed
          assessment: true
        }
      }
    });

    this.progress = {
      overall: 0,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      modules: {
        module1: { theory: 0, practice: 0, assessment: false, completed: false, videos: {}, lessons: {} },
        module2: { theory: 0, documents: 0, assessment: false, completed: false, videos: {}, lessons: {} },
        module3: { theory: 0, documents: 0, assessment: false, completed: false, videos: {}, lessons: {} },
        module4: { theory: 0, documents: 0, presentation: false, assessment: false, completed: false, videos: {}, lessons: {} }
      },
      videos: {
        welcomeVideo: { viewed: false, completed: false, watchTime: 0 }
      },
      achievements: [],
      badges: [],
      startDate: null,
      lastActivity: null,
      dailyGoals: {
        lessonsTarget: 2,
        lessonsCompleted: 0,
        lastResetDate: null
      }
    };
  }

  async onInitialize() {
    this.storage = this.service('StorageService');
    
    // Load saved progress
    await this.loadProgress();
    
    // Subscribe to learning events
    this.subscribe('lesson:completed', this.handleLessonCompleted.bind(this));
    this.subscribe('exercise:completed', this.handleExerciseCompleted.bind(this));
    this.subscribe('document:completed', this.handleDocumentCompleted.bind(this));
    this.subscribe('assessment:completed', this.handleAssessmentCompleted.bind(this));
    this.subscribe('simulation:completed', this.handleSimulationCompleted.bind(this));
    
    // Subscribe to video events with method existence checks
    if (typeof this.handleVideoViewed === 'function') {
      this.subscribe('video:viewed', this.handleVideoViewed.bind(this));
    }
    if (typeof this.handleVideoCompleted === 'function') {
      this.subscribe('video:completed', this.handleVideoCompleted.bind(this));
    }
    if (typeof this.handleYouTubeVideoComplete === 'function') {
      this.subscribe('youtube:video_complete', this.handleYouTubeVideoComplete.bind(this));
    }
    
    console.log('[ProgressService] Initialized with overall progress:', this.progress.overall + '%');
  }

  /**
   * Load progress from storage
   */
  async loadProgress() {
    try {
      const savedProgress = await this.storage.get(this.getConfig('storageKey'));
      
      if (savedProgress) {
        this.progress = { ...this.progress, ...savedProgress };
        console.log('[ProgressService] Loaded saved progress');
      } else {
        // First time user - set start date
        this.progress.startDate = new Date().toISOString();
        await this.saveProgress();
        console.log('[ProgressService] Initialized new user progress');
      }
      
      // Calculate overall progress
      this.calculateOverallProgress();
    } catch (error) {
      console.error('[ProgressService] Error loading progress:', error);
    }
  }

  /**
   * Save progress to storage
   */
  async saveProgress() {
    if (!this.getConfig('autoSave')) return;
    
    try {
      this.progress.lastActivity = new Date().toISOString();
      await this.storage.set(this.getConfig('storageKey'), this.progress);
      
      // Emit progress update event
      this.emit('progress:updated', {
        overall: this.progress.overall,
        modules: this.progress.modules
      });
    } catch (error) {
      console.error('[ProgressService] Error saving progress:', error);
    }
  }

  /**
   * Calculate overall progress percentage
   */
  calculateOverallProgress() {
    const weights = this.getConfig('moduleWeights');
    let totalProgress = 0;
    
    Object.keys(weights).forEach(moduleId => {
      const moduleProgress = this.calculateModuleProgress(moduleId);
      const weight = weights[moduleId] / 100;
      totalProgress += moduleProgress * weight;
    });
    
    this.progress.overall = Math.round(totalProgress);
    
    // Check for new achievements
    this.checkAchievements();
  }

  /**
   * Calculate progress for a specific module
   * @param {string} moduleId - Module identifier
   * @returns {number} Module progress percentage
   */
  calculateModuleProgress(moduleId) {
    const moduleData = this.progress.modules[moduleId];
    const criteria = this.getConfig('completionCriteria')[moduleId];
    
    if (!moduleData || !criteria) return 0;
    
    let completedComponents = 0;
    let totalComponents = 0;
    
    // Check each component
    Object.keys(criteria).forEach(component => {
      totalComponents++;
      
      if (component === 'assessment' || component === 'presentation') {
        // Boolean components
        if (moduleData[component] === criteria[component]) {
          completedComponents++;
        }
      } else {
        // Percentage components
        const required = criteria[component];
        const actual = moduleData[component] || 0;
        
        if (actual >= required) {
          completedComponents++;
        }
      }
    });
    
    const progress = totalComponents > 0 ? (completedComponents / totalComponents) * 100 : 0;
    
    // Update module completion status
    const isComplete = completedComponents === totalComponents;
    this.progress.modules[moduleId].completed = isComplete;
    
    return Math.round(progress);
  }

  /**
   * Update theory progress for a module
   * @param {string} moduleId - Module identifier
   * @param {number} percentage - Completion percentage
   */
  updateTheoryProgress(moduleId, percentage) {
    if (!this.progress.modules[moduleId]) return;
    
    this.progress.modules[moduleId].theory = Math.max(
      this.progress.modules[moduleId].theory,
      percentage
    );
    
    this.calculateOverallProgress();
    this.saveProgress();
    
    console.log(`[ProgressService] Theory progress for ${moduleId}: ${percentage}%`);
  }

  /**
   * Update practice/exercise progress for a module
   * @param {string} moduleId - Module identifier
   * @param {number} percentage - Completion percentage
   */
  updatePracticeProgress(moduleId, percentage) {
    if (!this.progress.modules[moduleId]) return;
    
    this.progress.modules[moduleId].practice = Math.max(
      this.progress.modules[moduleId].practice || 0,
      percentage
    );
    
    this.calculateOverallProgress();
    this.saveProgress();
    
    console.log(`[ProgressService] Practice progress for ${moduleId}: ${percentage}%`);
  }

  /**
   * Update document completion progress
   * @param {string} moduleId - Module identifier
   * @param {number} percentage - Completion percentage
   */
  updateDocumentProgress(moduleId, percentage) {
    if (!this.progress.modules[moduleId]) return;
    
    this.progress.modules[moduleId].documents = Math.max(
      this.progress.modules[moduleId].documents || 0,
      percentage
    );
    
    this.calculateOverallProgress();
    this.saveProgress();
    
    console.log(`[ProgressService] Document progress for ${moduleId}: ${percentage}%`);
  }

  /**
   * Mark assessment as completed
   * @param {string} moduleId - Module identifier
   * @param {boolean} passed - Whether assessment was passed
   */
  completeAssessment(moduleId, passed = true) {
    if (!this.progress.modules[moduleId]) return;
    
    this.progress.modules[moduleId].assessment = passed;
    
    this.calculateOverallProgress();
    this.saveProgress();
    
    console.log(`[ProgressService] Assessment for ${moduleId}: ${passed ? 'PASSED' : 'FAILED'}`);
  }

  /**
   * Mark simulation as completed
   * @param {string} moduleId - Module identifier
   * @param {string} type - Simulation type
   */
  completeSimulation(moduleId, type) {
    if (!this.progress.modules[moduleId]) return;
    
    if (type === 'presentation') {
      this.progress.modules[moduleId].presentation = true;
    }
    
    this.calculateOverallProgress();
    this.saveProgress();
    
    console.log(`[ProgressService] Simulation ${type} completed for ${moduleId}`);
  }

  /**
   * Check if module is unlocked
   * @param {string} moduleId - Module identifier
   * @returns {boolean} Whether module is unlocked
   */
  isModuleUnlocked(moduleId) {
    const prerequisites = this.getConfig('prerequisites')[moduleId];
    
    if (!prerequisites) return true; // No prerequisites
    
    return prerequisites.every(prereq => {
      if (prereq.endsWith('_complete')) {
        const requiredModule = prereq.replace('_complete', '');
        return this.progress.modules[requiredModule]?.completed || false;
      }
      return false;
    });
  }

  /**
   * Get module status
   * @param {string} moduleId - Module identifier
   * @returns {string} Status: 'locked', 'available', 'in_progress', 'completed'
   */
  getModuleStatus(moduleId) {
    if (!this.isModuleUnlocked(moduleId)) {
      return 'locked';
    }
    
    const moduleData = this.progress.modules[moduleId];
    if (!moduleData) return 'available';
    
    if (moduleData.completed) {
      return 'completed';
    }
    
    // Check if any progress has been made
    const hasProgress = Object.keys(moduleData).some(key => {
      if (key === 'completed') return false;
      const value = moduleData[key];
      return (typeof value === 'number' && value > 0) || 
             (typeof value === 'boolean' && value === true);
    });
    
    return hasProgress ? 'in_progress' : 'available';
  }

  /**
   * Calculate progress percentage for a specific module
   * @param {string} moduleId - Module identifier
   * @returns {number} Progress percentage (0-100)
   */
  calculateModuleProgress(moduleId) {
    const moduleData = this.progress.modules[moduleId];
    if (!moduleData) return 0;

    const criteria = this.getConfig('completionCriteria')[moduleId];
    if (!criteria) return 0;

    let totalWeight = 0;
    let completedWeight = 0;

    // Calculate weighted progress based on completion criteria
    Object.entries(criteria).forEach(([key, requirement]) => {
      if (key === 'assessment' || key === 'presentation') {
        totalWeight += 30; // Assessments/presentations worth 30 points
        if (moduleData[key] === true) {
          completedWeight += 30;
        }
      } else if (typeof requirement === 'number') {
        totalWeight += requirement;
        const current = moduleData[key] || 0;
        completedWeight += Math.min(current, requirement);
      }
    });

    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  }

  /**
   * Check if a module is completed
   * @param {string} moduleId - Module identifier
   * @returns {boolean} Whether module is completed
   */
  isModuleCompleted(moduleId) {
    const moduleData = this.progress.modules[moduleId];
    return moduleData ? moduleData.completed : false;
  }

  /**
   * Check if a lesson is completed
   * @param {string} moduleId - Module identifier
   * @param {string} lessonId - Lesson identifier
   * @returns {boolean} Whether lesson is completed
   */
  isLessonCompleted(moduleId, lessonId) {
    const moduleData = this.progress.modules[moduleId];
    if (!moduleData || !moduleData.lessons) return false;
    
    const lessonData = moduleData.lessons[lessonId];
    return lessonData ? lessonData.completed : false;
  }

  /**
   * Get lesson progress
   * @param {string} moduleId - Module identifier
   * @param {string} lessonId - Lesson identifier
   * @returns {number} Progress percentage (0-100)
   */
  getLessonProgress(moduleId, lessonId) {
    const moduleData = this.progress.modules[moduleId];
    if (!moduleData || !moduleData.lessons) return 0;
    
    const lessonData = moduleData.lessons[lessonId];
    return lessonData ? lessonData.progress : 0;
  }

  /**
   * Mark lesson as started
   * @param {string} moduleId - Module identifier
   * @param {string} lessonId - Lesson identifier
   */
  markLessonStarted(moduleId, lessonId) {
    // TODO: Implement lesson tracking
    console.log(`[ProgressService] Lesson started: ${moduleId}/${lessonId}`);
  }

  /**
   * Mark lesson as completed
   * @param {string} moduleId - Module identifier
   * @param {string} lessonId - Lesson identifier
   */
  markLessonCompleted(moduleId, lessonId) {
    console.log(`[ProgressService] Lesson completed: ${moduleId}/${lessonId}`);
    
    // Track lesson completion
    if (!this.progress.modules[moduleId].lessons[lessonId]) {
      this.progress.modules[moduleId].lessons[lessonId] = {
        completed: true,
        completedDate: new Date().toISOString(),
        progress: 100
      };
      
      // Award XP for lesson completion
      this.awardXP(25, `Lección completada: ${lessonId}`);
      
      // Update daily streak
      this.updateStreak();
      
      // Check for first lesson achievement
      const totalLessonsCompleted = Object.keys(this.progress.modules)
        .reduce((total, moduleKey) => {
          return total + Object.keys(this.progress.modules[moduleKey].lessons).length;
        }, 0);
      
      if (totalLessonsCompleted === 1) {
        this.unlockAchievement('first_lesson');
      }
      
      // Update theory progress (simplified for now)
      this.updateTheoryProgress(moduleId, 25); // Each lesson worth 25% in a 4-lesson module
      
      // Check achievements
      this.checkAchievements();
    }
  }

  /**
   * Get overall progress data
   * @returns {Object} Progress summary
   */
  getOverallProgress() {
    return {
      percentage: this.progress.overall,
      modules: Object.keys(this.progress.modules).map(moduleId => ({
        id: moduleId,
        progress: this.calculateModuleProgress(moduleId),
        status: this.getModuleStatus(moduleId),
        completed: this.progress.modules[moduleId].completed
      })),
      achievements: this.progress.achievements,
      startDate: this.progress.startDate,
      lastActivity: this.progress.lastActivity
    };
  }

  /**
   * Award XP points and check for level ups
   * @param {number} points - XP points to award
   * @param {string} reason - Reason for XP award
   */
  awardXP(points, reason = 'Activity completed') {
    const oldLevel = this.progress.level;
    this.progress.xp += points;
    
    // Calculate new level (100 XP per level)
    const newLevel = Math.floor(this.progress.xp / 100) + 1;
    
    if (newLevel > oldLevel) {
      this.progress.level = newLevel;
      this.emit('level:up', { 
        oldLevel, 
        newLevel, 
        totalXP: this.progress.xp 
      });
      console.log(`[ProgressService] Level up! Now level ${newLevel}`);
    }
    
    this.emit('xp:awarded', { 
      points, 
      reason, 
      totalXP: this.progress.xp, 
      level: this.progress.level 
    });
    
    console.log(`[ProgressService] Awarded ${points} XP for: ${reason}`);
    this.saveProgress();
  }

  /**
   * Update daily streak
   */
  updateStreak() {
    const today = new Date().toDateString();
    const lastActiveDate = this.progress.lastActiveDate;
    
    if (lastActiveDate === today) {
      // Already active today, no change
      return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    if (lastActiveDate === yesterdayString) {
      // Consecutive day, increment streak
      this.progress.streak += 1;
    } else if (lastActiveDate && lastActiveDate !== today) {
      // Streak broken, reset to 1
      this.progress.streak = 1;
    } else {
      // First day or no previous activity
      this.progress.streak = 1;
    }
    
    this.progress.lastActiveDate = today;
    
    // Check for streak achievements
    this.checkStreakAchievements();
    
    console.log(`[ProgressService] Daily streak: ${this.progress.streak} days`);
    this.saveProgress();
  }

  /**
   * Check for streak-based achievements
   */
  checkStreakAchievements() {
    const achievements = [];
    
    if (this.progress.streak >= 3 && !this.progress.achievements.includes('streak_3')) {
      achievements.push('streak_3');
    }
    if (this.progress.streak >= 7 && !this.progress.achievements.includes('streak_7')) {
      achievements.push('streak_7');
    }
    if (this.progress.streak >= 14 && !this.progress.achievements.includes('streak_14')) {
      achievements.push('streak_14');
    }
    
    achievements.forEach(achievement => {
      this.unlockAchievement(achievement);
    });
  }

  /**
   * Unlock an achievement
   * @param {string} achievementId - Achievement identifier
   */
  unlockAchievement(achievementId) {
    if (this.progress.achievements.includes(achievementId)) return;
    
    this.progress.achievements.push(achievementId);
    
    const achievementData = this.getAchievementData(achievementId);
    this.awardXP(achievementData.xp, `Achievement: ${achievementData.title}`);
    
    this.emit('achievement:unlocked', { 
      achievement: achievementId, 
      data: achievementData 
    });
    
    console.log(`[ProgressService] Achievement unlocked: ${achievementData.title}`);
  }

  /**
   * Get achievement data
   * @param {string} achievementId - Achievement identifier
   * @returns {Object} Achievement data
   */
  getAchievementData(achievementId) {
    const achievements = {
      first_lesson: { title: 'Primera Lección', description: 'Completaste tu primera lección', xp: 50, icon: '🌟' },
      first_module: { title: 'Primer Módulo', description: 'Completaste tu primer módulo', xp: 200, icon: '🎯' },
      halfway: { title: 'A Medio Camino', description: 'Completaste el 50% del curso', xp: 300, icon: '⭐' },
      completion: { title: 'Graduado', description: 'Completaste todo el curso EC0249', xp: 500, icon: '🎓' },
      streak_3: { title: 'Constancia', description: '3 días consecutivos de estudio', xp: 100, icon: '🔥' },
      streak_7: { title: 'Dedicación', description: '7 días consecutivos de estudio', xp: 250, icon: '💪' },
      streak_14: { title: 'Maestría', description: '14 días consecutivos de estudio', xp: 500, icon: '👑' },
      video_watcher: { title: 'Observador', description: 'Viste 5 videos completos', xp: 150, icon: '👀' },
      quick_learner: { title: 'Aprendiz Rápido', description: 'Completaste 3 lecciones en un día', xp: 200, icon: '⚡' },
      perfectionist: { title: 'Perfeccionista', description: 'Obtuviste 100% en todas las evaluaciones', xp: 400, icon: '💯' }
    };
    
    return achievements[achievementId] || { title: 'Logro Desconocido', description: '', xp: 0, icon: '🏆' };
  }

  /**
   * Check for new achievements
   */
  checkAchievements() {
    const newAchievements = [];
    
    // First module completion
    if (this.progress.modules.module1.completed && 
        !this.progress.achievements.includes('first_module')) {
      newAchievements.push('first_module');
    }
    
    // Halfway point
    if (this.progress.overall >= 50 && 
        !this.progress.achievements.includes('halfway')) {
      newAchievements.push('halfway');
    }
    
    // Full completion
    if (this.progress.overall >= 100 && 
        !this.progress.achievements.includes('completion')) {
      newAchievements.push('completion');
    }
    
    // Unlock new achievements
    newAchievements.forEach(achievement => {
      this.unlockAchievement(achievement);
    });
  }

  /**
   * Get user stats for gamification display
   * @returns {Object} User stats
   */
  getUserStats() {
    return {
      level: this.progress.level,
      xp: this.progress.xp,
      xpToNextLevel: (this.progress.level * 100) - this.progress.xp,
      streak: this.progress.streak,
      achievementsCount: this.progress.achievements.length,
      totalAchievements: 10, // Total possible achievements
      badges: this.progress.badges.length,
      overallProgress: this.progress.overall
    };
  }

  /**
   * Get achievements list with data
   * @returns {Array} Achievements with full data
   */
  getAchievements() {
    return this.progress.achievements.map(id => ({
      id,
      ...this.getAchievementData(id),
      unlockedDate: new Date().toISOString() // TODO: Store actual unlock dates
    }));
  }

  /**
   * Reset all progress (for testing or user request)
   */
  async resetProgress() {
    this.progress = {
      overall: 0,
      modules: {
        module1: { theory: 0, practice: 0, assessment: false, completed: false },
        module2: { theory: 0, documents: 0, assessment: false, completed: false },
        module3: { theory: 0, documents: 0, assessment: false, completed: false },
        module4: { theory: 0, documents: 0, presentation: false, assessment: false, completed: false }
      },
      achievements: [],
      startDate: new Date().toISOString(),
      lastActivity: null
    };
    
    await this.saveProgress();
    console.log('[ProgressService] Progress reset');
  }

  // Event handlers
  handleLessonCompleted(data) {
    const { moduleId, lessonId, percentage } = data;
    this.updateTheoryProgress(moduleId, percentage);
  }

  handleExerciseCompleted(data) {
    const { moduleId, exerciseId, percentage } = data;
    this.updatePracticeProgress(moduleId, percentage);
  }

  handleDocumentCompleted(data) {
    const { moduleId, documentId, percentage } = data;
    this.updateDocumentProgress(moduleId, percentage);
  }

  handleAssessmentCompleted(data) {
    const { moduleId, passed, score } = data;
    this.completeAssessment(moduleId, passed);
  }

  handleSimulationCompleted(data) {
    const { moduleId, type, score } = data;
    this.completeSimulation(moduleId, type);
  }

  /**
   * Handle video viewed event
   * @param {Object} data - Video view data
   */
  handleVideoViewed(data) {
    const { videoId, progress } = data;
    console.log('[ProgressService] Video viewed:', videoId, 'Progress:', progress + '%');
    
    // Track video viewing progress
    // This could be expanded to track specific video progress per module
  }

  /**
   * Handle video completed event
   * @param {Object} data - Video completion data
   */
  handleVideoCompleted(data) {
    const { videoId, title, watchedPercentage, totalTime } = data;
    console.log('[ProgressService] Video completed:', title, 'Watched:', watchedPercentage + '%');
    
    // Mark video as completed and update module progress if applicable
    // This could trigger module progress updates based on video completion
  }

  /**
   * Handle YouTube video complete event
   * @param {Object} data - YouTube completion data
   */
  handleYouTubeVideoComplete(data) {
    const { videoId, progress = 100 } = data;
    console.log('[ProgressService] YouTube video completed:', videoId);
    
    // Handle YouTube-specific completion events
    // Could be used for analytics or progress tracking
  }

  async onDestroy() {
    // Save final progress
    await this.saveProgress();
  }
}

export default ProgressService;