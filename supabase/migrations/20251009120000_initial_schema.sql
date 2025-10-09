-- migration: initial schema for 10xcards
-- description: creates core tables for flashcards, generations tracking, and error logging
-- tables affected: generations, flashcards, generation_error_logs
-- special notes: 
--   - users table is managed by supabase auth and doesn't need to be created
--   - rls policies ensure users can only access their own data
--   - trigger on flashcards automatically updates updated_at timestamp

-- ============================================================================
-- table: generations
-- purpose: tracks ai generation sessions including metadata and statistics
-- ============================================================================

create table generations (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  model varchar not null,
  generated_count integer not null,
  accepted_unedited_count integer,
  accepted_edited_count integer,
  source_text_hash varchar not null,
  source_text_length integer not null check (source_text_length between 1000 and 10000),
  generation_duration integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- index on user_id for efficient filtering by user
create index idx_generations_user_id on generations(user_id);

-- enable row level security
alter table generations enable row level security;

-- rls policy: allow authenticated users to select their own generations
create policy "users can select own generations"
  on generations
  for select
  to authenticated
  using (auth.uid() = user_id);

-- rls policy: allow authenticated users to insert their own generations
create policy "users can insert own generations"
  on generations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- rls policy: allow authenticated users to update their own generations
create policy "users can update own generations"
  on generations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- rls policy: allow authenticated users to delete their own generations
create policy "users can delete own generations"
  on generations
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- table: flashcards
-- purpose: stores user flashcards with front/back content and source tracking
-- ============================================================================

create table flashcards (
  id bigserial primary key,
  front varchar(200) not null,
  back varchar(500) not null,
  source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  generation_id bigint references generations(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade
);

-- index on user_id for efficient filtering by user
create index idx_flashcards_user_id on flashcards(user_id);

-- index on generation_id for efficient joins with generations table
create index idx_flashcards_generation_id on flashcards(generation_id);

-- enable row level security
alter table flashcards enable row level security;

-- rls policy: allow authenticated users to select their own flashcards
create policy "users can select own flashcards"
  on flashcards
  for select
  to authenticated
  using (auth.uid() = user_id);

-- rls policy: allow authenticated users to insert their own flashcards
create policy "users can insert own flashcards"
  on flashcards
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- rls policy: allow authenticated users to update their own flashcards
create policy "users can update own flashcards"
  on flashcards
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- rls policy: allow authenticated users to delete their own flashcards
create policy "users can delete own flashcards"
  on flashcards
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- trigger: auto-update updated_at on flashcards
-- purpose: automatically sets updated_at to current timestamp on row updates
-- ============================================================================

-- function to update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- trigger that calls the function before updates on flashcards
create trigger set_updated_at
  before update on flashcards
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- table: generation_error_logs
-- purpose: logs errors that occur during ai generation attempts
-- ============================================================================

create table generation_error_logs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  model varchar not null,
  source_text_hash varchar not null,
  source_text_length integer not null check (source_text_length between 1000 and 10000),
  error_code varchar(100) not null,
  error_message text not null,
  created_at timestamptz not null default now()
);

-- index on user_id for efficient filtering by user
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- enable row level security
alter table generation_error_logs enable row level security;

-- rls policy: allow authenticated users to select their own error logs
create policy "users can select own error logs"
  on generation_error_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

-- rls policy: allow authenticated users to insert their own error logs
create policy "users can insert own error logs"
  on generation_error_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- rls policy: allow authenticated users to update their own error logs
create policy "users can update own error logs"
  on generation_error_logs
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- rls policy: allow authenticated users to delete their own error logs
create policy "users can delete own error logs"
  on generation_error_logs
  for delete
  to authenticated
  using (auth.uid() = user_id);

