<script setup>
import { computed } from 'vue'
import { useTheme } from '../../theme'
defineProps({ detail: Boolean })
const theme = useTheme()
const isContent = computed(() => theme.value === 'content')

const ticks = Array.from({ length: 12 }, (_, i) => i * 30)

const week = [
  { d: '周一 – 周四', t: '06:00 – 21:00' },
  { d: '周五', t: '06:00 – 23:00' },
  { d: '周六', t: '08:00 – 23:00' },
  { d: '周日', t: '08:00 – 21:00' },
]
</script>

<template>
  <div v-if="isContent" class="pc">
    <div class="pf-photo">
      <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="pcSkyD" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffd9a8" />
            <stop offset="1" stop-color="#f2a65a" />
          </linearGradient>
        </defs>
        <rect width="120" height="90" fill="url(#pcSkyD)" />
        <circle cx="60" cy="30" r="11" fill="#fff0c9" />
        <path d="M0 58Q30 44 60 56T120 52V90H0Z" fill="#d98e4a" />
        <path d="M0 74Q40 62 80 74T120 70V90H0Z" fill="#b06e33" />
      </svg>
      <span class="pf-tag">摩洛哥</span>
    </div>
    <div class="pf-cap">
      <b>马拉喀什 · 德吉玛</b>
      <span>6 天 · 10 月出行 · 剩 3 席</span>
    </div>
  </div>

  <div class="timing" v-else>
    <header class="tm-head">
      <h3>营业时间</h3>
    </header>
    <p class="tm-sub">营业中 · 06:00 – 21:00</p>

    <div class="tm-body">
      <div v-if="detail" class="tm-list">
        <div v-for="d in week" :key="d.d" class="tm-row">
          <span>{{ d.d }}</span>
          <b>{{ d.t }}</b>
        </div>
      </div>

      <svg class="tm-clock" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="47" fill="#fff" stroke="#17171b" stroke-width="4" />
        <line
          v-for="(r, i) in ticks"
          :key="i"
          x1="50"
          y1="9"
          x2="50"
          y2="15"
          stroke="#17171b"
          stroke-width="2.4"
          stroke-linecap="round"
          :transform="`rotate(${r} 50 50)`"
        />
        <line x1="50" y1="50" x2="50" y2="30" stroke="#17171b" stroke-width="4.6" stroke-linecap="round" transform="rotate(300 50 50)" />
        <line x1="50" y1="50" x2="50" y2="20" stroke="#17171b" stroke-width="3" stroke-linecap="round" transform="rotate(60 50 50)" />
        <circle cx="50" cy="50" r="3.4" fill="#ff6b4a" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.timing {
  height: 100%;
  background: #efe8da;
  color: #17171b;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.tm-head h3 {
  font-size: 13px;
}

.tm-sub {
  margin-top: 6px;
  font-size: 9.5px;
  font-weight: 600;
  color: rgba(23, 23, 27, 0.55);
}

.tm-body {
  margin-top: auto;
  display: flex;
  justify-content: center;
}

.tm-clock {
  width: 62%;
  max-width: 130px;
  display: block;
}

/* ---- 详情视图 ---- */

.timing.is-detail {
  padding: 24px 28px;
}

.timing.is-detail .tm-sub {
  font-size: 11px;
}

.timing.is-detail .tm-body {
  flex: 1;
  margin-top: 16px;
  align-items: center;
  justify-content: flex-start;
  gap: 48px;
}

.tm-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tm-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 2px;
  border-bottom: 1px dashed rgba(23, 23, 27, 0.18);
}

.tm-row span {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(23, 23, 27, 0.7);
}

.tm-row b {
  font-size: 13px;
  font-weight: 800;
}

.timing.is-detail .tm-clock {
  width: 40%;
  max-width: 190px;
  flex: none;
}
</style>
