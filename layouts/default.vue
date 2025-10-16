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
            <!-- User Avatar and Email Placeholder -->
            <div class="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  <span class="text-sm font-medium">U</span>
                </AvatarFallback>
              </Avatar>
              <div class="hidden md:block">
                <p class="text-sm font-medium text-gray-900">użytkownik@email.com</p>
              </div>
            </div>

            <!-- Logout Button Placeholder -->
            <Button
              variant="outline"
              @click="handleLogout"
            >
              Wyloguj
            </Button>
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

// Placeholder logout handler - will be implemented with useAuth composable
const handleLogout = () => {
  console.log('Logout clicked - to be implemented with useAuth()')
  // TODO: Implement logout logic with useAuth composable
  // await auth.signOut()
  // navigateTo('/auth/login')
}
</script>
