/**
 * Video Configuration - YouTube Video Mappings for EC0249 Content
 * 
 * @description Centralized configuration for YouTube video integration across
 * the EC0249 educational platform. Maps video content to specific learning 
 * modules, lessons, and competency elements.
 * 
 * @since 2.0.0
 */

/**
 * YouTube video database for EC0249 content
 * Organized by module and lesson structure
 */
const EC0249_VIDEOS = {
  // Welcome/Introduction Video
  welcome: {
    id: 'fwzGRvLWPyM',
    title: 'EC0249: 0) Bienvenida',
    description: 'Video de bienvenida al programa EC0249',
    duration: null, // To be populated dynamically
    placement: 'dashboard', // Where to show this video
    autoplay: false,
    controls: true
  },

  // Module 1: Fundamentos de Consultoría
  module1: {
    overview: {
      id: 'fwzGRvLWPyM', // Same as welcome for module intro
      title: 'Introducción al Módulo 1',
      description: 'Introducción a los fundamentos de consultoría',
      placement: 'module_intro'
    },
    lessons: {
      lesson1_1: {
        id: 'k_T7rmWpwd8',
        title: 'EC0249: 1.1) Servicios de Consultoría',
        description: 'Fundamentos históricos y características de la consultoría profesional',
        placement: 'lesson_content'
      },
      lesson1_2: {
        id: '-3yHF9qoDMo',
        title: 'EC0249: 1.2) Las habilidades del consultor',
        description: 'Desarrollo de competencias comunicativas y relacionales para consultores',
        placement: 'lesson_content'
      },
      lesson1_3: {
        id: '-Bx1imCyI8Y',
        title: 'EC0249: 1.3) La ética',
        description: 'Principios éticos fundamentales y manejo de la confidencialidad en consultoría',
        placement: 'lesson_content'
      }
    }
  },

  // Module 2: Elemento 1 - Identificación de Problemas
  module2: {
    overview: {
      id: 'CVm8V_VdHvA',
      title: 'EC0249: 2.0) Identificar la situación problema planteado',
      description: 'Introducción a la identificación de problemas organizacionales',
      placement: 'module_intro'
    },
    lessons: {
      interviews: {
        id: 'rbPCxX395x8',
        title: 'EC0249. 2.1) Entrevista a las partes involucradas',
        description: 'Técnicas de entrevista para la recolección de información',
        placement: 'lesson_content'
      },
      problem_document: {
        id: 'AM5hrNAbMn8',
        title: 'EC0249: 2.2) El documento elaborado que describe el problema planteado',
        description: 'Elaboración del documento principal de descripción del problema',
        placement: 'template_support'
      },
      impact_analysis: {
        id: 'nkx1AA63npU',
        title: 'EC0249: 2.3) La afectación detectada de la situación actual',
        description: 'Análisis de impactos y afectaciones del problema identificado',
        placement: 'lesson_content'
      },
      information_integration: {
        id: '5Ipx1CSPxSw',
        title: 'EC0249: 2.4) La integración de la información presentada en la descripción del problema',
        description: 'Integración y síntesis de información recolectada',
        placement: 'lesson_content'
      },
      methodology_report: {
        id: '03iWP4RsGCU',
        title: 'EC0249: 2.5) Reporte de la metodología empleada',
        description: 'Documentación de metodologías utilizadas en la investigación',
        placement: 'template_support'
      },
      interview_guide: {
        id: 'vgkklaQJpbg',
        title: 'EC0249: 2.6) Guía de entrevistas',
        description: 'Diseño y estructura de guías de entrevista efectivas',
        placement: 'template_support'
      },
      questionnaire_design: {
        id: 'eB4TCoBJzmc',
        title: 'EC0249: 2.7) Diseño de cuestionarios empleados',
        description: 'Creación de cuestionarios para recolección de datos',
        placement: 'template_support'
      },
      documentary_search: {
        id: 'F4sMoenxAuM',
        title: 'EC0249: 2.8) Programa de búsqueda documental',
        description: 'Metodología para la búsqueda y análisis documental',
        placement: 'template_support'
      },
      field_visit_report: {
        id: 'Yz9vet7eV34',
        title: 'EC0249: 2.9) Reporte de la visita de campo',
        description: 'Documentación de visitas de campo y observaciones',
        placement: 'template_support'
      }
    }
  },

  // Module 3: Elemento 2 - Desarrollo de Soluciones
  module3: {
    overview: {
      id: 'G865Xeh93yQ',
      title: 'EC0249: 3.0) Desarrollar opciones de solución a la situación problema planteado',
      description: 'Introducción al desarrollo de opciones de solución',
      placement: 'module_intro'
    },
    lessons: {
      impact_report: {
        id: 'vvVUICOvnRs',
        title: 'EC0249: 3.1) Reporte de las afectaciones encontradas',
        description: 'Análisis detallado de afectaciones y su impacto',
        placement: 'template_support'
      },
      solution_design: {
        id: 'Uqs9pO_XpMs',
        title: 'EC0249: 3.2) La solución diseñada',
        description: 'Diseño y estructura de soluciones efectivas',
        placement: 'lesson_content'
      }
    }
  },

  // Module 4: Elemento 3 - Presentación de Propuestas
  module4: {
    overview: {
      id: 'dhpMmiKtMuU',
      title: 'EC0249: 4.0) Presentar la propuesta de solución',
      description: 'Introducción a la presentación de propuestas',
      placement: 'module_intro'
    },
    lessons: {
      proposal_presentation: {
        id: 'YLZn33MbiQk',
        title: 'EC0249: 4.1) Cómo presentar la propuesta de solución al consultante',
        description: 'Técnicas de presentación efectiva de propuestas',
        placement: 'lesson_content'
      },
      work_proposal: {
        id: 'jFYxjh1H_P8',
        title: 'EC0249: 4.2) Elaborar la propuesta de trabajo',
        description: 'Estructura y contenido de propuestas de trabajo',
        placement: 'template_support'
      },
      detailed_solution: {
        id: 's4awgRtZObI',
        title: 'EC0249: 4.3) Descripción detallada de la solución propuesta',
        description: 'Documentación detallada de soluciones propuestas',
        placement: 'template_support'
      },
      work_plan: {
        id: 'EnzHZMuYjMA',
        title: 'EC0249: 4.4) Descripción del plan de trabajo en la propuesta',
        description: 'Elaboración de planes de trabajo efectivos',
        placement: 'template_support'
      },
      activity_description: {
        id: 'fUCvN0oHRlw',
        title: 'EC0249: 4.5) Descripción de las actividades a desarrollar en el plan de trabajo',
        description: 'Detalle de actividades en planes de trabajo',
        placement: 'template_support'
      },
      agreement_record: {
        id: 'JXxCuSRE4B8',
        title: 'EC0249: 4.6) El registro elaborado de los acuerdos alcanzados',
        description: 'Documentación de acuerdos y compromisos',
        placement: 'template_support'
      }
    }
  }
};

/**
 * Video placement configuration
 * Defines where and how videos should be embedded
 */
const VIDEO_PLACEMENTS = {
  dashboard: {
    container: 'dashboard-welcome-video',
    autoplay: false,
    width: '100%',
    maxWidth: '800px',
    aspectRatio: '16:9'
  },
  module_intro: {
    container: 'module-intro-video',
    autoplay: false,
    width: '100%',
    maxWidth: '600px',
    aspectRatio: '16:9'
  },
  lesson_content: {
    container: 'lesson-video-player',
    autoplay: false,
    width: '100%',
    maxWidth: '800px',
    aspectRatio: '16:9'
  },
  template_support: {
    container: 'template-video-support',
    autoplay: false,
    width: '100%',
    maxWidth: '500px',
    aspectRatio: '16:9'
  }
};

/**
 * YouTube player configuration
 */
const YOUTUBE_CONFIG = {
  // YouTube player parameters
  playerVars: {
    autoplay: 0,
    controls: 1,
    disablekb: 0,
    enablejsapi: 1,
    fs: 1,
    iv_load_policy: 3,
    modestbranding: 1,
    playsinline: 1,
    rel: 0,
    showinfo: 0,
    origin: window.location.origin
  },
  
  // Player events to track
  trackEvents: [
    'onReady',
    'onStateChange',
    'onPlaybackQualityChange',
    'onPlaybackRateChange',
    'onError'
  ],
  
  // Default player dimensions
  defaultWidth: 560,
  defaultHeight: 315,
  
  // API settings
  apiKey: null, // Set if needed for additional features
  enableAnalytics: true
};

/**
 * Get video configuration by module and lesson
 */
function getVideoConfig(module, lesson = null) {
  if (!EC0249_VIDEOS[module]) {
    return null;
  }
  
  if (lesson && EC0249_VIDEOS[module].lessons) {
    return EC0249_VIDEOS[module].lessons[lesson] || null;
  }
  
  return EC0249_VIDEOS[module].overview || EC0249_VIDEOS[module];
}

/**
 * Get all videos for a specific module
 */
function getModuleVideos(module) {
  const moduleConfig = EC0249_VIDEOS[module];
  if (!moduleConfig) {
    return [];
  }
  
  const videos = [];
  
  // Add overview video if exists
  if (moduleConfig.overview) {
    videos.push({
      ...moduleConfig.overview,
      type: 'overview'
    });
  }
  
  // Add lesson videos
  if (moduleConfig.lessons) {
    Object.entries(moduleConfig.lessons).forEach(([lessonKey, video]) => {
      videos.push({
        ...video,
        type: 'lesson',
        lessonKey
      });
    });
  }
  
  return videos;
}

/**
 * Generate YouTube embed URL
 */
function generateEmbedUrl(videoId, options = {}) {
  const baseUrl = 'https://www.youtube.com/embed/';
  const params = new URLSearchParams({
    ...YOUTUBE_CONFIG.playerVars,
    ...options
  });
  
  return `${baseUrl}${videoId}?${params.toString()}`;
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

export {
  EC0249_VIDEOS,
  VIDEO_PLACEMENTS,
  YOUTUBE_CONFIG,
  getVideoConfig,
  getModuleVideos,
  generateEmbedUrl,
  extractVideoId
};

export default EC0249_VIDEOS;