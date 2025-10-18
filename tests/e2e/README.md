# E2E Testing - Page Object Model

Ten folder zawiera testy End-to-End wykorzystujące wzorzec Page Object Model (POM) dla aplikacji 10xCards.

## 📁 Struktura folderów

```
tests/e2e/
├── page-objects/           # Page Object Classes
│   ├── components/         # Komponenty wielokrotnego użytku
│   │   └── NavigationComponent.ts
│   ├── BasePage.ts         # Bazowa klasa dla wszystkich stron
│   ├── LoginPage.ts        # Strona logowania
│   ├── GeneratePage.ts     # Strona generowania fiszek
│   └── index.ts           # Eksport wszystkich Page Objects
├── login-flow.spec.ts     # Testy scenariusza logowania
├── example.spec.ts        # Przykładowe testy
└── README.md             # Ta dokumentacja
```

## 🎯 Wzorzec Page Object Model

### Zalety POM:
- **Enkapsulacja** - logika interakcji z UI jest oddzielona od testów
- **Reużywalność** - Page Objects mogą być używane w wielu testach
- **Łatwość utrzymania** - zmiany w UI wymagają aktualizacji tylko w jednym miejscu
- **Czytelność** - testy są bardziej czytelne i zrozumiałe

### Struktura klas:

#### BasePage
Bazowa klasa zawierająca wspólne metody dla wszystkich stron:
- `goto(path)` - nawigacja do strony
- `expectVisible(locator)` - sprawdzenie widoczności elementu
- `clickElement(locator)` - kliknięcie z weryfikacją
- `fillField(locator, value)` - wypełnienie pola tekstowego

#### LoginPage
Klasa dla strony logowania (`/auth/login`):
- `navigate()` - nawigacja do strony logowania
- `fillEmail(email)` - wypełnienie pola email
- `fillPassword(password)` - wypełnienie pola hasło
- `clickSubmit()` - kliknięcie przycisku logowania
- `expectLoadingState()` - sprawdzenie stanu ładowania
- `expectErrorMessage()` - sprawdzenie komunikatu błędu

#### GeneratePage
Klasa dla strony generowania (`/generate`):
- `navigate()` - nawigacja do strony
- `expectPageLoaded()` - sprawdzenie załadowania strony
- `expectPageTitle()` - sprawdzenie tytułu strony

#### NavigationComponent
Komponent nawigacji (dla zalogowanych użytkowników):
- `expectNavigationVisible()` - sprawdzenie widoczności nawigacji
- `clickLogout()` - wylogowanie użytkownika
- `expectUserEmailVisible()` - sprawdzenie emaila użytkownika

## 🧪 Przykłady użycia

### Podstawowy test logowania:
```typescript
test('user can login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const generatePage = new GeneratePage(page)

  // Nawigacja i logowanie
  await loginPage.navigate()
  await loginPage.login('test@example.com', 'password123')
  
  // Weryfikacja przekierowania
  await generatePage.expectSuccessfulRedirectFromLogin()
})
```

### Test z weryfikacją nawigacji:
```typescript
test('navigation is visible after login', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const navigation = new NavigationComponent(page)

  await loginPage.performLoginFlow('test@example.com', 'password123')
  await navigation.expectAuthenticatedNavigation('test@example.com')
})
```

## 🔧 Selektory data-testid

Wszystkie Page Objects używają selektorów `data-testid` dla stabilności testów:

### LoginPage:
- `login-page` - kontener strony
- `login-form` - formularz logowania
- `login-email-input` - pole email
- `login-password-input` - pole hasło
- `login-submit-button` - przycisk logowania
- `login-loading-text` - tekst ładowania
- `auth-message-error` - komunikat błędu
- `auth-message-success` - komunikat sukcesu

### GeneratePage:
- `generate-page` - kontener strony
- `generate-page-title` - tytuł strony
- `generate-page-description` - opis strony

### NavigationComponent:
- `main-navigation` - główna nawigacja
- `app-logo` - logo aplikacji
- `user-section` - sekcja użytkownika
- `user-email` - email użytkownika
- `logout-button` - przycisk wylogowania

## ⚙️ Konfiguracja środowiska testowego

### Wymagane zmienne środowiskowe

Testy E2E wymagają konfiguracji rzeczywistego użytkownika testowego w pliku `.env.test`:

```bash
# .env.test
E2E_USERNAME_ID=user-id-from-database
E2E_USERNAME=test@example.com
E2E_PASSWORD=test-password
```

### Walidacja środowiska

Przed uruchomieniem testów system automatycznie sprawdza czy wszystkie wymagane zmienne są ustawione:

```typescript
// Automatyczna walidacja w testach
validateTestEnvironment() // Sprawdza E2E_USERNAME_ID, E2E_USERNAME, E2E_PASSWORD
```

## 🚀 Uruchamianie testów

```bash
# Wszystkie testy E2E
pnpm test:e2e

# Konkretny plik testów
pnpm playwright test login-flow.spec.ts

# Ulepszona wersja testów z rzeczywistymi danymi
pnpm playwright test login-flow-improved.spec.ts

# Z interfejsem graficznym
pnpm playwright test --ui

# Tryb debug
pnpm playwright test --debug

# Tylko walidacja środowiska
pnpm playwright test --grep "environment variables"
```

## 📊 Raporty

Raporty testów są generowane w:
- `tests/e2e/results/html/` - raport HTML
- `tests/e2e/results/results.json` - raport JSON

## 🔍 Debugowanie

### Zrzuty ekranu:
```typescript
await loginPage.takeScreenshot('login-error')
```

### Śledzenie:
```typescript
// Włączone automatycznie przy pierwszym powtórzeniu testu
trace: 'on-first-retry'
```

### Video:
```typescript
// Nagrywane przy błędach
video: 'retain-on-failure'
```

## 📝 Najlepsze praktyki

1. **Używaj data-testid** zamiast selektorów CSS
2. **Enkapsuluj logikę** w Page Objects
3. **Weryfikuj stan** przed akcjami
4. **Używaj opisowych nazw** metod
5. **Grupuj powiązane testy** w describe blocks
6. **Przygotowuj dane** w beforeEach hooks
7. **Czyść stan** po testach jeśli potrzeba

## 🔄 Aktualizacja Page Objects

Gdy zmienia się UI aplikacji:
1. Zaktualizuj odpowiednie `data-testid` w komponentach
2. Zaktualizuj selektory w Page Objects
3. Uruchom testy aby sprawdzić poprawność
4. Zaktualizuj dokumentację jeśli potrzeba
