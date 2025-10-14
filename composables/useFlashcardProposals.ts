import { ref, computed } from 'vue'
import type { FlashcardProposalViewModel, ProposalActionState } from '~/types/views/generate.types'
import {
  transformProposalsToViewModels,
  transformViewModelsToCreateDTOs,
} from '~/types/views/generate.types'

/**
 * Custom hook do zarządzania propozycjami fiszek
 */
export function useFlashcardProposals() {
  // State
  const proposals = ref<FlashcardProposalViewModel[]>([])
  const actionState = ref<ProposalActionState>({
    accepted: [],
    rejected: [],
    edited: [],
  })

  // Computed
  const acceptedProposals = computed(() =>
    proposals.value.filter(p => p.isAccepted && !p.isRejected)
  )

  const rejectedProposals = computed(() => proposals.value.filter(p => p.isRejected))

  const editedProposals = computed(() => proposals.value.filter(p => p.isEdited))

  const selectedCount = computed(() => acceptedProposals.value.length)
  const canSave = computed(() => selectedCount.value > 0)

  // Methods
  const setProposals = (newProposals: FlashcardProposalViewModel[]) => {
    proposals.value = newProposals
    updateActionState()
  }

  const addProposal = (proposal: FlashcardProposalViewModel) => {
    proposals.value.push(proposal)
    updateActionState()
  }

  const removeProposal = (proposalId: string) => {
    const index = proposals.value.findIndex(p => p.id === proposalId)
    if (index !== -1) {
      proposals.value.splice(index, 1)
      updateActionState()
    }
  }

  const acceptProposal = (proposalId: string) => {
    const proposal = proposals.value.find(p => p.id === proposalId)
    if (proposal) {
      proposal.isAccepted = true
      proposal.isRejected = false
      updateActionState()
    }
  }

  const rejectProposal = (proposalId: string) => {
    const proposal = proposals.value.find(p => p.id === proposalId)
    if (proposal) {
      proposal.isAccepted = false
      proposal.isRejected = true
      updateActionState()
    }
  }

  const editProposal = (proposalId: string, editedContent: Partial<FlashcardProposalViewModel>) => {
    const proposal = proposals.value.find(p => p.id === proposalId)
    if (proposal) {
      Object.assign(proposal, editedContent)
      proposal.isEdited = true
      proposal.isAccepted = true
      proposal.isRejected = false
      updateActionState()
    }
  }

  const updateActionState = () => {
    actionState.value = {
      accepted: acceptedProposals.value,
      rejected: rejectedProposals.value,
      edited: editedProposals.value,
    }
  }

  const resetProposals = () => {
    proposals.value = []
    actionState.value = {
      accepted: [],
      rejected: [],
      edited: [],
    }
  }

  const getSelectedProposals = (): FlashcardProposalViewModel[] => {
    return acceptedProposals.value
  }

  const getProposalsForSaving = (): FlashcardProposalViewModel[] => {
    return acceptedProposals.value
  }

  return {
    // State
    proposals: readonly(proposals),
    actionState: readonly(actionState),

    // Computed
    acceptedProposals,
    rejectedProposals,
    editedProposals,
    selectedCount,
    canSave,

    // Methods
    setProposals,
    addProposal,
    removeProposal,
    acceptProposal,
    rejectProposal,
    editProposal,
    resetProposals,
    getSelectedProposals,
    getProposalsForSaving,

    // Transformation functions
    transformProposalsToViewModels,
    transformViewModelsToCreateDTOs,
  }
}
