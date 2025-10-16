<template>
  <div>
    <!-- Error/Success Message Display -->
    <AuthErrorDisplay
      :message="errorMessage"
      :type="messageType"
    />

    <!-- Register Form -->
    <RegisterForm
      :is-loading="isLoading"
      @submit="handleRegister"
    />

    <!-- Link to Login -->
    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Masz już konto?
        <NuxtLink
          to="/auth/login"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          Zaloguj się
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RegisterForm from '~/components/auth/RegisterForm.vue'
import AuthErrorDisplay from '~/components/auth/AuthErrorDisplay.vue'
import type { RegisterFormData } from '~/types/auth/auth.types'

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
const handleRegister = async (credentials: RegisterFormData) => {
  try {
    isLoading.value = true
    errorMessage.value = null

    console.log('Registration attempt with:', { email: credentials.email })

    // TODO: Implement actual registration logic with useAuth composable
    // await auth.signUp(credentials.email, credentials.password)
    // Show success message or auto-login
    // navigateTo('/generate')

    // Placeholder - simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // For now, just show success message
    messageType.value = 'success'
    errorMessage.value = 'Rejestracja zostanie zaimplementowana z useAuth composable'

  } catch (error) {
    messageType.value = 'error'
    errorMessage.value = 'Wystąpił błąd podczas rejestracji'
    console.error('Registration error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
