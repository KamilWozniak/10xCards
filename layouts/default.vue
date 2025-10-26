<template>
  <div class="min-h-screen bg-gray-50" data-testid="app-layout">
    <ClientOnly>
      <Toaster position="top-center" />
    </ClientOnly>
    <nav class="bg-white shadow-sm border-b" data-testid="main-navigation">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-6">
            <NuxtLink
              to="/generate"
              class="text-2xl font-bold text-gray-900"
              data-testid="app-logo"
            >
              10xCards
            </NuxtLink>
            <NuxtLink
              to="/generate"
              class="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors border-b-2 border-transparent hover:border-gray-300"
              active-class="!text-gray-900 !border-gray-900"
              data-testid="generate-link"
            >
              Generuj fiszki z AI
            </NuxtLink>
            <NuxtLink
              to="/flashcards"
              class="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors border-b-2 border-transparent hover:border-gray-300"
              active-class="!text-gray-900 !border-gray-900"
              data-testid="flashcards-link"
            >
              Moje fiszki
            </NuxtLink>
          </div>

          <div class="flex items-center space-x-4" data-testid="user-section">
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

            <Button variant="outline" data-testid="logout-button" @click="handleLogout">
              Wyloguj
            </Button>
          </div>
        </div>
      </div>
    </nav>

    <main data-testid="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Toaster } from '~/components/ui/sonner'
import { ref, onMounted } from 'vue'

const userEmail = ref<string>('Ładowanie...')
const userInitial = ref<string>('U')

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

const handleLogout = async () => {
  try {
    const supabase = useSupabase()
    await supabase.supabase.auth.signOut()

    await $fetch('/api/auth/logout', {
      method: 'POST',
    })

    await navigateTo('/auth/login', { external: true })
  } catch (error) {
    await navigateTo('/auth/login', { external: true })
  }
}
</script>
