import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FlashcardEditModal from '../FlashcardEditModal.vue'
import type { FlashcardProposalViewModel } from '~/types/views/generate.types'

describe('FlashcardEditModal', () => {
  let wrapper: ReturnType<typeof mount>
  let mockProposal: FlashcardProposalViewModel

  beforeEach(() => {
    mockProposal = {
      id: 'proposal-1',
      front: 'Original Question',
      back: 'Original Answer',
      source: 'ai-full',
      isAccepted: true,
      isRejected: false,
      isEdited: false,
    }
  })

  describe('component visibility', () => {
    it('should render modal when isOpen is true', () => {
      // Arrange & Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      // Assert
      expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)
      expect(wrapper.text()).toContain('Edytuj fiszkę')
    })

    it('should not render modal when isOpen is false', () => {
      // Arrange & Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: false,
        },
      })

      // Assert
      expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
    })

    it('should render backdrop when modal is open', () => {
      // Arrange & Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      // Assert
      expect(wrapper.find('.bg-black.bg-opacity-50').exists()).toBe(true)
    })

    it('should render modal content elements', () => {
      // Arrange & Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('Edytuj fiszkę')
      expect(wrapper.text()).toContain('Wprowadź zmiany w treści fiszki')
      expect(wrapper.text()).toContain('Przód')
      expect(wrapper.text()).toContain('Tył')
    })

    it('should render save and cancel buttons', () => {
      // Arrange & Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      // Assert
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      expect(wrapper.text()).toContain('Anuluj')
      expect(wrapper.text()).toContain('Zapisz zmiany')
    })
  })

  describe('form initialization', () => {
    it('should initialize form with proposal data', () => {
      // Arrange & Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      // Assert
      const textareas = wrapper.findAll('textarea')
      expect(textareas[0].element.value).toBe('Original Question')
      expect(textareas[1].element.value).toBe('Original Answer')
    })

    it('should show character counts for both fields', () => {
      // Arrange & Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('17/200 znaków')
      expect(wrapper.text()).toContain('15/500 znaków')
    })

    it('should enable save button for valid initial data', async () => {
      // Arrange & Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      await nextTick()

      // Assert
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))
      expect(saveButton?.attributes('disabled')).toBeUndefined()
    })

    it('should update form when proposal prop changes', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const newProposal: FlashcardProposalViewModel = {
        ...mockProposal,
        front: 'New Question',
        back: 'New Answer',
      }

      // Act
      await wrapper.setProps({ proposal: newProposal })
      await nextTick()

      // Assert
      const textareas = wrapper.findAll('textarea')
      expect(textareas[0].element.value).toBe('New Question')
      expect(textareas[1].element.value).toBe('New Answer')
    })
  })

  describe('front field validation', () => {
    it('should show error when front field is empty', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]

      // Act
      await frontTextarea.setValue('')
      await frontTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('Przód fiszki jest wymagany')
    })

    it('should show error when front exceeds 200 characters', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]
      const longText = 'a'.repeat(201)

      // Act
      await frontTextarea.setValue(longText)
      await frontTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('Przód fiszki nie może przekraczać 200 znaków')
    })

    it('should clear error when front is valid', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]

      // Act - first make it invalid
      await frontTextarea.setValue('')
      await frontTextarea.trigger('input')
      await nextTick()

      // Act - then make it valid
      await frontTextarea.setValue('Valid question')
      await frontTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).not.toContain('Przód fiszki jest wymagany')
    })

    it('should apply error border class when front has error', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]

      // Act
      await frontTextarea.setValue('')
      await frontTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(frontTextarea.classes()).toContain('border-red-300')
    })

    it('should update character count for front field', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]

      // Act
      await frontTextarea.setValue('Test question')
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('13/200 znaków')
    })

    it('should respect maxlength attribute for front field', () => {
      // Arrange & Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]

      // Assert
      expect(frontTextarea.attributes('maxlength')).toBe('200')
    })
  })

  describe('back field validation', () => {
    it('should show error when back field is empty', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const backTextarea = wrapper.findAll('textarea')[1]

      // Act
      await backTextarea.setValue('')
      await backTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('Tył fiszki jest wymagany')
    })

    it('should show error when back exceeds 500 characters', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const backTextarea = wrapper.findAll('textarea')[1]
      const longText = 'a'.repeat(501)

      // Act
      await backTextarea.setValue(longText)
      await backTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('Tył fiszki nie może przekraczać 500 znaków')
    })

    it('should clear error when back is valid', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const backTextarea = wrapper.findAll('textarea')[1]

      // Act - first make it invalid
      await backTextarea.setValue('')
      await backTextarea.trigger('input')
      await nextTick()

      // Act - then make it valid
      await backTextarea.setValue('Valid answer')
      await backTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).not.toContain('Tył fiszki jest wymagany')
    })

    it('should apply error border class when back has error', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const backTextarea = wrapper.findAll('textarea')[1]

      // Act
      await backTextarea.setValue('')
      await backTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(backTextarea.classes()).toContain('border-red-300')
    })

    it('should update character count for back field', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const backTextarea = wrapper.findAll('textarea')[1]

      // Act
      await backTextarea.setValue('Test answer')
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('11/500 znaków')
    })

    it('should respect maxlength attribute for back field', () => {
      // Arrange & Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const backTextarea = wrapper.findAll('textarea')[1]

      // Assert
      expect(backTextarea.attributes('maxlength')).toBe('500')
    })
  })

  describe('form validity', () => {
    it('should disable save button when front is empty', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]

      // Act
      await frontTextarea.setValue('')
      await frontTextarea.trigger('input')
      await nextTick()

      // Assert
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))
      expect(saveButton?.attributes('disabled')).toBeDefined()
    })

    it('should disable save button when back is empty', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const backTextarea = wrapper.findAll('textarea')[1]

      // Act
      await backTextarea.setValue('')
      await backTextarea.trigger('input')
      await nextTick()

      // Assert
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))
      expect(saveButton?.attributes('disabled')).toBeDefined()
    })

    it('should disable save button when front exceeds limit', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]

      // Act
      await frontTextarea.setValue('a'.repeat(201))
      await frontTextarea.trigger('input')
      await nextTick()

      // Assert
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))
      expect(saveButton?.attributes('disabled')).toBeDefined()
    })

    it('should disable save button when back exceeds limit', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const backTextarea = wrapper.findAll('textarea')[1]

      // Act
      await backTextarea.setValue('a'.repeat(501))
      await backTextarea.trigger('input')
      await nextTick()

      // Assert
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))
      expect(saveButton?.attributes('disabled')).toBeDefined()
    })

    it('should enable save button when both fields are valid', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]
      const backTextarea = wrapper.findAll('textarea')[1]

      // Act
      await frontTextarea.setValue('Valid question')
      await frontTextarea.trigger('input')
      await backTextarea.setValue('Valid answer')
      await backTextarea.trigger('input')
      await nextTick()

      // Assert
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))
      expect(saveButton?.attributes('disabled')).toBeUndefined()
    })

    it('should consider whitespace-only text as invalid', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]

      // Act
      await frontTextarea.setValue('   ')
      await frontTextarea.trigger('input')
      await nextTick()

      // Assert
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))
      expect(saveButton?.attributes('disabled')).toBeDefined()
    })
  })

  describe('save functionality', () => {
    it('should emit save event with edited proposal on save', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]
      const backTextarea = wrapper.findAll('textarea')[1]

      await frontTextarea.setValue('Edited Question')
      await frontTextarea.trigger('input')
      await backTextarea.setValue('Edited Answer')
      await backTextarea.trigger('input')
      await nextTick()

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))

      // Act
      await saveButton?.trigger('click')

      // Assert
      expect(wrapper.emitted('save')).toBeTruthy()
      const emittedProposal = wrapper.emitted('save')?.[0][0] as FlashcardProposalViewModel
      expect(emittedProposal.front).toBe('Edited Question')
      expect(emittedProposal.back).toBe('Edited Answer')
      expect(emittedProposal.isEdited).toBe(true)
      expect(emittedProposal.source).toBe('ai-edited')
    })

    it('should trim whitespace from fields on save', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]
      const backTextarea = wrapper.findAll('textarea')[1]

      await frontTextarea.setValue('  Trimmed Question  ')
      await frontTextarea.trigger('input')
      await backTextarea.setValue('  Trimmed Answer  ')
      await backTextarea.trigger('input')
      await nextTick()

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))

      // Act
      await saveButton?.trigger('click')

      // Assert
      const emittedProposal = wrapper.emitted('save')?.[0][0] as FlashcardProposalViewModel
      expect(emittedProposal.front).toBe('Trimmed Question')
      expect(emittedProposal.back).toBe('Trimmed Answer')
    })

    it('should preserve original proposal id on save', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      await nextTick()
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))

      // Act
      await saveButton?.trigger('click')

      // Assert
      const emittedProposal = wrapper.emitted('save')?.[0][0] as FlashcardProposalViewModel
      expect(emittedProposal.id).toBe(mockProposal.id)
    })

    it('should not emit save when form is invalid', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]
      await frontTextarea.setValue('')
      await frontTextarea.trigger('input')
      await nextTick()

      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))

      // Act
      await saveButton?.trigger('click')

      // Assert
      expect(wrapper.emitted('save')).toBeFalsy()
    })
  })

  describe('cancel functionality', () => {
    it('should emit cancel event on cancel button click', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const cancelButton = wrapper.findAll('button').find(btn => btn.text().includes('Anuluj'))

      // Act
      await cancelButton?.trigger('click')

      // Assert
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('should not emit save when cancelling', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]
      await frontTextarea.setValue('Changed but cancelled')
      await frontTextarea.trigger('input')

      const cancelButton = wrapper.findAll('button').find(btn => btn.text().includes('Anuluj'))

      // Act
      await cancelButton?.trigger('click')

      // Assert
      expect(wrapper.emitted('save')).toBeFalsy()
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('backdrop click handling', () => {
    it('should emit cancel when clicking backdrop', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const backdrop = wrapper.find('.fixed.inset-0.z-50')

      // Act
      await backdrop.trigger('click')

      // Assert
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('should not close when clicking modal content', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const modalContent = wrapper.find('.bg-white.shadow-xl')

      // Act
      await modalContent.trigger('click')

      // Assert
      expect(wrapper.emitted('cancel')).toBeFalsy()
    })
  })

  describe('edge cases', () => {
    it('should handle exactly 200 characters in front field', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]
      const exactText = 'a'.repeat(200)

      // Act
      await frontTextarea.setValue(exactText)
      await frontTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).not.toContain('Przód fiszki nie może przekraczać 200 znaków')
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))
      expect(saveButton?.attributes('disabled')).toBeUndefined()
    })

    it('should handle exactly 500 characters in back field', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const backTextarea = wrapper.findAll('textarea')[1]
      const exactText = 'a'.repeat(500)

      // Act
      await backTextarea.setValue(exactText)
      await backTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).not.toContain('Tył fiszki nie może przekraczać 500 znaków')
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))
      expect(saveButton?.attributes('disabled')).toBeUndefined()
    })

    it('should handle proposal with very short text', async () => {
      // Arrange
      const shortProposal: FlashcardProposalViewModel = {
        ...mockProposal,
        front: 'Q',
        back: 'A',
      }

      // Act
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: shortProposal,
          isOpen: true,
        },
      })

      await nextTick()

      // Assert
      const textareas = wrapper.findAll('textarea')
      expect(textareas[0].element.value).toBe('Q')
      expect(textareas[1].element.value).toBe('A')
      const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Zapisz'))
      expect(saveButton?.attributes('disabled')).toBeUndefined()
    })

    it('should handle multiple validations in sequence', async () => {
      // Arrange
      wrapper = mount(FlashcardEditModal, {
        props: {
          proposal: mockProposal,
          isOpen: true,
        },
      })

      const frontTextarea = wrapper.findAll('textarea')[0]

      // Act - make invalid
      await frontTextarea.setValue('')
      await frontTextarea.trigger('input')
      await nextTick()
      expect(wrapper.text()).toContain('Przód fiszki jest wymagany')

      // Act - make too long
      await frontTextarea.setValue('a'.repeat(201))
      await frontTextarea.trigger('input')
      await nextTick()
      expect(wrapper.text()).toContain('Przód fiszki nie może przekraczać 200 znaków')

      // Act - make valid
      await frontTextarea.setValue('Valid text')
      await frontTextarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).not.toContain('Przód fiszki jest wymagany')
      expect(wrapper.text()).not.toContain('Przód fiszki nie może przekraczać 200 znaków')
    })
  })
})
