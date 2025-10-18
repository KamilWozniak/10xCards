<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" data-testid="flashcard-edit-modal" @click="handleBackdropClick">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
        @click.stop
      >
        <Card>
          <CardHeader>
            <CardTitle>Edytuj fiszkę</CardTitle>
            <CardDescription> Wprowadź zmiany w treści fiszki </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <!-- Front Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Przód <span class="text-red-500">*</span>
                </label>
                <Textarea
                  v-model="editForm.front"
                  :class="editForm.errors.front ? 'border-red-300' : ''"
                  placeholder="Wprowadź treść przodu fiszki..."
                  rows="3"
                  maxlength="200"
                  data-testid="edit-modal-front-textarea"
                  @input="validateFront"
                />
                <div class="flex justify-between items-center mt-1">
                  <div v-if="editForm.errors.front" class="text-sm text-red-600">
                    {{ editForm.errors.front }}
                  </div>
                  <div class="text-xs text-gray-500">{{ editForm.front.length }}/200 znaków</div>
                </div>
              </div>

              <!-- Back Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tył <span class="text-red-500">*</span>
                </label>
                <Textarea
                  v-model="editForm.back"
                  :class="editForm.errors.back ? 'border-red-300' : ''"
                  placeholder="Wprowadź treść tyłu fiszki..."
                  rows="4"
                  maxlength="500"
                  data-testid="edit-modal-back-textarea"
                  @input="validateBack"
                />
                <div class="flex justify-between items-center mt-1">
                  <div v-if="editForm.errors.back" class="text-sm text-red-600">
                    {{ editForm.errors.back }}
                  </div>
                  <div class="text-xs text-gray-500">{{ editForm.back.length }}/500 znaków</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter class="flex justify-end space-x-2">
            <Button variant="outline" data-testid="edit-modal-cancel-button" @click="handleCancel"> Anuluj </Button>
            <Button :disabled="!editForm.isValid" data-testid="edit-modal-save-button" @click="handleSave"> Zapisz zmiany </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
import type { FlashcardProposalViewModel } from '~/types/views/generate.types'

// Props
interface Props {
  proposal: FlashcardProposalViewModel
  isOpen: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  save: [editedProposal: FlashcardProposalViewModel]
  cancel: []
}>()

// Form handling
const { editForm, validateFront, validateBack, initializeForm, getEditedProposal } = useFlashcardEditForm(props.proposal)

// Watch for proposal changes
watch(
  () => props.proposal,
  newProposal => {
    if (newProposal) {
      initializeForm(newProposal)
    }
  },
  { immediate: true }
)

const handleSave = () => {
  if (editForm.value.isValid) {
    emit('save', getEditedProposal())
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}
</script>
