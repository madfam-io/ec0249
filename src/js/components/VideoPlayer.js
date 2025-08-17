/**
 * Video Player Component - YouTube Video Integration
 * 
 * @description Responsive YouTube video player component with analytics tracking,
 * progress monitoring, and integration with the EC0249 learning platform.
 * Supports multiple display modes and automatic progress tracking.
 * 
 * @class VideoPlayer
 * @extends BaseComponent
 * 
 * @since 2.0.0
 */

import BaseComponent from './BaseComponent.js';
import { generateEmbedUrl, VIDEO_PLACEMENTS, YOUTUBE_CONFIG } from '../config/VideoConfig.js';

class VideoPlayer extends BaseComponent {
  constructor(config = {}) {
    super('VideoPlayer', [], {
      autoplay: false,
      controls: true,
      width: '100%',
      height: 'auto',
      aspectRatio: '16:9',
      placement: 'lesson_content',
      trackProgress: true,
      allowFullscreen: true,
      showTitle: true,
      showDescription: false,
      responsive: true,
      ...config
    });

    this.videoId = null;
    this.videoTitle = '';
    this.videoDescription = '';
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
    this.progressInterval = null;
    this.watchedPercentage = 0;
  }

  async onInitialize() {
    try {
      this.eventBus = this.service('EventBus');
      
      console.log('[VideoPlayer] Initialized');
    } catch (error) {
      console.warn('[VideoPlayer] Failed to initialize service dependencies:', error);
      // Continue without EventBus if needed
      this.eventBus = null;
    }
  }

  /**
   * Load and display a video
   */
  loadVideo(videoConfig) {
    if (!videoConfig || !videoConfig.id) {
      console.error('[VideoPlayer] Invalid video configuration');
      return;
    }

    this.videoId = videoConfig.id;
    this.videoTitle = videoConfig.title || '';
    this.videoDescription = videoConfig.description || '';
    
    // Reset tracking data
    this.currentTime = 0;
    this.duration = 0;
    this.watchedPercentage = 0;
    this.isPlaying = false;

    this.render();
    
    // Emit video loaded event
    try {
      this.emit('video:loaded', {
        videoId: this.videoId,
        title: this.videoTitle,
        component: this.name
      });
    } catch (error) {
      console.warn('[VideoPlayer] Failed to emit video:loaded event:', error);
    }
  }

  /**
   * Render the video player
   */
  render() {
    if (!this.element) {
      console.warn('[VideoPlayer] No element available for rendering');
      return;
    }

    if (!this.videoId) {
      this.element.innerHTML = this.createPlaceholder();
      return;
    }

    const playerHtml = this.createPlayerHTML();
    this.element.innerHTML = playerHtml;
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start progress tracking if enabled
    if (this.config && this.config.trackProgress) {
      this.startProgressTracking();
    }
  }

  /**
   * Create video player HTML
   */
  createPlayerHTML() {
    const config = this.config || {};
    const placement = VIDEO_PLACEMENTS[config.placement] || VIDEO_PLACEMENTS.lesson_content;
    
    // Generate embed URL with player parameters
    const embedUrl = generateEmbedUrl(this.videoId, {
      autoplay: config.autoplay ? 1 : 0,
      controls: config.controls ? 1 : 0
    });

    // Calculate responsive dimensions
    const dimensions = this.calculateDimensions(placement);

    return `
      <div class="video-player-container ${dimensions.containerClasses}" data-video-id="${this.videoId}">
        ${config.showTitle ? this.createTitleSection() : ''}
        
        <div class="video-wrapper" style="${dimensions.wrapperStyle}">
          <iframe
            class="video-iframe"
            src="${embedUrl}"
            title="${this.escapeHtml(this.videoTitle)}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ${config.allowFullscreen ? 'allowfullscreen' : ''}
            style="${dimensions.iframeStyle}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin">
          </iframe>
          
          <div class="video-overlay" style="display: none;">
            <div class="video-loading">
              <div class="loading-spinner"></div>
              <span>Cargando video...</span>
            </div>
          </div>
          
          <div class="video-error" style="display: none;">
            <div class="error-content">
              <div class="error-icon">⚠️</div>
              <h4>Video no disponible</h4>
              <p>El video no pudo cargarse. Esto puede deberse a bloqueadores de contenido o problemas de conectividad.</p>
              <button class="btn btn-secondary retry-video">Reintentar</button>
            </div>
          </div>
        </div>
        
        ${config.showDescription && this.videoDescription ? this.createDescriptionSection() : ''}
        
        <div class="video-controls-extra">
          <div class="video-progress-info">
            <span class="watch-time">Tiempo visto: <span class="current-time">0:00</span></span>
            <span class="progress-percentage">Progreso: <span class="watched-percent">0%</span></span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create title section HTML
   */
  createTitleSection() {
    return `
      <div class="video-header">
        <h3 class="video-title">${this.escapeHtml(this.videoTitle)}</h3>
        <div class="video-meta">
          <span class="video-badge">🎥 Video Educativo</span>
          <span class="video-duration" id="video-duration-${this.videoId}">--:--</span>
        </div>
      </div>
    `;
  }

  /**
   * Create description section HTML
   */
  createDescriptionSection() {
    return `
      <div class="video-description">
        <p>${this.escapeHtml(this.videoDescription)}</p>
      </div>
    `;
  }

  /**
   * Create placeholder when no video is loaded
   */
  createPlaceholder() {
    return `
      <div class="video-placeholder">
        <div class="placeholder-content">
          <div class="placeholder-icon">🎥</div>
          <h3>Video no disponible</h3>
          <p>No se ha cargado ningún video para mostrar.</p>
        </div>
      </div>
    `;
  }

  /**
   * Calculate responsive dimensions
   */
  calculateDimensions(placement) {
    const config = this.config || {};
    const aspectRatio = this.parseAspectRatio(config.aspectRatio || '16:9');
    
    // Enhanced mobile detection with more breakpoints
    const screenWidth = window.innerWidth;
    const isExtraSmallMobile = screenWidth <= 480;
    const isSmallMobile = screenWidth <= 640;
    const isMobile = screenWidth <= 768;
    const isTablet = screenWidth <= 968;
    
    // Responsive width calculation
    const getResponsiveWidth = () => {
      if (isExtraSmallMobile) return '100%';
      if (isSmallMobile) return '100%';
      if (isMobile) return '100%';
      if (isTablet) return placement.width || '100%';
      return placement.width || config.width || '100%';
    };
    
    // Responsive max-width calculation
    const getResponsiveMaxWidth = () => {
      if (isExtraSmallMobile) return '100%';
      if (isSmallMobile) return '100%';
      if (isMobile) return '100%';
      if (isTablet) return placement.maxWidth || '600px';
      return placement.maxWidth || '800px';
    };
    
    let wrapperStyle = `
      position: relative;
      width: ${getResponsiveWidth()};
      max-width: ${getResponsiveMaxWidth()};
      margin: 0 auto;
      border-radius: ${isExtraSmallMobile ? '6px' : isMobile ? '8px' : '12px'};
      overflow: hidden;
      box-shadow: ${isMobile ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : '0 10px 15px -3px rgb(0 0 0 / 0.1)'};
    `;

    if (config.responsive) {
      // Dynamic aspect ratio based on screen size for optimal mobile viewing
      let responsiveAspectRatio;
      
      if (isExtraSmallMobile) {
        // More compact ratio for very small screens to save vertical space
        responsiveAspectRatio = { width: 16, height: 9 };
      } else if (isSmallMobile) {
        // Slightly more compact for small mobile
        responsiveAspectRatio = { width: 16, height: 9 };
      } else if (isMobile) {
        // Standard mobile ratio
        responsiveAspectRatio = { width: 16, height: 9 };
      } else {
        // Desktop uses configured aspect ratio
        responsiveAspectRatio = aspectRatio;
      }
      
      const paddingBottom = (responsiveAspectRatio.height / responsiveAspectRatio.width * 100).toFixed(2);
      wrapperStyle += `
        padding-bottom: ${paddingBottom}%;
        height: 0;
      `;
    } else {
      // Fixed height mode with responsive sizing
      const getFixedHeight = () => {
        if (isExtraSmallMobile) return '200px';
        if (isSmallMobile) return '250px';
        if (isMobile) return '280px';
        if (isTablet) return '350px';
        return config.height === 'auto' ? 
          Math.round(560 * aspectRatio.height / aspectRatio.width) + 'px' : 
          config.height;
      };
      
      wrapperStyle += `height: ${getFixedHeight()};`;
    }

    const iframeStyle = config.responsive ? `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      border-radius: inherit;
    ` : `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: inherit;
    `;

    return {
      wrapperStyle,
      iframeStyle,
      containerClasses: this.getResponsiveClasses(screenWidth)
    };
  }

  /**
   * Get responsive CSS classes based on screen width
   */
  getResponsiveClasses(screenWidth) {
    const classes = ['video-player-responsive'];
    
    if (screenWidth <= 480) classes.push('video-player-xs');
    else if (screenWidth <= 640) classes.push('video-player-sm');
    else if (screenWidth <= 768) classes.push('video-player-md');
    else if (screenWidth <= 968) classes.push('video-player-lg');
    else classes.push('video-player-xl');
    
    return classes.join(' ');
  }

  /**
   * Parse aspect ratio string (e.g., "16:9")
   */
  parseAspectRatio(ratio) {
    const [width, height] = ratio.split(':').map(Number);
    return { width: width || 16, height: height || 9 };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const iframe = this.element.querySelector('.video-iframe');
    if (!iframe) return;

    // Listen for iframe load
    iframe.addEventListener('load', () => {
      this.onVideoReady();
    });

    // Listen for iframe error
    iframe.addEventListener('error', () => {
      this.onVideoError();
    });

    // Set up retry button
    const retryButton = this.element.querySelector('.retry-video');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        this.retryVideo();
      });
    }

    // Enhanced responsive handling with debounced resize
    this.setupResponsiveHandling();

    // Listen for video events via postMessage (YouTube IFrame API)
    // Note: youtube-nocookie.com origin for privacy mode
    window.addEventListener('message', (event) => {
      if (!event.origin.includes('youtube')) return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.id === this.videoId) {
          this.handleVideoEvent(data);
        }
      } catch (error) {
        // Ignore non-JSON messages
      }
    });

    // Handle window resize for responsive adjustments
    this.resizeHandler = () => {
      this.handleResize();
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Handle video ready event
   */
  onVideoReady() {
    console.log('[VideoPlayer] Video ready:', this.videoId);
    
    // Hide error overlay if shown
    this.hideVideoError();
    
    // Try to get video duration (requires YouTube API)
    this.updateVideoDuration();
    
    try {
      this.emit('video:ready', {
        videoId: this.videoId,
        title: this.videoTitle
      });
    } catch (error) {
      console.warn('[VideoPlayer] Failed to emit video:ready event:', error);
    }
  }

  /**
   * Handle video error event
   */
  onVideoError() {
    console.warn('[VideoPlayer] Video failed to load:', this.videoId);
    this.showVideoError();
    
    try {
      this.emit('video:error', {
        videoId: this.videoId,
        title: this.videoTitle,
        error: 'Failed to load video'
      });
    } catch (error) {
      console.warn('[VideoPlayer] Failed to emit video:error event:', error);
    }
  }

  /**
   * Show video error overlay
   */
  showVideoError() {
    const errorOverlay = this.element.querySelector('.video-error');
    const iframe = this.element.querySelector('.video-iframe');
    
    if (errorOverlay) {
      errorOverlay.style.display = 'flex';
    }
    if (iframe) {
      iframe.style.display = 'none';
    }
  }

  /**
   * Hide video error overlay
   */
  hideVideoError() {
    const errorOverlay = this.element.querySelector('.video-error');
    const iframe = this.element.querySelector('.video-iframe');
    
    if (errorOverlay) {
      errorOverlay.style.display = 'none';
    }
    if (iframe) {
      iframe.style.display = 'block';
    }
  }

  /**
   * Retry video loading
   */
  retryVideo() {
    console.log('[VideoPlayer] Retrying video load:', this.videoId);
    
    // Hide error and reload iframe
    this.hideVideoError();
    
    const iframe = this.element.querySelector('.video-iframe');
    if (iframe) {
      // Force reload by setting src again
      const currentSrc = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 100);
    }
  }

  /**
   * Handle video events from YouTube
   */
  handleVideoEvent(data) {
    switch (data.event) {
      case 'video-progress':
        this.updateProgress(data.info);
        break;
      case 'video-time':
        this.updateCurrentTime(data.info);
        break;
      default:
        console.log('[VideoPlayer] Unhandled video event:', data.event);
    }
  }

  /**
   * Start progress tracking
   */
  startProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    this.progressInterval = setInterval(() => {
      this.trackVideoProgress();
    }, 5000); // Track every 5 seconds
  }

  /**
   * Track video progress
   */
  trackVideoProgress() {
    // This would normally get actual playback time from YouTube API
    // For now, we'll simulate progress tracking
    
    if (this.isPlaying && this.duration > 0) {
      this.currentTime += 5; // Simulate 5 seconds progress
      
      if (this.currentTime > this.duration) {
        this.currentTime = this.duration;
      }
      
      this.watchedPercentage = Math.round((this.currentTime / this.duration) * 100);
      
      this.updateProgressDisplay();
      
      // Emit progress event
      try {
        this.emit('video:progress', {
          videoId: this.videoId,
          currentTime: this.currentTime,
          duration: this.duration,
          percentage: this.watchedPercentage
        });
      } catch (error) {
        console.warn('[VideoPlayer] Failed to emit video:progress event:', error);
      }
      
      // Mark as completed if watched 80% or more
      if (this.watchedPercentage >= 80) {
        this.markVideoCompleted();
      }
    }
  }

  /**
   * Update progress display
   */
  updateProgressDisplay() {
    const currentTimeEl = this.element.querySelector('.current-time');
    const percentageEl = this.element.querySelector('.watched-percent');
    
    if (currentTimeEl) {
      currentTimeEl.textContent = this.formatTime(this.currentTime);
    }
    
    if (percentageEl) {
      percentageEl.textContent = `${this.watchedPercentage}%`;
    }
  }

  /**
   * Update video duration display
   */
  updateVideoDuration() {
    // This would get actual duration from YouTube API
    // For now, set a default duration
    this.duration = 600; // 10 minutes default
    
    const durationEl = this.element.querySelector(`#video-duration-${this.videoId}`);
    if (durationEl) {
      durationEl.textContent = this.formatTime(this.duration);
    }
  }

  /**
   * Mark video as completed
   */
  markVideoCompleted() {
    if (this.watchedPercentage >= 80) {
      console.log('[VideoPlayer] Video completed:', this.videoId);
      
      try {
        this.emit('video:completed', {
          videoId: this.videoId,
          title: this.videoTitle,
          watchedPercentage: this.watchedPercentage,
          totalTime: this.currentTime
        });
      } catch (error) {
        console.warn('[VideoPlayer] Failed to emit video:completed event:', error);
      }
    }
  }

  /**
   * Format time in MM:SS format
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Play video
   */
  play() {
    this.isPlaying = true;
    try {
      this.emit('video:play', { videoId: this.videoId });
    } catch (error) {
      console.warn('[VideoPlayer] Failed to emit video:play event:', error);
    }
  }

  /**
   * Pause video
   */
  pause() {
    this.isPlaying = false;
    try {
      this.emit('video:pause', { videoId: this.videoId });
    } catch (error) {
      console.warn('[VideoPlayer] Failed to emit video:pause event:', error);
    }
  }

  /**
   * Stop progress tracking
   */
  stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Setup responsive handling with improved mobile support
   */
  setupResponsiveHandling() {
    // Initial orientation and screen size detection
    this.currentOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    this.currentScreenSize = this.getScreenSizeCategory();
    
    // Listen for window resize with optimized debouncing
    const resizeHandler = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      const newScreenSize = this.getScreenSizeCategory();
      
      // Only update if orientation or screen size category changed
      if (newOrientation !== this.currentOrientation || newScreenSize !== this.currentScreenSize) {
        this.currentOrientation = newOrientation;
        this.currentScreenSize = newScreenSize;
        this.handleResize();
      }
    };
    
    // Use debounced resize for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeHandler, 150);
    });
    
    // Listen for orientation change events (mobile)
    if ('onorientationchange' in window) {
      window.addEventListener('orientationchange', () => {
        // Small delay to let the viewport adjust
        setTimeout(() => {
          this.handleResize();
        }, 300);
      });
    }
    
    // Listen for viewport changes (modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.handleResize();
      });
    }
  }

  /**
   * Get screen size category for responsive handling
   */
  getScreenSizeCategory() {
    const width = window.innerWidth;
    if (width <= 480) return 'xs';
    if (width <= 640) return 'sm';
    if (width <= 768) return 'md';
    if (width <= 968) return 'lg';
    return 'xl';
  }

  /**
   * Handle window resize for responsive adjustments
   */
  handleResize() {
    if (!this.element || !this.videoId) return;

    // Debounce resize handling
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      const config = this.config || {};
      const placement = VIDEO_PLACEMENTS[config.placement] || VIDEO_PLACEMENTS.lesson_content;
      const dimensions = this.calculateDimensions(placement);
      
      const wrapper = this.element.querySelector('.video-wrapper');
      const iframe = this.element.querySelector('.video-iframe');
      
      if (wrapper && iframe) {
        // Update wrapper styles
        Object.assign(wrapper.style, this.parseStyleString(dimensions.wrapperStyle));
        
        // Update iframe styles
        Object.assign(iframe.style, this.parseStyleString(dimensions.iframeStyle));
      }
    }, 150);
  }

  /**
   * Parse style string into object
   */
  parseStyleString(styleString) {
    const styles = {};
    styleString.split(';').forEach(style => {
      const [property, value] = style.split(':').map(s => s.trim());
      if (property && value) {
        const camelProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        styles[camelProperty] = value;
      }
    });
    return styles;
  }

  /**
   * Get current video state
   */
  getVideoState() {
    return {
      videoId: this.videoId,
      title: this.videoTitle,
      currentTime: this.currentTime,
      duration: this.duration,
      watchedPercentage: this.watchedPercentage,
      isPlaying: this.isPlaying
    };
  }

  async onDestroy() {
    this.stopProgressTracking();
    
    // Remove resize event listener
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    // Clear resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.videoId = null;
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
    
    console.log('[VideoPlayer] Destroyed');
  }
}

export default VideoPlayer;