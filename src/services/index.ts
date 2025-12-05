/**
 * Services - Exports
 * Serviços de integração para Nossa Maternidade
 */

// =====================
// 🔐 Supabase
// =====================
export { supabase } from './supabase';

// =====================
// 🧘 Ritual
// =====================
export { ritualService } from './ritualService';
export type { default as RitualServiceType } from './ritualService';

// =====================
// 🆘 SOS
// =====================
export { sosService } from './sosService';
export type { default as SOSServiceType } from './sosService';

// =====================
// 💔 Guilt (Desculpa Hoje)
// =====================
export { guiltService } from './guiltService';
export type { default as GuiltServiceType } from './guiltService';

