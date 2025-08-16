# 🏗️ EC0249 Platform Architecture Documentation

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [Architecture Patterns](#-architecture-patterns)
- [Core Components](#-core-components)
- [Service Layer](#-service-layer)
- [Engine Layer](#-engine-layer)
- [View Layer](#-view-layer)
- [Data Flow](#-data-flow)
- [Module Lifecycle](#-module-lifecycle)
- [Event System](#-event-system)
- [State Management](#-state-management)
- [Security Architecture](#-security-architecture)
- [Performance Considerations](#-performance-considerations)

---

## 🎯 System Overview

The EC0249 Educational Platform implements a **modular, event-driven architecture** designed for scalability, maintainability, and extensibility. The system is built using modern JavaScript (ES2022+) with a focus on clean separation of concerns and loose coupling between components.

### 🏛️ Architectural Principles

1. **Modular Design**: Everything is a module extending the base Module class
2. **Dependency Injection**: Services are injected through ServiceContainer
3. **Event-Driven Communication**: Components communicate via EventBus
4. **Separation of Concerns**: Clear boundaries between layers
5. **Single Responsibility**: Each module has one primary purpose
6. **Composition over Inheritance**: Favor composition patterns
7. **Immutable Configuration**: Configuration is set at initialization

### 📐 System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      🎨 View Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ViewManager  │ │Controllers  │ │Components   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                      ⚙️ Engine Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ContentEngine│ │AssessmentEng│ │DocumentEng  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                      🔧 Service Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │I18nService  │ │StorageServ  │ │ThemeService │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                      🏗️ Core Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ServiceCont  │ │EventBus     │ │Module       │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Architecture Patterns

### 🏭 Dependency Injection Pattern

The **ServiceContainer** manages all application dependencies, providing:

- **Singleton Management**: Services instantiated once and reused
- **Factory Support**: Dynamic service creation
- **Dependency Resolution**: Automatic injection of required services
- **Lifecycle Management**: Service initialization and cleanup

```javascript
// Service Registration
container.singleton('I18nService', I18nService, {
  dependencies: ['StorageService', 'EventBus']
});

// Service Resolution
const i18n = container.resolve('I18nService');
```

### 📡 Event-Driven Architecture

The **EventBus** enables loose coupling through publish/subscribe:

- **Asynchronous Communication**: Non-blocking event publishing
- **Priority Handling**: Events processed by priority order
- **Middleware Support**: Event transformation and processing
- **Error Isolation**: Failed handlers don't affect others

```javascript
// Event Publishing
eventBus.publish('user:login', { userId: 123, timestamp: Date.now() });

// Event Subscription
eventBus.subscribe('user:login', (data) => {
  console.log('User logged in:', data.userId);
}, { priority: 10 });
```

### 🧩 Module Pattern

The **Module base class** provides standardized component structure:

- **Lifecycle Management**: Initialize, operate, destroy phases
- **Service Resolution**: Easy access to application services
- **Event Handling**: Built-in EventBus integration
- **Configuration Management**: Nested configuration access

```javascript
class CustomModule extends Module {
  constructor() {
    super('CustomModule', ['I18nService'], {
      timeout: 5000,
      retryCount: 3
    });
  }

  async onInitialize() {
    this.i18n = this.service('I18nService');
    this.subscribe('app:ready', this.handleAppReady.bind(this));
  }
}
```

---

## 🔗 Core Components

### 🏭 ServiceContainer

**Purpose**: Centralized dependency injection and service lifecycle management

**Key Features**:
- Singleton and factory service registration
- Automatic dependency resolution
- Service aliasing and scoping
- Circular dependency detection

**Usage Patterns**:
```javascript
// Register services
container.singleton('DatabaseService', DatabaseService);
container.factory('RequestBuilder', (container) => {
  return new RequestBuilder(container.resolve('ConfigService'));
});

// Register with dependencies
container.register('UserService', UserService, {
  dependencies: ['DatabaseService', 'LoggerService'],
  alias: ['Users']
});
```

### 📡 EventBus

**Purpose**: Application-wide communication hub

**Key Features**:
- Priority-based subscriber execution
- Middleware pipeline for event processing
- One-time subscriptions
- Promise-based event waiting

**Communication Categories**:
- **System Events**: `app:ready`, `module:initialized`
- **User Events**: `user:login`, `user:logout`
- **UI Events**: `view:changed`, `theme:changed`
- **Data Events**: `data:loaded`, `content:updated`

### 🧩 Module (Base Class)

**Purpose**: Foundation for all application modules

**Lifecycle Phases**:
1. **Construction**: Basic setup and configuration
2. **Initialization**: Service resolution and setup
3. **Operation**: Normal functioning and event handling
4. **Destruction**: Cleanup and resource release

**State Management**:
- `uninitialized`: Initial state after construction
- `initializing`: During initialization process
- `initialized`: Ready for operation
- `destroyed`: Cleaned up and unusable

---

## 🔧 Service Layer

### 🌍 I18nService

**Purpose**: Internationalization and localization management

**Key Features**:
- Multi-language support (Spanish/English)
- Dynamic DOM translation
- Variable interpolation in translations
- Browser language detection
- Persistent language preferences

**Translation Structure**:
```javascript
{
  "app": {
    "title": "EC0249 Educational Platform",
    "description": "Professional consulting certification platform"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "modules": "Modules"
  }
}
```

### 💾 StorageService

**Purpose**: Unified data persistence abstraction

**Storage Adapters**:
- **localStorage**: Persistent client-side storage
- **sessionStorage**: Session-based temporary storage
- **memory**: In-memory storage for testing
- **IndexedDB**: Large data storage (planned)

**Fallback Chain**:
localStorage → sessionStorage → memory

### 🎨 ThemeService

**Purpose**: Visual theme management and persistence

**Supported Themes**:
- **Auto**: System preference detection
- **Light**: Light color scheme
- **Dark**: Dark color scheme

**CSS Custom Properties**:
```css
:root {
  --primary-color: #007bff;
  --background-color: #ffffff;
  --text-color: #333333;
}
```

### 📊 ProgressService

**Purpose**: Learning progress tracking and analytics

**Progress Tracking**:
- Module completion percentage
- Assessment scores and attempts
- Time spent in each section
- Portfolio item completion

---

## ⚙️ Engine Layer

### 📚 ContentEngine

**Purpose**: Educational content management and rendering

**Content Types**:
- **Lessons**: Structured learning content
- **Interactive Elements**: Simulations, quizzes
- **Media**: Videos, audio, images
- **Activities**: Hands-on exercises

**Rendering Pipeline**:
1. Content loading from definitions
2. Template processing and rendering
3. Interactive element initialization
4. Media element setup
5. Progress tracking integration

### 📝 AssessmentEngine

**Purpose**: Knowledge evaluation and testing system

**Assessment Types**:
- **Multiple Choice**: Single and multiple correct answers
- **True/False**: Boolean questions
- **Short Answer**: Text input responses
- **Essay**: Long-form written responses
- **Case Study**: Scenario-based evaluations

**Scoring System**:
- Weighted scoring by question importance
- Partial credit for multiple choice
- Rubric-based evaluation for essays
- Time-based penalties (optional)

### 📄 DocumentEngine

**Purpose**: EC0249 document template management

**Template Categories**:
- **Element 1**: Problem identification documents (8 templates)
- **Element 2**: Solution development documents (2 templates)
- **Element 3**: Proposal presentation documents (5 templates)

**Document Features**:
- Real-time validation
- Auto-save functionality
- Version history
- PDF export capability

### 🎭 SimulationEngine

**Purpose**: Interactive practice scenarios

**Simulation Types**:
- **Interview Simulator**: Client consultation practice
- **Presentation Trainer**: Proposal presentation practice
- **Negotiation Scenarios**: Agreement discussion practice

**Evaluation System**:
- Criteria-based scoring
- Real-time feedback
- Performance analytics
- Improvement recommendations

---

## 🎨 View Layer

### 🎛️ ViewManager

**Purpose**: Centralized view coordination and routing

**View Controllers**:
- **DashboardViewController**: Main dashboard and overview
- **ModulesViewController**: Learning module navigation
- **AssessmentViewController**: Test and evaluation interface
- **PortfolioViewController**: Document and progress management

**Navigation Flow**:
```
Dashboard → Modules → Assessment → Portfolio
    ↑         ↓          ↓         ↓
    └─────────────────────────────┘
```

### 🎯 BaseViewController

**Purpose**: Common view controller functionality

**Responsibilities**:
- View lifecycle management
- Template rendering
- Event handling
- Language updates
- State synchronization

### 🧩 BaseComponent

**Purpose**: Reusable UI component foundation

**Component Features**:
- Reactive data binding
- Template-based rendering
- Event delegation
- Style encapsulation
- Child component management

---

## 🔄 Data Flow

### 👤 User Action Flow

```
1. User Interaction (click, input, navigation)
        ↓
2. Event Capture (ViewManager, ViewController)
        ↓
3. Action Processing (Engine layer)
        ↓
4. Service Interaction (Service layer)
        ↓
5. State Update (StateManager)
        ↓
6. Event Publication (EventBus)
        ↓
7. View Updates (Components re-render)
        ↓
8. User Feedback (Visual updates, notifications)
```

### 📚 Content Loading Flow

```
1. Content Request (user navigation)
        ↓
2. ContentEngine.loadContent()
        ↓
3. ContentLoader.loadContent() (from definitions)
        ↓
4. Template Processing (SectionRenderer)
        ↓
5. Media Initialization (MediaRenderer)
        ↓
6. Interactive Setup (InteractiveRenderer)
        ↓
7. DOM Rendering (container.appendChild)
        ↓
8. Progress Tracking (ProgressService)
```

### 💾 Data Persistence Flow

```
1. Data Change (user input, progress update)
        ↓
2. Engine Processing (validation, formatting)
        ↓
3. StorageService.set() (adapter selection)
        ↓
4. Adapter Write (localStorage, sessionStorage, memory)
        ↓
5. Event Publication (data:saved)
        ↓
6. UI Feedback (success indication)
```

---

## 🔄 Module Lifecycle

### Lifecycle Phases

```
┌─────────────────┐
│  Construction   │ → Basic setup, configuration
├─────────────────┤
│  Initialization │ → Service resolution, event binding
├─────────────────┤
│    Operation    │ → Normal functioning, user interaction
├─────────────────┤
│   Destruction   │ → Cleanup, resource release
└─────────────────┘
```

### Initialization Sequence

```javascript
// 1. Module construction
const module = new CustomModule();

// 2. Container and EventBus injection
await module.initialize(container, eventBus);

// 3. Dependency resolution
module.resolveDependencies();

// 4. Custom initialization
await module.onInitialize();

// 5. Child module initialization
await module.initializeChildren();

// 6. Ready state
module.state = 'initialized';
```

### Destruction Sequence

```javascript
// 1. Child module destruction
await module.destroyChildren();

// 2. Custom cleanup
await module.onDestroy();

// 3. Event subscription cleanup
module.clearSubscriptions();

// 4. Final state
module.state = 'destroyed';
```

---

## 📡 Event System

### Event Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **System** | Application lifecycle | `app:ready`, `module:initialized` |
| **User** | User actions | `user:login`, `user:action` |
| **Navigation** | View changes | `view:changed`, `section:changed` |
| **Content** | Learning content | `content:loaded`, `lesson:completed` |
| **Assessment** | Testing events | `assessment:started`, `question:answered` |
| **Document** | Template events | `document:saved`, `template:validated` |
| **UI** | Interface updates | `theme:changed`, `language:changed` |

### Event Naming Convention

```
<category>:<action>[:<target>]

Examples:
- user:login
- content:loaded:lesson
- assessment:completed:module1
- document:saved:template
```

### Priority System

```javascript
// Critical system events (priority: 100)
eventBus.subscribe('app:shutdown', handler, { priority: 100 });

// High priority user events (priority: 50)
eventBus.subscribe('user:login', handler, { priority: 50 });

// Normal priority (priority: 0, default)
eventBus.subscribe('content:updated', handler);

// Low priority logging (priority: -10)
eventBus.subscribe('*', logHandler, { priority: -10 });
```

---

## 💾 State Management

### Application State Structure

```javascript
{
  currentView: 'dashboard',
  currentSection: 'overview',
  userProgress: {
    module1: { theory: 75, practice: 60, assessment: false },
    module2: { theory: 30, practice: 0, assessment: false },
    module3: { theory: 0, practice: 0, assessment: false },
    module4: { theory: 0, practice: 0, assessment: false }
  },
  portfolioItems: [
    { id: 1, type: 'document', templateId: 'plan-trabajo', status: 'completed' },
    { id: 2, type: 'assessment', moduleId: 'module1', score: 85 }
  ],
  preferences: {
    theme: 'auto',
    language: 'es',
    notifications: true
  }
}
```

### State Update Patterns

```javascript
// Direct state update
this.appState.currentView = 'modules';

// Service-mediated update
await this.storageService.set('userProgress', progressData);

// Event-driven update
this.emit('state:changed', { 
  key: 'currentView', 
  oldValue: 'dashboard', 
  newValue: 'modules' 
});
```

---

## 🔒 Security Architecture

### Input Validation

```javascript
// Template input sanitization
processTextContent(content) {
  // Basic HTML sanitization
  const allowedTags = ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li'];
  return sanitizeHTML(content, allowedTags);
}

// Configuration validation
validateConfig(config) {
  const schema = {
    timeout: { type: 'number', min: 1000, max: 60000 },
    retryCount: { type: 'number', min: 0, max: 10 }
  };
  return validateAgainstSchema(config, schema);
}
```

### Content Security

- **No eval() usage**: All code execution is through standard function calls
- **Template sanitization**: User content is sanitized before rendering
- **Event isolation**: Event handlers cannot access global scope
- **Module encapsulation**: Private properties and methods

### Data Protection

- **Local storage only**: No data transmitted to external servers
- **Encryption ready**: Storage service supports encryption adapters
- **Audit trail**: All user actions are logged for analytics
- **Secure defaults**: Conservative security settings by default

---

## ⚡ Performance Considerations

### Loading Optimization

```javascript
// Lazy loading of services
container.register('HeavyService', HeavyService, { lazy: true });

// Code splitting by engine
const assessmentEngine = await import('./engines/AssessmentEngine.js');

// Translation preloading
await Promise.all([
  i18n.loadLanguage('es'),
  i18n.loadLanguage('en')
]);
```

### Memory Management

```javascript
// Automatic subscription cleanup
class MyModule extends Module {
  async onDestroy() {
    // Subscriptions automatically cleaned up
    this.clearSubscriptions();
    
    // Manual cleanup for custom resources
    this.customCache.clear();
    this.mediaElements.forEach(el => el.remove());
  }
}
```

### Rendering Optimization

- **Virtual DOM patterns**: Efficient DOM updates
- **Event delegation**: Single event listeners for multiple elements
- **Template caching**: Compiled templates cached in memory
- **Intersection Observer**: Lazy loading for content sections

### Bundle Optimization

- **Tree shaking**: Unused code eliminated
- **Dynamic imports**: Engines loaded on demand
- **Asset optimization**: Images and media optimized
- **Gzip compression**: All assets compressed

---

## 📊 Performance Metrics

### Target Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Initial Load** | < 3 seconds | First meaningful paint |
| **Route Navigation** | < 500ms | View transition time |
| **Content Rendering** | < 1 second | Template to visible |
| **Assessment Loading** | < 2 seconds | Question display time |
| **Memory Usage** | < 50MB | Sustained operation |
| **Bundle Size** | < 2MB | Compressed JavaScript |

### Monitoring

```javascript
// Performance tracking
const startTime = performance.now();
await engine.loadContent(contentId);
const loadTime = performance.now() - startTime;

// Memory monitoring
const memoryInfo = performance.memory;
console.log('Used memory:', memoryInfo.usedJSHeapSize);

// User timing API
performance.mark('content-load-start');
await loadContent();
performance.mark('content-load-end');
performance.measure('content-load', 'content-load-start', 'content-load-end');
```

---

## 🔧 Development Tools

### Debug Mode

```javascript
// Enable debugging
eventBus.setDebugMode(true);
console.debug('[EventBus] user:login published with data:', userData);

// Module information
console.log(module.getInfo());
// {
//   name: 'ContentEngine',
//   state: 'initialized',
//   dependencies: ['I18nService', 'StorageService'],
//   children: ['MediaRenderer', 'SectionRenderer'],
//   subscriptions: 12
// }
```

### Dependency Visualization

```javascript
// Service dependency graph
const graph = container.getDependencyGraph();
console.log(graph);
// {
//   'ContentEngine': ['I18nService', 'StorageService'],
//   'AssessmentEngine': ['StorageService', 'EventBus'],
//   'I18nService': ['StorageService']
// }

// Circular dependency detection
const isValid = container.validateDependencies();
if (!isValid) {
  console.error('Circular dependencies detected!');
}
```

---

## 🚀 Extensibility

### Adding New Modules

```javascript
// 1. Create module class
class NewFeatureModule extends Module {
  constructor() {
    super('NewFeatureModule', ['I18nService'], {
      setting1: 'value1'
    });
  }
  
  async onInitialize() {
    // Custom initialization
  }
}

// 2. Register in application
app.addModule(new NewFeatureModule());

// 3. Module auto-initializes with application
```

### Custom Services

```javascript
// 1. Create service class
class CustomService {
  constructor(dependencies) {
    this.config = dependencies.config;
  }
  
  async doSomething() {
    // Service implementation
  }
}

// 2. Register service
container.singleton('CustomService', CustomService, {
  dependencies: ['ConfigService']
});

// 3. Use in modules
class MyModule extends Module {
  async onInitialize() {
    this.customService = this.service('CustomService');
  }
}
```

### New Content Types

```javascript
// 1. Create content renderer
class NewContentRenderer {
  async render(content, container) {
    // Custom rendering logic
  }
}

// 2. Register with ContentEngine
contentEngine.registerRenderer('new-type', NewContentRenderer);

// 3. Use in content definitions
const content = {
  type: 'new-type',
  data: { /* custom data */ }
};
```

---

This architecture documentation provides a comprehensive understanding of the EC0249 platform's design, implementation patterns, and extension mechanisms. The modular, event-driven architecture ensures scalability, maintainability, and testability while supporting the platform's educational goals.