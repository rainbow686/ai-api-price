# Design System — AI Cost Optimizer

## Product Context

- **What this is**: AI 成本优化 SaaS 工具，帮助中小企业和 AI 初创团队实时优化 AI API 支出
- **Who it's for**: 独立开发者、AI 初创团队（3-10 人）、CTO/技术决策者
- **Space/industry**: LLMOps / AI 基础设施，竞品包括 Portkey、Helicone、LangSmith
- **Project type**: Web App + Dashboard（数据密集型管理后台）

## Aesthetic Direction

- **Direction**: Modernist Minimal（现代极简主义）
- **Decoration level**: Minimal（最小化）
- **Mood**: 专业、高效、可信赖。让数据说话，避免装饰性元素干扰信息传达。产品应该像一台精密仪器，而非艺术品。
- **Reference sites**:
  - Portkey（企业级 SaaS 参考）
  - Helicone（干净的数据展示）
  - Vercel Dashboard（极简美学标杆）

## Typography

### Font Stack

| 角色 | 字体 | 理由 |
|------|------|------|
| **Display/Hero** | Satoshi | 现代几何无衬线，比 Inter 更有性格但不过度张扬，适合科技产品的专业感 |
| **Body** | DM Sans | 优秀的长文可读性，x-height 较高，小字号依然清晰 |
| **UI/Labels** | DM Sans（同 Body） | 减少字体加载，保持视觉一致性 |
| **Data/Tables** | JetBrains Mono | 等宽字体支持 tabular-nums，数字对齐完美，适合成本数据展示 |
| **Code** | JetBrains Mono | 开发者熟悉，代码片段展示一致 |

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Satoshi:wght@500;700;900&display=swap" rel="stylesheet">
```

### Type Scale

| 级别 | 值 | 应用场景 |
|------|-----|----------|
| 5xl | 56px / 3.5rem | Hero 主标题 |
| 4xl | 42px / 2.625rem | Page 标题 |
| 3xl | 32px / 2rem | Section 标题 |
| 2xl | 28px / 1.75rem | Card 数值 |
| xl | 24px / 1.5rem | Subsection 标题 |
| lg | 20px / 1.25rem | 小组件标题 |
| base | 16px / 1rem | 正文默认 |
| sm | 14px / 0.875rem | UI 标签、辅助文字 |
| xs | 13px / 0.8125rem | 表格文字、注释 |
| 2xs | 12px / 0.75rem | 徽章、极小文字 |

### Line Height

- Headings: 1.1 - 1.2（紧凑，增强视觉冲击）
- Body: 1.6 - 1.7（舒适阅读）
- Data: 1.5（平衡密度与可读性）

## Color

### Approach: Balanced

主色 + 辅色 + 语义色的平衡方案。色彩承担功能层级和信息分类的作用，而非纯装饰。

### Primary Palette — Emerald Green

代表"增长"、"节省"、"成功"，与竞品（蓝色系）形成差异化。

| Token | Hex | 使用场景 |
|-------|-----|----------|
| emerald-50 | #ECFDF5 | 成功状态背景 |
| emerald-100 | #D1FAE5 | 悬停背景 |
| emerald-200 | #A7F3D0 | 边框、分隔线 |
| emerald-300 | #6EE7B7 | 次要图形 |
| emerald-400 | #34D399 | 图表数据点 |
| **emerald-500** | **#10B981** | **主品牌色、Primary Button** |
| **emerald-600** | **#059669** | **Hover 状态、重要强调** |
| emerald-700 | #047857 | 深色模式主色 |
| emerald-800 | #065F46 | 文字强调 |
| emerald-900 | #064E3B | 深色背景 |

### Neutrals — Slate Gray（Cool Undertone）

| Token | Hex | 使用场景 |
|-------|-----|----------|
| slate-50 | #F8FAFC | 页面背景 |
| slate-100 | #F1F5F9 | Card 背景、悬停 |
| slate-200 | #E2E8F0 | 边框、分隔线 |
| slate-300 | #CBD5E1 | 禁用边框 |
| slate-400 | #94A3B8 | Placeholder |
| slate-500 | #64748B | 次要文字 |
| slate-600 | #475569 | 正文次级 |
| **slate-700** | **#334155** | **正文默认** |
| slate-800 | #1E293B | 标题 |
| slate-900 | #0F172A | 高对比文字 |

### Accent — Coral Orange

用于 CTA 和关键交互点，小面积使用形成视觉焦点。

| Token | Hex | 使用场景 |
|-------|-----|----------|
| coral-500 | #FF6B35 | 关键 CTA、重要通知 |
| coral-600 | #E85D2A | Hover 状态 |

### Semantic Colors

| 语义 | Token | Hex |
|------|-------|-----|
| **Success** | emerald-500 | #10B981 |
| **Warning** | amber-500 | #F59E0B |
| **Error** | red-500 | #EF4444 |
| **Info** | blue-500 | #3B82F6 |

### Dark Mode Strategy

- 表面色从 slate-50/white 切换至 slate-900/slate-800
- 主色饱和度降低 10-15%（emerald-500 → emerald-400）
- 边框对比度降低（slate-200 → slate-700）
- 文字对比度保持 WCAG AA 标准（至少 4.5:1）

## Spacing

- **Base unit**: 8px（与 TailwindCSS 对齐，开发者友好）
- **Density**: Comfortable（数据密集型产品需要呼吸空间）

### Scale

| Token | CSS | 使用场景 |
|-------|-----|----------|
| 2xs | 2px | 图标与文字间距、极小间隙 |
| xs | 4px | 紧凑组件内边距 |
| **sm** | **8px** | **表单组间距、小卡片内边距** |
| **md** | **16px** | **标准内边距、组件间距** |
| **lg** | **24px** | **Section 内边距、卡片间距** |
| **xl** | **32px** | **大 Section 间距** |
| **2xl** | **48px** | **页面 Section 间距** |
| **3xl** | **64px** | **Hero Section 上下边距** |

## Layout

- **Approach**: Grid-Disciplined（网格纪律）
- 数据密集型产品需要可预测的对齐和稳定的视觉结构

### Grid System

| Breakpoint | Columns | Gutter | Margin |
|------------|---------|--------|--------|
| Mobile (sm) | 4 | 16px | 16px |
| Tablet (md) | 8 | 24px | 24px |
| Desktop (lg+) | 12 | 24px | 32px |

### Max Content Width

- Dashboard/数据表格：1280px（最佳数据阅读宽度）
- Marketing 页面：1080px（舒适阅读体验）
- 全宽容器：100%（Hero、Footer）

### Border Radius（Hierarchical）

| Token | Value | 使用场景 |
|-------|-------|----------|
| sm | 4px | 徽章、小按钮、输入框 |
| **md** | **8px** | **卡片、标准按钮、模态框** |
| lg | 12px | 大卡片、面板 |
| xl | 16px | Hero 容器、大面板 |
| **full** | **9999px** | **头像、胶囊徽章、Toggle** |

### Shadow System

| Token | Value | 使用场景 |
|-------|-------|----------|
| sm | 0 1px 2px rgba(0,0,0,0.05) | 卡片默认 |
| md | 0 4px 12px rgba(0,0,0,0.08) | 卡片悬停、下拉菜单 |
| lg | 0 8px 24px rgba(0,0,0,0.12) | 模态框、Popover |
| xl | 0 16px 48px rgba(0,0,0,0.16) | Toast、重要浮层 |

## Motion

- **Approach**: Intentional（有意图的）
- 动效服务于功能理解，而非装饰。每个动画都应该帮助用户理解状态变化。

### Easing

| 类型 | Value | 使用场景 |
|------|-------|----------|
| enter | cubic-bezier(0.33, 1, 0.68, 1) / ease-out | 进入动画（从无到有） |
| exit | cubic-bezier(0.32, 0, 0.67, 0) / ease-in | 退出动画（从有到无） |
| move | cubic-bezier(0.65, 0, 0.35, 1) / ease-in-out | 位置变化、尺寸变化 |

### Duration

| Token | Range | 使用场景 |
|-------|-------|----------|
| micro | 50-100ms | 微小状态反馈（Toggle、Checkbox） |
| short | 150-250ms | 按钮、链接、小元素 |
| medium | 250-400ms | 卡片、面板、模态框 |
| long | 400-700ms | 页面过渡、复杂图表 |

### Motion Principles

1. **入场带动效**：所有新出现的元素使用 enter + short/medium
2. **状态变化有反馈**：Hover 100ms, Focus 150ms, Active 50ms
3. **减少视觉跳动**：使用 transform 而非 margin/padding 动画
4. **尊重用户偏好**：支持 `prefers-reduced-motion`，为敏感用户提供静态体验

## Component Patterns

### Buttons

```css
.btn-primary {
  background: var(--emerald-600);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.15s ease-out;
}

.btn-primary:hover {
  background: var(--emerald-700);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
```

### Cards

```css
.card {
  background: white;
  border: 1px solid var(--slate-200);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s ease-out;
}

.card:hover {
  border-color: var(--slate-300);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
```

### Data Tables

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 14px;
}

.data-table th {
  background: var(--slate-50);
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--slate-600);
  border-bottom: 1px solid var(--slate-200);
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--slate-100);
}

.data-table tr:hover {
  background: var(--slate-50);
}
```

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-18 | 选择 Emerald Green 而非蓝色 | 与竞品（Portkey/Helicone 均为蓝色）形成差异化，绿色代表"节省/成功"符合产品价值主张 |
| 2026-03-18 | 极简装饰级别 | 数据密集型产品需要减少视觉噪音，让信息成为主角 |
| 2026-03-18 | JetBrains Mono 作为数据字体 | 等宽特性确保数字对齐，对成本数据展示至关重要 |
| 2026-03-18 | 8px 间距基准 | 与 TailwindCSS 对齐，降低开发者认知负担 |
| 2026-03-18 | Intentional 动效策略 | 平衡功能性与情感化，避免过度动画干扰数据阅读 |

---

## Accessibility Standards

- **Contrast**: 所有文字对比度至少 WCAG AA（4.5:1），大文本 3:1
- **Focus**: 所有交互元素有清晰的 Focus 状态（3px emerald-500 outline）
- **Keyboard**: 完整键盘导航支持
- **Screen Reader**: 语义化 HTML + ARIA 标签

## File Structure

```
ai-api-price/
├── DESIGN.md              # 本文件，设计系统唯一来源
├── app/
│   ├── globals.css        # 全局样式，引入设计 Token
│   └── layout.tsx         # 布局组件
├── components/ui/         # 设计系统组件
│   ├── button.tsx
│   ├── card.tsx
│   ├── table.tsx
│   └── ...
└── lib/
    └── design-tokens.ts   # Design Token TypeScript 定义
```

---

*Created by /design-consultation on 2026-03-18*
*Based on competitive research: Portkey, Helicone, LangSmith*
