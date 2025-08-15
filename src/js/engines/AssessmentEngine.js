/**
 * Assessment Engine - Knowledge verification and quiz management system
 * Handles interactive assessments, progress tracking, and competency evaluation
 */
import Module from '../core/Module.js';

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
  }

  async onInitialize() {
    this.stateManager = this.service('StateManager');
    this.i18n = this.service('I18nService');
    this.storage = this.service('StorageService');

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
   * Load assessment definitions for all modules
   */
  async loadAssessmentDefinitions() {
    // EC0249 Knowledge Assessments by Element
    const assessmentDefinitions = {
      // Module 1: Consulting Fundamentals
      fundamentals_assessment: {
        id: 'fundamentals_assessment',
        title: 'Evaluación: Fundamentos de Consultoría',
        description: 'Evaluación de conocimientos básicos sobre consultoría profesional',
        moduleId: 'module1',
        elementId: 'fundamentals',
        timeLimit: 1200, // 20 minutes
        questions: [
          {
            id: 'q1_1',
            type: 'multiple_choice',
            question: '¿Cuál es el principio ético más importante en la consultoría?',
            options: [
              'Maximizar los honorarios del consultor',
              'Mantener la confidencialidad del cliente',
              'Implementar soluciones rápidas',
              'Garantizar resultados inmediatos'
            ],
            correct: 1,
            explanation: 'La confidencialidad es fundamental para mantener la confianza y proteger la información sensible del cliente.',
            points: 10
          },
          {
            id: 'q1_2',
            type: 'multiple_choice',
            question: '¿Qué característica NO es esencial en un consultor profesional?',
            options: [
              'Objetividad en el análisis',
              'Conocimiento técnico especializado',
              'Flexibilidad en principios éticos',
              'Habilidades de comunicación efectiva'
            ],
            correct: 2,
            explanation: 'Los principios éticos deben ser inquebrantables; la flexibilidad ética compromete la integridad profesional.',
            points: 10
          },
          {
            id: 'q1_3',
            type: 'true_false',
            question: 'Un consultor puede trabajar simultáneamente para dos competidores directos.',
            correct: false,
            explanation: 'Esto representaría un conflicto de interés que viola los principios éticos de la consultoría.',
            points: 10
          },
          {
            id: 'q1_4',
            type: 'multiple_choice',
            question: '¿Cuál es la principal diferencia entre consultoría interna y externa?',
            options: [
              'El costo de los servicios',
              'La duración de los proyectos',
              'La relación contractual con la organización',
              'Los métodos de análisis utilizados'
            ],
            correct: 2,
            explanation: 'La consultoría interna implica empleados de la organización, mientras que la externa involucra profesionales independientes.',
            points: 10
          }
        ],
        passingScore: 70,
        maxAttempts: 3,
        certificateRequired: false
      },

      // Module 2: Problem Identification (Element 1)
      element1_assessment: {
        id: 'element1_assessment',
        title: 'Evaluación: Identificación del Problema',
        description: 'Evaluación de competencias para identificar situaciones problemáticas',
        moduleId: 'module2',
        elementId: 'E0875',
        timeLimit: 1800, // 30 minutes
        questions: [
          {
            id: 'q2_1',
            type: 'multiple_choice',
            question: '¿Cuál es el primer paso en la metodología de identificación de problemas?',
            options: [
              'Realizar entrevistas con stakeholders',
              'Definir claramente la situación problemática',
              'Recopilar información documental',
              'Efectuar observaciones de campo'
            ],
            correct: 1,
            explanation: 'Definir la situación es fundamental antes de proceder con técnicas de recopilación de información.',
            points: 15
          },
          {
            id: 'q2_2',
            type: 'multiple_choice',
            question: '¿Qué elemento NO debe incluir una guía de entrevista profesional?',
            options: [
              'Propósito claro de la entrevista',
              'Preguntas personales sobre la vida privada',
              'Solicitud de documentación de soporte',
              'Cierre formal agradeciendo la participación'
            ],
            correct: 1,
            explanation: 'Las preguntas personales no relacionadas con el problema profesional violan los límites éticos.',
            points: 15
          },
          {
            id: 'q2_3',
            type: 'matching',
            question: 'Relaciona cada tipo de información con su fuente apropiada:',
            pairs: [
              { left: 'Políticas organizacionales', right: 'Información interna' },
              { left: 'Tendencias del mercado', right: 'Información externa' },
              { left: 'Procedimientos operativos', right: 'Información interna' },
              { left: 'Regulaciones gubernamentales', right: 'Información externa' }
            ],
            points: 20
          },
          {
            id: 'q2_4',
            type: 'short_answer',
            question: 'Menciona tres características que debe tener un cuestionario bien diseñado.',
            sampleAnswer: '1. Propósito claramente explicado, 2. Instrucciones claras de llenado, 3. Garantía de confidencialidad',
            points: 15
          }
        ],
        passingScore: 70,
        maxAttempts: 2,
        certificateRequired: true
      },

      // Module 3: Solution Development (Element 2)
      element2_assessment: {
        id: 'element2_assessment',
        title: 'Evaluación: Desarrollo de Soluciones',
        description: 'Evaluación de competencias para desarrollar opciones de solución',
        moduleId: 'module3',
        elementId: 'E0876',
        timeLimit: 2100, // 35 minutes
        questions: [
          {
            id: 'q3_1',
            type: 'multiple_choice',
            question: '¿Qué debe incluir obligatoriamente un análisis de costo-beneficio?',
            options: [
              'Solo los costos financieros directos',
              'Únicamente los beneficios cuantificables',
              'Costos, beneficios, riesgos y cronograma',
              'Solo el retorno de inversión estimado'
            ],
            correct: 2,
            explanation: 'Un análisis completo debe considerar todos los aspectos: costos, beneficios, riesgos y factores temporales.',
            points: 20
          },
          {
            id: 'q3_2',
            type: 'essay',
            question: 'Explica la importancia de incluir tanto ventajas como desventajas en el diseño de una solución.',
            minWords: 100,
            maxWords: 300,
            rubric: [
              { criteria: 'Claridad conceptual', weight: 30 },
              { criteria: 'Argumentación sólida', weight: 40 },
              { criteria: 'Ejemplos relevantes', weight: 20 },
              { criteria: 'Redacción y estructura', weight: 10 }
            ],
            points: 25
          },
          {
            id: 'q3_3',
            type: 'true_false',
            question: 'Una solución efectiva debe ser congruente con la situación identificada en el Element 1.',
            correct: true,
            explanation: 'La congruencia entre el problema identificado y la solución propuesta es un criterio de evaluación clave.',
            points: 15
          }
        ],
        passingScore: 75,
        maxAttempts: 2,
        certificateRequired: true
      },

      // Module 4: Solution Presentation (Element 3)
      element3_assessment: {
        id: 'element3_assessment',
        title: 'Evaluación: Presentación de Propuestas',
        description: 'Evaluación de competencias para presentar propuestas de solución',
        moduleId: 'module4',
        elementId: 'E0877',
        timeLimit: 2400, // 40 minutes
        questions: [
          {
            id: 'q4_1',
            type: 'multiple_choice',
            question: '¿Cuántos componentes mínimos debe incluir una propuesta de trabajo según EC0249?',
            options: [
              '5 componentes',
              '8 componentes',
              '10 componentes',
              '12 componentes'
            ],
            correct: 2,
            explanation: 'La propuesta debe incluir 10 componentes: antecedentes, síntesis, alcance, solución, plan, entregables, riesgos, responsabilidades (consultor y cliente), y costo.',
            points: 15
          },
          {
            id: 'q4_2',
            type: 'short_answer',
            question: 'Lista los 11 criterios que debe cumplir una presentación oral efectiva según el estándar.',
            sampleAnswer: 'Describir propuesta, mencionar alcance, exponer ventajas/desventajas, identificar responsables, explicar etapas, detallar entregables, mencionar implicaciones, describir recursos, responder preguntas, explicar costo-beneficio, y mantener orden metodológico.',
            points: 25
          },
          {
            id: 'q4_3',
            type: 'multiple_choice',
            question: '¿Qué cláusulas son obligatorias en el registro de acuerdos?',
            options: [
              'Solo cláusulas financieras',
              'Confidencialidad y propiedad intelectual',
              'Únicamente términos de pago',
              'Solo definición de entregables'
            ],
            correct: 1,
            explanation: 'Las cláusulas de confidencialidad y propiedad intelectual son obligatorias para proteger ambas partes.',
            points: 20
          }
        ],
        passingScore: 80,
        maxAttempts: 2,
        certificateRequired: true
      },

      // Comprehensive Final Assessment
      final_assessment: {
        id: 'final_assessment',
        title: 'Evaluación Final Integral EC0249',
        description: 'Evaluación comprehensiva de todos los elementos de competencia',
        moduleId: 'final',
        elementId: 'comprehensive',
        timeLimit: 3600, // 60 minutes
        prerequisiteAssessments: ['element1_assessment', 'element2_assessment', 'element3_assessment'],
        questions: [
          {
            id: 'qf_1',
            type: 'case_study',
            question: 'Caso Integral: Empresa de Manufactura con Problemas de Productividad',
            scenario: `Una empresa manufacturera de 200 empleados reporta una disminución del 15% en productividad durante los últimos 6 meses. El Director General sospecha que hay problemas de comunicación entre departamentos y posibles deficiencias en los procesos operativos. Te han contratado como consultor para identificar y resolver esta situación.`,
            tasks: [
              'Diseña una metodología completa para identificar el problema',
              'Propón al menos 2 alternativas de solución con análisis costo-beneficio',
              'Estructura una propuesta profesional incluyendo todos los elementos requeridos'
            ],
            rubric: [
              { criteria: 'Metodología de identificación', weight: 30 },
              { criteria: 'Calidad de las soluciones propuestas', weight: 35 },
              { criteria: 'Estructura y completitud de la propuesta', weight: 25 },
              { criteria: 'Consideraciones éticas y profesionales', weight: 10 }
            ],
            points: 50
          }
        ],
        passingScore: 85,
        maxAttempts: 1,
        certificateRequired: true,
        certificateTemplate: 'ec0249_completion'
      }
    };

    // Store assessments
    Object.values(assessmentDefinitions).forEach(assessment => {
      this.assessments.set(assessment.id, assessment);
    });
  }

  /**
   * Start an assessment
   * @param {string} assessmentId - Assessment identifier
   * @param {Object} options - Assessment options
   */
  async startAssessment(assessmentId, options = {}) {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    // Check prerequisites
    if (assessment.prerequisiteAssessments) {
      const unmetPrereqs = assessment.prerequisiteAssessments.filter(prereqId => {
        const result = this.assessmentResults.get(prereqId);
        return !result || !result.passed;
      });

      if (unmetPrereqs.length > 0) {
        throw new Error(`Prerequisites not met: ${unmetPrereqs.join(', ')}`);
      }
    }

    // Check attempt limits
    const attempts = this.getUserAttempts(assessmentId);
    if (attempts >= assessment.maxAttempts) {
      throw new Error(`Maximum attempts (${assessment.maxAttempts}) reached for ${assessmentId}`);
    }

    // Initialize assessment session
    this.currentAssessment = {
      ...assessment,
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      currentQuestion: 0,
      responses: new Map(),
      attemptNumber: attempts + 1
    };

    // Shuffle questions if configured
    if (this.getConfig('shuffleQuestions')) {
      this.currentAssessment.questions = this.shuffleArray([...assessment.questions]);
    }

    // Shuffle options for multiple choice questions
    if (this.getConfig('shuffleOptions')) {
      this.currentAssessment.questions.forEach(question => {
        if (question.type === 'multiple_choice' && question.options) {
          const shuffledData = this.shuffleOptionsWithCorrectIndex(question.options, question.correct);
          question.options = shuffledData.options;
          question.correct = shuffledData.correctIndex;
        }
      });
    }

    // Start timer if time limit exists
    if (assessment.timeLimit) {
      this.startTimer(assessment.timeLimit);
    }

    this.emit('assessment:started', {
      assessmentId: assessmentId,
      sessionId: this.currentAssessment.sessionId,
      timeLimit: assessment.timeLimit
    });

    return this.currentAssessment;
  }

  /**
   * Submit answer for current question
   * @param {string} questionId - Question identifier
   * @param {*} answer - User's answer
   */
  submitAnswer(questionId, answer) {
    if (!this.currentAssessment) {
      throw new Error('No active assessment');
    }

    const question = this.currentAssessment.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    // Validate answer format based on question type
    const validatedAnswer = this.validateAnswer(question, answer);

    // Store response
    this.currentAssessment.responses.set(questionId, {
      answer: validatedAnswer,
      timestamp: Date.now(),
      timeSpent: this.calculateQuestionTime(questionId)
    });

    this.emit('question:answered', {
      questionId: questionId,
      answer: validatedAnswer,
      sessionId: this.currentAssessment.sessionId
    });

    // Auto-save progress
    this.saveAssessmentProgress();
  }

  /**
   * Complete current assessment
   */
  async completeAssessment() {
    if (!this.currentAssessment) {
      throw new Error('No active assessment');
    }

    // Stop timer
    this.stopTimer();

    // Calculate results
    const results = await this.calculateAssessmentResults();

    // Store results
    this.assessmentResults.set(this.currentAssessment.id, results);

    // Save to storage
    await this.saveUserProgress();

    // Clear current assessment
    const completedAssessment = this.currentAssessment;
    this.currentAssessment = null;

    this.emit('assessment:completed', {
      assessmentId: completedAssessment.id,
      results: results,
      sessionId: completedAssessment.sessionId
    });

    return results;
  }

  /**
   * Calculate assessment results
   */
  async calculateAssessmentResults() {
    const assessment = this.currentAssessment;
    const responses = assessment.responses;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    const questionResults = [];

    for (const question of assessment.questions) {
      totalPoints += question.points || 10;
      
      const response = responses.get(question.id);
      let questionScore = 0;
      let isCorrect = false;

      if (response) {
        const result = this.evaluateQuestion(question, response.answer);
        questionScore = result.score;
        isCorrect = result.isCorrect;
        earnedPoints += questionScore;
      }

      questionResults.push({
        questionId: question.id,
        question: question.question,
        userAnswer: response?.answer,
        correctAnswer: this.getCorrectAnswer(question),
        isCorrect: isCorrect,
        points: questionScore,
        maxPoints: question.points || 10,
        explanation: question.explanation
      });
    }

    const percentageScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentageScore >= assessment.passingScore;

    const results = {
      assessmentId: assessment.id,
      sessionId: assessment.sessionId,
      startTime: assessment.startTime,
      endTime: Date.now(),
      duration: Date.now() - assessment.startTime,
      attemptNumber: assessment.attemptNumber,
      totalQuestions: assessment.questions.length,
      answeredQuestions: responses.size,
      totalPoints: totalPoints,
      earnedPoints: earnedPoints,
      percentageScore: Math.round(percentageScore * 100) / 100,
      passingScore: assessment.passingScore,
      passed: passed,
      questionResults: questionResults,
      certificateEarned: passed && assessment.certificateRequired
    };

    return results;
  }

  /**
   * Evaluate individual question
   * @param {Object} question - Question object
   * @param {*} answer - User's answer
   */
  evaluateQuestion(question, answer) {
    switch (question.type) {
      case 'multiple_choice':
        const isCorrect = answer === question.correct;
        return {
          isCorrect: isCorrect,
          score: isCorrect ? (question.points || 10) : 0
        };

      case 'true_false':
        const correctBool = answer === question.correct;
        return {
          isCorrect: correctBool,
          score: correctBool ? (question.points || 10) : 0
        };

      case 'short_answer':
        // Simple keyword matching for short answers
        const similarity = this.calculateTextSimilarity(answer, question.sampleAnswer);
        const threshold = 0.6; // 60% similarity threshold
        const isShortCorrect = similarity >= threshold;
        return {
          isCorrect: isShortCorrect,
          score: isShortCorrect ? (question.points || 10) : Math.floor((question.points || 10) * similarity)
        };

      case 'essay':
        // Essays require manual grading - return partial credit for now
        return {
          isCorrect: true, // Assumes reasonable effort
          score: Math.floor((question.points || 10) * 0.8), // 80% for completion
          requiresReview: true
        };

      case 'matching':
        let correctMatches = 0;
        const totalPairs = question.pairs.length;
        
        question.pairs.forEach((pair, index) => {
          if (answer[index] === pair.right) {
            correctMatches++;
          }
        });

        const matchScore = (correctMatches / totalPairs) * (question.points || 10);
        return {
          isCorrect: correctMatches === totalPairs,
          score: Math.floor(matchScore)
        };

      case 'case_study':
        // Case studies require manual evaluation
        return {
          isCorrect: true,
          score: Math.floor((question.points || 10) * 0.75), // 75% for completion
          requiresReview: true
        };

      default:
        return {
          isCorrect: false,
          score: 0
        };
    }
  }

  /**
   * Render assessment interface
   * @param {HTMLElement} container - Container element
   * @param {string} assessmentId - Assessment identifier
   */
  async renderAssessment(container, assessmentId) {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      container.innerHTML = '<div class="error">Assessment not found</div>';
      return;
    }

    const canStart = this.canStartAssessment(assessmentId);
    if (!canStart.allowed) {
      container.innerHTML = this.renderAssessmentBlocked(assessment, canStart.reason);
      return;
    }

    container.innerHTML = this.renderAssessmentStart(assessment);
  }

  /**
   * Render assessment start screen
   */
  renderAssessmentStart(assessment) {
    const attempts = this.getUserAttempts(assessment.id);
    const remainingAttempts = assessment.maxAttempts - attempts;

    return `
      <div class="assessment-start">
        <div class="assessment-header">
          <h2>${assessment.title}</h2>
          <p class="assessment-description">${assessment.description}</p>
        </div>

        <div class="assessment-info">
          <div class="info-card">
            <h4>📝 Información de la Evaluación</h4>
            <ul>
              <li><strong>Preguntas:</strong> ${assessment.questions.length}</li>
              <li><strong>Tiempo límite:</strong> ${assessment.timeLimit ? Math.floor(assessment.timeLimit / 60) + ' minutos' : 'Sin límite'}</li>
              <li><strong>Puntuación mínima:</strong> ${assessment.passingScore}%</li>
              <li><strong>Intentos restantes:</strong> ${remainingAttempts}</li>
            </ul>
          </div>

          ${assessment.certificateRequired ? `
            <div class="info-card certificate-info">
              <h4>🏆 Certificación</h4>
              <p>Esta evaluación es requerida para la certificación EC0249. Al aprobarla, recibirás un certificado digital.</p>
            </div>
          ` : ''}

          ${assessment.prerequisiteAssessments ? `
            <div class="info-card prerequisites">
              <h4>📋 Prerrequisitos</h4>
              <p>Debes haber aprobado las siguientes evaluaciones:</p>
              <ul>
                ${assessment.prerequisiteAssessments.map(prereqId => {
                  const result = this.assessmentResults.get(prereqId);
                  const status = result && result.passed ? '✅' : '❌';
                  return `<li>${status} ${this.assessments.get(prereqId)?.title || prereqId}</li>`;
                }).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <div class="assessment-actions">
          <button class="btn btn-primary btn-lg" onclick="ec0249App.assessmentEngine.startAssessmentSession('${assessment.id}')">
            Iniciar Evaluación
          </button>
          <button class="btn btn-secondary" onclick="history.back()">
            Volver al Módulo
          </button>
        </div>

        <div class="assessment-guidelines">
          <h4>📋 Instrucciones Importantes</h4>
          <ul>
            <li>Lee cada pregunta cuidadosamente antes de responder</li>
            <li>No podrás cambiar respuestas una vez enviada la evaluación</li>
            <li>Asegúrate de tener conexión estable a internet</li>
            <li>No uses herramientas externas durante la evaluación</li>
            <li>El cronómetro no se detiene si cambias de pestaña</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Start assessment session and render first question
   */
  async startAssessmentSession(assessmentId) {
    try {
      const assessment = await this.startAssessment(assessmentId);
      this.renderCurrentQuestion();
    } catch (error) {
      this.showNotification('Error al iniciar evaluación: ' + error.message, 'error');
    }
  }

  /**
   * Render current question
   */
  renderCurrentQuestion() {
    if (!this.currentAssessment) return;

    const container = document.getElementById('contentArea');
    const question = this.currentAssessment.questions[this.currentAssessment.currentQuestion];
    
    if (!question) {
      this.completeAssessment();
      return;
    }

    container.innerHTML = this.renderQuestionContent(question);
  }

  /**
   * Render question content based on type
   */
  renderQuestionContent(question) {
    const questionNumber = this.currentAssessment.currentQuestion + 1;
    const totalQuestions = this.currentAssessment.questions.length;
    const progressPercent = (questionNumber / totalQuestions) * 100;

    return `
      <div class="assessment-question">
        <div class="assessment-header">
          <div class="progress-info">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <span class="progress-text">Pregunta ${questionNumber} de ${totalQuestions}</span>
          </div>
          
          ${this.timeRemaining > 0 ? `
            <div class="timer">
              <span id="timeDisplay">⏱️ ${this.formatTime(this.timeRemaining)}</span>
            </div>
          ` : ''}
        </div>

        <div class="question-content">
          <h3>Pregunta ${questionNumber}</h3>
          <div class="question-text">${question.question}</div>
          
          ${this.renderQuestionInput(question)}
          
          ${question.points ? `<div class="question-points">Puntos: ${question.points}</div>` : ''}
        </div>

        <div class="question-actions">
          <button class="btn btn-primary" onclick="ec0249App.assessmentEngine.submitCurrentAnswer()">
            ${questionNumber === totalQuestions ? 'Finalizar Evaluación' : 'Siguiente Pregunta'}
          </button>
          ${questionNumber > 1 ? `
            <button class="btn btn-secondary" onclick="ec0249App.assessmentEngine.previousQuestion()">
              Pregunta Anterior
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render question input based on type
   */
  renderQuestionInput(question) {
    switch (question.type) {
      case 'multiple_choice':
        return `
          <div class="question-options">
            ${question.options.map((option, index) => `
              <label class="option-label">
                <input type="radio" name="question_answer" value="${index}">
                <span class="option-text">${option}</span>
              </label>
            `).join('')}
          </div>
        `;

      case 'true_false':
        return `
          <div class="question-options">
            <label class="option-label">
              <input type="radio" name="question_answer" value="true">
              <span class="option-text">Verdadero</span>
            </label>
            <label class="option-label">
              <input type="radio" name="question_answer" value="false">
              <span class="option-text">Falso</span>
            </label>
          </div>
        `;

      case 'short_answer':
        return `
          <div class="question-input">
            <textarea name="question_answer" rows="3" placeholder="Escribe tu respuesta aquí..."></textarea>
          </div>
        `;

      case 'essay':
        return `
          <div class="question-input">
            <div class="essay-info">
              ${question.minWords ? `<span>Mínimo: ${question.minWords} palabras</span>` : ''}
              ${question.maxWords ? `<span>Máximo: ${question.maxWords} palabras</span>` : ''}
            </div>
            <textarea name="question_answer" rows="8" placeholder="Desarrolla tu respuesta de forma detallada..."></textarea>
            <div class="word-count" id="wordCount">Palabras: 0</div>
          </div>
        `;

      case 'matching':
        return `
          <div class="question-matching">
            <div class="matching-instructions">Relaciona cada elemento de la izquierda con su correspondiente de la derecha:</div>
            <div class="matching-pairs">
              ${question.pairs.map((pair, index) => `
                <div class="matching-pair">
                  <div class="matching-left">${pair.left}</div>
                  <select name="match_${index}" class="matching-select">
                    <option value="">Seleccionar...</option>
                    ${question.pairs.map(p => `<option value="${p.right}">${p.right}</option>`).join('')}
                  </select>
                </div>
              `).join('')}
            </div>
          </div>
        `;

      default:
        return '<div class="error">Tipo de pregunta no soportado</div>';
    }
  }

  /**
   * Timer management
   */
  startTimer(seconds) {
    this.timeRemaining = seconds;
    this.timer = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();
      
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.completeAssessment();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateTimerDisplay() {
    const display = document.getElementById('timeDisplay');
    if (display) {
      display.textContent = `⏱️ ${this.formatTime(this.timeRemaining)}`;
      
      // Add warning class when time is running low
      if (this.timeRemaining < 300) { // 5 minutes
        display.classList.add('timer-warning');
      }
    }
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Utility methods
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  shuffleOptionsWithCorrectIndex(options, correctIndex) {
    const correctAnswer = options[correctIndex];
    const shuffledOptions = this.shuffleArray(options);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    
    return {
      options: shuffledOptions,
      correctIndex: newCorrectIndex
    };
  }

  calculateTextSimilarity(text1, text2) {
    // Simple word-based similarity calculation
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  getUserAttempts(assessmentId) {
    // Get number of attempts from stored results
    const results = Array.from(this.assessmentResults.values())
      .filter(result => result.assessmentId === assessmentId);
    return results.length;
  }

  canStartAssessment(assessmentId) {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      return { allowed: false, reason: 'Assessment not found' };
    }

    const attempts = this.getUserAttempts(assessmentId);
    if (attempts >= assessment.maxAttempts) {
      return { allowed: false, reason: 'Maximum attempts reached' };
    }

    if (assessment.prerequisiteAssessments) {
      const unmetPrereqs = assessment.prerequisiteAssessments.filter(prereqId => {
        const result = this.assessmentResults.get(prereqId);
        return !result || !result.passed;
      });

      if (unmetPrereqs.length > 0) {
        return { allowed: false, reason: 'Prerequisites not met' };
      }
    }

    return { allowed: true };
  }

  /**
   * Event handlers
   */
  handleAssessmentStart(data) {
    console.log('[AssessmentEngine] Assessment started:', data);
  }

  handleAssessmentSubmit(data) {
    console.log('[AssessmentEngine] Assessment submitted:', data);
  }

  handleAssessmentComplete(data) {
    console.log('[AssessmentEngine] Assessment completed:', data);
  }

  handleQuestionAnswer(data) {
    console.log('[AssessmentEngine] Question answered:', data);
  }

  handleTimerUpdate(data) {
    this.updateTimerDisplay();
  }

  /**
   * Storage methods
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

  async saveUserProgress() {
    try {
      await this.storage.set('assessment_progress', {
        results: Array.from(this.assessmentResults.entries()),
        lastUpdate: Date.now()
      });
    } catch (error) {
      console.warn('[AssessmentEngine] Failed to save progress:', error);
    }
  }

  async saveAssessmentProgress() {
    if (this.currentAssessment) {
      try {
        await this.storage.set('current_assessment', {
          assessment: this.currentAssessment,
          timestamp: Date.now()
        });
      } catch (error) {
        console.warn('[AssessmentEngine] Failed to save current assessment:', error);
      }
    }
  }

  async onDestroy() {
    this.stopTimer();
    this.assessments.clear();
    this.userResponses.clear();
    this.assessmentResults.clear();
    this.currentAssessment = null;
  }
}

export default AssessmentEngine;