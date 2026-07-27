import './assets/base.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './assets/admin-vuetify-overrides.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from '@/App.vue'
import router from '@/router'
import { i18n } from '@/i18n'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'adminLight',
    themes: {
      adminLight: {
        dark: false,
        colors: {
          primary: '#159a57',
          'primary-darken-1': '#0d7a3f',
          secondary: '#0f8f80',
          accent: '#b87910',
          error: '#dc2626',
          info: '#2563eb',
          success: '#159a57',
          warning: '#f59e0b',
          surface: '#ffffff',
          background: '#f4f7fb',
        },
      },
      adminDark: {
        dark: true,
        colors: {
          primary: '#159a57',
          'primary-darken-1': '#0d7a3f',
          secondary: '#0f8f80',
          accent: '#b87910',
          error: '#dc2626',
          info: '#3b82f6',
          success: '#159a57',
          warning: '#f59e0b',
          surface: '#0a1a14',
          background: '#06100F',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      variant: 'flat',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VCard: {
      rounded: 'lg',
      variant: 'elevated',
    },
  },
})

const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.use(router)
app.use(i18n)

await router.isReady()
app.mount('#app')
