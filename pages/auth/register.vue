<template>
  <div>
    <!-- Error/Success Message Display -->
    <AuthErrorDisplay :message="errorMessage" :type="messageType" />

    <!-- Register Form -->
    <RegisterForm :is-loading="isLoading" @submit="handleRegister" />

    <!-- Link to Login -->
    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Masz już konto?
        <NuxtLink to="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
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
  middleware: 'guest',
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

    // Call server-side register endpoint
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
      },
    })

    console.log('Registration successful:', response)

    // Registration successful - show success message
    messageType.value = 'success'
    errorMessage.value = 'Konto zostało utworzone pomyślnie. Przekierowywanie...'

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

    console.log('User registered and logged in successfully:', data.user.email)

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

    console.error('Registration error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
