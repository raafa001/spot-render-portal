## spot-render-portal

> **PT-BR:** Portal web (Next.js/React) onde os artistas fazem upload dos arquivos, consultam status e veem métricas básicas. Se comunica com `spot-render-api` e respeita o canary deploy com Argo Rollouts.

> **EN:** Web portal (Next.js/React) for artists to upload files, inspect status and view basic metrics. Talks to `spot-render-api` and is deployed via Argo Rollouts canary.

### Scripts

```bash
npm install
npm run dev
```

### Estrutura

```
  pages/
    index.tsx
  components/
    UploadForm.tsx
    JobsTable.tsx
```

### Pipelines

`.github/workflows/ci.yml` executa lint (ESLint), testes (Jest/Playwright opcional), SonarQube, build Docker, push ECR e aplica rollout/serviços/HPA.

### Kubernetes
- `k8s/rollout.yaml`, `k8s/hpa.yaml`, `k8s/services.yaml`, `k8s/servicemonitor.yaml` com probes e annotations WAF/TLS.
