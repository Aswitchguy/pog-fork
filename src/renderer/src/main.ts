import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@mdi/font/css/materialdesignicons.css'
import './style/index.css'
// import '@vueform/multiselect/themes/default.css'
import './style/multiselect.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Add zoom keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    console.log('Keyboard shortcut detected:', e.key)
    if (e.key === '=' || e.key === '+') {
      console.log('Zoom in triggered')
      window.api.zoomIn()
    } else if (e.key === '-') {
      console.log('Zoom out triggered')
      window.api.zoomOut()
    } else if (e.key === '0') {
      console.log('Zoom reset triggered')
      window.api.zoomReset()
    }
  }
})

console.log('API methods available:', Object.keys(window.api))
