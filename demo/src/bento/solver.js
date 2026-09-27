/**
 * Bento 布局求解器(纯函数,无 DOM / 无框架依赖,可单元测试)
 *
 * 把 dragged 放到指定格位后,其余卡片按阅读顺序依次就位:
 * - 放得下 → 原位不动(最小位移)
 * - 与被拖卡片同尺寸 → 直接换位,进入其留下的空位(hole)
 * - 否则按「自身位移² + 2 × (到空位距离)²」选最近的可行位置
 *   —— 空位引力:让位链条自然朝被拖卡片留下的空位方向流动
 * - 任何卡片无家可归 → 返回 null(该目标格位无解,调用方换候选位重试)
 *
 * @param {Object} p
 * @param {Array}  p.baseCards 其余卡片的基准位置(不含 dragged)
 * @param {Object} p.dragged   被拖卡片 {id,x,y,w,h},x/y 为目标格位
 * @param {Object} p.hole      被拖卡片留下的空位格位 {x,y}
 * @param {Number} p.cols      网格列数
 * @param {Number} p.rows      网格行数
 * @returns {Array|null} 新布局数组;无解时 null
 */
export function solveLayout({ baseCards, dragged, hole, cols, rows }) {
  const occupied = new Array(cols * rows).fill(null)
  const occupy = c => {
    for (let dy = 0; dy < c.h; dy++)
      for (let dx = 0; dx < c.w; dx++)
        occupied[(c.y + dy) * cols + c.x + dx] = c.id
  }
  const fits = c => {
    if (c.x < 0 || c.y < 0 || c.x + c.w > cols || c.y + c.h > rows) return false
    for (let dy = 0; dy < c.h; dy++)
      for (let dx = 0; dx < c.w; dx++)
        if (occupied[(c.y + dy) * cols + c.x + dx]) return false
    return true
  }

  occupy(dragged)
  const out = [{ ...dragged }]

  const others = baseCards
    .slice()
    .sort((a, b) => a.y - b.y || a.x - b.x)

  for (const c of others) {
    if (fits(c)) {
      occupy(c)
      out.push({ ...c })
      continue
    }
    // 与被拖卡片同尺寸 → 直接换位,进入其留下的空位(最小位移)
    if (c.w === dragged.w && c.h === dragged.h && fits({ ...c, x: hole.x, y: hole.y })) {
      const swapped = { ...c, x: hole.x, y: hole.y }
      occupy(swapped)
      out.push(swapped)
      continue
    }
    let best = null
    let bestScore = Infinity
    for (let y = 0; y <= rows - c.h; y++) {
      for (let x = 0; x <= cols - c.w; x++) {
        const cand = { ...c, x, y }
        if (!fits(cand)) continue
        const score =
          (x - c.x) ** 2 + (y - c.y) ** 2 +
          2 * ((x - hole.x) ** 2 + (y - hole.y) ** 2)
        if (score < bestScore) { bestScore = score; best = cand }
      }
    }
    if (!best) return null
    occupy(best)
    out.push({ ...best })
  }
  return out
}
