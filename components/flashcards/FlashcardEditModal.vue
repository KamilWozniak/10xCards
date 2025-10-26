<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    data-testid="flashcard-edit-modal"
    @click="handleBackdropClick"
  >
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
        @click.stop
      >
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-lg font-medium text-gray-900">Edytuj fiszkę</h2>
            <p class="mt-1 text-sm text-gray-600">Wprowadź zmiany w treści fiszki</p>
          </div>

          <div class="space-y-4">
            <!-- Front Field -->
            <div>
              <Label for="front" class="text-sm font-medium text-gray-700 mb-2 block">
                Przód <span class="text-red-500">*</span>
              </Label>
              <Textarea
                id="front"
                v-model="formData.front"
                :class="formData.errors.front ? 'border-red-300' : ''"
                placeholder="Wprowadź treść przodu fiszki..."
                rows="3"
                maxlength="200"
                data-testid="edit-modal-front-textarea"
                @input="validateFront"
              />
              <div class="flex justify-between items-center mt-1">
                <div v-if="formData.errors.front" class="text-sm text-red-600">
                  {{ formData.errors.front }}
                </div>
                <div class="text-xs text-gray-500">{{ formData.front.length }}/200 znaków</div>
              </div>
            </div>

            <!-- Back Field -->
            <div>
              <Label for="back" class="text-sm font-medium text-gray-700 mb-2 block">
                Tył <span class="text-red-500">*</span>
              </Label>
              <Textarea
                id="back"
                v-model="formData.back"
                :class="formData.errors.back ? 'border-red-300' : ''"
                placeholder="Wprowadź treść tyłu fiszki..."
                rows="4"
                maxlength="500"
                data-testid="edit-modal-back-textarea"
                @input="validateBack"
              />
              <div class="flex justify-between items-center mt-1">
                <div v-if="formData.errors.back" class="text-sm text-red-600">
                  {{ formData.errors.back }}
                </div>
                <div class="text-xs text-gray-500">{{ formData.back.length }}/500 znaków</div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <Button variant="outline" data-testid="edit-modal-cancel-button" @click="handleCancel">
              Anuluj
            </Button>
            <Button
              :disabled="!isFormValid || isLoading"
              data-testid="edit-modal-save-button"
              @click="handleSave"
            >
              <span v-if="isLoading">Zapisywanie...</span>
              <span v-else>Zapisz zmiany</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import type {
  FlashcardEditModalProps,
  FlashcardEditModalEmits,
  FlashcardEditFormState,
} from '~/types/views/flashcards.types'
import type { UpdateFlashcardDTO } from '~/types/dto/types'

const props = defineProps<FlashcardEditModalProps>()

// Emits
const emit = defineEmits<FlashcardEditModalEmits>()

// Form state
const formData = ref<FlashcardEditFormState>({
  front: '',
  back: '',
  isValid: false,
  errors: {},
})

const isLoading = ref(false)

const isFormValid = computed(() => {
  return (
    formData.value.front.trim().length > 0 &&
    formData.value.front.length <= 200 &&
    formData.value.back.trim().length > 0 &&
    formData.value.back.length <= 500 &&
    !formData.value.errors.front &&
    !formData.value.errors.back
  )
})

// Watch for flashcard changes to populate form
watch(
  () => props.flashcard,
  newFlashcard => {
    if (newFlashcard && props.isOpen) {
      formData.value = {
        front: newFlashcard.front,
        back: newFlashcard.back,
        isValid: false,
        errors: {},
      }
    }
  },
  { immediate: true }
)

// Validation methods
const validateFront = () => {
  const front = formData.value.front
  if (!front.trim()) {
    formData.value.errors.front = 'Przód fiszki jest wymagany'
  } else if (front.length > 200) {
    formData.value.errors.front = 'Przód fiszki nie może przekraczać 200 znaków'
  } else {
    delete formData.value.errors.front
  }
}

const validateBack = () => {
  const back = formData.value.back
  if (!back.trim()) {
    formData.value.errors.back = 'Tył fiszki jest wymagany'
  } else if (back.length > 500) {
    formData.value.errors.back = 'Tył fiszki nie może przekraczać 500 znaków'
  } else {
    delete formData.value.errors.back
  }
}

// Handlers
const handleSave = async () => {
  if (!props.flashcard || !isFormValid.value) return

  try {
    isLoading.value = true

    const updateData: UpdateFlashcardDTO = {
      front: formData.value.front.trim(),
      back: formData.value.back.trim(),
      source: 'ai-edited',
    }

    emit('save', props.flashcard.id, updateData)
    emit('update:open', false)
  } catch (error) {
    console.error('Error saving flashcard:', error)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('update:open', false)
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}
</script>
