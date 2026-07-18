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
  requestMicrophone,
  requestCamera,
  stopTrack,
  createSpeechRecognition,
  getAvailableVoices,
  getPortugueseVoices,
  isRecognitionSupported,
} from "../utils/voiceUtils";

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

const SYSTEM_PROMPT = `Você é o Spotinho, assistente de IA do Spot Render.

PERFIL:
- Nome: Spotinho 🤖
- Personalidade: Extremamente amigável, inclusivo, sorridente e prestativo
- Idiomas: Português brasileiro (preferencial), inglês
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

Após ajudar a coletar todas as informações, instrua o usuário a usar o formulário de upload em http://spot-render.local/

INFORMAÇÕES DO DISPOSITIVO:
O sistema já conhece as informações do dispositivo do usuário. Use isso para personalizar a experiência.

LINKS IMPORTANTES:
- Portal: http://spot-render.local/
- Upload de jobs: http://spot-render.local/
- Documentação: http://spot-render.local/docs
- Estatísticas: http://spot-render.local/statistics

FORMATOS SUPORTADOS:
- Aceitos: .fbx, .obj, .blend, .gltf, .glb, .3ds, .stl, .ply, .dae, .dxf
- Requerem conversão: .max (3ds Max), .ma/.mb (Maya), .ms (MEL Script)

Ao responder sobre documentação ou funcionalidades, SEMPRE inclua o link relevante.

INSTRUÇÕES DE CONVERSA:
- Seja natural e conversacional, como um amigo que ajuda
- Use emojis com moderação para expressar emoções
- Faça perguntas clarifying quando necessário
- Se não souber algo, seja honesto e diga que vai pesquisar
- Lembre-se do contexto da conversa anterior
- Recomende ações específicas quando relevante
- Se o usuário quiser criar um job, ajude a coletar as informações

Respostas devem ser:
- Em português brasileiro
- Amigáveis e acolhedoras
- Com emojis quando apropriado 🌟
- Com links clicáveis quando mencionar páginas
- Voz: Se a síntese de voz estiver ativada, leia suas respostas em voz alta`;

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Olá! 👋 Que bom ter você aqui no Spot Render!

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
  timestamp: new Date(),
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

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [WELCOME_MESSAGE];

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
  return [WELCOME_MESSAGE];
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
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [userContext, setUserContext] = useState<UserContext>(loadUserContext());
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(loadVoiceSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setMessages(loadMessages());
    checkOllamaStatus();
    getClientInfo().then(info => {
      setClientInfo(info);
      if (info) {
        setMessages(prev => {
          const deviceMsg: Message = {
            id: `device-${Date.now()}`,
            role: "assistant",
            content: `📱 **Informações do seu dispositivo:**\n\n${formatClientInfo(info)}\n\n---\n\nPosso ajudá-lo melhor sabendo estas informações! Como posso te ajudar hoje? 😊`,
            timestamp: new Date(),
          };
          return [...prev, deviceMsg];
        });
      }
    });

    if (isSpeechSupported()) {
      const voices = getPortugueseVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !voiceSettings.voiceURI) {
        setVoiceSettings(prev => ({ ...prev, voiceURI: voices[0].voiceURI }));
      }
    }
  }, []);

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

      const deviceContext = clientInfo ? `\n\nINFORMAÇÕES DO DISPOSITIVO DO USUÁRIO:\n${formatClientInfo(clientInfo)}` : '';

      const userCtxStr = userContext.artist
        ? `\n\nCONTEXTO DO USUÁRIO (lembre-se destas informações):\nNome: ${userContext.artist}\nEmail: ${userContext.email || 'não informado'}\nProjeto padrão: ${userContext.project || 'demo'}\nVariação padrão: ${userContext.variation || 'v1'}`
        : '';

      const fullContext = conversationContext + deviceContext + userCtxStr;

      const response = await axios.post(
        `${apiUrl}/ai/chat`,
        {
          message: content,
          context: fullContext,
          system_prompt: SYSTEM_PROMPT,
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
        content: `❌ Ocorreu um erro ao processar sua mensagem.

Tente novamente em alguns segundos.

Se o problema persistir, entre em contato com o suporte. 😊`,
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
    setMessages([WELCOME_MESSAGE]);
    saveMessages([WELCOME_MESSAGE]);
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
        }
      );

      if (recognition) {
        recognitionRef.current = recognition;
        recognition.onend = () => setIsListening(false);
        recognition.start();
        setIsListening(true);
      }
    }
  }, [isListening]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const updateUserContext = (key: keyof UserContext, value: any) => {
    setUserContext(prev => {
      const updated = { ...prev, [key]: value };
      saveUserContext(updated);
      return updated;
    });
  };

  const testVoice = () => {
    speak("Olá! Sou o Spotinho. Minha voz está funcionando! 🎉", voiceSettings);
  };

  return (
    <>
      <Head>
        <title>Chat com Spotinho - Spot Render</title>
        <meta name="description" content="Converse com o Spotinho, assistente virtual do Spot Render" />
      </Head>

      <div className="chat-page">
        <header className="chat-header">
          <div className="header-left">
            <Link href="/" className="back-link">
              ← Voltar
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
                {ollamaStatus?.available ? "🟢 Online com IA" : "🔴 Offline"}
                {voiceSettings.enabled && " • 🔊 Voz"}
              </span>
            </div>
          </div>
          <div className="header-right">
            <button
              className={`icon-btn ${voiceSettings.enabled ? 'active' : ''}`}
              onClick={toggleVoice}
              title={voiceSettings.enabled ? "Desativar voz" : "Ativar voz"}
            >
              {voiceSettings.enabled ? "🔊" : "🔇"}
            </button>
            <button
              className={`icon-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={isListening ? "Parar de ouvir" : "Falar"}
              disabled={!isRecognitionSupported()}
            >
              {isListening ? "⏹️" : "🎤"}
            </button>
            <button
              className="icon-btn"
              onClick={testVoice}
              title="Testar voz"
              disabled={!voiceSettings.enabled}
            >
              🔊
            </button>
            <button
              className="icon-btn"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              title="Configurações de voz"
            >
              ⚙️
            </button>
            <button
              className="icon-btn"
              onClick={() => setShowDeviceInfo(!showDeviceInfo)}
              title="Informações do dispositivo"
            >
              📱
            </button>
            <button className="clear-btn" onClick={clearChat} title="Limpar conversa">
              🗑️
            </button>
          </div>
        </header>

        {showVoiceSettings && (
          <div className="settings-panel">
            <h3>Configurações de Voz 🔊</h3>
            <label className="setting-row">
              <input
                type="checkbox"
                checked={voiceSettings.enabled}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              Ativar síntese de voz (TTS)
            </label>
            {voiceSettings.enabled && (
              <>
                <label className="setting-row">
                  Voz:
                  <select
                    value={voiceSettings.voiceURI}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, voiceURI: e.target.value }))}
                  >
                    {availableVoices.length > 0 ? (
                      availableVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))
                    ) : (
                      <option value="">Carregando vozes...</option>
                    )}
                  </select>
                </label>
                <label className="setting-row">
                  Velocidade: {voiceSettings.rate.toFixed(1)}
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                  />
                </label>
                <label className="setting-row">
                  Tom: {voiceSettings.pitch.toFixed(1)}
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                  />
                </label>
                <button className="test-btn" onClick={testVoice}>
                  🔊 Testar voz
                </button>
              </>
            )}
          </div>
        )}

        {showDeviceInfo && clientInfo && (
          <div className="device-panel">
            <h3>📱 Informações do Dispositivo</h3>
            <div className="device-grid">
              <div className="device-item">
                <span className="device-label">Localização</span>
                <span className="device-value">{clientInfo.location || 'Desconhecida'}</span>
              </div>
              <div className="device-item">
                <span className="device-label">IP</span>
                <span className="device-value">{clientInfo.ip || 'Não identificado'}</span>
              </div>
              <div className="device-item">
                <span className="device-label">Operadora</span>
                <span className="device-value">{clientInfo.isp || 'Não identificada'}</span>
              </div>
              <div className="device-item">
                <span className="device-label">Velocidade</span>
                <span className="device-value">{clientInfo.internetSpeed || 'Não medida'}</span>
              </div>
              <div className="device-item">
                <span className="device-label">Tipo</span>
                <span className="device-value">
                  {clientInfo.deviceType === 'mobile' ? '📱 Celular' :
                   clientInfo.deviceType === 'tablet' ? '📱 Tablet' : '💻 Computador'}
                </span>
              </div>
              <div className="device-item">
                <span className="device-label">Sistema</span>
                <span className="device-value">{clientInfo.os}{clientInfo.osVersion ? ` ${clientInfo.osVersion}` : ''}</span>
              </div>
              <div className="device-item">
                <span className="device-label">Navegador</span>
                <span className="device-value">{clientInfo.browser}{clientInfo.browserVersion ? ` ${clientInfo.browserVersion}` : ''}</span>
              </div>
              <div className="device-item">
                <span className="device-label">Tela</span>
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
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Como enviar um job de renderização?")}>
            📤 Como enviar job?
          </button>
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Quais formatos são aceitos?")}>
            📁 Formatos aceitos
          </button>
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Ver informações do meu dispositivo")}>
            📱 Meu dispositivo
          </button>
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Testar comando de voz")}>
            🎤 Testar voz
          </button>
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Status dos meus jobs")}>
            📊 Status dos jobs
          </button>
        </div>

        <footer className="chat-input">
          <input
            type="text"
            placeholder="Digite sua mensagem ou clique 🎤 para falar..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            disabled={!isRecognitionSupported()}
            title={isListening ? "Parar de ouvir" : "Falar"}
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
