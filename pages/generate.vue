<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">Generuj fiszki z AI</h1>
        <p class="mt-2 text-gray-600">
          Wprowadź tekst (1000-10000 znaków), a AI wygeneruje dla Ciebie propozycje fiszek
        </p>
      </div>

      <!-- Source Text Form -->
      <SourceTextForm
        :is-loading="generationState.isLoading"
        :disabled="generationState.isLoading"
        @generate="handleGenerate"
      />

      <!-- Loading Spinner -->
      <div v-if="generationState.isLoading" class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error Message -->
      <div v-if="generationState.error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Błąd generowania</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ generationState.error }}</p>
            </div>
            <div class="mt-4">
              <button
                class="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                @click="retryGeneration"
              >
                Spróbuj ponownie
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Flashcard Proposals List -->
      <FlashcardProposalsList
        v-if="generationState.proposals.length > 0"
        :proposals="generationState.proposals"
        :generation-id="generationState.generationId!"
        @save-selected="handleSaveSelected"
        @proposal-accept="handleProposalAccept"
        @proposal-reject="handleProposalReject"
        @proposal-edit="handleProposalEdit"
        @proposal-save-edit="handleProposalSaveEdit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGenerationState } from '~/composables/useGenerationState'
import SourceTextForm from '~/components/generate/SourceTextForm.vue'
import FlashcardProposalsList from '~/components/generate/FlashcardProposalsList.vue'
import type { FlashcardProposalViewModel } from '~/types/views/generate.types'

// Composables
const { generationState, generateFlashcards, saveFlashcards, clearError } = useGenerationState()

// Handlers
const handleGenerate = async (text: string) => {
  try {
    clearError()
    await generateFlashcards(text)
  } catch (error) {
    console.error('Error generating flashcards:', error)
  }
}

const handleSaveSelected = async (selectedProposals: FlashcardProposalViewModel[]) => {
  try {
    if (!generationState.value.generationId) {
      throw new Error('Brak ID generacji')
    }

    await saveFlashcards(selectedProposals, generationState.value.generationId!)

    // Redirect to flashcards list after successful save
    await navigateTo('/flashcards')
  } catch (error) {
    console.error('Error saving flashcards:', error)
  }
}

const retryGeneration = () => {
  clearError()
}

// Proposal action handlers
const handleProposalAccept = (proposal: FlashcardProposalViewModel) => {
  const index = generationState.value.proposals.findIndex(
    (p: FlashcardProposalViewModel) => p.id === proposal.id
  )
  if (index !== -1) {
    generationState.value.proposals[index].isAccepted = true
    generationState.value.proposals[index].isRejected = false
  }
}

const handleProposalReject = (proposal: FlashcardProposalViewModel) => {
  const index = generationState.value.proposals.findIndex(
    (p: FlashcardProposalViewModel) => p.id === proposal.id
  )
  if (index !== -1) {
    generationState.value.proposals[index].isAccepted = false
    generationState.value.proposals[index].isRejected = true
  }
}

const handleProposalEdit = () => {
  // This is handled by the FlashcardProposalsList component internally
  // No action needed here
}

const handleProposalSaveEdit = (editedProposal: FlashcardProposalViewModel) => {
  const index = generationState.value.proposals.findIndex(
    (p: FlashcardProposalViewModel) => p.id === editedProposal.id
  )
  if (index !== -1) {
    generationState.value.proposals[index] = {
      ...editedProposal,
      isAccepted: true,
      isEdited: true,
      source: 'ai-edited' as const,
      originalProposal: generationState.value.proposals[index],
    }
  }
}
</script>
