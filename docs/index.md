# Spot Render Portal – TechDocs

## 1. Propósito
Interface web para artistas 3D enviarem arquivos, render lists e acompanharem o status das renderizações.

## 2. Tecnologias
- Next.js 14 / React 18
- Axios + SWR
- GitHub Actions (lint/test/Sonar/build)
- Kubernetes Rollout + HPA + ServiceMonitor

## 3. Estrutura
```
src/
  pages/index.tsx
  components/UploadForm.tsx
  components/JobsTable.tsx
k8s/
  rollout.yaml
  hpa.yaml
  services.yaml
```

## 4. Campos do formulário
- `file` (obrigatório)
- `project`, `variation`, `artist`
- `renderlist` (opcional – CSV/XLSX)
- Checkbox “Nova render list padrão” → solicita `username/password` (admin/admin em teste).

## 5. Métricas
- Eventos de upload disparam chamadas à API (`render_requests_total`).
- Para adicionar métricas de UI, utilize `window.performance` ou integrações como OpenTelemetry e envie para o exporter.

## 6. Alertas
- Canário do portal monitora taxa de erro/latência via Prometheus queries configuradas em `spot-render-observability`.
- Novos alertas podem ser declarados editando `prometheus/alerts/*.yaml` no repositório de observabilidade.

## 7. Teste local
1. `npm install && npm run dev` para desenvolvimento local.
2. Para e2e no cluster: use `spot-render-teste-local` (namespaces `spot-render`, `rendering`, `monitoring`).
3. Ajuste `NEXT_PUBLIC_API_URL=http://spot-render-api.spot-render.svc.cluster.local:8000` ou utilize o ingress definido.
4. Use o campo `renderlist` para subir a planilha padrão da pasta local.

## 8. TechDocs
Publicar via TechDocs com:
```
techdocs-cli generate --source-dir . --output-dir site
```
