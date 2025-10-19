<template>
  <div data-testid="login-page">
    <h1>Test2</h1>
    <!-- Error/Success Message Display -->
    <AuthErrorDisplay :message="errorMessage" :type="messageType" />

    <!-- Login Form -->
    <LoginForm :is-loading="isLoading" @submit="handleLogin" />

    <!-- Link to Register -->
    <div class="mt-6 text-center" data-testid="register-link-section">
      <p class="text-sm text-gray-600">
        Nie masz konta?
        <NuxtLink
          to="/auth/register"
          class="font-medium text-blue-600 hover:text-blue-500"
          data-testid="register-link"
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
  middleware: 'guest',
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

    // Call server-side login endpoint
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    })

    console.log('Login successful:', response)
    console.log('Response has session?', !!response.session)
    console.log('Session data:', response.session)

    // Login successful - show success message
    messageType.value = 'success'
    errorMessage.value = 'Zalogowano pomyślnie. Przekierowywanie...'

    // Set session in client-side Supabase (for middleware to work)
    const supabase = useSupabase()

    if (!response.session) {
      throw new Error('No session in response!')
    }

    const { data, error: setSessionError } = await supabase.supabase.auth.setSession({
      access_token: response.session.access_token,
      refresh_token: response.session.refresh_token,
    })

    if (setSessionError) {
      console.error('Error setting session:', setSessionError)
      throw setSessionError
    }

    if (!data?.user) {
      throw new Error('No user returned from setSession!')
    }

    console.log('User logged in successfully:', data.user.email)

    // Session is now set - redirect to /generate
    // Middleware will allow access because session is loaded in Supabase client
    await navigateTo('/generate')
  } catch (error: any) {
    messageType.value = 'error'

    // Map error to user-friendly message
    const { mapError } = useAuthErrors()

    if (error?.data?.statusMessage) {
      errorMessage.value = error.data.statusMessage
    } else if (error?.statusMessage) {
      errorMessage.value = error.statusMessage
    } else {
      errorMessage.value = mapError(error)
    }

    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
