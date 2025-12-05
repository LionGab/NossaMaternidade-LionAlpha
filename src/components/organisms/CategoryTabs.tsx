/**
 * CategoryTabs - Tabs horizontais com ícones estilo Airbnb
 * Componente para navegação por categorias com ícones ilustrados
 *
 * @example
 * <CategoryTabs
 *   tabs={[
 *     { id: 'all', label: 'Todos', icon: Home },
 *     { id: 'content', label: 'Conteúdo', icon: Video, badge: 'NEW' },
 *   ]}
 *   activeTab="all"
 *   onTabChange={(id) => setActiveTab(id)}
 * />
 */

import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { ScrollView, ViewStyle } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { HapticButton } from '@/components/atoms/HapticButton';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface CategoryTab {
  /** ID único da tab */
  id: string;
  /** Label da tab */
  label: string;
  /** Ícone Lucide */
  icon: LucideIcon;
  /** Badge opcional (ex: "NEW", "3") */
  badge?: string | number;
  /** Desabilitado */
  disabled?: boolean;
}

export interface CategoryTabsProps {
  /** Lista de tabs */
  tabs: CategoryTab[];
  /** Tab ativa */
  activeTab?: string;
  /** Callback ao mudar tab */
  onTabChange?: (tabId: string) => void;
  /** Estilo customizado */
  style?: ViewStyle;
  /** Mostrar scroll horizontal */
  scrollable?: boolean;
}

export function CategoryTabs({
  tabs,
  activeTab,
  onTabChange,
  style,
  scrollable = true,
}: CategoryTabsProps) {
  const { colors, isDark } = useTheme();

  const handleTabPress = (tabId: string) => {
    if (onTabChange) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTabChange(tabId);
    }
  };

  const renderTab = (tab: CategoryTab) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;

    return (
      <HapticButton
        key={tab.id}
        variant={isActive ? 'primary' : 'ghost'}
        onPress={() => !tab.disabled && handleTabPress(tab.id)}
        disabled={tab.disabled}
        style={{
          marginRight: Tokens.spacing['2'],
          minHeight: Tokens.touchTargets.min, // WCAG AAA
        }}
        accessibilityLabel={`Categoria ${tab.label}${isActive ? ', selecionada' : ''}`}
        accessibilityState={{ selected: isActive }}
      >
        <Box
          direction="row"
          align="center"
          style={{
            paddingHorizontal: Tokens.spacing['3'],
            paddingVertical: Tokens.spacing['2'],
            gap: Tokens.spacing['1.5'],
          }}
        >
          <Icon
            size={18}
            color={
              isActive
                ? colors.text.inverse
                : tab.disabled
                  ? colors.text.disabled
                  : colors.text.secondary
            }
            fill={isActive ? colors.text.inverse : 'none'}
          />
          <Text
            size="sm"
            weight={isActive ? 'semibold' : 'medium'}
            color={isActive ? 'inverse' : tab.disabled ? 'disabled' : 'secondary'}
          >
            {tab.label}
          </Text>
          {tab.badge && (
            <Box
              bg={isActive ? 'elevated' : 'card'}
              px="1.5"
              py="0.5"
              rounded="full"
              style={{
                backgroundColor: isActive
                  ? ColorTokens.overlay.light
                  : isDark
                    ? ColorTokens.neutral[800]
                    : ColorTokens.neutral[100],
                minWidth: 20,
                alignItems: 'center',
              }}
            >
              <Text
                size="xs"
                weight="bold"
                style={{
                  color: isActive
                    ? colors.text.inverse
                    : isDark
                      ? ColorTokens.neutral[300]
                      : ColorTokens.neutral[700],
                  fontSize: 10,
                }}
              >
                {tab.badge}
              </Text>
            </Box>
          )}
        </Box>
      </HapticButton>
    );
  };

  const content = (
    <Box
      direction="row"
      align="center"
      style={{
        paddingHorizontal: Tokens.spacing['4'],
        paddingVertical: Tokens.spacing['2'],
      }}
    >
      {tabs.map(renderTab)}
    </Box>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: Tokens.spacing['4'],
        }}
        style={style}
      >
        {content}
      </ScrollView>
    );
  }

  return <Box style={style}>{content}</Box>;
}

export default CategoryTabs;
