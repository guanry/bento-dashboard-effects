<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from '../../theme'

/* 指标区滚动吸顶:hero 用 position:sticky 常驻顶部,
   滚动进度 p(0..1)写入 CSS 变量 --p,字号/间距/高度/透明度全部用 calc() 对 --p 连续插值。
   反向滚动 p 回落,样式沿同一曲线还原 —— 没有两态切换,只有一条连续曲线。 */

const COMPACT_H = 64        // 完全收缩后的 hero 高度
const scrollEl = ref(null)
const heroRef = ref(null)
let fullH = 200

const p = ref(0)            // 滚动进度(仅驱动 HUD 展示,样式走 --p 直写)
const heroH = ref(200)
const state = computed(() => (p.value < 0.02 ? 'FULL' : p.value > 0.98 ? '紧凑' : '收缩中'))

function onScroll() {
  const max = Math.max(1, fullH - COMPACT_H)
  const np = Math.min(1, Math.max(0, scrollEl.value.scrollTop / max))
  p.value = np
  heroH.value = fullH - (fullH - COMPACT_H) * np
  heroRef.value?.style.setProperty('--p', np.toFixed(4))
}

function remeasure() {
  const el = heroRef.value
  if (!el) return
  // 测量完整高度前必须把 --p 归零,否则会在收缩中途量到错误基准
  const prev = el.style.getPropertyValue('--p')
  el.style.setProperty('--p', '0')
  fullH = el.getBoundingClientRect().height
  el.style.setProperty('--p', prev)
  onScroll()
}

onMounted(() => {
  remeasure()
  window.addEventListener('resize', remeasure)
})
onBeforeUnmount(() => window.removeEventListener('resize', remeasure))

/* ---------------- 静态内容数据 ---------------- */

const metrics = [
  { label: '本周出杯', value: '9,428', unit: '杯' },
  { label: '营收', value: '¥ 75,424', unit: '' },
  { label: '平均排队', value: '3.4', unit: '分钟' },
  { label: '会员新增', value: '218', unit: '人' },
]

const spark = '0,58 24,50 48,54 72,40 96,46 120,30 144,36 168,22 192,28 216,16 240,24 264,10'

const wins = [
  { n: '经典咖啡吧', tag: '高峰', tone: 'r' },
  { n: '手冲吧台', tag: '正常', tone: 'y' },
  { n: '茶饮区', tag: '正常', tone: 'y' },
  { n: '烘焙柜', tag: '补货中', tone: 'b' },
  { n: '外卖打包', tag: '高峰', tone: 'r' },
]

const cats = [
  { n: '咖啡', v: 38 },
  { n: '茶饮', v: 24 },
  { n: '烘焙', v: 16 },
  { n: '轻食', v: 12 },
  { n: '其他', v: 10 },
]

// 品类数据色随主题切换(暖调=黄+暖灰,极简=黄绿+灰阶)
const theme = useTheme()
const darkCats = ['#ff6b4a', '#f5b93f', '#7f9dff', '#7fe0d2', '#8b8b93']
const warmCats = ['#e9a81c', '#d9b45a', '#c2b99e', '#a99f8a', '#8f8770']
const minimalCats = ['#d9e14b', '#3a3a40', '#8a8a90', '#bcbdc2', '#dddee1']
const catColors = computed(() =>
  theme.value === 'warm' ? warmCats
    : theme.value === 'minimal' ? minimalCats
      : darkCats
)

const records = [
  { c: '#ff8a5c', d: '拿铁', s: '大杯', t: '09:12', w: 'W1', k: '堂食' },
  { c: '#f5b93f', d: '澳白', s: '中杯', t: '09:47', w: 'W2', k: '外带' },
  { c: '#7f9dff', d: '冷萃', s: '大杯', t: '10:05', w: 'W1', k: '堂食' },
  { c: '#7fe0b2', d: '抹茶拿铁', s: '中杯', t: '10:38', w: 'W3', k: '外带' },
  { c: '#8b8b93', d: '美式', s: '中杯', t: '11:20', w: 'W2', k: '堂食' },
  { c: '#ffb39f', d: '卡布奇诺', s: '小杯', t: '12:02', w: 'W1', k: '堂食' },
  { c: '#c88bff', d: '摩卡', s: '大杯', t: '13:15', w: 'W3', k: '外卖' },
  { c: '#7fd7ff', d: '馥瑞白', s: '中杯', t: '13:52', w: 'W2', k: '外带' },
  { c: '#ff8a5c', d: '拿铁', s: '中杯', t: '14:26', w: 'W1', k: '堂食' },
  { c: '#f5b93f', d: '澳白', s: '大杯', t: '15:03', w: 'W3', k: '外带' },
]

const goals = [
  { n: '月度出杯目标', v: 82 },
  { n: '咖啡豆库存', v: 64 },
  { n: '会员复购率', v: 71 },
]

const logs = [
  { t: '13:52', txt: '烘焙柜完成补货,可颂恢复供应' },
  { t: '13:15', txt: 'W3 窗口开启外卖通道' },
  { t: '12:00', txt: '进入客流高峰,排队 +2.1 分钟' },
  { t: '10:30', txt: '会员「每日研磨」集点活动上线' },
]
</script>

<template>
  <div ref="scrollEl" class="sd" @scroll.passive="onScroll">
    <!-- 自带顶栏:常驻,与收缩后的指标行视觉连成一体 -->
    <div class="sd-topbar">
      <span class="sd-brand"><i />每日研磨 · 门店总览</span>
      <span class="sd-user"><i class="sd-ava">MH</i>Maya · 店长</span>
    </div>

    <!-- 吸顶指标区:--p 由滚动进度驱动 -->
    <header ref="heroRef" class="sd-hero">
      <div class="sd-greet">
        <b>早上好，店长</b>
        <span>今日客流高峰预计 12:00 —— 比昨天提前 20 分钟，建议提前备料</span>
      </div>
      <div class="sd-metrics">
        <div v-for="m in metrics" :key="m.label" class="sd-metric">
          <span class="sd-label">{{ m.label }}</span>
          <div class="sd-num">{{ m.value }}<small v-if="m.unit">{{ m.unit }}</small></div>
        </div>
      </div>
    </header>

    <div class="sd-body">
      <div class="sd-grid3">
        <section class="sd-card">
          <h4>营收走势</h4>
          <svg class="sd-spark" viewBox="0 0 264 66" preserveAspectRatio="none">
            <polyline :points="spark" fill="none" stroke="#ff8a5c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="sd-foot">较上周 <b class="up">+12.4%</b></p>
        </section>

        <section class="sd-card">
          <h4>各品类占比</h4>
          <div class="sd-stack">
            <i v-for="(c, i) in cats" :key="c.n" :style="{ width: c.v + '%', background: catColors[i] }" />
          </div>
          <div class="sd-legend">
            <div v-for="(c, i) in cats" :key="c.n" class="sd-leg">
              <i :style="{ background: catColors[i] }" /><span>{{ c.n }}</span><b>{{ c.v }}%</b>
            </div>
          </div>
        </section>

        <section class="sd-card">
          <h4>门店窗口</h4>
          <div v-for="w in wins" :key="w.n" class="sd-win">
            <b>{{ w.n }}</b>
            <i class="sd-tag" :class="w.tone">{{ w.tag }}</i>
          </div>
        </section>
      </div>

      <section class="sd-card">
        <h4>出杯记录</h4>
        <div class="sd-thead"><span>饮品</span><span>时间</span><span>窗口</span><span>类型</span><span class="sd-ok">状态</span></div>
        <div v-for="(r, i) in records" :key="i" class="sd-row">
          <span class="sd-drink"><i class="sd-dot" :style="{ background: r.c }" /><b>{{ r.d }}</b><em>{{ r.s }}</em></span>
          <span>{{ r.t }}</span>
          <span>{{ r.w }}</span>
          <span>{{ r.k }}</span>
          <em class="sd-ok">✓</em>
        </div>
      </section>

      <div class="sd-grid2">
        <section class="sd-card">
          <h4>本周目标</h4>
          <div v-for="g in goals" :key="g.n" class="sd-goal">
            <div class="sd-goal-head"><span>{{ g.n }}</span><b>{{ g.v }}%</b></div>
            <div class="sd-track"><i :style="{ width: g.v + '%' }" /></div>
          </div>
        </section>

        <section class="sd-card">
          <h4>活动日志</h4>
          <div v-for="l in logs" :key="l.t" class="sd-log">
            <span>{{ l.t }}</span>
            <p>{{ l.txt }}</p>
          </div>
        </section>
      </div>

      <div class="sd-spacer" />
    </div>

    <Teleport to="body">
      <div class="bento-hud">
        <div class="hud-row"><span>高度</span><b>{{ Math.round(heroH) }} px</b></div>
        <div class="hud-row"><span>状态</span><b>{{ state }}</b></div>
        <div class="hud-row"><span>进度</span><b>{{ Math.round(p * 100) }}%</b></div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.sd {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  /* 关键:禁用滚动锚定,否则 hero 收缩引起的内容位移会被浏览器
     用回滚 scrollTop 的方式"抵消",收缩与回滚互相振荡抵消 */
  overflow-anchor: none;
  display: flex;
  flex-direction: column;
}

/* ---- 顶栏(常驻) ---- */

.sd-topbar {
  position: sticky;
  top: 0;
  z-index: 7;
  height: 52px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
  background: rgba(18, 18, 20, 0.96);
  backdrop-filter: blur(8px);
}

.sd-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
}

.sd-brand i {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: linear-gradient(135deg, #ff8a5c, #ff5c39);
}

.sd-user {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 11.5px;
  color: var(--muted);
}

.sd-ava {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f5b93f;
  color: #17171b;
  font-size: 9.5px;
  font-weight: 800;
  font-style: normal;
  display: grid;
  place-items: center;
}

/* ---- 吸顶指标区:一切尺寸由 --p 连续插值 ---- */

.sd-hero {
  position: sticky;
  top: 52px;
  z-index: 6;
  flex: none;
  --p: 0;
  padding: calc(20px - var(--p) * 10px) 22px;
  background: rgba(18, 18, 20, 0.96);
  backdrop-filter: blur(8px);
  box-shadow: 0 calc(var(--p) * 14px) calc(var(--p) * 30px) rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, calc(var(--p) * 0.08));
}

.sd-greet {
  height: calc(56px - var(--p) * 56px);
  opacity: calc(1 - var(--p) * 1.8);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.sd-greet b {
  font-size: 20px;
  font-weight: 800;
}

.sd-greet span {
  font-size: 12px;
  color: var(--muted);
}

.sd-metrics {
  display: flex;
  gap: calc(34px - var(--p) * 16px);
  padding-top: calc(16px - var(--p) * 8px);
}

.sd-metric {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.sd-label {
  font-size: calc(11px - var(--p) * 2px);
  color: var(--muted);
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.sd-num {
  font-size: calc(38px - var(--p) * 19px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0.3px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.sd-num small {
  font-size: calc(13px - var(--p) * 4px);
  margin-left: 5px;
  color: var(--muted);
  font-weight: 600;
}

/* ---- 内容体 ---- */

.sd-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 22px 0;
}

.sd-grid3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.sd-grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sd-card {
  background: var(--card-dark);
  border-radius: 16px;
  padding: 16px 18px;
  min-width: 0;
}

.sd-card h4 {
  font-size: 12.5px;
  font-weight: 700;
  margin-bottom: 12px;
}

.sd-spark {
  width: 100%;
  height: 74px;
  display: block;
}

.sd-foot {
  margin-top: 8px;
  font-size: 11px;
  color: var(--muted);
}

.sd-foot b.up {
  color: #7fe0b2;
}

.sd-stack {
  display: flex;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
  gap: 2px;
}

.sd-stack i {
  display: block;
  border-radius: 2px;
}

.sd-legend {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.sd-leg {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
}

.sd-leg i {
  width: 8px;
  height: 8px;
  border-radius: 3px;
}

.sd-leg span {
  color: var(--muted);
}

.sd-leg b {
  margin-left: auto;
  font-weight: 700;
}

.sd-win {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 10px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 7px;
  font-size: 12px;
}

.sd-win b {
  font-weight: 700;
}

.sd-tag {
  font-style: normal;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.sd-tag.r { background: rgba(255, 107, 74, 0.18); color: #ffb39f; }
.sd-tag.y { background: rgba(245, 185, 63, 0.15); color: var(--yellow); }
.sd-tag.b { background: rgba(127, 157, 255, 0.15); color: #9db4ff; }

.sd-thead,
.sd-row {
  display: grid;
  grid-template-columns: 1.25fr 1.1fr 0.55fr 0.55fr 34px;
  gap: 12px;
  align-items: center;
  padding: 8px 6px;
}

.sd-thead {
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--line);
}

.sd-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 12px;
}

.sd-drink {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.sd-drink b { font-weight: 700; }

.sd-drink em {
  font-style: normal;
  color: var(--muted);
  font-size: 11px;
}

.sd-dot {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  flex: none;
}

.sd-row > span:nth-child(2) {
  color: var(--muted);
  font-size: 11.5px;
}

.sd-ok {
  font-style: normal;
  color: #7fe0b2;
  text-align: right;
  font-weight: 700;
}

.sd-thead .sd-ok {
  color: var(--muted);
}

.sd-goal {
  margin-bottom: 14px;
}

.sd-goal-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 7px;
}

.sd-goal-head span {
  color: var(--muted);
}

.sd-track {
  height: 7px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.sd-track i {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #ff8a5c, #ff5c39);
}

.sd-log {
  display: flex;
  gap: 12px;
  padding: 8px 2px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.07);
  font-size: 12px;
}

.sd-log:last-child {
  border-bottom: none;
}

.sd-log span {
  color: var(--muted);
  font-size: 11px;
  flex: none;
  font-variant-numeric: tabular-nums;
}

.sd-log p {
  line-height: 1.45;
}

.sd-spacer {
  height: 40px;
  flex: none;
}
</style>
