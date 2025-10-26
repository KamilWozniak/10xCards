<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl" data-testid="flashcards-page">
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center" data-testid="flashcards-page-header">
        <h1 class="text-3xl font-bold text-gray-900" data-testid="flashcards-page-title">
          Moje fiszki
        </h1>
        <p class="mt-2 text-gray-600" data-testid="flashcards-page-description">
          Zarządzaj swoimi fiszkami edukacyjnymi - przeglądaj, edytuj i usuwaj
        </p>
      </div>

      <!-- Flashcards List -->
      <FlashcardsList
        :flashcards="flashcardsStore.state.flashcards"
        :loading="flashcardsStore.isLoading"
        :error="flashcardsStore.state.error"
        data-testid="flashcards-list"
        @edit="handleEditFlashcard"
        @delete="handleDeleteFlashcard"
        @retry="handleRetry"
      />

      <!-- Pagination -->
      <div
        v-if="flashcardsStore.hasFlashcards"
        class="flex justify-center mt-8"
        data-testid="pagination-container"
      >
        <Pagination
          :current-page="flashcardsStore.state.currentPage"
          :total-pages="flashcardsStore.state.totalPages"
          :total="flashcardsStore.state.total"
          @update:page="handlePageChange"
        />
      </div>
    </div>

    <!-- Edit Modal -->
    <FlashcardEditModal
      :flashcard="selectedFlashcard"
      :is-open="isEditModalOpen"
      @update:open="isEditModalOpen = $event"
      @save="handleSaveFlashcard"
    />

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      :is-open="isDeleteDialogOpen"
      :flashcard-id="flashcardToDelete"
      @update:open="isDeleteDialogOpen = $event"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFlashcardsStore } from '~/store/flashcards'
import FlashcardsList from '~/components/flashcards/FlashcardsList.vue'
import { Pagination } from '~/components/ui/pagination'
import FlashcardEditModal from '~/components/flashcards/FlashcardEditModal.vue'
import ConfirmationDialog from '~/components/flashcards/ConfirmationDialog.vue'
import type { FlashcardDTO, UpdateFlashcardDTO } from '~/types/dto/types'

// Use default layout with navigation
definePageMeta({
  layout: 'default',
})

// Authentication is handled by middleware/auth.global.ts
// No need to check here

// Store
const flashcardsStore = useFlashcardsStore()

// Modal states
const isEditModalOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedFlashcard = ref<FlashcardDTO | null>(null)
const flashcardToDelete = ref<number | null>(null)

// Fetch flashcards on mount
onMounted(async () => {
  try {
    await flashcardsStore.fetchFlashcards({ page: 1, limit: 10 })
  } catch (error) {
    console.error('Error fetching flashcards on mount:', error)
  }
})

// Handlers
const handleEditFlashcard = (flashcardId: number) => {
  const flashcard = flashcardsStore.state.flashcards.find((f: FlashcardDTO) => f.id === flashcardId)
  if (flashcard) {
    selectedFlashcard.value = flashcard
    isEditModalOpen.value = true
  }
}

const handleDeleteFlashcard = (flashcardId: number) => {
  flashcardToDelete.value = flashcardId
  isDeleteDialogOpen.value = true
}

const handleSaveFlashcard = async (flashcardId: number, updateData: UpdateFlashcardDTO) => {
  try {
    await flashcardsStore.updateFlashcard(flashcardId, updateData)
    // Modal is closed automatically by the component
  } catch (error) {
    console.error('Error saving flashcard:', error)
    // Error is handled by the store and displayed in the modal
  }
}

const handleConfirmDelete = async (flashcardId: number) => {
  try {
    await flashcardsStore.deleteFlashcard(flashcardId)
    // Dialog is closed automatically by the component
  } catch (error) {
    console.error('Error deleting flashcard:', error)
    // Error is handled by the store
  }
}

const handlePageChange = async (page: number) => {
  try {
    await flashcardsStore.fetchFlashcards({
      page,
      limit: flashcardsStore.state.limit,
    })
  } catch (error) {
    console.error('Error changing page:', error)
  }
}

const handleRetry = async () => {
  try {
    await flashcardsStore.fetchFlashcards({
      page: flashcardsStore.state.currentPage,
      limit: flashcardsStore.state.limit,
    })
  } catch (error) {
    console.error('Error retrying fetch:', error)
  }
}
</script>
