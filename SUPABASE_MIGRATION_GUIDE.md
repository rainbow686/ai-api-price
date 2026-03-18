# Supabase 数据库迁移指南

**项目**: AI Cost Optimizer
**Supabase 项目**: https://app.supabase.com/project/wpiqswsyepwravdgndje

---

## ⚠️ 当前状态

数据库表尚未创建，需要通过 SQL Editor 手动执行迁移。

---

## 📋 执行步骤

### 步骤 1: 打开 SQL Editor

访问：https://app.supabase.com/project/wpiqswsyepwravdgndje/sql/new

### 步骤 2: 复制并运行迁移脚本

打开项目中的文件 `supabase/migrations/001_initial_schema.sql`，复制全部内容，然后粘贴到 SQL Editor 中，点击 **Run** 执行。

或者，直接复制以下完整脚本：

```sql
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
```

### 步骤 3: 验证表已创建

运行以下查询验证：

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'api_keys', 'price_tiers', 'requests', 'budgets', 'budget_alerts');
```

应该返回 6 行。

### 步骤 4: 创建测试用户

```sql
INSERT INTO users (email) VALUES ('test@example.com')
RETURNING id, api_key;
```

**保存返回的 `id` 和 `api_key`！**

### 步骤 5: 添加 AI Provider API Keys

```sql
-- 将 <USER_ID> 替换为上面返回的用户 ID
INSERT INTO api_keys (user_id, provider, key) VALUES
  ('<USER_ID>', 'openai', 'sk-your-openai-key'),
  ('<USER_ID>', 'anthropic', 'sk-ant-your-anthropic-key'),
  ('<USER_ID>', 'google', 'your-google-key');
```

### 步骤 6: 设置预算

```sql
INSERT INTO budgets (user_id, monthly_limit_usd, limit_type)
VALUES ('<USER_ID>', 100.00, 'soft');
```

---

## ✅ 完成后的检查清单

- [ ] 6 个表已创建
- [ ] 12 条价格数据已插入
- [ ] 测试用户已创建
- [ ] AI Provider API Keys 已配置
- [ ] 预算已设置

---

## 🔗 快速链接

- **SQL Editor**: https://app.supabase.com/project/wpiqswsyepwravdgndje/sql/new
- **Table Editor**: https://app.supabase.com/project/wpiqswsyepwravdgndje/editor
- **API Settings**: https://app.supabase.com/project/wpiqswsyepwravdgndje/settings/api

---

*最后更新：2026-03-19*
