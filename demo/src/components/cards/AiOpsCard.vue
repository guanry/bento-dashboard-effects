<script setup>
import { computed } from 'vue'
import { useTheme } from '../../theme'
defineProps({ detail: Boolean })
const theme = useTheme()
const isContent = computed(() => theme.value === 'content')
</script>

<template>
  <div v-if="isContent" class="pc">
    <div class="pf-photo">
      <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="pcSkyB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#cfe8ff" />
            <stop offset="1" stop-color="#5ea8e8" />
          </linearGradient>
        </defs>
        <rect width="120" height="90" fill="url(#pcSkyB)" />
        <circle cx="96" cy="18" r="8" fill="#ffffff" />
        <rect y="54" width="120" height="36" fill="#2e7cc0" />
        <path d="M0 58 30 44 60 52 90 40 120 50V90H0Z" fill="#f4f7fb" />
        <circle cx="32" cy="54" r="6" fill="#2e7cc0" />
        <circle cx="56" cy="58" r="5" fill="#2e7cc0" />
      </svg>
      <span class="pf-tag">希腊</span>
    </div>
    <div class="pf-cap">
      <b>圣托里尼 · 伊亚</b>
      <span>7 天 · 6 月出行 · 剩 4 席</span>
    </div>
  </div>

  <div class="aiops" v-else>
    <header class="a-head">
      <span class="a-ava">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3.4" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
        </svg>
      </span>
      <h3>AI 运营助手</h3>
      <span class="a-expand">
        <svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></svg>
      </span>
    </header>

    <p class="a-text">
      排队时长正在上升，人员负载已达 <b>82%</b>。
    </p>

    <div class="a-actions">
      <span class="a-chip blue">调整排班</span>
      <span class="a-chip">运营策略</span>
      <span class="a-chip warn">加班 +18:20</span>
    </div>

    <div v-if="detail" class="a-list">
      <p class="a-list-title">今日建议</p>
      <div class="a-sug"><i />建议周四 14:00 – 17:00 增派 1 名咖啡师，缓解排队压力</div>
      <div class="a-sug"><i />将 2 笔库存补货合并为一次采购，预计节省 6%</div>
      <div class="a-sug"><i />高峰时段开启排队叫号，预计平均等待 −18%</div>
    </div>

    <p class="a-note"><i />预计本周营收提升 +5%</p>
  </div>
</template>

<style scoped>
.aiops {
  height: 100%;
  background: var(--card-dark);
  color: var(--text);
  padding: 18px;
  display: flex;
  flex-direction: column;
}

.a-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.a-ava {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b7bff, #4f8dfd);
  display: grid;
  place-items: center;
  flex: none;
}

.a-ava svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: #fff;
  stroke-width: 1.8;
  stroke-linecap: round;
}

.a-expand {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  display: grid;
  place-items: center;
  flex: none;
}

.a-expand svg {
  width: 10px;
  height: 10px;
  fill: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.a-text {
  margin-top: 12px;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--muted);
}

.a-text b {
  color: #ffb39f;
}

.a-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.a-chip {
  font-size: 10px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 4px 11px;
  color: rgba(255, 255, 255, 0.85);
}

.a-chip.blue {
  color: #9db4ff;
  border-color: rgba(157, 180, 255, 0.4);
}

.a-chip.warn {
  color: #ffb39f;
  border-color: rgba(255, 138, 104, 0.4);
}

.a-note {
  margin-top: auto;
  font-size: 10px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 7px;
}

.a-note i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--orange);
  flex: none;
}

/* ---- 详情视图 ---- */

.aiops.is-detail {
  padding: 24px 28px;
}

.aiops.is-detail .a-text {
  font-size: 13.5px;
  margin-top: 16px;
}

.a-list {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.a-list-title {
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 700;
}

.a-sug {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  color: rgba(244, 244, 245, 0.85);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 10px 14px;
}

.a-sug i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--yellow);
  flex: none;
}
</style>
