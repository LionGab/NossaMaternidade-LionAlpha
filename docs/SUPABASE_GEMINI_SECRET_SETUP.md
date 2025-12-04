# 🔐 Configurar GEMINI_API_KEY no Supabase Dashboard

Este guia mostra como configurar a `GEMINI_API_KEY` como **SECRET** nas Edge Functions do Supabase, garantindo que a chave nunca seja exposta no código do app.

## ⚠️ Por que usar Secrets?

- ✅ **Segurança**: API keys nunca vão para o bundle do app
- ✅ **LGPD Compliance**: Dados sensíveis protegidos
- ✅ **Custo**: Evita uso não autorizado da sua API key
- ✅ **Best Practice**: Padrão recomendado para produção

## 📋 Pré-requisitos

1. ✅ Conta no [Google AI Studio](https://makersuite.google.com/app/apikey)
2. ✅ API Key do Gemini gerada (formato: `AIzaSy...`)
3. ✅ Projeto Supabase criado
4. ✅ Acesso ao Supabase Dashboard

## 🚀 Método 1: Via Supabase Dashboard (Recomendado)

### Passo 1: Acessar o Dashboard

1. Acesse [Supabase Dashboard](https://app.supabase.com/)
2. Faça login com sua conta
3. Selecione seu projeto **Nossa Maternidade**

### Passo 2: Navegar para Edge Functions

1. No menu lateral esquerdo, clique em **Edge Functions**
2. Clique em **Settings** (ícone de engrenagem) no topo da página
3. Ou acesse diretamente: `https://app.supabase.com/project/[seu-project-id]/settings/functions`

### Passo 3: Adicionar Secret

1. Na seção **Secrets**, você verá uma lista de secrets existentes (se houver)
2. Clique no botão **"Add new secret"** ou **"New secret"**
3. Preencha os campos:
   - **Name**: `GEMINI_API_KEY` (exatamente assim, sem espaços)
   - **Value**: Cole sua API key do Gemini (ex: `AIzaSyBxYZ1234567890ABCDEFGHIJKLMNOPqrstuvwxyz`)
4. Clique em **"Save"** ou **"Add secret"**

### Passo 4: Verificar

1. Você deve ver `GEMINI_API_KEY` na lista de secrets
2. O valor estará mascarado (ex: `AIzaSy...xyz`)
3. ✅ **Pronto!** A chave está configurada

## 🛠️ Método 2: Via Supabase CLI (Alternativa)

Se você prefere usar a linha de comando:

### Passo 1: Instalar Supabase CLI

```bash
# Windows (PowerShell)
winget install Supabase.CLI

# macOS
brew install supabase/tap/supabase

# Linux
npm install -g supabase
```

### Passo 2: Fazer Login

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

### Passo 3: Linkar Projeto

```bash
# Na raiz do projeto NossaMaternidade
supabase link --project-ref seu-project-id
```

O `project-ref` está na URL do Dashboard: `https://app.supabase.com/project/[project-ref]`

### Passo 4: Configurar Secret

```bash
supabase secrets set GEMINI_API_KEY=AIzaSyBxYZ1234567890ABCDEFGHIJKLMNOPqrstuvwxyz
```

**⚠️ ATENÇÃO**: No Windows PowerShell, use aspas:

```powershell
supabase secrets set GEMINI_API_KEY="AIzaSyBxYZ1234567890ABCDEFGHIJKLMNOPqrstuvwxyz"
```

### Passo 5: Verificar

```bash
supabase secrets list
```

Deve mostrar `GEMINI_API_KEY` na lista.

## ✅ Verificar se Está Funcionando

### Teste 1: Verificar na Edge Function

A Edge Function `chat-gemini` já está configurada para usar o secret:

```32:36:supabase/functions/chat-gemini/index.ts
    // 🔐 Chave segura no servidor - NUNCA vai para o app!
    const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_KEY) {
      console.error('GEMINI_API_KEY não configurada');
      throw new Error('Configuração de IA inválida');
```

### Teste 2: Deploy e Teste Manual

1. **Deploy da Edge Function** (se ainda não fez):

```bash
supabase functions deploy chat-gemini
```

2. **Teste via curl** (substitua `[project-ref]` e `[anon-key]`):

```bash
curl -X POST \
  'https://[project-ref].supabase.co/functions/v1/chat-gemini' \
  -H 'Authorization: Bearer [anon-key]' \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Olá, NathIA!"
      }
    ]
  }'
```

**Resposta esperada:**

```json
{
  "text": "Olá! Como posso ajudar você hoje?",
  "success": true,
  "model": "gemini-2.0-flash",
  "timestamp": 1234567890
}
```

### Teste 3: Verificar Logs

1. No Supabase Dashboard, vá para **Edge Functions** > **chat-gemini**
2. Clique em **Logs**
3. Faça uma requisição de teste
4. Verifique se não há erros como `"GEMINI_API_KEY não configurada"`

## 🔒 Segurança Adicional

### Restringir API Key no Google Cloud

Para evitar uso não autorizado:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá para **APIs & Services** > **Credentials**
3. Clique na sua API key
4. Em **"API restrictions"**, selecione apenas:
   - ✅ **Generative Language API**
5. Em **"Application restrictions"**, configure:
   - **IP addresses**: Adicione os IPs do Supabase (opcional)
6. Clique em **"Save"**

### Rotacionar API Key (Boa Prática)

A cada 90 dias (ou se suspeitar de vazamento):

1. Gere nova key no Google AI Studio
2. Atualize no Supabase Dashboard (mesmo processo)
3. Teste a Edge Function
4. Revogue a key antiga no Google Cloud Console

## 🆘 Troubleshooting

### Erro: "GEMINI_API_KEY não configurada"

**Causa**: Secret não foi configurado ou nome está errado

**Solução**:
1. Verifique se o nome do secret é exatamente `GEMINI_API_KEY` (case-sensitive)
2. Verifique se o valor foi salvo corretamente
3. Tente remover e adicionar novamente
4. Aguarde 1-2 minutos após adicionar (pode levar tempo para propagar)

### Erro: "403 Forbidden" na Edge Function

**Causa**: API key inválida ou restrições no Google Cloud

**Solução**:
1. Verifique se a key está correta (copie novamente do Google AI Studio)
2. Verifique se a key não expirou
3. Remova restrições temporariamente no Google Cloud Console

### Erro: "429 Too Many Requests"

**Causa**: Excedeu quota do Gemini (1,500 requests/dia no free tier)

**Solução**:
1. Aguarde até o próximo dia
2. Ou solicite aumento de quota no Google Cloud Console
3. Ou configure fallback para OpenAI/Claude

### Secret não aparece após adicionar

**Causa**: Cache do dashboard ou propagação lenta

**Solução**:
1. Recarregue a página (F5)
2. Aguarde 1-2 minutos
3. Verifique via CLI: `supabase secrets list`

## 📝 Checklist Final

Antes de prosseguir para o deploy:

- [ ] API key do Gemini obtida no Google AI Studio
- [ ] Secret `GEMINI_API_KEY` configurado no Supabase Dashboard
- [ ] Valor do secret verificado (mascarado no dashboard)
- [ ] Edge Function `chat-gemini` deployada
- [ ] Teste manual via curl funcionando
- [ ] Logs da Edge Function sem erros
- [ ] API restrictions configuradas no Google Cloud (opcional)

## 🔗 Próximos Passos

Após configurar o secret:

1. ✅ **Deploy da Edge Function**: `supabase functions deploy chat-gemini`
2. ✅ **Testar integração**: Verificar se NathIA responde no app
3. ✅ **Monitorar uso**: Acompanhar logs e custos no Google Cloud Console
4. ✅ **Configurar fallback**: Garantir que OpenAI/Claude estão prontos como backup

## 📚 Referências

- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Edge Function chat-gemini](../supabase/functions/chat-gemini/index.ts)
- [Checklist Completo](./CHECKLIST_GEMINI_SETUP.md)

## 🛠️ Scripts Disponíveis

Após configurar o secret, use os scripts automatizados:

```bash
# Validar configuração do secret
npm run validate:gemini-secret

# Testar Edge Function
npm run test:gemini-edge

# Deploy completo (com validação e teste)
npm run deploy:gemini

# Deploy sem teste
npm run deploy:gemini:skip-test
```

---

**Última atualização**: 1 de dezembro de 2025  
**Versão**: 1.0.0

