# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego

Endpoint `POST /generations` inicjuje proces generowania AI dla propozycji fiszek na podstawie tekstu dostarczonego przez użytkownika. Endpoint przyjmuje tekst źródłowy o długości 1000-10000 znaków, wywołuje zewnętrzny serwis AI (OpenRouter.ai), zapisuje metadane generowania w bazie danych i zwraca listę wygenerowanych propozycji fiszek użytkownikowi.

**Kluczowe funkcjonalności:**
- Walidacja długości tekstu źródłowego
- Obliczanie hasha tekstu źródłowego dla celów audytu
- Wywołanie serwisu AI z mierzeniem czasu odpowiedzi
- Zapis metadanych generowania do bazy danych
- Logowanie błędów w przypadku niepowodzenia AI
- Zwrócenie propozycji fiszek (nie zapisanych jeszcze do bazy)

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/generations`
- **Parametry**:
  - **Wymagane**: 
    - `source_text` (string) - Tekst źródłowy od użytkownika, długość 1000-10000 znaków
  - **Opcjonalne**: Brak
- **Request Body**:
  ```json
  {
    "source_text": "Długi tekst edukacyjny... (1000-10000 znaków)"
  }
  ```

## 3. Wykorzystywane typy

### DTOs (Data Transfer Objects)

```typescript
// Request DTO (już zdefiniowany w types/dto/types.ts)
interface CreateGenerationRequestDTO {
  source_text: string // Must be 1000-10000 characters
}

// Response DTO (już zdefiniowany w types/dto/types.ts)
interface CreateGenerationResponseDTO {
  generation_id: number
  flashcards_proposals: FlashcardProposalDTO[]
  generated_count: number
}

// Flashcard Proposal DTO (już zdefiniowany w types/dto/types.ts)
interface FlashcardProposalDTO {
  front: string
  back: string
  source: 'ai-full'
}
```

## 4. Szczegóły odpowiedzi

### Sukces (201 Created)

```json
{
  "generation_id": 123,
  "flashcards_proposals": [
    {
      "front": "Czym jest fotosynteza?",
      "back": "Proces przekształcania energii świetlnej w energię chemiczną przez rośliny",
      "source": "ai-full"
    },
    {
      "front": "Gdzie zachodzi fotosynteza?",
      "back": "W chloroplastach komórek roślinnych",
      "source": "ai-full"
    }
  ],
  "generated_count": 2
}
```

### Błąd walidacji (400 Bad Request)

```json
{
  "error": "Invalid input",
  "details": "source_text must be between 1000 and 10000 characters. Received: 500 characters"
}
```

### Nieautoryzowany dostęp (401 Unauthorized)

```json
{
  "error": "Unauthorized",
  "details": "Invalid or missing authentication token"
}
```

### Błąd serwisu AI (500 Internal Server Error)

```json
{
  "error": "AI service error",
  "details": "Failed to generate flashcards. Please try again later."
}
```

**Uwaga**: Szczegółowe informacje o błędzie są logowane do `generation_error_logs`, ale nie zwracane użytkownikowi ze względów bezpieczeństwa.

## 5. Przepływ danych

### Diagram sekwencji przepływu danych

```
Client → API Endpoint → Validation Layer → AI Service → OpenRouter API
                             ↓                  ↓
                    Generation Service    Error Logger
                             ↓                  ↓
                    Supabase Database    generation_error_logs
                             ↓
                         Response
```

### Szczegółowy przepływ

1. **Przyjęcie żądania**:
   - Endpoint `/api/generations.post.ts` przyjmuje żądanie POST
   - Wyodrębnienie tokenu z nagłówka `Authorization`

2. **Uwierzytelnianie**:
   - Weryfikacja tokenu Supabase Auth
   - Pobranie `user_id` z tokenu (auth.uid())
   - Jeśli token nieprawidłowy → 401 Unauthorized

3. **Walidacja danych wejściowych**:
   - Parsowanie body jako `CreateGenerationRequestDTO`
   - Sprawdzenie obecności `source_text`
   - Walidacja długości (1000-10000 znaków)
   - Jeśli walidacja nie powiedzie się → 400 Bad Request

4. **Przetwarzanie wstępne**:
   - Obliczenie `source_text_hash` (np. SHA-256)
   - Obliczenie `source_text_length`
   - Rozpoczęcie pomiaru czasu

5. **Wywołanie serwisu AI**:
   - Wywołanie `AIService.generateFlashcards(source_text)`
   - Serwis AI wywołuje OpenRouter API z odpowiednimi parametrami
   - Oczekiwanie na odpowiedź z limitem czasowym (timeout)

6. **Obsługa odpowiedzi AI**:
   - **Sukces**:
     - Parsowanie odpowiedzi do `AIGenerationResult`
     - Zakończenie pomiaru czasu
   - **Błąd**:
     - Przekazanie do Error Logger
     - Logowanie do `generation_error_logs`
     - Zwrócenie 500 Internal Server Error

7. **Zapis do bazy danych** (tylko w przypadku sukcesu):
   - Utworzenie `CreateGenerationCommand`
   - Wywołanie `GenerationsService.create(command)`
   - Supabase Client wykonuje INSERT do tabeli `generations`
   - Zwrócenie `generation_id`

8. **Przygotowanie odpowiedzi**:
   - Utworzenie `CreateGenerationResponseDTO`
   - Wypełnienie `generation_id`, `flashcards_proposals`, `generated_count`
   - Zwrócenie 201 Created

## 6. Względy bezpieczeństwa

### Uwierzytelnianie i autoryzacja

1. **Token-based Authentication**:
   - Wszystkie żądania muszą zawierać prawidłowy token Supabase Auth
   - Token weryfikowany przez middleware/composable `useSupabase`
   - Nieprawidłowy/brakujący token → 401 Unauthorized

2. **Row-Level Security (RLS)**:
   - Tabela `generations` zabezpieczona politykami RLS
   - Użytkownik może zapisywać tylko rekordy ze swoim `user_id`
   - Polityka: `auth.uid() = user_id` dla INSERT
   - Supabase automatycznie wymusza RLS

### Walidacja i sanityzacja danych

1. **Input Validation**:
   - Ścisła walidacja długości `source_text`
   - Sprawdzenie typu danych (string)
   - Walidacja formatu JSON

2. **Hash Computing**:
   - Obliczanie hasha dla audytu i potencjalnej detekcji duplikatów
   - Użycie bezpiecznego algorytmu (SHA-256)
   - Hash nie zawiera wrażliwych danych

3. **API Key Security**:
   - Klucz OpenRouter przechowywany w zmiennych środowiskowych
   - Nigdy nie eksponowany w response/logs dostępnych użytkownikowi
   - Użycie `process.env.OPENROUTER_API_KEY`

### Bezpieczeństwo komunikacji z AI

1. **HTTPS Only**:
   - Wszystkie żądania do OpenRouter przez HTTPS
   - Certyfikaty SSL weryfikowane

2. **Error Message Sanitization**:
   - Szczegółowe błędy logowane tylko do `generation_error_logs`
   - Użytkownik otrzymuje ogólny komunikat błędu
   - Unikanie ujawniania szczegółów implementacji

3. **Timeout Handling**:
   - Ustawienie limitu czasowego dla żądań AI (np. 60 sekund)
   - Zapobieganie zawieszeniu aplikacji

## 7. Obsługa błędów

### Scenariusze błędów i kody statusu

| Scenariusz | Kod | Komunikat dla użytkownika | Akcja systemu |
|------------|-----|---------------------------|---------------|
| Brakujący token autoryzacji | 401 | "Unauthorized" | Brak zapisu w bazie |
| Nieprawidłowy token | 401 | "Invalid authentication token" | Brak zapisu w bazie |
| Brakujące pole source_text | 400 | "source_text is required" | Brak zapisu w bazie |
| source_text za krótki (<1000) | 400 | "source_text must be at least 1000 characters" | Brak zapisu w bazie |
| source_text za długi (>10000) | 400 | "source_text must not exceed 10000 characters" | Brak zapisu w bazie |
| Nieprawidłowy format JSON | 400 | "Invalid request format" | Brak zapisu w bazie |
| Błąd serwisu AI (timeout) | 500 | "AI service timeout. Please try again." | Log do generation_error_logs |
| Błąd serwisu AI (rate limit) | 500 | "Service temporarily unavailable" | Log do generation_error_logs |
| Błąd serwisu AI (inne) | 500 | "Failed to generate flashcards" | Log do generation_error_logs |
| Błąd zapisu do bazy | 500 | "Database error. Please try again." | Log błędu (serwer logs) |
| Błąd parsowania odpowiedzi AI | 500 | "Invalid AI response" | Log do generation_error_logs |

### Logowanie błędów AI

Każdy błąd serwisu AI jest logowany do tabeli `generation_error_logs`:

```typescript
// Przykładowy rekord w generation_error_logs
{
  id: 456,
  user_id: "auth-uuid-here",
  model: "openai/gpt-4",
  source_text_hash: "sha256-hash-here",
  source_text_length: 5000,
  error_code: "OPENROUTER_TIMEOUT",
  error_message: "Request to OpenRouter timed out after 30s",
  created_at: "2025-10-12T10:30:00Z"
}
```

## 8. Rozważania dotyczące wydajności

### Potencjalne wąskie gardła

1. **Wywołanie OpenRouter API**:
   - **Problem**: Zewnętrzne API może być powolne (2-10 sekund)
   - **Wpływ**: Blokowanie żądania użytkownika
   - **Mitygacja**: 
     - Ustawienie odpowiedniego timeout (60s)
     - Rozważenie asynchronicznego przetwarzania dla przyszłych wersji

2. **Zapis do bazy danych**:
   - **Problem**: INSERT do `generations` może być wolny
   - **Wpływ**: Opóźnienie odpowiedzi
   - **Mitygacja**:
     - Indeksy na kolumnie `user_id` (już zaplanowane)
     - Optymalizacja zapytań INSERT

## 9. Etapy wdrożenia

### Faza 1: Przygotowanie struktury (30 min)

1. **Utworzenie pliku endpointu**:
   - Utworzyć `/server/api/generations.post.ts`
   - Zaimportować typy z `/types/dto/types.ts`

2. **Utworzenie struktury serwisów**:
   - Utworzyć `/services/ai/AIService.ts` - serwis do komunikacji z OpenRouter
   - Utworzyć `/services/database/GenerationsService.ts` - serwis do operacji na tabeli generations
   - Utworzyć `/services/database/GenerationErrorLoggerService.ts` - serwis do logowania błędów

3. **Utworzenie modeli pomocniczych**:
   - Dodać modele Command do `/types/dto/types.ts` lub nowego pliku `/types/commands/generation-commands.ts`

### Faza 2: Implementacja walidacji (20 min)

4. **Utworzenie walidatora**:
   - Utworzyć `/server/utils/validators/generation-validator.ts`
   - Implementacja funkcji `validateCreateGenerationRequest(body: any): CreateGenerationRequestDTO`
   - Walidacja:
     - Sprawdzenie obecności `source_text`
     - Sprawdzenie typu (string)
     - Sprawdzenie długości (1000-10000)
     - Rzucanie `ValidationError` w przypadku błędu

5. **Utworzenie klasy błędów**:
   - Utworzyć `utils/errors/custom-errors.ts`
   - Zdefiniować klasy: `ValidationError`, `AIServiceError`, `DatabaseError`

### Faza 3: Implementacja AI Service (45 min)

6. **Konfiguracja OpenRouter**:
   - Dodać `OPENROUTER_API_KEY` do `.env`
   - Dodać `OPENROUTER_API_URL` (https://openrouter.ai/api/v1/chat/completions)
   - Wybrać model (np. `openai/gpt-4o-mini` dla balansu koszt/jakość)

7. **Implementacja AIService.generateFlashcards()**:
   - Przygotowanie promptu dla AI:
     - System prompt: "Jesteś asystentem edukacyjnym. Generuj fiszki na podstawie tekstu."
     - User prompt: "Wygeneruj fiszki z następującego tekstu: {source_text}"
   - Konfiguracja parametrów:
     - temperature: 0.7 (kreatywność)
     - max_tokens: odpowiedni limit
   - Wywołanie HTTP POST do OpenRouter:
     - Headers: `Authorization: Bearer {API_KEY}`, `Content-Type: application/json`
     - Body: zgodny z formatem OpenRouter API
   - Obsługa timeout (60s)
   - Parsowanie odpowiedzi do `FlashcardProposalDTO[]`
   - Walidacja odpowiedzi AI (czy zwrócono właściwy format)
   - Zwrócenie `AIGenerationResult` lub rzucenie `AIServiceError`

8. **Implementacja retry logic** (opcjonalnie):
   - Maksymalnie 2 retry w przypadku timeout/network error
   - Exponential backoff (1s, 2s)

### Faza 4: Implementacja Database Services (30 min)

9. **Implementacja GenerationsService.create()**:
   - Użycie `useSupabase()` do pobrania klienta
   - INSERT do tabeli `generations`:
     ```typescript
     const { data, error } = await supabase
       .from('generations')
       .insert(command)
       .select()
       .single()
     ```
   - Obsługa błędów Supabase
   - Zwrócenie `GenerationDTO`

10. **Implementacja GenerationErrorLoggerService.log()**:
    - INSERT do tabeli `generation_error_logs`
    - Podobna struktura jak powyżej
    - Nie rzucać błędów (logowanie nie powinno przerywać flow)

### Faza 5: Implementacja utils (15 min)

11. **Utworzenie hash utility**:
    - Utworzyć `utils/crypto/hash.ts`
    - Funkcja `computeHash(text: string): string`
    - Użycie Node.js crypto module:
      ```typescript
      import crypto from 'crypto'
      return crypto.createHash('sha256').update(text).digest('hex')
      ```

12. **Utworzenie timer utility**:
    - Utworzyć `utils/timer.ts`
    - Klasa lub funkcje do mierzenia czasu wykonania

### Faza 6: Implementacja głównego endpointu (40 min)

13. **Implementacja `/server/api/generations.post.ts`**:
    - Import wszystkich serwisów i utilities
    - Definicja event handlera
    - Implementacja przepływu:
      1. Uwierzytelnianie (pobranie user_id z Supabase Auth)
      2. Parsowanie i walidacja body
      3. Obliczenie hasha i długości
      4. Rozpoczęcie timera
      5. Wywołanie AI Service (na etapie developmentu skorzystamy z mocków zamiast wywolania serwisu AI.)
      6. Zatrzymanie timera
      7. Zapis do bazy przez GenerationsService
      8. Przygotowanie i zwrócenie odpowiedzi
    - Obsługa wszystkich typów błędów (try-catch)
    - Logowanie błędów AI do generation_error_logs

### Faza 8: Dokumentacja i finalizacja (20 min)

17. **Dokumentacja**:
    - Dodać komentarze JSDoc do funkcji publicznych
    - Zaktualizować README z informacjami o nowym endpointcie
    - Dodać przykłady użycia

