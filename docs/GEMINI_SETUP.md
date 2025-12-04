# Guia de Configuração do Google Gemini AI

Este guia detalha como obter e configurar a API key do Google Gemini para o app Nossa Maternidade.

## 📋 O que é o Google Gemini?

Google Gemini é o modelo de IA multimodal do Google, usado no Nossa Maternidade para:

- Chat com NathIA (assistente maternal)
- Análise de emoções e check-ins
- Recomendações de conteúdo personalizadas
- Análise de hábitos e sugestões
- Moderação de conteúdo da comunidade

## 🚀 Passo 1: Criar Conta no Google AI Studio

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Aceite os Termos de Serviço

## 🔑 Passo 2: Obter API Key

1. No Google AI Studio, clique em **"Get API key"** (canto superior direito)
2. Escolha uma das opções:
   - **"Create API key in new project"** (Recomendado para novo projeto)
   - **"Create API key in existing project"** (Se já tem um projeto Google Cloud)

3. Aguarde alguns segundos
4. Sua API key será gerada (formato: `AIzaSy...`)
5. **⚠️ IMPORTANTE:** Copie e guarde a key em local seguro

### Exemplo de API Key:

```
AIzaSyBxYZ1234567890ABCDEFGHIJKLMNOPqrstuvwxyz
```

## 📝 Passo 3: Configurar no Projeto

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione a API key:
   ```bash
   GEMINI_API_KEY=AIzaSyBxYZ1234567890ABCDEFGHIJKLMNOPqrstuvwxyz
   ```
3. Salve o arquivo

## ⚙️ Passo 4: Configurar Rate Limits e Quotas

### Free Tier (Padrão)

O Google Gemini oferece um tier gratuito generoso:

| Métrica             | Free Tier  | Pago (Pay-as-you-go) |
| ------------------- | ---------- | -------------------- |
| **Requests/minuto** | 60 RPM     | 360+ RPM             |
| **Requests/dia**    | 1,500 RPD  | Ilimitado            |
| **Tokens/minuto**   | 32,000 TPM | 4,000,000 TPM        |
| **Custo**           | $0         | ~$0.00025/1K chars   |

### Verificar Quotas

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto
3. Vá para **APIs & Services** > **Enabled APIs & services**
4. Procure por **"Generative Language API"**
5. Clique em **"Quotas"** para ver limites atuais

### Aumentar Quotas (Se Necessário)

Para apps em produção com muitos usuários:

1. No [Google Cloud Console](https://console.cloud.google.com/), vá para **IAM & Admin** > **Quotas**
2. Procure por **"Generative Language API"**
3. Selecione as quotas que deseja aumentar:
   - `GenerateContentRequestsPerMinutePerProjectPerRegion`
   - `GenerateContentTokensPerMinutePerProjectPerRegion`
4. Clique em **"Edit Quotas"**
5. Preencha o formulário de solicitação
6. Aguarde aprovação (geralmente 1-2 dias úteis)

## 🔒 Passo 5: Configurar Segurança (Produção)

### API Key Restrictions (Recomendado)

Para evitar uso não autorizado da sua key:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá para **APIs & Services** > **Credentials**
3. Clique na sua API key
4. Em **"API restrictions"**, selecione:
   - ✅ **Generative Language API**
   - ❌ Desmarque todas as outras
5. Em **"Application restrictions"**, escolha:
   - **None** (para desenvolvimento)
   - **HTTP referrers** (para web apps)
   - **Android apps** (adicione package name: `com.nossamaternidade.app`)
   - **iOS apps** (adicione bundle ID: `com.nossamaternidade.app`)
6. Clique em **"Save"**

### Usar Edge Functions (Mais Seguro)

⚠️ **NUNCA exponha a API key diretamente no código do app!**

Para produção, use Supabase Edge Functions:

```typescript
// supabase/functions/chat-ai/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);

serve(async (req) => {
  const { message, context } = await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  const result = await model.generateContent(message);

  return new Response(JSON.stringify({ text: result.response.text() }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Deploy:**

```bash
supabase functions deploy chat-ai
supabase secrets set GEMINI_API_KEY=your-key-here
```

## 🧪 Passo 6: Testar Integração

### Teste Manual (via curl)

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts":[{
        "text": "Olá! Sou uma mãe grávida de 20 semanas. Como está o desenvolvimento do meu bebê?"
      }]
    }]
  }'
```

**Resposta esperada:**

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Parabéns pela gravidez! Na 20ª semana..."
          }
        ]
      }
    }
  ]
}
```

### Teste via App

1. Execute o app:
   ```bash
   npm start
   ```
2. Abra o app no simulador/emulador
3. Vá para **Chat** > **NathIA**
4. Envie uma mensagem: _"Olá, NathIA!"_
5. Aguarde resposta

**✅ Sucesso:** NathIA responde com mensagem personalizada  
**❌ Erro:** Verifique logs e credenciais

### Teste via Script

```bash
npm run test:connection
```

Deve mostrar:

```
✅ Gemini API connection: OK
✅ Model available: gemini-2.0-flash-exp
✅ Response time: 1.2s
```

## 📊 Passo 7: Monitorar Uso

### Via Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá para **APIs & Services** > **Dashboard**
3. Clique em **"Generative Language API"**
4. Veja métricas:
   - Requests/minuto
   - Erros
   - Latência média
   - Tokens consumidos

### Alertas de Quota

Configure alertas para evitar surpresas:

1. No Console, vá para **Monitoring** > **Alerting**
2. Clique em **"Create Policy"**
3. Configure:
   - **Condition**: "Quota usage" > 80%
   - **Notification**: Email
4. Salve

## 🔄 Modelos Disponíveis

O Nossa Maternidade usa diferentes modelos conforme o caso:

| Modelo                 | Uso                              | Custo        | Velocidade        |
| ---------------------- | -------------------------------- | ------------ | ----------------- |
| `gemini-2.0-flash-exp` | Chat normal, recomendações       | Free / Baixo | ⚡ Rápido (1-2s)  |
| `gemini-1.5-flash`     | Análise simples                  | Free / Baixo | ⚡ Rápido         |
| `gemini-1.5-pro`       | Análise profunda, contexto longo | Médio        | 🐢 Lento (3-5s)   |
| `gemini-1.5-flash-8b`  | Embeddings                       | Muito baixo  | ⚡⚡ Muito rápido |

### Configuração no Código

```typescript
// src/ai/llmConfig.ts
export const LLM_PROFILES = {
  CHAT_DEFAULT: {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 1000,
  },
  ANALYSIS_DEEP: {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    temperature: 0.3,
    maxTokens: 2000,
  },
};
```

## ⚠️ Limitações e Considerações

### Free Tier

- 1,500 requests/dia = suficiente para ~50 usuárias ativas
- Não disponível em produção de larga escala
- Latência pode variar

### Rate Limiting

O app já implementa rate limiting automático:

```typescript
// src/services/geminiService.ts
const RATE_LIMIT = {
  maxRequestsPerMinute: 50, // Abaixo do limite de 60
  retryAfter: 5000, // 5 segundos
  maxRetries: 3,
};
```

### Fallback

O app usa fallback automático para OpenAI/Claude se Gemini falhar:

```typescript
// src/agents/helpers/llmRouter.ts
export async function routeRequest(context: RoutingContext) {
  try {
    return await geminiRequest(context);
  } catch (geminiError) {
    logger.warn('Gemini failed, falling back to GPT-4o');
    return await openaiRequest(context);
  }
}
```

## ✅ Checklist de Verificação

Antes de seguir para o próximo passo:

- [ ] Conta criada no Google AI Studio
- [ ] API key gerada com sucesso
- [ ] API key adicionada ao `.env`
- [ ] Teste manual (curl) funciona
- [ ] Teste via app funciona (NathIA responde)
- [ ] `npm run test:connection` passa
- [ ] Quotas verificadas (>1,500 RPD para produção)
- [ ] API restrictions configuradas (opcional)
- [ ] Monitoramento configurado (opcional)

## 🆘 Troubleshooting

### Erro: "API key not valid"

**Causa:** Key incorreta ou malformatada  
**Solução:** Recopie a key do Google AI Studio

### Erro: "429 Too Many Requests"

**Causa:** Excedeu rate limit (60 RPM / 1,500 RPD)  
**Solução:** Aguarde 1 minuto ou solicite aumento de quota

### Erro: "403 Forbidden"

**Causa:** API restrictions bloqueando requisições  
**Solução:** Remova restrictions temporariamente ou configure corretamente

### Erro: "Model not found"

**Causa:** Modelo não disponível na região ou outdated  
**Solução:** Use `gemini-1.5-flash` ou `gemini-1.5-pro`

### Resposta muito lenta (>10s)

**Causa:** Usando modelo pesado (`gemini-1.5-pro`) ou rede lenta  
**Solução:** Use `gemini-2.0-flash-exp` para respostas rápidas

## 📚 Recursos Adicionais

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini Pricing](https://ai.google.dev/pricing)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Quota Limits](https://ai.google.dev/docs/quota)

## 🔗 Próximos Passos

Após concluir este setup:

1. ✅ Marcar to-do `setup-gemini` como completo
2. ➡️ Prosseguir para `setup-env` (validação final de todas as variáveis)
3. ➡️ Prosseguir para migração de design system

---

**Última atualização:** 28 de novembro de 2025  
**Versão:** 1.0.0
