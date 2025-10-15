<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" @click="handleBackdropClick">
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
            <Button variant="outline" @click="handleCancel"> Anuluj </Button>
            <Button :disabled="!editForm.isValid" @click="handleSave"> Zapisz zmiany </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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
import type { FlashcardProposalViewModel, EditFormState } from '~/types/views/generate.types'

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

// Form state
const editForm = ref<EditFormState>({
  front: '',
  back: '',
  isValid: false,
  errors: {},
})

// Computed
const isValid = computed(() => {
  return (
    editForm.value.front.trim().length > 0 &&
    editForm.value.front.length <= 200 &&
    editForm.value.back.trim().length > 0 &&
    editForm.value.back.length <= 500
  )
})

// Methods
const validateForm = () => {
  editForm.value.isValid = isValid.value
}

const validateFront = () => {
  const front = editForm.value.front
  if (front.length === 0) {
    editForm.value.errors.front = 'Przód fiszki jest wymagany'
  } else if (front.length > 200) {
    editForm.value.errors.front = 'Przód fiszki nie może przekraczać 200 znaków'
  } else {
    delete editForm.value.errors.front
  }
  validateForm()
}

const validateBack = () => {
  const back = editForm.value.back
  if (back.length === 0) {
    editForm.value.errors.back = 'Tył fiszki jest wymagany'
  } else if (back.length > 500) {
    editForm.value.errors.back = 'Tył fiszki nie może przekraczać 500 znaków'
  } else {
    delete editForm.value.errors.back
  }
  validateForm()
}

// Watch for proposal changes
watch(
  () => props.proposal,
  newProposal => {
    if (newProposal) {
      editForm.value = {
        front: newProposal.front,
        back: newProposal.back,
        isValid: false,
        errors: {},
      }
      validateForm()
    }
  },
  { immediate: true }
)

// Watch for form validity
watch(isValid, newValidity => {
  editForm.value.isValid = newValidity
})

const handleSave = () => {
  if (editForm.value.isValid) {
    const editedProposal: FlashcardProposalViewModel = {
      ...props.proposal,
      front: editForm.value.front.trim(),
      back: editForm.value.back.trim(),
      isEdited: true,
      source: 'ai-edited',
    }
    emit('save', editedProposal)
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
