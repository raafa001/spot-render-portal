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

### Tecnologias
- Next.js 14 / React 18  
- Axios para comunicação com a API  
- GitHub Actions (lint/test → Sonar → Docker/Trivy → Rollout)  
- Rollout canário + HPA em `spot-render` namespace.

### Uploads e Render Lists
- Formulário aceita `file`, `project`, `variation`, `artist` e campo opcional **`renderlist`** (CSV/XLSX) por projeto.  
- Flag “Esta é a nova render list padrão” exige autenticação (`username=admin`, `password=admin` em ambientes de teste) e envia um POST dedicado à API.  
- Os arquivos `render-list*.csv|tsv|xlsx` não devem ser versionados; carregue-os apenas pelo portal ou CLI.

### Métricas & Alertas
- O portal envia eventos de Web Vitals para a API (`render_requests_total` com `source="portal"`).  
- Para adicionar novos eventos, atualize `src/components/UploadForm.tsx` para chamar a API `/metrics/events`.  
- Alertas de canário/HPA são herdados da camada API/observabilidade (ver `spot-render-observability`).

### Testes locais
1. Clone este repo e o [`spot-render-teste-local`](https://github.com/raafa001/spot-render-teste-local).  
2. Execute `npm install && npm run dev` para testar a UI isolada.  
3. Para o cluster local, siga o README do repo de teste: `make bootstrap` → `kubectl apply -k overlays/local`. O portal será exposto via ingress `spot-render.local`.  
4. Use o campo `renderlist` para subir a planilha padrão de teste.

### TechDocs / Backstage
- `docs/index.md` + `mkdocs.yml` descrevem o serviço. Ao publicar com TechDocs, o `catalog-info.yaml` já aponta para `Component/spot-render-portal`.

### Render lists (opcional)
- O formulário possui um campo opcional para anexar planilhas `render-list*.csv/xlsx`. Essas planilhas não devem ser commitadas; o portal apenas envia para a API que as salva em um bucket privado.  
- Use esse campo para atualizar filas de renderização sem expor os dados.
