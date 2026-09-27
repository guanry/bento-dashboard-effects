# 引擎实现细节:useBentoGrid

`assets/useBentoGrid.js` 是经过完整回归验证的最终实现,直接复制使用。本文解释每段为什么这样写——改需求时按这里的推理改,不要凭感觉改。

## 数据模型

```
卡片: { id, title, x, y, w, h }   // x/y/w/h 都是格位单位,不是像素
布局: layout = ref(卡片数组)        // 整体替换,触发重渲染
格系: cols × rows + gap(像素间隙);cell.w/h 由容器实测尺寸均分
```

容器实测用 ResizeObserver(`watch(gridEl)`),`cell.w = (width - gap*(cols-1)) / cols`。所有像素换算集中在 `sizeOf(c)` 和 `styleFor(c)`。

## 布局求解器(computeLayout)——拖拽手感的灵魂

函数签名:`computeLayout(dragged) → 布局数组 | null`。语义:"把 dragged 放到它的 x/y,其余卡片让位,求一个合法布局"。

规则(按顺序):

1. **先放被拖卡片**,占据其所有格子(occupancy 数组)。
2. **其余卡片按阅读顺序(y 优先,再 x)依次就位**。放得下就原位不动——这是"最小位移"的基础。
3. **放不下的卡片(与已占格子重叠)找新家**,打分公式:

```js
score = (x - 卡片当前x)² + (y - 卡片当前y)²     // 自己少动
      + 2 * ((x - hole.x)² + (y - hole.y)²)     // 空位引力:向被拖卡片留下的空位靠拢
```

**为什么需要空位引力**:只有第一项时,被挤的卡片倾向斜着挪一格而不是流向空位,连锁让位会出现"绕路重排"(实测:AI 卡滑一格,另外两张小卡被推到对角)。
**同尺寸换位规则**:被挤卡片与被拖卡片 w/h 完全相同时,直接放进空位(空位必然空闲)——这保证"拖走再拖回"能精确还原,大小卡互换是最自然的语义。
4. **任何一张卡找不到家 → 返回 null**。调用方不硬塞,而是换下一个候选格位。

### 非法格位与最近有效吸附(applyTarget)

网格满铺时,某些格位在几何上无解:例如 4×3 全占满时,把一张 2×1 的卡拖到中间 (1,0),它原来的空位加上其余卡的形状无法重新铺满(剩余 8 格放不下 10 格的卡)。**必须拒绝这类格位**,否则出现重叠或空洞。

做法:以期望格位 (tx,ty) 为圆心,把所有候选格位按距离排序,逐个尝试 `computeLayout`,第一个返回非 null 的胜出。这样指针停在任何位置都有确定吸附点,即"自动吸附到最近格位"。

**确定性**:求解器读取的是 `originLayout`(拖拽开始时的快照),不是当前布局。布局 = f(落点格位),与拖拽路径无关——来回升拖结果一致,不会因中途扫过的格位留下"残留位移"。

## 指针状态机

```
pointerdown(卡片) → pending{grabX/Y, x0/y0},监听 window move/up
  → move 距离 ≥ 5px → startDrag(避免吃掉卡片内按钮的点击)
  → pointerup(未达阈值) → onPendingEnd,一切归零

startDrag:快照 originLayout、记录 grab 偏移、target=origin、reflows=0,
          body 加 is-bento-dragging(全局 grabbing 光标),启动 rAF tick
pointermove:onMove 里更新 pointer、vx(速度,给倾斜用)、刷新 rectCache,然后 applyTarget
tick(rAF):pos 向 pointer 插值(k=0.35)→ 跟手弹性;tilt 向 clamp(vx) 收敛 → 惯性倾斜;vx 衰减
pointerup:进入 releasing 态(480ms),卡片从指针位置用 CSS 过渡吸附进格位,随后归位 z-index
```

要点:

- **拖拽中卡片禁用 CSS transition**(`.dragging` 只留 box-shadow),位置由 rAF 插值接管;其余卡片保持 transition——"被拖的跟手,被让的顺滑"。
- **applyTarget 用 pointer 实时坐标**而不是插值后的 pos:让位判定要即时,跟手渲染可以滞后。
- **点击与拖拽的界线**:5px 位移阈值 + `lastDragEnd` 时间戳(松手后 200ms 内的 click 忽略),保证拖完不误触发展开、点击不残留拖拽。

## 就地展开(Shared Element Expand)

状态只有一个:`view.expandedId`。布局变化全部由 `expandRects` computed 求出:

- 被展开卡片 → `{x:0, y:0, w:网格宽, h:网格高 - gap - thumbH}`
- 其余卡片按阅读顺序排成底部缩略条:**每张保留自身宽高比**,thumbH 先取 112px,若总宽超出网格宽则 `thumbH = (W - gap*(n-1)) / Σ(宽高比)`

`styleFor` 在展开态直接输出矩形;因为卡片的 transition 覆盖 transform/width/height,**框架形变是自动的**,这就是"从原位置放大"——不需要 FLIP 测量。

内容清晰度:`innerStyleFor` 三态

| 状态 | 内容层样式 |
|---|---|
| 网格态 | 原始像素尺寸(与框架重合) |
| 缩略态 | 原始像素尺寸 + `scale(thumbH/卡片高)`,transformOrigin 0 0 → 缩略图是完整组件等比缩小,清晰不挤压 |
| 展开态 | width/height 100%,组件内部用 `detail` prop 切换详情布局 |

配套细节:

- 卡片组件声明 `defineProps({ detail: Boolean })`,`detail` 时渲染详情模板(参考项目里出卡量卡:统计头 + 14 天图表 + 悬停 tooltip)。
- 详情内容用 `bento-detail-in` 动画延迟 0.1s 淡入,掩盖形变过程中的内容切换。
- 关闭:右上角悬浮 ✕(closeStyle 用 translate3d 定位,带同曲线 transition,形变时跟着走)+ Esc(`window keydown` 监听,composable 卸载时移除)。
- **展开态禁用拖拽**(`onCardPointerDown` 首行 return),缩略图与卡片点击走 `onCardClick`(切换/展开)。

## 自定义卡片规范

1. 根元素 `height: 100%`,布局用 flex,内容区尽量 `flex:1` 自适应——同一组件要跑在小卡、缩略、大详情三种尺寸下。
2. 颜色/圆角写在卡片 scoped 样式;框架相关的(定位、过渡、圆角裁切)由 bento.css 负责,卡片根不要设 border-radius。
3. 图表类内容:柱状图用 div flex 排布(高度百分比),波浪/地图用 `preserveAspectRatio="none"` 的 SVG 拉伸。
4. 卡片内的悬停 tooltip 锚定在柱子所在列(`position:absolute` 于列,`bottom: calc(柱高% + 12px)`),不要用全局百分比估算。

## HUD(可选但强烈建议保留)

右上角固定面板实时输出 网格规格 / 视图 / 缩略数 / 拖拽对象 / 重排次数。它是开发期调试器和演示时的"技术感"来源,成本几乎为零。
