# 📱 Guia de Implementação Mobile - Nossa Maternidade

## 🎯 Contexto

**Plataforma**: React Native + Expo  
**Target**: iOS App Store + Android Google Play  
**Referência**: Site web (apenas para design/UX)

---

## ✅ Checklist Mobile-Specific

### Componentes React Native

- [ ] Usar apenas componentes nativos (`View`, `Text`, `Image`, `ScrollView`, etc)
- [ ] Não usar componentes web (`div`, `span`, etc)
- [ ] Usar `expo-image` para imagens otimizadas
- [ ] Usar `react-native-safe-area-context` para safe areas
- [ ] Usar `KeyboardAvoidingView` em formulários

### Navegação

- [ ] `@react-navigation/bottom-tabs` para tabs principais
- [ ] `@react-navigation/native-stack` para navegação entre telas
- [ ] Configurar deep linking no `app.json`
- [ ] Testar navegação em iOS e Android

### Performance

- [ ] Usar `FlatList` para listas longas (não `ScrollView`)
- [ ] Implementar `getItemLayout` quando possível
- [ ] Usar `useMemo` e `useCallback` para otimização
- [ ] Lazy loading de imagens
- [ ] Code splitting se necessário

### Offline Support

- [ ] `@react-native-async-storage/async-storage` para cache
- [ ] `@react-native-community/netinfo` para detectar conexão
- [ ] Sincronização quando online
- [ ] Mensagens de estado offline

### Notificações

- [ ] `expo-notifications` configurado
- [ ] Permissões iOS e Android
- [ ] Lembretes de hábitos
- [ ] Notificações de comunidade

### Build & Deploy

- [ ] `app.json` configurado corretamente
- [ ] Ícones iOS (1024x1024) e Android (vários tamanhos)
- [ ] Splash screens iOS e Android
- [ ] EAS Build configurado
- [ ] TestFlight (iOS) e Internal Testing (Android)
- [ ] Preparar para produção

### Testes

- [ ] Testar em iPhone (vários tamanhos)
- [ ] Testar em Android (vários tamanhos)
- [ ] Testar dark mode
- [ ] Testar acessibilidade
- [ ] Testar offline
- [ ] Testar performance

---

## 📋 Estrutura de Arquivos Mobile

```
src/
├── screens/
│   ├── OnboardingFlowNew.tsx      # 8 etapas
│   ├── HomeScreen.tsx              # Dashboard principal
│   ├── MaesValenteScreen.tsx       # Comunidade
│   ├── ChatScreen.tsx              # Chat com IA
│   ├── MundoNathScreen.tsx         # Conteúdo
│   └── HabitsScreen.tsx            # Hábitos
├── components/
│   ├── primitives/                 # Componentes base
│   ├── organisms/                  # Componentes complexos
│   └── templates/                  # Templates de tela
├── services/                       # Lógica de negócio
├── hooks/                          # React hooks
└── theme/                          # Design tokens
```

---

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
npm start                    # Inicia Expo
npm run ios                  # iOS simulator
npm run android              # Android emulator

# Build
eas build --platform ios    # Build iOS
eas build --platform android # Build Android
eas build --platform all     # Build ambos

# Deploy
eas submit --platform ios    # Submeter iOS
eas submit --platform android # Submeter Android
```

---

**Lembrete**: Todo código deve ser React Native, não web! 🚀
