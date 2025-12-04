# Build & Release Config – Nossa Maternidade

## 1. Identidades e Versões

- **Bundle IDs**: `com.nossamaternidade.app` para iOS e Android (definidos em [`app.config.js`](../app.config.js)).
- **Versões**: `expo.version = 1.0.0`, `ios.buildNumber = "1"`, `android.versionCode = 1`. Atualizar antes de cada submission:
  - `npx expo versions:set --appVersion <x.y.z>`
  - Incrementar `ios.buildNumber`/`android.versionCode` manualmente ou via `eas build --auto-increment`.

## 2. Perfis EAS (`eas.json`)

| Perfil        | Uso                           | Comando                                          |
| ------------- | ----------------------------- | ------------------------------------------------ |
| `development` | Client + APK debug            | `eas build --profile development --platform all` |
| `preview`     | Testes internos (AdHoc / APK) | `eas build --profile preview --platform all`     |
| `production`  | Lojas (AAB/iOS release)       | `eas build --profile production --platform all`  |

Notas:

- `production` já está com `autoIncrement` habilitado para os dois SOs.
- Ajustar `submit.production.ios.ascAppId` e `appleTeamId` antes do `eas submit`.
- O arquivo `google-play-service-account.json` deve ser colocado na raiz (já referenciado).

## 3. Credenciais

1. `eas credentials` → gerar/apontar certificados Apple Distribution & Provisioning profiles.
2. `eas credentials -p android` → subir keystore existente (se já há app publicado) ou deixar EAS gerar um novo (baixar backup).
3. Para notificações push:
   - Configurar OneSignal / Expo Push conforme variáveis `EXPO_PUBLIC_ONESIGNAL_APP_ID` e `expo.notification.*`.

## 4. Variáveis de Ambiente

- Usar `env.template` como base para `.env`. Campos obrigatórios para release:
  - `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_GEMINI_API_KEY`, `EXPO_PUBLIC_OPENAI_API_KEY`, `EXPO_PUBLIC_CLAUDE_API_KEY`
  - `EXPO_PUBLIC_SENTRY_DSN` (para monitorar produção)
- EAS: `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://...`
  - Repetir para todas as `EXPO_PUBLIC_*` que não podem ficar hardcoded no repositório.

## 5. Scripts Importantes

- `npm run validate:pre-deploy` → checklist de tokens, env e lint antes de build.
- `npm run validate:android` → confirma permissões/gradle antes de `eas build --platform android`.
- `npm run prepare:assets` → gera ícones/splash em múltiplas densidades (rodar antes de builds finais).

## 6. Fluxo Recomendado para Release

1. Atualizar versão (`app.config.js`) e gerar changelog.
2. Confirmar `.env` e segredos no EAS.
3. Rodar `npm run type-check && npm run lint && npm test && npm run validate:design`.
4. `eas build --profile production --platform ios` (aguardar) → `eas submit --profile production --platform ios`.
5. `eas build --profile production --platform android` → `eas submit --profile production --platform android`.
6. Registrar links dos builds e capturas em `docs/releases/<versao>.md`.

## 7. Itens Pendentes

- Preencher `submit.production.ios.ascAppId` e `appleTeamId` com dados da conta Apple.
- Subir `google-play-service-account.json` criptografado (ou referência segura) para rodar `eas submit` automático.
- Validar permissões sensíveis no App Store Connect (localização, microfone, câmera) conforme descrições do `infoPlist`.
