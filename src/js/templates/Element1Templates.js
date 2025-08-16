/**
 * Element 1 Templates - Problem Identification (E0875)
 * 8 document templates for identifying organizational problems and client needs
 */

const element1Templates = {
  // Document 1: Problem Description
  problem_description: {
    id: 'problem_description',
    title: 'Documento que describe el problema planteado',
    element: 'E0875',
    elementName: 'Identificar la situación/problema planteado',
    required: true,
    icon: '📋',
    description: 'Documento comprehensivo que describe la situación problemática identificada',
    estimatedTime: 45,
    videoSupport: {
      id: 'AM5hrNAbMn8',
      title: 'EC0249: 2.2) El documento elaborado que describe el problema planteado',
      description: 'Video explicativo sobre cómo elaborar correctamente el documento que describe el problema planteado'
    },
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

  // Document 2: Current Situation Impact
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

  // Document 3: Information Integration
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
        validation: { minLength: 200, required: true }
      },
      {
        id: 'information_interpretation',
        title: 'Interpretación de la Información',
        required: true,
        type: 'textarea',
        placeholder: 'Proporcione su interpretación profesional de la información recopilada...',
        validation: { minLength: 250, required: true }
      }
    ]
  },

  // Document 4: Methodology Report
  methodology_report: {
    id: 'methodology_report',
    title: 'Reporte de metodología empleada',
    element: 'E0875',
    required: true,
    icon: '📊',
    description: 'Descripción completa de la metodología utilizada para la identificación del problema',
    estimatedTime: 90,
    videoSupport: {
      id: '03iWP4RsGCU',
      title: 'EC0249: 2.5) Reporte de la metodología empleada',
      description: 'Guía detallada para crear un reporte completo de la metodología utilizada en la identificación del problema'
    },
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
        title: 'Definición de la Situación/Problema',
        required: true,
        type: 'textarea',
        placeholder: 'Defina claramente la situación o problema identificado...',
        validation: { minLength: 200, required: true }
      },
      {
        id: 'interview_program',
        title: 'Programa de Entrevistas',
        required: true,
        type: 'structured',
        subsections: [
          { id: 'interview_schedule', title: 'Cronograma de Entrevistas', type: 'matrix', headers: ['Fecha', 'Hora', 'Participante', 'Objetivo'] },
          { id: 'interview_participants', title: 'Participantes', type: 'list' },
          { id: 'interview_methodology', title: 'Metodología de Entrevistas', type: 'textarea' }
        ],
        validation: { required: true }
      },
      {
        id: 'involved_areas',
        title: 'Áreas Involucradas',
        required: true,
        type: 'list',
        placeholder: 'Liste todas las áreas organizacionales involucradas...',
        validation: { minItems: 2, required: true }
      },
      {
        id: 'studies_tests',
        title: 'Estudios/Pruebas a Realizar',
        required: true,
        type: 'structured',
        subsections: [
          { id: 'study_types', title: 'Tipos de Estudios', type: 'list' },
          { id: 'test_procedures', title: 'Procedimientos de Prueba', type: 'textarea' },
          { id: 'success_criteria', title: 'Criterios de Éxito', type: 'list' }
        ],
        validation: { required: true }
      },
      {
        id: 'information_requirements',
        title: 'Requerimientos de Información',
        required: true,
        type: 'matrix',
        headers: ['Tipo de Información', 'Fuente', 'Método de Recopilación', 'Responsable'],
        validation: { minRows: 3, required: true }
      },
      {
        id: 'field_observation_program',
        title: 'Programa de Observaciones de Campo',
        required: true,
        type: 'structured',
        subsections: [
          { id: 'observation_sites', title: 'Sitios de Observación', type: 'list' },
          { id: 'observation_schedule', title: 'Cronograma', type: 'matrix', headers: ['Fecha', 'Hora', 'Sitio', 'Actividad'] },
          { id: 'observation_criteria', title: 'Criterios de Observación', type: 'list' }
        ],
        validation: { required: true }
      },
      {
        id: 'documentary_search',
        title: 'Búsqueda de Información Documental',
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
        title: 'Evaluación de la Información',
        required: true,
        type: 'textarea',
        placeholder: 'Describa el método utilizado para evaluar la calidad y relevancia de la información...',
        validation: { minLength: 200, required: true }
      }
    ]
  },

  // Document 5: Interview Guide
  interview_guide: {
    id: 'interview_guide',
    title: 'Guía de entrevista empleada',
    element: 'E0875',
    required: true,
    icon: '🎤',
    description: 'Guía estructurada para conducir entrevistas efectivas',
    estimatedTime: 40,
    videoSupport: {
      id: 'vgkklaQJpbg',
      title: 'EC0249: 2.6) Guía de entrevistas',
      description: 'Aprende a diseñar y estructurar guías de entrevista efectivas para la recolección de información'
    },
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
          { id: 'delivery_format', title: 'Formato de Entrega', type: 'text' }
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

  // Document 6: Questionnaire
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
        title: 'Propósito del Cuestionario',
        required: true,
        type: 'textarea',
        placeholder: 'Explique claramente el propósito del cuestionario...',
        validation: { minLength: 100, required: true }
      },
      {
        id: 'general_data',
        title: 'Datos Generales',
        required: true,
        type: 'form',
        fields: [
          { id: 'participant_name', label: 'Nombre del Participante', type: 'text', required: true },
          { id: 'position', label: 'Cargo/Posición', type: 'text', required: true },
          { id: 'department', label: 'Departamento', type: 'text', required: true },
          { id: 'date', label: 'Fecha', type: 'date', required: true },
          { id: 'duration', label: 'Duración Estimada', type: 'text', required: true }
        ],
        validation: { required: true }
      },
      {
        id: 'confidentiality_notice',
        title: 'Aviso de Confidencialidad',
        required: true,
        type: 'textarea',
        placeholder: 'Incluya la declaración de confidencialidad...',
        validation: { minLength: 100, required: true }
      },
      {
        id: 'filling_instructions',
        title: 'Instrucciones de Llenado',
        required: true,
        type: 'textarea',
        placeholder: 'Proporcione instrucciones claras sobre cómo completar el cuestionario...',
        validation: { minLength: 150, required: true }
      },
      {
        id: 'main_questions',
        title: 'Preguntas Principales',
        required: true,
        type: 'questionBuilder',
        placeholder: 'Desarrolle las preguntas principales del cuestionario...',
        validation: { minQuestions: 10, required: true }
      },
      {
        id: 'supporting_documentation',
        title: 'Documentación de Soporte',
        required: true,
        type: 'list',
        placeholder: 'Liste los documentos que deben acompañar al cuestionario...',
        validation: { minItems: 3, required: true }
      },
      {
        id: 'final_comments',
        title: 'Espacio para Comentarios Finales',
        required: false,
        type: 'template',
        template: '[Espacio designado para comentarios adicionales del participante]',
        validation: { required: false }
      },
      {
        id: 'acknowledgment',
        title: 'Agradecimiento',
        required: true,
        type: 'textarea',
        placeholder: 'Incluya frases de agradecimiento apropiadas...',
        validation: { minLength: 50, required: true }
      }
    ]
  },

  // Document 7: Documentary Search Program
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
          { id: 'internal_timeline', title: 'Cronograma Interno', type: 'matrix', headers: ['Actividad', 'Responsable', 'Fecha Inicio', 'Fecha Fin'] }
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
          { id: 'external_timeline', title: 'Cronograma Externo', type: 'matrix', headers: ['Actividad', 'Responsable', 'Fecha Inicio', 'Fecha Fin'] }
        ],
        validation: { required: true }
      }
    ]
  },

  // Document 8: Field Visit Report
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
        validation: { minLength: 100, required: true }
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
          { id: 'follow_up_actions', title: 'Acciones de Seguimiento', type: 'list' }
        ],
        validation: { required: true }
      }
    ]
  }
};

export default element1Templates;