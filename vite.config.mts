// Plugins
import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import process from 'node:process'
import '@std/dotenv/load';
import deno from '@deno/vite-plugin';

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

if (!process.env.VITE_GOOGLE_MAPS_API_KEY) {
  throw new Error('The app cannot be built without setting the VITE_GOOGLE_MAPS_API_KEY env');
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    deno(),
    Vue({
      template: { transformAssetUrls },
    }),
    Vuetify(),
    Components(),
  ],
  optimizeDeps: {
    exclude: ['vuetify'],
  },
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || '6969'}`,
        changeOrigin: true,
      },
    },
  },
})
