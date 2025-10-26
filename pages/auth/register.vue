<template>
  <div>
    <RegisterForm :is-loading="isLoading" @submit="handleRegister" />
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
import type { RegisterFormData, AuthResponse } from '~/types/auth/auth.types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const isLoading = ref(false)

const { showSuccess, showError } = useNotification()

const handleRegister = async (credentials: RegisterFormData) => {
  try {
    isLoading.value = true

    const response = await $fetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
      },
    })

    if (response.session) {
      const supabase = useSupabase()

      const { data, error: setSessionError } = await supabase.supabase.auth.setSession({
        access_token: response.session.access_token,
        refresh_token: response.session.refresh_token,
      })

      if (setSessionError) {
        throw setSessionError
      }

      if (!data?.user) {
        throw new Error('No user returned from setSession!')
      }

      showSuccess('Konto zostało utworzone pomyślnie!')
      await navigateTo('/generate')
    } else {
      showSuccess('Konto zostało utworzone pomyślnie!')
      await new Promise(resolve => setTimeout(resolve, 1500))
      await navigateTo('/auth/login')
    }
  } catch (error: any) {
    const { mapError } = useAuthErrors()
    showError(mapError(error))
  } finally {
    isLoading.value = false
  }
}
</script>
