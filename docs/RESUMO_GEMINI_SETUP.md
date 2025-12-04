# 🚀 Resumo Executivo: Configuração GEMINI_API_KEY

Guia rápido para configurar a `GEMINI_API_KEY` no Supabase e fazer deploy da Edge Function.

## ⚡ Quick Start (5 minutos)

### 1. Obter API Key
- Acesse: https://makersuite.google.com/app/apikey
- Clique em **"Get API key"**
- Copie a key gerada (formato: `AIzaSy...`)

### 2. Configurar no Supabase Dashboard
- Acesse: https://app.supabase.com/
- Selecione seu projeto
- **Edge Functions** → **Settings** → **Secrets**
- **Add new secret**:
  - Name: `GEMINI_API_KEY`
  - Value: sua API key
- **Save**

### 3. Validar e Deploy
```bash
# Validar configuração
npm run validate:gemini-secret

# Deploy da Edge Function
npm run deploy:gemini

# Testar
npm run test:gemini-edge
```

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run validate:gemini-secret` | Valida se o secret está configurado |
| `npm run test:gemini-edge` | Testa a Edge Function |
| `npm run deploy:gemini` | Deploy completo (com validação e teste) |
| `npm run deploy:gemini:skip-test` | Deploy sem teste |

## 🔧 Métodos de Configuração

### Método 1: Dashboard (Recomendado)
✅ Mais fácil para iniciantes  
✅ Interface visual  
✅ Não precisa instalar CLI

**Passos:**
1. Dashboard → Edge Functions → Settings → Secrets
2. Add new secret → `GEMINI_API_KEY` → Value
3. Save

### Método 2: CLI (Recomendado para devs)
✅ Mais rápido  
✅ Automatizável  
✅ Integra com scripts

**Passos:**
```bash
supabase login
supabase link --project-ref [ref]
supabase secrets set GEMINI_API_KEY="AIzaSy..."
```

## ✅ Checklist Rápido

- [ ] API key obtida no Google AI Studio
- [ ] Secret configurado no Supabase (Dashboard ou CLI)
- [ ] Validação passou: `npm run validate:gemini-secret`
- [ ] Edge Function deployada: `npm run deploy:gemini`
- [ ] Teste passou: `npm run test:gemini-edge`

## 🆘 Problemas Comuns

### "GEMINI_API_KEY não configurado"
**Solução:** Configure o secret no Dashboard ou via CLI

### "Edge Function não encontrada (404)"
**Solução:** Faça deploy: `npm run deploy:gemini`

### "Erro 401/403"
**Solução:** Verifique se a anon key está correta no `.env`

### "429 Too Many Requests"
**Solução:** Excedeu quota (1,500/dia free tier). Aguarde ou aumente quota.

## 📚 Documentação Completa

- **[Guia Completo](./SUPABASE_GEMINI_SECRET_SETUP.md)** - Passo a passo detalhado
- **[Checklist Completo](./CHECKLIST_GEMINI_SETUP.md)** - Checklist detalhado
- **[Configuração Gemini](./GEMINI_SETUP.md)** - Guia geral do Gemini

## 🎯 Próximos Passos

Após configurar:

1. ✅ **Usar no app**: A Edge Function está pronta para uso
2. ✅ **Monitorar**: Acompanhe logs no Supabase Dashboard
3. ✅ **Otimizar**: Configure fallback para OpenAI/Claude se necessário

---

**Tempo estimado:** 5-10 minutos  
**Dificuldade:** ⭐ Fácil  
**Status:** ✅ Pronto para produção

