// EC0249 Assessment and Portfolio Management System
class AssessmentPortfolioSystem {
  constructor(app) {
    this.app = app;
    this.assessments = this.initializeAssessments();
    this.portfolio = {
      documents: {},
      evidence: {},
      competencyProgress: {
        element1: { documents: 0, performance: 0, knowledge: 0 },
        element2: { documents: 0, performance: 0, knowledge: 0 },
        element3: { documents: 0, performance: 0, knowledge: 0 }
      },
      overallReadiness: 0
    };
    this.currentAssessment = null;
  }

  initializeAssessments() {
    return {
      knowledge_element1: {
        id: 'knowledge_element1',
        title: 'Evaluación de Conocimientos - Elemento 1',
        element: 1,
        type: 'knowledge',
        timeLimit: 45, // minutes
        passingScore: 80,
        questions: [
          {
            id: 'q1_interviews',
            type: 'multiple_choice',
            category: 'Entrevistas',
            question: '¿Cuál es la principal ventaja de las entrevistas individuales sobre las grupales?',
            options: [
              'Son más rápidas de realizar',
              'Proporcionan información personalizada y detallada',
              'Requieren menos preparación',
              'Son menos costosas'
            ],
            correct: 1,
            explanation: 'Las entrevistas individuales permiten obtener información personalizada y profunda sin la influencia de otros participantes.',
            points: 5
          },
          {
            id: 'q2_questionnaires',
            type: 'multiple_choice',
            category: 'Cuestionarios',
            question: '¿Cuándo es más apropiado usar cuestionarios cerrados?',
            options: [
              'Cuando se necesitan opiniones detalladas',
              'Para explorar temas nuevos',
              'Cuando se requiere información precisa y cuantificable',
              'Para generar ideas creativas'
            ],
            correct: 2,
            explanation: 'Los cuestionarios cerrados son ideales para obtener información específica que se pueda medir y comparar.',
            points: 5
          },
          {
            id: 'q3_indicators',
            type: 'multiple_choice',
            category: 'Indicadores',
            question: '¿Cuál es el propósito principal de un indicador en consultoría?',
            options: [
              'Decorar reportes',
              'Registrar el cambio de una variable en el tiempo',
              'Confundir a los clientes',
              'Aumentar el costo del proyecto'
            ],
            correct: 1,
            explanation: 'Los indicadores permiten monitorear y medir cambios en variables específicas a lo largo del tiempo.',
            points: 5
          },
          {
            id: 'q4_information_sources',
            type: 'multiple_choice',
            category: 'Fuentes de Información',
            question: '¿Qué característica es fundamental para validar una fuente de información?',
            options: [
              'Que sea gratuita',
              'Que sea congruente para los fines de la investigación',
              'Que sea popular',
              'Que sea reciente'
            ],
            correct: 1,
            explanation: 'La validez se refiere a qué tan bien una fuente de información sirve para los propósitos específicos de la investigación.',
            points: 5
          },
          {
            id: 'q5_methodology',
            type: 'multiple_choice',
            category: 'Metodología',
            question: '¿Cuál es el primer paso en la metodología de investigación de problemas?',
            options: [
              'Recopilar información',
              'Elegir el tema',
              'Construir el proyecto',
              'Tomar notas'
            ],
            correct: 1,
            explanation: 'El primer paso es elegir y definir claramente el tema o problema a investigar.',
            points: 5
          },
          {
            id: 'q6_integration',
            type: 'essay',
            category: 'Integración',
            question: 'Explique cómo integraría información de diferentes fuentes para crear un diagnóstico coherente de un problema organizacional. Proporcione un ejemplo práctico.',
            sampleAnswer: 'La integración de información requiere: 1) Categorizar datos por temas, 2) Identificar patrones y contradicciones, 3) Triangular fuentes para validar información, 4) Sintetizar hallazgos en conclusiones coherentes.',
            points: 10,
            criteria: [
              'Describe un proceso lógico de integración',
              'Incluye un ejemplo práctico relevante',
              'Demuestra comprensión de triangulación',
              'Muestra coherencia en la síntesis'
            ]
          }
        ]
      },

      performance_element1: {
        id: 'performance_element1',
        title: 'Evaluación de Desempeño - Elemento 1',
        element: 1,
        type: 'performance',
        timeLimit: 90,
        description: 'Simulación de entrevista con cliente virtual',
        criteria: [
          'Dar su nombre al inicio de la entrevista',
          'Indicar que la razón de la entrevista es obtener datos relativos al problema',
          'Solicitar que la información requerida se proporcione verbalmente/por escrito',
          'Solicitar que las evidencias que soporten sus respuestas sean proporcionadas',
          'Registrar las respuestas obtenidas',
          'Cerrar la entrevista agradeciendo la participación'
        ],
        scenarios: [
          {
            id: 'interview_scenario_1',
            title: 'Entrevista con Director de Operaciones',
            description: 'Su cliente reporta problemas de eficiencia en el área de producción',
            client: {
              name: 'María González',
              position: 'Directora de Operaciones',
              company: 'Manufacturera del Norte',
              personality: 'Directa, orientada a datos, algo impaciente',
              background: 'Ha observado incrementos en tiempos de producción y quejas de calidad',
              concerns: ['Eficiencia operacional', 'Control de calidad', 'Costos de producción'],
              responses: {
                greeting: 'Buenos días, gracias por venir. Espero que podamos resolver estos problemas pronto.',
                problem_description: 'Hemos notado que los tiempos de producción han aumentado un 15% en los últimos tres meses, y los reclamos de calidad se han duplicado.',
                evidence_available: 'Tengo reportes de producción, registros de calidad y comentarios del personal de línea.',
                areas_affected: 'Principalmente las líneas 2 y 3, aunque line 1 también muestra signos de deterioro.',
                resistance_points: ['Limitaciones presupuestales', 'Resistencia del personal a cambios']
              }
            }
          }
        ]
      },

      knowledge_element2: {
        id: 'knowledge_element2',
        title: 'Evaluación de Conocimientos - Elemento 2',
        element: 2,
        type: 'knowledge',
        timeLimit: 30,
        passingScore: 80,
        questions: [
          {
            id: 'q1_impact_analysis',
            type: 'multiple_choice',
            category: 'Análisis de Impacto',
            question: '¿Qué elementos debe incluir un reporte de afectaciones?',
            options: [
              'Solo los problemas encontrados',
              'Metodología aplicada, afectaciones definidas y situación detallada a resolver',
              'Únicamente las soluciones propuestas',
              'Solo los costos asociados'
            ],
            correct: 1,
            explanation: 'Un reporte completo debe incluir metodología, afectaciones específicas y definición clara de la situación.',
            points: 10
          },
          {
            id: 'q2_solution_design',
            type: 'multiple_choice',
            category: 'Diseño de Soluciones',
            question: '¿Qué características debe tener una solución bien diseñada?',
            options: [
              'Solo debe ser económica',
              'Debe ser congruente con la situación, incluir beneficios, desventajas y justificación',
              'Solo debe ser rápida de implementar',
              'Únicamente debe satisfacer al cliente'
            ],
            correct: 1,
            explanation: 'Una solución integral debe considerar congruencia, beneficios, desventajas y estar bien justificada.',
            points: 10
          }
        ]
      },

      comprehensive_portfolio: {
        id: 'comprehensive_portfolio',
        title: 'Evaluación Integral del Portafolio',
        type: 'portfolio',
        description: 'Revisión completa de todos los documentos y evidencias del portafolio',
        elements: [
          {
            element: 1,
            requiredDocuments: 8,
            requiredPerformances: 1,
            weight: 40
          },
          {
            element: 2,
            requiredDocuments: 2,
            requiredPerformances: 0,
            weight: 25
          },
          {
            element: 3,
            requiredDocuments: 5,
            requiredPerformances: 1,
            weight: 35
          }
        ],
        passingCriteria: {
          documentsCompleted: 100,
          documentsQuality: 80,
          performanceScore: 80,
          overallScore: 80
        }
      }
    };
  }

  startAssessment(assessmentId) {
    const assessment = this.assessments[assessmentId];
    if (!assessment) {
      console.error(`Assessment not found: ${assessmentId}`);
      return;
    }

    this.currentAssessment = {
      id: assessmentId,
      startTime: new Date(),
      responses: {},
      currentQuestion: 0,
      timeRemaining: assessment.timeLimit * 60, // Convert to seconds
      completed: false
    };

    this.renderAssessment(assessment);
    this.startTimer();
  }

  renderAssessment(assessment) {
    const contentArea = document.getElementById('contentArea');
    
    switch(assessment.type) {
      case 'knowledge':
        contentArea.innerHTML = this.renderKnowledgeAssessment(assessment);
        break;
      case 'performance':
        contentArea.innerHTML = this.renderPerformanceAssessment(assessment);
        break;
      case 'portfolio':
        contentArea.innerHTML = this.renderPortfolioAssessment(assessment);
        break;
    }
  }

  renderKnowledgeAssessment(assessment) {
    const currentQuestion = this.currentAssessment.currentQuestion;
    const question = assessment.questions[currentQuestion];
    const totalQuestions = assessment.questions.length;

    return `
      <div class="assessment-container knowledge-assessment">
        <div class="assessment-header">
          <div class="assessment-info">
            <h1>${assessment.title}</h1>
            <div class="assessment-meta">
              <span class="question-counter">Pregunta ${currentQuestion + 1} de ${totalQuestions}</span>
              <span class="time-remaining" id="timeRemaining">${Math.floor(this.currentAssessment.timeRemaining / 60)}:${(this.currentAssessment.timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
          <div class="assessment-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(currentQuestion / totalQuestions) * 100}%"></div>
            </div>
          </div>
        </div>

        <div class="question-container">
          <div class="question-header">
            <span class="question-category">${question.category}</span>
            <span class="question-points">${question.points} puntos</span>
          </div>
          
          <div class="question-content">
            <h3>${question.question}</h3>
            
            ${question.type === 'multiple_choice' ? `
              <div class="options-container">
                ${question.options.map((option, index) => `
                  <label class="option-label">
                    <input type="radio" name="current_answer" value="${index}" onchange="ec0249App.assessmentSystem.selectAnswer(${index})">
                    <span class="option-text">${option}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}
            
            ${question.type === 'essay' ? `
              <div class="essay-container">
                <textarea 
                  id="essayAnswer" 
                  placeholder="Escriba su respuesta aquí..."
                  rows="10"
                  onchange="ec0249App.assessmentSystem.updateEssayAnswer(this.value)"
                ></textarea>
                <div class="essay-criteria">
                  <h4>Criterios de Evaluación:</h4>
                  <ul>
                    ${question.criteria.map(criterion => `<li>${criterion}</li>`).join('')}
                  </ul>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="assessment-navigation">
          <button 
            class="btn btn-secondary" 
            onclick="ec0249App.assessmentSystem.previousQuestion()"
            ${currentQuestion === 0 ? 'disabled' : ''}
          >
            ← Anterior
          </button>
          
          <button 
            class="btn btn-primary" 
            onclick="ec0249App.assessmentSystem.nextQuestion()"
            id="nextButton"
          >
            ${currentQuestion === totalQuestions - 1 ? 'Finalizar' : 'Siguiente →'}
          </button>
        </div>
      </div>
    `;
  }

  renderPerformanceAssessment(assessment) {
    return `
      <div class="assessment-container performance-assessment">
        <div class="assessment-header">
          <h1>${assessment.title}</h1>
          <p>${assessment.description}</p>
        </div>

        <div class="performance-criteria">
          <h3>Criterios de Evaluación</h3>
          <div class="criteria-checklist">
            ${assessment.criteria.map((criterion, index) => `
              <div class="criterion-item">
                <input type="checkbox" id="criterion_${index}" class="criterion-checkbox">
                <label for="criterion_${index}">${criterion}</label>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="simulation-area">
          <h3>Escenario de Simulación</h3>
          ${assessment.scenarios.map(scenario => `
            <div class="scenario-card">
              <h4>${scenario.title}</h4>
              <p><strong>Situación:</strong> ${scenario.description}</p>
              
              <div class="client-profile">
                <h5>Perfil del Cliente</h5>
                <p><strong>${scenario.client.name}</strong> - ${scenario.client.position}</p>
                <p><strong>Empresa:</strong> ${scenario.client.company}</p>
                <p><strong>Personalidad:</strong> ${scenario.client.personality}</p>
                <p><strong>Contexto:</strong> ${scenario.client.background}</p>
              </div>

              <button class="btn btn-primary" onclick="ec0249App.simulationSystem.startInterview('${scenario.id}')">
                Iniciar Entrevista
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderPortfolioAssessment(assessment) {
    return `
      <div class="assessment-container portfolio-assessment">
        <div class="assessment-header">
          <h1>${assessment.title}</h1>
          <p>${assessment.description}</p>
        </div>

        <div class="portfolio-overview">
          <div class="readiness-score">
            <h3>Nivel de Preparación General</h3>
            <div class="score-circle">
              <div class="score-number">${this.portfolio.overallReadiness}%</div>
              <div class="score-label">Listo para Certificación</div>
            </div>
          </div>
        </div>

        <div class="elements-breakdown">
          ${assessment.elements.map(element => this.renderElementStatus(element)).join('')}
        </div>

        <div class="portfolio-actions">
          <button class="btn btn-secondary" onclick="ec0249App.assessmentSystem.generatePortfolioReport()">
            📊 Generar Reporte
          </button>
          <button class="btn btn-primary" onclick="ec0249App.assessmentSystem.exportPortfolio()">
            📁 Exportar Portafolio
          </button>
        </div>
      </div>
    `;
  }

  renderElementStatus(element) {
    const progress = this.portfolio.competencyProgress[`element${element.element}`];
    const documentsProgress = (progress.documents / element.requiredDocuments) * 100;
    const isComplete = documentsProgress >= 100;

    return `
      <div class="element-status-card ${isComplete ? 'complete' : 'incomplete'}">
        <div class="element-header">
          <h4>Elemento ${element.element}</h4>
          <span class="element-weight">${element.weight}% del total</span>
        </div>
        
        <div class="element-progress">
          <div class="progress-item">
            <span>Documentos (${progress.documents}/${element.requiredDocuments})</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${documentsProgress}%"></div>
            </div>
          </div>
          
          ${element.requiredPerformances > 0 ? `
            <div class="progress-item">
              <span>Desempeños (${progress.performance}/${element.requiredPerformances})</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${(progress.performance / element.requiredPerformances) * 100}%"></div>
              </div>
            </div>
          ` : ''}
          
          <div class="progress-item">
            <span>Conocimientos</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress.knowledge}%"></div>
            </div>
          </div>
        </div>

        <div class="element-actions">
          <button class="btn btn-sm btn-secondary" onclick="ec0249App.assessmentSystem.reviewElement(${element.element})">
            Revisar Elemento
          </button>
        </div>
      </div>
    `;
  }

  selectAnswer(answerIndex) {
    if (this.currentAssessment) {
      const questionId = this.getCurrentQuestion().id;
      this.currentAssessment.responses[questionId] = answerIndex;
    }
  }

  updateEssayAnswer(answer) {
    if (this.currentAssessment) {
      const questionId = this.getCurrentQuestion().id;
      this.currentAssessment.responses[questionId] = answer;
    }
  }

  nextQuestion() {
    const assessment = this.assessments[this.currentAssessment.id];
    
    if (this.currentAssessment.currentQuestion < assessment.questions.length - 1) {
      this.currentAssessment.currentQuestion++;
      this.renderAssessment(assessment);
    } else {
      this.completeAssessment();
    }
  }

  previousQuestion() {
    if (this.currentAssessment.currentQuestion > 0) {
      this.currentAssessment.currentQuestion--;
      const assessment = this.assessments[this.currentAssessment.id];
      this.renderAssessment(assessment);
    }
  }

  getCurrentQuestion() {
    const assessment = this.assessments[this.currentAssessment.id];
    return assessment.questions[this.currentAssessment.currentQuestion];
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.currentAssessment.timeRemaining--;
      
      const minutes = Math.floor(this.currentAssessment.timeRemaining / 60);
      const seconds = this.currentAssessment.timeRemaining % 60;
      
      const timerElement = document.getElementById('timeRemaining');
      if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color when time is running low
        if (this.currentAssessment.timeRemaining < 300) { // 5 minutes
          timerElement.style.color = 'var(--warning-500)';
        }
        if (this.currentAssessment.timeRemaining < 60) { // 1 minute
          timerElement.style.color = 'var(--error-500)';
        }
      }
      
      if (this.currentAssessment.timeRemaining <= 0) {
        this.completeAssessment();
      }
    }, 1000);
  }

  completeAssessment() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.currentAssessment.completed = true;
    this.currentAssessment.endTime = new Date();
    
    const results = this.calculateAssessmentResults();
    this.showAssessmentResults(results);
    
    // Update portfolio progress
    this.updatePortfolioProgress(results);
  }

  calculateAssessmentResults() {
    const assessment = this.assessments[this.currentAssessment.id];
    let totalPoints = 0;
    let earnedPoints = 0;
    const detailedResults = [];

    assessment.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = this.currentAssessment.responses[question.id];
      let questionPoints = 0;

      if (question.type === 'multiple_choice') {
        if (userAnswer === question.correct) {
          questionPoints = question.points;
        }
      } else if (question.type === 'essay') {
        // For essays, we'll assume manual grading later
        // For demo purposes, give partial credit
        questionPoints = Math.floor(question.points * 0.8);
      }

      earnedPoints += questionPoints;
      
      detailedResults.push({
        question: question.question,
        userAnswer: userAnswer,
        correct: question.correct,
        points: questionPoints,
        maxPoints: question.points,
        explanation: question.explanation
      });
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const passed = percentage >= assessment.passingScore;

    return {
      totalPoints,
      earnedPoints,
      percentage,
      passed,
      passingScore: assessment.passingScore,
      detailedResults,
      timeTaken: this.currentAssessment.endTime - this.currentAssessment.startTime
    };
  }

  showAssessmentResults(results) {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
      <div class="assessment-results">
        <div class="results-header">
          <h1>Resultados de la Evaluación</h1>
          <div class="score-summary ${results.passed ? 'passed' : 'failed'}">
            <div class="score-circle">
              <div class="score-number">${results.percentage}%</div>
              <div class="score-label">${results.passed ? 'APROBADO' : 'REPROBADO'}</div>
            </div>
            <div class="score-details">
              <p>Puntuación: ${results.earnedPoints}/${results.totalPoints} puntos</p>
              <p>Puntuación mínima: ${results.passingScore}%</p>
              <p>Tiempo: ${Math.round(results.timeTaken / 60000)} minutos</p>
            </div>
          </div>
        </div>

        <div class="detailed-results">
          <h3>Revisión Detallada</h3>
          ${results.detailedResults.map((result, index) => `
            <div class="question-result ${result.points === result.maxPoints ? 'correct' : 'incorrect'}">
              <h4>Pregunta ${index + 1} (${result.points}/${result.maxPoints} puntos)</h4>
              <p class="question-text">${result.question}</p>
              ${result.explanation ? `<p class="explanation"><strong>Explicación:</strong> ${result.explanation}</p>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="results-actions">
          <button class="btn btn-secondary" onclick="ec0249App.assessmentSystem.reviewAssessment()">
            📖 Revisar Respuestas
          </button>
          ${!results.passed ? `
            <button class="btn btn-primary" onclick="ec0249App.assessmentSystem.retakeAssessment()">
              🔄 Volver a Intentar
            </button>
          ` : `
            <button class="btn btn-primary" onclick="ec0249App.assessmentSystem.continueToNext()">
              ✅ Continuar
            </button>
          `}
        </div>
      </div>
    `;
  }

  updatePortfolioProgress(results) {
    const assessment = this.assessments[this.currentAssessment.id];
    if (assessment.element) {
      const elementKey = `element${assessment.element}`;
      if (assessment.type === 'knowledge') {
        this.portfolio.competencyProgress[elementKey].knowledge = results.percentage;
      } else if (assessment.type === 'performance') {
        this.portfolio.competencyProgress[elementKey].performance = results.percentage;
      }
    }
    
    this.calculateOverallReadiness();
    this.savePortfolioProgress();
  }

  calculateOverallReadiness() {
    const elements = Object.values(this.portfolio.competencyProgress);
    let totalReadiness = 0;
    
    elements.forEach(element => {
      const elementReadiness = (element.documents * 0.6) + (element.knowledge * 0.3) + (element.performance * 0.1);
      totalReadiness += elementReadiness;
    });
    
    this.portfolio.overallReadiness = Math.round(totalReadiness / elements.length);
  }

  savePortfolioProgress() {
    const portfolioKey = `ec0249_portfolio_${this.app.userId || 'anonymous'}`;
    localStorage.setItem(portfolioKey, JSON.stringify(this.portfolio));
  }

  loadPortfolioProgress() {
    const portfolioKey = `ec0249_portfolio_${this.app.userId || 'anonymous'}`;
    const saved = localStorage.getItem(portfolioKey);
    if (saved) {
      this.portfolio = { ...this.portfolio, ...JSON.parse(saved) };
    }
  }

  generatePortfolioReport() {
    console.log('Generating comprehensive portfolio report...');
    this.app.showNotification('Generando reporte del portafolio...', 'info');
  }

  exportPortfolio() {
    console.log('Exporting portfolio for certification submission...');
    this.app.showNotification('Exportando portafolio para evaluación...', 'info');
  }

  reviewElement(elementNumber) {
    // Navigate to specific element review
    this.app.switchSection(`module${elementNumber + 1}`);
  }

  retakeAssessment() {
    // Reset current assessment and start over
    this.currentAssessment = null;
    this.startAssessment(this.currentAssessment?.id);
  }

  continueToNext() {
    // Navigate to next logical step
    this.app.switchView('dashboard');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.ec0249App) {
    window.ec0249App.assessmentSystem = new AssessmentPortfolioSystem(window.ec0249App);
    window.ec0249App.assessmentSystem.loadPortfolioProgress();
  }
});