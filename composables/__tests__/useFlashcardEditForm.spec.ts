import { describe, it, expect } from 'vitest'
import { useFlashcardEditForm } from '../useFlashcardEditForm'
import type { FlashcardProposalViewModel } from '~/types/views/generate.types'

describe('useFlashcardEditForm', () => {
  const mockProposal: FlashcardProposalViewModel = {
    id: '1',
    front: 'Test front',
    back: 'Test back',
    isEdited: false,
    source: 'ai',
  }

  it('should initialize form with proposal data', () => {
    const { editForm } = useFlashcardEditForm(mockProposal)

    expect(editForm.value.front).toBe('Test front')
    expect(editForm.value.back).toBe('Test back')
    expect(editForm.value.isValid).toBe(true)
    expect(editForm.value.errors).toEqual({})
  })

  it('should validate front content', () => {
    const { editForm, validateFront } = useFlashcardEditForm(mockProposal)

    // Empty front
    editForm.value.front = ''
    validateFront()
    expect(editForm.value.errors.front).toBe('Przód fiszki jest wymagany')
    expect(editForm.value.isValid).toBe(false)

    // Too long front
    editForm.value.front = 'a'.repeat(201)
    validateFront()
    expect(editForm.value.errors.front).toBe('Przód fiszki nie może przekraczać 200 znaków')
    expect(editForm.value.isValid).toBe(false)

    // Valid front
    editForm.value.front = 'Valid front'
    validateFront()
    expect(editForm.value.errors.front).toBeUndefined()
    expect(editForm.value.isValid).toBe(true)
  })

  it('should validate back content', () => {
    const { editForm, validateBack } = useFlashcardEditForm(mockProposal)

    // Empty back
    editForm.value.back = ''
    validateBack()
    expect(editForm.value.errors.back).toBe('Tył fiszki jest wymagany')
    expect(editForm.value.isValid).toBe(false)

    // Too long back
    editForm.value.back = 'a'.repeat(501)
    validateBack()
    expect(editForm.value.errors.back).toBe('Tył fiszki nie może przekraczać 500 znaków')
    expect(editForm.value.isValid).toBe(false)

    // Valid back
    editForm.value.back = 'Valid back'
    validateBack()
    expect(editForm.value.errors.back).toBeUndefined()
    expect(editForm.value.isValid).toBe(true)
  })

  it('should get edited proposal with trimmed values', () => {
    const { editForm, getEditedProposal } = useFlashcardEditForm(mockProposal)

    editForm.value.front = '  Edited front  '
    editForm.value.back = '  Edited back  '

    const editedProposal = getEditedProposal()

    expect(editedProposal).toEqual({
      ...mockProposal,
      front: 'Edited front',
      back: 'Edited back',
      isEdited: true,
      source: 'ai-edited',
    })
  })

  it('should reinitialize form with new proposal', () => {
    const { initializeForm, editForm } = useFlashcardEditForm(mockProposal)

    const newProposal: FlashcardProposalViewModel = {
      ...mockProposal,
      front: 'New front',
      back: 'New back',
    }

    initializeForm(newProposal)

    expect(editForm.value.front).toBe('New front')
    expect(editForm.value.back).toBe('New back')
    expect(editForm.value.isValid).toBe(true)
    expect(editForm.value.errors).toEqual({})
  })
})
