/**
 * Assessment Engine - Knowledge verification and quiz management system
 * Handles interactive assessments, progress tracking, and competency evaluation
 * Refactored for better modularity with extracted components
 */
import Module from '../core/Module.js';
import QuestionTypes from '../assessment/QuestionTypes.js';
import AssessmentDefinitions from '../assessment/AssessmentDefinitions.js';
import ScoringEngine from '../assessment/ScoringEngine.js';

class AssessmentEngine extends Module {
  constructor() {
    super('AssessmentEngine', ['StateManager', 'I18nService', 'StorageService'], {
      autoSave: true,
      saveInterval: 30000,
      minPassingScore: 70,
      maxAttempts: 3,
      questionTypes: ['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching'],
      shuffleQuestions: true,
      shuffleOptions: true
    });

    this.assessments = new Map();
    this.userResponses = new Map();
    this.assessmentResults = new Map();
    this.currentAssessment = null;
    this.currentQuestion = 0;
    this.timer = null;
    this.timeRemaining = 0;

    // Assessment components
    this.questionTypes = null;
    this.assessmentDefinitions = null;
    this.scoringEngine = null;
  }

  async onInitialize() {
    this.stateManager = this.service('StateManager');
    this.i18n = this.service('I18nService');
    this.storage = this.service('StorageService');

    // Initialize assessment components
    this.questionTypes = new QuestionTypes();
    this.assessmentDefinitions = new AssessmentDefinitions();
    this.scoringEngine = new ScoringEngine();

    // Subscribe to assessment events
    this.subscribe('assessment:start', this.handleAssessmentStart.bind(this));
    this.subscribe('assessment:submit', this.handleAssessmentSubmit.bind(this));
    this.subscribe('assessment:complete', this.handleAssessmentComplete.bind(this));
    this.subscribe('question:answer', this.handleQuestionAnswer.bind(this));
    this.subscribe('timer:update', this.handleTimerUpdate.bind(this));

    // Load assessment definitions
    await this.loadAssessmentDefinitions();
    
    // Load user progress
    await this.loadUserProgress();

    console.log('[AssessmentEngine] Initialized');
  }

  /**
   * Load assessment definitions from AssessmentDefinitions component
   */
  async loadAssessmentDefinitions() {
    try {
      // Get all assessments from definitions component
      const definitions = this.assessmentDefinitions.getAllAssessments();
      
      // Copy to local assessments map
      definitions.forEach((assessment, id) => {
        this.assessments.set(id, assessment);
      });

      console.log('[AssessmentEngine] Loaded', this.assessments.size, 'assessment definitions');
    } catch (error) {
      console.error('[AssessmentEngine] Failed to load assessment definitions:', error);
      throw error;
    }
  }

  /**
   * Start an assessment
   * @param {string} assessmentId - Assessment ID
   * @param {Object} options - Assessment options
   * @returns {Object} Assessment session data
   */
  async startAssessment(assessmentId, options = {}) {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    // Check attempt limits
    const userHistory = await this.getUserAssessmentHistory(assessmentId);
    if (userHistory.attempts >= assessment.allowedAttempts) {
      throw new Error('Maximum attempts exceeded');
    }

    // Prepare assessment session
    const sessionId = this.generateSessionId();
    const questions = this.prepareQuestions(assessment, options);
    
    this.currentAssessment = {
      id: sessionId,
      assessmentId,
      questions,
      startTime: Date.now(),
      timeLimit: assessment.timeLimit || 3600, // Default 1 hour
      responses: new Map(),
      currentQuestionIndex: 0,
      status: 'in_progress'
    };

    // Start timer if time limit exists
    if (assessment.timeLimit) {
      this.startTimer(assessment.timeLimit);
    }

    // Save session
    await this.saveAssessmentSession();

    this.emit('assessment:started', {
      sessionId,
      assessmentId,
      totalQuestions: questions.length,
      timeLimit: assessment.timeLimit
    });

    return {
      sessionId,
      assessment: assessment,
      firstQuestion: questions[0],
      totalQuestions: questions.length,
      timeLimit: assessment.timeLimit
    };
  }

  /**
   * Submit answer for current question
   * @param {string} sessionId - Session ID
   * @param {string} questionId - Question ID
   * @param {*} answer - User's answer
   * @returns {Object} Submission result
   */
  async submitAnswer(sessionId, questionId, answer) {
    if (!this.currentAssessment || this.currentAssessment.id !== sessionId) {
      throw new Error('Invalid session');
    }

    const question = this.currentAssessment.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Store response
    this.currentAssessment.responses.set(questionId, {
      questionId,
      answer,
      timestamp: Date.now(),
      timeSpent: Date.now() - (this.currentAssessment.questionStartTime || Date.now())
    });

    // Move to next question
    this.currentAssessment.currentQuestionIndex++;

    // Save progress
    await this.saveAssessmentSession();

    const isLastQuestion = this.currentAssessment.currentQuestionIndex >= this.currentAssessment.questions.length;
    
    this.emit('question:answered', {
      sessionId,
      questionId,
      answer,
      isLastQuestion,
      progress: (this.currentAssessment.currentQuestionIndex / this.currentAssessment.questions.length) * 100
    });

    if (isLastQuestion) {
      return await this.completeAssessment(sessionId);
    }

    return {
      nextQuestion: this.currentAssessment.questions[this.currentAssessment.currentQuestionIndex],
      progress: (this.currentAssessment.currentQuestionIndex / this.currentAssessment.questions.length) * 100
    };
  }

  /**
   * Complete assessment and calculate score
   * @param {string} sessionId - Session ID
   * @returns {Object} Assessment results
   */
  async completeAssessment(sessionId) {
    if (!this.currentAssessment || this.currentAssessment.id !== sessionId) {
      throw new Error('Invalid session');
    }

    const assessment = this.assessments.get(this.currentAssessment.assessmentId);
    this.currentAssessment.endTime = Date.now();
    this.currentAssessment.status = 'completed';

    // Stop timer
    this.stopTimer();

    // Calculate score using ScoringEngine
    const scoreResult = this.scoringEngine.calculateScore(
      assessment,
      this.currentAssessment.responses,
      {
        timeSpent: (this.currentAssessment.endTime - this.currentAssessment.startTime) / 1000,
        method: 'standard'
      }
    );

    // Store results
    const results = {
      sessionId,
      assessmentId: this.currentAssessment.assessmentId,
      score: scoreResult,
      completedAt: this.currentAssessment.endTime,
      duration: this.currentAssessment.endTime - this.currentAssessment.startTime,
      responses: Array.from(this.currentAssessment.responses.entries())
    };

    this.assessmentResults.set(sessionId, results);
    await this.saveAssessmentResults(results);

    // Update user history
    await this.updateUserAssessmentHistory(this.currentAssessment.assessmentId, results);

    this.emit('assessment:completed', {
      sessionId,
      results: scoreResult,
      passed: scoreResult.passed
    });

    // Clear current assessment
    this.currentAssessment = null;

    return results;
  }

  /**
   * Get assessment by ID
   * @param {string} assessmentId - Assessment ID
   * @returns {Object|null} Assessment definition
   */
  getAssessment(assessmentId) {
    return this.assessments.get(assessmentId) || null;
  }

  /**
   * Get assessments by module
   * @param {string} moduleId - Module ID
   * @returns {Array} Module assessments
   */
  getAssessmentsByModule(moduleId) {
    return this.assessmentDefinitions.getAssessmentsByModule(moduleId);
  }

  /**
   * Get user's assessment history
   * @param {string} assessmentId - Assessment ID
   * @returns {Object} User history
   */
  async getUserAssessmentHistory(assessmentId) {
    try {
      const history = await this.storage.get(`assessment_history_${assessmentId}`) || {
        attempts: 0,
        bestScore: 0,
        lastAttempt: null,
        results: []
      };
      return history;
    } catch (error) {
      console.warn('[AssessmentEngine] Failed to load user history:', error);
      return { attempts: 0, bestScore: 0, lastAttempt: null, results: [] };
    }
  }

  /**
   * Prepare questions for assessment
   * @param {Object} assessment - Assessment definition
   * @param {Object} options - Preparation options
   * @returns {Array} Prepared questions
   */
  prepareQuestions(assessment, options = {}) {
    let questions = [...assessment.questions];

    // Shuffle questions if enabled
    if (this.getConfig('shuffleQuestions') && !options.preserveOrder) {
      questions = this.shuffleArray(questions);
    }

    // Shuffle options for multiple choice questions
    if (this.getConfig('shuffleOptions')) {
      questions = questions.map(question => {
        if (question.type === 'multiple_choice' && question.options) {
          const shuffledOptions = this.shuffleArray([...question.options]);
          // Update correct answer index
          const correctOption = question.options[question.correct];
          const newCorrectIndex = shuffledOptions.indexOf(correctOption);
          
          return {
            ...question,
            options: shuffledOptions,
            correct: newCorrectIndex
          };
        }
        return question;
      });
    }

    return questions;
  }

  /**
   * Start assessment timer
   * @param {number} timeLimit - Time limit in seconds
   */
  startTimer(timeLimit) {
    this.timeRemaining = timeLimit;
    this.timer = setInterval(() => {
      this.timeRemaining--;
      
      this.emit('timer:tick', {
        timeRemaining: this.timeRemaining,
        timeLimit
      });

      if (this.timeRemaining <= 0) {
        this.handleTimeExpired();
      }
    }, 1000);
  }

  /**
   * Stop assessment timer
   */
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Handle timer expiration
   */
  async handleTimeExpired() {
    this.stopTimer();
    
    if (this.currentAssessment) {
      this.emit('assessment:time_expired', {
        sessionId: this.currentAssessment.id
      });
      
      // Auto-complete assessment
      await this.completeAssessment(this.currentAssessment.id);
    }
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Shuffle array elements
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Event Handlers
   */
  async handleAssessmentStart(data) {
    await this.startAssessment(data.assessmentId, data.options);
  }

  async handleAssessmentSubmit(data) {
    await this.submitAnswer(data.sessionId, data.questionId, data.answer);
  }

  async handleAssessmentComplete(data) {
    await this.completeAssessment(data.sessionId);
  }

  handleQuestionAnswer(data) {
    console.log('[AssessmentEngine] Question answered:', data);
  }

  handleTimerUpdate(data) {
    if (this.currentAssessment) {
      this.timeRemaining = data.timeRemaining;
    }
  }

  /**
   * Progress management
   */
  async loadUserProgress() {
    try {
      const progress = await this.storage.get('assessment_progress');
      if (progress) {
        this.assessmentResults = new Map(progress.results || []);
      }
    } catch (error) {
      console.warn('[AssessmentEngine] Failed to load progress:', error);
    }
  }

  async saveAssessmentSession() {
    if (!this.currentAssessment) return;

    try {
      await this.storage.set('current_assessment_session', {
        ...this.currentAssessment,
        responses: Array.from(this.currentAssessment.responses.entries())
      });
    } catch (error) {
      console.warn('[AssessmentEngine] Failed to save session:', error);
    }
  }

  async saveAssessmentResults(results) {
    try {
      await this.storage.set('assessment_progress', {
        results: Array.from(this.assessmentResults.entries()),
        lastUpdate: Date.now()
      });
    } catch (error) {
      console.warn('[AssessmentEngine] Failed to save results:', error);
    }
  }

  async updateUserAssessmentHistory(assessmentId, results) {
    try {
      const history = await this.getUserAssessmentHistory(assessmentId);
      
      history.attempts++;
      history.lastAttempt = results.completedAt;
      
      if (results.score.percentage > history.bestScore) {
        history.bestScore = results.score.percentage;
      }
      
      history.results.push({
        sessionId: results.sessionId,
        score: results.score.percentage,
        passed: results.score.passed,
        completedAt: results.completedAt
      });

      await this.storage.set(`assessment_history_${assessmentId}`, history);
    } catch (error) {
      console.warn('[AssessmentEngine] Failed to update history:', error);
    }
  }

  async onDestroy() {
    // Stop timer
    this.stopTimer();
    
    // Save current session if exists
    if (this.currentAssessment) {
      await this.saveAssessmentSession();
    }

    // Clear data
    this.assessments.clear();
    this.userResponses.clear();
    this.assessmentResults.clear();
    this.currentAssessment = null;
  }
}

export default AssessmentEngine;