import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import { installImageFallbacks } from '@/lib/imageFallbacks'

installImageFallbacks()

const app = createApp(App)
app.use(createPinia())
app.use(router)

await router.isReady()
app.mount('#app')
