import DocLayout from "../../../components/DocLayout";

const sections = [
  { id: "dashboard", title: "Dashboard", icon: "📊" },
  { id: "filtros", title: "Filtros", icon: "🔍" },
  { id: "metricas", title: "Métricas", icon: "📈" },
];

export default function StatsPage() {
  return (
    <DocLayout
      title="Estatísticas do Portal"
      description="Métricas e dashboards de acompanhamento"
      sections={sections}
    >
      <section id="dashboard">
        <h2>📊 Dashboard de Estatísticas</h2>
        <p>
          O portal exibe um <strong>dashboard completo</strong> com métricas
          de renderização em tempo real. Acesse em
          <a href="/statistics">/statistics</a>.
        </p>

        <div className="dashboard-preview">
          <h3>Cards Principais</h3>
          <div className="cards-grid">
            <div className="stat-card primary">
              <h4>Total de Jobs</h4>
              <span className="big-number">0</span>
              <p>concluídos / falhados / cancelados</p>
            </div>
            <div className="stat-card">
              <h4>Taxa de Sucesso</h4>
              <span className="big-number success">0%</span>
            </div>
            <div className="stat-card">
              <h4>Tempo Médio</h4>
              <span className="big-number">0m</span>
              <p>por job concluído</p>
            </div>
            <div className="stat-card">
              <h4>Jobs Ativos</h4>
              <span className="big-number">0</span>
              <p>em execução / na fila</p>
            </div>
          </div>
        </div>
      </section>

      <section id="filtros">
        <h2>🔍 Filtros</h2>
        <p>
          Use filtros para segmentar as estatísticas:
        </p>

        <div className="filters-list">
          <div className="filter-item">
            <h3>Período</h3>
            <ul>
              <li><strong>Hoje</strong> - Últimas 24 horas</li>
              <li><strong>Últimos 7 dias</strong> - Semana atual</li>
              <li><strong>Últimos 30 dias</strong> - Mês atual</li>
              <li><strong>Últimos 90 dias</strong> - Trimestre</li>
              <li><strong>Personalizado</strong> - Intervalo definido</li>
            </ul>
          </div>
          <div className="filter-item">
            <h3>Projeto</h3>
            <p>
              Filtrar por nome do projeto específico.
              Deixe vazio para ver todos.
            </p>
          </div>
          <div className="filter-item">
            <h3>Artista</h3>
            <p>
              Filtrar por profissional responsável.
              Útil para análise individual.
            </p>
          </div>
        </div>
      </section>

      <section id="metricas">
        <h2>📈 Métricas Disponíveis</h2>

        <h3>Jobs por Status</h3>
        <p>
          Gráfico de barras mostrando distribuição de jobs por status:
          queued, running, completed, failed, cancelled.
        </p>

        <h3>Jobs por Projeto</h3>
        <p>
          Ranking de projetos por volume de jobs.
          Útil para identificar projetos mais ativos.
        </p>

        <h3>Jobs por Artista</h3>
        <p>
          Ranking de artistas por quantidade de jobs enviados.
          Top 10 artists exibido.
        </p>

        <h3>Evolução Diária</h3>
        <p>
          Gráfico de barras empilhadas mostrando evolução de jobs
          ao longo do tempo, com breakdown por status.
        </p>

        <h3>Arquivos Renderizados</h3>
        <ul>
          <li><strong>Total de arquivos</strong> - Quantidade processada</li>
          <li><strong>Com sucesso</strong> - Renderizados corretamente</li>
          <li><strong>Com falha</strong> - Erros no processamento</li>
        </ul>

        <div className="tip-box">
          <h4>💡 Atualização</h4>
          <p>
            As estatísticas são atualizadas <strong>a cada 15 segundos</strong>
            quando a página está aberta.
          </p>
        </div>

        <div className="help-box">
          <h4>Precisa de ajuda?</h4>
          <p>
            O <strong>Spotinho</strong> pode ajudar com dúvidas sobre estatísticas! 😊
          </p>
          <p>
            <a href="/docs/api/overview">Veja também a API REST →</a>
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
        ul {
          color: #475569;
          line-height: 1.8;
        }
        li {
          margin-bottom: 0.5rem;
        }
        a {
          color: #2563eb;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .dashboard-preview {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-card.primary {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
        }
        .stat-card h4 {
          margin: 0 0 0.5rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          opacity: 0.8;
        }
        .big-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
        }
        .big-number.success {
          color: #22c55e;
        }
        .stat-card p {
          margin: 0.5rem 0 0;
          font-size: 0.8rem;
          opacity: 0.9;
        }
        .filters-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .filter-item {
          padding: 1rem;
          background: #eff6ff;
          border-radius: 12px;
        }
        .filter-item h3 {
          margin: 0 0 0.5rem;
          color: #1e40af;
        }
        .filter-item p {
          margin: 0;
        }
        .tip-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }
        .tip-box h4 {
          margin: 0 0 0.5rem;
          color: #166534;
        }
        .tip-box p {
          margin: 0;
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
          margin: 0 0 0.5rem;
          color: #a16207;
        }
      `}</style>
    </DocLayout>
  );
}
