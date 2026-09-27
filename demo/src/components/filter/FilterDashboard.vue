<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTweenNumber } from '../../composables/useTweenNumber'
import { useTheme } from '../../theme'

/* ---------------- 筛选状态 ---------------- */

const range = ref('本周')
const state = reactive({ dept: '全部门', staff: '全体人员' })
const openMenu = ref(null)
const activeTab = ref('已完成')

const rangeKeys = ['今天', '本周', '本月']
const menus = [
  { key: 'dept', options: ['全部门', '前场', '后场'] },
  { key: 'staff', options: ['全体人员', '咖啡师', '收银', '烘焙'] },
]
const tabs = ['已完成', '制作中', '已预约']

// 筛选因子:下拉切换改变数据规模,与范围切换走同一条补间链路
const DEPT = { 全部门: 1, 前场: 0.62, 后场: 0.38 }
const STAFF = { 全体人员: 1, 咖啡师: 0.55, 收银: 0.28, 烘焙: 0.17 }

/* ---------------- 数据(各范围合计与图表分项严格对齐) ---------------- */

const DATA = {
  '今天': {
    total: 1842,
    subs: [812, 688, 342],
    chart: { labels: ['8时', '10时', '12时', '14时', '16时', '18时', '20时'], values: [180, 320, 420, 260, 380, 240, 42] },
    cats: [41, 22, 15, 13, 9],
  },
  '本周': {
    total: 9428,
    subs: [4120, 3480, 1828],
    chart: { labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], values: [1080, 1842, 1520, 1290, 1650, 968, 1078] },
    cats: [38, 24, 16, 12, 10],
  },
  '本月': {
    total: 38206,
    subs: [16720, 14060, 7426],
    chart: { labels: ['1–4日', '5–9日', '10–13日', '14–17日', '18–21日', '22–26日', '27–30日'], values: [5210, 5840, 6120, 5460, 5980, 4980, 4616] },
    cats: [37, 25, 17, 12, 9],
  },
}

const catNames = ['咖啡', '茶饮', '烘焙', '轻食', '其他']
// 品类数据色随主题:暖调=黄+暖灰,撞色=高饱和,极简=黄绿+灰阶
const theme = useTheme()
const darkCats = ['#ff6b4a', '#f5b93f', '#7f9dff', '#7fe0d2', '#8b8b93']
const warmCats = ['#e9a81c', '#d9b45a', '#c2b99e', '#a99f8a', '#8f8770']
const minimalCats = ['#d9e14b', '#3a3a40', '#8a8a90', '#bcbdc2', '#dddee1']
const catColors = computed(() =>
  theme.value === 'warm' ? warmCats
    : theme.value === 'minimal' ? minimalCats
      : darkCats
)
const subNames = ['到店', '外带', '外卖']

const rowsByRange = {
  '今天': [
    { c: '#ff8a5c', drink: '拿铁', spec: '大杯', time: '09:12', win: 'W1', type: '堂食' },
    { c: '#f5b93f', drink: '澳白', spec: '中杯', time: '09:47', win: 'W2', type: '外带' },
    { c: '#7f9dff', drink: '冷萃', spec: '大杯', time: '10:05', win: 'W1', type: '堂食' },
    { c: '#7fe0b2', drink: '抹茶拿铁', spec: '中杯', time: '10:38', win: 'W3', type: '外带' },
    { c: '#8b8b93', drink: '美式', spec: '中杯', time: '11:20', win: 'W2', type: '堂食' },
    { c: '#ffb39f', drink: '卡布奇诺', spec: '小杯', time: '12:02', win: 'W1', type: '堂食' },
    { c: '#c88bff', drink: '摩卡', spec: '大杯', time: '13:15', win: 'W3', type: '外卖' },
    { c: '#7fd7ff', drink: '馥瑞白', spec: '中杯', time: '13:52', win: 'W2', type: '外带' },
  ],
  '本周': [
    { c: '#ff8a5c', drink: '拿铁', spec: '大杯', time: '周一 09:12', win: 'W1', type: '堂食' },
    { c: '#c88bff', drink: '摩卡', spec: '中杯', time: '周一 10:05', win: 'W3', type: '外卖' },
    { c: '#7fd7ff', drink: '馥瑞白', spec: '大杯', time: '周二 08:47', win: 'W2', type: '堂食' },
    { c: '#8b8b93', drink: '美式', spec: '中杯', time: '周三 11:20', win: 'W1', type: '外带' },
    { c: '#7fe0b2', drink: '抹茶拿铁', spec: '中杯', time: '周四 09:31', win: 'W2', type: '堂食' },
    { c: '#f5b93f', drink: '澳白', spec: '小杯', time: '周五 12:02', win: 'W1', type: '堂食' },
    { c: '#ff8a5c', drink: '拿铁', spec: '中杯', time: '周六 15:44', win: 'W3', type: '外卖' },
    { c: '#7f9dff', drink: '冷萃', spec: '大杯', time: '周日 16:18', win: 'W2', type: '外带' },
  ],
  '本月': [
    { c: '#ff8a5c', drink: '拿铁', spec: '大杯', time: '9/01 09:12', win: 'W1', type: '堂食' },
    { c: '#8b8b93', drink: '美式', spec: '中杯', time: '9/03 10:26', win: 'W2', type: '外带' },
    { c: '#7fd7ff', drink: '馥瑞白', spec: '中杯', time: '9/07 11:41', win: 'W1', type: '堂食' },
    { c: '#ffb39f', drink: '卡布奇诺', spec: '小杯', time: '9/12 08:58', win: 'W3', type: '堂食' },
    { c: '#f5b93f', drink: '澳白', spec: '大杯', time: '9/16 13:07', win: 'W2', type: '外带' },
    { c: '#7fe0b2', drink: '抹茶拿铁', spec: '中杯', time: '9/19 15:33', win: 'W1', type: '外卖' },
    { c: '#c88bff', drink: '摩卡', spec: '中杯', time: '9/24 10:12', win: 'W3', type: '堂食' },
    { c: '#7f9dff', drink: '冷萃', spec: '大杯', time: '9/28 16:45', win: 'W2', type: '外带' },
  ],
}

/* ---------------- 派生数据(因子缩放)与补间 ---------------- */

const base = computed(() => DATA[range.value])
const factor = computed(() => DEPT[state.dept] * STAFF[state.staff])

const totalSrc = computed(() => Math.round(base.value.total * factor.value))
const totalTween = useTweenNumber(totalSrc)

const subSrcs = computed(() => base.value.subs.map(v => Math.round(v * factor.value)))
const subTweens = [0, 1, 2].map(i => useTweenNumber(computed(() => subSrcs.value[i])))

const chartPoints = computed(() =>
  base.value.chart.labels.map((x, i) => ({ x, v: Math.round(base.value.chart.values[i] * factor.value) }))
)
const maxV = computed(() => Math.max(...chartPoints.value.map(p => p.v)))

// 品类占比不受筛选因子影响,但随范围切换补间
const catTweens = catNames.map((_, i) => useTweenNumber(computed(() => base.value.cats[i])))

const rows = computed(() => rowsByRange[range.value])

const wins = [
  { n: '经典咖啡吧', tag: '高峰', tone: 'r', v: 486 },
  { n: '手冲吧台', tag: '正常', tone: 'y', v: 213 },
  { n: '茶饮区', tag: '正常', tone: 'y', v: 342 },
  { n: '烘焙柜', tag: '补货中', tone: 'b', v: 158 },
  { n: '轻食区', tag: '闲时', tone: 'g', v: 96 },
  { n: '外卖打包', tag: '高峰', tone: 'r', v: 521 },
]

const fmt = n => Math.round(n).toLocaleString('en-US')

/* ---------------- 下拉菜单 ---------------- */

function closeMenus() { openMenu.value = null }
onMounted(() => window.addEventListener('click', closeMenus))
onBeforeUnmount(() => window.removeEventListener('click', closeMenus))
</script>

<template>
  <div class="fd">
    <!-- 固定在顶部的全局筛选条 -->
    <div class="fd-bar">
      <div class="fd-seg">
        <button
          v-for="r in rangeKeys"
          :key="r"
          class="fd-pill"
          :class="{ on: range === r }"
          @click="range = r"
        >{{ r }}</button>
      </div>
      <i class="fd-divider" />
      <div v-for="m in menus" :key="m.key" class="fd-menu-wrap">
        <button
          class="fd-menu"
          :class="{ on: openMenu === m.key }"
          @click.stop="openMenu = openMenu === m.key ? null : m.key"
        >
          {{ state[m.key] }}
          <svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        <div v-if="openMenu === m.key" class="fd-options">
          <button
            v-for="o in m.options"
            :key="o"
            :class="{ on: state[m.key] === o }"
            @click="state[m.key] = o; openMenu = null"
          >{{ o }}</button>
        </div>
      </div>
    </div>

    <div class="fd-body">
      <!-- 左:窗口列表 -->
      <aside class="fd-list">
        <h4>出杯窗口</h4>
        <div v-for="w in wins" :key="w.n" class="fd-win">
          <div class="fd-win-head"><b>{{ w.n }}</b><i class="fd-tag" :class="w.tone">{{ w.tag }}</i></div>
          <span>今日 {{ w.v }} 杯</span>
        </div>
        <button class="fd-add">新增窗口</button>
      </aside>

      <!-- 右:主内容 -->
      <div class="fd-main">
        <div class="fd-hero-row">
          <div class="fd-hero">
            <div class="fd-hero-num">
              <span class="fd-big">{{ fmt(totalTween) }}</span>
              <span class="fd-unit">出杯 · {{ range }}</span>
            </div>
            <div class="fd-subs">
              <div v-for="(t, i) in subTweens" :key="i" class="fd-sub">
                <span>{{ subNames[i] }}</span>
                <b>{{ fmt(t.value) }}</b>
              </div>
            </div>
          </div>

          <div class="fd-brand">
            <div class="fd-brand-logo">每日研磨<span>THE DAILY GRIND</span></div>
            <div class="fd-brand-row"><span>会员集点</span><b>9 / 10</b></div>
            <div class="fd-brand-switch"><i /></div>
          </div>
        </div>

        <div class="fd-tabs">
          <button
            v-for="t in tabs"
            :key="t"
            :class="{ on: activeTab === t }"
            @click="activeTab = t"
          >{{ t }}</button>
        </div>

        <div class="fd-charts">
          <section class="fd-card">
            <h4>每日出杯量</h4>
            <div class="fd-bars">
              <div v-for="(p, i) in chartPoints" :key="i" class="fd-vcol">
                <div class="fd-varea">
                  <i
                    class="fd-vbar"
                    :class="{ top: p.v === maxV }"
                    :style="{ height: (p.v / maxV) * 100 + '%' }"
                  />
                </div>
                <span>{{ p.x }}</span>
              </div>
            </div>
          </section>

          <section class="fd-card">
            <h4>各品类占比</h4>
            <div class="fd-stack">
              <i
                v-for="(c, i) in catTweens"
                :key="i"
                :style="{ width: c.value + '%', background: catColors[i] }"
              />
            </div>
            <div class="fd-legend">
              <div v-for="(c, i) in catTweens" :key="i" class="fd-leg">
                <i :style="{ background: catColors[i] }" />
                <span>{{ catNames[i] }}</span>
                <b>{{ Math.round(c.value) }}%</b>
              </div>
            </div>
          </section>
        </div>

        <section class="fd-card fd-table">
          <h4>出杯记录</h4>
          <div class="fd-thead">
            <span>饮品</span><span>时间</span><span>窗口</span><span>类型</span><span class="fd-ok">状态</span>
          </div>
          <div :key="range + state.dept + state.staff" class="fd-rows">
            <div
              v-for="(r, i) in rows"
              :key="i"
              class="fd-row"
              :style="{ animationDelay: i * 35 + 'ms' }"
            >
              <span class="fd-drink"><i class="fd-dot" :style="{ background: r.c }" /><b>{{ r.drink }}</b><em>{{ r.spec }}</em></span>
              <span>{{ r.time }}</span>
              <span>{{ r.win }}</span>
              <span>{{ r.type }}</span>
              <em class="fd-ok">✓</em>
            </div>
          </div>
        </section>
      </div>
    </div>

    <Teleport to="body">
      <div class="bento-hud">
        <div class="hud-row"><span>范围</span><b>{{ range }}</b></div>
        <div class="hud-row"><span>总量</span><b>{{ fmt(totalTween) }}</b></div>
        <div class="hud-row"><span>更新</span><b>补间</b></div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.fd {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* ---- 固定筛选条 ---- */

.fd-bar {
  position: sticky;
  top: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: rgba(18, 18, 20, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
  flex: none;
}

.fd-seg {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  padding: 3px;
}

.fd-pill {
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.fd-pill.on {
  background: linear-gradient(135deg, #ff8a5c, #ff5c39);
  color: #fff;
}

.fd-divider {
  width: 1px;
  height: 22px;
  background: var(--line);
}

.fd-menu-wrap {
  position: relative;
}

.fd-menu {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.fd-menu:hover,
.fd-menu.on {
  border-color: rgba(255, 138, 92, 0.6);
  background: rgba(255, 107, 74, 0.08);
}

.fd-menu svg {
  width: 11px;
  height: 11px;
  fill: none;
  stroke: var(--muted);
  stroke-width: 2.4;
  stroke-linecap: round;
}

.fd-options {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  background: #1d1d21;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
}

.fd-options button {
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}

.fd-options button:hover {
  background: rgba(255, 255, 255, 0.06);
}

.fd-options button.on {
  color: #ff8a5c;
  font-weight: 700;
}

/* ---- 布局 ---- */

.fd-body {
  display: grid;
  grid-template-columns: 224px 1fr;
  gap: 12px;
  padding: 12px 18px 18px;
  align-items: start;
}

.fd-list {
  background: var(--card-dark);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.fd-list h4 {
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 2px;
}

.fd-win {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 10px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.03);
}

.fd-win-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.fd-win-head b {
  font-size: 12.5px;
  font-weight: 700;
}

.fd-win > span {
  font-size: 10.5px;
  color: var(--muted);
}

.fd-tag {
  font-style: normal;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex: none;
}

.fd-tag.r { background: rgba(255, 107, 74, 0.18); color: #ffb39f; }
.fd-tag.y { background: rgba(245, 185, 63, 0.15); color: var(--yellow); }
.fd-tag.b { background: rgba(127, 157, 255, 0.15); color: #9db4ff; }
.fd-tag.g { background: rgba(127, 224, 178, 0.14); color: #7fe0b2; }

.fd-add {
  margin-top: 6px;
  height: 36px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(135deg, #ff8a5c, #ff5c39);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.fd-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

/* ---- KPI ---- */

.fd-hero-row {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.fd-hero {
  flex: 1;
  background: var(--card-dark);
  border-radius: 16px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-width: 0;
}

.fd-big {
  font-size: 54px;
  font-weight: 800;
  letter-spacing: 0.5px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.fd-unit {
  font-size: 12px;
  color: var(--muted);
  margin-left: 12px;
  font-weight: 600;
}

.fd-subs {
  display: flex;
  gap: 0;
}

.fd-sub {
  padding: 0 22px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fd-sub:first-child {
  border-left: none;
}

.fd-sub span {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--muted);
  font-weight: 600;
}

.fd-sub b {
  font-size: 22px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.fd-brand {
  width: 216px;
  flex: none;
  border-radius: 16px;
  background: linear-gradient(140deg, #ffc24b, #ff9a3d);
  color: #17171b;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fd-brand-logo {
  font-size: 16px;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fd-brand-logo span {
  font-size: 8px;
  letter-spacing: 2.5px;
  opacity: 0.65;
}

.fd-brand-row {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  font-weight: 600;
  opacity: 0.85;
}

.fd-brand-row b {
  font-weight: 800;
}

.fd-brand-switch {
  width: 54px;
  height: 28px;
  border-radius: 999px;
  background: #17171b;
  position: relative;
}

.fd-brand-switch i {
  position: absolute;
  right: 3px;
  top: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
}

/* ---- tabs ---- */

.fd-tabs {
  display: flex;
  gap: 8px;
}

.fd-tabs button {
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.fd-tabs button.on {
  background: rgba(255, 107, 74, 0.15);
  color: #ffb39f;
}

/* ---- 卡片与图表 ---- */

.fd-card {
  background: var(--card-dark);
  border-radius: 16px;
  padding: 16px 18px;
  min-width: 0;
}

.fd-card h4 {
  font-size: 12.5px;
  font-weight: 700;
  margin-bottom: 12px;
}

.fd-charts {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 12px;
}

.fd-bars {
  display: flex;
  gap: 3%;
  height: 172px;
}

.fd-vcol {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fd-varea {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

.fd-vbar {
  display: block;
  width: 100%;
  max-width: 40px;
  margin: 0 auto;
  background: rgba(255, 138, 92, 0.5);
  border-radius: 7px 7px 2px 2px;
  transition: height 0.6s cubic-bezier(0.22, 0.85, 0.28, 1.02), background 0.3s;
}

.fd-vbar.top {
  background: linear-gradient(180deg, #ff8a5c, #ff5c39);
}

.fd-barcol > span {
  margin-top: 8px;
  text-align: center;
  font-size: 9px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
}

.fd-stack {
  display: flex;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
  gap: 2px;
}

.fd-stack i {
  display: block;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.22, 0.85, 0.28, 1.02);
}

.fd-legend {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px 18px;
}

.fd-leg {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
}

.fd-leg i {
  width: 8px;
  height: 8px;
  border-radius: 3px;
  flex: none;
}

.fd-leg span {
  color: var(--muted);
}

.fd-leg b {
  margin-left: auto;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ---- 记录表 ---- */

.fd-thead,
.fd-row {
  display: grid;
  grid-template-columns: 1.25fr 1.1fr 0.55fr 0.55fr 34px;
  align-items: center;
  gap: 12px;
  padding: 8px 6px;
}

.fd-thead {
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--line);
}

.fd-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 12px;
  animation: fd-row-in 0.32s ease both;
}

@keyframes fd-row-in {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: none; }
}

.fd-drink {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.fd-drink b {
  font-weight: 700;
}

.fd-drink em {
  font-style: normal;
  color: var(--muted);
  font-size: 11px;
}

.fd-dot {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  flex: none;
}

.fd-row > span:nth-child(2) {
  color: var(--muted);
  font-size: 11.5px;
}

.fd-ok {
  font-style: normal;
  color: #7fe0b2;
  text-align: right;
  font-weight: 700;
}

.fd-thead .fd-ok {
  color: var(--muted);
}
</style>
