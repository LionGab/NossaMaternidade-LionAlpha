/**
 * Design System Central - Nossa Maternidade
 *
 * ⚠️ DEPRECATED: Este módulo está obsoleto e será removido em versão futura.
 *
 * ⭐ USE O NOVO SISTEMA:
 * - import { Tokens } from '@/theme/tokens'
 * - import { useThemeColors } from '@/theme'
 *
 * Migração:
 * - COLORS.primary[500] → colors.primary.main (com useThemeColors())
 * - SPACING[4] → Tokens.spacing['4']
 * - TYPOGRAPHY.button → Tokens.textStyles.button
 * - BORDERS.buttonRadius → Tokens.radius.lg
 *
 * @version 1.0 (DEPRECATED)
 * @date 2025-11-27
 * @deprecated Use @/theme/tokens instead
 *
 * ⚠️ Este arquivo existe apenas para compatibilidade durante migração.
 * Nenhum código novo deve importar deste módulo.
 */

// Log de deprecação
import { logger } from '@/utils/logger';

if (__DEV__) {
  logger.warn(
    '[DEPRECATED] @/design-system está obsoleto. ' +
      'Use @/theme/tokens e useThemeColors() em vez disso. ' +
      'Veja docs/DESIGN_VALIDATION_GUIDE.md para migração.'
  );
}

// ⚠️ EXPORTS REMOVIDOS - Use @/theme/tokens em vez disso
// Os arquivos originais (colors.ts, typography.ts, etc.) ainda existem
// mas não devem ser importados diretamente.

// Se você precisa de compatibilidade temporária, importe diretamente:
// import { COLORS } from '@/design-system/colors'; // ⚠️ DEPRECATED
// Mas prefira migrar para: import { ColorTokens } from '@/theme/tokens';
