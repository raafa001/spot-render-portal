import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";

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

LINKS IMPORTANTES:
- Portal: http://spot-render.local/
- Documentação: http://spot-render.local/docs
- Estatísticas: http://spot-render.local/statistics
- Status: http://spot-render.local/status

FORMATOS SUPORTADOS:
- Aceitos: .fbx, .obj, .blend, .gltf, .glb, .3ds, .stl, .ply, .dae, .dxf
- Requerem conversão: .max (3ds Max), .ma/.mb (Maya), .ms (MEL Script)

Ao responder sobre documentação ou funcionalidades, SEMPRE inclua o link relevante.

INSTRUÇÕES DE CONVERSA:
- Seja natural e conversacional, como um amigo que ajuda
- Use emojis com moderação paraExpressar emoções
- Faça perguntas clarifying quando necessário
- Se não souber algo, seja honesto e diga que vai pesquisar
- Lembre-se do contexto da conversa anterior
- Recomende ações específicas quando relevante

Respostas devem ser:
- Em português brasileiro
- Amigáveis e acolhedoras
- Com emojis quando apropriado 🌟
- Com links clicáveis quando mencionar páginas`;

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Olá! 👋 Que bom ter você aqui no Spot Render!

Sou o **Spotinho**, seu assistente virtual. Estou aqui para ajudar no que precisar!

Puedo ayudarte con:

🤖 Dúvidas sobre a plataforma
📤 Como enviar jobs de renderização
📁 Formatos de arquivo aceitos
📊 Ver estatísticas e métricas
📚 Navegar pela documentação
🔧 Problemas técnicos

E também posso conversar sobre outros assuntos! 😄

O que você gostaria de saber hoje?`,
  timestamp: new Date(),
};

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
    checkOllamaStatus();
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
        .slice(-8)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const response = await axios.post(
        `${apiUrl}/ai/chat`,
        {
          message: content,
          context: conversationContext,
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
      checkOllamaStatus();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

      const offlineMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getOfflineResponse(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, offlineMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getOfflineResponse = (): string => {
    if (!ollamaStatus?.available) {
      return `😔 O Spotinho está offline no momento!

Parece que o servidor de IA não está disponível. Tente novamente mais tarde.

Enquanto isso, você pode:
• Consultar a documentação: http://spot-render.local/docs
• Ver as estatísticas: http://spot-render.local/statistics
• Falar com o suporte da equipe

Desculpe pelo transtorno! 😊`;
    }

    return `❌ Ocorreu um erro ao processar sua mensagem.

Tente novamente em alguns segundos, por favor.

Se o problema persistir, entre em contato com o suporte. 😊`;
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    saveMessages([WELCOME_MESSAGE]);
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
              ← Voltar ao Portal
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
              </span>
            </div>
          </div>
          <div className="header-right">
            <button className="clear-btn" onClick={clearChat} title="Limpar conversa">
              🗑️ Limpar
            </button>
          </div>
        </header>

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
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Como enviar um job?")}>
            Como enviar um job? 📤
          </button>
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Quais formatos são aceitos?")}>
            Formatos aceitos 📁
          </button>
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Qual o status dos meus jobs?")}>
            Status dos jobs 📊
          </button>
          <button className="suggestion-btn" onClick={() => handleSuggestionClick("Ver estatísticas")}>
            Ver estatísticas 📈
          </button>
        </div>

        <footer className="chat-input">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputValue);
              }
            }}
          />
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
          }

          .header-left, .header-right {
            min-width: 120px;
          }

          .header-right {
            text-align: right;
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
          }

          .back-link {
            color: white;
            text-decoration: none;
            font-size: 0.9rem;
          }

          .back-link:hover {
            text-decoration: underline;
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
          }
        `}</style>
      </div>
    </>
  );
}
