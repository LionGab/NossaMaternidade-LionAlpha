# 🚀 Guia Completo de Setup do Supabase

## ⚠️ Problema Identificado

O app está quebrado porque **faltam tabelas críticas** no Supabase:
- ❌ `community_likes` (causa erro PGRST205)
- ❌ `consent_terms_versions` (bloqueia consentimentos)
- ❌ `user_consents` (bloqueia consentimentos)

## ✅ Solução: Aplicar Migrations

### Opção 1: SQL Editor (Mais Rápido - Recomendado)

1. **Acesse o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/<seu-projeto-id>
   ```

2. **Vá para SQL Editor:**
   - Clique no ícone `</>` no menu lateral
   - Clique em **"New Query"**

3. **Execute o Script Completo:**
   - Abra o arquivo `SUPABASE_SETUP_COMPLETE.sql` neste repositório
   - **Copie TODO o conteúdo** (é um arquivo grande, ~1000 linhas)
   - Cole no SQL Editor
   - Clique em **"Run"** (ou pressione `Ctrl+Enter`)

4. **Aguarde a execução:**
   - Deve levar ~30-60 segundos
   - Você verá mensagens de sucesso no final:
     ```
     ✅ Setup completo!
        Tabelas criadas: 14
        ENUMs criados: 12
     ```

5. **Verifique se funcionou:**
   - Vá em **Table Editor** no menu lateral
   - Você deve ver todas as tabelas listadas, incluindo:
     - ✅ `community_likes`
     - ✅ `consent_terms_versions`
     - ✅ `user_consents`
     - ✅ `community_posts`
     - ✅ `profiles`
     - E mais 9 tabelas...

### Opção 2: CLI do Supabase (Para Desenvolvedores)

Se você tem o Supabase CLI instalado e configurado:

```bash
# 1. Encontre seu Project Reference ID
#    Dashboard → Settings → General → "Reference ID"

# 2. Link com seu projeto
npx supabase link --project-ref <seu-project-ref>

# 3. Aplicar migrations
npx supabase db push
```

**Nota:** Se você não tem o CLI configurado, use a **Opção 1** (SQL Editor) que é mais rápida.

---

## 🔍 Verificação Pós-Setup

### 1. Verificar Tabelas Criadas

Execute no SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'community_likes',
    'consent_terms_versions',
    'user_consents',
    'community_posts',
    'profiles'
  )
ORDER BY table_name;
```

**Resultado esperado:** 5 linhas retornadas.

### 2. Verificar RLS Policies

Execute no SQL Editor:

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('community_posts', 'community_likes', 'user_consents')
ORDER BY tablename, policyname;
```

**Resultado esperado:** Várias políticas listadas para cada tabela.

### 3. Testar o App

Após aplicar o script:

1. **Reinicie o Metro Bundler:**
   ```bash
   # Pare o servidor atual (Ctrl+C)
   npx expo start --clear
   ```

2. **Teste no Expo Go:**
   - Escaneie o QR code novamente
   - Tente acessar a tela de **Comunidade**
   - O erro `PGRST205` deve desaparecer

3. **Teste Consentimentos:**
   - Ao abrir o app, deve aparecer a tela de consentimento
   - Aceite os consentimentos obrigatórios
   - O app deve funcionar normalmente

---

## 🐛 Troubleshooting

### Erro: "relation already exists"

**Causa:** Algumas tabelas já existem no banco.

**Solução:** O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar novamente. Se ainda der erro, você pode:

1. **Verificar quais tabelas já existem:**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

2. **Se necessário, dropar tabelas específicas (CUIDADO!):**
   ```sql
   -- ⚠️ APENAS SE VOCÊ TEM CERTEZA!
   DROP TABLE IF EXISTS community_likes CASCADE;
   -- Depois execute o script completo novamente
   ```

### Erro: "type already exists"

**Causa:** ENUMs já foram criados.

**Solução:** O script usa `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;`, então é seguro. Pode ignorar o erro.

### Erro: "permission denied"

**Causa:** Você não tem permissão para criar tabelas.

**Solução:** 
- Certifique-se de estar logado no Supabase Dashboard
- Use uma conta com permissões de administrador do projeto
- Se necessário, peça ao dono do projeto para executar o script

### App ainda mostra erro após aplicar

**Possíveis causas:**

1. **Cache do Metro Bundler:**
   ```bash
   npx expo start --clear
   ```

2. **Cache do Expo Go:**
   - Feche completamente o Expo Go
   - Reabra e escaneie o QR code novamente

3. **Variáveis de ambiente:**
   - Verifique se `.env` está configurado corretamente
   - Verifique se `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` estão corretos

4. **RLS bloqueando:**
   - Verifique se você está autenticado no app
   - As policies RLS só permitem acesso para usuários autenticados

---

## 📋 Checklist Final

Após aplicar o script, verifique:

- [ ] ✅ Tabela `community_likes` existe
- [ ] ✅ Tabela `consent_terms_versions` existe
- [ ] ✅ Tabela `user_consents` existe
- [ ] ✅ Tabela `community_posts` existe
- [ ] ✅ RLS está habilitado em todas as tabelas
- [ ] ✅ Policies RLS foram criadas
- [ ] ✅ App não mostra mais erro PGRST205
- [ ] ✅ Tela de Comunidade carrega sem erros
- [ ] ✅ Consentimentos funcionam corretamente

---

## 🎯 Próximos Passos

Após resolver os problemas do banco:

1. **Testar todas as telas:**
   - ✅ Home
   - ✅ Comunidade
   - ✅ Chat
   - ✅ Hábitos
   - ✅ Mundo Nath

2. **Verificar consentimentos:**
   - Aceitar consentimentos obrigatórios
   - Testar revogação de consentimentos opcionais

3. **Testar funcionalidades:**
   - Criar post na comunidade
   - Dar like em posts
   - Comentar em posts
   - Iniciar conversa com NathIA

---

## 📞 Suporte

Se ainda tiver problemas após seguir este guia:

1. **Verifique os logs do Supabase:**
   - Dashboard → Logs → Postgres Logs

2. **Verifique os logs do app:**
   - Console do Metro Bundler
   - Logs do Expo Go

3. **Execute diagnóstico:**
   ```bash
   npm run diagnose:production
   ```

---

**Última atualização:** 6 de dezembro de 2025


