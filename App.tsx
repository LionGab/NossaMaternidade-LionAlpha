// Importar Reanimated apenas em plataformas nativas (não no web)
import { Platform } from 'react-native';
if (Platform.OS !== 'web') {
  require('react-native-reanimated');
}

import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './src/components';
import { AgentsProvider } from './src/contexts/AgentsContext';
import { QueryProvider } from './src/contexts/QueryProvider';
import { WellnessProvider } from './src/features/wellness';
import { Navigation } from './src/navigation';
import { initSentry } from './src/services/sentry';
import { ThemeProvider } from './src/theme/ThemeContext';

// Inicializar Sentry antes de qualquer componente
initSentry();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider defaultMode="system">
          <WellnessProvider>
            <AgentsProvider>
              <ErrorBoundary>
                <Navigation />
              </ErrorBoundary>
            </AgentsProvider>
          </WellnessProvider>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
