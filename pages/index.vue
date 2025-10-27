<script setup lang="ts">
/**
 * Landing page - redirects based on authentication status
 *
 * - Authenticated users → /generate
 * - Unauthenticated users → /auth/login
 */

// Only run on client-side (not during SSR)
if (import.meta.client) {
  const supabase = useSupabase()

  try {
    const {
      data: { user },
    } = await supabase.supabase.auth.getUser()

    if (user) {
      await navigateTo('/generate', { external: true })
    } else {
      await navigateTo('/auth/login', { external: true })
    }
  } catch (error) {
    await navigateTo('/auth/login', { external: true })
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
</template>
