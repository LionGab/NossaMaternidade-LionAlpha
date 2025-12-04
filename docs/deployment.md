# 📱 Guia de Deployment - Nossa Maternidade

## 🚀 Visão Geral

Este guia contém todas as instruções necessárias para fazer o deploy do app Nossa Maternidade na App Store (iOS) e Google Play Store (Android).

## ✅ Checklist Pré-Deploy

### Requisitos Gerais

- [ ] Todas as funcionalidades testadas
- [ ] Design responsivo em diferentes tamanhos de tela
- [ ] Performance otimizada (< 3s de startup)
- [ ] Sem crashes ou erros críticos
- [ ] APIs de produção configuradas
- [ ] Analytics configurado
- [ ] Política de Privacidade publicada
- [ ] Termos de Uso publicados

### Assets Necessários

- [ ] Ícone do app (1024x1024px)
- [ ] Splash screen (2732x2732px)
- [ ] Screenshots para cada tamanho de dispositivo
- [ ] Vídeo promocional (opcional)
- [ ] Banner para feature (1024x500px)

## 🍎 Deploy na App Store

### 1. Preparação da Conta Apple Developer

```bash
# Criar certificados e provisioning profiles
eas credentials
```

### 2. Configurar Metadados no App Store Connect

- **Nome do App**: Nossa Maternidade
- **Categoria**: Saúde e Fitness
- **Classificação Etária**: 4+
- **Idioma Principal**: Português (Brasil)

### 3. Build de Produção iOS

```bash
# Gerar build para App Store
npm run build:ios

# Ou com EAS
eas build --platform ios --profile production
```

### 4. Upload para App Store Connect

```bash
# Submit automaticamente após build
npm run submit:ios

# Ou manualmente
eas submit --platform ios --latest
```

### 5. Informações Obrigatórias

- **Descrição**: App completo para mães com IA, comunidade e conteúdo personalizado
- **Palavras-chave**: maternidade, mães, bebê, gravidez, IA, comunidade, saúde
- **URL de Suporte**: https://nossamaternidade.com.br/suporte
- **URL de Privacidade**: https://nossamaternidade.com.br/privacidade

### 6. Screenshots Necessários

- iPhone 6.5" (1284 × 2778 pixels)
- iPhone 5.5" (1242 × 2208 pixels)
- iPad Pro 12.9" (2048 × 2732 pixels)

## 🤖 Deploy na Google Play Store

### 1. Preparação da Conta Google Play Console

```bash
# Configurar service account
# Baixar google-play-service-account.json
```

### 2. Build de Produção Android

```bash
# Gerar AAB (Android App Bundle)
npm run build:android

# Ou com EAS
eas build --platform android --profile production
```

### 3. Upload para Google Play Console

```bash
# Submit automaticamente
npm run submit:android

# Ou manualmente
eas submit --platform android --latest
```

### 4. Informações da Listagem

- **Título**: Nossa Maternidade - IA para Mães
- **Descrição Curta**: Sua jornada maternal com IA e comunidade
- **Descrição Completa**:

  ```
  Nossa Maternidade é o aplicativo completo para mães modernas.

  Recursos principais:
  • Chat com IA 24/7
  • Comunidade exclusiva
  • Conteúdo personalizado
  • Acompanhamento de hábitos
  • Suporte emocional
  ```

### 5. Classificação de Conteúdo

- Responder questionário IARC
- Classificação esperada: Livre

### 6. Screenshots Android

- Telefone (mínimo 2): 1080 × 1920 pixels
- Tablet 7" (opcional): 1200 × 1920 pixels
- Tablet 10" (opcional): 1600 × 2560 pixels

## 📋 Processo de Review

### App Store (iOS)

- **Tempo médio**: 24-48 horas
- **Dicas para aprovação**:
  - Incluir conta de teste
  - Explicar funcionalidades de IA
  - Justificar permissões solicitadas
  - Responder rapidamente ao feedback

### Google Play (Android)

- **Tempo médio**: 2-24 horas
- **Requisitos importantes**:
  - Target API Level 33+
  - Conformidade com políticas de dados
  - Declaração de dados preenchida
  - Conformidade com famílias (opcional)

## 🔧 Comandos Úteis

### Build e Deploy Completo

```bash
# Desenvolvimento
npm run build:dev

# Preview/Beta
npm run build:preview

# Produção - Ambas Plataformas
npm run build:production
npm run submit:all

# Atualização OTA (Over-the-air)
npm run update "Correções de bugs e melhorias"
```

### Verificação Pré-Deploy

```bash
# Verificar tipos TypeScript
npm run type-check

# Testar localmente
npm start

# Testar em dispositivo físico
npm run android  # Android
npm run ios      # iOS (requer Mac)
```

## 🔐 Variáveis de Ambiente

Criar arquivo `.env.production` com:

```env
GEMINI_API_KEY=sua_chave_aqui
SUPABASE_URL=sua_url_aqui
SUPABASE_ANON_KEY=sua_chave_aqui
SENTRY_DSN=seu_dsn_aqui
ONESIGNAL_APP_ID=seu_id_aqui
```

## 📊 Monitoramento Pós-Deploy

### Ferramentas Recomendadas

- **Analytics**: Google Analytics / Firebase
- **Crash Reports**: Sentry / Crashlytics
- **Performance**: Firebase Performance
- **Reviews**: AppFollow / AppBot
- **Push Notifications**: OneSignal

### KPIs Importantes

- Taxa de instalação/desinstalação
- Crash rate (< 1%)
- ANR rate (< 0.5%)
- Tempo de inicialização
- Avaliações e reviews
- Engajamento diário/mensal

## 🆘 Troubleshooting

### Erro: "Missing required icon"

```bash
# Gerar ícones automaticamente
npx expo-optimize
```

### Erro: "Invalid bundle ID"

- Verificar formato: com.nossamaternidade.app
- Sem caracteres especiais ou espaços

### Build falhou no EAS

```bash
# Limpar cache e tentar novamente
eas build --clear-cache --platform all --profile production
```

### App rejeitado na review

- Ler feedback detalhadamente
- Corrigir problemas apontados
- Resubmeter com notas explicativas

## 📝 Notas de Versão

### Versão 1.0.0 (Lançamento)

- ✨ Chat com IA especializada em maternidade
- 👥 Comunidade de mães
- 📚 Conteúdo personalizado
- 📊 Acompanhamento de hábitos
- 🎨 Design premium mobile-first
- ⚡ Performance otimizada

## 🎯 Próximos Passos

1. [ ] Configurar CI/CD com GitHub Actions
2. [ ] Implementar A/B testing
3. [ ] Adicionar mais idiomas
4. [ ] Integrar pagamentos in-app
5. [ ] Expandir funcionalidades de IA

## 📞 Suporte

Para dúvidas sobre deployment:

- Email: dev@nossamaternidade.com.br
- Docs: https://nossamaternidade.com.br/docs
- Discord: [Link do servidor]

---

**Última atualização**: Novembro 2024
**Versão do documento**: 1.0.0
