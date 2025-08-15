import { defineConfig } from 'vite'

export default defineConfig({
  // Server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  
  // Base path
  base: './',
  
  // Public directory
  publicDir: 'public',
  
  // Resolve configuration for ES modules
  resolve: {
    alias: {
      '@': '/src/js',
      '@components': '/src/js/components',
      '@services': '/src/js/services',
      '@engines': '/src/js/engines',
      '@core': '/src/js/core',
      '@translations': '/src/js/translations',
      '@config': '/src/js/config'
    }
  },
  
  // Optimizations
  optimizeDeps: {
    include: []
  },
  
  // CSS configuration
  css: {
    devSourcemap: true
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})