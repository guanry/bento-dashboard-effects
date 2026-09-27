# 指标区滚动吸顶(Sticky Compact Header)

大号指标区随滚动**连续**收缩成单行贴顶,反向滚动连续还原——"由滚动进度驱动字号与间距",不是两态切换。参考实现:`StickyHeader.vue`(演示 05)。

## 核心机制:滚动进度 → CSS 变量 → calc() 插值

```js
function onScroll() {
  const max = Math.max(1, fullH - COMPACT_H)
  const np = Math.min(1, Math.max(0, scrollEl.value.scrollTop / max))
  heroRef.value?.style.setProperty('--p', np.toFixed(4))  // 直写样式,绕过 Vue 重渲染
  p.value = np                                            // 仅 HUD 展示用
}
```

```css
.sd-hero  { position: sticky; top: 52px; --p: 0; }
.sd-num   { font-size: calc(38px - var(--p) * 19px); }              /* 38 → 19px */
.sd-greet { height: calc(56px - var(--p) * 56px); opacity: calc(1 - var(--p) * 1.8); }
.sd-hero  { padding: calc(20px - var(--p) * 10px) 22px;
            box-shadow: 0 calc(var(--p) * 14px) calc(var(--p) * 30px) rgba(0,0,0,.4); }
```

**零逐帧 JS 改样式**:滚动处理器只写一个 CSS 变量,所有视觉插值由浏览器 calc() 完成。`position: sticky` 让 hero 从第一像素起就贴顶,收缩完全由 p 驱动。

## 两个必踩的坑(都有实测采样证据)

### 1. 滚动锚定振荡 —— 滚动容器必须 `overflow-anchor: none`

hero 收缩使文档流内容上移,Chrome 的 scroll anchoring 会**回滚 scrollTop 来"抵消"位移**:实测设 scrollTop=60,handler 正确算出 p=0.57,但锚定立即把 scrollTop 拉回 0,下次 handler 读到 0 又把 hero 还原——收缩与回滚互相抵消,永远停在 FULL。采样序列(60 → 0 → 0)是它的指纹。修复一行:

```css
.sd { overflow-anchor: none; }
```

### 2. 重测量前必须把 --p 归零

窗口 resize 触发 `remeasure()` 时,如果 hero 正处于收缩中途,量到的是**收缩态高度**,塌缩距离(全高 − 紧凑高)整个算错。修复:

```js
function remeasure() {
  const prev = el.style.getPropertyValue('--p')
  el.style.setProperty('--p', '0')                       // 归零再量
  fullH = el.getBoundingClientRect().height
  el.style.setProperty('--p', prev)
  onScroll()
}
```

## 其他要点

- 顶栏(sticky top:0)与 hero(sticky top:52px)分层钉住,背景同为半透明 + blur,收缩后视觉上连成一根 bar
- p 同时驱动 HUD(高度 px / 状态 FULL|收缩中|紧凑 / 进度 %),实时输出
- 内容体要足够长(长表格/多行卡片)才能滚出完整的收缩行程
- 后台标签页 rAF/定时器被节流:跟手类动画会滞后,但格位/进度逻辑用的是事件里的实时值,不受影响
