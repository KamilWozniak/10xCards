# Specyfikacja Techniczna Modułu Autentykacji - 10xCards

## Przegląd

Dokument określa architekturę techniczną systemu autentykacji dla aplikacji 10xCards, obejmującą rejestrację, logowanie, wylogowywanie oraz odzyskiwanie hasła. Implementacja wykorzystuje Supabase Auth jako backend autentykacji w połączeniu z Nuxt 3 i Vue 3.

### Zakres funkcjonalny

- **US-001**: Rejestracja konta użytkownika
- **US-002**: Logowanie do aplikacji
- **US-009**: Bezpieczny dostęp, autoryzacja i wylogowywanie
- **Dodatkowo**: Odzyskiwanie hasła (funkcjonalność uzupełniająca)

### Wymagania techniczne

- Integracja z Supabase Auth dla zarządzania użytkownikami
- Wykorzystanie Nuxt 3 composables do zarządzania sesją
- Middleware do ochrony tras wymagających autentykacji
- Wykorzystanie shadcn-vue dla komponentów UI
- TypeScript dla bezpieczeństwa typów
- Walidacja po stronie klienta i serwera

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Struktura stron i komponentów

#### 1.1.1 Nowe strony w katalogu `pages/`

**`pages/auth/login.vue`**
- Strona logowania użytkownika
- Zawiera formularz logowania (email + hasło)
- Link do strony rejestracji
- Link do strony odzyskiwania hasła
- Pole komunikatów o błędach i sukcesach
- Po pomyślnym logowaniu przekierowuje do `/generate`
- Jeśli użytkownik jest już zalogowany, automatyczne przekierowanie do `/generate`

**`pages/auth/register.vue`**
- Strona rejestracji nowego użytkownika
- Zawiera formularz rejestracji (email + hasło + powtórz hasło)
- Link do strony logowania
- Pole komunikatów o błędach i sukcesach
- Po pomyślnej rejestracji wyświetla komunikat o konieczności potwierdzenia emaila (jeśli włączone) lub automatyczne logowanie i przekierowanie do `/generate`
- Jeśli użytkownik jest już zalogowany, automatyczne przekierowanie do `/generate`

**`pages/auth/forgot-password.vue`**
- Strona odzyskiwania hasła
- Zawiera formularz z polem email
- Po wysłaniu wyświetla komunikat o wysłaniu instrukcji na email
- Link powrotny do strony logowania

**`pages/auth/reset-password.vue`**
- Strona resetowania hasła (dostępna przez link z emaila)
- Zawiera formularz z polami: nowe hasło + powtórz nowe hasło
- Po pomyślnym resecie przekierowuje do `/auth/login` z komunikatem sukcesu

**Modyfikacja `pages/index.vue`**
- Aktualna wersja przekierowuje do `/generate`
- Należy zmodyfikować logikę:
  - Jeśli użytkownik jest zalogowany → przekieruj do `/generate`
  - Jeśli użytkownik NIE jest zalogowany → przekieruj do `/auth/login`

**Modyfikacja `pages/generate.vue`**
- Obecnie brak ochrony autentykacją
- Strona powinna być chroniona middleware autentykacji
- Jeśli użytkownik niezalogowany → przekierowanie do `/auth/login`

#### 1.1.2 Nowe komponenty w katalogu `components/auth/`

**`components/auth/LoginForm.vue`**
- Formularz logowania z polami:
  - Email (input type="email", wymagane)
  - Hasło (input type="password", wymagane)
  - Przycisk "Zaloguj się"
  - Checkbox "Zapamiętaj mnie" (opcjonalne)
- Walidacja po stronie klienta (email format, pola wymagane)
- Wyświetlanie błędów walidacji przy polach
- Stan loading podczas wysyłania
- Emisja eventu `@submit` z danymi formularza
- Wykorzystanie komponentów shadcn-vue: Input, Button, Label, Card

**`components/auth/RegisterForm.vue`**
- Formularz rejestracji z polami:
  - Email (input type="email", wymagane)
  - Hasło (input type="password", wymagane, min 6 znaków)
  - Powtórz hasło (input type="password", wymagane, musi być identyczne)
  - Przycisk "Zarejestruj się"
- Walidacja po stronie klienta:
  - Format email
  - Minimalna długość hasła (6 znaków)
  - Zgodność haseł
  - Siła hasła (opcjonalnie wskaźnik)
- Wyświetlanie błędów walidacji przy polach
- Stan loading podczas wysyłania
- Emisja eventu `@submit` z danymi formularza
- Wykorzystanie komponentów shadcn-vue: Input, Button, Label, Card

**`components/auth/ForgotPasswordForm.vue`**
- Formularz odzyskiwania hasła z polem:
  - Email (input type="email", wymagane)
  - Przycisk "Wyślij instrukcje"
- Walidacja formatu email
- Wyświetlanie błędów walidacji
- Stan loading podczas wysyłania
- Emisja eventu `@submit` z emailem
- Wykorzystanie komponentów shadcn-vue: Input, Button, Label, Card

**`components/auth/ResetPasswordForm.vue`**
- Formularz resetowania hasła z polami:
  - Nowe hasło (input type="password", wymagane, min 6 znaków)
  - Powtórz nowe hasło (input type="password", wymagane, musi być identyczne)
  - Przycisk "Resetuj hasło"
- Walidacja zgodności haseł i minimalnej długości
- Wyświetlanie błędów walidacji
- Stan loading podczas wysyłania
- Emisja eventu `@submit` z nowym hasłem
- Wykorzystanie komponentów shadcn-vue: Input, Button, Label, Card

**`components/auth/AuthErrorDisplay.vue`**
- Komponent do wyświetlania komunikatów błędów autentykacji
- Przyjmuje props: `error` (string | null), `type` ('error' | 'success' | 'info')
- Wyświetla komunikat w odpowiednim stylu (czerwony dla błędów, zielony dla sukcesu)
- Wykorzystanie komponentów shadcn-vue: Alert, AlertDescription

#### 1.1.3 Modyfikacja layoutów w katalogu `layouts/`

**`layouts/default.vue`** (nowy)
- Layout dla stron wymagających autentykacji
- Zawiera:
  - Nawigację górną z logo aplikacji
  - Przycisk wylogowania w prawym górnym rogu
  - Avatar użytkownika (opcjonalnie email lub inicjały)
  - Obszar główny dla `<slot />`
- Wykorzystuje composable `useAuth()` do pobrania danych użytkownika
- Przycisk wylogowania wywołuje metodę wylogowania i przekierowuje do `/auth/login`

**`layouts/auth.vue`** (nowy)
- Layout dla stron autentykacji (login, register, forgot-password, reset-password)
- Minimalistyczny design:
  - Wycentrowany kontener
  - Logo aplikacji u góry
  - Obszar główny dla formularzy `<slot />`
  - Stopka z linkami (opcjonalnie)
- Brak nawigacji i przycisków wylogowania

#### 1.1.4 Komponenty UI do dodania z shadcn-vue

Należy zainstalować następujące komponenty z shadcn-vue (jeśli nie są jeszcze dostępne):
- `Input` - pole tekstowe dla formularzy
- `Label` - etykiety dla pól formularza
- `Alert` / `AlertDescription` - wyświetlanie komunikatów
- `Checkbox` - opcjonalne "Zapamiętaj mnie"

Już dostępne komponenty:
- `Button` - przyciski formularzy
- `Card` / `CardHeader` / `CardTitle` / `CardContent` - kontenery dla formularzy
- `Avatar` / `AvatarFallback` / `AvatarImage` - avatar użytkownika w nawigacji

### 1.2 Routing i nawigacja

#### 1.2.1 Struktura ścieżek

```
/                           → Przekierowanie do /generate (zalogowany) lub /auth/login (niezalogowany)
/generate                   → Chronione middleware, wymaga autentykacji
/auth/login                 → Publiczne, logowanie
/auth/register              → Publiczne, rejestracja
/auth/forgot-password       → Publiczne, odzyskiwanie hasła
/auth/reset-password        → Publiczne (z tokenem w URL), resetowanie hasła
```

#### 1.2.2 Middleware autentykacji

**`middleware/auth.ts`** (nowy)
- Middleware chronione trasy wymagające zalogowania
- Sprawdza czy użytkownik jest zalogowany (poprzez composable `useAuth()`)
- Jeśli NIE jest zalogowany → przekierowanie do `/auth/login` z parametrem `redirect` zawierającym oryginalny URL
- Jeśli jest zalogowany → pozwól na dostęp

**`middleware/guest.ts`** (nowy)
- Middleware dla stron dostępnych tylko dla niezalogowanych (login, register)
- Sprawdza czy użytkownik jest zalogowany
- Jeśli jest zalogowany → przekierowanie do `/generate`
- Jeśli NIE jest zalogowany → pozwól na dostęp

### 1.3 Scenariusze użytkownika i przepływy

#### 1.3.1 Scenariusz: Rejestracja (US-001)

1. Użytkownik wchodzi na `/auth/register`
2. Wypełnia formularz (email, hasło, powtórz hasło)
3. Kliknięcie "Zarejestruj się" → walidacja client-side
4. Jeśli walidacja OK → wywołanie `useAuth().signUp(email, password)`
5. Supabase tworzy użytkownika i wysyła email weryfikacyjny (jeśli włączone)
6. Obsługa odpowiedzi:
   - **Sukces**: Wyświetlenie komunikatu "Sprawdź email i potwierdź rejestrację" lub automatyczne zalogowanie (zależnie od konfiguracji Supabase)
   - **Błąd**: Wyświetlenie komunikatu błędu (np. "Email już istnieje", "Hasło za słabe")
7. Po potwierdzeniu emaila (jeśli wymagane) użytkownik może się zalogować

#### 1.3.2 Scenariusz: Logowanie (US-002)

1. Użytkownik wchodzi na `/auth/login`
2. Wypełnia formularz (email, hasło)
3. Kliknięcie "Zaloguj się" → walidacja client-side
4. Jeśli walidacja OK → wywołanie `useAuth().signIn(email, password)`
5. Supabase weryfikuje dane logowania
6. Obsługa odpowiedzi:
   - **Sukces**: Przekierowanie do `/generate` (lub URL z parametru `redirect`)
   - **Błąd**: Wyświetlenie komunikatu "Nieprawidłowy email lub hasło"

#### 1.3.3 Scenariusz: Wylogowanie (US-009)

1. Zalogowany użytkownik klika przycisk "Wyloguj" w prawym górnym rogu (w layoutcie `default`)
2. Wywołanie `useAuth().signOut()`
3. Supabase kończy sesję użytkownika
4. Czyszczenie lokalnego stanu (user, session)
5. Przekierowanie do `/auth/login`

#### 1.3.4 Scenariusz: Odzyskiwanie hasła

1. Użytkownik wchodzi na `/auth/forgot-password`
2. Wprowadza email
3. Kliknięcie "Wyślij instrukcje" → wywołanie `useAuth().resetPasswordRequest(email)`
4. Supabase wysyła email z linkiem resetowania
5. Wyświetlenie komunikatu "Sprawdź email z instrukcjami resetowania hasła"
6. Użytkownik klika link w emailu → przekierowanie do `/auth/reset-password?token=...`
7. Wprowadza nowe hasło
8. Kliknięcie "Resetuj hasło" → wywołanie `useAuth().resetPassword(token, newPassword)`
9. Obsługa odpowiedzi:
   - **Sukces**: Przekierowanie do `/auth/login` z komunikatem "Hasło zostało zmienione"
   - **Błąd**: Wyświetlenie komunikatu błędu (np. "Token wygasł", "Hasło za słabe")

### 1.4 Walidacja i komunikaty błędów

#### 1.4.1 Walidacja client-side

**Formularz logowania:**
- Email: wymagane, format email
- Hasło: wymagane, min 1 znak

Komunikaty błędów:
- "Email jest wymagany"
- "Nieprawidłowy format email"
- "Hasło jest wymagane"

**Formularz rejestracji:**
- Email: wymagane, format email
- Hasło: wymagane, min 6 znaków
- Powtórz hasło: wymagane, musi być identyczne z hasłem

Komunikaty błędów:
- "Email jest wymagany"
- "Nieprawidłowy format email"
- "Hasło jest wymagane"
- "Hasło musi mieć minimum 6 znaków"
- "Hasła nie są identyczne"

**Formularz odzyskiwania hasła:**
- Email: wymagane, format email

Komunikaty błędów:
- "Email jest wymagany"
- "Nieprawidłowy format email"

**Formularz resetowania hasła:**
- Nowe hasło: wymagane, min 6 znaków
- Powtórz nowe hasło: wymagane, musi być identyczne

Komunikaty błędów:
- "Hasło jest wymagane"
- "Hasło musi mieć minimum 6 znaków"
- "Hasła nie są identyczne"

#### 1.4.2 Komunikaty błędów z Supabase Auth

Należy stworzyć mapowanie błędów Supabase na przyjazne komunikaty po polsku:

| Kod błędu Supabase | Komunikat polski |
|-------------------|------------------|
| `invalid_credentials` | "Nieprawidłowy email lub hasło" |
| `email_exists` | "Użytkownik z tym adresem email już istnieje" |
| `weak_password` | "Hasło jest za słabe. Użyj minimum 6 znaków" |
| `invalid_email` | "Nieprawidłowy format adresu email" |
| `user_not_found` | "Nie znaleziono użytkownika z tym adresem email" |
| `email_not_confirmed` | "Email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową" |
| `over_email_send_rate_limit` | "Wysłano zbyt wiele emaili. Spróbuj ponownie później" |
| Domyślny | "Wystąpił błąd. Spróbuj ponownie później" |

#### 1.4.3 Komunikaty sukcesu

| Akcja | Komunikat |
|-------|-----------|
| Rejestracja (z weryfikacją email) | "Konto zostało utworzone. Sprawdź email i potwierdź rejestrację" |
| Rejestracja (bez weryfikacji) | "Konto zostało utworzone pomyślnie" |
| Logowanie | Przekierowanie bez komunikatu |
| Wylogowanie | Przekierowanie bez komunikatu |
| Wysłanie emaila resetującego | "Instrukcje resetowania hasła zostały wysłane na podany email" |
| Reset hasła | "Hasło zostało zmienione pomyślnie" |

### 1.5 Podział odpowiedzialności frontend vs backend

#### 1.5.1 Frontend (komponenty i strony Nuxt)

**Odpowiedzialności:**
- Renderowanie formularzy autentykacji
- Walidacja client-side (format email, długość hasła, zgodność haseł)
- Zarządzanie stanem formularzy (loading, błędy, dane)
- Wyświetlanie komunikatów błędów i sukcesu
- Nawigacja i przekierowania po akcjach
- Przechowywanie stanu sesji użytkownika (via composable)
- Renderowanie layout'ów z nawigacją i przyciskiem wylogowania

**NIE odpowiada za:**
- Weryfikację danych logowania (delegacja do Supabase)
- Tworzenie użytkowników w bazie danych (delegacja do Supabase)
- Wysyłanie emaili weryfikacyjnych/resetujących (delegacja do Supabase)
- Zarządzanie tokenami JWT (delegacja do Supabase SDK)

#### 1.5.2 Backend (Supabase Auth)

**Odpowiedzialności:**
- Tworzenie użytkowników w tabeli `auth.users`
- Weryfikacja danych logowania (email + hasło)
- Generowanie i walidacja tokenów JWT
- Wysyłanie emaili weryfikacyjnych
- Wysyłanie emaili z linkiem resetowania hasła
- Walidacja tokenów resetowania hasła
- Zarządzanie sesjami użytkowników
- Hashowanie i przechowywanie haseł

**NIE odpowiada za:**
- Renderowanie formularzy (frontend)
- Walidację client-side (frontend)
- Nawigację aplikacji (frontend)

#### 1.5.3 Middleware Nuxt (server-side)

**Odpowiedzialności:**
- Weryfikacja tokenów JWT przy żądaniach do chronionych endpointów API
- Pobieranie `user_id` z tokenu JWT (aktualizacja `server/utils/auth/get-user-id.ts`)
- Zwracanie błędów 401 Unauthorized przy braku tokenu lub nieprawidłowym tokenie

**NIE odpowiada za:**
- Logikę autentykacji (Supabase)
- Renderowanie UI (frontend)

---

## 2. LOGIKA BACKENDOWA

### 2.1 Aktualizacja endpointów API

Wszystkie istniejące endpointy (`/api/flashcards`, `/api/generations`) już korzystają z funkcji `getUserId()` do weryfikacji autentykacji. Należy zaktualizować implementację tej funkcji.

#### 2.1.1 Aktualizacja `server/utils/auth/get-user-id.ts`

**Obecna implementacja:**
- Zwraca hardkodowany UUID użytkownika testowego

**Nowa implementacja:**
- Pobiera token JWT z nagłówka `Authorization` żądania HTTP
- Weryfikuje token za pomocą Supabase Auth
- Wyciąga `user_id` z tokenu
- Zwraca `user_id` lub rzuca błąd `UnauthorizedError`

**Pseudokod:**
```typescript
export async function getUserId(event: H3Event): Promise<string> {
  // 1. Pobierz token z nagłówka Authorization: "Bearer <token>"
  // 2. Jeśli brak tokenu → rzuć UnauthorizedError
  // 3. Zweryfikuj token za pomocą Supabase client
  // 4. Jeśli token nieprawidłowy/wygasły → rzuć UnauthorizedError
  // 5. Pobierz user_id z tokenu
  // 6. Zwróć user_id
}
```

### 2.2 Nowe typy błędów

#### 2.2.1 Aktualizacja `server/utils/errors/custom-errors.ts`

Dodać nowy typ błędu:

**`UnauthorizedError`**
- Kod HTTP: 401
- Wykorzystywany gdy brak tokenu lub token nieprawidłowy
- Message: "Unauthorized - authentication required"

### 2.3 Walidacja żądań

Istniejące validatory (`flashcard-validator`, `generation-validator`) nie wymagają zmian, ponieważ `user_id` jest pobierany z tokenu, a nie z body żądania.

### 2.4 Brak nowych endpointów API

Wszystkie operacje autentykacji (rejestracja, logowanie, wylogowanie, reset hasła) są obsługiwane przez Supabase Auth SDK po stronie klienta. Nie ma potrzeby tworzenia dodatkowych endpointów `/api/auth/*`.

**Uzasadnienie:**
- Supabase SDK zapewnia wszystkie niezbędne metody po stronie klienta
- Komunikacja odbywa się bezpośrednio między klientem a Supabase Auth API
- Tokeny JWT są automatycznie zarządzane przez SDK
- Endpointy w `/server/api/` wymagają jedynie weryfikacji tokenu (przez zaktualizowaną funkcję `getUserId`)

### 2.5 Obsługa wyjątków

#### 2.5.1 W endpointach API

Wszystkie istniejące endpointy już obsługują błędy autentykacji:
```typescript
const userId = getUserId(event)
if (!userId) {
  setResponseStatus(event, 401)
  return { error: 'Unauthorized', details: 'Authentication token is required' }
}
```

Po aktualizacji `getUserId()` do rzucania `UnauthorizedError`, należy:
- Obudować wywołanie w try-catch
- Złapać `UnauthorizedError`
- Zwrócić odpowiedź 401 z odpowiednim komunikatem

#### 2.5.2 W middleware

Middleware `auth.ts` i `guest.ts` obsługują wyjątki związane z brakiem sesji lub nieprawidłowym tokenem poprzez przekierowanie użytkownika do odpowiednich stron.

---

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja z Supabase Auth

#### 3.1.1 Konfiguracja Supabase

**Wymagane kroki konfiguracyjne:**

1. **Email Templates (w Supabase Dashboard)**
   - Szablon emaila weryfikacyjnego (confirmation email)
   - Szablon emaila resetowania hasła (password reset email)
   - Dostosowanie szablonów do języka polskiego (opcjonalnie)

2. **Auth Settings (w Supabase Dashboard)**
   - Włączenie/wyłączenie wymogu potwierdzenia emaila (`Enable email confirmations`)
   - Konfiguracja URL przekierowań:
     - Site URL: `http://localhost:3000` (dev) / `https://yourdomain.com` (prod)
     - Redirect URLs: 
       - `http://localhost:3000/auth/reset-password` (dev)
       - `https://yourdomain.com/auth/reset-password` (prod)
   - Minimalna długość hasła: 6 znaków
   - Włączenie rejestracji (`Enable sign ups`)

3. **Polityki RLS (Row Level Security)**
   - Już zaimplementowane w migracji `20251009120000_initial_schema.sql`
   - Korzystają z `auth.uid()` do weryfikacji właściciela zasobów
   - Nie wymagają zmian

#### 3.1.2 Zmienne środowiskowe

**W pliku `.env`:**
```
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your-anon-key
```

Te zmienne są już skonfigurowane w `nuxt.config.ts` w sekcji `runtimeConfig.public`.

#### 3.1.3 Supabase Client - composable

**Obecna implementacja `composables/useSupabase.ts`:**
- Tworzy klienta Supabase bez zarządzania sesją auth
- Używany głównie do operacji bazodanowych

**Nowa implementacja:**
Należy rozszerzyć aby obsługiwał zarządzanie sesją:
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'

export const useSupabase = () => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseKey = config.public.supabaseKey as string

  // Inicjalizacja klienta z obsługą localStorage dla sesji
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })

  return { supabase }
}
```

### 3.2 Composable autentykacji - `useAuth()`

#### 3.2.1 Lokalizacja i struktura

**Plik:** `composables/useAuth.ts`

**Odpowiedzialności:**
- Zarządzanie stanem użytkownika (user, session)
- Metody autentykacji (signUp, signIn, signOut, resetPassword)
- Obsługa błędów i mapowanie na komunikaty po polsku
- Pobieranie i odświeżanie sesji
- Nasłuchiwanie zmian stanu autentykacji (onAuthStateChange)

#### 3.2.2 Stan

Composable przechowuje:
- `user` (Ref<User | null>) - obiekt użytkownika Supabase
- `session` (Ref<Session | null>) - obiekt sesji Supabase
- `isAuthenticated` (ComputedRef<boolean>) - czy użytkownik jest zalogowany
- `loading` (Ref<boolean>) - czy trwa operacja autentykacji
- `error` (Ref<string | null>) - komunikat błędu

#### 3.2.3 Metody

**`signUp(email: string, password: string): Promise<void>`**
- Wywołuje `supabase.auth.signUp({ email, password })`
- Obsługuje odpowiedź:
  - Sukces: aktualizuje `user` i `session`, ustawia `error` na null
  - Błąd: mapuje błąd Supabase na polski komunikat, ustawia `error`
- Zwraca Promise (można await w komponencie)

**`signIn(email: string, password: string): Promise<void>`**
- Wywołuje `supabase.auth.signInWithPassword({ email, password })`
- Obsługuje odpowiedź:
  - Sukces: aktualizuje `user` i `session`, ustawia `error` na null
  - Błąd: mapuje błąd Supabase na polski komunikat, ustawia `error`
- Zwraca Promise

**`signOut(): Promise<void>`**
- Wywołuje `supabase.auth.signOut()`
- Czyści `user` i `session`
- Przekierowuje do `/auth/login`
- Zwraca Promise

**`resetPasswordRequest(email: string): Promise<void>`**
- Wywołuje `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/reset-password' })`
- Obsługuje odpowiedź:
  - Sukces: ustawia komunikat sukcesu
  - Błąd: mapuje błąd Supabase na polski komunikat
- Zwraca Promise

**`resetPassword(newPassword: string): Promise<void>`**
- Wywołuje `supabase.auth.updateUser({ password: newPassword })`
- Wymaga aktywnej sesji z tokenu resetowania (Supabase automatycznie loguje użytkownika po kliknięciu w link)
- Obsługuje odpowiedź:
  - Sukces: aktualizuje hasło, przekierowuje do logowania
  - Błąd: mapuje błąd Supabase na polski komunikat
- Zwraca Promise

**`initializeAuth(): Promise<void>`**
- Wywołuje `supabase.auth.getSession()` aby pobrać aktualną sesję
- Aktualizuje `user` i `session` jeśli sesja istnieje
- Nasłuchuje zmian stanu autentykacji: `supabase.auth.onAuthStateChange((event, session) => { ... })`
- Wywoływane przy inicjalizacji aplikacji (w plugin lub layout)

**`getAccessToken(): string | null`**
- Zwraca token JWT z sesji: `session.value?.access_token ?? null`
- Używane przy ręcznych wywołaniach API (opcjonalnie, SDK automatycznie dołącza token)

#### 3.2.4 Mapowanie błędów Supabase

Funkcja pomocnicza wewnątrz composable:
```typescript
function mapSupabaseError(error: any): string {
  const errorMessages: Record<string, string> = {
    'invalid_credentials': 'Nieprawidłowy email lub hasło',
    'email_exists': 'Użytkownik z tym adresem email już istnieje',
    'weak_password': 'Hasło jest za słabe. Użyj minimum 6 znaków',
    'invalid_email': 'Nieprawidłowy format adresu email',
    'user_not_found': 'Nie znaleziono użytkownika z tym adresem email',
    'email_not_confirmed': 'Email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową',
    'over_email_send_rate_limit': 'Wysłano zbyt wiele emaili. Spróbuj ponownie później',
  }
  
  return errorMessages[error?.message] || 'Wystąpił błąd. Spróbuj ponownie później'
}
```

### 3.3 Inicjalizacja autentykacji w aplikacji

#### 3.3.1 Plugin autentykacji

**Plik:** `plugins/auth.client.ts`

**Odpowiedzialności:**
- Inicjalizacja composable `useAuth()`
- Wywołanie `initializeAuth()` przy starcie aplikacji
- Nasłuchiwanie zmian stanu autentykacji (session change)

**Pseudokod:**
```typescript
export default defineNuxtPlugin(async () => {
  const auth = useAuth()
  
  // Pobierz aktualną sesję z localStorage
  await auth.initializeAuth()
  
  // Plugin nie zwraca nic, composable jest dostępny globalnie
})
```

### 3.4 Ochrona tras (middleware)

#### 3.4.1 Middleware `auth.ts`

**Lokalizacja:** `middleware/auth.ts`

**Logika:**
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuth()
  
  if (!auth.isAuthenticated.value) {
    // Zapisz URL do przekierowania po zalogowaniu
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath }
    })
  }
})
```

**Użycie:** Dodanie w `pages/generate.vue`:
```typescript
definePageMeta({
  middleware: 'auth'
})
```

#### 3.4.2 Middleware `guest.ts`

**Lokalizacja:** `middleware/guest.ts`

**Logika:**
```typescript
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth()
  
  if (auth.isAuthenticated.value) {
    return navigateTo('/generate')
  }
})
```

**Użycie:** Dodanie w `pages/auth/login.vue`, `pages/auth/register.vue`:
```typescript
definePageMeta({
  middleware: 'guest',
  layout: 'auth'
})
```

### 3.5 Integracja z istniejącymi endpointami API

#### 3.5.1 Automatyczne dołączanie tokenu JWT

Supabase SDK automatycznie dołącza token JWT do wszystkich żądań wykonywanych przez `supabase.from(...)`. 

**Problem:** Istniejące endpointy (`/api/flashcards`, `/api/generations`) są wywoływane przez `$fetch()` z frontendu, więc token nie jest automatycznie dołączany.

**Rozwiązanie:** Stworzyć wrapper dla `$fetch()` który automatycznie dołącza token:

**Plik:** `composables/useApi.ts`

**Pseudokod:**
```typescript
export const useApi = () => {
  const auth = useAuth()
  
  const apiFetch = $fetch.create({
    onRequest({ options }) {
      const token = auth.getAccessToken()
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      }
    }
  })
  
  return { apiFetch }
}
```

**Użycie w composables:**
W `useGenerationState.ts` zamiast `$fetch('/api/generations', ...)` użyć `apiFetch('/api/generations', ...)`.

#### 3.5.2 Aktualizacja `server/utils/auth/get-user-id.ts`

**Nowa implementacja:**
```typescript
import type { H3Event } from 'h3'
import { UnauthorizedError } from '~/server/utils/errors/custom-errors'

export async function getUserId(event: H3Event): Promise<string> {
  // 1. Pobierz token z nagłówka Authorization
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header')
  }
  
  const token = authHeader.substring(7) // usuń "Bearer "
  
  // 2. Zweryfikuj token za pomocą Supabase
  const { supabase } = useSupabase()
  const { data, error } = await supabase.auth.getUser(token)
  
  if (error || !data?.user) {
    throw new UnauthorizedError('Invalid or expired token')
  }
  
  // 3. Zwróć user_id
  return data.user.id
}
```

**Uwaga:** Funkcja `useSupabase()` w kontekście server-side może wymagać dostosowania do tworzenia klienta bez localStorage (tylko weryfikacja tokenu).

#### 3.5.3 Alternatywne podejście dla server-side

Zamiast używać `useSupabase()` w server-side, można użyć bezpośrednio `createClient` z konfiguracją server-side:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'

export async function getUserId(event: H3Event): Promise<string> {
  const config = useRuntimeConfig()
  const supabase = createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )
  
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing authorization token')
  }
  
  const token = authHeader.substring(7)
  
  const { data, error } = await supabase.auth.getUser(token)
  
  if (error || !data?.user) {
    throw new UnauthorizedError('Invalid or expired token')
  }
  
  return data.user.id
}
```

### 3.6 Zarządzanie sesją i tokenami

#### 3.6.1 Automatyczne odświeżanie tokenów

Supabase SDK automatycznie odświeża tokeny JWT gdy zbliża się ich wygaśnięcie (domyślnie tokeny wygasają po 1 godzinie, ale są odświeżane automatycznie).

Konfiguracja w `useSupabase()`:
```typescript
{
  auth: {
    autoRefreshToken: true, // automatyczne odświeżanie
    persistSession: true,   // zapis sesji w localStorage
  }
}
```

#### 3.6.2 Persystencja sesji

Sesja jest przechowywana w `localStorage` przeglądarki. Po odświeżeniu strony sesja jest automatycznie przywracana.

#### 3.6.3 Obsługa wygasłych tokenów

Gdy token wygaśnie i nie może być odświeżony (np. po długim czasie bezczynności):
- Event `SIGNED_OUT` jest emitowany przez `onAuthStateChange`
- Composable `useAuth()` czyści stan użytkownika
- Middleware przekierowuje do `/auth/login`

### 3.7 Przepływ danych autentykacji

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REJESTRACJA                                 │
└─────────────────────────────────────────────────────────────────────┘
User → RegisterForm → pages/auth/register.vue → useAuth().signUp()
  → Supabase Auth API → Email weryfikacyjny wysłany
  → User klika link → Email potwierdzony → User może się zalogować

┌─────────────────────────────────────────────────────────────────────┐
│                         LOGOWANIE                                   │
└─────────────────────────────────────────────────────────────────────┘
User → LoginForm → pages/auth/login.vue → useAuth().signIn()
  → Supabase Auth API → Weryfikacja email/hasło
  → Zwrot: user + session + access_token (JWT)
  → useAuth() zapisuje user/session
  → Token zapisany w localStorage (przez SDK)
  → Przekierowanie do /generate

┌─────────────────────────────────────────────────────────────────────┐
│                    DOSTĘP DO CHRONIONEJ TRASY                       │
└─────────────────────────────────────────────────────────────────────┘
User → /generate → middleware/auth.ts → useAuth().isAuthenticated
  → Tak: pozwól na dostęp
  → Nie: przekieruj do /auth/login

┌─────────────────────────────────────────────────────────────────────┐
│                    WYWOŁANIE API (np. /api/flashcards)              │
└─────────────────────────────────────────────────────────────────────┘
Frontend → useApi().apiFetch('/api/flashcards')
  → Dodanie nagłówka: Authorization: Bearer <JWT>
  → Server endpoint → getUserId(event)
  → Weryfikacja tokenu przez Supabase
  → Zwrot user_id
  → Wykonanie operacji (RLS policies weryfikują auth.uid() = user_id)
  → Zwrot danych do frontendu

┌─────────────────────────────────────────────────────────────────────┐
│                         WYLOGOWANIE                                 │
└─────────────────────────────────────────────────────────────────────┘
User → Przycisk Wyloguj (layout/default.vue) → useAuth().signOut()
  → Supabase Auth API → Zakończenie sesji
  → Czyszczenie localStorage
  → Czyszczenie user/session w composable
  → Przekierowanie do /auth/login
```

---

## 4. DODATKOWE KWESTIE IMPLEMENTACYJNE

### 4.1 Typy TypeScript

#### 4.1.1 Typy użytkownika i sesji

Supabase SDK dostarcza typy:
- `User` - obiekt użytkownika
- `Session` - obiekt sesji (zawiera access_token, refresh_token, user)
- `AuthError` - obiekt błędu autentykacji

Import:
```typescript
import type { User, Session, AuthError } from '@supabase/supabase-js'
```

#### 4.1.2 Nowe typy dla formularzy

**Plik:** `types/auth/auth.types.ts`

```typescript
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
}

export interface ResetPasswordCredentials {
  newPassword: string
  confirmNewPassword: string
}

export interface ForgotPasswordData {
  email: string
}
```

### 4.2 Composable walidacji formularzy

Istniejący `composables/useFormValidation.ts` może być wykorzystany lub rozszerzony dla formularzy autentykacji.

**Dodatkowe funkcje walidacji:**
- `validateEmail(email: string): string | null` - zwraca błąd lub null
- `validatePassword(password: string, minLength = 6): string | null`
- `validatePasswordMatch(password: string, confirmPassword: string): string | null`

### 4.3 Testy

#### 4.3.1 Testy jednostkowe composable `useAuth()`

Testy powinny weryfikować:
- Poprawne wywołanie metod Supabase SDK
- Aktualizację stanu po sukcesie/błędzie
- Mapowanie błędów Supabase na polskie komunikaty

**Plik:** `composables/__tests__/useAuth.spec.ts`

#### 4.3.2 Testy komponentów formularzy

Testy powinny weryfikować:
- Walidację pól formularza
- Wyświetlanie komunikatów błędów
- Emisję eventów po wypełnieniu formularza
- Stan loading podczas wysyłania

**Pliki:**
- `components/auth/__tests__/LoginForm.spec.ts`
- `components/auth/__tests__/RegisterForm.spec.ts`
- `components/auth/__tests__/ForgotPasswordForm.spec.ts`
- `components/auth/__tests__/ResetPasswordForm.spec.ts`

#### 4.3.3 Testy middleware

Testy powinny weryfikować:
- Przekierowanie niezalogowanych użytkowników z chronionych tras
- Przekierowanie zalogowanych użytkowników ze stron auth
- Zachowanie parametru `redirect` w URL

**Pliki:**
- `middleware/__tests__/auth.spec.ts`
- `middleware/__tests__/guest.spec.ts`

### 4.4 Migracje bazy danych

Tabela `auth.users` jest zarządzana przez Supabase Auth i nie wymaga dodatkowych migracji. Wszystkie istniejące tabele (`flashcards`, `generations`, `generation_error_logs`) już mają relacje do `auth.users(id)` z kaskadowym usuwaniem.

**Brak dodatkowych migracji.**

### 4.5 Zgodność z RODO (US-009)

#### 4.5.1 Usuwanie konta użytkownika

Supabase umożliwia usunięcie użytkownika przez Admin API. W MVP można to zrobić manualnie przez Dashboard.

**W przyszłości:** Dodanie endpointu `/api/user/delete` który:
1. Weryfikuje autentykację użytkownika
2. Usuwa użytkownika z `auth.users` (cascade usuwa wszystkie powiązane dane)
3. Wylogowuje użytkownika

#### 4.5.2 Kaskadowe usuwanie danych

Już zaimplementowane w migracji:
```sql
user_id uuid not null references auth.users(id) on delete cascade
```

Usunięcie użytkownika z `auth.users` automatycznie usuwa:
- Wszystkie fiszki użytkownika
- Wszystkie sesje generowania
- Wszystkie logi błędów

### 4.6 Bezpieczeństwo

#### 4.6.1 Row Level Security (RLS)

Już zaimplementowane polityki RLS w migracji:
```sql
create policy "users can select own flashcards"
  on flashcards for select
  to authenticated
  using (auth.uid() = user_id);
```

RLS automatycznie weryfikuje że `auth.uid()` (user_id z tokenu JWT) odpowiada `user_id` w rekordzie. Użytkownik może dostęp tylko do swoich danych.

#### 4.6.2 Hashowanie haseł

Supabase Auth automatycznie hashuje hasła używając bcrypt. Hasła nigdy nie są przechowywane w plain text.

#### 4.6.3 HTTPS

W produkcji aplikacja powinna być hostowana przez HTTPS. Supabase wymaga HTTPS dla production URLs.

#### 4.6.4 Rate limiting

Supabase Auth ma wbudowane rate limiting dla:
- Logowania (max 5 prób na IP w ciągu 5 minut)
- Rejestracji (max 3 rejestracje na IP w ciągu godziny)
- Emaili resetujących (max 5 emaili na godzinę)

### 4.7 Obsługa edge cases

#### 4.7.1 Email nie potwierdzony

Jeśli włączony jest wymóg potwierdzenia emaila:
- Po rejestracji użytkownik nie może się zalogować do momentu potwierdzenia
- Przy próbie logowania Supabase zwraca błąd `email_not_confirmed`
- Aplikacja wyświetla komunikat: "Email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową"

**Rozwiązanie:** Dodanie przycisku "Wyślij ponownie email weryfikacyjny" na stronie logowania (opcjonalnie).

#### 4.7.2 Token resetowania wygasły

Tokeny resetowania hasła wygasają po 1 godzinie (domyślnie w Supabase).
- Jeśli użytkownik kliknie link po wygaśnięciu → błąd przy `updateUser()`
- Aplikacja wyświetla komunikat: "Link resetowania hasła wygasł. Poproś o nowy link"
- Użytkownik musi ponownie przejść przez proces "Zapomniałem hasła"

#### 4.7.3 Użytkownik już zalogowany próbuje wejść na /auth/login

Middleware `guest.ts` przekierowuje do `/generate`.

#### 4.7.4 Użytkownik niezalogowany próbuje wejść na /generate

Middleware `auth.ts` przekierowuje do `/auth/login?redirect=/generate`.

#### 4.7.5 Duplikacja adresu email przy rejestracji

Supabase zwraca błąd `email_exists`. Aplikacja wyświetla: "Użytkownik z tym adresem email już istnieje".

#### 4.7.6 Sesja wygasła podczas korzystania z aplikacji

- SDK automatycznie próbuje odświeżyć token
- Jeśli odświeżenie nie powiedzie się → event `SIGNED_OUT`
- Composable `useAuth()` czyści stan
- Przy następnym żądaniu API → błąd 401
- Middleware przekierowuje do `/auth/login`

---

## 5. PLAN IMPLEMENTACJI (SUGEROWANA KOLEJNOŚĆ)

### Faza 1: Backend i autentykacja bazowa
1. Dodanie typu `UnauthorizedError` w `server/utils/errors/custom-errors.ts`
2. Aktualizacja `server/utils/auth/get-user-id.ts` do weryfikacji JWT
3. Aktualizacja `composables/useSupabase.ts` dla obsługi sesji auth
4. Utworzenie `composables/useAuth.ts` z metodami autentykacji
5. Utworzenie `composables/useApi.ts` dla automatycznego dołączania tokenu
6. Utworzenie `plugins/auth.client.ts` dla inicjalizacji auth
7. Testy jednostkowe dla `useAuth()`

### Faza 2: Routing i middleware
8. Utworzenie `middleware/auth.ts` dla ochrony tras
9. Utworzenie `middleware/guest.ts` dla stron publicznych
10. Testy middleware
11. Aktualizacja `pages/index.vue` z logiką przekierowania
12. Dodanie middleware do `pages/generate.vue`

### Faza 3: UI komponenty formularzy
13. Instalacja brakujących komponentów shadcn-vue (Input, Label, Alert)
14. Utworzenie `components/auth/AuthErrorDisplay.vue`
15. Utworzenie `components/auth/LoginForm.vue`
16. Utworzenie `components/auth/RegisterForm.vue`
17. Utworzenie `components/auth/ForgotPasswordForm.vue`
18. Utworzenie `components/auth/ResetPasswordForm.vue`
19. Testy jednostkowe komponentów formularzy

### Faza 4: Strony autentykacji
20. Utworzenie `layouts/auth.vue`
21. Utworzenie `layouts/default.vue` z nawigacją i wylogowaniem
22. Utworzenie `pages/auth/login.vue`
23. Utworzenie `pages/auth/register.vue`
24. Utworzenie `pages/auth/forgot-password.vue`
25. Utworzenie `pages/auth/reset-password.vue`

### Faza 5: Integracja z istniejącym kodem
26. Aktualizacja `useGenerationState.ts` do użycia `useApi()`
27. Aktualizacja wszystkich wywołań API w composables
28. Dodanie layoutu `default` do `pages/generate.vue`
29. Aktualizacja endpointów API do obsługi `UnauthorizedError`

### Faza 6: Konfiguracja Supabase
30. Konfiguracja Auth Settings w Supabase Dashboard
31. Dostosowanie szablonów emaili (opcjonalnie)
32. Testowanie przepływu rejestracji end-to-end
33. Testowanie przepływu logowania end-to-end
34. Testowanie przepływu resetowania hasła end-to-end

### Faza 7: Testy integracyjne i poprawki
35. Testy E2E dla wszystkich scenariuszy autentykacji
36. Testy obsługi błędów
37. Testy middleware w różnych scenariuszach
38. Poprawki błędów i edge cases
39. Weryfikacja komunikatów błędów w języku polskim

### Faza 8: Dokumentacja
40. Aktualizacja README z instrukcjami konfiguracji auth
41. Dokumentacja zmiennych środowiskowych
42. Dokumentacja API (aktualizacja istniejących plików w `/docs/api/`)

---

## 6. POTENCJALNE WYZWANIA I ROZWIĄZANIA

### Wyzwanie 1: Server-side rendering (SSR) i sesja użytkownika

**Problem:** Nuxt 3 renderuje strony po stronie serwera. Token JWT jest przechowywany w localStorage (tylko client-side).

**Rozwiązanie:** 
- Użycie `.client.ts` dla plugin autentykacji (tylko client-side)
- Middleware działa po stronie klienta (route guards wykonywane w przeglądarce)
- SSR renderuje stronę bez informacji o użytkowniku, następnie client-side hydration aktualizuje stan
- Alternatywnie: cookies dla przechowywania tokenu (bardziej zaawansowane, wykracza poza MVP)

### Wyzwanie 2: Synchronizacja stanu autentykacji między zakładkami

**Problem:** Użytkownik loguje się w jednej zakładce, inna zakładka nie wie o tym.

**Rozwiązanie:**
- Supabase SDK automatycznie nasłuchuje zmian w localStorage
- Event `onAuthStateChange` jest emitowany we wszystkich zakładkach
- Composable `useAuth()` aktualizuje stan we wszystkich instancjach

### Wyzwanie 3: Wyścig (race condition) między middleware a inicjalizacją auth

**Problem:** Middleware sprawdza `isAuthenticated` zanim plugin auth załaduje sesję z localStorage.

**Rozwiązanie:**
- Plugin auth wykonuje się przed montowaniem aplikacji
- Middleware wykonuje się po inicjalizacji (podczas nawigacji)
- Jeśli pojawi się problem: dodać await w middleware na inicjalizację auth

### Wyzwanie 4: Testowanie z mockowanym Supabase

**Problem:** Testy jednostkowe wymagają mockowania Supabase SDK.

**Rozwiązanie:**
- Użycie Vitest z mockami dla `@supabase/supabase-js`
- Mockowanie metod `auth.signIn()`, `auth.signUp()`, etc.
- Testowanie logiki composable niezależnie od Supabase

---

## 7. CHECKLISTY WERYFIKACYJNE

### Checklist: Rejestracja (US-001)

- [ ] Strona `/auth/register` istnieje i renderuje się poprawnie
- [ ] Formularz rejestracji waliduje format email
- [ ] Formularz rejestracji waliduje długość hasła (min 6 znaków)
- [ ] Formularz rejestracji waliduje zgodność haseł
- [ ] Po pomyślnej rejestracji wyświetla się komunikat o weryfikacji emaila
- [ ] Email weryfikacyjny jest wysyłany przez Supabase
- [ ] Po kliknięciu w link weryfikacyjny email zostaje potwierdzony
- [ ] Użytkownik może się zalogować po potwierdzeniu emaila
- [ ] Błędy Supabase są mapowane na polskie komunikaty
- [ ] Zalogowany użytkownik próbujący wejść na `/auth/register` jest przekierowany do `/generate`

### Checklist: Logowanie (US-002)

- [ ] Strona `/auth/login` istnieje i renderuje się poprawnie
- [ ] Formularz logowania waliduje format email
- [ ] Formularz logowania waliduje obecność hasła
- [ ] Po pomyślnym logowaniu użytkownik jest przekierowany do `/generate`
- [ ] Przy błędnych danych wyświetla się komunikat "Nieprawidłowy email lub hasło"
- [ ] Sesja użytkownika jest zapisywana w localStorage
- [ ] Po odświeżeniu strony użytkownik pozostaje zalogowany
- [ ] Link do strony rejestracji działa
- [ ] Link do strony odzyskiwania hasła działa
- [ ] Zalogowany użytkownik próbujący wejść na `/auth/login` jest przekierowany do `/generate`

### Checklist: Wylogowanie (US-009)

- [ ] Przycisk "Wyloguj" jest widoczny w prawym górnym rogu (layout default)
- [ ] Po kliknięciu "Wyloguj" użytkownik jest wylogowywany
- [ ] Po wylogowaniu następuje przekierowanie do `/auth/login`
- [ ] Sesja jest czyszczona z localStorage
- [ ] Niezalogowany użytkownik próbujący wejść na `/generate` jest przekierowany do `/auth/login`

### Checklist: Bezpieczeństwo (US-009)

- [ ] Tylko zalogowany użytkownik może wejść na `/generate`
- [ ] Endpointy API (`/api/flashcards`, `/api/generations`) wymagają tokenu JWT
- [ ] Token JWT jest weryfikowany przez Supabase w `getUserId()`
- [ ] Brak tokenu lub nieprawidłowy token zwraca błąd 401
- [ ] RLS policies zapewniają że użytkownik widzi tylko swoje fiszki
- [ ] RLS policies zapewniają że użytkownik widzi tylko swoje generacje
- [ ] Usunięcie użytkownika kaskadowo usuwa wszystkie jego dane (fiszki, generacje, logi)

### Checklist: Odzyskiwanie hasła

- [ ] Strona `/auth/forgot-password` istnieje i renderuje się poprawnie
- [ ] Formularz odzyskiwania waliduje format email
- [ ] Po wysłaniu formularza wyświetla się komunikat "Sprawdź email z instrukcjami"
- [ ] Email z linkiem resetowania jest wysyłany przez Supabase
- [ ] Link w emailu prowadzi do `/auth/reset-password?token=...`
- [ ] Strona `/auth/reset-password` istnieje i renderuje się poprawnie
- [ ] Formularz resetowania waliduje długość nowego hasła
- [ ] Formularz resetowania waliduje zgodność nowych haseł
- [ ] Po pomyślnym resecie hasła użytkownik jest przekierowany do `/auth/login` z komunikatem sukcesu
- [ ] Wygasły token resetowania wyświetla odpowiedni komunikat błędu

### Checklist: Integracja z istniejącym kodem

- [ ] `useGenerationState()` używa `useApi()` zamiast `$fetch()`
- [ ] Wywołania do `/api/flashcards` dołączają token JWT w nagłówku
- [ ] Wywołania do `/api/generations` dołączają token JWT w nagłówku
- [ ] `getUserId()` poprawnie weryfikuje token i zwraca user_id
- [ ] `getUserId()` rzuca `UnauthorizedError` przy braku/nieprawidłowym tokenie
- [ ] Endpointy API obsługują `UnauthorizedError` i zwracają 401
- [ ] Strona `/generate` działa poprawnie po zalogowaniu
- [ ] Generowanie fiszek działa poprawnie (integracja z backendem)
- [ ] Zapisywanie fiszek działa poprawnie (integracja z backendem)

---

## 8. PODSUMOWANIE

### Kluczowe komponenty do implementacji

1. **Backend:**
   - `server/utils/auth/get-user-id.ts` - weryfikacja JWT
   - `server/utils/errors/custom-errors.ts` - dodanie `UnauthorizedError`
   - Aktualizacja endpointów API do obsługi błędów autentykacji

2. **Composables:**
   - `composables/useAuth.ts` - zarządzanie sesją i metodami auth
   - `composables/useApi.ts` - wrapper $fetch z automatycznym tokenem
   - Aktualizacja `composables/useSupabase.ts` dla sesji

3. **Middleware:**
   - `middleware/auth.ts` - ochrona chronionych tras
   - `middleware/guest.ts` - przekierowanie zalogowanych ze stron auth

4. **Layouts:**
   - `layouts/default.vue` - layout z nawigacją i przyciskiem wylogowania
   - `layouts/auth.vue` - layout dla stron autentykacji

5. **Strony:**
   - `pages/auth/login.vue` - logowanie
   - `pages/auth/register.vue` - rejestracja
   - `pages/auth/forgot-password.vue` - odzyskiwanie hasła
   - `pages/auth/reset-password.vue` - resetowanie hasła
   - Aktualizacja `pages/index.vue` i `pages/generate.vue`

6. **Komponenty:**
   - `components/auth/LoginForm.vue`
   - `components/auth/RegisterForm.vue`
   - `components/auth/ForgotPasswordForm.vue`
   - `components/auth/ResetPasswordForm.vue`
   - `components/auth/AuthErrorDisplay.vue`

7. **Plugin:**
   - `plugins/auth.client.ts` - inicjalizacja autentykacji

8. **Typy:**
   - `types/auth/auth.types.ts` - typy dla formularzy autentykacji

### Kluczowe decyzje architektoniczne

1. **Wykorzystanie Supabase Auth** jako backend autentykacji - wszystkie operacje (rejestracja, logowanie, reset hasła) obsługiwane przez Supabase
2. **Brak custom endpointów `/api/auth/*`** - Supabase SDK obsługuje wszystko po stronie klienta
3. **JWT tokeny w nagłówkach HTTP** - automatyczne dołączanie przez `useApi()`
4. **RLS policies** - już zaimplementowane, automatyczna izolacja danych użytkowników
5. **Client-side middleware** - ochrona tras wykonywana w przeglądarce
6. **Composable `useAuth()`** - centralne miejsce zarządzania stanem autentykacji
7. **Mapowanie błędów Supabase** na polskie komunikaty użytkownika
8. **Layouts** - rozdzielenie layoutu dla stron auth vs stron aplikacyjnych

### Zgodność z wymaganiami

- ✅ **US-001**: Rejestracja z email/hasło, weryfikacja emaila, komunikaty błędów
- ✅ **US-002**: Logowanie z email/hasło, przekierowanie po sukcesie, obsługa błędów
- ✅ **US-009**: Ochrona tras middleware, RLS policies, przycisk wylogowania, prywatność danych
- ✅ **Dodatkowo**: Odzyskiwanie i resetowanie hasła

### Brak naruszeń istniejącej funkcjonalności

- Istniejące endpointy `/api/flashcards`, `/api/generations` wymagają jedynie aktualizacji `getUserId()` - API kontrakty pozostają bez zmian
- Istniejące komponenty generowania fiszek (`generate/`) działają bez zmian
- Istniejące composables (`useGenerationState`, `useFlashcardProposals`) wymagają jedynie zamiany `$fetch` na `useApi().apiFetch`
- Istniejące migracje bazy danych nie wymagają zmian (już zawierają relacje do `auth.users`)

---

**Status:** Specyfikacja kompletna i gotowa do implementacji.

**Data utworzenia:** 2025-10-16

**Autor:** AI Assistant (Claude Sonnet 4.5)

