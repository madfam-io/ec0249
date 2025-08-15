// EC0249 Modules System
class ModuleSystem {
  constructor(app) {
    this.app = app;
    this.modules = this.initializeModules();
    this.currentModule = null;
    this.currentLesson = null;
  }

  initializeModules() {
    return {
      module1: {
        id: 'module1',
        title: 'Fundamentos de Consultoría',
        description: 'Conceptos básicos, ética y habilidades interpersonales necesarias para la consultoría profesional.',
        icon: '🎯',
        color: 'green',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson1_1',
            title: 'Introducción a la Consultoría',
            type: 'theory',
            duration: 30,
            content: {
              overview: 'Fundamentos históricos y características de la consultoría profesional',
              objectives: [
                'Comprender la evolución histórica de la consultoría',
                'Identificar las características principales de un consultor',
                'Reconocer los diferentes tipos de consultoría'
              ],
              sections: [
                {
                  title: 'Historia y Evolución',
                  content: `
                    <h3>Historia de la Consultoría</h3>
                    <p>La consultoría como disciplina profesional se remonta al siglo XX, evolucionando desde los primeros estudios de eficiencia industrial hasta convertirse en una profesión reconocida mundialmente.</p>
                    
                    <h4>Hitos Importantes:</h4>
                    <ul>
                      <li><strong>1900s:</strong> Frederick Taylor y los estudios de tiempo y movimiento</li>
                      <li><strong>1920s:</strong> Primeras firmas especializadas en consultoría gerencial</li>
                      <li><strong>1950s:</strong> Expansión hacia consultoría estratégica</li>
                      <li><strong>1980s:</strong> Diversificación en especialidades técnicas</li>
                      <li><strong>2000s:</strong> Era digital y consultoría tecnológica</li>
                    </ul>
                  `
                },
                {
                  title: 'Características del Consultor',
                  content: `
                    <h3>Perfil del Consultor Profesional</h3>
                    <p>Un consultor efectivo debe combinar conocimientos técnicos con habilidades interpersonales y éticas profesionales.</p>
                    
                    <h4>Competencias Clave:</h4>
                    <div class="competency-grid">
                      <div class="competency-card">
                        <h5>Técnicas</h5>
                        <ul>
                          <li>Análisis de problemas</li>
                          <li>Diseño de soluciones</li>
                          <li>Gestión de proyectos</li>
                        </ul>
                      </div>
                      <div class="competency-card">
                        <h5>Interpersonales</h5>
                        <ul>
                          <li>Comunicación efectiva</li>
                          <li>Facilitación de grupos</li>
                          <li>Negociación</li>
                        </ul>
                      </div>
                      <div class="competency-card">
                        <h5>Éticas</h5>
                        <ul>
                          <li>Confidencialidad</li>
                          <li>Objetividad</li>
                          <li>Integridad profesional</li>
                        </ul>
                      </div>
                    </div>
                  `
                },
                {
                  title: 'Tipos de Consultoría',
                  content: `
                    <h3>Clasificación de Servicios de Consultoría</h3>
                    <p>La consultoría se puede clasificar según diferentes criterios:</p>
                    
                    <h4>Por Especialidad:</h4>
                    <ul>
                      <li><strong>Consultoría Estratégica:</strong> Planificación y dirección organizacional</li>
                      <li><strong>Consultoría Operacional:</strong> Optimización de procesos</li>
                      <li><strong>Consultoría de TI:</strong> Sistemas y tecnología</li>
                      <li><strong>Consultoría de RRHH:</strong> Gestión del talento</li>
                      <li><strong>Consultoría Financiera:</strong> Gestión financiera y contable</li>
                    </ul>
                    
                    <h4>Por Duración:</h4>
                    <ul>
                      <li><strong>Proyectos Cortos:</strong> 1-3 meses (diagnósticos, auditorías)</li>
                      <li><strong>Proyectos Medianos:</strong> 3-12 meses (implementaciones)</li>
                      <li><strong>Proyectos Largos:</strong> 12+ meses (transformaciones)</li>
                    </ul>
                  `
                }
              ]
            }
          },
          {
            id: 'lesson1_2',
            title: 'Ética y Confidencialidad',
            type: 'theory',
            duration: 45,
            content: {
              overview: 'Principios éticos fundamentales y manejo de la confidencialidad en consultoría',
              objectives: [
                'Conocer el código de ética del consultor',
                'Aplicar principios de confidencialidad',
                'Manejar conflictos de interés'
              ],
              sections: [
                {
                  title: 'Código de Ética',
                  content: `
                    <h3>Principios Éticos Fundamentales</h3>
                    <p>Todo consultor debe adherirse a un estricto código de ética profesional.</p>
                    
                    <div class="ethics-principles">
                      <div class="principle-card">
                        <h4>🎯 Objetividad</h4>
                        <p>Mantener imparcialidad y basarse en hechos verificables</p>
                      </div>
                      <div class="principle-card">
                        <h4>🔒 Confidencialidad</h4>
                        <p>Proteger información sensible del cliente</p>
                      </div>
                      <div class="principle-card">
                        <h4>⚖️ Integridad</h4>
                        <p>Actuar con honestidad y transparencia</p>
                      </div>
                      <div class="principle-card">
                        <h4>🎓 Competencia</h4>
                        <p>Trabajar solo en áreas de experiencia comprobada</p>
                      </div>
                    </div>
                  `
                }
              ]
            }
          },
          {
            id: 'lesson1_3',
            title: 'Habilidades Interpersonales',
            type: 'theory',
            duration: 35,
            content: {
              overview: 'Desarrollo de habilidades de comunicación y relación con clientes',
              objectives: [
                'Dominar técnicas de comunicación efectiva',
                'Desarrollar habilidades de escucha activa',
                'Manejar resistencia al cambio'
              ]
            }
          },
          {
            id: 'lesson1_4',
            title: 'Evaluación Módulo 1',
            type: 'assessment',
            duration: 20,
            content: {
              overview: 'Evaluación de conocimientos fundamentales de consultoría',
              questions: [
                {
                  type: 'multiple_choice',
                  question: '¿Cuál es el principio ético más importante en consultoría?',
                  options: ['Rentabilidad', 'Confidencialidad', 'Rapidez', 'Popularidad'],
                  correct: 1
                },
                {
                  type: 'multiple_choice',
                  question: '¿Qué característica NO es esencial en un consultor?',
                  options: ['Objetividad', 'Conocimiento técnico', 'Flexibilidad personal', 'Ética profesional'],
                  correct: 2
                }
              ]
            }
          }
        ]
      },
      
      module2: {
        id: 'module2',
        title: 'Identificación del Problema',
        description: 'Elemento 1: Técnicas de entrevista, cuestionarios e investigación de campo para identificar situaciones problemáticas.',
        icon: '🔍',
        color: 'blue',
        status: 'locked',
        progress: 0,
        competencyElement: 'E0875',
        requiredProducts: [
          'Documento que describe el problema planteado',
          'Afectación detectada de la situación actual',
          'Integración de la información presentada',
          'Reporte de metodología empleada',
          'Guía de entrevista empleada',
          'Cuestionario elaborado',
          'Programa de búsqueda de información documental',
          'Reporte de visita de campo'
        ],
        lessons: [
          {
            id: 'lesson2_1',
            title: 'Técnicas de Entrevista',
            type: 'theory',
            duration: 45,
            content: {
              overview: 'Tipos de entrevistas y técnicas para obtener información efectiva',
              objectives: [
                'Dominar diferentes tipos de entrevistas',
                'Aplicar técnicas de entrevista estructurada',
                'Manejar la documentación de entrevistas'
              ]
            }
          },
          {
            id: 'lesson2_2',
            title: 'Diseño de Cuestionarios',
            type: 'theory',
            duration: 40,
            content: {
              overview: 'Construcción de cuestionarios efectivos para recopilación de datos',
              objectives: [
                'Diferenciar tipos de cuestionarios',
                'Diseñar preguntas efectivas',
                'Validar instrumentos de medición'
              ]
            }
          },
          {
            id: 'lesson2_3',
            title: 'Simulador de Entrevistas',
            type: 'simulation',
            duration: 60,
            content: {
              overview: 'Práctica interactiva de técnicas de entrevista con clientes virtuales',
              scenarios: [
                {
                  id: 'interview_1',
                  title: 'Entrevista con Director General',
                  description: 'Situación: Problemas de comunicación interdepartamental',
                  client: {
                    name: 'Carlos Mendoza',
                    position: 'Director General',
                    personality: 'Directo, ocupado, orientado a resultados',
                    concerns: ['Eficiencia operacional', 'Comunicación interna', 'Costos']
                  }
                }
              ]
            }
          }
        ]
      },
      
      module3: {
        id: 'module3',
        title: 'Desarrollo de Soluciones',
        description: 'Elemento 2: Análisis de impacto y diseño de soluciones efectivas con justificación costo-beneficio.',
        icon: '💡',
        color: 'purple',
        status: 'locked',
        progress: 0,
        competencyElement: 'E0876',
        requiredProducts: [
          'Reporte de las afectaciones encontradas',
          'Solución diseñada'
        ],
        lessons: [
          {
            id: 'lesson3_1',
            title: 'Análisis de Impacto',
            type: 'theory',
            duration: 50
          },
          {
            id: 'lesson3_2',
            title: 'Diseño de Soluciones',
            type: 'theory',
            duration: 45
          },
          {
            id: 'lesson3_3',
            title: 'Análisis Costo-Beneficio',
            type: 'practical',
            duration: 40
          }
        ]
      },
      
      module4: {
        id: 'module4',
        title: 'Presentación de Propuestas',
        description: 'Elemento 3: Preparación y presentación profesional de propuestas de solución.',
        icon: '📋',
        color: 'orange',
        status: 'locked',
        progress: 0,
        competencyElement: 'E0877',
        requiredProducts: [
          'Propuesta de trabajo elaborada',
          'Descripción detallada de la solución propuesta',
          'Plan de trabajo presentado en la propuesta',
          'Actividades a desarrollar mencionadas en el plan',
          'Registro elaborado de los acuerdos alcanzados'
        ],
        lessons: [
          {
            id: 'lesson4_1',
            title: 'Estructura de Propuestas',
            type: 'theory',
            duration: 45
          },
          {
            id: 'lesson4_2',
            title: 'Técnicas de Presentación',
            type: 'theory',
            duration: 40
          },
          {
            id: 'lesson4_3',
            title: 'Simulador de Presentaciones',
            type: 'simulation',
            duration: 60
          }
        ]
      }
    };
  }

  getModule(moduleId) {
    return this.modules[moduleId];
  }

  getLesson(moduleId, lessonId) {
    const module = this.getModule(moduleId);
    return module?.lessons.find(lesson => lesson.id === lessonId);
  }

  unlockModule(moduleId) {
    if (this.modules[moduleId]) {
      this.modules[moduleId].status = 'available';
      this.app.saveUserData();
    }
  }

  updateProgress(moduleId, progress) {
    if (this.modules[moduleId]) {
      this.modules[moduleId].progress = progress;
      this.app.userProgress[moduleId].theory = progress;
      this.app.saveUserData();
    }
  }

  renderModuleContent(moduleId) {
    const module = this.getModule(moduleId);
    if (!module) return '';

    return `
      <div class="module-content" data-module="${moduleId}">
        <div class="module-header-full">
          <div class="module-icon-large ${module.color}">${module.icon}</div>
          <div class="module-info">
            <h1>${module.title}</h1>
            <p class="module-description">${module.description}</p>
            ${module.competencyElement ? `<div class="competency-badge">Elemento: ${module.competencyElement}</div>` : ''}
          </div>
        </div>

        <div class="module-progress-section">
          <h3>Tu Progreso</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${module.progress}%"></div>
          </div>
          <p>${module.progress}% completado</p>
        </div>

        ${module.requiredProducts ? this.renderRequiredProducts(module.requiredProducts) : ''}

        <div class="lessons-section">
          <h3>Lecciones</h3>
          <div class="lessons-grid">
            ${module.lessons.map((lesson, index) => this.renderLessonCard(lesson, index, module.status)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderRequiredProducts(products) {
    return `
      <div class="required-products-section">
        <h3>Productos Requeridos</h3>
        <p>Para completar este elemento de competencia, debes generar los siguientes documentos:</p>
        <div class="products-grid">
          ${products.map((product, index) => `
            <div class="product-card">
              <div class="product-number">${index + 1}</div>
              <div class="product-info">
                <h4>${product}</h4>
                <div class="product-status">
                  <span class="status-badge pending">Pendiente</span>
                  <button class="btn btn-sm btn-secondary" onclick="ec0249App.documentSystem.openTemplate('${product.toLowerCase().replace(/\s+/g, '_')}')">
                    Crear Documento
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderLessonCard(lesson, index, moduleStatus) {
    const isLocked = moduleStatus === 'locked' || (index > 0 && !this.isLessonCompleted(lesson.id));
    const typeIcon = {
      'theory': '📚',
      'practical': '🛠️',
      'simulation': '🎮',
      'assessment': '📝'
    };

    return `
      <div class="lesson-card ${isLocked ? 'locked' : ''}" data-lesson="${lesson.id}">
        <div class="lesson-header">
          <div class="lesson-icon">${typeIcon[lesson.type] || '📚'}</div>
          <div class="lesson-info">
            <h4>${lesson.title}</h4>
            <p class="lesson-type">${this.formatLessonType(lesson.type)}</p>
            <p class="lesson-duration">${lesson.duration} minutos</p>
          </div>
        </div>
        <div class="lesson-actions">
          ${isLocked ? 
            '<span class="text-secondary">🔒 Bloqueado</span>' : 
            `<button class="btn btn-primary btn-sm" onclick="ec0249App.moduleSystem.openLesson('${lesson.id}')">
              ${this.isLessonCompleted(lesson.id) ? 'Revisar' : 'Iniciar'}
            </button>`
          }
        </div>
      </div>
    `;
  }

  formatLessonType(type) {
    const types = {
      'theory': 'Teoría',
      'practical': 'Práctica',
      'simulation': 'Simulación',
      'assessment': 'Evaluación'
    };
    return types[type] || 'Lección';
  }

  isLessonCompleted(lessonId) {
    // This would check against user progress data
    return false;
  }

  openLesson(lessonId) {
    // Find the lesson across all modules
    let targetLesson = null;
    let targetModule = null;

    Object.values(this.modules).forEach(module => {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        targetLesson = lesson;
        targetModule = module;
      }
    });

    if (targetLesson && targetModule) {
      this.currentModule = targetModule;
      this.currentLesson = targetLesson;
      this.renderLessonContent(targetLesson);
    }
  }

  renderLessonContent(lesson) {
    const contentArea = document.getElementById('contentArea');
    
    switch(lesson.type) {
      case 'theory':
        contentArea.innerHTML = this.renderTheoryLesson(lesson);
        break;
      case 'practical':
        contentArea.innerHTML = this.renderPracticalLesson(lesson);
        break;
      case 'simulation':
        contentArea.innerHTML = this.renderSimulationLesson(lesson);
        break;
      case 'assessment':
        contentArea.innerHTML = this.renderAssessmentLesson(lesson);
        break;
    }
  }

  renderTheoryLesson(lesson) {
    return `
      <div class="lesson-content theory-lesson">
        <div class="lesson-header-full">
          <button class="btn btn-secondary" onclick="history.back()">← Volver al Módulo</button>
          <h1>${lesson.title}</h1>
          <div class="lesson-meta">
            <span class="lesson-duration">📚 ${lesson.duration} minutos</span>
          </div>
        </div>

        <div class="lesson-overview">
          <h2>Resumen</h2>
          <p>${lesson.content.overview}</p>
          
          <h3>Objetivos de Aprendizaje</h3>
          <ul>
            ${lesson.content.objectives.map(obj => `<li>${obj}</li>`).join('')}
          </ul>
        </div>

        <div class="lesson-sections">
          ${lesson.content.sections ? lesson.content.sections.map(section => `
            <div class="lesson-section">
              <h2>${section.title}</h2>
              <div class="section-content">${section.content}</div>
            </div>
          `).join('') : ''}
        </div>

        <div class="lesson-actions">
          <button class="btn btn-primary" onclick="ec0249App.moduleSystem.completeLesson('${lesson.id}')">
            Marcar como Completado
          </button>
        </div>
      </div>
    `;
  }

  renderSimulationLesson(lesson) {
    return `
      <div class="lesson-content simulation-lesson">
        <div class="lesson-header-full">
          <button class="btn btn-secondary" onclick="history.back()">← Volver al Módulo</button>
          <h1>${lesson.title}</h1>
          <div class="lesson-meta">
            <span class="lesson-duration">🎮 ${lesson.duration} minutos</span>
          </div>
        </div>

        <div class="simulation-overview">
          <h2>Simulación Interactiva</h2>
          <p>${lesson.content.overview}</p>
        </div>

        <div class="simulation-scenarios">
          <h3>Escenarios Disponibles</h3>
          ${lesson.content.scenarios ? lesson.content.scenarios.map(scenario => `
            <div class="scenario-card">
              <h4>${scenario.title}</h4>
              <p><strong>Situación:</strong> ${scenario.description}</p>
              <div class="client-info">
                <h5>Cliente Virtual:</h5>
                <p><strong>${scenario.client.name}</strong> - ${scenario.client.position}</p>
                <p><em>${scenario.client.personality}</em></p>
              </div>
              <button class="btn btn-primary" onclick="ec0249App.simulationSystem.startScenario('${scenario.id}')">
                Iniciar Simulación
              </button>
            </div>
          `).join('') : ''}
        </div>
      </div>
    `;
  }

  renderAssessmentLesson(lesson) {
    return `
      <div class="lesson-content assessment-lesson">
        <div class="lesson-header-full">
          <button class="btn btn-secondary" onclick="history.back()">← Volver al Módulo</button>
          <h1>${lesson.title}</h1>
          <div class="lesson-meta">
            <span class="lesson-duration">📝 ${lesson.duration} minutos</span>
          </div>
        </div>

        <div class="assessment-overview">
          <h2>Evaluación de Conocimientos</h2>
          <p>${lesson.content.overview}</p>
        </div>

        <div class="assessment-questions" id="assessmentQuestions">
          <form id="assessmentForm">
            ${lesson.content.questions ? lesson.content.questions.map((question, index) => `
              <div class="question-card">
                <h4>Pregunta ${index + 1}</h4>
                <p>${question.question}</p>
                ${question.type === 'multiple_choice' ? `
                  <div class="options">
                    ${question.options.map((option, optionIndex) => `
                      <label class="option-label">
                        <input type="radio" name="question_${index}" value="${optionIndex}">
                        <span>${option}</span>
                      </label>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('') : ''}
            
            <div class="assessment-actions">
              <button type="submit" class="btn btn-primary">Enviar Respuestas</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  completeLesson(lessonId) {
    // Mark lesson as completed and update progress
    console.log(`Completing lesson: ${lessonId}`);
    
    // Update UI to show completion
    const lessonCard = document.querySelector(`[data-lesson="${lessonId}"]`);
    if (lessonCard) {
      lessonCard.classList.add('completed');
    }
    
    // Calculate and update module progress
    this.updateModuleProgress();
  }

  updateModuleProgress() {
    if (this.currentModule) {
      // This would calculate actual progress based on completed lessons
      const newProgress = Math.min(this.currentModule.progress + 25, 100);
      this.updateProgress(this.currentModule.id, newProgress);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.ec0249App) {
    window.ec0249App.moduleSystem = new ModuleSystem(window.ec0249App);
  }
});