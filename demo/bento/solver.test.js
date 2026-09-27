import { describe, it, expect } from 'vitest'
import { solveLayout } from './solver.js'

// 4×3 基础构图(与演示项目一致)
const base = [
  { id: 'venue', x: 0, y: 0, w: 2, h: 1 },
  { id: 'staff', x: 2, y: 0, w: 2, h: 1 },
  { id: 'throughput', x: 0, y: 1, w: 2, h: 2 },
  { id: 'ai', x: 2, y: 1, w: 2, h: 1 },
  { id: 'points', x: 2, y: 2, w: 1, h: 1 },
  { id: 'timing', x: 3, y: 2, w: 1, h: 1 },
]

const map = layout => Object.fromEntries(layout.map(c => [c.id, `${c.x},${c.y}`]))
// 与引擎一致:baseCards 不含被拖卡片自身
const solve = (dragged, hole) =>
  solveLayout({ baseCards: base.filter(c => c.id !== dragged.id), dragged, hole, cols: 4, rows: 3 })

describe('solveLayout', () => {
  it('同尺寸卡片与被拖卡直接换位,其余不动', () => {
    const out = solve({
      id: 'venue', x: 2, y: 1, w: 2, h: 1,   // venue 拖到 ai 的位置
    }, { x: 0, y: 0 })
    const m = map(out)
    expect(m.venue).toBe('2,1')
    expect(m.ai).toBe('0,0')          // ai 换位进空位
    expect(m.staff).toBe('2,0')       // 其余原位
    expect(m.throughput).toBe('0,1')
    expect(m.points).toBe('2,2')
    expect(m.timing).toBe('3,2')
  })

  it('拖回原位 → 精确还原基础构图', () => {
    const out = solve({
      id: 'venue', x: 0, y: 0, w: 2, h: 1,
    }, { x: 0, y: 0 })
    expect(map(out)).toEqual(map(base))
  })

  it('满铺网格的无解格位返回 null(2×1 拖到 (1,0))', () => {
    // 4×3 全占满时,(1,0) 处放下 venue 后剩余空间无法容纳其他卡片
    const out = solve({
      id: 'venue', x: 1, y: 0, w: 2, h: 1,
    }, { x: 0, y: 0 })
    expect(out).toBeNull()
  })

  it('1×1 小卡互换(同尺寸换位规则)', () => {
    const out = solve({
      id: 'points', x: 3, y: 2, w: 1, h: 1,   // points 拖到 timing 的位置
    }, { x: 2, y: 2 })
    expect(map(out).points).toBe('3,2')
    expect(map(out).timing).toBe('2,2')
    expect(map(out).venue).toBe('0,0')
  })

  it('小卡拖到左上角:大卡让位链条朝空位流动,布局合法', () => {
    const out = solve({
      id: 'timing', x: 0, y: 0, w: 1, h: 1,   // timing 拖到 venue 区域
    }, { x: 3, y: 2 })
    expect(out).not.toBeNull()
    const m = map(out)
    expect(m.timing).toBe('0,0')
    // 12 格恰好被 6 张卡铺满,无重叠:逐格校验
    const grid = new Array(12).fill(null)
    for (const c of out)
      for (let dy = 0; dy < c.h; dy++)
        for (let dx = 0; dx < c.w; dx++) {
          const idx = (c.y + dy) * 4 + c.x + dx
          expect(grid[idx]).toBeNull()
          grid[idx] = c.id
        }
    expect(grid.every(Boolean)).toBe(true)
  })

  it('12×6 沉浸构图下同尺寸换位依旧成立', () => {
    const imm = [
      { id: 'venue', x: 0, y: 0, w: 5, h: 2 },
      { id: 'ai', x: 0, y: 2, w: 5, h: 2 },
      { id: 'points', x: 0, y: 4, w: 5, h: 2 },
      { id: 'throughput', x: 5, y: 0, w: 7, h: 3 },
      { id: 'timing', x: 5, y: 3, w: 3, h: 3 },
      { id: 'staff', x: 8, y: 3, w: 4, h: 3 },
    ]
    const out = solveLayout({
      baseCards: imm.filter(c => c.id !== 'venue'),
      dragged: { id: 'venue', x: 0, y: 2, w: 5, h: 2 },   // venue 拖到 ai 的位置
      hole: { x: 0, y: 0 },
      cols: 12, rows: 6,
    })
    const m = map(out)
    expect(m.venue).toBe('0,2')
    expect(m.ai).toBe('0,0')
    expect(m.throughput).toBe('5,0')
  })
})
