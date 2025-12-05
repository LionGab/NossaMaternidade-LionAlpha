# 🧪 Guia de Teste - Funcionalidades do Chat

## 🚀 Como Iniciar o App

### Opção 1: Expo Go (Recomendado - Mais Rápido)

```bash
# 1. Iniciar o servidor
npm start

# 2. Escanear QR Code
# - iOS: Abra a câmera e escaneie
# - Android: Abra o app Expo Go e escaneie
```

### Opção 2: Simulador/Emulador

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (para testar UI)
npm run web
```

---

## ✅ Checklist de Teste

### 1. 📱 **TTS (Text-to-Speech) - Ouvir Mensagens da NathIA**

**O que testar:**

- [ ] Botão "Ouvir" aparece nas mensagens da NathIA
- [ ] Ao tocar, mostra "Gerando..." enquanto processa
- [ ] Áudio é reproduzido corretamente
- [ ] Botão muda para "Parar" durante reprodução
- [ ] Ao tocar "Parar", o áudio para
- [ ] Áudio é cacheado (segunda vez é mais rápida)

**Como testar:**

1. Abra o ChatScreen
2. Envie uma mensagem para a NathIA
3. Aguarde a resposta
4. Procure o botão "🔊 Ouvir" abaixo da mensagem da NathIA
5. Toque no botão
6. Verifique se o áudio toca

**⚠️ Requisitos:**

- ElevenLabs API Key configurada (opcional - se não tiver, o botão não funcionará)
- Variável: `EXPO_PUBLIC_ELEVENLABS_API_KEY` no `.env`

**Troubleshooting:**

- Se o botão não aparece: Verifique se a mensagem é da NathIA (role === 'assistant')
- Se dá erro: Verifique se a API key do ElevenLabs está configurada
- Se não toca: Verifique permissões de áudio do dispositivo

---

### 2. 👆 **Swipe Gestures - Deletar/Responder Mensagens**

**O que testar:**

- [ ] Swipe LEFT em mensagem do usuário → mostra botão de deletar
- [ ] Ao tocar deletar → mensagem é removida
- [ ] Swipe RIGHT em mensagem da NathIA → mostra botão de responder
- [ ] Ao tocar responder → texto é adicionado ao input
- [ ] Animação de swipe é suave
- [ ] Haptic feedback funciona

**Como testar:**

**Teste 1: Deletar Mensagem (Usuário)**

1. Envie uma mensagem no chat
2. Deslize a mensagem para a ESQUERDA (swipe left)
3. Deve aparecer um botão vermelho de lixeira
4. Toque no botão ou solte o swipe
5. Mensagem deve ser deletada

**Teste 2: Responder Mensagem (NathIA)**

1. Aguarde uma resposta da NathIA
2. Deslize a mensagem para a DIREITA (swipe right)
3. Deve aparecer um botão azul de responder
4. Toque no botão ou solte o swipe
5. O texto da mensagem deve aparecer no input com "Sobre..."

**Troubleshooting:**

- Se o swipe não funciona: Verifique se está deslizando com força suficiente (threshold: 60px)
- Se não aparece botão: Verifique se está deslizando na direção correta
- Se não deleta: Verifique conexão com Supabase

---

### 3. 📜 **Modal de Histórico de Conversas**

**O que testar:**

- [ ] Botão de menu (☰) no header abre o modal
- [ ] Modal mostra lista de conversas anteriores
- [ ] Ao tocar em uma conversa, ela abre
- [ ] Ao segurar (long press), aparece opção de deletar
- [ ] Modal fecha ao tocar no X ou no backdrop
- [ ] Loading state aparece ao carregar
- [ ] Empty state aparece quando não há conversas

**Como testar:**

1. No ChatScreen, toque no botão de menu (☰) no canto superior direito
2. Modal deve abrir com lista de conversas
3. Toque em uma conversa para abrir
4. Volte ao modal (toque no ☰ novamente)
5. Segure (long press) uma conversa
6. Confirme a deleção
7. Conversa deve ser removida

**Troubleshooting:**

- Se o modal não abre: Verifique se o botão está visível no header
- Se não carrega conversas: Verifique conexão com Supabase
- Se não deleta: Verifique permissões RLS no Supabase

---

## 🎯 Teste Completo - Fluxo End-to-End

### Cenário 1: Conversa Normal com TTS

1. ✅ Abra o ChatScreen
2. ✅ Envie: "Oi NathIA, como você está?"
3. ✅ Aguarde resposta
4. ✅ Toque no botão "Ouvir" da resposta
5. ✅ Verifique se o áudio toca
6. ✅ Envie outra mensagem
7. ✅ Teste TTS novamente (deve ser mais rápido - cache)

### Cenário 2: Gestos de Swipe

1. ✅ Envie uma mensagem
2. ✅ Swipe LEFT → Deletar
3. ✅ Envie outra mensagem
4. ✅ Aguarde resposta da NathIA
5. ✅ Swipe RIGHT → Responder
6. ✅ Verifique se o texto foi adicionado ao input

### Cenário 3: Histórico de Conversas

1. ✅ Crie 2-3 conversas diferentes
2. ✅ Abra o modal de histórico
3. ✅ Navegue entre conversas
4. ✅ Delete uma conversa
5. ✅ Verifique se foi removida

---

## 🔧 Configuração Necessária

### Variáveis de Ambiente (.env)

```env
# Supabase (Obrigatório)
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]

# ElevenLabs (Opcional - para TTS)
EXPO_PUBLIC_ELEVENLABS_API_KEY=[ELEVENLABS_KEY]
```

### Permissões do Dispositivo

**iOS:**

- Microfone (para TTS) - configurado automaticamente

**Android:**

- Microfone (para TTS) - configurado automaticamente

---

## 🐛 Troubleshooting Geral

### App não inicia

```bash
# Limpar cache
npm start -- --clear

# Reinstalar dependências
rm -rf node_modules
npm install
```

### TTS não funciona

- Verifique se `EXPO_PUBLIC_ELEVENLABS_API_KEY` está configurada
- Verifique logs no console para erros
- Teste sem TTS primeiro (o chat deve funcionar normalmente)

### Swipe não funciona

- Teste em dispositivo físico (melhor que simulador)
- Verifique se está deslizando com força suficiente
- Verifique logs para erros de PanResponder

### Modal não abre

- Verifique se o botão está visível
- Verifique logs para erros de navegação
- Teste em dispositivo físico

---

## 📊 Métricas de Sucesso

✅ **TTS:**

- Tempo de geração: < 3s (primeira vez)
- Tempo de cache: < 0.5s (segunda vez)
- Taxa de sucesso: > 95%

✅ **Swipe:**

- Threshold detectado: 60px
- Animação suave: 60fps
- Haptic feedback: Funciona

✅ **Modal:**

- Tempo de abertura: < 200ms
- Carregamento de conversas: < 1s
- Taxa de sucesso: 100%

---

## 🎬 Vídeo de Demonstração (Opcional)

Grave um vídeo mostrando:

1. TTS funcionando
2. Swipe gestures
3. Modal de histórico

Isso ajuda a documentar o comportamento esperado!

---

**Última atualização:** Dezembro 2025
