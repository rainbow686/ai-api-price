import { createEdgeClient } from '@/lib/supabase/client';

export const runtime = 'edge';

/**
 * Dashboard Summary API
 * Returns cost and usage totals
 */

export async function GET() {
  try {
    const supabase = createEdgeClient();

    // Get all requests from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: requests, error } = await supabase
      .from('requests')
      .select('input_tokens, output_tokens, cost_usd, status')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (error) {
      throw error;
    }

    // Calculate summary
    const summary = requests?.reduce(
      (acc, req) => ({
        totalCost: acc.totalCost + parseFloat(req.cost_usd.toString()),
        totalRequests: acc.totalRequests + 1,
        totalInputTokens: acc.totalInputTokens + req.input_tokens,
        totalOutputTokens: acc.totalOutputTokens + req.output_tokens,
      }),
      {
        totalCost: 0,
        totalRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
      }
    ) || {
      totalCost: 0,
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
    };

    return Response.json({
      totalCost: parseFloat(summary.totalCost.toFixed(6)),
      totalRequests: summary.totalRequests,
      totalInputTokens: summary.totalInputTokens,
      totalOutputTokens: summary.totalOutputTokens,
    });
  } catch (error) {
    console.error('Summary API error:', error);
    return Response.json(
      { error: 'Failed to load summary data' },
      { status: 500 }
    );
  }
}
