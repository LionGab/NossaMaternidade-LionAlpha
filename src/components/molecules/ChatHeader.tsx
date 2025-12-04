/**
 * ChatHeader - Header Premium do Chat NathIA
 *
 * Design empático com gradiente suave, avatar com status e mode selector.
 * Usa tokens centralizados e acessibilidade WCAG AAA.
 *
 * Features:
 * - Gradiente suave do Design System
 * - Status online com indicador
 * - Mode selector (Rápido/Profundo)
 * - Touch targets 44pt mínimos
 * - Haptic feedback
 *
 * @example
 * <ChatHeader
 *   avatarUrl="https://..."
 *   isOnline={true}
 *   chatMode="flash"
 *   onBack={() => navigation.goBack()}
 *   onModeChange={setChatMode}
 * />
 */

import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Sparkles, CheckCircle, Zap, Brain } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { IconButton } from '@/components/primitives/IconButton';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

type AIMode = 'flash' | 'deep';

export interface ChatHeaderProps {
  /** URL do avatar da NathIA */
  avatarUrl: string;
  /** Se a NathIA está online */
  isOnline?: boolean;
  /** Modo atual do chat */
  chatMode: AIMode;
  /** Callback ao voltar */
  onBack: () => void;
  /** Callback ao mudar modo */
  onModeChange: (mode: AIMode) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  avatarUrl,
  isOnline = true,
  chatMode,
  onBack,
  onModeChange,
}) => {
  const { isDark } = useTheme();
  const [avatarError, setAvatarError] = React.useState(false);

  const handleModePress = (mode: AIMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    logger.info('Chat mode changed', { mode, previous: chatMode });
    onModeChange(mode);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  // Usar gradiente suave (warm cyan) do Design System
  const gradientColors = isDark ? ColorTokens.nathIA.warm.dark : ColorTokens.nathIA.warm.light;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      {/* Top Bar: Back + Avatar + Info */}
      <Box direction="row" align="center" style={{ zIndex: 1 }}>
        <IconButton
          icon={<ArrowLeft size={20} color={ColorTokens.nathIA.text.light} />}
          onPress={handleBack}
          accessibilityLabel="Voltar para tela anterior"
          variant="ghost"
        />

        <View style={styles.headerInfo}>
          {/* Avatar com status */}
          <View style={styles.avatarContainer}>
            {!avatarError ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Sparkles size={18} color={ColorTokens.nathIA.text.light} />
              </View>
            )}

            {isOnline && (
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
              </View>
            )}
          </View>

          {/* Nome e status */}
          <Box ml="3">
            <Text size="lg" weight="bold" style={{ color: ColorTokens.nathIA.text.light }}>
              NathIA
            </Text>
            <Box direction="row" align="center" mt="0.5">
              <CheckCircle size={12} color={ColorTokens.nathIA.text.light} />
              <Text
                size="xs"
                style={{
                  color: ColorTokens.nathIA.text.light,
                  marginLeft: 4,
                }}
              >
                {isOnline ? 'Online • Pronta para conversar' : 'Offline'}
              </Text>
            </Box>
          </Box>
        </View>
      </Box>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        {/* Modo Rápido */}
        <TouchableOpacity
          onPress={() => handleModePress('flash')}
          style={[styles.modeButton, chatMode === 'flash' && styles.modeButtonActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: chatMode === 'flash' }}
          accessibilityLabel="Modo rápido"
          accessibilityHint="Respostas rápidas e diretas da NathIA"
        >
          <Zap
            size={12}
            color={ColorTokens.nathIA.text.light}
            style={{ opacity: chatMode === 'flash' ? 1 : 0.75 }}
          />
          <Text
            size="xs"
            weight="bold"
            style={{
              color: ColorTokens.nathIA.text.light,
              opacity: chatMode === 'flash' ? 1 : 0.75,
              marginLeft: 4,
            }}
          >
            Rápido
          </Text>
        </TouchableOpacity>

        {/* Modo Profundo */}
        <TouchableOpacity
          onPress={() => handleModePress('deep')}
          style={[styles.modeButton, chatMode === 'deep' && styles.modeButtonActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: chatMode === 'deep' }}
          accessibilityLabel="Modo profundo"
          accessibilityHint="Análises detalhadas e reflexivas da NathIA"
        >
          <Brain
            size={12}
            color={ColorTokens.nathIA.text.light}
            style={{ opacity: chatMode === 'deep' ? 1 : 0.75 }}
          />
          <Text
            size="xs"
            weight="bold"
            style={{
              color: ColorTokens.nathIA.text.light,
              opacity: chatMode === 'deep' ? 1 : 0.75,
              marginLeft: 4,
            }}
          >
            Profundo
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Tokens.spacing['4'],
    paddingVertical: Tokens.spacing['3'],
    paddingBottom: Tokens.spacing['4'],
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Tokens.spacing['2'],
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: ColorTokens.nathIA.text.light + '66', // 40% opacity
  },
  avatarFallback: {
    backgroundColor: ColorTokens.nathIA.text.light + '33', // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ColorTokens.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ColorTokens.success[400],
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Tokens.spacing['3'],
    gap: Tokens.spacing['2'],
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['3'],
    paddingVertical: Tokens.spacing['2.5'],
    borderRadius: Tokens.radius.full,
    backgroundColor: ColorTokens.nathIA.text.light + '1A', // 10% opacity
    minHeight: Tokens.touchTargets.min, // WCAG AAA: 44pt mínimo
  },
  modeButtonActive: {
    backgroundColor: ColorTokens.nathIA.text.light + '40', // 25% opacity
  },
});

export default ChatHeader;
