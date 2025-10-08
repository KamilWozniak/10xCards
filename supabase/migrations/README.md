# Database Migrations

Ten katalog zawiera migracje bazy danych PostgreSQL dla aplikacji 10x-cards.

## Struktura bazy danych

### Tabele

#### 1. `generations`
Przechowuje sesje generowania fiszek przez AI wraz ze statystykami.

**Pola:**
- `id` - unikalny identyfikator (bigserial)
- `user_id` - FK do `auth.users`, kaskadowe usuwanie
- `model` - nazwa użytego modelu LLM
- `generated_count` - liczba wygenerowanych fiszek
- `accepted_unedited_count` - liczba zaakceptowanych bez edycji
- `accepted_edited_count` - liczba zaakceptowanych po edycji
- `source_text_hash` - hash tekstu źródłowego
- `source_text_length` - długość tekstu źródłowego (1000-10000 znaków)
- `generation_time` - czas generowania w milisekundach
- `created_at`, `updated_at` - znaczniki czasowe

**Ograniczenia:**
- `source_text_length` musi być między 1000 a 10000
- suma `accepted_unedited_count + accepted_edited_count` nie może przekraczać `generated_count`

---

#### 2. `generation_error_logs`
Przechowuje logi błędów podczas prób generowania fiszek przez AI.

**Pola:**
- `id` - unikalny identyfikator (bigserial)
- `user_id` - FK do `auth.users`, kaskadowe usuwanie
- `model` - nazwa modelu LLM, który zwrócił błąd
- `source_text_hash` - hash tekstu źródłowego
- `source_text_length` - długość tekstu źródłowego
- `error_code` - kod błędu
- `error_message` - szczegółowy komunikat błędu
- `created_at` - znacznik czasowy

---

#### 3. `flashcards`
Przechowuje pojedyncze fiszki (zarówno stworzone ręcznie, jak i wygenerowane przez AI).

**Pola:**
- `id` - unikalny identyfikator (bigserial)
- `user_id` - FK do `auth.users`, kaskadowe usuwanie
- `generation_id` - FK do `generations`, nullable, SET NULL przy usunięciu
- `front` - przód fiszki (TEXT)
- `back` - tył fiszki (TEXT)
- `source` - źródło fiszki: `ai-full`, `ai-edited`, `manual`
- `created_at`, `updated_at` - znaczniki czasowe

**Ograniczenia:**
- `source` może być tylko jedną z wartości: `ai-full`, `ai-edited`, `manual`
- `front` i `back` nie mogą być puste (po usunięciu białych znaków)

---

### Bezpieczeństwo (RLS)

Wszystkie tabele mają włączone Row Level Security (RLS) z następującymi politykami:

- **SELECT**: Użytkownicy widzą tylko własne rekordy
- **INSERT**: Użytkownicy mogą tworzyć tylko swoje rekordy
- **UPDATE**: Użytkownicy mogą aktualizować tylko swoje rekordy
- **DELETE**: Użytkownicy mogą usuwać tylko swoje rekordy

### Indeksy

Podstawowe indeksy dla wydajności:
- Indeksy na `user_id` we wszystkich tabelach
- Złożone indeksy `(user_id, created_at DESC)` dla sortowania
- Partial index na `generation_id` w `flashcards` (tylko dla NOT NULL)

### Triggery

- `update_updated_at_column()` - automatycznie aktualizuje pole `updated_at` przy każdej modyfikacji rekordu
- Zastosowane do tabel: `generations`, `flashcards`

---

## Użycie

### Lokalne środowisko z Supabase CLI

```bash
# Uruchom lokalną instancję Supabase
supabase start

# Zastosuj migracje
supabase db reset

# Lub zastosuj tylko nowe migracje
supabase db push
```

### Produkcja

```bash
# Zastosuj migracje na zdalnej instancji
supabase db push --linked
```

### Tworzenie nowej migracji

```bash
supabase migration new nazwa_migracji
```

---

## Notatki deweloperskie

1. **Kaskadowe usuwanie**: Usunięcie użytkownika automatycznie usuwa wszystkie jego fiszki, sesje generowania i logi błędów (zgodnie z RODO).

2. **Soft delete**: NIE jest implementowane. Wszystkie usunięcia są trwałe (hard delete).

3. **Walidacja**: Podstawowa walidacja jest na poziomie bazy danych (CHECK constraints), bardziej zaawansowana walidacja powinna być w warstwie aplikacji.

4. **Typ ID**: Używamy `bigserial` dla lepszej wydajności przy prostej numeracji, zamiast UUID.

5. **User ID**: `user_id` jest UUID, ponieważ integrujemy się z `auth.users` Supabase, które używa UUID.

