<template>
  <Card class="w-full max-w-md mx-auto login-form">
    <CardHeader>
      <CardTitle>Zaloguj się</CardTitle>
      <CardDescription> Wprowadź swoje dane logowania </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <!-- Email Field -->
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="twoj@email.com"
            :disabled="isLoading"
            @blur="validateEmailField"
          />
          <p v-if="errors.email" class="text-sm text-red-600">
            {{ errors.email }}
          </p>
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <Label for="password">Hasło</Label>
          <Input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="••••••••"
            :disabled="isLoading"
            @blur="validatePasswordField"
          />
          <p v-if="errors.password" class="text-sm text-red-600">
            {{ errors.password }}
          </p>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button :disabled="!isFormValid || isLoading" class="w-full" @click="handleSubmit">
        <span v-if="isLoading">Logowanie...</span>
        <span v-else>Zaloguj się</span>
      </Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useFormValidation } from '~/composables/useFormValidation'
import type { LoginFormData } from '~/types/auth/auth.types'

// Props
interface Props {
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

// Emits
const emit = defineEmits<{
  submit: [credentials: LoginFormData]
}>()

// Composables
const { validateEmail, validatePassword } = useFormValidation()

// Form data
const formData = ref<LoginFormData>({
  email: '',
  password: '',
})

// Errors
const errors = ref<Record<string, string | null>>({
  email: null,
  password: null,
})

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.email.trim().length > 0 &&
    formData.value.password.length > 0 &&
    !errors.value.email &&
    !errors.value.password
  )
})

// Methods
const validateEmailField = () => {
  errors.value.email = validateEmail(formData.value.email)
}

const validatePasswordField = () => {
  errors.value.password = validatePassword(formData.value.password, 1)
}

const validateForm = (): boolean => {
  validateEmailField()
  validatePasswordField()

  return !errors.value.email && !errors.value.password
}

const handleSubmit = () => {
  if (validateForm() && !props.isLoading) {
    emit('submit', {
      email: formData.value.email.trim(),
      password: formData.value.password,
    })
  }
}
</script>
<style scoped>
.login-form {
  width: 420px;
  max-width: calc(100vw - 2rem);
}
</style>
