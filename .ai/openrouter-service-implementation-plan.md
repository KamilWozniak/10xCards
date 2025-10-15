# OpenRouter Service Implementation Plan

## 1. Opis usługi

Usługa OpenRouter to uniwersalny composable Nuxt 3 (`useOpenRouter`), który umożliwia wykonywanie requestów do API OpenRouter.ai w celu interakcji z modelami LLM poprzez endpoint `/chat/completions`. Composable planuje obsługę konfiguracji, budowania payloadów z wiadomościami systemowymi i użytkownika, strukturyzowanych odpowiedzi w formacie JSON za pomocą `response_format`, wyboru modelu oraz parametrów modelu. Zaprojektowany dla aplikacji Nuxt 3 z TypeScript, wykorzystuje mechanizmy żądań HTTP. Kluczowe cele: uproszczenie wywołań API, zapewnienie typowania odpowiedzi i obsługa błędów, bez zależności od specyficznej logiki biznesowej.

Composable będzie zaimplementowany w `composables/useOpenRouter.ts`. Domyślny model: 'openai/gpt-4o-mini' dla efektywności. Payloady zgodne ze specyfikacją OpenRouter.

## 2. Opis konstruktora

Composable `useOpenRouter` planuje inicjalizację stanu reaktywnego, ładowanie klucza API z runtime config Nuxt i konfigurację domyślnych opcji. Planuje walidację klucza poprzez sprawdzenie obecności i opcjonalne testowe wywołanie.

- **Konfiguracja**: Opcjonalny obiekt nadpisuje domyślne ustawienia modelu i parametrów.
- **Walidacja**: Sprawdza obecność klucza i weryfikuje połączenie.
- **Integracja**: Używany w komponentach Vue lub server routes.

## 3. Publiczne metody i pola

Composable planuje zwrot reaktywnego stanu i metod publicznych dla łatwego użycia w Composition API.

- **Pola publiczne**:
  - Konfiguracja usługi (bez klucza API).
  - Stan ładowania requestów.
  - Zarządzanie błędami.

- **Metody publiczne**:
  1. Generowanie odpowiedzi na podstawie wiadomości i opcji.
  2. Ogólne wywołanie chat completions z integracją strukturyzowanych odpowiedzi.
  3. Aktualizacja konfiguracji.

Typy zdefiniowane w dedykowanym pliku typów.

## 4. Prywatne metody i pola

Prywatne funkcje planują wewnętrzną logikę obsługującą szczegóły API.

- **Pola prywatne**:
  - Klucz API (lokalny).
  - Domyślne ustawienia.
  - Schemat odpowiedzi.

- **Metody prywatne**:
  1. Budowanie payloadu z wiadomościami i opcjami.
  2. Wykonywanie requestu HTTP.
  3. Parsowanie odpowiedzi.
  4. Obsługa błędów.

## 5. Obsługa błędów

Composable planuje reaktywną obsługę błędów, ustawiając stany błędów i rzucając wyjątki.

- Scenariusze i obsługa:
  1. Błąd autentykacji: Obsługa nieważnego klucza.
  2. Rate limit: Retry z opóźnieniem.
  3. Nieprawidłowy request: Walidacja payloadu.
  4. Błąd serwera: Retry i fallback.
  5. Timeout sieci: Zarządzanie połączeniem.
  6. Błąd parsowania: Fallback do surowej odpowiedzi.
  7. Przekroczenie tokenów: Estymacja limitów.
  8. Przekroczenie quota: Monitorowanie nagłówków.

## 6. Kwestie bezpieczeństwa

- **Klucz API**: Konfiguracja server-only.
- **Dane użytkownika**: Walidacja i sanitizacja inputu.
- **Walidacja**: Schematy dla payloadu i odpowiedzi.
- **CORS/HTTPS**: Wymagane dla API.
- **Audyt**: Logowanie błędów.

## 7. Plan wdrożenia krok po kroku

1. **Przygotowanie środowiska**:
   - Konfiguracja klucza API w runtime config.
   - Instalacja opcjonalnych zależności dla walidacji.

2. **Implementacja composable**:
   - Definicja typów.
   - Utworzenie reaktywnego stanu i metod.

3. **Integracja ogólna**:
   - Użycie w komponentach i routes.
   - Konfiguracja elementów API.

4. **Konfiguracja elementów OpenRouter**:
   - System message: Prepend do wiadomości.
   - User message: Append inputu.
   - Response_format: Strukturyzowany JSON.
   - Nazwa modelu: Domyślna z override.
   - Parametry modelu: Merge opcji.

5. **Obsługa błędów i testy**:
   - Reaktywne zarządzanie błędami.
   - Testy jednostkowe.

6. **Wdrożenie i monitoring**:
   - Commit zmian.
   - Deployment i optymalizacja.
   - Bezpieczeństwo i caching.

Ten plan zapewnia uniwersalną, bezpieczną integrację OpenRouter w Nuxt 3 z TypeScript.
