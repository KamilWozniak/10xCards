<template>
  <Card data-testid="source-text-form">
    <CardHeader>
      <CardTitle>Tekst źródłowy</CardTitle>
      <CardDescription>
        Wprowadź tekst, z którego AI wygeneruje fiszki (1000-10000 znaków)
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div>
          <Textarea
            v-model="formData.text"
            :disabled="disabled"
            placeholder="Wprowadź tekst źródłowy..."
            class="w-full min-h-[200px]"
            data-testid="source-text-textarea"
            @input="handleTextInput"
          />
        </div>

        <div
          class="flex justify-between items-center text-sm"
          data-testid="character-counter-section"
        >
          <div class="flex items-center space-x-2">
            <span
              :class="['font-medium', formValidation.isValid ? 'text-green-600' : 'text-red-600']"
              data-testid="character-count"
            >
              {{ formData.characterCount }} znaków
            </span>
            <span class="text-gray-500">
              (min: {{ formValidation.minLength }}, max: {{ formValidation.maxLength }})
            </span>
          </div>

          <div class="w-32 bg-gray-200 rounded-full h-2" data-testid="character-progress-bar">
            <div
              :class="[
                'h-2 rounded-full transition-all duration-300',
                formValidation.isValid ? 'bg-green-500' : 'bg-red-500',
              ]"
              :style="{ width: `${progressPercentage}%` }"
              data-testid="character-progress-fill"
            />
          </div>
        </div>

        <div
          v-if="formValidation.errorMessage"
          class="text-sm text-red-600"
          data-testid="form-validation-error"
        >
          {{ formValidation.errorMessage }}
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button
        :disabled="!formValidation.isValid || disabled"
        :loading="isLoading"
        class="w-full"
        data-testid="generate-flashcards-button"
        @click="handleGenerate"
      >
        <span v-if="isLoading" data-testid="generate-loading-text">Generuję fiszki...</span>
        <span v-else data-testid="generate-button-text">Generuj fiszki</span>
      </Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { useFlashcardsFormValidation } from '~/composables/useFlashcardsFormValidation'
import type { SourceTextFormData } from '~/types/views/generate.types'

interface Props {
  isLoading: boolean
  disabled: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  generate: [text: string]
}>()

const { formValidation, validateText, resetValidation } = useFlashcardsFormValidation()

const formData = ref<SourceTextFormData>({
  text: '',
  characterCount: 0,
  isValid: false,
})

const progressPercentage = computed(() => {
  const { minLength, maxLength } = formValidation.value
  const current = formData.value.characterCount
  const range = maxLength - minLength
  const progress = Math.max(0, Math.min(100, ((current - minLength) / range) * 100))
  return progress
})

const handleTextInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  formData.value.text = target.value
  formData.value.characterCount = target.value.trim().length
  formData.value.isValid = validateText(target.value)
}

const handleGenerate = () => {
  if (formValidation.value.isValid && formData.value.text.trim()) {
    emit('generate', formData.value.text.trim())
  }
}

watch(
  () => props.disabled,
  newDisabled => {
    if (newDisabled) {
      formData.value = {
        text: '',
        characterCount: 0,
        isValid: false,
      }
      resetValidation()
    }
  }
)
</script>
