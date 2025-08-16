/**
 * Assessment View Controller - Manages the assessment and testing interface
 * Handles knowledge tests, simulations, and competency evaluations
 */
import BaseViewController from './BaseViewController.js';

class AssessmentViewController extends BaseViewController {
  constructor(viewId, app) {
    super(viewId, app);
    this.currentAssessment = null;
    this.assessmentEngine = null;
    this.simulationEngine = null;
    this.currentQuestionIndex = 0;
    this.userAnswers = new Map();
    this.assessmentTimer = null;
    this.timeRemaining = 0;
  }

  async onInitialize() {
    // Get assessment and simulation engines
    this.assessmentEngine = this.getModule('assessmentEngine');
    this.simulationEngine = this.getModule('simulationEngine');
    
    if (!this.assessmentEngine) {
      console.warn('[AssessmentViewController] AssessmentEngine not available yet - will be available after modules initialization');
    }
    
    if (!this.simulationEngine) {
      console.warn('[AssessmentViewController] SimulationEngine not available yet - will be available after modules initialization');
    }
  }

  bindEvents() {
    // Assessment type selection
    this.findElements('.assessment-type-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const assessmentType = card.getAttribute('data-assessment-type');
        if (assessmentType) {
          this.startAssessment(assessmentType);
        }
      });
    });

    // Assessment navigation buttons
    this.findElements('[data-assessment-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.getAttribute('data-assessment-action');
        this.handleAssessmentAction(action, button);
      });
    });

    // Simulation type selection
    this.findElements('.simulation-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const simulationType = card.getAttribute('data-simulation-type');
        if (simulationType) {
          this.startSimulation(simulationType);
        }
      });
    });

    // Answer selection
    this.element.addEventListener('change', (e) => {
      if (e.target.matches('input[name="answer"]')) {
        this.recordAnswer(e.target.value);
      }
    });
  }

  async onShow() {
    // Reset assessment state when view is shown
    this.resetAssessmentState();
    
    // Refresh assessment data
    await this.loadAssessmentData();
  }

  async onRender() {
    // Render assessment overview
    this.renderAssessmentOverview();
    
    // Update progress indicators
    this.updateProgressIndicators();
  }

  /**
   * Load assessment data and history
   */
  async loadAssessmentData() {
    try {
      const progressService = this.getService('ProgressService');
      if (progressService) {
        this.assessmentHistory = await progressService.getAssessmentHistory();
        this.competencyProgress = await progressService.getCompetencyProgress();
      }
    } catch (error) {
      console.error('[AssessmentViewController] Failed to load assessment data:', error);
    }
  }

  /**
   * Render assessment overview
   */
  renderAssessmentOverview() {
    const overviewContainer = this.findElement('.assessment-overview');
    if (!overviewContainer) return;

    // Clear existing content
    overviewContainer.innerHTML = '';

    // Create assessment types section
    const typesSection = this.createAssessmentTypesSection();
    overviewContainer.appendChild(typesSection);

    // Create simulations section
    const simulationsSection = this.createSimulationsSection();
    overviewContainer.appendChild(simulationsSection);

    // Create progress section
    const progressSection = this.createProgressSection();
    overviewContainer.appendChild(progressSection);
  }

  /**
   * Create assessment types section
   */
  createAssessmentTypesSection() {
    const section = this.createElement('section', ['assessment-types-section']);
    
    const title = this.createElement('h2', ['section-title']);
    title.textContent = 'Evaluaciones de Conocimientos';
    section.appendChild(title);

    const typesGrid = this.createElement('div', ['assessment-types-grid']);

    // Module assessments
    const moduleAssessments = [
      {
        id: 'module1',
        title: 'Módulo 1: Fundamentos',
        description: 'Evaluación de conceptos básicos de consultoría',
        questions: 10,
        duration: '15 min',
        difficulty: 'Básico'
      },
      {
        id: 'element1',
        title: 'Elemento 1: Identificación',
        description: 'Competencia en identificación de problemas',
        questions: 10,
        duration: '20 min',
        difficulty: 'Intermedio'
      },
      {
        id: 'element2',
        title: 'Elemento 2: Desarrollo',
        description: 'Competencia en desarrollo de soluciones',
        questions: 7,
        duration: '15 min',
        difficulty: 'Intermedio'
      },
      {
        id: 'element3',
        title: 'Elemento 3: Presentación',
        description: 'Competencia en presentación de propuestas',
        questions: 10,
        duration: '20 min',
        difficulty: 'Avanzado'
      },
      {
        id: 'comprehensive',
        title: 'Evaluación Integral',
        description: 'Evaluación completa de todas las competencias',
        questions: 15,
        duration: '30 min',
        difficulty: 'Avanzado'
      }
    ];

    moduleAssessments.forEach(assessment => {
      const card = this.createAssessmentCard(assessment);
      typesGrid.appendChild(card);
    });

    section.appendChild(typesGrid);
    return section;
  }

  /**
   * Create assessment card
   */
  createAssessmentCard(assessment) {
    const card = this.createElement('div', ['assessment-type-card']);
    card.setAttribute('data-assessment-type', assessment.id);

    // Status indicator
    const statusIndicator = this.createElement('div', ['assessment-status']);
    const isCompleted = this.isAssessmentCompleted(assessment.id);
    const score = this.getAssessmentScore(assessment.id);
    
    statusIndicator.innerHTML = isCompleted 
      ? `✅ ${score}%` 
      : '⏳ Pendiente';

    // Assessment info
    const info = this.createElement('div', ['assessment-info']);
    info.innerHTML = `
      <h3 class="assessment-title">${assessment.title}</h3>
      <p class="assessment-description">${assessment.description}</p>
      <div class="assessment-metadata">
        <span class="questions">📝 ${assessment.questions} preguntas</span>
        <span class="duration">⏱️ ${assessment.duration}</span>
        <span class="difficulty difficulty-${assessment.difficulty.toLowerCase()}">
          📊 ${assessment.difficulty}
        </span>
      </div>
    `;

    // Action button
    const actionButton = this.createElement('button', ['btn', 'btn-primary']);
    actionButton.textContent = isCompleted ? 'Repetir' : 'Comenzar';

    card.appendChild(statusIndicator);
    card.appendChild(info);
    card.appendChild(actionButton);

    return card;
  }

  /**
   * Create simulations section
   */
  createSimulationsSection() {
    const section = this.createElement('section', ['simulations-section']);
    
    const title = this.createElement('h2', ['section-title']);
    title.textContent = 'Simulaciones Prácticas';
    section.appendChild(title);

    const simulationsGrid = this.createElement('div', ['simulations-grid']);

    const simulations = [
      {
        id: 'interview',
        title: 'Simulador de Entrevistas',
        description: 'Practica entrevistas con clientes en diferentes escenarios',
        icon: '🎤',
        scenarios: 5,
        duration: '10-15 min'
      },
      {
        id: 'presentation',
        title: 'Entrenador de Presentaciones',
        description: 'Mejora tus habilidades de presentación ante directivos',
        icon: '📊',
        scenarios: 3,
        duration: '15-20 min'
      },
      {
        id: 'negotiation',
        title: 'Simulador de Negociación',
        description: 'Practica la negociación de propuestas y contratos',
        icon: '🤝',
        scenarios: 4,
        duration: '20-25 min'
      }
    ];

    simulations.forEach(simulation => {
      const card = this.createSimulationCard(simulation);
      simulationsGrid.appendChild(card);
    });

    section.appendChild(simulationsGrid);
    return section;
  }

  /**
   * Create simulation card
   */
  createSimulationCard(simulation) {
    const card = this.createElement('div', ['simulation-card']);
    card.setAttribute('data-simulation-type', simulation.id);

    const icon = this.createElement('div', ['simulation-icon']);
    icon.textContent = simulation.icon;

    const info = this.createElement('div', ['simulation-info']);
    info.innerHTML = `
      <h3 class="simulation-title">${simulation.title}</h3>
      <p class="simulation-description">${simulation.description}</p>
      <div class="simulation-metadata">
        <span class="scenarios">🎭 ${simulation.scenarios} escenarios</span>
        <span class="duration">⏱️ ${simulation.duration}</span>
      </div>
    `;

    const actionButton = this.createElement('button', ['btn', 'btn-outline']);
    actionButton.textContent = 'Iniciar Simulación';

    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(actionButton);

    return card;
  }

  /**
   * Create progress section
   */
  createProgressSection() {
    const section = this.createElement('section', ['progress-section']);
    
    const title = this.createElement('h2', ['section-title']);
    title.textContent = 'Tu Progreso en Evaluaciones';
    section.appendChild(title);

    const progressGrid = this.createElement('div', ['progress-grid']);

    // Overall competency progress
    const overallProgress = this.createElement('div', ['progress-card', 'overall']);
    overallProgress.innerHTML = `
      <h3>Progreso General</h3>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${this.calculateOverallProgress()}%"></div>
      </div>
      <span class="progress-text">${this.calculateOverallProgress()}% completado</span>
    `;

    // Individual competency progress
    const competencies = ['E0875', 'E0876', 'E0877'];
    competencies.forEach(competency => {
      const competencyProgress = this.createElement('div', ['progress-card']);
      const progress = this.getCompetencyProgress(competency);
      competencyProgress.innerHTML = `
        <h4>${this.getCompetencyName(competency)}</h4>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="progress-text">${progress}% completado</span>
      `;
      progressGrid.appendChild(competencyProgress);
    });

    progressGrid.insertBefore(overallProgress, progressGrid.firstChild);
    section.appendChild(progressGrid);

    return section;
  }

  /**
   * Start an assessment
   */
  async startAssessment(assessmentType) {
    if (!this.assessmentEngine) {
      this.showNotification('Motor de evaluación no disponible', 'error');
      return;
    }

    try {
      // Load assessment questions
      const questions = await this.assessmentEngine.getAssessmentQuestions(assessmentType);
      
      if (!questions || questions.length === 0) {
        this.showNotification('No hay preguntas disponibles para esta evaluación', 'warning');
        return;
      }

      // Initialize assessment state
      this.currentAssessment = {
        type: assessmentType,
        questions: questions,
        startTime: Date.now()
      };
      this.currentQuestionIndex = 0;
      this.userAnswers.clear();

      // Render assessment interface
      this.renderAssessmentInterface();

      // Start timer if assessment has time limit
      this.startAssessmentTimer();

    } catch (error) {
      console.error('[AssessmentViewController] Failed to start assessment:', error);
      this.showNotification('Error al iniciar la evaluación', 'error');
    }
  }

  /**
   * Render assessment interface
   */
  renderAssessmentInterface() {
    const container = this.findElement('.assessment-container');
    if (!container) return;

    container.innerHTML = '';

    // Assessment header
    const header = this.createAssessmentHeader();
    container.appendChild(header);

    // Question display
    const questionDisplay = this.createQuestionDisplay();
    container.appendChild(questionDisplay);

    // Navigation controls
    const navigation = this.createAssessmentNavigation();
    container.appendChild(navigation);

    // Render current question
    this.renderCurrentQuestion();
  }

  /**
   * Create assessment header
   */
  createAssessmentHeader() {
    const header = this.createElement('div', ['assessment-header']);
    
    const title = this.createElement('h2', ['assessment-title']);
    title.textContent = this.getAssessmentTitle(this.currentAssessment.type);

    const progress = this.createElement('div', ['assessment-progress']);
    progress.innerHTML = `
      <span class="question-counter">
        Pregunta ${this.currentQuestionIndex + 1} de ${this.currentAssessment.questions.length}
      </span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${this.getAssessmentProgress()}%"></div>
      </div>
    `;

    const timer = this.createElement('div', ['assessment-timer']);
    timer.innerHTML = '<span id="timer-display">--:--</span>';

    header.appendChild(title);
    header.appendChild(progress);
    header.appendChild(timer);

    return header;
  }

  /**
   * Create question display
   */
  createQuestionDisplay() {
    const display = this.createElement('div', ['question-display']);
    display.innerHTML = `
      <div class="question-content">
        <h3 class="question-text"></h3>
        <div class="question-options"></div>
      </div>
    `;
    return display;
  }

  /**
   * Create assessment navigation
   */
  createAssessmentNavigation() {
    const navigation = this.createElement('div', ['assessment-navigation']);
    
    const prevButton = this.createElement('button', ['btn', 'btn-secondary']);
    prevButton.textContent = 'Anterior';
    prevButton.setAttribute('data-assessment-action', 'prev-question');
    prevButton.disabled = this.currentQuestionIndex === 0;

    const nextButton = this.createElement('button', ['btn', 'btn-primary']);
    nextButton.textContent = 'Siguiente';
    nextButton.setAttribute('data-assessment-action', 'next-question');

    const submitButton = this.createElement('button', ['btn', 'btn-success']);
    submitButton.textContent = 'Finalizar Evaluación';
    submitButton.setAttribute('data-assessment-action', 'submit-assessment');
    submitButton.style.display = 'none';

    navigation.appendChild(prevButton);
    navigation.appendChild(nextButton);
    navigation.appendChild(submitButton);

    return navigation;
  }

  /**
   * Render current question
   */
  renderCurrentQuestion() {
    if (!this.currentAssessment) return;

    const question = this.currentAssessment.questions[this.currentQuestionIndex];
    if (!question) return;

    // Update question text
    const questionText = this.findElement('.question-text');
    if (questionText) {
      questionText.textContent = question.question;
    }

    // Update options
    const optionsContainer = this.findElement('.question-options');
    if (optionsContainer) {
      optionsContainer.innerHTML = '';

      question.options.forEach((option, index) => {
        const optionElement = this.createElement('label', ['option-label']);
        
        const input = this.createElement('input', []);
        input.type = 'radio';
        input.name = 'answer';
        input.value = index;
        
        // Check if this option was previously selected
        const savedAnswer = this.userAnswers.get(this.currentQuestionIndex);
        if (savedAnswer !== undefined && savedAnswer == index) {
          input.checked = true;
        }

        const text = this.createElement('span', ['option-text']);
        text.textContent = option;

        optionElement.appendChild(input);
        optionElement.appendChild(text);
        optionsContainer.appendChild(optionElement);
      });
    }

    // Update navigation buttons
    this.updateAssessmentNavigation();
    
    // Update progress
    this.updateAssessmentProgress();
  }

  /**
   * Handle assessment actions
   */
  handleAssessmentAction(action, button) {
    switch (action) {
      case 'prev-question':
        this.goToPreviousQuestion();
        break;
      case 'next-question':
        this.goToNextQuestion();
        break;
      case 'submit-assessment':
        this.submitAssessment();
        break;
      case 'exit-assessment':
        this.exitAssessment();
        break;
      default:
        console.warn('[AssessmentViewController] Unknown assessment action:', action);
    }
  }

  /**
   * Record user answer
   */
  recordAnswer(answerIndex) {
    this.userAnswers.set(this.currentQuestionIndex, parseInt(answerIndex));
  }

  /**
   * Go to previous question
   */
  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderCurrentQuestion();
    }
  }

  /**
   * Go to next question
   */
  goToNextQuestion() {
    if (this.currentQuestionIndex < this.currentAssessment.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderCurrentQuestion();
    }
  }

  /**
   * Update assessment navigation
   */
  updateAssessmentNavigation() {
    const prevButton = this.findElement('[data-assessment-action="prev-question"]');
    const nextButton = this.findElement('[data-assessment-action="next-question"]');
    const submitButton = this.findElement('[data-assessment-action="submit-assessment"]');

    if (prevButton) {
      prevButton.disabled = this.currentQuestionIndex === 0;
    }

    if (nextButton && submitButton) {
      const isLastQuestion = this.currentQuestionIndex === this.currentAssessment.questions.length - 1;
      nextButton.style.display = isLastQuestion ? 'none' : 'inline-block';
      submitButton.style.display = isLastQuestion ? 'inline-block' : 'none';
    }
  }

  /**
   * Update assessment progress
   */
  updateAssessmentProgress() {
    const progressBar = this.findElement('.assessment-progress .progress-fill');
    const questionCounter = this.findElement('.question-counter');

    if (progressBar) {
      progressBar.style.width = `${this.getAssessmentProgress()}%`;
    }

    if (questionCounter) {
      questionCounter.textContent = `Pregunta ${this.currentQuestionIndex + 1} de ${this.currentAssessment.questions.length}`;
    }
  }

  /**
   * Get assessment progress percentage
   */
  getAssessmentProgress() {
    if (!this.currentAssessment) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.currentAssessment.questions.length) * 100);
  }

  /**
   * Start assessment timer
   */
  startAssessmentTimer() {
    // Set time limit based on assessment type
    const timeLimits = {
      module1: 15 * 60, // 15 minutes
      element1: 20 * 60, // 20 minutes
      element2: 15 * 60, // 15 minutes
      element3: 20 * 60, // 20 minutes
      comprehensive: 30 * 60 // 30 minutes
    };

    this.timeRemaining = timeLimits[this.currentAssessment.type] || 15 * 60;
    
    this.assessmentTimer = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();
      
      if (this.timeRemaining <= 0) {
        this.submitAssessment(true); // Auto-submit when time runs out
      }
    }, 1000);
  }

  /**
   * Update timer display
   */
  updateTimerDisplay() {
    const timerDisplay = this.findElement('#timer-display');
    if (timerDisplay) {
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Change color when time is running low
      if (this.timeRemaining <= 60) {
        timerDisplay.style.color = 'var(--color-error)';
      } else if (this.timeRemaining <= 300) {
        timerDisplay.style.color = 'var(--color-warning)';
      }
    }
  }

  /**
   * Submit assessment
   */
  async submitAssessment(autoSubmit = false) {
    if (!this.currentAssessment) return;

    try {
      // Stop timer
      if (this.assessmentTimer) {
        clearInterval(this.assessmentTimer);
        this.assessmentTimer = null;
      }

      // Calculate score
      const score = this.calculateAssessmentScore();
      
      // Save assessment result
      const result = {
        type: this.currentAssessment.type,
        score: score,
        answers: Array.from(this.userAnswers.entries()),
        completedAt: Date.now(),
        timeSpent: Date.now() - this.currentAssessment.startTime,
        autoSubmitted: autoSubmit
      };

      // Save to progress service
      const progressService = this.getService('ProgressService');
      if (progressService) {
        await progressService.saveAssessmentResult(result);
      }

      // Show results
      this.showAssessmentResults(result);

    } catch (error) {
      console.error('[AssessmentViewController] Failed to submit assessment:', error);
      this.showNotification('Error al enviar la evaluación', 'error');
    }
  }

  /**
   * Calculate assessment score
   */
  calculateAssessmentScore() {
    let correctAnswers = 0;
    
    this.currentAssessment.questions.forEach((question, index) => {
      const userAnswer = this.userAnswers.get(index);
      if (userAnswer !== undefined && userAnswer === question.correct) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / this.currentAssessment.questions.length) * 100);
  }

  /**
   * Show assessment results
   */
  showAssessmentResults(result) {
    const container = this.findElement('.assessment-container');
    if (!container) return;

    container.innerHTML = '';

    // Results display
    const resultsDisplay = this.createElement('div', ['assessment-results']);
    
    const header = this.createElement('div', ['results-header']);
    header.innerHTML = `
      <h2>¡Evaluación Completada!</h2>
      <div class="score-display">
        <span class="score-value">${result.score}%</span>
        <span class="score-label">Puntuación</span>
      </div>
    `;

    const details = this.createElement('div', ['results-details']);
    const isPassing = result.score >= 70;
    details.innerHTML = `
      <div class="result-status ${isPassing ? 'passing' : 'failing'}">
        ${isPassing ? '✅ Aprobado' : '❌ No Aprobado'}
      </div>
      <p class="result-message">
        ${isPassing 
          ? 'Felicidades! Has demostrado competencia en esta área.' 
          : 'Te recomendamos revisar el contenido y intentar nuevamente.'
        }
      </p>
      <div class="result-stats">
        <span>Preguntas correctas: ${Math.round(result.score * this.currentAssessment.questions.length / 100)}/${this.currentAssessment.questions.length}</span>
        <span>Tiempo: ${Math.round((result.timeSpent || 0) / 60000)} minutos</span>
      </div>
    `;

    const actions = this.createElement('div', ['results-actions']);
    actions.innerHTML = `
      <button class="btn btn-primary" data-assessment-action="exit-assessment">
        Volver a Evaluaciones
      </button>
      <button class="btn btn-secondary" onclick="window.location.reload()">
        Intentar Nuevamente
      </button>
    `;

    resultsDisplay.appendChild(header);
    resultsDisplay.appendChild(details);
    resultsDisplay.appendChild(actions);
    container.appendChild(resultsDisplay);
  }

  /**
   * Start simulation
   */
  startSimulation(simulationType) {
    if (!this.simulationEngine) {
      this.showNotification('Motor de simulación no disponible', 'error');
      return;
    }

    this.showNotification(`Iniciando simulación: ${simulationType}`, 'info');
    // Simulation implementation would go here
  }

  /**
   * Exit assessment
   */
  exitAssessment() {
    // Stop timer
    if (this.assessmentTimer) {
      clearInterval(this.assessmentTimer);
      this.assessmentTimer = null;
    }

    // Reset state
    this.resetAssessmentState();
    
    // Re-render overview
    this.onRender();
  }

  /**
   * Reset assessment state
   */
  resetAssessmentState() {
    this.currentAssessment = null;
    this.currentQuestionIndex = 0;
    this.userAnswers.clear();
    this.timeRemaining = 0;
  }

  /**
   * Update progress indicators
   */
  updateProgressIndicators() {
    // Update progress bars with latest data
    const progressService = this.getService('ProgressService');
    if (!progressService) return;

    // Update individual progress indicators
    this.findElements('.progress-fill').forEach(bar => {
      const competency = bar.closest('.progress-card')?.getAttribute('data-competency');
      if (competency) {
        const progress = this.getCompetencyProgress(competency);
        bar.style.width = `${progress}%`;
      }
    });
  }

  /**
   * Helper methods
   */
  getAssessmentTitle(type) {
    const titles = {
      module1: 'Módulo 1: Fundamentos de Consultoría',
      element1: 'Elemento 1: Identificación de Problemas',
      element2: 'Elemento 2: Desarrollo de Soluciones',
      element3: 'Elemento 3: Presentación de Propuestas',
      comprehensive: 'Evaluación Integral EC0249'
    };
    return titles[type] || 'Evaluación';
  }

  getCompetencyName(competency) {
    const names = {
      E0875: 'Identificación de Problemas',
      E0876: 'Desarrollo de Soluciones',
      E0877: 'Presentación de Propuestas'
    };
    return names[competency] || competency;
  }

  isAssessmentCompleted(assessmentType) {
    return this.assessmentHistory?.some(result => result.type === assessmentType) || false;
  }

  getAssessmentScore(assessmentType) {
    const result = this.assessmentHistory?.find(result => result.type === assessmentType);
    return result?.score || 0;
  }

  getCompetencyProgress(competency) {
    return this.competencyProgress?.[competency] || 0;
  }

  calculateOverallProgress() {
    if (!this.competencyProgress) return 0;
    
    const competencies = ['E0875', 'E0876', 'E0877'];
    const totalProgress = competencies.reduce((sum, comp) => sum + (this.competencyProgress[comp] || 0), 0);
    return Math.round(totalProgress / competencies.length);
  }

  onLanguageUpdate() {
    super.onLanguageUpdate();
    
    // Reload assessment content in new language
    this.loadAssessmentData().then(() => {
      this.onRender();
    });
  }
}

export default AssessmentViewController;