# Plan Testów - 10xCards

## 1. Strategia Testowa

### Założenia Strategiczne
10xCards jest aplikacją edukacyjną opartą na AI, której główną funkcjonalnością jest generowanie fiszek z tekstu źródłowego oraz zarządzanie procesem nauki. Strategia testowa skupia się na trzech kluczowych obszarach:
- **Bezpieczeństwo danych użytkownika** - zapewnienie prywatności i poprawności autoryzacji
- **Integralność przepływu AI** - niezawodność generowania fiszek przez modele LLM
- **Jakość doświadczenia użytkownika** - płynność interfejsu i obsługi błędów

### Podejście do Testowania
Wykorzystujemy podejście **piramidy testów** z naciskiem na szybkie testy jednostkowe (70%), uzupełnione testami integracyjnymi (25%) i kluczowymi testami E2E (5%). Wszystkie testy muszą być deterministyczne, szybkie i łatwe w utrzymaniu.

## 2. Rodzaje Testów

### 2.1 Testy Jednostkowe (Unit Tests)
**Cel**: Testowanie izolowanych jednostek kodu w izolacji  
**Framework**: Vitest z @nuxt/test-utils  
**Zakres**: 
- **Validators** (server/utils/validators/) - walidacja input'ów API
- **Utils i Helpers** (lib/utils.ts, server/utils/) - funkcje użytkowe  
- **Composables** (composables/) - logika biznesowa Vue
- **Services** (services/) - logika komunikacji z zewnętrznymi API
- **Kompone Vue** (components/) - zachowanie komponentów UI
- **Store Pinia** - actions, getters, state mutations

**Kryteria jakości**: Coverage > 90% dla logiki biznesowej, 100% dla validators

### 2.2 Testy Integracyjne (Integration Tests)
**Cel**: Testowanie współpracy między modułami  
**Framework**: Vitest + Supabase test client  
**Zakres**:
- **API Endpoints** - kompletne testy server/api/ z rzeczywistą bazą danych testową
- **Authentication Flow** - rejestracja, logowanie, autoryzacja
- **AI Generation Pipeline** - komunikacja z OpenRouter API (z mockami)
- **Database Operations** - CRUD operations przez Supabase client
- **Component + Store Integration** - testowanie komponentów z rzeczywistymi store

**Środowisko**: Dedykowana baza Supabase do testów z seed data

### 2.3 Testy End-to-End (E2E)
**Cel**: Testowanie kompletnych ścieżek użytkownika  
**Framework**: Playwright 
**Zakres**:
- **Krytyczne ścieżki użytkownika**:
  - Rejestracja → Logowanie → Generowanie fiszek → Akceptacja
  - Ręczne tworzenie fiszek → Edycja → Usuwanie
  - Sesja nauki ze spaced repetition
- **Cross-browser compatibility** (Chrome, Firefox, Safari)
- **Responsive behavior** (desktop, tablet, mobile)

## 3. Struktura Testów i Organizacja

### 3.1 Hierarchia Folderów
```
tests/
├── unit/                          # Testy jednostkowe
│   ├── components/                # Komponenty Vue
│   ├── composables/               # Composables
│   ├── services/                  # Services
│   └── utils/                     # Utilities
├── integration/                   # Testy integracyjne  
│   ├── api/                       # API endpoints
│   ├── auth/                      # Authentication flows
│   └── database/                  # Database operations
├── e2e/                          # Testy E2E
│   ├── user-journeys/            # Kompletne ścieżki użytkownika
│   └── cross-platform/           # Testy wieloplatformowe
├── fixtures/                     # Dane testowe
│   ├── flashcards.json           # Sample flashcards
│   ├── users.json                # Test users  
│   └── ai-responses.json         # Mocked AI responses
├── helpers/                      # Pomocnicze funkcje testowe
│   ├── auth-helpers.ts           # Auth test utilities
│   ├── database-helpers.ts       # DB setup/cleanup
│   └── mock-factories.ts         # Mock object factories (używa @faker-js/faker)
└── setup/                        # Konfiguracja testów
    ├── global-setup.ts           # Globalna konfiguracja
    ├── test-db-setup.ts          # Setup bazy testowej
    └── vitest.config.ts          # Konfiguracja Vitest
```

### 3.2 Konwencje Nazewnictwa
- **Unit tests**: `ComponentName.nuxt.spec.ts`, `serviceName.spec.ts`
- **Integration tests**: `auth-flow.integration.spec.ts`, `flashcard-api.integration.spec.ts`  
- **E2E tests**: `flashcard-generation-journey.e2e.spec.ts`

## 4. Narzędzia i Frameworki Testowe

### 4.1 Główny Stack Testowy
- **Vitest** - główny test runner (już skonfigurowany)
- **@nuxt/test-utils** - utilities dla testowania Nuxt aplikacji
- **@vue/test-utils** - utilities dla komponentów Vue
- **happy-dom** - lightweight DOM environment (już skonfigurowany)

### 4.2 Dodatkowe Narzędzia
```json
{
  "devDependencies": {
    // Component testing utilities
    "@testing-library/vue": "8.0.2",           // User-centric component testing
    "@testing-library/dom": "10.4.0",          // DOM testing utilities (uniwersalny)
    
    // State management testing
    "@pinia/testing": "0.1.3",                 // Pinia testing helpers
    
    // E2E testing
    "playwright": "1.40.0",                    // E2E testing library
    "@playwright/test": "1.40.0",              // Playwright test runner
    
    // API mocking
    "msw": "2.0.8",                           // Mock Service Worker dla HTTP mocking
    
    // Coverage reporting
    "@vitest/coverage-v8": "3.2.4",           // Native Vitest coverage (zamiennik c8)
    
    // Development utilities
    "@vitest/ui": "3.2.4",                    // Interactive test dashboard
    "@faker-js/faker": "9.0.0"                // Test data generation
  }
}
```

### 4.3 Konfiguracja Vitest
```typescript
// vitest.config.ts extension
export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    coverage: {
      provider: 'v8',                                    // Native v8 coverage
      reporter: ['text', 'html', 'lcov', 'json'],
      exclude: ['tests/**', '*.config.*', 'types/**', '.nuxt/**', 'node_modules/**'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90
      }
    },
    setupFiles: ['./tests/setup/global-setup.ts'],
    globals: true,                                       // Enable global test APIs
    mockReset: true,                                     // Reset mocks between tests
    restoreMocks: true                                   // Restore original implementations
  },
})
```


## 5. Harmonogram i Priorytety

### 5.1 Faza 1: Fundament
**Priorytet: KRYTYCZNY**
- Setup infrastruktury testowej (instalacja dependencies: `pnpm add -D @vitest/coverage-v8 @vitest/ui @testing-library/dom @faker-js/faker @playwright/test msw`)
- Konfiguracja Vitest z nowymi narzędziami
- Testy jednostkowe validators (rozszerzenie istniejących)  
- Testy jednostkowe core services (AIService, FlashcardsService)
- Basic component tests dla kluczowych komponentów UI
- Setup MSW handlers dla API mocking

**Cel**: 80% coverage dla core business logic

**NPM Scripts do dodania:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 5.2 Faza 2: Integration 
**Priorytet: WYSOKI**
- Integration tests dla API endpoints
- Authentication flow testing (login, register, logout)
- Database operations testing z Supabase
- AI generation pipeline testing (z mockami)

**Cel**: Wszystkie API endpoints pokryte integration tests

### 5.3 Faza 3: User Experience
**Priorytet: ŚREDNI**  
- Component integration tests (component + store)
- Composables testing w różnych scenariuszach
- Error handling scenarios testing
- Edge cases coverage

**Cel**: 90% coverage overall

### 5.4 Faza 4: E2E & Optimization
**Priorytet: NISKI**
- Krytyczne E2E user journeys  
- Cross-browser testing setup
- Performance testing setup
- Test optimization i CI/CD integration

**Cel**: Kompletne pokrycie krytycznych ścieżek użytkownika

## 6. Kryteria Akceptacji

### 6.1 Kryteria Pokrycia (Coverage)
- **Unit Tests**: ≥ 90% line coverage dla business logic
- **Integration Tests**: 100% API endpoints coverage  
- **E2E Tests**: 100% critical user journeys coverage

### 6.2 Kryteria Wydajności  
- **Unit Tests**: < 5 sekund total execution time
- **Integration Tests**: < 30 sekund total execution time  
- **E2E Tests**: < 5 minut dla complete suite

### 6.3 Kryteria Jakości
- **Flaky Tests**: 0% - wszystkie testy muszą być deterministyczne
- **False Positives**: < 1% - testy nie mogą przechodzić gdy kod jest błędny
- **Maintainability**: Testy muszą być czytelne i łatwe w utrzymaniu

### 6.4 Kryteria Bezpieczeństwa
- Authentication edge cases 100% pokryte
- Data validation 100% pokryta  
- User data isolation potwierdzona testami
- GDPR compliance scenarios testowane

## 7. Metryki i Raportowanie

### 7.1 Metryki Techniczne
- **Code Coverage**: Line, branch, function coverage tracking
- **Test Execution Time**: Per test suite timing analysis  
- **Test Reliability**: Flakiness detection and tracking
- **Mutation Testing Score**: Jakość testów przez mutation testing


### 7.3 Narzędzia Raportowania  
- **Vitest UI**: Interactive test dashboard w development
- **Coverage Reports**: HTML reports dla code coverage analysis
- **CI/CD Integration**: GitHub Actions integration z test reporting
- **Dashboard**: Agregacja metryk w centralnym dashboardzie

### 7.4 Automatyzacja Raportowania
- Automatic coverage reports na każdy PR  
- Daily test health reports
- Weekly test metrics summary  
- Monthly test strategy review z business stakeholders

