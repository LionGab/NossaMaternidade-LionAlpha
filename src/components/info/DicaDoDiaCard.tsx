/**
 * DicaDoDiaCard - Daily tip card
 * Displays a daily wellness tip with call-to-action
 *
 * @version 1.0.0
 */
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Lightbulb, Info } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

export interface DicaDoDiaCardProps {
  tip?: string;
  ritual?: 'breathing' | 'meditation';
  onPress?: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function DicaDoDiaCard({
  tip = 'Respire fundo por 30 segundos. Isso ajuda a acalmar o sistema nervoso e traz clareza mental.',
  ritual = 'breathing',
  onPress,
}: DicaDoDiaCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    logger.info('Dica do dia pressed', { ritual });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onPress) {
      onPress();
    } else {
      navigation.navigate('Ritual', { ritual, autoStart: false });
    }
  };

  return (
    <Box
      bg="card"
      rounded="3xl"
      p="5"
      shadow="md"
      borderWidth={1}
      borderColor="light"
      mb="6"
    >
      <Box direction="row" align="flex-start" gap="3">
        {/* Icon */}
        <View
          style={{
            padding: Tokens.spacing['2'],
            borderRadius: Tokens.radius.xl,
            backgroundColor: isDark
              ? `${ColorTokens.info[500]}33`
              : ColorTokens.info[50],
          }}
        >
          <Lightbulb
            size={24}
            color={isDark ? ColorTokens.info[400] : ColorTokens.info[600]}
          />
        </View>

        {/* Content */}
        <Box flex={1}>
          <Box direction="row" align="center" gap="2" mb="2">
            <Text
              size="md"
              weight="bold"
              style={{
                color: isDark ? ColorTokens.info[400] : ColorTokens.info[700],
              }}
            >
              Dica do dia
            </Text>
            <Badge variant="info" size="sm">
              NOVO
            </Badge>
          </Box>

          <Text
            size="sm"
            color="secondary"
            style={{ marginBottom: Tokens.spacing['3'] }}
          >
            {tip}
          </Text>

          <Button
            title="Saiba mais"
            onPress={handlePress}
            variant="ghost"
            size="sm"
            leftIcon={<Info size={14} color={colors.info.main} />}
            style={{
              alignSelf: 'flex-start',
            }}
            accessibilityLabel="Saiba mais sobre a dica do dia"
            accessibilityHint="Abre ritual de respiração ou meditação"
          />
        </Box>
      </Box>
    </Box>
  );
}

export default DicaDoDiaCard;
