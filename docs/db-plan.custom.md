# Schema Bazy Danych - 10xCards

## 1. Tabele

### 1.0 Tabela 'users'
Ta tabela jest zarządzana przez Supabase Auth

### 1.1 Tabela `flashcards`

Główna tabela aplikacji przechowująca fiszki edukacyjne użytkowników.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| `id` | BIGSERIAL | PRIMARY KEY, DEFAULT gen_random_uuid() | Unikalny identyfikator fiszki |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → auth.users(id) ON DELETE CASCADE | Identyfikator właściciela fiszki |
| `generation_id` | UUID | NULLABLE, FOREIGN KEY → generations(id) ON DELETE CASCADE | Identyfikator sesji generowania (NULL dla fiszek ręcznych) |
| `front` | TEXT | NOT NULL, CHECK (length(front) >= 1 AND length(front) <= 5000) | Przód fiszki (pytanie) |
| `back` | TEXT | NOT NULL, CHECK (length(back) >= 1 AND length(back) <= 5000) | Tył fiszki (odpowiedź) |
| `source` | VARCHAR | NOT NULL, CHECK (source IN ('ai-full', 'ai-edited', 'manual')) | Źródło utworzenia fiszki |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Data utworzenia |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Data ostatniej modyfikacji |

**Ograniczenia:**
- `CHECK (length(front) >= 1 AND length(front) <= 5000)` - walidacja długości przodu fiszki
- `CHECK (length(back) >= 1 AND length(back) <= 5000)` - walidacja długości tyłu fiszki
- `CHECK (source IN ('ai-full', 'ai-edited', 'manual'))` - dozwolone wartości source:
  - `ai-full` - fiszka wygenerowana przez AI i zaakceptowana bez edycji
  - `ai-edited` - fiszka wygenerowana przez AI i zaakceptowana z edycją
  - `manual` - fiszka utworzona ręcznie przez użytkownika

### 1.2 Tabela `generations`

Tabela przechowująca metadane o sesjach generowania fiszek przez AI.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unikalny identyfikator sesji generowania |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → auth.users(id) ON DELETE CASCADE | Identyfikator użytkownika |
| `model` | TEXT | NOT NULL | Nazwa modelu LLM użytego do generowania |
| `generated_count` | INTEGER | NOT NULL, DEFAULT 0 | Liczba wygenerowanych fiszek |
| `accepted_unedited_count` | INTEGER | NULLABLE, DEFAULT NULL | Liczba zaakceptowanych fiszek bez edycji |
| `accepted_edited_count` | INTEGER | NULLABLE, DEFAULT NULL | Liczba zaakceptowanych fiszek z edycją |
| `source_text_hash` | TEXT | NOT NULL | Hash tekstu źródłowego |
| `source_text_length` | INTEGER | NOT NULL, CHECK (source_text_length >= 1000 AND source_text_length <= 10000) | Długość tekstu źródłowego w znakach |
| `generation_duration` | INTEGER | NOT NULL | Czas trwania generowania w milisekundach |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Data utworzenia sesji |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Data ostatniej modyfikacji |

**Ograniczenia:**
- `CHECK (source_text_length >= 1000 AND source_text_length <= 10000)` - walidacja długości zgodnie z PRD (US-003)
- `CHECK (generated_count >= (accepted_unedited_count + accepted_edited_count))` - logiczna spójność statystyk

**Uwagi:**
- `source_text_hash` nie ma ograniczenia UNIQUE - możliwe wielokrotne generowanie z tego samego tekstu
- Typ TEXT dla `source_text_hash` zapewnia elastyczność (obsługa różnych algorytmów hashowania)

### 1.3 Tabela `generation_error_logs`

Tabela immutable przechowująca logi błędów podczas generowania fiszek przez AI.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unikalny identyfikator logu |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → auth.users(id) ON DELETE CASCADE | Identyfikator użytkownika |
| `model` | VARCHAR(255) | NULLABLE | Nazwa modelu LLM (NULL jeśli błąd przed wyborem modelu) |
| `source_text_hash` | TEXT | NULLABLE | Hash tekstu źródłowego (NULL jeśli błąd przed hashowaniem) |
| `source_text_length` | INTEGER | NULLABLE | Długość tekstu źródłowego (NULL jeśli błąd przed walidacją) |
| `error_code` | VARCHAR | NOT NULL | Kod błędu |
| `error_message` | TEXT | NULLABLE | Szczegółowy komunikat błędu |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Data wystąpienia błędu |

**Uwagi:**
- Tabela nie posiada pola `updated_at` - logi są immutable
- Większość pól NULLABLE - błąd może wystąpić na różnych etapach procesu
- Tylko `error_code` i `error_message` są wymagane dla każdego logu

## 2. Relacje między tabelami

### Diagram relacji

```
auth.users (Supabase Auth)
    │
    ├─── 1:N ───→ flashcards (user_id) [ON DELETE CASCADE]
    │
    ├─── 1:N ───→ generations (user_id) [ON DELETE CASCADE]
    │
    └─── 1:N ───→ generation_error_logs (user_id) [ON DELETE CASCADE]

generations
    │
    └─── 1:N ───→ flashcards (generation_id, NULLABLE) [ON DELETE CASCADE]
```

### Szczegóły relacji

#### auth.users → flashcards
- **Kardynalność:** 1:N (jeden użytkownik ma wiele fiszek)
- **Foreign Key:** `flashcards.user_id` → `auth.users.id`
- **ON DELETE:** CASCADE (usunięcie użytkownika usuwa wszystkie jego fiszki - zgodność z RODO)

#### auth.users → generations
- **Kardynalność:** 1:N (jeden użytkownik ma wiele sesji generowania)
- **Foreign Key:** `generations.user_id` → `auth.users.id`
- **ON DELETE:** CASCADE (usunięcie użytkownika usuwa wszystkie jego sesje generowania - zgodność z RODO)

#### auth.users → generation_error_logs
- **Kardynalność:** 1:N (jeden użytkownik ma wiele logów błędów)
- **Foreign Key:** `generation_error_logs.user_id` → `auth.users.id`
- **ON DELETE:** CASCADE (usunięcie użytkownika usuwa wszystkie jego logi - zgodność z RODO)

#### generations → flashcards
- **Kardynalność:** 1:N (jedna sesja generowania może zawierać wiele fiszek)
- **Foreign Key:** `flashcards.generation_id` → `generations.id`
- **NULLABLE:** Tak (fiszki ręczne nie mają powiązanej sesji generowania)
- **ON DELETE:** CASCADE (usunięcie sesji generowania usuwa wszystkie powiązane fiszki)

## 3. Indeksy

### Indeksy podstawowe (wymagane dla RLS)

```sql
-- Indeksy na user_id dla wydajności RLS
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs(user_id);
```

### Uwagi dotyczące indeksów

Dla MVP przyjęto minimalistyczne podejście - tylko indeksy niezbędne dla wydajności Row Level Security. Zaawansowane indeksy (full-text search, partial indexes, composite indexes) będą dodane w przyszłych iteracjach w oparciu o rzeczywiste wzorce użycia.

**Świadomie pominięte w MVP:**
- Indeks na `flashcards.generation_id` (mała skala danych)
- Full-text search na `flashcards.front` i `flashcards.back`
- Composite indexes
- Partial indexes

## 4. Zasady PostgreSQL (Row Level Security)

### 4.1 Włączenie RLS na wszystkich tabelach

```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;
```

### 4.2 Polityki dla tabeli `flashcards`

**Pełny dostęp do własnych fiszek (SELECT, INSERT, UPDATE, DELETE):**

```sql
-- SELECT: Użytkownik może przeglądać tylko swoje fiszki
CREATE POLICY flashcards_select_policy ON flashcards
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Użytkownik może tworzyć tylko fiszki przypisane do siebie
CREATE POLICY flashcards_insert_policy ON flashcards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Użytkownik może edytować tylko swoje fiszki
CREATE POLICY flashcards_update_policy ON flashcards
    FOR UPDATE
    USING (auth.uid() = user_id);

-- DELETE: Użytkownik może usuwać tylko swoje fiszki
CREATE POLICY flashcards_delete_policy ON flashcards
    FOR DELETE
    USING (auth.uid() = user_id);
```

### 4.3 Polityki dla tabeli `generations`

**Pełny dostęp do własnych sesji generowania (SELECT, INSERT, UPDATE, DELETE):**

```sql
-- SELECT: Użytkownik może przeglądać tylko swoje sesje generowania
CREATE POLICY generations_select_policy ON generations
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Użytkownik może tworzyć tylko sesje przypisane do siebie
CREATE POLICY generations_insert_policy ON generations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Użytkownik może aktualizować tylko swoje sesje generowania
CREATE POLICY generations_update_policy ON generations
    FOR UPDATE
    USING (auth.uid() = user_id);

-- DELETE: Użytkownik może usuwać tylko swoje sesje generowania
CREATE POLICY generations_delete_policy ON generations
    FOR DELETE
    USING (auth.uid() = user_id);
```

### 4.4 Polityki dla tabeli `generation_error_logs`

**Tylko odczyt i wstawianie (SELECT, INSERT) - logi są immutable:**

```sql
-- SELECT: Użytkownik może przeglądać tylko swoje logi błędów
CREATE POLICY generation_error_logs_select_policy ON generation_error_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Użytkownik może tworzyć tylko logi przypisane do siebie
CREATE POLICY generation_error_logs_insert_policy ON generation_error_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Brak polityk UPDATE i DELETE - logi są immutable
```

## 5. Triggery i funkcje pomocnicze

### 5.1 Funkcja automatycznej aktualizacji `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Triggery dla automatycznej aktualizacji timestampów

```sql
-- Trigger dla tabeli flashcards
CREATE TRIGGER update_flashcards_updated_at
    BEFORE UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger dla tabeli generations
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Brak triggera dla generation_error_logs (tabela immutable)
```

## 6. Dodatkowe uwagi i decyzje projektowe

### 6.1 Zgodność z wymaganiami PRD

| Wymaganie | Implementacja w schemacie |
|-----------|---------------------------|
| US-003: Generowanie fiszek AI | ✅ Walidacja długości tekstu (1000-10000 znaków) w `generations.source_text_length` |
| US-004: Przegląd i zatwierdzanie | ✅ Rozróżnienie `source`: ai-full, ai-edited, manual |
| US-005, US-006, US-007: CRUD fiszek | ✅ Pełna obsługa w tabeli `flashcards` z RLS |
| US-009: Bezpieczeństwo | ✅ RLS policies izolują dane użytkowników |
| Punkt 3.6: Statystyki | ✅ Counters w tabeli `generations` |
| Punkt 3.7: RODO | ✅ ON DELETE CASCADE dla wszystkich relacji z `auth.users` |

### 6.2 Obsługa metryk sukcesu

**Efektywność generowania (cel: 75% acceptance rate):**
```sql
SELECT 
    SUM(accepted_unedited_count + accepted_edited_count) * 100.0 / NULLIF(SUM(generated_count), 0) AS acceptance_rate
FROM generations
WHERE user_id = auth.uid();
```

**Udział AI w tworzeniu fiszek (cel: 75% fiszek z AI):**
```sql
SELECT 
    COUNT(*) FILTER (WHERE source IN ('ai-full', 'ai-edited')) * 100.0 / NULLIF(COUNT(*), 0) AS ai_percentage
FROM flashcards
WHERE user_id = auth.uid();
```

### 6.3 Zasada maksymalnej prostoty

Zgodnie z decyzjami architektonicznymi dla MVP:
- **Brak funkcji logiki biznesowej w PostgreSQL** (poza triggerami dla timestampów)
- **Hard delete** - wszystkie operacje usuwania są trwałe (bez soft delete)
- **Brak denormalizacji** - statystyki agregowane on-the-fly
- **Minimalne indeksy** - tylko te niezbędne dla RLS

### 6.4 Elastyczność na przyszłość

Projekt przewiduje możliwość rozbudowy:
- **TEXT dla `source_text_hash`**: Obsługa różnych algorytmów hashowania (SHA-256, MD5, etc.)
- **INTEGER dla `generation_time`**: Wystarczająca precyzja milisekund dla obecnych potrzeb
- **VARCHAR dla `error_code`**: Flexibility w standardach kodów błędów

### 6.5 Aspekty pozostawione dla warstwy aplikacji (Nuxt API routes)

- Hashowanie tekstu źródłowego
- Logika akceptacji/odrzucenia fiszek
- Aktualizacja counts w sesji generowania
- Komunikacja z API LLM (Openrouter.ai)
- Walidacja biznesowa (poza podstawowymi CHECK constraints)
- Algorytm spaced repetition (poza zakresem MVP)

### 6.6 Kolejność implementacji migracji

1. Utworzenie funkcji `update_updated_at_column()`
2. Tabela `generations` (zależna tylko od `auth.users`)
3. Tabela `flashcards` (zależna od `generations` i `auth.users`)
4. Tabela `generation_error_logs` (zależna tylko od `auth.users`)
5. Indeksy na wszystkich `user_id`
6. Włączenie RLS i utworzenie polityk dla każdej tabeli
7. Triggery dla `updated_at` na tabelach `flashcards` i `generations`

### 6.7 Kwestie do weryfikacji w implementacji

- **Algorytm hashowania:** Zalecany SHA-256 dla `source_text_hash` (do ustalenia w warstwie aplikacji)
- **Format `error_code`:** Zalecane HTTP codes lub custom string labels (do zdefiniowania w dokumentacji API)
- **Limity praktyczne:** Monitorowanie liczby fiszek i sesji na użytkownika (obecnie bez limitów)

### 6.8 Świadomie pominięte w MVP

- Tabele dla algorytmu spaced repetition
- Przechowywanie surowych odpowiedzi LLM
- Zestawy/kolekcje fiszek (decks)
- Soft delete i data archiving
- Partycjonowanie tabel
- Audit logs
- Polityki retencji danych
- Wsparcie dla formatowania markdown/HTML
- Wsparcie dla mediów (obrazy, audio)

---

**Status:** Schemat kompletny i gotowy do implementacji.

