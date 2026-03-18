import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Edge Client - for use in Edge Functions and API routes
export const createEdgeClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Client-side client - for use in React components
export const createBrowserClient = () => {
  return createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    }
  );
};

// Database types - matching our schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          api_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          api_key?: string;
          created_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          key: string;
          is_active: boolean;
          created_at: string;
        };
      };
      price_tiers: {
        Row: {
          id: string;
          provider: string;
          model: string;
          input_price_per_1k: number;
          output_price_per_1k: number;
          effective_from: string;
          effective_to: string | null;
        };
      };
      requests: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          model: string;
          input_tokens: number;
          output_tokens: number;
          cost_usd: number;
          status: string;
          error_message: string | null;
          timestamp: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          monthly_limit_usd: number;
          alert_thresholds: number[];
          limit_type: 'soft' | 'hard';
          last_alert_sent_at: string | null;
          cached_usage_usd: number;
        };
      };
      budget_alerts: {
        Row: {
          id: string;
          budget_id: string;
          threshold: number;
          usage_at_alert: number;
          sent_at: string;
        };
      };
    };
  };
};
