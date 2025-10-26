import { ref, computed } from 'vue'
import type { FormValidationState, SourceTextFormData } from '~/types/views/generate.types'

/**
 * Custom hook for source text form validation
 *
 * Validates text input for flashcard generation, ensuring it meets
 * length requirements (1000-10000 characters).
 */
export function useFlashcardsFormValidation() {
  // Constants
  const MIN_LENGTH = 1000
  const MAX_LENGTH = 10000

  // State
  const formValidation = ref<FormValidationState>({
    isValid: false,
    characterCount: 0,
    errorMessage: null,
    minLength: MIN_LENGTH,
    maxLength: MAX_LENGTH,
  })

  // Computed
  const isValid = computed(() => formValidation.value.isValid)
  const errorMessage = computed(() => formValidation.value.errorMessage)
  const characterCount = computed(() => formValidation.value.characterCount)

  // Methods
  const validateText = (text: string): boolean => {
    const trimmedText = text.trim()
    const length = trimmedText.length

    // Update character count
    formValidation.value.characterCount = length

    // Validate length
    if (length === 0) {
      formValidation.value.isValid = false
      formValidation.value.errorMessage = 'Tekst jest wymagany'
      return false
    }

    if (length < MIN_LENGTH) {
      formValidation.value.isValid = false
      formValidation.value.errorMessage = `Tekst musi mieć co najmniej ${MIN_LENGTH} znaków (obecnie: ${length})`
      return false
    }

    if (length > MAX_LENGTH) {
      formValidation.value.isValid = false
      formValidation.value.errorMessage = `Tekst nie może przekraczać ${MAX_LENGTH} znaków (obecnie: ${length})`
      return false
    }

    // Valid
    formValidation.value.isValid = true
    formValidation.value.errorMessage = null
    return true
  }

  const resetValidation = () => {
    formValidation.value = {
      isValid: false,
      characterCount: 0,
      errorMessage: null,
      minLength: MIN_LENGTH,
      maxLength: MAX_LENGTH,
    }
  }

  const validateFormData = (formData: SourceTextFormData): boolean => {
    return validateText(formData.text)
  }

  return {
    // State
    formValidation: readonly(formValidation),

    // Computed
    isValid,
    errorMessage,
    characterCount,

    // Methods
    validateText,
    validateFormData,
    resetValidation,
  }
}
