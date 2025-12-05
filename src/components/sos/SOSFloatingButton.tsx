/**
 * SOSFloatingButton - Botão flutuante para acesso rápido ao SOS Mãe
 * Fica sempre visível na HomeScreen
 */

import React, { memo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { logger } from '@/utils/logger';
import { Tokens } from '@/theme/tokens';
import type { RootStackParamList } from '@/navigation/types';

// ============================================
// TYPES
// ============================================

interface SOSFloatingButtonProps {
  /**
   * Posição do botão na tela
   */
  position?: 'bottomRight' | 'bottomLeft';
  
  /**
   * Mostrar label de texto
   */
  showLabel?: boolean;
  
  /**
   * Offset do bottom (para ajustar com TabBar)
   */
  bottomOffset?: number;
}

// ============================================
// COMPONENT
// ============================================

export const SOSFloatingButton = memo(function SOSFloatingButton({
  position = 'bottomRight',
  showLabel = false,
  bottomOffset = 100,
}: SOSFloatingButtonProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useThemeColors();
  const haptics = useHaptics();
  
  // Animation
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  // Pulse animation effect
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    
    return () => pulse.stop();
  }, [pulseAnim]);
  
  // Press handlers
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  const handlePress = useCallback(() => {
    haptics.heavy();
    logger.info('SOS button pressed');
    navigation.navigate('SOSMae');
  }, [navigation, haptics]);
  
  // Position styles
  const positionStyle = position === 'bottomRight'
    ? { right: Tokens.spacing['4'], bottom: bottomOffset }
    : { left: Tokens.spacing['4'], bottom: bottomOffset };
  
  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Pulse ring effect */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            backgroundColor: colors.status.error,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      
      {/* Main button */}
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          {
            backgroundColor: colors.status.error,
            shadowColor: colors.status.error,
          },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Botão de emergência SOS Mãe"
        accessibilityHint="Toque duas vezes para acessar apoio emergencial"
      >
        <Box style={styles.buttonContent}>
          <Ionicons
            name="heart"
            size={28}
            color="#FFFFFF"
            style={styles.icon}
          />
          {showLabel && (
            <Text
              style={styles.label}
              accessibilityElementsHidden
            >
              SOS
            </Text>
          )}
        </Box>
      </Pressable>
      
      {/* Tooltip (appears on first use) */}
      {showLabel && (
        <Box style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            Precisa de ajuda?
          </Text>
        </Box>
      )}
    </Animated.View>
  );
});

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    opacity: 0.3,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tooltip: {
    position: 'absolute',
    top: -40,
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SOSFloatingButton;

