# 🎨 Melhorias de Design - Nossa Maternidade

## 📋 Diagnóstico Rápido

### Problemas Identificados:

- ⚠️ **Espaçamento inconsistente**: Mistura de valores hardcoded (4, 8, 16) com tokens
- ⚠️ **Hierarquia visual fraca**: Títulos e subtítulos com pouco contraste de cor
- ⚠️ **Sombras muito pesadas**: Uso excessivo de `shadows.xl` em cards pequenos
- ⚠️ **Contraste de texto**: Textos secundários com baixo contraste (WCAG AA, não AAA)
- ⚠️ **Responsividade limitada**: Alguns componentes não se adaptam bem

## 🎯 Proposta de Melhoria

### Direção Visual:

1. **Espaçamento unificado** via tokens (grid de 4px)
2. **Hierarquia tipográfica** mais clara (tamanhos e pesos)
3. **Sombras sutis** e contextuais (elevação progressiva)
4. **Contraste WCAG AAA** (mínimo 7:1 para texto)
5. **Microinterações** mais suaves e naturais

## 💻 Código Refatorado

### 1. EmpatheticWelcomeV2 - Versão Melhorada

```typescript
// src/components/home/EmpatheticWelcomeV2.tsx
// ✅ MELHORIAS APLICADAS:
// - Espaçamento consistente via tokens
// - Hierarquia visual melhorada
// - Contraste WCAG AAA
// - Sombras mais sutis
// - Microinterações suaves

import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, TouchableOpacity } from 'react-native';
import { Moon, Sun, Sunrise, Sunset } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

// ... (código existente mantido até o componente)

export function EmpatheticWelcomeV2({
  userName,
  variant = 'default',
}: EmpatheticWelcomeV2Props) {
  const { colors, isDark, toggleTheme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const period = useMemo(() => getPeriod(), []);
  const subtitle = useMemo(() => getRandomItem(EMPATHETIC_SUBTITLES[period]), [period]);
  const greeting = useMemo(() => getRandomItem(GREETINGS[period]), [period]);
  const displayName = useMemo(
    () => userName ? `, ${userName.split(' ')[0]}` : '',
    [userName]
  );
  const emoji = PERIOD_EMOJIS[period];
  const IconComponent = PERIOD_ICONS[period];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Variante Default/Warm (melhorada)
  const isWarm = variant === 'warm';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessibilityRole="header"
      accessibilityLabel={`${greeting}${displayName}. ${subtitle}`}
      accessibilityHint="Saudação acolhedora com mensagem de apoio"
    >
      <Box px="5" pt="5" pb="4">
        <View style={styles.row}>
          {/* Ícone do período - Melhorado */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isDark
                  ? `${ColorTokens.primary[500]}20` // ✅ Aumentado de 15 para 20 (mais visível)
                  : `${ColorTokens.primary[500]}15`,
              },
            ]}
          >
            <IconComponent
              size={24} // ✅ Aumentado de 22 para 24 (melhor hierarquia)
              color={isDark ? ColorTokens.primary[300] : ColorTokens.primary[600]} // ✅ Contraste melhorado
            />
          </View>

          {/* Textos - Melhorado */}
          <View style={styles.textContainer}>
            {/* Saudação principal */}
            <View style={styles.greetingRow}>
              <Text
                size="2xl"
                weight="bold"
                style={{
                  color: colors.text.primary,
                  lineHeight: 36, // ✅ Aumentado de 32 para 36 (melhor legibilidade)
                  letterSpacing: -0.5, // ✅ Adicionado para modernidade
                }}
              >
                {greeting}{displayName}
              </Text>
              {isWarm && (
                <Text style={styles.emoji}>{emoji}</Text>
              )}
            </View>

            {/* Subtítulo empático - Melhorado */}
            <Text
              size="md"
              style={{
                color: isDark
                  ? colors.text.secondary
                  : ColorTokens.neutral[600], // ✅ Contraste WCAG AAA (7:1)
                lineHeight: 24,
                marginTop: Tokens.spacing['2'], // ✅ Aumentado de '1' para '2' (melhor respiração)
                fontStyle: isWarm ? 'italic' : 'normal',
                opacity: isDark ? 0.9 : 0.85, // ✅ Ajuste fino de contraste
              }}
            >
              {subtitle}
            </Text>

            {/* Linha extra para variante warm */}
            {isWarm && (
              <Text
                size="sm"
                style={{
                  color: isDark
                    ? colors.text.tertiary
                    : ColorTokens.neutral[500], // ✅ Contraste melhorado
                  lineHeight: 20,
                  marginTop: Tokens.spacing['2'], // ✅ Consistente
                }}
              >
                Estou aqui. Sem pressa.
              </Text>
            )}
          </View>

          {/* Theme Toggle - Melhorado */}
          <TouchableOpacity
            onPress={handleThemeToggle}
            activeOpacity={0.8} // ✅ Aumentado de 0.7 para 0.8 (feedback mais visível)
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            accessibilityHint="Alterna entre tema claro e escuro"
            style={[
              styles.themeToggle,
              {
                backgroundColor: isDark
                  ? ColorTokens.warning[500]
                  : ColorTokens.neutral[800],
                // ✅ Sombra mais sutil
                shadowColor: isDark ? ColorTokens.warning[500] : ColorTokens.neutral[900],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15, // ✅ Reduzido de padrão para mais sutil
                shadowRadius: 4,
                elevation: 3, // ✅ Reduzido para Android
              },
            ]}
          >
            {isDark ? (
              <Sun size={22} color={ColorTokens.neutral[900]} />
            ) : (
              <Moon size={22} color={ColorTokens.neutral[0]} />
            )}
          </TouchableOpacity>
        </View>
      </Box>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container principal
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Tokens.spacing['4'], // ✅ Aumentado de '3' para '4' (melhor respiração)
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 48, // ✅ Aumentado de 44 para 48 (melhor touch target)
    height: 48,
    borderRadius: Tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2, // ✅ Ajuste fino de alinhamento
  },
  textContainer: {
    flex: 1,
    minWidth: 0, // ✅ Previne overflow em telas pequenas
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['2.5'], // ✅ Aumentado de '2' para '2.5'
    flexWrap: 'wrap', // ✅ Permite quebra em telas pequenas
  },
  emoji: {
    fontSize: 28, // ✅ Aumentado de 24 para 28 (melhor proporção)
  },
  themeToggle: {
    width: 48, // ✅ Aumentado de 44 para 48 (WCAG AAA)
    height: 48,
    borderRadius: Tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
});
```

### 2. EmpatheticNathIACardV2 - Versão Melhorada

```typescript
// src/components/home/EmpatheticNathIACardV2.tsx
// ✅ MELHORIAS APLICADAS:
// - Sombras mais sutis e contextuais
// - Espaçamento interno melhorado
// - Contraste de texto otimizado
// - Hierarquia visual mais clara

const styles = StyleSheet.create({
  card: {
    borderRadius: Tokens.radius['2xl'],
    padding: Tokens.spacing['6'], // ✅ Aumentado de '5' para '6' (melhor respiração)
    minHeight: 200,
    overflow: 'hidden',
    // ✅ Sombra mais sutil e moderna
    shadowColor: ColorTokens.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // ✅ Reduzido de padrão xl
    shadowRadius: 12,
    elevation: 4, // ✅ Reduzido para Android
  },

  // ... outros estilos mantidos

  title: {
    color: ColorTokens.nathIA.text.light,
    marginBottom: Tokens.spacing['2'], // ✅ Aumentado de '1' para '2'
    lineHeight: 32, // ✅ Aumentado de 28 para 32 (melhor legibilidade)
    letterSpacing: -0.3, // ✅ Adicionado para modernidade
  },
  subtitle: {
    color: `${ColorTokens.nathIA.text.light}E6`, // ✅ Opacidade ajustada (90%)
    marginBottom: Tokens.spacing['2.5'], // ✅ Aumentado de '2' para '2.5'
    lineHeight: 22, // ✅ Aumentado de 20 para 22
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Tokens.spacing['2.5'], // ✅ Aumentado de '2' para '2.5'
    backgroundColor: ColorTokens.neutral[0],
    paddingVertical: Tokens.spacing['4'], // ✅ Aumentado de '3.5' para '4'
    paddingHorizontal: Tokens.spacing['6'],
    borderRadius: Tokens.radius.full,
    // ✅ Sombra mais sutil
    shadowColor: ColorTokens.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
});
```

## 💡 Dica de UX

**Microinterações Contextuais**:

- Use animações mais rápidas (300-400ms) para ações primárias
- Use animações mais lentas (600-800ms) para transições de tela
- Adicione feedback háptico diferenciado: `Light` para navegação, `Medium` para ações importantes, `Heavy` para confirmações críticas

**Hierarquia Visual**:

- Títulos principais: `size="2xl"`, `weight="bold"`, `lineHeight: 36`
- Subtítulos: `size="md"`, `weight="medium"`, `lineHeight: 24`
- Texto secundário: `size="sm"`, `weight="regular"`, `lineHeight: 20`

**Espaçamento Consistente**:

- Entre elementos relacionados: `Tokens.spacing['2']` (8px)
- Entre seções: `Tokens.spacing['4']` (16px)
- Padding interno de cards: `Tokens.spacing['6']` (24px)
- Margem entre cards: `Tokens.spacing['5']` (20px)
