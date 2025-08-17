/**
 * Quiz Renderer Component - Enhanced Interactive Assessments
 * 
 * @description Advanced quiz system with immediate feedback, multiple question types,
 * progress tracking, and mobile-optimized interface. Supports various question formats
 * including multiple choice, true/false, fill-in-the-blank, and more.
 * 
 * Features:
 * - Multiple question types with immediate feedback
 * - Mobile-first responsive design
 * - Progress tracking and scoring
 * - Accessibility compliance
 * - Time limits and restrictions
 * - Detailed result analytics
 * 
 * @class QuizRenderer
 * @since 2.0.0
 */

class QuizRenderer {
  constructor(container, eventBus) {
    this.container = container;
    this.eventBus = eventBus;
    this.currentQuiz = null;
    this.currentQuestionIndex = 0;
    this.userAnswers = new Map();
    this.questionStartTime = null;
    this.quizStartTime = null;
    this.timeLimit = null;
    this.timer = null;
    this.isCompleted = false;
    this.showImmediateFeedback = true;
    this.allowRetries = true;
    
    this.init();
  }

  /**
   * Initialize quiz renderer
   */
  init() {
    this.createQuizContainer();
    this.bindEvents();
    
    console.log('[QuizRenderer] Initialized');
  }

  /**
   * Create quiz container structure
   */
  createQuizContainer() {
    this.element = document.createElement('div');
    this.element.className = 'quiz-container';
    this.element.innerHTML = `
      <div class="quiz-header">
        <div class="quiz-info">
          <h2 class="quiz-title"></h2>
          <p class="quiz-description"></p>
        </div>
        <div class="quiz-progress">
          <div class="progress-indicator">
            <span class="current-question">1</span>
            <span class="progress-separator">/</span>
            <span class="total-questions">1</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
        <div class="quiz-timer" style="display: none;">
          <div class="timer-icon">⏱️</div>
          <span class="timer-text">00:00</span>
        </div>
      </div>

      <div class="quiz-content">
        <div class="question-container">
          <!-- Question content will be inserted here -->
        </div>
      </div>

      <div class="quiz-controls">
        <button class="btn btn-secondary prev-question" disabled>
          <span class="btn-icon">←</span>
          <span class="btn-text">Anterior</span>
        </button>
        <button class="btn btn-primary next-question" disabled>
          <span class="btn-text">Siguiente</span>
          <span class="btn-icon">→</span>
        </button>
        <button class="btn btn-success submit-quiz" style="display: none;">
          <span class="btn-icon">✓</span>
          <span class="btn-text">Finalizar Quiz</span>
        </button>
      </div>

      <div class="question-feedback" style="display: none;">
        <div class="feedback-content">
          <div class="feedback-header">
            <div class="feedback-icon"></div>
            <div class="feedback-status">
              <h4 class="feedback-title"></h4>
              <p class="feedback-message"></p>
            </div>
          </div>
          <div class="feedback-explanation" style="display: none;">
            <h5>Explicación:</h5>
            <p class="explanation-text"></p>
          </div>
        </div>
      </div>

      <div class="quiz-results" style="display: none;">
        <div class="results-content">
          <div class="results-header">
            <div class="results-icon">🎯</div>
            <h3 class="results-title">Resultados del Quiz</h3>
          </div>
          <div class="results-summary">
            <div class="score-display">
              <div class="score-circle">
                <div class="score-value">0%</div>
                <div class="score-label">Puntuación</div>
              </div>
            </div>
            <div class="results-details">
              <div class="result-item">
                <span class="result-label">Respuestas correctas:</span>
                <span class="result-value correct-count">0</span>
              </div>
              <div class="result-item">
                <span class="result-label">Total de preguntas:</span>
                <span class="result-value total-count">0</span>
              </div>
              <div class="result-item">
                <span class="result-label">Tiempo empleado:</span>
                <span class="result-value time-spent">0:00</span>
              </div>
            </div>
          </div>
          <div class="results-actions">
            <button class="btn btn-secondary retry-quiz">
              <span class="btn-icon">🔄</span>
              <span class="btn-text">Intentar de Nuevo</span>
            </button>
            <button class="btn btn-primary continue-learning">
              <span class="btn-text">Continuar Aprendiendo</span>
              <span class="btn-icon">→</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (this.container) {
      this.container.appendChild(this.element);
    }

    // Store references to key elements
    this.titleElement = this.element.querySelector('.quiz-title');
    this.descriptionElement = this.element.querySelector('.quiz-description');
    this.questionContainer = this.element.querySelector('.question-container');
    this.currentQuestionElement = this.element.querySelector('.current-question');
    this.totalQuestionsElement = this.element.querySelector('.total-questions');
    this.progressBar = this.element.querySelector('.progress-fill');
    this.timerElement = this.element.querySelector('.quiz-timer');
    this.timerText = this.element.querySelector('.timer-text');
    this.prevButton = this.element.querySelector('.prev-question');
    this.nextButton = this.element.querySelector('.next-question');
    this.submitButton = this.element.querySelector('.submit-quiz');
    this.feedbackElement = this.element.querySelector('.question-feedback');
    this.resultsElement = this.element.querySelector('.quiz-results');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    this.prevButton.addEventListener('click', () => this.previousQuestion());
    this.nextButton.addEventListener('click', () => this.nextQuestion());
    this.submitButton.addEventListener('click', () => this.submitQuiz());
    
    const retryButton = this.element.querySelector('.retry-quiz');
    const continueButton = this.element.querySelector('.continue-learning');
    
    retryButton?.addEventListener('click', () => this.retryQuiz());
    continueButton?.addEventListener('click', () => this.continueToNext());
  }

  /**
   * Load and start a quiz
   */
  loadQuiz(quizConfig) {
    if (!quizConfig || !quizConfig.questions || quizConfig.questions.length === 0) {
      console.error('[QuizRenderer] Invalid quiz configuration');
      return;
    }

    this.currentQuiz = quizConfig;
    this.currentQuestionIndex = 0;
    this.userAnswers.clear();
    this.isCompleted = false;
    this.quizStartTime = Date.now();

    // Setup quiz configuration
    this.showImmediateFeedback = quizConfig.immediateFeedback !== false;
    this.allowRetries = quizConfig.allowRetries !== false;
    this.timeLimit = quizConfig.timeLimit || null;

    // Update quiz header
    this.titleElement.textContent = quizConfig.title || 'Quiz Interactivo';
    this.descriptionElement.textContent = quizConfig.description || '';
    this.totalQuestionsElement.textContent = quizConfig.questions.length;

    // Setup timer if needed
    if (this.timeLimit) {
      this.setupTimer();
    } else {
      this.timerElement.style.display = 'none';
    }

    // Hide results and show quiz content
    this.resultsElement.style.display = 'none';
    this.element.querySelector('.quiz-content').style.display = 'block';
    this.element.querySelector('.quiz-controls').style.display = 'flex';

    // Load first question
    this.loadQuestion(0);

    // Emit quiz started event
    this.eventBus?.publish('quiz:started', {
      quizId: quizConfig.id,
      title: quizConfig.title,
      questionCount: quizConfig.questions.length
    });
  }

  /**
   * Load a specific question
   */
  loadQuestion(index) {
    if (!this.currentQuiz || index < 0 || index >= this.currentQuiz.questions.length) {
      return;
    }

    this.currentQuestionIndex = index;
    this.questionStartTime = Date.now();
    const question = this.currentQuiz.questions[index];

    // Update progress
    this.updateProgress();
    this.updateNavigationButtons();

    // Hide previous feedback
    this.hideFeedback();

    // Render question based on type
    switch (question.type) {
      case 'multiple_choice':
        this.renderMultipleChoiceQuestion(question);
        break;
      case 'true_false':
        this.renderTrueFalseQuestion(question);
        break;
      case 'fill_blank':
        this.renderFillBlankQuestion(question);
        break;
      case 'matching':
        this.renderMatchingQuestion(question);
        break;
      case 'ordering':
        this.renderOrderingQuestion(question);
        break;
      default:
        console.warn('[QuizRenderer] Unknown question type:', question.type);
        this.renderGenericQuestion(question);
    }

    // Emit question loaded event
    this.eventBus?.publish('quiz:question_loaded', {
      questionIndex: index,
      questionType: question.type,
      questionId: question.id
    });
  }

  /**
   * Render multiple choice question
   */
  renderMultipleChoiceQuestion(question) {
    const savedAnswer = this.userAnswers.get(question.id);
    
    this.questionContainer.innerHTML = `
      <div class="question multiple-choice-question">
        <div class="question-header">
          <h3 class="question-text">${question.question}</h3>
          ${question.image ? `<img src="${question.image}" alt="Imagen de la pregunta" class="question-image">` : ''}
        </div>
        
        <div class="question-options">
          ${question.options.map((option, index) => {
            const optionId = `option_${question.id}_${index}`;
            const isSelected = savedAnswer === option.id;
            
            return `
              <label class="option-label ${isSelected ? 'selected' : ''}" for="${optionId}">
                <input type="radio" 
                       id="${optionId}"
                       name="question_${question.id}" 
                       value="${option.id}"
                       ${isSelected ? 'checked' : ''}
                       class="option-input">
                <div class="option-content">
                  <div class="option-indicator"></div>
                  <div class="option-text">
                    ${option.icon ? `<span class="option-icon">${option.icon}</span>` : ''}
                    <span class="option-label-text">${option.text}</span>
                  </div>
                </div>
              </label>
            `;
          }).join('')}
        </div>
        
        ${this.showImmediateFeedback ? `
          <div class="question-actions">
            <button class="btn btn-primary check-answer" disabled>
              <span class="btn-icon">✓</span>
              <span class="btn-text">Verificar Respuesta</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    this.setupQuestionInteractions(question);
  }

  /**
   * Render true/false question
   */
  renderTrueFalseQuestion(question) {
    const savedAnswer = this.userAnswers.get(question.id);
    
    this.questionContainer.innerHTML = `
      <div class="question true-false-question">
        <div class="question-header">
          <h3 class="question-text">${question.question}</h3>
          ${question.image ? `<img src="${question.image}" alt="Imagen de la pregunta" class="question-image">` : ''}
        </div>
        
        <div class="true-false-options">
          <label class="option-label large-option ${savedAnswer === 'true' ? 'selected' : ''}" for="true_${question.id}">
            <input type="radio" 
                   id="true_${question.id}"
                   name="question_${question.id}" 
                   value="true"
                   ${savedAnswer === 'true' ? 'checked' : ''}
                   class="option-input">
            <div class="option-content">
              <div class="option-icon">✓</div>
              <div class="option-text">Verdadero</div>
            </div>
          </label>
          
          <label class="option-label large-option ${savedAnswer === 'false' ? 'selected' : ''}" for="false_${question.id}">
            <input type="radio" 
                   id="false_${question.id}"
                   name="question_${question.id}" 
                   value="false"
                   ${savedAnswer === 'false' ? 'checked' : ''}
                   class="option-input">
            <div class="option-content">
              <div class="option-icon">✗</div>
              <div class="option-text">Falso</div>
            </div>
          </label>
        </div>
        
        ${this.showImmediateFeedback ? `
          <div class="question-actions">
            <button class="btn btn-primary check-answer" disabled>
              <span class="btn-icon">✓</span>
              <span class="btn-text">Verificar Respuesta</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    this.setupQuestionInteractions(question);
  }

  /**
   * Render fill in the blank question
   */
  renderFillBlankQuestion(question) {
    const savedAnswer = this.userAnswers.get(question.id) || '';
    
    // Parse question text to find blanks (marked with [BLANK])
    const questionParts = question.question.split('[BLANK]');
    const questionHtml = questionParts.map((part, index) => {
      if (index < questionParts.length - 1) {
        return `${part}<input type="text" class="blank-input" data-blank-index="${index}" value="${savedAnswer.split('|')[index] || ''}" placeholder="Escribe tu respuesta">`;
      }
      return part;
    }).join('');

    this.questionContainer.innerHTML = `
      <div class="question fill-blank-question">
        <div class="question-header">
          <h3 class="question-text">${questionHtml}</h3>
          ${question.image ? `<img src="${question.image}" alt="Imagen de la pregunta" class="question-image">` : ''}
        </div>
        
        ${question.hints ? `
          <div class="question-hints">
            <h4>Pistas:</h4>
            <ul>
              ${question.hints.map(hint => `<li>${hint}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${this.showImmediateFeedback ? `
          <div class="question-actions">
            <button class="btn btn-primary check-answer" disabled>
              <span class="btn-icon">✓</span>
              <span class="btn-text">Verificar Respuesta</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    this.setupQuestionInteractions(question);
  }

  /**
   * Setup question interactions
   */
  setupQuestionInteractions(question) {
    const questionElement = this.questionContainer.querySelector('.question');
    
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      // Radio button interactions
      const radioInputs = questionElement.querySelectorAll('.option-input');
      radioInputs.forEach(input => {
        input.addEventListener('change', (e) => {
          // Update visual selection
          questionElement.querySelectorAll('.option-label').forEach(label => {
            label.classList.remove('selected');
          });
          e.target.closest('.option-label').classList.add('selected');
          
          // Store answer
          this.userAnswers.set(question.id, e.target.value);
          
          // Enable check button if immediate feedback is enabled
          if (this.showImmediateFeedback) {
            const checkButton = questionElement.querySelector('.check-answer');
            if (checkButton) {
              checkButton.disabled = false;
            }
          }
          
          this.updateNavigationButtons();
        });
      });
    } else if (question.type === 'fill_blank') {
      // Text input interactions
      const blankInputs = questionElement.querySelectorAll('.blank-input');
      blankInputs.forEach(input => {
        input.addEventListener('input', () => {
          // Collect all blank answers
          const answers = Array.from(blankInputs).map(inp => inp.value.trim());
          this.userAnswers.set(question.id, answers.join('|'));
          
          // Enable check button if any input has content
          if (this.showImmediateFeedback) {
            const checkButton = questionElement.querySelector('.check-answer');
            const hasContent = answers.some(answer => answer.length > 0);
            if (checkButton) {
              checkButton.disabled = !hasContent;
            }
          }
          
          this.updateNavigationButtons();
        });
      });
    }

    // Setup check answer button
    if (this.showImmediateFeedback) {
      const checkButton = questionElement.querySelector('.check-answer');
      if (checkButton) {
        checkButton.addEventListener('click', () => {
          this.checkCurrentAnswer();
        });
      }
    }
  }

  /**
   * Check current question answer
   */
  checkCurrentAnswer() {
    const question = this.currentQuiz.questions[this.currentQuestionIndex];
    const userAnswer = this.userAnswers.get(question.id);
    
    if (!userAnswer) {
      this.showFeedback({
        isCorrect: false,
        title: 'Respuesta requerida',
        message: 'Por favor, selecciona una respuesta antes de verificar.',
        type: 'warning'
      });
      return;
    }

    const isCorrect = this.validateAnswer(question, userAnswer);
    const feedback = {
      isCorrect,
      title: isCorrect ? '¡Correcto!' : 'Incorrecto',
      message: isCorrect ? 
        question.correctFeedback || 'Has seleccionado la respuesta correcta.' :
        question.incorrectFeedback || 'La respuesta no es correcta.',
      type: isCorrect ? 'success' : 'error',
      explanation: question.explanation
    };

    this.showFeedback(feedback);

    // Disable check button after answering
    const checkButton = this.questionContainer.querySelector('.check-answer');
    if (checkButton) {
      checkButton.disabled = true;
    }

    // Emit answer checked event
    this.eventBus?.publish('quiz:answer_checked', {
      questionId: question.id,
      questionIndex: this.currentQuestionIndex,
      isCorrect,
      userAnswer,
      correctAnswer: question.correctAnswer
    });
  }

  /**
   * Validate user answer
   */
  validateAnswer(question, userAnswer) {
    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return userAnswer === question.correctAnswer;
        
      case 'fill_blank':
        const correctAnswers = question.correctAnswer.split('|');
        const userAnswers = userAnswer.split('|');
        
        if (correctAnswers.length !== userAnswers.length) {
          return false;
        }
        
        return correctAnswers.every((correct, index) => {
          const user = userAnswers[index]?.trim().toLowerCase();
          const correctLower = correct.trim().toLowerCase();
          
          // Check for exact match or acceptable alternatives
          if (question.acceptableAnswers && question.acceptableAnswers[index]) {
            const alternatives = question.acceptableAnswers[index].map(alt => alt.toLowerCase());
            return alternatives.includes(user) || user === correctLower;
          }
          
          return user === correctLower;
        });
        
      default:
        return false;
    }
  }

  /**
   * Show feedback for current question
   */
  showFeedback(feedback) {
    this.feedbackElement.style.display = 'block';
    this.feedbackElement.className = `question-feedback ${feedback.type}`;
    
    const icon = this.feedbackElement.querySelector('.feedback-icon');
    const title = this.feedbackElement.querySelector('.feedback-title');
    const message = this.feedbackElement.querySelector('.feedback-message');
    const explanation = this.feedbackElement.querySelector('.feedback-explanation');
    const explanationText = this.feedbackElement.querySelector('.explanation-text');
    
    // Set feedback content
    switch (feedback.type) {
      case 'success':
        icon.textContent = '✅';
        break;
      case 'error':
        icon.textContent = '❌';
        break;
      case 'warning':
        icon.textContent = '⚠️';
        break;
      default:
        icon.textContent = 'ℹ️';
    }
    
    title.textContent = feedback.title;
    message.textContent = feedback.message;
    
    // Show explanation if available
    if (feedback.explanation) {
      explanation.style.display = 'block';
      explanationText.textContent = feedback.explanation;
    } else {
      explanation.style.display = 'none';
    }
    
    // Scroll feedback into view
    this.feedbackElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }

  /**
   * Hide feedback
   */
  hideFeedback() {
    this.feedbackElement.style.display = 'none';
  }

  /**
   * Update progress display
   */
  updateProgress() {
    const current = this.currentQuestionIndex + 1;
    const total = this.currentQuiz.questions.length;
    const percentage = (current / total) * 100;
    
    this.currentQuestionElement.textContent = current;
    this.progressBar.style.width = `${percentage}%`;
  }

  /**
   * Update navigation buttons
   */
  updateNavigationButtons() {
    const isFirstQuestion = this.currentQuestionIndex === 0;
    const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
    const hasAnsweredCurrent = this.userAnswers.has(this.currentQuiz.questions[this.currentQuestionIndex].id);
    
    // Previous button
    this.prevButton.disabled = isFirstQuestion;
    
    // Next/Submit button
    if (isLastQuestion) {
      this.nextButton.style.display = 'none';
      this.submitButton.style.display = 'inline-flex';
      this.submitButton.disabled = !this.hasAnsweredAllQuestions();
    } else {
      this.nextButton.style.display = 'inline-flex';
      this.submitButton.style.display = 'none';
      this.nextButton.disabled = this.showImmediateFeedback && !hasAnsweredCurrent;
    }
  }

  /**
   * Check if all questions have been answered
   */
  hasAnsweredAllQuestions() {
    return this.currentQuiz.questions.every(question => 
      this.userAnswers.has(question.id)
    );
  }

  /**
   * Go to previous question
   */
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.loadQuestion(this.currentQuestionIndex - 1);
    }
  }

  /**
   * Go to next question
   */
  nextQuestion() {
    if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
      this.loadQuestion(this.currentQuestionIndex + 1);
    }
  }

  /**
   * Submit quiz and show results
   */
  submitQuiz() {
    if (!this.hasAnsweredAllQuestions()) {
      this.showFeedback({
        isCorrect: false,
        title: 'Quiz incompleto',
        message: 'Por favor, responde todas las preguntas antes de finalizar el quiz.',
        type: 'warning'
      });
      return;
    }

    this.isCompleted = true;
    const results = this.calculateResults();
    this.showResults(results);
    
    // Stop timer if running
    if (this.timer) {
      clearInterval(this.timer);
    }

    // Emit quiz completed event
    this.eventBus?.publish('quiz:completed', {
      quizId: this.currentQuiz.id,
      score: results.score,
      correctAnswers: results.correctCount,
      totalQuestions: results.totalCount,
      timeSpent: results.timeSpent,
      results: results
    });
  }

  /**
   * Calculate quiz results
   */
  calculateResults() {
    let correctCount = 0;
    const totalCount = this.currentQuiz.questions.length;
    const questionResults = [];

    this.currentQuiz.questions.forEach(question => {
      const userAnswer = this.userAnswers.get(question.id);
      const isCorrect = this.validateAnswer(question, userAnswer);
      
      if (isCorrect) correctCount++;
      
      questionResults.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      });
    });

    const score = Math.round((correctCount / totalCount) * 100);
    const timeSpent = Date.now() - this.quizStartTime;

    return {
      score,
      correctCount,
      totalCount,
      timeSpent,
      questionResults,
      passed: score >= (this.currentQuiz.passingScore || 70)
    };
  }

  /**
   * Show quiz results
   */
  showResults(results) {
    // Hide quiz content and show results
    this.element.querySelector('.quiz-content').style.display = 'none';
    this.element.querySelector('.quiz-controls').style.display = 'none';
    this.resultsElement.style.display = 'block';

    // Update results display
    const scoreValue = this.resultsElement.querySelector('.score-value');
    const correctCount = this.resultsElement.querySelector('.correct-count');
    const totalCount = this.resultsElement.querySelector('.total-count');
    const timeSpent = this.resultsElement.querySelector('.time-spent');
    const scoreCircle = this.resultsElement.querySelector('.score-circle');
    const retryButton = this.resultsElement.querySelector('.retry-quiz');

    scoreValue.textContent = `${results.score}%`;
    correctCount.textContent = results.correctCount;
    totalCount.textContent = results.totalCount;
    timeSpent.textContent = this.formatTime(results.timeSpent);

    // Color code score circle
    scoreCircle.className = 'score-circle';
    if (results.score >= 90) {
      scoreCircle.classList.add('excellent');
    } else if (results.score >= 70) {
      scoreCircle.classList.add('good');
    } else {
      scoreCircle.classList.add('needs-improvement');
    }

    // Show/hide retry button based on settings
    if (retryButton) {
      retryButton.style.display = this.allowRetries ? 'inline-flex' : 'none';
    }
  }

  /**
   * Setup quiz timer
   */
  setupTimer() {
    if (!this.timeLimit) return;

    this.timerElement.style.display = 'flex';
    let timeRemaining = this.timeLimit * 1000; // Convert to milliseconds

    this.timer = setInterval(() => {
      timeRemaining -= 1000;

      if (timeRemaining <= 0) {
        this.submitQuiz();
        return;
      }

      this.timerText.textContent = this.formatTime(timeRemaining);

      // Warning when time is running low
      if (timeRemaining <= 60000) { // 1 minute
        this.timerElement.classList.add('warning');
      }
    }, 1000);
  }

  /**
   * Format time in MM:SS format
   */
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Retry quiz
   */
  retryQuiz() {
    this.userAnswers.clear();
    this.isCompleted = false;
    this.currentQuestionIndex = 0;
    this.quizStartTime = Date.now();
    
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    // Reset timer if needed
    if (this.timeLimit) {
      this.setupTimer();
    }

    // Show quiz content and hide results
    this.resultsElement.style.display = 'none';
    this.element.querySelector('.quiz-content').style.display = 'block';
    this.element.querySelector('.quiz-controls').style.display = 'flex';

    // Load first question
    this.loadQuestion(0);

    // Emit retry event
    this.eventBus?.publish('quiz:retried', {
      quizId: this.currentQuiz.id
    });
  }

  /**
   * Continue to next learning section
   */
  continueToNext() {
    this.eventBus?.publish('quiz:continue', {
      quizId: this.currentQuiz.id,
      completed: this.isCompleted
    });
  }

  /**
   * Render generic question fallback
   */
  renderGenericQuestion(question) {
    this.questionContainer.innerHTML = `
      <div class="question generic-question">
        <div class="question-placeholder">
          <div class="placeholder-icon">❓</div>
          <h3>Tipo de Pregunta No Soportado</h3>
          <p>Este tipo de pregunta (${question.type}) aún no está implementado.</p>
        </div>
      </div>
    `;
  }

  /**
   * Destroy quiz renderer
   */
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.userAnswers.clear();
    
    console.log('[QuizRenderer] Destroyed');
  }
}

export default QuizRenderer;