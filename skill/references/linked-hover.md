# 多图表悬停联动(Linked Hover)

悬停任意图表,所有图表**同步高亮同一数据点**、其余数据降低透明度、共用一条竖向参考线。参考实现:`LinkedCharts.vue`(演示 04)。

## 核心原则:状态上移,不做图表间通信

```js
const hover = ref(null)        // 数据点下标,三张图表共用
const activeChart = ref(null)  // 指针所在图表(仅它显示 tooltip)
```

联动的本质是**多个图表读同一个状态**。每列整列都是热区(`@mouseenter` 在列容器上,不要求精确点到柱子),`@mouseleave` 在图表根上清空。

## 三件套实现

### 1. 竖向参考线

```html
<i v-if="hover !== null" class="lh-line"
   :style="{ left: ((hover + 0.5) / n) * 100 + '%' }" />
```
绝对定位虚线,`transition: left .18s` —— 换索引时平滑滑动。每张图一条,锚定同一索引,视觉上就是"共用"。

### 2. 同步高亮 + 变暗

```html
<i class="lh-bar" :class="{ hot: hover === i, dim: hover !== null && hover !== i }" />
```
`.dim { opacity: .3 }` + `transition: opacity .2s`。**SVG 元素同样吃 class/opacity**——柱状、细杆圆点、面积图三种形态可以混用,证明机制与图表实现无关。

### 3. tooltip 只在指针所在图表显示

`v-if="hover === i && activeChart === chartKey"`。tooltip 锚定在数据点所在列(`bottom: calc(高% + 12px)`),不要用全局百分比估算。

## 加分项:数字层联动

"当日聚焦"卡片随 hover 切换为该天的指标(移开回落到合计)——数字层与图形层同步,联动感翻倍。内容切换用 **key 重渲染 + 纯 CSS 入场动画**,不要用 `<Transition mode="out-in">`(原因见 references/master-detail.md 的坑 1)。

## HUD

悬停目标 / 联动图表数 / 变暗透明度,实时输出——既是调试器也是演示的"技术感"来源。
