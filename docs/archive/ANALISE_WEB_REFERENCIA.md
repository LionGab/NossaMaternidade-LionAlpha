# Análise do Site Web - Referência para App Mobile

## 📋 Resumo da Navegação

Análise realizada em: 2025-11-27
URL: https://copy-of-nossa-maternidade0555-854690283424.us-west1.run.app/

---

## 🎨 Design System Observado

### Cores e Paleta

- **Background principal**: Bege claro (#F1F5F9 - Cloud)
- **Cards**: Branco (#FFFFFF - Snow)
- **Primary**: Rosa maternal (#FF7A96)
- **Secondary**: Roxo espiritual (#A78BFA)
- **Dark Mode**: Implementado com toggle (lua/sol)

### Tipografia

- **Font principal**: Quicksand (Google Fonts)
- **Tamanhos**: Hierarquia clara (títulos grandes, textos menores)
- **Pesos**: Regular, Medium, Semibold, Bold

### Componentes Identificados

#### 1. **Tela Inicial (Landing)**

- Ilustração circular de mãe com bebê
- Mensagem motivacional: "Você é forte. Mesmo nos dias em que não parece."
- Botão CTA: "Começar com a Nath"
- Design clean e acolhedor

#### 2. **Tela de Boas-vindas**

- Mensagem: "Oi, que bom que você chegou."
- Quote: "Aqui, você não precisa fingir que está tudo bem."
- Apresentação: "Eu sou a MãesValente. Quero criar um espaço seguro para você."
- Botão: "Começar agora"
- Indicador de progresso (dots)

#### 3. **Onboarding - Nome**

- Pergunta: "Como você gosta de ser chamada?"
- Subtítulo: "Quero que nossa conversa seja íntima, como amigas."
- Input: "Seu nome ou apelido"
- Botão: "Continuar"
- Progresso: 2/8 dots

#### 4. **Onboarding - Estágio da Maternidade**

- Opções:
  - Tentante
  - Gestante
  - Puérpera (Recém-nascido)
  - Mãe experiente
- Design: Botões grandes e claros

#### 5. **Onboarding - Emoções**

- Opções de emoções:
  - Ansiosa
  - Cansada
  - Culpada
  - Feliz
  - Confusa
- Design: Botões com emojis/ícones
- Progresso: 3/8 dots

#### 6. **Onboarding - Tópicos de Interesse**

- Pergunta sobre preocupações/tópicos:
  - Sono do bebê
  - Amamentação
  - Ansiedade/Depressão
  - Relacionamento
  - Volta ao trabalho
  - Solidão
  - Só curiosidade
- Design: Botões múltiplos selecionáveis
- Progresso: 4/8 dots

#### 7. **Onboarding - Rede de Apoio**

- Pergunta sobre rede de apoio:
  - Tenho, graças a Deus
  - Às vezes/Pouca
  - Me sinto muito sozinha
- Design: Botões de seleção única
- Progresso: 5/8 dots

#### 6. **Tela de Login**

- Header: Avatar circular + botões voltar e tema
- Título: "Bem-vinda de volta"
- Subtítulo: "Entre para acessar seu espaço seguro."
- Campos:
  - E-mail (com ícone Mail)
  - Senha (com ícone Lock + toggle mostrar/ocultar)
- Link: "Esqueceu a senha?"
- Botão primário: "Entrar"
- Divisor: "OU CONTINUE COM"
- Social login:
  - Continuar com Apple
  - Continuar com Google
- Footer: "Ainda não tem conta? Criar agora"

---

## 🔍 Padrões de UX Identificados

### Navegação

- Botão voltar sempre no topo esquerdo
- Toggle dark mode no topo direito
- Indicadores de progresso (dots) no onboarding
- Transições suaves entre telas

### Validação e Feedback

- Validação em tempo real nos inputs
- Mensagens de erro claras
- Estados de loading ("Entrando...")
- Feedback visual em erros

### Acessibilidade

- Labels descritivos
- Contraste adequado
- Touch targets grandes (44pt+)
- Navegação por teclado

### Responsividade

- Layout adaptável
- Scroll quando necessário
- Keyboard avoiding

---

## 🐛 Problemas Encontrados (para corrigir no app mobile)

1. **Erro de digitação**: "E queceu a enha?" → "Esqueceu a senha?"
2. **Erro de digitação**: "Ge tante" → "Gestante"
3. **Erro de digitação**: "Puérpera (Recém-na cido)" → "Puérpera (Recém-nascido)"
4. **Erro de digitação**: "Confu a" → "Confusa"
5. **Erro de digitação**: "An io a" → "Ansiosa"
6. **Erro de digitação**: "Can ada" → "Cansada"
7. **Erro de digitação**: "An iedade/Depre ão" → "Ansiedade/Depressão"
8. **Erro de digitação**: "Só curio idade" → "Só curiosidade"
9. **Erro de digitação**: "Tenho, graça a Deu" → "Tenho, graças a Deus"
10. **Erro de digitação**: "À veze /Pouca" → "Às vezes/Pouca"
11. **Erro de digitação**: "Me into muito ozinha" → "Me sinto muito sozinha"
12. **Erro de digitação**: "De abafar Conver ar com alguém que entenda" → "Desabafar - Conversar com alguém que entenda"
13. **Erro de digitação**: "Dica prática obre o bebê" → "Dica prática sobre o bebê"
14. **Erro de digitação**: "Re pirar e diminuir an iedade" → "Respirar e diminuir ansiedade"
15. **Erro de digitação**: "Ver relato de outra mãe" → "Ver relato de outra mãe"
16. **Console errors**: Element not found (linha 412)
17. **Warning**: Tailwind CDN não deve ser usado em produção

---

## ✅ Boas Práticas Aplicadas no App Mobile

### Já Implementadas

- ✅ Design tokens centralizados
- ✅ Dark mode completo
- ✅ Validação em tempo real
- ✅ Feedback háptico
- ✅ Animações suaves
- ✅ Acessibilidade WCAG AAA
- ✅ Componentes primitivos reutilizáveis
- ✅ TypeScript strict mode
- ✅ Error handling robusto

### Para Implementar (baseado na análise)

- ✅ Onboarding completo (já existe OnboardingFlowNew.tsx)
- ✅ Seleção de emoções (já existe EmotionalPrompt)
- ✅ Social login (já implementado)
- ✅ Recuperação de senha (já implementado)

---

## 📱 Diferenças Web vs Mobile

### Web (referência)

- Tailwind CSS via CDN
- React 19
- Lucide React
- Google Fonts (Quicksand)
- Service Worker

### Mobile (nosso projeto)

- React Native + Expo
- NativeWind (Tailwind para RN)
- Lucide React Native
- System fonts (iOS/Android)
- Native navigation

---

## 🎯 Recomendações para App Mobile

1. **Manter consistência visual** com o site web
2. **Corrigir todos os erros de digitação** identificados
3. **Implementar animações** similares às do web
4. **Garantir acessibilidade** em todas as telas
5. **Testar dark mode** em todas as telas
6. **Validar fluxo completo** de onboarding
7. **Implementar feedback visual** em todas as ações
8. **Garantir performance** com lazy loading e memoização

---

## 📊 Checklist de Implementação

### Telas Principais

- [x] LoginScreenNew.tsx (melhorado com design robusto)
- [ ] OnboardingFlowNew.tsx (revisar - deve ter 8 etapas completas)
  - [ ] Etapa 1: Boas-vindas
  - [ ] Etapa 2: Nome
  - [ ] Etapa 3: Estágio da maternidade
  - [ ] Etapa 4: Emoções
  - [ ] Etapa 5: Tópicos de interesse
  - [ ] Etapa 6: Rede de apoio
  - [ ] Etapa 7: O que você precisa?
  - [ ] Etapa 8: Finalização
- [ ] HomeScreen.tsx (já existe, revisar)
- [ ] ChatScreen.tsx (já existe, revisar)
- [ ] ProfileScreen.tsx (verificar se existe)

### Componentes

- [x] Input (já existe e melhorado)
- [x] Button (já existe)
- [x] HapticButton (já existe)
- [x] Text (já existe)
- [x] Heading (já existe)
- [x] Box (já existe)
- [ ] EmotionalPrompt (verificar se existe)

### Funcionalidades

- [x] Login/Logout (LoginScreenNew.tsx melhorado)
- [x] Social login (Apple/Google) - implementado
- [x] Recuperação de senha - implementado
- [ ] Onboarding completo (8 etapas identificadas)
- [ ] Tracking de emoções (5 emoções identificadas)
- [ ] Chat com NathIA (ChatScreen.tsx existe)
- [ ] Hábitos (HabitsScreen.tsx existe)
- [ ] Comunidade (MaesValenteScreen.tsx existe)
- [ ] Tópicos de interesse (7 tópicos identificados)
- [ ] Rede de apoio (3 níveis identificados)
- [ ] Necessidades da mãe (4 tipos identificados)

---

## 🔗 Referências

- Site web: https://copy-of-nossa-maternidade0555-854690283424.us-west1.run.app/
- Design tokens: `src/theme/tokens.ts`
- Componentes: `src/components/primitives/`
- Telas: `src/screens/`

---

**Nota**: Este documento serve como referência visual e de UX. O app mobile deve seguir os mesmos padrões de design, mas adaptado para React Native/Expo.
