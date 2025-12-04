# Checklist Final de Release

## 1. Pré-build obrigatório

1. `npm run type-check`
2. `npm run lint`
3. `npm test` e `npm run test:coverage` (garantir ≥40% e investigar aviso de _worker leaked handles_ com `--detectOpenHandles`).
4. `npm run validate:design` (deve permanecer em 0 violações).
5. `npm run validate:env` e confirmar `.env` ↔ segredos no EAS.
6. `npm run validate:pre-deploy` (scripts de sanity check).

## 2. QA funcional (smoke)

- [ ] Login / Magic Link / fluxo de onboarding mínimo.
- [ ] HomeScreenV2: saudação, cards dinâmicos, Navegação para Chat/MundoNath/Hábitos.
- [ ] Chat NathIA: envio de texto (novo input), quick chips, fallback para modo voz, loading state, disclaimers.
- [ ] Registro de emoções/hábitos (Supabase on/offline). Confirmar sync após reconexão.
- [ ] Navegação MundoNath / Community: abrir posts, interações básicas, deep links.
- [ ] Configurações: mudança de tema, logout, abertura de políticas.
- [ ] Tratamento de erros: simular queda da rede (NetInfo) e confirmar mensagens amigáveis.

## 3. QA de acessibilidade

- [ ] VoiceOver/TalkBack ativado: testar ChatScreen, OnboardingFlow, HomeScreen (labels + hints).
- [ ] Tamanhos de fonte dinâmicos (Accessibility settings) → conferir que layouts com NativeWind não quebram.
- [ ] Contraste claro/escuro: executar MCP `@accessibility audit.screen` para telas principais.
- [ ] Touch targets ≥ 44pt (verificar botões de chips, tabs, cards).

## 4. Performance & Observabilidade

- [ ] Medir tempo frio de abertura via `expo start --no-dev --minify` + inspeção no dispositivo.
- [ ] Verificar `@shopify/flash-list` nas telas longas (Community, Feed) com `@mobile-optimization check.flatlist`.
- [ ] Confirmar Sentry (`EXPO_PUBLIC_SENTRY_DSN`) e OneSignal/Expo Notifications configurados.
- [ ] Validar logs (`logger.info`/`logger.error`) ao menos para evento crítico (envio de mensagem, falha supabase).

## 5. Builds & Submissão

1. Atualizar versão/build em `app.config.js` e `package.json`.
2. `eas build --profile production --platform ios` → baixar artefato e testar via TestFlight/AdHoc.
3. `eas build --profile production --platform android` → validar AAB / gerar APK interno via `preview` para QA.
4. `eas submit --profile production --platform ios` (preencher `ascAppId` e `appleTeamId`).
5. `eas submit --profile production --platform android` (garantir `google-play-service-account.json` atualizado).
6. Armazenar links e notas em `docs/releases/<versao>.md`.

## 6. Assets & Metadata

- [ ] Atualizar screenshots em `assets/screenshots/` (iPhone 6.7", 6.1", iPad 13", Android phone & tablet).
- [ ] Revisar textos em `docs/store-listing/` (nome, subtítulo, palavras-chave, descrição PT-BR).
- [ ] Confirmar ícones (`assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png`) e manifesto de privacidade (iOS 17).
- [ ] Gerar vídeo curto (15-30s) demonstrando chat + comunidade (opcional, recomendado para Google Play).

## 7. Pós-lançamento

- [ ] Monitorar Sentry + Supabase logs nas primeiras 24h.
- [ ] Preparar plano de rollback/hotfix (branch `hotfix/<versao>` + `eas update --branch production` se necessário).
- [ ] Coletar feedback de beta testers e registrar em `docs/feedback/<versao>.md`.
