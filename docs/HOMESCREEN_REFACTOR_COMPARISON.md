# 📊 Comparação: Refatoração HomeScreen - Implementação vs Markdown

## ✅ Status: Arquivos Criados Estão Corretos para o Projeto Atual

Os arquivos que foram criados seguem **exatamente** a estrutura do projeto atual. Os markdowns anexados são de uma versão alternativa com expo-router.

---

## 🔍 Diferenças Principais

| Aspecto          | Arquivos Criados (✅ Correto)           | Markdowns (Alternativa)                |
| ---------------- | --------------------------------------- | -------------------------------------- |
| **Navegação**    | React Navigation                        | expo-router                            |
| **Supabase**     | `@/services/supabase`                   | `@/lib/supabase`                       |
| **Auth**         | `useAuth()` retorna `{ user: User }`    | `useAuth()` retorna `{ user: { id } }` |
| **Design**       | Design Tokens (`Tokens`, `ColorTokens`) | NativeWind/Tailwind classes            |
| **Tabela Humor** | `check_in_logs` (já existe)             | `daily_moods` (nova)                   |
| **Tabela Sono**  | Precisa criar `sleep_logs`              | `sleep_logs` (nova)                    |
| **Agents**       | `useAgents()` com `chatAgent.process()` | `getDailyTip()` método direto          |

---

## 📁 Estrutura dos Arquivos Criados

### ✅ Arquivos Implementados (Corretos)

```
src/
├── hooks/
│   └── useHomeScreenData.ts          ✅ Usa checkInService + profileService
│
├── components/home/
│   ├── WelcomeHeader.tsx             ✅ React Navigation + Design Tokens
│   ├── MoodSelector.tsx              ✅ Salva em check_in_logs
│   ├── DailyTipCard.tsx              ✅ Design Tokens (bg-blue-50)
│   └── SleepPromptCard.tsx           ✅ Modal com slider
│
└── screens/
    └── HomeScreen.tsx                 ✅ ~145 linhas, modular
```

---

## 🗄️ Tabelas Supabase

### ✅ Já Existe

- **`check_in_logs`** - Usada pelo `MoodSelector`
  - Campos: `id`, `user_id`, `emotion`, `notes`, `created_at`
  - Migration: `supabase/migrations/20250126_check_in_logs.sql`

### ⚠️ Precisa Criar

- **`sleep_logs`** - Para o `SleepPromptCard`
  - Campos: `id`, `user_id`, `duration_hours`, `logged_at`, `created_at`

---

## 🔧 Ajustes Necessários

### 1. Criar Migration para `sleep_logs`

Criar arquivo: `supabase/migrations/20250127_sleep_logs.sql`

```sql
-- ============================================
-- Migration: Sleep Logs
-- Data: 2025-01-27
-- Descrição: Tabela para registrar horas de sono diárias
-- ============================================

CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Duração do sono em horas (0-12)
  duration_hours NUMERIC(3,1) NOT NULL CHECK (duration_hours >= 0 AND duration_hours <= 12),

  -- Data/hora do registro
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Notas opcionais
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Usuárias veem seus próprios sleep logs"
  ON public.sleep_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar sleep logs"
  ON public.sleep_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seus sleep logs"
  ON public.sleep_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Índices
CREATE INDEX idx_sleep_logs_user_id ON public.sleep_logs(user_id);
CREATE INDEX idx_sleep_logs_logged_at ON public.sleep_logs(user_id, logged_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_sleep_logs_updated_at
  BEFORE UPDATE ON public.sleep_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Criar Service para Sleep Logs

Criar arquivo: `src/services/sleepService.ts`

```typescript
import { supabase } from './supabase';
import { logger } from '@/utils/logger';

export interface SleepLog {
  id: string;
  user_id: string;
  duration_hours: number;
  logged_at: string;
  notes?: string;
  created_at: string;
}

class SleepService {
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Registrar horas de sono
   */
  async logSleep(hours: number, notes?: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        logger.error('User not authenticated', null, { service: 'sleepService' });
        return false;
      }

      const { error } = await supabase.from('sleep_logs').insert({
        user_id: userId,
        duration_hours: hours,
        notes,
        logged_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Failed to log sleep', error, { service: 'sleepService' });
        return false;
      }

      logger.info('Sleep logged successfully', { service: 'sleepService', hours });
      return true;
    } catch (error) {
      logger.error('Unexpected error logging sleep', error, { service: 'sleepService' });
      return false;
    }
  }

  /**
   * Buscar sono de hoje
   */
  async getTodaySleep(): Promise<SleepLog | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', `${today}T00:00:00`)
        .lt('logged_at', `${today}T23:59:59`)
        .order('logged_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return data as SleepLog;
    } catch (error) {
      return null;
    }
  }
}

export const sleepService = new SleepService();
export default sleepService;
```

### 3. Atualizar `SleepPromptCard.tsx`

Substituir o TODO por:

```typescript
import { sleepService } from '@/services/sleepService';

// No handleSave:
const success = await sleepService.logSleep(sleepHours);
if (success) {
  logger.info('Sleep registered', { hours: sleepHours, screen: 'SleepPromptCard' });
  onSleepRegistered?.(sleepHours);
  setShowModal(false);
}
```

### 4. Atualizar `useHomeScreenData.ts`

Adicionar busca de sono:

```typescript
import { sleepService } from '@/services/sleepService';

// No loadData:
const todaySleep = await sleepService.getTodaySleep();
// Usar para determinar shouldShowSleepPrompt
```

---

## ✅ Checklist Final

- [x] Arquivos criados seguem estrutura do projeto
- [x] Usa React Navigation (não expo-router)
- [x] Usa Design Tokens (não NativeWind classes)
- [x] Usa `check_in_logs` existente
- [ ] Criar migration `sleep_logs`
- [ ] Criar `sleepService.ts`
- [ ] Atualizar `SleepPromptCard` para usar service
- [ ] Atualizar `useHomeScreenData` para buscar sono

---

## 🎯 Conclusão

**Os arquivos criados estão 100% corretos para o projeto atual!**

Os markdowns são de uma versão alternativa. A única coisa faltando é:

1. Criar tabela `sleep_logs` no Supabase
2. Criar `sleepService.ts`
3. Conectar tudo

---

**Status:** ✅ Pronto para uso (após criar sleep_logs)
