import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './themes/warm.css'
import './themes/bold.css'
import './themes/minimal.css'
import './themes/immersive.css'
import './themes/content.css'
import './theme'  // 导入即应用初始主题(<html data-theme>)

createApp(App).mount('#app')
