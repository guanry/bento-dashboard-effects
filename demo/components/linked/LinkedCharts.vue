<script setup>
import { ref, computed } from 'vue'

/* ---------------- 数据:三张图表共享同一组 x 轴(周一~周日) ---------------- */

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const cups = [1080, 1842, 1520, 1290, 1650, 968, 1078]          // 出杯
const queue = [4.2, 5.1, 3.8, 3.4, 4.6, 2.9, 3.2]               // 平均排队(分钟)
const revenue = [8640, 14736, 12160, 10320, 13200, 7744, 8624]  // 营收(元)

const cupsMax = Math.max(...cups)
const queueMax = Math.max(...queue)
const revMax = Math.max(...revenue)

const chartTitles = { cups: '每日出杯量', queue: '平均排队时长', revenue: '每日营收' }

/* ---------------- 共享悬停状态(联动的核心) ---------------- */

const hover = ref(null)        // 悬停的数据点下标,三张图表共用
const activeChart = ref(null)  // 指针当前所在的图表(仅它显示 tooltip)
const DIM = 0.3                // 非悬停数据点的透明度

function enter(i, chart) {
  hover.value = i
  activeChart.value = chart
}
function leave() {
  hover.value = null
  activeChart.value = null
}

const fmt = n => Math.round(n).toLocaleString('en-US')

/* ---------------- 面积图(SVG)几何 ---------------- */

const W = 280, H = 110
const xAt = i => 20 + (i * (W - 40)) / 6
const yAt = v => H - 8 - (v / revMax) * 92

const areaPath = computed(() => {
  const pts = revenue.map((v, i) => `${xAt(i)},${yAt(v)}`)
  return `M ${xAt(0)},${H - 8} L ${pts.join(' L ')} L ${xAt(6)},${H - 8} Z`
})
const linePath = computed(() =>
  revenue.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)},${yAt(v)}`).join(' ')
)
// 圆点用 div 定位(便于加 dim/hot 类与过渡),换算成容器百分比
const revDots = revenue.map((v, i) => ({
  x: ((i + 0.5) / 7) * 100,
  bottom: (1 - yAt(v) / H) * 100,
}))

/* ---------------- 当日聚焦 ---------------- */

const focus = computed(() => {
  const i = hover.value
  if (i === null) {
    return {
      key: 'all',
      title: '全周合计',
      rows: [
        ['出杯', `${fmt(cups.reduce((a, b) => a + b, 0))} 杯`],
        ['平均排队', `${(queue.reduce((a, b) => a + b, 0) / 7).toFixed(1)} 分钟`],
        ['营收', `¥ ${fmt(revenue.reduce((a, b) => a + b, 0))}`],
      ],
    }
  }
  return {
    key: days[i],
    title: days[i],
    rows: [
      ['出杯', `${fmt(cups[i])} 杯`],
      ['平均排队', `${queue[i].toFixed(1)} 分钟`],
      ['营收', `¥ ${fmt(revenue[i])}`],
    ],
  }
})
</script>

<template>
  <div class="lh">
    <header class="lh-head">
      <div>
        <h3>本周图表联动</h3>
        <p>悬停任意图表 —— 所有图表同步高亮同一数据点，其余降低透明度，共用一条竖向参考线</p>
      </div>
      <span class="lh-live" :class="{ on: hover !== null }">
        {{ hover === null ? '移动指针开始' : `${days[hover]} · ${chartTitles[activeChart] ?? ''}` }}
      </span>
    </header>

    <div class="lh-grid">
      <!-- 1. 柱状图 -->
      <section class="lh-card" @mouseleave="leave()">
        <h4>每日出杯量</h4>
        <div class="lh-plot">
          <i v-if="hover !== null" class="lh-line" :style="{ left: ((hover + 0.5) / 7) * 100 + '%' }" />
          <div
            v-for="(v, i) in cups"
            :key="i"
            class="lh-col"
            @mouseenter="enter(i, 'cups')"
          >
            <span
              v-if="hover === i && activeChart === 'cups'"
              class="lh-tip"
              :style="{ bottom: `calc(${(v / cupsMax) * 100}% + 12px)` }"
            >{{ days[i] }} · {{ fmt(v) }} 杯</span>
            <i
              class="lh-bar"
              :class="{ hot: hover === i, dim: hover !== null && hover !== i }"
              :style="{ height: (v / cupsMax) * 100 + '%' }"
            />
          </div>
        </div>
        <div class="lh-x"><span v-for="d in days" :key="d">{{ d }}</span></div>
      </section>

      <!-- 2. 细杆圆点图 -->
      <section class="lh-card" @mouseleave="leave()">
        <h4>平均排队时长</h4>
        <div class="lh-plot">
          <i v-if="hover !== null" class="lh-line" :style="{ left: ((hover + 0.5) / 7) * 100 + '%' }" />
          <div
            v-for="(v, i) in queue"
            :key="i"
            class="lh-col"
            @mouseenter="enter(i, 'queue')"
          >
            <span
              v-if="hover === i && activeChart === 'queue'"
              class="lh-tip"
              :style="{ bottom: `calc(${(v / queueMax) * 100}% + 16px)` }"
            >{{ days[i] }} · {{ v.toFixed(1) }} 分钟</span>
            <div class="lh-stickwrap">
              <i class="lh-dot" :class="{ hot: hover === i, dim: hover !== null && hover !== i }" />
              <i
                class="lh-stick"
                :class="{ hot: hover === i, dim: hover !== null && hover !== i }"
                :style="{ height: (v / queueMax) * 100 + '%' }"
              />
            </div>
          </div>
        </div>
        <div class="lh-x"><span v-for="d in days" :key="d">{{ d }}</span></div>
      </section>

      <!-- 3. 面积图(SVG) -->
      <section class="lh-card" @mouseleave="leave()">
        <h4>每日营收</h4>
        <div class="lh-plot" @mouseenter="hover !== null && activeChart !== 'revenue' && enter(hover, 'revenue')">
          <i v-if="hover !== null" class="lh-line" :style="{ left: ((hover + 0.5) / 7) * 100 + '%' }" />
          <svg class="lh-svg" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
            <path class="lh-area" :d="areaPath" fill="rgba(255,138,92,.22)" :class="{ dim: hover !== null }" />
            <path class="lh-linep" :d="linePath" fill="none" stroke="#ff8a5c" stroke-width="2" :class="{ dim: hover !== null }" />
          </svg>
          <div
            v-for="(d, i) in revDots"
            :key="i"
            class="lh-col lh-col-abs"
            :style="{ left: d.x + '%' }"
            @mouseenter="enter(i, 'revenue')"
          >
            <span
              v-if="hover === i && activeChart === 'revenue'"
              class="lh-tip"
              :style="{ bottom: `calc(${d.bottom}% + 14px)` }"
            >{{ days[i] }} · ¥ {{ fmt(revenue[i]) }}</span>
            <i class="lh-dot" :class="{ hot: hover === i, dim: hover !== null && hover !== i }" />
          </div>
        </div>
        <div class="lh-x"><span v-for="d in days" :key="d">{{ d }}</span></div>
      </section>

      <!-- 4. 当日聚焦:key 强制重渲染 + 纯 CSS 入场动画(不依赖 transitionend) -->
      <section class="lh-card lh-detail">
        <h4>当日聚焦</h4>
        <div :key="focus.key" class="lh-focus">
          <b>{{ focus.title }}</b>
          <div v-for="r in focus.rows" :key="r[0]" class="lh-focus-row">
            <span>{{ r[0] }}</span><i>{{ r[1] }}</i>
          </div>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div class="bento-hud">
        <div class="hud-row"><span>悬停</span><b>{{ hover === null ? '—' : days[hover] }}</b></div>
        <div class="hud-row"><span>联动</span><b>3 图表</b></div>
        <div class="hud-row"><span>变暗</span><b>{{ hover === null ? '—' : Math.round(DIM * 100) + '%' }}</b></div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.lh {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 14px 18px 18px;
  gap: 12px;
}

.lh-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.lh-head h3 {
  font-size: 15px;
  font-weight: 700;
}

.lh-head p {
  margin-top: 4px;
  font-size: 11px;
  color: var(--muted);
}

.lh-live {
  flex: none;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 6px 14px;
  transition: color 0.2s, border-color 0.2s;
}

.lh-live.on {
  color: #ffb39f;
  border-color: rgba(255, 107, 74, 0.5);
}

.lh-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.lh-card {
  background: var(--card-dark);
  border-radius: 16px;
  padding: 16px 18px;
  min-width: 0;
}

.lh-card h4 {
  font-size: 12.5px;
  font-weight: 700;
  margin-bottom: 12px;
}

.lh-plot {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 2%;
  height: 168px;
}

/* 共享竖向参考线:虚线橙色,随悬停索引平滑滑动 */
.lh-line {
  position: absolute;
  top: -4px;
  bottom: 0;
  width: 1.5px;
  background: repeating-linear-gradient(180deg, rgba(255, 138, 92, 0.8) 0 4px, transparent 4px 9px);
  transition: left 0.18s ease;
  pointer-events: none;
  z-index: 1;
}

.lh-col {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  min-width: 0;
  cursor: crosshair;
}

.lh-bar {
  display: block;
  width: 100%;
  max-width: 38px;
  background: rgba(255, 138, 92, 0.45);
  border-radius: 7px 7px 2px 2px;
  transition: height 0.3s, opacity 0.2s, background 0.2s;
}

.lh-bar.hot {
  background: linear-gradient(180deg, #ff8a5c, #ff5c39);
}

.dim {
  opacity: 0.3;
}

.lh-bar,
.lh-stick,
.lh-dot {
  transition: opacity 0.2s, background 0.2s, height 0.3s, transform 0.2s;
}

/* 细杆圆点图 */
.lh-stickwrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  width: 100%;
}

.lh-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ff8a5c;
  margin-bottom: 2px;
}

.lh-dot.hot {
  transform: scale(1.45);
  background: #ff5c39;
  box-shadow: 0 0 0 4px rgba(255, 92, 57, 0.22);
}

.lh-stick {
  width: 2.5px;
  background: rgba(255, 138, 92, 0.4);
  border-radius: 2px;
}

.lh-stick.hot {
  background: #ff5c39;
}

/* 面积图 */
.lh-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.lh-col-abs {
  position: absolute;
  top: 0;
  bottom: 0;
  transform: translateX(-50%);
  flex: none;
}

/* tooltip */
.lh-tip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #17171b;
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 5px 11px;
  border-radius: 7px;
  white-space: nowrap;
  z-index: 3;
  pointer-events: none;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.4);
}

.lh-tip::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -3px;
  width: 6px;
  height: 6px;
  background: #17171b;
  transform: translateX(-50%) rotate(45deg);
  border-radius: 1px;
}

/* x 轴标签与柱子列对齐 */
.lh-x {
  display: flex;
  gap: 2%;
  margin-top: 9px;
}

.lh-x span {
  flex: 1;
  text-align: center;
  font-size: 9.5px;
  font-weight: 600;
  color: var(--muted);
  min-width: 0;
}

/* 当日聚焦 */
.lh-focus b {
  display: block;
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 12px;
}

.lh-focus-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 2px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
  font-size: 12px;
}

.lh-focus-row:last-child {
  border-bottom: none;
}

.lh-focus-row span {
  color: var(--muted);
}

.lh-focus-row i {
  font-style: normal;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.lh-focus {
  animation: lh-fade-in 0.18s ease;
}

@keyframes lh-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
</style>
