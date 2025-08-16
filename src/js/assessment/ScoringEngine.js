/**
 * Scoring Engine - Handles assessment scoring and evaluation logic
 * Extracted from AssessmentEngine for better modularity
 */
class ScoringEngine {
  constructor() {
    this.scoringMethods = {
      standard: this.standardScoring.bind(this),
      weighted: this.weightedScoring.bind(this),
      competency: this.competencyScoring.bind(this),
      adaptive: this.adaptiveScoring.bind(this)
    };
  }

  /**
   * Calculate assessment score
   * @param {Object} assessment - Assessment definition
   * @param {Map} responses - User responses
   * @param {Object} options - Scoring options
   * @returns {Object} Score result
   */
  calculateScore(assessment, responses, options = {}) {
    const method = options.method || 'standard';
    
    if (!this.scoringMethods[method]) {
      throw new Error(`Unknown scoring method: ${method}`);
    }

    return this.scoringMethods[method](assessment, responses, options);
  }

  /**
   * Standard scoring - equal weight for all questions
   * @param {Object} assessment - Assessment definition
   * @param {Map} responses - User responses
   * @param {Object} options - Scoring options
   * @returns {Object} Score result
   */
  standardScoring(assessment, responses, options = {}) {
    let totalPoints = 0;
    let maxPoints = 0;
    let correctAnswers = 0;
    const questionResults = [];

    for (const question of assessment.questions) {
      const response = responses.get(question.id);
      const questionPoints = question.points || 10; // Default 10 points
      maxPoints += questionPoints;

      if (response) {
        const isCorrect = this.evaluateResponse(question, response);
        const points = isCorrect ? questionPoints : 0;
        totalPoints += points;
        
        if (isCorrect) {
          correctAnswers++;
        }

        questionResults.push({
          questionId: question.id,
          isCorrect,
          points,
          maxPoints: questionPoints,
          response: response.answer
        });
      } else {
        questionResults.push({
          questionId: question.id,
          isCorrect: false,
          points: 0,
          maxPoints: questionPoints,
          response: null
        });
      }
    }

    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const passed = percentage >= (assessment.passingScore || 70);

    return {
      totalPoints,
      maxPoints,
      percentage,
      correctAnswers,
      totalQuestions: assessment.questions.length,
      passed,
      passingScore: assessment.passingScore || 70,
      questionResults,
      gradeLetter: this.getGradeLetter(percentage),
      timeBonus: this.calculateTimeBonus(options.timeSpent, assessment.timeLimit),
      finalScore: percentage + (this.calculateTimeBonus(options.timeSpent, assessment.timeLimit) || 0)
    };
  }

  /**
   * Weighted scoring - different weights for question types or categories
   * @param {Object} assessment - Assessment definition
   * @param {Map} responses - User responses
   * @param {Object} options - Scoring options
   * @returns {Object} Score result
   */
  weightedScoring(assessment, responses, options = {}) {
    const weights = options.weights || this.getDefaultWeights();
    let totalWeightedPoints = 0;
    let maxWeightedPoints = 0;
    let correctAnswers = 0;
    const questionResults = [];

    for (const question of assessment.questions) {
      const response = responses.get(question.id);
      const weight = weights[question.type] || 1;
      const basePoints = question.points || 10;
      const weightedMaxPoints = basePoints * weight;
      
      maxWeightedPoints += weightedMaxPoints;

      if (response) {
        const isCorrect = this.evaluateResponse(question, response);
        const points = isCorrect ? weightedMaxPoints : 0;
        totalWeightedPoints += points;
        
        if (isCorrect) {
          correctAnswers++;
        }

        questionResults.push({
          questionId: question.id,
          isCorrect,
          points,
          maxPoints: weightedMaxPoints,
          weight,
          response: response.answer
        });
      } else {
        questionResults.push({
          questionId: question.id,
          isCorrect: false,
          points: 0,
          maxPoints: weightedMaxPoints,
          weight,
          response: null
        });
      }
    }

    const percentage = maxWeightedPoints > 0 ? Math.round((totalWeightedPoints / maxWeightedPoints) * 100) : 0;
    const passed = percentage >= (assessment.passingScore || 70);

    return {
      totalPoints: totalWeightedPoints,
      maxPoints: maxWeightedPoints,
      percentage,
      correctAnswers,
      totalQuestions: assessment.questions.length,
      passed,
      passingScore: assessment.passingScore || 70,
      questionResults,
      gradeLetter: this.getGradeLetter(percentage),
      scoringMethod: 'weighted',
      weights
    };
  }

  /**
   * Competency-based scoring - evaluates by competency elements
   * @param {Object} assessment - Assessment definition
   * @param {Map} responses - User responses
   * @param {Object} options - Scoring options
   * @returns {Object} Score result
   */
  competencyScoring(assessment, responses, options = {}) {
    const competencyGroups = this.groupQuestionsByCompetency(assessment.questions);
    const competencyResults = {};
    let overallScore = 0;
    let totalQuestions = 0;
    let correctAnswers = 0;
    const questionResults = [];

    for (const [competency, questions] of competencyGroups) {
      let competencyPoints = 0;
      let competencyMaxPoints = 0;
      let competencyCorrect = 0;

      for (const question of questions) {
        const response = responses.get(question.id);
        const questionPoints = question.points || 10;
        competencyMaxPoints += questionPoints;
        totalQuestions++;

        if (response) {
          const isCorrect = this.evaluateResponse(question, response);
          const points = isCorrect ? questionPoints : 0;
          competencyPoints += points;
          
          if (isCorrect) {
            competencyCorrect++;
            correctAnswers++;
          }

          questionResults.push({
            questionId: question.id,
            competency,
            isCorrect,
            points,
            maxPoints: questionPoints,
            response: response.answer
          });
        } else {
          questionResults.push({
            questionId: question.id,
            competency,
            isCorrect: false,
            points: 0,
            maxPoints: questionPoints,
            response: null
          });
        }
      }

      const competencyPercentage = competencyMaxPoints > 0 ? 
        Math.round((competencyPoints / competencyMaxPoints) * 100) : 0;

      competencyResults[competency] = {
        points: competencyPoints,
        maxPoints: competencyMaxPoints,
        percentage: competencyPercentage,
        correctAnswers: competencyCorrect,
        totalQuestions: questions.length,
        passed: competencyPercentage >= (options.competencyThreshold || 70)
      };

      overallScore += competencyPercentage;
    }

    const averageScore = competencyGroups.size > 0 ? 
      Math.round(overallScore / competencyGroups.size) : 0;
    const allCompetenciesPassed = Object.values(competencyResults)
      .every(comp => comp.passed);

    return {
      percentage: averageScore,
      correctAnswers,
      totalQuestions,
      passed: allCompetenciesPassed && averageScore >= (assessment.passingScore || 70),
      passingScore: assessment.passingScore || 70,
      questionResults,
      competencyResults,
      gradeLetter: this.getGradeLetter(averageScore),
      scoringMethod: 'competency'
    };
  }

  /**
   * Adaptive scoring - adjusts based on question difficulty and performance
   * @param {Object} assessment - Assessment definition
   * @param {Map} responses - User responses
   * @param {Object} options - Scoring options
   * @returns {Object} Score result
   */
  adaptiveScoring(assessment, responses, options = {}) {
    // Placeholder for adaptive scoring algorithm
    // In a full implementation, this would adjust scoring based on question difficulty
    // and student performance patterns
    return this.standardScoring(assessment, responses, options);
  }

  /**
   * Evaluate individual response
   * @param {Object} question - Question definition
   * @param {Object} response - User response
   * @returns {boolean} Whether response is correct
   */
  evaluateResponse(question, response) {
    switch (question.type) {
      case 'multiple_choice':
        return response.answer === question.correct;
      case 'true_false':
        return response.answer === question.correct;
      case 'short_answer':
        return this.evaluateShortAnswer(response.answer, question.sampleAnswer);
      case 'matching':
        return this.evaluateMatching(response.answer, question.pairs);
      case 'essay':
        return response.score >= (question.passingScore || 70);
      default:
        return false;
    }
  }

  /**
   * Evaluate short answer response
   * @param {string} userAnswer - User's answer
   * @param {string} sampleAnswer - Sample correct answer
   * @returns {boolean} Whether answer is acceptable
   */
  evaluateShortAnswer(userAnswer, sampleAnswer) {
    if (!userAnswer || !sampleAnswer) return false;

    const normalizedUser = this.normalizeText(userAnswer);
    const normalizedSample = this.normalizeText(sampleAnswer);
    
    // Simple keyword matching - 60% threshold
    const keywords = normalizedSample.split(' ');
    const userWords = normalizedUser.split(' ');
    const matchedKeywords = keywords.filter(keyword => userWords.includes(keyword));
    
    return (matchedKeywords.length / keywords.length) >= 0.6;
  }

  /**
   * Evaluate matching response
   * @param {Array} userAnswer - User's matches
   * @param {Array} correctPairs - Correct pairs
   * @returns {boolean} Whether matching is acceptable
   */
  evaluateMatching(userAnswer, correctPairs) {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctPairs)) {
      return false;
    }

    let correctMatches = 0;
    for (const userPair of userAnswer) {
      const isCorrect = correctPairs.some(pair => 
        pair.left === userPair.left && pair.right === userPair.right
      );
      if (isCorrect) correctMatches++;
    }

    return (correctMatches / correctPairs.length) >= 0.8; // 80% threshold
  }

  /**
   * Calculate time bonus
   * @param {number} timeSpent - Time spent in seconds
   * @param {number} timeLimit - Time limit in seconds
   * @returns {number} Bonus points
   */
  calculateTimeBonus(timeSpent, timeLimit) {
    if (!timeSpent || !timeLimit || timeSpent >= timeLimit) {
      return 0;
    }

    const timeRatio = timeSpent / timeLimit;
    
    // Give bonus for completing in less than 75% of time
    if (timeRatio < 0.75) {
      return Math.round((0.75 - timeRatio) * 10); // Up to 7.5 bonus points
    }
    
    return 0;
  }

  /**
   * Get grade letter based on percentage
   * @param {number} percentage - Score percentage
   * @returns {string} Grade letter
   */
  getGradeLetter(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Get default weights for question types
   * @returns {Object} Default weights
   */
  getDefaultWeights() {
    return {
      multiple_choice: 1.0,
      true_false: 0.8,
      short_answer: 1.2,
      essay: 1.5,
      matching: 1.1
    };
  }

  /**
   * Group questions by competency
   * @param {Array} questions - Questions array
   * @returns {Map} Grouped questions
   */
  groupQuestionsByCompetency(questions) {
    const groups = new Map();
    
    for (const question of questions) {
      const competency = question.competency || 'general';
      if (!groups.has(competency)) {
        groups.set(competency, []);
      }
      groups.get(competency).push(question);
    }
    
    return groups;
  }

  /**
   * Normalize text for comparison
   * @param {string} text - Text to normalize
   * @returns {string} Normalized text
   */
  normalizeText(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate detailed score report
   * @param {Object} scoreResult - Score calculation result
   * @param {Object} assessment - Assessment definition
   * @returns {Object} Detailed report
   */
  generateScoreReport(scoreResult, assessment) {
    const report = {
      summary: {
        score: scoreResult.percentage,
        grade: scoreResult.gradeLetter,
        passed: scoreResult.passed,
        totalQuestions: scoreResult.totalQuestions,
        correctAnswers: scoreResult.correctAnswers
      },
      performance: {
        strengths: [],
        weaknesses: [],
        recommendations: []
      },
      details: scoreResult.questionResults
    };

    // Analyze performance patterns
    if (scoreResult.competencyResults) {
      report.competencyAnalysis = scoreResult.competencyResults;
      
      // Identify strengths and weaknesses
      for (const [competency, result] of Object.entries(scoreResult.competencyResults)) {
        if (result.percentage >= 80) {
          report.performance.strengths.push(`Excelente dominio de ${competency}`);
        } else if (result.percentage < 60) {
          report.performance.weaknesses.push(`Necesita mejorar en ${competency}`);
          report.performance.recommendations.push(`Revisar contenido de ${competency}`);
        }
      }
    }

    return report;
  }
}

export default ScoringEngine;