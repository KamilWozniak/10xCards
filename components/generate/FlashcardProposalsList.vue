<template>
  <Card>
    <CardHeader>
      <CardTitle>Propozycje fiszek</CardTitle>
      <CardDescription>
        Przejrzyj, edytuj i wybierz fiszki do zapisania ({{ selectedCount }}/{{ proposals.length }})
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <!-- Proposals List -->
        <div v-if="proposals.length > 0" class="space-y-3">
          <FlashcardProposalItem
            v-for="proposal in proposals"
            :key="proposal.id"
            :proposal="proposal"
            @accept="handleAccept"
            @edit="handleEdit"
            @reject="handleReject"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8 text-gray-500">
          <p>Brak propozycji do wyświetlenia</p>
        </div>

        <!-- Selection Summary -->
        <div v-if="proposals.length > 0" class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-blue-800">
              <span class="font-medium">{{ selectedCount }}</span> fiszek wybranych do zapisania
            </div>
            <div class="text-xs text-blue-600">
              {{ acceptedCount }} zaakceptowanych, {{ editedCount }} edytowanych
            </div>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button :disabled="!canSave" class="w-full" @click="handleSaveSelected">
        Zapisz wybrane fiszki ({{ selectedCount }})
      </Button>
    </CardFooter>
  </Card>

  <!-- Edit Modal -->
  <FlashcardEditModal
    v-if="editingProposal"
    :proposal="editingProposal"
    :is-open="!!editingProposal"
    @save="handleSaveEdit"
    @cancel="handleCancelEdit"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import FlashcardProposalItem from './FlashcardProposalItem.vue'
import FlashcardEditModal from './FlashcardEditModal.vue'
import type { FlashcardProposalViewModel } from '~/types/views/generate.types.ts'

// Props
interface Props {
  proposals: FlashcardProposalViewModel[]
  generationId: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'save-selected': [selectedProposals: FlashcardProposalViewModel[]]
  'proposal-accept': [proposal: FlashcardProposalViewModel]
  'proposal-reject': [proposal: FlashcardProposalViewModel]
  'proposal-edit': [proposal: FlashcardProposalViewModel]
  'proposal-save-edit': [editedProposal: FlashcardProposalViewModel]
}>()

// State
const editingProposal = ref<FlashcardProposalViewModel | null>(null)

// Computed
const selectedCount = computed(() => {
  return props.proposals.filter(p => p.isAccepted && !p.isRejected).length
})

const acceptedCount = computed(() => {
  return props.proposals.filter(p => p.isAccepted && !p.isEdited).length
})

const editedCount = computed(() => {
  return props.proposals.filter(p => p.isAccepted && p.isEdited).length
})

const canSave = computed(() => {
  return selectedCount.value > 0
})

// Methods
const handleAccept = (proposal: FlashcardProposalViewModel) => {
  emit('proposal-accept', proposal)
}

const handleReject = (proposal: FlashcardProposalViewModel) => {
  emit('proposal-reject', proposal)
}

const handleEdit = (proposal: FlashcardProposalViewModel) => {
  editingProposal.value = { ...proposal }
}

const handleSaveEdit = (editedProposal: FlashcardProposalViewModel) => {
  emit('proposal-save-edit', editedProposal)
  editingProposal.value = null
}

const handleCancelEdit = () => {
  editingProposal.value = null
}

const handleSaveSelected = () => {
  const selectedProposals = props.proposals.filter(p => p.isAccepted && !p.isRejected)
  emit('save-selected', selectedProposals)
}
</script>
