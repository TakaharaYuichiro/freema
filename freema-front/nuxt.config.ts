// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  plugins: [
    {src: '@/plugins/vee-validate.js'},
  ],
  modules: [
    '@pinia/nuxt',
    '@nuxt/icon'
  ],
  css: [
    'normalize.css/normalize.css'
  ],
  runtimeConfig: {
    public: {
      imageUrlBase: process.env.NUXT_PUBLIC_IMAGE_URL_BASE || 'http://localhost:8000/storage',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'
    }
  }
})
