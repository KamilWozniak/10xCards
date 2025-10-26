<template>
  <div data-testid="flashcards-list">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12" data-testid="flashcards-loading">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12" data-testid="flashcards-error">
      <div class="text-red-600 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Błąd ładowania fiszek</h3>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <Button variant="outline" data-testid="flashcards-retry-button" @click="$emit('retry')">
        Spróbuj ponownie
      </Button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!flashcards.length" class="text-center py-12" data-testid="flashcards-empty">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Brak fiszek</h3>
      <p class="text-gray-600 mb-4">
        Nie masz jeszcze żadnych fiszek. Utwórz nowe w sekcji generowania.
      </p>
      <Button as-child data-testid="flashcards-generate-link">
        <NuxtLink to="/generate"> Generuj fiszki z AI </NuxtLink>
      </Button>
    </div>

    <!-- Flashcards Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      data-testid="flashcards-grid"
    >
      <div v-for="flashcard in flashcards" :key="flashcard.id" class="h-full">
        <FlashcardItem
          :flashcard="flashcard"
          data-testid="flashcard-item"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import FlashcardItem from './FlashcardItem.vue'
import type { FlashcardsListProps, FlashcardsListEmits } from '~/types/views/flashcards.types'

const props = defineProps<FlashcardsListProps>()

// Emits
const emit = defineEmits<FlashcardsListEmits>()
</script>
