<script setup>
import { computed } from 'vue'
import { useTheme } from '../../theme'
defineProps({ detail: Boolean })
const theme = useTheme()
const isContent = computed(() => theme.value === 'content')

const days = [
  { d: '周一', v: 78 },
  { d: '周二', v: 82 },
  { d: '周三', v: 91, hot: true },
  { d: '周四', v: 88 },
  { d: '周五', v: 84 },
  { d: '周六', v: 70 },
  { d: '周日', v: 76 },
]
</script>

<template>
  <!-- 图卡内容型:照片当主角 -->
  <div v-if="isContent" class="pc">
    <div class="pf-photo">
      <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="pcSkyA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffe3b3" />
            <stop offset="1" stop-color="#ff9e6d" />
          </linearGradient>
        </defs>
        <rect width="120" height="90" fill="url(#pcSkyA)" />
        <circle cx="88" cy="24" r="9" fill="#fff6de" />
        <path d="M0 60 26 40 50 58 76 34 120 62V90H0Z" fill="#8a4a2e" />
        <path d="M0 74 34 58 68 74 102 60 120 70V90H0Z" fill="#59301c" />
      </svg>
      <span class="pf-tag">日本</span>
    </div>
    <div class="pf-cap">
      <b>京都 · 伏见稻荷</b>
      <span>5 天 · 4 月出行 · 剩 2 席</span>
    </div>
  </div>

  <div class="venue" v-else>
    <header class="v-head">
      <h3>场馆容量</h3>
      <span class="v-pill">
        本周
        <svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
      </span>
    </header>

    <div class="v-days">
      <div v-for="d in days" :key="d.d" class="v-day">
        <span class="v-circle" :class="{ hot: d.hot }">{{ d.v }}%</span>
        <span class="v-label">{{ d.d }}</span>
      </div>
    </div>

    <div v-if="detail" class="v-stats">
      <div><span>本周峰值</span><b>91%</b></div>
      <div><span>平均容量</span><b>81%</b></div>
      <div><span>预订场次</span><b>12 场</b></div>
    </div>

    <svg class="v-wave" viewBox="0 0 320 64" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 36C36 18 66 50 104 38 142 26 170 48 212 34 252 21 282 42 320 28V64H0Z" fill="rgba(30,24,96,.32)" />
      <path d="M0 48C44 32 84 56 128 44 172 32 204 54 248 42 280 33 300 42 320 36V64H0Z" fill="rgba(255,255,255,.3)" />
      <path
        d="M0 28C40 12 80 42 124 32 168 22 200 40 246 28 282 18 300 30 320 24"
        fill="none"
        stroke="rgba(255,255,255,.85)"
        stroke-width="1.6"
        stroke-dasharray="1 6"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.venue {
  height: 100%;
  background: linear-gradient(150deg, #7d8cff 0%, #5d6cf3 100%);
  color: #fff;
  padding: 18px 18px 0;
  display: flex;
  flex-direction: column;
}

.v-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.v-pill {
  font-size: 10px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.v-pill svg {
  width: 9px;
  height: 9px;
  fill: none;
  stroke: #fff;
  stroke-width: 2.5;
  stroke-linecap: round;
}

.v-days {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  padding: 0 2px;
}

.v-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.v-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.24);
  display: grid;
  place-items: center;
  font-size: 10.5px;
  font-weight: 700;
}

.v-circle.hot {
  background: #101014;
}

.v-label {
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.4px;
  opacity: 0.75;
}

.v-wave {
  margin-top: auto;
  width: 100%;
  height: 54px;
  display: block;
}

/* ---- 详情视图 ---- */

.venue.is-detail {
  padding: 24px 28px 0;
}

.venue.is-detail .v-days {
  margin-top: 22px;
}

.venue.is-detail .v-circle {
  width: 56px;
  height: 56px;
  font-size: 14px;
}

.venue.is-detail .v-label {
  font-size: 10px;
}

.v-stats {
  display: flex;
  gap: 48px;
  margin-top: 20px;
}

.v-stats span {
  display: block;
  font-size: 10px;
  letter-spacing: 1px;
  opacity: 0.8;
  font-weight: 600;
}

.v-stats b {
  display: block;
  font-size: 22px;
  font-weight: 800;
  margin-top: 4px;
}

.venue.is-detail .v-wave {
  flex: 1;
  height: auto;
  margin-top: 18px;
}
</style>
