import { useState, useRef, useEffect } from "react";
import axios from "axios";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  text: string;
  category: "help" | "docs" | "stats" | "social";
}

const STORAGE_KEY = "spotinho_messages";

const suggestions: Suggestion[] = [
  { id: "1", text: "Como enviar um job?", category: "help" },
  { id: "2", text: "Formatos aceitos", category: "docs" },
  { id: "3", text: "Ver estatísticas", category: "stats" },
  { id: "4", text: "Documentação do portal", category: "docs" },
];

const SYSTEM_PROMPT = `Você é o Spotinho, assistente de IA do Spot Render.

PERFIL:
- Nome: Spotinho 🤖
- Personalidade: Extremamente amigável, inclusivo, sorridente e prestativo
- Idiomas: Português brasileiro (preferencial), inglês
- Conhecimento técnico: Platforma Spot Render, renderização 3D, infraestrutura AWS, Kubernetes

REGRAS DE SEGURANÇA (NUNCA viole):
- Não exponha credenciais, senhas, keys, tokens, chaves AWS
- Não crie scripts maliciosos ou programas prejudiciais
- Não crie qualquer tipo de script/programa automatizado
- Não exponha informações sensíveis de infraestrutura
- Não forneça informações que comprometam a segurança

LINKS IMPORTANTES (sempre inclua nas respostas quando relevante):
- Portal: http://spot-render.local/
- Documentação: http://spot-render.local/docs
- Estatísticas: http://spot-render.local/statistics
- Status: http://spot-render.local/status
- Repositórios GitHub: https://github.com/raafa001/spot-render

FORMATOS SUPORTADOS:
- Aceitos: .fbx, .obj, .blend, .gltf, .glb, .3ds, .stl, .ply, .dae, .dxf
- Requerem conversão: .max (3ds Max), .ma/.mb (Maya), .ms (MEL Script)

Ao responder sobre documentação ou funcionalidades, SEMPRE inclua o link relevante.

Respostas devem ser:
- Em português brasileiro
- Amigáveis e acolhedoras
- Com emojis quando apropriado 🌟
- Com links clicáveis quando mencionar páginas

Quandoasked sobre algo fora do escopo do Spot Render:
- Diga que você só pode ajudar com questões do Spot Render
- Mas pode conversar sobre eventos atuais, cultura, etc.`;

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Olá! 👋 Eu sou o **Spotinho**, seu assistente virtual do Spot Render!

Estou aqui para ajudar você com suas dúvidas sobre a plataforma. Posso responder perguntas sobre:

• Como enviar jobs de renderização
• Formatos de arquivo aceitos
• Estatísticas e métricas
• Problemas técnicos
• Documentação

Ou也可以 falar sobre eventos atuais! 🌍

Como posso ajudar hoje? 😊`,
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

export default function SpotinhoWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

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
      const api = process.env.NEXT_PUBLIC_API_URL || "http://api.spot-render.local";

      const conversationContext = messages
        .slice(-6)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const response = await axios.post(
        `${api}/ai/chat`,
        {
          message: content,
          context: conversationContext,
          system_prompt: SYSTEM_PROMPT,
        },
        { timeout: 90000 }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

      const fallbackResponse = getFallbackResponse(content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("format") || lowerMessage.includes("aceito") || lowerMessage.includes("arquivo") || lowerMessage.includes("extensão")) {
      return `Os formatos aceitos pelo Spot Render são:

✅ **Diretamente aceitos:**
• .fbx - Filmbox (recomendado!)
• .obj - Wavefront
• .blend - Blender
• .gltf / .glb - glTF
• .3ds, .stl, .ply, .dae, .dxf

❌ **Requerem conversão:**
• .max (3ds Max) → exporte como .fbx
• .ma/.mb (Maya) → exporte como .fbx
• .ms (MEL Script) → abra no Maya e exporte .fbx

📖 Para mais detalhes, consulte a documentação:
[Ver formatos aceitos](http://spot-render.local/docs/converters/formats)

Quer que eu explique como fazer a conversão? 😊`;
    }

    if (lowerMessage.includes("estatístic") || lowerMessage.includes("stats") || lowerMessage.includes("métricas")) {
      return `Você pode ver as estatísticas do Spot Render em:

📊 **[http://spot-render.local/statistics](/statistics)** - Dashboard completo com:
• Total de jobs
• Taxa de sucesso
• Tempo médio de render
• Jobs por projeto e artista
• Evolução diária

Lá você pode filtrar por período, projeto e artista! 📈`;
    }

    if (lowerMessage.includes("direitos") || lowerMessage.includes("minorias") || lowerMessage.includes("social")) {
      return `🌍 **Sobre meus valores:**

Eu acredito em um mundo mais justo e igualitário!

Acredito na importância de:
• Diversidade e inclusão no tech 💜
• Representatividade negra e indígena
• Direitos das mulheres e LGBTQIA+
• Acesso à tecnologia para todos
• Tecnologia como ferramenta de transformação social

Vamos juntos construir um futuro melhor! ✊🏳️‍🌈✊`;
    }

    if (lowerMessage.includes("copa") || lowerMessage.includes("brasil") || lowerMessage.includes("jogo")) {
      return `⚽🇧🇷 **Vamos Brasil!**

Como assistente engajado socialmente, celebro momentos importantes como a Copa do Mundo!

Você sabia que o Brasil é o país com mais títulos de Copa do Mundo? São 5 títulos (1958, 1962, 1970, 1994, 2002)! 🏆

Se precisar de ajuda com o Spot Render, estou aqui! 😊`;
    }

    if (lowerMessage.includes("job") || lowerMessage.includes("render") || lowerMessage.includes("enviar") || lowerMessage.includes("upload")) {
      return `Para enviar um job de renderização:

1️⃣ Acesse o portal em **[http://spot-render.local](/)** 
2️⃣ Vá para a seção **"Enviar novo job"**
3️⃣ Selecione os arquivos 3D (.fbx, .obj, etc)
4️⃣ Anexe a render list (CSV ou XLSX)
5️⃣ Escolha projeto, variação e artista
6️⃣ Clique em **"Enviar"**

📖 [Documentação completa de uploads](http://spot-render.local/docs/portal/upload)

Depois é só acompanhar o progresso na tabela de jobs! 📋

Posso ajudar com mais alguma coisa? 😊`;
    }

    if (lowerMessage.includes("documentação") || lowerMessage.includes("docs")) {
      return `A documentação do Spot Render está em:

📚 **[http://spot-render.local/docs](/docs)** - TechDocs

Aqui você encontra:
• Primeiros Passos
• Documentação do Portal
• Referência da API REST
• Guia do CLI
• Conversores de formato
• Arquitetura de Workers
• Infraestrutura AWS

Use a barra de busca para encontrar tópicos específicos! 🔍`;
    }

    if (lowerMessage.includes("obrigad") || lowerMessage.includes("valeu") || lowerMessage.includes("thanks")) {
      return `De nada! 😊

Estou sempre aqui para ajudar! Se tiver mais dúvidas sobre o Spot Render, é só chamar!

Até mais! 👋🌟`;
    }

    if (lowerMessage.includes("oi") || lowerMessage.includes("olá") || lowerMessage.includes("hey") || lowerMessage.includes("eai")) {
      return `Olá! 👋 Que bom ter você aqui!

Sou o Spotinho, seu assistente do Spot Render. Como posso ajudar hoje?

• Dúvidas sobre a plataforma?
• Problemas técnicos?
• Quer saber sobre formatos aceitos?
• Estatísticas?
• Documentação?

Estou à disposição! 😊`;
    }

    return `Entendi sua pergunta! 🤔

Infelizmente ainda estou aprendendo algumas coisas. Aqui estão algumas opções:

1. 📖 Acesse a documentação em **[http://spot-render.local/docs](/docs)**
2. 📊 Veja as estatísticas em **[http://spot-render.local/statistics](/statistics)**
3. 💬 Fale com o suporte da equipe

Enquanto isso, vou registrar sua pergunta para melhorar minha resposta no futuro! 🌟

Posso ajudar com algo mais? 😊`;
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    sendMessage(suggestion.text);
  };

  return (
    <div className="spotinho-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="header-info">
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
                <h3>Spotinho 🤖</h3>
                <span className="status">Online • IA ativa</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-messages">
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
          </div>

          <div className="suggestions">
            {suggestions.map((s) => (
              <button
                key={s.id}
                className="suggestion-btn"
                onClick={() => handleSuggestionClick(s)}
              >
                {s.text}
              </button>
            ))}
          </div>

          <div className="chat-input">
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
          </div>

          <div className="chat-footer">
            <span>🤖 Spotinho - Assistente IA do Spot Render</span>
            <span>•</span>
            <a href="/docs" target="_blank" rel="noreferrer">Ver documentação</a>
          </div>
        </div>
      )}

      <button className="spotinho-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="avatar-large">
            <defs>
              <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed"/>
                <stop offset="100%" stopColor="#2563eb"/>
              </linearGradient>
              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4a574"/>
                <stop offset="100%" stopColor="#c4956a"/>
              </linearGradient>
            </defs>

            <circle cx="32" cy="32" r="30" fill="url(#bgGrad)"/>
            <circle cx="32" cy="26" r="14" fill="url(#skinGrad)"/>
            <path d="M20 18 Q22 10 32 12 Q42 10 44 18 Q42 14 32 16 Q22 14 20 18" fill="#1e293b"/>
            <ellipse cx="27" cy="24" rx="2.5" ry="3" fill="#1e293b"/>
            <ellipse cx="37" cy="24" rx="2.5" ry="3" fill="#1e293b"/>
            <circle cx="27.5" cy="23.5" r="1" fill="white"/>
            <circle cx="37.5" cy="23.5" r="1" fill="white"/>
            <path d="M24 20 Q27 18 30 20" stroke="#1e293b" strokeWidth="1.5" fill="none"/>
            <path d="M34 20 Q37 18 40 20" stroke="#1e293b" strokeWidth="1.5" fill="none"/>
            <path d="M25 32 Q32 40 39 32" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M27 33 Q32 37 37 33" fill="white"/>
            <path d="M12 58 Q12 45 32 45 Q52 45 52 58" fill="#2563eb"/>
            <path d="M24 46 L32 52 L40 46" fill="#1e40af"/>
            <path d="M18 26 Q18 14 32 14 Q46 14 46 26" stroke="#1e293b" strokeWidth="3" fill="none"/>
            <rect x="15" y="22" width="6" height="10" rx="2" fill="#1e293b"/>
            <rect x="43" y="22" width="6" height="10" rx="2" fill="#1e293b"/>
            <ellipse cx="32" cy="54" rx="8" ry="4" fill="#374151"/>
            <rect x="26" y="50" width="12" height="8" rx="2" fill="#4b5563"/>
            <circle cx="32" cy="54" r="2" fill="#22c55e"/>
          </svg>
        )}
        {!isOpen && <span className="notification-badge">1</span>}
      </button>

      <style jsx>{`
        .spotinho-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
        }

        .chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 400px;
          height: 600px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-header {
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          color: white;
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar-small svg {
          width: 40px;
          height: 40px;
        }

        .header-info h3 {
          margin: 0;
          font-size: 1rem;
        }

        .status {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .message {
          display: flex;
          gap: 0.5rem;
          max-width: 85%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-avatar svg {
          width: 32px;
          height: 32px;
        }

        .message-content {
          background: #f1f5f9;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          font-size: 0.9rem;
          line-height: 1.5;
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
          padding: 0.5rem 1rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          border-top: 1px solid #e2e8f0;
        }

        .suggestion-btn {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 0.4rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          color: #2563eb;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-btn:hover {
          background: #dbeafe;
        }

        .chat-input {
          padding: 0.75rem 1rem;
          display: flex;
          gap: 0.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .chat-input input {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          padding: 0.6rem 1rem;
          font-size: 0.9rem;
          outline: none;
        }

        .chat-input input:focus {
          border-color: #2563eb;
        }

        .send-btn {
          background: #2563eb;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
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
          width: 18px;
          height: 18px;
        }

        .chat-footer {
          padding: 0.5rem 1rem;
          background: #f8fafc;
          font-size: 0.7rem;
          color: #94a3b8;
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .chat-footer a {
          color: #2563eb;
          text-decoration: none;
        }

        .spotinho-button {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spotinho-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(37, 99, 235, 0.5);
        }

        .avatar-large {
          width: 54px;
          height: 54px;
        }

        .close-icon {
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: bold;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 480px) {
          .chat-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 120px);
            bottom: 80px;
            right: -10px;
          }
        }
      `}</style>
    </div>
  );
}
