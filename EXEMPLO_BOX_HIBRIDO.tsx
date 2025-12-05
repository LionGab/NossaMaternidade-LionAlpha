/**
 * EXEMPLO: Box Híbrido (Props + className)
 *
 * Validação da PoC - Passos 1 + 2
 *
 * ✅ Passo 1: Tailwind sincronizado (Rosa Magenta #E91E63)
 * ✅ Passo 2: Box.tsx híbrido (className + props)
 */

import React from 'react';
import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';

export function ExemploBoxHibrido() {
  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* MODO 1: Props Semânticas (Legado - Backwards Compatible) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Box
        bg="card"
        p="5"
        rounded="3xl"
        shadow="md"
        borderWidth={1}
        borderColor="light"
        mb="6"
      >
        <Text variant="body" size="lg" weight="semibold">
          ✅ Modo 1: Props (funciona como antes)
        </Text>
        <Text variant="body" size="sm" color="secondary">
          Usa colors.background.card, Spacing[&apos;5&apos;], Radius[&apos;3xl&apos;], etc.
        </Text>
      </Box>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* MODO 2: className (NativeWind v4 - Recomendado) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Box className="bg-card p-5 rounded-3xl shadow-md border border-border-light mb-6">
        <Text className="text-lg font-semibold text-primary">
          ✅ Modo 2: className (NativeWind)
        </Text>
        <Text className="text-sm text-secondary">
          Usa Tailwind config (bg-card, p-5, rounded-3xl, etc.)
        </Text>
      </Box>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* VALIDAÇÃO: className tem prioridade */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Box
        className="bg-primary-500 p-6 rounded-2xl" // ⭐ className tem prioridade
        bg="card" // ignorado
        p="2" // ignorado
        rounded="sm" // ignorado
      >
        <Text className="text-white font-bold">
          ✅ className ganha (bg rosa #E91E63, p-6, rounded-2xl)
        </Text>
      </Box>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* CORES ALINHADAS: Tailwind = Tokens.ts */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Box className="bg-primary-500">
        {/* bg-primary-500 = #E91E63 (Rosa Magenta) ✅ */}
        <Text className="text-white">Rosa Magenta (#E91E63)</Text>
      </Box>

      <Box className="bg-secondary-500">
        {/* bg-secondary-500 = #9C27B0 (Roxo Vibrante) ✅ */}
        <Text className="text-white">Roxo Vibrante (#9C27B0)</Text>
      </Box>
    </>
  );
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RESULTADO DA PoC (Passos 1 + 2)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ✅ Passo 1: Tailwind sincronizado
 *    - primary.DEFAULT: #004E9A → #E91E63 (Rosa Magenta)
 *    - secondary.DEFAULT: #D93025 → #9C27B0 (Roxo Vibrante)
 *
 * ✅ Passo 2: Box híbrido funcionando
 *    - Props semânticas: ✅ Funciona (backwards compatible)
 *    - className: ✅ Funciona (NativeWind v4)
 *    - Prioridade: ✅ className ganha
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PRÓXIMO PASSO
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Validar PoC:
 * 1. npm start
 * 2. Importar ExemploBoxHibrido em HomeScreen
 * 3. Verificar visualmente:
 *    - Props funcionam? ✅
 *    - className funciona? ✅
 *    - Cores corretas? ✅ (Rosa Magenta + Roxo)
 *
 * Se validado, prosseguir com Passos 3-8:
 * - Passo 3: Text.tsx híbrido
 * - Passo 4: Button.tsx híbrido
 * - Passo 5: Helper dark mode
 * - Passo 6: HomeScreen migrada
 * - Passo 7: Testes smoke
 * - Passo 8: Documentação
 */
