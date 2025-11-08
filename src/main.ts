/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from './plugins/index.ts'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Assets
import faviconUrl from './assets/favicon.ico'

// Set favicon with content hash so it works caching well
const link = document.querySelector("link[rel='icon']") as HTMLLinkElement
if (link) {
  link.href = faviconUrl
}

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
