<template>
  <Card class="h-full" data-testid="flashcard-item">
    <CardContent class="p-6">
      <div class="flex flex-col h-full">
        <!-- Front Content -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Przód</h3>
          <p class="text-gray-700 whitespace-pre-wrap" data-testid="flashcard-front">
            {{ flashcard.front }}
          </p>
        </div>

        <!-- Back Content -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Tył</h3>
          <p class="text-gray-700 whitespace-pre-wrap" data-testid="flashcard-back">
            {{ flashcard.back }}
          </p>
        </div>

        <!-- Source Badge -->
        <div class="mb-4 text-center">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getSourceBadgeClass(flashcard.source)"
            data-testid="flashcard-source-badge"
          >
            {{ getSourceLabel(flashcard.source) }}
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            data-testid="flashcard-edit-button"
            @click="$emit('edit', flashcard.id)"
          >
            Edytuj
          </Button>
          <Button
            variant="destructive"
            size="sm"
            data-testid="flashcard-delete-button"
            @click="$emit('delete', flashcard.id)"
          >
            Usuń
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import type { FlashcardItemProps, FlashcardItemEmits } from '~/types/views/flashcards.types'

const props = defineProps<FlashcardItemProps>()

// Emits
const emit = defineEmits<FlashcardItemEmits>()

// Methods
const getSourceBadgeClass = (source: string) => {
  switch (source) {
    case 'ai-full':
      return 'bg-blue-100 text-blue-800'
    case 'ai-edited':
      return 'bg-green-100 text-green-800'
    case 'manual':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getSourceLabel = (source: string) => {
  switch (source) {
    case 'ai-full':
      return 'Wygenerowana przez AI'
    case 'ai-edited':
      return 'Edytowana przez użytkownika'
    case 'manual':
      return 'Ręcznie utworzona'
    default:
      return source
  }
}
</script>
