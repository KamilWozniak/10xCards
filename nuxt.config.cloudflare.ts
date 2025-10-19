// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Extend the default Nuxt config
  extends: ['.'],

  // Cloudflare-specific settings
  nitro: {
    preset: 'cloudflare_pages',
  },
})
