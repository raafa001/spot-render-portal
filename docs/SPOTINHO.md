# Spotinho - Assistente Virtual

Spotinho é o assistente virtual do Spot Render, alimentado por IA usando Ollama.

## Funcionalidades

### Chat Widget (Mini)
- Widget flutuante no canto inferior direito
- Acesse rapidamente para tirar dúvidas
- Indicador de status online/offline
- Sincronização com a página de chat completa

### Página de Chat Completa (`/chat`)
- Interface expandida para conversas mais longas
- Mesma conversa do widget (sincronização via localStorage)
- Acesso direto via botão "Falar com Spotinho" na página inicial

### Sincronização
Ambas as interfaces (widget e página completa) compartilham o mesmo histórico de mensagens via `localStorage` e eventos `storage`, garantindo que você pode continuar a conversa em qualquer uma delas.

## Configuração

### Variáveis de Ambiente

```bash
NEXT_PUBLIC_API_URL=http://api.spot-render.local
NEXT_PUBLIC_AI_API_URL=http://api.spot-render.local
```

### Backend (spot-render-api)

O backend precisa das seguintes variáveis de ambiente para o Ollama:

```bash
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=minimax-m3:cloud
```

> **Nota**: `host.docker.internal` é usado para acessar o Ollama rodando no host Docker a partir de containers Kubernetes em Docker Desktop.

## Modelos Suportados

O Spotinho funciona com qualquer modelo Ollama. Modelos testados:
- `minimax-m3:cloud` (padrão) - Modelo cloud com capacidades de reasoning
- `llama3.2:latest` - Modelo open source
- `qwen2:0.5b` - Modelo leve para testes

## API Endpoints

### `GET /ai/status`
Retorna o status do serviço de IA.

```json
{
  "available": true,
  "model": "minimax-m3:cloud",
  "base_url": "http://host.docker.internal:11434"
}
```

### `POST /ai/chat`
Envia uma mensagem para o Spotinho.

**Request:**
```json
{
  "message": "Como enviar um job?",
  "context": "contexto anterior...",
  "system_prompt": "prompt customizado...",
  "session_id": "id-da-sessao"
}
```

**Response:**
```json
{
  "response": "Resposta do Spotinho...",
  "session_id": "id-da-sessao",
  "sources": ["docs", "docs", "docs"]
}
```

## Segurança

O Spotinho possui filtros de segurança que:
- Bloqueiam exposição de credenciais
- Impedem geração de código malicioso
- Filtram conteúdo impróprio

## Troubleshooting

### Spotinho aparece como "offline"

1. Verifique se o Ollama está rodando:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Verifique se o backend consegue acessar o Ollama:
   ```bash
   kubectl exec -it <pod-backend> -- python3 -c "import httpx; print(httpx.get('http://host.docker.internal:11434/api/tags').status_code)"
   ```

3. Verifique as variáveis de ambiente do ConfigMap:
   ```bash
   kubectl get configmap spot-render-backend-config -n spot-render -o yaml
   ```

### Erro de CORS
O backend está configurado para permitir origens específicas. Adicione a origem do frontend ao CORS_ALLOW_ORIGINS no ConfigMap.

## Desenvolvimento Local

Para testar o Spotinho localmente:

1. Inicie o Ollama:
   ```bash
   ollama serve
   ```

2. Configure as variáveis:
   ```bash
   export OLLAMA_BASE_URL=http://localhost:11434
   ```

3. Inicie o backend:
   ```bash
   cd spot-render-api
   uvicorn app.main:app --reload
   ```

4. Inicie o frontend:
   ```bash
   cd spot-render-portal
   npm run dev
   ```
