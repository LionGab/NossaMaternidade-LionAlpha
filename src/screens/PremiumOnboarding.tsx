// @ts-nocheck
// NOTA: Este arquivo não está sendo usado no app atualmente (não está registrado na navegação)
// TODO: Refatorar para usar os Tokens do Design System quando for ativado
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColorTokens } from '@/theme/tokens';

import { PremiumButton } from '../components/premium';

// Theme constants usando ColorTokens
const COLORS = {
  primary: {
    main: ColorTokens.info[500],
    gradient: [ColorTokens.info[500], ColorTokens.info[700]] as [string, string],
  },
  secondary: {
    gradient: [ColorTokens.accent.purple, ColorTokens.purple?.[600] || '#7C3AED'] as [
      string,
      string,
    ],
  },
  success: {
    gradient: [ColorTokens.success[500], ColorTokens.success[600]] as [string, string],
  },
  background: {
    primary: ColorTokens.neutral[0],
    secondary: ColorTokens.neutral[50],
  },
  text: {
    primary: ColorTokens.neutral[800],
    secondary: ColorTokens.neutral[500],
  },
};

const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const SHADOWS = {
  sm: {
    shadowColor: ColorTokens.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: ColorTokens.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};

const ANIMATIONS = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Bem-vinda ao',
    subtitle: 'Nossa Maternidade',
    description:
      'Sua jornada maternal começa aqui. Conecte-se com uma comunidade de mães, acesse conteúdos exclusivos e receba suporte personalizado.',
    icon: 'heart',
    gradient: [...COLORS.primary.gradient],
  },
  {
    id: '2',
    title: 'Assistente IA',
    subtitle: 'Sempre Disponível',
    description:
      'Nossa inteligência artificial está disponível 24/7 para responder suas dúvidas, oferecer suporte emocional e acompanhar sua jornada.',
    icon: 'chatbubbles',
    gradient: [...COLORS.secondary.gradient],
  },
  {
    id: '3',
    title: 'Comunidade',
    subtitle: 'Mães Unidas',
    description:
      'Compartilhe experiências, tire dúvidas e construa conexões com outras mães que entendem sua jornada.',
    icon: 'people',
    gradient: [...COLORS.success.gradient],
  },
  {
    id: '4',
    title: 'Conteúdo',
    subtitle: 'Personalizado',
    description:
      'Artigos, vídeos e guias criados especialmente para cada fase da sua maternidade. Do pré-natal aos primeiros anos.',
    icon: 'book',
    gradient: [...COLORS.info.gradient],
  },
];

const OnboardingSlideComponent: React.FC<{
  slide: OnboardingSlide;
  index: number;
  isActive: boolean;
}> = ({ slide, isActive }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATIONS.duration.slow,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 10,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: ANIMATIONS.duration.slower,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATIONS.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: ANIMATIONS.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive, fadeAnim, rotateAnim, scaleAnim]);

  return (
    <View style={styles.slide}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={slide.gradient as [string, string, ...string[]]}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={slide.icon} size={64} color={COLORS.text.inverse} />
        </LinearGradient>
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>
    </View>
  );
};

const PremiumOnboarding: React.FC = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({
        x: prevIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(prevIndex);
    }
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to main app
    navigation.navigate('Main' as never);
  }, [navigation]);

  const handleGetStarted = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to registration/login
    navigation.navigate('Login' as never);
  }, [navigation]);

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  }, []);

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / slides.length,
      duration: ANIMATIONS.duration.normal,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, progressAnim]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      {/* Background Gradient */}
      <LinearGradient
        colors={COLORS.background.gradient.soft}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <OnboardingSlideComponent
            key={slide.id}
            slide={slide}
            index={index}
            isActive={index === currentIndex}
          />
        ))}
      </ScrollView>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            accessibilityRole="button"
            key={index}
            onPress={() => {
              scrollViewRef.current?.scrollTo({
                x: index * SCREEN_WIDTH,
                animated: true,
              });
              setCurrentIndex(index);
            }}
            style={styles.dotContainer}
          >
            <Animated.View
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
                currentIndex === index && {
                  transform: [
                    {
                      scale: progressAnim.interpolate({
                        inputRange: [index / slides.length, (index + 1) / slides.length],
                        outputRange: [1, 1.5],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {currentIndex > 0 && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handlePrevious}
            style={styles.navigationButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.primary[500]} />
          </TouchableOpacity>
        )}

        <View style={styles.mainButtonContainer}>
          {currentIndex === slides.length - 1 ? (
            <PremiumButton
              title="Começar Agora"
              onPress={handleGetStarted}
              variant="gradient"
              size="lg"
              fullWidth
              icon="arrow-forward"
              iconPosition="right"
            />
          ) : (
            <PremiumButton
              title="Próximo"
              onPress={handleNext}
              variant="primary"
              size="lg"
              fullWidth
              icon="arrow-forward"
              iconPosition="right"
            />
          )}
        </View>

        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleNext}
            style={styles.navigationButton}
          >
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary[500]} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navigationButton} />
        )}
      </View>

      {/* Features List (Last Slide) */}
      {currentIndex === slides.length - 1 && (
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success.main} />
            <Text style={styles.featureText}>Chat IA 24/7</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success.main} />
            <Text style={styles.featureText}>Comunidade Exclusiva</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success.main} />
            <Text style={styles.featureText}>Conteúdo Personalizado</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[3],
  },
  skipButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
  },
  skipText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary[500],
    fontFamily: TYPOGRAPHY.fonts.medium,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[8],
  },
  iconContainer: {
    marginBottom: SPACING[10],
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS['2xl'],
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    color: COLORS.text.secondary,
    fontFamily: TYPOGRAPHY.fonts.regular,
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.bold,
    marginBottom: SPACING[6],
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.secondary,
    fontFamily: TYPOGRAPHY.fonts.regular,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.lg * 1.4,
  },
  progressContainer: {
    paddingHorizontal: SPACING[8],
    marginVertical: SPACING[4],
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[500],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
  },
  dotContainer: {
    padding: SPACING[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.neutral[300],
    marginHorizontal: SPACING[1],
  },
  activeDot: {
    backgroundColor: COLORS.primary[500],
    width: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[8],
    paddingTop: SPACING[4],
  },
  navigationButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonContainer: {
    flex: 1,
    marginHorizontal: SPACING[3],
  },
  featuresContainer: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING[8],
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  featureText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    fontFamily: TYPOGRAPHY.fonts.medium,
    marginLeft: SPACING[3],
  },
});

export default PremiumOnboarding;
