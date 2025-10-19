Frontend - Nuxt 3 dla komponentów interaktywnych:
- Nuxt 3 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript wraz z możliwością tworzenia api w node.js
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- shadcn-vue@1.0.3 (wersja biblioteki jest krytyczna) zapewnia bibliotekę dostępnych komponentów w Nuxt(Vue.js), na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testowanie:
- Testy Jednostkowe:
  - Vitest - główny framework do testów jednostkowych
  - @nuxt/test-utils - narzędzia do testowania aplikacji Nuxt
  - @vue/test-utils - oficjalne narzędzia do testowania komponentów Vue
  - happy-dom - lekkie środowisko DOM
  - @testing-library/vue - testy komponentów zorientowane na użytkownika
  - @testing-library/dom - narzędzia do testowania DOM
  - @pinia/testing - narzędzia do testowania stanu Pinia
  - MSW - Mock Service Worker do mockowania HTTP
  - @vitest/coverage-v8 - raportowanie pokrycia kodu
  - @vitest/ui - interaktywny dashboard testowy
  - @faker-js/faker - generowanie danych testowych

- Testy End-to-End (E2E):
  - Playwright - framework do testów E2E
  - @playwright/test - runner testów Playwright
  - Wsparcie dla testowania na różnych przeglądarkach (Chrome, Firefox, Safari)
  - Testowanie responsywności (desktop, tablet, mobile)

CI/CD i Hosting:
- Github Actions do tworzenia pipeline'ów CI/CD
- Cloudflare Pages jako platforma hostingowa. Zapewnia doskonałe wsparcie dla aplikacji full-stack Nuxt 3, hojny plan darmowy z pozwoleniem na użytek komercyjny oraz wysoką wydajność dzięki globalnej sieci Cloudflare. Jest to optymalny wybór dla projektu z potencjałem start-upowym, minimalizujący koszty początkowe i eliminujący potrzebę przyszłych migracji.