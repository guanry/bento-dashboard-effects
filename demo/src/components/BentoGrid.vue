<script setup>
import VenueCapacityCard from './cards/VenueCapacityCard.vue'
import StaffLoadCard from './cards/StaffLoadCard.vue'
import ThroughputCard from './cards/ThroughputCard.vue'
import AiOpsCard from './cards/AiOpsCard.vue'
import PointsCard from './cards/PointsCard.vue'
import TimingCard from './cards/TimingCard.vue'

const props = defineProps({
  grid: { type: Object, required: true },
})

const {
  gridEl, layout, drag, dragTitle, ghostStyle, styleFor, onCardPointerDown,
  view, onCardClick, collapse, innerStyleFor, closeStyle, dims: gridDims,
} = props.grid

const views = {
  venue: VenueCapacityCard,
  staff: StaffLoadCard,
  throughput: ThroughputCard,
  ai: AiOpsCard,
  points: PointsCard,
  timing: TimingCard,
}
</script>

<template>
  <div
    ref="gridEl"
    class="bento"
    :class="{ 'is-dragging': drag.active, 'is-expanded': !!view.expandedId }"
  >
    <div v-if="ghostStyle" class="bento-ghost" :style="ghostStyle" />

    <article
      v-for="c in layout"
      :key="c.id"
      class="bento-card"
      :class="[`is-${c.id}`, {
        dragging: drag.id === c.id,
        releasing: drag.releasing === c.id,
        'is-active': view.expandedId === c.id,
        'is-thumb': !!view.expandedId && view.expandedId !== c.id,
      }]"
      :style="styleFor(c)"
      @pointerdown="onCardPointerDown($event, c.id)"
      @click="onCardClick(c)"
    >
      <div class="bento-inner" :style="innerStyleFor(c)">
        <component :is="views[c.id]" :detail="view.expandedId === c.id" />
      </div>
    </article>

    <button v-if="closeStyle" class="bento-close" :style="closeStyle" aria-label="收起" @click="collapse">
      <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19" /></svg>
    </button>

    <Teleport to="body">
      <div class="bento-hud" :class="{ live: drag.active }">
        <div class="hud-row"><span>网格</span><b>{{ gridDims.cols }} × {{ gridDims.rows }}</b></div>
        <div class="hud-row"><span>视图</span><b>{{ view.expandedId ? '详情' : '网格' }}</b></div>
        <div class="hud-row" v-if="view.expandedId"><span>缩略</span><b>{{ layout.length - 1 }} 张</b></div>
        <div class="hud-row"><span>拖拽</span><b>{{ dragTitle }}</b></div>
        <div class="hud-row"><span>重排</span><b>{{ drag.reflows }}</b></div>
      </div>
    </Teleport>
  </div>
</template>
