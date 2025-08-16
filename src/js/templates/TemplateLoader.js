/**
 * Template Loader - Loads and manages EC0249 document templates
 * Separated from DocumentEngine to reduce file size and improve maintainability
 */
import element1Templates from './Element1Templates.js';
import element2Templates from './Element2Templates.js';
import element3Templates from './Element3Templates.js';

class TemplateLoader {
  constructor() {
    this.templates = new Map();
  }

  /**
   * Load all EC0249 document templates
   * @returns {Map} Template definitions mapped by ID
   */
  async loadAllTemplates() {
    const allTemplates = {
      ...element1Templates,
      ...element2Templates,
      ...element3Templates
    };

    // Store templates in map for fast lookup
    Object.values(allTemplates).forEach(template => {
      this.templates.set(template.id, template);
    });

    return this.templates;
  }

  /**
   * Get template by ID
   * @param {string} templateId - Template identifier
   * @returns {Object|null} Template definition
   */
  getTemplate(templateId) {
    return this.templates.get(templateId);
  }

  /**
   * Get templates by element
   * @param {string} elementId - Element ID (E0875, E0876, E0877)
   * @returns {Array} Templates for the specified element
   */
  getTemplatesByElement(elementId) {
    return Array.from(this.templates.values())
      .filter(template => template.element === elementId);
  }

  /**
   * Get all template IDs
   * @returns {Array} Array of template IDs
   */
  getTemplateIds() {
    return Array.from(this.templates.keys());
  }

  /**
   * Validate template structure
   * @param {Object} template - Template to validate
   * @returns {boolean} True if valid
   */
  validateTemplate(template) {
    const requiredFields = ['id', 'title', 'element', 'sections'];
    
    for (const field of requiredFields) {
      if (!template[field]) {
        console.error(`Template ${template.id || 'unknown'} missing required field: ${field}`);
        return false;
      }
    }

    // Validate sections
    if (!Array.isArray(template.sections)) {
      console.error(`Template ${template.id} sections must be an array`);
      return false;
    }

    for (const section of template.sections) {
      if (!section.id || !section.title || !section.type) {
        console.error(`Template ${template.id} has invalid section:`, section);
        return false;
      }
    }

    return true;
  }

  /**
   * Get template statistics
   * @returns {Object} Template statistics
   */
  getStatistics() {
    const stats = {
      total: this.templates.size,
      byElement: {},
      byType: {},
      averageEstimatedTime: 0
    };

    let totalTime = 0;
    for (const template of this.templates.values()) {
      // Count by element
      const element = template.element;
      stats.byElement[element] = (stats.byElement[element] || 0) + 1;

      // Count by type (derived from sections)
      const hasMatrix = template.sections.some(s => s.type === 'matrix');
      const hasStructured = template.sections.some(s => s.type === 'structured');
      const type = hasMatrix ? 'matrix' : hasStructured ? 'structured' : 'simple';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Calculate average time
      if (template.estimatedTime) {
        totalTime += template.estimatedTime;
      }
    }

    stats.averageEstimatedTime = Math.round(totalTime / this.templates.size);

    return stats;
  }
}

export default TemplateLoader;