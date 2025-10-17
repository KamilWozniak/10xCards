<script setup lang="ts">
/**
 * Landing page - redirects based on authentication status
 *
 * - Authenticated users → /generate
 * - Unauthenticated users → /auth/login
 */

// Only run on client-side (not during SSR)
if (process.client) {
  const supabase = useSupabase()

  try {
    const {
      data: { user },
    } = await supabase.supabase.auth.getUser()

    if (user) {
      // User is authenticated, redirect to generate page
      await navigateTo('/generate')
    } else {
      // User is not authenticated, redirect to login page
      await navigateTo('/auth/login')
    }
  } catch (error) {
    console.error('Error checking auth status:', error)
    // On error, redirect to login
    await navigateTo('/auth/login')
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
</template>
