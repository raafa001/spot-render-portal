import DocLayout from "../../../components/DocLayout";

const sections = [
  { id: "overview", title: "Visão Geral", icon: "📋" },
  { id: "upload-form", title: "Formulário de Upload", icon: "📤" },
  { id: "render-lists", title: "Render Lists", icon: "📄" },
  { id: "notificacoes", title: "Notificações", icon: "🔔" },
];

export default function UploadPage() {
  return (
    <DocLayout
      title="Upload de Arquivos"
      description="Como enviar arquivos 3D e render lists para o Spot Render"
      sections={sections}
    >
      <section id="overview">
        <h2>📋 Visão Geral</h2>
        <p>
          O portal Spot Render permite enviar jobs de renderização de forma simples
          e segura. Todos os arquivos são transmitidos com <strong>criptografia TLS</strong>
          e armazenados de forma isolada por projeto.
        </p>

        <div className="info-box">
          <h4>📌 Pré-requisitos</h4>
          <ul>
            <li>Conta com acesso ao projeto</li>
            <li>Arquivo 3D em formato aceito (.fbx, .obj, .blend, etc.)</li>
            <li>Render list (CSV ou XLSX) com os frames a renderizar</li>
            <li>Acesso à rede do cluster ou VPN</li>
          </ul>
        </div>
      </section>

      <section id="upload-form">
        <h2>📤 Formulário de Upload</h2>
        <p>
          O formulário de upload está disponível na <strong>página principal</strong> do portal.
          Preencha os seguintes campos:
        </p>

        <h3>Campos Obrigatórios</h3>
        <table className="fields-table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Descrição</th>
              <th>Exemplo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Projeto</strong></td>
              <td>Selecione o projeto responsável pelo render</td>
              <td>sky-tower, demo-project</td>
            </tr>
            <tr>
              <td><strong>Variação</strong></td>
              <td>Identificador da variação da cena</td>
              <td>v1, v2, final</td>
            </tr>
            <tr>
              <td><strong>Artista</strong></td>
              <td>Nome do artista responsável</td>
              <td>joao.silva</td>
            </tr>
            <tr>
              <td><strong>Arquivo 3D</strong></td>
              <td>Arquivo da cena (.fbx, .obj, .blend)</td>
              <td>scene.fbx</td>
            </tr>
            <tr>
              <td><strong>Render List</strong></td>
              <td>Arquivo CSV/XLSX com frames</td>
              <td>render-list.csv</td>
            </tr>
          </tbody>
        </table>

        <h3>Campos Opcionais</h3>
        <ul>
          <li><strong>Correção de cor</strong> - Aplica correção de color grading</li>
          <li><strong>Alta qualidade</strong> - Render em resolução máxima</li>
          <li><strong>Notificação por email</strong> - Receba alertas ao concluir</li>
        </ul>
      </section>

      <section id="render-lists">
        <h2>📄 Render Lists</h2>
        <p>
          A <strong>render list</strong> é um arquivo CSV ou XLSX que define quais
          frames devem ser renderizados. Cada linha representa uma tarefa.
        </p>

        <h3>Formato CSV</h3>
        <pre>{`filename,start_frame,end_frame,output_prefix
scene.fbx,1,100,render_v1
scene.fbx,101,200,render_v1
scene_v2.fbx,1,50,render_v2`}</pre>

        <h3>Formato XLSX</h3>
        <p>
          O arquivo XLSX deve conter as mesmas colunas. Você pode criar a render list
          no Excel ou Google Sheets.
        </p>

        <div className="warning-box">
          <h4>⚠️ Importante</h4>
          <ul>
            <li>O nome do arquivo deve corresponder ao arquivo 3D enviado</li>
            <li>Os frames devem ser sequenciais ou ter intervalos definidos</li>
            <li>Certifique-se de que todos os assets referenciados estão na cena</li>
          </ul>
        </div>
      </section>

      <section id="notificacoes">
        <h2>🔔 Notificações</h2>
        <p>
          Ao marcar a opção <strong>Desejo receber um aviso no email</strong>,
          você receberá notificações sobre o status do job:
        </p>

        <ul>
          <li><strong>Job na fila</strong> - Confirmação de que o job foi aceito</li>
          <li><strong>Início do processamento</strong> - Workers começaram a renderizar</li>
          <li><strong>Progresso</strong> - A cada 25% de conclusão (opcional)</li>
          <li><strong>Conclusão</strong> - Render finalizado com sucesso</li>
          <li><strong>Falha</strong> - Erro no processamento</li>
        </ul>

        <div className="tip-box">
          <h4>💡 Dica</h4>
          <p>
            Para jobs longos, desative as notificações de progresso para evitar
            excesso de emails. Mantenha apenas a notificação de conclusão.
          </p>
        </div>

        <div className="help-box">
          <h4>Precisa de ajuda?</h4>
          <p>
            O <strong>Spotinho</strong> pode ajudar com suas dúvidas! 😊
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
        .info-box, .warning-box, .tip-box, .help-box {
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }
        .info-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }
        .info-box h4, .tip-box h4 {
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
        .tip-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }
        .tip-box h4 {
          margin: 0 0 0.75rem;
          color: #166534;
        }
        .help-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
          border: 1px solid #fcd34d;
        }
        .help-box h4 {
          margin: 0 0 0.5rem;
          color: #92400e;
        }
        .help-box p {
          margin: 0;
          color: #a16207;
        }
        .fields-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .fields-table th, .fields-table td {
          text-align: left;
          padding: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .fields-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
        }
        .fields-table td {
          color: #0f172a;
        }
        .fields-table td code {
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
        }
      `}</style>
    </DocLayout>
  );
}
