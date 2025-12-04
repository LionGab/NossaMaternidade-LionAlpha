# Política de Privacidade - Nossa Maternidade

**Última atualização:** 24 de novembro de 2025

---

## 1. Introdução

A Nossa Maternidade ("nós", "nosso" ou "app") valoriza e respeita a privacidade de suas usuárias. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais, em conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)** e o **Regulamento Geral de Proteção de Dados da União Europeia (GDPR)**.

---

## 2. Dados Coletados

### 2.1. Dados fornecidos diretamente por você:

- **Nome completo, data de nascimento**
- **Email e senha** (criptografada com hash bcrypt)
- **Informações do bebê** (nome, data de nascimento, fotos opcionais)
- **Foto de perfil** (opcional)
- **Dados de saúde emocional** (diário, humor, sono, hábitos)
- **Conversas com a IA** (NathIA/MãesValente) - armazenadas para contexto e melhoria do serviço
- **Posts e comentários na comunidade** (MãesValente)
- **Preferências de conteúdo** (likes, bookmarks, visualizações)

### 2.2. Dados coletados automaticamente:

- **Dados de uso do app** (telas visitadas, tempo de uso, interações)
- **Informações do dispositivo** (modelo, sistema operacional, versão do app, ID único do dispositivo)
- **Endereço IP e dados de localização aproximada** (apenas se autorizado explicitamente)
- **Dados de crash e performance** (via Sentry, anonimizados)
- **Tokens de sessão** (para manter você logada)

---

## 3. Como Usamos Seus Dados

Utilizamos seus dados pessoais para:

- ✅ **Fornecer e melhorar os serviços do app**
- ✅ **Personalizar conteúdos e recomendações** (feed MundoNath, artigos relevantes)
- ✅ **Oferecer suporte ao cliente** (responder dúvidas, resolver problemas)
- ✅ **Enviar notificações importantes** (com seu consentimento explícito)
- ✅ **Garantir a segurança** e prevenir fraudes, spam e abusos
- ✅ **Realizar análises estatísticas** (dados anonimizados e agregados)
- ✅ **Cumprir obrigações legais** (retenção de dados conforme LGPD)
- ✅ **Melhorar a IA** (treinar modelos com dados anonimizados, respeitando privacidade)

---

## 4. Compartilhamento de Dados

**Não vendemos seus dados pessoais.** Compartilhamos apenas com:

### 4.1. Provedores de Serviços (Processadores de Dados)

- **Supabase** (Infraestrutura de banco de dados)
  - Certificações: ISO 27001, SOC 2 Type II
  - Localização: AWS/GCP (servidores podem estar fora do Brasil)
  - Dados processados: Todos os dados do app (perfis, mensagens, conteúdo)

- **Google Cloud** (Integração de IA - Gemini)
  - Dados processados: Mensagens do chat com NathIA (para gerar respostas)
  - Política: [Google Cloud Privacy](https://cloud.google.com/privacy)
  - Retenção: Dados não são usados para treinar modelos públicos

- **OneSignal** (Notificações push)
  - Dados processados: ID do dispositivo, preferências de notificação
  - Apenas com consentimento explícito

- **Sentry** (Monitoramento de erros)
  - Dados processados: Logs de erro, stack traces (anonimizados)
  - Não inclui dados pessoais sensíveis

### 4.2. Autoridades Legais

Compartilhamos dados apenas quando exigido por lei, ordem judicial ou processo legal válido.

---

## 5. Armazenamento e Segurança

### 5.1. Medidas de Segurança

Seus dados são armazenados em servidores seguros da Supabase (AWS/GCP) com:

- ✅ **Criptografia em trânsito** (TLS 1.3)
- ✅ **Criptografia em repouso** (AES-256)
- ✅ **Autenticação multifator** e controle de acesso rigoroso
- ✅ **Backups diários** e redundância geográfica
- ✅ **Monitoramento contínuo** de segurança
- ✅ **Row Level Security (RLS)** no Supabase (cada usuária só acessa seus próprios dados)

### 5.2. Retenção de Dados

- **Dados ativos:** Mantidos enquanto sua conta estiver ativa
- **Após exclusão:** Dados são anonimizados ou deletados em até **30 dias**
- **Exceções legais:** Alguns dados podem ser retidos por mais tempo se exigido por lei (ex: registros fiscais)

---

## 6. Seus Direitos (LGPD/GDPR)

Você tem direito a:

### 6.1. **Acesso**

Visualizar todos os seus dados pessoais armazenados.

### 6.2. **Correção**

Atualizar dados incorretos ou desatualizados.

### 6.3. **Exclusão**

Deletar sua conta e todos os dados associados (direito ao esquecimento).

### 6.4. **Portabilidade**

Exportar seus dados em formato legível (JSON, CSV).

### 6.5. **Oposição**

Recusar processamento de dados para fins específicos (ex: marketing).

### 6.6. **Revogação**

Retirar consentimento a qualquer momento (ex: notificações push).

### Como Exercer Seus Direitos

1. **No app:** Acesse **Configurações → Privacidade → Gerenciar Dados**
2. **Por email:** Envie solicitação para **privacidade@nossaMATERNIDADE.app**
3. **Prazo de resposta:** Até 15 dias úteis (conforme LGPD)

---

## 7. Privacidade de Menores

Nosso app é destinado a **adultos (+18 anos)**. Não coletamos intencionalmente dados de menores de 18 anos sem consentimento parental.

**Dados do bebê:** São armazenados sob responsabilidade da mãe/pai. Não coletamos dados diretamente de menores.

---

## 8. Cookies e Rastreamento

Usamos tecnologias de rastreamento apenas para:

- ✅ **Manter você logada** (tokens de sessão)
- ✅ **Salvar preferências** (tema, notificações)
- ✅ **Analytics básico** (anonimizado, sem identificação pessoal)

**iOS 14.5+:** Solicitaremos seu consentimento explícito para rastreamento entre apps (App Tracking Transparency).

**Não usamos:** Cookies de terceiros para publicidade, rastreamento cross-site, ou vendas de dados.

---

## 9. Transferência Internacional

Seus dados podem ser transferidos para servidores fora do Brasil (AWS/GCP nos EUA/Europa), mas sempre com garantias adequadas:

- ✅ **Cláusulas contratuais padrão** (Standard Contractual Clauses - SCCs)
- ✅ **Certificações Privacy Shield** (quando aplicável)
- ✅ **Conformidade com LGPD e GDPR**

---

## 10. Alterações nesta Política

Podemos atualizar esta política periodicamente para refletir mudanças em nossos serviços ou requisitos legais.

**Notificações:**

- Alterações significativas serão notificadas via **email** ou **notificação no app**
- Última atualização: **24/11/2025**

---

## 11. Contato

### Controlador de Dados

**Nossa Maternidade Ltda.**

### DPO (Encarregado de Dados)

**Email:** dpo@nossaMATERNIDADE.app

### Privacidade Geral

**Email:** privacidade@nossaMATERNIDADE.app

### Suporte

**Email:** contato@nossaMATERNIDADE.app

### Endereço

[Endereço completo da empresa será adicionado aqui]

---

## 12. Consentimento

Ao usar o app Nossa Maternidade, você concorda com esta Política de Privacidade. Se não concordar, por favor, não utilize o Serviço.

---

**Versão:** 1.0  
**Data:** 24 de novembro de 2025  
**Conformidade:** LGPD (Lei 13.709/2018) + GDPR (Regulamento UE 2016/679)
