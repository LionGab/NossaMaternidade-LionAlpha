# Status da Migração Híbrida (Props + className)

**Data:** 5 de dezembro de 2025
**Versão:** 2.0 - Hybrid Mode
**Status:** 🟡 Em Progresso (60% concluído)

---

## 📊 PROGRESSO GERAL

| Componente | Status | Modo |
|------------|--------|------|
| **Design System** | ✅ Completo | Sincronizado |
| **Box.tsx** | ✅ Completo | Híbrido |
| **Text.tsx** | ✅ Completo | Híbrido |
| **HomeScreen.tsx** | 🟡 Parcial | Migrando |
| **Button.tsx** | ⏸️ Pendente | Props only |
| **Helper Dark Mode** | ⏸️ Pendente | N/A |
| **Testes** | ⏸️ Pendente | N/A |
| **Docs** | 🟡 Em andamento | N/A |

**Legenda:**
- ✅ Completo
- 🟡 Em andamento
- ⏸️ Pendente

---

## ✅ CONCLUÍDO

### 1. Tailwind Config Sincronizado

**Arquivo:** `tailwind.config.js`

**Mudanças:**
```diff
- primary.DEFAULT: '#004E9A' (Ocean Blue)
+ primary.DEFAULT: '#E91E63' (Rosa Magenta)

- secondary.DEFAULT: '#D93025' (Coral)
+ secondary.DEFAULT: '#9C27B0' (Roxo Vibrante)
```

**Resultado:**
- ✅ Alinhado com `Tokens.ts`
- ✅ Alinhado com screenshots (rosa/roxo)
- ✅ Sem conflitos de cores

---

### 2. Box.tsx Híbrido

**Arquivo:** `src/components/atoms/Box.tsx`

**Suporte adicionado:**
- ✅ `className` (NativeWind v4)
- ✅ Props semânticas (backwards compatible)
- ✅ Prioridade: `className` > `props`

**Implementação:**
```tsx
export const Box = React.memo(function Box({
  className, // ⭐ NOVO
  bg, p, rounded, // Props legadas
  ...
}: BoxProps) {
  // Modo 1: className tem prioridade
  if (className) {
    return <View className={className} style={style} {...props}>{children}</View>;
  }

  // Modo 2: Props semânticas (fallback)
  const computedStyle = useMemo(() => {
    // Lógica existente preservada
  }, [...]);

  return <View style={computedStyle} {...props}>{children}</View>;
});
```

**Nota Importante:**
- ⚠️ Implementação **NÃO** usa `styled()` do NativeWind
- ⚠️ Usa `className` diretamente no `<View>`
- ⚠️ Funciona, mas pode ter limitações de dark mode

---

### 3. Text.tsx Híbrido

**Arquivo:** `src/components/atoms/Text.tsx`

**Suporte adicionado:**
- ✅ `className` (NativeWind v4)
- ✅ Props semânticas (backwards compatible)
- ✅ Prioridade: `className` > `props`

**Implementação:**
```tsx
export const Text = React.memo(function Text({
  className, // ⭐ NOVO
  variant, size, color, // Props legadas
  ...
}: CustomTextProps) {
  // Modo 1: className tem prioridade
  if (className) {
    return (
      <RNText
        className={className}
        style={style}
        allowFontScaling={allowFontScaling}
        accessible={true}
        accessibilityRole="text"
        {...props}
      >
        {children}
      </RNText>
    );
  }

  // Modo 2: Props semânticas (fallback)
  const colors = useThemeColors();
  const computedStyle = useMemo(() => {
    // Lógica existente preservada
  }, [...]);

  return <RNText style={computedStyle} {...props}>{children}</RNText>;
});
```

---

### 4. HomeScreen.tsx (Migração Parcial)

**Arquivo:** `src/screens/HomeScreen.tsx`

**Áreas migradas para `className`:**

✅ **Greeting:**
```tsx
<Box className="mb-6">
  <Text className="text-2xl font-bold mb-1">
    Olá, mãe
  </Text>
  <Text className="text-sm text-text-secondary">
    Respira um pouquinho. Estamos aqui por você.
  </Text>
</Box>
```

✅ **Dica do Dia:**
```tsx
<Box
  className="rounded-3xl p-5 shadow-md border mb-6"
  style={{
    backgroundColor: ColorTokens.info[50],
    borderColor: `${ColorTokens.info[300]}50`,
  }}
>
  <Box className="flex-row gap-3 items-start">
    {/* ... */}
  </Box>
</Box>
```

✅ **Featured Content:**
```tsx
<Box className="mb-6">
  <Text className="text-lg font-semibold mb-3">
    Destaques de hoje
  </Text>
  <Text className="text-sm text-text-secondary mb-4">
    Selecionados especialmente para você
  </Text>

  <Box className="gap-3">
    <Box className="bg-card rounded-3xl p-4 shadow-md border border-border-light">
      {/* Video Card */}
    </Box>
  </Box>
</Box>
```

✅ **NathIA Card:**
```tsx
<Box className="flex-row items-center justify-between mb-4">
  <Box className="flex-row items-center gap-3 flex-1">
    {/* Avatar + Badge */}
  </Box>
</Box>

<Box className="flex-row items-center justify-center gap-2 mb-4">
  {/* Badges Rápido e 24/7 */}
</Box>

<Box className="flex-row gap-2">
  {/* Botões */}
</Box>
```

✅ **Needs Prompt Card:**
```tsx
<Box className="bg-card rounded-3xl p-6 shadow-md border border-border-light mb-6">
  <NeedsPrompt title="O que você mais precisa agora?" onSelect={handleNeedSelect} />
</Box>
```

✅ **Mood Check Card:**
```tsx
<Box className="bg-card rounded-3xl p-6 shadow-md border border-border-light mb-6">
  <Box className="flex-row items-center gap-2 mb-4">
    <Text variant="body" size="2xl">🧡</Text>
    <Text variant="body" size="md" weight="semibold">
      Como você está hoje?
    </Text>
  </Box>
  {/* ... */}
</Box>
```

**Áreas ainda usando `props`:**
- ⏸️ Alguns textos internos (variant, size, color)
- ⏸️ LinearGradient (não suporta className completo)
- ⏸️ Badges
- ⏸️ Alguns estilos inline complexos

**Padrão Misto Observado:**
```tsx
// ✅ COMUM: className + style inline
<Box
  className="rounded-3xl p-5 shadow-md border mb-6"
  style={{
    backgroundColor: ColorTokens.info[50],
    borderColor: `${ColorTokens.info[300]}50`,
  }}
>
```

---

## ⏸️ PENDENTE

### 5. Button.tsx Híbrido

**Próximos passos:**
1. Adicionar `className?: string` na interface
2. Implementar lógica condicional:
   - Se `className` → usar NativeWind
   - Senão → usar variant styles (legado)
3. Manter haptic feedback e acessibilidade

**Estimativa:** 45 min

---

### 6. Helper Dark Mode

**Arquivo a criar:** `src/utils/themeClassName.ts`

**Funcionalidade:**
```tsx
export function useThemeClassName() {
  const { isDark } = useTheme();

  return (className: string) => {
    if (!isDark) {
      return className.replace(/dark:[^\s]+/g, '').trim();
    }

    const classes = className.split(' ');
    return classes
      .map((cls) => {
        if (cls.startsWith('dark:')) {
          return cls.replace('dark:', '');
        }
        return cls;
      })
      .join(' ');
  };
}
```

**Uso:**
```tsx
const cn = useThemeClassName();
<Box className={cn('bg-white dark:bg-gray-900')}>
```

**Estimativa:** 20 min

---

### 7. Finalizar HomeScreen

**Áreas a migrar:**
- [ ] Converter todos os `Text` variant/size/color → `className`
- [ ] Testar dark mode
- [ ] Validar responsividade
- [ ] Verificar acessibilidade

**Estimativa:** 1h

---

### 8. Testes Smoke

**Arquivo a criar:** `__tests__/atoms/Box.test.tsx`

**Casos de teste:**
```tsx
describe('Box (Hybrid)', () => {
  it('should render with props (backwards compatible)');
  it('should render with className (NativeWind)');
  it('className should have priority over props');
});
```

**Estimativa:** 30 min

---

### 9. Documentação Completa

**Arquivos a criar/atualizar:**
- [ ] `docs/HYBRID_PATTERN.md` (guia de uso)
- [ ] `docs/MIGRATION_GUIDE.md` (como migrar)
- [ ] `README.md` (atualizar stack)

**Estimativa:** 20 min

---

## 🎯 DECISÕES TÉCNICAS

### ✅ Decisões Tomadas

1. **Padrão Híbrido:**
   - Suportar `className` E `props`
   - `className` tem prioridade
   - Backwards compatible

2. **Implementação:**
   - NÃO usar `styled()` do NativeWind
   - Usar `className` diretamente em componentes nativos
   - Preservar lógica existente como fallback

3. **Tailwind Sync:**
   - primary = Rosa Magenta (#E91E63)
   - secondary = Roxo Vibrante (#9C27B0)
   - Alinhado com Tokens.ts

### ⚠️ Limitações Conhecidas

1. **Dark Mode:**
   - `dark:` prefixes podem não funcionar automaticamente
   - Precisa do helper `useThemeClassName()`
   - Solução: Passo 6 (pendente)

2. **LinearGradient:**
   - Não suporta `className` completo
   - Apenas opacity/size via className
   - Colors continuam via `colors` prop

3. **Type Safety:**
   - `className` é string livre (sem validação TS)
   - Props têm type safety (TS valida)
   - Trade-off: flexibilidade vs segurança

---

## 📈 PRÓXIMOS PASSOS

### Curto Prazo (Próxima Sessão)

1. ✅ **Validar PoC:** Testar HomeScreen no emulador
2. ⏸️ **Button.tsx:** Implementar suporte híbrido
3. ⏸️ **Helper Dark Mode:** Criar `useThemeClassName()`
4. ⏸️ **Finalizar HomeScreen:** Migrar 100%

### Médio Prazo

5. ⏸️ **Testes:** Criar smoke tests
6. ⏸️ **Docs:** Guia completo
7. ⏸️ **Code Review:** Revisar implementação
8. ⏸️ **Performance:** Verificar impacto

### Longo Prazo

9. ⏸️ **Migrar Outras Telas:** Chat, Habits, etc.
10. ⏸️ **Styled Components:** Avaliar necessidade
11. ⏸️ **CI/CD:** Adicionar validação de design tokens

---

## 🐛 BUGS CONHECIDOS

Nenhum bug crítico identificado.

**Potenciais problemas:**
- ⚠️ Dark mode via `className` não testado
- ⚠️ Performance com muitos `className` não medida
- ⚠️ Acessibilidade com `className` não validada (WCAG)

---

## 📚 REFERÊNCIAS

### Arquivos Modificados

1. `tailwind.config.js` - Sincronizado (rosa/magenta)
2. `src/components/atoms/Box.tsx` - Híbrido
3. `src/components/atoms/Text.tsx` - Híbrido
4. `src/screens/HomeScreen.tsx` - Parcialmente migrado
5. `EXEMPLO_BOX_HIBRIDO.tsx` - Exemplo de uso

### Documentação

- [NativeWind v4 Docs](https://www.nativewind.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Native Docs](https://reactnative.dev/docs)

---

## 🎓 LIÇÕES APRENDIDAS

1. **Híbrido é Viável:**
   - Permite migração gradual
   - Não quebra código existente
   - Flexibilidade para escolher

2. **className Simples Funciona:**
   - Não precisa de `styled()` obrigatoriamente
   - className direto em View/Text funciona
   - Menos overhead

3. **Design System é Crítico:**
   - Tailwind deve estar alinhado com Tokens.ts
   - Conflitos de cores geram confusão
   - Única fonte da verdade (Tokens.ts)

4. **Props Têm Vantagens:**
   - Type safety superior
   - Theme-aware automático
   - Menos verbose em alguns casos

5. **className Tem Vantagens:**
   - Menos código em alguns casos
   - Familiar para devs web
   - Stack moderna

---

**Última atualização:** 5 de dezembro de 2025, 22:45
**Autor:** Claude Code (com Lion)
**Versão:** 2.0 - Status Report
