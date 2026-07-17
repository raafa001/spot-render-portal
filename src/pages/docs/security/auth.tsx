import DocLayout from "../../../components/DocLayout";

const sections = [
  { id: "overview", title: "Visão Geral", icon: "🔒" },
  { id: "auth", title: "Autenticação", icon: "🔑" },
  { id: "encryption", title: "Criptografia", icon: "🔐" },
  { id: "iam", title: "IAM Roles", icon: "👥" },
];

export default function SecurityAuthPage() {
  return (
    <DocLayout
      title="Segurança - Autenticação"
      description="Como o Spot Render protege seus dados e acessos"
      sections={sections}
    >
      <section id="overview">
        <h2>🔒 Visão Geral</h2>
        <p>
          O Spot Render implementa <strong>múltiplas camadas de segurança</strong>
          para proteger seus dados de renderização e controlar acessos.
        </p>

        <div className="security-layers">
          <div className="layer">
            <h3>🌐 Rede</h3>
            <p>
              Tráfego criptografado via TLS 1.3,
              VPNs para acesso interno.
            </p>
          </div>
          <div className="layer">
            <h3>🔐 Dados</h3>
            <p>
              Arquivos criptografados em repouso (S3 SSE-KMS),
              backups seguros.
            </p>
          </div>
          <div className="layer">
            <h3>👥 Acessos</h3>
            <p>
              IAM Roles com menor privilégio,
              rotação de credenciais.
            </p>
          </div>
          <div className="layer">
            <h3>📝 Auditoria</h3>
            <p>
              Logs de todas as operações,
              compliance com padrões.
            </p>
          </div>
        </div>
      </section>

      <section id="auth">
        <h2>🔑 Autenticação</h2>
        <p>
          O Spot Render suporta múltiplos métodos de autenticação:
        </p>

        <h3>Tokens de API</h3>
        <p>
          Para automação e integrações, use <strong>tokens de API</strong>:
        </p>
        <pre>{`# Header de autenticação
Authorization: Bearer <seu_token>

# Exemplo com curl
curl -X GET "http://api.spot-render.local/jobs" \\
  -H "Authorization: Bearer tk_abc123..."`}</pre>

        <h3>Credenciais Básicas</h3>
        <p>
          Para endpoints administrativos, autenticação básica:
        </p>
        <pre>{`# Header
Authorization: Basic <base64(username:password)>

# Exemplo
curl -X POST "http://api.spot-render.local/uploads" \\
  -u admin:senha_secreta`}</pre>

        <div className="warning-box">
          <h4>⚠️ Segurança</h4>
          <ul>
            <li>Nunca exponha tokens em código cliente (front-end)</li>
            <li>Armazene credenciais em variáveis de ambiente ou secrets manager</li>
            <li>Tokens expiram - implemente refresh token</li>
          </ul>
        </div>
      </section>

      <section id="encryption">
        <h2>🔐 Criptografia</h2>
        <p>
          Todos os dados são protegidos com criptografia:
        </p>

        <div className="encryption-table">
          <div className="enc-row">
            <h4>Em Trânsito (TLS)</h4>
            <p>
              Todo tráfego HTTP usa <strong>TLS 1.3</strong>.
              Conexões S3 usam HTTPS.
            </p>
          </div>
          <div className="enc-row">
            <h4>Em Repouso (S3)</h4>
            <p>
              Arquivos no S3 usam <strong>SSE-KMS</strong>
              com chaves gerenciadas pela AWS.
            </p>
          </div>
          <div className="enc-row">
            <h4>Database</h4>
            <p>
              SQLite com extensão SQLCipher ou
              Postgres com TDE (Transparent Data Encryption).
            </p>
          </div>
          <div className="enc-row">
            <h4>Secrets</h4>
            <p>
              Credenciais no <strong>AWS Secrets Manager</strong>.
              Nunca em texto plano.
            </p>
          </div>
        </div>
      </section>

      <section id="iam">
        <h2>👥 IAM Roles</h2>
        <p>
          O Spot Render usa <strong>IAM Roles</strong> para controlar
          permissões de serviços AWS.
        </p>

        <h3>Políticas Principais</h3>
        <pre>{`# Política para Workers (menor privilégio)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::spot-render-input/*",
        "arn:aws:s3:::spot-render-output/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage"
      ],
      "Resource": "arn:aws:sqs:*:*:spot-render-queue"
    }
  ]
}`}</pre>

        <h3>IRSA (IAM Roles for Service Accounts)</h3>
        <p>
          Pods Kubernetes usam <strong>IRSA</strong> para assumir roles:
        </p>
        <pre>{`apiVersion: v1
kind: ServiceAccount
metadata:
  name: spot-render-worker
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456:role/spot-render-worker`}</pre>

        <div className="tip-box">
          <h4>💡 Dica</h4>
          <p>
            Para audit, veja os logs do CloudTrail em
            <code>{'AWS CloudWatch > Log groups > cloudtrail'}</code>.
          </p>
        </div>

        <div className="help-box">
          <h4>Precisa de ajuda?</h4>
          <p>
            O <strong>Spotinho</strong> pode ajudar com configurações de segurança! 😊
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
        pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.85rem;
          margin: 1rem 0;
        }
        .security-layers {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .layer {
          padding: 1.25rem;
          background: #eff6ff;
          border-radius: 12px;
        }
        .layer h3 {
          margin: 0 0 0.5rem;
          color: #1e40af;
          font-size: 1rem;
        }
        .layer p {
          margin: 0;
          font-size: 0.9rem;
        }
        .encryption-table {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .enc-row {
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #22c55e;
        }
        .enc-row h4 {
          margin: 0 0 0.25rem;
          color: #0f172a;
        }
        .enc-row p {
          margin: 0;
          font-size: 0.9rem;
        }
        .warning-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }
        .warning-box h4 {
          margin: 0 0 0.5rem;
          color: #b91c1c;
        }
        .warning-box ul {
          margin: 0.5rem 0 0;
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
        code {
          background: #e2e8f0;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.85em;
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
