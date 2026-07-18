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
