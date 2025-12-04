import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Moon,
  Sun,
  Coffee,
  Heart,
  Shield,
  Meh,
  Frown,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components';
import { Box } from '../components/primitives/Box';
import { useTheme } from '../theme/ThemeContext';
import { Tokens, TextStyles, Spacing, Radius, Shadows } from '../theme/tokens';

export default function RitualScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [currentFeeling, setCurrentFeeling] = useState<string | null>(null);
  const [desiredFeeling, setDesiredFeeling] = useState<string | null>(null);

  const getPractice = () => {
    return {
      title: 'Pausa de Respiração 4-7-8',
      text: 'Inspire pelo nariz contando até 4. Segure o ar por 7. Solte pela boca fazendo som de "ahh" por 8. Repita 3 vezes.',
      action: 'Fazer agora (30s)',
    };
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      navigation.navigate('Main' as never);
    }
  };

  const feelings = [
    { icon: BatteryLow, label: 'Exausta', id: 'exausta', color: colors.status.error },
    { icon: Frown, label: 'Ansiosa', id: 'ansiosa', color: colors.raw.accent.orange },
    { icon: Meh, label: 'Confusa', id: 'confusa', color: colors.status.warning },
    { icon: BatteryMedium, label: 'Ok', id: 'ok', color: colors.primary.main },
    { icon: BatteryFull, label: 'Grata', id: 'grata', color: colors.status.success },
  ];

  const desires = [
    { icon: Shield, label: 'Mais forte', id: 'forte', color: colors.primary.main },
    { icon: Heart, label: 'Acolhida', id: 'acolhida', color: colors.raw.accent.pink },
    { icon: Moon, label: 'Em paz', id: 'paz', color: colors.raw.accent.purple },
    { icon: Sun, label: 'Energizada', id: 'energia', color: colors.status.warning },
  ];

  const practice = getPractice();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background.canvas,
      }}
      accessible={true}
      accessibilityLabel="Tela de Ritual de Respiração"
    >
      {/* Header */}
      <Box
        direction="row"
        align="center"
        justify="space-between"
        px="4"
        py="4"
        style={{
          backgroundColor: colors.background.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: colors.text.primary,
            padding: Spacing['2'],
            borderRadius: Radius.full,
            minWidth: Tokens.touchTargets.min,
            minHeight: Tokens.touchTargets.min,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityHint="Retorna para a tela anterior"
        >
          <ArrowLeft size={20} color={colors.text.inverse} />
        </TouchableOpacity>

        <Box flex={1} align="center" mx="4">
          <Text
            style={[
              TextStyles.labelSmall,
              {
                color: colors.primary.main,
                textTransform: 'uppercase',
                letterSpacing: 1,
              },
            ]}
            accessibilityLabel="Nossa Maternidade"
          >
            Nossa Maternidade
          </Text>
          <Box
            style={{
              width: 120,
              height: 6,
              backgroundColor: colors.background.elevated,
              borderRadius: Radius.full,
              marginTop: Spacing['1'],
              overflow: 'hidden',
            }}
            accessible={true}
            accessibilityLabel={`Progresso: ${step} de 3 passos`}
            accessibilityRole="progressbar"
          >
            <View
              style={{
                width: `${(step / 3) * 100}%`,
                height: '100%',
                backgroundColor: colors.primary.main,
                borderRadius: Radius.full,
              }}
            />
          </Box>
        </Box>

        <Text
          style={[
            TextStyles.labelSmall,
            {
              color: colors.text.secondary,
              width: 36,
              textAlign: 'right',
            },
          ]}
          accessibilityLabel="30 segundos"
        >
          00:30
        </Text>
      </Box>

      <Box flex={1} px="6" justify="center">
        {/* Step 1: Current Feeling */}
        {step === 1 && (
          <Box accessible={true} accessibilityRole="none">
            <Text
              style={[
                TextStyles.displaySmall,
                {
                  marginBottom: Spacing['2'],
                  textAlign: 'center',
                  color: colors.text.primary,
                },
              ]}
              accessibilityRole="header"
              accessibilityLabel="Passo 1: Como você está agora?"
            >
              Como você está agora?
            </Text>
            <Text
              style={[
                TextStyles.bodyMedium,
                {
                  textAlign: 'center',
                  marginBottom: Spacing['8'],
                  color: colors.text.secondary,
                },
              ]}
              accessibilityLabel="Sem julgamentos, só a verdade"
            >
              Sem julgamentos, só a verdade.
            </Text>
            <Box direction="row" gap="3" justify="center" style={{ flexWrap: 'wrap' }}>
              {feelings.map((f) => {
                const Icon = f.icon;
                const isSelected = currentFeeling === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setCurrentFeeling(f.id)}
                    style={{
                      padding: Spacing['4'],
                      borderRadius: Radius['2xl'],
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary.main : colors.border.light,
                      backgroundColor: isSelected
                        ? isDark
                          ? `${colors.primary.main}33`
                          : colors.primary.light
                        : colors.background.card,
                      width: '47%',
                      alignItems: 'center',
                      gap: Spacing['2'],
                      minHeight: Tokens.touchTargets.min,
                      ...Shadows.sm,
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Sentimento: ${f.label}`}
                    accessibilityHint={`Toque para selecionar ${f.label} como seu sentimento atual`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Icon size={24} color={f.color} />
                    <Text
                      style={[
                        TextStyles.labelMedium,
                        {
                          color: isSelected ? colors.primary.main : colors.text.primary,
                        },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Step 2: Desired Feeling */}
        {step === 2 && (
          <Box accessible={true} accessibilityRole="none">
            <Text
              style={[
                TextStyles.displaySmall,
                {
                  marginBottom: Spacing['2'],
                  textAlign: 'center',
                  color: colors.text.primary,
                },
              ]}
              accessibilityRole="header"
              accessibilityLabel="Passo 2: Como você quer se sentir?"
            >
              Como você quer se sentir?
            </Text>
            <Text
              style={[
                TextStyles.bodyMedium,
                {
                  textAlign: 'center',
                  marginBottom: Spacing['8'],
                  color: colors.text.secondary,
                },
              ]}
              accessibilityLabel="Vamos setar uma intenção pro dia"
            >
              Vamos setar uma intenção pro dia.
            </Text>
            <Box direction="row" gap="3" justify="center" style={{ flexWrap: 'wrap' }}>
              {desires.map((d) => {
                const Icon = d.icon;
                const isSelected = desiredFeeling === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    onPress={() => setDesiredFeeling(d.id)}
                    style={{
                      padding: Spacing['4'],
                      borderRadius: Radius['2xl'],
                      borderWidth: 2,
                      borderColor: isSelected ? colors.raw.accent.pink : colors.border.light,
                      backgroundColor: isSelected
                        ? isDark
                          ? `${colors.raw.accent.pink}33`
                          : colors.secondary.light
                        : colors.background.card,
                      width: '47%',
                      alignItems: 'center',
                      gap: Spacing['2'],
                      minHeight: Tokens.touchTargets.min,
                      ...Shadows.sm,
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Intenção: ${d.label}`}
                    accessibilityHint={`Toque para selecionar ${d.label} como sua intenção do dia`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Icon size={24} color={d.color} />
                    <Text
                      style={[
                        TextStyles.labelMedium,
                        {
                          color: isSelected ? colors.raw.accent.pink : colors.text.primary,
                        },
                      ]}
                    >
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Step 3: Practice */}
        {step === 3 && (
          <Box align="center" accessible={true} accessibilityRole="none">
            <Box
              style={{
                width: 64,
                height: 64,
                borderRadius: Radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing['6'],
                backgroundColor: isDark ? `${colors.status.success}33` : colors.primary.light,
              }}
              accessible={true}
              accessibilityLabel="Ícone de exercício de respiração"
            >
              <Coffee size={32} color={colors.status.success} />
            </Box>
            <Text
              style={[
                TextStyles.titleLarge,
                {
                  marginBottom: Spacing['4'],
                  textAlign: 'center',
                  color: colors.text.primary,
                },
              ]}
              accessibilityRole="header"
              accessibilityLabel="Passo 3: Vamos fazer isso juntas"
            >
              Vamos fazer isso juntas:
            </Text>

            <Box
              bg="card"
              p="6"
              rounded="2xl"
              mb="8"
              style={{
                borderLeftWidth: 4,
                borderLeftColor: colors.primary.main,
                borderWidth: 1,
                borderColor: colors.border.light,
                ...Shadows.md,
              }}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`${practice.title}. Instruções: ${practice.text}`}
            >
              <Text
                style={[
                  TextStyles.titleMedium,
                  {
                    marginBottom: Spacing['2'],
                    color: colors.primary.main,
                  },
                ]}
              >
                {practice.title}
              </Text>
              <Text
                style={[
                  TextStyles.bodyMedium,
                  {
                    color: colors.text.primary,
                    lineHeight: Tokens.typography.lineHeights.md,
                  },
                ]}
              >
                {practice.text}
              </Text>
            </Box>

            <Button
              title="Concluído (Vitória!)"
              onPress={() => {
                navigation.navigate('Main' as never);
              }}
              fullWidth
              accessibilityLabel="Concluído. Vitória!"
              accessibilityHint="Marca o exercício como concluído e retorna para a tela inicial"
            />
            <Text
              style={[
                TextStyles.labelSmall,
                {
                  marginTop: Spacing['4'],
                  color: colors.text.tertiary,
                },
              ]}
              accessibilityLabel="Isso conta para sua Jornada Emocional"
            >
              Isso conta para sua Jornada Emocional.
            </Text>
          </Box>
        )}
      </Box>

      {/* Footer Navigation (Steps 1 & 2) */}
      {step < 3 && (
        <Box px="6" pb="6">
          <Button
            title="Continuar"
            onPress={handleNext}
            disabled={step === 1 ? !currentFeeling : !desiredFeeling}
            fullWidth
            accessibilityLabel="Continuar para o próximo passo"
            accessibilityHint={
              step === 1
                ? currentFeeling
                  ? 'Avança para selecionar como você quer se sentir'
                  : 'Selecione um sentimento antes de continuar'
                : desiredFeeling
                  ? 'Avança para o exercício de respiração'
                  : 'Selecione uma intenção antes de continuar'
            }
          />
        </Box>
      )}
    </SafeAreaView>
  );
}
