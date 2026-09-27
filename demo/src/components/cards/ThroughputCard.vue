<script setup>
import { ref, computed } from 'vue'
import { useTheme } from '../../theme'

defineProps({ detail: Boolean })
const theme = useTheme()
const isContent = computed(() => theme.value === 'content')

const trips = [
  { d: '9 Dec', w: 'Tue', t: '旅行签证办理', s: '10:30 – 11:00 · 大使馆', st: '已完成', k: 'done' },
  { d: '17 Dec', w: 'Thu', t: '机酒预订', s: '14:00 – 15:30 · 在线', st: '待支付', k: 'pending' },
  { d: '21 Dec', w: 'Sat', t: '大阪住宿确认', s: '09:00 – 09:30 · 电话', st: '已完成', k: 'done' },
]

const bars = [
  { d: '周一', h: 52, dark: true },
  { d: '周二', h: 96, peak: true, dark: true },
  { d: '周三', h: 70 },
  { d: '周四', h: 56 },
  { d: '周五', h: 82 },
  { d: '周六', h: 46 },
  { d: '周日', h: 64 },
]

// 详情视图:近 14 天出杯数据(上周 / 本周)
const detailBars = [
  { d: '周一', name: '上周一', cups: 1284, prev: true },
  { d: '周二', name: '上周二', cups: 1546, prev: true },
  { d: '周三', name: '上周三', cups: 1402, prev: true },
  { d: '周四', name: '上周四', cups: 1178, prev: true },
  { d: '周五', name: '上周五', cups: 1610, prev: true },
  { d: '周六', name: '上周六', cups: 930, prev: true },
  { d: '周日', name: '上周日', cups: 1206, prev: true },
  { d: '周一', name: '本周一', cups: 1420 },
  { d: '周二', name: '本周二 · 高峰', cups: 1842 },
  { d: '周三', name: '本周三', cups: 1560 },
  { d: '周四', name: '本周四', cups: 1310 },
  { d: '周五', name: '本周五', cups: 1688 },
  { d: '周六', name: '本周六', cups: 1042 },
  { d: '周日', name: '本周日', cups: 1476 },
].map(b => ({ ...b, h: Math.round((b.cups / 1842) * 92) }))

const peakIndex = detailBars.findIndex(b => b.cups === 1842)

const hover = ref(null)
const tipLabel = computed(() => {
  if (hover.value === null) return ''
  const b = detailBars[hover.value]
  return `${b.name} · ${b.cups.toLocaleString()} 杯`
})
</script>

<template>
  <!-- 图卡内容型:Details 行程面板 -->
  <div v-if="isContent" class="dtp">
    <h3>Details</h3>
    <div v-for="t in trips" :key="t.d" class="dtp-row">
      <span class="dtp-date"><b>{{ t.d }}</b><i>{{ t.w }}</i></span>
      <span class="dtp-info"><b>{{ t.t }}</b><span>{{ t.s }}</span></span>
      <i class="dtp-state" :class="t.k">{{ t.st }}</i>
    </div>
  </div>

  <div class="thr" v-else :class="{ 'is-detail': detail }">
    <template v-if="!detail">
      <header class="t-head">
        <span class="t-icon">
          <svg viewBox="0 0 24 24">
            <path d="M5 7h11v7a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" />
            <path d="M16 8.5h1.6a2.4 2.4 0 0 1 0 4.8H16" />
            <path d="M8 3.5v2M11 3.5v2M14 3.5v2" />
          </svg>
        </span>
        <h3>出杯量</h3>
        <span class="t-pill">本周</span>
        <span class="t-pill alt">+4.2%</span>
      </header>

      <div class="t-body">
        <div class="t-chart">
          <span class="t-tag">峰值 1,842 杯</span>
          <div class="t-bars">
            <div v-for="b in bars" :key="b.d" class="t-barcol">
              <i class="t-bar" :class="{ peak: b.peak }" :style="{ height: b.h + '%' }" />
            </div>
          </div>
          <div class="t-x">
            <span v-for="b in bars" :key="b.d" :class="{ dark: b.dark }">{{ b.d }}</span>
          </div>
        </div>

        <div class="t-stats">
          <div class="t-stat">
            <p class="t-label">累计出杯 <i>+9.5%</i></p>
            <p class="t-big">9,428 <small>杯</small></p>
          </div>
          <div class="t-sep" />
          <div class="t-stat">
            <p class="t-label">平均排队时长 <i>−0.8</i></p>
            <p class="t-big">3.4 <small>分钟</small></p>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <header class="td-head">
        <div class="td-title">
          <span class="t-icon">
            <svg viewBox="0 0 24 24">
              <path d="M5 7h11v7a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" />
              <path d="M16 8.5h1.6a2.4 2.4 0 0 1 0 4.8H16" />
              <path d="M8 3.5v2M11 3.5v2M14 3.5v2" />
            </svg>
          </span>
          <div>
            <h3>出杯量</h3>
            <p class="td-sub">近 14 天 · 每日出杯统计</p>
          </div>
        </div>
        <div class="td-stats">
          <div class="td-stat">
            <span>累计出杯</span>
            <div class="td-stat-v"><b>9,428 <small>杯</small></b><i>+9.5%</i></div>
          </div>
          <div class="td-stat">
            <span>平均排队时长</span>
            <div class="td-stat-v"><b>3.4 <small>分钟</small></b><i>−0.8</i></div>
          </div>
          <div class="td-stat">
            <span>最长排队</span>
            <div class="td-stat-v"><b>8.2 <small>分钟</small></b><i>周二高峰</i></div>
          </div>
        </div>
      </header>

      <div class="td-chart" @mouseleave="hover = null">
        <div class="td-bars">
          <div
            v-for="(b, i) in detailBars"
            :key="i"
            class="td-col"
            :class="{ sep: i === 7 }"
            @mouseenter="hover = i"
          >
            <span v-if="i === peakIndex && hover !== i" class="td-peak">峰值 1,842 杯</span>
            <span v-if="hover === i" class="td-tip" :style="{ bottom: `calc(${b.h}% + 12px)` }">
              {{ tipLabel }}
            </span>
            <i
              class="td-bar"
              :class="{ hot: hover === i, prev: b.prev, peak: i === peakIndex }"
              :style="{ height: b.h + '%' }"
            />
          </div>
        </div>
        <div class="td-x">
          <span
            v-for="(b, i) in detailBars"
            :key="i"
            :class="{ dark: !b.prev, sep: i === 7 }"
          >{{ b.d }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.thr {
  height: 100%;
  background: linear-gradient(155deg, #ff7c55 0%, #ff5f43 100%);
  color: #fff;
  padding: 18px;
  display: flex;
  flex-direction: column;
}

.t-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.t-icon {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: #17171b;
  display: grid;
  place-items: center;
  flex: none;
}

.t-icon svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: #ff8a68;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.t-pill {
  font-size: 10px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 4px 10px;
}

.t-pill:first-of-type {
  margin-left: auto;
}

.t-pill.alt {
  margin-left: 0;
  background: #17171b;
}

.t-body {
  flex: 1;
  display: flex;
  gap: 18px;
  margin-top: 16px;
  min-height: 0;
}

.t-chart {
  flex: 1.35;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.t-tag {
  position: absolute;
  top: 0;
  left: 21.5%;
  transform: translateX(-50%);
  background: #17171b;
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 7px;
  z-index: 2;
  white-space: nowrap;
}

.t-tag::after {
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

.t-bars {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 3%;
  padding-top: 26px;
  min-height: 0;
}

.t-barcol {
  flex: 1;
  display: flex;
  align-items: flex-end;
  min-width: 0;
}

.t-bar {
  display: block;
  width: 100%;
  max-width: 30px;
  margin: 0 auto;
  background: rgba(255, 235, 228, 0.55);
  border-radius: 8px 8px 3px 3px;
}

.t-bar.peak {
  background: #fff;
}

.t-x {
  display: flex;
  justify-content: space-between;
  margin-top: 9px;
  padding: 0 2px;
}

.t-x span {
  flex: 1;
  max-width: 30px;
  margin: 0 auto;
  text-align: center;
  font-size: 8.5px;
  font-weight: 600;
  opacity: 0.85;
  border-radius: 6px;
  padding: 2px 0;
}

.t-x span.dark {
  background: #17171b;
  color: #fff;
  opacity: 1;
}

.t-stats {
  width: 150px;
  flex: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.t-label {
  font-size: 9.5px;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.t-label i {
  font-style: normal;
  background: rgba(23, 23, 27, 0.85);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 9px;
  font-weight: 700;
}

.t-big {
  font-size: 27px;
  font-weight: 800;
  margin-top: 6px;
  letter-spacing: 0.3px;
}

.t-big small {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.85;
}

.t-sep {
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

/* ---- 详情视图 ---- */

.thr.is-detail {
  padding: 24px 28px;
}

.td-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.td-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thr.is-detail .t-icon {
  width: 44px;
  height: 44px;
}

.thr.is-detail .t-icon svg {
  width: 21px;
  height: 21px;
}

.td-sub {
  font-size: 11px;
  opacity: 0.85;
  margin-top: 3px;
}

.td-stats {
  display: flex;
  gap: 40px;
}

.td-stat > span {
  font-size: 10px;
  letter-spacing: 1px;
  opacity: 0.85;
  font-weight: 600;
}

.td-stat-v {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.td-stat-v b {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.td-stat-v small {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.85;
}

.td-stat-v i {
  font-style: normal;
  background: rgba(23, 23, 27, 0.85);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
}

.td-chart {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 22px;
  min-height: 0;
  position: relative;
}

.td-peak {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(92% + 12px);
  background: #17171b;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 7px;
  z-index: 2;
  white-space: nowrap;
}

.td-peak::after {
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

.td-bars {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 1.4%;
  padding: 40px 2% 0;
  min-height: 0;
}

.td-col {
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
  min-width: 0;
}

.td-col.sep {
  margin-left: 2.4%;
}

.td-bar {
  display: block;
  width: 100%;
  max-width: 36px;
  margin: 0 auto;
  background: rgba(255, 235, 228, 0.55);
  border-radius: 8px 8px 3px 3px;
  transition: background 0.15s ease;
}

.td-bar.prev {
  background: rgba(255, 235, 228, 0.32);
}

.td-bar.peak {
  background: #fff;
}

.td-bar.hot {
  background: #17171b;
}

.td-tip {
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
}

.td-tip::after {
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

.td-x {
  display: flex;
  gap: 1.4%;
  margin-top: 10px;
  padding: 0 2%;
}

.td-x span {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 8.5px;
  font-weight: 600;
  opacity: 0.7;
  border-radius: 6px;
  padding: 2px 0;
  white-space: nowrap;
}

.td-x span.sep {
  margin-left: 2.4%;
}

.td-x span.dark {
  background: #17171b;
  color: #fff;
  opacity: 1;
}
</style>
