# API Endpoint Implementation Plan: DELETE /flashcards/{id}

## 1. Przegląd punktu końcowego
Endpoint DELETE /flashcards/{id} umożliwia użytkownikowi usunięcie konkretnej fiszki (flashcard) z bazy danych. Fiszka musi należeć do uwierzytelnionego użytkownika, co zapewnia prywatność i bezpieczeństwo danych. Po udanym usunięciu, endpoint zwraca komunikat sukcesu. Endpoint jest częścią API do zarządzania fiszkami w aplikacji 10xCards, integrując się z Supabase dla operacji na bazie danych.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE
- Struktura URL: `/api/flashcards/delete/{id}` (zgodne z konwencją Nuxt server/api)
- Parametry:
  - Wymagane: `id` (path parameter) - Unikalny identyfikator fiszki (BIGSERIAL, liczba całkowita)
  - Opcjonalne: Brak
- Request Body: Brak (DELETE nie wymaga ciała żądania)

## 3. Wykorzystywane typy
- **DTOs**:
  - `ApiSuccessMessageDTO`: `{ message: string }` - Dla odpowiedzi sukcesu, np. `{ "message": "Flashcard deleted successfully" }`.
  - `ApiErrorResponseDTO`: `{ error: string; details?: string }` - Dla błędów, np. `{ "error": "Flashcard not found" }`.
  - `FlashcardDTO` (z `Tables<'flashcards'>`): Używane wewnętrznie do weryfikacji istnienia fiszki przed usunięciem.
- **Command Models** (jeśli potrzebne):
  - `DeleteFlashcardCommand`: `{ id: number; userId: string }` - Model do przekazywania danych do serwisu (opcjonalny, jeśli używamy prostego obiektu w serwisie).

## 4. Szczegóły odpowiedzi
- **Sukces (204 No Content lub 200 OK)**: Pusty body lub `ApiSuccessMessageDTO` z komunikatem sukcesu, np.:
  ```json
  {
    "message": "Flashcard deleted successfully"
  }
  ```
- **Błędy**:
  - 401 Unauthorized: Jeśli użytkownik nie jest uwierzytelniony.
  - 404 Not Found: Jeśli fiszka o podanym ID nie istnieje lub nie należy do użytkownika.
  - 400 Bad Request: Jeśli ID nie jest poprawną liczbą.
  - 500 Internal Server Error: Dla nieoczekiwanych błędów po stronie serwera.

## 5. Przepływ danych
1. Użytkownik wysyła żądanie DELETE do `/api/flashcards/delete/{id}` z tokenem uwierzytelniania (Supabase session).
2. W handlerze API (server/api/flashcards/delete/[id].delete.ts lub podobnym):
   - Wyodrębnij `id` z path (parseInt, walidacja).
   - Pobierz bieżącego użytkownika z sesji Supabase (`useSupabaseClient()` lub middleware auth).
   - Wywołaj `FlashcardsService.deleteFlashcard(id, userId)`:
     - Sprawdź istnienie fiszki: `supabase.from('flashcards').select('*').eq('id', id).eq('user_id', userId).single()`.
     - Jeśli istnieje, usuń: `supabase.from('flashcards').delete().eq('id', id)`.
     - Opcjonalnie: Jeśli fiszka ma `generation_id`, zaktualizuj statystyki w `generations` (np. decrement accepted counts, jeśli dotyczy – wymaga dodatkowego logiki).
3. Zwróć odpowiedź sukcesu lub błąd.
4. Baza danych: Supabase obsługuje transakcje; trigger aktualizuje `updated_at` (choć dla DELETE niepotrzebne).

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie**: Wymagaj aktywnej sesji Supabase (użyj middleware `auth.global.ts` lub sprawdź w handlerze via `getUser()` z Supabase).
- **Autoryzacja**: Weryfikuj, że `user_id` fiszki zgadza się z bieżącym użytkownikiem (RACD: Row Level Security w Supabase – włącz RLS i polityki dla `DELETE` na `flashcards` WHERE `user_id = auth.uid()`).
- **Walidacja**: Parse i waliduj `id` jako liczbę; unikaj SQL injection dzięki parameterized queries w Supabase SDK.
- **Ochrona przed nadużyciami**: Ogranicz tempo żądań (rate limiting via Supabase lub Nuxt middleware); loguj usunięcia dla audytu.
- **GDPR**: Usunięcie fiszki wspiera prawo do bycia zapomnianym; dane użytkownika pozostają prywatne.

## 7. Obsługa błędów
- **401 Unauthorized**: Brak sesji lub niepoprawny token – zwróć `ApiErrorResponseDTO` z "Unauthorized".
- **404 Not Found**: Fiszka nie istnieje lub nie należy do użytkownika – sprawdź via query, zwróć "Flashcard not found".
- **400 Bad Request**: Nieprawidłowy `id` (NaN) – waliduj na wejściu.
- **500 Internal Server Error**: Błędy Supabase (np. połączenie DB) – loguj do `generation_error_logs` jeśli dotyczy (lub ogólnego logera); zwróć "Internal server error" bez szczegółów.
- Inne: Użyj try-catch w serwisie; rzucaj custom errors (np. `NotFoundError`, `UnauthorizedError`) i mapuj na kody HTTP.

## 8. Rozważania dotyczące wydajności
- **Zapytania DB**: Pojedyncze select + delete – efektywne (index na `id` i `user_id` w Supabase).
- **Optymalizacja**: Użyj RLS dla autoryzacji (brak dodatkowych joinów); cache niepotrzebny dla DELETE.
- **Skalowalność**: Supabase obsługuje; dla wysokiego obciążenia, rozważ batch delete jeśli rozszerzone.
- **Monitorowanie**: Śledź czasy odpowiedzi; unikaj N+1 queries (tutaj nie dotyczy).

## 9. Etapy wdrożenia
1. **Przygotowanie typów**: Dodaj `DeleteFlashcardCommand` do `types/commands/` jeśli potrzebne; upewnij się, że `FlashcardDTO` jest zaimportowane.
2. **Rozszerz FlashcardsService**: W `services/database/FlashcardsService.ts`, dodaj metodę `async deleteFlashcard(id: number, userId: string): Promise<void>`.
   - Użyj Supabase client do select i delete.
   - Obsłuż błędy (rzucaj exceptions).
   - Opcjonalnie: Zaktualizuj `generations` jeśli fiszka była zaakceptowana (decrement counters).
3. **Utwórz handler API**: W `server/api/flashcards/delete/[id].delete.ts` (dynamic route w Nuxt).
   - Parse `id` z event.params.
   - Pobierz user z sesji.
   - Waliduj i wywołaj service.
   - Zwróć `send({ status: 200, body: { message: 'Flashcard deleted successfully' } })` lub error.
4. **Walidacja i RLS**: W Supabase, upewnij się, że RLS polityka dla DELETE na `flashcards` jest włączona: `CREATE POLICY "Users can delete own flashcards" ON flashcards FOR DELETE USING (user_id = auth.uid());`.
5. **Testy jednostkowe**: W `services/database/__tests__/FlashcardsService.spec.ts`, dodaj testy dla delete (mock Supabase, sprawdź query, błędy).
6. **Dokumentacja**: Zaktualizuj `docs/api/flashcards-endpoint.md` z opisem DELETE.
7. **Commit i review**: Użyj conventional commits (feat(api): implement delete flashcard endpoint); stwórz PR.
