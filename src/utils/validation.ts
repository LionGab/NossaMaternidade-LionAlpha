/**
 * Utilitários de validação
 */

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida força da senha
 */
export function isStrongPassword(password: string): boolean {
  // Mínimo 8 caracteres
  if (password.length < 8) return false;

  // Pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) return false;

  // Pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) return false;

  // Pelo menos um número
  if (!/[0-9]/.test(password)) return false;

  return true;
}

/**
 * Valida senha básica (mínimo 6 caracteres)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}
