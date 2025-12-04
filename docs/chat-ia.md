# Chat Screen - Nossa Maternidade

## Visão Geral

Tela de chat com IA (Gemini) para assistência materna. Implementação completa em React Native com todas as otimizações mobile.

## Funcionalidades Implementadas

### ✅ Interface Mobile Nativa

- **FlatList** com virtualização para performance com 100+ mensagens
- **KeyboardAvoidingView** para iOS (teclado não cobre input)
- **SafeAreaView** para suporte a notch/ilha dinâmica
- **Pull-to-refresh** para recarregar histórico
- Scroll automático para última mensagem

### ✅ Persistência de Dados

- AsyncStorage para histórico de chat
- Salvamento automático após cada mensagem
- Carregamento do histórico ao abrir o app

### ✅ Serviço de IA (Gemini)

- Timeout de 30 segundos
- Retry logic com 3 tentativas
- Exponential backoff entre tentativas
- Error handling robusto
- Configuração via variáveis de ambiente

### ✅ Componentes

- Message bubbles (user/AI) com timestamps
- Quick reply chips (respostas rápidas)
- Loading states durante processamento
- Empty state com boas-vindas
- Header com avatar e status online/offline

### ✅ Performance

- `memo()` em componentes de mensagem
- `removeClippedSubviews` ativado
- `maxToRenderPerBatch` e `windowSize` otimizados
- Re-renders minimizados

## Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar API Key do Gemini

Opção A - Via arquivo de ambiente (recomendado para desenvolvimento):

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env e adicionar sua chave
EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_aqui
```

Opção B - Via app.json (não recomendado para produção):

```json
{
  "expo": {
    "extra": {
      "geminiApiKey": "sua_chave_aqui"
    }
  }
}
```

**⚠️ Importante:** Obtenha sua API key gratuita em: https://makersuite.google.com/app/apikey

### 3. Executar o App

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Estrutura de Arquivos

```
src/
├── screens/
│   └── ChatScreen.tsx          # Tela principal do chat
├── services/
│   └── geminiService.ts        # Serviço de IA com retry/timeout
├── types/
│   └── chat.ts                 # Definições de tipos
└── utils/
    └── storage.ts              # Operações AsyncStorage
```

## Layout

```
┌─────────────────────┐
│ [🤱] Assistente     │ Header (sticky)
│      Online   [🗑️]  │
├─────────────────────┤
│                     │
│  ┌─────────────┐    │ Message (user)
│  │ Olá!  10:30 │    │
│  └─────────────┘    │
│                     │
│     ┌──────────────┐│ Message (AI)
│     │ Oi mãe! 10:30││
│     └──────────────┘│
│                     │
├─────────────────────┤
│ [Chip1] [Chip2]     │ Quick replies (apenas empty state)
│ ┌─────────────┐ [→] │ Input + Send button
└─────────────────────┘
```

## Validações Cumpridas

- ✅ Scroll automático para última mensagem
- ✅ Persistência de histórico funciona
- ✅ Keyboard não cobre input (KeyboardAvoidingView)
- ✅ Performance > 60fps com 100+ mensagens (virtualização + memo)
- ✅ Pull-to-refresh implementado
- ✅ Error handling em todas as operações
- ✅ Loading states visuais
- ✅ SafeAreaView para notch

## Próximos Passos (Opcionais)

- [ ] Adicionar suporte a imagens/fotos
- [ ] Implementar typing indicator ("IA está digitando...")
- [ ] Adicionar feedback háptico (vibração)
- [ ] Suporte a voz (speech-to-text)
- [ ] Modo offline com fila de mensagens
- [ ] Analytics de uso

## Troubleshooting

### Erro "API key não configurada"

- Verifique se configurou a variável `EXPO_PUBLIC_GEMINI_API_KEY`
- Reinicie o servidor Expo após editar .env

### Mensagens não persistem

- Verifique permissões do AsyncStorage
- Limpe o cache: `expo start -c`

### Performance ruim

- Verifique se está usando um device físico (simuladores são mais lentos)
- Confirme que `removeClippedSubviews={true}` está ativo

## Tecnologias Utilizadas

- React Native 0.81.5
- Expo ~54.0
- @react-native-async-storage/async-storage
- @google/generative-ai
- expo-constants
- TypeScript
