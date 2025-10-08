# Quick Start - Database Setup dla 10x-cards

Szybki przewodnik po uruchomieniu bazy danych i rozpoczęciu pracy z projektem.

## 🚀 Szybki start (5 minut)

### 1. Zainstaluj Supabase CLI

```bash
# macOS / Linux
brew install supabase/tap/supabase

# lub npm
npm install -g supabase
```

### 2. Uruchom lokalne środowisko

```bash
# W katalogu głównym projektu
cd /Users/kamilwozniak/Desktop/10xDevs/10xCards

# Uruchom Supabase (wymaga Docker)
supabase start

# Zastosuj migracje i dane testowe
supabase db reset
```

### 3. Skonfiguruj zmienne środowiskowe

Skopiuj dane z outputu `supabase start` do pliku `.env`:

```env
NUXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NUXT_PUBLIC_SUPABASE_KEY=<anon-key-tutaj>
```

### 4. Utwórz testowego użytkownika

1. Otwórz http://localhost:54323 (Supabase Studio)
2. Przejdź do **Authentication** → **Users**
3. Kliknij **Add user**
4. Dodaj email i hasło (np. test@example.com / test1234)

### 5. Gotowe! 🎉

Teraz możesz:
- Przeglądać dane w Studio: http://localhost:54323
- Używać composables w aplikacji
- Testować API

---

## 📋 Przydatne komendy

```bash
# Status Supabase
supabase status

# Zatrzymaj Supabase
supabase stop

# Reset bazy danych (usuwa wszystkie dane)
supabase db reset

# Dostęp do PostgreSQL
supabase db psql

# Generuj typy TypeScript
supabase gen types typescript --local > types/database.types.ts
```

---

## 💾 Struktura bazy danych

### Tabele

1. **flashcards** - Fiszki użytkowników
   - `id`, `user_id`, `generation_id`, `front`, `back`, `source`

2. **generations** - Sesje generowania AI
   - `id`, `user_id`, `model`, `generated_count`, `accepted_*_count`, `source_text_hash`, etc.

3. **generation_error_logs** - Logi błędów API
   - `id`, `user_id`, `model`, `error_code`, `error_message`

### Relacje

```
auth.users (Supabase Auth)
    ↓ (1:N)
flashcards ← generation_id ← generations
    ↓ (1:N)
generation_error_logs
```

---

## 🔧 Przykłady użycia

### Composable: useFlashcards

```vue
<script setup lang="ts">
const { fetchFlashcards, createFlashcard, deleteFlashcard } = useFlashcards()

// Pobierz wszystkie fiszki
const flashcards = await fetchFlashcards()

// Utwórz nową fiszkę
await createFlashcard({
  front: 'Pytanie',
  back: 'Odpowiedź',
  source: 'manual'
})

// Usuń fiszkę
await deleteFlashcard(123)
</script>
```

### Composable: useGenerations

```vue
<script setup lang="ts">
const { 
  checkDuplicateSource, 
  createGeneration, 
  bulkAcceptFlashcards 
} = useGenerations()

// Sprawdź duplikat
const duplicate = await checkDuplicateSource(sourceText)
if (duplicate.is_duplicate) {
  console.log('Tekst już był używany!')
}

// Utwórz sesję generowania
const generation = await createGeneration({
  model: 'openai/gpt-4',
  generated_count: 10,
  accepted_unedited_count: 0,
  accepted_edited_count: 0,
  source_text_hash: hash,
  source_text_length: 5000,
  generation_time: 2340
})

// Zaakceptuj fiszki
await bulkAcceptFlashcards(generation.id, [
  { front: 'Q1', back: 'A1', source: 'ai-full' },
  { front: 'Q2', back: 'A2', source: 'ai-edited' }
])
</script>
```

### Composable: useUserStats

```vue
<script setup lang="ts">
const { getUserStats, getDailyFlashcardStats } = useUserStats()

// Pobierz statystyki
const stats = await getUserStats()
console.log(`Total flashcards: ${stats.total_flashcards}`)
console.log(`Acceptance rate: ${stats.acceptance_rate}%`)

// Statystyki dzienne
const dailyStats = await getDailyFlashcardStats(7) // ostatnie 7 dni
</script>
```

### Bezpośrednie zapytania Supabase

```typescript
// Pobierz fiszki
const { data: flashcards } = await supabase
  .from('flashcards')
  .select('*')
  .order('created_at', { ascending: false })

// Utwórz fiszkę
const { data } = await supabase
  .from('flashcards')
  .insert({ front: 'Q', back: 'A', source: 'manual' })
  .select()
  .single()

// Użyj RPC function
const { data: stats } = await supabase.rpc('get_user_stats')
```

---

## 🔒 Bezpieczeństwo (RLS)

Row Level Security jest **WŁĄCZONE** na wszystkich tabelach.

**Polityki:**
- Użytkownicy widzą tylko **swoje** dane
- Pełny dostęp CRUD do swoich rekordów
- Brak dostępu do danych innych użytkowników

**Testowanie RLS:**

```sql
-- W Supabase Studio SQL Editor
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM flashcards; -- Pokaże tylko dane tego użytkownika
```

---

## 📊 SQL Przykłady

### Statystyki użytkownika

```sql
-- Liczba fiszek według źródła
SELECT source, COUNT(*) 
FROM flashcards 
WHERE user_id = auth.uid()
GROUP BY source;

-- Ostatnie generacje
SELECT * FROM generations 
WHERE user_id = auth.uid()
ORDER BY created_at DESC 
LIMIT 10;

-- Współczynnik akceptacji
SELECT 
  ROUND(100.0 * SUM(accepted_unedited_count + accepted_edited_count) / 
    SUM(generated_count), 2) as acceptance_rate
FROM generations
WHERE user_id = auth.uid();
```

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to Supabase"

```bash
# Sprawdź czy Docker działa
docker ps

# Restart Supabase
supabase stop
supabase start
```

### Problem: "RLS prevents access"

Upewnij się że:
1. Użytkownik jest zalogowany (`useSupabaseUser()` nie jest null)
2. RLS polityki są poprawne (sprawdź w Studio)
3. `user_id` w rekordzie zgadza się z `auth.uid()`

### Problem: "Migration failed"

```bash
# Reset bazy i zastosuj migracje od nowa
supabase db reset
```

---

## 📚 Dokumentacja

- **Schemat bazy danych**: `docs/database_schema.md`
- **API Reference**: `docs/api_reference.md`
- **Migracje**: `supabase/migrations/README.md`
- **Konfiguracja Supabase**: `supabase/README.md`

---

## 🎯 Następne kroki

1. **Przeczytaj** `docs/database_schema.md` - szczegółowy opis tabel i relacji
2. **Zobacz** `docs/api_reference.md` - pełna dokumentacja API
3. **Eksploruj** Supabase Studio - przeglądaj dane wizualnie
4. **Testuj** composables - wypróbuj w swojej aplikacji

---

## ⚡ Pro Tips

1. **Auto-generuj typy** po każdej zmianie schematu:
   ```bash
   supabase gen types typescript --local > types/database.types.ts
   ```

2. **Używaj Realtime** dla live updates:
   ```typescript
   supabase
     .channel('flashcards')
     .on('postgres_changes', { 
       event: '*', 
       schema: 'public', 
       table: 'flashcards' 
     }, payload => console.log(payload))
     .subscribe()
   ```

3. **Loguj błędy** zawsze przez `generation_error_logs` - ułatwia debugowanie

4. **Cache'uj statystyki** - nie odpytuj `get_user_stats()` przy każdym renderze

5. **Hashuj teksty źródłowe** - używaj `checkDuplicateSource()` aby uniknąć duplikatów

---

## 🤝 Potrzebujesz pomocy?

1. Sprawdź [Supabase Docs](https://supabase.com/docs)
2. Zajrzyj do [Nuxt Supabase Module](https://supabase.nuxtjs.org/)
3. Zobacz logi: `supabase status` → sprawdź linki do logów

