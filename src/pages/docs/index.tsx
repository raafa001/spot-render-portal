import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SpotinhoWidget from "../../components/SpotinhoWidget";

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  links: { title: string; href: string; description: string; category?: string }[];
}

const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Primeiros Passos",
    description: "Tudo que você precisa para começar",
    icon: "🚀",
    links: [
      { title: "Introdução ao Spot Render", href: "/docs/intro", description: "Conheça a plataforma", category: "intro" },
      { title: "Configuração Rápida", href: "/docs/quickstart", description: "Configure em 5 minutos", category: "intro" },
      { title: "Conceitos Básicos", href: "/docs/intro#conceitos", description: "Jobs, renderização, filas", category: "intro" },
      { title: "Perguntas Frequentes", href: "/docs/intro#faq", description: "FAQ com dúvidas comuns", category: "intro" },
    ],
  },
  {
    id: "portal",
    title: "Portal Web",
    description: "Interface visual para gestão de renders",
    icon: "🖥️",
    links: [
      { title: "Upload de Arquivos", href: "/docs/portal/upload", description: "Como enviar arquivos", category: "portal" },
      { title: "Acompanhamento de Jobs", href: "/docs/portal/jobs", description: "Monitore suas renderizações", category: "portal" },
      { title: "Estatísticas", href: "/docs/portal/stats", description: "Métricas e dashboards", category: "portal" },
    ],
  },
  {
    id: "api",
    title: "API REST",
    description: "Integração programática",
    icon: "⚡",
    links: [
      { title: "Visão Geral", href: "/docs/api/overview", description: "Autenticação, rate limits", category: "api" },
      { title: "Endpoints", href: "/docs/api/overview#endpoints", description: "Lista completa", category: "api" },
      { title: "Webhooks", href: "/docs/api/overview#webhooks", description: "Notificações em tempo real", category: "api" },
    ],
  },
  {
    id: "cli",
    title: "CLI",
    description: "Linha de comando para automação",
    icon: "💻",
    links: [
      { title: "Instalação", href: "/docs/cli/install", description: "npm install -g spotrender-cli", category: "cli" },
      { title: "Comandos", href: "/docs/cli/install#comandos", description: "submit, status, cancel", category: "cli" },
      { title: "Exemplos", href: "/docs/cli/install#exemplos", description: "Scripts de automação", category: "cli" },
    ],
  },
  {
    id: "converters",
    title: "Conversores",
    description: "Formatos 3D suportados e conversão",
    icon: "🔄",
    links: [
      { title: "Formatos Aceitos", href: "/docs/converters/formats", description: ".fbx, .obj, .blend, etc", category: "converters" },
      { title: "Conversão Maya", href: "/docs/converters/formats#formatos-conversao", description: ".ma, .mb → .fbx", category: "converters" },
      { title: "Conversão 3ds Max", href: "/docs/converters/formats#formatos-conversao", description: ".max → .fbx", category: "converters" },
      { title: "Blender", href: "/docs/converters/formats#workflows", description: ".blend direto", category: "converters" },
    ],
  },
  {
    id: "workers",
    title: "Workers",
    description: "Processamento distribuído",
    icon: "⚙️",
    links: [
      { title: "Arquitetura", href: "/docs/workers/architecture", description: "Como funciona", category: "workers" },
      { title: "Spot Instances", href: "/docs/workers/architecture#spot-instances", description: "Economia com AWS Spot", category: "workers" },
      { title: "Monitoramento", href: "/docs/workers/architecture#monitoramento", description: "Prometheus, Grafana", category: "workers" },
    ],
  },
  {
    id: "infra",
    title: "Infraestrutura",
    description: "Terraform, AWS, karpenter",
    icon: "☁️",
    links: [
      { title: "Terraform Modules", href: "/docs/workers/architecture#k8s", description: "EKS, S3, RDS", category: "infra" },
      { title: "Karpenter", href: "/docs/workers/architecture#k8s", description: "Autoscaling", category: "infra" },
      { title: "S3 Storage", href: "/docs/intro#arquitetura", description: "Input/Output buckets", category: "infra" },
    ],
  },
  {
    id: "security",
    title: "Segurança",
    description: "Boas práticas e compliance",
    icon: "🔒",
    links: [
      { title: "Autenticação", href: "/docs/security/auth", description: "OAuth, tokens", category: "security" },
      { title: "Criptografia", href: "/docs/security/auth#encryption", description: "Dados em repouso e trânsito", category: "security" },
      { title: "IAM Roles", href: "/docs/security/auth#iam", description: "Políticas AWS", category: "security" },
    ],
  },
  {
    id: "repositories",
    title: "Repositórios",
    description: "Código fonte e organizações",
    icon: "📦",
    links: [
      { title: "spot-render", href: "https://github.com/raafa001/spot-render", description: "Core da aplicação", category: "repo" },
      { title: "spot-render-api", href: "https://github.com/raafa001/spot-render-api", description: "Backend FastAPI", category: "repo" },
      { title: "spot-render-portal", href: "https://github.com/raafa001/spot-render-portal", description: "Frontend Next.js", category: "repo" },
      { title: "spot-render-cli", href: "https://github.com/raafa001/spot-render-cli", description: "CLI tool", category: "repo" },
    ],
  },
];

const quickLinks = [
  { title: "Status do Sistema", href: "/status", icon: "📊" },
  { title: "Estatísticas", href: "/statistics", icon: "📈" },
  { title: "Enviar Job", href: "/#upload-card", icon: "⬆️" },
  { title: "Ver Jobs", href: "/#jobs", icon: "📋" },
];

const categories = [
  { id: "all", label: "Todos" },
  { id: "intro", label: "Primeiros Passos" },
  { id: "portal", label: "Portal" },
  { id: "api", label: "API" },
  { id: "cli", label: "CLI" },
  { id: "converters", label: "Conversores" },
  { id: "workers", label: "Workers" },
  { id: "infra", label: "Infra" },
  { id: "security", label: "Segurança" },
];

interface SearchResult {
  title: string;
  href: string;
  description: string;
  section: string;
  category: string;
}

export default function TechDocs() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showResults, setShowResults] = useState(false);

  const searchDocs = useCallback(async (query: string, filter: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://api.spot-render.local";

      const response = await axios.post(
        `${api}/ai/chat`,
        {
          message: `Busque na documentação do Spot Render por: "${query}". Liste os links mais relevantes encontrados. Formato: título - link - descrição breve.`,
          context: `Categoria desejada: ${filter === 'all' ? 'todas' : filter}.`,
          system_prompt: `Você é um assistente de busca inteligente para documentação técnica.

Seu trabalho é encontrar informações na documentação do Spot Render based na query do usuário.

Documente apenas sobre:
- Portal web (upload, jobs, estatísticas)
- API REST (endpoints, autenticação, webhooks)
- CLI (comandos, instalação)
- Conversores de formato (.fbx, .obj, .blend, .max, .ma)
- Workers (Kubernetes, Spot Instances, autoscaling)
- Infraestrutura (AWS, Terraform, S3)
- Segurança (autenticação, criptografia, IAM)
- Primeiros passos e Quickstart

Responda APENAS com links relevantes em formato:
[LINK] título - http://spot-render.local/docs/... - descrição

Se não encontrar nada relevante, responda: [NONE]`,
        },
        { timeout: 30000 }
      );

      const aiResponse = response.data.response;
      const results = parseSearchResults(aiResponse, filter);
      setSearchResults(results);

    } catch (error) {
      console.error("Search error:", error);
      const fallbackResults = localSearch(query, filter);
      setSearchResults(fallbackResults);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const parseSearchResults = (aiResponse: string, filter: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const lines = aiResponse.split("\n").filter(line => line.includes("[LINK]"));

    for (const line of lines) {
      const match = line.match(/\[LINK\]\s*(.+?)\s*-\s*(http[^\s-]+(?:-[^\s-]+)*)\s*-\s*(.+)/);
      if (match) {
        const [, title, href, description] = match;
        const category = getCategoryFromHref(href);

        if (filter === "all" || category === filter) {
          results.push({
            title: title.trim(),
            href: href.trim(),
            description: description.trim(),
            section: getSectionFromHref(href),
            category,
          });
        }
      }
    }

    return results.slice(0, 8);
  };

  const localSearch = (query: string, filter: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const section of docSections) {
      if (filter !== "all" && section.id !== filter && !section.links.some(l => l.category === filter)) {
        continue;
      }

      for (const link of section.links) {
        const titleMatch = link.title.toLowerCase().includes(lowerQuery);
        const descMatch = link.description.toLowerCase().includes(lowerQuery);
        const queryMatch = lowerQuery.split(" ").some(word =>
          link.title.toLowerCase().includes(word) ||
          link.description.toLowerCase().includes(word)
        );

        if (titleMatch || descMatch || queryMatch) {
          results.push({
            title: link.title,
            href: link.href,
            description: link.description,
            section: section.title,
            category: link.category || section.id,
          });
        }
      }
    }

    return results.slice(0, 8);
  };

  const getCategoryFromHref = (href: string): string => {
    if (href.includes("/intro") || href.includes("/quickstart")) return "intro";
    if (href.includes("/portal/")) return "portal";
    if (href.includes("/api/")) return "api";
    if (href.includes("/cli/")) return "cli";
    if (href.includes("/converters/")) return "converters";
    if (href.includes("/workers/")) return "workers";
    if (href.includes("/security/")) return "security";
    if (href.includes("/infra/")) return "infra";
    return "other";
  };

  const getSectionFromHref = (href: string): string => {
    if (href.includes("/intro")) return "Primeiros Passos";
    if (href.includes("/portal/")) return "Portal Web";
    if (href.includes("/api/")) return "API REST";
    if (href.includes("/cli/")) return "CLI";
    if (href.includes("/converters/")) return "Conversores";
    if (href.includes("/workers/")) return "Workers";
    if (href.includes("/security/")) return "Segurança";
    return "Documentação";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchDocs(searchQuery, activeFilter);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter, searchDocs]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <Head>
        <title>TechDocs - Spot Render</title>
      </Head>
      <div className="page">
        <header className="header">
          <div className="header-content">
            <Link href="/" className="back-link">← Voltar ao Portal</Link>
            <h1>📚 TechDocs</h1>
            <p className="subtitle">Documentação completa do Spot Render</p>
          </div>
        </header>

        <nav className="quick-nav">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="quick-link">
              <span className="quick-icon">{link.icon}</span>
              <span>{link.title}</span>
            </Link>
          ))}
        </nav>

        <main className="content">
          <section className="intro-section">
            <div className="intro-card">
              <h2>Bem-vindo à documentação do Spot Render! 👋</h2>
              <p>
                Aqui você encontra tudo sobre como usar, configurar e integrar
                o Spot Render com sua infraestrutura de renderização 3D.
              </p>

              <div className="search-container">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar documentação..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowResults(true)}
                  />
                  {isSearching && <span className="search-loading">⏳</span>}
                  {searchQuery && !isSearching && (
                    <button className="clear-btn" onClick={() => { setSearchQuery(""); setSearchResults([]); }}>
                      ✕
                    </button>
                  )}
                </div>

                <div className="filter-chips">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`filter-chip ${activeFilter === cat.id ? "active" : ""}`}
                      onClick={() => setActiveFilter(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {showResults && (
                  <div className="search-results">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="results-header">
                          <span>{searchResults.length} resultado(s) encontrado(s)</span>
                          <span className="ai-badge">🤖 IA</span>
                        </div>
                        {searchResults.map((result, idx) => (
                          <a
                            key={idx}
                            href={result.href}
                            className="result-item"
                            onClick={() => setShowResults(false)}
                          >
                            <div className="result-header">
                              <span className="result-title">{result.title}</span>
                              <span className={`result-category ${result.category}`}>{result.category}</span>
                            </div>
                            <p className="result-description">{result.description}</p>
                            <span className="result-section">📂 {result.section}</span>
                          </a>
                        ))}
                      </>
                    ) : searchQuery && !isSearching ? (
                      <div className="no-results">
                        <p>Nenhum resultado encontrado para "{searchQuery}"</p>
                        <p className="suggestion">Tente buscar por termos diferentes ou limpe os filtros.</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="sections-grid">
            {docSections.map((section) => (
              <div
                key={section.id}
                className={`section-card ${activeSection === section.id ? "active" : ""}`}
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              >
                <div className="section-header">
                  <span className="section-icon">{section.icon}</span>
                  <div className="section-info">
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>
                  <span className="expand-icon">{activeSection === section.id ? "−" : "+"}</span>
                </div>

                {activeSection === section.id && (
                  <div className="section-links">
                    {section.links.map((link) => (
                      link.href.startsWith("http") ? (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="doc-link external"
                        >
                          <span className="link-title">{link.title}</span>
                          <span className="link-desc">{link.description}</span>
                        </a>
                      ) : (
                        <Link key={link.href} href={link.href} className="doc-link">
                          <span className="link-title">{link.title}</span>
                          <span className="link-desc">{link.description}</span>
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="help-section">
            <div className="help-card">
              <h3>Precisa de ajuda?</h3>
              <p>
                O <strong>Spotinho</strong> pode ajudar com dúvidas sobre a plataforma.
                Clique no chat no canto inferior direito para conversar! 🤖
              </p>
              <div className="help-options">
                <div className="help-option">
                  <span className="option-icon">📖</span>
                  <span>Navegue pela documentação acima</span>
                </div>
                <div className="help-option">
                  <span className="option-icon">🤖</span>
                  <span>Use o Spotinho para assisti-lo</span>
                </div>
                <div className="help-option">
                  <span className="option-icon">💬</span>
                  <span>Entre em contato com o suporte</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          font-family: "Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f8fafc;
          color: #0f172a;
        }
        * { box-sizing: border-box; }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%);
        }

        .header {
          background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
          color: white;
          padding: 2rem 1.5rem;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-link {
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .back-link:hover {
          color: white;
        }

        .header h1 {
          margin: 0 0 0.5rem;
          font-size: 2.5rem;
        }

        .subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .quick-nav {
          max-width: 1200px;
          margin: -1.5rem auto 2rem;
          padding: 0 1.5rem;
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .quick-link {
          background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
          border: none;
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          text-decoration: none;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
          transition: all 0.2s;
        }

        .quick-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(30, 64, 175, 0.4);
          color: white;
        }

        .quick-icon {
          font-size: 1.2rem;
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem 3rem;
        }

        .intro-section {
          margin-bottom: 2rem;
        }

        .intro-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .intro-card h2 {
          margin: 0 0 1rem;
          font-size: 1.5rem;
        }

        .intro-card p {
          margin: 0 0 1.5rem;
          color: #64748b;
        }

        .search-container {
          position: relative;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          gap: 0.75rem;
          transition: border-color 0.2s;
        }

        .search-box:focus-within {
          border-color: #2563eb;
        }

        .search-icon {
          font-size: 1.2rem;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1rem;
          outline: none;
        }

        .search-box input::placeholder {
          color: #94a3b8;
        }

        .search-loading {
          font-size: 1rem;
        }

        .clear-btn {
          background: #e2e8f0;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: #64748b;
        }

        .clear-btn:hover {
          background: #cbd5e1;
        }

        .filter-chips {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.75rem;
        }

        .filter-chip {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 0.4rem 0.75rem;
          border-radius: 999px;
          font-size: 0.8rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-chip:hover {
          background: #e2e8f0;
        }

        .filter-chip.active {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-top: 0.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          max-height: 400px;
          overflow-y: auto;
          z-index: 100;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
          color: #64748b;
        }

        .ai-badge {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .result-item {
          display: block;
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          text-decoration: none;
          color: inherit;
          transition: background 0.2s;
        }

        .result-item:hover {
          background: #eff6ff;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .result-title {
          font-weight: 600;
          color: #0f172a;
        }

        .result-category {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
          background: #e2e8f0;
          color: #475569;
          text-transform: uppercase;
          font-weight: 600;
        }

        .result-category.intro { background: #dcfce7; color: #166534; }
        .result-category.portal { background: #dbeafe; color: #1e40af; }
        .result-category.api { background: #fef3c7; color: #92400e; }
        .result-category.cli { background: #f3e8ff; color: #7c3aed; }
        .result-category.converters { background: #ffedd5; color: #c2410c; }
        .result-category.workers { background: #e0e7ff; color: #3730a3; }
        .result-category.security { background: #fee2e2; color: #b91c1c; }
        .result-category.infra { background: #ccfbf1; color: #115e59; }

        .result-description {
          margin: 0 0 0.5rem;
          font-size: 0.85rem;
          color: #64748b;
        }

        .result-section {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .no-results {
          padding: 2rem;
          text-align: center;
          color: #64748b;
        }

        .no-results p {
          margin: 0 0 0.5rem;
        }

        .suggestion {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .section-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .section-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .section-card.active {
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37,99,235,0.15);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }

        .section-icon {
          font-size: 2rem;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          border-radius: 12px;
        }

        .section-info {
          flex: 1;
        }

        .section-info h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .section-info p {
          margin: 0.25rem 0 0;
          font-size: 0.85rem;
          color: #64748b;
        }

        .expand-icon {
          font-size: 1.5rem;
          color: #94a3b8;
          font-weight: 300;
        }

        .section-links {
          padding: 0 1.25rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .doc-link {
          display: flex;
          flex-direction: column;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-radius: 10px;
          text-decoration: none;
          color: #0f172a;
          transition: background 0.2s;
        }

        .doc-link:hover {
          background: #eff6ff;
        }

        .doc-link.external {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        .doc-link.external::after {
          content: "↗";
          color: #2563eb;
          font-weight: 600;
        }

        .link-title {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .link-desc {
          font-size: 0.8rem;
          color: #64748b;
        }

        .doc-link.external .link-desc {
          text-align: right;
        }

        .help-section {
          margin-top: 2rem;
        }

        .help-card {
          background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
          border: 1px solid #fcd34d;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
        }

        .help-card h3 {
          margin: 0 0 0.75rem;
          font-size: 1.3rem;
          color: #92400e;
        }

        .help-card p {
          margin: 0 0 1.5rem;
          color: #a16207;
        }

        .help-options {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .help-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #92400e;
          font-weight: 500;
        }

        .option-icon {
          font-size: 1.25rem;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 1.75rem;
          }
          .sections-grid {
            grid-template-columns: 1fr;
          }
          .quick-nav {
            justify-content: center;
          }
          .help-options {
            flex-direction: column;
            gap: 0.75rem;
          }
          .filter-chips {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 0.5rem;
          }
          .filter-chip {
            flex-shrink: 0;
          }
        }
      `}</style>
      <SpotinhoWidget />
    </>
  );
}
