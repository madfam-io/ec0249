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
      modules: {
        module1: { theory: 0, practice: 0, assessment: false, completed: false, videos: {} },
        module2: { theory: 0, documents: 0, assessment: false, completed: false, videos: {} },
        module3: { theory: 0, documents: 0, assessment: false, completed: false, videos: {} },
        module4: { theory: 0, documents: 0, presentation: false, assessment: false, completed: false, videos: {} }
      },
      videos: {
        welcomeVideo: { viewed: false, completed: false, watchTime: 0 }
      },
      achievements: [],
      startDate: null,
      lastActivity: null
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
    
    // Add new achievements
    newAchievements.forEach(achievement => {
      this.progress.achievements.push(achievement);
      this.emit('achievement:unlocked', { achievement });
    });
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