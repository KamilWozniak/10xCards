import { ref, computed, watch } from 'vue'
import type { FlashcardProposalViewModel, EditFormState } from '~/types/views/generate.types'

export function useFlashcardEditForm(initialProposal: FlashcardProposalViewModel) {
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

  // Initialize form with proposal data
  const initializeForm = (proposal: FlashcardProposalViewModel) => {
    editForm.value = {
      front: proposal.front,
      back: proposal.back,
      isValid: false,
      errors: {},
    }
    validateForm()
  }

  // Watch for form validity
  watch(isValid, newValidity => {
    editForm.value.isValid = newValidity
  })

  // Initialize form with initial proposal
  initializeForm(initialProposal)

  const getEditedProposal = (): FlashcardProposalViewModel => {
    return {
      ...initialProposal,
      front: editForm.value.front.trim(),
      back: editForm.value.back.trim(),
      isEdited: true,
      source: 'ai-edited',
    }
  }

  return {
    editForm,
    isValid,
    validateFront,
    validateBack,
    initializeForm,
    getEditedProposal,
  }
}
