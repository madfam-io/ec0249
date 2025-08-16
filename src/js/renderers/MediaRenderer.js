/**
 * Media Renderer - Handles video, audio, and multimedia content rendering
 * Extracted from ContentEngine for better modularity
 */
import { eventBus } from '../core/EventBus.js';

class MediaRenderer {
  constructor() {
    // Using EventBus directly instead of passed emitter
  }

  /**
   * Create video element
   * @param {Object} section - Section with video data
   * @returns {Promise<HTMLElement>} Video element
   */
  async createVideoElement(section) {
    const container = document.createElement('div');
    container.className = 'video-container';

    const video = document.createElement('video');
    video.className = 'content-video';
    video.controls = true;
    video.preload = 'metadata';

    if (section.poster) {
      video.poster = section.poster;
    }

    if (section.src) {
      video.src = section.src;
    } else if (section.sources) {
      section.sources.forEach(source => {
        const sourceElement = document.createElement('source');
        sourceElement.src = source.src;
        sourceElement.type = source.type;
        video.appendChild(sourceElement);
      });
    }

    // Add video event listeners
    video.addEventListener('loadedmetadata', () => {
      eventBus.publish('media:loaded', { type: 'video', element: video, section });
    });

    video.addEventListener('play', () => {
      eventBus.publish('media:play', { type: 'video', element: video, section });
      this.trackMediaInteraction('video_play', section.id);
    });

    video.addEventListener('ended', () => {
      eventBus.publish('media:ended', { type: 'video', element: video, section });
      this.trackMediaInteraction('video_complete', section.id);
    });

    container.appendChild(video);

    // Add transcript if available
    if (section.transcript) {
      const transcript = this.createTranscriptElement(section.transcript);
      container.appendChild(transcript);
    }

    return container;
  }

  /**
   * Create audio element
   * @param {Object} section - Section with audio data
   * @returns {Promise<HTMLElement>} Audio element
   */
  async createAudioElement(section) {
    const container = document.createElement('div');
    container.className = 'audio-container';

    const audio = document.createElement('audio');
    audio.className = 'content-audio';
    audio.controls = true;
    audio.preload = 'metadata';

    if (section.src) {
      audio.src = section.src;
    }

    // Add audio event listeners
    audio.addEventListener('play', () => {
      eventBus.publish('media:play', { type: 'audio', element: audio, section });
      this.trackMediaInteraction('audio_play', section.id);
    });

    audio.addEventListener('ended', () => {
      eventBus.publish('media:ended', { type: 'audio', element: audio, section });
      this.trackMediaInteraction('audio_complete', section.id);
    });

    container.appendChild(audio);
    return container;
  }

  /**
   * Create transcript element
   * @param {string} transcript - Transcript text
   * @returns {HTMLElement} Transcript element
   */
  createTranscriptElement(transcript) {
    const container = document.createElement('div');
    container.className = 'transcript-container';

    const header = document.createElement('button');
    header.className = 'transcript-toggle';
    header.textContent = 'Mostrar Transcripción';
    header.setAttribute('aria-expanded', 'false');

    const content = document.createElement('div');
    content.className = 'transcript-content';
    content.style.display = 'none';
    content.innerHTML = `<p class="transcript-text">${transcript}</p>`;

    header.addEventListener('click', () => {
      const isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : 'block';
      header.textContent = isVisible ? 'Mostrar Transcripción' : 'Ocultar Transcripción';
      header.setAttribute('aria-expanded', !isVisible);
    });

    container.appendChild(header);
    container.appendChild(content);

    return container;
  }

  /**
   * Initialize media elements in container
   * @param {HTMLElement} container - Container element
   * @param {Object} content - Content data
   */
  async initializeMediaElements(container, content) {
    const mediaElements = container.querySelectorAll('video, audio');
    
    mediaElements.forEach(media => {
      // Set up common media properties
      media.setAttribute('data-content-id', content.id);
      
      // Add error handling
      media.addEventListener('error', (e) => {
        console.error('[MediaRenderer] Media error:', e);
        this.showMediaError(media, 'Error loading media content');
      });

      // Add loading states
      media.addEventListener('loadstart', () => {
        this.showMediaLoading(media);
      });

      media.addEventListener('canplay', () => {
        this.hideMediaLoading(media);
      });
    });
  }

  /**
   * Show media loading state
   * @param {HTMLElement} mediaElement - Media element
   */
  showMediaLoading(mediaElement) {
    const container = mediaElement.parentElement;
    let loader = container.querySelector('.media-loader');
    
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'media-loader';
      loader.innerHTML = '<span class="loader-spinner"></span> Cargando...';
      container.appendChild(loader);
    }
    
    loader.style.display = 'block';
  }

  /**
   * Hide media loading state
   * @param {HTMLElement} mediaElement - Media element
   */
  hideMediaLoading(mediaElement) {
    const container = mediaElement.parentElement;
    const loader = container.querySelector('.media-loader');
    
    if (loader) {
      loader.style.display = 'none';
    }
  }

  /**
   * Show media error
   * @param {HTMLElement} mediaElement - Media element
   * @param {string} message - Error message
   */
  showMediaError(mediaElement, message) {
    const container = mediaElement.parentElement;
    
    const errorElement = document.createElement('div');
    errorElement.className = 'media-error';
    errorElement.innerHTML = `
      <span class="error-icon">⚠️</span>
      <span class="error-message">${message}</span>
      <button class="retry-button" onclick="this.parentElement.parentElement.querySelector('video, audio').load()">
        Reintentar
      </button>
    `;
    
    container.appendChild(errorElement);
    mediaElement.style.display = 'none';
  }

  /**
   * Track media interaction
   * @param {string} action - Interaction action
   * @param {string} sectionId - Section ID
   */
  trackMediaInteraction(action, sectionId) {
    eventBus.publish('analytics:track', {
      event: action,
      sectionId: sectionId,
      timestamp: Date.now()
    });
  }

  /**
   * Cleanup media elements
   * @param {HTMLElement} container - Container with media elements
   */
  cleanupMediaElements(container) {
    const mediaElements = container.querySelectorAll('video, audio');
    mediaElements.forEach(media => {
      media.pause();
      media.src = '';
      media.load();
    });
  }
}

export default MediaRenderer;