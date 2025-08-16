/**
 * Presentation Scenarios - EC0249 Element 3 (E0877)
 * Realistic presentation scenarios for practicing solution proposal skills
 */

export const presentationScenarios = {
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
      },
      {
        name: 'Mtra. Carmen Villanueva',
        position: 'Directora de Calidad',
        personality: 'Detallista, enfocada en procesos',
        concerns: ['Compliance regulatorio', 'Procesos de calidad', 'Certificaciones']
      },
      {
        name: 'Ing. Miguel Torres',
        position: 'Director de Tecnología',
        personality: 'Innovador, preocupado por integración',
        concerns: ['Integración tecnológica', 'Sistemas existentes', 'Capacidad técnica']
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
      },
      {
        questioner: 'Mtra. Carmen Villanueva',
        question: '¿Cómo garantizan que cumpliremos con todos los requisitos de la norma ISO 9001?',
        category: 'quality',
        difficulty: 'high',
        expected_elements: ['Metodología de cumplimiento', 'Auditorías internas', 'Preparación para certificación']
      },
      {
        questioner: 'Ing. Miguel Torres',
        question: '¿Qué integración será necesaria con nuestros sistemas actuales de ERP y CRM?',
        category: 'technical',
        difficulty: 'high',
        expected_elements: ['Análisis de sistemas', 'Plan de integración', 'Riesgos técnicos']
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
    },
    audience: [
      {
        name: 'Lic. Jorge Ramírez',
        position: 'Gerente de Ventas',
        personality: 'Orientado a resultados, competitivo',
        concerns: ['Impacto en ventas durante transición', 'Capacitación del equipo', 'Métricas de desempeño']
      },
      {
        name: 'Ing. María Fernández',
        position: 'Gerente de Inventarios',
        personality: 'Analítica, preocupada por la precisión',
        concerns: ['Control de inventario', 'Reducción de mermas', 'Sistemas de tracking']
      },
      {
        name: 'Lic. Carlos Mendoza',
        position: 'Gerente de Tecnología',
        personality: 'Cauteloso, enfocado en estabilidad',
        concerns: ['Compatibilidad de sistemas', 'Tiempo de implementación', 'Capacitación técnica']
      },
      {
        name: 'Mtra. Laura Gutiérrez',
        position: 'Gerente de Recursos Humanos',
        personality: 'Empática, preocupada por el personal',
        concerns: ['Cambio organizacional', 'Resistencia del personal', 'Plan de capacitación']
      }
    ],
    evaluationCriteria: [
      {
        id: 'proposal_description',
        title: 'Describir la propuesta sugerida',
        weight: 12,
        description: 'Explicar claramente qué se propone implementar'
      },
      {
        id: 'scope_mention',
        title: 'Mencionar el alcance',
        weight: 11,
        description: 'Definir qué está incluido y qué no en la propuesta'
      },
      {
        id: 'advantages_disadvantages',
        title: 'Exponer las ventajas y desventajas',
        weight: 11,
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
        weight: 10,
        description: 'Describir las fases del proyecto de implementación'
      },
      {
        id: 'deliverables',
        title: 'Mencionar los entregables de cada etapa',
        weight: 10,
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
        weight: 9,
        description: 'Presentar análisis financiero y justificación económica'
      }
    ],
    presentation_flow: [
      {
        stage: 'opening',
        duration: 3,
        objectives: ['Presentarse', 'Establecer conexión', 'Presentar agenda'],
        key_points: ['Saludo cordial', 'Presentación personal', 'Agenda de la reunión']
      },
      {
        stage: 'current_situation',
        duration: 5,
        objectives: ['Revisar situación actual', 'Confirmar problemas identificados'],
        key_points: ['Problemas actuales', 'Impacto en cada área', 'Necesidad de mejora']
      },
      {
        stage: 'solution_overview',
        duration: 10,
        objectives: ['Presentar solución', 'Explicar beneficios por área'],
        key_points: ['Descripción de la solución', 'Beneficios específicos', 'Mejoras esperadas']
      },
      {
        stage: 'implementation_details',
        duration: 8,
        objectives: ['Explicar implementación', 'Definir responsabilidades'],
        key_points: ['Plan de implementación', 'Cronograma', 'Roles y responsabilidades']
      },
      {
        stage: 'qa_next_steps',
        duration: 4,
        objectives: ['Resolver dudas', 'Definir siguientes pasos'],
        key_points: ['Preguntas y respuestas', 'Próximos pasos', 'Compromisos']
      }
    ],
    potential_questions: [
      {
        questioner: 'Lic. Jorge Ramírez',
        question: '¿Cómo afectará el nuevo sistema a nuestras ventas durante la implementación?',
        category: 'operational',
        difficulty: 'medium',
        expected_elements: ['Plan de continuidad', 'Mitigación de riesgos', 'Soporte durante transición']
      },
      {
        questioner: 'Ing. María Fernández',
        question: '¿Qué tan preciso será el nuevo sistema de control de inventarios comparado con el actual?',
        category: 'technical',
        difficulty: 'medium',
        expected_elements: ['Especificaciones técnicas', 'Comparativo de precisión', 'Beneficios cuantificables']
      },
      {
        questioner: 'Lic. Carlos Mendoza',
        question: '¿Qué compatibilidad tendrá con nuestros sistemas existentes?',
        category: 'technical',
        difficulty: 'high',
        expected_elements: ['Análisis de compatibilidad', 'Plan de integración', 'Riesgos técnicos']
      },
      {
        questioner: 'Mtra. Laura Gutiérrez',
        question: '¿Cómo manejaremos la resistencia al cambio del personal?',
        category: 'change_management',
        difficulty: 'medium',
        expected_elements: ['Plan de gestión del cambio', 'Estrategias de comunicación', 'Programa de capacitación']
      }
    ]
  },

  presentation_department_heads: {
    id: 'presentation_department_heads',
    type: 'presentation',
    title: 'Presentación a Jefes de Departamento',
    element: 'E0877',
    difficulty: 'beginner',
    estimatedDuration: 25,
    description: 'Presentación operacional ante jefes de departamento y supervisores',
    scenario: {
      company: 'Manufactura Integral S.A.',
      audience: 'Jefes de departamento (4 personas)',
      context: 'Propuesta para mejorar procesos de producción y reducir desperdicios',
      budget_range: '$75,000 - $100,000 USD',
      timeline: '4 meses de implementación',
      strategic_importance: 'Media - mejora de eficiencia operacional'
    },
    audience: [
      {
        name: 'Ing. Roberto Silva',
        position: 'Jefe de Producción',
        personality: 'Pragmático, enfocado en resultados',
        concerns: ['Continuidad de producción', 'Tiempos de implementación', 'Capacitación de operadores']
      },
      {
        name: 'Lic. Carmen López',
        position: 'Jefe de Control de Calidad',
        personality: 'Detallista, enfocada en procesos',
        concerns: ['Estándares de calidad', 'Procedimientos de control', 'Documentación']
      },
      {
        name: 'Tec. Miguel Hernández',
        position: 'Jefe de Mantenimiento',
        personality: 'Práctico, preocupado por la operación',
        concerns: ['Impacto en equipos', 'Mantenimiento preventivo', 'Disponibilidad de maquinaria']
      },
      {
        name: 'Lic. Ana Rodríguez',
        position: 'Jefe de Almacén',
        personality: 'Organizada, enfocada en logística',
        concerns: ['Flujo de materiales', 'Control de inventarios', 'Espacios de almacenamiento']
      }
    ],
    evaluationCriteria: [
      {
        id: 'proposal_description',
        title: 'Describir la propuesta sugerida',
        weight: 15,
        description: 'Explicar claramente qué se propone implementar'
      },
      {
        id: 'scope_mention',
        title: 'Mencionar el alcance',
        weight: 12,
        description: 'Definir qué está incluido y qué no en la propuesta'
      },
      {
        id: 'advantages_disadvantages',
        title: 'Exponer las ventajas y desventajas',
        weight: 12,
        description: 'Presentar un análisis balanceado de pros y contras'
      },
      {
        id: 'responsibilities',
        title: 'Mencionar los responsables de parte del consultante y consultor',
        weight: 12,
        description: 'Clarificar roles y responsabilidades de ambas partes'
      },
      {
        id: 'implementation_stages',
        title: 'Mencionar las etapas de la instalación',
        weight: 12,
        description: 'Describir las fases del proyecto de implementación'
      },
      {
        id: 'deliverables',
        title: 'Mencionar los entregables de cada etapa',
        weight: 11,
        description: 'Especificar qué se entregará en cada fase'
      },
      {
        id: 'implications',
        title: 'Mencionar las implicaciones de la implantación',
        weight: 11,
        description: 'Explicar el impacto organizacional de la implementación'
      },
      {
        id: 'resources',
        title: 'Describir los recursos a emplear',
        weight: 11,
        description: 'Detallar recursos humanos, técnicos y materiales necesarios'
      },
      {
        id: 'questions_response',
        title: 'Responder las preguntas o dudas expresadas',
        weight: 14,
        description: 'Manejar preguntas y objeciones de manera profesional'
      }
    ],
    presentation_flow: [
      {
        stage: 'opening',
        duration: 3,
        objectives: ['Presentarse', 'Conectar con la audiencia', 'Establecer agenda'],
        key_points: ['Saludo informal pero profesional', 'Presentación breve', 'Agenda práctica']
      },
      {
        stage: 'problem_review',
        duration: 5,
        objectives: ['Revisar problemas identificados', 'Validar con la audiencia'],
        key_points: ['Problemas operacionales', 'Impacto en cada departamento', 'Necesidades específicas']
      },
      {
        stage: 'solution_presentation',
        duration: 10,
        objectives: ['Presentar solución práctica', 'Mostrar beneficios operacionales'],
        key_points: ['Solución propuesta', 'Beneficios por departamento', 'Mejoras operacionales']
      },
      {
        stage: 'implementation_plan',
        duration: 5,
        objectives: ['Explicar implementación práctica', 'Definir colaboración'],
        key_points: ['Plan de trabajo', 'Cronograma realista', 'Responsabilidades específicas']
      },
      {
        stage: 'qa_commitment',
        duration: 2,
        objectives: ['Resolver dudas operacionales', 'Obtener compromiso'],
        key_points: ['Preguntas técnicas', 'Compromisos mutuos', 'Próximos pasos']
      }
    ],
    potential_questions: [
      {
        questioner: 'Ing. Roberto Silva',
        question: '¿Cuánto tiempo tendremos que parar la producción para la implementación?',
        category: 'operational',
        difficulty: 'high',
        expected_elements: ['Plan de continuidad', 'Paros mínimos', 'Implementación por fases']
      },
      {
        questioner: 'Lic. Carmen López',
        question: '¿Cómo garantizamos que la calidad no se vea afectada durante el cambio?',
        category: 'quality',
        difficulty: 'medium',
        expected_elements: ['Controles de calidad', 'Procedimientos de transición', 'Monitoreo continuo']
      },
      {
        questioner: 'Tec. Miguel Hernández',
        question: '¿Qué modificaciones necesitaremos hacer a los equipos actuales?',
        category: 'technical',
        difficulty: 'medium',
        expected_elements: ['Análisis de equipos', 'Modificaciones necesarias', 'Costos adicionales']
      },
      {
        questioner: 'Lic. Ana Rodríguez',
        question: '¿Cómo afectará esto al flujo de materiales que ya tenemos establecido?',
        category: 'logistics',
        difficulty: 'medium',
        expected_elements: ['Análisis de flujo', 'Mejoras logísticas', 'Plan de transición']
      }
    ]
  }
};

export default presentationScenarios;