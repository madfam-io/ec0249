/**
 * Content Loader - Handles content fetching from various sources
 * Extracted from ContentEngine for better modularity
 */
class ContentLoader {
  constructor(i18n) {
    this.i18n = i18n;
    this.contentCache = new Map();
  }

  /**
   * Fetch content from various sources
   * @param {Object} contentConfig - Content configuration
   * @returns {Promise<Object>} Content data
   */
  async fetchContent(contentConfig) {
    const { id, type, source = 'i18n' } = contentConfig;

    try {
      switch (source) {
        case 'i18n':
          return await this.fetchI18nContent(id, type);
        case 'api':
          return await this.fetchAPIContent(id, type);
        case 'file':
          return await this.fetchFileContent(id, type);
        default:
          // Fallback to mock structure for compatibility
          return {
            id: contentConfig.id,
            type: contentConfig.type || 'lesson',
            title: contentConfig.title,
            overview: contentConfig.overview,
            duration: contentConfig.duration,
            objectives: contentConfig.objectives || [],
            sections: contentConfig.sections || [],
            interactions: contentConfig.interactions || [],
            navigation: contentConfig.navigation !== false
          };
      }
    } catch (error) {
      console.error(`[ContentLoader] Failed to fetch content ${id}:`, error);
      // Return fallback content
      return {
        id: contentConfig.id,
        type: 'error',
        title: 'Content Loading Error',
        overview: 'Failed to load content',
        sections: [{
          type: 'error',
          content: 'Unable to load the requested content. Please try again later.'
        }]
      };
    }
  }

  /**
   * Fetch content from i18n translations
   * @param {string} id - Content ID (e.g., 'module1.lessons.lesson1_1')
   * @param {string} type - Content type
   * @returns {Promise<Object>} Content data
   */
  async fetchI18nContent(id, type) {
    try {
      const content = this.i18n.getTranslation(id, this.i18n.getCurrentLanguage());
      
      if (!content) {
        throw new Error(`Content not found for key: ${id}`);
      }

      return {
        id,
        type: type || 'lesson',
        source: 'i18n',
        ...content,
        metadata: {
          language: this.i18n.getCurrentLanguage(),
          fetchedAt: Date.now()
        }
      };
    } catch (error) {
      console.error(`[ContentLoader] Failed to fetch i18n content ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch content from API
   * @param {string} id - Content ID
   * @param {string} type - Content type
   * @returns {Promise<Object>} Content data
   */
  async fetchAPIContent(id, type) {
    // Placeholder for future API integration
    throw new Error('API content fetching not implemented yet');
  }

  /**
   * Fetch content from file
   * @param {string} id - Content ID
   * @param {string} type - Content type
   * @returns {Promise<Object>} Content data
   */
  async fetchFileContent(id, type) {
    // Placeholder for future file-based content
    throw new Error('File content fetching not implemented yet');
  }

  /**
   * Load content with caching
   * @param {Object} contentConfig - Content configuration
   * @returns {Promise<Object>} Content data
   */
  async loadContent(contentConfig) {
    try {
      // Check cache first
      let content = this.contentCache.get(contentConfig.id);
      
      if (!content) {
        content = await this.fetchContent(contentConfig);
        this.contentCache.set(contentConfig.id, content);
      }

      // Process content for current language
      content = await this.localizeContent(content);

      // Validate content structure
      this.validateContent(content);

      return content;

    } catch (error) {
      console.error('[ContentLoader] Failed to load content:', error);
      throw error;
    }
  }

  /**
   * Localize content for current language
   * @param {Object} content - Content to localize
   * @returns {Promise<Object>} Localized content
   */
  async localizeContent(content) {
    // Process content for current language
    if (content.title && typeof content.title === 'string') {
      content.title = this.i18n.t(content.title, {}, content.title);
    }
    
    if (content.overview && typeof content.overview === 'string') {
      content.overview = this.i18n.t(content.overview, {}, content.overview);
    }

    return content;
  }

  /**
   * Validate content structure
   * @param {Object} content - Content to validate
   * @throws {Error} If content is invalid
   */
  validateContent(content) {
    if (!content.id) {
      throw new Error('Content must have an ID');
    }
    
    if (!content.title) {
      throw new Error('Content must have a title');
    }
  }

  /**
   * Clear content cache
   */
  clearCache() {
    this.contentCache.clear();
  }

  /**
   * Get cache size
   * @returns {number} Cache size
   */
  getCacheSize() {
    return this.contentCache.size;
  }

  /**
   * Preload multiple contents
   * @param {Array} contentConfigs - Array of content configurations
   * @returns {Promise<Array>} Array of loaded contents
   */
  async preloadContents(contentConfigs) {
    const loadPromises = contentConfigs.map(config => this.loadContent(config));
    return Promise.all(loadPromises);
  }

  /**
   * Get cached content
   * @param {string} contentId - Content ID
   * @returns {Object|null} Cached content or null
   */
  getCachedContent(contentId) {
    return this.contentCache.get(contentId) || null;
  }

  /**
   * Remove content from cache
   * @param {string} contentId - Content ID
   */
  removeCachedContent(contentId) {
    this.contentCache.delete(contentId);
  }
}

export default ContentLoader;