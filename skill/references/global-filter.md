# 全局筛选联动(Global Filter Bar)

筛选条固定顶部,切换后**所有指标数字滚动补间、图表平滑插值,不整页刷新**。参考实现:`FilterDashboard.vue`(演示 03)。

## 三个机制

### 1. 数字滚动补间 —— assets/useTweenNumber.js

```js
const totalTween = useTweenNumber(totalSrc)          // totalSrc 是 computed
// 模板:{{ fmt(totalTween) }},fmt = n => Math.round(n).toLocaleString('en-US')
```

- rAF + easeOutCubic;`display` 初始为 0 且 `immediate: true` → 首次挂载从 0 滚到目标,视图切入自带"起势"
- 组件卸载时 cancelAnimationFrame(必须清理)
- 多个数字各自调一次 useTweenNumber;**筛选(下拉)与范围切换走同一条补间链路**——下拉只是改变源值的因子(如 后场 ×0.38)

### 2. 图表平滑插值 —— 零 JS 动画

柱高/堆叠条宽是百分比 + CSS `transition: height/width .6s`,**数据一换浏览器自动插值**。与 Bento 同一哲学:改数据,浏览器动。

- 柱子数量保持恒定(不同范围用不同分桶,如 今天=时段 / 本月=按日分桶,都给 7 根)——数量不变,过渡才能按索引映射
- 高度按当前数据集归一化(`v / maxV`),峰值柱高亮 `.top`

### 3. 记录表切换 —— 换 key + 级联淡入

```html
<div :key="range + dept + staff">   <!-- key 变化 → 整块重挂载 -->
  <div v-for="(r, i) in rows" :style="{ animationDelay: i * 35 + 'ms' }" class="row">
```
行自带 `animation: row-in .3s both`,重挂载即级联入场。

## 数据与布局要点

- **分项之和必须等于总量**(今天 1,842 = 三个子指标之和 = 柱状图之和),否则补间时数字对不上,一眼假
- 筛选条 `position: sticky; top: 0` + 半透明背景 + blur,放在滚动容器内即"固定顶部"
- 下拉菜单:按钮 `@click.stop` 开合,window click 监听关闭;选中值作为 computed 因子参与所有数值

## 两个必踩的坑

1. **v-for 遍历 ref 数组不会自动解包**:`v-for="t in tweens"` 里 `t` 是 Ref,`{{ fmt(t) }}` 得到 NaN。用 `t.value`(或只把顶层 ref 交给模板)。排查口诀:补间相关字段出现 NaN,先查是否忘了 .value。
2. **scoped 样式类名冲突**:同一组件里两个角色用了同名类(实测:筛选条和图表柱子都叫 `.fd-bar`),后者覆盖前者的 display/width,布局莫名其妙变成竖条。类名按角色前缀区分,发现"样式怪异"先查类名复用。
