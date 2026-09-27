import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { solveLayout } from '../bento/solver.js'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

/**
 * Bento 网格拖拽引擎
 * - 布局模型:cols × rows 的格子系统,每张卡占 {x, y, w, h}
 * - 拖拽中:被拖卡片脱离文档流跟随指针(带缓动 + 速度倾斜),
 *   其余卡片按"最近空位"算法即时重排,CSS transition 负责平滑让位
 * - 松手:卡片从指针位置过渡吸附到目标格位
 * - 撤销/重做:布局快照栈,Cmd/Ctrl+Z 与 Ctrl+Y(或 +Shift)驱动
 */
export function useBentoGrid(initialCards, { cols = 4, rows = 3, gap = 12, onCommit } = {}) {
  const gridEl = ref(null)
  const layout = ref(initialCards.map(c => ({ ...c })))
  const cell = reactive({ w: 120, h: 120 })
  // 网格规格可变(主题感知布局,如沉浸型的 12×6 细网格)
  const dims = reactive({ cols, rows })

  const drag = reactive({
    active: false,
    id: null,
    releasing: null,
    pointer: { x: 0, y: 0 }, // 指针实时位置(视口坐标)
    pos: { x: 0, y: 0 },     // 渲染位置(每帧向指针插值,产生跟手弹性)
    grab: { x: 0, y: 0 },    // 按下点相对卡片左上角的偏移
    target: { x: 0, y: 0 },  // 当前吸附目标格位
    origin: { x: 0, y: 0 },  // 拖拽起始格位(留下的空位,让位时向它靠拢)
    tilt: 0,                 // 跟随横向速度的倾斜角
    reflows: 0,              // 本次拖拽中重排次数
  })

  // 拖拽起始布局快照:让位结果只由落点格位决定,与拖拽路径无关
  let originLayout = []

  /* ---------------- 撤销 / 重做(布局快照栈) ---------------- */

  const hist = reactive({ index: 0, size: 1 })
  const stack = []
  const snapshot = () => JSON.parse(JSON.stringify(layout.value))

  // 每次用户动作(拖拽结束 / 撤销 / 重做)后提交,交由 onCommit 持久化
  function commit() {
    stack.splice(hist.index + 1)
    stack.push(snapshot())
    hist.index = stack.length - 1
    hist.size = stack.length
    onCommit?.(layout.value.map(c => ({ ...c })))
  }

  function undo() {
    if (drag.active || hist.index <= 0) return
    view.expandedId = null
    hist.index -= 1
    layout.value = JSON.parse(JSON.stringify(stack[hist.index]))
    onCommit?.(layout.value.map(c => ({ ...c })))
  }

  function redo() {
    if (drag.active || hist.index >= hist.size - 1) return
    view.expandedId = null
    hist.index += 1
    layout.value = JSON.parse(JSON.stringify(stack[hist.index]))
    onCommit?.(layout.value.map(c => ({ ...c })))
  }

  function onHistoryKey(e) {
    // 输入框里的 Cmd/Ctrl+Z 交给浏览器原生行为
    const t = e.target
    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t.isContentEditable) return
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault()
      e.shiftKey ? redo() : undo()
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault()
      redo()
    }
  }
  window.addEventListener('keydown', onHistoryKey)

  /* ---------------- 就地展开(Shared Element Expand) ---------------- */

  const view = reactive({ expandedId: null })
  let lastDragEnd = 0

  function expand(id) { view.expandedId = id }
  function collapse() { view.expandedId = null }

  function onCardClick(c) {
    // 拖拽刚结束的 click 不算点击
    if (Date.now() - lastDragEnd < 200) return
    if (view.expandedId === c.id) return
    view.expandedId = c.id
  }

  function onKey(e) {
    if (e.key === 'Escape') collapse()
  }
  window.addEventListener('keydown', onKey)

  // 展开态的矩形布局:被展开卡片铺满主区,其余卡片按阅读顺序
  // 等比缩小为底部缩略条(保留各自宽高比,超宽时整体等比压缩)
  const expandRects = computed(() => {
    if (!view.expandedId) return null
    const { cols, rows } = dims
    const W = cols * cell.w + (cols - 1) * gap
    const H = rows * cell.h + (rows - 1) * gap
    const others = layout.value
      .filter(c => c.id !== view.expandedId)
      .slice()
      .sort((a, b) => a.y - b.y || a.x - b.x)
    const sumAspect = others.reduce((s, c) => {
      const cw = c.w * cell.w + (c.w - 1) * gap
      const ch = c.h * cell.h + (c.h - 1) * gap
      return s + cw / ch
    }, 0)
    const thumbH = Math.min(112, (W - gap * (others.length - 1)) / sumAspect)
    const rects = { [view.expandedId]: { x: 0, y: 0, w: W, h: H - gap - thumbH } }
    let x = 0
    for (const c of others) {
      const cw = c.w * cell.w + (c.w - 1) * gap
      const ch = c.h * cell.h + (c.h - 1) * gap
      const tw = (cw / ch) * thumbH
      rects[c.id] = { x, y: H - thumbH, w: tw, h: thumbH }
      x += tw + gap
    }
    return rects
  })

  let vx = 0
  let lastPX = 0
  let rectCache = null
  let rafId = 0
  let releaseTimer = 0
  let pending = null
  let ro = null

  const cardById = id => layout.value.find(c => c.id === id)

  const dragTitle = computed(() =>
    drag.active ? cardById(drag.id)?.title ?? '—' : '—'
  )

  /* ---------------- 测量 ---------------- */

  function measure() {
    const el = gridEl.value
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width < 40 || r.height < 40) return
    cell.w = (r.width - gap * (dims.cols - 1)) / dims.cols
    cell.h = (r.height - gap * (dims.rows - 1)) / dims.rows
  }

  watch(gridEl, el => {
    if (!el) return
    measure()
    ro = new ResizeObserver(measure)
    ro.observe(el)
  })

  /* ---------------- 布局求解(纯函数在 ../bento/solver.js) ---------------- */

  function computeLayout(dragged) {
    return solveLayout({
      baseCards: originLayout.filter(c => c.id !== dragged.id),
      dragged,
      hole: { ...drag.origin },
      cols: dims.cols,
      rows: dims.rows,
    })
  }

  // 由指针位置换算期望格位;若该格位放不下(如大卡换位后剩余面积不足),
  // 就在所有候选格位中找"离期望最近的有效解"——即自动吸附到最近格位。
  function applyTarget() {
    const { cols, rows } = dims
    const dragged = originLayout.find(c => c.id === drag.id)
    if (!dragged || !rectCache) return
    const stepX = cell.w + gap
    const stepY = cell.h + gap
    const left = drag.pointer.x - rectCache.left - drag.grab.x
    const top = drag.pointer.y - rectCache.top - drag.grab.y
    const tx = clamp(Math.round(left / stepX), 0, cols - dragged.w)
    const ty = clamp(Math.round(top / stepY), 0, rows - dragged.h)

    if (tx === drag.target.x && ty === drag.target.y) return

    const candidates = []
    for (let y = 0; y <= rows - dragged.h; y++)
      for (let x = 0; x <= cols - dragged.w; x++)
        candidates.push({ x, y, d: (x - tx) ** 2 + (y - ty) ** 2 })
    candidates.sort((a, b) => a.d - b.d)

    for (const cand of candidates) {
      const next = computeLayout({ ...dragged, x: cand.x, y: cand.y })
      if (!next) continue
      if (cand.x === drag.target.x && cand.y === drag.target.y) return
      drag.target = { x: cand.x, y: cand.y }
      layout.value = next
      drag.reflows++
      return
    }
  }

  /* ---------------- 指针交互 ---------------- */

  function onCardPointerDown(e, id) {
    if (view.expandedId) return // 展开态下只允许点击切换,不允许拖拽
    if (e.button !== undefined && e.button !== 0) return
    const r = e.currentTarget.getBoundingClientRect()
    pending = {
      id,
      grabX: e.clientX - r.left,
      grabY: e.clientY - r.top,
      x0: e.clientX,
      y0: e.clientY,
    }
    window.addEventListener('pointermove', onPendingMove)
    window.addEventListener('pointerup', onPendingEnd)
    window.addEventListener('pointercancel', onPendingEnd)
  }

  function onPendingMove(e) {
    if (!pending) return
    // 5px 阈值:点按不触发拖拽,保证卡片内按钮/链接仍可点击
    if (Math.hypot(e.clientX - pending.x0, e.clientY - pending.y0) < 5) return
    startDrag(e)
  }

  function onPendingEnd() {
    pending = null
    window.removeEventListener('pointermove', onPendingMove)
    window.removeEventListener('pointerup', onPendingEnd)
    window.removeEventListener('pointercancel', onPendingEnd)
  }

  function startDrag(e) {
    const { id, grabX, grabY } = pending
    onPendingEnd()

    drag.active = true
    drag.id = id
    drag.releasing = null
    clearTimeout(releaseTimer)
    drag.grab = { x: grabX, y: grabY }
    drag.pointer = { x: e.clientX, y: e.clientY }
    drag.pos = { x: e.clientX, y: e.clientY }
    drag.tilt = 0
    vx = 0
    lastPX = e.clientX
    rectCache = gridEl.value.getBoundingClientRect()
    const c = cardById(id)
    drag.target = { x: c.x, y: c.y }
    drag.origin = { x: c.x, y: c.y }
    originLayout = layout.value.map(card => ({ ...card }))
    drag.reflows = 0

    document.body.classList.add('is-bento-dragging')
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    rafId = requestAnimationFrame(tick)
  }

  function onMove(e) {
    if (!drag.active) return
    e.preventDefault()
    vx = clamp(vx * 0.55 + (e.clientX - lastPX) * 0.45, -16, 16)
    lastPX = e.clientX
    drag.pointer.x = e.clientX
    drag.pointer.y = e.clientY
    rectCache = gridEl.value.getBoundingClientRect()
    applyTarget()
  }

  // 跟手插值 + 速度倾斜,松手前每帧执行
  function tick() {
    if (!drag.active) return
    const k = 0.35
    drag.pos.x += (drag.pointer.x - drag.pos.x) * k
    drag.pos.y += (drag.pointer.y - drag.pos.y) * k
    drag.tilt += (clamp(vx, -12, 12) * 0.7 - drag.tilt) * 0.14
    vx *= 0.85
    rafId = requestAnimationFrame(tick)
  }

  function onUp() {
    if (!drag.active) return
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    cancelAnimationFrame(rafId)

    const id = drag.id
    drag.active = false
    drag.id = null
    // releasing 期间卡片保留高 z-index,并从指针位置过渡吸附到格位
    drag.releasing = id
    releaseTimer = setTimeout(() => { drag.releasing = null }, 480)
    lastDragEnd = Date.now()
    document.body.classList.remove('is-bento-dragging')
    commit() // 拖拽落定 → 提交快照(撤销栈 + 持久化)
  }

  function setLayout(list) {
    // 整组替换布局(如主题切换时的"主卡构图"),过渡由 CSS 自动完成
    layout.value = list.map(c => ({ ...c }))
  }

  function setGrid(c, r, list) {
    // 同时切换网格规格与布局(沉浸型打破常规网格:12×6 细网格错落构图)
    dims.cols = c
    dims.rows = r
    layout.value = list.map(x => ({ ...x }))
    measure()
    // 构图级切换重置撤销栈:撤销语义限定在"当前构图内的拖拽"
    stack.splice(0)
    stack.push(snapshot())
    hist.index = 0
    hist.size = 1
  }

  /* ---------------- 渲染辅助 ---------------- */

  function sizeOf(c) {
    return {
      w: c.w * cell.w + (c.w - 1) * gap,
      h: c.h * cell.h + (c.h - 1) * gap,
    }
  }

  function styleFor(c) {
    const { w, h } = sizeOf(c)
    if (drag.id === c.id && rectCache) {
      const x = drag.pos.x - rectCache.left - drag.grab.x
      const y = drag.pos.y - rectCache.top - drag.grab.y
      return {
        width: `${w}px`,
        height: `${h}px`,
        zIndex: 40,
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${drag.tilt.toFixed(2)}deg) scale(1.03)`,
      }
    }
    if (view.expandedId) {
      const r = expandRects.value[c.id]
      return {
        width: `${r.w}px`,
        height: `${r.h}px`,
        zIndex: c.id === view.expandedId ? 30 : 5,
        transform: `translate3d(${r.x}px, ${r.y}px, 0)`,
      }
    }
    return {
      width: `${w}px`,
      height: `${h}px`,
      zIndex: drag.releasing === c.id ? 30 : 1,
      transform: `translate3d(${c.x * (cell.w + gap)}px, ${c.y * (cell.h + gap)}px, 0)`,
    }
  }

  // 卡片内容层的样式:展开时铺满,缩略时按原尺寸等比缩放(内容清晰不挤压)
  function innerStyleFor(c) {
    if (view.expandedId === c.id) {
      return { width: '100%', height: '100%' }
    }
    const { w, h } = sizeOf(c)
    if (view.expandedId) {
      const r = expandRects.value[c.id]
      return {
        width: `${w}px`,
        height: `${h}px`,
        transform: `scale(${(r.h / h).toFixed(4)})`,
        transformOrigin: '0 0',
      }
    }
    return { width: `${w}px`, height: `${h}px` }
  }

  // 展开卡片右上角的关闭按钮(浮层,随形变平滑移动)
  const closeStyle = computed(() => {
    if (!view.expandedId) return null
    const r = expandRects.value[view.expandedId]
    return { transform: `translate3d(${r.w - 44}px, ${r.y + 14}px, 0)` }
  })

  // 目标格位的虚线占位框
  const ghostStyle = computed(() => {
    if (!drag.active) return null
    const d = cardById(drag.id)
    if (!d) return null
    const { w, h } = sizeOf(d)
    return {
      width: `${w}px`,
      height: `${h}px`,
      transform: `translate3d(${d.x * (cell.w + gap)}px, ${d.y * (cell.h + gap)}px, 0)`,
    }
  })

  // 初始快照入栈
  stack.push(snapshot())

  onBeforeUnmount(() => {
    ro?.disconnect()
    cancelAnimationFrame(rafId)
    clearTimeout(releaseTimer)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('keydown', onHistoryKey)
    onPendingEnd()
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    document.body.classList.remove('is-bento-dragging')
  })

  return {
    gridEl, layout, drag, dragTitle, ghostStyle, styleFor, onCardPointerDown, dims,
    view, expand, collapse, onCardClick, innerStyleFor, closeStyle, setLayout, setGrid,
    hist, undo, redo,
  }
}
