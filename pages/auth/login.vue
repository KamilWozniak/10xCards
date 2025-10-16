<template>
  <div>
    <!-- Error/Success Message Display -->
    <AuthErrorDisplay
      :message="errorMessage"
      :type="messageType"
    />

    <!-- Login Form -->
    <LoginForm
      :is-loading="isLoading"
      @submit="handleLogin"
    />

    <!-- Link to Register -->
    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Nie masz konta?
        <NuxtLink
          to="/auth/register"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          Zarejestruj się
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '~/components/auth/LoginForm.vue'
import AuthErrorDisplay from '~/components/auth/AuthErrorDisplay.vue'
import type { LoginFormData } from '~/types/auth/auth.types'

// Define page meta
definePageMeta({
  layout: 'auth',
  // TODO: Add guest middleware when implemented
  // middleware: 'guest',
})

// State
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const messageType = ref<'error' | 'success' | 'info'>('error')

// Handlers
const handleLogin = async (credentials: LoginFormData) => {
  try {
    isLoading.value = true
    errorMessage.value = null

    console.log('Login attempt with:', { email: credentials.email })

    // TODO: Implement actual login logic with useAuth composable
    // await auth.signIn(credentials.email, credentials.password)
    // navigateTo('/generate')

    // Placeholder - simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // For now, just show success message
    messageType.value = 'success'
    errorMessage.value = 'Logowanie zostanie zaimplementowane z useAuth composable'

  } catch (error) {
    messageType.value = 'error'
    errorMessage.value = 'Wystąpił błąd podczas logowania'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
