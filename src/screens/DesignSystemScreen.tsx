/**
 * Design System Showcase Screen
 * Tela de demonstração de todos os componentes do Design System
 */

import { Mail, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  H1,
  H2,
  H3,
  Body,
  Caption,
  Box,
  Stack,
  Row,
  Container,
  Card,
  Input,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Badge,
  Chip,
  Alert,
  useToast,
  Skeleton,
  SkeletonText,
  SkeletonCard,
} from '@/components';
import { useTheme } from '@/theme';
import { Spacing } from '@/theme/tokens';
import { logger } from '@/utils/logger';

export default function DesignSystemScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const toast = useToast();

  // Form states
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [inputValue, setInputValue] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.canvas }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Container>
          {/* Header */}
          <Stack space="4" style={{ paddingTop: Spacing['6'], paddingBottom: Spacing['8'] }}>
            <Row justify="space-between" align="center">
              <H1>Design System</H1>
              <Switch checked={isDark} onCheckedChange={toggleTheme} size="lg" />
            </Row>
            <Body color="secondary">Showcase de todos os componentes do sistema de design</Body>
          </Stack>

          {/* Typography Section */}
          <Section title="Typography">
            <Stack space="3">
              <H1>Heading 1</H1>
              <H2>Heading 2</H2>
              <H3>Heading 3</H3>
              <Body>Body text - Lorem ipsum dolor sit amet</Body>
              <Caption>Caption text - Smaller descriptive text</Caption>
            </Stack>
          </Section>

          {/* Card Variants */}
          <Section title="Cards">
            <Stack space="3">
              <Card variant="default">
                <Body weight="semibold">Default Card</Body>
                <Caption color="secondary">Com sombra suave</Caption>
              </Card>

              <Card variant="outlined">
                <Body weight="semibold">Outlined Card</Body>
                <Caption color="secondary">Com borda</Caption>
              </Card>

              <Card variant="elevated">
                <Body weight="semibold">Elevated Card</Body>
                <Caption color="secondary">Com sombra elevada</Caption>
              </Card>

              <Card
                variant="default"
                pressable
                onPress={() => toast.show({ message: 'Card pressionado!' })}
              >
                <Body weight="semibold">Pressable Card</Body>
                <Caption color="secondary">Toque para testar</Caption>
              </Card>
            </Stack>
          </Section>

          {/* Form Components */}
          <Section title="Form Components">
            <Stack space="4">
              <Input
                label="Email"
                placeholder="seu@email.com"
                value={inputValue}
                onChangeText={setInputValue}
                leftIcon={<Mail size={20} color={colors.text.tertiary} />}
              />

              <Input label="Com erro" placeholder="Exemplo" error="Este campo é obrigatório" />

              <Input label="Desabilitado" placeholder="Campo desabilitado" disabled />
            </Stack>
          </Section>

          {/* Checkbox, Radio, Switch */}
          <Section title="Selection Controls">
            <Stack space="4">
              <Checkbox
                checked={checkboxChecked}
                onCheckedChange={setCheckboxChecked}
                label="Checkbox Label"
                description="Descrição opcional do checkbox"
              />

              <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                <Radio value="option1" label="Opção 1" description="Primeira opção" />
                <Radio value="option2" label="Opção 2" description="Segunda opção" />
                <Radio value="option3" label="Opção 3" description="Terceira opção" />
              </RadioGroup>

              <Switch
                checked={switchChecked}
                onCheckedChange={setSwitchChecked}
                label="Switch Label"
                description="Ativa ou desativa uma opção"
              />
            </Stack>
          </Section>

          {/* Badges */}
          <Section title="Badges">
            <Row space="2" wrap>
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </Row>

            <Row space="2" wrap style={{ marginTop: Spacing['3'] }}>
              <Badge variant="primary" outlined>
                Outlined
              </Badge>
              <Badge variant="success" dot>
                Com Dot
              </Badge>
              <Badge variant="error" size="sm">
                Small
              </Badge>
              <Badge variant="info" size="lg">
                Large
              </Badge>
            </Row>
          </Section>

          {/* Chips */}
          <Section title="Chips">
            <Row space="2" wrap>
              <Chip label="Default Chip" />
              <Chip label="Primary" variant="primary" />
              <Chip label="Success" variant="success" />
              <Chip
                label="Com ícone"
                variant="primary"
                icon={<Star size={14} color={colors.text.inverse} />}
              />
              <Chip
                label="Deletável"
                variant="secondary"
                onDelete={() => toast.show({ message: 'Chip deletado!' })}
              />
              <Chip
                label="Clicável"
                variant="default"
                onPress={() => toast.show({ message: 'Chip clicado!' })}
              />
            </Row>
          </Section>

          {/* Alerts */}
          <Section title="Alerts">
            <Stack space="3">
              <Alert variant="info" description="Informação importante para o usuário" />
              <Alert
                variant="success"
                title="Sucesso!"
                description="A operação foi concluída com sucesso"
              />
              <Alert
                variant="warning"
                title="Atenção"
                description="Esta ação pode ter consequências"
              />
              <Alert
                variant="error"
                title="Erro"
                description="Ocorreu um erro ao processar a solicitação"
                onClose={() => toast.show({ message: 'Alert fechado' })}
              />
            </Stack>
          </Section>

          {/* Toasts */}
          <Section title="Toasts">
            <Stack space="2">
              <Card
                variant="outlined"
                pressable
                onPress={() => toast.show({ message: 'Toast informativo!' })}
              >
                <Body>Mostrar Toast Info</Body>
              </Card>

              <Card
                variant="outlined"
                pressable
                onPress={() =>
                  toast.show({ message: 'Operação bem-sucedida!', variant: 'success' })
                }
              >
                <Body>Mostrar Toast Success</Body>
              </Card>

              <Card
                variant="outlined"
                pressable
                onPress={() => toast.show({ message: 'Atenção necessária!', variant: 'warning' })}
              >
                <Body>Mostrar Toast Warning</Body>
              </Card>

              <Card
                variant="outlined"
                pressable
                onPress={() => toast.show({ message: 'Algo deu errado!', variant: 'error' })}
              >
                <Body>Mostrar Toast Error</Body>
              </Card>

              <Card
                variant="outlined"
                pressable
                onPress={() =>
                  toast.show({
                    message: 'Toast com ação',
                    action: {
                      label: 'DESFAZER',
                      onPress: () => logger.debug('Ação executada'),
                    },
                  })
                }
              >
                <Body>Toast com Ação</Body>
              </Card>
            </Stack>
          </Section>

          {/* Skeleton */}
          <Section title="Skeleton Loading">
            <Stack space="3">
              <Card variant="outlined" pressable onPress={() => setShowSkeleton(!showSkeleton)}>
                <Body>{showSkeleton ? 'Ocultar' : 'Mostrar'} Skeletons (toque aqui)</Body>
              </Card>

              {showSkeleton && (
                <>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="rectangular" height={100} />
                  <Row space="3">
                    <Skeleton variant="circular" width={60} />
                    <Box flex={1}>
                      <SkeletonText lines={2} />
                    </Box>
                  </Row>
                  <SkeletonCard />
                </>
              )}
            </Stack>
          </Section>

          {/* Color Palette */}
          <Section title="Color Palette">
            <Stack space="2">
              <ColorSwatch label="Primary" color={colors.primary.main} />
              <ColorSwatch label="Secondary" color={colors.secondary.main} />
              <ColorSwatch label="Success" color={colors.status.success} />
              <ColorSwatch label="Warning" color={colors.status.warning} />
              <ColorSwatch label="Error" color={colors.status.error} />
              <ColorSwatch label="Info" color={colors.status.info} />
            </Stack>
          </Section>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <Stack space="4" style={{ marginBottom: Spacing['8'] }}>
      <H2>{title}</H2>
      {children}
    </Stack>
  );
};

const ColorSwatch: React.FC<{ label: string; color: string }> = ({ label, color }) => {
  const { colors } = useTheme();

  return (
    <Row space="3" align="center">
      <View
        style={{
          width: 48,
          height: 48,
          backgroundColor: color,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}
      />
      <Box flex={1}>
        <Body weight="medium">{label}</Body>
        <Caption color="secondary">{color}</Caption>
      </Box>
    </Row>
  );
};
