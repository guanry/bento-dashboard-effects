# 设计主题系统(Design Tokens + 主题感知布局/内容)

六套主题(暖调留白 / 深色 / 强对比 / 极简数据 / 氛围沉浸 / 图卡内容)共用**同一个组件代码库**,切换零改动。三层机制:令牌覆盖层 → 主题感知布局 → 内容级变体。参考实现:项目 `src/theme.js`、`src/themes/*.css`、App.vue 的 watch 链。

## 一、令牌覆盖层

- `assets/theme.js`:reactive theme + `setTheme()` 写 `<html data-theme="...">` + localStorage 持久化。**import 即应用**(避免首帧闪错主题)。
- 每套主题一个覆盖层样式表(`themes/warm.css` 等),在 main.js 于 style.css 之后导入。
- 语义令牌(深色为 `:root` 默认):`--panel`(窗口底)/ `--card-dark`(卡片底)/ `--text` / `--muted` / `--line` / `--orange` `--yellow` `--blue`(强调)/ `--accent` `--accent-ink` / `--stage`(页面背景)。组件一律引用令牌,不写死颜色 → 新主题 = 新覆盖层,组件零改动。

```css
html[data-theme='warm'] {
  --panel: #fbf7ee;      /* 奶油窗底(不要纯白) */
  --card-dark: #ffffff;  /* 白卡 */
  --accent: #e9a81c;     /* 唯一强调:琥珀 */
  --stage: radial-gradient(...奶油渐变...);
}
```

- **单一强调色纪律**:暖调=琥珀,极简=黄绿(#d9e14b),图卡=单橙(#f4623a),撞色=高饱和橙×紫×青。状态徽章/品类数据色也在主题层重映射(黄 + 灰阶),否则彩色徽章会破坏"一个强调色"。

## 二、主题感知布局(setGrid)

引擎的网格规格是响应式的(`dims`),支持 `setGrid(cols, rows, layoutList)`。每套主题可携带自己的**构图**:

- 基础(暖/深):4×3 均分
- 强对比:4×3 主卡构图(一张大卡占视觉中心,其余压小)
- 氛围沉浸:12×6 细网格错落拼贴(玻璃卡)
- 图卡内容:12×6(左档案栏 + 四图卡 + 宽详情)

```js
watch(theme, t => {
  if (t === 'bold') grid.setGrid(4, 3, BOLD_LAYOUT)
  else if (t === 'immersive') grid.setGrid(12, 6, IMMERSIVE_LAYOUT)
  else grid.setGrid(4, 3, BASE_LAYOUT)
})
```

**构图规则**:卡片面积之和 = cols × rows,无缝满铺不留洞。切主题时所有卡片**滑行**到新位置、尺寸连续变形——复用矩形过渡,布局切换即动效。初始加载时若 localStorage 主题带专属构图,mount 后补一次 setGrid。

## 三、内容级变体(isContent)

主题可以深入到**组件内容层**:图卡内容主题下,四张卡渲染成 SVG 风景照卡、出杯量变成 Details 行程面板、积分变成个人档案栏。

```js
const theme = useTheme()
const isContent = computed(() => theme.value === 'content')
```
```html
<div v-if="isContent" class="pc">…照片卡…</div>
<div class="venue" v-else>…原数据卡…</div>
```

- 照片:内联 SVG 分层风景(渐变天 + 2~3 层剪影 + 太阳),`preserveAspectRatio="xMidYMid slice"` + 悬停 `scale(1.07)`。**离线可用**,不依赖外链图;linearGradient 的 id 各卡必须唯一
- 照片卡结构:`.pf-photo`(上层 70%)+ `.pf-cap`(下方白底说明条)

## 坑(每条实测踩过)

1. **给已有 `<script setup>` 的组件追加主题分支时,import 必须并入既有块**——插入第二个 `<script setup>` 直接编译报错(SFC 只允许一个)。
2. **覆盖层先枚举真实类名**:写覆盖前在 DOM 里确认(实测漏掉 `.fd-tag`,状态标签在切换主题后仍是彩色)。统一 `html[data-theme='x']` 前缀保证特异性压过 scoped 样式。
3. **backdrop-filter 玻璃卡多张叠加有性能成本**:雾面舞台用 `background-attachment: fixed` 的多层 radial-gradient,而不是真实 DOM 色块。
4. **单色主题下所有"彩色残留"都要清**:时钟轴心、头像渐变、品牌卡、数据色,逐视图截图最容易发现。
5. 主题切换后若布局/文案没变,先确认 `<html data-theme>` 是否真的写上了(theme.js 在 import 时同步写一次)。
