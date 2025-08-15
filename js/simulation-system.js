// EC0249 Interactive Simulation System
class SimulationSystem {
  constructor(app) {
    this.app = app;
    this.scenarios = this.initializeScenarios();
    this.currentSimulation = null;
    this.simulationState = {
      phase: 'setup', // setup, active, evaluation
      timeElapsed: 0,
      userActions: [],
      criteriaChecklist: {}
    };
  }

  initializeScenarios() {
    return {
      interview_operations_director: {
        id: 'interview_operations_director',
        title: 'Entrevista con Director de Operaciones',
        type: 'interview',
        difficulty: 'intermediate',
        duration: 45, // minutes
        description: 'Conducir una entrevista efectiva para identificar problemas operacionales',
        context: {
          company: 'Manufacturera del Norte S.A.',
          industry: 'Manufactura de autopartes',
          problemStatement: 'Incremento en tiempos de producción y problemas de calidad',
          urgency: 'Alta - afectando contratos con clientes principales'
        },
        client: {
          name: 'María González',
          position: 'Directora de Operaciones',
          personality: {
            traits: ['Directa', 'Orientada a datos', 'Impaciente', 'Experimentada'],
            communication: 'Concisa y técnica',
            concerns: ['Eficiencia operacional', 'Control de calidad', 'Costos'],
            resistance: ['Cambios costosos', 'Interrupciones de producción']
          },
          background: {
            experience: '15 años en la industria',
            education: 'Ingeniería Industrial',
            previousConsultants: 'Ha trabajado con 2 consultores anteriormente',
            currentChallenges: [
              'Aumento del 15% en tiempos de producción',
              'Duplicación de reclamos de calidad',
              'Presión de la dirección general'
            ]
          },
          responsePatterns: {
            greeting: [
              'Buenos días. Espero que esta reunión sea productiva.',
              'Gracias por venir. Necesitamos resolver estos problemas pronto.',
              'Bien, empecemos. No tengo mucho tiempo disponible.'
            ],
            problemDetails: {
              production: 'Los tiempos de ciclo han aumentado de 45 a 52 minutos en promedio.',
              quality: 'Los defectos por millón han pasado de 120 a 240 en tres meses.',
              impact: 'Dos clientes importantes han amenazado con cancelar contratos.'
            },
            evidence: {
              reports: 'Tengo reportes de producción semanales de los últimos 6 meses.',
              data: 'Registros de control de calidad y métricas de eficiencia.',
              feedback: 'Comentarios del personal de línea y supervisores.'
            },
            resistance: [
              'Ya hemos invertido mucho en capacitación este año.',
              'No podemos parar la producción para hacer cambios.',
              'Los costos adicionales son un problema en este momento.'
            ]
          }
        },
        evaluationCriteria: [
          {
            id: 'introduction',
            criterion: 'Dar su nombre al inicio de la entrevista',
            points: 10,
            keywords: ['nombre', 'soy', 'me llamo'],
            required: true
          },
          {
            id: 'purpose',
            criterion: 'Indicar que la razón de la entrevista es obtener datos relativos al problema',
            points: 15,
            keywords: ['razón', 'propósito', 'problema', 'información', 'datos'],
            required: true
          },
          {
            id: 'information_request',
            criterion: 'Solicitar que la información requerida se proporcione verbalmente/por escrito',
            points: 15,
            keywords: ['información', 'verbal', 'escrito', 'documentos', 'proporcionar'],
            required: true
          },
          {
            id: 'evidence_request',
            criterion: 'Solicitar que las evidencias que soporten sus respuestas sean proporcionadas',
            points: 15,
            keywords: ['evidencia', 'soporte', 'documentación', 'respaldo', 'pruebas'],
            required: true
          },
          {
            id: 'recording',
            criterion: 'Registrar las respuestas obtenidas',
            points: 15,
            keywords: ['notas', 'registrar', 'anotar', 'escribir'],
            required: true
          },
          {
            id: 'closing',
            criterion: 'Cerrar la entrevista agradeciendo la participación',
            points: 10,
            keywords: ['gracias', 'agradezco', 'tiempo', 'participación'],
            required: true
          },
          {
            id: 'professionalism',
            criterion: 'Mantener profesionalismo durante toda la entrevista',
            points: 10,
            keywords: [],
            subjective: true
          },
          {
            id: 'active_listening',
            criterion: 'Demostrar escucha activa y hacer preguntas de seguimiento',
            points: 10,
            keywords: ['entiendo', 'pregunta', 'puede explicar', 'más detalles'],
            subjective: true
          }
        ]
      },

      presentation_boardroom: {
        id: 'presentation_boardroom',
        title: 'Presentación a Junta Directiva',
        type: 'presentation',
        difficulty: 'advanced',
        duration: 60,
        description: 'Presentar propuesta de solución a la junta directiva',
        context: {
          company: 'Grupo Empresarial Azteca',
          audience: 'Junta Directiva',
          problemStatement: 'Reestructuración organizacional necesaria',
          budget: '$2.5M disponibles para el proyecto'
        },
        audience: [
          {
            name: 'Carlos Mendoza',
            position: 'Director General',
            personality: 'Visionario pero cauteloso con inversiones',
            concerns: ['ROI', 'Tiempo de implementación', 'Riesgo de disrupción'],
            likely_questions: [
              '¿Cuál es el retorno de inversión esperado?',
              '¿Cuánto tiempo tomará ver resultados?',
              '¿Qué riesgos representa para nuestras operaciones actuales?'
            ]
          },
          {
            name: 'Ana Rodríguez',
            position: 'Directora Financiera',
            personality: 'Analítica y orientada a números',
            concerns: ['Costos', 'Flujo de efectivo', 'Justificación financiera'],
            likely_questions: [
              '¿Cómo se justifican estos costos?',
              '¿Cuál es el impacto en el flujo de efectivo?',
              '¿Hay alternativas más económicas?'
            ]
          },
          {
            name: 'Roberto Silva',
            position: 'Director de RRHH',
            personality: 'Preocupado por el impacto en personal',
            concerns: ['Impacto en empleados', 'Cambio organizacional', 'Comunicación'],
            likely_questions: [
              '¿Cómo afectará esto a nuestros empleados?',
              '¿Qué plan de comunicación propone?',
              '¿Habrá necesidad de despidos?'
            ]
          }
        ],
        presentationStructure: [
          {
            section: 'introduction',
            title: 'Introducción y Agenda',
            timeLimit: 5,
            required: true
          },
          {
            section: 'problem_analysis',
            title: 'Análisis del Problema',
            timeLimit: 10,
            required: true
          },
          {
            section: 'proposed_solution',
            title: 'Solución Propuesta',
            timeLimit: 15,
            required: true
          },
          {
            section: 'implementation_plan',
            title: 'Plan de Implementación',
            timeLimit: 10,
            required: true
          },
          {
            section: 'cost_benefit',
            title: 'Análisis Costo-Beneficio',
            timeLimit: 10,
            required: true
          },
          {
            section: 'qa_session',
            title: 'Sesión de Preguntas y Respuestas',
            timeLimit: 10,
            required: true
          }
        ],
        evaluationCriteria: [
          {
            id: 'proposal_description',
            criterion: 'Describir la propuesta sugerida',
            points: 10,
            required: true
          },
          {
            id: 'scope_mention',
            criterion: 'Mencionar el alcance',
            points: 10,
            required: true
          },
          {
            id: 'advantages_disadvantages',
            criterion: 'Exponer las ventajas y desventajas',
            points: 15,
            required: true
          },
          {
            id: 'client_responsibilities',
            criterion: 'Mencionar los responsables de parte del consultante',
            points: 10,
            required: true
          },
          {
            id: 'consultant_responsibilities',
            criterion: 'Mencionar los responsables de parte del consultor',
            points: 10,
            required: true
          },
          {
            id: 'implementation_stages',
            criterion: 'Mencionar las etapas de la instalación',
            points: 10,
            required: true
          },
          {
            id: 'deliverables',
            criterion: 'Mencionar los entregables de cada etapa',
            points: 10,
            required: true
          },
          {
            id: 'implementation_implications',
            criterion: 'Mencionar las implicaciones de la implantación',
            points: 10,
            required: true
          },
          {
            id: 'resources_description',
            criterion: 'Describir los recursos a emplear',
            points: 5,
            required: true
          },
          {
            id: 'qa_handling',
            criterion: 'Responder las preguntas o dudas expresadas',
            points: 5,
            required: true
          },
          {
            id: 'cost_benefit_explanation',
            criterion: 'Explicar las implicaciones del costo/beneficio',
            points: 5,
            required: true
          }
        ]
      }
    };
  }

  startSimulation(scenarioId) {
    const scenario = this.scenarios[scenarioId];
    if (!scenario) {
      console.error(`Scenario not found: ${scenarioId}`);
      return;
    }

    this.currentSimulation = scenario;
    this.simulationState = {
      phase: 'setup',
      timeElapsed: 0,
      userActions: [],
      criteriaChecklist: {},
      startTime: new Date()
    };

    // Initialize criteria checklist
    scenario.evaluationCriteria.forEach(criterion => {
      this.simulationState.criteriaChecklist[criterion.id] = {
        completed: false,
        score: 0,
        evidence: []
      };
    });

    this.renderSimulationSetup(scenario);
  }

  renderSimulationSetup(scenario) {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
      <div class="simulation-setup">
        <div class="scenario-header">
          <h1>🎮 ${scenario.title}</h1>
          <div class="scenario-meta">
            <span class="difficulty ${scenario.difficulty}">${this.formatDifficulty(scenario.difficulty)}</span>
            <span class="duration">⏱️ ${scenario.duration} minutos</span>
            <span class="type">${this.formatType(scenario.type)}</span>
          </div>
        </div>

        <div class="scenario-briefing">
          <h2>Información del Escenario</h2>
          <div class="briefing-content">
            <div class="context-card">
              <h3>Contexto</h3>
              <p><strong>Descripción:</strong> ${scenario.description}</p>
              ${scenario.context ? `
                <p><strong>Empresa:</strong> ${scenario.context.company}</p>
                <p><strong>Situación:</strong> ${scenario.context.problemStatement}</p>
                ${scenario.context.urgency ? `<p><strong>Urgencia:</strong> ${scenario.context.urgency}</p>` : ''}
              ` : ''}
            </div>

            ${scenario.type === 'interview' && scenario.client ? `
              <div class="client-card">
                <h3>Perfil del Cliente</h3>
                <p><strong>Nombre:</strong> ${scenario.client.name}</p>
                <p><strong>Posición:</strong> ${scenario.client.position}</p>
                <p><strong>Personalidad:</strong> ${scenario.client.personality.traits.join(', ')}</p>
                <p><strong>Experiencia:</strong> ${scenario.client.background.experience}</p>
                <div class="client-concerns">
                  <h4>Preocupaciones Principales:</h4>
                  <ul>
                    ${scenario.client.personality.concerns.map(concern => `<li>${concern}</li>`).join('')}
                  </ul>
                </div>
              </div>
            ` : ''}

            ${scenario.type === 'presentation' && scenario.audience ? `
              <div class="audience-card">
                <h3>Audiencia</h3>
                ${scenario.audience.map(member => `
                  <div class="audience-member">
                    <h4>${member.name} - ${member.position}</h4>
                    <p>${member.personality}</p>
                    <div class="member-concerns">
                      <strong>Preocupaciones:</strong> ${member.concerns.join(', ')}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="evaluation-criteria">
          <h2>Criterios de Evaluación</h2>
          <div class="criteria-list">
            ${scenario.evaluationCriteria.map(criterion => `
              <div class="criterion-item">
                <div class="criterion-info">
                  <span class="criterion-text">${criterion.criterion}</span>
                  <span class="criterion-points">${criterion.points} puntos</span>
                </div>
                ${criterion.required ? '<span class="required-badge">Requerido</span>' : ''}
              </div>
            `).join('')}
          </div>
          <div class="total-points">
            <strong>Total: ${scenario.evaluationCriteria.reduce((sum, c) => sum + c.points, 0)} puntos</strong>
          </div>
        </div>

        <div class="simulation-controls">
          <div class="preparation-checklist">
            <h3>Lista de Preparación</h3>
            <label><input type="checkbox" id="prep1"> He revisado el contexto del escenario</label>
            <label><input type="checkbox" id="prep2"> Entiendo los criterios de evaluación</label>
            <label><input type="checkbox" id="prep3"> Estoy listo para comenzar</label>
          </div>
          
          <div class="start-controls">
            <button class="btn btn-secondary" onclick="history.back()">← Volver</button>
            <button class="btn btn-primary" id="startSimulationBtn" onclick="ec0249App.simulationSystem.startActivePhase()" disabled>
              🚀 Comenzar Simulación
            </button>
          </div>
        </div>
      </div>
    `;

    this.setupPreparationChecklist();
  }

  setupPreparationChecklist() {
    const checkboxes = document.querySelectorAll('.preparation-checklist input[type="checkbox"]');
    const startButton = document.getElementById('startSimulationBtn');

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        startButton.disabled = !allChecked;
      });
    });
  }

  startActivePhase() {
    this.simulationState.phase = 'active';
    this.simulationState.startTime = new Date();
    
    if (this.currentSimulation.type === 'interview') {
      this.renderInterviewSimulation();
    } else if (this.currentSimulation.type === 'presentation') {
      this.renderPresentationSimulation();
    }

    this.startSimulationTimer();
  }

  renderInterviewSimulation() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
      <div class="interview-simulation">
        <div class="simulation-header">
          <div class="simulation-info">
            <h2>🎤 Entrevista en Progreso</h2>
            <div class="client-info">
              <strong>${this.currentSimulation.client.name}</strong> - ${this.currentSimulation.client.position}
            </div>
          </div>
          <div class="simulation-controls">
            <div class="timer" id="simulationTimer">00:00</div>
            <button class="btn btn-sm btn-secondary" onclick="ec0249App.simulationSystem.pauseSimulation()">⏸️ Pausar</button>
            <button class="btn btn-sm btn-danger" onclick="ec0249App.simulationSystem.endSimulation()">🛑 Finalizar</button>
          </div>
        </div>

        <div class="interview-interface">
          <div class="conversation-area">
            <div class="client-avatar">
              <div class="avatar-circle">
                <span class="avatar-initials">${this.getInitials(this.currentSimulation.client.name)}</span>
              </div>
              <div class="client-status online">En línea</div>
            </div>

            <div class="conversation-log" id="conversationLog">
              <div class="message client-message">
                <span class="message-sender">${this.currentSimulation.client.name}:</span>
                <span class="message-text">${this.getRandomResponse(this.currentSimulation.client.responsePatterns.greeting)}</span>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <div class="user-input-area">
              <textarea 
                id="userMessage" 
                placeholder="Escriba su respuesta o pregunta aquí..."
                rows="3"
                onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); ec0249App.simulationSystem.sendMessage(); }"
              ></textarea>
              <div class="input-controls">
                <button class="btn btn-sm btn-secondary" onclick="ec0249App.simulationSystem.requestDocuments()">
                  📄 Solicitar Documentos
                </button>
                <button class="btn btn-sm btn-primary" onclick="ec0249App.simulationSystem.sendMessage()">
                  Enviar Mensaje
                </button>
              </div>
            </div>
          </div>

          <div class="evaluation-panel">
            <h3>Seguimiento de Criterios</h3>
            <div class="criteria-tracking">
              ${this.currentSimulation.evaluationCriteria.map(criterion => `
                <div class="criterion-track" id="criterion_${criterion.id}">
                  <div class="criterion-status ${this.simulationState.criteriaChecklist[criterion.id].completed ? 'completed' : 'pending'}">
                    <span class="status-icon">${this.simulationState.criteriaChecklist[criterion.id].completed ? '✅' : '⏳'}</span>
                    <span class="criterion-text">${criterion.criterion}</span>
                    <span class="criterion-points">${criterion.points}pts</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="notes-section">
              <h4>Notas de la Entrevista</h4>
              <textarea 
                id="interviewNotes" 
                placeholder="Registre aquí sus notas durante la entrevista..."
                rows="8"
                oninput="ec0249App.simulationSystem.updateCriterion('recording', this.value)"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  sendMessage() {
    const messageInput = document.getElementById('userMessage');
    const message = messageInput.value.trim();
    
    if (!message) return;

    // Add user message to conversation
    this.addToConversation('user', 'Usted', message);
    
    // Analyze message for criteria fulfillment
    this.analyzeUserMessage(message);
    
    // Generate client response
    setTimeout(() => {
      const response = this.generateClientResponse(message);
      this.addToConversation('client', this.currentSimulation.client.name, response);
    }, 1500);

    messageInput.value = '';
  }

  addToConversation(sender, name, message) {
    const conversationLog = document.getElementById('conversationLog');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.innerHTML = `
      <span class="message-sender">${name}:</span>
      <span class="message-text">${message}</span>
      <span class="message-time">${new Date().toLocaleTimeString()}</span>
    `;
    
    conversationLog.appendChild(messageElement);
    conversationLog.scrollTop = conversationLog.scrollHeight;

    // Store in simulation state
    this.simulationState.userActions.push({
      timestamp: new Date(),
      type: 'message',
      sender: sender,
      content: message
    });
  }

  analyzeUserMessage(message) {
    const lowercaseMessage = message.toLowerCase();
    
    this.currentSimulation.evaluationCriteria.forEach(criterion => {
      if (criterion.keywords && criterion.keywords.length > 0) {
        const hasKeywords = criterion.keywords.some(keyword => 
          lowercaseMessage.includes(keyword.toLowerCase())
        );
        
        if (hasKeywords && !this.simulationState.criteriaChecklist[criterion.id].completed) {
          this.updateCriterion(criterion.id, message);
        }
      }
    });
  }

  updateCriterion(criterionId, evidence) {
    const criterionState = this.simulationState.criteriaChecklist[criterionId];
    
    if (!criterionState.completed) {
      criterionState.completed = true;
      criterionState.evidence.push({
        timestamp: new Date(),
        content: evidence
      });
      
      const criterion = this.currentSimulation.evaluationCriteria.find(c => c.id === criterionId);
      criterionState.score = criterion.points;

      // Update UI
      const criterionElement = document.getElementById(`criterion_${criterionId}`);
      if (criterionElement) {
        const statusElement = criterionElement.querySelector('.criterion-status');
        statusElement.classList.remove('pending');
        statusElement.classList.add('completed');
        statusElement.querySelector('.status-icon').textContent = '✅';
      }

      this.app.showNotification(`Criterio completado: ${criterion.criterion}`, 'success');
    }
  }

  generateClientResponse(userMessage) {
    const client = this.currentSimulation.client;
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Simple response logic based on keywords
    if (lowercaseMessage.includes('problema') || lowercaseMessage.includes('situación')) {
      return this.getRandomResponse([
        client.responsePatterns.problemDetails.production,
        client.responsePatterns.problemDetails.quality,
        client.responsePatterns.problemDetails.impact
      ]);
    } else if (lowercaseMessage.includes('documento') || lowercaseMessage.includes('evidencia')) {
      return this.getRandomResponse([
        client.responsePatterns.evidence.reports,
        client.responsePatterns.evidence.data,
        'Claro, puedo proporcionarle esa documentación.'
      ]);
    } else if (lowercaseMessage.includes('costo') || lowercaseMessage.includes('presupuesto')) {
      return this.getRandomResponse(client.responsePatterns.resistance);
    } else {
      return this.getRandomResponse([
        'Entiendo. ¿Qué más necesita saber?',
        'Correcto. ¿Hay algo específico que le interese?',
        'Sí, ese es efectivamente el caso.',
        'Puede ser. ¿Cuál es su siguiente pregunta?'
      ]);
    }
  }

  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  startSimulationTimer() {
    this.timerInterval = setInterval(() => {
      this.simulationState.timeElapsed++;
      const timerElement = document.getElementById('simulationTimer');
      if (timerElement) {
        const minutes = Math.floor(this.simulationState.timeElapsed / 60);
        const seconds = this.simulationState.timeElapsed % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  endSimulation() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.simulationState.phase = 'evaluation';
    this.simulationState.endTime = new Date();
    
    const results = this.calculateSimulationResults();
    this.showSimulationResults(results);
  }

  calculateSimulationResults() {
    let totalPoints = 0;
    let earnedPoints = 0;
    const completedCriteria = [];
    const missedCriteria = [];

    this.currentSimulation.evaluationCriteria.forEach(criterion => {
      totalPoints += criterion.points;
      const criterionState = this.simulationState.criteriaChecklist[criterion.id];
      
      if (criterionState.completed) {
        earnedPoints += criterionState.score;
        completedCriteria.push(criterion);
      } else {
        missedCriteria.push(criterion);
      }
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const passed = percentage >= 70; // Minimum passing score

    return {
      totalPoints,
      earnedPoints,
      percentage,
      passed,
      completedCriteria,
      missedCriteria,
      duration: this.simulationState.timeElapsed,
      interactionCount: this.simulationState.userActions.length
    };
  }

  showSimulationResults(results) {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
      <div class="simulation-results">
        <div class="results-header">
          <h1>📊 Resultados de la Simulación</h1>
          <div class="score-summary ${results.passed ? 'passed' : 'failed'}">
            <div class="score-circle">
              <div class="score-number">${results.percentage}%</div>
              <div class="score-label">${results.passed ? 'APROBADO' : 'NECESITA MEJORAR'}</div>
            </div>
            <div class="score-details">
              <p>Puntuación: ${results.earnedPoints}/${results.totalPoints} puntos</p>
              <p>Duración: ${Math.floor(results.duration / 60)}:${(results.duration % 60).toString().padStart(2, '0')}</p>
              <p>Interacciones: ${results.interactionCount}</p>
            </div>
          </div>
        </div>

        <div class="criteria-results">
          <div class="completed-criteria">
            <h3>✅ Criterios Completados (${results.completedCriteria.length})</h3>
            ${results.completedCriteria.map(criterion => `
              <div class="criterion-result completed">
                <span class="criterion-text">${criterion.criterion}</span>
                <span class="criterion-points">${criterion.points} puntos</span>
              </div>
            `).join('')}
          </div>

          <div class="missed-criteria">
            <h3>❌ Criterios No Completados (${results.missedCriteria.length})</h3>
            ${results.missedCriteria.map(criterion => `
              <div class="criterion-result missed">
                <span class="criterion-text">${criterion.criterion}</span>
                <span class="criterion-points">${criterion.points} puntos perdidos</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="feedback-section">
          <h3>💡 Retroalimentación y Recomendaciones</h3>
          ${this.generateFeedback(results)}
        </div>

        <div class="results-actions">
          <button class="btn btn-secondary" onclick="ec0249App.simulationSystem.reviewSimulation()">
            📖 Revisar Simulación
          </button>
          <button class="btn btn-primary" onclick="ec0249App.simulationSystem.retrySimulation()">
            🔄 Intentar de Nuevo
          </button>
          <button class="btn btn-success" onclick="ec0249App.simulationSystem.continueToNext()">
            ➡️ Continuar
          </button>
        </div>
      </div>
    `;
  }

  generateFeedback(results) {
    let feedback = '';
    
    if (results.percentage >= 90) {
      feedback = '<p class="feedback excellent">🌟 <strong>Excelente desempeño.</strong> Ha demostrado dominio de las técnicas de entrevista y cumplido con todos los requisitos profesionales.</p>';
    } else if (results.percentage >= 70) {
      feedback = '<p class="feedback good">👍 <strong>Buen desempeño.</strong> Ha cumplido con los requisitos básicos, pero hay áreas de oportunidad para mejorar.</p>';
    } else {
      feedback = '<p class="feedback needs-improvement">📈 <strong>Necesita mejorar.</strong> Se recomienda revisar los criterios no completados y practicar nuevamente.</p>';
    }

    if (results.missedCriteria.length > 0) {
      feedback += '<div class="improvement-suggestions"><h4>Sugerencias de Mejora:</h4><ul>';
      results.missedCriteria.forEach(criterion => {
        feedback += `<li>Asegúrese de ${criterion.criterion.toLowerCase()}</li>`;
      });
      feedback += '</ul></div>';
    }

    return feedback;
  }

  formatDifficulty(difficulty) {
    const levels = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado'
    };
    return levels[difficulty] || difficulty;
  }

  formatType(type) {
    const types = {
      'interview': '🎤 Entrevista',
      'presentation': '📊 Presentación',
      'negotiation': '🤝 Negociación'
    };
    return types[type] || type;
  }

  retrySimulation() {
    this.startSimulation(this.currentSimulation.id);
  }

  continueToNext() {
    this.app.switchView('dashboard');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.ec0249App) {
    window.ec0249App.simulationSystem = new SimulationSystem(window.ec0249App);
  }
});