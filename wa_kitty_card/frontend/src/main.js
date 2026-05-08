import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import registerServiceWorker from './registerServiceWorker'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

if (process.env.NODE_ENV === 'production') {
  const wb = registerServiceWorker()
  app.config.globalProperties.$workbox = wb
}

app.use(router)
app.use(vuetify)
app.mount('#app')
