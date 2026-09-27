# 列表右侧详情抽屉(Master Detail)

主从布局:点击行右侧滑出详情抽屉,列表压窄保持可见,当前行高亮,键盘 ↑/↓ 切换只刷新面板内容。参考实现:`MasterDetail.vue`(演示 06)。

## 布局:压窄,而不是覆盖

```css
.md-body   { display: flex; }               /* 主内容 + 抽屉并排 */
.md-main   { flex: 1; min-width: 0; }       /* 被压窄但完整可见 */
.md-drawer { width: 0; flex: none; overflow: hidden;
             transition: width .34s cubic-bezier(.22,.85,.28,1.02); }
.md-drawer.open { width: 340px; }
.md-drawer-inner { width: 340px; }          /* 内层固定宽度,动画中内容不被挤压 */
```

抽屉用**宽度过渡挤窄列表**(不是 fixed 浮层),主从关系一目了然。

## 交互状态机

```js
const selected = ref(null)                  // null = 抽屉关闭
function toggle(it) { selected.value = selected.value === it.id ? null : it.id }
function move(step) {                       // 键盘 ↑/↓,循环 + 滚动对齐
  /* 在 filtered 里找当前索引,± step 取模;nextTick 里 scrollIntoView({block:'nearest'}) */
}
function onKey(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
  else if (e.key === 'Escape') close()
}
window.addEventListener('keydown', onKey)   // 组件卸载时移除
```

- `current = filtered.find(id === selected)` —— 搜索过滤后若选中项被滤掉,current 为 null,抽屉自动关闭
- 再次点击当前行 = 关闭

## 坑 1(最重要):`<Transition mode="out-in">` 在后台标签页永久卡住

Vue 的 out-in 要**等 transitionend** 才挂载新内容;后台标签页里 Chrome 推迟 transitionend/定时器,实测等 1.8s 面板仍停留在旧内容(状态和高亮都对,唯独面板不刷,排查极绕)。

**稳健模式:key 强制重渲染 + 纯 CSS 入场动画**——内容同步切换,动画纯装饰,不依赖任何事件:

```html
<div :key="item.id" class="panel">...</div>   <!-- key 变化 → 元素重挂载 -->
```
```css
.panel { animation: panel-in .2s ease; }      /* 纯 CSS,后台也不阻塞内容更新 */
```

同样的隐患也存在于其他 out-in/in-in Transition;凡是"状态变了内容就该变"的面板,一律用 key 重渲染。

## 坑 2:跨调用读取 DOM 会拿到过期值

用 browser-use 验证时,在**一次 evaluate 内**采样动画过程(click → 0/120/300/600ms 读宽度)才是权威;跨 evaluate 调用的 getBoundingClientRect 读数可能滞后一个交互(实测出现读数与状态完全相反)。页面内采样是裁判。

## HUD

抽屉宽度(打开 px / 关)/ 表格列数 / 当前行号 —— 与参考演示一致。
