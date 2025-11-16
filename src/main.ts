/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from './plugins/index.ts'
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { initUser } from './util.ts';

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Assets
import faviconUrl from './assets/favicon.ico'

setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });

// Set favicon with content hash so it works caching well
const link = document.querySelector("link[rel='icon']") as HTMLLinkElement
if (link) {
  link.href = faviconUrl
}

// not the most elegant way to handle this but we're speedrunning rn
importLibrary('maps')
  .then(() => importLibrary('places'))
  .then(() => {
    // Initialize user authentication before mounting the app
    initUser();

    const app = createApp(App);

    registerPlugins(app);

    app.mount('#app');
  }).catch(err => {
    console.trace(err);
    alert(`Failed to load the Google Maps API! ${err.message}`);
  });
