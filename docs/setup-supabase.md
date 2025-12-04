# 🚀 Guia de Setup do Supabase - Nossa Maternidade

Este guia irá te ajudar a configurar o backend Supabase do app **Nossa Maternidade** com excelência.

## 📋 Pré-requisitos

- ✅ Conta no [Supabase](https://supabase.com) (gratuita)
- ✅ Node.js instalado (v16+)
- ✅ Git instalado

---

## 🎯 Passo a Passo

### 1️⃣ Criar Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: `nossa-maternidade`
   - **Database Password**: Crie uma senha forte (anote-a!)
   - **Region**: `South America (São Paulo)` - ou a mais próxima de você
   - **Pricing Plan**: Free (para testes)
4. Clique em **"Create new project"**
5. ⏱️ Aguarde 2-3 minutos enquanto o projeto é criado

---

### 2️⃣ Copiar Credenciais do Supabase

1. No dashboard do seu projeto, vá em **Settings** (⚙️) > **API**
2. Copie as seguintes informações:
   - **Project URL** (algo como: `https://xxx.supabase.co`)
   - **anon/public key** (token JWT longo)

3. Abra o arquivo `.env` na raiz do projeto
4. Substitua as variáveis:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...SEU_TOKEN_AQUI
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://SEU_PROJETO.supabase.co/functions/v1
```

⚠️ **IMPORTANTE**: Nunca exponha a `service_role_key` no código do cliente!

---

### 3️⃣ Aplicar Schema do Banco de Dados

#### Opção A: Via Dashboard (Recomendado para iniciantes)

1. No dashboard do Supabase, clique em **SQL Editor** (ícone 📝) no menu lateral
2. Clique em **"+ New query"**
3. Abra o arquivo `supabase/schema.sql` neste repositório
4. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
5. **Cole no editor SQL** do Supabase (Ctrl+V)
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. ⏱️ Aguarde 10-15 segundos enquanto as tabelas são criadas
8. ✅ Você deve ver uma mensagem "Success. No rows returned"

#### Opção B: Via CLI (Para desenvolvedores avançados)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Aplicar schema
supabase db push
```

---

### 4️⃣ Popular o Banco com Dados Iniciais (Seed)

1. No **SQL Editor** do Supabase, clique em **"+ New query"** novamente
2. Abra o arquivo `supabase/seed.sql` neste repositório
3. **Copie TODO o conteúdo** do arquivo
4. **Cole no editor SQL** do Supabase
5. Clique em **"Run"**
6. ✅ Você deve ver uma mensagem de sucesso

**O que foi populado:**

- ✅ 10 hábitos padrão (meditação, hidratação, caminhada, etc.)
- ✅ 24+ marcos de desenvolvimento do bebê (0-24 meses)
- ✅ 10+ conteúdos de exemplo (vídeos, áudios, artigos)

---

### 5️⃣ Verificar se o Schema foi Aplicado Corretamente

#### Via Dashboard:

1. Vá em **Table Editor** (ícone 🗂️)
2. Você deve ver as seguintes tabelas:
   - ✅ `profiles`
   - ✅ `habits`
   - ✅ `baby_milestones`
   - ✅ `content_items`
   - ✅ `chat_conversations`
   - ✅ `chat_messages`
   - ✅ `community_posts`
   - ✅ E outras...

3. Clique em `habits` → você deve ver 10 hábitos
4. Clique em `baby_milestones` → você deve ver ~24 marcos

#### Via Script de Teste:

```bash
# Instalar dependências (se ainda não tiver)
npm install

# Executar teste de conexão
npx ts-node scripts/test-supabase-connection.ts
```

**Saída esperada:**

```
🔍 Testando Conexão com Supabase...

✅ Conexão estabelecida! Encontrados 10 hábitos.
✅ Encontrados 24 marcos de desenvolvimento.
✅ Encontrados 10 conteúdos.
✅ Encontrados 3 storage buckets.

🎉 Supabase está configurado corretamente!
```

---

### 6️⃣ Configurar Autenticação (Providers)

1. No dashboard, vá em **Authentication** (🔐) > **Providers**
2. **Email** já vem habilitado por padrão ✅
3. (Opcional) Habilite outros provedores:
   - **Google**: Para login social
   - **Apple**: Obrigatório para iOS

#### Configurar Email Templates (Opcional)

1. Vá em **Authentication** > **Email Templates**
2. Personalize os templates:
   - ✉️ Confirmação de Email
   - 🔑 Redefinição de Senha
   - 📬 Magic Link

---

### 7️⃣ Verificar Row Level Security (RLS)

As políticas de segurança já foram aplicadas pelo schema. Para verificar:

1. Vá em **Authentication** > **Policies**
2. Ou vá em **Database** > selecione uma tabela > aba **Policies**
3. Você deve ver políticas como:
   - ✅ "Usuárias podem ver seu próprio perfil"
   - ✅ "Usuárias veem suas próprias conversas"
   - ✅ "Conteúdos publicados são visíveis para todos"

**⚠️ RLS está ATIVADO** em todas as tabelas para segurança!

---

### 8️⃣ Configurar Storage Buckets

Os buckets já foram criados automaticamente pelo schema:

1. Vá em **Storage** (📦)
2. Você deve ver 3 buckets:
   - ✅ `avatars` (público) - Fotos de perfil
   - ✅ `content` (público) - Vídeos, áudios, imagens
   - ✅ `community` (público) - Imagens de posts

**As políticas de acesso já estão configuradas!**

---

## ✅ Verificação Final

Execute o teste de conexão:

```bash
npx ts-node scripts/test-supabase-connection.ts
```

Se todos os testes passarem, você verá:

```
🎉 Supabase está configurado corretamente!
```

---

## 🧪 Testar no App

1. Inicie o app:

```bash
npm start
```

2. Faça login ou crie uma conta
3. Verifique se:
   - ✅ Login funciona
   - ✅ Perfil é criado automaticamente
   - ✅ Hábitos são carregados
   - ✅ Conteúdos aparecem no feed

---

## 🔐 Segurança - Checklist

- ✅ Row Level Security (RLS) está habilitado em todas as tabelas
- ✅ Usuárias só podem ver/editar seus próprios dados
- ✅ `anon_key` pode ser exposta no cliente (é segura)
- ⚠️ **NUNCA** exponha `service_role_key` no código do cliente
- ✅ Storage buckets têm políticas de acesso configuradas

---

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

| Tabela               | Descrição                                   |
| -------------------- | ------------------------------------------- |
| `profiles`           | Perfis das usuárias (1:1 com auth.users)    |
| `habits`             | Hábitos disponíveis no app                  |
| `user_habits`        | Hábitos que cada usuária escolheu           |
| `habit_logs`         | Registro de conclusão de hábitos            |
| `baby_milestones`    | Marcos de desenvolvimento do bebê           |
| `content_items`      | Conteúdos do feed (vídeos, áudios, artigos) |
| `chat_conversations` | Conversas do chat com IA                    |
| `chat_messages`      | Mensagens individuais                       |
| `community_posts`    | Posts da comunidade                         |
| `community_comments` | Comentários em posts                        |

### Storage Buckets

| Bucket      | Visibilidade | Uso                                |
| ----------- | ------------ | ---------------------------------- |
| `avatars`   | Público      | Fotos de perfil das usuárias       |
| `content`   | Público      | Mídia de conteúdo (vídeos, áudios) |
| `community` | Público      | Imagens de posts da comunidade     |

---

## 🆘 Troubleshooting

### ❌ Erro: "relation does not exist"

**Causa**: O schema não foi aplicado corretamente.

**Solução**: Execute o `schema.sql` novamente no SQL Editor.

---

### ❌ Erro: "JWT expired"

**Causa**: O token de autenticação expirou.

**Solução**: Faça logout e login novamente no app.

---

### ❌ Erro: "new row violates row-level security"

**Causa**: As policies RLS estão bloqueando a ação.

**Solução**:

1. Verifique se o usuário está autenticado
2. Confirme que as policies foram criadas corretamente
3. Veja os logs no dashboard do Supabase

---

### ❌ Erro de conexão

**Causa**: Variáveis de ambiente incorretas.

**Solução**:

1. Verifique o arquivo `.env`
2. Confirme que `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` estão corretas
3. Reinicie o app

---

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Authentication](https://supabase.com/docs/guides/auth)
- [Realtime](https://supabase.com/docs/guides/realtime)

---

## 🎯 Próximos Passos

Após configurar o Supabase com sucesso:

1. ✅ Teste todas as funcionalidades do app
2. ✅ Configure notificações push (opcional)
3. ✅ Configure CI/CD para migrations automáticas
4. ✅ Monitore uso e performance no dashboard
5. ✅ Configure backups automáticos
6. ✅ Implante em produção

---

## 💡 Dicas de Produção

- Use **eas secrets** para variáveis de ambiente em produção
- Configure backups automáticos diários
- Monitore o uso do banco no dashboard
- Configure alertas de performance
- Use CDN para storage de mídia
- Implemente rate limiting nas APIs

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no [Supabase Dashboard](https://app.supabase.com)
2. Consulte a [documentação oficial](https://supabase.com/docs)
3. Execute o script de teste: `npx ts-node scripts/test-supabase-connection.ts`
4. Abra uma issue no repositório

---

**✨ Parabéns! Seu backend Supabase está configurado com excelência!**
