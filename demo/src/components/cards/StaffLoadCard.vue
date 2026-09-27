<script setup>
import { computed } from 'vue'
import { useTheme } from '../../theme'
defineProps({ detail: Boolean })
const theme = useTheme()
const isContent = computed(() => theme.value === 'content')

const metrics = [
  { name: '营收', v: 64, tone: 'y' },
  { name: '负载', v: 82, tone: 'r' },
  { name: '占比', v: 47, tone: 'y' },
]

const people = [
  { n: '阿 May', r: '吧台主管 · 连续 6 天', v: 86, tone: 'r' },
  { n: '小林', r: '咖啡师 · 今日双班', v: 64, tone: 'y' },
  { n: 'Zoe', r: '收银 · 正常排班', v: 42, tone: 'y' },
  { n: '大伟', r: '烘焙 · 待补休', v: 73, tone: 'r' },
]
</script>

<template>
  <div v-if="isContent" class="pc">
    <div class="pf-photo">
      <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="pcSkyC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffe9a8" />
            <stop offset="1" stop-color="#ffc26b" />
          </linearGradient>
        </defs>
        <rect width="120" height="90" fill="url(#pcSkyC)" />
        <circle cx="30" cy="22" r="8" fill="#fff2c4" />
        <path d="M0 62 40 46 80 60 120 48V90H0Z" fill="#3e6b5a" />
        <path d="M0 76 50 64 100 76 120 70V90H0Z" fill="#274a3e" />
        <rect x="78" y="44" width="16" height="11" rx="2" fill="#ffd23f" />
      </svg>
      <span class="pf-tag">葡萄牙</span>
    </div>
    <div class="pf-cap">
      <b>里斯本 · 28 路电车</b>
      <span>4 天 · 9 月出行 · 剩 6 席</span>
    </div>
  </div>

  <div class="staff" v-else>
    <header class="s-head">
      <span class="s-icon">
        <svg viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H11L9.8 22 19 10h-6.5Z" /></svg>
      </span>
      <h3>稳定人员负载</h3>
      <span class="s-alert">!</span>
    </header>

    <p class="s-sub">
      请审批关键换班，并核查库存风险。
      <span class="s-pill">3 天已批 2 天</span>
    </p>

    <div class="s-rows">
      <div v-for="m in metrics" :key="m.name" class="s-metric">
        <p class="s-mhead"><span>{{ m.name }}</span><b>{{ m.v }}%</b></p>
        <div class="s-track"><i :class="m.tone" :style="{ width: m.v + '%' }" /></div>
      </div>
    </div>

    <div v-if="detail" class="s-list">
      <p class="s-list-title">重点关注</p>
      <div v-for="p in people" :key="p.n" class="s-row">
        <span class="s-ava" :class="p.tone">{{ p.n.slice(0, 1) }}</span>
        <div class="s-info">
          <b>{{ p.n }}</b>
          <span>{{ p.r }}</span>
        </div>
        <div class="s-track"><i :class="p.tone" :style="{ width: p.v + '%' }" /></div>
        <b class="s-val">{{ p.v }}%</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.staff {
  height: 100%;
  background: var(--card-dark);
  color: var(--text);
  padding: 18px;
  display: flex;
  flex-direction: column;
}

.s-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.s-icon {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: var(--yellow);
  display: grid;
  place-items: center;
  flex: none;
}

.s-icon svg {
  width: 16px;
  height: 16px;
  fill: #17171b;
  stroke: none;
}

.s-alert {
  margin-left: auto;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  font-weight: 700;
  display: grid;
  place-items: center;
  flex: none;
}

.s-sub {
  margin-top: 12px;
  font-size: 11.5px;
  color: var(--muted);
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.s-pill {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--yellow);
  background: rgba(245, 185, 63, 0.14);
  border-radius: 999px;
  padding: 3px 9px;
  white-space: nowrap;
}

.s-rows {
  margin-top: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.s-mhead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 9.5px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}

.s-mhead b {
  color: var(--text);
  font-size: 10.5px;
}

.s-track {
  margin-top: 7px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.s-track i {
  display: block;
  height: 100%;
  border-radius: 3px;
}

.s-track i.y {
  background: var(--yellow);
}

.s-track i.r {
  background: #ff6b4a;
}

/* ---- 详情视图 ---- */

.staff.is-detail {
  padding: 24px 28px;
}

.staff.is-detail .s-rows {
  margin-top: 18px;
  gap: 22px;
}

.staff.is-detail .s-track {
  height: 8px;
}

.s-list {
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.s-list-title {
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 700;
}

.s-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.s-ava {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;
  color: #17171b;
  flex: none;
}

.s-ava.y {
  background: var(--yellow);
}

.s-ava.r {
  background: #ff8a68;
}

.s-info {
  width: 168px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.s-info b {
  font-size: 12.5px;
  font-weight: 700;
}

.s-info span {
  font-size: 10px;
  color: var(--muted);
}

.s-row .s-track {
  flex: 1;
}

.s-val {
  width: 44px;
  text-align: right;
  font-size: 12.5px;
  flex: none;
}
</style>
