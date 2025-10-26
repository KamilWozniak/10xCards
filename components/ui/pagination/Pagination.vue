<template>
  <nav class="flex items-center space-x-1" aria-label="Paginacja" data-testid="pagination">
    <!-- Previous Button -->
    <Button
      variant="outline"
      size="sm"
      :disabled="!hasPrev"
      data-testid="pagination-prev"
      @click="$emit('update:page', currentPage - 1)"
    >
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Poprzednia
    </Button>

    <!-- Page Numbers -->
    <div v-if="totalPages > 1" class="flex items-center space-x-1">
      <!-- First Page -->
      <Button
        v-if="showFirstEllipsis"
        variant="outline"
        size="sm"
        data-testid="pagination-first"
        @click="$emit('update:page', 1)"
      >
        1
      </Button>
      <span v-if="showFirstEllipsis" class="px-2 text-gray-500">...</span>

      <!-- Visible Page Numbers -->
      <Button
        v-for="page in visiblePages"
        :key="page"
        :variant="page === currentPage ? 'default' : 'outline'"
        size="sm"
        :data-testid="`pagination-page-${page}`"
        @click="$emit('update:page', page)"
      >
        {{ page }}
      </Button>

      <!-- Last Page -->
      <span v-if="showLastEllipsis" class="px-2 text-gray-500">...</span>
      <Button
        v-if="showLastEllipsis"
        variant="outline"
        size="sm"
        data-testid="pagination-last"
        @click="$emit('update:page', totalPages)"
      >
        {{ totalPages }}
      </Button>
    </div>

    <!-- Next Button -->
    <Button
      variant="outline"
      size="sm"
      :disabled="!hasNext"
      data-testid="pagination-next"
      @click="$emit('update:page', currentPage + 1)"
    >
      Następna
      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </Button>

    <!-- Total Info -->
    <div class="ml-4 text-sm text-gray-600" data-testid="pagination-info">
      {{ total }} {{ total === 1 ? 'fiszka' : total < 5 ? 'fiszki' : 'fiszek' }}
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '~/components/ui/button'
import type { PaginationProps, PaginationEmits } from '~/types/views/flashcards.types'

const props = withDefaults(defineProps<PaginationProps>(), {
  currentPage: 1,
  totalPages: 1,
  total: 0,
})

// Emits
const emit = defineEmits<PaginationEmits>()

// Computed
const hasPrev = computed(() => props.currentPage > 1)
const hasNext = computed(() => props.currentPage < props.totalPages)

// Visible pages logic
const visiblePages = computed(() => {
  const pages: number[] = []
  const current = props.currentPage
  const total = props.totalPages

  // Show max 5 pages around current page
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const showFirstEllipsis = computed(() => {
  return visiblePages.value.length > 0 && visiblePages.value[0] > 1
})

const showLastEllipsis = computed(() => {
  return (
    visiblePages.value.length > 0 &&
    visiblePages.value[visiblePages.value.length - 1] < props.totalPages
  )
})
</script>
