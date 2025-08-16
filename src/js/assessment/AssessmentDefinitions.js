/**
 * Assessment Definitions - Contains all assessment questions and structure
 * Extracted from AssessmentEngine for better modularity
 */
class AssessmentDefinitions {
  constructor() {
    this.definitions = new Map();
    this.loadDefinitions();
  }

  /**
   * Load all assessment definitions
   */
  loadDefinitions() {
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
            question: '¿Cuáles son las cinco etapas principales del proceso de consultoría?',
            options: [
              'Contacto, Diagnóstico, Diseño, Implementación, Evaluación',
              'Planificación, Ejecución, Control, Cierre, Reporte',
              'Análisis, Síntesis, Propuesta, Negociación, Contrato',
              'Identificación, Desarrollo, Presentación, Acuerdo, Seguimiento'
            ],
            correct: 0,
            explanation: 'Las cinco etapas del proceso de consultoría son: Contacto inicial, Diagnóstico, Diseño de soluciones, Implementación y Evaluación/seguimiento.',
            points: 10
          },
          {
            id: 'q1_3',
            type: 'multiple_choice',
            question: '¿Qué característica NO es esencial en un consultor profesional?',
            options: [
              'Conocimientos técnicos especializados',
              'Capacidad de trabajar sin supervisión',
              'Objetividad e imparcialidad',
              'Ética profesional y confidencialidad'
            ],
            correct: 1,
            explanation: 'Trabajar sin supervisión no es una característica esencial. Los consultores deben mantener comunicación y colaboración con sus clientes.',
            points: 10
          },
          {
            id: 'q1_4',
            type: 'true_false',
            question: 'La consultoría interna siempre es más efectiva que la consultoría externa.',
            correct: false,
            explanation: 'Ambas modalidades tienen ventajas. La consultoría externa aporta perspectiva objetiva, mientras que la interna conoce mejor la organización.',
            points: 10
          },
          {
            id: 'q1_5',
            type: 'multiple_choice',
            question: '¿Cuál es el primer paso para manejar un conflicto de interés?',
            options: [
              'Ignorar el conflicto hasta que se resuelva solo',
              'Identificar y evaluar el conflicto potencial',
              'Rechazar inmediatamente el proyecto',
              'Negociar honorarios más altos'
            ],
            correct: 1,
            explanation: 'El primer paso es identificar y evaluar el conflicto potencial para determinar su impacto en la objetividad.',
            points: 10
          },
          {
            id: 'q1_6',
            type: 'multiple_choice',
            question: '¿Qué técnica de comunicación es más efectiva para confirmar comprensión?',
            options: [
              'Hablar más fuerte',
              'Parafrasear lo escuchado',
              'Interrumpir frecuentemente',
              'Usar jerga técnica'
            ],
            correct: 1,
            explanation: 'Parafrasear permite confirmar que hemos comprendido correctamente el mensaje del interlocutor.',
            points: 10
          },
          {
            id: 'q1_7',
            type: 'multiple_choice',
            question: '¿Cuál es una responsabilidad del consultor hacia la sociedad?',
            options: [
              'Maximizar las ganancias personales',
              'Promover prácticas sostenibles',
              'Mantener información confidencial indefinidamente',
              'Trabajar solo con empresas grandes'
            ],
            correct: 1,
            explanation: 'Los consultores tienen responsabilidad social de promover prácticas sostenibles y actuar en beneficio del interés público.',
            points: 10
          },
          {
            id: 'q1_8',
            type: 'true_false',
            question: 'La escucha activa requiere interrumpir frecuentemente para mostrar interés.',
            correct: false,
            explanation: 'La escucha activa implica prestar atención completa sin interrupciones prematuras, permitiendo al hablante expresarse completamente.',
            points: 10
          },
          {
            id: 'q1_9',
            type: 'multiple_choice',
            question: '¿Cuál es la mejor estrategia para manejar la resistencia al cambio?',
            options: [
              'Imponer el cambio por autoridad',
              'Comunicación clara y frecuente',
              'Ignorar las preocupaciones',
              'Implementar cambios gradualmente sin avisar'
            ],
            correct: 1,
            explanation: 'La comunicación clara y frecuente ayuda a reducir la incertidumbre y genera confianza en el proceso de cambio.',
            points: 10
          },
          {
            id: 'q1_10',
            type: 'multiple_choice',
            question: '¿Qué tipo de consultoría se enfoca en la mejora de procesos organizacionales?',
            options: [
              'Consultoría estratégica',
              'Consultoría operacional',
              'Consultoría financiera',
              'Consultoría de recursos humanos'
            ],
            correct: 1,
            explanation: 'La consultoría operacional se enfoca específicamente en la mejora de procesos, eficiencia y operaciones diarias.',
            points: 10
          }
        ],
        passingScore: 70,
        allowedAttempts: 3,
        category: 'knowledge_test'
      },

      // Element 1 (E0875): Problem Identification Assessment
      element1_assessment: {
        id: 'element1_assessment',
        title: 'Evaluación: Identificación de Problemas (E0875)',
        description: 'Evaluación de competencias para identificar situaciones y problemas organizacionales',
        moduleId: 'module2',
        elementId: 'E0875',
        timeLimit: 1800, // 30 minutes
        questions: [
          {
            id: 'e1_q1',
            type: 'multiple_choice',
            question: '¿Cuál es el primer paso en la metodología de identificación de problemas?',
            options: [
              'Proponer soluciones inmediatas',
              'Definir la situación y/o problema',
              'Realizar entrevistas masivas',
              'Buscar información externa'
            ],
            correct: 1,
            explanation: 'El primer paso es definir claramente la situación o problema, estableciendo los límites y contexto del análisis.',
            points: 10
          },
          {
            id: 'e1_q2',
            type: 'multiple_choice',
            question: '¿Qué debe incluir un programa de entrevistas efectivo?',
            options: [
              'Solo directivos de alto nivel',
              'Cronograma, participantes y metodología',
              'Únicamente preguntas cerradas',
              'Entrevistas de más de 2 horas'
            ],
            correct: 1,
            explanation: 'Un programa efectivo debe incluir cronograma detallado, identificación de participantes clave y metodología estructurada.',
            points: 10
          },
          {
            id: 'e1_q3',
            type: 'true_false',
            question: 'Las observaciones de campo deben realizarse sin que los empleados lo sepan.',
            correct: false,
            explanation: 'Las observaciones deben ser transparentes y éticas, informando a los participantes sobre el propósito y proceso.',
            points: 10
          },
          {
            id: 'e1_q4',
            type: 'multiple_choice',
            question: '¿Cuál es el propósito principal de una guía de entrevista?',
            options: [
              'Limitar las respuestas del entrevistado',
              'Estructurar la conversación y obtener información relevante',
              'Impresionar al cliente con preguntas complejas',
              'Completar la entrevista en menos tiempo'
            ],
            correct: 1,
            explanation: 'La guía estructura la entrevista para obtener información relevante de manera sistemática y completa.',
            points: 10
          },
          {
            id: 'e1_q5',
            type: 'multiple_choice',
            question: '¿Qué elementos debe contener un cuestionario elaborado?',
            options: [
              'Solo preguntas abiertas complejas',
              'Propósito, datos generales, confidencialidad e instrucciones',
              'Únicamente preguntas de opción múltiple',
              'Preguntas personales del entrevistado'
            ],
            correct: 1,
            explanation: 'Un cuestionario completo debe incluir propósito, sección de datos generales, aviso de confidencialidad e instrucciones claras.',
            points: 10
          },
          {
            id: 'e1_q6',
            type: 'multiple_choice',
            question: '¿Cómo se debe evaluar la información obtenida?',
            options: [
              'Aceptar toda la información sin cuestionarla',
              'Verificar fuentes, contrastar datos y validar consistencia',
              'Usar solo información cuantitativa',
              'Priorizar opiniones de directivos únicamente'
            ],
            correct: 1,
            explanation: 'La información debe evaluarse verificando fuentes, contrastando datos múltiples y validando consistencia.',
            points: 10
          },
          {
            id: 'e1_q7',
            type: 'true_false',
            question: 'La información documental interna es siempre más confiable que la externa.',
            correct: false,
            explanation: 'Ambos tipos de información son valiosos. La externa puede proporcionar perspectiva objetiva y benchmarks.',
            points: 10
          },
          {
            id: 'e1_q8',
            type: 'multiple_choice',
            question: '¿Qué debe incluir el reporte de visita de campo?',
            options: [
              'Solo conclusiones finales',
              'Objetivo, alcance, observaciones detalladas y resultados',
              'Únicamente aspectos negativos observados',
              'Recomendaciones de solución inmediata'
            ],
            correct: 1,
            explanation: 'El reporte debe ser completo incluyendo objetivo, alcance, observaciones detalladas y resultados obtenidos.',
            points: 10
          },
          {
            id: 'e1_q9',
            type: 'multiple_choice',
            question: '¿Cuál es la importancia de la integración de información?',
            options: [
              'Reducir el volumen de datos',
              'Crear una visión comprehensiva y coherente del problema',
              'Eliminar información contradictoria',
              'Acelerar el proceso de consultoría'
            ],
            correct: 1,
            explanation: 'La integración permite crear una visión comprehensiva que conecte todos los elementos del problema.',
            points: 10
          },
          {
            id: 'e1_q10',
            type: 'short_answer',
            question: 'Describa brevemente los componentes clave de una metodología de identificación de problemas.',
            sampleAnswer: 'definición situación entrevistas observaciones documentación evaluación información integración análisis',
            explanation: 'Los componentes incluyen: definición de la situación, programa de entrevistas, observaciones de campo, búsqueda documental, evaluación de información e integración de hallazgos.',
            points: 15
          }
        ],
        passingScore: 75,
        allowedAttempts: 3,
        category: 'competency_assessment'
      }
    };

    // Store definitions in map
    Object.entries(assessmentDefinitions).forEach(([key, definition]) => {
      this.definitions.set(key, definition);
    });
  }

  /**
   * Get assessment definition by ID
   * @param {string} assessmentId - Assessment ID
   * @returns {Object|null} Assessment definition
   */
  getAssessment(assessmentId) {
    return this.definitions.get(assessmentId) || null;
  }

  /**
   * Get all assessment definitions
   * @returns {Map} All assessments
   */
  getAllAssessments() {
    return new Map(this.definitions);
  }

  /**
   * Get assessments by module
   * @param {string} moduleId - Module ID
   * @returns {Array} Assessments for module
   */
  getAssessmentsByModule(moduleId) {
    return Array.from(this.definitions.values())
      .filter(assessment => assessment.moduleId === moduleId);
  }

  /**
   * Get assessments by element
   * @param {string} elementId - Element ID
   * @returns {Array} Assessments for element
   */
  getAssessmentsByElement(elementId) {
    return Array.from(this.definitions.values())
      .filter(assessment => assessment.elementId === elementId);
  }

  /**
   * Get assessments by category
   * @param {string} category - Assessment category
   * @returns {Array} Assessments in category
   */
  getAssessmentsByCategory(category) {
    return Array.from(this.definitions.values())
      .filter(assessment => assessment.category === category);
  }

  /**
   * Validate assessment definition
   * @param {Object} assessment - Assessment definition
   * @returns {boolean} Validation result
   */
  validateAssessment(assessment) {
    if (!assessment.id || !assessment.title || !assessment.questions) {
      return false;
    }

    if (!Array.isArray(assessment.questions) || assessment.questions.length === 0) {
      return false;
    }

    return assessment.questions.every(question => 
      question.id && question.type && question.question
    );
  }

  /**
   * Add custom assessment
   * @param {Object} assessment - Assessment definition
   * @returns {boolean} Success status
   */
  addAssessment(assessment) {
    if (!this.validateAssessment(assessment)) {
      throw new Error('Invalid assessment definition');
    }

    if (this.definitions.has(assessment.id)) {
      throw new Error(`Assessment with ID ${assessment.id} already exists`);
    }

    this.definitions.set(assessment.id, assessment);
    return true;
  }

  /**
   * Remove assessment
   * @param {string} assessmentId - Assessment ID
   * @returns {boolean} Success status
   */
  removeAssessment(assessmentId) {
    return this.definitions.delete(assessmentId);
  }

  /**
   * Get assessment statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    const assessments = Array.from(this.definitions.values());
    
    return {
      totalAssessments: assessments.length,
      totalQuestions: assessments.reduce((sum, a) => sum + a.questions.length, 0),
      averageQuestions: assessments.length > 0 ? 
        Math.round(assessments.reduce((sum, a) => sum + a.questions.length, 0) / assessments.length) : 0,
      byModule: this.groupByField(assessments, 'moduleId'),
      byElement: this.groupByField(assessments, 'elementId'),
      byCategory: this.groupByField(assessments, 'category')
    };
  }

  /**
   * Group assessments by field
   * @param {Array} assessments - Assessments array
   * @param {string} field - Field to group by
   * @returns {Object} Grouped data
   */
  groupByField(assessments, field) {
    return assessments.reduce((groups, assessment) => {
      const key = assessment[field] || 'unknown';
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }
}

export default AssessmentDefinitions;