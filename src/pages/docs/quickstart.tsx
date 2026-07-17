import Link from "next/link";
import DocLayout from "../../components/DocLayout";

const sections = [
  { id: "ambiente-local", title: "Ambiente Local", icon: "💻" },
  { id: "configuracao", title: "Configuração", icon: "⚙️" },
  { id: "primeiro-job", title: "Seu Primeiro Job", icon: "🚀" },
  { id: "verificacao", title: "Verificação", icon: "✅" },
];

export default function QuickstartPage() {
  return (
    <DocLayout
      title="Quickstart"
      description="Configure o ambiente local e envie seu primeiro job em 5 minutos"
      sections={sections}
    >
      <section id="ambiente-local">
        <h2>💻 Configuração do Ambiente Local</h2>
        <p>
          Siga estes passos para configurar o Spot Render localmente usando
          <strong>Docker Compose</strong> ou <strong>Kind/Kubernetes</strong>.
        </p>

        <div className="prerequisites">
          <h3>Pré-requisitos</h3>
          <ul>
            <li>Docker e Docker Compose instalados</li>
            <li>kubectl configurado (para Kubernetes)</li>
            <li>2GB de RAM disponível</li>
            <li>10GB de espaço em disco</li>
          </ul>
        </div>

        <h3>Opção 1: Docker Compose (Recomendado para dev)</h3>
        <pre>{`# Clone os repositórios
git clone https://github.com/raafa001/spot-render-api.git
git clone https://github.com/raafa001/spot-render-portal.git

# Entre no diretório da API
cd spot-render-api

# Inicie os serviços
docker compose up -d

# Verifique os serviços
docker compose ps`}</pre>

        <h3>Opção 2: Kubernetes (Kind)</h3>
        <pre>{`# Crie o cluster Kind
kind create cluster --name spot-render

# Use o harness de teste local
cd spot-render-teste-local
./setup-local.sh`}</pre>
      </section>

      <section id="configuracao">
        <h2>⚙️ Configuração</h2>
        <p>
          Após iniciar os serviços, configure as variáveis de ambiente necessárias.
        </p>

        <h3>Arquivo .env</h3>
        <pre>{`# Modo de storage (local para dev)
STORAGE_MODE=local
LOCAL_STORAGE_ROOT=/tmp/spot-render-storage

# Banco de dados SQLite (compartilhado)
DATABASE_URL=sqlite:////tmp/spot-render-storage/jobs.db

# URLs do sistema
NEXT_PUBLIC_API_URL=http://api.spot-render.local
NEXT_PUBLIC_PORTAL_URL=http://spot-render.local

# CORS (permite tudo em dev)
CORS_ALLOW_ORIGINS=*

# Email (desabilitado em dev)
EMAIL_ENABLED=false

# Ollama (AI - opcional)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2`}</pre>

        <h3>Configuração de Hosts</h3>
        <pre>{`# /etc/hosts (Linux/Mac) ou C:\\Windows\\System32\\drivers\\etc\\hosts

127.0.0.1  spot-render.local
127.0.0.1  api.spot-render.local
127.0.0.1  backstage.spot-render.local`}</pre>
      </section>

      <section id="primeiro-job">
        <h2>🚀 Enviando Seu Primeiro Job</h2>
        <p>
          Com o ambiente configurado, você está pronto para enviar seu primeiro job!
        </p>

        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <div className="step-content">
              <h4>Acesse o Portal</h4>
              <p>Abra <a href="http://spot-render.local">http://spot-render.local</a> no navegador.</p>
            </div>
          </div>

          <div className="step">
            <span className="step-number">2</span>
            <div className="step-content">
              <h4>Prepare seus arquivos</h4>
              <p>
                Tenha pronto um arquivo 3D (.fbx, .obj, .blend) e uma render list (CSV/XLSX).
              </p>
            </div>
          </div>

          <div className="step">
            <span className="step-number">3</span>
            <div className="step-content">
              <h4>Preencha o formulário</h4>
              <p>
                Selecione projeto (ex: <code>demo-project</code>), variação, artista e faça upload.
              </p>
            </div>
          </div>

          <div className="step">
            <span className="step-number">4</span>
            <div className="step-content">
              <h4>Acompanhe</h4>
              <p>
                Veja o progresso na tabela de jobs. Quando concluído, faça download dos arquivos!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="verificacao">
        <h2>✅ Verificação</h2>
        <p>
          Após enviar seu job, verifique se tudo está funcionando:
        </p>

        <ul className="checklist">
          <li>
            <span className="check">✓</span>
            Job aparece na tabela de jobs
          </li>
          <li>
            <span className="check">✓</span>
            Status muda de queued para running
          </li>
          <li>
            <span className="check">✓</span>
            Progresso aumenta com o tempo
          </li>
          <li>
            <span className="check">✓</span>
            Status muda para completed
          </li>
          <li>
            <span className="check">✓</span>
            Arquivos disponíveis para download
          </li>
        </ul>

        <div className="tip-box">
          <h4>💡 Dica</h4>
          <p>
            Use <code>kubectl port-forward</code> para acessar os serviços:
            <pre>kubectl port-forward svc/spot-render-api 8080:8000</pre>
          </p>
        </div>

        <div className="next-steps">
          <h3>Próximos Passos</h3>
          <ul>
            <li><Link href="/docs/intro">Entenda a arquitetura completa →</Link></li>
            <li><Link href="/docs/converters/formats">Veja os formatos aceitos →</Link></li>
            <li><Link href="/docs/api/overview">Explore a API REST →</Link></li>
            <li><Link href="/docs/cli/install">Instale o CLI →</Link></li>
          </ul>
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
        code {
          background: #e2e8f0;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.85em;
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
        .prerequisites {
          background: #eff6ff;
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }
        .prerequisites h3 {
          margin: 0 0 0.75rem;
          color: #1e40af;
        }
        .prerequisites ul {
          margin: 0;
          color: #475569;
        }
        .steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .step {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
        }
        .step-number {
          width: 2rem;
          height: 2rem;
          background: #2563eb;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .step-content h4 {
          margin: 0 0 0.25rem;
          color: #0f172a;
        }
        .step-content p {
          margin: 0;
          font-size: 0.9rem;
        }
        .checklist {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }
        .checklist li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          color: #475569;
        }
        .check {
          width: 1.5rem;
          height: 1.5rem;
          background: #22c55e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
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
        .next-steps {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1.25rem;
          margin-top: 2rem;
        }
        .next-steps h3 {
          margin: 0 0 0.75rem;
        }
        .next-steps ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        .next-steps li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </DocLayout>
  );
}
