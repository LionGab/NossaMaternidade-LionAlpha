# Checklist Pré-Lançamento

## App da Nathália - Maternidade v1.0.0

Data de verificação: \_**\_/\_\_**/\_\_\_\_

---

## 1. CÓDIGO E BUILD

### iOS

- [ ] Build de produção compila sem erros
- [ ] Todos os warnings críticos resolvidos
- [ ] Scheme de Release configurado
- [ ] Code signing configurado (Distribution Certificate)
- [ ] Provisioning Profile de distribuição válido
- [ ] Bundle ID correto: `com.nathalia.maternidade.app`
- [ ] Version: 1.0.0
- [ ] Build Number: 1
- [ ] Info.plist completo com todas as permissões
- [ ] Privacy descriptions em português
- [ ] App Icons em todas as resoluções
- [ ] Launch Screen configurado

### Android

- [ ] Build de produção compila sem erros
- [ ] ProGuard/R8 configurado corretamente
- [ ] Keystore de release criado e seguro
- [ ] Package name correto: `com.nathalia.maternidade`
- [ ] versionCode: 1
- [ ] versionName: 1.0.0
- [ ] AndroidManifest.xml completo
- [ ] Permissions necessárias declaradas
- [ ] Adaptive Icons configurados
- [ ] targetSdkVersion = 34 (Android 14)
- [ ] minSdkVersion = 24 (Android 7.0)

---

## 2. FUNCIONALIDADES

### Home

- [ ] Dashboard carrega corretamente
- [ ] Cards de ação funcionam
- [ ] Navegação para outras telas
- [ ] Dados do usuário exibidos

### NathIA (Chat IA)

- [ ] Mensagens enviam corretamente
- [ ] Respostas da IA retornam
- [ ] Histórico é salvo
- [ ] Aviso médico visível
- [ ] Indicador de digitação funciona
- [ ] Tratamento de erros de conexão

### MãesValentes (Comunidade)

- [ ] Feed carrega publicações
- [ ] Criar publicação funciona
- [ ] Publicação anônima funciona
- [ ] Like/comentário funciona
- [ ] Denúncia de post funciona
- [ ] Filtros funcionam

### MundoNath (Conteúdo)

- [ ] Vídeos carregam
- [ ] Player de vídeo funciona
- [ ] Progresso é salvo
- [ ] Paywall bloqueia conteúdo premium
- [ ] Categorias funcionam
- [ ] Séries exibem corretamente

### Hábitos

- [ ] Lista de hábitos carrega
- [ ] Marcar/desmarcar hábito
- [ ] Criar novo hábito
- [ ] Editar hábito
- [ ] Excluir hábito
- [ ] Streak calculado corretamente
- [ ] Lembretes funcionam

### Autenticação

- [ ] Login com email/senha
- [ ] Login com Google
- [ ] Login com Apple (iOS)
- [ ] Cadastro de nova conta
- [ ] Recuperação de senha
- [ ] Logout
- [ ] Sessão persistida

### Assinatura (In-App Purchase)

- [ ] Produtos carregam das stores
- [ ] Fluxo de compra funciona
- [ ] Restaurar compra funciona
- [ ] Status premium atualiza
- [ ] Paywall correta

---

## 3. BACKEND (SUPABASE)

- [ ] Projeto Supabase configurado
- [ ] Tabelas criadas (users, posts, messages, habits, etc.)
- [ ] RLS (Row Level Security) habilitado
- [ ] Policies configuradas corretamente
- [ ] Auth providers configurados (Email, Google, Apple)
- [ ] Storage buckets criados
- [ ] Edge Functions deployadas
- [ ] Webhooks configurados (se necessário)
- [ ] Backups configurados

---

## 4. SEGURANÇA

- [ ] API keys não expostas no código
- [ ] HTTPS em todas as requisições
- [ ] Tokens armazenados de forma segura
- [ ] Validação de input no cliente e servidor
- [ ] Rate limiting configurado
- [ ] Logs sensíveis removidos
- [ ] Debug mode desabilitado em produção

---

## 5. PERFORMANCE

- [ ] App abre em menos de 3 segundos
- [ ] Navegação fluida (60fps)
- [ ] Imagens otimizadas
- [ ] Lazy loading implementado
- [ ] Cache funcionando
- [ ] Sem memory leaks detectados
- [ ] Tamanho do app aceitável (<100MB)

---

## 6. UI/UX

- [ ] Design consistente em todas as telas
- [ ] Suporte a Dark Mode
- [ ] Fontes carregam corretamente
- [ ] Touch targets >= 44pt (iOS) / 48dp (Android)
- [ ] Feedback visual em ações
- [ ] Loading states implementados
- [ ] Empty states implementados
- [ ] Error states implementados
- [ ] Acessibilidade verificada (VoiceOver/TalkBack)

---

## 7. INTERNACIONALIZAÇÃO

- [ ] Todas as strings em português brasileiro
- [ ] Datas formatadas corretamente (dd/MM/yyyy)
- [ ] Moeda formatada corretamente (R$)
- [ ] Timezone Brazil/East

---

## 8. ANALYTICS E MONITORAMENTO

- [ ] Sentry configurado (crash reporting)
- [ ] Analytics básico implementado
- [ ] Eventos críticos rastreados
- [ ] Error boundaries implementados

---

## 9. TESTES

- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Teste manual em dispositivo físico iOS
- [ ] Teste manual em dispositivo físico Android
- [ ] Teste em diferentes tamanhos de tela
- [ ] Teste offline
- [ ] Teste com conexão lenta
- [ ] Teste de fluxo completo (cadastro → uso → assinatura)

---

## 10. LEGAL E COMPLIANCE

- [ ] Termos de Uso escritos
- [ ] Política de Privacidade escrita
- [ ] Links funcionando no app
- [ ] LGPD compliance
- [ ] Consentimento de cookies/analytics
- [ ] Idade mínima definida (se aplicável)

---

## APROVAÇÃO

| Área            | Responsável | Data | Assinatura |
| --------------- | ----------- | ---- | ---------- |
| Desenvolvimento |             |      |            |
| QA              |             |      |            |
| Design          |             |      |            |
| Produto         |             |      |            |
| Legal           |             |      |            |

---

**Status Final:** [ ] APROVADO PARA PUBLICAÇÃO

**Observações:**

---

---

---
