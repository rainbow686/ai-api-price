# Engineering Review — AI Cost Optimizer

*评审时间：2026-03-18*
*评审类型：MVP 架构评审 (Greenfield)*

---

## 一、技术栈决策

| 层级 | 技术 | 理由 |
|------|------|------|
| **框架** | Next.js 15 (App Router) | 边缘函数支持、Vercel 原生集成 |
| **数据库** | Supabase (PostgreSQL) | 零运维、免费额度高、Edge 缓存 |
| **部署** | Vercel | 零配置、边缘部署、Cron 支持 |
| **邮件** | Resend / SendGrid | 简单 API、免费额度充足 |
| **认证** | API Key (自定义) | 简单场景无需 OAuth |

**创新 Token 花费**：1/3 — 技术栈选择成熟方案，创新集中在产品功能

---

## 二、MVP 范围

### In Scope

```
┌─────────────────────────────────────────────────────────────┐
│                    MVP SCOPE                                 │
├─────────────────────────────────────────────────────────────┤
│  1. AI Gateway (Proxy 模式)                                 │
│     - 支持 OpenAI / Anthropic / Google                       │
│     - API Key 认证                                           │
│     - 流式响应支持                                           │
│     - 请求日志记录                                           │
│                                                              │
│  2. 成本追踪 Dashboard                                       │
│     - 实时成本展示                                           │
│     - 按模型/Provider 筛选                                   │
│     - 请求列表查看                                           │
│     - 90 天数据保留                                          │
│                                                              │
│  3. 预算预警                                                 │
│     - 月度预算设置                                           │
│     - 阈值通知 (50% / 80% / 100%)                           │
│     - 软/硬限制可选                                          │
│     - Cron 每 5 分钟检查                                      │
└─────────────────────────────────────────────────────────────┘
```

### NOT in scope

| 项目 | 理由 | 优先级 |
|------|------|--------|
| SDK 实现 | Proxy 模式已足够，SDK deferred 到 v2 | P2 |
| 实时预算检查 | Cron 5 分钟检查足够，降低请求延迟 | P2 |
| 价格历史 UI | 数据库存储但 MVP 不展示 | P3 |
| 分层日志存储 | 90 天清理足够，冷热分层过度设计 | P3 |
| 多区域部署 | 单 Vercel 区域足够 | P3 |
| 自托管选项 | 仅 SaaS 模式 | — |

---

## 三、架构决策记录

### 决策 1: 成本计算方式

**决策**：实时计算（每次查询时 SUM）

| 选项 | 优点 | 缺点 | 完成度 |
|------|------|------|--------|
| **A) 实时计算** ✅ | 数据准确、实现简单 | 大数据量时查询慢 | 9/10 |
| B) 预计算聚合 | 查询快 | 数据延迟、维护复杂 | 6/10 |

**Rationale**：MVP 阶段数据量小 (<100k requests/月)，实时计算更简单且准确。可在 10k requests/月后再优化。

---

### 决策 2: 预算超支处理

**决策**：可配置（用户选择软/硬限制）

| 选项 | 优点 | 缺点 | 完成度 |
|------|------|------|--------|
| A) 软限制 | 不中断业务 | 可能欠费 | 7/10 |
| B) 硬限制 | 完全控制成本 | 可能中断业务 | 7/10 |
| **C) 可配置** ✅ | 灵活性高 | 实现稍复杂 | 10/10 |

**Rationale**：不同用户有不同需求 — 独立开发者可能想要硬限制，企业可能想要软限制。这是核心功能，值得做完整。

---

### 决策 3: 日志存储策略

**决策**：90 天自动清理

| 选项 | 优点 | 缺点 | 完成度 |
|------|------|------|--------|
| A) 无限存储 | 完整历史 | 成本高 (Supabase 500MB 限制) | 5/10 |
| **B) 90 天清理** ✅ | 成本可控、符合行业惯例 | 用户无法查看历史 | 9/10 |
| C) 分层存储 | 平衡成本和可用性 | 架构复杂 | 7/10 |

**Rationale**：90 天对于大多数用户足够，企业版可提供无限存储。

---

### 决策 4: Gateway 错误处理

**决策**：细粒度错误码

```typescript
class GatewayError extends Error {
  code: 'AUTH_FAILED' | 'PROVIDER_ERROR' | 'BUDGET_EXCEEDED' | 'RATE_LIMITED';
  statusCode: number;
}
```

| 选项 | 优点 | 缺点 | 完成度 |
|------|------|------|--------|
| A) 粗粒度 | 实现简单 | 用户调试困难 | 5/10 |
| **B) 细粒度** ✅ | 用户友好、易于调试 | 实现稍复杂 | 10/10 |

**Rationale**："Explicit over clever" — 清晰的错误信息对于 API 产品至关重要。

---

### 决策 5: 价格数据存储

**决策**：数据库存储（Supabase）

| 选项 | 优点 | 缺点 | 完成度 |
|------|------|------|--------|
| A) 硬编码 | 实现最简单 | 价格变化需重新部署 | 5/10 |
| **B) 数据库** ✅ | 可后台更新、支持历史 | 需要管理表 | 9/10 |
| C) 外部 API | 实时准确 | 依赖外部、不稳定 | 6/10 |

**Rationale**：价格变化无需重新部署，可后台管理更新，支持价格历史追踪。

---

### 决策 6: 预算检查时机

**决策**：仅 Cron 检查（每 5 分钟）

| 选项 | 优点 | 缺点 | 完成度 |
|------|------|------|--------|
| A) 每次请求检查 | 实时 | 增加请求延迟 | 7/10 |
| **B) 仅 Cron** ✅ | 不影响请求性能 | 有 5 分钟延迟 | 9/10 |
| C) 混合 | 平衡 | 实现复杂 | 8/10 |

**Rationale**：5 分钟延迟对于预算通知可接受，不增加请求路径延迟。

---

### 决策 7: 测试覆盖率标准

**决策**：严格（关键模块 100% + 整体 85%）

| 模块 | 覆盖率目标 |
|------|------------|
| `cost-calculator.ts` | 100% |
| `budget-check.ts` | 100% |
| `proxy.ts` | 90% |
| `email/` | 80% |

**Rationale**："Well-tested code is non-negotiable" — 成本产品如果计费出错，用户会立即流失。

---

### 决策 8: 性能优化时机

**决策**：分阶段

| 阶段 | 内容 | 触发条件 |
|------|------|----------|
| **现在** | 基础数据库索引 | MVP 开发 |
| **阶段 2** | Redis 缓存层 | 1k DAU |
| **阶段 3** | 查询优化/分表 | 100k requests/月 |

**Rationale**："Make the change easy, then make the easy change" — 基础索引成本低收益高，缓存等有需要再做。

---

## 四、数据模型

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  api_key UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (Provider Credentials)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure')),
  key TEXT NOT NULL,  -- Encrypted
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Price Tiers
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
CREATE INDEX idx_price_tiers_current ON price_tiers(model, provider) WHERE effective_to IS NULL;

-- Requests (Gateway Logs)
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd NUMERIC(12, 8) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'timeout')),
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_requests_user_timestamp ON requests(user_id, timestamp DESC);
CREATE INDEX idx_requests_timestamp ON requests(timestamp DESC);
CREATE INDEX idx_requests_provider ON requests(provider);

-- Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monthly_limit_usd NUMERIC(12, 2) NOT NULL,
  alert_thresholds JSONB DEFAULT '[0.5, 0.8, 1.0]',
  limit_type TEXT DEFAULT 'soft' CHECK (limit_type IN ('soft', 'hard')),
  last_alert_sent_at TIMESTAMPTZ,
  last_calculated_at TIMESTAMPTZ,
  cached_usage_usd NUMERIC(12, 8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_budgets_user ON budgets(user_id);

-- Budget Alerts Log
CREATE TABLE budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  threshold NUMERIC(5, 4) NOT NULL,  -- 0.5, 0.8, 1.0
  usage_at_alert NUMERIC(12, 8) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 五、系统架构

```
┌──────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────┐         ┌─────────────────────────────────────┐    │
│   │  User App   │         │           AI Cost Optimizer          │    │
│   │             │         │  ┌─────────────────────────────────┐ │    │
│   │  fetch(     │         │  │      Edge Function (Proxy)      │ │    │
│   │   'https:// │─────────▶│  │                                 │ │    │
│   │   gateway.  │         │  │  1. Auth (API Key)              │ │    │
│   │   aico.io'  │         │  │  2. Fetch Provider Key (DB)     │ │    │
│   │             │         │  │  3. Check Budget (Cached)       │ │    │
│   │             │         │  │  4. Forward to Provider         │ │    │
│   │             │         │  │  5. Stream Response             │ │    │
│   │             │         │  │  6. Log Request (Async)         │ │    │
│   │             │         │  └──────────────┬──────────────────┘ │    │
│   └─────────────┘         │                 │                     │    │
│                           │                 ▼                     │    │
│                           │  ┌─────────────────────────────────┐ │    │
│                           │  │      Supabase (PostgreSQL)      │ │    │
│                           │  │  - users / api_keys             │ │    │
│                           │  │  - requests (logs)              │ │    │
│                           │  │  - budgets / price_tiers        │ │    │
│                           │  └──────────────┬──────────────────┘ │    │
│                           └─────────────────┼─────────────────────┘    │
│                                             │                          │
│                           ┌─────────────────▼─────────────────────┐    │
│                           │      Vercel Cron (Every 5 min)        │    │
│                           │  ┌─────────────────────────────────┐  │    │
│                           │  │  Budget Monitor Function        │  │    │
│                           │  │  1. Calculate usage per user    │  │    │
│                           │  │  2. Check against thresholds    │  │    │
│                           │  │  3. Send email alerts           │  │    │
│                           │  │  4. Update cached_usage         │  │    │
│                           │  └─────────────────────────────────┘  │    │
│                           └─────────────────┬─────────────────────┘    │
│                                             │                          │
│                           ┌─────────────────▼─────────────────────┐    │
│                           │         Email Service                 │    │
│                           │      (Resend / SendGrid)              │    │
│                           └───────────────────────────────────────┘    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 六、核心数据流

### 6.1 Gateway Proxy Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GATEWAY REQUEST FLOW                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  HAPPY PATH:                                                         │
│  ────────────                                                        │
│  1. User App ──▶ POST /v1/chat/completions                          │
│  2. Gateway ──▶ Validate API Key (from header)                       │
│  3. Gateway ──▶ Fetch user's API key from Supabase                  │
│  4. Gateway ──▶ Check budget (cached usage)                          │
│  5. Gateway ──▶ Forward to Provider (OpenAI/Anthropic)              │
│  6. Gateway ──▶ Stream response back to User App                    │
│  7. Gateway ──▶ Log request to Supabase (background, non-blocking)  │
│                                                                      │
│  NIL PATH (missing API key):                                         │
│  ───────────────────────                                             │
│  → Return 401 immediately, log attempt                               │
│                                                                      │
│  EMPTY PATH (invalid provider key):                                  │
│  ─────────────────────────────                                       │
│  → Return 400 with clear error message                               │
│                                                                      │
│  ERROR PATH (provider timeout):                                      │
│  ───────────────────────                                             │
│  → Return 502, retry 2x with backoff, log full context               │
│                                                                      │
│  ERROR PATH (budget exceeded + hard limit):                          │
│  ───────────────────────────────────────                             │
│  → Return 429 with "Budget exceeded" message                         │
│                                                                      │
└───────────────────────────────────────────────────────────────────────┘
```

### 6.2 Budget Alert Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                   BUDGET ALERT FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TRIGGER: Every 5 minutes (Vercel Cron)                             │
│                                                                      │
│  1. Fetch all active budgets                                        │
│  2. For each budget:                                                │
│     a. SUM(requests.cost_usd) WHERE timestamp >= date_trunc('month')│
│     b. usage_ratio = usage / monthly_limit                          │
│     c. Check against thresholds [0.5, 0.8, 1.0]                     │
│     d. If threshold crossed AND not alerted before:                 │
│        - Send email to user                                         │
│        - Insert budget_alerts record                                │
│        - Update last_alert_sent_at                                  │
│     e. Update cached_usage_usd                                      │
│                                                                      │
│  FAILURE MODES:                                                      │
│  - Cron fails → alerts delayed (acceptable, not critical)           │
│  - Email fails → log error, retry next cycle                        │
│  - DB query timeout (>10s) → fail gracefully, log error             │
│                                                                      │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 七、项目结构

```
ai-api-price/
├── app/
│   ├── api/
│   │   ├── gateway/
│   │   │   └── [provider]/
│   │   │       └── route.ts       # Proxy 逻辑
│   │   ├── dashboard/
│   │   │   └── route.ts           # Dashboard 数据 API
│   │   └── webhooks/
│   │       └── resend/
│   │           └── route.ts
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # 成本概览
│   │   ├── budgets/
│   │   │   └── page.tsx           # 预算设置
│   │   └── requests/
│   │       └── page.tsx           # 请求列表
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase 客户端
│   │   └── types.ts               # Database types
│   ├── gateway/
│   │   ├── proxy.ts               # Proxy 核心逻辑
│   │   ├── cost-calculator.ts     # 成本计算
│   │   └── budget-check.ts        # 预算检查
│   ├── budget/
│   │   └── monitor.ts             # Cron 预算监控
│   └── email/
│       └── send-alert.ts          # 邮件发送
├── components/
│   ├── dashboard/
│   │   ├── cost-chart.tsx
│   │   ├── budget-form.tsx
│   │   └── request-table.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── utils/
│   └── cron.ts                    # Vercel Cron 定义
├── DESIGN.md
└── docs/
    ├── competitive-analysis.md
    └── engineering-review.md      # 本文件
```

---

## 八、测试策略

### 8.1 测试覆盖图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TEST COVERAGE MAP                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  UNIT TESTS (Vitest):                                               │
│  ──────────────                                                      │
│  [ ] lib/gateway/cost-calculator.test.ts                            │
│      ├── calculateCost(model, inputTokens, outputTokens)            │
│      ├── 正常场景：GPT-4 100+50 tokens → $0.005                     │
│      ├── 边界场景：0 tokens → $0                                   │
│      ├── 边界场景：未知模型 → throw UnknownModelError               │
│      └── 数据驱动：覆盖所有支持模型                                  │
│                                                                      │
│  [ ] lib/gateway/budget-check.test.ts                               │
│      ├── checkBudget(userId) — 未超预算                             │
│      ├── checkBudget(userId) — 达到 50% 阈值                        │
│      ├── checkBudget(userId) — 达到 100% (软限制)                   │
│      ├── checkBudget(userId) — 达到 100% (硬限制) → throw           │
│      └── 边界：无预算设置 → 允许通过                                 │
│                                                                      │
│  [ ] lib/gateway/proxy.test.ts                                      │
│      ├── 转发请求到 OpenAI — 成功                                   │
│      ├── 转发请求到 Anthropic — 成功                                │
│      ├── API Key 无效 → 401                                         │
│      ├── Provider 超时 → 502                                        │
│      └── Stream 模式 — 正确处理流式响应                             │
│                                                                      │
│  INTEGRATION TESTS:                                                 │
│  ──────────────────                                                  │
│  [ ] tests/integration/gateway.integration.test.ts                  │
│      ├── 完整的请求流程：Auth → Forward → Log → Response            │
│      ├── 并发请求 — 预算计算准确                                    │
│      └── Budget 超支后新请求被拒绝（硬限制）                        │
│                                                                      │
│  [ ] tests/integration/budget-alert.integration.test.ts             │
│      ├── Cron 触发 → 检测阈值 → 发送邮件                            │
│      └── 同一周期内不重复发送                                       │
│                                                                      │
│  E2E TESTS (Playwright):                                            │
│  ────────────────                                                    │
│  [ ] tests/e2e/dashboard.e2e.test.ts                                │
│      ├── Dashboard 加载 — 显示成本图表                              │
│      ├── 预算设置 — 表单提交成功                                    │
│      └── 请求列表 — 分页和筛选                                      │
│                                                                      │
└───────────────────────────────────────────────────────────────────────┘
```

### 8.2 覆盖率目标

| 模块 | 覆盖率目标 | 理由 |
|------|------------|------|
| `cost-calculator.ts` | 100% | 核心计费逻辑，不能有误差 |
| `budget-check.ts` | 100% | 直接关系成本控制 |
| `proxy.ts` | 90% | Stream 处理难 100%，关键路径必须覆盖 |
| `email/` | 80% | 邮件发送失败可接受（有重试） |

---

## 九、性能目标

| Path | p99 目标 | 关键指标 |
|------|----------|----------|
| Gateway Request | <100ms 额外延迟 | Auth<5ms, DB<20ms, Budget<5ms |
| Dashboard Load | <500ms | 成本查询<100ms, 列表<200ms |
| Budget Cron | <30s 完成 | 批量查询 + 并发发送 |

### 索引策略

```sql
-- 第一阶段（MVP 开发时创建）
CREATE INDEX idx_requests_user_timestamp ON requests(user_id, timestamp DESC);
CREATE INDEX idx_requests_timestamp ON requests(timestamp DESC);
CREATE INDEX idx_requests_provider ON requests(provider);
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE UNIQUE INDEX idx_api_keys_user_provider ON api_keys(user_id, provider);
```

---

## 十、Failure Modes Registry

| Codepath | Failure Mode | Rescued? | Test? | User Sees? | Logged? |
|----------|--------------|----------|-------|------------|---------|
| Gateway Auth | Invalid API key | ✅ 401 | ✅ | "Invalid API key" | ✅ |
| Gateway Forward | Provider timeout | ✅ 502 + 2x retry | ✅ | "Provider temporarily unavailable" | ✅ |
| Gateway Forward | Provider key expired | ✅ 401 | ✅ | "Provider credentials invalid" | ✅ |
| Gateway Forward | Rate limited | ✅ 429 + backoff | ✅ | "Rate limited, retry later" | ✅ |
| Budget Check (cron) | DB query timeout | ⚠️ Log only | ✅ | Nothing (next cycle) | ✅ |
| Budget Alert Email | Email send fails | ⚠️ Log only | ✅ | Nothing (next cycle) | ✅ |
| Cost Calculator | Unknown model | ✅ Error | ✅ | "Model not supported" | ✅ |
| Cost Calculator | Price not found | ✅ Fallback to cache | ✅ | Nothing (uses cached price) | ✅ |

**Critical Gaps**: 0 — 所有失败模式都有 error handling 和测试覆盖

---

## 十一、TODOs for Future

| ID | TODO | Priority | Effort | Depends on |
|----|------|----------|--------|------------|
| 1 | 价格变化监控系统 | P2 | M | — |
| 2 | 成本数据导出 (CSV/Excel) | P2 | S | — |
| 3 | API 使用量排行榜 | P2 | S | — |
| 4 | 智能路由（多 Provider 自动选择） | P1 | L | Gateway 稳定 |
| 5 | 团队协作功能 | P3 | L | 单用户验证后 |

---

## 十二、下一步行动

1. **环境搭建** (~15 min / CC: ~5 min)
   - [ ] 创建 Supabase 项目
   - [ ] 创建 Vercel 项目
   - [ ] 配置环境变量
   - [ ] 运行数据库迁移

2. **Gateway 核心开发** (~2h / CC: ~30 min)
   - [ ] 实现 Proxy 路由
   - [ ] 实现成本计算
   - [ ] 实现请求日志

3. **Dashboard 开发** (~2h / CC: ~30 min)
   - [ ] 成本图表组件
   - [ ] 请求列表组件
   - [ ] 预算设置表单

4. **Budget Cron 开发** (~1h / CC: ~15 min)
   - [ ] 实现监控函数
   - [ ] 配置 Vercel Cron
   - [ ] 集成邮件发送

5. **测试编写** (~2h / CC: ~30 min)
   - [ ] 单元测试
   - [ ] 集成测试
   - [ ] E2E 测试

6. **上线准备** (~1h / CC: ~15 min)
   - [ ] 域名配置
   - [ ] 监控告警
   - [ ] 文档编写

**预计总时间**: ~8.5h human / ~2h CC+gstack

---

*评审完成时间：2026-03-18*
*下一步：开始 MVP 实现*
