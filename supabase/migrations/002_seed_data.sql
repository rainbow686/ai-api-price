-- ============================================
-- AI Cost Optimizer - 数据插入示例
-- ============================================
-- 这个文件用于演示如何正确插入测试数据
-- 在 Supabase SQL Editor 中运行

-- 1. 创建测试用户并获取 UUID
INSERT INTO users (email)
VALUES ('test@example.com')
RETURNING id, api_key;

-- 假设返回的 id 是：550e8400-e29b-41d4-a716-446655440000
-- 复制上面的 id，然后运行下面的插入语句

-- 2. 添加 Provider API Keys
-- 将 <USER_UUID> 替换为上面返回的实际 UUID
INSERT INTO api_keys (user_id, provider, key) VALUES
  ('<USER_UUID>::uuid', 'openai', 'sk-your-openai-key-here'),
  ('<USER_UUID>::uuid', 'anthropic', 'sk-ant-your-anthropic-key-here'),
  ('<USER_UUID>::uuid', 'google', 'your-google-api-key-here');

-- 3. 设置测试预算
INSERT INTO budgets (user_id, monthly_limit_usd, limit_type) VALUES
  ('<USER_UUID>::uuid', 100.00, 'soft');

-- ============================================
-- 单条语句版本 (逐个运行)
-- ============================================

-- 步骤 1: 创建用户
INSERT INTO users (email) VALUES ('test@example.com');

-- 步骤 2: 查询用户 ID
SELECT id, email, api_key FROM users WHERE email = 'test@example.com';

-- 步骤 3: 使用实际返回的 UUID 插入 API keys (替换下面的 UUID)
INSERT INTO api_keys (user_id, provider, key)
VALUES (
  '从上面查询获得的 id',  -- 例如：'550e8400-e29b-41d4-a716-446655440000'
  'openai',
  'sk-your-openai-key'
);
