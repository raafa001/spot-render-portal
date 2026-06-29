# Spot Render Portal – TechDocs

## 1. Propósito
> **PT-BR:** Interface Next.js para que artistas enviem jobs, gerenciem render lists seguras e monitorem progresso/saúde da plataforma em tempo real.  
> **EN:** Next.js interface that lets artists submit jobs, handle secure render lists, and monitor progress/platform health in real time.

## 2. Tecnologias
> **PT-BR:**
> - Next.js 15 / React 18
> - Axios para chamadas REST (SWR opcional)
> - GitHub Actions (lint/test/Sonar/build)
> - Kubernetes Rollout + HPA + ServiceMonitor
> **EN:**
> - Next.js 15 / React 18
> - Axios for REST calls (SWR optional)
> - GitHub Actions (lint/test/Sonar/build)
> - Kubernetes Rollout + HPA + ServiceMonitor

## 3. Estrutura
> **PT-BR:** Principais pastas/arquivos.  
> **EN:** Key folders/files.

```
src/
  pages/
    index.tsx            # Landing page + hero + cards + tabela
    status.tsx           # Visão detalhada do health check
  components/
    UploadForm.tsx       # Upload + notificações + render list padrão
    JobsTable.tsx        # Progresso/ETA/paths (tabela + cards mobile)
    HealthBanner.tsx     # Banner animado com Link next/link
k8s/
  rollout.yaml
  hpa.yaml
  services.yaml
docs/
  index.md              # Este documento (TechDocs)
```

## 4. Variáveis de ambiente
> **PT-BR:** `NEXT_PUBLIC_API_URL` aponta para o backend (local ou cloud) antes de `npm run build`. Outras variáveis seguem o padrão `process.env.NEXT_PUBLIC_*`.  
> **EN:** Set `NEXT_PUBLIC_API_URL` to the backend (local/cloud) before `npm run build`. Other envs follow `process.env.NEXT_PUBLIC_*`.

## 5. Campos do formulário
> **PT-BR:**
> - `Arquivos de cena` suporta múltiplos uploads simultâneos, limitados a extensões renderizáveis (`.max`, `.fbx`, `.obj`, `.blend`, `.usd`, `.abc`, `.ma`, `.mb`, `.c4d`). Arquivos fora dessa lista são ignorados com aviso.
> - `Render list` agora é obrigatória em todos os envios, garantindo que cada projeto especifique suas prioridades.
> - O toggle “Atualizar render list padrão” continua disponível, mas não exige mais usuário/senha – basta marcar e enviar o CSV/XLSX correspondente.
> - Preferências de notificação e flag de correção permanecem iguais, com persistência via `localStorage`.
> **EN:**
> - `Scene files` accepts multiple uploads at once, restricted to renderable extensions (`.max`, `.fbx`, `.obj`, `.blend`, `.usd`, `.abc`, `.ma`, `.mb`, `.c4d`). Unsupported files are skipped with a warning.
> - `Render list` is now required for every submission so each project defines its own priorities.
> - The “Update default render list” toggle is still available but no longer requires username/password—just check it and upload the CSV/XLSX.
> - Notification preferences and correction flag keep the same behavior (persisted via `localStorage`).

## 6. Status e monitoração
> **PT-BR:** `HealthBanner` consome `GET /health/summary` a cada 20 s; `/status` detalha componentes. `JobsTable` consulta `GET /jobs` a cada 15 s e mostra progresso com barras + cards responsivos, incluindo `input_uri/output_uri`.  
> **EN:** `HealthBanner` polls `GET /health/summary` every 20 s; `/status` expands each component. `JobsTable` polls `GET /jobs` every 15 s with progress bars + responsive cards, including `input_uri/output_uri`.

## 7. Formato das saídas
> **PT-BR:** O backend padroniza todas as imagens exportadas em **PNG**, independentemente do arquivo de origem. A UI destaca essa expectativa nas dicas para evitar dúvidas com outros formatos.  
> **EN:** The backend standardizes every rendered image as **PNG**, regardless of the source asset. The UI highlights this expectation in the tips to avoid confusion with other formats.

## 8. Alertas e observabilidade
> **PT-BR:** Canário monitora erro/latência via regras Prometheus do repo `spot-render-observability`. Ajustes: editar `prometheus/alerts/*.yaml` e dashboards `grafana/dashboards/*.yaml`.  
> **EN:** Canary monitors error/latency via Prometheus rules in `spot-render-observability`. To tweak, edit `prometheus/alerts/*.yaml` and dashboards under `grafana/dashboards/*.yaml`.

## 9. Teste local
> **PT-BR:**
> 1. `npm install && npm run dev` para hot reload.
> 2. Para E2E, use `spot-render-teste-local` (namespaces `spot-render`, `rendering`, `monitoring`).
> 3. Configure `NEXT_PUBLIC_API_URL=http://spot-render-api.spot-render.svc.cluster.local:8000` ou utilize o ingress `spot-render.local`.
> 4. O PVC `/tmp/spot-render-storage/shared` mantém uploads entre reinícios.
> **EN:**
> 1. `npm install && npm run dev` for hot reload.
> 2. For E2E, rely on `spot-render-teste-local` (namespaces `spot-render`, `rendering`, `monitoring`).
> 3. Set `NEXT_PUBLIC_API_URL=http://spot-render-api.spot-render.svc.cluster.local:8000` or point to `spot-render.local` ingress.
> 4. PVC `/tmp/spot-render-storage/shared` keeps uploads across restarts.

## 10. TechDocs
> **PT-BR:** Gere e publique via TechDocs CLI: `techdocs-cli generate --source-dir . --output-dir site`.  
> **EN:** Generate/publish via TechDocs CLI: `techdocs-cli generate --source-dir . --output-dir site`.

## 11. ESLint CLI oficial
> **PT-BR:** O projeto já usa `eslint . --ext .js,.jsx,.ts,.tsx --max-warnings=0` no `package.json`, com `extends: ["next/core-web-vitals"]`. Execução local e no CI devem chamar `npm run lint`.  
> **EN:** The project now runs `eslint . --ext .js,.jsx,.ts,.tsx --max-warnings=0` (see `package.json`), extending `next/core-web-vitals`. Local and CI pipelines should call `npm run lint`.
