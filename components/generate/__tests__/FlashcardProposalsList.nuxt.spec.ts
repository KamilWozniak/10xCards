import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FlashcardProposalsList from '../FlashcardProposalsList.vue'
import type { FlashcardProposalViewModel } from '~/types/views/generate.types'

// Mock child components
vi.mock('../FlashcardProposalItem.vue', () => ({
  default: {
    name: 'FlashcardProposalItem',
    props: ['proposal'],
    emits: ['accept', 'edit', 'reject'],
    template: '<div class="flashcard-proposal-item" data-testid="proposal-item"></div>',
  },
}))

vi.mock('../FlashcardEditModal.vue', () => ({
  default: {
    name: 'FlashcardEditModal',
    props: ['proposal', 'isOpen'],
    emits: ['save', 'cancel'],
    template: '<div class="flashcard-edit-modal" data-testid="edit-modal"></div>',
  },
}))

describe('FlashcardProposalsList', () => {
  let wrapper: ReturnType<typeof mount>
  let mockProposals: FlashcardProposalViewModel[]

  beforeEach(() => {
    mockProposals = [
      {
        id: 'proposal-1',
        front: 'Question 1',
        back: 'Answer 1',
        source: 'ai-full',
        isAccepted: false,
        isRejected: false,
        isEdited: false,
      },
      {
        id: 'proposal-2',
        front: 'Question 2',
        back: 'Answer 2',
        source: 'ai-full',
        isAccepted: false,
        isRejected: false,
        isEdited: false,
      },
      {
        id: 'proposal-3',
        front: 'Question 3',
        back: 'Answer 3',
        source: 'ai-full',
        isAccepted: false,
        isRejected: false,
        isEdited: false,
      },
    ]
  })

  describe('component initialization', () => {
    it('should render the component with proposals', () => {
      // Arrange & Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('Propozycje fiszek')
      expect(wrapper.text()).toContain('Przejrzyj, edytuj i wybierz fiszki do zapisania')
    })

    it('should render correct number of proposal items', () => {
      // Arrange & Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      // Assert
      const items = wrapper.findAllComponents({ name: 'FlashcardProposalItem' })
      expect(items).toHaveLength(3)
    })

    it('should pass proposal data to child components', () => {
      // Arrange & Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      // Assert
      const items = wrapper.findAllComponents({ name: 'FlashcardProposalItem' })
      expect(items[0].props('proposal')).toEqual(mockProposals[0])
      expect(items[1].props('proposal')).toEqual(mockProposals[1])
      expect(items[2].props('proposal')).toEqual(mockProposals[2])
    })

    it('should have disabled save button when no proposals are selected', () => {
      // Arrange & Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      // Assert
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should display correct count in description', () => {
      // Arrange & Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('(0/3)')
    })
  })

  describe('empty state', () => {
    it('should show empty state when no proposals', () => {
      // Arrange & Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: [],
          generationId: 1,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('Brak propozycji do wyświetlenia')
    })

    it('should not render proposal items when empty', () => {
      // Arrange & Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: [],
          generationId: 1,
        },
      })

      // Assert
      const items = wrapper.findAllComponents({ name: 'FlashcardProposalItem' })
      expect(items).toHaveLength(0)
    })

    it('should not show selection summary when empty', () => {
      // Arrange & Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: [],
          generationId: 1,
        },
      })

      // Assert
      expect(wrapper.text()).not.toContain('fiszek wybranych do zapisania')
    })

    it('should have disabled save button when empty', () => {
      // Arrange & Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: [],
          generationId: 1,
        },
      })

      // Assert
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('computed properties', () => {
    it('should calculate selectedCount correctly with accepted proposals', async () => {
      // Arrange
      const proposalsWithAccepted = [
        { ...mockProposals[0], isAccepted: true },
        { ...mockProposals[1], isAccepted: true },
        { ...mockProposals[2], isAccepted: false },
      ]

      // Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: proposalsWithAccepted,
          generationId: 1,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('(2/3)')
      expect(wrapper.text()).toContain('2 fiszek wybranych do zapisania')
    })

    it('should exclude rejected proposals from selectedCount', async () => {
      // Arrange
      const proposalsWithRejected = [
        { ...mockProposals[0], isAccepted: true, isRejected: false },
        { ...mockProposals[1], isAccepted: true, isRejected: true },
        { ...mockProposals[2], isAccepted: false, isRejected: false },
      ]

      // Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: proposalsWithRejected,
          generationId: 1,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('(1/3)')
      expect(wrapper.text()).toContain('1 fiszek wybranych do zapisania')
    })

    it('should calculate acceptedCount correctly', async () => {
      // Arrange
      const proposalsWithCounts = [
        { ...mockProposals[0], isAccepted: true, isEdited: false },
        { ...mockProposals[1], isAccepted: true, isEdited: true },
        { ...mockProposals[2], isAccepted: false, isEdited: false },
      ]

      // Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: proposalsWithCounts,
          generationId: 1,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('1 zaakceptowanych')
    })

    it('should calculate editedCount correctly', async () => {
      // Arrange
      const proposalsWithEdited = [
        { ...mockProposals[0], isAccepted: true, isEdited: true },
        { ...mockProposals[1], isAccepted: true, isEdited: true },
        { ...mockProposals[2], isAccepted: false, isEdited: true },
      ]

      // Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: proposalsWithEdited,
          generationId: 1,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('2 edytowanych')
    })

    it('should enable save button when at least one proposal is selected', async () => {
      // Arrange
      const proposalsWithSelected = [
        { ...mockProposals[0], isAccepted: true },
        { ...mockProposals[1], isAccepted: false },
        { ...mockProposals[2], isAccepted: false },
      ]

      // Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: proposalsWithSelected,
          generationId: 1,
        },
      })

      // Assert
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('should show correct counts for mixed states', async () => {
      // Arrange
      const mixedProposals = [
        { ...mockProposals[0], isAccepted: true, isEdited: false, isRejected: false },
        { ...mockProposals[1], isAccepted: true, isEdited: true, isRejected: false },
        { ...mockProposals[2], isAccepted: false, isEdited: false, isRejected: true },
      ]

      // Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mixedProposals,
          generationId: 1,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('(2/3)')
      expect(wrapper.text()).toContain('1 zaakceptowanych')
      expect(wrapper.text()).toContain('1 edytowanych')
    })
  })

  describe('proposal actions', () => {
    it('should emit proposal-accept when handleAccept is called', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const proposalItem = wrapper.findComponent({ name: 'FlashcardProposalItem' })

      // Act
      await proposalItem.vm.$emit('accept', mockProposals[0])

      // Assert
      expect(wrapper.emitted('proposal-accept')).toBeTruthy()
      expect(wrapper.emitted('proposal-accept')?.[0]).toEqual([mockProposals[0]])
    })

    it('should emit proposal-reject when handleReject is called', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const proposalItem = wrapper.findComponent({ name: 'FlashcardProposalItem' })

      // Act
      await proposalItem.vm.$emit('reject', mockProposals[0])

      // Assert
      expect(wrapper.emitted('proposal-reject')).toBeTruthy()
      expect(wrapper.emitted('proposal-reject')?.[0]).toEqual([mockProposals[0]])
    })

    it('should open edit modal when handleEdit is called', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const proposalItem = wrapper.findComponent({ name: 'FlashcardProposalItem' })

      // Act
      await proposalItem.vm.$emit('edit', mockProposals[0])
      await nextTick()

      // Assert
      const editModal = wrapper.findComponent({ name: 'FlashcardEditModal' })
      expect(editModal.exists()).toBe(true)
      expect(editModal.props('isOpen')).toBe(true)
    })

    it('should pass proposal copy to edit modal', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const proposalItem = wrapper.findComponent({ name: 'FlashcardProposalItem' })

      // Act
      await proposalItem.vm.$emit('edit', mockProposals[1])
      await nextTick()

      // Assert
      const editModal = wrapper.findComponent({ name: 'FlashcardEditModal' })
      expect(editModal.props('proposal')).toEqual(mockProposals[1])
    })
  })

  describe('edit modal functionality', () => {
    it('should not show edit modal initially', () => {
      // Arrange & Act
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      // Assert
      const editModal = wrapper.findComponent({ name: 'FlashcardEditModal' })
      expect(editModal.exists()).toBe(false)
    })

    it('should emit proposal-save-edit when handleSaveEdit is called', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const proposalItem = wrapper.findComponent({ name: 'FlashcardProposalItem' })
      await proposalItem.vm.$emit('edit', mockProposals[0])
      await nextTick()

      const editedProposal = {
        ...mockProposals[0],
        front: 'Edited Question',
        back: 'Edited Answer',
      }

      const editModal = wrapper.findComponent({ name: 'FlashcardEditModal' })

      // Act
      await editModal.vm.$emit('save', editedProposal)

      // Assert
      expect(wrapper.emitted('proposal-save-edit')).toBeTruthy()
      expect(wrapper.emitted('proposal-save-edit')?.[0]).toEqual([editedProposal])
    })

    it('should close edit modal after save', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const proposalItem = wrapper.findComponent({ name: 'FlashcardProposalItem' })
      await proposalItem.vm.$emit('edit', mockProposals[0])
      await nextTick()

      const editedProposal = { ...mockProposals[0], front: 'Edited' }
      const editModal = wrapper.findComponent({ name: 'FlashcardEditModal' })

      // Act
      await editModal.vm.$emit('save', editedProposal)
      await nextTick()

      // Assert
      const editModalAfter = wrapper.findComponent({ name: 'FlashcardEditModal' })
      expect(editModalAfter.exists()).toBe(false)
    })

    it('should close edit modal on cancel', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const proposalItem = wrapper.findComponent({ name: 'FlashcardProposalItem' })
      await proposalItem.vm.$emit('edit', mockProposals[0])
      await nextTick()

      const editModal = wrapper.findComponent({ name: 'FlashcardEditModal' })

      // Act
      await editModal.vm.$emit('cancel')
      await nextTick()

      // Assert
      const editModalAfter = wrapper.findComponent({ name: 'FlashcardEditModal' })
      expect(editModalAfter.exists()).toBe(false)
    })

    it('should not emit proposal-save-edit on cancel', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const proposalItem = wrapper.findComponent({ name: 'FlashcardProposalItem' })
      await proposalItem.vm.$emit('edit', mockProposals[0])
      await nextTick()

      const editModal = wrapper.findComponent({ name: 'FlashcardEditModal' })

      // Act
      await editModal.vm.$emit('cancel')

      // Assert
      expect(wrapper.emitted('proposal-save-edit')).toBeFalsy()
    })
  })

  describe('save selected functionality', () => {
    it('should emit save-selected with selected proposals on button click', async () => {
      // Arrange
      const selectedProposals = [
        { ...mockProposals[0], isAccepted: true, isRejected: false },
        { ...mockProposals[1], isAccepted: true, isRejected: false },
        { ...mockProposals[2], isAccepted: false, isRejected: false },
      ]

      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: selectedProposals,
          generationId: 1,
        },
      })

      const button = wrapper.find('button')

      // Act
      await button.trigger('click')

      // Assert
      expect(wrapper.emitted('save-selected')).toBeTruthy()
      expect(wrapper.emitted('save-selected')?.[0][0]).toHaveLength(2)
      expect(wrapper.emitted('save-selected')?.[0][0]).toEqual([
        selectedProposals[0],
        selectedProposals[1],
      ])
    })

    it('should exclude rejected proposals from save-selected', async () => {
      // Arrange
      const proposalsWithRejected = [
        { ...mockProposals[0], isAccepted: true, isRejected: false },
        { ...mockProposals[1], isAccepted: true, isRejected: true },
        { ...mockProposals[2], isAccepted: true, isRejected: false },
      ]

      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: proposalsWithRejected,
          generationId: 1,
        },
      })

      const button = wrapper.find('button')

      // Act
      await button.trigger('click')

      // Assert
      expect(wrapper.emitted('save-selected')?.[0][0]).toHaveLength(2)
      expect(wrapper.emitted('save-selected')?.[0][0]).toEqual([
        proposalsWithRejected[0],
        proposalsWithRejected[2],
      ])
    })

    it('should include edited proposals in save-selected', async () => {
      // Arrange
      const proposalsWithEdited = [
        { ...mockProposals[0], isAccepted: true, isEdited: true, isRejected: false },
        { ...mockProposals[1], isAccepted: true, isEdited: false, isRejected: false },
        { ...mockProposals[2], isAccepted: false, isEdited: true, isRejected: false },
      ]

      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: proposalsWithEdited,
          generationId: 1,
        },
      })

      const button = wrapper.find('button')

      // Act
      await button.trigger('click')

      // Assert
      expect(wrapper.emitted('save-selected')?.[0][0]).toHaveLength(2)
      expect(wrapper.emitted('save-selected')?.[0][0]).toContainEqual(proposalsWithEdited[0])
      expect(wrapper.emitted('save-selected')?.[0][0]).toContainEqual(proposalsWithEdited[1])
    })

    it('should not emit save-selected when button is disabled', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const button = wrapper.find('button')

      // Act
      await button.trigger('click')

      // Assert
      expect(wrapper.emitted('save-selected')).toBeFalsy()
    })

    it('should show correct count in save button text', async () => {
      // Arrange
      const selectedProposals = [
        { ...mockProposals[0], isAccepted: true },
        { ...mockProposals[1], isAccepted: true },
        { ...mockProposals[2], isAccepted: true },
      ]

      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: selectedProposals,
          generationId: 1,
        },
      })

      // Assert
      const button = wrapper.find('button')
      expect(button.text()).toContain('Zapisz wybrane fiszki (3)')
    })
  })

  describe('props reactivity', () => {
    it('should update when proposals prop changes', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: [mockProposals[0]],
          generationId: 1,
        },
      })

      // Act
      await wrapper.setProps({ proposals: mockProposals })
      await nextTick()

      // Assert
      const items = wrapper.findAllComponents({ name: 'FlashcardProposalItem' })
      expect(items).toHaveLength(3)
    })

    it('should update counts when proposals change', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const updatedProposals = [
        { ...mockProposals[0], isAccepted: true },
        { ...mockProposals[1], isAccepted: true },
        { ...mockProposals[2], isAccepted: false },
      ]

      // Act
      await wrapper.setProps({ proposals: updatedProposals })
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('(2/3)')
    })

    it('should update button state when proposals change', async () => {
      // Arrange
      wrapper = mount(FlashcardProposalsList, {
        props: {
          proposals: mockProposals,
          generationId: 1,
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()

      const updatedProposals = [{ ...mockProposals[0], isAccepted: true }]

      // Act
      await wrapper.setProps({ proposals: updatedProposals })
      await nextTick()

      // Assert
      const buttonAfter = wrapper.find('button')
      expect(buttonAfter.attributes('disabled')).toBeUndefined()
    })
  })
})
