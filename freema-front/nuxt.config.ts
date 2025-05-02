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
      backUrlBase: process.env.NUXT_PUBLIC_BACK_URL_BASE || 'http://localhost:8000/',
      imageUrlBase: process.env.NUXT_PUBLIC_IMAGE_URL_BASE || 'http://localhost:8000/storage',
      stripePublicKey: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
    }
  },
})
