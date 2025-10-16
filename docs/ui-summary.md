<conversation_summary>
<decisions>
Struktura routingu: / przekierowuje do /auth dla niezalogowanych i /dashboard dla zalogowanych, z layoutami auth.vue i default.vue
Topbar bez hamburger menu - prosty topbar z nawigacją do głównych widoków
Widok listy fiszek z paginacją (10 na stronę) bez sortowania
Modal edycji fiszek z shadcn-vue Dialog, walidacją real-time, bez autosave
Użycie Pinia store do zarządzania stanem aplikacji
Formularz generowania fiszek z listą propozycji i opcjami Akceptuj/Edytuj/Odrzuć dla każdej propozycji
Layout responsywny: topbar na desktop, drawer na mobile
Route guard w middleware bez automatycznego przekierowania przy wygaśnięciu sesji
Panel użytkownika z kartami statystyk i informacjami o koncie
Proste obsługiwanie błędów inline bez skomplikowanych mechanizmów
</decisions>
<matched_recommendations>
Struktura routingu z middleware auth guard i odpowiednimi layoutami
Topbar z NavigationMenu z shadcn-vue do nawigacji między widokami
Komponent FlashcardList z paginacją i integracją z Pinia store
Modal edycji z shadcn-vue Dialog, walidacją real-time i licznikami znaków
Pinia store z state, actions i getters dla zarządzania fiszkami
Formularz generowania z Textarea, walidacją i listą propozycji z akcjami
Responsywny layout z topbar na desktop i drawer na mobile
Middleware auth.ts z sprawdzaniem sesji Supabase
Panel użytkownika z kartami statystyk używający Card z shadcn-vue
System obsługi błędów z komunikatami inline i Alert z shadcn-vue
</matched_recommendations>
<ui_architecture_planning_summary>
Główne wymagania architektury UI:
Aplikacja oparta na Nuxt 3 z TypeScript, Tailwind CSS i shadcn-vue@1.0.3
Struktura z widokiem autentykacji dla niezalogowanych i dashboardem dla zalogowanych
Topbar z nawigacją do głównych sekcji: lista fiszek, panel użytkownika, sesje powtórkowe, generowanie fiszek
Kluczowe widoki i przepływy:
Widok autentykacji (/auth) - formularz logowania/rejestracji
Dashboard (/dashboard) - główny widok po zalogowaniu z topbar
Lista fiszek (/flashcards) - paginowana lista z opcjami edycji i usuwania
Generowanie fiszek (/generate) - formularz tekstowy z listą propozycji AI
Panel użytkownika (/profile) - statystyki i zarządzanie kontem
Sesje powtórkowe (/study) - placeholder na przyszłą implementację
Integracja z API i zarządzanie stanem:
Pinia store z modułami: flashcards (cache, paginacja), generations (historia), auth (stan użytkownika)
Integracja z endpointami: GET/POST/PUT/DELETE /flashcards, POST /generations
Optimistic updates i background refresh dla lepszej wydajności
Responsywność i bezpieczeństwo:
Layout responsywny: topbar na desktop, drawer na mobile
Route guard w middleware z sprawdzaniem sesji Supabase
Proste obsługiwanie błędów inline bez skomplikowanych mechanizmów
Komponenty UI:
shadcn-vue komponenty: Dialog (modal edycji), Card (panel użytkownika), Alert (błędy)
Tailwind CSS do stylowania i responsywności
Real-time walidacja formularzy z licznikami znaków
</ui_architecture_planning_summary>
<unresolved_issues>
Szczegółowa implementacja drawer na mobile - wymaga dalszego wyjaśnienia struktury i animacji
Dokładna struktura Pinia store - potrzebne są szczegóły dotyczące modułów i ich interakcji
Implementacja sesji powtórkowych - obecnie placeholder, wymaga planowania w przyszłości
Szczegóły dotyczące toast notifications - które akcje CRUD powinny je wyświetlać
Optymalizacja wydajności - strategia cache'owania i background refresh wymaga doprecyzowania
</unresolved_issues>
</conversation_summary>