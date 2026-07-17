import DocLayout from "../../../components/DocLayout";

const sections = [
  { id: "tabela-jobs", title: "Tabela de Jobs", icon: "📊" },
  { id: "status", title: "Status dos Jobs", icon: "🔄" },
  { id: "progresso", title: "Acompanhamento", icon: "📈" },
  { id: "acoes", title: "Ações", icon: "⚡" },
];

export default function JobsPage() {
  return (
    <DocLayout
      title="Acompanhamento de Jobs"
      description="Como monitorar e gerenciar seus jobs de renderização"
      sections={sections}
    >
      <section id="tabela-jobs">
        <h2>📊 Tabela de Jobs</h2>
        <p>
          A <strong>tabela de jobs</strong> na página principal do portal exibe
          todos os jobs de renderização com informações em tempo real.
        </p>

        <div className="table-description">
          <h3>Colunas da Tabela</h3>
          <table>
            <thead>
              <tr>
                <th>Coluna</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>ID</strong></td>
                <td>Identificador único do job</td>
              </tr>
              <tr>
                <td><strong>Projeto</strong></td>
                <td>Nome do projeto responsável</td>
              </tr>
              <tr>
                <td><strong>Variação</strong></td>
                <td>Identificador da variação</td>
              </tr>
              <tr>
                <td><strong>Artista</strong></td>
                <td>Profissional que enviou</td>
              </tr>
              <tr>
                <td><strong>Status</strong></td>
                <td>Estado atual do job</td>
              </tr>
              <tr>
                <td><strong>Progresso</strong></td>
                <td>Porcentagem de conclusão</td>
              </tr>
              <tr>
                <td><strong>ETA</strong></td>
                <td>Tempo estimado para conclusão</td>
              </tr>
              <tr>
                <td><strong>Ações</strong></td>
                <td>Botões de controle</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="status">
        <h2>🔄 Status dos Jobs</h2>
        <p>
          Cada job passa por diferentes estados durante seu ciclo de vida:
        </p>

        <div className="status-flow">
          <div className="status-item queued">
            <span className="status-badge">queued</span>
            <p>Job aguardando na fila</p>
          </div>
          <span className="arrow">→</span>
          <div className="status-item running">
            <span className="status-badge running">running</span>
            <p>Processando nos workers</p>
          </div>
          <span className="arrow">→</span>
          <div className="status-item completing">
            <span className="status-badge completing">completing</span>
            <p>Finalizando (≥90%)</p>
          </div>
          <span className="arrow">→</span>
          <div className="status-item completed">
            <span className="status-badge completed">completed</span>
            <p>Concluído com sucesso</p>
          </div>
        </div>

        <h3>Status Possíveis</h3>
        <div className="status-list">
          <div className="status-card queued">
            <h4>queued</h4>
            <p>Job está na fila de espera, aguardando workers disponíveis.</p>
          </div>
          <div className="status-card running">
            <h4>running</h4>
            <p>Workers estão processando o job ativamente.</p>
          </div>
          <div className="status-card completing">
            <h4>completing</h4>
            <p>Job está a 90%+ concluído, finalizando renderização.</p>
          </div>
          <div className="status-card completed">
            <h4>completed</h4>
            <p>Job concluído com sucesso. Arquivos prontos para download.</p>
          </div>
          <div className="status-card failed">
            <h4>failed</h4>
            <p>Job falhou. Verifique os logs para identificar o erro.</p>
          </div>
          <div className="status-card cancelled">
            <h4>cancelled</h4>
            <p>Job foi cancelado pelo usuário ou administrador.</p>
          </div>
        </div>
      </section>

      <section id="progresso">
        <h2>📈 Acompanhamento de Progresso</h2>
        <p>
          O progresso do job é atualizado em tempo real pelos workers.
          A atualização ocorre a cada frame concluído.
        </p>

        <h3>Informações Exibidas</h3>
        <ul>
          <li><strong>Barra de progresso</strong> - Visualização gráfica do andamento</li>
          <li><strong>Frames renderizados</strong> - Ex: "50/100 frames"</li>
          <li><strong>Porcentagem</strong> - Ex: "50%"</li>
          <li><strong>ETA</strong> - Tempo estimado para conclusão</li>
        </ul>

        <div className="tip-box">
          <h4>💡 Atualização Automática</h4>
          <p>
            A tabela atualiza automaticamente a cada <strong>15 segundos</strong>.
            Não é necessário recarregar a página.
          </p>
        </div>
      </section>

      <section id="acoes">
        <h2>⚡ Ações Disponíveis</h2>
        <p>
          Para cada job, você pode realizar as seguintes ações:
        </p>

        <div className="actions-grid">
          <div className="action-card">
            <h4>🔍 Ver Detalhes</h4>
            <p>Clique no ID do job para ver detalhes completos, incluindo logs e artefatos.</p>
          </div>
          <div className="action-card">
            <h4>⬇️ Baixar Arquivos</h4>
            <p>Quando concluído, clique no botão de download para obter os arquivos renderizados.</p>
          </div>
          <div className="action-card">
            <h4>❌ Cancelar</h4>
            <p>Clique em "Cancelar" para abortar um job em execução ou na fila.</p>
          </div>
          <div className="action-card">
            <h4>🔄 Retry</h4>
            <p>Para jobs falhados, clique em "Retry" para reenviar automaticamente.</p>
          </div>
        </div>

        <div className="warning-box">
          <h4>⚠️ Atenção</h4>
          <p>
            Jobs cancelados ou falhados <strong>não são automaticamente reenviados</strong>.
            Você deve reenviar manualmente se necessário.
          </p>
        </div>

        <div className="help-box">
          <h4>Precisa de ajuda?</h4>
          <p>
            O <strong>Spotinho</strong> pode ajudar com dúvidas sobre jobs! 😊
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
        h4 {
          font-size: 1.1rem;
          margin: 0 0 0.5rem;
          color: #475569;
        }
        p {
          line-height: 1.7;
          color: #475569;
        }
        a {
          color: #2563eb;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
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
        .status-flow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          margin: 1.5rem 0;
        }
        .status-item {
          text-align: center;
        }
        .status-item p {
          font-size: 0.8rem;
          margin: 0.5rem 0 0;
        }
        .arrow {
          color: #94a3b8;
          font-size: 1.5rem;
        }
        .status-badge {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .status-badge.queued { background: #e0f2fe; color: #0369a1; }
        .status-badge.running { background: #ede9fe; color: #6d28d9; }
        .status-badge.completing { background: #fef3c7; color: #92400e; }
        .status-badge.completed { background: #dcfce7; color: #166534; }
        .status-badge.failed { background: #fee2e2; color: #b91c1c; }
        .status-badge.cancelled { background: #f1f5f9; color: #475569; }
        .status-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }
        .status-card {
          padding: 1rem;
          border-radius: 12px;
          background: #f8fafc;
          border-left: 4px solid;
        }
        .status-card.queued { border-color: #0ea5e9; }
        .status-card.running { border-color: #8b5cf6; }
        .status-card.completing { border-color: #f59e0b; }
        .status-card.completed { border-color: #22c55e; }
        .status-card.failed { border-color: #ef4444; }
        .status-card.cancelled { border-color: #94a3b8; }
        .status-card h4 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
        }
        .status-card p {
          margin: 0;
          font-size: 0.85rem;
        }
        .tip-box, .warning-box {
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }
        .tip-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }
        .tip-box h4 {
          margin: 0 0 0.5rem;
          color: #166534;
        }
        .tip-box p {
          margin: 0;
        }
        .warning-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }
        .warning-box h4 {
          margin: 0 0 0.5rem;
          color: #b91c1c;
        }
        .warning-box p {
          margin: 0;
        }
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .action-card {
          padding: 1.25rem;
          background: #eff6ff;
          border-radius: 12px;
        }
        .action-card h4 {
          margin: 0 0 0.5rem;
          color: #1e40af;
        }
        .action-card p {
          margin: 0;
          font-size: 0.9rem;
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
