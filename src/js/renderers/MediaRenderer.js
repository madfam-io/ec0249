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
    // Check if this is a YouTube video
    if (section.type === 'youtube' && section.videoId) {
      return this.createYouTubeElement(section);
    }

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
   * Create YouTube video element
   * @param {Object} section - Section with YouTube video data
   * @returns {HTMLElement} YouTube container element
   */
  createYouTubeElement(section) {
    const container = document.createElement('div');
    container.className = 'youtube-video-container';
    container.setAttribute('data-video-id', section.videoId);
    container.setAttribute('data-video-title', section.title || '');

    // Create video header with title and duration
    if (section.title || section.duration) {
      const header = document.createElement('div');
      header.className = 'video-header';
      
      if (section.title) {
        const title = document.createElement('h4');
        title.className = 'video-title';
        title.textContent = section.title;
        header.appendChild(title);
      }

      if (section.duration) {
        const duration = document.createElement('span');
        duration.className = 'video-duration';
        duration.textContent = section.duration;
        header.appendChild(duration);
      }

      container.appendChild(header);
    }

    // Create iframe for YouTube embed
    const iframe = document.createElement('iframe');
    iframe.className = 'youtube-iframe';
    iframe.src = `https://www.youtube.com/embed/${section.videoId}?enablejsapi=1&origin=${window.location.origin}`;
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.title = section.title || 'Video';
    iframe.loading = 'lazy';

    // Set responsive dimensions
    iframe.width = '100%';
    iframe.height = '315';

    container.appendChild(iframe);

    // Add video description if available
    if (section.description) {
      const description = document.createElement('div');
      description.className = 'video-description';
      description.innerHTML = `<p>${section.description}</p>`;
      container.appendChild(description);
    }

    // Add learning objectives if available
    if (section.learningObjectives && section.learningObjectives.length > 0) {
      const objectives = this.createObjectivesElement(section.learningObjectives);
      container.appendChild(objectives);
    }

    // Add key timestamps if available
    if (section.keyTimestamps && section.keyTimestamps.length > 0) {
      const timestamps = this.createTimestampsElement(section.keyTimestamps, section.videoId);
      container.appendChild(timestamps);
    }

    // Add transcript if available
    if (section.transcript) {
      const transcript = this.createTranscriptElement(section.transcript);
      container.appendChild(transcript);
    }

    // Track video view
    this.trackMediaInteraction('youtube_video_view', section.videoId);

    return container;
  }

  /**
   * Create learning objectives element
   * @param {Array} objectives - Learning objectives array
   * @returns {HTMLElement} Objectives element
   */
  createObjectivesElement(objectives) {
    const container = document.createElement('div');
    container.className = 'video-objectives';

    const header = document.createElement('h5');
    header.textContent = 'Objetivos de Aprendizaje';
    header.className = 'objectives-header';
    container.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'objectives-list';

    objectives.forEach(objective => {
      const item = document.createElement('li');
      item.textContent = objective;
      list.appendChild(item);
    });

    container.appendChild(list);
    return container;
  }

  /**
   * Create timestamps navigation element
   * @param {Array} timestamps - Key timestamps array
   * @param {string} videoId - YouTube video ID
   * @returns {HTMLElement} Timestamps element
   */
  createTimestampsElement(timestamps, videoId) {
    const container = document.createElement('div');
    container.className = 'video-timestamps';

    const header = document.createElement('h5');
    header.textContent = 'Contenido del Video';
    header.className = 'timestamps-header';
    container.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'timestamps-list';

    timestamps.forEach(timestamp => {
      const item = document.createElement('li');
      item.className = 'timestamp-item';
      
      const timeButton = document.createElement('button');
      timeButton.className = 'timestamp-time';
      timeButton.textContent = timestamp.time;
      timeButton.addEventListener('click', () => {
        this.seekToTime(videoId, timestamp.time);
      });

      const topic = document.createElement('span');
      topic.className = 'timestamp-topic';
      topic.textContent = timestamp.topic;

      item.appendChild(timeButton);
      item.appendChild(topic);
      list.appendChild(item);
    });

    container.appendChild(list);
    return container;
  }

  /**
   * Seek to specific time in YouTube video
   * @param {string} videoId - YouTube video ID
   * @param {string} timeString - Time string (e.g., "05:30")
   */
  seekToTime(videoId, timeString) {
    // Convert time string to seconds
    const timeParts = timeString.split(':');
    const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
    
    // Find the iframe for this video
    const iframe = document.querySelector(`[data-video-id="${videoId}"] iframe`);
    if (iframe) {
      // Update iframe src to start at specific time
      const currentSrc = iframe.src;
      const urlParts = currentSrc.split('?')[0];
      iframe.src = `${urlParts}?enablejsapi=1&start=${seconds}&autoplay=1&origin=${window.location.origin}`;
      
      // Track timestamp click
      this.trackMediaInteraction('youtube_timestamp_click', videoId, { time: timeString });
    }
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
   * @param {Object} additionalData - Additional tracking data
   */
  trackMediaInteraction(action, sectionId, additionalData = {}) {
    eventBus.publish('analytics:track', {
      event: action,
      sectionId: sectionId,
      timestamp: Date.now(),
      ...additionalData
    });
  }

  /**
   * Create media element from media section data
   * @param {Object} mediaSection - Media section configuration
   * @returns {Promise<HTMLElement>} Media element
   */
  async createMediaFromSection(mediaSection) {
    if (mediaSection.type === 'youtube') {
      return this.createYouTubeElement(mediaSection);
    } else if (mediaSection.type === 'video') {
      return this.createVideoElement(mediaSection);
    } else if (mediaSection.type === 'audio') {
      return this.createAudioElement(mediaSection);
    }
    
    // Default to video element for backward compatibility
    return this.createVideoElement(mediaSection);
  }

  /**
   * Cleanup media elements
   * @param {HTMLElement} container - Container with media elements
   */
  cleanupMediaElements(container) {
    // Cleanup regular video and audio elements
    const mediaElements = container.querySelectorAll('video, audio');
    mediaElements.forEach(media => {
      media.pause();
      media.src = '';
      media.load();
    });

    // Cleanup YouTube iframes
    const youtubeIframes = container.querySelectorAll('.youtube-iframe');
    youtubeIframes.forEach(iframe => {
      iframe.src = 'about:blank';
    });
  }
}

export default MediaRenderer;