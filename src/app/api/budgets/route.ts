import { createEdgeClient } from '@/lib/supabase/client';

export const runtime = 'edge';

/**
 * Budget API - Get/Create/Update user budget
 */

export async function GET() {
  try {
    const supabase = createEdgeClient();

    // In a real implementation, get user ID from auth
    // For now, return a sample budget or null
    const { data: budget } = await supabase
      .from('budgets')
      .select('*')
      .maybeSingle();

    return Response.json(budget);
  } catch (error) {
    console.error('Budget GET error:', error);
    return Response.json(
      { error: 'Failed to load budget' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createEdgeClient();
    const body = await request.json();

    // In a real implementation, get user ID from auth
    // For demo, use a placeholder user ID
    const { data: existingBudget } = await supabase
      .from('budgets')
      .select('id')
      .maybeSingle();

    if (existingBudget) {
      // Update existing budget
      const { error } = await supabase
        .from('budgets')
        .update({
          monthly_limit_usd: body.monthly_limit_usd,
          limit_type: body.limit_type,
          alert_thresholds: body.alert_thresholds,
        })
        .eq('id', existingBudget.id);

      if (error) throw error;
    } else {
      // Create new budget
      const { error } = await supabase
        .from('budgets')
        .insert({
          monthly_limit_usd: body.monthly_limit_usd,
          limit_type: body.limit_type,
          alert_thresholds: body.alert_thresholds,
        });

      if (error) throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Budget POST error:', error);
    return Response.json(
      { error: 'Failed to save budget' },
      { status: 500 }
    );
  }
}
