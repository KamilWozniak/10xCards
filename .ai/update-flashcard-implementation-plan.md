# API Endpoint Implementation Plan: PUT /flashcards/{id}

## 1. Przegląd punktu końcowego
Endpoint PUT /flashcards/{id} umożliwia edycję istniejącej fiszki poprzez aktualizację wybranych pól (front, back, source). Jest to operacja partial update, gdzie użytkownik może modyfikować tylko potrzebne pola. Endpoint integruje się z Supabase dla uwierzytelniania i dostępu do bazy danych, zapewniając prywatność danych (tylko właściciel fiszki może ją edytować). Automatycznie aktualizuje pole updated_at dzięki triggerowi DB. Zgodny z REST principles, zwraca zaktualizowany obiekt fiszki.

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- Struktura URL: `/api/flashcards/${id}` (gdzie {id} to parametr ścieżki)
- Parametry:
  - Wymagane: id (integer, BIGSERIAL PRIMARY KEY z tabeli flashcards, musi istnieć i należeć do użytkownika)
  - Opcjonalne: Brak query params; body zawiera partial fields
- Request Body: JSON obiekt zgodny z UpdateFlashcardDTO
  ```json
  {
    "front": "string" // opcjonalne, max 200 chars
    "back": "string"  // opcjonalne, max 500 chars
    "source": "ai-full | ai-edited | manual" // opcjonalne, enum validation
  }
  ```
  Walidacja: Co najmniej jedno pole musi być podane; użyć Zod schema w server/utils/validators/.

## 3. Wykorzystywane typy
- DTOs:
  - UpdateFlashcardDTO: Partial<Pick<FlashcardDTO, 'front' | 'back' | 'source'>> (request body, z types/dto/types.ts)
  - FlashcardDTO: Tables<'flashcards'> (response, pełny obiekt z DB, z types/database/database.types.ts)
- Command Models:
  - UpdateFlashcardCommand: Nowy typ w types/commands/ (extends UpdateFlashcardDTO + { id: number; user_id: string }), do enkapsulacji danych w service layer.

## 4. Szczegóły odpowiedzi
- Sukces (200 OK): Zwraca zaktualizowany FlashcardDTO
  ```json
  {
    "id": number,
    "front": "string",
    "back": "string",
    "source": "string",
    "generation_id": number | null,
    "user_id": "string",
    "created_at": "string",
    "updated_at": "string"
  }
  ```
- Błędy:
  - 400 Bad Request: { error: "Invalid input", details: "specific message" } (ApiErrorResponseDTO)
  - 401 Unauthorized: { error: "Unauthorized" }
  - 404 Not Found: { error: "Flashcard not found" }
  - 500 Internal Server Error: { error: "Internal server error" }

## 5. Przepływ danych
1. Uwierzytelnienie: Middleware auth.global.ts pobiera user_id z Supabase session (useSupabase composable).
2. Walidacja: W API handlerze (server/api/flashcards/[id].put.ts) parsuj {id}, waliduj body z Zod.
3. Pobranie fiszki: Wywołaj FlashcardsService.updateFlashcard(UpdateFlashcardCommand) – service fetchuje fiszkę po id i user_id via Supabase (select * from flashcards where id = $1 and user_id = $2).
4. Aktualizacja: Jeśli fiszka istnieje i należy do użytkownika, update partial fields (supabase.from('flashcards').update(fields).eq('id', id)), trigger aktualizuje updated_at.
5. Odpowiedź: Zwróć zaktualizowany rekord z DB.
Interakcje zewnętrzne: Tylko Supabase (DB + auth); brak AI lub innych usług.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Wymagane via Supabase Auth (middleware sprawdza session; brak session → 401).
- Autoryzacja: W service warstwie sprawdź user_id z sesji vs DB (zapobiega edytowaniu cudzych fiszek).
- Walidacja danych: Zod dla input (length, enum); Supabase params binding zapobiega SQL injection.
- Inne: Brak wrażliwych danych w response (user_id ok, ale nie hasła). Rate limiting via Nitro middleware jeśli potrzeba. GDPR: Dane prywatne, tylko owner access.

## 7. Obsługa błędów
- 400: Nieprawidłowy input (np. source poza enum, front >200 chars) – walidacja Zod, zwróć ApiErrorResponseDTO.
- 401: Brak autentykacji – middleware redirect lub error.
- 404: Fiszka nie istnieje lub nie należy do user – service rzuca custom error, handler mapuje na 404.
- 500: Błędy DB (np. Supabase outage), service exceptions – loguj via console/Nitro logger, zwróć generic error (nie expose details).
Użyj try-catch w handlerze/service; custom errors z server/utils/errors/ dla typowania.

## 8. Rozważania dotyczące wydajności
- Niskie obciążenie: Single row update, indeks na id/user_id w DB zapewnia O(1) access.
- Optymalizacje: Użyj Supabase RPC jeśli złożone; cache niepotrzebne (edycja rzadka). Monitoruj query performance via Supabase dashboard.
- Potencjalne wąskie gardła: Duża liczba concurrent edits (rzadkie) – Supabase handles scaling.

## 9. Etapy wdrożenia
1. Stwórz UpdateFlashcardCommand w types/commands/generation-commands.ts (lub nowy plik commands.ts), importuj DTOs.
2. Dodaj walidację schema w server/utils/validators/flashcards.ts (Zod dla UpdateFlashcardDTO, sprawdź co najmniej jedno pole).
3. W services/database/FlashcardsService.ts: Dodaj async updateFlashcard(command: UpdateFlashcardCommand) – fetch z ownership check, update via supabase, rzuć custom errors jeśli nie znaleziono.
4. Stwórz server/api/flashcards/[id].put.ts: Handler z defineEventHandler, getRouterParam('id'), readBodyAsJSON, waliduj, wywołaj service, zwróć response lub error.
5. Aktualizuj docs/api/flashcards-endpoint.md z nową sekcją dla PUT.
6. Commit: feat(flashcards): implement update endpoint z conventional commits, branch feature/update-flashcard-api.
