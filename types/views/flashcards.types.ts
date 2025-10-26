// ============================================================================
// FLASHCARDS VIEW TYPES
// ============================================================================

import type { FlashcardDTO, UpdateFlashcardDTO } from '~/types/dto/types'

/**
 * Stan flashcards w widoku zarządzania
 */
export interface FlashcardsState {
  flashcards: FlashcardDTO[]
  currentPage: number
  totalPages: number
  total: number
  limit: number
  loading: boolean
  error: string | null
}

/**
 * ViewModel dla pojedynczej fiszki z rozszerzonymi polami UI
 * Obecnie bez pól flip (po usunięciu funkcjonalności flip),
 * ale zachowany dla potencjalnego przyszłego użytku
 */
export type FlashcardViewModel = FlashcardDTO & {
  // Pola UI mogą być dodane w przyszłości jeśli potrzebne
  // flipped?: boolean
  // isEditing?: boolean
}

/**
 * ViewModel dla paginacji z obliczonymi właściwościami
 */
export interface PaginationViewModel {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  total: number
  limit: number
}

/**
 * Stan modalu edycji fiszki
 */
export interface FlashcardEditModalState {
  isOpen: boolean
  flashcard: FlashcardDTO | null
  isLoading: boolean
}

/**
 * Stan modalu potwierdzenia usunięcia
 */
export interface ConfirmationDialogState {
  isOpen: boolean
  flashcardId: number | null
  isLoading: boolean
}

/**
 * Stan formularza edycji fiszki
 */
export interface FlashcardEditFormState {
  front: string
  back: string
  isValid: boolean
  errors: {
    front?: string
    back?: string
  }
}

/**
 * Props dla komponentu FlashcardItem
 */
export interface FlashcardItemProps {
  flashcard: FlashcardDTO
}

/**
 * Props dla komponentu FlashcardsList
 */
export interface FlashcardsListProps {
  flashcards: FlashcardDTO[]
  loading: boolean
  error: string | null
}

/**
 * Props dla komponentu Pagination
 */
export interface PaginationProps {
  currentPage: number
  totalPages: number
  total: number
}

/**
 * Props dla komponentu FlashcardEditModal
 */
export interface FlashcardEditModalProps {
  flashcard: FlashcardDTO | null
  isOpen: boolean
}

/**
 * Props dla komponentu ConfirmationDialog
 */
export interface ConfirmationDialogProps {
  isOpen: boolean
  flashcardId: number | null
}

/**
 * Emity dla komponentu FlashcardItem
 */
export interface FlashcardItemEmits {
  edit: [flashcardId: number]
  delete: [flashcardId: number]
}

/**
 * Emity dla komponentu FlashcardsList
 */
export interface FlashcardsListEmits {
  edit: [flashcardId: number]
  delete: [flashcardId: number]
  retry: []
}

/**
 * Emity dla komponentu Pagination
 */
export interface PaginationEmits {
  'update:page': [page: number]
}

/**
 * Emity dla komponentu FlashcardEditModal
 */
export interface FlashcardEditModalEmits {
  'update:open': [open: boolean]
  save: [flashcardId: number, updateData: UpdateFlashcardDTO]
}

/**
 * Emity dla komponentu ConfirmationDialog
 */
export interface ConfirmationDialogEmits {
  'update:open': [open: boolean]
  confirm: [flashcardId: number]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Tworzy domyślny stan formularza edycji
 */
export function createDefaultEditFormState(): FlashcardEditFormState {
  return {
    front: '',
    back: '',
    isValid: false,
    errors: {},
  }
}

/**
 * Tworzy domyślny stan paginacji
 */
export function createDefaultPaginationViewModel(): PaginationViewModel {
  return {
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    total: 0,
    limit: 10,
  }
}

/**
 * Oblicza właściwości paginacji na podstawie stanu
 */
export function calculatePaginationViewModel(state: FlashcardsState): PaginationViewModel {
  const { currentPage, totalPages, total, limit } = state

  return {
    currentPage,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    total,
    limit,
  }
}

/**
 * Sprawdza czy paginacja powinna być widoczna
 */
export function shouldShowPagination(state: FlashcardsState): boolean {
  return state.total > state.limit
}
