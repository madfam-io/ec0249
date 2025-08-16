# EC0249 Platform Component Architecture Patterns

## Overview

The EC0249 educational platform implements a sophisticated component-based architecture with clear separation of concerns, modular design, and powerful abstraction patterns. This document provides comprehensive guidance on the component architecture, inheritance hierarchies, and development patterns used throughout the platform.

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Component Hierarchy](#component-hierarchy)
3. [Base Classes and Patterns](#base-classes-and-patterns)
4. [View Controller Architecture](#view-controller-architecture)
5. [Renderer Architecture](#renderer-architecture)
6. [Service and State Management](#service-and-state-management)
7. [Event Handling Patterns](#event-handling-patterns)
8. [Development Guidelines](#development-guidelines)
9. [Best Practices](#best-practices)

## Core Architecture

### Architectural Principles

The platform follows these key architectural principles:

- **Separation of Concerns**: Clear boundaries between data, presentation, and business logic
- **Dependency Injection**: Service container pattern for loose coupling
- **Event-Driven Communication**: Publish/subscribe pattern for component coordination
- **Modular Design**: Self-contained, reusable components with defined interfaces
- **Reactive State Management**: Immutable state with reactive updates
- **Lifecycle Management**: Consistent initialization, operation, and cleanup patterns

### Core Foundation Classes

```
Module (Base Class)
├── BaseComponent (UI Components)
├── BaseViewController (View Controllers)
├── Service Classes (Business Logic)
└── Engine Classes (Content Processing)
```

## Component Hierarchy

### 1. Module Class (`src/js/core/Module.js`)

**Purpose**: Foundation for all application modules providing standardized lifecycle management, dependency injection, and event communication.

**Key Features**:
- Dependency injection with automatic resolution
- Event-driven communication via EventBus integration
- Hierarchical module structure with parent/child relationships
- Configuration management with nested property access
- Subscription management for automatic cleanup

**Lifecycle Methods**:
```javascript
// Override in subclasses
async onInitialize() // Custom initialization logic
async onDestroy()    // Custom cleanup logic
```

**Usage Pattern**:
```javascript
class UserModule extends Module {
  constructor() {
    super('UserModule', ['DatabaseService', 'LoggerService'], {
      cacheTimeout: 300000,
      validateUsers: true
    });
  }

  async onInitialize() {
    this.db = this.service('DatabaseService');
    this.logger = this.service('LoggerService');
    this.subscribe('user:created', this.handleUserCreated.bind(this));
  }
}
```

### 2. BaseComponent Class (`src/js/components/BaseComponent.js`)

**Purpose**: Foundation for all UI components providing templating, event handling, lifecycle management, and reactive data binding.

**Key Features**:
- Component lifecycle management (mount, unmount, render)
- Reactive data binding with automatic re-rendering
- Template-based rendering with variable interpolation
- Event handling with automatic cleanup
- CSS encapsulation and scoped styling
- Shadow DOM support for true encapsulation
- Parent-child component relationships

**Component Lifecycle**:
1. **Construction**: Component setup and configuration
2. **Mounting**: DOM attachment and initialization
3. **Rendering**: Template processing and DOM updates
4. **Operation**: User interaction and state changes
5. **Unmounting**: Cleanup and resource release

**Template System**:
```javascript
// Function-based template (recommended)
template(data) {
  return `
    <div class="user-card">
      <h3>${data.name}</h3>
      <p>${data.email}</p>
      <button class="edit-btn">Edit</button>
    </div>
  `;
}

// String template with interpolation
template: "{{name}} - {{email}}"
```

**Event Binding Pattern**:
```javascript
events: {
  'click .edit-btn': 'handleEdit',
  'change .user-input': 'handleInputChange'
}
```

**Usage Example**:
```javascript
class ThemeToggle extends BaseComponent {
  constructor(element, options = {}) {
    super('ThemeToggle', element, {
      dependencies: ['ThemeService', 'I18nService'],
      config: {
        showText: options.showText !== false,
        style: options.style || 'button'
      },
      events: {
        'click .theme-toggle-btn': 'handleToggleClick'
      },
      autoMount: true,
      reactive: true
    });
  }
}
```

### 3. BaseViewController Class (`src/js/views/BaseViewController.js`)

**Purpose**: Foundation for view controllers managing view lifecycle, navigation, and UI coordination.

**Key Features**:
- View lifecycle management (show, hide, render)
- Navigation state synchronization
- Event handling and emission
- Service access and coordination
- Language updates and internationalization

**Lifecycle Methods**:
```javascript
async onInitialize()    // View-specific initialization
bindEvents()           // Event binding setup
onShow()              // View activation logic
onHide()              // View deactivation logic
async onRender()      // Rendering logic
onLanguageUpdate()    // Language change handling
```

**Usage Pattern**:
```javascript
class DashboardViewController extends BaseViewController {
  async onInitialize() {
    await this.loadProgressData();
  }

  bindEvents() {
    this.findElements('.module-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const moduleId = card.getAttribute('data-module');
        this.navigateToModule(moduleId);
      });
    });
  }
}
```

## Base Classes and Patterns

### Service Container Pattern (`src/js/core/ServiceContainer.js`)

**Purpose**: Centralized dependency injection and service management with lifecycle control.

**Features**:
- Singleton and factory service registration
- Automatic dependency resolution
- Service aliases and lazy loading
- Circular dependency detection
- Service lifecycle management (boot/shutdown)

**Registration Patterns**:
```javascript
// Singleton service
container.singleton('ConfigService', ConfigService);

// Factory service
container.factory('RequestBuilder', (container) => {
  const config = container.resolve('ConfigService');
  return new RequestBuilder(config.apiUrl);
});

// Service with dependencies
container.register('UserService', UserService, {
  dependencies: ['DatabaseService', 'LoggerService'],
  alias: ['Users', 'UserRepo']
});
```

### Event Bus Pattern (`src/js/core/EventBus.js`)

**Purpose**: Centralized event management system for application-wide communication.

**Features**:
- Priority-based event handling
- Middleware support for event processing
- One-time subscriptions with automatic cleanup
- Promise-based event waiting with timeout support
- Debug mode for development

**Usage Patterns**:
```javascript
// Subscribe to events
eventBus.subscribe('user:login', (userData) => {
  console.log('User logged in:', userData.username);
}, { priority: 10 });

// Publish events
await eventBus.publish('user:login', {
  username: 'john_doe',
  timestamp: Date.now()
});

// Wait for events
const userData = await eventBus.waitFor('user:ready', 5000);
```

### State Manager Pattern (`src/js/core/StateManager.js`)

**Purpose**: Centralized state management with immutable updates and reactive subscriptions.

**Features**:
- Immutable state with action dispatch
- Middleware for state processing
- Path-specific subscriptions
- State history and undo functionality
- Selector pattern for computed values

**Usage Pattern**:
```javascript
// Dispatch actions
await stateManager.dispatch('SET_USER', { id: 123, name: 'John' });

// Subscribe to changes
stateManager.watch('user.profile', (newProfile, oldProfile) => {
  console.log('Profile updated:', newProfile);
});

// Create selectors
const getUserName = stateManager.createSelector(
  state => state.user?.name || 'Guest'
);
```

## View Controller Architecture

### ViewManager Pattern (`src/js/views/ViewManager.js`)

**Purpose**: Central coordinator for all view controllers handling transitions, routing, and navigation.

**Responsibilities**:
- View controller instantiation and lifecycle management
- Navigation coordination and URL routing
- View transition animations and effects
- State synchronization between views and application
- Section management within views

**Supported Views**:
- **Dashboard**: Overview and quick access
- **Modules**: Learning content and progress
- **Assessment**: Testing and evaluation
- **Portfolio**: Work samples and certification

**Navigation Features**:
```javascript
// Navigate to specific view and section
await viewManager.navigate('modules', 'module2');

// Show view with transition
await viewManager.showView('assessment');

// Show section within current view
await viewManager.showSection('module1');
```

### View Controller Specializations

#### DashboardViewController
- Progress tracking and visualization
- Quick navigation and recommendations
- Module status management
- Personalized learning paths

#### ModulesViewController
- Content rendering and navigation
- Learning progress tracking
- Section management within modules
- Integration with content engines

#### AssessmentViewController
- Test administration and scoring
- Progress tracking and analytics
- Result visualization and feedback
- Certification pathway management

#### PortfolioViewController
- Work sample management
- Document template handling
- Portfolio building and organization
- Certification readiness tracking

## Renderer Architecture

### Renderer Pattern Overview

Renderers are specialized classes responsible for transforming data into DOM elements with specific rendering logic.

### SectionRenderer (`src/js/renderers/SectionRenderer.js`)

**Purpose**: Handles rendering of different content sections with specialized rendering for each content type.

**Content Types Supported**:
- Text content with i18n support
- Video and audio elements
- Interactive elements
- Quiz components
- Case studies
- Rich Module 1 content sections

**Rendering Methods**:
```javascript
// Main rendering entry point
async createContentSection(section, parentContent)

// Specialized content renderers
createIntroductionContent(data)
createHistoryTimeline(data)
createTypesContent(data)
createEthicalFoundationsContent(data)
```

### InteractiveRenderer (`src/js/renderers/InteractiveRenderer.js`)

**Purpose**: Handles interactive elements and dynamic content with event management.

**Interactive Types**:
- Drag-drop elements
- Hotspot interactions
- Timeline components
- Simulation elements
- Quiz components
- Case study elements

**Pattern**:
```javascript
// Create interactive element
async createInteractiveElement(section) {
  switch (section.interactiveType) {
    case 'drag-drop':
      return this.createDragDropElement(section);
    case 'simulation':
      return this.createSimulationElement(section);
  }
}

// Setup event listeners
setupInteractiveElement(element, content) {
  this.addInteractiveEventListeners(element, interactiveType);
}
```

### MediaRenderer (`src/js/renderers/MediaRenderer.js`)

**Purpose**: Specialized rendering for audio, video, and multimedia content with progressive loading and controls.

### ActivityRenderer (`src/js/renderers/ActivityRenderer.js`)

**Purpose**: Renders learning activities, exercises, and interactive learning components.

## Service and State Management

### Service Architecture

Services encapsulate business logic and provide functionality to components and view controllers.

#### Core Services:

**I18nService** (`src/js/services/I18nService.js`):
- Internationalization and localization
- Dynamic language switching
- Translation management
- Locale-specific formatting

**ThemeService** (`src/js/services/ThemeService.js`):
- Theme management and switching
- CSS custom property coordination
- User preference persistence
- System theme detection

**StorageService** (`src/js/services/StorageService.js`):
- LocalStorage abstraction
- Data serialization/deserialization
- Storage quotas and management
- Cross-tab synchronization

**ProgressService** (`src/js/services/ProgressService.js`):
- Learning progress tracking
- Achievement management
- Analytics and reporting
- Certification pathway tracking

**RouterService** (`src/js/services/RouterService.js`):
- URL routing and navigation
- History management
- Deep linking support
- Route parameter handling

### State Management Patterns

The platform uses a centralized state management approach with:

1. **Application State**: Central app state managed by StateManager
2. **Component State**: Local component state with reactive updates
3. **Service State**: Business logic state within services
4. **View State**: View-specific state in controllers

## Event Handling Patterns

### Event Flow Architecture

```
User Interaction → Component Event → EventBus → Service/Controller → State Update → Component Re-render
```

### Event Categories

1. **Component Events**: User interactions within components
2. **Navigation Events**: View and section changes
3. **Data Events**: State and content updates
4. **System Events**: Application lifecycle and service events

### Event Naming Conventions

```javascript
// Format: [scope]:[action]:[target?]
'user:login'
'component:mounted'
'view:changed'
'assessment:completed'
'module:progress-updated'
```

### Event Handling Best Practices

```javascript
// Use event delegation for dynamic content
document.addEventListener('click', (e) => {
  if (e.target.matches('.dynamic-button')) {
    // Handle click
  }
});

// Clean up subscriptions
class MyComponent extends BaseComponent {
  async onInitialize() {
    this.unsubscribe = this.subscribe('data:updated', this.handleUpdate);
  }
  
  async onDestroy() {
    this.unsubscribe?.();
  }
}
```

## Development Guidelines

### Component Development Process

1. **Determine Component Type**:
   - UI Component → Extend BaseComponent
   - View Controller → Extend BaseViewController
   - Business Logic → Create Service
   - Data Processing → Create Engine

2. **Define Dependencies**:
   - Identify required services
   - Declare dependencies in constructor
   - Use dependency injection pattern

3. **Implement Lifecycle Methods**:
   - Override appropriate lifecycle hooks
   - Handle initialization and cleanup
   - Manage subscriptions and resources

4. **Design Template and Styling**:
   - Create responsive templates
   - Use CSS custom properties
   - Implement proper accessibility

5. **Add Event Handling**:
   - Use declarative event binding
   - Handle errors gracefully
   - Clean up listeners properly

### File Organization

```
src/js/
├── components/          # UI Components
│   ├── BaseComponent.js
│   ├── ThemeToggle.js
│   └── LanguageToggle.js
├── views/              # View Controllers
│   ├── BaseViewController.js
│   ├── DashboardViewController.js
│   └── ViewManager.js
├── renderers/          # Content Renderers
│   ├── SectionRenderer.js
│   ├── InteractiveRenderer.js
│   └── MediaRenderer.js
├── services/           # Business Logic
│   ├── I18nService.js
│   ├── ThemeService.js
│   └── StorageService.js
├── core/              # Core Infrastructure
│   ├── Module.js
│   ├── EventBus.js
│   ├── ServiceContainer.js
│   └── StateManager.js
└── engines/           # Content Processing
    ├── ContentEngine.js
    ├── AssessmentEngine.js
    └── DocumentEngine.js
```

### Naming Conventions

- **Classes**: PascalCase (e.g., `UserProfileComponent`)
- **Files**: PascalCase matching class name
- **Methods**: camelCase (e.g., `handleUserClick`)
- **Events**: kebab-case with scope (e.g., `user:profile-updated`)
- **CSS Classes**: kebab-case (e.g., `.user-profile-card`)

## Best Practices

### Component Design

1. **Single Responsibility**: Each component should have one clear purpose
2. **Loose Coupling**: Minimize direct dependencies between components
3. **High Cohesion**: Related functionality should be grouped together
4. **Immutable Props**: Avoid modifying external data directly
5. **Error Boundaries**: Handle errors gracefully without breaking the app

### Performance Optimization

1. **Lazy Loading**: Load components only when needed
2. **Event Delegation**: Use event delegation for dynamic content
3. **Memory Management**: Clean up subscriptions and listeners
4. **Efficient Rendering**: Minimize DOM manipulation and reflows
5. **Caching**: Cache expensive computations and API calls

### Testing Patterns

```javascript
// Component testing
describe('ThemeToggle', () => {
  let component;
  let mockThemeService;

  beforeEach(() => {
    mockThemeService = {
      getCurrentTheme: jest.fn(() => 'light'),
      toggleTheme: jest.fn()
    };
    
    component = new ThemeToggle(element, {
      dependencies: { ThemeService: mockThemeService }
    });
  });

  test('should toggle theme on click', async () => {
    await component.handleToggleClick(mockEvent);
    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });
});
```

### Error Handling

```javascript
// Service error handling
class UserService extends Module {
  async loadUser(id) {
    try {
      const user = await this.api.getUser(id);
      return user;
    } catch (error) {
      this.logger.error('Failed to load user:', error);
      this.emit('user:load-error', { id, error });
      throw new UserLoadError(`Could not load user ${id}`, error);
    }
  }
}

// Component error handling
class UserCard extends BaseComponent {
  async loadUserData() {
    try {
      const userData = await this.userService.loadUser(this.userId);
      this.setData(userData);
    } catch (error) {
      this.showError('Failed to load user data');
      console.error('[UserCard] Load error:', error);
    }
  }
}
```

### Security Considerations

1. **Input Sanitization**: Sanitize all user input before rendering
2. **XSS Prevention**: Use safe templating practices
3. **CSRF Protection**: Implement proper token validation
4. **Content Security Policy**: Restrict resource loading
5. **Secure Communication**: Use HTTPS for all API calls

### Accessibility Guidelines

1. **Semantic HTML**: Use proper HTML elements and structure
2. **ARIA Labels**: Add appropriate ARIA attributes
3. **Keyboard Navigation**: Support keyboard-only navigation
4. **Screen Reader Support**: Provide meaningful text alternatives
5. **Focus Management**: Handle focus properly in dynamic content

This component architecture provides a robust, scalable foundation for the EC0249 educational platform, enabling maintainable code, clear separation of concerns, and consistent development patterns across the application.