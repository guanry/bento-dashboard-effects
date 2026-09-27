<script setup>
import { computed, ref, watch } from 'vue'
import Sidebar from './components/Sidebar.vue'
import BentoGrid from './components/BentoGrid.vue'
import FilterDashboard from './components/filter/FilterDashboard.vue'
import LinkedCharts from './components/linked/LinkedCharts.vue'
import StickyHeader from './components/sticky/StickyHeader.vue'
import MasterDetail from './components/master/MasterDetail.vue'
import { useBentoGrid } from './composables/useBentoGrid'
import { useTheme, setTheme } from './theme'

const theme = useTheme()
const activeDemo = ref('bento')

const DEMO_META = {
  bento: { badge: '01', title: '可以拖动的模块网格', sub: 'BENTO DRAG · VUE 3 + VITE', hint: '按住任意模块拖动 —— 其余模块平滑让位，松手自动吸附到最近格位；点击卡片可原位放大' },
  filter: { badge: '03', title: '顶部筛选全局联动', sub: 'GLOBAL FILTER · VUE 3 + VITE', hint: '切换顶部筛选 —— 指标数字滚动补间、图表平滑插值、不整页刷新' },
  linked: { badge: '04', title: '图表悬停联动', sub: 'LINKED HOVER · VUE 3 + VITE', hint: '悬停任意图表 —— 三张图表同步高亮同一数据点，其余降低透明度，共用一条竖向参考线' },
  sticky: { badge: '05', title: '指标区滚动吸顶', sub: 'STICKY HEADER · VUE 3 + VITE', hint: '滚动页面 —— 大号指标由滚动进度驱动字号与间距，收成单行贴顶，反向滚动连续还原' },
  master: { badge: '06', title: '列表加右侧详情抽屉', sub: 'MASTER DETAIL · VUE 3 + VITE', hint: '点击行右侧滑出详情抽屉 —— 列表压窄保持可见、当前行高亮、键盘 ↑/↓ 切换只刷新面板内容' },
}
const meta = computed(() => DEMO_META[activeDemo.value])

/* 强对比主题的"主卡构图":一张大卡占住视觉中心,其余压小衬托 */
const BASE_LAYOUT = [
  { id: 'venue', title: '场馆容量', x: 0, y: 0, w: 2, h: 1 },
  { id: 'staff', title: '人员负载', x: 2, y: 0, w: 2, h: 1 },
  { id: 'throughput', title: '出杯量', x: 0, y: 1, w: 2, h: 2 },
  { id: 'ai', title: 'AI 运营助手', x: 2, y: 1, w: 2, h: 1 },
  { id: 'points', title: '积分', x: 2, y: 2, w: 1, h: 1 },
  { id: 'timing', title: '营业时间', x: 3, y: 2, w: 1, h: 1 },
]
const BOLD_LAYOUT = [
  { id: 'throughput', title: '出杯量', x: 0, y: 0, w: 2, h: 2 },
  { id: 'staff', title: '人员负载', x: 2, y: 0, w: 2, h: 1 },
  { id: 'venue', title: '场馆容量', x: 2, y: 1, w: 2, h: 1 },
  { id: 'points', title: '积分', x: 0, y: 2, w: 1, h: 1 },
  { id: 'timing', title: '营业时间', x: 1, y: 2, w: 1, h: 1 },
  { id: 'ai', title: 'AI 运营助手', x: 2, y: 2, w: 2, h: 1 },
]
/* 氛围沉浸主题:打破常规网格 —— 12×6 细网格上的错落玻璃拼贴 */
const IMMERSIVE_LAYOUT = [
  { id: 'venue', title: '场馆容量', x: 0, y: 0, w: 5, h: 2 },
  { id: 'ai', title: 'AI 运营助手', x: 0, y: 2, w: 5, h: 2 },
  { id: 'points', title: '积分', x: 0, y: 4, w: 5, h: 2 },
  { id: 'throughput', title: '出杯量', x: 5, y: 0, w: 7, h: 3 },
  { id: 'timing', title: '营业时间', x: 5, y: 3, w: 3, h: 3 },
  { id: 'staff', title: '人员负载', x: 8, y: 3, w: 4, h: 3 },
]
/* 图卡内容主题:照片当主角 —— 左档案栏 + 四图卡 + 宽详情 */
const CONTENT_LAYOUT = [
  { id: 'points', title: '个人档案', x: 0, y: 0, w: 3, h: 6 },
  { id: 'venue', title: '京都', x: 3, y: 0, w: 3, h: 3 },
  { id: 'ai', title: '圣托里尼', x: 6, y: 0, w: 3, h: 3 },
  { id: 'staff', title: '里斯本', x: 9, y: 0, w: 3, h: 3 },
  { id: 'timing', title: '马拉喀什', x: 3, y: 3, w: 3, h: 3 },
  { id: 'throughput', title: 'Details', x: 6, y: 3, w: 6, h: 3 },
]
watch(theme, t => {
  if (t === 'bold') grid.setGrid(4, 3, BOLD_LAYOUT)
  else if (t === 'immersive') grid.setGrid(12, 6, IMMERSIVE_LAYOUT)
  else if (t === 'content') grid.setGrid(12, 6, CONTENT_LAYOUT)
  else grid.setGrid(4, 3, BASE_LAYOUT)
})

const grid = useBentoGrid(BASE_LAYOUT, { cols: 4, rows: 3, gap: 12 })
// 刷新时若上次停在撞色/沉浸/图卡主题,直接以对应构图呈现
if (theme.value === 'bold') grid.setGrid(4, 3, BOLD_LAYOUT)
if (theme.value === 'immersive') grid.setGrid(12, 6, IMMERSIVE_LAYOUT)
if (theme.value === 'content') grid.setGrid(12, 6, CONTENT_LAYOUT)
</script>

<template>
  <div class="stage">
    <header class="stage-head">
      <span class="stage-badge">{{ meta.badge }}</span>
      <div class="stage-titles">
        <h1>{{ meta.title }}</h1>
        <p>{{ meta.sub }}</p>
      </div>
      <div class="demo-tabs">
        <button :class="{ on: activeDemo === 'bento' }" @click="activeDemo = 'bento'">01 · 02 拖拽与放大</button>
        <button :class="{ on: activeDemo === 'filter' }" @click="activeDemo = 'filter'">03 全局筛选</button>
        <button :class="{ on: activeDemo === 'linked' }" @click="activeDemo = 'linked'">04 图表悬停</button>
        <button :class="{ on: activeDemo === 'sticky' }" @click="activeDemo = 'sticky'">05 滚动吸顶</button>
        <button :class="{ on: activeDemo === 'master' }" @click="activeDemo = 'master'">06 详情抽屉</button>
      </div>
      <div class="theme-toggle">
        <button :class="{ on: theme === 'warm' }" @click="setTheme('warm')" title="暖调留白">暖</button>
        <button :class="{ on: theme === 'dark' }" @click="setTheme('dark')" title="深色">深</button>
        <button :class="{ on: theme === 'bold' }" @click="setTheme('bold')" title="强对比视觉">撞</button>
        <button :class="{ on: theme === 'minimal' }" @click="setTheme('minimal')" title="极简数据">简</button>
        <button :class="{ on: theme === 'immersive' }" @click="setTheme('immersive')" title="氛围沉浸">浸</button>
        <button :class="{ on: theme === 'content' }" @click="setTheme('content')" title="图卡内容">图</button>
      </div>
    </header>

    <div class="app-window">
      <Sidebar />
      <div class="app-main">
        <template v-if="activeDemo === 'bento'">
          <header class="topbar">
            <div class="crumbs">
              <b>仪表盘</b><i>/</i><span>总览</span>
            </div>
            <div class="topbar-right">
              <button class="round-btn" aria-label="搜索">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5 21 21" /></svg>
              </button>
              <button class="shop-pill">
                每日研磨 · 纽约店
                <svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <button class="round-btn has-dot" aria-label="通知">
                <svg viewBox="0 0 24 24">
                  <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
                  <path d="M10.3 20a2 2 0 0 0 3.4 0" />
                </svg>
              </button>
            </div>
          </header>

          <div class="bento-wrap">
            <BentoGrid :grid="grid" />
          </div>
        </template>

        <FilterDashboard v-else-if="activeDemo === 'filter'" />
        <LinkedCharts v-else-if="activeDemo === 'linked'" />
        <StickyHeader v-else-if="activeDemo === 'sticky'" />
        <MasterDetail v-else />
      </div>
    </div>

    <p class="stage-hint">{{ meta.hint }}</p>
  </div>
</template>

<style scoped>
.stage {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 26px 20px 26px;
}

.stage-head {
  display: flex;
  gap: 12px;
  align-items: center;
  width: min(1240px, 96vw);
  /* 右侧留出 HUD 面板的固定位置,避免遮挡 */
  padding-right: 210px;
}

.stage-badge {
  width: 40px;
  height: 40px;
  background: var(--accent);
  color: #fff;
  font-weight: 800;
  display: grid;
  place-items: center;
  border-radius: 10px;
  font-size: 15px;
  flex: none;
}

.stage-titles h1 {
  font-size: 18px;
  letter-spacing: 0.5px;
}

.stage-titles p {
  font-size: 10px;
  letter-spacing: 2.5px;
  color: var(--muted);
  margin-top: 3px;
}

.demo-tabs {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.demo-tabs button {
  height: 34px;
  padding: 0 11px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: var(--muted);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.demo-tabs button:hover {
  color: var(--text);
}

.demo-tabs button.on {
  background: var(--accent, #ff6b2c);
  border-color: transparent;
  color: var(--accent-ink, #fff);
}

.theme-toggle {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.theme-toggle button {
  width: 34px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}

.theme-toggle button.on {
  background: var(--accent, #ff6b2c);
  color: #fff;
}

html[data-theme='warm'] .theme-toggle {
  border-color: rgba(34, 28, 19, 0.16);
}

html[data-theme='warm'] .theme-toggle button.on {
  background: var(--accent);
  color: var(--accent-ink);
}

.app-window {
  width: min(1240px, 96vw);
  height: min(800px, 84vh);
  min-height: 620px;
  background: var(--panel);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 22px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.55);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-bottom: 1px solid var(--line);
  flex: none;
}

.crumbs {
  font-size: 13px;
  color: var(--muted);
  display: flex;
  gap: 8px;
  align-items: center;
}

.crumbs b {
  color: var(--text);
  font-weight: 600;
}

.crumbs i {
  opacity: 0.4;
  font-style: normal;
}

.topbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.round-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: var(--text);
  display: grid;
  place-items: center;
  cursor: pointer;
  position: relative;
}

.round-btn svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.round-btn.has-dot::after {
  content: '';
  position: absolute;
  top: 7px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.shop-pill {
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f4f4f5;
  color: #141416;
  font-size: 12px;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.shop-pill svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
}

.bento-wrap {
  flex: 1;
  min-height: 0;
  padding: 16px;
}

.stage-hint {
  font-size: 12px;
  color: var(--muted);
}
</style>
