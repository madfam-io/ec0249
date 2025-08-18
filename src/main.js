/**
 * EC0249 Educational Platform - Main Entry Point
 * Vite-optimized application bootstrap
 */
import EC0249App from './js/App.js';
import './css/main.css';

/**
 * Hide loading screen with smooth transition
 */
async function hideLoadingWithTransition() {
  const loadingElement = document.getElementById('loading');
  const appContainer = document.querySelector('.app-container');
  
  if (loadingElement && appContainer) {
    console.log('[Loading] Starting transition to app...');
    
    // Add fade-out class to loading overlay
    loadingElement.classList.add('fade-out');
    
    // Show app container with loaded class
    appContainer.classList.add('loaded');
    
    // Allow scrolling again with multiple approaches
    document.body.style.overflow = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.classList.add('loaded');
    document.documentElement.style.overflow = 'auto';
    
    console.log('[Loading] Scrolling enabled, body overflow:', window.getComputedStyle(document.body).overflow);
    
    // Remove loading element from DOM after transition
    setTimeout(() => {
      if (loadingElement.parentNode) {
        loadingElement.remove();
        console.log('[Loading] Loading element removed from DOM');
      }
    }, 500);
  }
}

/**
 * Show error with proper styling
 */
function showErrorMessage(error) {
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('app-error');
  
  // Hide loading
  if (loadingElement) {
    loadingElement.classList.add('fade-out');
    setTimeout(() => loadingElement.remove(), 500);
  }
  
  // Show error
  if (errorElement) {
    errorElement.innerHTML = `
      <div class="error-content">
        <h3>Error al cargar la aplicación</h3>
        <p>Se produjo un error durante la inicialización:</p>
        <p><strong>${error.message}</strong></p>
        <button onclick="location.reload()" class="btn btn-primary">Recargar Página</button>
      </div>
    `;
    errorElement.style.display = 'flex';
  }
  
  // Allow scrolling
  document.body.style.overflow = 'auto';
  document.body.style.overflowY = 'auto';
  document.body.classList.add('loaded');
  document.documentElement.style.overflow = 'auto';
}

/**
 * Initialize loading tip rotation
 */
function initializeLoadingTips() {
  const tips = [
    {
      text: "Cargando plataforma EC0249...",
      subtitle: "Preparando tu experiencia de aprendizaje"
    },
    {
      text: "Inicializando módulos...",
      subtitle: "Configurando el sistema de aprendizaje"
    },
    {
      text: "Cargando contenido educativo...",
      subtitle: "Accediendo a recursos de consultoría"
    },
    {
      text: "Preparando evaluaciones...",
      subtitle: "Sistema de certificación EC0249"
    },
    {
      text: "Configurando simuladores...",
      subtitle: "Entrenamiento práctico interactivo"
    }
  ];
  
  let currentTip = 0;
  const textElement = document.getElementById('loadingText');
  const subtitleElement = document.getElementById('loadingSubtitle');
  
  if (!textElement || !subtitleElement) return;
  
  const rotateTips = () => {
    currentTip = (currentTip + 1) % tips.length;
    const tip = tips[currentTip];
    
    // Fade out
    textElement.style.opacity = '0';
    subtitleElement.style.opacity = '0';
    
    setTimeout(() => {
      // Change text
      textElement.textContent = tip.text;
      subtitleElement.textContent = tip.subtitle;
      
      // Fade in
      textElement.style.opacity = '1';
      subtitleElement.style.opacity = '1';
    }, 200);
  };
  
  // Rotate tips every 2 seconds
  const tipInterval = setInterval(rotateTips, 2000);
  
  // Clear interval when loading completes
  return () => clearInterval(tipInterval);
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Start loading tip rotation
  const clearTips = initializeLoadingTips();
  
  try {
    // Create application instance with configuration
    window.ec0249App = new EC0249App({
      // Configuration for development mode
      environment: {
        debug: import.meta.env.DEV,
        development: import.meta.env.DEV,
        version: import.meta.env.VITE_APP_VERSION || '1.0.0'
      },
      // Enable all features
      features: {
        contentEngine: true,
        assessmentEngine: true,
        documentEngine: true,
        simulationEngine: true
      }
    });
    
    // Initialize the application
    await window.ec0249App.initialize();
    
    // Global app reference for backward compatibility
    window.app = window.ec0249App;
    
    console.log('✅ EC0249 Educational Platform loaded successfully');
    console.log('📊 Application info:', window.ec0249App.getInfo());
    
    // Clear loading tips
    if (clearTips) clearTips();
    
    // Smooth transition from loading to app
    await hideLoadingWithTransition();
    
  } catch (error) {
    console.error('❌ Failed to initialize EC0249 application:', error);
    
    // Clear loading tips
    if (clearTips) clearTips();
    
    // Show error with smooth transition
    showErrorMessage(error);
  }
});

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('💥 Application error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚫 Unhandled promise rejection:', event.reason);
});

// Hot Module Replacement for development
if (import.meta.hot) {
  import.meta.hot.accept('./js/App.js', (newModule) => {
    console.log('🔄 Hot reloading App.js...');
    // Handle hot reload if needed
  });
}