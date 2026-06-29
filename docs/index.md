# Spot Render Portal – TechDocs

## 1. Propósito
Interface web (Next.js) para artistas 3D enviarem arquivos, render lists, configurarem notificações por e-mail e acompanharem o status/progresso das renderizações juntamente com o health check do ambiente.

## 2. Tecnologias
- Next.js 14 / React 18
- Axios + SWR
- GitHub Actions (lint/test/Sonar/build)
- Kubernetes Rollout + HPA + ServiceMonitor

## 3. Estrutura
```
src/
  pages/
    index.tsx
    status.tsx           # Visão detalhada do health check
  components/
    UploadForm.tsx       # Upload + notificações + render list
    JobsTable.tsx        # Progresso/ETA/paths
    HealthBanner.tsx     # Banner verde/vermelho
k8s/
  rollout.yaml
  hpa.yaml
  services.yaml
```

## 4. Variáveis de ambiente
- `NEXT_PUBLIC_API_URL`: URL da Spot Render API (usada para uploads, listagem de jobs e health check). Ajuste para cada ambiente antes de executar `npm run build`/deploy.  
- Outras variáveis seguem o padrão Next.js (`process.env.NEXT_PUBLIC_*`).

## 5. Campos do formulário
- `file` (obrigatório)
- `project` (dropdown populado via `GET /projects`), `variation`, `artist`
- `renderlist` (opcional – CSV/XLSX)
- Checkbox “Esta submissão é uma correção”
- Checkbox “Desejo receber um aviso no email quando a minha tarefa for concluída” + campo de e-mail
- Checkbox “Sempre receber email” (salva em `localStorage` para reutilizar)
- Checkbox “Nova render list padrão” → solicita `username/password` (admin/admin em teste)

## 6. Status e monitoração
- O componente `HealthBanner` consome `GET /health/summary` a cada 20s e mostra mensagens coloridas (verde/vermelho) e link para `/status`.
- A página `/status` lista cada componente (API, banco, storage, notificações) com o respectivo texto retornado pela API.
- A tabela de jobs consulta `GET /jobs` a cada 15s e exibe progresso, ETA (formatação amigável) e os caminhos `input_uri`/`output_uri` (S3 ou file://). Isso facilita identificar onde estão arquivos “a renderizar” e “renderizados”.

## 7. Alertas
- Canário do portal monitora taxa de erro/latência via Prometheus queries configuradas em `spot-render-observability`.
- Novos alertas podem ser declarados editando `prometheus/alerts/*.yaml` no repositório de observabilidade.

## 8. Teste local
1. `npm install && npm run dev` para desenvolvimento local.
2. Para e2e no cluster: use `spot-render-teste-local` (namespaces `spot-render`, `rendering`, `monitoring`).
3. Ajuste `NEXT_PUBLIC_API_URL=http://spot-render-api.spot-render.svc.cluster.local:8000` ou utilize o ingress definido.
4. Use o campo `renderlist` para subir a planilha padrão da pasta local.

## 9. TechDocs
Publicar via TechDocs com:
```
techdocs-cli generate --source-dir . --output-dir site
```
