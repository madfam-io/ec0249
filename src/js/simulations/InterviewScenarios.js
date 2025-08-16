/**
 * Interview Scenarios - EC0249 Element 1 (E0875)
 * Realistic interview scenarios for practicing problem identification skills
 */

export const interviewScenarios = {
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
    },
    objectives: [
      'Entender los procesos logísticos actuales',
      'Identificar cuellos de botella en la operación',
      'Recopilar datos sobre tiempos de entrega',
      'Evaluar capacidad y carga de trabajo del equipo'
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
        client_response: 'Hola, bienvenido. Soy María Elena Vásquez, Gerente de Operaciones. El Director me comentó que vendrían a ayudarnos con los problemas de entregas. Tengo tiempo suficiente para platicarle todo con detalle.',
        response_options: [
          'Buenos días Lic. Vásquez, soy [nombre], consultor especializado en procesos operacionales...',
          'Gracias. Sí, vengo a ver qué pasa con las entregas retrasadas...',
          'Perfecto, necesito que me explique todos los problemas que tienen...'
        ],
        correct_approach: 0,
        feedback: {
          correct: 'Excelente presentación profesional. Ha establecido credibilidad desde el inicio.',
          incorrect: 'La presentación debe ser más profesional y establecer credibilidad inmediatamente.'
        }
      },
      {
        trigger: 'after_introduction',
        client_response: 'El problema es complejo. Hemos crecido de 80 a 150 empleados en dos años, pero seguimos usando los mismos procesos. Los clientes se quejan constantemente de retrasos.',
        response_options: [
          'Entiendo la situación. ¿Podría proporcionarme datos específicos sobre los tiempos de entrega actuales versus los prometidos?',
          'Ya veo. ¿Cuántos clientes se han quejado?',
          'Crecimiento rápido siempre trae problemas. ¿Qué han intentado hacer?'
        ],
        correct_approach: 0,
        feedback: {
          correct: 'Excelente solicitud de datos específicos para cuantificar el problema.',
          incorrect: 'Es importante solicitar datos específicos y cuantificables sobre el problema.'
        }
      },
      {
        trigger: 'information_gathering',
        client_response: 'Tengo reportes detallados de entregas de los últimos 6 meses, incluyendo tiempos prometidos vs reales. También tengo las quejas documentadas de clientes y métricas de desempeño por zona.',
        response_options: [
          '¿Podría proporcionarme esos reportes y datos por escrito para analizarlos detalladamente?',
          'Perfecto. ¿Cuáles son las zonas más problemáticas?',
          'Excelente. ¿También tienen datos de productividad del personal?'
        ],
        correct_approach: 0,
        feedback: {
          correct: 'Perfecto. Ha solicitado evidencia documental que respalde la información.',
          incorrect: 'Es crucial solicitar documentación escrita que respalde las afirmaciones.'
        }
      }
    ]
  },

  interview_hr_manager: {
    id: 'interview_hr_manager',
    type: 'interview',
    title: 'Entrevista con Gerente de Recursos Humanos',
    element: 'E0875',
    difficulty: 'intermediate',
    estimatedDuration: 35,
    description: 'Entrevista para identificar problemas relacionados con el capital humano y cultura organizacional',
    scenario: {
      company: 'Tecnologías Avanzadas S.A.',
      industry: 'Desarrollo de software',
      size: '120 empleados',
      problem: 'Alta rotación de personal (35% anual) y problemas de clima organizacional',
      context: 'Empresa tecnológica en crecimiento con desafíos en retención de talento y satisfacción laboral.'
    },
    client: {
      name: 'Lic. Ana Patricia Herrera',
      position: 'Gerente de Recursos Humanos',
      personality: 'Empática, analítica, preocupada por el bienestar del personal',
      experience: '12 años en recursos humanos, 3 en la empresa',
      concerns: ['Retención de talento', 'Clima organizacional', 'Desarrollo profesional', 'Compensaciones'],
      availability: 'Flexible, puede extender la reunión si es necesario',
      communication_style: 'Detallada, gusta proporcionar contexto',
      expectations: 'Soluciones integrales que consideren el aspecto humano'
    },
    objectives: [
      'Identificar causas de la alta rotación',
      'Evaluar clima organizacional actual',
      'Analizar procesos de reclutamiento y retención',
      'Revisar políticas de desarrollo y compensación'
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
        client_response: 'Buenos días. Soy Ana Patricia Herrera, Gerente de RH. Me da mucho gusto que estén aquí porque realmente necesitamos ayuda. La situación con nuestro personal se está volviendo crítica.',
        response_options: [
          'Buenos días Lic. Herrera, soy [nombre], consultor especializado en gestión del talento humano...',
          'Gracias. Sí, me han comentado sobre los problemas de rotación...',
          'Hola, vengo a revisar qué está pasando con sus empleados...'
        ],
        correct_approach: 0,
        feedback: {
          correct: 'Excelente presentación profesional especializada en el área.',
          incorrect: 'La presentación debe ser más profesional y establecer credibilidad en el tema.'
        }
      },
      {
        trigger: 'after_introduction',
        client_response: 'El problema principal es que tenemos una rotación del 35% anual, muy por encima del promedio de la industria que es del 18%. Los empleados se van principalmente por falta de oportunidades de crecimiento y problemas con algunos supervisores.',
        response_options: [
          'Entiendo la gravedad del problema. ¿Podría proporcionarme los datos detallados de rotación por departamento y las razones específicas documentadas en las entrevistas de salida?',
          'Eso es muy alto. ¿En qué departamentos se concentra más la rotación?',
          '35% es crítico. ¿Ya han intentado algunas soluciones?'
        ],
        correct_approach: 0,
        feedback: {
          correct: 'Excelente solicitud de datos específicos y evidencia documental.',
          incorrect: 'Es importante solicitar datos detallados y documentación que respalde la información.'
        }
      }
    ]
  }
};

export default interviewScenarios;