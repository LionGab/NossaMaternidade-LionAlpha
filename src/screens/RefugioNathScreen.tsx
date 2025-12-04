import { Play, Pause, Wind, Moon, Heart, Volume2, Timer, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeContext';
import { Tokens } from '../theme/tokens';
import { getShadowFromToken } from '../utils/shadowHelper';

interface Ritual {
  id: number;
  title: string;
  description: string;
  duration: string;
  icon: typeof Wind;
  color: string;
  category: 'breathing' | 'meditation' | 'self-care';
}

export default function RefugioNathScreen() {
  const { colors, isDark } = useTheme();
  const [playing, setPlaying] = useState<number | null>(null);

  const rituals: Ritual[] = [
    {
      id: 1,
      title: 'Respiração 4-7-8',
      description: 'Técnica de respiração para acalmar a ansiedade rapidamente',
      duration: '3 min',
      icon: Wind,
      color: colors.primary.main,
      category: 'breathing',
    },
    {
      id: 2,
      title: 'Meditação do Sono',
      description: 'Relaxamento profundo para uma noite tranquila',
      duration: '10 min',
      icon: Moon,
      color: colors.raw.accent.purple,
      category: 'meditation',
    },
    {
      id: 3,
      title: 'Autocuidado Maternal',
      description: 'Momento de conexão com você mesma',
      duration: '5 min',
      icon: Heart,
      color: colors.raw.accent.pink,
      category: 'self-care',
    },
    {
      id: 4,
      title: 'Respiração Relaxante',
      description: 'Exercício suave para momentos de estresse',
      duration: '2 min',
      icon: Wind,
      color: colors.status.success,
      category: 'breathing',
    },
    {
      id: 5,
      title: 'Meditação da Gratidão',
      description: 'Cultive sentimentos de gratidão e positividade',
      duration: '7 min',
      icon: Sparkles,
      color: colors.status.warning,
      category: 'meditation',
    },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.canvas }}
      edges={['top']}
      accessible={true}
      accessibilityLabel="Tela Refúgio Nath - Momentos de calma"
    >
      {/* Header */}
      <View
        style={{
          padding: Tokens.spacing['4'],
          backgroundColor: colors.background.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <Text
          style={{
            fontSize: Tokens.typography.sizes['2xl'],
            fontWeight: Tokens.typography.weights.bold,
            color: colors.text.primary,
            marginBottom: Tokens.spacing['1'],
          }}
        >
          Refúgio Nath
        </Text>
        <Text style={{ fontSize: Tokens.typography.sizes.sm, color: colors.text.secondary }}>
          Momentos de calma para você
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Tokens.spacing['4'], paddingBottom: 120 }}>
        {/* Quick Stats */}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: Tokens.spacing['6'],
            gap: Tokens.spacing['3'],
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background.card,
              padding: Tokens.spacing['4'],
              borderRadius: Tokens.radius.lg,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Timer
              size={20}
              color={colors.primary.main}
              style={{ marginBottom: Tokens.spacing['2'] }}
            />
            <Text
              style={{
                fontSize: Tokens.typography.sizes.xl,
                fontWeight: Tokens.typography.weights.bold,
                color: colors.text.primary,
              }}
            >
              12
            </Text>
            <Text style={{ fontSize: Tokens.typography.sizes.xs, color: colors.text.secondary }}>
              Rituals feitos
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background.card,
              padding: Tokens.spacing['4'],
              borderRadius: Tokens.radius.lg,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Volume2
              size={20}
              color={colors.primary.main}
              style={{ marginBottom: Tokens.spacing['2'] }}
            />
            <Text
              style={{
                fontSize: Tokens.typography.sizes.xl,
                fontWeight: Tokens.typography.weights.bold,
                color: colors.text.primary,
              }}
            >
              45min
            </Text>
            <Text style={{ fontSize: Tokens.typography.sizes.xs, color: colors.text.secondary }}>
              Esta semana
            </Text>
          </View>
        </View>

        {/* Categories Filter (optional) */}
        <View style={{ marginBottom: Tokens.spacing['4'] }}>
          <Text
            style={{
              fontSize: Tokens.typography.sizes.base,
              fontWeight: Tokens.typography.weights.bold,
              color: colors.text.primary,
              marginBottom: Tokens.spacing['3'],
            }}
          >
            Escolha seu ritual
          </Text>
        </View>

        {/* Rituals List */}
        {rituals.map((ritual) => {
          const Icon = ritual.icon;
          const isPlaying = playing === ritual.id;

          return (
            <TouchableOpacity
              accessibilityRole="button"
              key={ritual.id}
              onPress={() => setPlaying(isPlaying ? null : ritual.id)}
              style={[
                {
                  padding: Tokens.spacing['4'],
                  backgroundColor: colors.background.card,
                  borderRadius: Tokens.radius.xl,
                  marginBottom: Tokens.spacing['4'],
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Tokens.spacing['4'],
                  borderWidth: isPlaying ? 2 : 1,
                  borderColor: isPlaying ? ritual.color : colors.border.light,
                },
                isPlaying
                  ? getShadowFromToken('lg', ritual.color)
                  : getShadowFromToken('sm', colors.text.primary),
              ]}
            >
              {/* Icon */}
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: `${ritual.color}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={28} color={ritual.color} />
              </View>

              {/* Content */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: Tokens.typography.sizes.base,
                    fontWeight: Tokens.typography.weights.semibold,
                    color: colors.text.primary,
                    marginBottom: Tokens.spacing['0.5'],
                  }}
                >
                  {ritual.title}
                </Text>
                <Text
                  style={{
                    fontSize: Tokens.typography.sizes.xs,
                    color: colors.text.secondary,
                    marginBottom: Tokens.spacing['1.5'],
                    lineHeight: Tokens.typography.lineHeights.xs,
                  }}
                >
                  {ritual.description}
                </Text>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing['1.5'] }}
                >
                  <Timer size={12} color={colors.text.tertiary} />
                  <Text
                    style={{
                      fontSize: Tokens.typography.sizes.xs,
                      color: colors.text.tertiary,
                      fontWeight: Tokens.typography.weights.medium,
                    }}
                  >
                    {ritual.duration}
                  </Text>
                </View>
              </View>

              {/* Play/Pause Button */}
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setPlaying(isPlaying ? null : ritual.id)}
                style={{
                  width: Tokens.touchTargets.small,
                  height: Tokens.touchTargets.small,
                  borderRadius: Tokens.touchTargets.small / 2,
                  backgroundColor: isPlaying ? ritual.color : colors.primary.main,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: ritual.color,
                  shadowOffset: { width: 0, height: Tokens.spacing['0.5'] },
                  shadowOpacity: isPlaying ? 0.4 : 0.2,
                  shadowRadius: Tokens.spacing['1'],
                  elevation: Tokens.spacing['1'],
                }}
              >
                {isPlaying ? (
                  <Pause
                    size={Tokens.icons.sm}
                    color={colors.text.inverse}
                    fill={colors.text.inverse}
                  />
                ) : (
                  <Play
                    size={Tokens.icons.sm}
                    color={colors.text.inverse}
                    fill={colors.text.inverse}
                  />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        {/* Bottom CTA */}
        <View
          style={{
            marginTop: Tokens.spacing['2'],
            padding: Tokens.spacing['5'],
            backgroundColor: isDark ? colors.background.card : colors.primary.light,
            borderRadius: Tokens.radius.xl,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <Text
            style={{
              fontSize: Tokens.typography.sizes.base,
              fontWeight: Tokens.typography.weights.bold,
              color: colors.text.primary,
              marginBottom: Tokens.spacing['2'],
            }}
          >
            Precisa de mais ajuda?
          </Text>
          <Text
            style={{
              fontSize: Tokens.typography.sizes.sm,
              color: colors.text.secondary,
              lineHeight: Tokens.typography.lineHeights.sm,
              marginBottom: Tokens.spacing['3'],
            }}
          >
            Converse com a MãesValente IA para receber suporte personalizado
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={{
              backgroundColor: colors.primary.main,
              paddingVertical: Tokens.spacing['3'],
              paddingHorizontal: Tokens.spacing['5'],
              borderRadius: Tokens.radius.md,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colors.text.inverse,
                fontSize: Tokens.typography.sizes.sm,
                fontWeight: Tokens.typography.weights.semibold,
              }}
            >
              Falar com a IA
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
