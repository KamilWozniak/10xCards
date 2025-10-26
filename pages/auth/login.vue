<template>
  <div data-testid="login-page">
    <h1>Test4</h1>
    <AuthMessageDisplay :message="message" :type="messageType" />
    <LoginForm :is-loading="isLoading" @submit="handleLogin" />
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
import AuthMessageDisplay from '~/components/auth/AuthMessageDisplay.vue'
import type { LoginFormData, AuthResponse } from '~/types/auth/auth.types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const isLoading = ref(false)
const message = ref<string | null>(null)
const messageType = ref<'error' | 'success' | 'info'>('error')

const handleLogin = async (credentials: LoginFormData) => {
  try {
    isLoading.value = true
    message.value = null

    const response = await $fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    })

    messageType.value = 'success'
    message.value = 'Zalogowano pomyślnie. Przekierowywanie...'

    const supabase = useSupabase()

    if (!response.session) {
      throw new Error('No session in response!')
    }

    const { data, error: sessionError } = await supabase.supabase.auth.setSession({
      access_token: response.session.access_token,
      refresh_token: response.session.refresh_token,
    })

    if (sessionError) {
      throw sessionError
    }

    if (!data?.user) {
      throw new Error('No user returned from setSession!')
    }

    await navigateTo('/generate')
  } catch (error: any) {
    const { mapError } = useAuthErrors()

    messageType.value = 'error'
    message.value = mapError(error)
  } finally {
    isLoading.value = false
  }
}
</script>
