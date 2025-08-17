/**
 * Mobile Navigation Component - Touch-optimized navigation for mobile devices
 * 
 * @description Provides hamburger menu, slide-out drawer, and touch-friendly navigation
 * for mobile devices. Includes swipe gestures, accessibility features, and smooth animations.
 * 
 * Features:
 * - Hamburger menu with animated transitions
 * - Slide-out navigation drawer with overlay
 * - Touch gesture support (swipe to close)
 * - Accessibility compliance (ARIA labels, keyboard navigation)
 * - Integration with main app navigation state
 * - Responsive breakpoint detection
 * 
 * @class MobileNavigation
 * @since 2.0.0
 */
class MobileNavigation {
  constructor(app) {
    this.app = app;
    this.isOpen = false;
    this.breakpoint = 968; // px - when to show mobile nav
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    
    this.init();
  }

  /**
   * Initialize mobile navigation
   */
  init() {
    this.createMobileNavStructure();
    this.bindEvents();
    this.checkBreakpoint();
    
    console.log('[MobileNavigation] Initialized');
  }

  /**
   * Create mobile navigation HTML structure
   */
  createMobileNavStructure() {
    // Create hamburger button
    const hamburgerButton = document.createElement('button');
    hamburgerButton.className = 'mobile-nav-toggle';
    hamburgerButton.setAttribute('aria-label', 'Abrir menú de navegación');
    hamburgerButton.setAttribute('aria-expanded', 'false');
    hamburgerButton.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    `;

    // Create mobile navigation overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    // Create mobile navigation drawer
    const drawer = document.createElement('nav');
    drawer.className = 'mobile-nav-drawer';
    drawer.setAttribute('aria-label', 'Navegación móvil');
    drawer.innerHTML = `
      <div class="mobile-nav-header">
        <div class="mobile-nav-logo">
          <div class="logo-icon">📚</div>
          <span>EC0249</span>
        </div>
        <button class="mobile-nav-close" aria-label="Cerrar menú">
          <span class="close-icon">&times;</span>
        </button>
      </div>
      
      <div class="mobile-nav-content">
        <section class="mobile-nav-section">
          <h3>Navegación Principal</h3>
          <ul class="mobile-nav-main">
            <li>
              <button class="mobile-nav-item" data-view="dashboard" data-i18n="navigation.dashboard">
                <span class="nav-icon">🏠</span>
                <span class="nav-text">Dashboard</span>
              </button>
            </li>
            <li>
              <button class="mobile-nav-item" data-view="modules" data-i18n="navigation.modules">
                <span class="nav-icon">📚</span>
                <span class="nav-text">Módulos</span>
              </button>
            </li>
            <li>
              <button class="mobile-nav-item" data-view="assessment" data-i18n="navigation.assessment">
                <span class="nav-icon">📝</span>
                <span class="nav-text">Evaluación</span>
              </button>
            </li>
            <li>
              <button class="mobile-nav-item" data-view="portfolio" data-i18n="navigation.portfolio">
                <span class="nav-icon">💼</span>
                <span class="nav-text">Portafolio</span>
              </button>
            </li>
          </ul>
        </section>

        <section class="mobile-nav-section">
          <h3>Módulos de Aprendizaje</h3>
          <ul class="mobile-nav-modules">
            <li>
              <button class="mobile-nav-item" data-section="module1" data-i18n="modules.nav.module1">
                <span class="nav-icon">🎯</span>
                <span class="nav-text">Módulo 1: Fundamentos</span>
              </button>
            </li>
            <li>
              <button class="mobile-nav-item" data-section="module2" data-i18n="modules.nav.module2">
                <span class="nav-icon">🔍</span>
                <span class="nav-text">Módulo 2: Identificación</span>
              </button>
            </li>
            <li>
              <button class="mobile-nav-item" data-section="module3" data-i18n="modules.nav.module3">
                <span class="nav-icon">💡</span>
                <span class="nav-text">Módulo 3: Desarrollo</span>
              </button>
            </li>
            <li>
              <button class="mobile-nav-item" data-section="module4" data-i18n="modules.nav.module4">
                <span class="nav-icon">📋</span>
                <span class="nav-text">Módulo 4: Presentación</span>
              </button>
            </li>
          </ul>
        </section>

        <section class="mobile-nav-section">
          <h3>Herramientas</h3>
          <ul class="mobile-nav-tools">
            <li>
              <button class="mobile-nav-item" data-section="documents" data-i18n="navigation.documents">
                <span class="nav-icon">📄</span>
                <span class="nav-text">Plantillas</span>
              </button>
            </li>
            <li>
              <button class="mobile-nav-item" data-section="progress" data-i18n="navigation.progress">
                <span class="nav-icon">📊</span>
                <span class="nav-text">Mi Progreso</span>
              </button>
            </li>
          </ul>
        </section>
      </div>

      <div class="mobile-nav-footer">
        <div class="theme-language-controls">
          <div id="mobileLanguageToggle" class="mobile-control"></div>
          <div id="mobileThemeToggle" class="mobile-control"></div>
        </div>
      </div>
    `;

    // Insert hamburger button in header
    const headerControls = document.querySelector('.header-controls');
    if (headerControls) {
      headerControls.insertBefore(hamburgerButton, headerControls.firstChild);
    }

    // Append overlay and drawer to body
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Store references
    this.hamburgerButton = hamburgerButton;
    this.overlay = overlay;
    this.drawer = drawer;
    this.closeButton = drawer.querySelector('.mobile-nav-close');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Hamburger button click
    this.hamburgerButton.addEventListener('click', () => {
      this.toggle();
    });

    // Close button click
    this.closeButton.addEventListener('click', () => {
      this.close();
    });

    // Overlay click to close
    this.overlay.addEventListener('click', () => {
      this.close();
    });

    // Navigation item clicks
    this.drawer.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        this.handleNavigation(e);
      });
    });

    // Touch gestures for swipe-to-close
    this.drawer.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.drawer.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.drawer.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

    // Keyboard navigation
    this.drawer.addEventListener('keydown', this.handleKeydown.bind(this));

    // Window resize
    window.addEventListener('resize', this.checkBreakpoint.bind(this));

    // Listen for app navigation changes to update active states
    if (this.app.eventBus) {
      this.app.eventBus.subscribe('view:changed', this.updateActiveStates.bind(this));
      this.app.eventBus.subscribe('section:changed', this.updateActiveStates.bind(this));
    }
  }

  /**
   * Handle touch start for swipe gestures
   */
  handleTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.currentX = this.startX;
    this.isDragging = true;
  }

  /**
   * Handle touch move for swipe gestures
   */
  handleTouchMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.touches[0].clientX;
    const deltaX = this.currentX - this.startX;

    // Only allow leftward swipes (closing)
    if (deltaX < 0) {
      const progress = Math.min(Math.abs(deltaX) / 200, 1);
      this.drawer.style.transform = `translateX(${deltaX}px)`;
      this.overlay.style.opacity = 1 - progress;
      
      // Prevent scrolling while swiping
      e.preventDefault();
    }
  }

  /**
   * Handle touch end for swipe gestures
   */
  handleTouchEnd(e) {
    if (!this.isDragging) return;

    const deltaX = this.currentX - this.startX;
    const threshold = 100; // px - minimum swipe distance to close

    if (deltaX < -threshold) {
      this.close();
    } else {
      // Reset position
      this.drawer.style.transform = '';
      this.overlay.style.opacity = '';
    }

    this.isDragging = false;
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  /**
   * Handle navigation item clicks
   */
  handleNavigation(e) {
    e.preventDefault();
    const item = e.currentTarget;
    const view = item.getAttribute('data-view');
    const section = item.getAttribute('data-section');

    // Navigate via app
    if (view && this.app.viewManager) {
      this.app.viewManager.showView(view);
    } else if (section && this.app.viewManager) {
      this.app.viewManager.showSection(section);
    }

    // Close mobile nav after navigation
    this.close();
  }

  /**
   * Open mobile navigation
   */
  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    document.body.classList.add('mobile-nav-open');
    this.overlay.classList.add('active');
    this.drawer.classList.add('active');
    this.hamburgerButton.classList.add('active');
    this.hamburgerButton.setAttribute('aria-expanded', 'true');
    this.overlay.setAttribute('aria-hidden', 'false');

    // Focus management
    this.drawer.querySelector('.mobile-nav-close').focus();

    // Update active states
    this.updateActiveStates();
  }

  /**
   * Close mobile navigation
   */
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    document.body.classList.remove('mobile-nav-open');
    this.overlay.classList.remove('active');
    this.drawer.classList.remove('active');
    this.hamburgerButton.classList.remove('active');
    this.hamburgerButton.setAttribute('aria-expanded', 'false');
    this.overlay.setAttribute('aria-hidden', 'true');

    // Reset any transform from gestures
    this.drawer.style.transform = '';
    this.overlay.style.opacity = '';

    // Return focus to hamburger button
    this.hamburgerButton.focus();
  }

  /**
   * Toggle mobile navigation
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Update active navigation states
   */
  updateActiveStates() {
    // Remove all active states
    this.drawer.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Get current app state
    const currentView = this.app.appState?.currentView;
    const currentSection = this.app.appState?.currentSection;

    // Highlight current view
    if (currentView) {
      const viewItem = this.drawer.querySelector(`[data-view="${currentView}"]`);
      if (viewItem) {
        viewItem.classList.add('active');
      }
    }

    // Highlight current section
    if (currentSection) {
      const sectionItem = this.drawer.querySelector(`[data-section="${currentSection}"]`);
      if (sectionItem) {
        sectionItem.classList.add('active');
      }
    }
  }

  /**
   * Check if mobile navigation should be shown based on screen size
   */
  checkBreakpoint() {
    const isMobile = window.innerWidth < this.breakpoint;
    
    if (isMobile) {
      this.hamburgerButton.style.display = 'flex';
      document.body.classList.add('mobile-nav-enabled');
    } else {
      this.hamburgerButton.style.display = 'none';
      document.body.classList.remove('mobile-nav-enabled');
      this.close(); // Close if open when switching to desktop
    }
  }

  /**
   * Destroy mobile navigation
   */
  destroy() {
    this.close();
    
    // Remove event listeners
    window.removeEventListener('resize', this.checkBreakpoint.bind(this));
    
    // Remove DOM elements
    if (this.hamburgerButton) this.hamburgerButton.remove();
    if (this.overlay) this.overlay.remove();
    if (this.drawer) this.drawer.remove();
    
    // Clean up classes
    document.body.classList.remove('mobile-nav-open', 'mobile-nav-enabled');
    
    console.log('[MobileNavigation] Destroyed');
  }
}

export default MobileNavigation;