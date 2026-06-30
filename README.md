## spot-render-portal

> **PT-BR:** Portal web (Next.js/React) onde os artistas fazem upload dos arquivos, consultam status e veem métricas básicas. Se comunica com `spot-render-api` e respeita o canary deploy com Argo Rollouts.

> **EN:** Web portal (Next.js/React) for artists to upload files, inspect status and view basic metrics. Talks to `spot-render-api` and is deployed via Argo Rollouts canary.

### Scripts

```bash
npm install
npm run dev
```

### Variáveis de ambiente

- `NEXT_PUBLIC_API_URL`: endpoint público da Spot Render API (ex.: `http://spot-render-api.spot-render.svc.cluster.local:8000` em clusters locais ou `https://api.render.company.com` em produção). As páginas `/` e `/status` consomem esse valor para buscar jobs e o health check.  
- Após atualizar a variável em staging/produção, execute `npm run build` (ou pipeline correspondente) para gerar os assets estáticos e publicar a nova rota `/status`.

### Estrutura

```
src/
  pages/
    index.tsx
    status.tsx
  components/
    UploadForm.tsx
    JobsTable.tsx
    HealthBanner.tsx
```

### Pipelines

`.github/workflows/ci.yml` executa lint (ESLint), testes (Jest/Playwright opcional), SonarQube, build Docker, push ECR e aplica rollout/serviços/HPA.

### Kubernetes
- `k8s/rollout.yaml`, `k8s/hpa.yaml`, `k8s/services.yaml`, `k8s/servicemonitor.yaml` com probes e annotations WAF/TLS.
- `k8s/ingress.yaml`: ingress padrão (host `spot-render.local`). Ajuste o host/anotações (`spot-render.aws.company.com`, TLS, etc.) para o ambiente de destino antes de aplicar.

### Tecnologias
- Next.js 14 / React 18  
- Axios para comunicação com a API  
- GitHub Actions (lint/test → Sonar → Docker/Trivy → Rollout)  
- Rollout canário + HPA em `spot-render` namespace.

### Uploads, notificações e saúde
- Formulário aceita `file`, `project`, `variation`, `artist`, campo opcional **`renderlist`** e flags “correção”, “Desejo receber e-mail” e “Sempre receber e-mail”. O e-mail pode ser salvo em `localStorage` para não ser digitado a cada projeto.  
- A seleção de projetos é carregada dinamicamente via `GET /projects`, garantindo que cada upload vá para o bucket/prefixo correto.  
- Após o envio, o formulário mostra as URIs de entrada/saída (`s3://...` ou `file://...`) e o bucket/repositório associado.  
- A home exibe um banner verde/vermelho (“Ambiente está funcionando corretamente!” / “Ambiente com falha...”) baseado em `GET /health/summary`, com link para a nova página `/status`.  
- A tabela de jobs mostra progresso (%), ETA, estágio textual (“Concluindo”, “Concluída”), caminhos de entrada/saída, bucket e repositório.

### Métricas & Alertas
- O portal envia eventos de Web Vitals para a API (`render_requests_total` com `source="portal"`).  
- Para adicionar novos eventos, atualize `src/components/UploadForm.tsx` para chamar a API `/metrics/events`.  
- Alertas de canário/HPA são herdados da camada API/observabilidade (ver `spot-render-observability`).

### Testes locais
1. Clone este repo e o [`spot-render-teste-local`](https://github.com/raafa001/spot-render-teste-local).  
2. Execute `npm install && npm run dev` para testar a UI isolada.  
3. Para o cluster local, siga o README do repo de teste: `make bootstrap` → `kubectl apply -k overlays/local`. O portal será exposto via ingress `spot-render.local` (definido em `k8s/ingress.yaml`). Ajuste o host no arquivo para apontar para domínios reais em staging/prod.  
4. Use o campo `renderlist` para subir a planilha padrão de teste.

### TechDocs / Backstage
- `docs/index.md` + `mkdocs.yml` descrevem o serviço. Ao publicar com TechDocs, o `catalog-info.yaml` já aponta para `Component/spot-render-portal`.

### Render lists (opcional)
- O formulário possui um campo opcional para anexar planilhas `render-list*.csv/xlsx`. Essas planilhas não devem ser commitadas; o portal apenas envia para a API que as salva em um bucket privado.  
- Use esse campo para atualizar filas de renderização sem expor os dados.
