<template>
  <div data-testid="login-page">
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
import type { LoginFormData, AuthResponse } from '~/types/auth/auth.types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const isLoading = ref(false)

const { showSuccess, showError } = useNotification()

const handleLogin = async (credentials: LoginFormData) => {
  try {
    isLoading.value = true

    const response = await $fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    })

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

    showSuccess('Zalogowano pomyślnie!')
    await navigateTo('/generate')
  } catch (error: any) {
    const { mapError } = useAuthErrors()
    showError(mapError(error))
  } finally {
    isLoading.value = false
  }
}
</script>
