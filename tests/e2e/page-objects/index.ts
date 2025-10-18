/**
 * Page Objects Index
 * Centralized export for all Page Object Classes
 */

// Import test configuration
import { E2E_TEST_USER, validateE2EEnvironment } from '../test-config'

// Base classes
export { BasePage } from './BasePage'

// Page Objects
export { LoginPage } from './LoginPage'
export { GeneratePage } from './GeneratePage'

// Components
export { NavigationComponent } from './components/NavigationComponent'
export { SourceTextFormComponent } from './components/SourceTextFormComponent'
export { GenerationStateComponent } from './components/GenerationStateComponent'
export { FlashcardProposalsListComponent } from './components/FlashcardProposalsListComponent'
export { FlashcardProposalItemComponent } from './components/FlashcardProposalItemComponent'
export { FlashcardEditModalComponent } from './components/FlashcardEditModalComponent'

// Types for test data
export interface LoginCredentials {
  email: string
  password: string
}

export interface TestUser {
  email: string
  password: string
  name?: string
}

export interface FlashcardProposal {
  id: string
  front: string
  back: string
  source: 'ai-full' | 'ai-edited'
  isAccepted?: boolean
  isRejected?: boolean
  isEdited?: boolean
}

export interface GenerationTestData {
  validText: string
  shortText: string
  longText: string
  emptyText: string
}

export interface ProposalTestActions {
  accept: boolean
  reject: boolean
  edit: boolean
  editData?: {
    front: string
    back: string
  }
}

// Test user data from environment variables
export const TEST_USERS = {
  VALID_USER: {
    id: E2E_TEST_USER.id,
    email: E2E_TEST_USER.email,
    password: E2E_TEST_USER.password,
  },
  INVALID_USER: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
} as const

// Test data for flashcard generation
export const GENERATION_TEST_DATA: GenerationTestData = {
  validText: `Londyn (ang. London) – stolica i największe miasto Anglii i Wielkiej Brytanii, położone w południowo-wschodniej części kraju, nad Tamizą. Jest trzecim co do wielkości miastem Europy, po Moskwie i Stambule, a jednocześnie jednym z większych miast świata zarówno w skali samego miasta, jak i całej aglomeracji. Liczba mieszkańców Londynu (w granicach tzw. Wielkiego Londynu) wynosi ok. 8,982 mln (2019) na obszarze 1572 km²; cały zaś obszar metropolitalny Londynu w 2018 r. liczył prawie 12,5 milionów mieszkańców[2]. Około 20% mieszkańców pochodzi z Azji, Afryki i Karaibów.

Współczesny Londyn jest drugim pod względem wielkości centrum finansowym świata. Dokonuje się tam 30% światowego obrotu walutami i 40% światowego obrotu euroobligacjami. Swoje główne siedziby ma tam kilkaset banków oraz wielkie towarzystwa ubezpieczeniowe i inwestycyjne. Jest także ogromnym ośrodkiem medialnym.

W 2018 Londyn odwiedziło 20,42 mln turystów z całego świata – był na drugim miejscu wśród najczęściej odwiedzanych miast świata po Bangkoku w Tajlandii[3].`,
  shortText: 'To jest za krótki tekst do generowania fiszek.',
  longText: 'A'.repeat(10001), // Przekracza limit 10000 znaków
  emptyText: '',
} as const

// Sample proposal test data based on London text
export const SAMPLE_PROPOSALS: FlashcardProposal[] = [
  {
    id: 'proposal-1',
    front: 'Jaka jest stolica Wielkiej Brytanii?',
    back: 'Londyn (ang. London) – stolica i największe miasto Anglii i Wielkiej Brytanii.',
    source: 'ai-full',
    isAccepted: false,
    isRejected: false,
    isEdited: false,
  },
  {
    id: 'proposal-2',
    front: 'Ile mieszkańców liczy Wielki Londyn?',
    back: 'Liczba mieszkańców Londynu (w granicach tzw. Wielkiego Londynu) wynosi ok. 8,982 mln (2019).',
    source: 'ai-full',
    isAccepted: false,
    isRejected: false,
    isEdited: false,
  },
  {
    id: 'proposal-3',
    front: 'Jakie miejsce zajmuje Londyn jako centrum finansowe świata?',
    back: 'Współczesny Londyn jest drugim pod względem wielkości centrum finansowym świata.',
    source: 'ai-full',
    isAccepted: false,
    isRejected: false,
    isEdited: false,
  },
  {
    id: 'proposal-4',
    front: 'Ile turystów odwiedziło Londyn w 2018 roku?',
    back: 'W 2018 Londyn odwiedziło 20,42 mln turystów z całego świata.',
    source: 'ai-full',
    isAccepted: false,
    isRejected: false,
    isEdited: false,
  },
] as const

// Validation function to ensure test environment is properly configured
export function validateTestEnvironment(): void {
  validateE2EEnvironment()
}
