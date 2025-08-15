# EC0249 Platform - Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   Opens at http://localhost:3000

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## Project Structure

```
ec0249/
├── src/                 # Source files (Vite managed)
│   ├── js/             # JavaScript modules
│   │   ├── components/ # UI components
│   │   ├── core/       # Core system (ServiceContainer, Module, etc.)
│   │   ├── engines/    # Learning engines
│   │   ├── services/   # Application services
│   │   └── translations/ # i18n files
│   ├── css/            # Stylesheets
│   └── main.js         # Vite entry point
├── public/             # Static assets
├── dist/               # Production build output
├── index.html          # Main HTML template
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies and scripts
```

## Architecture

### Module System
- **ServiceContainer**: Dependency injection and lifecycle management
- **Module**: Base class with initialization, dependencies, and events
- **EventBus**: Inter-module communication
- **StateManager**: Application state management

### Core Services
- **StorageService**: Unified storage (localStorage, sessionStorage, memory, IndexedDB)
- **I18nService**: Internationalization (Spanish/English)
- **ThemeService**: Theme management (auto, light, dark)

### Learning Engines
- **ContentEngine**: Educational content rendering
- **AssessmentEngine**: Knowledge testing and evaluation
- **DocumentEngine**: Template-based document generation
- **SimulationEngine**: Interactive simulations

## Development Features

### Hot Module Replacement (HMR)
Vite provides instant updates during development without losing application state.

### Environment Variables
Configure via `.env` file:
```
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true
```

### Import Aliases
- `@` → `/src/js`
- `@components` → `/src/js/components`
- `@services` → `/src/js/services`
- `@engines` → `/src/js/engines`
- `@core` → `/src/js/core`

## Recent Fixes

### StorageService Improvements
- Fixed adapter registration timing issues
- Enhanced fallback chain: localStorage → sessionStorage → memory
- Added safe event emission during initialization
- Improved error handling and logging

### Module Initialization
- Fixed event emission before eventBus availability
- Enhanced initialization sequence timing
- Added debug logging for initialization states

## Production Ready

The platform is now optimized for:
- ✅ Fast development with HMR
- ✅ Optimized production builds
- ✅ Error-free console output
- ✅ Proper module loading
- ✅ Cross-browser compatibility