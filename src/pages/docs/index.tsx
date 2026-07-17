import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import SpotinhoWidget from "../../components/SpotinhoWidget";

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  links: { title: string; href: string; description: string }[];
}

const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Primeiros Passos",
    description: "Tudo que você precisa para começar",
    icon: "🚀",
    links: [
      { title: "Introdução ao Spot Render", href: "/docs/intro", description: "Conheça a plataforma" },
      { title: "Configuração Rápida", href: "/docs/quickstart", description: "Configure em 5 minutos" },
      { title: "Conceitos Básicos", href: "/docs/basics", description: "Jobs, renderização, filas" },
      { title: "Perguntas Frequentes", href: "/docs/faq", description: "FAQ com dúvidas comuns" },
    ],
  },
  {
    id: "portal",
    title: "Portal Web",
    description: "Interface visual para gestão de renders",
    icon: "🖥️",
    links: [
      { title: "Upload de Arquivos", href: "/docs/portal/upload", description: "Como enviar arquivos" },
      { title: "Acompanhamento de Jobs", href: "/docs/portal/jobs", description: "Monitore suas renderizações" },
      { title: "Estatísticas", href: "/docs/portal/stats", description: "Métricas e dashboards" },
      { title: "Notificações", href: "/docs/portal/notifications", description: "Alertas por email" },
    ],
  },
  {
    id: "api",
    title: "API REST",
    description: "Integração programática",
    icon: "⚡",
    links: [
      { title: "Visão Geral", href: "/docs/api/overview", description: "Autenticação, rate limits" },
      { title: "Endpoints", href: "/docs/api/endpoints", description: "Lista completa" },
      { title: "Exemplos", href: "/docs/api/examples", description: "cURL, Python, JavaScript" },
      { title: "Webhooks", href: "/docs/api/webhooks", description: "Notificações em tempo real" },
    ],
  },
  {
    id: "cli",
    title: "CLI",
    description: "Linha de comando para automação",
    icon: "💻",
    links: [
      { title: "Instalação", href: "/docs/cli/install", description: "npm install -g spotrender-cli" },
      { title: "Comandos", href: "/docs/cli/commands", description: "submit, status, cancel" },
      { title: "Configuração", href: "/docs/cli/config", description: "Config file, tokens" },
      { title: "Exemplos", href: "/docs/cli/examples", description: "Scripts de automação" },
    ],
  },
  {
    id: "converters",
    title: "Conversores",
    description: "Formatos 3D suportados e conversão",
    icon: "🔄",
    links: [
      { title: "Formatos Aceitos", href: "/docs/converters/formats", description: ".fbx, .obj, .blend, etc" },
      { title: "Conversão Maya", href: "/docs/converters/maya", description: ".ma, .mb → .fbx" },
      { title: "Conversão 3ds Max", href: "/docs/converters/3dsmax", description: ".max → .fbx" },
      { title: "Blender", href: "/docs/converters/blender", description: ".blend direto" },
    ],
  },
  {
    id: "workers",
    title: "Workers",
    description: "Processamento distribuído",
    icon: "⚙️",
    links: [
      { title: "Arquitetura", href: "/docs/workers/architecture", description: "Como funciona" },
      { title: "Deploy Kubernetes", href: "/docs/workers/k8s", description: "kubectl, helm" },
      { title: "Spot Instances", href: "/docs/workers/spot", description: "Economia com AWS Spot" },
      { title: "Monitoramento", href: "/docs/workers/monitoring", description: "Prometheus, Grafana" },
    ],
  },
  {
    id: "infra",
    title: "Infraestrutura",
    description: "Terraform, AWS, karpenter",
    icon: "☁️",
    links: [
      { title: "Terraform Modules", href: "/docs/infra/terraform", description: "EKS, S3, RDS" },
      { title: "Karpenter", href: "/docs/infra/karpenter", description: "Autoscaling" },
      { title: "S3 Storage", href: "/docs/infra/storage", description: "Input/Output buckets" },
      { title: "Secrets", href: "/docs/infra/secrets", description: "AWS Secrets Manager" },
    ],
  },
  {
    id: "integrations",
    title: "Integrações",
    description: "Conecte com outras ferramentas",
    icon: "🔗",
    links: [
      { title: "Slack", href: "/docs/integrations/slack", description: "Notificações" },
      { title: "GitHub Actions", href: "/docs/integrations/github", description: "CI/CD" },
      { title: "Jira", href: "/docs/integrations/jira", description: "Tickets automáticos" },
      { title: "Argo Workflows", href: "/docs/integrations/argo", description: "Orquestração" },
    ],
  },
  {
    id: "security",
    title: "Segurança",
    description: "Boas práticas e compliance",
    icon: "🔒",
    links: [
      { title: "Autenticação", href: "/docs/security/auth", description: "OAuth, tokens" },
      { title: "Criptografia", href: "/docs/security/encryption", description: "Dados em repouso e trânsito" },
      { title: "IAM Roles", href: "/docs/security/iam", description: "Políticas AWS" },
      { title: "Audit Log", href: "/docs/security/audit", description: "Logs de auditoria" },
    ],
  },
  {
    id: "repositories",
    title: "Repositórios",
    description: "Código fonte e organizações",
    icon: "📦",
    links: [
      { title: "spot-render", href: "https://github.com/raafa001/spot-render", description: "Core da aplicação" },
      { title: "spot-render-api", href: "https://github.com/raafa001/spot-render-api", description: "Backend FastAPI" },
      { title: "spot-render-portal", href: "https://github.com/raafa001/spot-render-portal", description: "Frontend Next.js" },
      { title: "spot-render-cli", href: "https://github.com/raafa001/spot-render-cli", description: "CLI tool" },
      { title: "spot-render-infra-aws", href: "https://github.com/raafa001/spot-render-infra-aws", description: "Terraform IaC" },
      { title: "spot-render-observability", href: "https://github.com/raafa001/spot-render-observability", description: "Dashboards" },
    ],
  },
];

const quickLinks = [
  { title: "Status do Sistema", href: "/status", icon: "📊" },
  { title: "Estatísticas", href: "/statistics", icon: "📈" },
  { title: "Enviar Job", href: "/#upload-card", icon: "⬆️" },
  { title: "Ver Jobs", href: "/#jobs", icon: "📋" },
];

export default function TechDocs() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

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
              <div className="search-placeholder">
                🔍 <span>Buscar documentação...</span>
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

        .search-placeholder {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.75rem;
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
        }
      `}</style>
      <SpotinhoWidget />
    </>
  );
}
