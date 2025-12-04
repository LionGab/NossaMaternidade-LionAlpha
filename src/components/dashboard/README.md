# Dashboard de Monitoramento de Crises

## Visao Geral

Dashboard em tempo real para monitoramento de crises, CVV, moderacao e funil de conversao do app Nossa Maternidade.

---

## Componentes

| Componente              | Descricao                              |
| ----------------------- | -------------------------------------- |
| `DashboardSummaryCard`  | Resumo do dia (crises, CVV, follow-ups)|
| `CrisisLineChart`       | Grafico de linha - crises por dia      |
| `CrisisTypePieChart`    | Grafico de pizza - tipos de crise      |
| `CVVClickCard`          | Cliques no CVV com variacao %          |
| `ModerationQueueCard`   | Fila de moderacao com barra progresso  |
| `FunnelChart`           | Funil de conversao com dropoff         |
| `AlertBanner`           | Banner de alertas ativos               |

---

## Hook: useDashboardData

```typescript
const {
  summary,
  dailyStats,
  typeDistribution,
  cvvStats,
  moderationStats,
  funnelStats,
  alerts,
  isLoading,
  isRefreshing,
  error,
  lastUpdated,
  refresh,
  refreshSection,
} = useDashboardData({
  pollingInterval: 60000, // 1 minuto
  enableRealtime: true,
  refreshOnForeground: true,
  dailyStatsDays: 30,
});
```

---

## Interpretacao das Metricas

### 1. Crises Hoje

**O que mede:** Numero total de crises detectadas no dia atual.

**Como interpretar:**
- **0-5:** Normal, monitorar
- **6-15:** Elevado, verificar padroes
- **16+:** Alto, acao imediata

**Acao recomendada:** Se alto, verificar horarios de pico e conteudo que dispara crises.

---

### 2. Crises Criticas

**O que mede:** Crises com level = 'critical' que requerem intervencao imediata.

**Como interpretar:**
- **0:** Ideal
- **1+:** Requer acao IMEDIATA

**Acao recomendada:**
1. Verificar se usuario clicou no CVV
2. Garantir que follow-up foi agendado
3. Revisar resposta da NathIA

---

### 3. CVV Clicks

**O que mede:** Quantos usuarios clicaram no botao do CVV (188).

**Como interpretar:**
- Aumento > 20% vs ontem: **ALERTA**
- Aumento > 50% vs ontem: **CRITICO**

**Acao recomendada:**
- Correlacionar com conteudo publicado
- Verificar se ha algum trigger externo (noticia, datas comemorativas)

---

### 4. Variacao % CVV

**O que mede:** Diferenca percentual de cliques CVV entre hoje e ontem.

**Formula:** `((hoje - ontem) / ontem) * 100`

**Como interpretar:**
- **Negativo:** Menos cliques (bom, se crises diminuiram)
- **0-20%:** Variacao normal
- **20-50%:** Atencao
- **50%+:** Critico

---

### 5. Fila de Moderacao

**O que mede:** Quantos itens aguardam revisao de moderador.

**Como interpretar:**
- **0-25:** Saudavel (verde)
- **26-50:** Atencao (amarelo)
- **51+:** Sobrecarga (vermelho)

**Acao recomendada:** Se > 50, recrutar moderadores ou priorizar criticos.

---

### 6. Tempo Medio na Fila

**O que mede:** Quanto tempo em media um item fica na fila antes de ser processado.

**Como interpretar:**
- **< 5 min:** Excelente
- **5-15 min:** Bom
- **15-60 min:** Atencao
- **60+ min:** Critico

---

### 7. Funil de Conversao

**O que mede:** Jornada do usuario desde onboarding ate assinatura.

**Stages tipicos:**
1. `onboarding_started` - Iniciou onboarding
2. `onboarding_profile` - Preencheu perfil
3. `onboarding_baby` - Adicionou bebe
4. `onboarding_complete` - Completou onboarding
5. `aha_moment_nathia` - Usou NathIA pela primeira vez
6. `aha_moment_tracker` - Usou tracker pela primeira vez
7. `first_week_active` - Ativo na primeira semana
8. `subscription_viewed` - Viu oferta de assinatura
9. `subscription_started` - Iniciou assinatura

**Como interpretar:**
- Dropoff > 30%: Problema nesse stage
- Dropoff > 50%: Problema critico

---

## Alertas Automaticos

| Alerta              | Threshold         | Severidade |
| ------------------- | ----------------- | ---------- |
| CVV increase        | > 20% vs ontem    | Warning    |
| CVV increase        | > 50% vs ontem    | Critical   |
| Moderation queue    | > 50 itens        | Warning    |
| Moderation queue    | > 100 itens       | Critical   |
| Critical crisis     | > 0 hoje          | Critical   |

---

## Edge Function: dashboard-alerts

Envia notificacoes para Slack e Email quando alertas sao detectados.

**Variaveis de ambiente necessarias:**

```env
SLACK_ALERTS_WEBHOOK_URL=https://hooks.slack.com/services/...
RESEND_API_KEY=re_...
ALERT_EMAIL_TO=team@nossamaternidade.com.br
ALERT_EMAIL_FROM=alertas@nossamaternidade.com.br
DASHBOARD_URL=https://admin.nossamaternidade.com.br/dashboard
```

**Deploy:**

```bash
supabase functions deploy dashboard-alerts
```

**Cron job (supabase/config.toml):**

```toml
[cron_jobs.dashboard_alerts]
schedule = "*/5 * * * *"  # A cada 5 minutos
command = "SELECT net.http_post(...)"
```

---

## SQL Functions

| Function                        | Descricao                               |
| ------------------------------- | --------------------------------------- |
| `get_crisis_daily_stats(days)`  | Estatisticas diarias de crises          |
| `get_crisis_type_distribution()`| Distribuicao por tipo de crise          |
| `get_cvv_click_stats()`         | Cliques CVV com variacao                |
| `get_moderation_queue_stats()`  | Stats da fila de moderacao              |
| `refresh_dashboard_cache()`     | Refresh da materialized view            |

---

## Materialized View

`mv_dashboard_crisis_summary` - Cache de 5 minutos para metricas principais.

**Refresh:**
```sql
SELECT refresh_dashboard_cache();
```

---

## Uso

```tsx
import { CrisisDashboardScreen } from '@/screens/CrisisDashboardScreen';

// Na navegacao:
<Stack.Screen name="CrisisDashboard" component={CrisisDashboardScreen} />

// Ou usar componentes individuais:
import { CrisisLineChart, useDashboardData } from '@/components/dashboard';

function MyDashboard() {
  const { dailyStats, isLoading } = useDashboardData();
  return <CrisisLineChart data={dailyStats} />;
}
```

---

## Performance

- **Realtime:** Subscriptions Supabase para updates instantaneos
- **Polling:** Fallback a cada 1 minuto
- **Cache:** Materialized view refresh a cada 5 minutos
- **Lazy loading:** Componentes carregados sob demanda
- **Memoization:** Todos componentes usam `memo()`

---

## Proximos Passos

1. [ ] Dashboard web (admin.nossamaternidade.com.br)
2. [ ] Export de relatorios PDF
3. [ ] Comparativo semanal/mensal
4. [ ] Alertas personalizaveis por usuario
5. [ ] Machine learning para predicao de crises

---

_Ultima atualizacao: Dezembro 2025_
