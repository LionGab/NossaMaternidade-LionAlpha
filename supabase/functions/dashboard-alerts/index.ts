/**
 * Supabase Edge Function: dashboard-alerts
 *
 * Envia alertas do dashboard de crises para:
 * - Slack (webhook)
 * - Email (via Resend)
 *
 * Triggers:
 * - Cron job (a cada 5 min)
 * - Chamada manual via API
 * - Webhook interno do Supabase
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// ============================================================================
// TYPES
// ============================================================================

interface Alert {
  type: 'cvv_increase' | 'moderation_queue' | 'critical_crisis';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
}

interface AlertPayload {
  alerts: Alert[];
  timestamp: string;
  environment: string;
}

interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  elements?: Array<{
    type: string;
    text?: string | { type: string; text: string };
    url?: string;
    style?: string;
  }>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_ALERTS_WEBHOOK_URL');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ALERT_EMAIL_TO = Deno.env.get('ALERT_EMAIL_TO') || 'team@nossamaternidade.com.br';
const ALERT_EMAIL_FROM = Deno.env.get('ALERT_EMAIL_FROM') || 'alertas@nossamaternidade.com.br';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const ENVIRONMENT = Deno.env.get('ENVIRONMENT') || 'development';
const DASHBOARD_URL = Deno.env.get('DASHBOARD_URL') || 'https://admin.nossamaternidade.com.br/dashboard';

// Thresholds
const THRESHOLDS = {
  cvvIncreasePercent: 20, // Alert if CVV clicks increase > 20%
  moderationQueueMax: 50, // Alert if queue > 50
  criticalCrisisMax: 0, // Alert on any critical crisis
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ============================================================================
// ALERT DETECTION
// ============================================================================

async function detectAlerts(supabase: ReturnType<typeof createClient>): Promise<Alert[]> {
  const alerts: Alert[] = [];

  // 1. Check CVV click increase
  try {
    const { data: cvvData, error: cvvError } = await supabase.rpc('get_cvv_click_stats');

    if (!cvvError && cvvData && cvvData.length > 0) {
      const stats = cvvData[0];
      if (stats.variation_percent > THRESHOLDS.cvvIncreasePercent) {
        alerts.push({
          type: 'cvv_increase',
          severity: stats.variation_percent > 50 ? 'critical' : 'warning',
          message: `Aumento de ${stats.variation_percent}% nos cliques no CVV (${stats.today_count} hoje vs ${stats.yesterday_count} ontem)`,
          value: stats.variation_percent,
          threshold: THRESHOLDS.cvvIncreasePercent,
        });
      }
    }
  } catch (err) {
    console.error('[dashboard-alerts] Erro ao verificar CVV:', err);
  }

  // 2. Check moderation queue
  try {
    const { data: modData, error: modError } = await supabase.rpc('get_moderation_queue_stats');

    if (!modError && modData && modData.length > 0) {
      const stats = modData[0];
      if (stats.pending_count > THRESHOLDS.moderationQueueMax) {
        alerts.push({
          type: 'moderation_queue',
          severity: stats.pending_count > 100 ? 'critical' : 'warning',
          message: `Fila de moderacao com ${stats.pending_count} itens pendentes (limite: ${THRESHOLDS.moderationQueueMax})`,
          value: stats.pending_count,
          threshold: THRESHOLDS.moderationQueueMax,
        });
      }
    }
  } catch (err) {
    console.error('[dashboard-alerts] Erro ao verificar moderacao:', err);
  }

  // 3. Check critical crises today
  try {
    const { count, error: crisisError } = await supabase
      .from('crisis_interventions')
      .select('*', { count: 'exact', head: true })
      .eq('level', 'critical')
      .gte('detected_at', new Date().toISOString().split('T')[0])
      .is('deleted_at', null);

    if (!crisisError && count && count > THRESHOLDS.criticalCrisisMax) {
      alerts.push({
        type: 'critical_crisis',
        severity: 'critical',
        message: `${count} crise(s) critica(s) detectada(s) hoje - Acao imediata necessaria`,
        value: count,
        threshold: THRESHOLDS.criticalCrisisMax,
      });
    }
  } catch (err) {
    console.error('[dashboard-alerts] Erro ao verificar crises:', err);
  }

  return alerts;
}

// ============================================================================
// SLACK NOTIFICATION
// ============================================================================

function buildSlackMessage(payload: AlertPayload): { blocks: SlackBlock[] } {
  const { alerts, timestamp, environment } = payload;

  const severityEmoji = {
    critical: ':rotating_light:',
    warning: ':warning:',
  };

  const typeEmoji = {
    cvv_increase: ':telephone_receiver:',
    moderation_queue: ':inbox_tray:',
    critical_crisis: ':sos:',
  };

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${alerts.some((a) => a.severity === 'critical') ? ':rotating_light:' : ':warning:'} Alertas do Dashboard - Nossa Maternidade`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Ambiente:* ${environment}\n*Data/Hora:* ${new Date(timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
      },
    },
  ];

  // Add each alert
  for (const alert of alerts) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${severityEmoji[alert.severity]} ${typeEmoji[alert.type]} *${alert.type.replace(/_/g, ' ').toUpperCase()}*\n${alert.message}`,
      },
    });
  }

  // Add action button
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Ver Dashboard',
        },
        url: DASHBOARD_URL,
        style: 'primary',
      },
    ],
  });

  return { blocks };
}

async function sendSlackNotification(payload: AlertPayload): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('[dashboard-alerts] SLACK_ALERTS_WEBHOOK_URL nao configurado');
    return false;
  }

  try {
    const message = buildSlackMessage(payload);

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log('[dashboard-alerts] Slack notification sent successfully');
    return true;
  } catch (err) {
    console.error('[dashboard-alerts] Erro ao enviar Slack:', err);
    return false;
  }
}

// ============================================================================
// EMAIL NOTIFICATION
// ============================================================================

function buildEmailHtml(payload: AlertPayload): string {
  const { alerts, timestamp, environment } = payload;

  const severityColor = {
    critical: '#DC2626',
    warning: '#F59E0B',
  };

  const alertsHtml = alerts
    .map(
      (alert) => `
    <div style="border-left: 4px solid ${severityColor[alert.severity]}; padding: 12px; margin: 12px 0; background: #f9fafb;">
      <strong style="color: ${severityColor[alert.severity]};">[${alert.severity.toUpperCase()}]</strong>
      <strong>${alert.type.replace(/_/g, ' ').toUpperCase()}</strong>
      <p style="margin: 8px 0 0 0;">${alert.message}</p>
    </div>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #7C3AED; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 20px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 16px; text-align: center; border-radius: 0 0 8px 8px; }
    .btn { display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Alertas do Dashboard</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Nossa Maternidade - ${environment}</p>
    </div>
    <div class="content">
      <p><strong>Data/Hora:</strong> ${new Date(timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      <p><strong>${alerts.length} alerta(s) detectado(s):</strong></p>
      ${alertsHtml}
    </div>
    <div class="footer">
      <a href="${DASHBOARD_URL}" class="btn">Ver Dashboard</a>
      <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">
        Este email foi enviado automaticamente pelo sistema de monitoramento.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendEmailNotification(payload: AlertPayload): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('[dashboard-alerts] RESEND_API_KEY nao configurado');
    return false;
  }

  try {
    const hasCritical = payload.alerts.some((a) => a.severity === 'critical');
    const subject = hasCritical
      ? `[CRITICO] Alertas do Dashboard - Nossa Maternidade`
      : `[Atencao] Alertas do Dashboard - Nossa Maternidade`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: ALERT_EMAIL_FROM,
        to: ALERT_EMAIL_TO.split(',').map((e) => e.trim()),
        subject,
        html: buildEmailHtml(payload),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    console.log('[dashboard-alerts] Email notification sent successfully');
    return true;
  } catch (err) {
    console.error('[dashboard-alerts] Erro ao enviar email:', err);
    return false;
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autenticacao (para chamadas manuais)
    const authHeader = req.headers.get('Authorization');
    const isScheduled = req.headers.get('X-Supabase-Cron') === 'true';

    if (!authHeader && !isScheduled) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Inicializar Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Detectar alertas
    const alerts = await detectAlerts(supabase);

    if (alerts.length === 0) {
      console.log('[dashboard-alerts] Nenhum alerta detectado');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhum alerta detectado',
          alerts: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Preparar payload
    const payload: AlertPayload = {
      alerts,
      timestamp: new Date().toISOString(),
      environment: ENVIRONMENT,
    };

    // Enviar notificacoes em paralelo
    const [slackResult, emailResult] = await Promise.all([
      sendSlackNotification(payload),
      // Enviar email apenas para alertas criticos ou se tiver mais de 1 alerta
      alerts.some((a) => a.severity === 'critical') || alerts.length > 1
        ? sendEmailNotification(payload)
        : Promise.resolve(false),
    ]);

    // Log de auditoria
    try {
      await supabase.from('alert_logs').insert({
        alerts: JSON.stringify(alerts),
        slack_sent: slackResult,
        email_sent: emailResult,
        environment: ENVIRONMENT,
      });
    } catch (logErr) {
      // Tabela pode nao existir ainda, ignorar
      console.warn('[dashboard-alerts] Erro ao salvar log:', logErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        alertsCount: alerts.length,
        alerts,
        notifications: {
          slack: slackResult,
          email: emailResult,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[dashboard-alerts] Error:', error);
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
