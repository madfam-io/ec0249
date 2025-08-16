/**
 * Element 2 Templates - Solution Development (E0876)
 * 2 document templates for developing solution options
 */

const element2Templates = {
  // Document 1: Impact Analysis Report
  impact_analysis_report: {
    id: 'impact_analysis_report',
    title: 'Reporte de las afectaciones encontradas',
    element: 'E0876',
    elementName: 'Desarrollar opciones de solución',
    required: true,
    icon: '📈',
    description: 'Análisis comprehensivo de las afectaciones identificadas y su metodología',
    estimatedTime: 60,
    videoSupport: {
      id: 'vvVUICOvnRs',
      title: 'EC0249: 3.1) Reporte de las afectaciones encontradas',
      description: 'Metodología para crear un reporte detallado de las afectaciones encontradas en la organización'
    },
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

  // Document 2: Solution Design
  solution_design: {
    id: 'solution_design',
    title: 'Solución diseñada',
    element: 'E0876',
    required: true,
    icon: '💡',
    description: 'Diseño detallado de la solución propuesta con justificación completa',
    estimatedTime: 90,
    videoSupport: {
      id: 'Uqs9pO_XpMs',
      title: 'EC0249: 3.2) La solución diseñada',
      description: 'Guía para diseñar soluciones efectivas con justificación detallada y análisis costo-beneficio'
    },
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
          { 
            id: 'implementation_costs', 
            title: 'Costos de Implementación', 
            type: 'matrix', 
            headers: ['Categoría', 'Concepto', 'Cantidad', 'Costo Unitario', 'Costo Total']
          },
          { 
            id: 'operational_costs', 
            title: 'Costos Operacionales', 
            type: 'matrix', 
            headers: ['Categoría', 'Concepto', 'Frecuencia', 'Costo Periódico']
          },
          { 
            id: 'quantified_benefits', 
            title: 'Beneficios Cuantificados', 
            type: 'matrix', 
            headers: ['Beneficio', 'Período', 'Valor Estimado', 'Método de Cálculo']
          },
          { id: 'roi_analysis', title: 'Análisis de ROI', type: 'textarea' }
        ],
        validation: { required: true }
      }
    ]
  }
};

export default element2Templates;