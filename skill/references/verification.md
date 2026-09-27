# 浏览器验证配方

这类动效"看起来对"不等于"逻辑对"——形变是 CSS 过渡,逻辑错误往往被动画掩盖。每次改完引擎必须跑一轮行为回归。使用 browser-use 的 control-browser 技能打开本地 dev server 后,按下文配方用**合成事件**驱动交互(不依赖真实鼠标)。

## 准备

```
viewport 设为 1440×900;goto 后等 domcontentloaded + ~700ms(等 ResizeObserver 首次测量)
```

合成事件的通用前提:引擎的 move/up 监听在 `window` 上,`pointerdown` 派发到卡片元素即可:

```js
// 拖拽:down 在卡片中心 → move/up 派发到 window
card.dispatchEvent(new PointerEvent('pointerdown', {
  bubbles: true, pointerId: 9, button: 0, clientX: sx, clientY: sy }));
window.dispatchEvent(new PointerEvent('pointermove', {
  bubbles: true, pointerId: 9, clientX, clientY }));   // 分 10+ 步插值,每步 sleep 35ms
window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 9 }));
```

```js
// 点击(展开/缩略切换):直接派发 click
card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
// 柱状图悬停:mouseenter 不冒泡,直接派发到列元素
col.dispatchEvent(new MouseEvent('mouseenter'));
// 收起
window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
```

注意:h3 的显示大写是 CSS `text-transform`,**textContent 是原始大小写**——按标题找卡片时用 `includes/startsWith` 忽略大小写,别用全等大写。

## 拖拽回归清单

用 `card.style.transform` 读回格位(除以 stepX/stepY 得格子坐标),HUD innerText 读 reflow 计数:

1. **换位**:拖 A(大卡)到 B(同尺寸)格位 → A 到 B 位,B 精确回到 A 的原位,其余卡 transform 不变,reflow ≥ 1。
2. **还原**:把 A 拖回原位 → 所有卡片回到初始 transform。
3. **非法格位回退**:把 2×1 的卡拖到中间格(如 4×3 满铺时的 (1,0))→ 布局不变(reflow 不增),卡片吸回最近有效位。**这不是 bug**,是满铺几何下的无解格位。
4. **拖拽不触发展开**:拖拽后 `document.querySelector('.bento-card.is-active')` 应为 null。
5. **小卡互换**:1×1 卡拖到另一张 1×1 卡上 → 两者互换。

## 展开回归清单

1. 点击卡片 → `.is-active` 出现、其余卡有 `.is-thumb`、HUD「视图 详情」「缩略 n-1 张」;截图确认详情布局与底部缩略条。
2. 点击某个缩略图 → 切换展开(旧 active 卡变为 thumb)。
3. Esc → 回网格,HUD「视图 网格」,无 is-active。
4. 悬停详情柱状图某列 → tooltip 文案出现、柱子加 hot 类。

## 03 全局筛选:补间与插值断言

- 切范围(点 pill)→ 等 ~350ms 抓拍中途:大数字应是"滚动途中"的值(不等于旧值也不等于新值),HUD 总量同步 → 再等到位后读终值(分项之和 = 总量)。
- 柱状图 x 轴标签随范围切换;柱高 CSS 过渡(数量恒定才能按索引映射)。
- 打开下拉选因子项(如 后场)→ 总量 = 基数 × 因子,补间到位。
- NaN 出现 → 先查 v-for 里 ref 是否忘 `.value`,再查类名冲突。

## 04 悬停联动:同步性断言(页面内采样)

```js
// 在一次 evaluate 内:mouseenter 某图表第 i 列 → 读三张图表的 hot/dim/参考线
cards[1].querySelectorAll(".lh-col")[3].dispatchEvent(new MouseEvent("mouseenter"));
// 断言:cards[0] 第 i 根柱 hot、其余 dim;cards[2] 圆点 hot;参考线数量 = 图表数
// tooltip 只存在于 activeChart;聚焦卡文案切换;HUD 悬停 = 对应标签
```

从不同图表发起悬停各测一次,证明联动与发起方无关。

## 05 滚动吸顶:四状态断言

```js
const setState = async top => { el.scrollTop = top; el.dispatchEvent(new Event("scroll")); await sleep(350); 读 HUD + hero rect }
```
- top 0 / 60 / 300 / 0 → 高度 170 / 110 / 64 / 170,状态 FULL / 收缩中 / 紧凑 / FULL。
- 若中间态被弹回 FULL:九成是滚动锚定(容器缺 `overflow-anchor: none`)——在一个 evaluate 内采样 scrollTop 序列(60→0→0)即可确认指纹。
- 若高度基准错误:查 remeasure 是否在 --p 未归零时测量。

## 06 详情抽屉:开合与键盘断言(页面内采样)

- 点击行 → 采样宽度 0→290→340(过渡平滑)、行 active、HUD 行号;↓/↑ → 宽度不变、面板 h3 与行号 ±1、超界循环;Esc → 宽度 0。
- **跨 evaluate 读 rect 可能滞后一个交互(读数与状态相反)**——断言必须在一次 evaluate 内采样,页面内采样是裁判。
- 面板内容卡旧值不更新 = Transition 等 transitionend 被后台标签推迟 → 改 key 重渲染 + CSS 动画。

## 截图检查点

- 展开态:详情铺满主区不留空洞;缩略条贴底、无横向滚动;关闭按钮在详情右上角。
- 拖拽悬停中截图:浮动卡片有大阴影/轻微放大、虚线占位框在目标格、其余卡已让位。
- 中文文案注意 overflow:标签列宽、长词换行。

## 两个环境坑

1. **Vite HMR 丢事件**:脚本化工具对同一文件连续多次写入时,Vite 的 watcher 可能漏掉最后一次,内存里是"中间版本"——页面出现半新半旧(同一组件一部分文案变了另一部分没变)就是它。修法:`touch` 改过的文件触发重新转换,再用 `curl http://localhost:5173/src/... | grep` 确认服务端已返回新内容,然后刷新页面。判断服务端 vs 浏览器的问题,先 curl 再怀疑代码。
2. **后台标签页 rAF 节流**:合成拖拽时卡片跟手插值(rAF)在非前台标签里可能不跑,截图中浮动卡片位置滞后属正常;格位逻辑(applyTarget)用的是 pointer 实时坐标,不受影响。

## 设计主题:切换与构图断言

- 切主题 → 断言 `<html data-theme>` 已写入、布局 transform 变化(主题感知构图,如撞色下主卡到 (0,0))、切回后精确还原。
- 逐视图截图检查"彩色残留":时钟轴心、头像渐变、品牌卡、状态标签——用 computed style 抽查(如 `.fd-tag.r` 的 backgroundColor)而不是看截图猜。
- 覆盖层没生效 → 先确认类名真实存在(在 DOM 枚举),再查特异性(`html[data-theme]` 前缀)。
- 玻璃主题(backdrop-filter)多卡叠加:截图超时/卡顿属捕获开销,重试即可;运行时性能看真机。
