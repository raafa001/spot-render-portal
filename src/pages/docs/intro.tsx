import Head from "next/head";
import Link from "next/link";
import DocLayout from "../../components/DocLayout";
import SpotinhoWidget from "../../components/SpotinhoWidget";

const sections = [
  { id: "o-que-e", title: "O que é o Spot Render", icon: "🎯" },
  { id: "primeiros-passos", title: "Primeiros Passos", icon: "🚀" },
  { id: "conceitos", title: "Conceitos Fundamentais", icon: "📚" },
  { id: "arquitetura", title: "Arquitetura", icon: "🏗️" },
  { id: "faq", title: "Perguntas Frequentes", icon: "❓" },
];

export default function IntroPage() {
  return (
    <>
      <DocLayout
        title="Introdução ao Spot Render"
        description="Conheça a plataforma de orquestração de renderização 3D"
        sections={sections}
      >
        <section id="o-que-e">
          <h2>🎯 O que é o Spot Render?</h2>
          <p>
            O <strong>Spot Render</strong> é uma plataforma de orquestração de renderização 3D
            desenvolvida para estúdios e profissionais de visualização. A plataforma gerencia
            jobs de renderização utilizando <strong>AWS Spot Instances</strong> para reduzir
            custos em até <strong>70%</strong> comparado a instâncias on-demand.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <h3>⚡ Renderização Rápida</h3>
              <p>Workers em spot instances com autoscaling automático</p>
            </div>
            <div className="feature-card">
              <h3>💰 FinOps First</h3>
              <p>Economia inteligente com instâncias spot e lifecycle S3</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Seguro</h3>
              <p>Arquivos criptografados, render lists isoladas por projeto</p>
            </div>
            <div className="feature-card">
              <h3>📊 Observável</h3>
              <p>Métricas Prometheus, alertas e dashboards Grafana</p>
            </div>
          </div>
        </section>

        <section id="primeiros-passos">
          <h2>🚀 Primeiros Passos</h2>
          <p>Siga estes passos para começar a usar o Spot Render:</p>

          <ol className="steps-list">
            <li>
              <strong>Acesse o Portal</strong>
              <p>Navegue até <Link href="/">http://spot-render.local/</Link> e faça login com suas credenciais.</p>
            </li>
            <li>
              <strong>Prepare seus arquivos</strong>
              <p>
                Prepare sua cena 3D em um formato aceito (.fbx, .obj, .blend) e a render list
                correspondente (CSV ou XLSX).
              </p>
            </li>
            <li>
              <strong>Envie um Job</strong>
              <p>
                Na seção Enviar novo job, selecione os arquivos, escolha o projeto,
                variação e artista responsável.
              </p>
            </li>
            <li>
              <strong>Acompanhe o progresso</strong>
              <p>
                Monitore o andamento na tabela de jobs. Você receberá notificações por email
                quando o render for concluído.
              </p>
            </li>
          </ol>
        </section>

        <section id="conceitos">
          <h2>📚 Conceitos Fundamentais</h2>

          <h3>Job</h3>
          <p>
            Um <strong>job</strong> representa uma requisição de renderização. Cada job possui:
          </p>
          <ul>
            <li><strong>ID único</strong> - identificador do job</li>
            <li><strong>Status</strong> - queued, running, completed, failed, cancelled</li>
            <li><strong>Progresso</strong> - porcentaje de frames renderizados</li>
            <li><strong>Metadados</strong> - projeto, variação, artista</li>
          </ul>

          <h3>Render List</h3>
          <p>
            A <strong>render list</strong> é um arquivo CSV ou XLSX que define quais
            frames devem ser renderizados. Cada linha contém:
          </p>
          <ul>
            <li>Nome do arquivo da cena</li>
            <li>Frame inicial e final</li>
            <li>Parâmetros adicionais (resolução, qualidade, etc.)</li>
          </ul>

          <h3>Worker</h3>
          <p>
            Workers são pods Kubernetes que processam os jobs de renderização.
            Utilizam <strong>Spot Instances</strong> para economia, com fallback para
            on-demand quando necessário.
          </p>

          <h3>Projeto</h3>
          <p>
            Cada render é associado a um <strong>projeto</strong>, que define:
          </p>
          <ul>
            <li>Bucket S3 de entrada/saída</li>
            <li>Repositório Git de controle</li>
            <li>Configurações específicas de renderização</li>
          </ul>
        </section>

        <section id="arquitetura">
          <h2>🏗️ Arquitetura</h2>

          <p>O Spot Render é composto por múltiplos microserviços:</p>

          <div className="architecture-diagram">
            <div className="component">
              <h4>Portal (Next.js)</h4>
              <p>Interface web para upload e monitoramento</p>
              <code>spot-render-portal</code>
            </div>
            <div className="component">
              <h4>API (FastAPI)</h4>
              <p>Backend REST com endpoints de jobs e uploads</p>
              <code>spot-render-api</code>
            </div>
            <div className="component">
              <h4>Workers (Python)</h4>
              <p>Processamento de renders em Kubernetes</p>
              <code>spot-render</code>
            </div>
            <div className="component">
              <h4>CLI (Node.js)</h4>
              <p>Ferramenta de linha de comando</p>
              <code>spot-render-cli</code>
            </div>
          </div>

          <h3>Fluxo de Dados</h3>
          <pre>{`Upload → API → S3 Input → Workers → S3 Output → Notificação`}</pre>
        </section>

        <section id="faq">
          <h2>❓ Perguntas Frequentes</h2>

          <div className="faq-item">
            <h4>Quanto custa usar o Spot Render?</h4>
            <p>
              O custo depende do tempo de renderização. Utilizando Spot Instances,
              o custo é aproximadamente <strong>70% menor</strong> que instâncias
              on-demand. Veja as <Link href="/statistics">estatísticas</Link> para
              métricas detalhadas.
            </p>
          </div>

          <div className="faq-item">
            <h4>Quais formatos são aceitos?</h4>
            <p>
              Formatos aceitos diretamente: <strong>.fbx, .obj, .blend, .gltf, .3ds, .stl</strong>.
              Formatos que requerem conversão: <strong>.max, .ma, .mb, .ms</strong>.
              <Link href="/docs/converters/formats"> Veja a documentação completa</Link>.
            </p>
          </div>

          <div className="faq-item">
            <h4>Posso cancelar um job?</h4>
            <p>
              Sim! Você pode cancelar jobs que ainda estão na fila ou em execução.
              Acesse a tabela de jobs e clique no botão de cancelar.
            </p>
          </div>

          <div className="faq-item">
            <h4>Como recebo notificações?</h4>
            <p>
              Ao enviar um job, marque a opção Desejo receber um aviso no email.
              Você receberá uma notificação quando o render for concluído ou se
              houver falhas.
            </p>
          </div>

          <div className="help-box">
            <h4>Precisa de ajuda?</h4>
            <p>
              O <strong>Spotinho</strong> pode ajudar com suas dúvidas! Clique no
              chat no canto inferior direito para conversar. 😊
            </p>
            <Link href="/docs">Veja toda a documentação →</Link>
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
            margin: 1rem 0 0.5rem;
            color: #475569;
          }
          p {
            line-height: 1.7;
            color: #475569;
          }
          ul, ol {
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
          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
          }
          .feature-card {
            background: #eff6ff;
            border-radius: 12px;
            padding: 1.25rem;
          }
          .feature-card h3 {
            margin: 0 0 0.5rem;
            font-size: 1rem;
            color: #1e40af;
          }
          .feature-card p {
            margin: 0;
            font-size: 0.9rem;
          }
          .steps-list {
            counter-reset: step;
            list-style: none;
            padding: 0;
          }
          .steps-list li {
            counter-increment: step;
            padding: 1rem 1rem 1rem 3.5rem;
            background: #eff6ff;
            border-radius: 12px;
            margin-bottom: 0.75rem;
            position: relative;
          }
          .steps-list li::before {
            content: counter(step);
            position: absolute;
            left: 1rem;
            top: 1rem;
            width: 2rem;
            height: 2rem;
            background: #2563eb;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
          }
          .architecture-diagram {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
          }
          .component {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
          }
          .component h4 {
            margin: 0 0 0.5rem;
            color: #1e40af;
          }
          .component p {
            margin: 0 0 0.5rem;
            font-size: 0.85rem;
          }
          .component code {
            font-size: 0.75rem;
            background: #e2e8f0;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
          }
          pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 0.85rem;
          }
          .faq-item {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
          }
          .faq-item h4 {
            margin: 0 0 0.5rem;
            color: #0f172a;
          }
          .faq-item p {
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
            color: #a16207;
            margin-bottom: 1rem;
          }
          .help-box a {
            color: #92400e;
            font-weight: 600;
          }
        `}</style>
      </DocLayout>
    </>
  );
}
