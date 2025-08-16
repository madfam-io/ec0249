/**
 * Scenario Loader - Manages loading and validation of simulation scenarios
 * Provides centralized access to interview and presentation scenarios
 */
import { interviewScenarios } from './InterviewScenarios.js';
import { presentationScenarios } from './PresentationScenarios.js';

class ScenarioLoader {
  constructor() {
    this.scenarios = new Map();
    this.loadedScenarios = new Set();
  }

  /**
   * Load all simulation scenarios
   */
  async loadAllScenarios() {
    console.log('[ScenarioLoader] Loading simulation scenarios...');
    
    try {
      // Load interview scenarios
      this.loadInterviewScenarios();
      
      // Load presentation scenarios
      this.loadPresentationScenarios();
      
      console.log(`[ScenarioLoader] Loaded ${this.scenarios.size} scenarios successfully`);
      return this.scenarios;
    } catch (error) {
      console.error('[ScenarioLoader] Failed to load scenarios:', error);
      throw error;
    }
  }

  /**
   * Load interview scenarios (Element 1 - E0875)
   */
  loadInterviewScenarios() {
    Object.values(interviewScenarios).forEach(scenario => {
      if (this.validateScenario(scenario)) {
        this.scenarios.set(scenario.id, scenario);
        this.loadedScenarios.add(scenario.id);
      } else {
        console.warn(`[ScenarioLoader] Invalid interview scenario: ${scenario.id}`);
      }
    });
    
    console.log(`[ScenarioLoader] Loaded ${Object.keys(interviewScenarios).length} interview scenarios`);
  }

  /**
   * Load presentation scenarios (Element 3 - E0877)
   */
  loadPresentationScenarios() {
    Object.values(presentationScenarios).forEach(scenario => {
      if (this.validateScenario(scenario)) {
        this.scenarios.set(scenario.id, scenario);
        this.loadedScenarios.add(scenario.id);
      } else {
        console.warn(`[ScenarioLoader] Invalid presentation scenario: ${scenario.id}`);
      }
    });
    
    console.log(`[ScenarioLoader] Loaded ${Object.keys(presentationScenarios).length} presentation scenarios`);
  }

  /**
   * Validate scenario structure
   */
  validateScenario(scenario) {
    const requiredFields = ['id', 'type', 'title', 'element', 'difficulty', 'estimatedDuration', 'description'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!scenario[field]) {
        console.error(`[ScenarioLoader] Missing required field '${field}' in scenario:`, scenario);
        return false;
      }
    }

    // Validate scenario type
    if (!['interview', 'presentation'].includes(scenario.type)) {
      console.error(`[ScenarioLoader] Invalid scenario type '${scenario.type}' in scenario:`, scenario);
      return false;
    }

    // Validate difficulty
    if (!['beginner', 'intermediate', 'advanced'].includes(scenario.difficulty)) {
      console.error(`[ScenarioLoader] Invalid difficulty '${scenario.difficulty}' in scenario:`, scenario);
      return false;
    }

    // Validate element
    if (!['E0875', 'E0876', 'E0877'].includes(scenario.element)) {
      console.error(`[ScenarioLoader] Invalid element '${scenario.element}' in scenario:`, scenario);
      return false;
    }

    // Type-specific validations
    if (scenario.type === 'interview') {
      return this.validateInterviewScenario(scenario);
    } else if (scenario.type === 'presentation') {
      return this.validatePresentationScenario(scenario);
    }

    return true;
  }

  /**
   * Validate interview scenario specific fields
   */
  validateInterviewScenario(scenario) {
    const requiredFields = ['scenario', 'client', 'objectives', 'evaluationCriteria'];
    
    for (const field of requiredFields) {
      if (!scenario[field]) {
        console.error(`[ScenarioLoader] Missing interview field '${field}' in scenario:`, scenario.id);
        return false;
      }
    }

    // Validate client structure
    if (!scenario.client.name || !scenario.client.position) {
      console.error(`[ScenarioLoader] Invalid client structure in scenario:`, scenario.id);
      return false;
    }

    // Validate evaluation criteria
    if (!Array.isArray(scenario.evaluationCriteria) || scenario.evaluationCriteria.length === 0) {
      console.error(`[ScenarioLoader] Invalid evaluation criteria in scenario:`, scenario.id);
      return false;
    }

    return true;
  }

  /**
   * Validate presentation scenario specific fields
   */
  validatePresentationScenario(scenario) {
    const requiredFields = ['scenario', 'audience', 'evaluationCriteria', 'presentation_flow'];
    
    for (const field of requiredFields) {
      if (!scenario[field]) {
        console.error(`[ScenarioLoader] Missing presentation field '${field}' in scenario:`, scenario.id);
        return false;
      }
    }

    // Validate audience structure
    if (!Array.isArray(scenario.audience) || scenario.audience.length === 0) {
      console.error(`[ScenarioLoader] Invalid audience structure in scenario:`, scenario.id);
      return false;
    }

    // Validate presentation flow
    if (!Array.isArray(scenario.presentation_flow) || scenario.presentation_flow.length === 0) {
      console.error(`[ScenarioLoader] Invalid presentation flow in scenario:`, scenario.id);
      return false;
    }

    // Validate evaluation criteria
    if (!Array.isArray(scenario.evaluationCriteria) || scenario.evaluationCriteria.length === 0) {
      console.error(`[ScenarioLoader] Invalid evaluation criteria in scenario:`, scenario.id);
      return false;
    }

    return true;
  }

  /**
   * Get scenario by ID
   */
  getScenario(scenarioId) {
    return this.scenarios.get(scenarioId);
  }

  /**
   * Get scenarios by type
   */
  getScenariosByType(type) {
    const filtered = new Map();
    for (const [id, scenario] of this.scenarios) {
      if (scenario.type === type) {
        filtered.set(id, scenario);
      }
    }
    return filtered;
  }

  /**
   * Get scenarios by element
   */
  getScenariosByElement(element) {
    const filtered = new Map();
    for (const [id, scenario] of this.scenarios) {
      if (scenario.element === element) {
        filtered.set(id, scenario);
      }
    }
    return filtered;
  }

  /**
   * Get scenarios by difficulty
   */
  getScenariosByDifficulty(difficulty) {
    const filtered = new Map();
    for (const [id, scenario] of this.scenarios) {
      if (scenario.difficulty === difficulty) {
        filtered.set(id, scenario);
      }
    }
    return filtered;
  }

  /**
   * Get scenario statistics
   */
  getScenarioStatistics() {
    const stats = {
      total: this.scenarios.size,
      byType: {},
      byElement: {},
      byDifficulty: {}
    };

    for (const scenario of this.scenarios.values()) {
      // Count by type
      stats.byType[scenario.type] = (stats.byType[scenario.type] || 0) + 1;
      
      // Count by element
      stats.byElement[scenario.element] = (stats.byElement[scenario.element] || 0) + 1;
      
      // Count by difficulty
      stats.byDifficulty[scenario.difficulty] = (stats.byDifficulty[scenario.difficulty] || 0) + 1;
    }

    return stats;
  }

  /**
   * Get all scenarios as array
   */
  getAllScenarios() {
    return Array.from(this.scenarios.values());
  }

  /**
   * Get all scenario IDs
   */
  getAllScenarioIds() {
    return Array.from(this.scenarios.keys());
  }

  /**
   * Check if scenario exists
   */
  hasScenario(scenarioId) {
    return this.scenarios.has(scenarioId);
  }

  /**
   * Get random scenario by criteria
   */
  getRandomScenario(criteria = {}) {
    let eligibleScenarios = Array.from(this.scenarios.values());

    // Filter by criteria
    if (criteria.type) {
      eligibleScenarios = eligibleScenarios.filter(s => s.type === criteria.type);
    }
    if (criteria.element) {
      eligibleScenarios = eligibleScenarios.filter(s => s.element === criteria.element);
    }
    if (criteria.difficulty) {
      eligibleScenarios = eligibleScenarios.filter(s => s.difficulty === criteria.difficulty);
    }

    if (eligibleScenarios.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * eligibleScenarios.length);
    return eligibleScenarios[randomIndex];
  }

  /**
   * Clear all scenarios
   */
  clear() {
    this.scenarios.clear();
    this.loadedScenarios.clear();
  }

  /**
   * Reload scenarios
   */
  async reload() {
    this.clear();
    return await this.loadAllScenarios();
  }
}

export default ScenarioLoader;