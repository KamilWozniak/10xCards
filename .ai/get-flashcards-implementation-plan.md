# API Endpoint Implementation Plan: GET /flashcards

## 1. Przegląd punktu końcowego
Endpoint GET /flashcards umożliwia autoryzowanemu użytkownikowi pobieranie paginowanej listy swoich fiszek. Celem jest dostarczenie efektywnego dostępu do fiszek użytkownika w aplikacji flashcardowej, integrując się z Supabase dla bezpiecznego odczytu danych. Endpoint respektuje RLS Supabase, zwracając wyłącznie fiszki powiązane z bieżącym użytkownikiem, i wspiera paginację dla skalowalności.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/flashcards`
- Parametry:
  - Wymagane: Brak
  - Opcjonalne:
    - `page` (number, default: 1): Numer strony paginacji.
    - `limit` (number, default: 10, max: 100): Liczba fiszek na stronę.
- Request Body: Brak (query parameters only)

## 3. Wykorzystywane typy
- DTOs:
  - `FlashcardListQueryDTO`: Interfejs dla query parameters (page?: number, limit?: number).
  - `PaginatedFlashcardsResponseDTO`: Response wrapper ({ data: FlashcardDTO[], pagination: PaginationMetaDTO }).
  - `FlashcardDTO`: Typ bazy danych dla fiszki (Tables<'flashcards'>: { id: number, front: string, back: string, source: string, created_at: string, updated_at: string, generation_id?: number | null, user_id: string }).
  - `PaginationMetaDTO`: { page: number, limit: number, total: number }.
- Command Modele: `GetFlashcardsQuery` (extends FlashcardListQueryDTO) – prosty obiekt do przekazywania query do service, z dodatkowym polem `user_id: string` dla filtracji.

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Question",
        "back": "Answer",
        "source": "manual",
        "created_at": "2025-10-25T10:00:00Z",
        "updated_at": "2025-10-25T10:00:00Z",
        "generation_id": null,
        "user_id": "uuid"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```
- Błędy:
  - 400 Bad Request: { error: "Invalid query parameters", details?: string } (np. niepoprawny page lub limit).
  - 401 Unauthorized: { error: "Unauthorized" }.
  - 500 Internal Server Error: { error: "Internal server error", details?: string } (ukryte dla produkcji).

## 5. Przepływ danych
1. API handler (server/api/flashcards.get.ts) pobiera sesję użytkownika via Supabase auth (useSupabaseServerClient()).
2. Waliduje query parameters manualnie (sprawdź czy page i limit to liczby, page >=1, limit 1-100, ustaw defaults).
3. Jeśli autoryzacja OK, tworzy GetFlashcardsQuery z walidowanymi params i user_id z sesji.
4. Wywołuje FlashcardsService.getPaginatedFlashcards(query): Buduje Supabase query – .select(), aplikuje .eq('user_id', userId), paginację (.range(offset, offset + limit - 1)), i .count('exact') dla total.
5. Service zwraca PaginatedFlashcardsResponseDTO; handler serializuje i zwraca 200.
6. Trigger DB automatycznie aktualizuje updated_at (jeśli potrzeba, ale to odczyt).

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Wymagaj Supabase session; jeśli brak – rzuć 401. Użyj middleware auth.global.ts dla globalnej ochrony.
- Autoryzacja: Filtruj query po user_id = auth.uid(); polegaj na RLS policy (CREATE POLICY "Users can view own flashcards" ON flashcards FOR SELECT USING (user_id = auth.uid())).
- Walidacja: Manualna walidacja query params w handlerze (parseInt, range checks) aby zapobiec injection; ogranicz limit do 100.
- Dane: Nie eksponuj user_id w response (usuń z FlashcardDTO jeśli potrzeba); brak sensitive data w fiszkach.
- Inne: Brak body, więc CSRF nie dotyczy; rate limiting via Supabase lub Nitro middleware dla /api/flashcards.

## 7. Obsługa błędów
- 400 Bad Request: Walidacja params fail (np. invalid page lub limit) – zwróć ApiErrorResponseDTO z details.
- 401 Unauthorized: Brak sesji lub invalid token – sprawdź early w handler.
- 404 Not Found: Nie stosuj (empty data array dla brak fiszek; total=0).
- 500 Internal Server Error: Błędy DB/service (np. Supabase outage) – loguj do console/error logger, opcjonalnie do generation_error_logs z error_code='FLASHCARD_LIST_FAIL', error_message, user_id; zwróć generic error bez details.
- Global: Użyj try-catch w handler; dla unexpected errors – log stack trace.

## 8. Rozważania dotyczące wydajności
- Paginacja: Użyj .range() Supabase dla efektywnego offset-based; unikaj deep pagination (duże page) via limit max=100.
- Indeksy DB: Upewnij się, że Supabase ma indeksy na user_id (dla filtracji użytkownika).
- Query Optymalizacja: Single query z .select() i .count(); prosty odczyt bez dodatkowych filtrów.
- Skalowalność: Supabase auto-skaluje; monitoruj query performance via Supabase dashboard.

## 9. Etapy wdrożenia
1. Zaktualizuj types/dto/types.ts: Upewnij się, że FlashcardListQueryDTO i PaginatedFlashcardsResponseDTO są kompletne (tylko page i limit); dodaj GetFlashcardsQuery jeśli potrzeba.
2. Rozszerz services/database/FlashcardsService.ts: Dodaj metodę getPaginatedFlashcards(userId: string, query: FlashcardListQueryDTO): Promise<PaginatedFlashcardsResponseDTO> z Supabase query budową (tylko paginacja).
3. Zaimplementuj server/api/flashcards.get.ts: Handler z auth check, manualną walidacją query params (parseInt, checks), service call, i response serialization; obsłuż błędy z odpowiednimi statusami.
4. Przetestuj lokalnie: Uruchom dev server, stwórz test user/fiszki, wywołaj endpoint z Postman/cURL, sprawdź paginację.
5. Dokumentuj: Zaktualizuj docs/api/flashcards-endpoint.md z pełną spec, examples, i error cases.
