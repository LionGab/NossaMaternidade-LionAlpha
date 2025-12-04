# ✅ Checklist: Configuração GEMINI_API_KEY

Checklist completo para configurar e validar a `GEMINI_API_KEY` no Supabase.

## 📋 Pré-requisitos

- [ ] Conta criada no [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] API Key do Gemini gerada (formato: `AIzaSy...`)
- [ ] Projeto Supabase criado
- [ ] Acesso ao Supabase Dashboard
- [ ] Supabase CLI instalado (opcional, mas recomendado)

## 🔧 Configuração

### Passo 1: Obter API Key do Gemini

- [ ] Acessar [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Fazer login com conta Google
- [ ] Clicar em **"Get API key"**
- [ ] Escolher **"Create API key in new project"** ou projeto existente
- [ ] Copiar a API key gerada (formato: `AIzaSy...`)
- [ ] Guardar em local seguro (não commitar no Git!)

### Passo 2: Configurar Secret no Supabase

**Opção A: Via Dashboard (Recomendado para iniciantes)**

- [ ] Acessar [Supabase Dashboard](https://app.supabase.com/)
- [ ] Selecionar projeto **Nossa Maternidade**
- [ ] Ir em **Edge Functions** → **Settings**
- [ ] Na seção **Secrets**, clicar em **"Add new secret"**
- [ ] Preencher:
  - **Name**: `GEMINI_API_KEY` (exatamente assim)
  - **Value**: Colar a API key do Gemini
- [ ] Clicar em **"Save"**
- [ ] Verificar que `GEMINI_API_KEY` aparece na lista (valor mascarado)

**Opção B: Via CLI (Recomendado para desenvolvedores)**

- [ ] Instalar Supabase CLI: `npm install -g supabase`
- [ ] Fazer login: `supabase login`
- [ ] Linkar projeto: `supabase link --project-ref [seu-project-ref]`
- [ ] Configurar secret: `supabase secrets set GEMINI_API_KEY="AIzaSy..."`
- [ ] Verificar: `supabase secrets list`

### Passo 3: Validar Configuração

- [ ] Executar validação: `npm run validate:gemini-secret`
- [ ] Verificar que todos os checks passam:
  - ✅ Supabase CLI instalado
  - ✅ Projeto linkado
  - ✅ GEMINI_API_KEY configurado
  - ✅ Edge Function existe

## 🚀 Deploy

### Passo 4: Deploy da Edge Function

- [ ] Verificar que a função existe: `supabase/functions/chat-gemini/index.ts`
- [ ] Executar deploy automatizado: `npm run deploy:gemini`
- [ ] Ou deploy manual: `supabase functions deploy chat-gemini`
- [ ] Verificar sucesso no output

### Passo 5: Testar Edge Function

- [ ] Executar teste: `npm run test:gemini-edge`
- [ ] Verificar que a função responde corretamente
- [ ] Verificar que a resposta do Gemini está correta
- [ ] Verificar tempo de resposta (< 5 segundos)

## 🔍 Verificações Finais

### Segurança

- [ ] ✅ API key **NÃO** está no arquivo `.env` (ou está comentada)
- [ ] ✅ API key **NÃO** está no código (não usar `EXPO_PUBLIC_GEMINI_API_KEY`)
- [ ] ✅ Secret está configurado apenas no Supabase
- [ ] ✅ API restrictions configuradas no Google Cloud (opcional)

### Funcionalidade

- [ ] ✅ Edge Function deployada com sucesso
- [ ] ✅ Teste manual passou
- [ ] ✅ Logs da Edge Function sem erros
- [ ] ✅ Resposta do Gemini está correta

### Monitoramento

- [ ] ✅ Logs do Supabase Dashboard verificados
- [ ] ✅ Google Cloud Console configurado para monitorar uso
- [ ] ✅ Alertas de quota configurados (opcional)

## 📝 Comandos Úteis

```bash
# Validar secret
npm run validate:gemini-secret

# Testar Edge Function
npm run test:gemini-edge

# Deploy completo (com validação e teste)
npm run deploy:gemini

# Deploy sem teste
npm run deploy:gemini:skip-test

# Ver secrets configurados
supabase secrets list

# Ver logs da Edge Function
supabase functions logs chat-gemini
```

## 🆘 Troubleshooting

### Secret não encontrado

- [ ] Verificar nome do secret: deve ser exatamente `GEMINI_API_KEY`
- [ ] Verificar se está no projeto correto
- [ ] Aguardar 1-2 minutos após adicionar (propagação)
- [ ] Tentar remover e adicionar novamente

### Edge Function retorna erro

- [ ] Verificar logs: `supabase functions logs chat-gemini`
- [ ] Verificar se API key está válida no Google AI Studio
- [ ] Verificar se não excedeu quota (1,500 requests/dia free tier)
- [ ] Testar API key diretamente via curl

### Deploy falha

- [ ] Verificar se Supabase CLI está atualizado
- [ ] Verificar se projeto está linkado
- [ ] Verificar permissões no Supabase
- [ ] Verificar se Edge Function existe no caminho correto

## 📚 Documentação Relacionada

- [Guia Completo de Setup](./SUPABASE_GEMINI_SECRET_SETUP.md)
- [Configuração do Gemini](./GEMINI_SETUP.md)
- [Edge Function chat-gemini](../supabase/functions/chat-gemini/index.ts)

## ✅ Status Final

- [ ] **Tudo configurado e funcionando!**
- [ ] **Pronto para usar no app**

---

**Última atualização**: 1 de dezembro de 2025

