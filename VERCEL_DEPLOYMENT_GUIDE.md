# Vercel 部署指南

**项目**: AI Cost Optimizer
**Vercel 项目**: https://vercel.com/rainbow686-8727/ai-api-price
**GitHub 仓库**: https://github.com/rainbow686/ai-api-price

---

## ⚠️ 当前状态

- ✅ Vercel 项目已创建
- ✅ GitHub 仓库已推送代码
- ❌ Vercel 未连接到 GitHub（API 限制）
- ❌ 部署未触发

---

## 📋 手动连接步骤（2 分钟）

### 步骤 1: 打开 Vercel 项目

访问：https://vercel.com/rainbow686-8727/ai-api-price

### 步骤 2: 连接 GitHub 仓库

1. 点击 **"Connect Git"** 或 **"Connect Repository"**
2. 选择 **GitHub**
3. 选择仓库：`rainbow686/ai-api-price`
4. 点击 **"Connect"**

### 步骤 3: 部署

连接后，Vercel 会自动触发部署。如果没有：

1. 进入项目页面
2. 点击 **"Redeploy"** 按钮
3. 等待部署完成

### 步骤 4: 查看部署状态

部署进行时，可以看到：
- **Build Status**: 构建状态
- **Deployment URL**: 部署后的网址

---

## 🔗 快速链接

| 服务 | 链接 |
|------|------|
| Vercel 项目 | https://vercel.com/rainbow686-8727/ai-api-price |
| Vercel 部署 | https://vercel.com/rainbow686-8727/ai-api-price/deployments |
| GitHub 仓库 | https://github.com/rainbow686/ai-api-price |
| Supabase | https://app.supabase.com/project/wpiqswsyepwravdgndje |

---

## 📝 环境变量确认

部署前确认以下环境变量已配置：

| 变量 | 值 |
|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wpiqswsyepwravdgndje.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (从 Supabase API 设置获取) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` (service_role key) |

检查位置：
1. Vercel 项目 → **Settings** → **Environment Variables**

---

## 🚀 部署完成后

1. 访问部署的 URL 测试首页
2. 访问 `/dashboard` 测试仪表板
3. 测试 Gateway 端点（需要先完成数据库迁移）

---

## ❓ 故障排查

### 部署失败

1. 查看 **Build Log** 找出错误
2. 检查环境变量是否配置正确
3. 确认 `package.json` 和 `next.config.js` 存在

### 数据库连接错误

1. 确认已运行数据库迁移（见 `SUPABASE_MIGRATION_GUIDE.md`）
2. 检查 Supabase URL 和 keys 是否正确

---

*最后更新：2026-03-19*
