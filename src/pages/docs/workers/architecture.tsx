import DocLayout from "../../../components/DocLayout";

const sections = [
  { id: "visao-geral", title: "Visão Geral", icon: "🏗️" },
  { id: "spot-instances", title: "Spot Instances", icon: "⚡" },
  { id: "k8s", title: "Kubernetes", icon: "☸️" },
  { id: "monitoramento", title: "Monitoramento", icon: "📊" },
];

export default function WorkersArchitecturePage() {
  return (
    <DocLayout
      title="Workers - Arquitetura"
      description="Como os workers processam jobs de renderização"
      sections={sections}
    >
      <section id="visao-geral">
        <h2>🏗️ Visão Geral</h2>
        <p>
          Os <strong>Workers</strong> são componentes responsáveis por processar
          os jobs de renderização. Cada worker é um <strong>pod Kubernetes</strong>
          que executa o trabalho de renderizar frames.
        </p>

        <div className="architecture-diagram">
          <div className="component-box">
            <h4>API</h4>
            <p>Recebe jobs e gerencia fila</p>
          </div>
          <span className="arrow">→</span>
          <div className="component-box">
            <h4>Queue (SQS)</h4>
            <p>Fila de jobs pendentes</p>
          </div>
          <span className="arrow">→</span>
          <div className="component-box">
            <h4>Workers</h4>
            <p>Processam renders</p>
          </div>
          <span className="arrow">→</span>
          <div className="component-box">
            <h4>S3 Output</h4>
            <p>Armazena resultados</p>
          </div>
        </div>

        <h3>Características</h3>
        <ul>
          <li><strong>Escalonamento automático</strong> - HPA escala workers baseado na demanda</li>
          <li><strong>Spot Instances</strong> - Redução de custos usando instâncias interrompíveis</li>
          <li><strong>Isolamento</strong> - Cada job em container separado</li>
          <li><strong>Retentativa</strong> - Falhas são automaticamente retentadas</li>
          <li><strong>Cleanup</strong> - Recursos limpos após conclusão</li>
        </ul>
      </section>

      <section id="spot-instances">
        <h2>⚡ Spot Instances</h2>
        <p>
          Workers usam <strong>AWS Spot Instances</strong> para reduzir custos
          em até <strong>70%</strong> comparado a instâncias on-demand.
        </p>

        <div className="spot-benefits">
          <div className="benefit-card">
            <h3>💰 Economia</h3>
            <p>
              Preço médio 70% menor que on-demand.
              Para 100 workers, economia de ~$8/hora.
            </p>
          </div>
          <div className="benefit-card">
            <h3>⚡ Performance</h3>
            <p>
              Mesma performance de instâncias on-demand.
              Sem throttling ou recursos limitados.
            </p>
          </div>
          <div className="benefit-card">
            <h3>🔄 Auto-recovery</h3>
            <p>
              Quando uma spot é interrompida, o job é
              automaticamente reagendado em outra instância.
            </p>
          </div>
        </div>

        <h3>Como Funciona</h3>
        <pre>{`1. Job é adicionado à fila (SQS)
2. Worker solicita instância spot
3. AWS concede instância disponível
4. Worker baixa arquivos do S3 input
5. Worker executa renderização
6. Worker upload resultado para S3 output
7. Worker atualiza progresso via API
8. Instância é liberada (ou interrompida)`}</pre>

        <div className="warning-box">
          <h4>⚠️ Importante</h4>
          <p>
            Quando uma Spot Instance é interrompida pela AWS (raro, ~5% dos casos),
            o job é automaticamente reagendado. Não há perda de dados pois
            os arquivos de entrada estão no S3.
          </p>
        </div>
      </section>

      <section id="k8s">
        <h2>☸️ Kubernetes</h2>
        <p>
          Workers são implantados como <strong>pods</strong> em um cluster
          <strong>Amazon EKS</strong> com autoscaling via <strong>Karpenter</strong>.
        </p>

        <h3>Manifestos Principais</h3>
        <pre>{`# Deployment do Worker
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spot-render-worker
spec:
  replicas: 0  # HPA controla
  selector:
    matchLabels:
      app: spot-render-worker
  template:
    spec:
      containers:
      - name: worker
        image: spot-render/worker:latest
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
          limits:
            memory: "8Gi"
            cpu: "4"`}</pre>

        <h3>HPA (Horizontal Pod Autoscaler)</h3>
        <pre>{`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: spot-render-worker-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: spot-render-worker
  minReplicas: 0
  maxReplicas: 100
  metrics:
  - type: External
    external:
      metric:
        name: render_queue_total
      target:
        type: AverageValue
        averageValue: "5"`}</pre>

        <h3>Karpenter (Node Autoscaling)</h3>
        <pre>{`apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: spot-render
spec:
  requirements:
    - key: node.kubernetes.io/instance-type
      operator: In
      values: [m5.xlarge, m5.2xlarge, m5.4xlarge]
    - key: topology.kubernetes.io/zone
      operator: NotIn
      values: [us-east-1a]
  limits:
    resources:
      cpu: "100"
      memory: 200Gi
  provider:
    instanceProfile: spot-render-worker
  taints:
    - key: spot-worker
      value: "true"
      effect: NoSchedule`}</pre>
      </section>

      <section id="monitoramento">
        <h2>📊 Monitoramento</h2>
        <p>
          Workers expõem métricas para <strong>Prometheus</strong> e são
          monitorados via <strong>Grafana</strong>.
        </p>

        <h3>Métricas Disponíveis</h3>
        <table>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>worker_jobs_processing</code></td>
              <td>Número de jobs em processamento</td>
            </tr>
            <tr>
              <td><code>worker_frames_rendered</code></td>
              <td>Total de frames renderizados</td>
            </tr>
            <tr>
              <td><code>worker_render_duration_seconds</code></td>
              <td>Tempo de renderização por frame</td>
            </tr>
            <tr>
              <td><code>worker_gpu_utilization</code></td>
              <td>Utilização de GPU</td>
            </tr>
            <tr>
              <td><code>worker_memory_usage</code></td>
              <td>Uso de memória</td>
            </tr>
            <tr>
              <td><code>worker_spot_interruption_total</code></td>
              <td>Contagem de interrupções de spot</td>
            </tr>
          </tbody>
        </table>

        <h3>Dashboards</h3>
        <p>
          Acesse o dashboard Grafana em <code>http://grafana.spot-render.local</code>
          para visualizar:
        </p>
        <ul>
          <li>Jobs em tempo real</li>
          <li>Tempo médio de render</li>
          <li>Taxa de sucesso/falha</li>
          <li>Custo estimado</li>
          <li>Utilização de recursos</li>
        </ul>

        <div className="help-box">
          <h4>Precisa de ajuda?</h4>
          <p>
            O <strong>Spotinho</strong> pode ajudar com configurações de workers! 😊
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
        code {
          background: #e2e8f0;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.85em;
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
        .architecture-diagram {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          margin: 1.5rem 0;
        }
        .component-box {
          text-align: center;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .component-box h4 {
          margin: 0 0 0.25rem;
          color: #1e40af;
        }
        .component-box p {
          font-size: 0.8rem;
          margin: 0;
        }
        .arrow {
          color: #94a3b8;
          font-size: 1.5rem;
        }
        .spot-benefits {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .benefit-card {
          padding: 1.25rem;
          background: #f0fdf4;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }
        .benefit-card h3 {
          margin: 0 0 0.5rem;
          color: #166534;
        }
        .benefit-card p {
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
        .warning-box p {
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
          margin: 0;
          color: #a16207;
        }
      `}</style>
    </DocLayout>
  );
}
