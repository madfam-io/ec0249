# EC0249 Platform - Development Workflow and Code Standards

## Development Environment Setup

### Prerequisites
- **Node.js**: Version 16+ (LTS recommended)
- **npm**: Version 8+
- **Git**: Version 2.30+
- **Code Editor**: VS Code with recommended extensions

### Installation
```bash
# Clone repository
git clone <repository-url>
cd ec0249

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Server
```bash
# Development with hot reload (default port 3000)
npm run dev

# Development with custom host
npm run serve

# Production preview
npm run preview
```

## Project Structure

```
ec0249/
├── src/
│   ├── js/
│   │   ├── core/           # Core framework (Module, EventBus, ServiceContainer)
│   │   ├── services/       # Application services (I18n, Storage, Theme, etc.)
│   │   ├── engines/        # Business logic engines (Content, Assessment, etc.)
│   │   ├── components/     # Reusable UI components
│   │   ├── views/          # View controllers and page management
│   │   ├── renderers/      # Content rendering components
│   │   ├── templates/      # Document templates and forms
│   │   ├── simulations/    # Interactive simulation components
│   │   ├── assessment/     # Assessment and scoring components
│   │   ├── translations/   # Localization files
│   │   └── config/         # Configuration files
│   ├── css/
│   │   └── app.css         # Main styles with CSS custom properties
│   └── main.js             # Application entry point
├── public/
│   └── translations/       # Public translation files
├── reference/              # Documentation and reference materials
├── dist/                   # Build output (generated)
└── index.html              # Main HTML entry point
```

## Code Standards

### File Naming Conventions
- **Classes**: PascalCase (`ContentEngine.js`, `StateManager.js`)
- **Services**: PascalCase with "Service" suffix (`I18nService.js`)
- **Components**: PascalCase (`BaseComponent.js`, `ThemeToggle.js`)
- **Utilities**: camelCase (`helpers.js`, `validators.js`)
- **Constants**: UPPER_SNAKE_CASE (`APP_CONFIG.js`)

### Coding Conventions

#### JavaScript Style
```javascript
// Class declaration
class MyComponent extends BaseComponent {
  constructor(config = {}) {
    super('MyComponent', [], config);
    this.initialized = false;
  }

  // Method naming: camelCase
  async initializeComponent() {
    // Method implementation
  }

  // Private methods: underscore prefix
  _privateMethod() {
    // Private implementation
  }

  // Event handlers: "handle" prefix
  handleUserClick(event) {
    // Event handling
  }
}

// Constants: UPPER_SNAKE_CASE
const DEFAULT_CONFIG = {
  autoSave: true,
  timeout: 5000
};

// Variables: camelCase
const currentUser = await this.getUserData();
```

#### Module Structure
```javascript
// 1. Imports (external, then internal)
import Module from '../core/Module.js';
import SomeService from '../services/SomeService.js';

// 2. Constants and configuration
const DEFAULT_OPTIONS = { /* ... */ };

// 3. Class definition
class MyEngine extends Module {
  // Constructor first
  constructor() { /* ... */ }
  
  // Lifecycle methods
  async onInitialize() { /* ... */ }
  async onDestroy() { /* ... */ }
  
  // Public methods (alphabetical)
  async loadData() { /* ... */ }
  async saveData() { /* ... */ }
  
  // Event handlers
  handleEvent() { /* ... */ }
  
  // Private methods last
  _privateHelper() { /* ... */ }
}

// 4. Export
export default MyEngine;
```

### Documentation Standards

#### JSDoc Comments
```javascript
/**
 * Brief description of the class or method
 * 
 * @description Detailed description explaining purpose,
 * behavior, and any important considerations.
 * 
 * @param {string} param1 - Description of parameter
 * @param {Object} [options={}] - Optional configuration
 * @param {boolean} [options.autoSave=true] - Enable auto-save
 * 
 * @returns {Promise<Object>} Description of return value
 * 
 * @throws {Error} When validation fails
 * 
 * @fires MyEngine#event:name - Emitted when something happens
 * 
 * @example
 * // Basic usage
 * const engine = new MyEngine();
 * await engine.loadData({ id: 'test' });
 * 
 * @since 2.0.0
 */
async loadData(param1, options = {}) {
  // Implementation
}
```

#### Inline Comments
```javascript
// Use single-line comments for brief explanations
const result = await this.processData(); // Process user input

/* 
 * Use multi-line comments for complex explanations
 * that span multiple lines and need more detail
 */
```

### Error Handling Standards

#### Error Types
```javascript
// Custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Usage in methods
async validateInput(data) {
  if (!data.email) {
    throw new ValidationError('Email is required', 'email');
  }
  
  try {
    // Risky operation
    return await this.processEmail(data.email);
  } catch (error) {
    // Log error with context
    console.error('[MyEngine] Email processing failed:', {
      email: data.email,
      error: error.message,
      stack: error.stack
    });
    
    // Re-throw with additional context
    throw new Error(`Email processing failed: ${error.message}`);
  }
}
```

#### Logging Standards
```javascript
// Structured logging with context
console.log('[ComponentName] Action completed:', {
  duration: Date.now() - startTime,
  itemsProcessed: results.length
});

console.warn('[ComponentName] Deprecated method used:', {
  method: 'oldMethod',
  replacement: 'newMethod',
  caller: this.constructor.name
});

console.error('[ComponentName] Operation failed:', {
  operation: 'dataLoad',
  error: error.message,
  context: { userId, dataType }
});
```

## Git Workflow

### Branch Naming
- **Feature branches**: `feature/short-description`
- **Bug fixes**: `fix/issue-description`
- **Documentation**: `docs/what-updated`
- **Refactoring**: `refactor/component-name`

### Commit Message Format
```
type(scope): brief description

Optional longer description explaining the change
and its motivation.

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(content): add video playback controls to ContentEngine

Add play/pause, seek, and volume controls for video content.
Includes keyboard shortcuts and accessibility features.

Fixes #45

fix(storage): handle localStorage quota exceeded error

Add graceful fallback to sessionStorage when localStorage
is full, preventing application crashes.

docs(api): update engine documentation with new methods
```

## Development Workflow

### Feature Development Process

1. **Planning Phase**
   ```bash
   # Create feature branch
   git checkout -b feature/new-component
   
   # Plan implementation (write tests first if using TDD)
   # Create or update documentation
   ```

2. **Implementation Phase**
   ```bash
   # Implement feature following code standards
   # Regular commits with descriptive messages
   git add src/js/components/NewComponent.js
   git commit -m "feat(components): add NewComponent with basic functionality"
   ```

3. **Testing Phase**
   ```bash
   # Run development server
   npm run dev
   
   # Test functionality manually
   # Run automated tests (when available)
   npm run test
   ```

4. **Code Review Phase**
   ```bash
   # Build for production to check for issues
   npm run build
   
   # Clean up and optimize
   npm run clean
   npm install
   npm run build
   ```

5. **Integration Phase**
   ```bash
   # Merge to main branch
   git checkout main
   git merge feature/new-component
   git push origin main
   ```

### Code Quality Checklist

#### Before Committing
- [ ] Code follows naming conventions
- [ ] Methods have proper JSDoc documentation
- [ ] Error handling is implemented
- [ ] Console logs use structured format
- [ ] No hardcoded values (use configuration)
- [ ] Component follows established patterns
- [ ] Dependencies are properly injected
- [ ] Events are properly cleaned up

#### Before Merging
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in development
- [ ] Documentation is updated
- [ ] Commit messages follow format
- [ ] No temporary or debug code
- [ ] Proper error boundaries exist
- [ ] Accessibility considerations addressed

## Build and Deployment

### Build Process
```bash
# Clean build
npm run clean
npm install
npm run build

# Check build output
ls -la dist/
```

### Build Configuration (vite.config.js)
- **Development**: Hot reload, source maps, debugging tools
- **Production**: Minification, optimization, bundling
- **Environment Variables**: Build-time configuration

### Deployment Checklist
- [ ] All environment variables configured
- [ ] Build succeeds without warnings
- [ ] Assets are properly optimized
- [ ] Routing works correctly
- [ ] Error handling covers edge cases
- [ ] Performance metrics are acceptable

## Performance Guidelines

### Code Optimization
- **Lazy Loading**: Load modules on demand
- **Event Cleanup**: Remove listeners in destruction
- **Memory Management**: Clear references and caches
- **Efficient Rendering**: Minimize DOM manipulation

### Bundle Optimization
- **Tree Shaking**: Import only used functions
- **Code Splitting**: Separate vendor and app code
- **Asset Optimization**: Compress images and styles
- **Caching Strategy**: Use proper cache headers

## Security Considerations

### Input Validation
```javascript
// Sanitize user input
function sanitizeInput(input) {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .trim()
    .substring(0, 1000); // Limit length
}

// Validate data structure
function validateUserData(data) {
  const required = ['name', 'email'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new ValidationError(`Missing fields: ${missing.join(', ')}`);
  }
}
```

### Data Protection
- **No Sensitive Data**: Never log passwords or tokens
- **Local Storage**: Encrypt sensitive stored data
- **API Communication**: Use HTTPS and proper headers
- **XSS Prevention**: Sanitize dynamic content

## Testing Strategy

### Manual Testing
```bash
# Test all major user flows
# Verify responsive design
# Check accessibility with screen readers
# Test in different browsers
```

### Automated Testing (Future)
```bash
# Unit tests for services and engines
npm run test:unit

# Integration tests for complete workflows
npm run test:integration

# End-to-end tests for user journeys
npm run test:e2e
```

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Development Server Issues:**
```bash
# Check port availability
lsof -ti:3000
kill -9 <PID>
npm run dev
```

**Module Import Errors:**
- Check file paths and extensions
- Verify export/import syntax
- Ensure proper module resolution in vite.config.js

### Debugging Tools
- **Browser DevTools**: Network, Console, Application tabs
- **Vue DevTools**: Component inspection (if applicable)
- **Performance Profiler**: Memory and CPU usage
- **Lighthouse**: Performance and accessibility audits

This workflow ensures consistent, maintainable, and high-quality code development for the EC0249 educational platform.