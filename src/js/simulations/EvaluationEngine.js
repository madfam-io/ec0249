/**
 * Evaluation Engine - Handles performance evaluation for simulations
 * Provides scoring, feedback, and performance analysis for EC0249 simulations
 */

class EvaluationEngine {
  constructor() {
    this.evaluationCriteria = {
      interview: ['introduction', 'purpose_explanation', 'information_request', 'evidence_request', 'response_recording', 'closure'],
      presentation: ['proposal_description', 'scope_mention', 'advantages_disadvantages', 'responsibilities', 'implementation_stages', 'deliverables', 'implications', 'resources', 'questions_response', 'cost_benefit', 'methodological_order']
    };
  }

  /**
   * Evaluate simulation action
   */
  evaluateAction(action, simulation, session) {
    const evaluation = {
      actionId: action.id,
      timestamp: Date.now(),
      criteriaEvaluated: [],
      score: 0,
      feedback: '',
      recommendations: []
    };

    if (simulation.type === 'interview') {
      return this.evaluateInterviewAction(action, simulation, session, evaluation);
    } else if (simulation.type === 'presentation') {
      return this.evaluatePresentationAction(action, simulation, session, evaluation);
    }

    return evaluation;
  }

  /**
   * Evaluate interview action
   */
  evaluateInterviewAction(action, simulation, session, evaluation) {
    const { evaluationCriteria } = simulation;
    const currentStage = session.currentStage;

    // Find relevant criteria for current stage
    const relevantCriteria = evaluationCriteria.filter(criteria => 
      this.isInterviewCriteriaRelevant(criteria.id, currentStage, action)
    );

    let totalScore = 0;
    let totalWeight = 0;

    relevantCriteria.forEach(criteria => {
      const criteriaScore = this.evaluateInterviewCriteria(criteria, action, simulation);
      
      evaluation.criteriaEvaluated.push({
        id: criteria.id,
        title: criteria.title,
        weight: criteria.weight,
        score: criteriaScore,
        maxScore: 100,
        description: criteria.description
      });

      totalScore += criteriaScore * criteria.weight;
      totalWeight += criteria.weight;
    });

    // Calculate weighted average
    evaluation.score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    
    // Generate feedback
    evaluation.feedback = this.generateInterviewFeedback(evaluation, currentStage);
    
    // Generate recommendations
    evaluation.recommendations = this.generateInterviewRecommendations(evaluation);

    return evaluation;
  }

  /**
   * Evaluate presentation action
   */
  evaluatePresentationAction(action, simulation, session, evaluation) {
    const { evaluationCriteria, presentation_flow } = simulation;
    const currentStage = session.currentStage;

    // Find current presentation stage info
    const stageInfo = presentation_flow.find(stage => stage.stage === currentStage);
    
    // Find relevant criteria for current stage
    const relevantCriteria = evaluationCriteria.filter(criteria => 
      this.isPresentationCriteriaRelevant(criteria.id, currentStage, action, stageInfo)
    );

    let totalScore = 0;
    let totalWeight = 0;

    relevantCriteria.forEach(criteria => {
      const criteriaScore = this.evaluatePresentationCriteria(criteria, action, simulation, stageInfo);
      
      evaluation.criteriaEvaluated.push({
        id: criteria.id,
        title: criteria.title,
        weight: criteria.weight,
        score: criteriaScore,
        maxScore: 100,
        description: criteria.description
      });

      totalScore += criteriaScore * criteria.weight;
      totalWeight += criteria.weight;
    });

    // Calculate weighted average
    evaluation.score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    
    // Generate feedback
    evaluation.feedback = this.generatePresentationFeedback(evaluation, currentStage, stageInfo);
    
    // Generate recommendations
    evaluation.recommendations = this.generatePresentationRecommendations(evaluation, stageInfo);

    return evaluation;
  }

  /**
   * Check if interview criteria is relevant for current context
   */
  isInterviewCriteriaRelevant(criteriaId, stage, action) {
    const stageMapping = {
      'introduction': ['introduction'],
      'purpose_explanation': ['after_introduction', 'information_gathering'],
      'information_request': ['information_gathering', 'evidence_collection'],
      'evidence_request': ['evidence_collection', 'information_gathering'],
      'response_recording': ['information_gathering', 'evidence_collection', 'clarification'],
      'closure': ['closure', 'wrap_up']
    };

    return stageMapping[criteriaId]?.includes(stage) || 
           stageMapping[criteriaId]?.includes('general') ||
           action.type === 'complete_interview';
  }

  /**
   * Check if presentation criteria is relevant for current context
   */
  isPresentationCriteriaRelevant(criteriaId, stage, action, stageInfo) {
    const stageMapping = {
      'proposal_description': ['solution_proposal', 'opening'],
      'scope_mention': ['solution_proposal', 'implementation_plan'],
      'advantages_disadvantages': ['solution_proposal'],
      'responsibilities': ['implementation_plan'],
      'implementation_stages': ['implementation_plan'],
      'deliverables': ['implementation_plan'],
      'implications': ['solution_proposal', 'implementation_plan'],
      'resources': ['implementation_plan', 'investment_analysis'],
      'questions_response': ['qa_closure'],
      'cost_benefit': ['investment_analysis'],
      'methodological_order': ['opening', 'solution_proposal', 'implementation_plan', 'investment_analysis', 'qa_closure']
    };

    return stageMapping[criteriaId]?.includes(stage) || 
           action.type === 'complete_presentation';
  }

  /**
   * Evaluate specific interview criteria
   */
  evaluateInterviewCriteria(criteria, action, simulation) {
    const actionContent = action.data?.content?.toLowerCase() || '';
    const actionType = action.type;

    switch (criteria.id) {
      case 'introduction':
        return this.evaluateIntroduction(actionContent, actionType);
      case 'purpose_explanation':
        return this.evaluatePurposeExplanation(actionContent, actionType);
      case 'information_request':
        return this.evaluateInformationRequest(actionContent, actionType);
      case 'evidence_request':
        return this.evaluateEvidenceRequest(actionContent, actionType);
      case 'response_recording':
        return this.evaluateResponseRecording(actionContent, actionType);
      case 'closure':
        return this.evaluateClosure(actionContent, actionType);
      default:
        return 50; // Default neutral score
    }
  }

  /**
   * Evaluate specific presentation criteria
   */
  evaluatePresentationCriteria(criteria, action, simulation, stageInfo) {
    const actionContent = action.data?.content?.toLowerCase() || '';
    const actionType = action.type;

    switch (criteria.id) {
      case 'proposal_description':
        return this.evaluateProposalDescription(actionContent, actionType, stageInfo);
      case 'scope_mention':
        return this.evaluateScopeMention(actionContent, actionType, stageInfo);
      case 'advantages_disadvantages':
        return this.evaluateAdvantagesDisadvantages(actionContent, actionType);
      case 'responsibilities':
        return this.evaluateResponsibilities(actionContent, actionType);
      case 'implementation_stages':
        return this.evaluateImplementationStages(actionContent, actionType);
      case 'deliverables':
        return this.evaluateDeliverables(actionContent, actionType);
      case 'implications':
        return this.evaluateImplications(actionContent, actionType);
      case 'resources':
        return this.evaluateResources(actionContent, actionType);
      case 'questions_response':
        return this.evaluateQuestionsResponse(actionContent, actionType);
      case 'cost_benefit':
        return this.evaluateCostBenefit(actionContent, actionType);
      case 'methodological_order':
        return this.evaluateMethodologicalOrder(actionContent, actionType, stageInfo);
      default:
        return 50; // Default neutral score
    }
  }

  /**
   * Interview criteria evaluation methods
   */
  evaluateIntroduction(content, actionType) {
    const indicators = ['nombre', 'consultor', 'soy', 'me llamo', 'mi nombre'];
    const hasIntroduction = indicators.some(indicator => content.includes(indicator));
    return hasIntroduction ? 85 : 30;
  }

  evaluatePurposeExplanation(content, actionType) {
    const indicators = ['propósito', 'objetivo', 'razón', 'problema', 'datos', 'información'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 20 + 20);
  }

  evaluateInformationRequest(content, actionType) {
    const indicators = ['por escrito', 'documento', 'datos', 'información', 'proporcionar'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 25 + 25);
  }

  evaluateEvidenceRequest(content, actionType) {
    const indicators = ['evidencia', 'respaldo', 'documentación', 'soporte', 'comprobante'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 30 + 20);
  }

  evaluateResponseRecording(content, actionType) {
    if (actionType === 'take_notes' || actionType === 'record_response') {
      return 90;
    }
    const indicators = ['anotar', 'registrar', 'tomar nota', 'confirmar'];
    const hasRecording = indicators.some(indicator => content.includes(indicator));
    return hasRecording ? 80 : 40;
  }

  evaluateClosure(content, actionType) {
    const indicators = ['gracias', 'agradezco', 'tiempo', 'participación'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 30 + 40);
  }

  /**
   * Presentation criteria evaluation methods
   */
  evaluateProposalDescription(content, actionType, stageInfo) {
    const indicators = ['propuesta', 'solución', 'implementar', 'sistema', 'proyecto'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 25 + 25);
  }

  evaluateScopeMention(content, actionType, stageInfo) {
    const indicators = ['alcance', 'incluye', 'excluye', 'límites', 'cobertura'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 30 + 20);
  }

  evaluateAdvantagesDisadvantages(content, actionType) {
    const advantages = ['ventaja', 'beneficio', 'mejora', 'optimiza'];
    const disadvantages = ['desventaja', 'riesgo', 'limitación', 'desafío'];
    
    const hasAdvantages = advantages.some(indicator => content.includes(indicator));
    const hasDisadvantages = disadvantages.some(indicator => content.includes(indicator));
    
    if (hasAdvantages && hasDisadvantages) return 95;
    if (hasAdvantages || hasDisadvantages) return 65;
    return 30;
  }

  evaluateResponsibilities(content, actionType) {
    const indicators = ['responsabilidad', 'consultor', 'cliente', 'nuestro', 'su parte'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 25 + 25);
  }

  evaluateImplementationStages(content, actionType) {
    const indicators = ['etapa', 'fase', 'paso', 'implementación', 'cronograma'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 25 + 25);
  }

  evaluateDeliverables(content, actionType) {
    const indicators = ['entregable', 'documento', 'reporte', 'resultado', 'producto'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 30 + 20);
  }

  evaluateImplications(content, actionType) {
    const indicators = ['implicación', 'impacto', 'efecto', 'consecuencia', 'cambio'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 30 + 20);
  }

  evaluateResources(content, actionType) {
    const indicators = ['recurso', 'personal', 'equipo', 'material', 'humano', 'técnico'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 25 + 25);
  }

  evaluateQuestionsResponse(content, actionType) {
    if (actionType === 'answer_question') {
      return 85;
    }
    const indicators = ['pregunta', 'duda', 'consulta', 'aclaración'];
    const hasQuestionHandling = indicators.some(indicator => content.includes(indicator));
    return hasQuestionHandling ? 80 : 45;
  }

  evaluateCostBenefit(content, actionType) {
    const indicators = ['costo', 'beneficio', 'roi', 'inversión', 'retorno', 'financiero'];
    const score = indicators.filter(indicator => content.includes(indicator)).length;
    return Math.min(100, score * 25 + 25);
  }

  evaluateMethodologicalOrder(content, actionType, stageInfo) {
    // This would require more sophisticated logic to track presentation flow
    // For now, give points based on being in the right stage
    if (stageInfo && stageInfo.stage) {
      return 75; // Good methodology if following the flow
    }
    return 50;
  }

  /**
   * Generate feedback for interview performance
   */
  generateInterviewFeedback(evaluation, stage) {
    const avgScore = evaluation.score;
    
    if (avgScore >= 80) {
      return 'Excelente desempeño. Muestra dominio de las técnicas de entrevista profesional.';
    } else if (avgScore >= 60) {
      return 'Buen desempeño general. Algunas áreas pueden mejorar para mayor efectividad.';
    } else if (avgScore >= 40) {
      return 'Desempeño aceptable pero requiere mejoras en varias técnicas de entrevista.';
    } else {
      return 'Es necesario revisar y practicar más las técnicas básicas de entrevista.';
    }
  }

  /**
   * Generate feedback for presentation performance
   */
  generatePresentationFeedback(evaluation, stage, stageInfo) {
    const avgScore = evaluation.score;
    
    if (avgScore >= 85) {
      return 'Presentación excelente. Cumple con los estándares profesionales de consultoría.';
    } else if (avgScore >= 70) {
      return 'Buena presentación. Algunos elementos pueden fortalecerse para mayor impacto.';
    } else if (avgScore >= 50) {
      return 'Presentación aceptable. Requiere mejoras en organización y contenido.';
    } else {
      return 'La presentación necesita trabajo significativo en estructura y elementos clave.';
    }
  }

  /**
   * Generate recommendations for interview improvement
   */
  generateInterviewRecommendations(evaluation) {
    const recommendations = [];
    
    evaluation.criteriaEvaluated.forEach(criteria => {
      if (criteria.score < 60) {
        switch (criteria.id) {
          case 'introduction':
            recommendations.push('Practique una presentación personal más profesional y clara');
            break;
          case 'purpose_explanation':
            recommendations.push('Mejore la explicación del propósito y objetivos de la entrevista');
            break;
          case 'evidence_request':
            recommendations.push('Sea más específico al solicitar evidencias y documentación');
            break;
          case 'closure':
            recommendations.push('Desarrolle un cierre más profesional con agradecimiento');
            break;
        }
      }
    });
    
    return recommendations;
  }

  /**
   * Generate recommendations for presentation improvement
   */
  generatePresentationRecommendations(evaluation, stageInfo) {
    const recommendations = [];
    
    evaluation.criteriaEvaluated.forEach(criteria => {
      if (criteria.score < 70) {
        switch (criteria.id) {
          case 'proposal_description':
            recommendations.push('Mejore la descripción clara y concisa de la propuesta');
            break;
          case 'advantages_disadvantages':
            recommendations.push('Incluya un análisis balanceado de ventajas y desventajas');
            break;
          case 'cost_benefit':
            recommendations.push('Fortalezca el análisis de costo-beneficio con datos específicos');
            break;
          case 'methodological_order':
            recommendations.push('Siga una secuencia más lógica y metodológica en la presentación');
            break;
        }
      }
    });
    
    return recommendations;
  }

  /**
   * Calculate overall session performance
   */
  calculateSessionPerformance(session, simulation) {
    if (!session.performance || !session.performance.criteriaCompleted) {
      return { score: 0, completionRate: 0, feedback: 'Sin evaluación disponible' };
    }

    const allCriteria = simulation.evaluationCriteria;
    const completedCriteria = session.performance.criteriaCompleted;
    
    const completionRate = Math.round((completedCriteria.length / allCriteria.length) * 100);
    
    // Calculate weighted average score
    let totalScore = 0;
    let totalWeight = 0;
    
    completedCriteria.forEach(completed => {
      const criteria = allCriteria.find(c => c.id === completed.id);
      if (criteria) {
        totalScore += completed.score * criteria.weight;
        totalWeight += criteria.weight;
      }
    });
    
    const avgScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    
    return {
      score: avgScore,
      completionRate: completionRate,
      feedback: this.generateOverallFeedback(avgScore, completionRate, simulation.type),
      criteriaCompleted: completedCriteria.length,
      totalCriteria: allCriteria.length
    };
  }

  /**
   * Generate overall session feedback
   */
  generateOverallFeedback(score, completionRate, type) {
    const activityType = type === 'interview' ? 'entrevista' : 'presentación';
    
    if (score >= 85 && completionRate >= 90) {
      return `Excelente ${activityType}. Domina las competencias EC0249 para este elemento.`;
    } else if (score >= 70 && completionRate >= 80) {
      return `Buena ${activityType}. Competente en la mayoría de áreas con oportunidades de mejora.`;
    } else if (score >= 60 && completionRate >= 70) {
      return `${activityType} aceptable. Requiere práctica adicional en varias competencias.`;
    } else {
      return `La ${activityType} necesita mejora significativa. Se recomienda revisar contenido teórico y practicar más.`;
    }
  }
}

export default EvaluationEngine;