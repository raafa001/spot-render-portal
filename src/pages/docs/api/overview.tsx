import DocLayout from "../../../components/DocLayout";

const sections = [
  { id: "overview", title: "Visão Geral", icon: "📡" },
  { id: "autenticacao", title: "Autenticação", icon: "🔐" },
  { id: "endpoints", title: "Endpoints", icon: "🔗" },
  { id: "rate-limits", title: "Rate Limits", icon: "⚡" },
  { id: "webhooks", title: "Webhooks", icon: "🪝" },
];

export default function ApiOverviewPage() {
  return (
    <DocLayout
      title="API REST - Visão Geral"
      description="Referência completa da API do Spot Render"
      sections={sections}
    >
      <section id="overview">
        <h2>📡 Visão Geral</h2>
        <p>
          A API do Spot Render é um serviço <strong>FastAPI</strong> que expõe
          endpoints REST para gerenciamento de jobs, uploads, projetos e estatísticas.
        </p>

        <div className="info-box">
          <h4>🔗 Base URL</h4>
          <pre>http://api.spot-render.local</pre>
          <p>Em produção, use o endpoint configurado no seu ambiente.</p>
        </div>

        <h3>Características</h3>
        <ul>
          <li><strong>RESTful</strong> - Interface REST padrão</li>
          <li><strong>JSON</strong> - Todos os requests e responses em JSON</li>
          <li><strong>OpenAPI</strong> - Documentação automática em /docs</li>
          <li><strong>CORS</strong> - Suporte a cross-origin requests</li>
          <li><strong>Prometheus</strong> - Métricas em /metrics</li>
        </ul>
      </section>

      <section id="autenticacao">
        <h2>🔐 Autenticação</h2>
        <p>
          A API utiliza <strong>autenticação básica</strong> (Basic Auth) para
          endpoints administrativos e <strong>tokens de API</strong> para
          integração contínua.
        </p>

        <h3>Headers</h3>
        <pre>{`Content-Type: application/json
Authorization: Bearer <seu_token>
# ou
Authorization: Basic <base64(username:password)>`}</pre>

        <div className="warning-box">
          <h4>⚠️ Segurança</h4>
          <p>
            Nunca exponha tokens de API em código cliente (front-end).
            Use apenas em servidores e scripts de automação.
          </p>
        </div>
      </section>

      <section id="endpoints">
        <h2>🔗 Endpoints Principais</h2>

        <div className="endpoints-list">
          <div className="endpoint-group">
            <h3>📤 Uploads</h3>
            <table>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Rota</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>POST</code></td>
                  <td>/uploads</td>
                  <td>Enviar arquivo 3D</td>
                </tr>
                <tr>
                  <td><code>GET</code></td>
                  <td>/uploads/{`{id}`}</td>
                  <td>Status do upload</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="endpoint-group">
            <h3>📋 Jobs</h3>
            <table>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Rota</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>GET</code></td>
                  <td>/jobs</td>
                  <td>Listar jobs</td>
                </tr>
                <tr>
                  <td><code>GET</code></td>
                  <td>/jobs/{`{id}`}</td>
                  <td>Detalhes do job</td>
                </tr>
                <tr>
                  <td><code>PATCH</code></td>
                  <td>/jobs/{`{id}`}/progress</td>
                  <td>Atualizar progresso</td>
                </tr>
                <tr>
                  <td><code>POST</code></td>
                  <td>/jobs/{`{id}`}/cancel</td>
                  <td>Cancelar job</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="endpoint-group">
            <h3>📁 Projetos</h3>
            <table>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Rota</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>GET</code></td>
                  <td>/projects</td>
                  <td>Listar projetos</td>
                </tr>
                <tr>
                  <td><code>GET</code></td>
                  <td>/projects/{`{name}`}</td>
                  <td>Detalhes do projeto</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="endpoint-group">
            <h3>📊 Estatísticas</h3>
            <table>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Rota</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>GET</code></td>
                  <td>/jobs/statistics/summary</td>
                  <td>Resumo de estatísticas</td>
                </tr>
                <tr>
                  <td><code>GET</code></td>
                  <td>/jobs/statistics/daily</td>
                  <td>Estatísticas diárias</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="rate-limits">
        <h2>⚡ Rate Limits</h2>
        <p>
          Para garantir a estabilidade do serviço, aplicamos rate limits:
        </p>

        <table className="limits-table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Limite</th>
              <th>Janela</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>/uploads</td>
              <td>10 requests</td>
              <td>por minuto</td>
            </tr>
            <tr>
              <td>/jobs (list)</td>
              <td>60 requests</td>
              <td>por minuto</td>
            </tr>
            <tr>
              <td>/jobs/{`{id}`}/progress</td>
              <td>120 requests</td>
              <td>por minuto</td>
            </tr>
            <tr>
              <td>Outros</td>
              <td>100 requests</td>
              <td>por minuto</td>
            </tr>
          </tbody>
        </table>

        <p>
          Se o limite for excedido, a API retorna <code>429 Too Many Requests</code>.
        </p>
      </section>

      <section id="webhooks">
        <h2>🪝 Webhooks</h2>
        <p>
          Configure webhooks para receber notificações em tempo real sobre
          eventos de jobs.
        </p>

        <h3>Configuração</h3>
        <pre>{`POST /webhooks
{
  "url": "https://seu-servidor.com/webhook",
  "events": ["job.completed", "job.failed"],
  "secret": "sua_chave_secreta"
}`}</pre>

        <h3>Eventos Disponíveis</h3>
        <ul>
          <li><code>job.created</code> - Novo job criado</li>
          <li><code>job.started</code> - Job começou a processar</li>
          <li><code>job.progress</code> - Progresso atualizado</li>
          <li><code>job.completed</code> - Job concluído</li>
          <li><code>job.failed</code> - Job falhou</li>
          <li><code>job.cancelled</code> - Job cancelado</li>
        </ul>

        <h3>Payload</h3>
        <pre>{`{
  "event": "job.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "job_id": "abc123",
    "project": "sky-tower",
    "artist": "joao.silva",
    "frames_total": 100,
    "frames_rendered": 100
  },
  "signature": "sha256=..."
}`}</pre>

        <div className="help-box">
          <h4>Precisa de ajuda?</h4>
          <p>
            O <strong>Spotinho</strong> pode ajudar com integração! 😊
          </p>
        </div>
      </section>

      <style jsx>{`
        section {
          margin-bottom: 3rem;
        }
        h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          color: #1e40af;
        }
        h3 {
          font-size: 1.3rem;
          margin: 1.5rem 0 0.75rem;
          color: #0f172a;
        }
        p {
          line-height: 1.7;
          color: #475569;
        }
        ul {
          color: #475569;
          line-height: 1.8;
        }
        li {
          margin-bottom: 0.5rem;
        }
        code {
          background: #e2e8f0;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.85em;
        }
        .info-box, .warning-box {
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }
        .info-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }
        .info-box h4 {
          margin: 0 0 0.75rem;
          color: #1e40af;
        }
        .warning-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }
        .warning-box h4 {
          margin: 0 0 0.75rem;
          color: #b91c1c;
        }
        pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.85rem;
          margin: 1rem 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        th, td {
          text-align: left;
          padding: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
        }
        .endpoints-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .endpoint-group h3 {
          margin-bottom: 0.75rem;
        }
        .endpoint-group table {
          margin: 0;
        }
        .limits-table td:first-child {
          font-family: monospace;
        }
        .help-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
          border: 1px solid #fcd34d;
          border-radius: 16px;
          padding: 1.5rem;
          margin-top: 2rem;
        }
        .help-box h4 {
          margin: 0 0 0.5rem;
          color: #92400e;
        }
        .help-box p {
          margin: 0;
          color: #a16207;
        }
      `}</style>
    </DocLayout>
  );
}
