/**
 * Application Configuration Manager
 * Centralized configuration with environment support and validation
 */
export default {
  // Application Information
  app: {
    name: 'EC0249 Educational Platform',
    version: '2.0.0',
    description: 'Interactive educational platform for EC0249 certification - Providing general consulting services',
    author: 'EC0249 Team',
    homepage: 'https://ec0249.education',
    repository: 'https://github.com/ec0249/platform'
  },

  // Environment Configuration
  environment: {
    production: false,
    debug: true,
    apiUrl: './api',
    assetsUrl: './assets',
    staticUrl: './static'
  },

  // Theme Configuration
  theme: {
    themes: ['auto', 'light', 'dark'],
    defaultTheme: 'auto',
    storageKey: 'ec0249_theme',
    cssAttribute: 'data-theme',
    transitions: true,
    systemPreferenceSupport: true,
    customThemes: {
      // Can be extended with custom theme definitions
    }
  },

  // Internationalization Configuration
  i18n: {
    defaultLanguage: 'es',
    fallbackLanguage: 'es',
    supportedLanguages: ['es', 'en'],
    storageKey: 'ec0249_language',
    translationsPath: './js/translations/',
    autoDetectLanguage: true,
    interpolationPattern: /\{\{(\w+)\}\}/g,
    dateFormat: {
      es: 'DD/MM/YYYY',
      en: 'MM/DD/YYYY'
    },
    numberFormat: {
      es: { decimal: ',', thousands: '.' },
      en: { decimal: '.', thousands: ',' }
    }
  },

  // Storage Configuration
  storage: {
    defaultAdapter: 'localStorage',
    prefix: 'ec0249_',
    compression: false,
    encryption: false,
    ttl: false, // Time to live in milliseconds
    fallbackToMemory: true,
    adapters: ['localStorage', 'sessionStorage', 'memory', 'indexedDB']
  },

  // State Management Configuration
  state: {
    enableHistory: true,
    maxHistorySize: 50,
    debug: false,
    persistState: true,
    persistKeys: ['userProgress', 'preferences', 'documents'],
    middleware: []
  },

  // Event System Configuration
  events: {
    debug: false,
    maxListeners: 100,
    asyncTimeout: 5000,
    middleware: []
  },

  // UI Configuration
  ui: {
    animations: true,
    transitions: true,
    responsiveBreakpoints: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    },
    notifications: {
      position: 'top-right',
      duration: 5000,
      maxVisible: 5,
      animations: true
    },
    modals: {
      closeOnBackdrop: true,
      closeOnEscape: true,
      scrollLock: true
    }
  },

  // Module Configuration
  modules: {
    autoLoad: true,
    lazyLoad: true,
    timeout: 10000,
    retryCount: 3,
    dependencies: {
      // Module dependency definitions
    }
  },

  // Learning System Configuration
  learning: {
    modules: {
      module1: {
        id: 'module1',
        title: 'modules.module1.title',
        icon: '🎯',
        color: 'green',
        lessons: 3,
        assessments: 2
      },
      module2: {
        id: 'module2',
        title: 'modules.module2.title',
        icon: '🔍',
        color: 'blue',
        lessons: 4,
        assessments: 3
      },
      module3: {
        id: 'module3',
        title: 'modules.module3.title',
        icon: '⚡',
        color: 'purple',
        lessons: 3,
        assessments: 2
      },
      module4: {
        id: 'module4',
        title: 'modules.module4.title',
        icon: '🎤',
        color: 'orange',
        lessons: 3,
        assessments: 2
      }
    },
    progress: {
      autoSave: true,
      saveInterval: 30000, // 30 seconds
      trackTime: true,
      analytics: true
    },
    assessment: {
      passingScore: 70,
      maxAttempts: 3,
      timeLimit: 3600000, // 1 hour in milliseconds
      shuffleQuestions: true,
      shuffleAnswers: true
    }
  },

  // Document Templates Configuration
  templates: {
    autoSave: true,
    saveInterval: 10000, // 10 seconds
    versioning: true,
    maxVersions: 10,
    validation: true,
    export: {
      formats: ['pdf', 'docx', 'html'],
      defaultFormat: 'pdf'
    },
    elements: {
      element1: {
        documents: 8,
        requiredDocuments: ['problema', 'afectacion', 'metodologia']
      },
      element2: {
        documents: 2,
        requiredDocuments: ['reporte_afectaciones', 'solucion']
      },
      element3: {
        documents: 5,
        requiredDocuments: ['propuesta', 'presentacion']
      }
    }
  },

  // Assessment Configuration
  assessment: {
    types: ['knowledge', 'performance', 'portfolio'],
    scoring: {
      knowledge: { weight: 0.3, passingScore: 80 },
      performance: { weight: 0.4, passingScore: 75 },
      portfolio: { weight: 0.3, passingScore: 70 }
    },
    feedback: {
      immediate: true,
      detailed: true,
      remediation: true
    }
  },

  // Simulation Configuration
  simulation: {
    interview: {
      scenarios: 5,
      timeLimit: 1800000, // 30 minutes
      recording: false,
      feedback: true
    },
    presentation: {
      scenarios: 3,
      timeLimit: 1200000, // 20 minutes
      recording: false,
      feedback: true
    }
  },

  // API Configuration
  api: {
    baseUrl: '/api',
    timeout: 30000,
    retries: 3,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    endpoints: {
      auth: '/auth',
      user: '/user',
      progress: '/progress',
      documents: '/documents',
      assessment: '/assessment',
      export: '/export'
    }
  },

  // Security Configuration
  security: {
    encryption: {
      enabled: false,
      algorithm: 'AES-GCM',
      keyLength: 256
    },
    sessions: {
      timeout: 7200000, // 2 hours
      renewOnActivity: true,
      secureStorage: true
    },
    validation: {
      sanitizeInput: true,
      validateOutputs: true,
      preventXSS: true
    }
  },

  // Performance Configuration
  performance: {
    caching: {
      enabled: true,
      defaultTTL: 300000, // 5 minutes
      maxSize: 50 * 1024 * 1024, // 50MB
      strategies: ['memory', 'localStorage']
    },
    lazy: {
      images: true,
      components: true,
      translations: true
    },
    bundling: {
      splitChunks: true,
      compression: true,
      minification: true
    }
  },

  // Analytics Configuration
  analytics: {
    enabled: false,
    provider: 'internal',
    trackPageViews: true,
    trackEvents: true,
    trackErrors: true,
    trackPerformance: true,
    anonymizeUsers: true
  },

  // Development Configuration
  development: {
    hotReload: true,
    sourceMap: true,
    verbose: true,
    mockData: true,
    testMode: false
  },

  // Accessibility Configuration
  accessibility: {
    enabled: true,
    highContrast: false,
    reducedMotion: false,
    keyboardNavigation: true,
    screenReader: true,
    fontSize: 'normal', // small, normal, large
    announcements: true
  },

  // Feature Flags
  features: {
    moduleSystem: true,
    documentTemplates: true,
    assessmentSystem: true,
    simulationSystem: true,
    portfolioManagement: true,
    exportFunctionality: false,
    advancedAnalytics: false,
    collaborativeFeatures: false,
    offlineMode: false,
    mobileApp: false
  },

  // Experimental Features
  experimental: {
    aiAssistant: false,
    virtualReality: false,
    blockchainCertification: false,
    realTimeCollaboration: false,
    advancedSimulations: false
  }
};

/**
 * Configuration Manager Class
 * Provides methods to manage and validate configuration
 */
export class ConfigManager {
  constructor(config = {}) {
    this.config = { ...config };
    this.environment = this.detectEnvironment();
    this.overrides = new Map();
    this.validators = new Map();
  }

  /**
   * Get configuration value
   * @param {string} path - Configuration path (dot notation)
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Configuration value
   */
  get(path, defaultValue = null) {
    // Check overrides first
    if (this.overrides.has(path)) {
      return this.overrides.get(path);
    }

    return this.getNestedValue(this.config, path, defaultValue);
  }

  /**
   * Set configuration value
   * @param {string} path - Configuration path
   * @param {*} value - Configuration value
   * @param {boolean} override - Whether to set as override
   */
  set(path, value, override = false) {
    if (override) {
      this.overrides.set(path, value);
    } else {
      this.setNestedValue(this.config, path, value);
    }

    // Validate if validator exists
    this.validatePath(path, value);
  }

  /**
   * Merge configuration
   * @param {Object} newConfig - Configuration to merge
   */
  merge(newConfig) {
    this.config = this.deepMerge(this.config, newConfig);
  }

  /**
   * Load environment-specific configuration
   * @param {string} environment - Environment name
   */
  loadEnvironment(environment) {
    const envConfig = this.config.environments?.[environment];
    if (envConfig) {
      this.merge(envConfig);
    }
  }

  /**
   * Add configuration validator
   * @param {string} path - Configuration path
   * @param {Function} validator - Validator function
   */
  addValidator(path, validator) {
    this.validators.set(path, validator);
  }

  /**
   * Validate configuration path
   * @param {string} path - Configuration path
   * @param {*} value - Value to validate
   * @returns {boolean} Validation result
   */
  validatePath(path, value) {
    const validator = this.validators.get(path);
    if (validator) {
      try {
        const result = validator(value);
        if (!result) {
          console.warn(`Configuration validation failed for ${path}:`, value);
        }
        return result;
      } catch (error) {
        console.error(`Configuration validator error for ${path}:`, error);
        return false;
      }
    }
    return true;
  }

  /**
   * Validate entire configuration
   * @returns {Object} Validation results
   */
  validateAll() {
    const results = {};
    
    for (const [path, validator] of this.validators) {
      const value = this.get(path);
      results[path] = this.validatePath(path, value);
    }

    return results;
  }

  /**
   * Detect current environment
   * @returns {string} Environment name
   */
  detectEnvironment() {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'development';
      } else if (window.location.hostname.includes('staging')) {
        return 'staging';
      } else {
        return 'production';
      }
    }
    return 'development';
  }

  /**
   * Get nested value from object
   * @param {Object} obj - Object to traverse
   * @param {string} path - Dot notation path
   * @param {*} defaultValue - Default value
   * @returns {*} Value or default
   */
  getNestedValue(obj, path, defaultValue = null) {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Set nested value in object
   * @param {Object} obj - Object to modify
   * @param {string} path - Dot notation path
   * @param {*} value - Value to set
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;

    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
  }

  /**
   * Deep merge objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Export configuration as JSON
   * @returns {string} JSON configuration
   */
  toJSON() {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   * @param {string} json - JSON configuration
   */
  fromJSON(json) {
    try {
      const parsed = JSON.parse(json);
      this.merge(parsed);
    } catch (error) {
      console.error('Failed to parse configuration JSON:', error);
    }
  }

  /**
   * Reset configuration to defaults
   */
  reset() {
    this.config = {};
    this.overrides.clear();
  }

  /**
   * Get configuration schema for validation
   * @returns {Object} Configuration schema
   */
  getSchema() {
    // Return JSON schema for configuration validation
    // This could be used with libraries like Ajv
    return {
      type: 'object',
      properties: {
        app: { type: 'object' },
        theme: { type: 'object' },
        i18n: { type: 'object' },
        storage: { type: 'object' },
        // ... more schema definitions
      }
    };
  }
}

// Export singleton instance
export const configManager = new ConfigManager();