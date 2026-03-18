import { createEdgeClient } from '@/lib/supabase/client';
import { Resend } from 'resend';

export const runtime = 'edge';

/**
 * Budget Monitor - Vercel Cron Job
 * Runs every 5 minutes to check budget thresholds
 *
 * Configure in vercel.json:
 * "crons": [{
 *   "path": "/api/cron/budget-monitor",
 *   "schedule": "every 5 minutes"
 * }]
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ALERT_EMAIL = process.env.ALERT_EMAIL;

export async function GET() {
  try {
    const supabase = createEdgeClient();

    // Get all budgets
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*, user_id, email');

    if (budgetsError) throw budgetsError;

    const results: {
      checked: number;
      alertsSent: number;
      errors: string[];
    } = {
      checked: 0,
      alertsSent: 0,
      errors: [],
    };

    for (const budget of budgets || []) {
      results.checked++;

      try {
        // Calculate current usage from requests (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: requests } = await supabase
          .from('requests')
          .select('cost_usd')
          .eq('user_id', budget.user_id)
          .gte('timestamp', thirtyDaysAgo.toISOString());

        const currentUsage = requests?.reduce(
          (sum, req) => sum + parseFloat(req.cost_usd.toString()),
          0
        ) || 0;

        // Update cached usage
        await supabase
          .from('budgets')
          .update({ cached_usage_usd: currentUsage })
          .eq('id', budget.id);

        // Check thresholds
        const usagePercent = currentUsage / budget.monthly_limit_usd;

        for (const threshold of budget.alert_thresholds) {
          // Check if we just crossed this threshold
          if (usagePercent >= threshold) {
            // Check if alert already sent for this threshold
            const { data: existingAlert } = await supabase
              .from('budget_alerts')
              .select('id')
              .eq('budget_id', budget.id)
              .eq('threshold', threshold)
              .maybeSingle();

            if (!existingAlert) {
              // Send alert
              await sendAlert({
                email: budget.email,
                threshold: threshold * 100,
                currentUsage,
                monthlyLimit: budget.monthly_limit_usd,
                limitType: budget.limit_type,
              });

              // Record alert
              await supabase
                .from('budget_alerts')
                .insert({
                  budget_id: budget.id,
                  threshold,
                  usage_at_alert: currentUsage,
                });

              results.alertsSent++;
            }
          }
        }
      } catch (error) {
        results.errors.push(`Budget ${budget.id}: ${error}`);
      }
    }

    return Response.json(results);
  } catch (error) {
    console.error('Cron error:', error);
    return Response.json(
      { error: 'Cron job failed', details: error },
      { status: 500 }
    );
  }
}

async function sendAlert(params: {
  email: string;
  threshold: number;
  currentUsage: number;
  monthlyLimit: number;
  limitType: string;
}) {
  if (!RESEND_API_KEY || !ALERT_EMAIL) {
    console.log('Email not configured, skipping alert');
    return;
  }

  const resend = new Resend(RESEND_API_KEY);

  const subject = params.threshold === 100
    ? `⚠️ Budget Limit Reached`
    : `📊 Budget Alert: ${params.threshold}% Used`;

  const body = params.threshold === 100
    ? `Your AI API spending has reached ${params.threshold}% of your monthly budget.

Monthly Limit: $${params.monthlyLimit.toFixed(2)}
Current Usage: $${params.currentUsage.toFixed(2)}
Limit Type: ${params.limitType === 'hard' ? 'Hard (requests will be blocked)' : 'Soft (alerts only)'}

${params.limitType === 'hard' ? '⚠️ Further requests will be blocked until next billing cycle.' : ''}`
    : `Your AI API spending has reached ${params.threshold}% of your monthly budget.

Monthly Limit: $${params.monthlyLimit.toFixed(2)}
Current Usage: $${params.currentUsage.toFixed(2)}

Consider reviewing your usage to avoid exceeding your budget.`;

  try {
    await resend.emails.send({
      from: 'AI Cost Optimizer <alerts@aicostoptimizer.com>',
      to: [ALERT_EMAIL],
      subject,
      text: body,
    });
  } catch (error) {
    console.error('Failed to send alert email:', error);
  }
}
