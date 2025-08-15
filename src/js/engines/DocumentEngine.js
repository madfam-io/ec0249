/**
 * Document Engine - Template-based document generation system
 * Handles creation, validation, and management of EC0249 required deliverables
 */
import Module from '../core/Module.js';

class DocumentEngine extends Module {
  constructor() {
    super('DocumentEngine', ['StateManager', 'I18nService', 'StorageService'], {
      autoSave: true,
      saveInterval: 30000,
      validationMode: 'strict',
      templateVersion: '1.0',
      exportFormats: ['html', 'pdf', 'docx'],
      qualityThresholds: {
        completeness: 85,
        accuracy: 90,
        compliance: 95
      }
    });

    this.templates = new Map();
    this.documents = new Map();
    this.validationRules = new Map();
    this.userDocuments = new Map();
    this.documentHistory = new Map();
  }

  async onInitialize() {
    this.stateManager = this.service('StateManager');
    this.i18n = this.service('I18nService');
    this.storage = this.service('StorageService');

    // Subscribe to document events
    this.subscribe('document:create', this.handleDocumentCreate.bind(this));
    this.subscribe('document:save', this.handleDocumentSave.bind(this));
    this.subscribe('document:validate', this.handleDocumentValidate.bind(this));
    this.subscribe('document:export', this.handleDocumentExport.bind(this));

    // Load document templates and user documents
    await this.loadTemplateDefinitions();
    await this.loadUserDocuments();

    console.log('[DocumentEngine] Initialized');
  }

  /**
   * Load all 15 EC0249 document templates
   */
  async loadTemplateDefinitions() {
    const templates = {
      // Element 1: Problem Identification (8 documents)
      problem_description: {
        id: 'problem_description',
        title: 'Documento que describe el problema planteado',
        element: 'E0875',
        elementName: 'Identificar la situación/problema planteado',
        required: true,
        icon: '📋',
        description: 'Documento comprehensivo que describe la situación problemática identificada',
        estimatedTime: 45,
        evaluationCriteria: [
          'Incluye la afectación de la situación actual',
          'Establece el alcance del problema',
          'Incluye la integración de la información obtenida',
          'Contiene la interpretación del problema y sus afectaciones'
        ],
        sections: [
          {
            id: 'problem_statement',
            title: 'Descripción del Problema',
            required: true,
            type: 'textarea',
            placeholder: 'Describa claramente la situación problemática identificada...',
            validation: { minLength: 200, required: true }
          },
          {
            id: 'scope_definition',
            title: 'Alcance del Problema',
            required: true,
            type: 'textarea',
            placeholder: 'Defina el alcance y límites del problema...',
            validation: { minLength: 150, required: true }
          },
          {
            id: 'current_impact',
            title: 'Afectación de la Situación Actual',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'operational_impact', title: 'Impacto Operacional', type: 'textarea' },
              { id: 'financial_impact', title: 'Impacto Financiero', type: 'textarea' },
              { id: 'human_impact', title: 'Impacto en Personal', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'information_integration',
            title: 'Integración de la Información',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'sources_used', title: 'Fuentes de Información Utilizadas', type: 'list' },
              { id: 'data_analysis', title: 'Análisis de Datos', type: 'textarea' },
              { id: 'findings_summary', title: 'Resumen de Hallazgos', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'problem_interpretation',
            title: 'Interpretación del Problema',
            required: true,
            type: 'textarea',
            placeholder: 'Proporcione su interpretación profesional del problema y sus implicaciones...',
            validation: { minLength: 300, required: true }
          }
        ]
      },

      current_situation_impact: {
        id: 'current_situation_impact',
        title: 'Afectación detectada de la situación actual',
        element: 'E0875',
        required: true,
        icon: '⚠️',
        description: 'Análisis detallado de los impactos y afectaciones de la situación actual',
        estimatedTime: 30,
        evaluationCriteria: [
          'Es congruente con la integración de la información'
        ],
        sections: [
          {
            id: 'identified_impacts',
            title: 'Impactos Identificados',
            required: true,
            type: 'matrix',
            headers: ['Área Afectada', 'Tipo de Impacto', 'Severidad', 'Descripción'],
            validation: { minRows: 3, required: true }
          },
          {
            id: 'impact_analysis',
            title: 'Análisis de Congruencia',
            required: true,
            type: 'textarea',
            placeholder: 'Explique la congruencia entre los impactos detectados y la información integrada...',
            validation: { minLength: 200, required: true }
          }
        ]
      },

      information_integration: {
        id: 'information_integration',
        title: 'Integración de la información presentada',
        element: 'E0875',
        required: true,
        icon: '🔗',
        description: 'Síntesis y organización de toda la información recopilada',
        estimatedTime: 60,
        evaluationCriteria: [
          'Incluye la información recopilada',
          'Es congruente con el problema planteado por el consultante',
          'Incluye la interpretación de la información recopilada'
        ],
        sections: [
          {
            id: 'collected_information',
            title: 'Información Recopilada',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'primary_sources', title: 'Fuentes Primarias', type: 'list' },
              { id: 'secondary_sources', title: 'Fuentes Secundarias', type: 'list' },
              { id: 'internal_data', title: 'Datos Internos', type: 'textarea' },
              { id: 'external_data', title: 'Datos Externos', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'congruency_analysis',
            title: 'Análisis de Congruencia con el Problema',
            required: true,
            type: 'textarea',
            placeholder: 'Analice la congruencia entre la información recopilada y el problema planteado...',
            validation: { minLength: 250, required: true }
          },
          {
            id: 'information_interpretation',
            title: 'Interpretación de la Información',
            required: true,
            type: 'textarea',
            placeholder: 'Proporcione su interpretación profesional de la información recopilada...',
            validation: { minLength: 300, required: true }
          }
        ]
      },

      methodology_report: {
        id: 'methodology_report',
        title: 'Reporte de metodología empleada',
        element: 'E0875',
        required: true,
        icon: '📊',
        description: 'Descripción completa de la metodología utilizada para la identificación del problema',
        estimatedTime: 90,
        evaluationCriteria: [
          'Incluye la definición de la situación y/o problema',
          'Incluye el establecimiento de un programa de entrevistas',
          'Incluye la identificación de las áreas involucradas',
          'Incluye el establecimiento de los estudios/pruebas a realizar',
          'Incluye el establecimiento de los requerimientos de información',
          'Incluye el establecimiento de un programa de observaciones de campo',
          'Incluye la búsqueda de información documental',
          'Contiene la forma en que evalúa la información obtenida'
        ],
        sections: [
          {
            id: 'situation_definition',
            title: '1. Definición de la Situación/Problema',
            required: true,
            type: 'textarea',
            validation: { minLength: 200, required: true }
          },
          {
            id: 'interview_program',
            title: '2. Programa de Entrevistas',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'interview_schedule', title: 'Cronograma de Entrevistas', type: 'table' },
              { id: 'interview_participants', title: 'Participantes', type: 'list' },
              { id: 'interview_methodology', title: 'Metodología de Entrevistas', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'involved_areas',
            title: '3. Áreas Involucradas',
            required: true,
            type: 'list',
            placeholder: 'Liste todas las áreas organizacionales involucradas...',
            validation: { minItems: 2, required: true }
          },
          {
            id: 'studies_tests',
            title: '4. Estudios/Pruebas a Realizar',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'study_types', title: 'Tipos de Estudios', type: 'list' },
              { id: 'test_procedures', title: 'Procedimientos de Prueba', type: 'textarea' },
              { id: 'success_criteria', title: 'Criterios de Éxito', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'information_requirements',
            title: '5. Requerimientos de Información',
            required: true,
            type: 'matrix',
            headers: ['Tipo de Información', 'Fuente', 'Método de Recopilación', 'Responsable'],
            validation: { minRows: 5, required: true }
          },
          {
            id: 'field_observation_program',
            title: '6. Programa de Observaciones de Campo',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'observation_sites', title: 'Sitios de Observación', type: 'list' },
              { id: 'observation_schedule', title: 'Cronograma', type: 'table' },
              { id: 'observation_criteria', title: 'Criterios de Observación', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'documentary_search',
            title: '7. Búsqueda de Información Documental',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'document_types', title: 'Tipos de Documentos', type: 'list' },
              { id: 'search_strategy', title: 'Estrategia de Búsqueda', type: 'textarea' },
              { id: 'document_sources', title: 'Fuentes Documentales', type: 'list' }
            ],
            validation: { required: true }
          },
          {
            id: 'information_evaluation',
            title: '8. Evaluación de la Información',
            required: true,
            type: 'textarea',
            placeholder: 'Describa el método utilizado para evaluar la calidad y relevancia de la información...',
            validation: { minLength: 300, required: true }
          }
        ]
      },

      interview_guide: {
        id: 'interview_guide',
        title: 'Guía de entrevista empleada',
        element: 'E0875',
        required: true,
        icon: '🎤',
        description: 'Guía estructurada para conducir entrevistas efectivas',
        estimatedTime: 40,
        evaluationCriteria: [
          'Contiene el propósito de la entrevista',
          'Establece la solicitud de la descripción de actividades y responsabilidades',
          'Describe la información/documentación que se va a solicitar',
          'Incluye el cierre de la entrevista'
        ],
        sections: [
          {
            id: 'interview_purpose',
            title: 'Propósito de la Entrevista',
            required: true,
            type: 'textarea',
            placeholder: 'Defina claramente el propósito y objetivos de la entrevista...',
            validation: { minLength: 100, required: true }
          },
          {
            id: 'opening_section',
            title: 'Apertura de la Entrevista',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'introduction', title: 'Presentación', type: 'textarea' },
              { id: 'purpose_explanation', title: 'Explicación del Propósito', type: 'textarea' },
              { id: 'confidentiality', title: 'Confidencialidad', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'activities_responsibilities',
            title: 'Solicitud de Actividades y Responsabilidades',
            required: true,
            type: 'list',
            placeholder: 'Liste las preguntas específicas sobre actividades y responsabilidades...',
            validation: { minItems: 5, required: true }
          },
          {
            id: 'information_requests',
            title: 'Información/Documentación Solicitada',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'documents_needed', title: 'Documentos Requeridos', type: 'list' },
              { id: 'information_types', title: 'Tipos de Información', type: 'list' },
              { id: 'delivery_format', title: 'Formato de Entrega', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'interview_closure',
            title: 'Cierre de la Entrevista',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'summary_confirmation', title: 'Confirmación de Resumen', type: 'textarea' },
              { id: 'next_steps', title: 'Próximos Pasos', type: 'textarea' },
              { id: 'thank_you', title: 'Agradecimiento', type: 'textarea' }
            ],
            validation: { required: true }
          }
        ]
      },

      questionnaire: {
        id: 'questionnaire',
        title: 'Cuestionario elaborado',
        element: 'E0875',
        required: true,
        icon: '📝',
        description: 'Cuestionario estructurado para recopilación sistemática de información',
        estimatedTime: 60,
        evaluationCriteria: [
          'Incluye la explicación del propósito del cuestionario',
          'Incluye espacio para los datos generales',
          'Menciona la confidencialidad de la información',
          'Contiene las instrucciones sobre la forma de llenado',
          'Establece preguntas relacionadas con la información buscada',
          'Especifica la documentación de soporte',
          'Contiene un espacio para comentarios finales',
          'Contiene frases de agradecimiento'
        ],
        sections: [
          {
            id: 'questionnaire_purpose',
            title: '1. Propósito del Cuestionario',
            required: true,
            type: 'textarea',
            validation: { minLength: 150, required: true }
          },
          {
            id: 'general_data',
            title: '2. Datos Generales',
            required: true,
            type: 'form_fields',
            fields: [
              { name: 'participant_name', label: 'Nombre del Participante', type: 'text' },
              { name: 'position', label: 'Cargo/Posición', type: 'text' },
              { name: 'department', label: 'Departamento', type: 'text' },
              { name: 'date', label: 'Fecha', type: 'date' },
              { name: 'duration', label: 'Duración Estimada', type: 'text' }
            ],
            validation: { required: true }
          },
          {
            id: 'confidentiality_notice',
            title: '3. Aviso de Confidencialidad',
            required: true,
            type: 'textarea',
            placeholder: 'Incluya la declaración de confidencialidad...',
            validation: { minLength: 100, required: true }
          },
          {
            id: 'filling_instructions',
            title: '4. Instrucciones de Llenado',
            required: true,
            type: 'textarea',
            placeholder: 'Proporcione instrucciones claras sobre cómo completar el cuestionario...',
            validation: { minLength: 150, required: true }
          },
          {
            id: 'main_questions',
            title: '5. Preguntas Principales',
            required: true,
            type: 'question_builder',
            validation: { minQuestions: 10, required: true }
          },
          {
            id: 'supporting_documentation',
            title: '6. Documentación de Soporte',
            required: true,
            type: 'list',
            placeholder: 'Liste los documentos que deben acompañar al cuestionario...',
            validation: { minItems: 3, required: true }
          },
          {
            id: 'final_comments',
            title: '7. Espacio para Comentarios Finales',
            required: true,
            type: 'text_template',
            template: '[Espacio designado para comentarios adicionales del participante]',
            validation: { required: true }
          },
          {
            id: 'acknowledgment',
            title: '8. Agradecimiento',
            required: true,
            type: 'textarea',
            placeholder: 'Incluya frases de agradecimiento apropiadas...',
            validation: { minLength: 50, required: true }
          }
        ]
      },

      documentary_search_program: {
        id: 'documentary_search_program',
        title: 'Programa de búsqueda de información documental',
        element: 'E0875',
        required: true,
        icon: '🔍',
        description: 'Plan estructurado para la búsqueda y recopilación de información documental',
        estimatedTime: 35,
        evaluationCriteria: [
          'Incluye información interna relacionada con el problema',
          'Incluye información externa relacionada con el problema'
        ],
        sections: [
          {
            id: 'internal_information',
            title: 'Información Interna',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'internal_sources', title: 'Fuentes Internas', type: 'list' },
              { id: 'internal_documents', title: 'Documentos Internos', type: 'list' },
              { id: 'internal_search_strategy', title: 'Estrategia de Búsqueda Interna', type: 'textarea' },
              { id: 'internal_timeline', title: 'Cronograma Interno', type: 'table' }
            ],
            validation: { required: true }
          },
          {
            id: 'external_information',
            title: 'Información Externa',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'external_sources', title: 'Fuentes Externas', type: 'list' },
              { id: 'external_documents', title: 'Documentos Externos', type: 'list' },
              { id: 'external_search_strategy', title: 'Estrategia de Búsqueda Externa', type: 'textarea' },
              { id: 'external_timeline', title: 'Cronograma Externo', type: 'table' }
            ],
            validation: { required: true }
          }
        ]
      },

      field_visit_report: {
        id: 'field_visit_report',
        title: 'Reporte de visita de campo',
        element: 'E0875',
        required: true,
        icon: '🚶',
        description: 'Informe detallado de las observaciones y hallazgos durante visitas de campo',
        estimatedTime: 50,
        evaluationCriteria: [
          'Muestra el objetivo de la visita de campo',
          'Establece el alcance',
          'Incluye la descripción de las observaciones realizadas',
          'Incluye el resultado de la visita de campo'
        ],
        sections: [
          {
            id: 'visit_objective',
            title: 'Objetivo de la Visita',
            required: true,
            type: 'textarea',
            placeholder: 'Defina claramente el objetivo de la visita de campo...',
            validation: { minLength: 100, required: true }
          },
          {
            id: 'visit_scope',
            title: 'Alcance de la Visita',
            required: true,
            type: 'textarea',
            placeholder: 'Establezca el alcance y límites de la visita...',
            validation: { minLength: 150, required: true }
          },
          {
            id: 'observations_description',
            title: 'Descripción de Observaciones',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'process_observations', title: 'Observaciones de Procesos', type: 'textarea' },
              { id: 'system_observations', title: 'Observaciones de Sistemas', type: 'textarea' },
              { id: 'personnel_observations', title: 'Observaciones de Personal', type: 'textarea' },
              { id: 'infrastructure_observations', title: 'Observaciones de Infraestructura', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'visit_results',
            title: 'Resultados de la Visita',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'key_findings', title: 'Hallazgos Principales', type: 'list' },
              { id: 'recommendations', title: 'Recomendaciones Inmediatas', type: 'list' },
              { id: 'follow_up_actions', title: 'Acciones de Seguimiento', type: 'textarea' }
            ],
            validation: { required: true }
          }
        ]
      },

      // Element 2: Solution Development (2 documents)
      impact_analysis_report: {
        id: 'impact_analysis_report',
        title: 'Reporte de las afectaciones encontradas',
        element: 'E0876',
        elementName: 'Desarrollar opciones de solución',
        required: true,
        icon: '📈',
        description: 'Análisis comprehensivo de las afectaciones identificadas y su metodología',
        estimatedTime: 60,
        evaluationCriteria: [
          'Describe la metodología aplicada',
          'Define las afectaciones encontradas',
          'Incluye la definición detallada de la situación a resolver'
        ],
        sections: [
          {
            id: 'applied_methodology',
            title: 'Metodología Aplicada',
            required: true,
            type: 'textarea',
            placeholder: 'Describa detalladamente la metodología utilizada para identificar las afectaciones...',
            validation: { minLength: 300, required: true }
          },
          {
            id: 'identified_impacts',
            title: 'Afectaciones Encontradas',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'operational_impacts', title: 'Afectaciones Operacionales', type: 'list' },
              { id: 'financial_impacts', title: 'Afectaciones Financieras', type: 'list' },
              { id: 'human_impacts', title: 'Afectaciones al Personal', type: 'list' },
              { id: 'strategic_impacts', title: 'Afectaciones Estratégicas', type: 'list' }
            ],
            validation: { required: true }
          },
          {
            id: 'situation_definition',
            title: 'Definición Detallada de la Situación',
            required: true,
            type: 'textarea',
            placeholder: 'Proporcione una definición detallada y precisa de la situación que requiere solución...',
            validation: { minLength: 400, required: true }
          }
        ]
      },

      solution_design: {
        id: 'solution_design',
        title: 'Solución diseñada',
        element: 'E0876',
        required: true,
        icon: '💡',
        description: 'Diseño detallado de la solución propuesta con justificación completa',
        estimatedTime: 90,
        evaluationCriteria: [
          'Es congruente con la situación a resolver',
          'Menciona los beneficios de la solución',
          'Menciona las desventajas de la solución',
          'Cuenta con una justificación detallada',
          'Incluye las implicaciones de costo/beneficio'
        ],
        sections: [
          {
            id: 'solution_overview',
            title: 'Descripción General de la Solución',
            required: true,
            type: 'textarea',
            placeholder: 'Proporcione una descripción general y clara de la solución propuesta...',
            validation: { minLength: 300, required: true }
          },
          {
            id: 'congruency_analysis',
            title: 'Análisis de Congruencia',
            required: true,
            type: 'textarea',
            placeholder: 'Explique cómo la solución propuesta es congruente con la situación identificada...',
            validation: { minLength: 250, required: true }
          },
          {
            id: 'solution_benefits',
            title: 'Beneficios de la Solución',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'short_term_benefits', title: 'Beneficios a Corto Plazo', type: 'list' },
              { id: 'medium_term_benefits', title: 'Beneficios a Mediano Plazo', type: 'list' },
              { id: 'long_term_benefits', title: 'Beneficios a Largo Plazo', type: 'list' }
            ],
            validation: { required: true }
          },
          {
            id: 'solution_disadvantages',
            title: 'Desventajas de la Solución',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'implementation_challenges', title: 'Desafíos de Implementación', type: 'list' },
              { id: 'resource_limitations', title: 'Limitaciones de Recursos', type: 'list' },
              { id: 'potential_risks', title: 'Riesgos Potenciales', type: 'list' }
            ],
            validation: { required: true }
          },
          {
            id: 'detailed_justification',
            title: 'Justificación Detallada',
            required: true,
            type: 'textarea',
            placeholder: 'Proporcione una justificación detallada de por qué esta solución es la más apropiada...',
            validation: { minLength: 400, required: true }
          },
          {
            id: 'cost_benefit_implications',
            title: 'Implicaciones Costo/Beneficio',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'implementation_costs', title: 'Costos de Implementación', type: 'table' },
              { id: 'operational_costs', title: 'Costos Operacionales', type: 'table' },
              { id: 'quantified_benefits', title: 'Beneficios Cuantificados', type: 'table' },
              { id: 'roi_analysis', title: 'Análisis de ROI', type: 'textarea' }
            ],
            validation: { required: true }
          }
        ]
      },

      // Element 3: Solution Presentation (5 documents)
      work_proposal: {
        id: 'work_proposal',
        title: 'Propuesta de trabajo elaborada',
        element: 'E0877',
        elementName: 'Presentar la propuesta de solución',
        required: true,
        icon: '📋',
        description: 'Propuesta formal de trabajo con todos los componentes requeridos',
        estimatedTime: 120,
        evaluationCriteria: [
          'Incluye los antecedentes y/o el diagnóstico',
          'Incluye la síntesis descriptiva del proyecto propuesto',
          'Especifica el alcance del proyecto propuesto',
          'Describe la solución propuesta en detalle',
          'Incluye un plan de trabajo',
          'Especifica los entregables por parte del consultor',
          'Especifica los riesgos del proyecto',
          'Especifica las responsabilidades del consultor',
          'Especifica las responsabilidades del consultante',
          'Especifica el costo estimado'
        ],
        sections: [
          {
            id: 'background_diagnosis',
            title: '1. Antecedentes y Diagnóstico',
            required: true,
            type: 'textarea',
            validation: { minLength: 400, required: true }
          },
          {
            id: 'project_synthesis',
            title: '2. Síntesis Descriptiva del Proyecto',
            required: true,
            type: 'textarea',
            validation: { minLength: 300, required: true }
          },
          {
            id: 'project_scope',
            title: '3. Alcance del Proyecto',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'included_activities', title: 'Actividades Incluidas', type: 'list' },
              { id: 'excluded_activities', title: 'Actividades Excluidas', type: 'list' },
              { id: 'scope_limitations', title: 'Limitaciones del Alcance', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'detailed_solution',
            title: '4. Solución Propuesta Detallada',
            required: true,
            type: 'textarea',
            validation: { minLength: 500, required: true }
          },
          {
            id: 'work_plan',
            title: '5. Plan de Trabajo',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'project_phases', title: 'Fases del Proyecto', type: 'table' },
              { id: 'timeline', title: 'Cronograma', type: 'table' },
              { id: 'milestones', title: 'Hitos Principales', type: 'list' }
            ],
            validation: { required: true }
          },
          {
            id: 'consultant_deliverables',
            title: '6. Entregables del Consultor',
            required: true,
            type: 'table',
            headers: ['Entregable', 'Descripción', 'Fecha de Entrega', 'Criterios de Aceptación'],
            validation: { minRows: 5, required: true }
          },
          {
            id: 'project_risks',
            title: '7. Riesgos del Proyecto',
            required: true,
            type: 'table',
            headers: ['Riesgo', 'Probabilidad', 'Impacto', 'Mitigación'],
            validation: { minRows: 5, required: true }
          },
          {
            id: 'consultant_responsibilities',
            title: '8. Responsabilidades del Consultor',
            required: true,
            type: 'list',
            validation: { minItems: 5, required: true }
          },
          {
            id: 'client_responsibilities',
            title: '9. Responsabilidades del Consultante',
            required: true,
            type: 'list',
            validation: { minItems: 5, required: true }
          },
          {
            id: 'estimated_cost',
            title: '10. Costo Estimado',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'cost_breakdown', title: 'Desglose de Costos', type: 'table' },
              { id: 'payment_terms', title: 'Términos de Pago', type: 'textarea' },
              { id: 'cost_assumptions', title: 'Supuestos de Costo', type: 'list' }
            ],
            validation: { required: true }
          }
        ]
      },

      detailed_solution_description: {
        id: 'detailed_solution_description',
        title: 'Descripción detallada de la solución propuesta',
        element: 'E0877',
        required: true,
        icon: '🔧',
        description: 'Descripción técnica detallada de la implementación de la solución',
        estimatedTime: 75,
        evaluationCriteria: [
          'Especifica las etapas de la instalación',
          'Describe el resultado esperado de cada etapa',
          'Especifica los indicadores de avance de cada etapa',
          'Menciona los mecanismos de control',
          'Describe los recursos a utilizar por parte del consultor',
          'Describe los recursos a utilizar por parte del consultante'
        ],
        sections: [
          {
            id: 'implementation_stages',
            title: 'Etapas de Implementación',
            required: true,
            type: 'table',
            headers: ['Etapa', 'Descripción', 'Duración', 'Dependencias'],
            validation: { minRows: 4, required: true }
          },
          {
            id: 'stage_results',
            title: 'Resultados Esperados por Etapa',
            required: true,
            type: 'table',
            headers: ['Etapa', 'Resultado Esperado', 'Criterios de Éxito', 'Entregables'],
            validation: { minRows: 4, required: true }
          },
          {
            id: 'progress_indicators',
            title: 'Indicadores de Avance',
            required: true,
            type: 'table',
            headers: ['Etapa', 'Indicador', 'Método de Medición', 'Frecuencia'],
            validation: { minRows: 4, required: true }
          },
          {
            id: 'control_mechanisms',
            title: 'Mecanismos de Control',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'quality_controls', title: 'Controles de Calidad', type: 'list' },
              { id: 'progress_reviews', title: 'Revisiones de Progreso', type: 'textarea' },
              { id: 'change_management', title: 'Gestión de Cambios', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'consultant_resources',
            title: 'Recursos del Consultor',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'human_resources', title: 'Recursos Humanos', type: 'table' },
              { id: 'technical_resources', title: 'Recursos Técnicos', type: 'list' },
              { id: 'methodological_resources', title: 'Recursos Metodológicos', type: 'list' }
            ],
            validation: { required: true }
          },
          {
            id: 'client_resources',
            title: 'Recursos del Consultante',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'personnel_assignment', title: 'Asignación de Personal', type: 'table' },
              { id: 'facilities_equipment', title: 'Instalaciones y Equipos', type: 'list' },
              { id: 'information_access', title: 'Acceso a Información', type: 'list' }
            ],
            validation: { required: true }
          }
        ]
      },

      work_plan_presentation: {
        id: 'work_plan_presentation',
        title: 'Plan de trabajo presentado en la propuesta',
        element: 'E0877',
        required: true,
        icon: '📅',
        description: 'Plan detallado de trabajo con actividades, recursos y resultados esperados',
        estimatedTime: 60,
        evaluationCriteria: [
          'Menciona el resultado esperado de la solución a instalar',
          'Muestra las actividades a desarrollar',
          'Especifica los recursos a utilizar'
        ],
        sections: [
          {
            id: 'expected_results',
            title: 'Resultado Esperado de la Solución',
            required: true,
            type: 'textarea',
            placeholder: 'Describa claramente el resultado esperado una vez implementada la solución...',
            validation: { minLength: 300, required: true }
          },
          {
            id: 'activities_development',
            title: 'Actividades a Desarrollar',
            required: true,
            type: 'table',
            headers: ['Actividad', 'Descripción', 'Responsable', 'Duración', 'Dependencias'],
            validation: { minRows: 8, required: true }
          },
          {
            id: 'resource_specification',
            title: 'Especificación de Recursos',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'human_resources_plan', title: 'Recursos Humanos', type: 'table' },
              { id: 'material_resources', title: 'Recursos Materiales', type: 'table' },
              { id: 'financial_resources', title: 'Recursos Financieros', type: 'table' },
              { id: 'technological_resources', title: 'Recursos Tecnológicos', type: 'table' }
            ],
            validation: { required: true }
          }
        ]
      },

      activity_development_plan: {
        id: 'activity_development_plan',
        title: 'Actividades a desarrollar mencionadas en el plan',
        element: 'E0877',
        required: true,
        icon: '⚙️',
        description: 'Detalle específico de cada actividad con cronograma y controles',
        estimatedTime: 80,
        evaluationCriteria: [
          'Presentan la calendarización de las actividades',
          'Mencionan el responsable de la actividad',
          'Presentan los indicadores de avance',
          'Especifican su mecanismo de control',
          'Especifican su mecanismo de seguimiento'
        ],
        sections: [
          {
            id: 'activity_calendar',
            title: 'Calendarización de Actividades',
            required: true,
            type: 'gantt_chart',
            validation: { minActivities: 10, required: true }
          },
          {
            id: 'activity_responsibilities',
            title: 'Responsables por Actividad',
            required: true,
            type: 'table',
            headers: ['Actividad', 'Responsable Principal', 'Responsables Secundarios', 'Nivel de Autoridad'],
            validation: { minRows: 8, required: true }
          },
          {
            id: 'progress_indicators_detail',
            title: 'Indicadores de Avance Detallados',
            required: true,
            type: 'table',
            headers: ['Actividad', 'Indicador', 'Meta', 'Método de Medición', 'Frecuencia de Medición'],
            validation: { minRows: 8, required: true }
          },
          {
            id: 'control_mechanisms_detail',
            title: 'Mecanismos de Control por Actividad',
            required: true,
            type: 'table',
            headers: ['Actividad', 'Mecanismo de Control', 'Responsable del Control', 'Frecuencia'],
            validation: { minRows: 8, required: true }
          },
          {
            id: 'monitoring_mechanisms',
            title: 'Mecanismos de Seguimiento',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'monitoring_schedule', title: 'Cronograma de Seguimiento', type: 'table' },
              { id: 'monitoring_tools', title: 'Herramientas de Seguimiento', type: 'list' },
              { id: 'reporting_procedures', title: 'Procedimientos de Reporte', type: 'textarea' },
              { id: 'escalation_procedures', title: 'Procedimientos de Escalación', type: 'textarea' }
            ],
            validation: { required: true }
          }
        ]
      },

      agreement_record: {
        id: 'agreement_record',
        title: 'Registro elaborado de los acuerdos alcanzados',
        element: 'E0877',
        required: true,
        icon: '📄',
        description: 'Registro formal de todos los acuerdos establecidos entre consultor y cliente',
        estimatedTime: 90,
        evaluationCriteria: [
          'Incluye la propuesta autorizada',
          'Menciona el alcance',
          'Menciona el resultado esperado',
          'Especifica el tiempo esperado de implantación',
          'Define las responsabilidades de los participantes',
          'Menciona el costo de la solución presentada',
          'Especifica las condiciones de pago acordadas',
          'Incluye una cláusula sobre confidencialidad',
          'Incluye una cláusula sobre la propiedad intelectual'
        ],
        sections: [
          {
            id: 'authorized_proposal',
            title: '1. Propuesta Autorizada',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'proposal_reference', title: 'Referencia de la Propuesta', type: 'text' },
              { id: 'authorization_details', title: 'Detalles de Autorización', type: 'textarea' },
              { id: 'approval_signatures', title: 'Firmas de Aprobación', type: 'signature_fields' }
            ],
            validation: { required: true }
          },
          {
            id: 'agreed_scope',
            title: '2. Alcance Acordado',
            required: true,
            type: 'textarea',
            validation: { minLength: 300, required: true }
          },
          {
            id: 'expected_result_agreement',
            title: '3. Resultado Esperado',
            required: true,
            type: 'textarea',
            validation: { minLength: 250, required: true }
          },
          {
            id: 'implementation_timeframe',
            title: '4. Tiempo de Implantación',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'start_date', title: 'Fecha de Inicio', type: 'date' },
              { id: 'end_date', title: 'Fecha de Finalización', type: 'date' },
              { id: 'key_milestones', title: 'Hitos Clave', type: 'table' },
              { id: 'timeline_conditions', title: 'Condiciones del Cronograma', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'participant_responsibilities',
            title: '5. Responsabilidades de los Participantes',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'consultant_responsibilities_agreement', title: 'Responsabilidades del Consultor', type: 'list' },
              { id: 'client_responsibilities_agreement', title: 'Responsabilidades del Cliente', type: 'list' },
              { id: 'shared_responsibilities', title: 'Responsabilidades Compartidas', type: 'list' }
            ],
            validation: { required: true }
          },
          {
            id: 'solution_cost',
            title: '6. Costo de la Solución',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'total_cost', title: 'Costo Total', type: 'currency' },
              { id: 'cost_breakdown_agreement', title: 'Desglose de Costos', type: 'table' },
              { id: 'cost_adjustments', title: 'Ajustes de Costo', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'payment_conditions',
            title: '7. Condiciones de Pago',
            required: true,
            type: 'structured',
            subsections: [
              { id: 'payment_schedule', title: 'Calendario de Pagos', type: 'table' },
              { id: 'payment_methods', title: 'Métodos de Pago', type: 'list' },
              { id: 'payment_terms', title: 'Términos de Pago', type: 'textarea' }
            ],
            validation: { required: true }
          },
          {
            id: 'confidentiality_clause',
            title: '8. Cláusula de Confidencialidad',
            required: true,
            type: 'legal_text',
            template: 'confidentiality_standard',
            validation: { required: true }
          },
          {
            id: 'intellectual_property_clause',
            title: '9. Cláusula de Propiedad Intelectual',
            required: true,
            type: 'legal_text',
            template: 'intellectual_property_standard',
            validation: { required: true }
          }
        ]
      }
    };

    // Store templates
    Object.values(templates).forEach(template => {
      this.templates.set(template.id, template);
    });

    console.log('[DocumentEngine] Loaded', this.templates.size, 'document templates');
  }

  /**
   * Create new document from template
   * @param {string} templateId - Template identifier
   * @param {Object} initialData - Initial document data
   * @returns {Object} Document instance
   */
  createDocument(templateId, initialData = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const documentId = this.generateDocumentId(templateId);
    const document = {
      id: documentId,
      templateId: templateId,
      title: template.title,
      element: template.element,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      completionPercentage: 0,
      data: this.initializeDocumentData(template, initialData),
      metadata: {
        estimatedTime: template.estimatedTime,
        timeSpent: 0,
        lastSection: null,
        validationResults: null
      }
    };

    this.documents.set(documentId, document);
    this.userDocuments.set(documentId, document);

    this.emit('document:created', {
      documentId: documentId,
      templateId: templateId,
      timestamp: Date.now()
    });

    return document;
  }

  /**
   * Initialize document data structure from template
   */
  initializeDocumentData(template, initialData) {
    const data = { ...initialData };
    
    template.sections.forEach(section => {
      if (!data[section.id]) {
        switch (section.type) {
          case 'structured':
            data[section.id] = {};
            section.subsections?.forEach(subsection => {
              data[section.id][subsection.id] = this.getDefaultValue(subsection.type);
            });
            break;
          
          case 'matrix':
          case 'table':
            data[section.id] = [];
            break;
          
          case 'list':
            data[section.id] = [];
            break;
          
          case 'form_fields':
            data[section.id] = {};
            section.fields?.forEach(field => {
              data[section.id][field.name] = '';
            });
            break;
          
          default:
            data[section.id] = '';
        }
      }
    });

    return data;
  }

  /**
   * Get default value for field type
   */
  getDefaultValue(type) {
    switch (type) {
      case 'list':
        return [];
      case 'table':
      case 'matrix':
        return [];
      case 'textarea':
      case 'text':
        return '';
      case 'number':
        return 0;
      case 'date':
        return '';
      case 'boolean':
        return false;
      default:
        return '';
    }
  }

  /**
   * Save document
   * @param {string} documentId - Document identifier
   * @param {Object} data - Document data
   */
  async saveDocument(documentId, data) {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Update document
    document.data = { ...document.data, ...data };
    document.updatedAt = Date.now();
    document.version += 1;

    // Calculate completion percentage
    document.completionPercentage = this.calculateCompletionPercentage(document);

    // Update status based on completion
    if (document.completionPercentage >= 100) {
      document.status = 'completed';
    } else if (document.completionPercentage > 0) {
      document.status = 'in_progress';
    }

    // Save to storage
    await this.saveUserDocuments();

    this.emit('document:saved', {
      documentId: documentId,
      completionPercentage: document.completionPercentage,
      status: document.status,
      timestamp: Date.now()
    });

    return document;
  }

  /**
   * Calculate document completion percentage
   */
  calculateCompletionPercentage(document) {
    const template = this.templates.get(document.templateId);
    if (!template) return 0;

    let totalSections = 0;
    let completedSections = 0;

    template.sections.forEach(section => {
      totalSections++;
      
      if (this.isSectionComplete(section, document.data[section.id])) {
        completedSections++;
      }
    });

    return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  }

  /**
   * Check if section is complete
   */
  isSectionComplete(section, data) {
    if (!section.required) return true;
    if (!data) return false;

    switch (section.type) {
      case 'textarea':
      case 'text':
        return data.length >= (section.validation?.minLength || 10);
      
      case 'list':
        return Array.isArray(data) && data.length >= (section.validation?.minItems || 1);
      
      case 'table':
      case 'matrix':
        return Array.isArray(data) && data.length >= (section.validation?.minRows || 1);
      
      case 'structured':
        if (!section.subsections) return true;
        return section.subsections.every(subsection => {
          const subData = data[subsection.id];
          return this.isSectionComplete(subsection, subData);
        });
      
      case 'form_fields':
        if (!section.fields) return true;
        return section.fields.every(field => {
          return data[field.name] && data[field.name].trim().length > 0;
        });
      
      default:
        return data && data.toString().trim().length > 0;
    }
  }

  /**
   * Validate document
   * @param {string} documentId - Document identifier
   * @returns {Object} Validation results
   */
  validateDocument(documentId) {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    const template = this.templates.get(document.templateId);
    const validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      completionPercentage: document.completionPercentage,
      sectionsValidated: 0,
      sectionsWithErrors: 0
    };

    template.sections.forEach(section => {
      validationResults.sectionsValidated++;
      
      const sectionData = document.data[section.id];
      const sectionValidation = this.validateSection(section, sectionData);
      
      if (!sectionValidation.isValid) {
        validationResults.sectionsWithErrors++;
        validationResults.isValid = false;
        validationResults.errors.push({
          sectionId: section.id,
          sectionTitle: section.title,
          errors: sectionValidation.errors
        });
      }

      if (sectionValidation.warnings.length > 0) {
        validationResults.warnings.push({
          sectionId: section.id,
          sectionTitle: section.title,
          warnings: sectionValidation.warnings
        });
      }
    });

    // Update document metadata
    document.metadata.validationResults = validationResults;

    this.emit('document:validated', {
      documentId: documentId,
      validationResults: validationResults,
      timestamp: Date.now()
    });

    return validationResults;
  }

  /**
   * Validate individual section
   */
  validateSection(section, data) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check required validation
    if (section.required && !data) {
      result.isValid = false;
      result.errors.push('Esta sección es obligatoria');
      return result;
    }

    if (!section.validation) return result;

    // Validate based on section type and validation rules
    switch (section.type) {
      case 'textarea':
      case 'text':
        if (section.validation.minLength && data.length < section.validation.minLength) {
          result.isValid = false;
          result.errors.push(`Mínimo ${section.validation.minLength} caracteres requeridos`);
        }
        if (section.validation.maxLength && data.length > section.validation.maxLength) {
          result.warnings.push(`Se recomienda no exceder ${section.validation.maxLength} caracteres`);
        }
        break;
      
      case 'list':
        if (section.validation.minItems && data.length < section.validation.minItems) {
          result.isValid = false;
          result.errors.push(`Mínimo ${section.validation.minItems} elementos requeridos`);
        }
        break;
      
      case 'table':
      case 'matrix':
        if (section.validation.minRows && data.length < section.validation.minRows) {
          result.isValid = false;
          result.errors.push(`Mínimo ${section.validation.minRows} filas requeridas`);
        }
        break;
    }

    return result;
  }

  /**
   * Export document
   * @param {string} documentId - Document identifier
   * @param {string} format - Export format (html, pdf, docx)
   * @returns {Promise} Export promise
   */
  async exportDocument(documentId, format = 'html') {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    const template = this.templates.get(document.templateId);
    
    switch (format) {
      case 'html':
        return this.exportToHTML(document, template);
      case 'pdf':
        return this.exportToPDF(document, template);
      case 'docx':
        return this.exportToDocx(document, template);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export to HTML
   */
  exportToHTML(document, template) {
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${document.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section-title { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f2f2f2; }
          .list { margin: 10px 0; }
          .list li { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${document.title}</h1>
          <p><strong>Elemento:</strong> ${template.element} - ${template.elementName || ''}</p>
          <p><strong>Fecha de creación:</strong> ${new Date(document.createdAt).toLocaleDateString()}</p>
          <p><strong>Última actualización:</strong> ${new Date(document.updatedAt).toLocaleDateString()}</p>
        </div>
        
        ${this.renderDocumentSectionsHTML(template, document)}
      </body>
      </html>
    `;

    return {
      content: html,
      filename: `${document.templateId}_${document.id}.html`,
      mimeType: 'text/html'
    };
  }

  /**
   * Render document sections as HTML
   */
  renderDocumentSectionsHTML(template, document) {
    return template.sections.map(section => {
      const data = document.data[section.id];
      return `
        <div class="section">
          <h2 class="section-title">${section.title}</h2>
          ${this.renderSectionDataHTML(section, data)}
        </div>
      `;
    }).join('');
  }

  /**
   * Render section data as HTML
   */
  renderSectionDataHTML(section, data) {
    switch (section.type) {
      case 'textarea':
      case 'text':
        return `<p>${data || ''}</p>`;
      
      case 'list':
        if (!Array.isArray(data) || data.length === 0) return '<p>No hay elementos</p>';
        return `<ul class="list">${data.map(item => `<li>${item}</li>`).join('')}</ul>`;
      
      case 'table':
      case 'matrix':
        if (!Array.isArray(data) || data.length === 0) return '<p>No hay datos</p>';
        const headers = section.headers || Object.keys(data[0] || {});
        return `
          <table class="table">
            <thead>
              <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.map(row => `<tr>${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        `;
      
      case 'structured':
        if (!section.subsections) return '<p>No hay datos</p>';
        return section.subsections.map(subsection => `
          <h3>${subsection.title}</h3>
          ${this.renderSectionDataHTML(subsection, data[subsection.id])}
        `).join('');
      
      default:
        return `<p>${data || ''}</p>`;
    }
  }

  /**
   * Utility methods
   */
  generateDocumentId(templateId) {
    return `${templateId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getTemplate(templateId) {
    return this.templates.get(templateId);
  }

  getDocument(documentId) {
    return this.documents.get(documentId);
  }

  getUserDocuments() {
    return Array.from(this.userDocuments.values());
  }

  getDocumentsByElement(elementId) {
    return this.getUserDocuments().filter(doc => {
      const template = this.templates.get(doc.templateId);
      return template && template.element === elementId;
    });
  }

  getDocumentsByStatus(status) {
    return this.getUserDocuments().filter(doc => doc.status === status);
  }

  /**
   * Event handlers
   */
  handleDocumentCreate(data) {
    console.log('[DocumentEngine] Document created:', data);
  }

  handleDocumentSave(data) {
    console.log('[DocumentEngine] Document saved:', data);
  }

  handleDocumentValidate(data) {
    console.log('[DocumentEngine] Document validated:', data);
  }

  handleDocumentExport(data) {
    console.log('[DocumentEngine] Document exported:', data);
  }

  /**
   * Storage methods
   */
  async loadUserDocuments() {
    try {
      const savedDocuments = await this.storage.get('user_documents');
      if (savedDocuments) {
        savedDocuments.forEach(doc => {
          this.documents.set(doc.id, doc);
          this.userDocuments.set(doc.id, doc);
        });
      }
    } catch (error) {
      console.warn('[DocumentEngine] Failed to load user documents:', error);
    }
  }

  async saveUserDocuments() {
    try {
      const documents = Array.from(this.userDocuments.values());
      await this.storage.set('user_documents', documents);
    } catch (error) {
      console.warn('[DocumentEngine] Failed to save user documents:', error);
    }
  }

  async onDestroy() {
    this.templates.clear();
    this.documents.clear();
    this.userDocuments.clear();
    this.documentHistory.clear();
  }
}

export default DocumentEngine;