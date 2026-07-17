import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import SpotinhoWidget from "./SpotinhoWidget";

interface DocLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  sections?: { id: string; title: string; icon: string }[];
}

const quickLinks = [
  { title: "Status do Sistema", href: "/status", icon: "📊" },
  { title: "Estatísticas", href: "/statistics", icon: "📈" },
  { title: "Enviar Job", href: "/#upload-card", icon: "⬆️" },
  { title: "Ver Jobs", href: "/#jobs", icon: "📋" },
];

export default function DocLayout({ title, description, children, sections }: DocLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Head>
        <title>{title} - Spot Render TechDocs</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <div className="doc-page">
        <header className="doc-header">
          <div className="doc-header-content">
            <Link href="/" className="back-link">← Voltar ao Portal</Link>
            <Link href="/docs" className="docs-link">📚 TechDocs</Link>
            <h1>{title}</h1>
            {description && <p className="doc-description">{description}</p>}
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

        <div className="doc-layout">
          {sections && sections.length > 0 && (
            <aside className="doc-sidebar">
              <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? "←" : "→"}
              </button>
              {sidebarOpen && (
                <nav className="sidebar-nav">
                  <h3>Nesta página</h3>
                  <ul>
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a href={`#${section.id}`}>
                          <span>{section.icon}</span> {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="sidebar-back">
                    <Link href="/docs">← Voltar ao índice</Link>
                  </div>
                </nav>
              )}
            </aside>
          )}

          <main className="doc-content">
            <article className="doc-article">
              {children}
            </article>
          </main>
        </div>
      </div>

      <SpotinhoWidget />

      <style jsx global>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: "Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f8fafc;
          color: #0f172a;
        }
      `}</style>

      <style jsx>{`
        .doc-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%);
        }

        .doc-header {
          background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
          color: white;
          padding: 2rem 1.5rem;
        }

        .doc-header-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-link, .docs-link {
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-block;
          margin-right: 1rem;
        }

        .back-link:hover, .docs-link:hover {
          color: white;
        }

        .doc-header h1 {
          margin: 1rem 0 0.5rem;
          font-size: 2.2rem;
        }

        .doc-description {
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

        .doc-layout {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem 3rem;
          display: flex;
          gap: 2rem;
        }

        .doc-sidebar {
          flex-shrink: 0;
          width: 220px;
          position: sticky;
          top: 2rem;
          height: fit-content;
        }

        .sidebar-toggle {
          display: none;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          margin-bottom: 0.5rem;
        }

        .sidebar-nav {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .sidebar-nav h3 {
          margin: 0 0 1rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-nav a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 8px;
          text-decoration: none;
          color: #0f172a;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .sidebar-nav a:hover {
          background: #eff6ff;
        }

        .sidebar-back {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .sidebar-back a {
          color: #2563eb;
          font-size: 0.85rem;
        }

        .doc-content {
          flex: 1;
          min-width: 0;
        }

        .doc-article {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        @media (max-width: 768px) {
          .doc-layout {
            flex-direction: column;
          }
          .doc-sidebar {
            width: 100%;
          }
          .sidebar-toggle {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
