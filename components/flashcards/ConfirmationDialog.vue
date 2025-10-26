<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    data-testid="confirmation-dialog"
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
            <h2 class="text-lg font-medium text-gray-900">Potwierdź usunięcie</h2>
            <p class="mt-1 text-sm text-gray-600">
              Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie można cofnąć.
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <Button
              variant="outline"
              data-testid="confirmation-dialog-cancel"
              @click="handleCancel"
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              :disabled="isLoading"
              data-testid="confirmation-dialog-confirm"
              @click="handleConfirm"
            >
              <span v-if="isLoading">Usuwanie...</span>
              <span v-else>Usuń</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import type {
  ConfirmationDialogProps,
  ConfirmationDialogEmits,
} from '~/types/views/flashcards.types'

const props = defineProps<ConfirmationDialogProps>()

// Emits
const emit = defineEmits<ConfirmationDialogEmits>()

// Local state
const isLoading = ref(false)

// Handlers
const handleConfirm = async () => {
  if (!props.flashcardId) return

  try {
    isLoading.value = true
    emit('confirm', props.flashcardId)
    emit('update:open', false)
  } catch (error) {
    console.error('Error in confirmation dialog:', error)
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
