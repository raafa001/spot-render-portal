import Head from "next/head";
import Link from "next/link";
import UploadForm from "../components/UploadForm";
import JobsTable from "../components/JobsTable";
import HealthBanner from "../components/HealthBanner";
import SpotinhoWidget from "../components/SpotinhoWidget";

export default function Home() {
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
              <HealthBanner />
              <div className="hero__metrics">
                <div>
                  <span>Jobs ativos</span>
                  <strong>12</strong>
                  <small>Atualização a cada 15s</small>
                </div>
                <div>
                  <span>Tempo médio</span>
                  <strong>8m 21s</strong>
                  <small>Últimos 50 envios</small>
                </div>
                <div>
                  <span>Economia Spot</span>
                  <strong>31%</strong>
                  <small>vs. on-demand</small>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          <section className="feature-grid">
            <article>
              <h3>Upload seguro</h3>
              <p>Listas e arquivos ficam confinados nas rotas do projeto. Nada é sincronizado fora do cluster local.</p>
            </article>
            <article>
              <h3>Observabilidade pronta</h3>
              <p>Alertas de canary, dashboards e métricas Kubernetes já versionados no repo de observabilidade.</p>
            </article>
            <article>
              <h3>FinOps-first</h3>
              <p>Workers usam spot + lifecycle S3 para reduzir custos sem abrir mão de velocidade.</p>
            </article>
          </section>

          <section className="grid grid--two">
            <article className="panel" id="upload-card">
              <div className="panel__header">
                <div>
                  <p className="eyebrow">Submit</p>
                  <h2>Enviar novo job</h2>
                </div>
                <p>Defina projeto, variação e anexos. Notificações opcionais para liberar o time.</p>
              </div>
              <UploadForm />
            </article>

            <aside className="panel tips">
              <h3>Playbook rápido</h3>
              <ul>
                <li><strong>Hosts:</strong> `spot-render.local` + `api.spot-render.local` no /etc/hosts</li>
                <li><strong>Storage:</strong> `/tmp/spot-render-storage/shared` com PVC persistente</li>
                <li><strong>Port-forward:</strong> `kubectl -n spot-render port-forward svc/spot-render-web-stable 8081:80`</li>
                <li><strong>Saída:</strong> todos os renders são exportados em PNG automaticamente</li>
                <li><strong>CLI:</strong> exporte `STORAGE_MODE=local` para enviar lotes direto da estação</li>
              </ul>
            </aside>
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
