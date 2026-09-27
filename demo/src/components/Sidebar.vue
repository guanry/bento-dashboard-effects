<script setup>
const items = [
  {
    id: 'home',
    label: '工作台',
    active: true,
    svg: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>',
  },
  {
    id: 'stats',
    label: '数据分析',
    svg: '<svg viewBox="0 0 24 24"><path d="M5 20v-8"/><path d="M12 20V5"/><path d="M19 20v-5"/></svg>',
  },
  {
    id: 'orders',
    label: '订单',
    svg: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-2.4-1.6L13.2 21l-2.4-1.6L8.4 21 6 19.4Z"/><path d="M9.5 8h5M9.5 12h5"/></svg>',
  },
  {
    id: 'team',
    label: '团队',
    svg: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.5 15.2c2.3.3 3.7 1.9 4.1 4.3"/></svg>',
  },
  {
    id: 'settings',
    label: '设置',
    svg: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8"/></svg>',
  },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sb-logo">DG</div>
    <nav class="sb-nav">
      <button
        v-for="it in items"
        :key="it.id"
        class="sb-btn"
        :class="{ active: it.active }"
        :title="it.label"
        v-html="it.svg"
      />
    </nav>
    <div class="sb-avatar">MH</div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 58px;
  flex: none;
  background: #0d0d0f;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 0;
  gap: 18px;
}

.sb-logo {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff8a5c, #ff5c39);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: grid;
  place-items: center;
  letter-spacing: 0.5px;
}

.sb-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.sb-btn {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.sb-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.sb-btn.active {
  background: var(--blue);
  color: #fff;
}

.sb-btn :deep(svg) {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sb-avatar {
  margin-top: auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5b93f;
  color: #141416;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
}
</style>
