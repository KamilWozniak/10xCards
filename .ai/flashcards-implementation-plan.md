# API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego

Endpoint POST `/flashcards` umożliwia tworzenie jednej lub wielu fiszek przez uwierzytelnionego użytkownika. Obsługuje zarówno ręczne tworzenie fiszek (source: "manual") jak i tworzenie fiszek na podstawie generacji AI (source: "ai-full", "ai-edited"). Endpoint zapewnia walidację danych wejściowych, autoryzację użytkownika i zwraca utworzone fiszki z wygenerowanymi identyfikatorami.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/flashcards`
- **Parametry**:
  - Wymagane: `flashcards` (tablica obiektów fiszek)
- **Request Body**:
  ```json
  {
    "flashcards": [
      {
        "front": "string (max 200 chars)",
        "back": "string (max 500 chars)", 
        "source": "ai-full" | "ai-edited" | "manual",
        "generation_id": "number | null"
      }
    ]
  }
  ```

## 3. Wykorzystywane typy

- `CreateFlashcardsRequestDTO` - struktura request body
- `CreateFlashcardDTO` - pojedyncza fiszka w request
- `CreateFlashcardsResponseDTO` - struktura response body
- `FlashcardDTO` - zwracana fiszka z ID
- `FlashcardSource` - enum dla source
- `ApiErrorResponseDTO` - struktura błędów

## 4. Szczegóły odpowiedzi

**Sukces (201 Created)**:
```json
{
  "flashcards": [
    {
      "id": 1,
      "front": "Question 1",
      "back": "Answer 1", 
      "source": "manual",
      "generation_id": null,
      "user_id": "uuid",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

**Błędy**:
- 400 Bad Request - nieprawidłowe dane wejściowe
- 401 Unauthorized - brak autoryzacji
- 500 Internal Server Error - błąd serwera

## 5. Przepływ danych

1. **Walidacja autoryzacji** - sprawdzenie tokenu użytkownika
2. **Walidacja request body** - sprawdzenie struktury i typów danych
3. **Walidacja biznesowa** - sprawdzenie reguł source/generation_id
4. **Walidacja generation_id** - sprawdzenie czy generation należy do użytkownika
5. **Przygotowanie danych** - dodanie user_id do każdej fiszki
6. **Zapis do bazy** - transakcyjne tworzenie fiszek
7. **Zwrócenie odpowiedzi** - zwrócenie utworzonych fiszek z ID

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Wymagany token Supabase Auth
- **Walidacja danych**: Sanityzacja i walidacja wszystkich pól wejściowych
- **SQL injection**: Użycie prepared statements przez Supabase client

## 7. Obsługa błędów

| Kod | Scenariusz | Odpowiedź |
|-----|------------|-----------|
| 400 | Nieprawidłowa struktura JSON | `{"error": "Invalid JSON format"}` |
| 400 | Brak pola `flashcards` | `{"error": "Missing required field: flashcards"}` |
| 400 | Pusta tablica flashcards | `{"error": "Flashcards array cannot be empty"}` |
| 400 | Nieprawidłowy `source` | `{"error": "Invalid source value"}` |
| 400 | Nieprawidłowa długość `front`/`back` | `{"error": "Field exceeds maximum length"}` |
| 400 | Nieprawidłowa reguła `generation_id` | `{"error": "Invalid generation_id for source type"}` |
| 401 | Brak tokenu autoryzacji | `{"error": "Unauthorized"}` |
| 401 | Nieprawidłowy token | `{"error": "Invalid authentication token"}` |
| 500 | Błąd bazy danych | `{"error": "Internal server error"}` |

## 8. Rozważania dotyczące wydajności

- **Transakcje**: Użycie transakcji dla tworzenia wielu fiszek
- **Batch operations**: Grupowanie operacji bazodanowych
- **Indeksy**: Optymalizacja zapytań na user_id i generation_id
- **Walidacja**: Wczesna walidacja przed operacjami bazodanowymi
- **Rate limiting**: Ograniczenie liczby fiszek na request (np. max 50)

## 9. Etapy wdrożenia

1. **Utworzenie walidatora** - `server/utils/validators/flashcard-validator.ts`
2. **Utworzenie service** - `services/database/FlashcardsService.ts`
3. **Implementacja endpointu** - `server/api/flashcards.post.ts`
4. **Dokumentacja API** - aktualizacja dokumentacji endpointów
