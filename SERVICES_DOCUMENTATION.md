# EC0249 Services Documentation

This document provides comprehensive technical documentation for all service components in the EC0249 educational platform. Each service extends the base `Module` class and provides specific functionality for different aspects of the application.

## Table of Contents

1. [I18nService](#i18nservice) - Internationalization and Localization
2. [ProgressService](#progressservice) - Learning Progress Tracking
3. [RouterService](#routerservice) - URL Routing and Navigation
4. [StorageService](#storageservice) - Data Persistence Management
5. [ThemeService](#themeservice) - Visual Theme Management

---

## I18nService

### Purpose and Responsibilities

The `I18nService` provides comprehensive internationalization and localization support for the EC0249 platform. It handles translation management, language switching, locale-specific formatting, and dynamic DOM translation.

### Key Features

- Multi-language support with dynamic loading
- Real-time DOM translation via `data-i18n` attributes
- Variable interpolation in translations using `{{variable}}` syntax
- Fallback language chain for missing translations
- Browser language auto-detection
- Persistent language preferences
- Locale-specific number and date formatting

### Configuration Options

```javascript
{
  defaultLanguage: 'es',
  fallbackLanguage: 'es',
  supportedLanguages: ['es', 'en'],
  storageKey: 'ec0249_language',
  translationsPath: '/translations/',
  autoDetectLanguage: true,
  interpolationPattern: /\{\{(\w+)\}\}/g
}
```

### Dependencies

- **StorageService**: For persistent language preferences
- **EventBus**: For language change notifications

### Key Methods

#### Translation Methods

```javascript
// Primary translation method
t(key, variables = {}, language = null)
// Examples:
i18n.t('user.welcome', { name: 'John' })
i18n.t('app.title', {}, 'en')
```

#### Language Management

```javascript
// Get/set current language
getCurrentLanguage()
setLanguage(language)
toggleLanguage()

// Language support
getSupportedLanguages()
isSupportedLanguage(language)
```

#### DOM Translation

```javascript
// Translate page elements
translatePage()
translateDOM()
translatePlaceholders()
translateTitles()
```

#### Language Detection

```javascript
// Auto-detect browser language
detectBrowserLanguage()
initializeLanguage()
```

#### Locale Formatting

```javascript
// Format numbers and dates
formatNumber(number, options = {})
formatDate(date, options = {})
```

### Data Models

#### Translation File Structure (JSON)

```json
{
  "app": {
    "title": "EC0249 Educational Platform",
    "subtitle": "General Consulting Services"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "modules": "Modules",
    "assessment": "Assessment"
  },
  "user": {
    "welcome": "Welcome, {{name}}!",
    "greeting": "Good {{time}}, {{name}}!"
  }
}
```

#### Internal State

```javascript
{
  currentLanguage: 'es',
  translations: Map(),
  loadedLanguages: Set(),
  loadingPromises: Map(),
  changeListeners: Set(),
  isReady: boolean
}
```

### Event Handling

#### Events Emitted

- `language:changed` - When language is successfully changed
- `language:ready` - When service is initialized and ready

#### Events Subscribed

- `language:change` - Request to change language
- `language:toggle` - Request to toggle language
- `language:set` - Request to set specific language

### Usage Patterns

#### Basic Translation

```javascript
// Simple text translation
const title = i18n.t('app.title');

// Translation with variables
const message = i18n.t('user.welcome', { name: userName });
```

#### DOM Integration

```html
<!-- Automatic translation -->
<h1 data-i18n="app.title"></h1>

<!-- Placeholder translation -->
<input data-i18n-placeholder="search.placeholder">

<!-- Title/tooltip translation -->
<button data-i18n-title="button.help">Help</button>
```

#### Language Switching

```javascript
// Change language programmatically
await i18n.setLanguage('en');

// Listen for language changes
i18n.addLanguageChangeListener((data) => {
  console.log('Language changed:', data.language);
});
```

---

## ProgressService

### Purpose and Responsibilities

The `ProgressService` manages comprehensive learning progress tracking for the EC0249 platform, including module completion, prerequisite enforcement, achievement systems, and detailed analytics.

### Key Features

- Module and lesson progress tracking
- Weighted progress calculation across modules
- Prerequisite enforcement and unlocking logic
- Achievement and milestone tracking
- Assessment score tracking
- Document portfolio progress
- Certification readiness assessment

### Configuration Options

```javascript
{
  storageKey: 'ec0249_progress',
  autoSave: true,
  prerequisites: {
    module2: ['module1_complete'],
    module3: ['module2_complete'],
    module4: ['module3_complete']
  },
  moduleWeights: {
    module1: 25, // 25% of total progress
    module2: 35, // 35% of total progress
    module3: 20, // 20% of total progress
    module4: 20  // 20% of total progress
  },
  completionCriteria: {
    module1: {
      theory: 100,     // % of theory lessons completed
      practice: 100,   // % of practice exercises completed
      assessment: true // Assessment passed
    },
    // ... other modules
  }
}
```

### Dependencies

- **StorageService**: For persistent progress storage
- **EventBus**: For progress update notifications

### Key Methods

#### Progress Updates

```javascript
// Update different types of progress
updateTheoryProgress(moduleId, percentage)
updatePracticeProgress(moduleId, percentage)
updateDocumentProgress(moduleId, percentage)
completeAssessment(moduleId, passed = true)
completeSimulation(moduleId, type)
```

#### Progress Queries

```javascript
// Get progress information
getOverallProgress()
calculateModuleProgress(moduleId)
getModuleStatus(moduleId) // 'locked', 'available', 'in_progress', 'completed'
isModuleUnlocked(moduleId)
```

#### Achievement System

```javascript
// Achievement management
checkAchievements()
resetProgress()
```

### Data Models

#### Progress Structure

```javascript
{
  overall: 0, // Overall percentage (0-100)
  modules: {
    module1: {
      theory: 0,        // Theory completion percentage
      practice: 0,      // Practice completion percentage
      assessment: false, // Assessment passed status
      completed: false  // Module completion status
    },
    module2: {
      theory: 0,
      documents: 0,     // Document completion percentage
      assessment: false,
      completed: false
    },
    // ... other modules
  },
  achievements: [], // Array of unlocked achievements
  startDate: null,  // ISO date string
  lastActivity: null // ISO date string
}
```

#### Module Status Values

- `locked`: Prerequisites not met
- `available`: Unlocked but not started
- `in_progress`: Some progress made
- `completed`: All criteria met

### Event Handling

#### Events Emitted

- `progress:updated` - When progress is saved
- `achievement:unlocked` - When new achievement is earned

#### Events Subscribed

- `lesson:completed` - Lesson completion notification
- `exercise:completed` - Exercise completion notification
- `document:completed` - Document completion notification
- `assessment:completed` - Assessment completion notification
- `simulation:completed` - Simulation completion notification

### Usage Patterns

#### Tracking Progress

```javascript
// Update lesson progress
await progressService.updateTheoryProgress('module1', 100);

// Complete assessment
progressService.completeAssessment('module1', true);

// Check module access
const canAccess = progressService.isModuleUnlocked('module2');
```

#### Progress Reporting

```javascript
// Get comprehensive progress
const report = progressService.getOverallProgress();
console.log(`Overall progress: ${report.percentage}%`);

// Get specific module status
const status = progressService.getModuleStatus('module2');
```

---

## RouterService

### Purpose and Responsibilities

The `RouterService` handles URL routing and browser history management for the EC0249 single-page application, providing navigation, deep linking, and browser back/forward button support.

### Key Features

- URL pattern matching with parameters
- Browser history management (pushState/replaceState)
- Hash routing fallback support
- Route parameter extraction
- Navigation event handling
- Deep linking support

### Configuration Options

```javascript
{
  basePath: '',
  defaultRoute: '/dashboard',
  useHashRouting: false,
  enablePushState: true,
  routes: {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/modules': 'modules',
    '/modules/:moduleId': 'modules',
    '/assessment': 'assessment',
    '/portfolio': 'portfolio'
  }
}
```

### Dependencies

- **EventBus**: For navigation event coordination

### Key Methods

#### Navigation

```javascript
// Navigate to routes
navigate(path, options = {})
goBack()
goForward()

// Route information
getCurrentRoute()
getQueryParams()
```

#### Route Matching

```javascript
// Internal route processing
matchRoute(path)
matchPattern(pattern, path)
extractParams(path)
```

#### Event Handling

```javascript
// Browser event management
setupEventListeners()
handlePopState(event)
parseCurrentURL()
```

### Data Models

#### Route Configuration

```javascript
{
  '/modules/:moduleId': 'modules', // Pattern with parameter
  '/assessment': 'assessment',      // Static route
  '/': 'dashboard'                  // Root route
}
```

#### Current Route State

```javascript
{
  path: '/modules/module1',    // Current URL path
  route: 'modules',            // Matched route view
  params: { moduleId: 'module1' }, // Extracted parameters
  query: { section: 'intro' }  // Query parameters
}
```

#### Route History Entry

```javascript
{
  path: '/modules/module1',
  timestamp: 1234567890,
  params: { moduleId: 'module1' }
}
```

### Event Handling

#### Events Emitted

- `router:navigate` - When navigation occurs
- `router:popstate` - When browser back/forward is used

#### Events Subscribed

- `app:view-change` - Application view change requests
- `app:section-change` - Section change requests

### Usage Patterns

#### Programmatic Navigation

```javascript
// Navigate to specific route
router.navigate('/modules/module1');

// Navigate with options
router.navigate('/dashboard', { replace: true });

// Use browser history
router.goBack();
router.goForward();
```

#### Route Information

```javascript
// Get current route details
const route = router.getCurrentRoute();
console.log('Current view:', route.route);
console.log('Parameters:', route.params);
```

---

## StorageService

### Purpose and Responsibilities

The `StorageService` provides a unified, adapter-based storage abstraction that supports multiple storage mechanisms with fallback chains, data compression, encryption, and TTL (time-to-live) management.

### Key Features

- Multiple storage adapter support (localStorage, sessionStorage, memory, IndexedDB)
- Automatic fallback chain for maximum compatibility
- Data compression and encryption support (placeholders included)
- TTL (time-to-live) expiration management
- Prefix-based key namespacing
- Event-driven storage notifications
- Quota management and storage optimization

### Configuration Options

```javascript
{
  defaultAdapter: 'localStorage',
  prefix: 'ec0249_',
  compression: false,
  encryption: false,
  ttl: false, // Time to live in milliseconds
  fallbackToMemory: true
}
```

### Dependencies

- **EventBus**: For storage event notifications

### Key Methods

#### Storage Operations

```javascript
// Basic operations
set(key, value, options = {})
get(key, defaultValue = null, options = {})
remove(key, options = {})
has(key, options = {})
clear(options = {})

// Batch operations (implied by adapter support)
getKeys(options = {})
getSize(options = {})
getStats()
```

#### Adapter Management

```javascript
// Adapter handling
registerAdapter(name, adapter)
getAdapter(name = null)
isLocalStorageSupported()
isSessionStorageSupported()
isIndexedDBSupported()
```

### Storage Adapters

#### LocalStorageAdapter

- **Purpose**: Browser persistent storage
- **Scope**: Cross-session persistence
- **Capacity**: ~5-10MB (browser dependent)

#### SessionStorageAdapter

- **Purpose**: Session-only storage
- **Scope**: Single browser session
- **Capacity**: ~5-10MB (browser dependent)

#### MemoryStorageAdapter

- **Purpose**: Runtime storage and fallback
- **Scope**: Current page load only
- **Capacity**: Available RAM

#### IndexedDBAdapter

- **Purpose**: Large data storage
- **Scope**: Persistent, structured data
- **Capacity**: Much larger (100MB+)

### Data Models

#### Storage Value Structure

```javascript
{
  data: actualValue,           // The stored data
  metadata: {
    timestamp: 1234567890,     // Storage timestamp
    ttl: 3600000,             // Time to live (ms)
    type: 'object',           // Data type
    compressed: false,         // Compression flag
    encrypted: false          // Encryption flag
  }
}
```

#### Storage Statistics

```javascript
{
  adapters: ['localStorage', 'sessionStorage', 'memory'],
  totalSize: 1024,           // Total size in bytes
  keyCount: 15,              // Total number of keys
  localStorage: {
    size: 512,
    keyCount: 8,
    available: true
  },
  // ... other adapters
}
```

### Event Handling

#### Events Emitted

- `storage:set` - When data is stored
- `storage:get` - When data is retrieved
- `storage:remove` - When data is removed
- `storage:clear` - When storage is cleared

#### Events Subscribed

- `storage:clear` - Request to clear storage
- `storage:migrate` - Request for data migration

### Usage Patterns

#### Basic Storage

```javascript
// Store data
await storage.set('userProfile', userData);

// Retrieve data
const profile = await storage.get('userProfile', defaultProfile);

// Remove data
await storage.remove('userProfile');
```

#### Advanced Options

```javascript
// Store with TTL (1 hour)
await storage.set('tempData', data, { ttl: 3600000 });

// Use specific adapter
await storage.set('sessionData', data, { adapter: 'sessionStorage' });

// Bulk operations
const keys = await storage.getKeys();
const stats = await storage.getStats();
```

---

## ThemeService

### Purpose and Responsibilities

The `ThemeService` provides comprehensive theme management for the EC0249 platform, including automatic system preference detection, smooth transitions, persistent storage, and real-time theme switching.

### Key Features

- Multiple theme support (auto, light, dark)
- System preference detection and auto-switching
- Persistent theme storage and restoration
- Smooth CSS transition effects
- Real-time theme change notifications
- CSS custom property integration
- Accessibility compliance (prefers-color-scheme)

### Configuration Options

```javascript
{
  themes: ['auto', 'light', 'dark'],
  defaultTheme: 'auto',
  storageKey: 'ec0249_theme',
  cssAttribute: 'data-theme',
  transitions: true,
  systemPreferenceSupport: true
}
```

### Dependencies

- **StorageService**: For persistent theme preferences
- **EventBus**: For theme change notifications

### Key Methods

#### Theme Management

```javascript
// Theme operations
setTheme(theme)
toggleTheme()
getCurrentTheme()
getEffectiveTheme() // Resolves 'auto' to actual theme

// Theme information
getAvailableThemes()
isValidTheme(theme)
getThemeDisplayName(theme)
getThemeIcon(theme)
```

#### System Integration

```javascript
// System preference handling
setupSystemPreferenceDetection()
applyTheme()
handleThemeTransition()

// CSS integration
getThemeVariables(theme = null)
applyThemeVariables(variables)
```

### Data Models

#### Theme State

```javascript
{
  currentTheme: 'auto',        // User's theme setting
  effectiveTheme: 'dark',      // Resolved theme (auto -> dark/light)
  systemPreference: 'dark',    // OS/browser preference
  availableThemes: ['auto', 'light', 'dark']
}
```

#### Theme CSS Variables

```javascript
// Light theme variables
{
  '--bg-primary': '#f9fafb',
  '--bg-secondary': '#ffffff',
  '--text-primary': '#111827',
  '--text-secondary': '#6b7280',
  '--border': '#e5e7eb',
  '--primary': '#3b82f6',
  '--primary-hover': '#2563eb'
}

// Dark theme variables
{
  '--bg-primary': '#111827',
  '--bg-secondary': '#1f2937',
  '--text-primary': '#f9fafb',
  '--text-secondary': '#9ca3af',
  '--border': '#374151',
  '--primary': '#60a5fa',
  '--primary-hover': '#3b82f6'
}
```

### Event Handling

#### Events Emitted

- `theme:changed` - When theme is successfully changed

#### Events Subscribed

- `theme:change` - Request to change theme
- `theme:toggle` - Request to toggle theme
- `theme:set` - Request to set specific theme

### CSS Integration

#### Theme Application

The service applies themes through multiple mechanisms:

1. **Data Attribute**: `data-theme="auto|light|dark"` on `<html>`
2. **CSS Classes**: `theme-light` or `theme-dark` on `<html>`
3. **CSS Custom Properties**: Dynamic variable updates
4. **Transition Classes**: `theme-transitioning` during changes

#### CSS Implementation Example

```css
/* Theme-based styling */
[data-theme="light"] {
  --bg-primary: #f9fafb;
  --text-primary: #111827;
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --text-primary: #f9fafb;
}

/* Auto theme follows system preference */
@media (prefers-color-scheme: dark) {
  [data-theme="auto"] {
    --bg-primary: #111827;
    --text-primary: #f9fafb;
  }
}

@media (prefers-color-scheme: light) {
  [data-theme="auto"] {
    --bg-primary: #f9fafb;
    --text-primary: #111827;
  }
}

/* Smooth transitions */
.theme-transitioning * {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### Usage Patterns

#### Basic Theme Management

```javascript
// Set theme programmatically
await themeService.setTheme('dark');

// Toggle between themes
await themeService.toggleTheme();

// Get current theme info
const current = themeService.getCurrentTheme(); // 'auto'
const effective = themeService.getEffectiveTheme(); // 'dark'
```

#### Theme Change Listening

```javascript
// Listen for theme changes
themeService.addThemeChangeListener((data) => {
  console.log('Theme changed to:', data.theme);
  console.log('Effective theme:', data.effectiveTheme);
  console.log('System preference:', data.systemPreference);
});
```

#### CSS Variable Integration

```javascript
// Get current theme variables
const variables = themeService.getThemeVariables();

// Apply custom variables
themeService.applyThemeVariables({
  '--custom-color': '#ff6b6b',
  '--custom-bg': '#4ecdc4'
});
```

---

## Service Integration Patterns

### Inter-Service Communication

Services communicate through the EventBus and direct service references:

```javascript
// EventBus communication
this.emit('theme:changed', themeData);
this.subscribe('language:changed', this.handleLanguageChange.bind(this));

// Direct service access
const storage = this.service('StorageService');
const i18n = this.service('I18nService');
```

### Common Integration Examples

#### Theme + I18n Integration

```javascript
// Theme service uses I18n for display names
getThemeDisplayName(theme) {
  const i18n = this.service('I18nService');
  return i18n.t(`theme.${theme}`) || this.getFallbackDisplayName(theme);
}
```

#### Progress + Storage Integration

```javascript
// Progress service persists data via Storage
async saveProgress() {
  await this.storage.set(this.getConfig('storageKey'), this.progress);
  this.emit('progress:updated', this.progress);
}
```

#### Router + EventBus Integration

```javascript
// Router responds to app-level navigation events
this.subscribe('app:view-change', this.handleViewChange.bind(this));
this.subscribe('app:section-change', this.handleSectionChange.bind(this));
```

### Error Handling Patterns

All services implement consistent error handling:

```javascript
try {
  await this.storage.set(key, value);
} catch (error) {
  console.error(`[ServiceName] Operation failed:`, error);
  // Graceful degradation or fallback
}
```

### Initialization Dependencies

Services declare their dependencies and initialize in order:

```javascript
// Service dependency declaration
super('ServiceName', ['StorageService', 'EventBus'], config);

// Safe service access after initialization
async onInitialize() {
  this.storage = this.service('StorageService');
  // ... rest of initialization
}
```

This comprehensive documentation provides developers with detailed information about each service's interface, methods, events, and integration patterns for effective development and maintenance of the EC0249 educational platform.