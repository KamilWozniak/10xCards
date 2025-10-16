<template>
  <Card>
    <CardHeader>
      <CardTitle>Zarejestruj się</CardTitle>
      <CardDescription>
        Utwórz nowe konto, aby korzystać z aplikacji
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <!-- Email Field -->
        <div class="space-y-2">
          <Label for="register-email">Email</Label>
          <Input
            id="register-email"
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
          <Label for="register-password">Hasło</Label>
          <Input
            id="register-password"
            v-model="formData.password"
            type="password"
            placeholder="••••••••"
            :disabled="isLoading"
            @blur="validatePasswordField"
          />
          <p v-if="errors.password" class="text-sm text-red-600">
            {{ errors.password }}
          </p>
          <p v-else class="text-xs text-gray-500">
            Hasło musi mieć minimum 6 znaków
          </p>
        </div>

        <!-- Confirm Password Field -->
        <div class="space-y-2">
          <Label for="register-confirm-password">Powtórz hasło</Label>
          <Input
            id="register-confirm-password"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="••••••••"
            :disabled="isLoading"
            @blur="validateConfirmPasswordField"
          />
          <p v-if="errors.confirmPassword" class="text-sm text-red-600">
            {{ errors.confirmPassword }}
          </p>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button
        :disabled="!isFormValid || isLoading"
        class="w-full"
        @click="handleSubmit"
      >
        <span v-if="isLoading">Rejestracja...</span>
        <span v-else>Zarejestruj się</span>
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
import type { RegisterFormData } from '~/types/auth/auth.types'

// Props
interface Props {
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

// Emits
const emit = defineEmits<{
  submit: [credentials: RegisterFormData]
}>()

// Composables
const { validateEmail, validatePassword, validatePasswordMatch } = useFormValidation()

// Form data
const formData = ref<RegisterFormData>({
  email: '',
  password: '',
  confirmPassword: '',
})

// Errors
const errors = ref<Record<string, string | null>>({
  email: null,
  password: null,
  confirmPassword: null,
})

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.email.trim().length > 0 &&
    formData.value.password.length >= 6 &&
    formData.value.confirmPassword.length > 0 &&
    !errors.value.email &&
    !errors.value.password &&
    !errors.value.confirmPassword
  )
})

// Methods
const validateEmailField = () => {
  errors.value.email = validateEmail(formData.value.email)
}

const validatePasswordField = () => {
  errors.value.password = validatePassword(formData.value.password, 6)
  // Re-validate confirm password if it's already filled
  if (formData.value.confirmPassword.length > 0) {
    validateConfirmPasswordField()
  }
}

const validateConfirmPasswordField = () => {
  errors.value.confirmPassword = validatePasswordMatch(
    formData.value.password,
    formData.value.confirmPassword
  )
}

const validateForm = (): boolean => {
  validateEmailField()
  validatePasswordField()
  validateConfirmPasswordField()

  return (
    !errors.value.email &&
    !errors.value.password &&
    !errors.value.confirmPassword
  )
}

const handleSubmit = () => {
  if (validateForm() && !props.isLoading) {
    emit('submit', {
      email: formData.value.email.trim(),
      password: formData.value.password,
      confirmPassword: formData.value.confirmPassword,
    })
  }
}
</script>
