<script setup>
import { computed } from 'vue'
import { useTheme } from '../../theme'
defineProps({ detail: Boolean })
const theme = useTheme()
const isContent = computed(() => theme.value === 'content')
</script>

<template>
  <div v-if="isContent" class="pfl">
    <div class="pfl-ava">E</div>
    <b>Elin · 店长</b>
    <span>每日研磨 · 纽约店</span>
    <div class="pfl-menu">
      <span class="on">我的行程</span>
      <span>常用旅客</span>
      <span>旅行基金</span>
      <span>设置</span>
    </div>
    <span class="pfl-foot">CONTENT FIRST · 图卡内容型</span>
  </div>

  <div class="points" v-else :class="{ 'is-detail': detail }">
    <header class="p-head">
      <h3>积分</h3>
      <span>全部积分 +</span>
    </header>

    <div v-if="detail" class="p-stats">
      <div><span>今日集章</span><b>128</b></div>
      <div><span>累计积分</span><b>2,480</b></div>
      <div><span>可兑换</span><b>3 项</b></div>
    </div>

    <div class="p-map">
      <svg viewBox="0 0 160 118" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-8 26C36 18 58 62 108 54 136 49 148 64 168 60" stroke="rgba(23,62,58,.16)" stroke-width="11" fill="none" />
        <path d="M22-8C32 38 10 78 42 126" stroke="rgba(23,62,58,.13)" stroke-width="8" fill="none" />
        <path
          d="M30 96C52 82 58 58 86 50"
          stroke="rgba(23,62,58,.4)"
          stroke-width="2"
          stroke-dasharray="4 5"
          fill="none"
          stroke-linecap="round"
        />
        <circle cx="86" cy="48" r="9" fill="#17171b" />
        <circle cx="86" cy="48" r="3.2" fill="#7fe0d2" />
      </svg>
      <span class="p-pin"><i />每日研磨</span>
    </div>
  </div>
</template>

<style scoped>
.points {
  height: 100%;
  background: #c9e7e2;
  color: #17171b;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.p-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.p-head h3 {
  font-size: 14px;
}

.p-head span {
  font-size: 9px;
  font-weight: 600;
  color: rgba(23, 23, 27, 0.55);
  white-space: nowrap;
}

.p-map {
  flex: 1;
  margin-top: 10px;
  background: #daeee9;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
}

.p-map svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.p-pin {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  background: #17171b;
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  border-radius: 999px;
  padding: 4px 10px 4px 7px;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.p-pin i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #7fe0d2;
}

/* ---- 详情视图 ---- */

.points.is-detail {
  padding: 24px 28px;
}

.p-stats {
  display: flex;
  gap: 44px;
  margin-top: 14px;
}

.p-stats span {
  display: block;
  font-size: 10px;
  letter-spacing: 1px;
  font-weight: 600;
  color: rgba(23, 23, 27, 0.55);
}

.p-stats b {
  display: block;
  font-size: 22px;
  font-weight: 800;
  margin-top: 4px;
}

.points.is-detail .p-map {
  margin-top: 18px;
}
</style>
