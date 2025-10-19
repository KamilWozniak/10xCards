// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-expect-error - defineNuxtConfig is available in Nuxt context
export default defineNuxtConfig({
  // Extend the default Nuxt config
  extends: ['.'],

  // Cloudflare-specific settings
  nitro: {
    preset: 'cloudflare_pages',
    // Ensure compatibility with Cloudflare Pages
    experimental: {
      wasm: true,
    },
  },

  // Override build command for Cloudflare
  build: {
    transpile: ['@supabase/ssr'],
  },
})
