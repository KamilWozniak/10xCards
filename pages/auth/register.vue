<template>
  <div>
    <AuthMessageDisplay :message="message" :type="messageType" />
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
import AuthMessageDisplay from '~/components/auth/AuthMessageDisplay.vue'
import type { RegisterFormData, AuthResponse } from '~/types/auth/auth.types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const isLoading = ref(false)
const message = ref<string | null>(null)
const messageType = ref<'error' | 'success' | 'info'>('error')

const handleRegister = async (credentials: RegisterFormData) => {
  try {
    isLoading.value = true
    message.value = null

    const response = await $fetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
      },
    })

    messageType.value = 'success'
    message.value = 'Konto zostało utworzone pomyślnie. Przekierowywanie...'

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

      await navigateTo('/generate')
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500))
      await navigateTo('/auth/login')
    }
  } catch (error: any) {
    const { mapError } = useAuthErrors()

    messageType.value = 'error'
    message.value = mapError(error)
  } finally {
    isLoading.value = false
  }
}
</script>
