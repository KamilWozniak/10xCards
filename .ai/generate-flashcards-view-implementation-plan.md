# Plan implementacji widoku Generowanie fiszek

## 1. Przegląd
Widok generowania fiszek umożliwia użytkownikom tworzenie nowych fiszek z wykorzystaniem AI na podstawie dostarczonego tekstu. Użytkownik wprowadza tekst (1000-10000 znaków), generuje propozycje AI, a następnie może je przeglądać, edytować, akceptować lub odrzucać przed zapisaniem do bazy danych.

## 2. Routing widoku
- **Ścieżka**: `/generate`
- **Plik**: `pages/generate.vue`
- **Layout**: Domyślny layout aplikacji z nawigacją

## 3. Struktura komponentów
```
GenerateFlashcardsView (pages/generate.vue)
├── SourceTextForm
│   ├── Textarea z walidacją długości
│   ├── CharacterCounter (1000-10000)
│   └── GenerateButton
├── LoadingSpinner (warunkowo)
├── ErrorMessage (warunkowo)
└── FlashcardProposalsList
    ├── FlashcardProposalItem (dla każdej propozycji)
    │   ├── Front/Back content
    │   ├── AcceptButton
    │   ├── EditButton
    │   └── RejectButton
    ├── FlashcardEditModal (warunkowo)
    └── SaveSelectedButton
```

## 4. Szczegóły komponentów

### GenerateFlashcardsView
- **Opis**: Główny widok strony odpowiedzialny za koordynację całego procesu generowania fiszek
- **Główne elementy**: Container z SourceTextForm, LoadingSpinner, ErrorMessage, FlashcardProposalsList
- **Obsługiwane interakcje**: Zarządzanie stanem generowania, obsługa błędów, nawigacja
- **Obsługiwana walidacja**: Brak bezpośredniej walidacji (deleguje do komponentów dzieci)
- **Typy**: GenerationState, ProposalState
- **Propsy**: Brak (komponent główny)

### SourceTextForm
- **Opis**: Formularz do wprowadzania tekstu źródłowego z walidacją długości i przyciskiem generowania
- **Główne elementy**: Textarea, CharacterCounter, GenerateButton, walidacja w czasie rzeczywistym
- **Obsługiwane interakcje**: Wprowadzanie tekstu, walidacja, wysyłanie żądania generowania
- **Obsługiwana walidacja**: Długość tekstu 1000-10000 znaków, walidacja w czasie rzeczywistym
- **Typy**: FormValidationState, SourceTextFormData
- **Propsy**: 
  - `isLoading: boolean`
  - `disabled: boolean`
- **Emitowane zdarzenia**:
  - `@generate: (text: string) => void`

### FlashcardProposalsList
- **Opis**: Lista wygenerowanych propozycji fiszek z opcjami akcji dla każdej propozycji
- **Główne elementy**: Container z listą FlashcardProposalItem, SaveSelectedButton
- **Obsługiwane interakcje**: Wyświetlanie propozycji, zarządzanie stanem akceptacji/odrzucenia, zapis wybranych
- **Obsługiwana walidacja**: Walidacja wyboru propozycji do zapisania
- **Typy**: FlashcardProposalViewModel[], ProposalActionState
- **Propsy**:
  - `proposals: FlashcardProposalViewModel[]`
  - `generationId: number`
- **Emitowane zdarzenia**:
  - `@save-selected: (selectedProposals: FlashcardProposalViewModel[]) => void`

### FlashcardProposalItem
- **Opis**: Pojedyncza propozycja fiszki z przyciskami akcji (akceptuj, edytuj, odrzuć)
- **Główne elementy**: Card z front/back content, przyciski akcji
- **Obsługiwane interakcje**: Akceptacja, edycja, odrzucenie propozycji
- **Obsługiwana walidacja**: Walidacja długości przy edycji (front max 200, back max 500)
- **Typy**: FlashcardProposalViewModel, ProposalActionState
- **Propsy**:
  - `proposal: FlashcardProposalViewModel`
- **Emitowane zdarzenia**:
  - `@accept: (proposal: FlashcardProposalViewModel) => void`
  - `@edit: (proposal: FlashcardProposalViewModel) => void`
  - `@reject: (proposal: FlashcardProposalViewModel) => void`

### FlashcardEditModal
- **Opis**: Modal do edycji propozycji fiszki przed akceptacją
- **Główne elementy**: Modal overlay, formularz edycji (front/back), przyciski zapisz/anuluj
- **Obsługiwane interakcje**: Edycja treści, zapisanie zmian, anulowanie
- **Obsługiwana walidacja**: Front max 200 znaków, back max 500 znaków
- **Typy**: FlashcardProposalViewModel, EditFormState
- **Propsy**:
  - `proposal: FlashcardProposalViewModel`
  - `isOpen: boolean`
- **Emitowane zdarzenia**:
  - `@save: (editedProposal: FlashcardProposalViewModel) => void`
  - `@cancel: () => void`

## 5. Typy

### ViewModel Types (dla frontendu)
```typescript
// Stan generowania fiszek w widoku
interface GenerationState {
  isLoading: boolean
  error: string | null
  proposals: FlashcardProposalViewModel[]
  generationId: number | null
}

// Dane formularza tekstu źródłowego
interface SourceTextFormData {
  text: string
  characterCount: number
  isValid: boolean
}

// Stan walidacji formularza
interface FormValidationState {
  isValid: boolean
  characterCount: number
  errorMessage: string | null
  minLength: number
  maxLength: number
}

// Propozycja fiszki w widoku (rozszerzona o pola UI)
interface FlashcardProposalViewModel {
  id: string // unikalny ID dla UI
  front: string
  back: string
  source: 'ai-full' | 'ai-edited'
  isAccepted: boolean
  isRejected: boolean
  isEdited: boolean
  originalProposal?: FlashcardProposalViewModel // dla edytowanych
}

// Stan akcji na propozycjach
interface ProposalActionState {
  accepted: FlashcardProposalViewModel[]
  rejected: FlashcardProposalViewModel[]
  edited: FlashcardProposalViewModel[]
}

// Stan formularza edycji
interface EditFormState {
  front: string
  back: string
  isValid: boolean
  errors: {
    front?: string
    back?: string
  }
}

// Stan listy propozycji
interface ProposalsListState {
  proposals: FlashcardProposalViewModel[]
  selectedCount: number
  canSave: boolean
}
```

### API Types (DTO do komunikacji z backendem)
- `CreateGenerationRequestDTO`: source_text (1000-10000 znaków)
- `CreateGenerationResponseDTO`: generation_id, flashcards_proposals, generated_count
- `CreateFlashcardsRequestDTO`: flashcards array z source i generation_id
- `FlashcardProposalDTO`: front, back, source: 'ai-full' (tylko z API)

## 6. Zarządzanie stanem

### Custom Hooks
- **useGenerationState**: Zarządzanie stanem generowania (loading, error, proposals, generationId) - używa GenerationState
- **useFormValidation**: Walidacja formularza tekstowego z licznikiem znaków - używa FormValidationState i SourceTextFormData
- **useFlashcardProposals**: Zarządzanie propozycjami i ich stanem (akceptowane, odrzucone, edytowane) - używa FlashcardProposalViewModel i ProposalActionState

### Stan globalny
- Brak potrzeby globalnego stanu - komponent jest samowystarczalny
- Stan zarządzany lokalnie przez custom hooks

## 7. Integracja API

### POST /generations
- **Typ żądania**: `CreateGenerationRequestDTO` (tylko source_text)
- **Typ odpowiedzi**: `CreateGenerationResponseDTO` (generation_id, flashcards_proposals, generated_count)
- **Transformacja**: `FlashcardProposalDTO[]` → `FlashcardProposalViewModel[]` (dodanie pól UI)
- **Obsługa**: Wywołanie w SourceTextForm po kliknięciu GenerateButton
- **Błędy**: ValidationError (400), AIServiceError (500)

### POST /flashcards
- **Typ żądania**: `CreateFlashcardsRequestDTO` (flashcards array z source i generation_id)
- **Typ odpowiedzi**: `CreateFlashcardsResponseDTO` (utworzone fiszki z ID)
- **Transformacja**: `FlashcardProposalViewModel[]` → `CreateFlashcardDTO[]` (mapowanie do formatu API)
- **Obsługa**: Wywołanie w FlashcardProposalsList po kliknięciu SaveSelectedButton
- **Błędy**: ValidationError (400), DatabaseError (500)

## 8. Interakcje użytkownika

### Przepływ główny
1. Użytkownik wprowadza tekst w SourceTextForm
2. Walidacja długości tekstu w czasie rzeczywistym
3. Kliknięcie GenerateButton → emit `@generate` → obsługa w GenerateFlashcardsView → wywołanie POST /generations
4. Wyświetlenie LoadingSpinner podczas generowania
5. Wyświetlenie FlashcardProposalsList z propozycjami
6. Użytkownik może akceptować, edytować lub odrzucać propozycje (emitowane zdarzenia)
7. Kliknięcie SaveSelectedButton → emit `@save-selected` → obsługa w GenerateFlashcardsView → wywołanie POST /flashcards
8. Przekierowanie do widoku "Moje fiszki" po zapisaniu

### Interakcje szczegółowe
- **Edycja propozycji**: Otwarcie FlashcardEditModal, walidacja pól, emit `@save` → obsługa w FlashcardProposalsList
- **Akceptacja propozycji**: Emit `@accept` → obsługa w FlashcardProposalsList → dodanie do listy akceptowanych
- **Odrzucenie propozycji**: Emit `@reject` → obsługa w FlashcardProposalsList → ukrycie propozycji
- **Walidacja formularza**: Sprawdzanie długości tekstu, wyświetlanie komunikatów błędów (lokalnie w komponencie)

## 9. Warunki i walidacja

### Walidacja tekstu źródłowego
- **Komponent**: SourceTextForm
- **Warunek**: Długość 1000-10000 znaków
- **Wpływ na UI**: Wyłączenie GenerateButton, wyświetlenie komunikatu błędu
- **Walidacja**: W czasie rzeczywistym podczas wprowadzania

### Walidacja propozycji fiszek
- **Komponent**: FlashcardEditModal
- **Warunki**: Front max 200 znaków, back max 500 znaków
- **Wpływ na UI**: Wyłączenie przycisku zapisz, wyświetlenie komunikatów błędów
- **Walidacja**: W czasie rzeczywistym podczas edycji

### Walidacja wyboru propozycji
- **Komponent**: FlashcardProposalsList
- **Warunek**: Co najmniej jedna propozycja musi być akceptowana
- **Wpływ na UI**: Wyłączenie SaveSelectedButton, wyświetlenie komunikatu
- **Walidacja**: Po każdej akcji na propozycji

## 10. Obsługa błędów

### Błędy walidacji
- **Tekst za krótki/długi**: Wyświetlenie komunikatu w SourceTextForm
- **Błąd edycji**: Wyświetlenie komunikatów w FlashcardEditModal
- **Brak wybranych propozycji**: Komunikat w FlashcardProposalsList

### Błędy API
- **Błąd generowania**: Wyświetlenie ErrorMessage z opcją ponowienia
- **Błąd zapisu**: Wyświetlenie komunikatu błędu, możliwość ponowienia
- **Timeout**: Komunikat o przekroczeniu czasu, opcja ponowienia

### Błędy sieci
- **Brak połączenia**: Komunikat o braku połączenia internetowego
- **Błąd serwera**: Komunikat o błędzie serwera z opcją ponowienia

## 11. Kroki implementacji

1. **Utworzenie struktury plików**
   - `pages/generate.vue` - główny widok
   - `components/generate/SourceTextForm.vue`
   - `components/generate/FlashcardProposalsList.vue`
   - `components/generate/FlashcardProposalItem.vue`
   - `components/generate/FlashcardEditModal.vue`

2. **Implementacja typów i interfejsów**
   - Definicja ViewModel types w `types/views/generate.types.ts`
   - Utworzenie funkcji transformacji DTO ↔ ViewModel
   - Zachowanie istniejących DTO bez modyfikacji

3. **Utworzenie custom hooks**
   - `composables/useGenerationState.ts`
   - `composables/useFormValidation.ts`
   - `composables/useFlashcardProposals.ts`

4. **Implementacja SourceTextForm**
   - Formularz z textarea i walidacją
   - Licznik znaków (1000-10000)
   - Przycisk generowania z obsługą loading
   - Emitowanie zdarzenia `@generate` zamiast przekazywania funkcji

5. **Implementacja FlashcardProposalsList**
   - Lista propozycji z akcjami
   - Zarządzanie stanem akceptacji/odrzucenia
   - Przycisk zapisu wybranych
   - Emitowanie zdarzenia `@save-selected` zamiast przekazywania funkcji

6. **Implementacja FlashcardProposalItem**
   - Wyświetlanie front/back
   - Przyciski akcji (akceptuj, edytuj, odrzuć)
   - Obsługa stanu propozycji
   - Emitowanie zdarzeń `@accept`, `@edit`, `@reject` zamiast przekazywania funkcji

7. **Implementacja FlashcardEditModal**
   - Modal z formularzem edycji
   - Walidacja pól (front max 200, back max 500)
   - Przyciski zapisz/anuluj
   - Emitowanie zdarzeń `@save`, `@cancel` zamiast przekazywania funkcji

8. **Integracja API**
   - Implementacja wywołań POST /generations
   - Implementacja wywołań POST /flashcards
   - Funkcje transformacji DTO ↔ ViewModel
   - Obsługa błędów i loading states

9. **Implementacja obsługi błędów**
   - Komponenty ErrorMessage
   - Obsługa różnych typów błędów
   - Komunikaty użytkownika

10. **Testy i optymalizacja**
    - Testy jednostkowe komponentów
    - Testy integracyjne z API
    - Optymalizacja UX i wydajności

11. **Stylowanie i dostępność**
    - Stylowanie z Tailwind CSS
    - Komponenty shadcn-vue
    - Dostępność (ARIA, keyboard navigation)

12. **Dokumentacja i finalizacja**
    - Dokumentacja komponentów
    - Przewodnik użytkownika
    - Finalne testy i wdrożenie
