# Supabase Database Setup

Instrukcja konfiguracji lokalnego i produkcyjnego środowiska Supabase dla aplikacji 10x-cards.

## Wymagania

- [Supabase CLI](https://supabase.com/docs/guides/cli) v1.0 lub nowszy
- Docker Desktop (dla lokalnego developmentu)
- Node.js 18+ (dla seedowania danych)

## Instalacja Supabase CLI

### macOS / Linux

```bash
brew install supabase/tap/supabase
```

### Windows

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Alternatywnie, przez npm:

```bash
npm install -g supabase
```

## Konfiguracja lokalna

### 1. Inicjalizacja projektu Supabase

Jeśli projekt nie jest jeszcze zainicjalizowany:

```bash
supabase init
```

### 2. Uruchom lokalną instancję Supabase

```bash
supabase start
```

Po uruchomieniu zobaczysz dane dostępowe:

```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
anon key: eyJhbG...
service_role key: eyJhbG...
```

**Zapisz te dane!** Będą potrzebne do konfiguracji aplikacji.

### 3. Zastosuj migracje

```bash
supabase db reset
```

To polecenie:
- Czyści bazę danych
- Stosuje wszystkie migracje z katalogu `supabase/migrations/`
- Wykonuje seed data z `supabase/seed.sql`

### 4. Dodaj dane testowe (opcjonalnie)

Jeśli chcesz dodać dane testowe:

1. Otwórz Supabase Studio: http://localhost:54323
2. Przejdź do **Authentication** → **Users** → **Add user**
3. Utwórz testowego użytkownika (np. test@example.com)
4. Wykonaj seed:

```bash
supabase db reset
```

Seed automatycznie użyje pierwszego dostępnego użytkownika.

### 5. Konfiguracja zmiennych środowiskowych w aplikacji

Utwórz plik `.env` w głównym katalogu projektu:

```env
NUXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NUXT_PUBLIC_SUPABASE_KEY=<anon-key-z-supabase-start>
```

## Konfiguracja produkcyjna

### 1. Utwórz projekt w Supabase Cloud

1. Wejdź na https://app.supabase.com
2. Kliknij **New Project**
3. Wypełnij formularz:
   - **Name**: 10x-cards-production
   - **Database Password**: (zapisz hasło!)
   - **Region**: wybierz najbliższy region
4. Kliknij **Create new project**

### 2. Połącz lokalny projekt z Supabase Cloud

```bash
supabase link --project-ref <project-ref>
```

`<project-ref>` znajdziesz w URL projektu: `https://app.supabase.com/project/<project-ref>`

### 3. Zastosuj migracje na produkcji

```bash
supabase db push
```

**UWAGA:** To polecenie NIE wykonuje seedu. Dane testowe są tylko dla środowiska lokalnego.

### 4. Konfiguracja zmiennych środowiskowych (produkcja)

Znajdź dane w Supabase Dashboard → Project Settings → API:

```env
NUXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<anon-public-key>
```

## Praca z migracjami

### Tworzenie nowej migracji

```bash
supabase migration new nazwa_migracji
```

To stworzy nowy plik w `supabase/migrations/` z timestampem w nazwie.

### Edycja migracji

1. Otwórz plik w `supabase/migrations/`
2. Dodaj SQL kod
3. Zastosuj lokalnie:

```bash
supabase db reset
```

### Testowanie migracji

Przed wypchniciem na produkcję:

```bash
# Reset lokalnej bazy z nowymi migracjami
supabase db reset

# Sprawdź czy wszystko działa
# Przetestuj aplikację lokalnie
```

### Zastosowanie migracji na produkcji

```bash
# Najpierw sprawdź różnice
supabase db diff

# Jeśli wszystko OK, wypchnij
supabase db push
```

## Przydatne komendy

### Status lokalnej instancji

```bash
supabase status
```

### Zatrzymanie lokalnej instancji

```bash
supabase stop
```

### Restart z czystą bazą

```bash
supabase db reset
```

### Dump bazy danych

```bash
# Lokalna baza
supabase db dump -f backup.sql

# Produkcyjna baza
supabase db dump --linked -f production_backup.sql
```

### Logowanie do PostgreSQL

```bash
# Lokalna baza
psql -h localhost -p 54322 -U postgres -d postgres

# Lub przez Supabase CLI
supabase db psql
```

### Generowanie TypeScript typów

```bash
supabase gen types typescript --local > types/database.types.ts

# Dla produkcji
supabase gen types typescript --linked > types/database.types.ts
```

## Struktura plików

```
supabase/
├── config.toml              # Konfiguracja Supabase CLI
├── migrations/              # Migracje bazy danych
│   ├── 20250108000000_initial_schema.sql
│   ├── 20250108000001_rpc_functions.sql
│   └── README.md
├── seed.sql                 # Dane testowe (tylko dla dev)
└── README.md               # Ten plik
```

## Troubleshooting

### Problem: "Cannot connect to Docker"

**Rozwiązanie:** Upewnij się, że Docker Desktop jest uruchomiony:

```bash
docker ps
```

### Problem: "Port already in use"

**Rozwiązanie:** Zmień porty w `supabase/config.toml`:

```toml
[api]
port = 54321  # zmień na inny port
```

### Problem: "Migration already applied"

**Rozwiązanie:** Reset bazy danych:

```bash
supabase db reset
```

### Problem: Seed nie działa - "No users found"

**Rozwiązanie:** Najpierw utwórz użytkownika w Supabase Studio:

1. Otwórz http://localhost:54323
2. Authentication → Users → Add user
3. Uruchom ponownie `supabase db reset`

### Problem: RLS blokuje operacje

**Rozwiązanie:** Upewnij się, że użytkownik jest zalogowany. W testach możesz tymczasowo wyłączyć RLS:

```sql
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;
```

**UWAGA:** Nigdy nie wyłączaj RLS na produkcji!

## Monitorowanie

### Studio (GUI dla bazy danych)

```bash
# Lokalnie
open http://localhost:54323

# Produkcja
open https://app.supabase.com/project/<project-ref>
```

### Table Editor

Supabase Studio → Table Editor - przeglądaj i edytuj dane bezpośrednio

### SQL Editor

Supabase Studio → SQL Editor - wykonuj własne zapytania SQL

### Logs

Supabase Studio → Logs - zobacz logi API, bazy danych i autentykacji

## Bezpieczeństwo

### Row Level Security (RLS)

- ✅ RLS jest WŁĄCZONE na wszystkich tabelach
- ✅ Polityki zapewniają izolację danych użytkowników
- ⚠️ NIGDY nie wyłączaj RLS na produkcji

### API Keys

- **anon key** - używaj w aplikacji frontendowej (bezpieczny do upublicznienia)
- **service_role key** - NIGDY nie używaj w frontendzie! Tylko w server-side code

### Testowanie RLS lokalnie

```sql
-- Ustaw użytkownika (w SQL Editor)
SELECT auth.jwt();
SET request.jwt.claim.sub = '<user-uuid>';

-- Sprawdź czy RLS działa
SELECT * FROM flashcards; -- Powinno zwrócić tylko fiszki tego użytkownika
```

## CI/CD Integration

### GitHub Actions

Przykład workflow dla automatycznych migracji:

```yaml
name: Deploy to Supabase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Run migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

## Dodatkowe zasoby

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

W razie problemów:

1. Sprawdź [Supabase Discord](https://discord.supabase.com)
2. Przejrzyj [GitHub Issues](https://github.com/supabase/supabase/issues)
3. Zajrzyj do logów: `supabase status` → sprawdź logi w Docker Desktop

