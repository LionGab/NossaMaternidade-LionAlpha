/**
 * NathIALayout - Layout Responsivo para Telas da NathIA
 *
 * Layout adaptativo que se ajusta a diferentes tamanhos de tela:
 * - Mobile pequeno (< 390px): Layout compacto
 * - Mobile padrão (390-428px): Layout padrão
 * - Tablet (>= 768px): Layout expandido com mais colunas
 *
 * Features:
 * - Grid responsivo
 * - Espaçamento adaptativo
 * - Safe area support
 * - Dark mode support
 */

import React, { useMemo, useCallback, memo } from 'react';
import {
  View,
  ViewStyle,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/primitives/Box';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Breakpoints do design system
const BREAKPOINTS = {
  xs: 360, // Mobile pequeno
  sm: 390, // Mobile padrão
  md: 428, // Mobile grande
  lg: 768, // Tablet
  xl: 1024, // Desktop (se web)
} as const;

// Determinar tamanho do dispositivo
const getDeviceSize = (width: number): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  return 'xl';
};

// Configurações de layout por tamanho
const LAYOUT_CONFIG = {
  xs: {
    columns: 1,
    padding: Tokens.spacing['3'],
    gap: Tokens.spacing['3'],
    maxWidth: SCREEN_WIDTH,
    cardPadding: Tokens.spacing['4'],
  },
  sm: {
    columns: 1,
    padding: Tokens.spacing['4'],
    gap: Tokens.spacing['4'],
    maxWidth: SCREEN_WIDTH,
    cardPadding: Tokens.spacing['4'],
  },
  md: {
    columns: 1,
    padding: Tokens.spacing['4'],
    gap: Tokens.spacing['4'],
    maxWidth: SCREEN_WIDTH,
    cardPadding: Tokens.spacing['5'],
  },
  lg: {
    columns: 2,
    padding: Tokens.spacing['6'],
    gap: Tokens.spacing['6'],
    maxWidth: 1200,
    cardPadding: Tokens.spacing['6'],
  },
  xl: {
    columns: 3,
    padding: Tokens.spacing['8'],
    gap: Tokens.spacing['8'],
    maxWidth: 1400,
    cardPadding: Tokens.spacing['6'],
  },
} as const;

export interface NathIALayoutProps {
  /** Conteúdo principal */
  children: React.ReactNode;
  /** Header customizado */
  header?: React.ReactNode;
  /** Footer customizado */
  footer?: React.ReactNode;
  /** Se deve usar ScrollView */
  scrollable?: boolean;
  /** Estilo customizado do container */
  containerStyle?: ViewStyle;
  /** Padding customizado */
  padding?: keyof typeof Tokens.spacing;
  /** Gap customizado entre elementos */
  gap?: keyof typeof Tokens.spacing;
  /** Se deve centralizar conteúdo em tablets */
  centerContent?: boolean;
}

export const NathIALayout: React.FC<NathIALayoutProps> = ({
  children,
  header,
  footer,
  scrollable = true,
  containerStyle,
  padding,
  gap,
  centerContent = true,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const deviceSize = useMemo(() => getDeviceSize(SCREEN_WIDTH), []);
  const config = LAYOUT_CONFIG[deviceSize];

  // Calcular padding e gap customizados ou usar padrão
  const finalPadding = padding ? Tokens.spacing[padding] : config.padding;
  const finalGap = gap ? Tokens.spacing[gap] : config.gap;

  // Container style responsivo
  const containerStyles: ViewStyle = useMemo(() => {
    const baseStyle: ViewStyle = {
      flex: 1,
      backgroundColor: colors.background.canvas,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    };

    // Em tablets, centralizar e limitar largura
    if (deviceSize >= 'lg' && centerContent) {
      baseStyle.maxWidth = config.maxWidth;
      baseStyle.alignSelf = 'center';
      baseStyle.width = '100%';
    }

    return baseStyle;
  }, [deviceSize, config.maxWidth, centerContent, colors, insets]);

  // Content wrapper style
  const contentWrapperStyle: ViewStyle = useMemo(() => {
    return {
      paddingHorizontal: finalPadding,
      paddingVertical: finalPadding,
      gap: finalGap,
      ...(deviceSize >= 'lg' && {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
      }),
    };
  }, [deviceSize, finalPadding, finalGap]);

  // Renderizar conteúdo
  const renderContent = useCallback(() => {
    const content = (
      <View style={contentWrapperStyle}>
        {header && (
          <Box
            style={{
              width: '100%',
              marginBottom: finalGap,
            }}
          >
            {header}
          </Box>
        )}

        {/* Conteúdo principal */}
        <View
          style={{
            flex: 1,
            ...(deviceSize >= 'lg' && {
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: finalGap,
            }),
          }}
        >
          {children}
        </View>

        {footer && (
          <Box
            style={{
              width: '100%',
              marginTop: finalGap,
            }}
          >
            {footer}
          </Box>
        )}
      </View>
    );

    if (scrollable) {
      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + finalPadding,
          }}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {content}
        </ScrollView>
      );
    }

    return content;
  }, [
    contentWrapperStyle,
    header,
    footer,
    finalGap,
    deviceSize,
    children,
    scrollable,
    insets.bottom,
    finalPadding,
  ]);

  return <View style={[containerStyles, containerStyle]}>{renderContent()}</View>;
};

/**
 * NathIACard - Card responsivo para conteúdo da NathIA
 */
export interface NathIACardProps {
  /** Conteúdo do card */
  children: React.ReactNode;
  /** Largura do card (1-12 colunas em tablets) */
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  /** Padding interno */
  padding?: keyof typeof Tokens.spacing;
  /** Se deve ter sombra */
  shadow?: boolean;
  /** Se deve ter borda */
  bordered?: boolean;
  /** Estilo customizado */
  style?: ViewStyle;
  /** Callback ao pressionar */
  onPress?: () => void;
}

export const NathIACard: React.FC<NathIACardProps> = memo(
  ({ children, columns = 1, padding = '4', shadow = true, bordered = true, style, onPress }) => {
    const { colors } = useTheme();
    const deviceSize = useMemo(() => getDeviceSize(SCREEN_WIDTH), []);

    // Calcular largura do card baseado em colunas
    const cardWidth = useMemo(() => {
      if (deviceSize < 'lg') {
        // Mobile: sempre largura total
        return '100%' as const;
      }

      // Tablet+: calcular baseado em colunas
      const totalColumns = 12;
      const columnWidth = (columns / totalColumns) * 100;

      return `${columnWidth}%` as const;
    }, [deviceSize, columns]);

    const cardStyle: ViewStyle = useMemo(() => {
      const baseStyle: ViewStyle = {
        width: cardWidth,
        padding: Tokens.spacing[padding],
        backgroundColor: colors.background.card,
        borderRadius: Tokens.radius['3xl'],
        ...(bordered && {
          borderWidth: 1,
          borderColor: colors.border.light,
        }),
        ...(shadow && Tokens.shadows.card),
      };

      return baseStyle;
    }, [cardWidth, padding, bordered, shadow, colors]);

    const handlePress = useCallback(() => {
      onPress?.();
    }, [onPress]);

    const content = <View style={[cardStyle, style]}>{children}</View>;

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={{ width: cardWidth }}
          accessibilityRole="button"
          accessibilityLabel="Card interativo"
          accessibilityHint="Toque para interagir com este card"
        >
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  }
);

NathIACard.displayName = 'NathIACard';

/**
 * NathIAGrid - Grid responsivo para múltiplos cards
 */
export interface NathIAGridProps {
  /** Cards para renderizar */
  children: React.ReactNode;
  /** Número de colunas em mobile */
  mobileColumns?: 1 | 2;
  /** Número de colunas em tablet */
  tabletColumns?: 2 | 3 | 4;
  /** Gap entre cards */
  gap?: keyof typeof Tokens.spacing;
}

export const NathIAGrid: React.FC<NathIAGridProps> = memo(
  ({ children, mobileColumns = 1, tabletColumns = 3, gap = '4' }) => {
    const deviceSize = useMemo(() => getDeviceSize(SCREEN_WIDTH), []);
    const columns = useMemo(
      () => (deviceSize >= 'lg' ? tabletColumns : mobileColumns),
      [deviceSize, tabletColumns, mobileColumns]
    );
    const gapValue = Tokens.spacing[gap];

    const gridStyle: ViewStyle = useMemo(() => {
      return {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: gapValue,
        justifyContent: 'flex-start',
      };
    }, [gapValue]);

    // Calcular largura dos cards
    const cardWidth = useMemo(() => {
      const sidePadding = Tokens.spacing['4'] * 2;

      if (columns === 1) {
        return SCREEN_WIDTH - sidePadding;
      }

      const totalGap = (columns - 1) * gapValue;
      const availableWidth = SCREEN_WIDTH - sidePadding;
      const calculatedWidth = (availableWidth - totalGap) / columns;

      return Math.max(calculatedWidth, 0); // Garantir não negativo
    }, [columns, gapValue]);

    const renderChildren = useCallback(() => {
      return React.Children.map(children, (child) => {
        if (React.isValidElement<{ style?: ViewStyle }>(child)) {
          const childProps = child.props;
          const mergedStyle = StyleSheet.flatten([{ width: cardWidth }, childProps?.style]);
          return React.cloneElement(child, {
            style: mergedStyle,
          });
        }
        return child;
      });
    }, [children, cardWidth]);

    return <View style={gridStyle}>{renderChildren()}</View>;
  }
);

NathIAGrid.displayName = 'NathIAGrid';

export default NathIALayout;
