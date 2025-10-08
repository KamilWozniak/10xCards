# API Reference - 10x-cards

## Supabase RPC Functions

Wszystkie funkcje RPC mogą być wywoływane z poziomu aplikacji frontendowej za pomocą Supabase client:

```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase.rpc('function_name', { param: value })
```

---

## Statystyki użytkownika

### `get_user_stats()`

Zwraca kompleksowe statystyki użytkownika dotyczące fiszek i generowania.

**Parametry:** brak

**Zwraca:**
```typescript
{
  total_flashcards: number
  flashcards_by_source: {
    'manual': number
    'ai-full': number
    'ai-edited': number
  }
  total_generations: number
  total_flashcards_generated: number
  total_flashcards_accepted: number
  acceptance_rate: number // procent (0-100)
  edit_rate: number // procent zaakceptowanych fiszek, które były edytowane
  avg_generation_time_ms: number
  total_errors: number
}
```

**Przykład użycia:**
```typescript
const { data: stats, error } = await supabase.rpc('get_user_stats')

if (error) {
  console.error('Error fetching stats:', error)
} else {
  console.log(`Total flashcards: ${stats.total_flashcards}`)
  console.log(`Acceptance rate: ${stats.acceptance_rate}%`)
}
```

---

## Zarządzanie fiszkami

### `bulk_accept_flashcards(p_generation_id, p_flashcards)`

Akceptuje wiele fiszek z jednej generacji w ramach pojedynczej transakcji.

**Parametry:**
- `p_generation_id` (bigint) - ID sesji generowania
- `p_flashcards` (json) - Tablica obiektów fiszek

**Format fiszek:**
```typescript
{
  front: string
  back: string
  source: 'ai-full' | 'ai-edited'
}
```

**Zwraca:**
```typescript
{
  success: boolean
  inserted_count: number
  generation_id: number
}
```

**Przykład użycia:**
```typescript
const flashcardsToAccept = [
  { front: 'Pytanie 1', back: 'Odpowiedź 1', source: 'ai-full' },
  { front: 'Pytanie 2', back: 'Odpowiedź 2 (zmieniona)', source: 'ai-edited' },
]

const { data, error } = await supabase.rpc('bulk_accept_flashcards', {
  p_generation_id: 123,
  p_flashcards: flashcardsToAccept
})

if (!error) {
  console.log(`Successfully added ${data.inserted_count} flashcards`)
}
```

---

## Analityka generowania

### `get_model_performance_stats()`

Zwraca statystyki wydajności pogrupowane według modeli LLM.

**Parametry:** brak

**Zwraca:**
```typescript
Array<{
  model: string
  usage_count: number
  avg_generation_time_ms: number
  total_generated: number
  total_accepted: number
  acceptance_rate: number // procent (0-100)
  edit_rate: number // procent (0-100)
}>
```

**Przykład użycia:**
```typescript
const { data: modelStats, error } = await supabase.rpc('get_model_performance_stats')

if (!error && modelStats) {
  modelStats.forEach(stat => {
    console.log(`${stat.model}: ${stat.acceptance_rate}% acceptance rate`)
  })
}
```

---

### `get_daily_flashcard_stats(days_back?)`

Zwraca dzienne statystyki tworzenia fiszek dla ostatnich N dni.

**Parametry:**
- `days_back` (int, opcjonalny) - liczba dni wstecz (domyślnie: 7)

**Zwraca:**
```typescript
Array<{
  date: string // format: YYYY-MM-DD
  total_count: number
  manual_count: number
  ai_full_count: number
  ai_edited_count: number
}>
```

**Przykład użycia:**
```typescript
// Ostatnie 7 dni
const { data: weekStats } = await supabase.rpc('get_daily_flashcard_stats')

// Ostatnie 30 dni
const { data: monthStats } = await supabase.rpc('get_daily_flashcard_stats', {
  days_back: 30
})
```

---

## Analityka błędów

### `get_error_frequency()`

Zwraca częstotliwość błędów pogrupowaną według kodów błędów.

**Parametry:** brak

**Zwraca:**
```typescript
Array<{
  error_code: string
  error_count: number
  last_occurrence: string // ISO timestamp
  affected_models: string[]
}>
```

**Przykład użycia:**
```typescript
const { data: errors, error } = await supabase.rpc('get_error_frequency')

if (!error && errors) {
  errors.forEach(err => {
    console.log(`${err.error_code}: ${err.error_count} occurrences`)
    console.log(`Last seen: ${err.last_occurrence}`)
    console.log(`Models affected: ${err.affected_models.join(', ')}`)
  })
}
```

---

## Funkcje pomocnicze

### `check_duplicate_source(p_source_text_hash)`

Sprawdza czy dany tekst źródłowy był już używany do generowania fiszek.

**Parametry:**
- `p_source_text_hash` (text) - hash tekstu źródłowego (np. SHA-256)

**Zwraca:**
```typescript
{
  is_duplicate: boolean
  generation_id?: number // jeśli is_duplicate = true
  created_at?: string
  generated_count?: number
  model?: string
}
```

**Przykład użycia:**
```typescript
import { createHash } from 'crypto'

const sourceText = "Długi tekst do generowania fiszek..."
const hash = createHash('sha256').update(sourceText).digest('hex')

const { data, error } = await supabase.rpc('check_duplicate_source', {
  p_source_text_hash: hash
})

if (data?.is_duplicate) {
  console.log('Ten tekst został już użyty do generowania!')
  console.log(`Poprzednia generacja: ${data.generation_id}`)
}
```

---

### `delete_all_user_data()`

Usuwa wszystkie dane użytkownika (RODO - prawo do bycia zapomnianym).

**⚠️ UWAGA:** Ta operacja jest nieodwracalna!

**Parametry:** brak

**Zwraca:**
```typescript
{
  success: boolean
  deleted_flashcards: number
  deleted_generations: number
  deleted_error_logs: number
}
```

**Przykład użycia:**
```typescript
// Zawsze pytaj użytkownika o potwierdzenie przed wywołaniem!
const confirmed = confirm('Czy na pewno chcesz usunąć wszystkie dane? Ta operacja jest nieodwracalna.')

if (confirmed) {
  const { data, error } = await supabase.rpc('delete_all_user_data')
  
  if (!error) {
    console.log(`Usunięto ${data.deleted_flashcards} fiszek`)
    console.log(`Usunięto ${data.deleted_generations} sesji generowania`)
    console.log(`Usunięto ${data.deleted_error_logs} logów błędów`)
    
    // Następnie usuń konto użytkownika przez Supabase Auth
    await supabase.auth.signOut()
  }
}
```

---

## Standardowe operacje CRUD

### Fiszki

#### Pobierz wszystkie fiszki użytkownika

```typescript
const { data: flashcards, error } = await supabase
  .from('flashcards')
  .select('*')
  .order('created_at', { ascending: false })
```

#### Pobierz fiszki z informacją o generacji

```typescript
const { data: flashcards, error } = await supabase
  .from('flashcards')
  .select(`
    *,
    generation:generations (
      id,
      model,
      created_at
    )
  `)
  .order('created_at', { ascending: false })
```

#### Utwórz fiszkę ręcznie

```typescript
const { data, error } = await supabase
  .from('flashcards')
  .insert({
    front: 'Pytanie',
    back: 'Odpowiedź',
    source: 'manual'
  })
  .select()
  .single()
```

#### Aktualizuj fiszkę

```typescript
const { data, error } = await supabase
  .from('flashcards')
  .update({
    front: 'Zaktualizowane pytanie',
    back: 'Zaktualizowana odpowiedź'
  })
  .eq('id', flashcardId)
  .select()
  .single()
```

#### Usuń fiszkę

```typescript
const { error } = await supabase
  .from('flashcards')
  .delete()
  .eq('id', flashcardId)
```

---

### Generacje

#### Utwórz nową sesję generowania

```typescript
const { data: generation, error } = await supabase
  .from('generations')
  .insert({
    model: 'openai/gpt-4',
    generated_count: 10,
    accepted_unedited_count: 0, // zaktualizuj później
    accepted_edited_count: 0,
    source_text_hash: hash,
    source_text_length: sourceText.length,
    generation_time: elapsedMs
  })
  .select()
  .single()
```

#### Zaktualizuj statystyki generacji

```typescript
const { error } = await supabase
  .from('generations')
  .update({
    accepted_unedited_count: 7,
    accepted_edited_count: 2
  })
  .eq('id', generationId)
```

#### Pobierz historię generowania

```typescript
const { data: generations, error } = await supabase
  .from('generations')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10)
```

---

### Logi błędów

#### Zapisz błąd generowania

```typescript
const { error } = await supabase
  .from('generation_error_logs')
  .insert({
    model: 'openai/gpt-4',
    source_text_hash: hash,
    source_text_length: sourceText.length,
    error_code: 'RATE_LIMIT_EXCEEDED',
    error_message: 'Rate limit exceeded. Please try again later.'
  })
```

#### Pobierz ostatnie błędy

```typescript
const { data: errors, error } = await supabase
  .from('generation_error_logs')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10)
```

---

## Realtime Subscriptions

### Nasłuchiwanie zmian w fiszkach

```typescript
const channel = supabase
  .channel('flashcards-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'flashcards',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Change received!', payload)
      // Zaktualizuj UI
    }
  )
  .subscribe()

// Cleanup
channel.unsubscribe()
```

---

## Obsługa błędów

### Typowe kody błędów

```typescript
if (error) {
  switch (error.code) {
    case '23505': // unique_violation
      console.error('Rekord już istnieje')
      break
    case '23503': // foreign_key_violation
      console.error('Naruszenie klucza obcego')
      break
    case '23514': // check_violation
      console.error('Naruszenie ograniczenia CHECK')
      break
    case 'PGRST116': // RLS violation
      console.error('Brak dostępu do zasobu')
      break
    default:
      console.error('Nieznany błąd:', error.message)
  }
}
```

---

## Best Practices

1. **Zawsze sprawdzaj błędy** po każdym wywołaniu Supabase
2. **Używaj TypeScript typów** z `types/database.types.ts`
3. **Waliduj dane** po stronie klienta przed wysłaniem do bazy
4. **Obsługuj RLS** - pamiętaj, że użytkownik musi być zalogowany
5. **Używaj transakcji** dla operacji atomowych (np. `bulk_accept_flashcards`)
6. **Cache'uj statystyki** - nie odpytuj `get_user_stats()` przy każdym renderze
7. **Hashuj tekst źródłowy** przed wywołaniem `check_duplicate_source`

---

## Przykład kompletnego flow generowania

```typescript
import { createHash } from 'crypto'
import { supabase } from '@/lib/supabase'

async function generateAndAcceptFlashcards(sourceText: string) {
  try {
    // 1. Hashuj tekst źródłowy
    const hash = createHash('sha256').update(sourceText).digest('hex')
    
    // 2. Sprawdź duplikaty
    const { data: duplicateCheck } = await supabase.rpc('check_duplicate_source', {
      p_source_text_hash: hash
    })
    
    if (duplicateCheck?.is_duplicate) {
      alert('Ten tekst został już użyty!')
      return
    }
    
    // 3. Wywołaj API LLM
    const startTime = Date.now()
    const llmResponse = await fetch('/api/generate-flashcards', {
      method: 'POST',
      body: JSON.stringify({ sourceText })
    })
    const generationTime = Date.now() - startTime
    
    if (!llmResponse.ok) {
      // Zapisz błąd
      await supabase.from('generation_error_logs').insert({
        model: 'openai/gpt-4',
        source_text_hash: hash,
        source_text_length: sourceText.length,
        error_code: llmResponse.status.toString(),
        error_message: await llmResponse.text()
      })
      return
    }
    
    const { flashcards } = await llmResponse.json()
    
    // 4. Utwórz rekord generacji
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        model: 'openai/gpt-4',
        generated_count: flashcards.length,
        accepted_unedited_count: 0,
        accepted_edited_count: 0,
        source_text_hash: hash,
        source_text_length: sourceText.length,
        generation_time: generationTime
      })
      .select()
      .single()
    
    if (genError) throw genError
    
    // 5. Użytkownik przegląda i edytuje fiszki w UI...
    // (np. za pomocą komponentu ReviewFlashcards)
    
    // 6. Po zaakceptowaniu fiszek
    const acceptedFlashcards = flashcards.map(fc => ({
      front: fc.front,
      back: fc.back,
      source: fc.wasEdited ? 'ai-edited' : 'ai-full'
    }))
    
    const { data: result, error: acceptError } = await supabase.rpc(
      'bulk_accept_flashcards',
      {
        p_generation_id: generation.id,
        p_flashcards: acceptedFlashcards
      }
    )
    
    if (acceptError) throw acceptError
    
    // 7. Zaktualizuj statystyki generacji
    const editedCount = acceptedFlashcards.filter(fc => fc.source === 'ai-edited').length
    const uneditedCount = acceptedFlashcards.length - editedCount
    
    await supabase
      .from('generations')
      .update({
        accepted_unedited_count: uneditedCount,
        accepted_edited_count: editedCount
      })
      .eq('id', generation.id)
    
    console.log(`Successfully added ${result.inserted_count} flashcards!`)
    
  } catch (error) {
    console.error('Error in generation flow:', error)
  }
}
```

