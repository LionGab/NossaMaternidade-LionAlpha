/**
 * ProfileScreen
 * Tela de perfil completa com edição de dados pessoais, maternidade e preferências
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Settings, Save } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { UserProfile } from '@/types/user';

import { EditableAvatar } from '../components/EditableAvatar';
import { useHaptics } from '../hooks/useHaptics';
import type { RootStackParamList } from '../navigation/types';
import { profileService, UpdateProfileData } from '../services/profileService';
import { useTheme, type ThemeColors } from '../theme/ThemeContext';
import { Tokens } from '../theme/tokens';
import { logger } from '../utils/logger';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

// Opções de estágio da maternidade
const MOTHERHOOD_STAGES = [
  { value: 'trying_to_conceive', label: 'Tentando engravidar' },
  { value: 'pregnant', label: 'Grávida' },
  { value: 'postpartum', label: 'Pós-parto' },
  { value: 'experienced_mother', label: 'Mãe experiente' },
];

// Opções de emoções
const EMOTION_OPTIONS = [
  'Ansiosa',
  'Feliz',
  'Cansada',
  'Esperançosa',
  'Estressada',
  'Grata',
  'Preocupada',
  'Animada',
  'Sobrecarregada',
  'Confiante',
];

// Opções de necessidades
const NEEDS_OPTIONS = [
  'Sono',
  'Apoio emocional',
  'Informação médica',
  'Dicas práticas',
  'Conversar',
  'Relaxamento',
  'Orientação nutricional',
  'Exercícios',
];

// Opções de interesses
const INTERESTS_OPTIONS = [
  'Aleitamento',
  'Saúde mental',
  'Desenvolvimento do bebê',
  'Sono do bebê',
  'Alimentação',
  'Relacionamento',
  'Fé',
  'Autocuidado',
  'Volta ao trabalho',
];

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const haptics = useHaptics();

  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Campos editáveis
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [motherhoodStage, setMotherhoodStage] = useState<string>('');
  const [pregnancyWeek, setPregnancyWeek] = useState('');
  const [babyBirthDate, setBabyBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  /**
   * Carregar perfil
   */
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      logger.info('[ProfileScreen] Carregando perfil');

      const currentProfile = await profileService.getCurrentProfile();

      if (currentProfile) {
        setProfile(currentProfile);
        setFullName(currentProfile.full_name || '');
        setPhone(currentProfile.phone || '');
        setAvatarUrl(currentProfile.avatar_url || null);
        setMotherhoodStage(currentProfile.motherhood_stage || '');
        setPregnancyWeek(currentProfile.pregnancy_week?.toString() || '');
        setBabyBirthDate(currentProfile.baby_birth_date || '');
        setBabyName(currentProfile.baby_name || '');
        setEmotions(currentProfile.emotions || []);
        setNeeds(currentProfile.needs || []);
        setInterests(currentProfile.interests || []);
      }
    } catch (error) {
      logger.error('[ProfileScreen] Erro ao carregar perfil', error);
      Alert.alert('Erro', 'Não foi possível carregar seu perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Salvar alterações
   */
  const handleSave = async () => {
    try {
      // Validações básicas
      if (!fullName.trim()) {
        Alert.alert('Atenção', 'O nome é obrigatório.');
        return;
      }

      if (motherhoodStage === 'pregnant' && pregnancyWeek) {
        const week = parseInt(pregnancyWeek, 10);
        if (isNaN(week) || week < 1 || week > 42) {
          Alert.alert('Atenção', 'Semana de gestação deve estar entre 1 e 42.');
          return;
        }
      }

      setSaving(true);
      haptics.light();
      logger.info('[ProfileScreen] Salvando perfil');

      const updates: UpdateProfileData = {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        motherhood_stage: motherhoodStage || undefined,
        pregnancy_week: pregnancyWeek ? parseInt(pregnancyWeek, 10) : undefined,
        baby_birth_date: babyBirthDate || undefined,
        baby_name: babyName.trim() || undefined,
        emotions: emotions.length > 0 ? emotions : undefined,
        needs: needs.length > 0 ? needs : undefined,
        interests: interests.length > 0 ? interests : undefined,
      };

      const { success, error } = await profileService.updateProfile(updates);

      if (!success) {
        const errorMsg =
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : 'Erro ao salvar';
        throw new Error(errorMsg);
      }

      logger.info('[ProfileScreen] Perfil salvo com sucesso');
      haptics.success();
      Alert.alert('Sucesso', 'Seu perfil foi atualizado com sucesso!');
    } catch (error) {
      logger.error('[ProfileScreen] Erro ao salvar perfil', error);
      haptics.error();
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar suas alterações. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Toggle de seleção múltipla
   */
  const toggleArrayItem = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.canvas }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.canvas }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background.card,
            borderBottomColor: colors.border.light,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityHint="Retorna para a tela anterior"
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Meu Perfil</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Configurações"
          accessibilityHint="Abre as configurações do aplicativo"
        >
          <Settings size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={[styles.avatarSection, { backgroundColor: colors.background.card }]}>
          <EditableAvatar
            uri={avatarUrl}
            name={fullName || profile?.email || 'Usuária'}
            onAvatarChange={(newUrl) => setAvatarUrl(newUrl)}
            size={120}
          />
          <Text style={[styles.emailText, { color: colors.text.secondary }]}>{profile?.email}</Text>
        </View>

        {/* Dados Pessoais */}
        <SectionTitle colors={colors}>Dados Pessoais</SectionTitle>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.background.card, borderColor: colors.border.light },
          ]}
        >
          <InputField
            label="Nome completo *"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Digite seu nome"
            colors={colors}
          />
          <Divider colors={colors} />
          <InputField
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            colors={colors}
          />
        </View>

        {/* Maternidade */}
        <SectionTitle colors={colors}>Maternidade</SectionTitle>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.background.card, borderColor: colors.border.light },
          ]}
        >
          <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
            Estágio da maternidade
          </Text>
          <View style={styles.chipContainer}>
            {MOTHERHOOD_STAGES.map((stage) => (
              <TouchableOpacity
                key={stage.value}
                onPress={() => setMotherhoodStage(stage.value)}
                style={[
                  styles.chip,
                  motherhoodStage === stage.value && { backgroundColor: colors.primary.main },
                  {
                    borderColor:
                      motherhoodStage === stage.value ? colors.primary.main : colors.border.light,
                  },
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        motherhoodStage === stage.value ? colors.text.inverse : colors.text.primary,
                    },
                  ]}
                >
                  {stage.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {motherhoodStage === 'pregnant' && (
            <>
              <Divider colors={colors} />
              <InputField
                label="Semana de gestação"
                value={pregnancyWeek}
                onChangeText={setPregnancyWeek}
                placeholder="Ex: 20"
                keyboardType="number-pad"
                colors={colors}
              />
            </>
          )}

          {motherhoodStage === 'postpartum' && (
            <>
              <Divider colors={colors} />
              <InputField
                label="Data de nascimento do bebê"
                value={babyBirthDate}
                onChangeText={setBabyBirthDate}
                placeholder="DD/MM/AAAA"
                colors={colors}
              />
            </>
          )}

          {(motherhoodStage === 'postpartum' || motherhoodStage === 'experienced_mother') && (
            <>
              <Divider colors={colors} />
              <InputField
                label="Nome do bebê"
                value={babyName}
                onChangeText={setBabyName}
                placeholder="Digite o nome"
                colors={colors}
              />
            </>
          )}
        </View>

        {/* Preferências */}
        <SectionTitle colors={colors}>Preferências</SectionTitle>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.background.card, borderColor: colors.border.light },
          ]}
        >
          <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
            Como você está se sentindo?
          </Text>
          <View style={styles.chipContainer}>
            {EMOTION_OPTIONS.map((emotion) => (
              <TouchableOpacity
                key={emotion}
                onPress={() => toggleArrayItem(emotions, emotion, setEmotions)}
                style={[
                  styles.chip,
                  emotions.includes(emotion) && { backgroundColor: colors.primary.main },
                  {
                    borderColor: emotions.includes(emotion)
                      ? colors.primary.main
                      : colors.border.light,
                  },
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: emotions.includes(emotion) ? colors.text.inverse : colors.text.primary,
                    },
                  ]}
                >
                  {emotion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Divider colors={colors} />

          <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
            O que você mais precisa agora?
          </Text>
          <View style={styles.chipContainer}>
            {NEEDS_OPTIONS.map((need) => (
              <TouchableOpacity
                key={need}
                onPress={() => toggleArrayItem(needs, need, setNeeds)}
                style={[
                  styles.chip,
                  needs.includes(need) && { backgroundColor: colors.primary.main },
                  { borderColor: needs.includes(need) ? colors.primary.main : colors.border.light },
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: needs.includes(need) ? colors.text.inverse : colors.text.primary,
                    },
                  ]}
                >
                  {need}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Divider colors={colors} />

          <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Seus interesses</Text>
          <View style={styles.chipContainer}>
            {INTERESTS_OPTIONS.map((interest) => (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleArrayItem(interests, interest, setInterests)}
                style={[
                  styles.chip,
                  interests.includes(interest) && { backgroundColor: colors.primary.main },
                  {
                    borderColor: interests.includes(interest)
                      ? colors.primary.main
                      : colors.border.light,
                  },
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: interests.includes(interest)
                        ? colors.text.inverse
                        : colors.text.primary,
                    },
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botão de salvar */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary.main,
                opacity: saving ? 0.6 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Salvar alterações"
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <>
                <Save size={20} color={colors.text.inverse} />
                <Text style={[styles.saveButtonText, { color: colors.text.inverse }]}>
                  Salvar alterações
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                            COMPONENTES INTERNOS                            */
/* -------------------------------------------------------------------------- */

interface SectionTitleProps {
  children: React.ReactNode;
  colors: ThemeColors;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children, colors }) => (
  <Text
    style={[
      styles.sectionTitle,
      {
        color: colors.text.tertiary,
      },
    ]}
  >
    {children}
  </Text>
);

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad';
  colors: ThemeColors;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  colors,
}) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>{label}</Text>
    <TextInput
      accessibilityLabel="Text input field"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.text.tertiary}
      keyboardType={keyboardType}
      style={[
        styles.input,
        {
          color: colors.text.primary,
          backgroundColor: colors.background.canvas,
          borderColor: colors.border.light,
        },
      ]}
    />
  </View>
);

interface DividerProps {
  colors: ThemeColors;
}

const Divider: React.FC<DividerProps> = ({ colors }) => (
  <View style={[styles.divider, { backgroundColor: colors.border.light }]} />
);

/* -------------------------------------------------------------------------- */
/*                                  ESTILOS                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Tokens.spacing['4'],
    borderBottomWidth: 1,
  },
  backButton: {
    width: Tokens.touchTargets.min, // 44pt WCAG AAA
    height: Tokens.touchTargets.min, // 44pt WCAG AAA
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Tokens.typography.sizes.xl,
    fontWeight: Tokens.typography.weights.bold,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Tokens.spacing['6'],
    marginBottom: Tokens.spacing['4'],
  },
  emailText: {
    fontSize: Tokens.typography.sizes.sm,
    marginTop: Tokens.spacing['2'],
  },
  sectionTitle: {
    fontSize: Tokens.typography.sizes.xs,
    fontWeight: Tokens.typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Tokens.spacing['6'],
    marginBottom: Tokens.spacing['3'],
    marginHorizontal: Tokens.spacing['4'],
  },
  card: {
    marginHorizontal: Tokens.spacing['4'],
    borderRadius: Tokens.radius.lg,
    borderWidth: 1,
    padding: Tokens.spacing['4'],
    marginBottom: Tokens.spacing['4'],
  },
  inputContainer: {
    marginBottom: Tokens.spacing['4'],
  },
  inputLabel: {
    fontSize: Tokens.typography.sizes.xs,
    fontWeight: Tokens.typography.weights.semibold,
    marginBottom: Tokens.spacing['2'],
  },
  input: {
    fontSize: Tokens.typography.sizes.base,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: Tokens.spacing['3'],
    borderRadius: Tokens.radius.md,
    borderWidth: 1,
  },
  divider: {
    height: 1,
    marginVertical: Tokens.spacing['4'],
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing['2'],
    marginTop: Tokens.spacing['2'],
  },
  chip: {
    paddingHorizontal: Tokens.spacing['3'],
    paddingVertical: Tokens.spacing['2'],
    borderRadius: Tokens.radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: Tokens.typography.sizes.sm,
    fontWeight: Tokens.typography.weights.medium,
  },
  bottomSection: {
    paddingHorizontal: Tokens.spacing['4'],
    paddingVertical: Tokens.spacing['6'],
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['4'],
    borderRadius: Tokens.radius.lg,
  },
  saveButtonText: {
    fontSize: Tokens.typography.sizes.base,
    fontWeight: Tokens.typography.weights.bold,
  },
});
