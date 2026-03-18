-- AI Cost Optimizer - Initial Schema
-- MVP: Gateway + Dashboard + Budget Alerts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  api_key UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (user's provider keys)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Price Tiers (model pricing)
CREATE TABLE price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_price_per_1k NUMERIC(12, 8) NOT NULL,
  output_price_per_1k NUMERIC(12, 8) NOT NULL,
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requests (Gateway logs)
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd NUMERIC(12, 8) NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for dashboard queries
CREATE INDEX idx_requests_user_timestamp ON requests(user_id, timestamp DESC);
CREATE INDEX idx_requests_timestamp ON requests(timestamp DESC);

-- Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monthly_limit_usd NUMERIC(12, 2) NOT NULL,
  alert_thresholds JSONB DEFAULT '[0.5, 0.8, 1.0]',
  limit_type TEXT DEFAULT 'soft' CHECK (limit_type IN ('soft', 'hard')),
  last_alert_sent_at TIMESTAMPTZ,
  cached_usage_usd NUMERIC(12, 8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Alerts
CREATE TABLE budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  threshold NUMERIC(5, 2) NOT NULL,
  usage_at_alert NUMERIC(12, 2) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Row Level Security)

-- Users: users can only read their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_read_own ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- API Keys: users manage their own keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY api_keys_own ON api_keys
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Price Tiers: read-only for all authenticated users
ALTER TABLE price_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY price_tiers_read ON price_tiers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Requests: users can only see their own requests
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY requests_own ON requests
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Budgets: users manage their own budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY budgets_own ON budgets
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Budget Alerts: users manage their own alerts
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY budget_alerts_own ON budget_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_alerts.budget_id
      AND budgets.user_id = auth.uid()::text
    )
  );

-- Insert initial price data (Q1 2026 pricing)
INSERT INTO price_tiers (provider, model, input_price_per_1k, output_price_per_1k) VALUES
  -- OpenAI
  ('openai', 'gpt-4', 0.03, 0.06),
  ('openai', 'gpt-4-turbo', 0.01, 0.03),
  ('openai', 'gpt-3.5-turbo', 0.0005, 0.0015),
  ('openai', 'gpt-4o', 0.005, 0.015),
  ('openai', 'gpt-4o-mini', 0.00015, 0.0006),

  -- Anthropic
  ('anthropic', 'claude-3-opus', 0.015, 0.075),
  ('anthropic', 'claude-3-sonnet', 0.003, 0.015),
  ('anthropic', 'claude-3-haiku', 0.00025, 0.00125),
  ('anthropic', 'claude-3-5-sonnet', 0.003, 0.015),

  -- Google
  ('google', 'gemini-pro', 0.0005, 0.0015),
  ('google', 'gemini-ultra', 0.002, 0.008);
