<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

/* 主从布局(Master Detail):
   - 点击行:抽屉从右侧滑出,列表压窄但保持可见
   - 当前行高亮;键盘 ↑/↓ 切换时抽屉宽度不变,只刷新面板内容
   - Esc / 再次点击当前行 关闭 */

const DRAWER_W = 340

const items = [
  { id: 0, name: 'Orbit 磨豆机 EK43', spec: '研磨 · 主吧台', cat: '研磨', tone: '#ff8a5c', stock: 3, days: 9, cap: '6.4 L', tag: '补货', t2: 'r', bars: [42, 38, 45, 40, 36, 30, 52] },
  { id: 1, name: 'Theta S 手冲壶', spec: '手冲 · 细口', cat: '手冲', tone: '#7fd7ff', stock: 8, days: 45, cap: '1.0 L', tag: '在用', t2: 'y', bars: [22, 26, 24, 30, 28, 25, 27] },
  { id: 2, name: 'Linea 半自动咖啡机', spec: '萃取 · 主吧台', cat: '萃取', tone: '#f5b93f', stock: 2, days: 214, cap: '12 L', tag: '在用', t2: 'y', bars: [61, 58, 64, 60, 66, 55, 59] },
  { id: 3, name: '冷萃塔 Tower', spec: '冷萃 · 后场', cat: '冷萃', tone: '#7fe0b2', stock: 4, days: 12, cap: '6.4 L', tag: '检修', t2: 'b', bars: [12, 14, 10, 16, 11, 13, 9] },
  { id: 4, name: 'Sample 烘豆机', spec: '烘焙 · 后场', cat: '烘焙', tone: '#c88bff', stock: 1, days: 302, cap: '0.5 L', tag: '借出', t2: 'g', bars: [5, 7, 6, 8, 4, 6, 5] },
  { id: 5, name: 'Pearl 电子秤', spec: '称量 · 全店', cat: '称量', tone: '#8b8b93', stock: 9, days: 88, cap: '0.2 L', tag: '在用', t2: 'y', bars: [31, 29, 33, 30, 35, 28, 32] },
  { id: 6, name: 'Nova 奶泡机', spec: '吧台 · 辅助', cat: '吧台', tone: '#ffb39f', stock: 5, days: 61, cap: '0.6 L', tag: '补货', t2: 'r', bars: [18, 20, 17, 21, 19, 22, 18] },
]

const query = ref('')
const selected = ref(null) // 当前选中行的 id(null = 抽屉关闭)
const listEl = ref(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items
  return items.filter(it => (it.name + it.spec + it.cat).toLowerCase().includes(q))
})

const current = computed(() => filtered.value.find(it => it.id === selected.value) ?? null)

function toggle(it) {
  selected.value = selected.value === it.id ? null : it.id
}

function close() {
  selected.value = null
}

function move(step) {
  const list = filtered.value
  if (!list.length) return
  if (selected.value === null) {
    selected.value = list[step > 0 ? 0 : list.length - 1].id
  } else {
    const idx = list.findIndex(it => it.id === selected.value)
    const next = (idx + step + list.length) % list.length
    selected.value = list[next].id
  }
  nextTick(() => {
    listEl.value?.querySelector('.md-row.active')?.scrollIntoView({ block: 'nearest' })
  })
}

function onKey(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
  else if (e.key === 'Escape') close()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const maxBar = computed(() => current.value ? Math.max(...current.value.bars) : 1)
</script>

<template>
  <div class="md">
    <div class="md-body" :class="{ open: current }">
      <div class="md-main">
        <div class="md-cards">
          <div class="md-stat md-stat-y">
            <h4>在库器具 <b>94 件</b></h4>
            <div class="md-stat-rows">
              <span>待保养 <b>1</b></span>
              <span>待调拨 <b>3</b></span>
              <span>已借出 <b>14</b></span>
            </div>
          </div>
          <div class="md-stat md-stat-o">
            <h4>本月领用 <b>732 次</b></h4>
            <span class="md-stat-sub">较上月 +4% · 高峰在周末</span>
          </div>
          <div class="md-stat md-stat-d">
            <i class="md-stat-tile" />
            <div><b>生豆 5 袋</b><span>已入库 · 待烘焙排期</span></div>
          </div>
        </div>

        <div class="md-search">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5 21 21" /></svg>
          <input v-model="query" placeholder="搜索名称 / 品类 / 位置" />
        </div>

        <div class="md-list" ref="listEl">
          <div class="md-thead"><span>产品</span><span>库存</span><span>月均消耗</span><span class="md-c-status">状态</span></div>
          <div
            v-for="it in filtered"
            :key="it.id"
            class="md-row"
            :class="{ active: selected === it.id }"
            @click="toggle(it)"
          >
            <span class="md-prod">
              <i class="md-tile" :style="{ background: `linear-gradient(135deg, ${it.tone}, #17171b)` }" />
              <span class="md-prod-txt"><b>{{ it.name }}</b><em>{{ it.spec }}</em></span>
            </span>
            <span>{{ it.stock }} 件</span>
            <span>{{ it.cap }}</span>
            <span class="md-c-status"><i class="md-badge" :class="it.t2">{{ it.tag }}</i></span>
          </div>
          <p v-if="!filtered.length" class="md-empty">没有匹配的器具</p>
        </div>
      </div>

      <!-- 详情抽屉:宽度 0 → 340px 过渡,列表压窄保持可见 -->
      <aside class="md-drawer" :class="{ open: current }">
        <div class="md-drawer-inner" v-if="current">
          <button class="md-close" aria-label="关闭" @click="close">
            <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19" /></svg>
          </button>

          <!-- key 强制重渲染:内容立即切换;入场动画纯 CSS,不依赖 transitionend,
               后台标签页定时器被节流时也不会卡住面板 -->
          <div :key="current.id" class="md-panel">
            <div class="md-visual" :style="{ background: `linear-gradient(150deg, ${current.tone} 0%, #1c1c20 78%)` }">
              <svg viewBox="0 0 24 24">
                <path d="M5 7h11v7a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" />
                <path d="M16 8.5h1.6a2.4 2.4 0 0 1 0 4.8H16" />
                <path d="M8 3.5v2M11 3.5v2M14 3.5v2" />
              </svg>
            </div>
            <i class="md-cat">{{ current.cat }}</i>
            <h3>{{ current.name }}</h3>
            <p class="md-spec">{{ current.spec }}</p>
            <div class="md-stats">
              <div><span>库存</span><b>{{ current.stock }} 台</b></div>
              <div><span>在用</span><b>{{ current.days }} 天</b></div>
              <div><span>月耗</span><b>{{ current.cap }}</b></div>
            </div>
            <p class="md-bars-title">近 7 日用量</p>
            <div class="md-bars">
              <i
                v-for="(b, i) in current.bars"
                :key="i"
                :class="{ top: b === Math.max(...current.bars) }"
                :style="{ height: (b / maxBar) * 100 + '%' }"
              />
            </div>
            <div class="md-actions">
              <button class="md-btn ghost">报修</button>
              <button class="md-btn main">调拨</button>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <Teleport to="body">
      <div class="bento-hud">
        <div class="hud-row"><span>抽屉</span><b>{{ current ? DRAWER_W + ' px' : '关' }}</b></div>
        <div class="hud-row"><span>列数</span><b>4</b></div>
        <div class="hud-row"><span>行</span><b>{{ current ? '#' + (current.id + 1) : '—' }}</b></div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.md {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.md-body {
  display: flex;
  min-height: 100%;
  align-items: stretch;
}

.md-main {
  flex: 1;
  min-width: 0;
  padding: 14px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- 顶部统计卡 ---- */

.md-cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.md-stat {
  border-radius: 16px;
  padding: 16px 18px;
  min-width: 0;
}

.md-stat h4 {
  font-size: 12px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.md-stat-y { background: linear-gradient(150deg, #ffd45e, #f5b93f); color: #17171b; }
.md-stat-o { background: linear-gradient(150deg, #ff8a5c, #ff5c39); color: #fff; }
.md-stat-d { background: var(--card-dark); color: var(--text); display: flex; align-items: center; gap: 12px; }

.md-stat-rows {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  opacity: 0.8;
}

.md-stat-rows b { float: right; }

.md-stat-sub {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  opacity: 0.85;
}

.md-stat-tile {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  flex: none;
  background: linear-gradient(135deg, #7f9dff, #4f8dfd);
}

.md-stat-d b { display: block; font-size: 13px; }
.md-stat-d span { display: block; font-size: 10.5px; color: var(--muted); margin-top: 2px; }

/* ---- 搜索 ---- */

.md-search {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 38px;
  border-radius: 12px;
  background: var(--card-dark);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 0 13px;
}

.md-search svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: var(--muted);
  stroke-width: 2;
  stroke-linecap: round;
  flex: none;
}

.md-search input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 12.5px;
}

/* ---- 列表 ---- */

.md-list {
  background: var(--card-dark);
  border-radius: 16px;
  padding: 6px 8px;
  flex: 1;
}

.md-thead,
.md-row {
  display: grid;
  grid-template-columns: 1.5fr 0.55fr 0.7fr 0.6fr;
  gap: 12px;
  align-items: center;
  padding: 9px 10px;
}

.md-thead {
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--muted);
  text-transform: uppercase;
}

.md-row {
  border-radius: 12px;
  font-size: 12.5px;
  cursor: pointer;
  transition: background 0.18s;
}

.md-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.md-row.active {
  background: rgba(255, 107, 74, 0.14);
  outline: 1px solid rgba(255, 107, 74, 0.4);
}

.md-prod {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.md-tile {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  flex: none;
}

.md-prod-txt {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.md-prod-txt b {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.md-prod-txt em {
  font-style: normal;
  font-size: 10.5px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.md-row > span:nth-child(2),
.md-row > span:nth-child(3) {
  color: var(--muted);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}

.md-badge {
  font-style: normal;
  font-size: 9.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
}

.md-badge.r { background: rgba(255, 107, 74, 0.18); color: #ffb39f; }
.md-badge.y { background: rgba(245, 185, 63, 0.15); color: var(--yellow); }
.md-badge.b { background: rgba(127, 157, 255, 0.15); color: #9db4ff; }
.md-badge.g { background: rgba(127, 224, 178, 0.14); color: #7fe0b2; }

.md-empty {
  padding: 20px;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}

/* ---- 详情抽屉:压窄列表而非覆盖 ---- */

.md-drawer {
  width: 0;
  flex: none;
  overflow: hidden;
  transition: width 0.34s cubic-bezier(0.22, 0.85, 0.28, 1.02);
}

.md-drawer.open {
  width: 340px;
}

.md-drawer-inner {
  width: 340px;
  height: 100%;
  background: var(--card-dark);
  border-left: 1px solid var(--line);
  position: relative;
  overflow-y: auto;
}

.md-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(23, 23, 27, 0.6);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 2;
}

.md-close svg {
  width: 11px;
  height: 11px;
  fill: none;
  stroke: #fff;
  stroke-width: 2.2;
  stroke-linecap: round;
}

.md-panel {
  padding: 14px 16px 18px;
}

.md-visual {
  height: 128px;
  border-radius: 14px;
  display: grid;
  place-items: center;
}

.md-visual svg {
  width: 44px;
  height: 44px;
  fill: none;
  stroke: rgba(255, 255, 255, 0.85);
  stroke-width: 1.6;
  stroke-linecap: round;
}

.md-cat {
  display: inline-block;
  margin-top: 14px;
  font-style: normal;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #ffb39f;
  background: rgba(255, 107, 74, 0.14);
  border-radius: 999px;
  padding: 3px 10px;
}

.md-panel h3 {
  margin-top: 9px;
  font-size: 17px;
  font-weight: 800;
}

.md-spec {
  margin-top: 3px;
  font-size: 11px;
  color: var(--muted);
}

.md-stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.md-stats div {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 11px;
  padding: 9px 10px;
}

.md-stats span {
  display: block;
  font-size: 9.5px;
  color: var(--muted);
}

.md-stats b {
  display: block;
  margin-top: 3px;
  font-size: 14px;
  font-weight: 800;
}

.md-bars-title {
  margin-top: 16px;
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--muted);
  text-transform: uppercase;
  font-weight: 700;
}

.md-bars {
  margin-top: 9px;
  height: 64px;
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.md-bars i {
  flex: 1;
  display: block;
  background: rgba(255, 138, 92, 0.35);
  border-radius: 4px 4px 1px 1px;
}

.md-bars i.top {
  background: linear-gradient(180deg, #ffd45e, #f5b93f);
}

.md-actions {
  margin-top: 18px;
  display: flex;
  gap: 9px;
}

.md-btn {
  flex: 1;
  height: 36px;
  border-radius: 11px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: var(--text);
}

.md-btn.main {
  border: none;
  background: linear-gradient(135deg, #ffd45e, #f5b93f);
  color: #17171b;
}

/* 面板内容切换:立即换内容,入场动画纯 CSS(不依赖 transitionend,
   后台标签页定时器节流也不会卡住面板) */
.md-panel {
  animation: md-in 0.2s ease;
}

@keyframes md-in {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: none; }
}
</style>
