import { ref, watch, onBeforeUnmount } from 'vue'

const easeOutCubic = t => 1 - Math.pow(1 - t, 3)

/**
 * 数字滚动补间:源值变化时,显示值在 duration 内缓动追上目标。
 * 返回一个持续变化的 number ref,模板里自行格式化(千分位等)。
 * display 初始为 0,immediate 首次赋值也会从 0 滚到目标 —— 视图切入时有"起势"。
 */
export function useTweenNumber(source, { duration = 800, easing = easeOutCubic } = {}) {
  const display = ref(0)
  let raf = 0

  watch(source, to => {
    const from = display.value
    if (from === to) return
    const start = performance.now()
    cancelAnimationFrame(raf)
    const step = now => {
      const t = Math.min(1, (now - start) / duration)
      display.value = from + (to - from) * easing(t)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
  }, { immediate: true })

  onBeforeUnmount(() => cancelAnimationFrame(raf))
  return display
}
