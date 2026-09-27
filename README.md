<div align="center">

# 🧩 bento-dashboard-effects

**六种后台动效 × 六套设计主题 · Vue3 零第三方库**

*Six dashboard motion effects × Six design themes — pure Vue 3, zero third-party animation libs*

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

**演示视频 · Demos → [docs/](docs/)**

</div>

---

## 中文

一套完整落地、逐项回归过的后台仪表盘动效方案,以及承载它的六套可切换设计主题。
不依赖 SortableJS / Muuri / GSAP —— 一套自研 Bento 引擎 + CSS 过渡 + 设计令牌, gzip 后 JS 仅 45KB。

### ✨ 六种动效

| # | 动效 | 亮点 |
|---|---|---|
| 01 | **可拖动模块网格** | 不等大 Bento Grid,拖拽时其余模块**平滑让位**(空位引力算法),松手自动吸附最近有效格位 |
| 02 | **模块就地放大** | 点击卡片 Shared Element Expand 铺满主区,其余缩为底部缩略条,点缩略图切换、沿原路收回 |
| 03 | **顶部筛选全局联动** | 指标数字 rAF 滚动补间、图表数据平滑插值,不整页刷新 |
| 04 | **图表悬停联动** | 三张图表同步高亮同一数据点,其余降透明度,共用竖向参考线 |
| 05 | **指标区滚动吸顶** | 滚动进度驱动字号与间距连续收缩,收成单行贴顶,反向连续还原 |
| 06 | **列表右侧详情抽屉** | Master Detail:列表压窄保持可见、当前行高亮、键盘 ↑/↓ 只刷面板 |

### 🎨 六套设计主题

| 主题 | 气质 |
|---|---|
| 🌅 暖调留白 | 奶油底 + 白卡 + 单一琥珀重点 |
| 🌑 深色 | 深色底 + 彩色卡面(默认) |
| 🔥 强对比 | 深黑底 + 超大主卡 + 高饱和撞色(主题感知布局) |
| 📊 极简数据 | 灰白底 + 墨色胶囊图表 + 单一黄绿 |
| 🌌 氛围沉浸 | 雾面星云 + 磨砂玻璃 + 12×6 打破网格 |
| 🖼 图卡内容 | 真实图片当主角 + 档案栏 + 单橙交互(内容级变体) |

主题不只是换色:**强对比/沉浸/图卡**三套携带自己的专属布局构图,图卡主题还会把卡片内容替换成照片与行程面板(`isContent` 内容级变体)。

### 📦 使用

**作为 ZCode / AI 技能安装**(推荐):

```bash
# 把 skill/ 目录复制到技能目录
cp -r skill ~/.agents/skills/bento-dashboard-effects
```

技能内含六种动效的完整引擎代码、逐段讲解与全部实测踩坑记录,新会话里提到「bento 网格 / 拖拽重排 / 滚动吸顶 / 详情抽屉」等会自动触发。

**运行演示项目**:

```bash
cd demo
npm install
npm run dev   # http://localhost:5173
```

### 🧠 它是怎么做的(三篇核心机制)

- **拖拽让位的灵魂**:布局求解器 —— [skill/references/drag-engine.md](skill/references/drag-engine.md)
- **所有动效的底层**:绝对定位 + transform + CSS 过渡,JS 只改数据 —— [skill/SKILL.md](skill/SKILL.md)
- **主题系统**:语义令牌覆盖层 + `setGrid` 主题感知布局 + `isContent` 内容级变体 —— [skill/references/themes.md](skill/references/themes.md)

### 📁 目录结构

```
├── skill/      技能本体(SKILL.md + 引擎资产 + 机制文档)
├── demo/       Vue3 + Vite 演示项目(六动效 × 六主题)
├── docs/       演示视频与动图
└── posts/      各渠道推文草稿
```

---

## English

A production-tested motion toolkit for admin dashboards, plus six switchable design themes that carry it.
No SortableJS / Muuri / GSAP — one custom Bento engine + CSS transitions + design tokens, **45KB JS gzipped**.

**Six effects**: drag-to-rearrange Bento grid with smooth yielding & snapping · in-place expand (shared element) with thumbnail bar · global filter with number tweening · linked chart hover with shared reference line · scroll-progress sticky header · master-detail drawer with keyboard navigation.

**Six themes**: Warm & Spacious · Dark · Bold Contrast (hero-card layout) · Minimal Data (capsule charts) · Immersive Mood (glassmorphism, broken grid) · Content First (photo cards, content-level variants).

**Install as an AI skill**: copy `skill/` into `~/.agents/skills/bento-dashboard-effects/`.
**Run the demo**: `cd demo && npm install && npm run dev`.

Mechanism docs live in [skill/references/](skill/references/) (Chinese) — the drag solver, scroll-anchor pitfalls and transition-in-background-tab workarounds are all documented with reproduction steps.

## License

[MIT](LICENSE) © 2026 bento-dashboard-effects contributors
