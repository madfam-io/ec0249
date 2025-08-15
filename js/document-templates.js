// EC0249 Document Template System
class DocumentTemplateSystem {
  constructor(app) {
    this.app = app;
    this.templates = this.initializeTemplates();
    this.currentDocument = null;
    this.userDocuments = {};
  }

  initializeTemplates() {
    return {
      // Element 1 Templates (8 documents)
      elemento1_documento_problema: {
        id: 'elemento1_documento_problema',
        title: 'Documento que describe el problema planteado',
        element: 1,
        description: 'Documento principal que describe el problema identificado, su alcance e impacto',
        criteria: [
          'Incluye la afectación de la situación actual',
          'Establece el alcance',
          'Incluye la integración de la información obtenida',
          'Contiene la interpretación del problema y sus afectaciones'
        ],
        template: {
          sections: [
            {
              id: 'resumen_ejecutivo',
              title: 'Resumen Ejecutivo',
              required: true,
              type: 'textarea',
              placeholder: 'Breve descripción del problema identificado...',
              guidance: 'Resumen conciso del problema principal en máximo 200 palabras'
            },
            {
              id: 'descripcion_problema',
              title: 'Descripción Detallada del Problema',
              required: true,
              type: 'textarea',
              placeholder: 'Descripción completa del problema...',
              guidance: 'Descripción exhaustiva incluyendo contexto, síntomas y manifestaciones'
            },
            {
              id: 'alcance',
              title: 'Alcance del Problema',
              required: true,
              type: 'textarea',
              placeholder: 'Definición del alcance y límites...',
              guidance: 'Especificar áreas, procesos y personas afectadas'
            },
            {
              id: 'afectacion_actual',
              title: 'Afectación de la Situación Actual',
              required: true,
              type: 'textarea',
              placeholder: 'Impactos identificados...',
              guidance: 'Describir impactos cuantitativos y cualitativos'
            },
            {
              id: 'integracion_informacion',
              title: 'Integración de la Información',
              required: true,
              type: 'textarea',
              placeholder: 'Síntesis de toda la información recopilada...',
              guidance: 'Consolidación coherente de toda la información obtenida'
            },
            {
              id: 'interpretacion',
              title: 'Interpretación y Análisis',
              required: true,
              type: 'textarea',
              placeholder: 'Interpretación profesional del problema...',
              guidance: 'Análisis profesional basado en evidencia recopilada'
            }
          ]
        }
      },

      elemento1_afectacion_detectada: {
        id: 'elemento1_afectacion_detectada',
        title: 'Afectación detectada de la situación actual',
        element: 1,
        description: 'Documento que detalla específicamente las afectaciones encontradas',
        criteria: [
          'Es congruente con la integración de la información'
        ],
        template: {
          sections: [
            {
              id: 'afectaciones_identificadas',
              title: 'Afectaciones Identificadas',
              required: true,
              type: 'repeatable',
              fields: [
                {
                  name: 'area_afectada',
                  title: 'Área Afectada',
                  type: 'text',
                  required: true
                },
                {
                  name: 'tipo_afectacion',
                  title: 'Tipo de Afectación',
                  type: 'select',
                  options: ['Operacional', 'Financiera', 'Humana', 'Tecnológica', 'Estratégica'],
                  required: true
                },
                {
                  name: 'descripcion_afectacion',
                  title: 'Descripción de la Afectación',
                  type: 'textarea',
                  required: true
                },
                {
                  name: 'nivel_impacto',
                  title: 'Nivel de Impacto',
                  type: 'select',
                  options: ['Alto', 'Medio', 'Bajo'],
                  required: true
                },
                {
                  name: 'evidencia_soporte',
                  title: 'Evidencia de Soporte',
                  type: 'textarea',
                  required: true
                }
              ]
            }
          ]
        }
      },

      elemento1_metodologia: {
        id: 'elemento1_metodologia',
        title: 'Reporte de metodología empleada',
        element: 1,
        description: 'Documento que describe la metodología utilizada para identificar el problema',
        criteria: [
          'Incluye la definición de la situación y/o problema',
          'Incluye el establecimiento de un programa de entrevistas',
          'Incluye la identificación de las áreas involucradas',
          'Incluye el establecimiento de los estudios/pruebas a realizar',
          'Incluye el establecimiento de los requerimientos de información',
          'Incluye el establecimiento de un programa de observaciones de campo',
          'Incluye la búsqueda de información documental',
          'Contiene la forma en que evalúa la información obtenida'
        ],
        template: {
          sections: [
            {
              id: 'definicion_problema',
              title: '1. Definición de la Situación/Problema',
              required: true,
              type: 'textarea',
              guidance: 'Definición inicial clara y precisa del problema a investigar'
            },
            {
              id: 'programa_entrevistas',
              title: '2. Programa de Entrevistas',
              required: true,
              type: 'complex',
              fields: [
                {
                  name: 'personas_entrevistar',
                  title: 'Personas a Entrevistar',
                  type: 'textarea'
                },
                {
                  name: 'cronograma_entrevistas',
                  title: 'Cronograma de Entrevistas',
                  type: 'textarea'
                },
                {
                  name: 'duracion_estimada',
                  title: 'Duración Estimada por Entrevista',
                  type: 'text'
                }
              ]
            },
            {
              id: 'areas_involucradas',
              title: '3. Áreas Involucradas',
              required: true,
              type: 'textarea',
              guidance: 'Identificación de todas las áreas organizacionales afectadas'
            },
            {
              id: 'estudios_pruebas',
              title: '4. Estudios/Pruebas a Realizar',
              required: true,
              type: 'textarea',
              guidance: 'Descripción de estudios técnicos o pruebas necesarias'
            },
            {
              id: 'requerimientos_informacion',
              title: '5. Requerimientos de Información',
              required: true,
              type: 'textarea',
              guidance: 'Especificación de información necesaria para el análisis'
            },
            {
              id: 'programa_observaciones',
              title: '6. Programa de Observaciones de Campo',
              required: true,
              type: 'complex',
              fields: [
                {
                  name: 'lugares_observar',
                  title: 'Lugares a Observar',
                  type: 'textarea'
                },
                {
                  name: 'actividades_observar',
                  title: 'Actividades a Observar',
                  type: 'textarea'
                },
                {
                  name: 'horarios_observacion',
                  title: 'Horarios de Observación',
                  type: 'textarea'
                }
              ]
            },
            {
              id: 'busqueda_documental',
              title: '7. Búsqueda de Información Documental',
              required: true,
              type: 'textarea',
              guidance: 'Plan para recopilar información documental relevante'
            },
            {
              id: 'evaluacion_informacion',
              title: '8. Evaluación de la Información',
              required: true,
              type: 'textarea',
              guidance: 'Metodología para evaluar y validar la información obtenida'
            }
          ]
        }
      },

      elemento1_guia_entrevista: {
        id: 'elemento1_guia_entrevista',
        title: 'Guía de entrevista empleada',
        element: 1,
        description: 'Instrumento estructurado para conducir entrevistas efectivas',
        criteria: [
          'Contiene el propósito de la entrevista',
          'Establece la solicitud de la descripción de actividades y responsabilidades',
          'Describe la información/documentación que se va a solicitar',
          'Incluye el cierre de la entrevista'
        ],
        template: {
          sections: [
            {
              id: 'proposito_entrevista',
              title: 'Propósito de la Entrevista',
              required: true,
              type: 'textarea',
              guidance: 'Explicación clara del objetivo de la entrevista'
            },
            {
              id: 'apertura_entrevista',
              title: 'Apertura de la Entrevista',
              required: true,
              type: 'textarea',
              placeholder: 'Buenos días, mi nombre es... El propósito de esta entrevista es...',
              guidance: 'Script para iniciar la entrevista profesionalmente'
            },
            {
              id: 'preguntas_actividades',
              title: 'Preguntas sobre Actividades y Responsabilidades',
              required: true,
              type: 'repeatable',
              fields: [
                {
                  name: 'pregunta',
                  title: 'Pregunta',
                  type: 'textarea',
                  required: true
                },
                {
                  name: 'objetivo',
                  title: 'Objetivo de la Pregunta',
                  type: 'text',
                  required: true
                }
              ]
            },
            {
              id: 'informacion_solicitar',
              title: 'Información/Documentación a Solicitar',
              required: true,
              type: 'textarea',
              guidance: 'Lista específica de documentos e información a solicitar'
            },
            {
              id: 'cierre_entrevista',
              title: 'Cierre de la Entrevista',
              required: true,
              type: 'textarea',
              placeholder: 'Agradezco su tiempo y colaboración...',
              guidance: 'Script para cerrar la entrevista apropiadamente'
            }
          ]
        }
      },

      elemento1_cuestionario: {
        id: 'elemento1_cuestionario',
        title: 'Cuestionario elaborado',
        element: 1,
        description: 'Instrumento de recopilación de datos estructurado',
        criteria: [
          'Incluye la explicación del propósito del cuestionario',
          'Incluye espacio para los datos generales',
          'Menciona la confidencialidad de la información',
          'Contiene las instrucciones sobre la forma de llenado',
          'Establece preguntas relacionadas con la información buscada',
          'Especifica la documentación de soporte',
          'Contiene un espacio para comentarios finales',
          'Contiene frases de agradecimiento'
        ],
        template: {
          sections: [
            {
              id: 'encabezado',
              title: 'Encabezado del Cuestionario',
              required: true,
              type: 'complex',
              fields: [
                {
                  name: 'titulo',
                  title: 'Título del Cuestionario',
                  type: 'text',
                  required: true
                },
                {
                  name: 'proposito',
                  title: 'Propósito del Cuestionario',
                  type: 'textarea',
                  required: true
                }
              ]
            },
            {
              id: 'datos_generales',
              title: 'Sección de Datos Generales',
              required: true,
              type: 'complex',
              fields: [
                {
                  name: 'campos_datos',
                  title: 'Campos de Datos a Recopilar',
                  type: 'textarea',
                  placeholder: 'Nombre, Puesto, Área, Antigüedad, etc.',
                  required: true
                }
              ]
            },
            {
              id: 'confidencialidad',
              title: 'Declaración de Confidencialidad',
              required: true,
              type: 'textarea',
              placeholder: 'La información proporcionada será tratada de manera confidencial...',
              guidance: 'Declaración sobre el manejo confidencial de la información'
            },
            {
              id: 'instrucciones',
              title: 'Instrucciones de Llenado',
              required: true,
              type: 'textarea',
              guidance: 'Instrucciones claras sobre cómo completar el cuestionario'
            },
            {
              id: 'preguntas',
              title: 'Preguntas del Cuestionario',
              required: true,
              type: 'repeatable',
              fields: [
                {
                  name: 'pregunta',
                  title: 'Pregunta',
                  type: 'textarea',
                  required: true
                },
                {
                  name: 'tipo_pregunta',
                  title: 'Tipo de Pregunta',
                  type: 'select',
                  options: ['Abierta', 'Cerrada', 'Escala', 'Múltiple'],
                  required: true
                },
                {
                  name: 'objetivo',
                  title: 'Objetivo de la Pregunta',
                  type: 'text',
                  required: true
                }
              ]
            },
            {
              id: 'documentacion_soporte',
              title: 'Documentación de Soporte',
              required: true,
              type: 'textarea',
              guidance: 'Documentos que el respondiente debe adjuntar o consultar'
            },
            {
              id: 'comentarios_finales',
              title: 'Espacio para Comentarios Finales',
              required: true,
              type: 'textarea',
              placeholder: 'Espacio destinado para comentarios adicionales del respondiente',
              guidance: 'Sección para comentarios libres del respondiente'
            },
            {
              id: 'agradecimiento',
              title: 'Mensaje de Agradecimiento',
              required: true,
              type: 'textarea',
              placeholder: 'Agradecemos su tiempo y colaboración...',
              guidance: 'Mensaje final de agradecimiento al respondiente'
            }
          ]
        }
      },

      // Element 2 Templates (2 documents)
      elemento2_reporte_afectaciones: {
        id: 'elemento2_reporte_afectaciones',
        title: 'Reporte de las afectaciones encontradas',
        element: 2,
        description: 'Análisis detallado de las afectaciones identificadas en la organización',
        criteria: [
          'Describe la metodología aplicada',
          'Define las afectaciones encontradas',
          'Incluye la definición detallada de la situación a resolver'
        ],
        template: {
          sections: [
            {
              id: 'metodologia_aplicada',
              title: 'Metodología Aplicada',
              required: true,
              type: 'textarea',
              guidance: 'Descripción de la metodología utilizada para identificar afectaciones'
            },
            {
              id: 'afectaciones_encontradas',
              title: 'Afectaciones Encontradas',
              required: true,
              type: 'repeatable',
              fields: [
                {
                  name: 'afectacion',
                  title: 'Afectación',
                  type: 'textarea',
                  required: true
                },
                {
                  name: 'evidencia',
                  title: 'Evidencia',
                  type: 'textarea',
                  required: true
                },
                {
                  name: 'impacto',
                  title: 'Nivel de Impacto',
                  type: 'select',
                  options: ['Alto', 'Medio', 'Bajo'],
                  required: true
                }
              ]
            },
            {
              id: 'situacion_resolver',
              title: 'Definición Detallada de la Situación a Resolver',
              required: true,
              type: 'textarea',
              guidance: 'Definición precisa y detallada de lo que debe resolverse'
            }
          ]
        }
      },

      elemento2_solucion_disenada: {
        id: 'elemento2_solucion_disenada',
        title: 'Solución diseñada',
        element: 2,
        description: 'Propuesta de solución integral con análisis de beneficios y costos',
        criteria: [
          'Es congruente con la situación a resolver',
          'Menciona los beneficios de la solución',
          'Menciona las desventajas de la solución',
          'Cuenta con una justificación detallada',
          'Incluye las implicaciones de costo/beneficio'
        ],
        template: {
          sections: [
            {
              id: 'descripcion_solucion',
              title: 'Descripción de la Solución',
              required: true,
              type: 'textarea',
              guidance: 'Descripción completa y detallada de la solución propuesta'
            },
            {
              id: 'congruencia',
              title: 'Congruencia con la Situación',
              required: true,
              type: 'textarea',
              guidance: 'Explicación de cómo la solución aborda específicamente el problema identificado'
            },
            {
              id: 'beneficios',
              title: 'Beneficios de la Solución',
              required: true,
              type: 'repeatable',
              fields: [
                {
                  name: 'beneficio',
                  title: 'Beneficio',
                  type: 'textarea',
                  required: true
                },
                {
                  name: 'tipo_beneficio',
                  title: 'Tipo de Beneficio',
                  type: 'select',
                  options: ['Económico', 'Operacional', 'Estratégico', 'Social'],
                  required: true
                }
              ]
            },
            {
              id: 'desventajas',
              title: 'Desventajas de la Solución',
              required: true,
              type: 'repeatable',
              fields: [
                {
                  name: 'desventaja',
                  title: 'Desventaja',
                  type: 'textarea',
                  required: true
                },
                {
                  name: 'mitigacion',
                  title: 'Plan de Mitigación',
                  type: 'textarea',
                  required: false
                }
              ]
            },
            {
              id: 'justificacion',
              title: 'Justificación Detallada',
              required: true,
              type: 'textarea',
              guidance: 'Justificación técnica y económica de la solución propuesta'
            },
            {
              id: 'analisis_costo_beneficio',
              title: 'Análisis Costo/Beneficio',
              required: true,
              type: 'complex',
              fields: [
                {
                  name: 'costos_implementacion',
                  title: 'Costos de Implementación',
                  type: 'textarea',
                  required: true
                },
                {
                  name: 'beneficios_cuantificables',
                  title: 'Beneficios Cuantificables',
                  type: 'textarea',
                  required: true
                },
                {
                  name: 'roi_estimado',
                  title: 'ROI Estimado',
                  type: 'text',
                  required: false
                },
                {
                  name: 'periodo_recuperacion',
                  title: 'Período de Recuperación',
                  type: 'text',
                  required: false
                }
              ]
            }
          ]
        }
      },

      // Element 3 Templates (5 documents) - Abbreviated for space
      elemento3_propuesta_trabajo: {
        id: 'elemento3_propuesta_trabajo',
        title: 'Propuesta de trabajo elaborada',
        element: 3,
        description: 'Propuesta integral de servicios de consultoría',
        criteria: [
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
        template: {
          sections: [
            {
              id: 'antecedentes',
              title: 'Antecedentes y Diagnóstico',
              required: true,
              type: 'textarea'
            },
            {
              id: 'sintesis_proyecto',
              title: 'Síntesis Descriptiva del Proyecto',
              required: true,
              type: 'textarea'
            },
            {
              id: 'alcance_proyecto',
              title: 'Alcance del Proyecto',
              required: true,
              type: 'textarea'
            }
            // ... más secciones
          ]
        }
      }
    };
  }

  getTemplate(templateId) {
    return this.templates[templateId];
  }

  openTemplate(templateId) {
    const template = this.getTemplate(templateId);
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return;
    }

    this.currentDocument = {
      templateId: templateId,
      data: {},
      lastModified: new Date()
    };

    this.renderTemplateEditor(template);
  }

  renderTemplateEditor(template) {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
      <div class="document-editor">
        <div class="editor-header">
          <button class="btn btn-secondary" onclick="history.back()">← Volver</button>
          <h1>📝 ${template.title}</h1>
          <div class="editor-actions">
            <button class="btn btn-secondary" onclick="ec0249App.documentSystem.saveDocument()">💾 Guardar</button>
            <button class="btn btn-secondary" onclick="ec0249App.documentSystem.previewDocument()">👁️ Vista Previa</button>
            <button class="btn btn-primary" onclick="ec0249App.documentSystem.exportDocument()">📄 Exportar PDF</button>
          </div>
        </div>

        <div class="editor-sidebar">
          <div class="template-info">
            <h3>Información del Documento</h3>
            <p><strong>Elemento:</strong> ${template.element}</p>
            <p><strong>Descripción:</strong> ${template.description}</p>
            
            <h4>Criterios de Evaluación:</h4>
            <ul class="criteria-list">
              ${template.criteria.map(criterion => `<li>${criterion}</li>`).join('')}
            </ul>
          </div>
          
          <div class="template-progress">
            <h4>Progreso del Documento</h4>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%" id="documentProgress"></div>
            </div>
            <p><span id="progressText">0%</span> completado</p>
          </div>
        </div>

        <div class="editor-content">
          <form id="documentForm" class="document-form">
            ${this.renderTemplateSections(template.template.sections)}
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="ec0249App.documentSystem.saveDraft()">
                Guardar Borrador
              </button>
              <button type="button" class="btn btn-success" onclick="ec0249App.documentSystem.finalizeDocument()">
                Finalizar Documento
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.setupFormHandlers();
  }

  renderTemplateSections(sections) {
    return sections.map(section => {
      switch(section.type) {
        case 'textarea':
          return this.renderTextareaSection(section);
        case 'complex':
          return this.renderComplexSection(section);
        case 'repeatable':
          return this.renderRepeatableSection(section);
        default:
          return this.renderTextSection(section);
      }
    }).join('');
  }

  renderTextareaSection(section) {
    return `
      <div class="form-section" data-section="${section.id}">
        <label class="section-label ${section.required ? 'required' : ''}">
          ${section.title}
          ${section.required ? '<span class="required-mark">*</span>' : ''}
        </label>
        ${section.guidance ? `<p class="guidance">${section.guidance}</p>` : ''}
        <textarea 
          id="${section.id}" 
          name="${section.id}"
          placeholder="${section.placeholder || ''}"
          ${section.required ? 'required' : ''}
          rows="6"
          class="form-textarea"
        ></textarea>
        <div class="character-count">
          <span class="count">0</span> caracteres
        </div>
      </div>
    `;
  }

  renderComplexSection(section) {
    return `
      <div class="form-section complex-section" data-section="${section.id}">
        <h3 class="section-title ${section.required ? 'required' : ''}">
          ${section.title}
          ${section.required ? '<span class="required-mark">*</span>' : ''}
        </h3>
        ${section.guidance ? `<p class="guidance">${section.guidance}</p>` : ''}
        <div class="complex-fields">
          ${section.fields.map(field => this.renderField(field, section.id)).join('')}
        </div>
      </div>
    `;
  }

  renderRepeatableSection(section) {
    return `
      <div class="form-section repeatable-section" data-section="${section.id}">
        <div class="section-header">
          <h3 class="section-title ${section.required ? 'required' : ''}">
            ${section.title}
            ${section.required ? '<span class="required-mark">*</span>' : ''}
          </h3>
          <button type="button" class="btn btn-sm btn-primary" onclick="ec0249App.documentSystem.addRepeatableItem('${section.id}')">
            + Agregar Elemento
          </button>
        </div>
        ${section.guidance ? `<p class="guidance">${section.guidance}</p>` : ''}
        <div class="repeatable-items" id="${section.id}_items">
          <!-- Repeatable items will be added here -->
        </div>
      </div>
    `;
  }

  renderField(field, parentId) {
    const fieldId = `${parentId}_${field.name}`;
    
    switch(field.type) {
      case 'textarea':
        return `
          <div class="field-group">
            <label for="${fieldId}" class="${field.required ? 'required' : ''}">${field.title}</label>
            <textarea id="${fieldId}" name="${fieldId}" ${field.required ? 'required' : ''} rows="4"></textarea>
          </div>
        `;
      case 'select':
        return `
          <div class="field-group">
            <label for="${fieldId}" class="${field.required ? 'required' : ''}">${field.title}</label>
            <select id="${fieldId}" name="${fieldId}" ${field.required ? 'required' : ''}>
              <option value="">Seleccionar...</option>
              ${field.options.map(option => `<option value="${option}">${option}</option>`).join('')}
            </select>
          </div>
        `;
      default:
        return `
          <div class="field-group">
            <label for="${fieldId}" class="${field.required ? 'required' : ''}">${field.title}</label>
            <input type="text" id="${fieldId}" name="${fieldId}" ${field.required ? 'required' : ''} />
          </div>
        `;
    }
  }

  setupFormHandlers() {
    // Auto-save functionality
    const form = document.getElementById('documentForm');
    if (form) {
      form.addEventListener('input', this.debounce(() => {
        this.updateProgress();
        this.autoSave();
      }, 1000));
    }

    // Character counting for textareas
    document.querySelectorAll('.form-textarea').forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        const counter = e.target.parentNode.querySelector('.character-count .count');
        if (counter) {
          counter.textContent = e.target.value.length;
        }
      });
    });
  }

  addRepeatableItem(sectionId) {
    const template = this.templates[this.currentDocument.templateId];
    const section = template.template.sections.find(s => s.id === sectionId);
    if (!section) return;

    const container = document.getElementById(`${sectionId}_items`);
    const itemIndex = container.children.length;
    
    const itemHtml = `
      <div class="repeatable-item" data-index="${itemIndex}">
        <div class="item-header">
          <h4>Elemento ${itemIndex + 1}</h4>
          <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.repeatable-item').remove()">
            Eliminar
          </button>
        </div>
        <div class="item-fields">
          ${section.fields.map(field => this.renderField({
            ...field,
            name: `${field.name}_${itemIndex}`
          }, sectionId)).join('')}
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHtml);
  }

  updateProgress() {
    const form = document.getElementById('documentForm');
    if (!form) return;

    const requiredFields = form.querySelectorAll('[required]');
    const completedFields = Array.from(requiredFields).filter(field => {
      return field.value.trim() !== '';
    });

    const progress = Math.round((completedFields.length / requiredFields.length) * 100);
    
    const progressBar = document.getElementById('documentProgress');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${progress}%`;
  }

  autoSave() {
    if (this.currentDocument) {
      const formData = new FormData(document.getElementById('documentForm'));
      const data = {};
      
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      this.currentDocument.data = data;
      this.currentDocument.lastModified = new Date();
      
      // Save to localStorage
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    const documentsKey = `ec0249_documents_${this.app.userId || 'anonymous'}`;
    let savedDocuments = JSON.parse(localStorage.getItem(documentsKey) || '{}');
    
    if (this.currentDocument) {
      savedDocuments[this.currentDocument.templateId] = this.currentDocument;
      localStorage.setItem(documentsKey, JSON.stringify(savedDocuments));
    }
  }

  saveDocument() {
    this.autoSave();
    this.app.showNotification('Documento guardado exitosamente', 'success');
  }

  previewDocument() {
    // Generate preview of the document
    console.log('Generating document preview...');
  }

  exportDocument() {
    // Export document as PDF
    console.log('Exporting document as PDF...');
    this.app.showNotification('Funcionalidad de exportación en desarrollo', 'info');
  }

  finalizeDocument() {
    const progress = this.calculateProgress();
    if (progress < 100) {
      this.app.showNotification('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    this.autoSave();
    this.currentDocument.status = 'completed';
    this.currentDocument.completedDate = new Date();
    this.saveToLocalStorage();
    
    this.app.showNotification('Documento finalizado exitosamente', 'success');
  }

  calculateProgress() {
    const form = document.getElementById('documentForm');
    if (!form) return 0;

    const requiredFields = form.querySelectorAll('[required]');
    const completedFields = Array.from(requiredFields).filter(field => {
      return field.value.trim() !== '';
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.ec0249App) {
    window.ec0249App.documentSystem = new DocumentTemplateSystem(window.ec0249App);
  }
});