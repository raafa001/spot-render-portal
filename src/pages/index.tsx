import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import UploadForm from "../components/UploadForm";
import JobsTable from "../components/JobsTable";
import SpotinhoWidget from "../components/SpotinhoWidget";

interface QuickStats {
  total: number;
  running: number;
  completed: number;
}

export default function Home() {
  const [stats, setStats] = useState<QuickStats>({ total: 0, running: 0, completed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const api = process.env.NEXT_PUBLIC_API_URL;
      if (!api) return;
      try {
        const res = await axios.get<{ jobs: QuickStats }>(`${api}/jobs/statistics/summary`);
        setStats(res.data.jobs);
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Spot Render Portal</title>
        <meta name="description" content="Envie jobs de renderização e acompanhe o progresso em um painel bonito e responsivo." />
      </Head>
      <div className="page">
        <header className="hero">
          <div className="hero__nav">
            <div className="brand">Spot Render</div>
            <div className="hero__links">
              <Link href="/statistics">Estatísticas</Link>
              <a href="https://github.com/raafa001/spot-render" target="_blank" rel="noreferrer">
                Repositórios
              </a>
              <Link href="/docs">
                TechDocs
              </Link>
              <button onClick={() => document.getElementById("upload-card")?.scrollIntoView({ behavior: "smooth" })}>Enviar job</button>
            </div>
          </div>

          <div className="hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">Render orchestration • Spot + FinOps</p>
              <h1>Build powerful renders fast</h1>
              <p>
                Render lists seguras, workers em spot instances e um painel que funciona em qualquer dispositivo. Faça upload, acompanhe e receba alertas de forma simples.
              </p>
              <div className="hero__actions">
                <button className="primary" onClick={() => document.getElementById("upload-card")?.scrollIntoView({ behavior: "smooth" })}>
                  Começar agora
                </button>
                <a href="https://spot-render.local/docs" target="_blank" rel="noreferrer">
                  Ver documentação →
                </a>
              </div>
              <ul className="hero__badges">
                <li>Workers em spot + autoscaling</li>
                <li>Uploads criptografados</li>
                <li>Portal, CLI e API alinhados</li>
              </ul>
            </div>

            <div className="hero__panel">
              <div className="hero__welcome">
                <h3>Bem-vindo ao Spot Render! 🎨</h3>
                <p>Plataforma de renderização 3D colaborativa para estúdios e artistas.</p>
                <div className="hero__metrics">
                  <div className="metric">
                    <strong>{stats.total}</strong>
                    <span>Total Jobs</span>
                  </div>
                  <div className="metric">
                    <strong>{stats.running}</strong>
                    <span>Em Execução</span>
                  </div>
                  <div className="metric">
                    <strong>{stats.completed}</strong>
                    <span>Concluídos</span>
                  </div>
                </div>
                <div className="hero__quick-actions">
                  <Link href="/docs" className="quick-action">
                    📚 Ver documentação
                  </Link>
                  <Link href="/statistics" className="quick-action">
                    📊 Estatísticas
                  </Link>
                  <a href="/chat" className="quick-action spotinho-action">
                    🤖 Falar com Spotinho
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Submit</p>
                <h2>Enviar novo job</h2>
              </div>
              <p>Defina projeto, variação e anexos. Notificações opcionais para liberar o time.</p>
            </div>
            <UploadForm />
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Monitoramento</p>
                <h2>Jobs em andamento</h2>
              </div>
              <p>Status, progresso e locais de armazenamento atualizam automaticamente.</p>
            </div>
            <JobsTable />
          </section>
        </main>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: radial-gradient(circle at top, #dbeafe, #f8fafc 45%);
          padding-bottom: 4rem;
        }

        .hero {
          padding: 2.5rem 1.5rem 3rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero__nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2.5rem;
        }

        .brand {
          font-weight: 700;
          font-size: 1.2rem;
          letter-spacing: 0.02em;
        }

        .hero__links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .hero__links a {
          color: #0f172a;
          text-decoration: none;
          font-weight: 500;
        }

        .hero__links button {
          border: none;
          padding: 0.6rem 1.4rem;
          border-radius: 999px;
          background: #0f172a;
          color: #fff;
          cursor: pointer;
        }

        .hero__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          align-items: center;
        }

        .hero__copy h1 {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          margin: 0 0 1rem;
        }

        .hero__copy p {
          font-size: 1.05rem;
          color: #475569;
        }

        .eyebrow {
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          color: #6b7280;
          margin-bottom: 0.6rem;
        }

        .hero__actions {
          margin: 1.5rem 0;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        .hero__actions .primary {
          border: none;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          color: #fff;
          padding: 0.85rem 1.75rem;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 20px 40px rgba(37, 99, 235, 0.25);
        }

        .hero__actions a {
          font-weight: 600;
          color: #0f172a;
        }

        .hero__badges {
          list-style: none;
          padding: 0;
          margin: 1.5rem 0 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .hero__badges li {
          padding: 0.5rem 1rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          color: #0f172a;
        }

        .hero__panel {
          background: #fff;
          border-radius: 24px;
          padding: 1.5rem;
          box-shadow: 0 35px 80px rgba(15, 23, 42, 0.12);
        }

        .hero__metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .hero__metrics span {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
        }

        .hero__metrics strong {
          display: block;
          font-size: 1.5rem;
          color: #0f172a;
        }

        .hero__metrics small {
          color: #94a3b8;
        }

        .metric {
          text-align: center;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 12px;
        }

        .hero__welcome {
          text-align: center;
          padding: 1rem 0;
        }

        .hero__welcome h3 {
          margin: 0 0 0.75rem;
          font-size: 1.3rem;
          color: #1e40af;
        }

        .hero__welcome p {
          margin: 0 0 1.5rem;
          color: #64748b;
          font-size: 0.95rem;
        }

        .hero__quick-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .quick-action {
          display: block;
          padding: 0.75rem 1rem;
          background: #eff6ff;
          border-radius: 10px;
          color: #1e40af;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.2s;
        }

        .quick-action:hover {
          background: #dbeafe;
        }

        .quick-action.spotinho-action {
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          color: white;
        }

        .quick-action.spotinho-action:hover {
          background: linear-gradient(135deg, #6d28d9 0%, #1d4ed8 100%);
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .feature-grid article {
          padding: 1.25rem;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e2e8f0;
        }

        .grid {
          display: grid;
          gap: 1.5rem;
        }

        .grid--two {
          grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr);
        }

        .panel {
          background: #fff;
          border-radius: 24px;
          padding: 1.75rem;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08);
        }

        .panel__header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .panel__header h2 {
          margin: 0;
          font-size: 1.6rem;
        }

        .panel__header p {
          margin: 0;
          color: #475569;
        }

        .tips ul {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin: 1rem 0 0;
        }

        .tips li {
          color: #46556c;
          font-weight: 500;
        }

        code {
          background: #e2e8f0;
          padding: 0.15rem 0.4rem;
          border-radius: 6px;
        }

        @media (max-width: 960px) {
          .hero__nav {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .grid--two {
            grid-template-columns: 1fr;
          }
          .panel__header {
            flex-direction: column;
          }
        }

        @media (max-width: 640px) {
          .panel,
          .hero__panel {
            padding: 1.25rem;
          }
        }
      `}</style>

      <style jsx global>{`
        body {
          margin: 0;
          font-family: "Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f8fafc;
          color: #0f172a;
        }

        * {
          box-sizing: border-box;
        }

        ::selection {
          background: rgba(37, 99, 235, 0.2);
        }
      `}</style>
      <SpotinhoWidget />
    </>
  );
}
