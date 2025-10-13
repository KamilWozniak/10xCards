# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Aplikacja 10x-cards to webowa platforma do tworzenia i zarządzania fiszkami edukacyjnymi z wykorzystaniem AI. Architektura UI opiera się na Nuxt 3 z TypeScript, Tailwind CSS i shadcn-vue@1.0.3. Aplikacja wykorzystuje dwupoziomową strukturę routingu z przekierowaniem na podstawie stanu uwierzytelnienia: niezalogowani użytkownicy trafiają do widoku autentykacji, a zalogowani do dashboardu. Główna nawigacja realizowana jest przez topbar na desktop i drawer na mobile, zapewniając responsywność i intuicyjność użytkowania.

## 2. Lista widoków

### Widok autentykacji (`/auth`)
- **Główny cel:** Uwierzytelnienie użytkownika (logowanie/rejestracja)
- **Kluczowe informacje:** Formularz z polami email i hasło, przełącznik między trybem logowania a rejestracji
- **Kluczowe komponenty:** Formularz autentykacji, przełącznik trybu, komunikaty błędów
- **UX, dostępność i bezpieczeństwo:** Walidacja real-time, komunikaty błędów inline, responsywny design, bezpieczne przechowywanie danych uwierzytelniających

### Dashboard (`/dashboard`)
- **Główny cel:** Przegląd stanu aplikacji i szybki dostęp do głównych funkcji
- **Kluczowe informacje:** Statystyki użytkownika, ostatnie fiszki, szybkie akcje
- **Kluczowe komponenty:** Karty statystyk, lista ostatnich fiszek, przyciski szybkich akcji
- **UX, dostępność i bezpieczeństwo:** Intuicyjny layout, szybki dostęp do funkcji, informacje o stanie konta

### Lista fiszek (`/flashcards`)
- **Główny cel:** Przegląd i zarządzanie wszystkimi fiszkami użytkownika
- **Kluczowe informacje:** Paginowana lista fiszek (10 na stronę), opcje edycji i usuwania
- **Kluczowe komponenty:** Tabela/list fiszek, paginacja, modal edycji, potwierdzenia usunięcia
- **UX, dostępność i bezpieczeństwo:** Intuicyjne akcje, potwierdzenia destrukcyjnych operacji, możliwość edycji inline

### Generowanie fiszek (`/generate`)
- **Główny cel:** Tworzenie nowych fiszek z wykorzystaniem AI na podstawie tekstu użytkownika
- **Kluczowe informacje:** Formularz tekstowy (1000-10000 znaków), propozycje AI, opcje akceptacji/edycji/odrzucenia
- **Kluczowe komponenty:** Textarea z walidacją, lista propozycji AI, przyciski akcji dla każdej propozycji
- **UX, dostępność i bezpieczeństwo:** Walidacja długości tekstu, loading states, możliwość edycji przed akceptacją

### Panel użytkownika (`/profile`)
- **Główny cel:** Zarządzanie kontem użytkownika i przegląd szczegółowych statystyk
- **Kluczowe informacje:** Statystyki generowania, informacje o koncie, opcje usunięcia konta
- **Kluczowe komponenty:** Karty statystyk, informacje o koncie, opcje zarządzania kontem
- **UX, dostępność i bezpieczeństwo:** Przejrzyste statystyki, bezpieczne opcje usunięcia konta z potwierdzeniem

### Sesje powtórkowe (`/study`)
- **Główny cel:** Nauka fiszek z wykorzystaniem algorytmu spaced repetition
- **Kluczowe informacje:** Przód i tył fiszki, ocena przyswojenia, progress sesji
- **Kluczowe komponenty:** Karta fiszki, przyciski oceny, progress bar
- **UX, dostępność i bezpieczeństwo:** Intuicyjny interfejs nauki, jasne instrukcje oceniania

### Modal edycji fiszki (overlay)
- **Główny cel:** Edycja pojedynczej fiszki bez opuszczania listy
- **Kluczowe informacje:** Pola front i back fiszki, walidacja długości
- **Kluczowe komponenty:** Formularz edycji, liczniki znaków, przyciski zapisz/anuluj
- **UX, dostępność i bezpieczeństwo:** Walidacja real-time, możliwość anulowania zmian

## 3. Mapa podróży użytkownika

### Główny przypadek użycia: Generowanie fiszek przez AI

1. **Wejście do aplikacji** (`/` → `/auth`)
   - Użytkownik wchodzi na stronę główną
   - Przekierowanie do widoku autentykacji dla niezalogowanych

2. **Uwierzytelnienie** (`/auth`)
   - Rejestracja nowego konta lub logowanie istniejącego
   - Walidacja danych i obsługa błędów

3. **Dashboard** (`/dashboard`)
   - Przekierowanie po pomyślnym zalogowaniu
   - Przegląd statystyk i szybki dostęp do funkcji

4. **Generowanie fiszek** (`/generate`)
   - Przejście z dashboardu lub nawigacji
   - Wklejenie tekstu (1000-10000 znaków)
   - Kliknięcie "Generuj fiszki"

5. **Przegląd propozycji AI**
   - Wyświetlenie listy wygenerowanych propozycji
   - Przegląd każdej propozycji (pytanie i odpowiedź)

6. **Akcje na propozycjach**
   - Akceptacja wybranych fiszek
   - Edycja propozycji przed akceptacją
   - Odrzucenie niepotrzebnych propozycji

7. **Zapis fiszek**
   - Kliknięcie "Zapisz wybrane"
   - Potwierdzenie zapisania do bazy danych

8. **Przegląd zapisanych fiszek** (`/flashcards`)
   - Przejście do listy fiszek
   - Weryfikacja zapisanych fiszek

9. **Opcjonalne akcje**
   - Edycja fiszek przez modal
   - Rozpoczęcie sesji nauki (`/study`)

### Alternatywne przepływy:
- **Ręczne tworzenie fiszek:** Dashboard → Lista fiszek → "Dodaj fiszkę"
- **Sesja nauki:** Dashboard → Sesje powtórkowe
- **Zarządzanie kontem:** Dashboard → Panel użytkownika

## 4. Układ i struktura nawigacji

### Desktop (topbar)
- **Lewa strona:** Logo/tytuł aplikacji "10x-cards"
- **Środek:** Główna nawigacja (Dashboard, Moje fiszki, Generuj, Nauka)
- **Prawa strona:** Avatar użytkownika z dropdown menu (Profil, Wyloguj)

### Mobile (drawer)
- **Lewa strona:** Hamburger menu (otwiera drawer)
- **Środek:** Logo/tytuł aplikacji
- **Prawa strona:** Avatar użytkownika
- **Drawer:** Pełna nawigacja z ikonami i etykietami

### Struktura nawigacji
```
Główna nawigacja:
├── Dashboard (/dashboard)
├── Moje fiszki (/flashcards)
├── Generuj fiszki (/generate)
├── Nauka (/study)
└── Profil (/profile)
    ├── Statystyki
    ├── Ustawienia konta
    └── Usuń konto
```

## 5. Kluczowe komponenty

### Komponenty nawigacji
- **Topbar:** Główna nawigacja desktop z logo i menu użytkownika
- **Drawer:** Nawigacja mobile z hamburger menu
- **Breadcrumbs:** Ścieżka nawigacji dla głębszych widoków

### Komponenty formularzy
- **Formularz autentykacji:** Logowanie i rejestracja z walidacją
- **Formularz generowania:** Textarea z walidacją długości tekstu
- **Formularz edycji fiszki:** Modal z polami front/back i walidacją

### Komponenty list i danych
- **Lista fiszek:** Tabela z paginacją i akcjami
- **Lista propozycji AI:** Karty z opcjami akceptacji/edycji/odrzucenia
- **Karty statystyk:** Wyświetlanie metryk użytkownika

### Komponenty interakcji
- **Modal edycji:** Dialog do edycji fiszek (shadcn-vue Dialog)
- **Potwierdzenia:** Alerty do potwierdzenia destrukcyjnych akcji
- **Loading states:** Wskaźniki ładowania podczas operacji AI

### Komponenty sesji nauki
- **Karta fiszki:** Wyświetlanie przodu i tyłu fiszki
- **Przyciski oceny:** Ocena przyswojenia (łatwe/średnie/trudne)
- **Progress bar:** Wskaźnik postępu sesji nauki

### Komponenty obsługi błędów
- **Alerty błędów:** Komunikaty błędów inline (shadcn-vue Alert)
- **Toast notifications:** Powiadomienia o sukcesie/ błędach operacji
- **Error boundaries:** Obsługa błędów na poziomie komponentów

Wszystkie komponenty są zbudowane z shadcn-vue@1.0.3, stylowane Tailwind CSS i zoptymalizowane pod kątem dostępności i responsywności.
