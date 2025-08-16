/**
 * Question Types - Handles different types of assessment questions
 * Extracted from AssessmentEngine for better modularity
 */
class QuestionTypes {
  constructor() {
    this.supportedTypes = ['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching'];
  }

  /**
   * Validate question structure
   * @param {Object} question - Question object
   * @returns {boolean} Validation result
   */
  validateQuestion(question) {
    if (!question.id || !question.type || !question.question) {
      return false;
    }

    if (!this.supportedTypes.includes(question.type)) {
      return false;
    }

    // Type-specific validation
    switch (question.type) {
      case 'multiple_choice':
        return this.validateMultipleChoice(question);
      case 'true_false':
        return this.validateTrueFalse(question);
      case 'short_answer':
        return this.validateShortAnswer(question);
      case 'essay':
        return this.validateEssay(question);
      case 'matching':
        return this.validateMatching(question);
      default:
        return false;
    }
  }

  /**
   * Validate multiple choice question
   * @param {Object} question - Question object
   * @returns {boolean} Validation result
   */
  validateMultipleChoice(question) {
    return question.options && 
           Array.isArray(question.options) && 
           question.options.length >= 2 &&
           typeof question.correct === 'number' &&
           question.correct >= 0 &&
           question.correct < question.options.length;
  }

  /**
   * Validate true/false question
   * @param {Object} question - Question object
   * @returns {boolean} Validation result
   */
  validateTrueFalse(question) {
    return typeof question.correct === 'boolean';
  }

  /**
   * Validate short answer question
   * @param {Object} question - Question object
   * @returns {boolean} Validation result
   */
  validateShortAnswer(question) {
    return question.sampleAnswer && 
           typeof question.sampleAnswer === 'string' && 
           question.sampleAnswer.length > 0;
  }

  /**
   * Validate essay question
   * @param {Object} question - Question object
   * @returns {boolean} Validation result
   */
  validateEssay(question) {
    return question.rubric && 
           Array.isArray(question.rubric) && 
           question.rubric.length > 0;
  }

  /**
   * Validate matching question
   * @param {Object} question - Question object
   * @returns {boolean} Validation result
   */
  validateMatching(question) {
    return question.pairs && 
           Array.isArray(question.pairs) && 
           question.pairs.length >= 2 &&
           question.pairs.every(pair => pair.left && pair.right);
  }

  /**
   * Evaluate question answer
   * @param {Object} question - Question object
   * @param {*} userAnswer - User's answer
   * @returns {Object} Evaluation result
   */
  evaluateAnswer(question, userAnswer) {
    if (!this.validateQuestion(question)) {
      throw new Error('Invalid question structure');
    }

    switch (question.type) {
      case 'multiple_choice':
        return this.evaluateMultipleChoice(question, userAnswer);
      case 'true_false':
        return this.evaluateTrueFalse(question, userAnswer);
      case 'short_answer':
        return this.evaluateShortAnswer(question, userAnswer);
      case 'essay':
        return this.evaluateEssay(question, userAnswer);
      case 'matching':
        return this.evaluateMatching(question, userAnswer);
      default:
        throw new Error(`Unsupported question type: ${question.type}`);
    }
  }

  /**
   * Evaluate multiple choice answer
   * @param {Object} question - Question object
   * @param {number} userAnswer - User's selected option index
   * @returns {Object} Evaluation result
   */
  evaluateMultipleChoice(question, userAnswer) {
    const isCorrect = userAnswer === question.correct;
    const points = isCorrect ? (question.points || 0) : 0;

    return {
      isCorrect,
      points,
      maxPoints: question.points || 0,
      feedback: question.explanation || '',
      correctAnswer: question.correct,
      userAnswer
    };
  }

  /**
   * Evaluate true/false answer
   * @param {Object} question - Question object
   * @param {boolean} userAnswer - User's answer
   * @returns {Object} Evaluation result
   */
  evaluateTrueFalse(question, userAnswer) {
    const isCorrect = userAnswer === question.correct;
    const points = isCorrect ? (question.points || 0) : 0;

    return {
      isCorrect,
      points,
      maxPoints: question.points || 0,
      feedback: question.explanation || '',
      correctAnswer: question.correct,
      userAnswer
    };
  }

  /**
   * Evaluate short answer
   * @param {Object} question - Question object
   * @param {string} userAnswer - User's answer
   * @returns {Object} Evaluation result
   */
  evaluateShortAnswer(question, userAnswer) {
    const normalizedUser = this.normalizeText(userAnswer);
    const normalizedSample = this.normalizeText(question.sampleAnswer);
    
    // Simple keyword matching - in production, use more sophisticated NLP
    const keywords = normalizedSample.split(' ');
    const userWords = normalizedUser.split(' ');
    const matchedKeywords = keywords.filter(keyword => userWords.includes(keyword));
    
    const similarityScore = matchedKeywords.length / keywords.length;
    const isCorrect = similarityScore >= 0.6; // 60% similarity threshold
    const points = isCorrect ? (question.points || 0) : Math.floor((question.points || 0) * similarityScore);

    return {
      isCorrect,
      points,
      maxPoints: question.points || 0,
      feedback: question.explanation || '',
      similarityScore,
      userAnswer,
      requiresManualReview: similarityScore < 0.8 && similarityScore > 0.4
    };
  }

  /**
   * Evaluate essay answer
   * @param {Object} question - Question object
   * @param {string} userAnswer - User's answer
   * @returns {Object} Evaluation result
   */
  evaluateEssay(question, userAnswer) {
    // Essays require manual evaluation
    return {
      isCorrect: null, // To be determined by manual review
      points: 0, // To be assigned manually
      maxPoints: question.points || 0,
      feedback: 'Esta respuesta requiere revisión manual.',
      userAnswer,
      requiresManualReview: true,
      rubric: question.rubric
    };
  }

  /**
   * Evaluate matching answer
   * @param {Object} question - Question object
   * @param {Array} userAnswer - User's matches
   * @returns {Object} Evaluation result
   */
  evaluateMatching(question, userAnswer) {
    if (!Array.isArray(userAnswer)) {
      return {
        isCorrect: false,
        points: 0,
        maxPoints: question.points || 0,
        feedback: 'Respuesta inválida',
        userAnswer
      };
    }

    const correctPairs = question.pairs;
    let correctMatches = 0;

    for (const userPair of userAnswer) {
      const correctPair = correctPairs.find(pair => 
        pair.left === userPair.left && pair.right === userPair.right
      );
      if (correctPair) {
        correctMatches++;
      }
    }

    const totalPairs = correctPairs.length;
    const score = correctMatches / totalPairs;
    const isCorrect = score >= 0.8; // 80% correct matches required
    const points = Math.floor((question.points || 0) * score);

    return {
      isCorrect,
      points,
      maxPoints: question.points || 0,
      feedback: question.explanation || '',
      correctMatches,
      totalPairs,
      score,
      userAnswer
    };
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
   * Get question type display name
   * @param {string} type - Question type
   * @returns {string} Display name
   */
  getTypeDisplayName(type) {
    const names = {
      multiple_choice: 'Opción Múltiple',
      true_false: 'Verdadero/Falso',
      short_answer: 'Respuesta Corta',
      essay: 'Ensayo',
      matching: 'Relacionar Columnas'
    };
    return names[type] || type;
  }

  /**
   * Get question type icon
   * @param {string} type - Question type
   * @returns {string} Icon emoji
   */
  getTypeIcon(type) {
    const icons = {
      multiple_choice: '☑️',
      true_false: '✅',
      short_answer: '✏️',
      essay: '📝',
      matching: '🔗'
    };
    return icons[type] || '❓';
  }
}

export default QuestionTypes;