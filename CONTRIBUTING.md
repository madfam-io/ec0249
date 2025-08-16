# 🤝 Contributing to EC0249 Educational Platform

Welcome to the EC0249 Educational Platform development community! This guide will help you get started with contributing to our comprehensive educational system for consulting certification.

## 📋 Table of Contents

- [Development Environment Setup](#-development-environment-setup)
- [Architecture Overview](#-architecture-overview)
- [Coding Standards](#-coding-standards)
- [Documentation Standards](#-documentation-standards)
- [Development Workflow](#-development-workflow)
- [Code Review Process](#-code-review-process)
- [Testing Guidelines](#-testing-guidelines)
- [Performance Guidelines](#-performance-guidelines)
- [Security Considerations](#-security-considerations)
- [Internationalization](#-internationalization)
- [Issue Reporting](#-issue-reporting)
- [Pull Request Guidelines](#-pull-request-guidelines)

---

## 🛠️ Development Environment Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js 18+** - JavaScript runtime
- **npm 9+** - Package manager
- **Git** - Version control
- **Modern Browser** - For testing (Chrome, Firefox, Safari, Edge)
- **Code Editor** - VS Code recommended with extensions:
  - ES6 String HTML
  - JSDoc
  - Prettier
  - ESLint

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ec0249.git
cd ec0249

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

### Verification

After setup, verify everything works:

```bash
# Check the build process
npm run build

# Preview production build
npm run preview

# Run any available tests
npm test
```

---

## 🏗️ Architecture Overview

### Understanding the System

The EC0249 platform uses a **modular, event-driven architecture**. Before contributing, familiarize yourself with:

1. **Core Concepts** - Read [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system design
2. **Module Pattern** - All components extend the base `Module` class
3. **Dependency Injection** - Services are managed by `ServiceContainer`
4. **Event System** - Components communicate via `EventBus`
5. **Layer Structure** - Core → Service → Engine → View layers

### Key Principles

- **Separation of Concerns**: Each module has a single responsibility
- **Loose Coupling**: Components interact through events and services
- **Composition over Inheritance**: Favor component composition
- **Immutable Configuration**: Configuration is set during initialization
- **Progressive Enhancement**: Features degrade gracefully

---

## 📝 Coding Standards

### JavaScript (ES2022+)

We use modern JavaScript with the following conventions:

#### Code Style

```javascript
// ✅ Good: Use const/let appropriately
const userService = container.resolve('UserService');
let currentUser = null;

// ❌ Bad: Don't use var
var oldStyleVariable = 'avoid this';

// ✅ Good: Destructuring
const { username, email } = userData;

// ✅ Good: Template literals
const message = `Welcome, ${username}!`;

// ✅ Good: Arrow functions for short operations
const isValid = (user) => user.email && user.username;

// ✅ Good: Traditional function for methods
function processUserData(data) {
  // Complex logic here
}
```

#### Naming Conventions

```javascript
// ✅ Variables and functions: camelCase
const userProfile = getUserProfile();
const isAuthenticated = checkAuthentication();

// ✅ Classes: PascalCase
class UserService extends Module {
  // class implementation
}

// ✅ Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_ENDPOINTS = {
  USERS: '/api/users',
  AUTH: '/api/auth'
};

// ✅ Private properties: prefix with underscore
class MyModule {
  constructor() {
    this._privateData = new Map();
    this.publicProperty = 'visible';
  }
}

// ✅ Event names: kebab-case with colons
eventBus.publish('user:login', userData);
eventBus.publish('content:loaded', contentData);
```

#### Error Handling

```javascript
// ✅ Good: Proper async/await error handling
async function loadUserData(userId) {
  try {
    const user = await userService.getUser(userId);
    return user;
  } catch (error) {
    console.error('[UserModule] Failed to load user:', error);
    throw new Error(`User loading failed: ${error.message}`);
  }
}

// ✅ Good: Custom error classes
class ValidationError extends Error {
  constructor(field, message) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
    this.field = field;
  }
}
```

#### Module Structure

```javascript
/**
 * MyModule - Brief description
 * 
 * @description Detailed description of what this module does
 * @class MyModule
 * @extends Module
 * @since 1.0.0
 */
import Module from '../core/Module.js';

class MyModule extends Module {
  constructor() {
    super('MyModule', ['RequiredService'], {
      configOption: 'value'
    });
  }

  async onInitialize() {
    // Service resolution
    this.service = this.service('RequiredService');
    
    // Event subscription
    this.subscribe('relevant:event', this.handleEvent.bind(this));
  }

  async onDestroy() {
    // Custom cleanup
    this.customCleanup();
  }
}

export default MyModule;
```

### CSS Styling

#### CSS Custom Properties

```css
/* ✅ Good: Use CSS custom properties for theming */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  --font-size-base: 1rem;
  --line-height-base: 1.5;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
}

/* ✅ Good: Use semantic class names */
.user-profile-card {
  background: var(--background-color);
  color: var(--text-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}

/* ❌ Bad: Avoid utility-only classes in main CSS */
.mt-3 { margin-top: 1rem; } /* Use sparingly */
```

#### Component Styling

```css
/* ✅ Good: Scope styles to components */
.content-engine {
  /* Component-specific styles */
}

.content-engine .lesson-header {
  /* Nested component styles */
}

.content-engine .lesson-header .title {
  /* Deep nested styles when necessary */
}

/* ✅ Good: Use BEM methodology for complex components */
.assessment-question {
  /* Block */
}

.assessment-question__header {
  /* Element */
}

.assessment-question__header--highlighted {
  /* Modifier */
}
```

---

## 📚 Documentation Standards

### JSDoc Requirements

All public methods and classes **must** have comprehensive JSDoc documentation:

```javascript
/**
 * Process user authentication with comprehensive validation
 * 
 * @description This method handles user authentication by validating credentials,
 * checking user permissions, and establishing a secure session. It includes
 * rate limiting, security logging, and multi-factor authentication support.
 * 
 * @param {Object} credentials - User authentication credentials
 * @param {string} credentials.username - Username or email address
 * @param {string} credentials.password - User password (will be hashed)
 * @param {string} [credentials.mfaToken] - Multi-factor authentication token
 * @param {Object} [options={}] - Authentication options
 * @param {boolean} [options.rememberMe=false] - Whether to create persistent session
 * @param {number} [options.sessionDuration=3600] - Session duration in seconds
 * 
 * @returns {Promise<Object>} Authentication result object
 * @returns {boolean} returns.success - Whether authentication succeeded
 * @returns {string} returns.token - JWT token for authenticated session
 * @returns {Object} returns.user - User profile information
 * @returns {Array<string>} returns.permissions - User permission array
 * 
 * @throws {ValidationError} Throws when credentials are invalid or missing
 * @throws {AuthenticationError} Throws when authentication fails
 * @throws {RateLimitError} Throws when rate limit is exceeded
 * 
 * @example
 * // Basic authentication
 * try {
 *   const result = await userService.authenticate({
 *     username: 'john.doe@example.com',
 *     password: 'securePassword123'
 *   });
 *   
 *   console.log('Login successful:', result.user.username);
 *   localStorage.setItem('token', result.token);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 * 
 * @example
 * // Authentication with MFA and persistent session
 * const result = await userService.authenticate({
 *   username: 'admin@example.com',
 *   password: 'adminPassword',
 *   mfaToken: '123456'
 * }, {
 *   rememberMe: true,
 *   sessionDuration: 86400 // 24 hours
 * });
 * 
 * @since 1.0.0
 * @see {@link UserService#validateCredentials} For credential validation
 * @see {@link SessionManager#createSession} For session management
 */
async authenticate(credentials, options = {}) {
  // Implementation here
}
```

### Required JSDoc Tags

- `@description` - Detailed explanation
- `@param` - All parameters with types and descriptions
- `@returns` - Return value type and description
- `@throws` - All possible exceptions
- `@example` - At least one practical example
- `@since` - Version when added
- `@see` - Cross-references to related methods

### Inline Comments

```javascript
// ✅ Good: Explain complex business logic
// Calculate weighted score based on question difficulty and time spent
// Formula: (correctAnswers / totalQuestions) * difficultyMultiplier * timeBonus
const score = this.calculateWeightedScore(answers, questions, timeSpent);

// ✅ Good: Explain non-obvious technical decisions
// Use Map instead of Object for better performance with frequent lookups
// and to avoid prototype pollution issues
this.userCache = new Map();

// ❌ Bad: Don't comment obvious code
const user = userData.user; // Get user from userData

// ✅ Good: Explain why, not what
// Debounce search input to avoid excessive API calls
// Users typically pause for 300ms when finished typing
const debouncedSearch = debounce(this.handleSearch, 300);
```

### README and Documentation Files

- Use clear section headers with emoji indicators
- Provide code examples for all major features
- Include troubleshooting sections
- Keep language clear and concise
- Update documentation with code changes

---

## 🔄 Development Workflow

### Git Flow

We use a modified Git Flow workflow:

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# 2. Develop with frequent commits
git add .
git commit -m "feat(auth): add user login validation

- Implement email/password validation
- Add rate limiting for login attempts
- Include comprehensive error handling"

# 3. Keep feature branch updated
git checkout main
git pull origin main
git checkout feature/user-authentication
git rebase main

# 4. Push and create pull request
git push origin feature/user-authentication
# Create PR via GitHub interface
```

### Branch Naming Convention

```bash
# Feature branches
feature/assessment-engine
feature/user-dashboard
feature/document-templates

# Bug fix branches
fix/translation-loading
fix/memory-leak-content
fix/mobile-responsive-layout

# Hotfix branches (for critical production fixes)
hotfix/security-vulnerability
hotfix/data-corruption

# Documentation branches
docs/api-reference
docs/contributing-guide
docs/architecture-update
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description
#
# Body (optional): More detailed explanation
# 
# Footer (optional): Issue references

# Examples:
feat(assessment): add multiple choice question support

fix(i18n): resolve translation loading race condition

docs(architecture): update module lifecycle documentation

style(css): improve responsive design for mobile devices

refactor(content): extract renderer components for better modularity

perf(storage): optimize localStorage caching strategy

test(assessment): add comprehensive unit tests for scoring engine
```

### Development Process

1. **Planning Phase**
   - Review requirements and design specifications
   - Check existing architecture and patterns
   - Plan implementation approach
   - Identify potential integration points

2. **Implementation Phase**
   - Write code following established patterns
   - Add comprehensive JSDoc documentation
   - Include inline comments for complex logic
   - Follow coding standards and conventions

3. **Testing Phase**
   - Test functionality manually
   - Write unit tests for new features
   - Test integration with existing components
   - Verify mobile responsiveness

4. **Review Phase**
   - Self-review code changes
   - Ensure documentation is complete
   - Check for performance implications
   - Verify security considerations

---

## 🔍 Code Review Process

### Before Submitting PR

**Self-Review Checklist:**

- [ ] Code follows established patterns and conventions
- [ ] All public methods have comprehensive JSDoc
- [ ] Complex logic includes explanatory comments
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive and appropriate
- [ ] Mobile responsiveness is maintained
- [ ] Performance impact is considered
- [ ] Security implications are addressed
- [ ] Translation keys are added for new UI text
- [ ] Documentation is updated if APIs change

### Review Criteria

**Code Quality:**
- Follows architectural patterns
- Maintains separation of concerns
- Uses appropriate data structures
- Handles edge cases appropriately
- Includes proper error handling

**Documentation:**
- JSDoc is complete and accurate
- Examples are practical and clear
- API changes are documented
- Complex logic is explained

**Performance:**
- No obvious performance bottlenecks
- Memory management is appropriate
- DOM manipulation is efficient
- Event listeners are properly cleaned up

**Security:**
- Input validation is present
- No XSS vulnerabilities
- No sensitive data in logs
- Proper error message sanitization

**Maintainability:**
- Code is readable and understandable
- Functions have single responsibilities
- Dependencies are minimal and appropriate
- Testing is feasible

### Review Process

1. **Automated Checks**
   - Build process completes successfully
   - Linting passes without errors
   - No TypeScript errors (if applicable)

2. **Manual Review**
   - Architecture alignment
   - Code quality assessment
   - Documentation review
   - Security evaluation

3. **Testing Review**
   - Manual testing of new features
   - Regression testing of existing features
   - Cross-browser compatibility
   - Mobile device testing

---

## 🧪 Testing Guidelines

### Manual Testing

Since we don't have automated tests yet, comprehensive manual testing is crucial:

#### Feature Testing

```javascript
// Test new features systematically:

// 1. Happy path testing
// - Normal user interactions
// - Expected data flows
// - Typical use cases

// 2. Edge case testing
// - Empty data sets
// - Maximum data limits
// - Unusual user interactions

// 3. Error condition testing
// - Network failures
// - Invalid user input
// - System resource limitations
```

#### Browser Testing

Test in multiple browsers:
- **Chrome** (latest 2 versions)
- **Firefox** (latest 2 versions)
- **Safari** (latest 2 versions)
- **Edge** (latest 2 versions)

#### Device Testing

Test responsive design:
- **Desktop**: 1920x1080, 1366x768
- **Tablet**: iPad (768x1024), Android tablet
- **Mobile**: iPhone (375x667), Android phone (360x640)

#### Performance Testing

```javascript
// Check performance impact:

// 1. Memory usage
console.log(performance.memory);

// 2. Load times
performance.mark('feature-start');
// ... feature execution
performance.mark('feature-end');
performance.measure('feature-duration', 'feature-start', 'feature-end');

// 3. DOM complexity
console.log('DOM nodes:', document.querySelectorAll('*').length);
```

### Test Planning

Before implementing features, plan testing approach:

1. **Identify test scenarios**
2. **Plan test data requirements**
3. **Consider integration impacts**
4. **Plan performance verification**
5. **Consider security implications**

---

## ⚡ Performance Guidelines

### Code Performance

```javascript
// ✅ Good: Efficient DOM queries
const container = document.getElementById('content-container');
const items = container.querySelectorAll('.item'); // Query once

// ❌ Bad: Repeated DOM queries
for (let i = 0; i < data.length; i++) {
  document.getElementById('content-container') // Queried every iteration
    .querySelector('.item')
    .textContent = data[i];
}

// ✅ Good: Event delegation
container.addEventListener('click', (event) => {
  if (event.target.matches('.item-button')) {
    handleItemClick(event.target);
  }
});

// ❌ Bad: Individual event listeners
items.forEach(item => {
  item.querySelector('.button').addEventListener('click', handleItemClick);
});

// ✅ Good: Debounce expensive operations
const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 300);

// ✅ Good: Use requestAnimationFrame for animations
function animate() {
  // Update animation state
  updateAnimationState();
  
  // Schedule next frame
  requestAnimationFrame(animate);
}
```

### Memory Management

```javascript
// ✅ Good: Cleanup in module destruction
class MyModule extends Module {
  async onDestroy() {
    // Clear intervals and timeouts
    clearInterval(this.updateInterval);
    clearTimeout(this.debounceTimeout);
    
    // Remove event listeners
    this.clearSubscriptions();
    
    // Clear data structures
    this.cache.clear();
    this.mediaElements.forEach(el => el.remove());
  }
}

// ✅ Good: Weak references for caching
this.userCache = new WeakMap(); // Allows garbage collection

// ✅ Good: Lazy loading
async loadModule(moduleName) {
  if (!this.modules.has(moduleName)) {
    const Module = await import(`./modules/${moduleName}.js`);
    this.modules.set(moduleName, new Module.default());
  }
  return this.modules.get(moduleName);
}
```

### Bundle Size Optimization

```javascript
// ✅ Good: Dynamic imports for large dependencies
async function loadChartLibrary() {
  const { Chart } = await import('chart.js');
  return Chart;
}

// ✅ Good: Tree shaking friendly exports
export { specificFunction } from './utils.js';

// ❌ Bad: Import entire library
import * as utils from './utils.js'; // Imports everything
```

---

## 🔒 Security Considerations

### Input Validation

```javascript
// ✅ Good: Validate all user input
function validateUserInput(input) {
  // Type checking
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string');
  }
  
  // Length validation
  if (input.length > MAX_INPUT_LENGTH) {
    throw new ValidationError('Input exceeds maximum length');
  }
  
  // Content validation
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) {
    throw new ValidationError('Input contains invalid characters');
  }
  
  return input.trim();
}
```

### XSS Prevention

```javascript
// ✅ Good: Sanitize HTML content
function sanitizeHTML(content) {
  const div = document.createElement('div');
  div.textContent = content; // Escapes HTML
  return div.innerHTML;
}

// ✅ Good: Use textContent for user data
element.textContent = userData.name; // Safe

// ❌ Bad: Direct HTML insertion
element.innerHTML = userData.name; // Dangerous
```

### Secure Configuration

```javascript
// ✅ Good: Secure defaults
const CONFIG = {
  sessionTimeout: 1800, // 30 minutes
  maxLoginAttempts: 3,
  passwordMinLength: 8,
  enableDebugMode: false, // Secure default
  allowUnsafeContent: false
};

// ✅ Good: Validate configuration
function validateConfig(config) {
  const schema = {
    sessionTimeout: { type: 'number', min: 300, max: 86400 },
    maxLoginAttempts: { type: 'number', min: 1, max: 10 }
  };
  
  return validateSchema(config, schema);
}
```

---

## 🌍 Internationalization

### Adding New Translations

1. **Add translation keys to JSON files:**

```json
// src/js/translations/es.json
{
  "newFeature": {
    "title": "Nueva Característica",
    "description": "Descripción de la nueva característica",
    "actions": {
      "save": "Guardar",
      "cancel": "Cancelar"
    }
  }
}

// src/js/translations/en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Description of the new feature",
    "actions": {
      "save": "Save",
      "cancel": "Cancel"
    }
  }
}
```

2. **Use translations in code:**

```javascript
// In modules
const title = this.i18n.t('newFeature.title');
const description = this.i18n.t('newFeature.description');

// In HTML templates
element.setAttribute('data-i18n', 'newFeature.title');

// With variable interpolation
const message = this.i18n.t('welcome.message', { name: user.name });
// Translation: "Bienvenido, {{name}}!" -> "Bienvenido, Juan!"
```

### Translation Guidelines

- Use nested keys for organization
- Keep keys descriptive and hierarchical
- Include context in key names
- Avoid concatenating translated strings
- Use variable interpolation for dynamic content
- Test in both languages during development

---

## 🐛 Issue Reporting

### Bug Reports

Use this template for bug reports:

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Browser: [e.g. Chrome 91.0.4472.124]
- OS: [e.g. Windows 10, macOS 11.4]
- Device: [e.g. Desktop, iPhone 12]
- Platform Version: [e.g. v1.0.0]

## Screenshots
If applicable, add screenshots

## Additional Context
Any other context about the problem
```

### Feature Requests

```markdown
## Feature Description
Clear description of the requested feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Any other relevant information
```

---

## 📥 Pull Request Guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work)
- [ ] Documentation update

## Changes Made
- [ ] Added/modified feature X
- [ ] Fixed issue Y
- [ ] Updated documentation Z

## Testing
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified
- [ ] Performance impact assessed

## Documentation
- [ ] JSDoc added for new public methods
- [ ] README updated if needed
- [ ] API documentation updated if needed

## Screenshots (if applicable)
Add screenshots for UI changes

## Additional Notes
Any additional information for reviewers
```

### PR Requirements

**Before submitting:**

1. **Code Quality**
   - [ ] Follows coding standards
   - [ ] Includes comprehensive JSDoc
   - [ ] Has appropriate error handling
   - [ ] No debugging code left in

2. **Functionality**
   - [ ] Feature works as designed
   - [ ] Edge cases are handled
   - [ ] No regressions introduced
   - [ ] Mobile responsive

3. **Documentation**
   - [ ] JSDoc is complete and accurate
   - [ ] Translation keys added
   - [ ] Architecture docs updated if needed

4. **Performance**
   - [ ] No obvious performance issues
   - [ ] Memory leaks prevented
   - [ ] Efficient algorithms used

### Review Process

1. **Automated Review** (if available)
   - Build passes
   - Linting passes
   - Basic functionality check

2. **Manual Review**
   - Code quality assessment
   - Architecture alignment check
   - Security review
   - Documentation review

3. **Testing**
   - Feature testing
   - Regression testing
   - Cross-browser testing
   - Mobile testing

---

## 🎉 Getting Help

### Community Resources

- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Documentation**: Read [ARCHITECTURE.md](ARCHITECTURE.md) and [API.md](API.md)
- **Code Examples**: Check existing modules for patterns

### Development Support

When asking for help, include:

1. **Clear problem description**
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Environment details**
5. **Relevant code snippets**
6. **Error messages**

### Best Practices for New Contributors

1. **Start Small**: Begin with documentation or minor bug fixes
2. **Ask Questions**: Don't hesitate to ask for clarification
3. **Follow Patterns**: Study existing code to understand patterns
4. **Read Documentation**: Familiarize yourself with the architecture
5. **Test Thoroughly**: Manual testing is crucial
6. **Be Patient**: Code review may take time for quality assurance

---

## 🏆 Recognition

We appreciate all contributions! Contributors will be:

- Added to the contributors list
- Mentioned in release notes for significant contributions
- Eligible for maintainer status with consistent, quality contributions

---

Thank you for contributing to the EC0249 Educational Platform! Your efforts help create a better learning experience for consulting professionals worldwide. 🚀