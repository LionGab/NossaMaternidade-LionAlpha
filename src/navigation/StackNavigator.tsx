import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState, Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { TabNavigator } from './TabNavigator';
import { RootStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';
import { onboardingService } from '../services/onboardingService';
import { useTheme } from '../theme/ThemeContext';
import { logger } from '../utils/logger';

// 🚀 LAZY LOADING: Screens carregadas sob demanda para reduzir bundle inicial
const SplashScreenComponent = React.lazy(() =>
  import('../screens/SplashScreen').then((m) => ({ default: m.default }))
);
const LoginScreenNew = React.lazy(() => import('../screens/LoginScreenNew'));
const AuthCallbackScreen = React.lazy(() => import('../screens/AuthCallbackScreen'));
const ResetPasswordScreen = React.lazy(() => import('../screens/ResetPasswordScreen'));
const OnboardingScreen = React.lazy(() => import('../screens/Onboarding/OnboardingScreen'));
const RitualScreen = React.lazy(() => import('../screens/RitualScreen'));
const DiaryScreen = React.lazy(() => import('../screens/DiaryScreen'));
const PrivacyPolicyScreen = React.lazy(() => import('../screens/PrivacyPolicyScreen'));
const TermsOfServiceScreen = React.lazy(() => import('../screens/TermsOfServiceScreen'));
const SettingsScreen = React.lazy(() => import('../screens/SettingsScreen'));
const AgentsStatusScreen = React.lazy(() => import('../screens/AgentsStatusScreen'));
const ProfileScreen = React.lazy(() => import('../screens/ProfileScreen'));
const ContentDetailScreen = React.lazy(() => import('../screens/ContentDetailScreen'));
const DesignSystemScreen = React.lazy(() => import('../screens/DesignSystemScreen'));
const DesignMetricsDashboard = React.lazy(() => import('../screens/DesignMetricsDashboard'));
const SearchScreen = React.lazy(() => import('../screens/SearchScreen'));
const CrisisDashboardScreen = React.lazy(() => import('../screens/CrisisDashboardScreen'));
const NotFoundScreen = React.lazy(() => import('../screens/NotFoundScreen'));

// Loading fallback component
const ScreenLoadingFallback = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.canvas,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary.main} />
    </View>
  );
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 🔧 CONFIGURAÇÃO: Defina como true para exigir login, false para modo guest
// Quando false, o app funciona sem login (modo desenvolvimento/demo)
const REQUIRE_AUTH = false;

export const StackNavigator = () => {
  // ✅ Usar AuthContext em vez de duplicar lógica
  const { user, loading: authLoading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  useEffect(() => {
    const isMounted = { current: true };

    const checkOnboarding = async () => {
      try {
        // Verificar se usuário completou onboarding via serviço
        // Em modo guest (REQUIRE_AUTH = false), verificar mesmo sem user
        const shouldCheck = REQUIRE_AUTH ? !!user : true;

        if (shouldCheck) {
          const completed = await onboardingService.isOnboardingCompleted();
          if (isMounted.current) {
            setHasCompletedOnboarding(completed);
          }
        } else {
          if (isMounted.current) {
            setHasCompletedOnboarding(false);
          }
        }
      } catch (error) {
        logger.warn('[StackNavigator] Error ao verificar onboarding', error);
        if (isMounted.current) {
          setHasCompletedOnboarding(false);
        }
      } finally {
        if (isMounted.current) {
          setOnboardingLoading(false);
        }
      }
    };

    checkOnboarding();

    return () => {
      isMounted.current = false;
    };
  }, [user]);

  // Loading enquanto verifica onboarding
  // Em modo guest, não esperar authLoading
  const loading = REQUIRE_AUTH ? authLoading || onboardingLoading : onboardingLoading;

  if (loading) {
    return <SplashScreenComponent />;
  }

  // Determinar rota inicial baseado no estado
  const getInitialRouteName = (): keyof RootStackParamList => {
    // 🎯 MODO GUEST: Não exige login
    if (!REQUIRE_AUTH) {
      // Se completou onboarding → Main
      if (hasCompletedOnboarding) {
        return 'Main';
      }
      // Se não completou onboarding → Onboarding
      return 'Onboarding';
    }

    // 🔐 MODO AUTH: Exige login (comportamento original)
    // Se usuário está logado E completou onboarding → Main
    if (user && hasCompletedOnboarding) {
      return 'Main';
    }
    // Se usuário está logado MAS NÃO completou onboarding → Onboarding
    if (user && !hasCompletedOnboarding) {
      return 'Onboarding';
    }
    // Se usuário NÃO está logado → Auth
    if (!user) {
      return 'Auth';
    }
    // Fallback → Splash
    return 'Splash';
  };

  // Wrapper para lazy-loaded screens com Suspense
  const LazyScreen = <P extends Record<string, unknown> = Record<string, unknown>>({
    component: Component,
    ...props
  }: {
    component: React.LazyExoticComponent<React.ComponentType<P>>;
  } & P) => (
    <Suspense fallback={<ScreenLoadingFallback />}>
      <Component {...(props as unknown as P)} />
    </Suspense>
  );

  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        presentation: 'card',
      }}
    >
      <Stack.Screen name="Splash">
        {(props) => <LazyScreen component={SplashScreenComponent} {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Auth">
        {(props) => <LazyScreen component={LoginScreenNew} {...props} />}
      </Stack.Screen>
      <Stack.Screen name="AuthCallback">
        {(props) => <LazyScreen component={AuthCallbackScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen name="ResetPassword">
        {(props) => <LazyScreen component={ResetPasswordScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Onboarding">
        {(props) => <LazyScreen component={OnboardingScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Main" component={TabNavigator} />
      {/* Modais */}
      <Stack.Screen
        name="Ritual"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      >
        {(props) => <LazyScreen component={RitualScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="Diary"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      >
        {(props) => <LazyScreen component={DiaryScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="ContentDetail"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        {(props) => <LazyScreen component={ContentDetailScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="PrivacyPolicy"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        {(props) => <LazyScreen component={PrivacyPolicyScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="TermsOfService"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        {(props) => <LazyScreen component={TermsOfServiceScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="Settings"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        {(props) => <LazyScreen component={SettingsScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="AgentsStatus"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        {(props) => <LazyScreen component={AgentsStatusScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="Profile"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        {(props) => <LazyScreen component={ProfileScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="DesignSystem"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        {(props) => <LazyScreen component={DesignSystemScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="DesignMetrics"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        {(props) => <LazyScreen component={DesignMetricsDashboard} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="Search"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        {(props) => <LazyScreen component={SearchScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="CrisisDashboard"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        {(props) => <LazyScreen component={CrisisDashboardScreen} {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="NotFound"
        options={{
          presentation: 'card',
          animation: 'fade',
        }}
      >
        {(props) => <LazyScreen component={NotFoundScreen} {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
