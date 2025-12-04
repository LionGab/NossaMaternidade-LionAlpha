/**
 * POLYFILLS PARA REACT NATIVE + SUPABASE
 * =============================================================================
 * Este arquivo DEVE ser importado PRIMEIRO no index.ts ou App.tsx
 *
 * Resolve problemas de compatibilidade do Hermes (motor JS do React Native)
 * com APIs Web padrão usadas pelo Supabase:
 * - TextEncoder/TextDecoder: Necessários para decodificação de dados
 * - getRandomValues: Necessário para criptografia (Supabase Auth)
 *
 * Abordagem escolhida:
 * - Usa polyfills leves e amplamente testados
 * - Não sobrescreve APIs se já existirem (compatibilidade)
 * - Carrega apenas o necessário para React Native
 *
 * Referência: docs/Docfinal.md - Seção 4.2
 * =============================================================================
 */

// 1. react-native-get-random-values: OBRIGATÓRIO para Supabase Auth
// Fornece crypto.getRandomValues() necessário para geração de tokens seguros
import 'react-native-get-random-values';

// 2. TextEncoder/TextDecoder: OBRIGATÓRIO para Supabase
// O Supabase usa TextDecoder para decodificar respostas, mas Hermes não tem nativamente
// Usamos polyfill apenas se não existir (evita conflitos em ambientes que já têm)
if (typeof global.TextEncoder === 'undefined' || typeof global.TextDecoder === 'undefined') {
  // Importação dinâmica para evitar erro se o pacote não estiver instalado
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TextEncoder, TextDecoder } = require('text-encoding');

    if (typeof global.TextEncoder === 'undefined') {
      // Polyfill necessário para React Native
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).TextEncoder = TextEncoder;
    }

    if (typeof global.TextDecoder === 'undefined') {
      // Polyfill necessário para React Native
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).TextDecoder = TextDecoder;
    }
  } catch (error) {
    // Se text-encoding não estiver instalado, loga aviso mas não quebra o app
    // O erro aparecerá quando Supabase tentar usar TextDecoder
    // Nota: Usamos console aqui porque polyfills carrega ANTES do logger
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[Polyfills] text-encoding não instalado. Execute: npm install text-encoding');
    }
  }
}

// 3. Verificação final (apenas em dev para debug)
// Nota: Usamos console aqui porque polyfills carrega ANTES do logger
if (__DEV__) {
  const hasTextEncoder = typeof global.TextEncoder !== 'undefined';
  const hasTextDecoder = typeof global.TextDecoder !== 'undefined';
  const hasGetRandomValues =
    typeof global.crypto !== 'undefined' && typeof global.crypto.getRandomValues === 'function';

  if (hasTextEncoder && hasTextDecoder && hasGetRandomValues) {
    // eslint-disable-next-line no-console
    console.log('[Polyfills] ✅ Todos os polyfills carregados com sucesso');
  } else {
    // eslint-disable-next-line no-console
    console.warn('[Polyfills] ⚠️ Alguns polyfills podem estar faltando:', {
      TextEncoder: hasTextEncoder,
      TextDecoder: hasTextDecoder,
      getRandomValues: hasGetRandomValues,
    });
  }
}
