import DocLayout from "../../../components/DocLayout";

const sections = [
  { id: "instalacao", title: "Instalação", icon: "📦" },
  { id: "comandos", title: "Comandos", icon: "⌨️" },
  { id: "configuracao", title: "Configuração", icon: "⚙️" },
  { id: "exemplos", title: "Exemplos", icon: "📋" },
];

export default function CliInstallPage() {
  return (
    <DocLayout
      title="CLI - Instalação"
      description="Ferramenta de linha de comando para automação"
      sections={sections}
    >
      <section id="instalacao">
        <h2>📦 Instalação</h2>
        <p>
          O <strong>Spot Render CLI</strong> é uma ferramenta de linha de comando
          para enviar jobs e gerenciar renderizações sem usar o portal web.
        </p>

        <h3>Via npm (Recomendado)</h3>
        <pre>{`npm install -g spotrender-cli`}</pre>

        <h3>Via yarn</h3>
        <pre>{`yarn global add spotrender-cli`}</pre>

        <h3>Verificação</h3>
        <pre>{`spotrender --version
# ou
spotrender -v`}</pre>

        <div className="info-box">
          <h4>📋 Pré-requisitos</h4>
          <ul>
            <li>Node.js 18+</li>
            <li>npm ou yarn</li>
            <li>Acesso à rede do cluster Spot Render</li>
          </ul>
        </div>
      </section>

      <section id="comandos">
        <h2>⌨️ Comandos Principais</h2>

        <div className="commands-list">
          <div className="command-item">
            <h3>submit</h3>
            <p>Envia um novo job de renderização</p>
            <pre>{`spotrender submit [opções]

Opções:
  --file, -f          Arquivo 3D (.fbx, .obj, .blend)
  --renderlist, -r    Arquivo de render list (CSV/XLSX)
  --project, -p       Nome do projeto
  --variation, -v     Variação da cena
  --artist, -a        Nome do artista
  --notify            Ativar notificações por email

Exemplo:
  spotrender submit -f scene.fbx -r render.csv -p demo -v v1 -a joao`}</pre>
          </div>

          <div className="command-item">
            <h3>status</h3>
            <p>Mostra o status de um job específico</p>
            <pre>{`spotrender status [job-id]

Exemplo:
  spotrender status abc123
  spotrender status abc123 --watch  # atualiza em tempo real`}</pre>
          </div>

          <div className="command-item">
            <h3>list</h3>
            <p>Lista todos os jobs</p>
            <pre>{`spotrender list [opções]

Opções:
  --project           Filtrar por projeto
  --artist           Filtrar por artista
  --status           Filtrar por status
  --limit            Limite de resultados (padrão: 20)

Exemplo:
  spotrender list
  spotrender list --project demo --status running`}</pre>
          </div>

          <div className="command-item">
            <h3>cancel</h3>
            <p> Cancela um job em execução ou na fila</p>
            <pre>{`spotrender cancel [job-id]

Exemplo:
  spotrender cancel abc123`}</pre>
          </div>

          <div className="command-item">
            <h3>download</h3>
            <p>Baixa os arquivos renderizados</p>
            <pre>{`spotrender download [job-id] [destino]

Exemplo:
  spotrender download abc123 ./output
  spotrender download abc123 --unzip`}</pre>
          </div>

          <div className="command-item">
            <h3>progress</h3>
            <p>Atualiza o progresso de um job (para workers)</p>
            <pre>{`spotrender progress [job-id] [opções]

Opções:
  --frames-rendered   Número de frames concluídos
  --frames-total      Total de frames
  --eta-seconds       Tempo estimado em segundos

Exemplo:
  spotrender progress abc123 --frames-rendered 50 --frames-total 100 --eta-seconds 300`}</pre>
          </div>
        </div>
      </section>

      <section id="configuracao">
        <h2>⚙️ Configuração</h2>
        <p>
          O CLI pode ser configurado via variáveis de ambiente ou arquivo de configuração.
        </p>

        <h3>Variáveis de Ambiente</h3>
        <pre>{`export SPOTRENDER_API_URL=http://api.spot-render.local
export SPOTRENDER_PROJECT=demo-project
export SPOTRENDER_NOTIFY=true`}</pre>

        <h3>Arquivo de Configuração</h3>
        <pre>{`# ~/.spotrender/config.yml
api_url: http://api.spot-render.local
default_project: demo-project
notify: true
output_format: json  # json ou table`}</pre>

        <h3>Autenticação</h3>
        <p>
          Para endpoints que requerem autenticação, configure as credenciais:
        </p>
        <pre>{`export SPOTRENDER_USERNAME=seu_usuario
export SPOTRENDER_PASSWORD=sua_senha

# Ou use token API
export SPOTRENDER_TOKEN=seu_token_api`}</pre>
      </section>

      <section id="exemplos">
        <h2>📋 Exemplos Práticos</h2>

        <h3>Script de Automação (Bash)</h3>
        <pre>{`#!/bin/bash
# submit-render.sh

PROJECT=$1
VARIATION=$2
FILE=$3

JOB_ID=$(spotrender submit \\
  --file "$FILE" \\
  --renderlist "render.csv" \\
  --project "$PROJECT" \\
  --variation "$VARIATION" \\
  --artist "$USER" \\
  --notify \\
  --json | jq -r '.job_id')

echo "Job enviado: $JOB_ID"

# Aguarda conclusão
spotrender status "$JOB_ID" --watch

# Baixa resultado
spotrender download "$JOB_ID" "./output"

echo "Download concluído!"`}</pre>

        <h3>Integração com GitHub Actions</h3>
        <pre>{`# .github/workflows/render.yml
name: Render

on:
  push:
    branches: [main]

jobs:
  render:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Spot Render CLI
        run: npm install -g spotrender-cli

      - name: Submit render job
        env:
          SPOTRENDER_TOKEN: \${{ secrets.SPOTRENDER_TOKEN }}
        run: |
          spotrender submit \\
            --file scene.fbx \\
            --renderlist render.csv \\
            --project my-project \\
            --variation v1 \\
            --artist \${{ github.actor }}

      - name: Download results
        run: spotrender download \$JOB_ID ./output`}</pre>

        <div className="help-box">
          <h4>Precisa de ajuda?</h4>
          <p>
            O <strong>Spotinho</strong> pode ajudar com scripts de automação! 😊
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
        pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.85rem;
          margin: 1rem 0;
        }
        .info-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }
        .info-box h4 {
          margin: 0 0 0.75rem;
          color: #1e40af;
        }
        .info-box ul {
          margin: 0;
          color: #475569;
        }
        .commands-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .command-item {
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 12px;
        }
        .command-item h3 {
          margin: 0 0 0.5rem;
          font-family: monospace;
          color: #7c3aed;
        }
        .command-item p {
          margin: 0 0 1rem;
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
