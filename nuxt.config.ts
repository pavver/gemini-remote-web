export default defineNuxtConfig({
  compatibilityDate: '2026-02-25',
  future: {
    compatibilityVersion: 4,
  },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
})
