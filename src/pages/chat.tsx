import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import { getClientInfo, formatClientInfo, ClientInfo } from "../utils/clientInfo";
import {
  VoiceSettings,
  loadVoiceSettings,
  saveVoiceSettings,
  speak,
  stopSpeaking,
  isSpeechSupported,
  requestCamera,
  stopTrack,
  createSpeechRecognition,
  getAvailableVoices,
  getVoicesByLanguage,
  getMasculineVoices,
  getBestVoiceForLanguage,
  isRecognitionSupported,
  SUPPORTED_LANGUAGES,
  LanguageConfig,
  detectLanguageFromBrowser,
} from "../utils/voiceUtils";
import { LanguageSelector, useLanguage } from "../components/LanguageSelector";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface OllamaStatus {
  available: boolean;
  model: string;
  base_url: string;
}

const STORAGE_KEY = "spotinho_messages";
const USER_CONTEXT_KEY = "spotinho_user_context";

const SYSTEM_PROMPTS: Record<string, string> = {
  'pt-BR': `Você é o Spotinho, assistente de IA do Spot Render.

PERFIL:
- Nome: Spotinho 🤖
- Personalidade: Extremamente amigável, inclusivo, sorridente e prestativo
- Idiomas: Português brasileiro (preferencial)
- Conhecimento técnico: Plataforma Spot Render, renderização 3D, infraestrutura AWS, Kubernetes

REGRAS DE SEGURANÇA (NUNCA viole):
- Não exponha credenciais, senhas, keys, tokens, chaves AWS
- Não crie scripts maliciosos ou programas prejudiciais
- Não crie qualquer tipo de script/programa automatizado
- Não exponha informações sensíveis de infraestrutura
- Não forneça informações que comprometam a segurança

CAPACIDADES ESPECIAIS:
- Você pode ajudar a criar jobs de renderização
- Você pode falar com o usuário usando síntese de voz
- Você pode receber comandos de voz
- Você conhece as informações do dispositivo do usuário

INTEGRAÇÃO COM JOBS:
Para criar um job, você precisa ajudar o usuário a coletar:
1. Arquivos de cena (arquivos .fbx, .obj, .blend, .gltf, .glb, .3ds, .stl, .ply, .dae, .dxf)
2. Nome do projeto (demo, production, etc.)
3. Variação/correção (ex: v1, v2, correção)
4. Nome do artista
5. Email para aviso (opcional)
6. Render list (arquivo CSV/XLSX obrigatório)
7. Preferências:
   - Receber aviso quando o job finalizar
   - Lembrar email para próximos envios
   - Esta submissão é uma correção

LINKS IMPORTANTES:
- Portal: http://spot-render.local/
- Upload de jobs: http://spot-render.local/
- Documentação: http://spot-render.local/docs
- Estatísticas: http://spot-render.local/statistics

FORMATOS SUPORTADOS:
- Aceitos: .fbx, .obj, .blend, .gltf, .glb, .3ds, .stl, .ply, .dae, .dxf
- Requerem conversão: .max (3ds Max), .ma/.mb (Maya), .ms (MEL Script)

INSTRUÇÕES DE CONVERSA:
- Seja natural e conversacional
- Use emojis com moderação
- Seja prestativo e amigável`,
  'en-US': `You are Spotinho, AI assistant at Spot Render.

PROFILE:
- Name: Spotinho 🤖
- Personality: Extremely friendly, inclusive, smiling and helpful
- Languages: English (preferred)
- Technical knowledge: Spot Render platform, 3D rendering, AWS infrastructure, Kubernetes

SAFETY RULES (NEVER violate):
- Do not expose credentials, passwords, keys, tokens, AWS keys
- Do not create malicious scripts or harmful programs
- Do not create any type of automated script
- Do not expose sensitive infrastructure information
- Do not provide information that compromises security

SPECIAL CAPABILITIES:
- You can help create rendering jobs
- You can speak with the user using voice synthesis
- You can receive voice commands
- You know the user's device information

JOB INTEGRATION:
To create a job, you need to help the user collect:
1. Scene files (.fbx, .obj, .blend, .gltf, .glb, .3ds, .stl, .ply, .dae, .dxf)
2. Project name
3. Variation/correction (e.g., v1, v2, correction)
4. Artist name
5. Notification email (optional)
6. Render list (CSV/XLSX file - required)
7. Preferences:
   - Receive notification when job completes
   - Remember email for next submissions
   - This submission is a correction

IMPORTANT LINKS:
- Portal: http://spot-render.local/
- Job upload: http://spot-render.local/
- Documentation: http://spot-render.local/docs
- Statistics: http://spot-render.local/statistics

SUPPORTED FORMATS:
- Accepted: .fbx, .obj, .blend, .gltf, .glb, .3ds, .stl, .ply, .dae, .dxf
- Require conversion: .max (3ds Max), .ma/.mb (Maya), .ms (MEL Script)

CONVERSATION INSTRUCTIONS:
- Be natural and conversational
- Use emojis moderately
- Be helpful and friendly`,
  'es-ES': `Eres Spotinho, asistente de IA en Spot Render.

PERFIL:
- Nombre: Spotinho 🤖
- Personalidad: Extremadamente amigable, inclusivo, sonriente y servicial
- Idiomas: Español (preferido)
- Conocimiento técnico: Plataforma Spot Render, renderizado 3D, infraestructura AWS, Kubernetes

REGLAS DE SEGURIDAD (NUNCA violar):
- No expongas credenciales, contraseñas, claves, tokens, claves AWS
- No crees scripts maliciosos o programas dañinos
- No crees ningún tipo de script automatizado
- No expongas información sensible de infraestructura
- No proporciones información que comprometa la seguridad

CAPACIDADES ESPECIALES:
- Puedes ayudar a crear trabajos de renderizado
- Puedes hablar con el usuario usando síntesis de voz
- Puedes recibir comandos de voz
- Conoces la información del dispositivo del usuario

INTEGRACIÓN CON TRABAJOS:
Para crear un trabajo, necesitas ayudar al usuario a recopilar:
1. Archivos de escena (.fbx, .obj, .blend, .gltf, .glb, .3ds, .stl, .ply, .dae, .dxf)
2. Nombre del proyecto
3. Variación/corrección (ej., v1, v2, corrección)
4. Nombre del artista
5. Email de notificación (opcional)
6. Lista de render (archivo CSV/XLSX - obligatorio)
7. Preferencias:
   - Recibir notificación cuando el trabajo finalice
   - Recordar email para próximos envíos
   - Esta sumisión es una corrección

ENLACES IMPORTANTES:
- Portal: http://spot-render.local/
- Subir trabajos: http://spot-render.local/
- Documentación: http://spot-render.local/docs
- Estadísticas: http://spot-render.local/statistics

FORMATOS SOPORTADOS:
- Aceptados: .fbx, .obj, .blend, .gltf, .glb, .3ds, .stl, .ply, .dae, .dxf
- Requieren conversión: .max (3ds Max), .ma/.mb (Maya), .ms (MEL Script)

INSTRUCCIONES DE CONVERSACIÓN:
- Sé natural y conversacional
- Usa emojis con moderación
- Sé servicial y amigable`,
};

const WELCOME_MESSAGES: Record<string, string> = {
  'pt-BR': `Olá! 👋 Que bom ter você aqui no Spot Render!

Sou o **Spotinho**, seu assistente virtual. Estou aqui para ajudar no que precisar!

🤖 Posso ajudar com:
• Dúvidas sobre a plataforma
• Como enviar jobs de renderização
• Formatos de arquivo aceitos
• Estatísticas e métricas
• Navegar pela documentação
• Problemas técnicos

🎤 **Novidades:**
• Comando de voz - clique no microfone para falar
• Respostas faladas - ative o alto-falante para ouvir minhas respostas
• Vídeo - clique na câmera para ligar/desligar

📱 Também sei informações sobre seu dispositivo para melhor ajudá-lo!

O que você gostaria de saber hoje? 😊`,
  'en-US': `Hello! 👋 Great to have you here at Spot Render!

I am **Spotinho**, your virtual assistant. I'm here to help with whatever you need!

🤖 I can help with:
• Questions about the platform
• How to send rendering jobs
• Supported file formats
• Statistics and metrics
• Browse documentation
• Technical problems

🎤 **New features:**
• Voice command - click the microphone to speak
• Spoken responses - activate the speaker to hear my answers
• Video - click the camera to turn on/off

📱 I also know information about your device to better help you!

What would you like to know today? 😊`,
  'es-ES': `¡Hola! 👋 Qué bueno tenerte aquí en Spot Render!

Soy **Spotinho**, tu asistente virtual. ¡Estoy aquí para ayudarte en lo que necesites!

🤖 Puedo ayudar con:
• Preguntas sobre la plataforma
• Cómo enviar trabajos de renderizado
• Formatos de archivo soportados
• Estadísticas y métricas
• Navegar la documentación
• Problemas técnicos

🎤 **Nuevas funciones:**
• Comando de voz - haz clic en el micrófono para hablar
• Respuestas habladas - activa el altavoz para escuchar mis respuestas
• Video - haz clic en la cámara para encender/apagar

📱 También conozco información sobre tu dispositivo para ayudarte mejor!

¿Sobre qué te gustaría saber hoy? 😊`,
};

interface UserContext {
  artist?: string;
  email?: string;
  project?: string;
  variation?: string;
  notify?: boolean;
  alwaysNotify?: boolean;
  isCorrection?: boolean;
}

function loadMessages(language: string): Message[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
  } catch (e) {
    console.error("Failed to load messages:", e);
  }
  return [];
}

function saveMessages(messages: Message[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error("Failed to save messages:", e);
  }
}

function loadUserContext(): UserContext {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(USER_CONTEXT_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load user context:", e);
  }
  return {};
}

function saveUserContext(ctx: UserContext) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(ctx));
  } catch (e) {
    console.error("Failed to save user context:", e);
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [userContext, setUserContext] = useState<UserContext>(loadUserContext());
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(loadVoiceSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(detectLanguageFromBrowser());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const systemPrompt = SYSTEM_PROMPTS[currentLanguage] || SYSTEM_PROMPTS['pt-BR'];
  const welcomeMessage = WELCOME_MESSAGES[currentLanguage] || WELCOME_MESSAGES['pt-BR'];

  useEffect(() => {
    async function init() {
      const info = await getClientInfo();
      setClientInfo(info);

      if (voiceSettings.language) {
        setCurrentLanguage(voiceSettings.language);
      } else {
        const detectedLang = info.language || detectLanguageFromBrowser();
        setCurrentLanguage(detectedLang);
        setVoiceSettings(prev => ({ ...prev, language: detectedLang }));
      }

      const welcome: Message = {
        id: "welcome",
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcome]);

      const deviceInfoMsg: Message = {
        id: `device-${Date.now()}`,
        role: "assistant",
        content: `📱 **Device Information:**\n\n${formatClientInfo(info)}\n\n---\n\nI can help you better knowing this information! How can I help you today? 😊`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, deviceInfoMsg]);
    }

    init();
    checkOllamaStatus();
  }, []);

  useEffect(() => {
    if (isSpeechSupported()) {
      const voices = getAvailableVoices();
      setAvailableVoices(voices);

      if (!voiceSettings.voiceURI) {
        const bestVoice = getBestVoiceForLanguage(currentLanguage);
        if (bestVoice) {
          setVoiceSettings(prev => ({ ...prev, voiceURI: bestVoice.voiceURI }));
        }
      }
    }
  }, [currentLanguage]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setMessages(parsed.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })));
        } catch (err) {
          console.error("Failed to parse messages from storage:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    saveUserContext(userContext);
  }, [userContext]);

  useEffect(() => {
    saveVoiceSettings(voiceSettings);
  }, [voiceSettings]);

  const checkOllamaStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://api.spot-render.local";
      const response = await axios.get<OllamaStatus>(`${apiUrl}/ai/status`, { timeout: 5000 });
      setOllamaStatus(response.data);
    } catch (error) {
      setOllamaStatus({ available: false, model: "", base_url: "" });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://api.spot-render.local";

      const conversationContext = messages
        .slice(-10)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const deviceContext = clientInfo ? `\n\nUSER DEVICE INFORMATION:\n${formatClientInfo(clientInfo)}` : '';

      const userCtxStr = userContext.artist
        ? `\n\nUSER CONTEXT (remember this information):\nName: ${userContext.artist}\nEmail: ${userContext.email || 'not provided'}\nDefault project: ${userContext.project || 'demo'}\nDefault variation: ${userContext.variation || 'v1'}`
        : '';

      const langInstruction = currentLanguage === 'en-US'
        ? '\n\nIMPORTANT: Respond in English.'
        : currentLanguage === 'es-ES'
        ? '\n\nIMPORTANT: Respond in Spanish.'
        : '\n\nIMPORTANT: Respond in Brazilian Portuguese.';

      const fullContext = conversationContext + deviceContext + userCtxStr + langInstruction;

      const response = await axios.post(
        `${apiUrl}/ai/chat`,
        {
          message: content,
          context: fullContext,
          system_prompt: systemPrompt,
        },
        { timeout: 120000 }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (voiceSettings.enabled) {
        speak(response.data.response, voiceSettings);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: currentLanguage === 'en-US'
          ? `❌ An error occurred while processing your message. Please try again.`
          : currentLanguage === 'es-ES'
          ? `❌ Ocurrió un error al procesar su mensaje. Por favor, inténtelo de nuevo.`
          : `❌ Ocorreu um erro ao processar sua mensagem. Tente novamente por favor.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  const clearChat = () => {
    const welcome: Message = {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date(),
    };
    setMessages([welcome]);
    saveMessages([welcome]);
    stopSpeaking();
  };

  const toggleVoice = () => {
    setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = createSpeechRecognition(
        (transcript) => {
          setInputValue(prev => prev + transcript);
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        },
        langConfig.recognitionLang
      );

      if (recognition) {
        recognitionRef.current = recognition;
        recognition.onend = () => setIsListening(false);
        recognition.start();
        setIsListening(true);
      }
    }
  }, [isListening, langConfig.recognitionLang]);

  const handleLanguageChange = (code: string) => {
    setCurrentLanguage(code);
    setVoiceSettings(prev => ({ ...prev, language: code }));
    const bestVoice = getBestVoiceForLanguage(code);
    if (bestVoice) {
      setVoiceSettings(prev => ({ ...prev, voiceURI: bestVoice.voiceURI }));
    }
  };

  const handleVoiceSettingsChange = (key: keyof VoiceSettings, value: any) => {
    setVoiceSettings(prev => ({ ...prev, [key]: value }));
  };

  const testVoice = () => {
    const testText = currentLanguage === 'en-US'
      ? "Hello! My voice is working! 🎉"
      : currentLanguage === 'es-ES'
      ? "¡Hola! ¡Mi voz está funcionando! 🎉"
      : "Olá! Minha voz está funcionando! 🎉";
    speak(testText, voiceSettings);
  };

  const languageVoices = getMasculineVoices(currentLanguage);

  return (
    <>
      <Head>
        <title>Chat with Spotinho - Spot Render</title>
        <meta name="description" content="Chat with Spotinho, Spot Render's virtual assistant" />
      </Head>

      <div className="chat-page">
        <header className="chat-header">
          <div className="header-left">
            <Link href="/" className="back-link">
              ← Back
            </Link>
          </div>
          <div className="header-center">
            <div className="avatar-small">
              <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#7c3aed"/>
                <circle cx="20" cy="16" r="8" fill="#fbbf24"/>
                <path d="M8 38 Q8 28 20 28 Q32 28 32 38" fill="#1e293b"/>
                <circle cx="20" cy="16" r="7" fill="#d4a574"/>
                <circle cx="17" cy="15" r="1.5" fill="#1e293b"/>
                <circle cx="23" cy="15" r="1.5" fill="#1e293b"/>
                <path d="M16 20 Q20 24 24 20" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M10 10 Q15 4 20 6 Q25 4 30 10" stroke="#1e293b" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <div>
              <h1>Spotinho 🤖</h1>
              <span className="status">
                {ollamaStatus?.available ? "🟢 Online with AI" : "🔴 Offline"}
                {voiceSettings.enabled && " • 🔊 Voice"}
              </span>
            </div>
          </div>
          <div className="header-right">
            <LanguageSelector
              currentLanguage={langConfig}
              onLanguageChange={handleLanguageChange}
            />
            <button
              className={`icon-btn ${voiceSettings.enabled ? 'active' : ''}`}
              onClick={toggleVoice}
              title={voiceSettings.enabled ? "Disable voice" : "Enable voice"}
            >
              {voiceSettings.enabled ? "🔊" : "🔇"}
            </button>
            <button
              className={`icon-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Speak"}
              disabled={!isRecognitionSupported()}
            >
              {isListening ? "⏹️" : "🎤"}
            </button>
            <button
              className="icon-btn"
              onClick={testVoice}
              title="Test voice"
              disabled={!voiceSettings.enabled}
            >
              🔊
            </button>
            <button
              className="icon-btn"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              title="Voice settings"
            >
              ⚙️
            </button>
            <button
              className="icon-btn"
              onClick={() => setShowDeviceInfo(!showDeviceInfo)}
              title="Device information"
            >
              📱
            </button>
            <button className="clear-btn" onClick={clearChat} title="Clear conversation">
              🗑️
            </button>
          </div>
        </header>

        {showVoiceSettings && (
          <div className="settings-panel">
            <h3>🔊 Voice Settings</h3>
            <label className="setting-row">
              <input
                type="checkbox"
                checked={voiceSettings.enabled}
                onChange={(e) => handleVoiceSettingsChange('enabled', e.target.checked)}
              />
              Enable voice synthesis (TTS)
            </label>
            {voiceSettings.enabled && (
              <>
                <label className="setting-row">
                  Voice:
                  <select
                    value={voiceSettings.voiceURI}
                    onChange={(e) => handleVoiceSettingsChange('voiceURI', e.target.value)}
                  >
                    {languageVoices.length > 0 ? (
                      languageVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))
                    ) : (
                      <option value="">No voices available</option>
                    )}
                  </select>
                </label>
                <label className="setting-row">
                  Speed: {voiceSettings.rate.toFixed(1)}
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => handleVoiceSettingsChange('rate', parseFloat(e.target.value))}
                  />
                </label>
                <label className="setting-row">
                  Pitch: {voiceSettings.pitch.toFixed(1)}
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => handleVoiceSettingsChange('pitch', parseFloat(e.target.value))}
                  />
                </label>
                <button className="test-btn" onClick={testVoice}>
                  🔊 Test voice
                </button>
              </>
            )}
          </div>
        )}

        {showDeviceInfo && clientInfo && (
          <div className="device-panel">
            <h3>📱 Device Information</h3>
            <div className="device-grid">
              <div className="device-item">
                <span className="device-label">Location</span>
                <span className="device-value">{clientInfo.location || 'Unknown'}</span>
              </div>
              <div className="device-item">
                <span className="device-label">IP</span>
                <span className="device-value">{clientInfo.ip || 'Not identified'}</span>
              </div>
              <div className="device-item">
                <span className="device-label">ISP</span>
                <span className="device-value">{clientInfo.isp || 'Not identified'}</span>
              </div>
              <div className="device-item">
                <span className="device-label">Speed</span>
                <span className="device-value">{clientInfo.internetSpeed || 'Not measured'}</span>
              </div>
              <div className="device-item">
                <span className="device-label">Type</span>
                <span className="device-value">
                  {clientInfo.deviceType === 'mobile' ? '📱 Mobile' :
                   clientInfo.deviceType === 'tablet' ? '📱 Tablet' : '💻 Computer'}
                </span>
              </div>
              <div className="device-item">
                <span className="device-label">OS</span>
                <span className="device-value">{clientInfo.os}{clientInfo.osVersion ? ` ${clientInfo.osVersion}` : ''}</span>
              </div>
              <div className="device-item">
                <span className="device-label">Browser</span>
                <span className="device-value">{clientInfo.browser}{clientInfo.browserVersion ? ` ${clientInfo.browserVersion}` : ''}</span>
              </div>
              <div className="device-item">
                <span className="device-label">Screen</span>
                <span className="device-value">{clientInfo.screenResolution}</span>
              </div>
            </div>
          </div>
        )}

        {userContext.artist && (
          <div className="user-context-bar">
            <span>👤 {userContext.artist}</span>
            {userContext.email && <span>📧 {userContext.email}</span>}
            {userContext.project && <span>📁 {userContext.project}</span>}
          </div>
        )}

        <main className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === "user" ? "user" : "assistant"}`}
            >
              {message.role === "assistant" && (
                <div className="message-avatar">
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#7c3aed"/>
                    <circle cx="16" cy="13" r="6" fill="#fbbf24"/>
                    <path d="M6 30 Q6 22 16 22 Q26 22 26 30" fill="#1e293b"/>
                    <circle cx="16" cy="13" r="5" fill="#d4a574"/>
                    <circle cx="14" cy="12" r="1" fill="#1e293b"/>
                    <circle cx="18" cy="12" r="1" fill="#1e293b"/>
                    <path d="M13 16 Q16 19 19 16" stroke="#1e293b" strokeWidth="1" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
              <div className="message-content">
                <div
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#7c3aed"/>
                  <circle cx="16" cy="13" r="6" fill="#fbbf24"/>
                  <path d="M6 30 Q6 22 16 22 Q26 22 26 30" fill="#1e293b"/>
                </svg>
              </div>
              <div className="message-content typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <div className="suggestions">
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("How to send a rendering job?")}>
            📤 How to send job?
          </button>
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("What formats are supported?")}>
            📁 Supported formats
          </button>
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Show my device information")}>
            📱 My device
          </button>
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Test voice")}>
            🎤 Test voice
          </button>
        </div>

        <footer className="chat-input">
          <input
            type="text"
            placeholder="Type your message or click 🎤 to speak..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputValue);
              }
            }}
          />
          <button
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            disabled={!isRecognitionSupported()}
            title={isListening ? "Stop listening" : "Speak"}
          >
            {isListening ? "⏹️" : "🎤"}
          </button>
          <button
            className="send-btn"
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12L22 2L12 22L10 15L2 12Z" fill="currentColor"/>
            </svg>
          </button>
        </footer>

        <style jsx global>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #f8fafc;
          }

          .chat-page {
            display: flex;
            flex-direction: column;
            height: 100vh;
            max-width: 900px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
          }

          .chat-header {
            background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
            color: white;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .header-left, .header-right {
            min-width: 120px;
          }

          .header-right {
            text-align: right;
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .header-center {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .header-center h1 {
            font-size: 1.25rem;
            margin: 0;
          }

          .status {
            font-size: 0.8rem;
            opacity: 0.9;
            display: block;
          }

          .back-link {
            color: white;
            text-decoration: none;
            font-size: 0.9rem;
          }

          .back-link:hover {
            text-decoration: underline;
          }

          .icon-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }

          .icon-btn:hover:not(:disabled) {
            background: rgba(255,255,255,0.3);
          }

          .icon-btn.active {
            background: rgba(34, 197, 94, 0.6);
          }

          .icon-btn.listening {
            background: #ef4444;
            animation: pulse 1s infinite;
          }

          .icon-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .clear-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: background 0.2s;
          }

          .clear-btn:hover {
            background: rgba(255,255,255,0.3);
          }

          .avatar-small svg {
            width: 40px;
            height: 40px;
          }

          .settings-panel, .device-panel {
            padding: 1rem 1.5rem;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }

          .settings-panel h3, .device-panel h3 {
            margin: 0 0 1rem;
            font-size: 1rem;
            color: #1e293b;
          }

          .setting-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
            color: #475569;
            font-size: 0.9rem;
          }

          .setting-row select {
            flex: 1;
            padding: 0.4rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            max-width: 300px;
          }

          .setting-row input[type="range"] {
            flex: 1;
            max-width: 200px;
          }

          .test-btn {
            background: #7c3aed;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85rem;
            margin-top: 0.5rem;
          }

          .device-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 0.75rem;
          }

          .device-item {
            background: white;
            padding: 0.75rem;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }

          .device-label {
            display: block;
            font-size: 0.7rem;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
          }

          .device-value {
            font-size: 0.85rem;
            font-weight: 500;
            color: #1e293b;
          }

          .user-context-bar {
            padding: 0.5rem 1.5rem;
            background: #eff6ff;
            border-bottom: 1px solid #bfdbfe;
            display: flex;
            gap: 1.5rem;
            font-size: 0.8rem;
            color: #2563eb;
          }

          .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .message {
            display: flex;
            gap: 0.75rem;
            max-width: 80%;
          }

          .message.user {
            align-self: flex-end;
            flex-direction: row-reverse;
          }

          .message-avatar svg {
            width: 36px;
            height: 36px;
          }

          .message-content {
            background: #f1f5f9;
            padding: 1rem 1.25rem;
            border-radius: 18px;
            font-size: 0.95rem;
            line-height: 1.6;
            word-wrap: break-word;
          }

          .message-content :global(a) {
            color: #2563eb;
            text-decoration: underline;
          }

          .message.user .message-content {
            background: #2563eb;
            color: white;
          }

          .message.user .message-content :global(a) {
            color: #93c5fd;
          }

          .message-content.typing {
            display: flex;
            gap: 4px;
            padding: 1rem;
          }

          .dot {
            width: 8px;
            height: 8px;
            background: #94a3b8;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out;
          }

          .dot:nth-child(1) { animation-delay: 0s; }
          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }

          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }

          .suggestions {
            padding: 0.75rem 1.5rem;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            border-top: 1px solid #e2e8f0;
            background: #f8fafc;
          }

          .suggestion-btn {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            padding: 0.5rem 1rem;
            border-radius: 999px;
            font-size: 0.8rem;
            color: #2563eb;
            cursor: pointer;
            transition: all 0.2s;
          }

          .suggestion-btn:hover {
            background: #dbeafe;
          }

          .chat-input {
            padding: 1rem 1.5rem;
            display: flex;
            gap: 0.75rem;
            border-top: 1px solid #e2e8f0;
            background: white;
          }

          .chat-input input {
            flex: 1;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 0.75rem 1.25rem;
            font-size: 1rem;
            outline: none;
          }

          .chat-input input:focus {
            border-color: #2563eb;
          }

          .mic-btn {
            background: #7c3aed;
            border: none;
            width: 48px;
            height: 48px;
            border-radius: 12px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: background 0.2s;
          }

          .mic-btn:hover:not(:disabled) {
            background: #6d28d9;
          }

          .mic-btn.listening {
            background: #ef4444;
            animation: pulse 1s infinite;
          }

          .mic-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .send-btn {
            background: #2563eb;
            border: none;
            width: 48px;
            height: 48px;
            border-radius: 12px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }

          .send-btn:hover:not(:disabled) {
            background: #1d4ed8;
          }

          .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .send-btn svg {
            width: 20px;
            height: 20px;
          }

          @media (max-width: 600px) {
            .chat-page {
              max-width: 100%;
            }

            .message {
              max-width: 90%;
            }

            .header-left, .header-right {
              min-width: 80px;
            }

            .header-center h1 {
              font-size: 1rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}
