-- migration: add development rls policies
-- description: adds RLS policies for development mode allowing all operations
-- tables affected: generations, flashcards, generation_error_logs
-- special notes: 
--   - these policies allow all operations for development
--   - in production, these should be replaced with proper user-based policies

-- ============================================================================
-- add policies for generations table
-- ============================================================================

-- Allow all users to insert generations (development mode)
create policy "development: allow all insert on generations" on generations
  for insert
  with check (true);

-- Allow all users to select generations (development mode)
create policy "development: allow all select on generations" on generations
  for select
  using (true);

-- Allow all users to update generations (development mode)
create policy "development: allow all update on generations" on generations
  for update
  using (true);

-- Allow all users to delete generations (development mode)
create policy "development: allow all delete on generations" on generations
  for delete
  using (true);

-- ============================================================================
-- add policies for flashcards table
-- ============================================================================

-- Allow all users to insert flashcards (development mode)
create policy "development: allow all insert on flashcards" on flashcards
  for insert
  with check (true);

-- Allow all users to select flashcards (development mode)
create policy "development: allow all select on flashcards" on flashcards
  for select
  using (true);

-- Allow all users to update flashcards (development mode)
create policy "development: allow all update on flashcards" on flashcards
  for update
  using (true);

-- Allow all users to delete flashcards (development mode)
create policy "development: allow all delete on flashcards" on flashcards
  for delete
  using (true);

-- ============================================================================
-- add policies for generation_error_logs table
-- ============================================================================

-- Allow all users to insert error logs (development mode)
create policy "development: allow all insert on generation_error_logs" on generation_error_logs
  for insert
  with check (true);

-- Allow all users to select error logs (development mode)
create policy "development: allow all select on generation_error_logs" on generation_error_logs
  for select
  using (true);

-- Allow all users to update error logs (development mode)
create policy "development: allow all update on generation_error_logs" on generation_error_logs
  for update
  using (true);

-- Allow all users to delete error logs (development mode)
create policy "development: allow all delete on generation_error_logs" on generation_error_logs
  for delete
  using (true);
