<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex items-center">
            <NuxtLink to="/generate" class="text-2xl font-bold text-gray-900">
              10xCards
            </NuxtLink>
          </div>

          <!-- User Section (Right side) -->
          <div class="flex items-center space-x-4">
            <!-- User Avatar and Email -->
            <div class="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  <span class="text-sm font-medium">{{ userInitial }}</span>
                </AvatarFallback>
              </Avatar>
              <div class="hidden md:block">
                <p class="text-sm font-medium text-gray-900">{{ userEmail }}</p>
              </div>
            </div>

            <!-- Logout Button -->
            <Button variant="outline" @click="handleLogout"> Wyloguj </Button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { ref, onMounted } from 'vue'

// Get user data
const userEmail = ref<string>('Ładowanie...')
const userInitial = ref<string>('U')

// Fetch user data on mount
onMounted(async () => {
  try {
    const supabase = useSupabase()
    const {
      data: { user },
    } = await supabase.supabase.auth.getUser()

    if (user?.email) {
      userEmail.value = user.email
      userInitial.value = user.email.charAt(0).toUpperCase()
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }
})

// Logout handler
const handleLogout = async () => {
  try {
    console.log('Logging out...')

    // Call logout API endpoint
    await $fetch('/api/auth/logout', {
      method: 'POST',
    })

    // Sign out from client-side Supabase
    const supabase = useSupabase()
    await supabase.supabase.auth.signOut()

    // Redirect to login
    await navigateTo('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Even if API fails, try to sign out client-side
    try {
      const supabase = useSupabase()
      await supabase.supabase.auth.signOut()
      await navigateTo('/auth/login')
    } catch (fallbackError) {
      console.error('Fallback logout error:', fallbackError)
    }
  }
}
</script>
