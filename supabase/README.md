# Supabase Setup - Nossa Maternidade

Guia completo para configurar o backend Supabase do app Nossa Maternidade.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Supabase CLI instalado (opcional, mas recomendado)

## 🚀 Setup Rápido

### 1. Criar Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Name**: nossa-maternidade
   - **Database Password**: (crie uma senha forte)
   - **Region**: South America (São Paulo) - escolha a mais próxima
4. Aguarde a criação (2-3 minutos)

### 2. Aplicar Schema do Banco

Existem duas formas de aplicar o schema:

#### Opção A: Via Dashboard (Mais Fácil)

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `schema.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a execução (pode levar 10-15 segundos)
6. Repita o processo com o arquivo `seed.sql` para dados iniciais

#### Opção B: Via CLI (Recomendado para Dev)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Aplicar migrations
supabase db push

# Aplicar seed
supabase db execute -f ./supabase/seed.sql
```

### 3. Configurar Variáveis de Ambiente

1. No dashboard, vá em **Settings** > **API**
2. Copie:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

3. Cole no arquivo `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Configurar Autenticação

1. Vá em **Authentication** > **Providers**
2. Habilite os provedores desejados:
   - ✅ Email (já vem habilitado)
   - ✅ Google (recomendado)
   - ✅ Apple (para iOS)

#### Configurar Email Templates

1. Vá em **Authentication** > **Email Templates**
2. Personalize os templates de:
   - Confirmação de Email
   - Redefinição de Senha
   - Convite
   - Magic Link

### 5. Configurar Storage

Os buckets já foram criados automaticamente pelo schema:

- **avatars**: Fotos de perfil das usuárias
- **content**: Vídeos, áudios e imagens de conteúdo
- **community**: Imagens de posts da comunidade

Para configurar CORS (se necessário):

1. Vá em **Storage** > **Policies**
2. Os policies já estão configurados pelo schema
3. Se precisar ajustar, edite conforme necessário

### 6. Verificar RLS (Row Level Security)

As políticas RLS já foram aplicadas pelo schema. Verifique:

1. Vá em **Database** > **Tables**
2. Clique em cada tabela
3. Vá na aba **Policies**
4. Confirme que as policies estão ativas

## 📊 Estrutura do Banco

### Tabelas Principais

- **profiles**: Perfis das usuárias (1:1 com auth.users)
- **chat_conversations**: Conversas do chat com IA
- **chat_messages**: Mensagens individuais
- **content_items**: Conteúdos do feed
- **user_content_interactions**: Likes, saves, progresso
- **habits**: Hábitos disponíveis
- **user_habits**: Hábitos das usuárias
- **habit_logs**: Registro de conclusão
- **community_posts**: Posts da comunidade
- **community_comments**: Comentários
- **community_likes**: Curtidas
- **baby_milestones**: Marcos de desenvolvimento
- **user_baby_milestones**: Progresso individual

### Storage Buckets

- **avatars**: Público - Fotos de perfil
- **content**: Público - Mídia de conteúdo
- **community**: Público - Imagens de posts

## 🧪 Testar Configuração

### Via Dashboard

1. Vá em **Table Editor**
2. Clique em `habits`
3. Você deve ver 10 hábitos pré-cadastrados
4. Clique em `baby_milestones`
5. Você deve ver ~24 marcos cadastrados

### Via App

```typescript
import { supabase } from './src/services/supabase';

// Testar conexão
const testConnection = async () => {
  const { data, error } = await supabase.from('habits').select('*').limit(5);

  console.log('Habits:', data);
  console.log('Error:', error);
};
```

## 🔐 Segurança

### Regras Importantes

✅ **Row Level Security (RLS)** está habilitado em todas as tabelas
✅ Usuárias só podem ver/editar seus próprios dados
✅ Conteúdos públicos são visíveis para todos
✅ Storage tem policies de acesso configurados

### Chaves de API

- **anon key**: Use no app (segura para expor)
- **service_role key**: ⚠️ NUNCA exponha no client! Apenas no backend

## 🔄 Migrations Futuras

Para adicionar novas features:

```bash
# Criar nova migration
supabase migration new nome_da_feature

# Editar arquivo criado em supabase/migrations/

# Aplicar migration
supabase db push
```

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime](https://supabase.com/docs/guides/realtime)

## 🆘 Troubleshooting

### Erro: "relation does not exist"

- Verifique se o schema foi aplicado corretamente
- Execute o schema.sql novamente

### Erro: "JWT expired"

- O token de autenticação expirou
- Faça logout e login novamente no app

### Erro: "new row violates row-level security"

- Verifique as policies RLS
- Confirme que o usuário está autenticado

### Performance lenta

- Verifique se os índices foram criados (estão no schema.sql)
- Considere adicionar índices personalizados se necessário

## 🎯 Próximos Passos

Após configurar o Supabase:

1. ✅ Configure as variáveis de ambiente
2. ✅ Teste a autenticação
3. ✅ Implemente as telas do app
4. ✅ Teste o fluxo completo
5. ✅ Configure CI/CD para migrations automáticas

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs no Supabase Dashboard
2. Consulte a documentação oficial
3. Abra uma issue no repositório
