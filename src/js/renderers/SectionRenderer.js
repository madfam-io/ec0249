/**
 * Section Renderer - Handles rendering of different content sections
 * Extracted from ContentEngine for better modularity
 */
class SectionRenderer {
  constructor(i18n) {
    this.i18n = i18n;
  }

  /**
   * Create content section - Enhanced for Module 1 rich content
   * @param {Object} section - Section data
   * @param {Object} parentContent - Parent content context
   * @returns {Promise<HTMLElement>} Section element
   */
  async createContentSection(section, parentContent) {
    const sectionElement = document.createElement('section');
    sectionElement.className = `content-section section-${section.type || 'default'}`;
    sectionElement.setAttribute('data-section-id', section.id);

    // Handle Module 1 content structure
    if (parentContent.type === 'lesson' && parentContent.content) {
      return this.createLessonContentSection(parentContent, sectionElement);
    }

    if (section.title) {
      const title = document.createElement('h3');
      title.className = 'section-title';
      title.textContent = section.title;
      sectionElement.appendChild(title);
    }

    // Process section content based on type
    const contentElement = await this.createSectionContent(section, parentContent);
    sectionElement.appendChild(contentElement);

    return sectionElement;
  }

  /**
   * Create section content based on type
   * @param {Object} section - Section data
   * @param {Object} parentContent - Parent content context
   * @returns {Promise<HTMLElement>} Content element
   */
  async createSectionContent(section, parentContent) {
    const contentDiv = document.createElement('div');
    contentDiv.className = 'section-content';

    switch (section.type) {
      case 'text':
        contentDiv.innerHTML = this.processTextContent(section.content);
        break;

      case 'video':
        const videoElement = await this.createVideoElement(section);
        contentDiv.appendChild(videoElement);
        break;

      case 'audio':
        const audioElement = await this.createAudioElement(section);
        contentDiv.appendChild(audioElement);
        break;

      case 'interactive':
        const interactiveElement = await this.createInteractiveElement(section);
        contentDiv.appendChild(interactiveElement);
        break;

      case 'quiz':
        const quizElement = await this.createQuizElement(section);
        contentDiv.appendChild(quizElement);
        break;

      case 'case-study':
        const caseStudyElement = await this.createCaseStudyElement(section);
        contentDiv.appendChild(caseStudyElement);
        break;

      default:
        contentDiv.innerHTML = this.processTextContent(section.content || '');
    }

    return contentDiv;
  }

  /**
   * Process text content for security and formatting
   * @param {string} content - Raw text content
   * @returns {string} Processed content
   */
  processTextContent(content) {
    if (!content) return '';

    // Basic HTML sanitization (in production, use DOMPurify)
    const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 
                        'strong', 'em', 'br', 'div', 'span', 'blockquote', 'code', 'pre'];
    
    // Process content for i18n placeholders
    content = content.replace(/\{\{i18n:([\w.]+)\}\}/g, (match, key) => {
      return this.i18n.t(key);
    });

    return content;
  }

  /**
   * Create lesson content section with rich Module 1 structure
   * @param {Object} content - Lesson content data
   * @param {HTMLElement} container - Container element
   * @returns {HTMLElement} Rendered content element
   */
  createLessonContentSection(content, container) {
    // Clear container
    container.innerHTML = '';
    container.className = 'lesson-content-container';

    // Handle different content types from Module 1
    if (content.content) {
      Object.entries(content.content).forEach(([key, sectionData]) => {
        const sectionElement = this.createRichContentSection(key, sectionData);
        container.appendChild(sectionElement);
      });
    }

    return container;
  }

  /**
   * Create rich content section based on Module 1 content structure
   * @param {string} sectionKey - Section key (e.g., 'introduction', 'history')
   * @param {Object} sectionData - Section data
   * @returns {HTMLElement} Section element
   */
  createRichContentSection(sectionKey, sectionData) {
    const section = document.createElement('section');
    section.className = `rich-content-section section-${sectionKey}`;
    section.setAttribute('data-section-key', sectionKey);

    // Add section title
    if (sectionData.title) {
      const title = document.createElement('h3');
      title.className = 'section-title';
      title.textContent = sectionData.title;
      section.appendChild(title);
    }

    // Handle different section types
    switch (sectionKey) {
      case 'introduction':
        section.appendChild(this.createIntroductionContent(sectionData));
        break;
      case 'history':
        section.appendChild(this.createHistoryTimeline(sectionData));
        break;
      case 'types':
        section.appendChild(this.createTypesContent(sectionData));
        break;
      case 'characteristics':
        section.appendChild(this.createCharacteristicsContent(sectionData));
        break;
      case 'process':
        section.appendChild(this.createProcessContent(sectionData));
        break;
      case 'ethicalFoundations':
        section.appendChild(this.createEthicalFoundationsContent(sectionData));
        break;
      case 'codeOfEthics':
        section.appendChild(this.createCodeOfEthicsContent(sectionData));
        break;
      case 'confidentiality':
        section.appendChild(this.createConfidentialityContent(sectionData));
        break;
      case 'conflictManagement':
        section.appendChild(this.createConflictManagementContent(sectionData));
        break;
      case 'communication':
        section.appendChild(this.createCommunicationContent(sectionData));
        break;
      case 'activeListening':
        section.appendChild(this.createActiveListeningContent(sectionData));
        break;
      case 'groupFacilitation':
        section.appendChild(this.createGroupFacilitationContent(sectionData));
        break;
      case 'conflictResolution':
        section.appendChild(this.createConflictResolutionContent(sectionData));
        break;
      case 'changeManagement':
        section.appendChild(this.createChangeManagementContent(sectionData));
        break;
      default:
        section.appendChild(this.createGenericContent(sectionData));
    }

    return section;
  }

  /**
   * Create introduction content with key points
   */
  createIntroductionContent(data) {
    const container = document.createElement('div');
    container.className = 'introduction-content';

    if (data.text) {
      const text = document.createElement('p');
      text.className = 'introduction-text';
      text.textContent = data.text;
      container.appendChild(text);
    }

    if (data.keyPoints && data.keyPoints.length > 0) {
      const pointsContainer = document.createElement('div');
      pointsContainer.className = 'key-points';
      
      const pointsTitle = document.createElement('h4');
      pointsTitle.textContent = 'Puntos Clave';
      pointsContainer.appendChild(pointsTitle);

      const pointsList = document.createElement('ul');
      pointsList.className = 'key-points-list';
      
      data.keyPoints.forEach(point => {
        const item = document.createElement('li');
        item.innerHTML = `<span class="point-icon">✓</span> ${point}`;
        pointsList.appendChild(item);
      });

      pointsContainer.appendChild(pointsList);
      container.appendChild(pointsContainer);
    }

    return container;
  }

  /**
   * Create history timeline
   */
  createHistoryTimeline(data) {
    const container = document.createElement('div');
    container.className = 'history-timeline';

    if (data.timeline && data.timeline.length > 0) {
      const timeline = document.createElement('div');
      timeline.className = 'timeline';

      data.timeline.forEach((period, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        timelineItem.innerHTML = `
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <h5 class="timeline-period">${period.period}</h5>
            <p class="timeline-description">${period.description}</p>
          </div>
        `;
        
        timeline.appendChild(timelineItem);
      });

      container.appendChild(timeline);
    }

    return container;
  }

  /**
   * Create types content (placeholder for other section types)
   */
  createTypesContent(data) {
    return this.createGenericContent(data);
  }

  createCharacteristicsContent(data) {
    return this.createGenericContent(data);
  }

  createProcessContent(data) {
    return this.createGenericContent(data);
  }

  createEthicalFoundationsContent(data) {
    return this.createGenericContent(data);
  }

  createCodeOfEthicsContent(data) {
    return this.createGenericContent(data);
  }

  createConfidentialityContent(data) {
    return this.createGenericContent(data);
  }

  createConflictManagementContent(data) {
    return this.createGenericContent(data);
  }

  createCommunicationContent(data) {
    return this.createGenericContent(data);
  }

  createActiveListeningContent(data) {
    return this.createGenericContent(data);
  }

  createGroupFacilitationContent(data) {
    return this.createGenericContent(data);
  }

  createConflictResolutionContent(data) {
    return this.createGenericContent(data);
  }

  createChangeManagementContent(data) {
    return this.createGenericContent(data);
  }

  /**
   * Create generic content for fallback
   */
  createGenericContent(data) {
    const container = document.createElement('div');
    container.className = 'generic-content';

    if (data.text) {
      const text = document.createElement('p');
      text.textContent = data.text;
      container.appendChild(text);
    }

    return container;
  }
}

export default SectionRenderer;