import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import {
  SUPPORTED_LANGUAGES,
  LanguageConfig,
  getLanguageByCode,
  detectLanguageFromBrowser,
  detectLanguageFromGeolocation,
} from "../utils/voiceUtils";

const USER_LANGUAGE_KEY = "spotrender_user_language";

export interface LanguageContextType {
  language: LanguageConfig;
  setLanguage: (code: LanguageCode) => void;
  availableLanguages: LanguageConfig[];
  isAutoDetected: boolean;
}

export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageConfig>(SUPPORTED_LANGUAGES[0]);
  const [isAutoDetected, setIsAutoDetected] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function initLanguage() {
      const savedLanguage = localStorage.getItem(USER_LANGUAGE_KEY);
      if (savedLanguage && SUPPORTED_LANGUAGES.find(l => l.code === savedLanguage)) {
        setLanguageState(getLanguageByCode(savedLanguage));
        setIsAutoDetected(false);
        setInitialized(true);
        return;
      }

      const geoLanguage = await detectLanguageFromGeolocation();
      const langConfig = getLanguageByCode(geoLanguage);
      setLanguageState(langConfig);
      setIsAutoDetected(true);
      setInitialized(true);
    }

    initLanguage();
  }, []);

  const setLanguage = (code: LanguageCode) => {
    const lang = getLanguageByCode(code);
    setLanguageState(lang);
    setIsAutoDetected(false);
    localStorage.setItem(USER_LANGUAGE_KEY, code);
  };

  if (!initialized) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        availableLanguages: SUPPORTED_LANGUAGES,
        isAutoDetected,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: SUPPORTED_LANGUAGES[0],
      setLanguage: () => {},
      availableLanguages: SUPPORTED_LANGUAGES,
      isAutoDetected: false,
    };
  }
  return context;
}

interface LanguageSelectorProps {
  compact?: boolean;
}

export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="language-selector">
      <button
        className={`language-btn ${compact ? 'compact' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Selecionar idioma / Select language"
      >
        <span className="flag">{language.flag}</span>
        {!compact && <span className="lang-name">{language.nativeName}</span>}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              className={`lang-option ${lang.code === language.code ? 'active' : ''}`}
              onClick={() => {
                setLanguage(lang.code as LanguageCode);
                setIsOpen(false);
              }}
            >
              <span className="flag">{lang.flag}</span>
              <span className="lang-name">{lang.nativeName}</span>
              {lang.code === language.code && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .language-selector {
          position: relative;
          display: inline-block;
        }

        .language-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .language-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .language-btn.compact {
          padding: 0.4rem;
          gap: 0.25rem;
        }

        .flag {
          font-size: 1.1rem;
        }

        .arrow {
          font-size: 0.6rem;
          opacity: 0.7;
        }

        .language-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.25rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          z-index: 1000;
          min-width: 180px;
        }

        .lang-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 0.9rem;
          color: #1e293b;
          text-align: left;
          transition: background 0.2s;
        }

        .lang-option:hover {
          background: #f1f5f9;
        }

        .lang-option.active {
          background: #eff6ff;
          color: #2563eb;
        }

        .check {
          margin-left: auto;
          color: #2563eb;
        }
      `}</style>
    </div>
  );
}

export function getGreeting(language: LanguageConfig): string {
  const greetings: Record<string, string> = {
    'pt-BR': 'Olá',
    'en-US': 'Hello',
    'es-ES': 'Hola',
  };
  return greetings[language.code] || 'Olá';
}

export function getWelcomeMessage(language: LanguageConfig): string {
  const messages: Record<string, string> = {
    'pt-BR': 'Olá! 👋 Que bom ter você aqui no Spot Render! Sou o **Spotinho**, seu assistente virtual.',
    'en-US': 'Hello! 👋 Great to have you here at Spot Render! I am **Spotinho**, your virtual assistant.',
    'es-ES': '¡Hola! 👋 Qué bueno tenerte aquí en Spot Render! Soy **Spotinho**, tu asistente virtual.',
  };
  return messages[language.code] || messages['pt-BR'];
}

export interface PortalText {
  brand: string;
  nav: {
    statistics: string;
    repositories: string;
    techDocs: string;
    submitJob: string;
    upload: string;
    spotinho: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    startNow: string;
    viewDocs: string;
    badges: string[];
    welcomeTitle: string;
    welcomeSubtitle: string;
    totalJobs: string;
    running: string;
    completed: string;
    viewDocsLink: string;
    viewStatsLink: string;
    talkToSpotinho: string;
  };
  submit: {
    eyebrow: string;
    title: string;
    description: string;
  };
  monitoring: {
    eyebrow: string;
    title: string;
    description: string;
  };
  status: {
    pageTitle: string;
    title: string;
    loading: string;
  };
  statistics: {
    pageTitle: string;
    title: string;
    subtitle: string;
    period: string;
    today: string;
    last7Days: string;
    last30Days: string;
    last90Days: string;
    custom: string;
    from: string;
    to: string;
    project: string;
    allProjects: string;
    artist: string;
    allArtists: string;
    totalJobs: string;
    completed: string;
    failed: string;
    cancelled: string;
    running: string;
    queued: string;
    successRate: string;
    avgRenderTime: string;
    byStatus: string;
    byProject: string;
    byArtist: string;
    dailyTitle: string;
    filesSection: string;
    totalFiles: string;
    renderedSuccess: string;
    renderedFailed: string;
    validationValid: string;
    validationInvalid: string;
    validationPending: string;
    noData: string;
  };
  pageTitle: string;
  pageDescription: string;
}

export function getPortalText(langCode: string): PortalText {
  const texts: Record<string, PortalText> = {
    'pt-BR': {
      brand: 'Spot Render',
      nav: {
        statistics: 'Estatísticas',
        repositories: 'Repositórios',
        techDocs: 'TechDocs',
        submitJob: 'Enviar job',
        upload: 'Upload',
        spotinho: 'Spotinho',
      },
      hero: {
        eyebrow: 'Orquestração de renderização • Spot + FinOps',
        title: 'Build powerful renders fast',
        description: 'Render lists seguras, workers em spot instances e um painel que funciona em qualquer dispositivo. Faça upload, acompanhe e receba alertas de forma simples.',
        startNow: 'Começar agora',
        viewDocs: 'Ver documentação →',
        badges: ['Workers em spot + autoscaling', 'Uploads criptografados', 'Portal, CLI e API alinhados'],
        welcomeTitle: 'Bem-vindo ao Spot Render! 🎨',
        welcomeSubtitle: 'Plataforma de renderização 3D colaborativa para estúdios e artistas.',
        totalJobs: 'Total Jobs',
        running: 'Em Execução',
        completed: 'Concluídos',
        viewDocsLink: '📚 Ver documentação',
        viewStatsLink: '📊 Estatísticas',
        talkToSpotinho: '🤖 Falar com Spotinho',
      },
      submit: {
        eyebrow: 'Submit',
        title: 'Enviar novo job',
        description: 'Defina projeto, variação e anexos. Notificações opcionais para liberar o time.',
      },
      monitoring: {
        eyebrow: 'Monitoramento',
        title: 'Jobs em andamento',
        description: 'Status, progresso e locais de armazenamento atualizam automaticamente.',
      },
      status: {
        pageTitle: 'Status da Plataforma',
        title: 'Status dos Componentes',
        loading: 'Carregando...',
      },
      statistics: {
        pageTitle: 'Estatísticas - Spot Render Portal',
        title: 'Estatísticas de Renderização',
        subtitle: 'Acompanhe o desempenho e taxa de sucesso dos jobs de renderização',
        period: 'Período:',
        today: 'Hoje',
        last7Days: 'Últimos 7 dias',
        last30Days: 'Últimos 30 dias',
        last90Days: 'Últimos 90 dias',
        custom: 'Personalizado',
        from: 'De:',
        to: 'Até:',
        project: 'Projeto:',
        allProjects: 'Todos',
        artist: 'Artista:',
        allArtists: 'Todos',
        totalJobs: 'Total de Jobs',
        completed: 'Concluídos',
        failed: 'Falhas',
        cancelled: 'Cancelados',
        running: 'Em Execução',
        queued: 'Na Fila',
        successRate: 'Taxa de Sucesso',
        avgRenderTime: 'Tempo Médio de Render',
        byStatus: 'Por Status',
        byProject: 'Por Projeto',
        byArtist: 'Por Artista',
        dailyTitle: 'Estatísticas Diárias',
        filesSection: 'Arquivos Renderizados',
        totalFiles: 'Total de Arquivos',
        renderedSuccess: 'Renderizados com Sucesso',
        renderedFailed: 'Falhas na Renderização',
        validationValid: 'Validação Válida',
        validationInvalid: 'Validação Inválida',
        validationPending: 'Validação Pendente',
        noData: 'Sem dados para exibir',
      },
      pageTitle: 'Spot Render Portal',
      pageDescription: 'Envie jobs de renderização e acompanhe o progresso em um painel bonito e responsivo.',
    },
    'en-US': {
      brand: 'Spot Render',
      nav: {
        statistics: 'Statistics',
        repositories: 'Repositories',
        techDocs: 'TechDocs',
        submitJob: 'Submit job',
        upload: 'Upload',
        spotinho: 'Spotinho',
      },
      hero: {
        eyebrow: 'Render orchestration • Spot + FinOps',
        title: 'Build powerful renders fast',
        description: 'Secure render lists, spot instance workers and a dashboard that works on any device. Upload, track and receive alerts easily.',
        startNow: 'Get started',
        viewDocs: 'View documentation →',
        badges: ['Spot workers + autoscaling', 'Encrypted uploads', 'Portal, CLI and API aligned'],
        welcomeTitle: 'Welcome to Spot Render! 🎨',
        welcomeSubtitle: 'Collaborative 3D rendering platform for studios and artists.',
        totalJobs: 'Total Jobs',
        running: 'Running',
        completed: 'Completed',
        viewDocsLink: '📚 View documentation',
        viewStatsLink: '📊 Statistics',
        talkToSpotinho: '🤖 Talk to Spotinho',
      },
      submit: {
        eyebrow: 'Submit',
        title: 'Submit new job',
        description: 'Set project, variation and attachments. Optional notifications to free up the team.',
      },
      monitoring: {
        eyebrow: 'Monitoring',
        title: 'Jobs in progress',
        description: 'Status, progress and storage locations update automatically.',
      },
      status: {
        pageTitle: 'Platform Status',
        title: 'Component Status',
        loading: 'Loading...',
      },
      statistics: {
        pageTitle: 'Statistics - Spot Render Portal',
        title: 'Rendering Statistics',
        subtitle: 'Track the performance and success rate of rendering jobs',
        period: 'Period:',
        today: 'Today',
        last7Days: 'Last 7 days',
        last30Days: 'Last 30 days',
        last90Days: 'Last 90 days',
        custom: 'Custom',
        from: 'From:',
        to: 'To:',
        project: 'Project:',
        allProjects: 'All',
        artist: 'Artist:',
        allArtists: 'All',
        totalJobs: 'Total Jobs',
        completed: 'Completed',
        failed: 'Failed',
        cancelled: 'Cancelled',
        running: 'Running',
        queued: 'Queued',
        successRate: 'Success Rate',
        avgRenderTime: 'Avg Render Time',
        byStatus: 'By Status',
        byProject: 'By Project',
        byArtist: 'By Artist',
        dailyTitle: 'Daily Statistics',
        filesSection: 'Rendered Files',
        totalFiles: 'Total Files',
        renderedSuccess: 'Successfully Rendered',
        renderedFailed: 'Render Failures',
        validationValid: 'Valid Validation',
        validationInvalid: 'Invalid Validation',
        validationPending: 'Pending Validation',
        noData: 'No data to display',
      },
      pageTitle: 'Spot Render Portal',
      pageDescription: 'Send rendering jobs and track progress in a beautiful, responsive dashboard.',
    },
    'es-ES': {
      brand: 'Spot Render',
      nav: {
        statistics: 'Estadísticas',
        repositories: 'Repositorios',
        techDocs: 'TechDocs',
        submitJob: 'Enviar trabajo',
        upload: 'Subir',
        spotinho: 'Spotinho',
      },
      hero: {
        eyebrow: 'Orquestración de renderizado • Spot + FinOps',
        title: 'Construye renders poderosos rápido',
        description: 'Listas de renderizado seguras, workers en spot instances y un panel que funciona en cualquier dispositivo. Sube, rastrea y recibe alertas fácilmente.',
        startNow: 'Comenzar ahora',
        viewDocs: 'Ver documentación →',
        badges: ['Workers en spot + autoscaling', 'Subidas cifradas', 'Portal, CLI y API alineados'],
        welcomeTitle: '¡Bienvenido a Spot Render! 🎨',
        welcomeSubtitle: 'Plataforma de renderizado 3D colaborativa para estudios y artistas.',
        totalJobs: 'Total de Trabajos',
        running: 'En Ejecución',
        completed: 'Completados',
        viewDocsLink: '📚 Ver documentación',
        viewStatsLink: '📊 Estadísticas',
        talkToSpotinho: '🤖 Hablar con Spotinho',
      },
      submit: {
        eyebrow: 'Enviar',
        title: 'Enviar nuevo trabajo',
        description: 'Define proyecto, variación y archivos adjuntos. Notificaciones opcionales para liberar al equipo.',
      },
      monitoring: {
        eyebrow: 'Monitoreo',
        title: 'Trabajos en curso',
        description: 'Estado, progreso y ubicaciones de almacenamiento se actualizan automáticamente.',
      },
      status: {
        pageTitle: 'Estado de la Plataforma',
        title: 'Estado de los Componentes',
        loading: 'Cargando...',
      },
      statistics: {
        pageTitle: 'Estadísticas - Spot Render Portal',
        title: 'Estadísticas de Renderizado',
        subtitle: 'Rastrea el rendimiento y tasa de éxito de los trabajos de renderizado',
        period: 'Período:',
        today: 'Hoy',
        last7Days: 'Últimos 7 días',
        last30Days: 'Últimos 30 días',
        last90Days: 'Últimos 90 días',
        custom: 'Personalizado',
        from: 'Desde:',
        to: 'Hasta:',
        project: 'Proyecto:',
        allProjects: 'Todos',
        artist: 'Artista:',
        allArtists: 'Todos',
        totalJobs: 'Total de Trabajos',
        completed: 'Completados',
        failed: 'Fallidos',
        cancelled: 'Cancelados',
        running: 'En Ejecución',
        queued: 'En Cola',
        successRate: 'Tasa de Éxito',
        avgRenderTime: 'Tiempo Promedio de Render',
        byStatus: 'Por Estado',
        byProject: 'Por Proyecto',
        byArtist: 'Por Artista',
        dailyTitle: 'Estadísticas Diarias',
        filesSection: 'Archivos Renderizados',
        totalFiles: 'Total de Archivos',
        renderedSuccess: 'Renderizados con Éxito',
        renderedFailed: 'Fallos de Renderizado',
        validationValid: 'Validación Válida',
        validationInvalid: 'Validación Inválida',
        validationPending: 'Validación Pendiente',
        noData: 'Sin datos para mostrar',
      },
      pageTitle: 'Spot Render Portal',
      pageDescription: 'Envía trabajos de renderizado y sigue el progreso en un panel hermoso y receptivo.',
    },
  };
  return texts[langCode] || texts['pt-BR'];
}
