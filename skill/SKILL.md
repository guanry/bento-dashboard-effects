---
name: bento-dashboard-effects
description: Vue3 零第三方库实现后台管理仪表盘的六种高级动效与六套设计主题。动效:①不等大 Bento Grid 拖拽重排(平滑让位、自动吸附)②模块点击原位放大(Shared Element Expand + 底部缩略条)③顶部筛选全局联动(指标数字滚动补间、图表平滑插值)④多图表悬停联动(同步高亮同一数据点 + 共用竖向参考线)⑤指标区滚动吸顶(滚动进度驱动连续收缩)⑥列表右侧详情抽屉(Master Detail + 键盘切换)。主题:暖调留白/强对比(主卡构图)/极简数据(胶囊图表)/氛围沉浸(玻璃 + 打破网格)/图卡内容(照片当主角)/深色,含主题感知布局与内容级变体。Use whenever the user mentions bento grid、可拖动模块网格/卡片、卡片拖拽排序、模块就地放大、expand in place、数字滚动/补间/tween、筛选联动、图表悬停联动/linked hover、滚动吸顶/sticky header、详情抽屉/master detail、设计主题/换肤/主题切换/设计令牌、dashboard 卡片动效 or 后台管理动效 — even if they don't name the exact technique. 引擎、渲染层、主题系统与全部构图已在真实项目完整回归,可整体复制。
---

# Bento 后台动效全家桶(六种)

六个动效共享一套**状态驱动哲学:改数据,浏览器动**。绝对定位 + transform/CSS transition 承担形变,JS 只负责状态与少量插值。全部已在真实项目(D:\后台管理模板\bento-drag)逐个浏览器回归。

| # | 动效 | 核心机制 | 详细文档 |
|---|---|---|---|
| 01 | 不等大 Bento 拖拽重排 | 格位求解器(空位引力 + 同尺寸换位 + 非法格位回退),CSS transition 让位 | references/drag-engine.md |
| 02 | 模块就地放大 | 同一矩形系统换矩形(主区 + 底部等比缩略条),内容层 scale | references/drag-engine.md |
| 03 | 顶部筛选全局联动 | useTweenNumber 数字补间 + 数据驱动图表插值(零 JS 动画) | references/global-filter.md |
| 04 | 图表悬停联动 | 共享 hover 索引(状态上移),同步 hot/dim + 竖向参考线 | references/linked-hover.md |
| 05 | 指标区滚动吸顶 | 滚动进度写 `--p` 变量,字号/间距 calc() 连续插值 | references/sticky-header.md |
| 06 | 列表右侧详情抽屉 | 宽度过渡压窄列表 + key 重渲染刷面板 + 键盘状态机 | references/master-detail.md |
| ⭐ | 设计主题系统(六套可切换) | 令牌覆盖层 + setGrid 主题感知布局 + 内容级变体(isContent) | references/themes.md |

## 快速开始(01 + 02)

1. 复制 `assets/useBentoGrid.js`、`assets/BentoGrid.vue`、`assets/bento.css` 到项目,全局引入 bento.css。
2. 定义卡片(格位坐标,不是像素):

```js
const grid = useBentoGrid([
  { id: 'venue', title: '场馆容量', x: 0, y: 0, w: 2, h: 1 },
  { id: 'throughput', title: '出杯量', x: 0, y: 1, w: 2, h: 2 },
  // ...满铺 cols×rows 效果最好
], { cols: 4, rows: 3, gap: 12 })
```

```vue
<BentoGrid :grid="grid" :views="{ venue: VenueCard, throughput: ThroughputCard }" />
```

3. 卡片组件规范:根元素 `height:100%` + flex;可选 `defineProps({ detail: Boolean })` 切换详情视图。

## 03–06 的公共资产与模式

- `assets/useTweenNumber.js` —— 任意数字滚动补间(rAF + easeOutCubic,自动清理)
- 多视图共存:App 层用标签切换 v-if/v-else-if 分支,各演示自带自己的主区(切走即卸载清理)
- 深色仪表盘的卡片样式基线:`.lh-card` / `.fd-card`(radius 16、#17171b 底、12.5px 标题),见各 reference

每个动效的关键代码、状态机与专有坑,先读对应 reference 再动手:

- **03**:数字补间 + 图表插值 + 记录表级联;分项之和必须等于总量 → references/global-filter.md
- **04**:共享 hover 索引 + 参考线 + dim;tooltip 只在指针所在图表 → references/linked-hover.md
- **05**:`--p` 变量 + calc 插值;`overflow-anchor: none` 与重测量归零两个坑 → references/sticky-header.md
- **06**:宽度过渡压窄 + 键盘状态机;Transition 后台卡住 → key 重渲染 → references/master-detail.md

## 设计主题系统(六套可切换,⭐)

**组件代码库不变,六套皮肤/构图/内容随 `data-theme` 切换**:暖调留白(奶油底 + 单琥珀)、强对比(深黑底 + 主卡构图 + 撞色)、极简数据(灰白底 + 胶囊图表)、氛围沉浸(雾面星云 + 玻璃卡 + 12×6 打破网格)、图卡内容(照片当主角 + 档案栏 + 单橙交互)。

1. `assets/theme.js`:reactive theme + `setTheme()` 写 `<html data-theme>` + localStorage。
2. 每套主题一个覆盖层(令牌重定义 + 组件覆盖),main.js 最后导入;组件只引用令牌。
3. 主题感知布局:`grid.setGrid(cols, rows, layoutList)` 切换网格规格与构图(卡片滑行变形);构图必须满铺(面积和 = cols×rows)。
4. 内容级变体:组件内 `isContent` computed 切换照片/详情/档案分支;照片用内联 SVG 分层风景(离线可用)。

令牌清单、构图规则、五个实测坑 → references/themes.md。

## 全项目必踩的坑(每条都实测踩过)

1. **满铺网格的中间格位常无解**:拖一格没反应先查是不是被正确拒绝,不是引擎坏了。
2. **`overflow-anchor: none`**:一切"滚动时收缩高度"的头部都必须加,否则滚动锚定回滚 scrollTop,收缩被抵消振荡。
3. **`<Transition>` 依赖 transitionend,后台标签页会永久卡住**:"状态变内容必变"的面板一律用 `:key` 重渲染 + 纯 CSS 动画。
4. **v-for 遍历 ref 数组不自动解包**:补间字段出 NaN 先查 `.value`。
5. **scoped 类名冲突**:一个组件里两个角色用同名类会互相覆盖,类名按角色前缀区分。
6. **Vite HMR 会漏掉脚本化连续写入的最后一条变更**:页面半新半旧时 `touch` 文件 + curl 确认服务端内容。
7. **后台标签页 rAF/定时器节流**:跟手/过渡类动画滞后属环境现象,格位/进度逻辑用事件实时值不受影响;跨调用读 DOM 会拿过期值,页面内采样才是裁判。
8. **给已有 `<script setup>` 的组件追加主题分支**:import 并入既有块——插入第二个 `<script setup>` 直接编译报错(SFC 只允许一个)。
9. **主题覆盖层先枚举真实类名再写规则**(曾漏掉 `.fd-tag` 导致标签仍是彩色);单色主题下彩色残留(时钟轴心、头像、品牌卡)逐视图截图清理。

## 验证

动效必须行为回归,不能只看截图。完整配方(合成 PointerEvent/MouseEvent/KeyboardEvent、各动效断言清单、环境坑)见 `references/verification.md`;01/02 算法逐段讲解见 `references/drag-engine.md`。
