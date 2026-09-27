import { ref } from 'vue'

/* 全局主题状态:写入 <html data-theme="...">,样式表按属性切换。
   默认「暖调留白」(奶油底 + 白卡 + 单一黄色重点),可切回深色。 */

function initial() {
  const saved = localStorage.getItem('bento-theme')
  return ['dark', 'warm', 'bold', 'minimal', 'immersive', 'content'].includes(saved) ? saved : 'warm'
}

const theme = ref(initial())
document.documentElement.dataset.theme = theme.value

export function useTheme() {
  return theme
}

export function setTheme(t) {
  theme.value = t
  document.documentElement.dataset.theme = t
  localStorage.setItem('bento-theme', t)
}
