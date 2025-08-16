/**
 * Element 3 Templates - Solution Presentation (E0877)
 * 5 document templates for presenting solution proposals
 */

const element3Templates = {
  // Document 1: Work Proposal
  work_proposal: {
    id: 'work_proposal',
    title: 'Propuesta de trabajo elaborada',
    element: 'E0877',
    elementName: 'Presentar la propuesta de solución',
    required: true,
    icon: '📋',
    description: 'Propuesta formal de trabajo con todos los componentes requeridos',
    estimatedTime: 120,
    videoSupport: {
      id: 'jFYxjh1H_P8',
      title: 'EC0249: 4.2) Elaborar la propuesta de trabajo',
      description: 'Aprende a estructurar y elaborar propuestas de trabajo completas y profesionales'
    },
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
        title: 'Antecedentes y Diagnóstico',
        required: true,
        type: 'textarea',
        placeholder: 'Proporcione los antecedentes y diagnóstico de la situación...',
        validation: { minLength: 300, required: true }
      },
      {
        id: 'project_synthesis',
        title: 'Síntesis Descriptiva del Proyecto',
        required: true,
        type: 'textarea',
        placeholder: 'Describa de manera sintética el proyecto propuesto...',
        validation: { minLength: 200, required: true }
      },
      {
        id: 'project_scope',
        title: 'Alcance del Proyecto',
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
        title: 'Solución Propuesta Detallada',
        required: true,
        type: 'textarea',
        placeholder: 'Describa en detalle la solución propuesta...',
        validation: { minLength: 400, required: true }
      },
      {
        id: 'work_plan',
        title: 'Plan de Trabajo',
        required: true,
        type: 'structured',
        subsections: [
          { 
            id: 'project_phases', 
            title: 'Fases del Proyecto', 
            type: 'matrix', 
            headers: ['Fase', 'Duración', 'Objetivos', 'Entregables']
          },
          { 
            id: 'timeline', 
            title: 'Cronograma', 
            type: 'matrix', 
            headers: ['Actividad', 'Inicio', 'Fin', 'Duración', 'Dependencias']
          },
          { id: 'milestones', title: 'Hitos Principales', type: 'list' }
        ],
        validation: { required: true }
      },
      {
        id: 'consultant_deliverables',
        title: 'Entregables del Consultor',
        required: true,
        type: 'matrix',
        headers: ['Entregable', 'Descripción', 'Fecha de Entrega', 'Criterios de Aceptación'],
        validation: { minRows: 3, required: true }
      },
      {
        id: 'project_risks',
        title: 'Riesgos del Proyecto',
        required: true,
        type: 'matrix',
        headers: ['Riesgo', 'Probabilidad', 'Impacto', 'Mitigación'],
        validation: { minRows: 5, required: true }
      },
      {
        id: 'consultant_responsibilities',
        title: 'Responsabilidades del Consultor',
        required: true,
        type: 'list',
        placeholder: 'Liste las responsabilidades del consultor...',
        validation: { minItems: 5, required: true }
      },
      {
        id: 'client_responsibilities',
        title: 'Responsabilidades del Consultante',
        required: true,
        type: 'list',
        placeholder: 'Liste las responsabilidades del cliente...',
        validation: { minItems: 5, required: true }
      },
      {
        id: 'estimated_cost',
        title: 'Costo Estimado',
        required: true,
        type: 'structured',
        subsections: [
          { 
            id: 'cost_breakdown', 
            title: 'Desglose de Costos', 
            type: 'matrix', 
            headers: ['Categoría', 'Concepto', 'Cantidad', 'Precio Unitario', 'Total']
          },
          { id: 'payment_terms', title: 'Términos de Pago', type: 'textarea' },
          { id: 'cost_assumptions', title: 'Supuestos de Costo', type: 'list' }
        ],
        validation: { required: true }
      }
    ]
  },

  // Document 2: Detailed Solution Description
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
        type: 'matrix',
        headers: ['Etapa', 'Descripción', 'Duración', 'Dependencias'],
        validation: { minRows: 4, required: true }
      },
      {
        id: 'stage_results',
        title: 'Resultados Esperados por Etapa',
        required: true,
        type: 'matrix',
        headers: ['Etapa', 'Resultado Esperado', 'Criterios de Éxito', 'Entregables'],
        validation: { minRows: 4, required: true }
      },
      {
        id: 'progress_indicators',
        title: 'Indicadores de Avance',
        required: true,
        type: 'matrix',
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
          { 
            id: 'human_resources', 
            title: 'Recursos Humanos', 
            type: 'matrix', 
            headers: ['Rol', 'Perfil', 'Dedicación', 'Período']
          },
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
          { 
            id: 'personnel_assignment', 
            title: 'Asignación de Personal', 
            type: 'matrix', 
            headers: ['Rol', 'Persona', 'Dedicación', 'Período']
          },
          { id: 'facilities_equipment', title: 'Instalaciones y Equipos', type: 'list' },
          { id: 'information_access', title: 'Acceso a Información', type: 'list' }
        ],
        validation: { required: true }
      }
    ]
  },

  // Document 3: Work Plan Presentation
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
        type: 'matrix',
        headers: ['Actividad', 'Descripción', 'Responsable', 'Duración', 'Dependencias'],
        validation: { minRows: 8, required: true }
      },
      {
        id: 'resource_specification',
        title: 'Especificación de Recursos',
        required: true,
        type: 'structured',
        subsections: [
          { 
            id: 'human_resources_plan', 
            title: 'Recursos Humanos', 
            type: 'matrix', 
            headers: ['Rol', 'Cantidad', 'Perfil', 'Costo']
          },
          { 
            id: 'material_resources', 
            title: 'Recursos Materiales', 
            type: 'matrix', 
            headers: ['Recurso', 'Cantidad', 'Especificación', 'Costo']
          },
          { 
            id: 'financial_resources', 
            title: 'Recursos Financieros', 
            type: 'matrix', 
            headers: ['Concepto', 'Monto', 'Período', 'Fuente']
          },
          { 
            id: 'technological_resources', 
            title: 'Recursos Tecnológicos', 
            type: 'matrix', 
            headers: ['Tecnología', 'Especificación', 'Proveedor', 'Costo']
          }
        ],
        validation: { required: true }
      }
    ]
  },

  // Document 4: Activity Development Plan
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
        type: 'gantt',
        placeholder: 'Desarrolle el cronograma de actividades...',
        validation: { minActivities: 10, required: true }
      },
      {
        id: 'activity_responsibilities',
        title: 'Responsables por Actividad',
        required: true,
        type: 'matrix',
        headers: ['Actividad', 'Responsable Principal', 'Responsables Secundarios', 'Nivel de Autoridad'],
        validation: { minRows: 10, required: true }
      },
      {
        id: 'progress_indicators_detail',
        title: 'Indicadores de Avance Detallados',
        required: true,
        type: 'matrix',
        headers: ['Actividad', 'Indicador', 'Meta', 'Método de Medición', 'Frecuencia de Medición'],
        validation: { minRows: 10, required: true }
      },
      {
        id: 'control_mechanisms_detail',
        title: 'Mecanismos de Control por Actividad',
        required: true,
        type: 'matrix',
        headers: ['Actividad', 'Mecanismo de Control', 'Responsable del Control', 'Frecuencia'],
        validation: { minRows: 10, required: true }
      },
      {
        id: 'monitoring_mechanisms',
        title: 'Mecanismos de Seguimiento',
        required: true,
        type: 'structured',
        subsections: [
          { 
            id: 'monitoring_schedule', 
            title: 'Cronograma de Seguimiento', 
            type: 'matrix', 
            headers: ['Fecha', 'Actividad de Seguimiento', 'Responsable', 'Objetivo']
          },
          { id: 'monitoring_tools', title: 'Herramientas de Seguimiento', type: 'list' },
          { id: 'reporting_procedures', title: 'Procedimientos de Reporte', type: 'textarea' },
          { id: 'escalation_procedures', title: 'Procedimientos de Escalación', type: 'textarea' }
        ],
        validation: { required: true }
      }
    ]
  },

  // Document 5: Agreement Record
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
        title: 'Propuesta Autorizada',
        required: true,
        type: 'structured',
        subsections: [
          { id: 'proposal_reference', title: 'Referencia de la Propuesta', type: 'text' },
          { id: 'authorization_details', title: 'Detalles de Autorización', type: 'textarea' },
          { id: 'approval_signatures', title: 'Firmas de Aprobación', type: 'signature' }
        ],
        validation: { required: true }
      },
      {
        id: 'agreed_scope',
        title: 'Alcance Acordado',
        required: true,
        type: 'textarea',
        placeholder: 'Describa detalladamente el alcance acordado...',
        validation: { minLength: 200, required: true }
      },
      {
        id: 'expected_result_agreement',
        title: 'Resultado Esperado',
        required: true,
        type: 'textarea',
        placeholder: 'Especifique el resultado esperado acordado...',
        validation: { minLength: 200, required: true }
      },
      {
        id: 'implementation_timeframe',
        title: 'Tiempo de Implantación',
        required: true,
        type: 'structured',
        subsections: [
          { id: 'start_date', title: 'Fecha de Inicio', type: 'date' },
          { id: 'end_date', title: 'Fecha de Finalización', type: 'date' },
          { 
            id: 'key_milestones', 
            title: 'Hitos Clave', 
            type: 'matrix', 
            headers: ['Hito', 'Fecha', 'Descripción']
          },
          { id: 'timeline_conditions', title: 'Condiciones del Cronograma', type: 'textarea' }
        ],
        validation: { required: true }
      },
      {
        id: 'participant_responsibilities',
        title: 'Responsabilidades de los Participantes',
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
        title: 'Costo de la Solución',
        required: true,
        type: 'structured',
        subsections: [
          { id: 'total_cost', title: 'Costo Total', type: 'currency' },
          { 
            id: 'cost_breakdown_agreement', 
            title: 'Desglose de Costos', 
            type: 'matrix', 
            headers: ['Categoría', 'Concepto', 'Monto', 'Moneda']
          },
          { id: 'cost_adjustments', title: 'Ajustes de Costo', type: 'textarea' }
        ],
        validation: { required: true }
      },
      {
        id: 'payment_conditions',
        title: 'Condiciones de Pago',
        required: true,
        type: 'structured',
        subsections: [
          { 
            id: 'payment_schedule', 
            title: 'Calendario de Pagos', 
            type: 'matrix', 
            headers: ['Fecha', 'Monto', 'Concepto', 'Condiciones']
          },
          { id: 'payment_methods', title: 'Métodos de Pago', type: 'list' },
          { id: 'payment_terms', title: 'Términos de Pago', type: 'textarea' }
        ],
        validation: { required: true }
      },
      {
        id: 'confidentiality_clause',
        title: 'Cláusula de Confidencialidad',
        required: true,
        type: 'template',
        template: 'confidentiality_standard',
        validation: { required: true }
      },
      {
        id: 'intellectual_property_clause',
        title: 'Cláusula de Propiedad Intelectual',
        required: true,
        type: 'template',
        template: 'intellectual_property_standard',
        validation: { required: true }
      }
    ]
  }
};

export default element3Templates;