/**
 * EC0249 Educational Platform - Main Entry Point
 * Vite-optimized application bootstrap
 */
import EC0249App from './js/App.js';
import './css/app.css';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
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
    
    // Hide loading indicator
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize EC0249 application:', error);
    
    // Hide loading and show error
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.style.display = 'none';
    
    const errorElement = document.getElementById('app-error');
    if (errorElement) {
      errorElement.innerHTML = `
        <h3>Error al cargar la aplicación</h3>
        <p>${error.message}</p>
        <button onclick="location.reload()" class="btn btn-primary">Recargar Página</button>
      `;
      errorElement.style.display = 'block';
    }
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