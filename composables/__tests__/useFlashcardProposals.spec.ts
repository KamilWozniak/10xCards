import { describe, it, expect, beforeEach } from 'vitest'
import { useFlashcardProposals } from '../useFlashcardProposals'
import type { FlashcardProposalViewModel } from '~/types/views/generate.types'

/**
 * Test suite for useFlashcardProposals composable
 *
 * Tests cover:
 * - Initial state
 * - Computed properties (acceptedProposals, rejectedProposals, editedProposals, selectedCount, canSave)
 * - Proposal management (setProposals, addProposal, removeProposal)
 * - Proposal actions (acceptProposal, rejectProposal, editProposal)
 * - State management (resetProposals, updateActionState)
 * - Helper methods (getSelectedProposals, getProposalsForSaving)
 * - Transformation functions
 * - Edge cases and business rules
 * - Reactivity
 */

describe('useFlashcardProposals', () => {
  // Helper function to create test proposals
  const createTestProposal = (
    id: string,
    front: string = 'Test Front',
    back: string = 'Test Back',
    overrides: Partial<FlashcardProposalViewModel> = {}
  ): FlashcardProposalViewModel => ({
    id,
    front,
    back,
    source: 'ai-full',
    isAccepted: false,
    isRejected: false,
    isEdited: false,
    ...overrides,
  })

  describe('Initial state', () => {
    it('should initialize with empty proposals and action state', () => {
      const { proposals, actionState } = useFlashcardProposals()

      expect(proposals.value).toEqual([])
      expect(actionState.value.accepted).toEqual([])
      expect(actionState.value.rejected).toEqual([])
      expect(actionState.value.edited).toEqual([])
    })
  })

  describe('Computed properties', () => {
    it('should calculate acceptedProposals correctly', () => {
      const { setProposals, acceptedProposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: true }),
        createTestProposal('2', 'Q2', 'A2', { isAccepted: false }),
        createTestProposal('3', 'Q3', 'A3', { isAccepted: true, isRejected: true }), // Should be excluded
      ]

      setProposals(testProposals)

      expect(acceptedProposals.value).toHaveLength(1)
      expect(acceptedProposals.value[0].id).toBe('1')
    })

    it('should calculate rejectedProposals correctly', () => {
      const { setProposals, rejectedProposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isRejected: true }),
        createTestProposal('2', 'Q2', 'A2', { isRejected: false }),
        createTestProposal('3', 'Q3', 'A3', { isRejected: true }),
      ]

      setProposals(testProposals)

      expect(rejectedProposals.value).toHaveLength(2)
      expect(rejectedProposals.value.map(p => p.id)).toEqual(['1', '3'])
    })

    it('should calculate editedProposals correctly', () => {
      const { setProposals, editedProposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isEdited: true }),
        createTestProposal('2', 'Q2', 'A2', { isEdited: false }),
        createTestProposal('3', 'Q3', 'A3', { isEdited: true }),
      ]

      setProposals(testProposals)

      expect(editedProposals.value).toHaveLength(2)
      expect(editedProposals.value.map(p => p.id)).toEqual(['1', '3'])
    })

    it('should calculate selectedCount correctly', () => {
      const { setProposals, selectedCount } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: true }),
        createTestProposal('2', 'Q2', 'A2', { isAccepted: true }),
        createTestProposal('3', 'Q3', 'A3', { isAccepted: false }),
      ]

      setProposals(testProposals)

      expect(selectedCount.value).toBe(2)
    })

    it('should calculate canSave correctly when proposals are selected', () => {
      const { setProposals, canSave } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1', { isAccepted: true })]

      setProposals(testProposals)

      expect(canSave.value).toBe(true)
    })

    it('should calculate canSave correctly when no proposals are selected', () => {
      const { setProposals, canSave } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: false }),
        createTestProposal('2', 'Q2', 'A2', { isAccepted: false }),
      ]

      setProposals(testProposals)

      expect(canSave.value).toBe(false)
    })

    it('should calculate canSave correctly when proposals array is empty', () => {
      const { canSave } = useFlashcardProposals()

      expect(canSave.value).toBe(false)
    })
  })

  describe('setProposals', () => {
    it('should set proposals and update action state', () => {
      const { setProposals, proposals, actionState } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: true }),
        createTestProposal('2', 'Q2', 'A2', { isRejected: true }),
        createTestProposal('3', 'Q3', 'A3', { isEdited: true }),
      ]

      setProposals(testProposals)

      expect(proposals.value).toEqual(testProposals)
      expect(actionState.value.accepted).toHaveLength(1)
      expect(actionState.value.rejected).toHaveLength(1)
      expect(actionState.value.edited).toHaveLength(1)
    })

    it('should replace existing proposals', () => {
      const { setProposals, proposals } = useFlashcardProposals()

      const firstProposals = [createTestProposal('1', 'Q1', 'A1')]
      const secondProposals = [
        createTestProposal('2', 'Q2', 'A2'),
        createTestProposal('3', 'Q3', 'A3'),
      ]

      setProposals(firstProposals)
      expect(proposals.value).toHaveLength(1)

      setProposals(secondProposals)
      expect(proposals.value).toHaveLength(2)
      expect(proposals.value.map(p => p.id)).toEqual(['2', '3'])
    })

    it('should handle empty proposals array', () => {
      const { setProposals, proposals, actionState } = useFlashcardProposals()

      // First set some proposals
      setProposals([createTestProposal('1', 'Q1', 'A1')])

      // Then set empty array
      setProposals([])

      expect(proposals.value).toEqual([])
      expect(actionState.value.accepted).toEqual([])
      expect(actionState.value.rejected).toEqual([])
      expect(actionState.value.edited).toEqual([])
    })
  })

  describe('addProposal', () => {
    it('should add proposal to existing proposals', () => {
      const { setProposals, addProposal, proposals } = useFlashcardProposals()

      const initialProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(initialProposals)

      const newProposal = createTestProposal('2', 'Q2', 'A2')
      addProposal(newProposal)

      expect(proposals.value).toHaveLength(2)
      expect(proposals.value[1]).toEqual(newProposal)
    })

    it('should add proposal to empty proposals array', () => {
      const { addProposal, proposals } = useFlashcardProposals()

      const newProposal = createTestProposal('1', 'Q1', 'A1')
      addProposal(newProposal)

      expect(proposals.value).toHaveLength(1)
      expect(proposals.value[0]).toEqual(newProposal)
    })

    it('should update action state after adding proposal', () => {
      const { addProposal, actionState } = useFlashcardProposals()

      const acceptedProposal = createTestProposal('1', 'Q1', 'A1', { isAccepted: true })
      addProposal(acceptedProposal)

      expect(actionState.value.accepted).toHaveLength(1)
      expect(actionState.value.accepted[0].id).toBe('1')
    })
  })

  describe('removeProposal', () => {
    it('should remove proposal by id', () => {
      const { setProposals, removeProposal, proposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1'),
        createTestProposal('2', 'Q2', 'A2'),
        createTestProposal('3', 'Q3', 'A3'),
      ]

      setProposals(testProposals)
      removeProposal('2')

      expect(proposals.value).toHaveLength(2)
      expect(proposals.value.map(p => p.id)).toEqual(['1', '3'])
    })

    it('should update action state after removing proposal', () => {
      const { setProposals, removeProposal, actionState } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: true }),
        createTestProposal('2', 'Q2', 'A2', { isAccepted: true }),
      ]

      setProposals(testProposals)
      expect(actionState.value.accepted).toHaveLength(2)

      removeProposal('1')
      expect(actionState.value.accepted).toHaveLength(1)
      expect(actionState.value.accepted[0].id).toBe('2')
    })

    it('should handle removing non-existent proposal', () => {
      const { setProposals, removeProposal, proposals } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      removeProposal('non-existent')

      expect(proposals.value).toHaveLength(1)
      expect(proposals.value[0].id).toBe('1')
    })

    it('should handle removing from empty proposals array', () => {
      const { removeProposal, proposals } = useFlashcardProposals()

      removeProposal('1')

      expect(proposals.value).toEqual([])
    })
  })

  describe('acceptProposal', () => {
    it('should accept proposal and update flags', () => {
      const { setProposals, acceptProposal, proposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: false, isRejected: true }),
      ]

      setProposals(testProposals)
      acceptProposal('1')

      const proposal = proposals.value[0]
      expect(proposal.isAccepted).toBe(true)
      expect(proposal.isRejected).toBe(false)
    })

    it('should update action state after accepting proposal', () => {
      const { setProposals, acceptProposal, actionState } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      acceptProposal('1')

      expect(actionState.value.accepted).toHaveLength(1)
      expect(actionState.value.accepted[0].id).toBe('1')
    })

    it('should handle accepting non-existent proposal', () => {
      const { setProposals, acceptProposal, proposals } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      acceptProposal('non-existent')

      // Original proposal should remain unchanged
      expect(proposals.value[0].isAccepted).toBe(false)
    })

    it('should handle accepting from empty proposals array', () => {
      const { acceptProposal, actionState } = useFlashcardProposals()

      acceptProposal('1')

      expect(actionState.value.accepted).toEqual([])
    })
  })

  describe('rejectProposal', () => {
    it('should reject proposal and update flags', () => {
      const { setProposals, rejectProposal, proposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: true, isRejected: false }),
      ]

      setProposals(testProposals)
      rejectProposal('1')

      const proposal = proposals.value[0]
      expect(proposal.isAccepted).toBe(false)
      expect(proposal.isRejected).toBe(true)
    })

    it('should update action state after rejecting proposal', () => {
      const { setProposals, rejectProposal, actionState } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      rejectProposal('1')

      expect(actionState.value.rejected).toHaveLength(1)
      expect(actionState.value.rejected[0].id).toBe('1')
    })

    it('should handle rejecting non-existent proposal', () => {
      const { setProposals, rejectProposal, proposals } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      rejectProposal('non-existent')

      // Original proposal should remain unchanged
      expect(proposals.value[0].isRejected).toBe(false)
    })

    it('should handle rejecting from empty proposals array', () => {
      const { rejectProposal, actionState } = useFlashcardProposals()

      rejectProposal('1')

      expect(actionState.value.rejected).toEqual([])
    })
  })

  describe('editProposal', () => {
    it('should edit proposal content and set flags correctly', () => {
      const { setProposals, editProposal, proposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Original Front', 'Original Back', {
          isAccepted: false,
          isRejected: true,
          isEdited: false,
        }),
      ]

      setProposals(testProposals)
      editProposal('1', {
        front: 'Edited Front',
        back: 'Edited Back',
      })

      const proposal = proposals.value[0]
      expect(proposal.front).toBe('Edited Front')
      expect(proposal.back).toBe('Edited Back')
      expect(proposal.isEdited).toBe(true)
      expect(proposal.isAccepted).toBe(true)
      expect(proposal.isRejected).toBe(false)
    })

    it('should handle partial edits', () => {
      const { setProposals, editProposal, proposals } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Original Front', 'Original Back')]
      setProposals(testProposals)

      editProposal('1', { front: 'New Front' })

      const proposal = proposals.value[0]
      expect(proposal.front).toBe('New Front')
      expect(proposal.back).toBe('Original Back') // Should remain unchanged
      expect(proposal.isEdited).toBe(true)
    })

    it('should update action state after editing proposal', () => {
      const { setProposals, editProposal, actionState } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      editProposal('1', { front: 'Edited' })

      expect(actionState.value.edited).toHaveLength(1)
      expect(actionState.value.accepted).toHaveLength(1) // Should also be accepted
      expect(actionState.value.edited[0].id).toBe('1')
    })

    it('should handle editing non-existent proposal', () => {
      const { setProposals, editProposal, proposals } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      editProposal('non-existent', { front: 'New Front' })

      // Original proposal should remain unchanged
      expect(proposals.value[0].front).toBe('Q1')
      expect(proposals.value[0].isEdited).toBe(false)
    })

    it('should handle editing with empty changes', () => {
      const { setProposals, editProposal, proposals } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      editProposal('1', {})

      const proposal = proposals.value[0]
      expect(proposal.isEdited).toBe(true)
      expect(proposal.isAccepted).toBe(true)
      expect(proposal.front).toBe('Q1') // Should remain unchanged
      expect(proposal.back).toBe('A1') // Should remain unchanged
    })
  })

  describe('resetProposals', () => {
    it('should reset proposals and action state to initial values', () => {
      const { setProposals, resetProposals, proposals, actionState } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: true }),
        createTestProposal('2', 'Q2', 'A2', { isRejected: true }),
      ]

      setProposals(testProposals)

      // Verify state is set
      expect(proposals.value).toHaveLength(2)
      expect(actionState.value.accepted).toHaveLength(1)
      expect(actionState.value.rejected).toHaveLength(1)

      // Reset
      resetProposals()

      expect(proposals.value).toEqual([])
      expect(actionState.value.accepted).toEqual([])
      expect(actionState.value.rejected).toEqual([])
      expect(actionState.value.edited).toEqual([])
    })

    it('should handle resetting when already empty', () => {
      const { resetProposals, proposals, actionState } = useFlashcardProposals()

      resetProposals()

      expect(proposals.value).toEqual([])
      expect(actionState.value.accepted).toEqual([])
      expect(actionState.value.rejected).toEqual([])
      expect(actionState.value.edited).toEqual([])
    })
  })

  describe('getSelectedProposals', () => {
    it('should return accepted proposals', () => {
      const { setProposals, getSelectedProposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: true }),
        createTestProposal('2', 'Q2', 'A2', { isAccepted: false }),
        createTestProposal('3', 'Q3', 'A3', { isAccepted: true }),
      ]

      setProposals(testProposals)

      const selected = getSelectedProposals()
      expect(selected).toHaveLength(2)
      expect(selected.map(p => p.id)).toEqual(['1', '3'])
    })

    it('should return empty array when no proposals are accepted', () => {
      const { setProposals, getSelectedProposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: false }),
        createTestProposal('2', 'Q2', 'A2', { isAccepted: false }),
      ]

      setProposals(testProposals)

      const selected = getSelectedProposals()
      expect(selected).toEqual([])
    })

    it('should return empty array when proposals array is empty', () => {
      const { getSelectedProposals } = useFlashcardProposals()

      const selected = getSelectedProposals()
      expect(selected).toEqual([])
    })
  })

  describe('getProposalsForSaving', () => {
    it('should return accepted proposals for saving', () => {
      const { setProposals, getProposalsForSaving } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: true }),
        createTestProposal('2', 'Q2', 'A2', { isAccepted: false }),
        createTestProposal('3', 'Q3', 'A3', { isAccepted: true, isEdited: true }),
      ]

      setProposals(testProposals)

      const forSaving = getProposalsForSaving()
      expect(forSaving).toHaveLength(2)
      expect(forSaving.map(p => p.id)).toEqual(['1', '3'])
    })

    it('should return same result as getSelectedProposals', () => {
      const { setProposals, getSelectedProposals, getProposalsForSaving } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', { isAccepted: true }),
        createTestProposal('2', 'Q2', 'A2', { isAccepted: true }),
      ]

      setProposals(testProposals)

      const selected = getSelectedProposals()
      const forSaving = getProposalsForSaving()

      expect(forSaving).toEqual(selected)
    })
  })

  describe('Business rules and edge cases', () => {
    it('should handle proposals with mixed states correctly', () => {
      const { setProposals, acceptedProposals, rejectedProposals, editedProposals } =
        useFlashcardProposals()

      const testProposals = [
        createTestProposal('1', 'Q1', 'A1', {
          isAccepted: true,
          isRejected: false,
          isEdited: true,
        }),
        createTestProposal('2', 'Q2', 'A2', {
          isAccepted: true,
          isRejected: true, // Should be excluded from accepted
          isEdited: false,
        }),
        createTestProposal('3', 'Q3', 'A3', {
          isAccepted: false,
          isRejected: true,
          isEdited: true,
        }),
      ]

      setProposals(testProposals)

      expect(acceptedProposals.value).toHaveLength(1) // Only proposal 1
      expect(acceptedProposals.value[0].id).toBe('1')

      expect(rejectedProposals.value).toHaveLength(2) // Proposals 2 and 3
      expect(rejectedProposals.value.map(p => p.id)).toEqual(['2', '3'])

      expect(editedProposals.value).toHaveLength(2) // Proposals 1 and 3
      expect(editedProposals.value.map(p => p.id)).toEqual(['1', '3'])
    })

    it('should handle large number of proposals efficiently', () => {
      const { setProposals, acceptedProposals, selectedCount } = useFlashcardProposals()

      const largeProposalSet = Array.from({ length: 1000 }, (_, i) =>
        createTestProposal(`proposal-${i}`, `Question ${i}`, `Answer ${i}`, {
          isAccepted: i % 2 === 0, // Accept every other proposal
        })
      )

      setProposals(largeProposalSet)

      expect(acceptedProposals.value).toHaveLength(500)
      expect(selectedCount.value).toBe(500)
    })

    it('should handle proposals with special characters in content', () => {
      const { setProposals, editProposal, proposals } = useFlashcardProposals()

      const specialContent = {
        front: 'What is 2 + 2? <script>alert("xss")</script>',
        back: 'Answer: "4" & \'four\' \n\t special chars: é ñ ü 🎉',
      }

      const testProposals = [createTestProposal('1', 'Original', 'Original')]
      setProposals(testProposals)

      editProposal('1', specialContent)

      const proposal = proposals.value[0]
      expect(proposal.front).toBe(specialContent.front)
      expect(proposal.back).toBe(specialContent.back)
    })

    it('should maintain proposal order during operations', () => {
      const { setProposals, acceptProposal, rejectProposal, proposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('first', 'Q1', 'A1'),
        createTestProposal('second', 'Q2', 'A2'),
        createTestProposal('third', 'Q3', 'A3'),
      ]

      setProposals(testProposals)
      acceptProposal('second')
      rejectProposal('third')

      // Order should be preserved
      expect(proposals.value.map(p => p.id)).toEqual(['first', 'second', 'third'])
      expect(proposals.value[1].isAccepted).toBe(true)
      expect(proposals.value[2].isRejected).toBe(true)
    })

    it('should handle concurrent operations correctly', () => {
      const { setProposals, acceptProposal, editProposal, proposals, actionState } =
        useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      // Perform multiple operations on the same proposal
      acceptProposal('1')
      editProposal('1', { front: 'Edited Question' })

      const proposal = proposals.value[0]
      expect(proposal.isAccepted).toBe(true) // From both accept and edit
      expect(proposal.isEdited).toBe(true)
      expect(proposal.front).toBe('Edited Question')

      // Should appear in both accepted and edited lists
      expect(actionState.value.accepted).toHaveLength(1)
      expect(actionState.value.edited).toHaveLength(1)
    })

    it('should handle proposals with duplicate IDs gracefully', () => {
      const { setProposals, acceptProposal, proposals } = useFlashcardProposals()

      const testProposals = [
        createTestProposal('duplicate', 'Q1', 'A1'),
        createTestProposal('duplicate', 'Q2', 'A2'), // Same ID
        createTestProposal('unique', 'Q3', 'A3'),
      ]

      setProposals(testProposals)
      acceptProposal('duplicate') // Should affect first occurrence

      expect(proposals.value[0].isAccepted).toBe(true)
      expect(proposals.value[1].isAccepted).toBe(false) // Second with same ID unchanged
    })
  })

  describe('Reactivity', () => {
    it('should trigger computed updates when proposals change', () => {
      const { setProposals, selectedCount, canSave } = useFlashcardProposals()

      expect(selectedCount.value).toBe(0)
      expect(canSave.value).toBe(false)

      const testProposals = [createTestProposal('1', 'Q1', 'A1', { isAccepted: true })]
      setProposals(testProposals)

      expect(selectedCount.value).toBe(1)
      expect(canSave.value).toBe(true)
    })

    it('should trigger computed updates when proposal states change', () => {
      const { setProposals, acceptProposal, rejectProposal, acceptedProposals, rejectedProposals } =
        useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      expect(acceptedProposals.value).toHaveLength(0)
      expect(rejectedProposals.value).toHaveLength(0)

      acceptProposal('1')
      expect(acceptedProposals.value).toHaveLength(1)

      rejectProposal('1')
      expect(acceptedProposals.value).toHaveLength(0) // Should be excluded
      expect(rejectedProposals.value).toHaveLength(1)
    })

    it('should trigger actionState updates when proposals change', () => {
      const { setProposals, editProposal, actionState } = useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      expect(actionState.value.edited).toHaveLength(0)

      editProposal('1', { front: 'Edited' })

      expect(actionState.value.edited).toHaveLength(1)
      expect(actionState.value.accepted).toHaveLength(1) // Also accepted after edit
    })

    it('should maintain reactivity after reset', () => {
      const { setProposals, resetProposals, acceptProposal, selectedCount } =
        useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)
      acceptProposal('1')

      expect(selectedCount.value).toBe(1)

      resetProposals()
      expect(selectedCount.value).toBe(0)

      // Should still be reactive after reset
      const newProposals = [createTestProposal('2', 'Q2', 'A2', { isAccepted: true })]
      setProposals(newProposals)

      expect(selectedCount.value).toBe(1)
    })
  })

  describe('Integration scenarios', () => {
    it('should support complete proposal management workflow', () => {
      const {
        setProposals,
        acceptProposal,
        rejectProposal,
        editProposal,
        getProposalsForSaving,
        selectedCount,
        canSave,
      } = useFlashcardProposals()

      // Step 1: Set initial proposals
      const initialProposals = [
        createTestProposal('1', 'Q1', 'A1'),
        createTestProposal('2', 'Q2', 'A2'),
        createTestProposal('3', 'Q3', 'A3'),
      ]
      setProposals(initialProposals)

      expect(selectedCount.value).toBe(0)
      expect(canSave.value).toBe(false)

      // Step 2: Accept some proposals
      acceptProposal('1')
      acceptProposal('3')

      expect(selectedCount.value).toBe(2)
      expect(canSave.value).toBe(true)

      // Step 3: Reject one proposal
      rejectProposal('2')

      expect(selectedCount.value).toBe(2) // Still 2 accepted

      // Step 4: Edit an accepted proposal
      editProposal('1', { front: 'Edited Question 1' })

      const forSaving = getProposalsForSaving()
      expect(forSaving).toHaveLength(2)
      expect(forSaving[0].front).toBe('Edited Question 1')
      expect(forSaving[0].isEdited).toBe(true)
    })

    it('should handle user changing their mind about proposals', () => {
      const { setProposals, acceptProposal, rejectProposal, selectedCount } =
        useFlashcardProposals()

      const testProposals = [createTestProposal('1', 'Q1', 'A1')]
      setProposals(testProposals)

      // User accepts proposal
      acceptProposal('1')
      expect(selectedCount.value).toBe(1)

      // User changes mind and rejects it
      rejectProposal('1')
      expect(selectedCount.value).toBe(0)

      // User changes mind again and accepts it
      acceptProposal('1')
      expect(selectedCount.value).toBe(1)
    })

    it('should support batch operations', () => {
      const { setProposals, acceptProposal, selectedCount } = useFlashcardProposals()

      const batchProposals = Array.from({ length: 10 }, (_, i) =>
        createTestProposal(`batch-${i}`, `Question ${i}`, `Answer ${i}`)
      )

      setProposals(batchProposals)

      // Accept all proposals
      batchProposals.forEach(proposal => acceptProposal(proposal.id))

      expect(selectedCount.value).toBe(10)
    })

    it('should maintain data integrity during complex operations', () => {
      const {
        setProposals,
        addProposal,
        removeProposal,
        acceptProposal,
        editProposal,
        proposals,
        actionState,
      } = useFlashcardProposals()

      // Start with some proposals
      setProposals([createTestProposal('1', 'Q1', 'A1'), createTestProposal('2', 'Q2', 'A2')])

      // Add a new proposal
      addProposal(createTestProposal('3', 'Q3', 'A3'))

      // Accept and edit proposals
      acceptProposal('1')
      editProposal('2', { front: 'Edited Q2' })

      // Remove a proposal
      removeProposal('3')

      // Verify final state
      expect(proposals.value).toHaveLength(2)
      expect(actionState.value.accepted).toHaveLength(2) // 1 accepted, 2 edited (auto-accepted)
      expect(actionState.value.edited).toHaveLength(1) // Only 2 is edited
      expect(proposals.value.find(p => p.id === '2')?.front).toBe('Edited Q2')
    })
  })

  describe('Transformation functions', () => {
    it('should expose transformation functions', () => {
      const { transformProposalsToViewModels, transformViewModelsToCreateDTOs } =
        useFlashcardProposals()

      expect(typeof transformProposalsToViewModels).toBe('function')
      expect(typeof transformViewModelsToCreateDTOs).toBe('function')
    })

    it('should provide access to transformation functions for external use', () => {
      const { transformViewModelsToCreateDTOs, getProposalsForSaving } = useFlashcardProposals()

      // This test ensures the transformation functions are available
      // for use in components that need to convert data formats
      const mockProposals = [createTestProposal('1', 'Q1', 'A1')]
      const dtos = transformViewModelsToCreateDTOs(mockProposals)

      expect(Array.isArray(dtos)).toBe(true)
    })
  })
})
