# Plan implementacji widoku Lista fiszek

## 1. Przegląd
Widok Lista fiszek (`/flashcards`) umożliwia zalogowanym użytkownikom przeglądanie, edycję i usuwanie ich osobistych fiszek edukacyjnych. Głównym celem jest zapewnienie intuicyjnego zarządzania zestawami fiszek utworzonych ręcznie lub wygenerowanych przez AI, z paginacją dla lepszej użyteczności. Widok integruje się z API do pobierania, aktualizacji i usuwania fiszek, zachowując prywatność danych użytkownika zgodnie z PRD.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/flashcards`. Użyj file-based routing w Nuxt 3, tworząc plik `pages/flashcards.vue` lub `pages/my-flashcards.vue` (jeśli preferowana nazwa). Zabezpiecz route middleware'em autentykacyjnym (`middleware/auth.global.ts`), aby przekierowywać nieautentykowanych użytkowników na stronę logowania.

## 3. Struktura komponentów
Hierarchia komponentów:
- **FlashcardsView.vue** (główny komponent strony): Zawiera listę fiszek, paginację i modale.
  - **FlashcardsList.vue**: Wyświetla paginowaną listę fiszek.
    - **FlashcardItem.vue** (dziecko, wielokrotne): Pojedyncza fiszka z opcjami edycji i usuwania.
  - **Pagination.vue**: Komponent paginacji.
  - **FlashcardEditModal.vue**: Modal do edycji fiszki (może być współdzielony z modułem generowania).
  - **ConfirmationDialog.vue**: Dialog potwierdzenia usuwania.

Struktura opiera się na component-driven architecture z shadcn-vue@1.0.3 dla UI (np. Card, Button, Dialog).

## 4. Szczegóły komponentów
### FlashcardsView.vue
- **Opis**: Główny kontener widoku, zarządza stanem, ładowaniem i routingiem wewnętrznym. Składa się z nagłówka, listy fiszek i komponentów modali.
- **Główne elementy**: `<div>` z Tailwind classes dla layoutu, `<FlashcardsList>`, `<Pagination>`, `<FlashcardEditModal>`, `<ConfirmationDialog>`. Użyj `<Card>` z shadcn-vue dla kontenera listy.
- **Obsługiwane zdarzenia**: `onMounted` do inicjalnego fetcha, emit `editFlashcard` i `deleteFlashcard` do dzieci.
- **Warunki walidacji**: Brak bezpośredniej walidacji; deleguje do dzieci. Sprawdza autentykację via composable `useSupabase`.
- **Typy**: `PaginatedFlashcardsResponseDTO`, `FlashcardDTO`.
- **Propsy**: Brak (jako root); eksportuje stan via provide/inject lub Pinia.

### FlashcardsList.vue
- **Opis**: Wyświetla listę fiszek z paginacją, obsługuje ładowanie i pusty stan. Składa się z pętli nad fiszkami i komponentów akcji.
- **Główne elementy**: `<ul>` lub `<div class="grid">` z Tailwind, `<FlashcardItem v-for="flashcard in flashcards">`, loading spinner (`<div v-if="loading">`).
- **Obsługiwane zdarzenia**: `@edit="handleEdit"`, `@delete="handleDelete"`, `watch(currentPage, fetchFlashcards)`.
- **Warunki walidacji**: Walidacja paginacji (page >=1, limit 1-100); użyj `useFormValidation` composable.
- **Typy**: `FlashcardDTO[]`, `PaginationMetaDTO`.
- **Propsy**: `flashcards: FlashcardDTO[]`, `loading: boolean`, `error: string | null`.

### FlashcardItem.vue
- **Opis**: Reprezentuje pojedynczą fiszkę, pokazuje front/back (z opcją flip), przyciski edycji i usuwania.
- **Główne elementy**: `<Card>` z shadcn-vue, `<p v-if="!flipped">{{ front }}</p>`, przycisk flip (`<Button>`), `<Button variant="outline">Edytuj</Button>`, `<Button variant="destructive">Usuń</Button>`.
- **Obsługiwane zdarzenia**: `@click.flip="toggleFlip"`, `@click.edit="$emit('edit', id)"`, `@click.delete="$emit('delete', id)"`.
- **Warunki walidacji**: Brak; walidacja edytowana w modalu.
- **Typy**: `FlashcardDTO`.
- **Propsy**: `flashcard: FlashcardDTO`, `isEditing: boolean` (opcjonalne dla inline edit).

### Pagination.vue
- **Opis**: Standardowy komponent paginacji z przyciskami poprzedni/następny i numerami stron.
- **Główne elementy**: `<nav>` z `<Button>` dla stron, `<span>Total: {{ total }} fiszek</span>`.
- **Obsługiwane zdarzenia**: `@page-change="handlePageChange"`.
- **Warunki walidacji**: Obliczanie stron na podstawie `total / limit`.
- **Typy**: `PaginationMetaDTO`.
- **Propsy**: `pagination: PaginationMetaDTO`, emit `update:page`.

### FlashcardEditModal.vue
- **Opis**: Modal do edycji fiszki, z formularzem front/back/source.
- **Główne elementy**: `<Dialog>` z shadcn-vue, `<Input>` dla front/back, `<Select>` dla source, przyciski Zapisz/Anuluj.
- **Obsługiwane zdarzenia**: `@submit="handleUpdate"`, `@close="resetForm"`.
- **Warunki walidacji**: Front max 200 chars, back max 500, source enum; użyj `zod` via `useFormValidation`.
- **Typy**: `UpdateFlashcardDTO`, `FlashcardDTO`.
- **Propsy**: `flashcard: FlashcardDTO | null`, `isOpen: boolean`.

### ConfirmationDialog.vue
- **Opis**: Dialog potwierdzenia usuwania z komunikatem ostrzegawczym.
- **Główne elementy**: `<Dialog>`, `<p>Potwierdź usunięcie?</p>`, przyciski Tak/Nie.
- **Obsługiwane zdarzenia**: `@confirm="handleDelete"`, `@cancel="close"`.
- **Warunki walidacji**: Brak.
- **Typy**: `FlashcardDTO`.
- **Propsy**: `isOpen: boolean`, `flashcardId: number`.

## 5. Typy
Użyj istniejących typów z `~/types/dto/types.ts`:
- `FlashcardDTO`: { id: number, front: string, back: string, source: FlashcardSource, created_at: string, updated_at: string, generation_id?: number, user_id: string }
- `PaginatedFlashcardsResponseDTO`: { data: FlashcardDTO[], pagination: { page: number, limit: number, total: number } }
- `UpdateFlashcardDTO`: Partial<{ front: string, back: string, source: FlashcardSource }>
- `FlashcardSource`: 'ai-full' | 'ai-edited' | 'manual'

Nowe typy ViewModel:
- `FlashcardViewModel` extends `FlashcardDTO` { flipped: boolean, isEditing: boolean } – dodaje stany UI dla flip i edycji.
- `FlashcardsState` { flashcards: FlashcardDTO[], currentPage: number, total: number, loading: boolean, error: string | null, selectedFlashcard: FlashcardDTO | null } – stan dla composable.
- `PaginationViewModel` { currentPage: number, totalPages: number, hasNext: boolean, hasPrev: boolean } – uproszczony model paginacji.

Typy te zapewniają type-safety w TS i Composition API.

## 6. Zarządzanie stanem
Użyj Pinia store `useFlashcardsStore` dla globalnego stanu (flashcards, pagination) lub composable `useFlashcards` w komponencie dla lokalnego zarządzania. 
- Stan: `flashcards: Ref<FlashcardDTO[]>`, `pagination: Ref<PaginationMetaDTO>`, `loading: Ref<boolean>`, `error: Ref<string | null>`, `modals: { edit: boolean, confirmDelete: boolean }`.
- Custom hook: `useFlashcardActions()` – obsługuje fetch, update, delete z useFetch lub $fetch, integruje z Supabase auth. Użyj `reactive` dla reaktywności, `watch` dla paginacji. Dla modali: `ref(isOpen)` sterowane emitami.

## 7. Integracja API
- **GET /api/flashcards**: Użyj `useFetch<PaginatedFlashcardsResponseDTO>('/api/flashcards', { query: { page, limit } })`. Typ żądania: `FlashcardListQueryDTO`, odpowiedź: `PaginatedFlashcardsResponseDTO`. Wywołaj onMounted i na zmianę page.
- **PUT /api/flashcards/{id}**: `useFetch<FlashcardDTO>(`/api/flashcards/${id}`, { method: 'PUT', body: updateData })`. Typ żądania: `UpdateFlashcardDTO`, odpowiedź: `FlashcardDTO`. Obsłuż optymistyczną aktualizację listy.
- **DELETE /api/flashcards/{id}**: `$fetch(`/api/flashcards/${id}`, { method: 'DELETE' })`. Typ odpowiedzi: `ApiSuccessMessageDTO`. Po sukcesie, usuń z listy i refetch jeśli potrzeba.
Użyj interceptors dla autentykacji (token z Supabase). Błędy: 401 -> navigateTo('/login').

## 8. Interakcje użytkownika
- **Przegląd listy**: Użytkownik widzi paginowaną listę (10/strona). Od razu widoczny jest przód i tył fiszki (to nie jest sesja nauki, nic nie ukrywamy).
- **Edycja**: Kliknij "Edytuj" na FlashcardItem -> otwiera FlashcardEditModal z pre-filled danymi. Edytuj pola, kliknij "Zapisz" -> walidacja, API call, zamknij modal, update lista.
- **Usuwanie**: Kliknij "Usuń" -> otwiera ConfirmationDialog. "Tak" -> API delete, usuń z listy, pokaż toast sukcesu. "Nie" -> zamknij.
- **Paginacja**: Kliknij stronę/przedni/następny -> fetch nowej strony, update lista.
- **Pusty stan**: Jeśli brak fiszek, pokaż komunikat "Brak fiszek. Utwórz nowe w /generate".
- UX: Loading spinners, error toasts (użyj shadcn Alert), responsywny grid (Tailwind: md:grid-cols-1 lg:grid-cols-2).

## 9. Warunki i walidacja
- **Autentykacja**: Weryfikowana globalnie via middleware; w komponencie sprawdź `useSupabase().user` – jeśli null, redirect.
- **Walidacja formularza edycji**: W FlashcardEditModal – front: required, maxLength 200; back: required, maxLength 500; source: enum. Użyj `useFormValidation` z Zod schema. Błędy: wyświetl pod inputami via `<Alert>`.
- **Paginacja**: page: min 1, max totalPages; limit: 10-100. Waliduj w query przed API call.
- **Fiszki**: Tylko własne (user_id match via API). Edycja: co najmniej jedno pole zmienione.
Wpływ: Nieprawidłowe dane blokują submit, pokazują błędy; sukces update stanu i UI.

## 10. Obsługa błędów
- **401 Unauthorized**: Automatyczny redirect do `/login` via nuxtApp.$router.
- **404 Not Found**: Dla update/delete – usuń fiszkę z lokalnej listy, pokaż toast "Fiszka nie istnieje".
- **400 Bad Request**: Walidacja – wyświetl błędy formularza (details z API).
- **500 Internal Server Error**: Pokaż globalny error toast "Błąd serwera, spróbuj ponownie", loguj console.error.
- **Network Error**: Retry button w komponencie, fallback do offline message.
- **Pusty wynik**: Pokazuj "Brak fiszek" zamiast pustej listy.
Użyj try-catch w async operacjach, centralny error handler w composable.

## 11. Kroki implementacji
1. Utwórz plik `pages/flashcards.vue` z podstawowym layoutem (`<NuxtLayout>`), dodaj middleware auth.
2. Stwórz Pinia store `store/flashcards.ts` z fetch/update/delete.
3. Zaimplementuj `components/flashcards/FlashcardsList.vue` i `FlashcardItem.vue` z podstawową listą i flipem (użyj Card z shadcn).
4. Dodaj `components/ui/Pagination.vue` (lub użyj istniejącego z shadcn).
5. Rozszerz `FlashcardEditModal.vue` (reuse z generate) o walidację i API integration.
6. Stwórz `ConfirmationDialog.vue` z shadcn Dialog.
7. Zintegruj stany w FlashcardsView: useFlashcards(), watch page, handle events.
8. Dodaj typy do `types/views/flashcards.types.ts` (extend DTOs).
9. Implementuj walidację z `useFormValidation.ts` i error handling.
10. Styluj z Tailwind: responsywny.
