// ============================================================================
// GENERATE VIEW TYPES
// ============================================================================

/**
 * Stan generowania fiszek w widoku
 */
// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

import type { FlashcardProposalDTO } from '~/types/dto/types'

export interface GenerationState {
  isLoading: boolean
  error: string | null
  proposals: FlashcardProposalViewModel[]
  generationId: number | null
}

/**
 * Dane formularza tekstu źródłowego
 */
export interface SourceTextFormData {
  text: string
  characterCount: number
  isValid: boolean
}

/**
 * Stan walidacji formularza
 */
export interface FormValidationState {
  isValid: boolean
  characterCount: number
  errorMessage: string | null
  minLength: number
  maxLength: number
}

/**
 * Propozycja fiszki w widoku (rozszerzona o pola UI)
 */
export interface FlashcardProposalViewModel {
  id: string // unikalny ID dla UI
  front: string
  back: string
  source: 'ai-full' | 'ai-edited'
  isAccepted: boolean
  isRejected: boolean
  isEdited: boolean
  originalProposal?: FlashcardProposalViewModel // dla edytowanych
}

/**
 * Stan akcji na propozycjach
 */
export interface ProposalActionState {
  accepted: FlashcardProposalViewModel[]
  rejected: FlashcardProposalViewModel[]
  edited: FlashcardProposalViewModel[]
}

/**
 * Stan formularza edycji
 */
export interface EditFormState {
  front: string
  back: string
  isValid: boolean
  errors: {
    front?: string
    back?: string
  }
}

/**
 * Stan listy propozycji
 */
export interface ProposalsListState {
  proposals: FlashcardProposalViewModel[]
  selectedCount: number
  canSave: boolean
}

/**
 * Transformuje DTO propozycji na ViewModel
 */
export function transformProposalToViewModel(
  dto: FlashcardProposalDTO,
  index: number
): FlashcardProposalViewModel {
  return {
    id: `proposal-${index}-${Date.now()}`,
    front: dto.front,
    back: dto.back,
    source: dto.source,
    isAccepted: false,
    isRejected: false,
    isEdited: false,
  }
}

/**
 * Transformuje tablicę DTO propozycji na ViewModel
 */
export function transformProposalsToViewModels(
  dtos: FlashcardProposalDTO[]
): FlashcardProposalViewModel[] {
  return dtos.map((dto, index) => transformProposalToViewModel(dto, index))
}

/**
 * Transformuje ViewModel na DTO do zapisu
 */
export function transformViewModelToCreateDTO(
  viewModel: FlashcardProposalViewModel
): import('~/types/dto/types').CreateFlashcardDTO {
  return {
    front: viewModel.front,
    back: viewModel.back,
    source: viewModel.source,
    generation_id: undefined, // Will be set when saving
  }
}

/**
 * Transformuje tablicę ViewModel na DTO do zapisu
 */
export function transformViewModelsToCreateDTOs(
  viewModels: FlashcardProposalViewModel[]
): import('~/types/dto/types').CreateFlashcardDTO[] {
  return viewModels.map(transformViewModelToCreateDTO)
}
