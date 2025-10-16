import { ref, computed } from 'vue'
import type { GenerationState, FlashcardProposalViewModel } from '~/types/views/generate.types'
import type {
  CreateGenerationRequestDTO,
  CreateGenerationResponseDTO,
  CreateFlashcardsRequestDTO,
} from '~/types/dto/types'

/**
 * Custom hook do zarządzania stanem generowania fiszek
 */
export function useGenerationState() {
  // State
  const generationState = ref<GenerationState>({
    isLoading: false,
    error: null,
    proposals: [],
    generationId: null,
  })

  // Computed
  const hasProposals = computed(() => generationState.value.proposals.length > 0)
  const hasError = computed(() => !!generationState.value.error)
  const isGenerating = computed(() => generationState.value.isLoading)

  // Methods
  const setLoading = (loading: boolean) => {
    generationState.value.isLoading = loading
  }

  const setError = (error: string | null) => {
    generationState.value.error = error
  }

  const setProposals = (proposals: FlashcardProposalViewModel[]) => {
    generationState.value.proposals = proposals
  }

  const setGenerationId = (id: number | null) => {
    generationState.value.generationId = id
  }

  const clearError = () => {
    generationState.value.error = null
  }

  const resetState = () => {
    generationState.value = {
      isLoading: false,
      error: null,
      proposals: [],
      generationId: null,
    }
  }

  /**
   * Generuje fiszki na podstawie tekstu źródłowego
   */
  const generateFlashcards = async (sourceText: string) => {
    try {
      setLoading(true)
      clearError()

      const request: CreateGenerationRequestDTO = {
        source_text: sourceText,
      }

      const response = await $fetch<CreateGenerationResponseDTO>('/api/generations', {
        method: 'POST',
        body: request,
      })

      // Transform DTOs to ViewModels
      const proposals = response.flashcards_proposals.map((dto, index) => ({
        id: `proposal-${index}-${Date.now()}`,
        front: dto.front,
        back: dto.back,
        source: dto.source as 'ai-full',
        isAccepted: false,
        isRejected: false,
        isEdited: false,
      }))

      setProposals(proposals)
      setGenerationId(response.generation_id)
    } catch (error: any) {
      console.error('Error generating flashcards:', error)
      setError(error.data?.error || error.message || 'Wystąpił błąd podczas generowania fiszek')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Zapisuje wybrane fiszki do bazy danych
   */
  const saveFlashcards = async (
    selectedProposals: FlashcardProposalViewModel[],
    generationId: number
  ) => {
    try {
      setLoading(true)
      clearError()

      const flashcards = selectedProposals.map(proposal => ({
        front: proposal.front,
        back: proposal.back,
        source: proposal.source,
        generation_id: generationId,
      }))

      const request: CreateFlashcardsRequestDTO = {
        flashcards,
      }

      await $fetch('/api/flashcards', {
        method: 'POST',
        body: request,
      })

      // Reset state after successful save
      resetState()
    } catch (error: any) {
      console.error('Error saving flashcards:', error)
      setError(error.data?.error || error.message || 'Wystąpił błąd podczas zapisywania fiszek')
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    generationState,

    // Computed
    hasProposals,
    hasError,
    isGenerating,

    // Methods
    generateFlashcards,
    saveFlashcards,
    clearError,
    resetState,
  }
}
