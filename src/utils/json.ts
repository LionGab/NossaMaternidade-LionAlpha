/**
 * JSON Utilities
 * Helpers para parsing seguro de JSON
 *
 * ⚠️ IMPORTANTE: Não loga dados crus para evitar vazamento de informações sensíveis
 */

import { logger } from './logger';

/**
 * Opções para safeJsonParse
 */
export interface SafeJsonParseOptions {
  /** Label para identificar o contexto no log (ex: 'WellnessProfile', 'CheckIns') */
  onErrorLabel?: string;
}

/**
 * Parse JSON de forma segura, retornando valor padrão se falhar
 * Evita que JSON corrompido quebre o carregamento da app
 *
 * ⚠️ SEGURANÇA: Não loga dados crus (raw) - apenas rótulo e tipo de erro
 *
 * @param raw - String JSON para fazer parse
 * @param fallback - Valor padrão a retornar em caso de erro
 * @param options - Opções incluindo onErrorLabel para identificar contexto
 * @returns Valor parseado ou fallback
 *
 * @example
 * ```ts
 * const profile = safeJsonParse<MotherProfile>(
 *   profileData,
 *   null,
 *   { onErrorLabel: 'WellnessProfile' }
 * );
 * ```
 */
export function safeJsonParse<T>(
  raw: string | null | undefined,
  fallback: T,
  options?: SafeJsonParseOptions | string
): T {
  // Suporta assinatura legada (string como terceiro parâmetro) e nova (objeto com options)
  const label = typeof options === 'string' ? options : options?.onErrorLabel;

  // Se não há dados, retornar fallback sem logging (comportamento esperado)
  if (raw == null || raw === '') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as T;

    // Validação básica de tipo para arrays
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      logger.warn('[safeJsonParse] Tipo inesperado para array', {
        label,
        expected: 'array',
        received: typeof parsed,
      });
      return fallback;
    }

    return parsed;
  } catch (error) {
    // ⚠️ SEGURANÇA: Não loga dados crus (rawPreview), apenas metadata
    logger.error('[safeJsonParse] Falha ao fazer parse de JSON, usando fallback', error, {
      label,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      rawLength: raw?.length,
    });
    return fallback;
  }
}

/**
 * Opções para safeJsonStringify
 */
export interface SafeJsonStringifyOptions {
  /** Label para identificar o contexto no log */
  onErrorLabel?: string;
  /** Se true, formata com indentação (padrão: false) */
  pretty?: boolean;
}

/**
 * Stringify JSON de forma segura, retornando string vazia se falhar
 *
 * ⚠️ SEGURANÇA: Não loga valores sensíveis
 *
 * @param value - Valor para converter em JSON
 * @param options - Opções incluindo onErrorLabel e pretty
 * @returns String JSON ou string vazia
 */
export function safeJsonStringify(
  value: unknown,
  options?: SafeJsonStringifyOptions | string,
  pretty = false
): string {
  // Suporta assinatura legada (string como segundo parâmetro) e nova (objeto com options)
  const label = typeof options === 'string' ? options : options?.onErrorLabel;
  const shouldPretty = typeof options === 'object' ? options?.pretty ?? false : pretty;

  try {
    return JSON.stringify(value, null, shouldPretty ? 2 : 0);
  } catch (error) {
    // ⚠️ SEGURANÇA: Não loga o valor, apenas metadata
    logger.error('[safeJsonStringify] Erro ao serializar JSON', error, {
      label,
      valueType: typeof value,
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return '';
  }
}

