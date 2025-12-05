/**
 * SleepPromptCard - Card que aparece após 20h ou se não registrou sono hoje
 * Modal com slider de 0-12h para registrar sono
 */

import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { Moon } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Modal, View } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { sleepService } from '@/services/sleepService';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

export interface SleepPromptCardProps {
  /** Se já registrou sono hoje */
  hasRegisteredSleep?: boolean;
  /** Callback quando registra o sono */
  onSleepRegistered?: (hours: number) => void;
}

export function SleepPromptCard({
  hasRegisteredSleep = false,
  onSleepRegistered,
}: SleepPromptCardProps) {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [sleepHours, setSleepHours] = useState(8);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Verificar se deve mostrar o card
    const checkShouldShow = () => {
      const now = new Date();
      const hour = now.getHours();

      // Mostrar se:
      // 1. Já passou das 20h (20:00)
      // 2. OU ainda não registrou o sono hoje
      const shouldShowCard = hour >= 20 || !hasRegisteredSleep;
      setShouldShow(shouldShowCard);
    };

    checkShouldShow();
    // Verificar a cada minuto
    const interval = setInterval(checkShouldShow, 60000);
    return () => clearInterval(interval);
  }, [hasRegisteredSleep]);

  if (!shouldShow) {
    return null;
  }

  const handleRegisterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const success = await sleepService.logSleep(sleepHours);
      if (success) {
        logger.info('Sleep registered', { hours: sleepHours, screen: 'SleepPromptCard' });
        onSleepRegistered?.(sleepHours);
        setShowModal(false);
      } else {
        logger.error('Failed to register sleep', null, { screen: 'SleepPromptCard' });
      }
    } catch (error) {
      logger.error('Failed to register sleep', error, { screen: 'SleepPromptCard' });
    }
  };

  return (
    <>
      {/* Card principal */}
      <Box
        style={{
          backgroundColor: colors.background.card,
          borderRadius: Tokens.radius['2xl'],
          padding: Tokens.spacing['5'],
          borderWidth: 1,
          borderColor: colors.border.light,
          ...Tokens.shadows.sm,
        }}
      >
        <Box direction="row" align="center" style={{ marginBottom: Tokens.spacing['3'] }}>
          <Moon
            size={24}
            color={colors.text.secondary}
            style={{ marginRight: Tokens.spacing['3'] }}
          />
          <Box flex={1}>
            <Text
              size="md"
              weight="semibold"
              color="primary"
              style={{ marginBottom: Tokens.spacing['1'] }}
            >
              Como você dormiu?
            </Text>
            <Text size="sm" color="secondary">
              Registre suas horas de sono de hoje
            </Text>
          </Box>
        </Box>

        <Button
          title="Registrar agora"
          onPress={handleRegisterPress}
          variant="primary"
          style={{
            backgroundColor: ColorTokens.primary[500], // Rosa Nathália #FF6B9D
            minHeight: Tokens.touchTargets.min,
          }}
          accessibilityLabel="Registrar horas de sono"
          accessibilityHint="Abre modal para registrar quantas horas dormiu"
        />
      </Box>

      {/* Modal com slider */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: ColorTokens.overlay.backdrop,
            justifyContent: 'center',
            alignItems: 'center',
            padding: Tokens.spacing['6'],
          }}
        >
          <Box
            style={{
              backgroundColor: colors.background.card,
              borderRadius: Tokens.radius['3xl'],
              padding: Tokens.spacing['6'],
              width: '100%',
              maxWidth: 400,
              ...Tokens.shadows.xl,
            }}
          >
            <Heading
              level="h3"
              weight="bold"
              style={{
                marginBottom: Tokens.spacing['4'],
                textAlign: 'center',
              }}
            >
              Quantas horas você dormiu?
            </Heading>

            {/* Slider */}
            <Box style={{ marginBottom: Tokens.spacing['6'] }}>
              <Text
                size="xl"
                weight="bold"
                color="primary"
                style={{
                  textAlign: 'center',
                  marginBottom: Tokens.spacing['4'],
                  fontSize: 32,
                }}
              >
                {sleepHours}h
              </Text>

              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={12}
                step={0.5}
                value={sleepHours}
                onValueChange={setSleepHours}
                minimumTrackTintColor={ColorTokens.primary[500]} // Rosa Nathália
                maximumTrackTintColor={colors.border.light}
                thumbTintColor={ColorTokens.primary[500]}
              />

              <Box
                direction="row"
                justify="space-between"
                style={{ marginTop: Tokens.spacing['2'] }}
              >
                <Text size="xs" color="tertiary">
                  0h
                </Text>
                <Text size="xs" color="tertiary">
                  12h
                </Text>
              </Box>
            </Box>

            {/* Botões */}
            <Box direction="row" style={{ gap: Tokens.spacing['3'] }}>
              <Button
                title="Cancelar"
                onPress={() => setShowModal(false)}
                variant="ghost"
                style={{ flex: 1 }}
              />
              <Button
                title="Salvar"
                onPress={handleSave}
                variant="primary"
                style={{
                  flex: 1,
                  backgroundColor: ColorTokens.primary[500],
                }}
              />
            </Box>
          </Box>
        </View>
      </Modal>
    </>
  );
}
