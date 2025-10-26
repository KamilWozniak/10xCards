import { defineStore, storeToRefs } from 'pinia'
import { reactive, computed } from 'vue'
import type {
  FlashcardDTO,
  PaginatedFlashcardsResponseDTO,
  UpdateFlashcardDTO,
  FlashcardListQueryDTO,
} from '~/types/dto/types'
import type { FlashcardsState } from '~/types/views/flashcards.types'

export const useFlashcardsStore = defineStore('flashcards', () => {
  // State
  const state = reactive<FlashcardsState>({
    flashcards: [],
    currentPage: 1,
    totalPages: 0,
    total: 0,
    limit: 10,
    loading: false,
    error: null,
  })

  // Computed
  const isLoading = computed(() => state.loading)
  const hasError = computed(() => !!state.error)
  const hasFlashcards = computed(() => state.flashcards.length > 0)
  const isEmpty = computed(() => !state.loading && state.flashcards.length === 0)

  // Actions
  const setLoading = (loading: boolean) => {
    state.loading = loading
  }

  const setError = (error: string | null) => {
    state.error = error
  }

  const setFlashcards = (response: PaginatedFlashcardsResponseDTO) => {
    state.flashcards = response.data
    state.total = response.pagination.total
    state.totalPages = Math.ceil(response.pagination.total / response.pagination.limit)
    state.currentPage = response.pagination.page
    state.limit = response.pagination.limit
  }

  const updateFlashcardInList = (updatedFlashcard: FlashcardDTO) => {
    const index = state.flashcards.findIndex((f: FlashcardDTO) => f.id === updatedFlashcard.id)
    if (index !== -1) {
      state.flashcards[index] = updatedFlashcard
    }
  }

  const removeFlashcardFromList = (flashcardId: number) => {
    state.flashcards = state.flashcards.filter((f: FlashcardDTO) => f.id !== flashcardId)
    state.total = Math.max(0, state.total - 1)
    state.totalPages = Math.ceil(state.total / state.limit)
  }

  // API Actions
  const fetchFlashcards = async (query: FlashcardListQueryDTO = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (query.page) params.append('page', query.page.toString())
      if (query.limit) params.append('limit', query.limit.toString())

      const queryString = params.toString()
      const url = `/api/flashcards${queryString ? `?${queryString}` : ''}`

      const response = await $fetch<PaginatedFlashcardsResponseDTO>(url, {
        method: 'GET',
      })

      setFlashcards(response)
    } catch (error: any) {
      console.error('Error fetching flashcards:', error)
      setError(error.data?.error || error.message || 'Wystąpił błąd podczas pobierania fiszek')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateFlashcard = async (flashcardId: number, updateData: UpdateFlashcardDTO) => {
    try {
      setError(null)

      const response = await $fetch<FlashcardDTO>(`/api/flashcards/${flashcardId}`, {
        method: 'PUT',
        body: updateData,
      })

      // Update the flashcard in the local list
      updateFlashcardInList(response)

      return response
    } catch (error: any) {
      console.error('Error updating flashcard:', error)
      setError(error.data?.error || error.message || 'Wystąpił błąd podczas aktualizacji fiszki')
      throw error
    }
  }

  const deleteFlashcard = async (flashcardId: number) => {
    try {
      setError(null)

      await $fetch(`/api/flashcards/${flashcardId}`, {
        method: 'DELETE',
      })

      // Remove the flashcard from the local list
      removeFlashcardFromList(flashcardId)
    } catch (error: any) {
      console.error('Error deleting flashcard:', error)
      setError(error.data?.error || error.message || 'Wystąpił błąd podczas usuwania fiszki')
      throw error
    }
  }

  const setCurrentPage = (page: number) => {
    state.currentPage = page
  }

  const resetState = () => {
    state.flashcards = []
    state.currentPage = 1
    state.totalPages = 0
    state.total = 0
    state.loading = false
    state.error = null
  }

  return {
    // State
    state,

    // Computed
    isLoading,
    hasError,
    hasFlashcards,
    isEmpty,

    // Actions
    fetchFlashcards,
    updateFlashcard,
    deleteFlashcard,
    setCurrentPage,
    resetState,
  }
})
