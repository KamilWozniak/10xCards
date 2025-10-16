<template>
  <Card
    class="transition-all duration-200 hover:shadow-md"
    :class="{ 'opacity-50': proposal.isRejected }"
  >
    <CardContent class="p-4">
      <div class="space-y-4">
        <!-- Front Content -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Przód:</h4>
          <p class="text-gray-900 bg-gray-50 p-3 rounded-md border">
            {{ proposal.front }}
          </p>
        </div>

        <!-- Back Content -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Tył:</h4>
          <p class="text-gray-900 bg-gray-50 p-3 rounded-md border">
            {{ proposal.back }}
          </p>
        </div>

        <!-- Source Badge -->
        <div class="flex items-center space-x-2">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              proposal.source === 'ai-full'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800',
            ]"
          >
            {{ proposal.source === 'ai-full' ? 'AI' : 'Edytowane' }}
          </span>
          <span v-if="proposal.isEdited" class="text-xs text-gray-500"> (edytowane) </span>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between pt-2 border-t">
          <div class="flex items-center space-x-2">
            <!-- Accept Button -->
            <Button
              v-if="!proposal.isAccepted"
              size="sm"
              variant="default"
              class="bg-green-600 hover:bg-green-700"
              @click="handleAccept"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Akceptuj
            </Button>

            <!-- Reject Button -->
            <Button
              v-if="!proposal.isRejected"
              size="sm"
              variant="outline"
              class="text-red-600 border-red-300 hover:bg-red-50"
              @click="handleReject"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Odrzuć
            </Button>

            <!-- Edit Button -->
            <Button
              v-if="!proposal.isRejected"
              size="sm"
              variant="outline"
              class="text-blue-600 border-blue-300 hover:bg-blue-50"
              @click="handleEdit"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edytuj
            </Button>
          </div>

          <!-- Status Indicator -->
          <div v-if="proposal.isAccepted" class="flex items-center text-green-600">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm font-medium">Zaakceptowane</span>
          </div>

          <div v-else-if="proposal.isRejected" class="flex items-center text-red-600">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm font-medium">Odrzucone</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import type { FlashcardProposalViewModel } from '~/types/views/generate.types'

// Props
interface Props {
  proposal: FlashcardProposalViewModel
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  accept: [proposal: FlashcardProposalViewModel]
  edit: [proposal: FlashcardProposalViewModel]
  reject: [proposal: FlashcardProposalViewModel]
}>()

// Methods
const handleAccept = () => {
  emit('accept', props.proposal)
}

const handleEdit = () => {
  emit('edit', props.proposal)
}

const handleReject = () => {
  emit('reject', props.proposal)
}
</script>
