# EC0249 Platform API Documentation

## Table of Contents

- [Overview](#overview)
- [Core System APIs](#core-system-apis)
- [Service APIs](#service-apis)
- [Engine APIs](#engine-apis)
- [Component APIs](#component-apis)
- [Event System](#event-system)
- [Integration Examples](#integration-examples)
- [Error Handling](#error-handling)
- [Type Definitions](#type-definitions)

## Overview

This document provides comprehensive API documentation for the EC0249 Educational Platform. The platform follows a modular architecture with dependency injection, providing well-defined APIs for each layer.

### API Categories

1. **Core APIs**: ServiceContainer, EventBus, Module, StateManager
2. **Service APIs**: I18nService, StorageService, ThemeService, etc.
3. **Engine APIs**: ContentEngine, AssessmentEngine, DocumentEngine, SimulationEngine
4. **Component APIs**: BaseComponent, ViewManager, ViewControllers
5. **Configuration APIs**: AppConfig, ConfigManager

## Core System APIs

### ServiceContainer

The ServiceContainer provides dependency injection and service lifecycle management.

#### Methods

##### `register(name, service, options)`

Register a service in the container.

```javascript
/**
 * @param {string} name - Service name
 * @param {Function|Object} service - Service class or instance
 * @param {Object} options - Registration options
 * @param {boolean} [options.singleton=true] - Singleton pattern
 * @param {Array<string>} [options.dependencies=[]] - Dependencies
 * @param {boolean} [options.factory=false] - Factory function
 * @param {string|Array<string>} [options.alias] - Service aliases
 * @returns {ServiceContainer} - Container instance for chaining
 */

// Example
container.register('UserService', UserService, {
  dependencies: ['DatabaseService', 'LoggerService'],
  singleton: true,
  alias: ['Users']
});
```

##### `resolve(name)`

Resolve a service instance.

```javascript
/**
 * @param {string} name - Service name or alias
 * @returns {*} - Service instance
 * @throws {Error} - If service not registered
 */

// Example
const userService = container.resolve('UserService');
const logger = container.resolve('Logger');
```

##### `singleton(name, service, options)`

Register a singleton service (convenience method).

```javascript
// Example
container.singleton('ConfigService', ConfigService);
```

##### `factory(name, factory, options)`

Register a factory service (convenience method).

```javascript
// Example
container.factory('RequestBuilder', (container) => {
  const config = container.resolve('ConfigService');
  return new RequestBuilder(config.apiUrl);
});
```

### EventBus

The EventBus provides decoupled communication between modules.

#### Methods

##### `subscribe(event, callback, options)`

Subscribe to an event.

```javascript
/**
 * @param {string} event - Event name
 * @param {Function} callback - Event handler
 * @param {Object} [options={}] - Subscription options
 * @param {boolean} [options.once=false] - One-time subscription
 * @param {number} [options.priority=0] - Handler priority
 * @returns {Function} - Unsubscribe function
 */

// Example
const unsubscribe = eventBus.subscribe('user:login', (userData) => {
  console.log('User logged in:', userData.id);
}, { once: true });
```

##### `publish(event, data)`

Publish an event.

```javascript
/**
 * @param {string} event - Event name
 * @param {*} [data] - Event data
 * @returns {Promise<void>}
 */

// Example
await eventBus.publish('user:login', {
  userId: 123,
  timestamp: Date.now()
});
```

### Module

Base class for all application modules.

#### Constructor

```javascript
/**
 * @param {string} name - Module name
 * @param {Array<string>} [dependencies=[]] - Service dependencies
 * @param {Object} [config={}] - Module configuration
 */

class CustomModule extends Module {
  constructor() {
    super('CustomModule', ['I18nService'], {
      timeout: 5000,
      retries: 3
    });
  }
}
```

#### Methods

##### `initialize(container, eventBus)`

Initialize the module.

```javascript
/**
 * @param {ServiceContainer} container - Service container
 * @param {EventBus} eventBus - Event bus
 * @returns {Promise<void>}
 */

// Automatically called by the application
await module.initialize(container, eventBus);
```

##### `service(name)`

Resolve a service from the container.

```javascript
/**
 * @param {string} name - Service name
 * @returns {*} - Service instance
 */

// In module methods
const i18n = this.service('I18nService');
const storage = this.service('StorageService');
```

##### `subscribe(event, callback, options)`

Subscribe to events with automatic cleanup.

```javascript
/**
 * @param {string} event - Event name
 * @param {Function} callback - Event handler
 * @param {Object} [options={}] - Subscription options
 * @returns {Function} - Unsubscribe function
 */

// In onInitialize method
this.subscribe('content:loaded', this.handleContentLoaded.bind(this));
```

##### `emit(event, data)`

Emit an event.

```javascript
/**
 * @param {string} event - Event name
 * @param {*} [data] - Event data
 * @returns {Promise<void>}
 */

await this.emit('module:ready', { module: this.name });
```

## Service APIs

### I18nService

Internationalization and localization service.

#### Methods

##### `t(key, variables, language)`

Translate a key to localized text.

```javascript
/**
 * @param {string} key - Translation key (dot notation)
 * @param {Object} [variables={}] - Interpolation variables
 * @param {string} [language=null] - Target language
 * @returns {string} - Translated text
 */

// Examples
const title = i18n.t('app.title');
const greeting = i18n.t('user.greeting', { name: 'Maria' });
const spanishTitle = i18n.t('app.title', {}, 'es');
```

##### `setLanguage(language)`

Set the current language.

```javascript
/**
 * @param {string} language - Language code ('es', 'en')
 * @returns {Promise<void>}
 */

await i18n.setLanguage('en');
```

##### `getCurrentLanguage()`

Get the current language.

```javascript
/**
 * @returns {string} - Current language code
 */

const currentLang = i18n.getCurrentLanguage(); // 'es'
```

##### `translatePage()`

Translate all DOM elements with data-i18n attributes.

```javascript
/**
 * @returns {void}
 */

i18n.translatePage();
```

### StorageService

Unified storage abstraction with multiple adapters.

#### Methods

##### `set(key, value, options)`

Store a value.

```javascript
/**
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {Object} [options={}] - Storage options
 * @param {number} [options.ttl] - Time to live in ms
 * @param {string} [options.adapter] - Specific adapter to use
 * @returns {Promise<void>}
 */

await storage.set('user_progress', progressData);
await storage.set('temp_data', data, { ttl: 3600000 }); // 1 hour
```

##### `get(key, defaultValue)`

Retrieve a value.

```javascript
/**
 * @param {string} key - Storage key
 * @param {*} [defaultValue=null] - Default value if not found
 * @returns {Promise<*>} - Stored value or default
 */

const progress = await storage.get('user_progress', {});
const settings = await storage.get('app_settings', { theme: 'auto' });
```

##### `remove(key)`

Remove a value.

```javascript
/**
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} - True if removed
 */

const removed = await storage.remove('user_session');
```

### ThemeService

Theme management and switching service.

#### Methods

##### `setTheme(theme)`

Set the current theme.

```javascript
/**
 * @param {string} theme - Theme name ('auto', 'light', 'dark')
 * @returns {Promise<void>}
 */

await themeService.setTheme('dark');
```

##### `getCurrentTheme()`

Get the current theme.

```javascript
/**
 * @returns {string} - Current theme name
 */

const theme = themeService.getCurrentTheme(); // 'auto'
```

##### `getAvailableThemes()`

Get available themes.

```javascript
/**
 * @returns {Array<string>} - Available theme names
 */

const themes = themeService.getAvailableThemes(); // ['auto', 'light', 'dark']
```

## Engine APIs

### ContentEngine

Educational content loading and rendering engine.

#### Methods

##### `loadContent(contentConfig)`

Load content from configuration.

```javascript
/**
 * @param {Object} contentConfig - Content configuration
 * @param {string} contentConfig.id - Content ID
 * @param {string} contentConfig.type - Content type
 * @param {string} [contentConfig.title] - Content title
 * @returns {Promise<Object>} - Loaded content object
 */

const content = await contentEngine.loadContent({
  id: 'module1-lesson1',
  type: 'lesson',
  title: 'Introduction to Consulting'
});
```

##### `renderContent(container, content, options)`

Render content in DOM container.

```javascript
/**
 * @param {HTMLElement} container - Target container
 * @param {Object} [content=null] - Content to render
 * @param {Object} [options={}] - Render options
 * @param {string} [options.transition] - Transition effect
 * @returns {Promise<void>}
 */

await contentEngine.renderContent(containerElement, null, {
  transition: 'fadeIn'
});
```

### AssessmentEngine

Knowledge verification and testing engine.

#### Methods

##### `startAssessment(assessmentId, options)`

Start an assessment session.

```javascript
/**
 * @param {string} assessmentId - Assessment identifier
 * @param {Object} [options={}] - Assessment options
 * @returns {Promise<Object>} - Assessment session data
 */

const session = await assessmentEngine.startAssessment('module1-quiz', {
  timeLimit: 3600 // 1 hour
});
```

##### `submitAnswer(sessionId, questionId, answer)`

Submit an answer for a question.

```javascript
/**
 * @param {string} sessionId - Session identifier
 * @param {string} questionId - Question identifier
 * @param {*} answer - User's answer
 * @returns {Promise<Object>} - Submission result
 */

const result = await assessmentEngine.submitAnswer(
  session.sessionId,
  'question1',
  'answer_option_a'
);
```

##### `completeAssessment(sessionId)`

Complete an assessment and get results.

```javascript
/**
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} - Assessment results
 */

const results = await assessmentEngine.completeAssessment(session.sessionId);
```

### DocumentEngine

EC0249 document template generation engine.

#### Methods

##### `getTemplates()`

Get available document templates.

```javascript
/**
 * @returns {Array<Object>} - Available templates
 */

const templates = documentEngine.getTemplates();
```

##### `createDocument(templateId, data)`

Create a document from template.

```javascript
/**
 * @param {string} templateId - Template identifier
 * @param {Object} [data={}] - Initial document data
 * @returns {Object} - Document instance
 */

const document = documentEngine.createDocument('problema-identification', {
  clientName: 'Empresa ABC',
  consultantName: 'Maria Garcia'
});
```

## Component APIs

### BaseComponent

Foundation class for UI components.

#### Constructor

```javascript
/**
 * @param {string} name - Component name
 * @param {HTMLElement} [element=null] - Target element
 * @param {Object} [options={}] - Component options
 */

class CustomComponent extends BaseComponent {
  constructor(element, options) {
    super('CustomComponent', element, {
      template: this.template,
      events: {
        'click .button': 'handleClick'
      },
      reactive: true
    });
  }
}
```

#### Methods

##### `mount(element)`

Mount component to DOM.

```javascript
/**
 * @param {HTMLElement} [element=null] - Target element
 * @returns {Promise<void>}
 */

await component.mount(document.getElementById('container'));
```

##### `setData(key, value)`

Update component data.

```javascript
/**
 * @param {string|Object} key - Data key or data object
 * @param {*} [value=null] - Data value
 * @returns {void}
 */

component.setData('title', 'New Title');
component.setData({ title: 'New Title', subtitle: 'Description' });
```

##### `getData(key)`

Get component data.

```javascript
/**
 * @param {string} [key=null] - Data key
 * @returns {*} - Data value or entire data object
 */

const title = component.getData('title');
const allData = component.getData();
```

## Event System

### Event Categories

#### Application Events (`app:*`)

- `app:initialized`: Application initialization complete
- `app:view-change`: View changed
- `app:section-change`: Section changed
- `app:error`: Application error occurred

#### Module Events (`module:*`)

- `module:initialized`: Module initialization complete
- `module:destroyed`: Module destroyed
- `module:error`: Module error occurred

#### Content Events (`content:*`)

- `content:loading`: Content loading started
- `content:loaded`: Content loading complete
- `content:rendered`: Content rendering complete
- `content:error`: Content loading/rendering error

#### Assessment Events (`assessment:*`)

- `assessment:started`: Assessment session started
- `assessment:completed`: Assessment completed
- `assessment:time_expired`: Assessment time limit reached
- `question:answered`: Question answered

#### User Events (`user:*`)

- `user:progress-updated`: User progress changed
- `user:achievement-unlocked`: Achievement earned
- `user:session-expired`: User session expired

### Event Data Structures

#### Content Events

```javascript
// content:loaded
{
  content: {
    id: 'module1-lesson1',
    type: 'lesson',
    title: 'Introduction to Consulting'
  },
  fromCache: false,
  loadTime: 1250
}

// content:rendered
{
  contentId: 'module1-lesson1',
  duration: 340
}
```

#### Assessment Events

```javascript
// assessment:started
{
  sessionId: 'session_123456',
  assessmentId: 'module1-quiz',
  totalQuestions: 10,
  timeLimit: 3600
}

// assessment:completed
{
  sessionId: 'session_123456',
  results: {
    score: 85,
    passed: true,
    totalQuestions: 10,
    correctAnswers: 8
  }
}
```

## Integration Examples

### Creating a Custom Module

```javascript
import Module from './core/Module.js';

class CustomLearningModule extends Module {
  constructor() {
    super('CustomLearningModule', ['I18nService', 'StorageService'], {
      autoSave: true,
      saveInterval: 30000
    });
    
    this.learningData = new Map();
  }

  async onInitialize() {
    // Resolve dependencies
    this.i18n = this.service('I18nService');
    this.storage = this.service('StorageService');
    
    // Subscribe to events
    this.subscribe('content:loaded', this.handleContentLoaded.bind(this));
    this.subscribe('user:progress-updated', this.handleProgressUpdate.bind(this));
    
    // Load saved data
    await this.loadSavedData();
    
    console.log(`${this.name} initialized successfully`);
  }

  async handleContentLoaded(data) {
    // Process loaded content
    const processed = await this.processContent(data.content);
    
    // Store in learning data
    this.learningData.set(data.content.id, processed);
    
    // Emit processed event
    await this.emit('learning:content-processed', {
      contentId: data.content.id,
      processed
    });
  }

  async processContent(content) {
    // Custom content processing logic
    return {
      ...content,
      processedAt: Date.now(),
      difficulty: this.calculateDifficulty(content)
    };
  }

  async loadSavedData() {
    try {
      const saved = await this.storage.get('learning_module_data');
      if (saved) {
        this.learningData = new Map(saved);
      }
    } catch (error) {
      console.warn('Failed to load saved learning data:', error);
    }
  }
}

// Register and use the module
const learningModule = new CustomLearningModule();
await learningModule.initialize(container, eventBus);
```

### Creating a Custom Service

```javascript
import Module from './core/Module.js';

class AnalyticsService extends Module {
  constructor() {
    super('AnalyticsService', ['StorageService'], {
      batchSize: 10,
      flushInterval: 30000
    });
    
    this.events = [];
    this.timer = null;
  }

  async onInitialize() {
    this.storage = this.service('StorageService');
    
    // Subscribe to all analytics events
    this.subscribe('analytics:track', this.trackEvent.bind(this));
    
    // Start batch processing
    this.startBatchProcessing();
  }

  trackEvent(eventData) {
    const event = {
      ...eventData,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };
    
    this.events.push(event);
    
    if (this.events.length >= this.getConfig('batchSize')) {
      this.flushEvents();
    }
  }

  async flushEvents() {
    if (this.events.length === 0) return;
    
    const batch = [...this.events];
    this.events = [];
    
    try {
      await this.storage.set('analytics_batch', batch);
      console.log(`Flushed ${batch.length} analytics events`);
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-add events for retry
      this.events.unshift(...batch);
    }
  }

  startBatchProcessing() {
    this.timer = setInterval(() => {
      this.flushEvents();
    }, this.getConfig('flushInterval'));
  }

  async onDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    // Flush remaining events
    await this.flushEvents();
  }
}

// Register the service
container.singleton('AnalyticsService', AnalyticsService, {
  dependencies: ['StorageService']
});

// Use the service
const analytics = container.resolve('AnalyticsService');
```

### Creating a Custom Component

```javascript
import BaseComponent from './components/BaseComponent.js';

class ProgressChart extends BaseComponent {
  constructor(element, options) {
    super('ProgressChart', element, {
      template: options.template || this.defaultTemplate,
      events: {
        'click .chart-bar': 'handleBarClick',
        'mouseenter .chart-bar': 'showTooltip',
        'mouseleave .chart-bar': 'hideTooltip'
      },
      reactive: true,
      data: {
        modules: [],
        totalProgress: 0
      }
    });
  }

  defaultTemplate(data) {
    return `
      <div class="progress-chart">
        <h3 class="chart-title">${data.title || 'Learning Progress'}</h3>
        <div class="chart-container">
          ${data.modules.map(module => `
            <div class="chart-bar" data-module="${module.id}">
              <div class="bar-fill" style="height: ${module.progress}%"></div>
              <span class="bar-label">${module.name}</span>
            </div>
          `).join('')}
        </div>
        <div class="chart-summary">
          <span>Overall Progress: ${data.totalProgress}%</span>
        </div>
      </div>
    `;
  }

  async getStyles() {
    return `
      .progress-chart {
        padding: 1rem;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
      }
      
      .chart-container {
        display: flex;
        align-items: flex-end;
        gap: 0.5rem;
        height: 200px;
        margin: 1rem 0;
      }
      
      .chart-bar {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      }
      
      .bar-fill {
        width: 100%;
        background: var(--color-primary);
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        transition: background-color 0.2s;
      }
      
      .chart-bar:hover .bar-fill {
        background: var(--color-primary-hover);
      }
    `;
  }

  handleBarClick(event) {
    const moduleId = event.target.closest('.chart-bar').dataset.module;
    this.emit('module:selected', { moduleId });
  }

  showTooltip(event) {
    // Implement tooltip display
  }

  hideTooltip(event) {
    // Implement tooltip hiding
  }

  updateProgress(moduleId, progress) {
    const modules = this.getData('modules');
    const module = modules.find(m => m.id === moduleId);
    
    if (module) {
      module.progress = progress;
      this.setData('modules', modules);
      
      // Recalculate total progress
      const total = modules.reduce((sum, m) => sum + m.progress, 0) / modules.length;
      this.setData('totalProgress', Math.round(total));
    }
  }
}

// Use the component
const chartElement = document.getElementById('progress-chart');
const progressChart = new ProgressChart(chartElement, {
  data: {
    title: 'EC0249 Module Progress',
    modules: [
      { id: 'module1', name: 'Fundamentals', progress: 75 },
      { id: 'module2', name: 'Problem ID', progress: 50 },
      { id: 'module3', name: 'Solutions', progress: 25 },
      { id: 'module4', name: 'Presentation', progress: 0 }
    ]
  }
});

await progressChart.initialize(container, eventBus);
```

## Error Handling

### Error Types

The platform defines specific error types for better error handling:

```javascript
// Validation errors
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Service errors
class ServiceError extends Error {
  constructor(message, service = null, cause = null) {
    super(message);
    this.name = 'ServiceError';
    this.service = service;
    this.cause = cause;
  }
}

// Content errors
class ContentLoadError extends Error {
  constructor(message, contentId = null) {
    super(message);
    this.name = 'ContentLoadError';
    this.contentId = contentId;
  }
}

// Assessment errors
class AssessmentError extends Error {
  constructor(message, assessmentId = null, sessionId = null) {
    super(message);
    this.name = 'AssessmentError';
    this.assessmentId = assessmentId;
    this.sessionId = sessionId;
  }
}
```

### Error Handling Patterns

```javascript
// Service method with error handling
async function loadUserProgress(userId) {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Invalid user ID', 'userId');
    }
    
    // Attempt to load data
    const progress = await storage.get(`user_progress_${userId}`);
    
    if (!progress) {
      throw new ServiceError('User progress not found', 'ProgressService');
    }
    
    return progress;
    
  } catch (error) {
    // Log error with context
    logger.error('Failed to load user progress', {
      userId,
      error: error.message,
      stack: error.stack
    });
    
    // Re-throw with additional context
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServiceError(
      'Failed to load user progress',
      'ProgressService',
      error
    );
  }
}
```

## Type Definitions

### Common Types

```javascript
/**
 * @typedef {Object} ContentConfig
 * @property {string} id - Content identifier
 * @property {string} type - Content type ('lesson', 'activity', 'assessment')
 * @property {string} [title] - Content title
 * @property {string} [overview] - Content overview
 * @property {Array<Object>} [sections] - Content sections
 * @property {Array<Object>} [activities] - Activities
 * @property {Object} [assessment] - Assessment configuration
 */

/**
 * @typedef {Object} AssessmentSession
 * @property {string} sessionId - Session identifier
 * @property {string} assessmentId - Assessment identifier
 * @property {Array<Object>} questions - Assessment questions
 * @property {number} startTime - Start timestamp
 * @property {number} [timeLimit] - Time limit in seconds
 * @property {Map<string, Object>} responses - User responses
 * @property {string} status - Session status
 */

/**
 * @typedef {Object} UserProgress
 * @property {Object} module1 - Module 1 progress
 * @property {number} module1.theory - Theory completion percentage
 * @property {number} module1.practice - Practice completion percentage
 * @property {boolean} module1.assessment - Assessment completed
 */

/**
 * @typedef {Object} ModuleConfig
 * @property {string} id - Module identifier
 * @property {string} title - Module title
 * @property {string} icon - Module icon
 * @property {string} color - Module color theme
 * @property {number} lessons - Number of lessons
 * @property {number} assessments - Number of assessments
 */

/**
 * @typedef {Object} TranslationKey
 * @property {string} key - Translation key in dot notation
 * @property {Object} [variables] - Interpolation variables
 * @property {string} [language] - Target language code
 */
```

---

This API documentation provides comprehensive coverage of the EC0249 platform's public interfaces, enabling developers to effectively integrate with and extend the system.