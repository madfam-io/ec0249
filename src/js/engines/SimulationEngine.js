/**
 * Simulation Engine - Interactive interview and presentation simulation system
 * Provides realistic practice environments for EC0249 performance requirements
 */
import Module from '../core/Module.js';

class SimulationEngine extends Module {
  constructor() {
    super('SimulationEngine', ['StateManager', 'I18nService', 'StorageService'], {
      autoSave: true,
      saveInterval: 15000,
      maxRetries: 3,
      timeoutWarning: 30, // seconds before warning
      evaluationCriteria: {
        interview: ['introduction', 'purpose_explanation', 'information_request', 'evidence_request', 'response_recording', 'closure'],
        presentation: ['proposal_description', 'scope_mention', 'advantages_disadvantages', 'responsibilities', 'implementation_stages', 'deliverables', 'implications', 'resources', 'questions_response', 'cost_benefit', 'methodological_order']
      }
    });

    this.simulations = new Map();
    this.scenarios = new Map();
    this.activeSession = null;
    this.sessionHistory = new Map();
    this.performanceMetrics = new Map();
  }

  async onInitialize() {
    this.stateManager = this.service('StateManager');
    this.i18n = this.service('I18nService');
    this.storage = this.service('StorageService');

    // Subscribe to simulation events
    this.subscribe('simulation:start', this.handleSimulationStart.bind(this));
    this.subscribe('simulation:action', this.handleSimulationAction.bind(this));
    this.subscribe('simulation:complete', this.handleSimulationComplete.bind(this));
    this.subscribe('scenario:response', this.handleScenarioResponse.bind(this));

    // Load simulation definitions and user progress
    await this.loadSimulationDefinitions();
    await this.loadUserProgress();

    console.log('[SimulationEngine] Initialized');
  }

  /**
   * Load simulation definitions for interviews and presentations
   */
  async loadSimulationDefinitions() {
    const simulationDefinitions = {
      // Interview Simulations (Element 1)
      interview_director_general: {
        id: 'interview_director_general',
        type: 'interview',
        title: 'Entrevista con Director General',
        element: 'E0875',
        difficulty: 'intermediate',
        estimatedDuration: 30,
        description: 'Práctica de entrevista con un directivo de alto nivel para identificar problemas organizacionales',
        scenario: {
          company: 'Manufacturas ABC S.A. de C.V.',
          industry: 'Manufactura de componentes automotrices',
          size: '200 empleados',
          problem: 'Disminución del 15% en productividad en los últimos 6 meses',
          context: 'La empresa ha experimentado problemas de comunicación interdepartamental y posibles deficiencias en procesos operativos.'
        },
        client: {
          name: 'Carlos Mendoza Ruiz',
          position: 'Director General',
          personality: 'Directo, orientado a resultados, algo impaciente',
          experience: '15 años en la industria automotriz',
          concerns: ['Eficiencia operacional', 'Costos crecientes', 'Comunicación interna', 'Competitividad'],
          availability: 'Limitada - máximo 30 minutos',
          communication_style: 'Formal pero directo',
          expectations: 'Soluciones concretas y rápidas'
        },
        objectives: [
          'Obtener información clara sobre el problema de productividad',
          'Identificar las áreas más afectadas',
          'Recopilar datos sobre procesos y comunicación',
          'Establecer el alcance del proyecto de consultoría'
        ],
        evaluationCriteria: [
          {
            id: 'introduction',
            title: 'Dar su nombre al inicio de la entrevista',
            weight: 15,
            description: 'Presentarse profesionalmente y establecer credibilidad'
          },
          {
            id: 'purpose_explanation',
            title: 'Indicar que la razón de la entrevista es obtener datos relativos al problema',
            weight: 20,
            description: 'Explicar claramente el propósito y objetivos de la entrevista'
          },
          {
            id: 'information_request',
            title: 'Solicitar que la información requerida se proporcione verbalmente/por escrito',
            weight: 15,
            description: 'Especificar el formato en que se necesita la información'
          },
          {
            id: 'evidence_request',
            title: 'Solicitar que las evidencias que soporten sus respuestas sean proporcionadas',
            weight: 20,
            description: 'Pedir documentación y evidencias que respalden la información'
          },
          {
            id: 'response_recording',
            title: 'Registrar las respuestas obtenidas',
            weight: 15,
            description: 'Tomar notas adecuadas y confirmar la información recibida'
          },
          {
            id: 'closure',
            title: 'Cerrar la entrevista agradeciendo la participación',
            weight: 15,
            description: 'Finalizar profesionalmente expresando agradecimiento'
          }
        ],
        dialogues: [
          {
            trigger: 'start',
            client_response: 'Buenos días. Soy Carlos Mendoza, Director General de Manufacturas ABC. Le agradezco que haya venido, pero mi tiempo es limitado. ¿En qué puedo ayudarle?',
            response_options: [
              'Buenos días Sr. Mendoza, soy [nombre], consultor en gestión organizacional...',
              'Gracias por recibirme. Vengo a resolver sus problemas de productividad...',
              'Hola, necesito hacerle algunas preguntas sobre su empresa...'
            ],
            correct_approach: 0,
            feedback: {
              correct: 'Excelente presentación profesional. Ha establecido credibilidad desde el inicio.',
              incorrect: 'La presentación debe ser más profesional y establecer credibilidad inmediatamente.'
            }
          },
          {
            trigger: 'after_introduction',
            client_response: 'Muy bien. Como le comentaron, tenemos problemas serios de productividad. En los últimos 6 meses hemos visto una caída del 15%. Esto nos está costando dinero y clientes.',
            response_options: [
              'Entiendo su preocupación. ¿Podría proporcionarme datos específicos sobre esta disminución?',
              'Eso es grave. ¿Ya intentaron algo para solucionarlo?',
              '15% es mucho. ¿En qué departamentos específicamente?'
            ],
            correct_approach: 0,
            feedback: {
              correct: 'Buena solicitud de información específica y evidencias cuantificables.',
              incorrect: 'Es importante solicitar datos específicos y documentación que respalde la información.'
            }
          },
          {
            trigger: 'information_gathering',
            client_response: 'Tengo los reportes mensuales de producción y algunos datos de recursos humanos. Los problemas parecen estar en la coordinación entre producción y control de calidad.',
            response_options: [
              '¿Podría proporcionarme esos reportes por escrito para mi análisis?',
              'Entiendo. ¿Qué otros departamentos están involucrados?',
              '¿Desde cuándo notaron estos problemas de coordinación?'
            ],
            correct_approach: 0,
            feedback: {
              correct: 'Perfecto. Ha solicitado evidencia documental que respalde la información.',
              incorrect: 'Es crucial solicitar documentación escrita que respalde las afirmaciones.'
            }
          }
        ]
      },

      interview_manager_operations: {
        id: 'interview_manager_operations',
        type: 'interview',
        title: 'Entrevista con Gerente de Operaciones',
        element: 'E0875',
        difficulty: 'beginner',
        estimatedDuration: 25,
        description: 'Entrevista con gerente de nivel medio para obtener información operacional detallada',
        scenario: {
          company: 'Servicios Logísticos Delta',
          industry: 'Logística y distribución',
          size: '150 empleados',
          problem: 'Retrasos frecuentes en entregas y quejas de clientes',
          context: 'La empresa ha crecido rápidamente pero sus procesos no se han actualizado adecuadamente.'
        },
        client: {
          name: 'María Elena Vásquez',
          position: 'Gerente de Operaciones',
          personality: 'Colaborativa, detallista, algo defensiva sobre su área',
          experience: '8 años en logística',
          concerns: ['Eficiencia de procesos', 'Satisfacción del cliente', 'Capacidad del equipo'],
          availability: '45 minutos disponibles',
          communication_style: 'Conversacional, proporciona muchos detalles',
          expectations: 'Que se entiendan las complejidades operacionales'
        }
      },

      // Presentation Simulations (Element 3)
      presentation_executive_board: {
        id: 'presentation_executive_board',
        type: 'presentation',
        title: 'Presentación ante Consejo Ejecutivo',
        element: 'E0877',
        difficulty: 'advanced',
        estimatedDuration: 45,
        description: 'Presentación formal de propuesta de solución ante consejo directivo',
        scenario: {
          company: 'Grupo Empresarial Innovación',
          audience: 'Consejo Ejecutivo (5 miembros)',
          context: 'Presentación de propuesta para implementar sistema de gestión de calidad ISO 9001',
          budget_range: '$500,000 - $750,000 USD',
          timeline: '12 meses de implementación',
          strategic_importance: 'Alta - relacionado con expansión internacional'
        },
        audience: [
          {
            name: 'Dr. Roberto Salinas',
            position: 'Presidente del Consejo',
            personality: 'Analítico, busca ROI claro',
            concerns: ['Retorno de inversión', 'Riesgos financieros', 'Tiempo de recuperación']
          },
          {
            name: 'Ing. Patricia Morales',
            position: 'Directora de Operaciones',
            personality: 'Práctica, orientada a implementación',
            concerns: ['Impacto en operaciones', 'Recursos necesarios', 'Capacitación de personal']
          },
          {
            name: 'Lic. Fernando Castro',
            position: 'Director Financiero',
            personality: 'Conservador, enfocado en costos',
            concerns: ['Costos totales', 'Flujo de efectivo', 'Presupuesto anual']
          }
        ],
        evaluationCriteria: [
          {
            id: 'proposal_description',
            title: 'Describir la propuesta sugerida',
            weight: 10,
            description: 'Explicar claramente qué se propone implementar'
          },
          {
            id: 'scope_mention',
            title: 'Mencionar el alcance',
            weight: 10,
            description: 'Definir qué está incluido y qué no en la propuesta'
          },
          {
            id: 'advantages_disadvantages',
            title: 'Exponer las ventajas y desventajas',
            weight: 10,
            description: 'Presentar un análisis balanceado de pros y contras'
          },
          {
            id: 'responsibilities',
            title: 'Mencionar los responsables de parte del consultante y consultor',
            weight: 10,
            description: 'Clarificar roles y responsabilidades de ambas partes'
          },
          {
            id: 'implementation_stages',
            title: 'Mencionar las etapas de la instalación',
            weight: 9,
            description: 'Describir las fases del proyecto de implementación'
          },
          {
            id: 'deliverables',
            title: 'Mencionar los entregables de cada etapa',
            weight: 9,
            description: 'Especificar qué se entregará en cada fase'
          },
          {
            id: 'implications',
            title: 'Mencionar las implicaciones de la implantación',
            weight: 9,
            description: 'Explicar el impacto organizacional de la implementación'
          },
          {
            id: 'resources',
            title: 'Describir los recursos a emplear',
            weight: 9,
            description: 'Detallar recursos humanos, técnicos y materiales necesarios'
          },
          {
            id: 'questions_response',
            title: 'Responder las preguntas o dudas expresadas',
            weight: 9,
            description: 'Manejar preguntas y objeciones de manera profesional'
          },
          {
            id: 'cost_benefit',
            title: 'Explicar las implicaciones del costo/beneficio',
            weight: 8,
            description: 'Presentar análisis financiero y justificación económica'
          },
          {
            id: 'methodological_order',
            title: 'Mantener orden metodológico en la presentación',
            weight: 7,
            description: 'Seguir una secuencia lógica y profesional'
          }
        ],
        presentation_flow: [
          {
            stage: 'opening',
            duration: 5,
            objectives: ['Presentarse profesionalmente', 'Establecer credibilidad', 'Presentar agenda'],
            key_points: ['Agradecimiento por la oportunidad', 'Breve presentación personal/empresa', 'Agenda de la presentación']
          },
          {
            stage: 'problem_context',
            duration: 8,
            objectives: ['Confirmar entendimiento del problema', 'Presentar hallazgos clave'],
            key_points: ['Resumen del diagnóstico', 'Principales problemas identificados', 'Impacto en la organización']
          },
          {
            stage: 'solution_proposal',
            duration: 15,
            objectives: ['Presentar solución detallada', 'Explicar beneficios y riesgos'],
            key_points: ['Descripción de la solución', 'Ventajas y desventajas', 'Alcance del proyecto']
          },
          {
            stage: 'implementation_plan',
            duration: 10,
            objectives: ['Explicar plan de implementación', 'Definir responsabilidades'],
            key_points: ['Etapas de implementación', 'Cronograma', 'Entregables', 'Responsabilidades']
          },
          {
            stage: 'investment_analysis',
            duration: 5,
            objectives: ['Presentar análisis costo-beneficio', 'Justificar inversión'],
            key_points: ['Costo total', 'ROI esperado', 'Términos de pago']
          },
          {
            stage: 'qa_closure',
            duration: 7,
            objectives: ['Responder preguntas', 'Cerrar profesionalmente'],
            key_points: ['Sesión de preguntas y respuestas', 'Próximos pasos', 'Agradecimiento']
          }
        ],
        potential_questions: [
          {
            questioner: 'Dr. Roberto Salinas',
            question: '¿Cuál es el retorno de inversión específico que podemos esperar y en qué plazo?',
            category: 'financial',
            difficulty: 'high',
            expected_elements: ['ROI específico', 'Cronograma de beneficios', 'Supuestos del cálculo']
          },
          {
            questioner: 'Ing. Patricia Morales',
            question: '¿Cómo afectará este proyecto a nuestras operaciones diarias durante la implementación?',
            category: 'operational',
            difficulty: 'medium',
            expected_elements: ['Impacto operacional', 'Medidas de mitigación', 'Plan de comunicación']
          },
          {
            questioner: 'Lic. Fernando Castro',
            question: '¿Podríamos implementar esto por fases para distribuir mejor el costo?',
            category: 'financial',
            difficulty: 'medium',
            expected_elements: ['Factibilidad de fases', 'Impacto en costos', 'Beneficios de implementación completa vs. fases']
          }
        ]
      },

      presentation_middle_management: {
        id: 'presentation_middle_management',
        type: 'presentation',
        title: 'Presentación a Gerencias Medias',
        element: 'E0877',
        difficulty: 'intermediate',
        estimatedDuration: 30,
        description: 'Presentación de propuesta ante grupo de gerentes de nivel medio',
        scenario: {
          company: 'Retail Modernos S.A.',
          audience: 'Gerentes de área (6 personas)',
          context: 'Propuesta para modernizar procesos de inventario y ventas',
          budget_range: '$150,000 - $200,000 USD',
          timeline: '6 meses de implementación',
          strategic_importance: 'Media - mejora de eficiencia operacional'
        }
      }
    };

    // Store simulation definitions
    Object.values(simulationDefinitions).forEach(simulation => {
      this.simulations.set(simulation.id, simulation);
    });

    console.log('[SimulationEngine] Loaded', this.simulations.size, 'simulation definitions');
  }

  /**
   * Start a simulation session
   * @param {string} simulationId - Simulation identifier
   * @param {Object} options - Simulation options
   */
  async startSimulation(simulationId, options = {}) {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      throw new Error(`Simulation ${simulationId} not found`);
    }

    // Create new session
    const sessionId = this.generateSessionId();
    this.activeSession = {
      id: sessionId,
      simulationId: simulationId,
      type: simulation.type,
      startTime: Date.now(),
      currentStage: simulation.type === 'interview' ? 'introduction' : 'opening',
      progress: 0,
      actions: [],
      responses: [],
      performance: {
        criteriaCompleted: [],
        score: 0,
        timeSpent: 0,
        feedback: []
      },
      state: {
        clientMood: 'neutral',
        engagement: 'medium',
        timeRemaining: simulation.estimatedDuration * 60 // in seconds
      }
    };

    this.emit('simulation:started', {
      sessionId: sessionId,
      simulationId: simulationId,
      type: simulation.type,
      timestamp: Date.now()
    });

    return this.activeSession;
  }

  /**
   * Execute simulation action
   * @param {string} actionType - Type of action (speak, ask, present, etc.)
   * @param {*} actionData - Action data
   */
  executeAction(actionType, actionData) {
    if (!this.activeSession) {
      throw new Error('No active simulation session');
    }

    const simulation = this.simulations.get(this.activeSession.simulationId);
    const action = {
      id: this.generateActionId(),
      type: actionType,
      data: actionData,
      timestamp: Date.now(),
      stage: this.activeSession.currentStage
    };

    this.activeSession.actions.push(action);

    // Process action based on simulation type
    let response;
    if (simulation.type === 'interview') {
      response = this.processInterviewAction(action, simulation);
    } else if (simulation.type === 'presentation') {
      response = this.processPresentationAction(action, simulation);
    }

    // Update session state
    this.updateSessionState(action, response);

    // Evaluate performance
    this.evaluateAction(action, simulation);

    this.emit('simulation:action', {
      sessionId: this.activeSession.id,
      action: action,
      response: response,
      performance: this.activeSession.performance
    });

    return response;
  }

  /**
   * Process interview action
   */
  processInterviewAction(action, simulation) {
    const { client, dialogues } = simulation;
    const currentStage = this.activeSession.currentStage;

    // Find appropriate dialogue based on current stage and action
    const dialogue = dialogues.find(d => d.trigger === currentStage || d.trigger === 'general');
    
    if (!dialogue) {
      return {
        type: 'client_response',
        speaker: client.name,
        content: 'Entiendo. ¿Hay algo más específico que necesite saber?',
        mood: 'neutral',
        engagement: 'medium'
      };
    }

    // Evaluate action quality
    let responseIndex = 0;
    if (action.type === 'speak' && dialogue.response_options) {
      responseIndex = this.evaluateResponseQuality(action.data, dialogue.response_options);
    }

    const isCorrectApproach = responseIndex === dialogue.correct_approach;
    const feedback = isCorrectApproach ? dialogue.feedback.correct : dialogue.feedback.incorrect;

    // Update client mood based on response quality
    if (isCorrectApproach) {
      this.activeSession.state.clientMood = 'positive';
      this.activeSession.state.engagement = 'high';
    } else {
      this.activeSession.state.clientMood = 'neutral';
      this.activeSession.state.engagement = 'medium';
    }

    return {
      type: 'client_response',
      speaker: client.name,
      content: dialogue.client_response,
      mood: this.activeSession.state.clientMood,
      engagement: this.activeSession.state.engagement,
      feedback: feedback,
      isCorrectApproach: isCorrectApproach
    };
  }

  /**
   * Process presentation action
   */
  processPresentationAction(action, simulation) {
    const { audience, presentation_flow } = simulation;
    const currentStage = this.activeSession.currentStage;

    // Find current presentation stage
    const stageInfo = presentation_flow.find(stage => stage.stage === currentStage);
    
    if (!stageInfo) {
      return {
        type: 'audience_feedback',
        content: 'La audiencia escucha atentamente.',
        engagement: 'medium'
      };
    }

    // Simulate audience reaction based on action quality
    const actionQuality = this.evaluatePresentationAction(action, stageInfo);
    
    let audienceResponse;
    if (actionQuality > 0.8) {
      audienceResponse = {
        type: 'positive_engagement',
        content: 'La audiencia muestra interés y toma notas activamente.',
        engagement: 'high',
        feedback: 'Excelente manejo de este punto.'
      };
    } else if (actionQuality > 0.5) {
      audienceResponse = {
        type: 'neutral_engagement',
        content: 'La audiencia sigue la presentación con atención normal.',
        engagement: 'medium',
        feedback: 'Punto cubierto adecuadamente.'
      };
    } else {
      audienceResponse = {
        type: 'low_engagement',
        content: 'Algunos miembros de la audiencia parecen confundidos.',
        engagement: 'low',
        feedback: 'Este punto necesita mayor claridad o detalle.'
      };
    }

    // Occasionally inject questions
    if (Math.random() < 0.3 && simulation.potential_questions) {
      const randomQuestion = simulation.potential_questions[
        Math.floor(Math.random() * simulation.potential_questions.length)
      ];
      
      audienceResponse = {
        type: 'question',
        questioner: randomQuestion.questioner,
        content: randomQuestion.question,
        category: randomQuestion.category,
        difficulty: randomQuestion.difficulty,
        expected_elements: randomQuestion.expected_elements
      };
    }

    return audienceResponse;
  }

  /**
   * Evaluate response quality for interviews
   */
  evaluateResponseQuality(userResponse, options) {
    // Simple keyword matching - in production would use NLP
    const userWords = userResponse.toLowerCase().split(' ');
    let bestMatch = 0;
    let bestIndex = 0;

    options.forEach((option, index) => {
      const optionWords = option.toLowerCase().split(' ');
      const commonWords = userWords.filter(word => optionWords.includes(word));
      const similarity = commonWords.length / optionWords.length;
      
      if (similarity > bestMatch) {
        bestMatch = similarity;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  /**
   * Evaluate presentation action quality
   */
  evaluatePresentationAction(action, stageInfo) {
    // Evaluate based on stage objectives and key points
    const content = action.data.content || '';
    const keyWords = stageInfo.key_points.flatMap(point => point.toLowerCase().split(' '));
    const contentWords = content.toLowerCase().split(' ');
    
    const coverage = contentWords.filter(word => keyWords.includes(word)).length;
    const quality = Math.min(coverage / keyWords.length, 1.0);
    
    return quality;
  }

  /**
   * Update session state
   */
  updateSessionState(action, response) {
    this.activeSession.state.timeRemaining -= 60; // Assume 1 minute per action
    this.activeSession.progress = this.calculateProgress();
    
    // Advance stage if appropriate
    const simulation = this.simulations.get(this.activeSession.simulationId);
    if (simulation.type === 'interview') {
      this.advanceInterviewStage(action);
    } else if (simulation.type === 'presentation') {
      this.advancePresentationStage(action);
    }
  }

  /**
   * Advance interview stage
   */
  advanceInterviewStage(action) {
    const stages = ['introduction', 'purpose_explanation', 'information_gathering', 'evidence_collection', 'closure'];
    const currentIndex = stages.indexOf(this.activeSession.currentStage);
    
    if (currentIndex < stages.length - 1) {
      this.activeSession.currentStage = stages[currentIndex + 1];
    }
  }

  /**
   * Advance presentation stage
   */
  advancePresentationStage(action) {
    const simulation = this.simulations.get(this.activeSession.simulationId);
    const stages = simulation.presentation_flow.map(stage => stage.stage);
    const currentIndex = stages.indexOf(this.activeSession.currentStage);
    
    if (currentIndex < stages.length - 1) {
      this.activeSession.currentStage = stages[currentIndex + 1];
    }
  }

  /**
   * Evaluate action against criteria
   */
  evaluateAction(action, simulation) {
    const criteria = simulation.evaluationCriteria;
    
    criteria.forEach(criterion => {
      if (this.activeSession.performance.criteriaCompleted.includes(criterion.id)) {
        return; // Already completed
      }

      // Check if action fulfills criterion
      if (this.actionFulfillsCriterion(action, criterion)) {
        this.activeSession.performance.criteriaCompleted.push(criterion.id);
        this.activeSession.performance.score += criterion.weight;
        this.activeSession.performance.feedback.push({
          criterion: criterion.id,
          title: criterion.title,
          achieved: true,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Check if action fulfills specific criterion
   */
  actionFulfillsCriterion(action, criterion) {
    // This would be more sophisticated in production
    const actionContent = (action.data.content || '').toLowerCase();
    
    switch (criterion.id) {
      case 'introduction':
        return actionContent.includes('nombre') || actionContent.includes('soy');
      case 'purpose_explanation':
        return actionContent.includes('propósito') || actionContent.includes('objetivo');
      case 'information_request':
        return actionContent.includes('información') || actionContent.includes('datos');
      case 'evidence_request':
        return actionContent.includes('evidencia') || actionContent.includes('documento');
      case 'closure':
        return actionContent.includes('gracias') || actionContent.includes('agradezco');
      default:
        return false;
    }
  }

  /**
   * Calculate overall progress
   */
  calculateProgress() {
    const simulation = this.simulations.get(this.activeSession.simulationId);
    const totalCriteria = simulation.evaluationCriteria.length;
    const completedCriteria = this.activeSession.performance.criteriaCompleted.length;
    
    return Math.round((completedCriteria / totalCriteria) * 100);
  }

  /**
   * Complete simulation
   */
  async completeSimulation() {
    if (!this.activeSession) {
      throw new Error('No active simulation session');
    }

    const simulation = this.simulations.get(this.activeSession.simulationId);
    const session = this.activeSession;
    
    // Calculate final results
    const results = {
      sessionId: session.id,
      simulationId: session.simulationId,
      type: session.type,
      startTime: session.startTime,
      endTime: Date.now(),
      duration: Date.now() - session.startTime,
      finalScore: session.performance.score,
      maxScore: simulation.evaluationCriteria.reduce((sum, criterion) => sum + criterion.weight, 0),
      percentage: Math.round((session.performance.score / simulation.evaluationCriteria.reduce((sum, criterion) => sum + criterion.weight, 0)) * 100),
      criteriaCompleted: session.performance.criteriaCompleted,
      totalCriteria: simulation.evaluationCriteria.length,
      feedback: session.performance.feedback,
      recommendations: this.generateRecommendations(session, simulation),
      certification: this.evaluateCertificationReadiness(session, simulation)
    };

    // Store results
    this.sessionHistory.set(session.id, results);
    await this.saveUserProgress();

    // Clear active session
    this.activeSession = null;

    this.emit('simulation:completed', {
      sessionId: session.id,
      results: results,
      timestamp: Date.now()
    });

    return results;
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(session, simulation) {
    const recommendations = [];
    const criteriaCompleted = session.performance.criteriaCompleted;
    
    simulation.evaluationCriteria.forEach(criterion => {
      if (!criteriaCompleted.includes(criterion.id)) {
        recommendations.push({
          area: criterion.title,
          priority: criterion.weight > 15 ? 'high' : 'medium',
          suggestion: `Practicar: ${criterion.description}`,
          resources: [`Módulo de práctica: ${criterion.id}`]
        });
      }
    });

    return recommendations;
  }

  /**
   * Evaluate certification readiness
   */
  evaluateCertificationReadiness(session, simulation) {
    const percentage = Math.round((session.performance.score / simulation.evaluationCriteria.reduce((sum, criterion) => sum + criterion.weight, 0)) * 100);
    
    return {
      ready: percentage >= 80,
      score: percentage,
      level: percentage >= 90 ? 'excellent' : percentage >= 80 ? 'good' : percentage >= 60 ? 'acceptable' : 'needs_improvement',
      nextSteps: percentage >= 80 ? 
        ['Proceder con evaluación oficial'] : 
        ['Practicar áreas débiles', 'Repetir simulación', 'Revisar material teórico']
    };
  }

  /**
   * Render simulation interface
   */
  async renderSimulation(container, simulationId) {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      container.innerHTML = '<div class="error">Simulación no encontrada</div>';
      return;
    }

    container.innerHTML = this.renderSimulationStart(simulation);
  }

  /**
   * Render simulation start screen
   */
  renderSimulationStart(simulation) {
    return `
      <div class="simulation-start">
        <div class="simulation-header">
          <h2>${simulation.title}</h2>
          <div class="simulation-meta">
            <span class="badge badge-${simulation.difficulty}">${simulation.difficulty}</span>
            <span class="duration">⏱️ ${simulation.estimatedDuration} minutos</span>
            <span class="element">Elemento: ${simulation.element}</span>
          </div>
          <p class="simulation-description">${simulation.description}</p>
        </div>

        <div class="scenario-info">
          <h3>📋 Información del Escenario</h3>
          ${simulation.type === 'interview' ? this.renderInterviewScenario(simulation) : this.renderPresentationScenario(simulation)}
        </div>

        <div class="objectives-section">
          <h3>🎯 Objetivos</h3>
          <ul>
            ${simulation.objectives?.map(obj => `<li>${obj}</li>`).join('') || '<li>Completar todos los criterios de evaluación</li>'}
          </ul>
        </div>

        <div class="evaluation-criteria">
          <h3>📝 Criterios de Evaluación</h3>
          <div class="criteria-grid">
            ${simulation.evaluationCriteria.map(criterion => `
              <div class="criterion-card">
                <h4>${criterion.title}</h4>
                <p>${criterion.description}</p>
                <div class="criterion-weight">Peso: ${criterion.weight}%</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="simulation-actions">
          <button class="btn btn-primary btn-lg" onclick="ec0249App.simulationEngine.startSimulationSession('${simulation.id}')">
            Iniciar Simulación
          </button>
          <button class="btn btn-secondary" onclick="history.back()">
            Volver al Módulo
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render interview scenario
   */
  renderInterviewScenario(simulation) {
    const { scenario, client } = simulation;
    return `
      <div class="scenario-details">
        <div class="company-info">
          <h4>Empresa: ${scenario.company}</h4>
          <ul>
            <li><strong>Industria:</strong> ${scenario.industry}</li>
            <li><strong>Tamaño:</strong> ${scenario.size}</li>
            <li><strong>Problema:</strong> ${scenario.problem}</li>
          </ul>
          <p><strong>Contexto:</strong> ${scenario.context}</p>
        </div>
        
        <div class="client-profile">
          <h4>Perfil del Cliente</h4>
          <div class="client-details">
            <p><strong>${client.name}</strong> - ${client.position}</p>
            <p><strong>Personalidad:</strong> ${client.personality}</p>
            <p><strong>Experiencia:</strong> ${client.experience}</p>
            <p><strong>Disponibilidad:</strong> ${client.availability}</p>
            <p><strong>Expectativas:</strong> ${client.expectations}</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render presentation scenario
   */
  renderPresentationScenario(simulation) {
    const { scenario, audience } = simulation;
    return `
      <div class="scenario-details">
        <div class="company-info">
          <h4>Empresa: ${scenario.company}</h4>
          <ul>
            <li><strong>Audiencia:</strong> ${scenario.audience}</li>
            <li><strong>Presupuesto:</strong> ${scenario.budget_range}</li>
            <li><strong>Cronograma:</strong> ${scenario.timeline}</li>
            <li><strong>Importancia:</strong> ${scenario.strategic_importance}</li>
          </ul>
          <p><strong>Contexto:</strong> ${scenario.context}</p>
        </div>
        
        <div class="audience-profiles">
          <h4>Perfiles de la Audiencia</h4>
          ${audience?.map(member => `
            <div class="audience-member">
              <h5>${member.name} - ${member.position}</h5>
              <p><strong>Personalidad:</strong> ${member.personality}</p>
              <p><strong>Preocupaciones:</strong> ${member.concerns.join(', ')}</p>
            </div>
          `).join('') || '<p>Audiencia general de ejecutivos</p>'}
        </div>
      </div>
    `;
  }

  /**
   * Start simulation session and render interface
   */
  async startSimulationSession(simulationId) {
    try {
      const session = await this.startSimulation(simulationId);
      this.renderSimulationInterface(session);
    } catch (error) {
      this.showNotification('Error al iniciar simulación: ' + error.message, 'error');
    }
  }

  /**
   * Render active simulation interface
   */
  renderSimulationInterface(session) {
    const container = document.getElementById('contentArea');
    const simulation = this.simulations.get(session.simulationId);
    
    container.innerHTML = `
      <div class="simulation-active">
        <div class="simulation-header">
          <h2>${simulation.title}</h2>
          <div class="simulation-status">
            <div class="progress-info">
              <span>Progreso: ${session.progress}%</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${session.progress}%"></div>
              </div>
            </div>
            <div class="time-remaining">
              ⏱️ <span id="timeRemaining">${Math.floor(session.state.timeRemaining / 60)}:${(session.state.timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        <div class="simulation-content">
          <div class="interaction-area" id="interactionArea">
            ${this.renderInitialInteraction(simulation)}
          </div>
          
          <div class="response-area">
            <textarea id="userResponse" placeholder="Escriba su respuesta aquí..." rows="4"></textarea>
            <div class="response-actions">
              <button class="btn btn-primary" onclick="ec0249App.simulationEngine.submitResponse()">
                Enviar Respuesta
              </button>
              <button class="btn btn-secondary" onclick="ec0249App.simulationEngine.completeSimulation()">
                Finalizar Simulación
              </button>
            </div>
          </div>
        </div>

        <div class="criteria-tracker">
          <h4>Criterios de Evaluación</h4>
          <div class="criteria-list">
            ${simulation.evaluationCriteria.map(criterion => `
              <div class="criterion-item ${session.performance.criteriaCompleted.includes(criterion.id) ? 'completed' : ''}">
                <span class="criterion-title">${criterion.title}</span>
                <span class="criterion-status">
                  ${session.performance.criteriaCompleted.includes(criterion.id) ? '✅' : '⏳'}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Start timer
    this.startSessionTimer();
  }

  /**
   * Render initial interaction
   */
  renderInitialInteraction(simulation) {
    if (simulation.type === 'interview') {
      const firstDialogue = simulation.dialogues.find(d => d.trigger === 'start');
      return `
        <div class="interaction-message client-message">
          <div class="speaker">${simulation.client.name}</div>
          <div class="message">${firstDialogue?.client_response || 'Buenos días, ¿en qué puedo ayudarle?'}</div>
        </div>
      `;
    } else {
      return `
        <div class="interaction-message system-message">
          <div class="message">Bienvenido a la sala de presentaciones. La audiencia está lista para escuchar su propuesta.</div>
        </div>
      `;
    }
  }

  /**
   * Submit user response
   */
  submitResponse() {
    const responseText = document.getElementById('userResponse').value.trim();
    if (!responseText) {
      this.showNotification('Por favor escriba una respuesta', 'warning');
      return;
    }

    const response = this.executeAction('speak', { content: responseText });
    this.updateInteractionArea(responseText, response);
    
    // Clear input
    document.getElementById('userResponse').value = '';
  }

  /**
   * Update interaction area with new messages
   */
  updateInteractionArea(userMessage, systemResponse) {
    const interactionArea = document.getElementById('interactionArea');
    
    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'interaction-message user-message';
    userMessageDiv.innerHTML = `
      <div class="speaker">Usted</div>
      <div class="message">${userMessage}</div>
    `;
    interactionArea.appendChild(userMessageDiv);

    // Add system response
    const responseDiv = document.createElement('div');
    responseDiv.className = `interaction-message ${systemResponse.type === 'client_response' ? 'client-message' : 'system-message'}`;
    responseDiv.innerHTML = `
      <div class="speaker">${systemResponse.speaker || 'Sistema'}</div>
      <div class="message">${systemResponse.content}</div>
      ${systemResponse.feedback ? `<div class="feedback ${systemResponse.isCorrectApproach ? 'positive' : 'neutral'}">${systemResponse.feedback}</div>` : ''}
    `;
    interactionArea.appendChild(responseDiv);

    // Scroll to bottom
    interactionArea.scrollTop = interactionArea.scrollHeight;

    // Update criteria tracker
    this.updateCriteriaTracker();
  }

  /**
   * Update criteria tracker
   */
  updateCriteriaTracker() {
    if (!this.activeSession) return;

    const criteriaItems = document.querySelectorAll('.criterion-item');
    criteriaItems.forEach(item => {
      const criterionTitle = item.querySelector('.criterion-title').textContent;
      const simulation = this.simulations.get(this.activeSession.simulationId);
      const criterion = simulation.evaluationCriteria.find(c => c.title === criterionTitle);
      
      if (criterion && this.activeSession.performance.criteriaCompleted.includes(criterion.id)) {
        item.classList.add('completed');
        item.querySelector('.criterion-status').textContent = '✅';
      }
    });
  }

  /**
   * Start session timer
   */
  startSessionTimer() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }

    this.sessionTimer = setInterval(() => {
      if (!this.activeSession) {
        clearInterval(this.sessionTimer);
        return;
      }

      this.activeSession.state.timeRemaining--;
      const timeDisplay = document.getElementById('timeRemaining');
      if (timeDisplay) {
        const minutes = Math.floor(this.activeSession.state.timeRemaining / 60);
        const seconds = this.activeSession.state.timeRemaining % 60;
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      if (this.activeSession.state.timeRemaining <= 0) {
        this.completeSimulation();
      }
    }, 1000);
  }

  /**
   * Utility methods
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateActionId() {
    return 'action_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  getSimulation(simulationId) {
    return this.simulations.get(simulationId);
  }

  getActiveSession() {
    return this.activeSession;
  }

  getSessionHistory() {
    return Array.from(this.sessionHistory.values());
  }

  /**
   * Event handlers
   */
  handleSimulationStart(data) {
    console.log('[SimulationEngine] Simulation started:', data);
  }

  handleSimulationAction(data) {
    console.log('[SimulationEngine] Action executed:', data);
  }

  handleSimulationComplete(data) {
    console.log('[SimulationEngine] Simulation completed:', data);
  }

  handleScenarioResponse(data) {
    console.log('[SimulationEngine] Scenario response:', data);
  }

  /**
   * Storage methods
   */
  async loadUserProgress() {
    try {
      const progress = await this.storage.get('simulation_progress');
      if (progress) {
        this.sessionHistory = new Map(progress.history || []);
        this.performanceMetrics = new Map(progress.metrics || []);
      }
    } catch (error) {
      console.warn('[SimulationEngine] Failed to load progress:', error);
    }
  }

  async saveUserProgress() {
    try {
      await this.storage.set('simulation_progress', {
        history: Array.from(this.sessionHistory.entries()),
        metrics: Array.from(this.performanceMetrics.entries()),
        lastUpdate: Date.now()
      });
    } catch (error) {
      console.warn('[SimulationEngine] Failed to save progress:', error);
    }
  }

  async onDestroy() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    
    this.simulations.clear();
    this.scenarios.clear();
    this.sessionHistory.clear();
    this.performanceMetrics.clear();
    this.activeSession = null;
  }
}

export default SimulationEngine;