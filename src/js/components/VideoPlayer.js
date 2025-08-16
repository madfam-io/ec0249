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
      <div class="video-player-container" data-video-id="${this.videoId}">
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
    
    let wrapperStyle = `
      position: relative;
      width: ${placement.width || config.width};
      max-width: ${placement.maxWidth || '800px'};
      margin: 0 auto;
    `;

    if (config.responsive) {
      wrapperStyle += `
        padding-bottom: ${(aspectRatio.height / aspectRatio.width * 100).toFixed(2)}%;
        height: 0;
      `;
    }

    const iframeStyle = config.responsive ? `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    ` : `
      width: ${config.width};
      height: ${config.height === 'auto' ? Math.round(560 * aspectRatio.height / aspectRatio.width) + 'px' : config.height};
    `;

    return {
      wrapperStyle,
      iframeStyle
    };
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
    this.videoId = null;
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
    
    console.log('[VideoPlayer] Destroyed');
  }
}

export default VideoPlayer;