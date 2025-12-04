/**
 * Validation Schemas - Nossa Maternidade
 * Schemas Zod para validação de formulários e inputs
 * @version 1.0.0
 */

import { z } from 'zod';

// ======================
// 🔐 LOGIN
// ======================

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha muito longa'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ======================
// 👤 PERFIL
// ======================

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  phone: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato: (00) 00000-0000')
    .optional()
    .or(z.literal('')),
  pregnancyWeek: z
    .number()
    .min(1, 'Semana deve ser entre 1 e 42')
    .max(42, 'Semana deve ser entre 1 e 42')
    .optional()
    .nullable(),
  babyBirthDate: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: DD/MM/AAAA')
    .optional()
    .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ======================
// 🎯 ONBOARDING
// ======================

export const onboardingNameSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome muito longo')
    .trim(),
});

export type OnboardingNameFormData = z.infer<typeof onboardingNameSchema>;

// ======================
// 💬 CHAT
// ======================

export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(2000, 'Mensagem muito longa (máximo 2000 caracteres)')
    .trim(),
});

export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;

// ======================
// 🛠️ HELPERS
// ======================

/**
 * Valida dados com schema Zod e retorna resultado tipado
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => issue.message),
  };
}

/**
 * Valida e retorna apenas os erros (útil para exibir em UI)
 */
export function validateSchemaErrors<T>(schema: z.ZodSchema<T>, data: unknown): string[] {
  const result = schema.safeParse(data);

  if (result.success) {
    return [];
  }

  return result.error.issues.map((issue) => issue.message);
}
