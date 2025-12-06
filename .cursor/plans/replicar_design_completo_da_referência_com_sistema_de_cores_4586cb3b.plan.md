---
name: Replicar design completo da referência com sistema de cores
overview: Replicar exatamente a HomeScreen da página de referência (https://appsupabasenm.netlify.app/) usando o sistema de cores e componentes do guia, reorganizando cards, adicionando Card Desculpa Hoje, e aplicando gradientes e espaçamentos corretos.
todos:
  - id: reorder-cards-home
    content: "Reorganizar ordem: Sleep -> Dica -> Desculpa -> Featured"
    status: completed
  - id: remove-extra-cards
    content: Remover SOS Mãe e Needs Prompt
    status: completed
  - id: add-desculpa-card
    content: Adicionar Card Desculpa Hoje com design rosa
    status: completed
  - id: adjust-tip-gradient
    content: Ajustar Dica do dia para azul escuro
    status: completed
  - id: adjust-nathia-gradient
    content: Ajustar NathIA para 3 cores (rosa-roxo-azul)
    status: completed
  - id: create-desculpa-route
    content: Criar rota e tela stub DesculpaHojeScreen
    status: completed
  - id: adjust-spacing
    content: Padronizar espaçamentos (gap 6, padding 4)
    status: completed
  - id: validate-colors
    content: "Verificar cores vs guia (primary #FF6B9D, etc)"
    status: completed
  - id: test-navigation
    content: Testar navegação de todos os cards
    status: completed
  - id: visual-comparison
    content: Comparação visual final com referência
    status: completed
---

# Plano: Replicar Design Completo da Página de Referência

## Objetivo

Replicar exatamente a HomeScreen da página https://appsupabasenm.netlify.app/ usando o sistema de cores e componentes do guia React Native.

## Análise Comparativa

### Página de Referência (ordem correta)

1. Header com gradiente rosa-azul
2. Greeting "Olá, mãe"
3. **Card de Sono** (grande, com imagem)
4. **Card "Dica do dia"** (azul escuro)
5. **Card "Desculpa Hoje"** (rosa claro) — FALTA ADICIONAR
6. **Seção "Destaques de hoje"**
7. **Card NathIA** (gradiente 3 cores)
8. **Seção de Humor** (4 botões)
9. Bottom navigation

### Página Atual (problemas)

1. ✅ Greeting correto (sem emoji)
2. ❌ Dica do dia ANTES do Sleep Card (ordem errada)
3. ❌ Falta Card "Desculpa Hoje"
4. ❌ Card de Sono sem gradiente adequado
5. ❌ Featured Content com estrutura diferente
6. ❌ Card NathIA com gradiente 2 cores (deveria ser 3)
7. ❌ Tem SOS Mãe e Needs Prompt (não aparecem na referência)

## Implementação Detalhada

### Fase 1: Reorganizar ordem dos cards

**Arquivo:** `src/screens/HomeScreen.tsx` (linhas 264-763)

**Mudança:** Mover seções para ordem correta:

```typescript
// ORDEM CORRETA:
{/* 1. Greeting */}
{/* 2. Sleep Card */}
{/* 3. Dica do dia */}
{/* 4. Desculpa Hoje */}
{/* 5. Destaques de hoje */}
{/* 6. Chat NathIA */}
{/* 7. Mood Check */}

// REMOVER:
- SOS Mãe Card (linha ~647-699)
- Needs Prompt (linha ~702-704)
```

### Fase 2: Adicionar Card "Desculpa Hoje"

**Arquivo:** `src/screens/HomeScreen.tsx`

**Posição:** Entre "Dica do dia" e "Destaques de hoje"

**Design completo:**

```typescript
{/* Card "Desculpa Hoje" - Rosa Claro */}
<TouchableOpacity
  onPress={handleDesculpaHojePress}
  activeOpacity={0.8}
  accessibilityRole="button"
  accessibilityLabel="Desculpa Hoje - reflexão sobre arrependimentos"
  accessibilityHint="Abra para refletir sobre seu dia e se perdoar"
  style={{
    marginBottom: Tokens.spacing['6'],
    borderRadius: Tokens.radius['3xl'],
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: `${ColorTokens.secondary[200]}80`,
    ...getPlatformShadow('lg'),
  }}
>
  <LinearGradient
    colors={['#FFE4F1', '#FFF1F8']} // Rosa bem claro
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      padding: Tokens.spacing['6'],
    }}
  >
    {/* Ícone de Coração Grande */}
    <Box className="flex-row items-center gap-4 mb-4">
      <Box
        style={{
          width: 64,
          height: 64,
          borderRadius: Tokens.radius['2xl'],
          backgroundColor: `${ColorTokens.secondary[400]}25`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Heart size={32} color={ColorTokens.secondary[400]} fill={ColorTokens.secondary[400]} />
      </Box>
      <Badge
        variant="default"
        size="sm"
        containerStyle={{
          backgroundColor: ColorTokens.secondary[100],
          borderWidth: 1,
          borderColor: ColorTokens.secondary[300],
        }}
      >
        <Text variant="caption" size="xs" style={{ color: ColorTokens.secondary[600] }}>
          💗 Desculpa Hoje
        </Text>
      </Badge>
    </Box>

    {/* Pergunta */}
    <Text
      variant="body"
      size="lg"
      weight="semibold"
      style={{ color: ColorTokens.secondary[700], marginBottom: Tokens.spacing['3'] }}
    >
      Qual foi seu maior arrependimento hoje?
    </Text>

    {/* Botão Responder */}
    <Button
      title="Responder"
      onPress={handleDesculpaHojePress}
      leftIcon={<Sparkles size={16} color={ColorTokens.neutral[0]} />}
      className="rounded-full bg-secondary-500 px-6 py-3 min-h-[48px] flex-row items-center justify-center"
      textClassName="text-sm font-bold text-white"
    />
  </LinearGradient>
</TouchableOpacity>
```

**Handler necessário:**

```typescript
const handleDesculpaHojePress = () => {
  logger.info('Desculpa Hoje pressed', { screen: 'HomeScreen' });
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  navigation.navigate('DesculpaHoje');
};
```

### Fase 3: Ajustar Card "Dica do dia"

**Arquivo:** `src/screens/HomeScreen.tsx` (linhas ~264-302)

**Mudanças:**

- Background: Azul escuro (#1E3A8A ou `ColorTokens.info[900]`)
- Texto: Todo em branco
- Botão: Outline branco/azul
```typescript
<Box
  className="rounded-3xl p-5 shadow-lg border mb-6"
  style={{
    backgroundColor: ColorTokens.info[900], // Azul escuro
    borderColor: `${ColorTokens.info[700]}50`,
  }}
>
  <Box className="flex-row gap-3 items-start">
    <Box
      className="p-2 rounded-xl"
      style={{
        backgroundColor: `${ColorTokens.info[700]}80`,
      }}
    >
      <Lightbulb size={24} color={ColorTokens.neutral[0]} />
    </Box>
    <Box flex={1}>
      <Box className="flex-row items-center gap-2 mb-2">
        <Text variant="body" size="md" weight="bold" color="inverse">
          Dica do dia
        </Text>
        <Badge
          variant="info"
          size="sm"
          containerStyle={{
            backgroundColor: ColorTokens.info[700],
          }}
        >
          Novo
        </Badge>
      </Box>
      <Text variant="body" size="sm" color="inverse" style={{ marginBottom: Tokens.spacing['3'], opacity: 0.9 }}>
        Respire fundo por 30 segundos. Isso ajuda a acalmar o sistema nervoso e traz clareza mental.
      </Text>
      <Button
        title="Saiba mais"
        onPress={() => navigation.navigate('Ritual')}
        leftIcon={<Info size={14} color={ColorTokens.neutral[0]} />}
        className="rounded-2xl border-2 border-white/40 bg-transparent px-4 py-2 min-h-[40px]"
        textClassName="text-sm font-semibold text-white"
      />
    </Box>
  </Box>
</Box>
```


### Fase 4: Ajustar gradiente do Card NathIA

**Arquivo:** `src/screens/HomeScreen.tsx` (linhas ~507-644)

**Mudança:** Usar 3 cores no gradiente (rosa → roxo → azul)

```typescript
// ANTES:
colors={[ColorTokens.primary[400], ColorTokens.secondary[400], ColorTokens.secondary[500]]}

// DEPOIS (3 cores distintas):
colors={['#FF6B9D', '#A855F7', '#3B82F6']} // Rosa → Roxo → Azul
// ou
colors={[ColorTokens.secondary[400], ColorTokens.primary[500], ColorTokens.info[500]]}
```

### Fase 5: Ajustar layout da seção de humor

**Arquivo:** `src/screens/HomeScreen.tsx` (linhas ~731-761)

**Mudanças:**

- Garantir grid 2x2 correto
- Cada botão com min-width: 45%
- Espaçamento adequado
```typescript
<Box
  style={{
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing['3'], // 12px
    justifyContent: 'space-between',
  }}
>
  {moods.map((mood) => {
    const isSelected = selectedMood === mood.label;
    return (
      <TouchableOpacity
        key={mood.label}
        style={{
          width: '48%', // Garantir 2 colunas
          paddingVertical: Tokens.spacing['4'],
          borderRadius: Tokens.radius['2xl'],
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? colors.primary.main : colors.border.medium,
          backgroundColor: isSelected ? `${colors.primary.main}15` : colors.background.card,
          alignItems: 'center',
          minHeight: Tokens.touchTargets.min,
        }}
      >
        {/* ... */}
      </TouchableOpacity>
    );
  })}
</Box>
```


### Fase 6: Remover cards não presentes na referência

**Arquivo:** `src/screens/HomeScreen.tsx`

**Remover completamente:**

1. **SOS Mãe Card** (linhas ~647-699)

   - Todo o `<TouchableOpacity onPress={handleSOSMaePress}>` até `</TouchableOpacity>`

2. **Needs Prompt Card** (linhas ~702-704)

   - Todo o card com `<NeedsPrompt>`

**Também remover handlers:**

```typescript
// Remover:
const handleSOSMaePress = () => { ... }
const handleNeedSelect = async (need: NeedValue) => { ... }
```

### Fase 7: Ajustar espaçamentos globais

**Arquivo:** `src/screens/HomeScreen.tsx`

**Padronizar gaps entre cards:**

```typescript
// Cada card deve ter:
marginBottom: Tokens.spacing['6'] // 24px
```

**Padding do ScrollView:**

```typescript
contentContainerStyle={{
  paddingTop: insets.top + 80,
  paddingBottom: insets.bottom + 100, // Mais espaço para tab bar
  paddingHorizontal: Tokens.spacing['4'], // 16px
}}
```

### Fase 8: Validar cores exatas

**Comparar com guia:**

- Primary: `#FF6B9D` (rosa maternal)
- Secondary: `#A855F7` (roxo/lilás)
- Info: `#3B82F6` (azul)
- Success: `#22C55E` (verde)
- Error: `#EF4444` (vermelho)

**Verificar se `ColorTokens` no projeto atual corresponde ao guia.**

### Fase 9: Criar rota para "Desculpa Hoje"

**Arquivo:** `src/navigation/types.ts`

**Adicionar tipo:**

```typescript
export type RootStackParamList = {
  // ... existing routes
  DesculpaHoje: undefined;
  // ...
};
```

**Arquivo:** `src/navigation/StackNavigator.tsx` (ou onde as rotas são definidas)

**Adicionar rota:**

```typescript
<Stack.Screen 
  name="DesculpaHoje" 
  component={DesculpaHojeScreen}
  options={{ headerShown: false }}
/>
```

**Arquivo a criar:** `src/screens/DesculpaHojeScreen.tsx`

- Tela simples com lista de arrependimentos comuns
- Design consistente com o app

## Arquivos a Modificar

1. **`src/screens/HomeScreen.tsx`** - Reorganizar, adicionar card, remover cards extras
2. **`src/navigation/types.ts`** - Adicionar tipo DesculpaHoje
3. **`src/navigation/StackNavigator.tsx`** - Adicionar rota
4. **`src/screens/DesculpaHojeScreen.tsx`** - Criar nova tela (pode ser stub inicial)

## Ordem de Execução

1. **Reorganizar cards** (mover Sleep para cima, Dica para baixo)
2. **Remover cards extras** (SOS Mãe, Needs Prompt)
3. **Adicionar Card Desculpa Hoje** (com handler stub)
4. **Ajustar gradientes** (Dica do dia azul escuro, NathIA 3 cores)
5. **Ajustar espaçamentos** (gaps, padding, margin)
6. **Criar rota** para DesculpaHoje (stub screen)
7. **Validar cores** (verificar se correspondem ao guia)
8. **Testar navegação** (todos os cards devem navegar)
9. **Comparação visual** (lado a lado com referência)

## Checklist Final

- [ ] Ordem dos cards idêntica à referência
- [ ] Card "Desculpa Hoje" presente e funcional
- [ ] Cores e gradientes exatos
- [ ] Espaçamentos corretos (6 = 24px entre cards)
- [ ] Tipografia consistente
- [ ] Cards removidos (SOS Mãe, Needs Prompt)
- [ ] Navegação funcionando
- [ ] Sem erros de console
- [ ] Sem erros de lint
- [ ] Acessibilidade mantida (WCAG AAA)