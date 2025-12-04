# Data Safety - Google Play Store

Este documento fornece as informações necessárias para preencher o formulário "Data Safety" (Segurança de Dados) do Google Play Console.

## Data Safety Form - Nossa Maternidade App

### 1. Does your app collect or share any of the required user data types?

**Resposta:** Yes

---

## Data Collection and Security

### 2. Is all of the user data collected by your app encrypted in transit?

**Resposta:** Yes

- Todos os dados são transmitidos via HTTPS
- Supabase usa TLS/SSL para todas as comunicações
- Google Gemini API usa HTTPS

### 3. Do you provide a way for users to request that their data is deleted?

**Resposta:** Yes

- Usuários podem solicitar exclusão via:
  - Configurações do app > Conta > Excluir minha conta
  - Email para: privacy@nossamaternidade.com.br
- Prazo de resposta: até 30 dias (conforme LGPD)

---

## Data Types Collected

### Personal Info

#### Nome (Name)

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** Yes
- **Purpose:** App functionality, Account management
- **Reason:** Necessário para identificação da usuária e personalização da experiência

#### Email

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** Yes
- **Purpose:** App functionality, Account management, Communications
- **Reason:** Autenticação de conta, recuperação de senha, notificações importantes

#### Phone Number

- **Collected:** No
- **Shared:** No
- **Reason:** Não coletamos número de telefone

#### User IDs

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** Yes
- **Purpose:** App functionality, Analytics
- **Reason:** Identificação única do usuário no sistema (UUID do Supabase)

---

### Health and Fitness

#### Health info

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** No
- **Purpose:** App functionality, Personalization
- **Reason:** Informações sobre gestação, pós-parto, amamentação, saúde emocional
- **Note:** Dados sensíveis, armazenados de forma criptografada

#### Fitness info

- **Collected:** No
- **Reason:** Não coletamos informações de fitness

---

### Messages

#### Emails

- **Collected:** No (apenas endereço de email, não conteúdo)
- **Reason:** Não acessamos emails da usuária

#### SMS or MMS

- **Collected:** No
- **Reason:** Não acessamos mensagens SMS

#### Other in-app messages

- **Collected:** Yes
- **Shared:** No (dados processados pela Google Gemini AI não são armazenados pelo Google)
- **Ephemeral:** No
- **Required:** No
- **Purpose:** App functionality (Chat com IA)
- **Reason:** Conversas com a assistente MãesValente são armazenadas para contexto e histórico

---

### Photos and Videos

#### Photos

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** No
- **Purpose:** App functionality (Community sharing)
- **Reason:** Usuária pode compartilhar fotos na comunidade

#### Videos

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** No
- **Purpose:** App functionality (Community sharing, Content consumption)
- **Reason:** Consumo de conteúdo educacional em vídeo

---

### App Activity

#### App interactions

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** No
- **Purpose:** Analytics, Personalization
- **Reason:** Melhorar experiência do usuário, recomendar conteúdo relevante
- **Note:** Navegação, conteúdos visualizados, curtidas, salvos

#### In-app search history

- **Collected:** No
- **Reason:** Não implementado ainda

#### Installed apps

- **Collected:** No
- **Reason:** Não coletamos informações sobre outros apps instalados

#### Other user-generated content

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** No
- **Purpose:** App functionality (Community posts, Comments)
- **Reason:** Posts e comentários na comunidade

#### Other actions

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** No
- **Purpose:** App functionality, Analytics
- **Reason:** Hábitos completados, exercícios de respiração, entradas no diário

---

### Web Browsing

- **Collected:** No
- **Reason:** Não rastreamos histórico de navegação web

---

### App Info and Performance

#### Crash logs

- **Collected:** Yes
- **Shared:** No (apenas com Sentry para debugging)
- **Ephemeral:** Yes
- **Required:** No
- **Purpose:** App functionality, Analytics
- **Reason:** Identificar e corrigir bugs

#### Diagnostics

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** Yes
- **Required:** No
- **Purpose:** App functionality, Analytics
- **Reason:** Monitorar performance do app

#### Other app performance data

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** Yes
- **Required:** No
- **Purpose:** Analytics
- **Reason:** Tempo de carregamento, uso de memória

---

### Device or Other IDs

#### Device or other IDs

- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** Yes
- **Purpose:** App functionality, Analytics, Advertising (future)
- **Reason:** Identificação única do dispositivo para notificações push (OneSignal)
- **Note:** iOS IDFA requer App Tracking Transparency permission

---

## Data Sharing

### Do you share data with third parties?

**Resposta:** No (com exceção dos processadores de dados listados abaixo)

### Data Processors (não compartilhamento, apenas processamento)

1. **Supabase** (PostgreSQL hosting)
   - Purpose: Database hosting
   - Data: Todos os dados do usuário
   - Location: US (com opção de EU)

2. **Google Cloud / Gemini AI**
   - Purpose: AI chat assistant
   - Data: Chat messages (não armazenadas pelo Google)
   - Location: US

3. **OneSignal**
   - Purpose: Push notifications
   - Data: Device tokens, user IDs
   - Location: US

4. **Sentry**
   - Purpose: Error tracking
   - Data: Crash logs, device info (anonymous)
   - Location: US

---

## Security Practices

### Data Encryption

- **In Transit:** Yes - HTTPS/TLS 1.3
- **At Rest:** Yes - Supabase database encryption

### Data Deletion

- Usuários podem solicitar exclusão total da conta
- Dados são removidos permanentemente em até 30 dias
- Backups são mantidos por 90 dias para recovery (então deletados)

### Independent Security Review

- **Completed:** No (planejado para Q2 2025)
- Seguimos OWASP Mobile Top 10 guidelines
- Code reviews regulares
- Dependency security scans (npm audit)

---

## Compliance

### LGPD (Brasil)

- ✅ Privacy Policy publicada
- ✅ Consentimento explícito para dados sensíveis
- ✅ Direitos do usuário (acesso, correção, exclusão)
- ✅ DPO contact: privacy@nossamaternidade.com.br

### GDPR (União Europeia)

- ✅ Privacy Policy GDPR-compliant
- ✅ Lawful basis: Consent + Legitimate Interest
- ✅ Data portability
- ✅ Right to be forgotten

### COPPA (US)

- **N/A** - App é 18+, não direcionado a crianças

---

## Additional Information

### Sensitive Data Handling

**Dados de saúde** são considerados **categoria especial** pela LGPD e GDPR.

- Armazenamento criptografado
- Acesso restrito (only user + admin for support)
- Não compartilhados com terceiros
- Não usados para publicidade

### Data Retention

- **Dados da conta:** Mantidos enquanto conta ativa
- **Dados do chat:** Mantidos enquanto conta ativa
- **Logs de erro:** 90 dias
- **Analytics:** 24 meses

### User Controls

Usuários podem:

- Ver todos seus dados (Settings > Privacy > Download my data)
- Deletar posts/comentários individualmente
- Deletar conta completa
- Opt-out de analytics (Settings > Privacy > Analytics)
- Opt-out de notificações

---

## Contact Information

**Privacy Contact:** privacy@nossamaternidade.com.br
**Support:** suporte@nossamaternidade.com.br
**Website:** https://nossamaternidade.com.br
**Privacy Policy URL:** https://nossamaternidade.com.br/privacy

---

## Last Updated

**Date:** 2025-01-24
**App Version:** 1.0.0
**Form Version:** Google Play Data Safety v2

---

## Checklist for Google Play Console

- [x] Privacy Policy URL added to store listing
- [x] Data Safety form completed accurately
- [x] All collected data types declared
- [x] Data retention policies documented
- [x] Data deletion process explained
- [x] Security practices disclosed
- [x] Third-party data processors listed (as processors, not sharing)
- [x] Sensitive data handling (health info) properly flagged
- [x] User controls documented
- [x] Compliance with LGPD/GDPR noted

---

**Notas Importantes:**

1. Atualizar este documento sempre que houver mudanças na coleta de dados
2. Sincronizar com Privacy Policy (ambos devem estar alinhados)
3. Revisar antes de cada submission na Play Store
4. Manter versões anteriores para auditoria
