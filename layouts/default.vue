<template>
  <div class="min-h-screen bg-gray-50" data-testid="app-layout">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-sm border-b" data-testid="main-navigation">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex items-center">
            <NuxtLink
              to="/generate"
              class="text-2xl font-bold text-gray-900"
              data-testid="app-logo"
            >
              10xCards
            </NuxtLink>
          </div>

          <!-- User Section (Right side) -->
          <div class="flex items-center space-x-4" data-testid="user-section">
            <!-- User Avatar and Email -->
            <div class="flex items-center space-x-3">
              <Avatar data-testid="user-avatar">
                <AvatarFallback>
                  <span class="text-sm font-medium">{{ userInitial }}</span>
                </AvatarFallback>
              </Avatar>
              <div class="hidden md:block">
                <p class="text-sm font-medium text-gray-900" data-testid="user-email">
                  {{ userEmail }}
                </p>
              </div>
            </div>

            <!-- Logout Button -->
            <Button variant="outline" data-testid="logout-button" @click="handleLogout">
              Wyloguj
            </Button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main data-testid="main-content">
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

    // Sign out from client-side Supabase (clears localStorage)
    const supabase = useSupabase()
    await supabase.supabase.auth.signOut()

    // Call logout API endpoint (clears httpOnly cookies)
    await $fetch('/api/auth/logout', {
      method: 'POST',
    })

    // Redirect to login with full page reload to ensure clean state
    await navigateTo('/auth/login', { external: true })
  } catch (error) {
    console.error('Logout error:', error)
    // Even if API fails, client is signed out, redirect anyway
    await navigateTo('/auth/login', { external: true })
  }
}
</script>
