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

### Informações do Dispositivo
O Spotinho detecta automaticamente:
- 📍 **Localização**: Cidade, região, país (via IP)
- 🔢 **IP**: Endereço IP público
- 🏢 **Operadora**: ISP (Internet Service Provider)
- 📶 **Velocidade**: Velocidade da conexão
- 📱 **Tipo de dispositivo**: Celular, Tablet ou Computador
- 🖥️ **Sistema Operacional**: Windows, macOS, Linux, Android, iOS
- 🌐 **Navegador**: Nome e versão
- 🗣️ **Idioma**: Idioma do navegador
- ⏰ **Fuso horário**: Timezone configurado
- 📐 **Resolução da tela**: Largura x Altura

### Síntese de Voz (TTS)
O Spotinho pode falar suas respostas!

**Funcionalidades:**
- Voz em português brasileiro
- Velocidade ajustável (0.5x a 2x)
- Tom ajustável
- Seleção de voz entre as disponíveis no sistema

**Controles:**
- 🔊 Ativar/desativar voz
- 🎤 Testar voz
- ⚙️ Configurações de voz

### Comando de Voz
O Spotinho pode ouvir e entender comandos de voz!

**Como usar:**
1. Clique no ícone 🎤 (microfone)
2. Permita o acesso ao microfone
3. Fale sua mensagem
4. O texto aparecerá automaticamente
5. Clique em enviar ou aguarde o envio automático

### Vídeo (Câmera)
O widget suporta preview de câmera:

1. Clique em 📷 para ligar a câmera
2. O preview aparece na parte superior do chat
3. Clique novamente para desligar

### Sincronização
Ambas as interfaces (widget e página completa) compartilham:
- Histórico de mensagens via `localStorage`
- Eventos `storage` para sincronização em tempo real
- Preferências de voz
- Contexto do usuário (nome, email, projeto)

### Criação de Jobs
O Spotinho pode ajudá-lo a criar jobs de renderização!

**Informações que o Spotinho coleta:**
1. Arquivos de cena (.fbx, .obj, .blend, etc.)
2. Nome do projeto
3. Variação/correção (ex: v1, v2, correção)
4. Nome do artista
5. Email para aviso
6. Render list (CSV/XLSX)
7. Preferências:
   - Receber aviso quando o job finalizar
   - Lembrar email para próximos envios
   - Esta submissão é uma correção

**Fluxo:**
1. Diga "Quero enviar um job" ou "Criar job"
2. O Spotinho fará perguntas para coletar as informações
3. Após coletar tudo, você será instruído a usar o formulário
4. Suas informações ficam salvas para próximos jobs

## Configuração

### Variáveis de Ambiente

**Frontend (spot-render-portal):**
```bash
NEXT_PUBLIC_API_URL=http://api.spot-render.local
NEXT_PUBLIC_AI_API_URL=http://api.spot-render.local
```

**Backend (spot-render-api):**
```bash
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=minimax-m3:cloud
```

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

### microfone não funciona

1. Verifique se o navegador suporta Web Speech API
2. Permita o acesso ao microfone no navegador
3. Verifique se há outro aplicativo usando o microfone

### Voz não funciona

1. Verifique se a síntese de voz está ativada
2. Verifique se há vozes em português disponíveis
3. Tente selecionar uma voz diferente nas configurações

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
