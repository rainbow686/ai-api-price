import { createEdgeClient } from '@/lib/supabase/client';

export const runtime = 'edge';

/**
 * Dashboard Requests API
 * Returns recent request logs
 */

export async function GET(request: Request) {
  try {
    const supabase = createEdgeClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data: requests, error } = await supabase
      .from('requests')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return Response.json(requests || []);
  } catch (error) {
    console.error('Requests API error:', error);
    return Response.json(
      { error: 'Failed to load requests data' },
      { status: 500 }
    );
  }
}
