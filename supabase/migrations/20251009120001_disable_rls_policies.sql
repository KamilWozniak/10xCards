-- migration: disable rls policies
-- description: drops all rls policies from generations, flashcards, and generation_error_logs tables
-- tables affected: generations, flashcards, generation_error_logs
-- special notes: 
--   - rls remains enabled on tables, only policies are removed
--   - this effectively prevents access until new policies are defined

-- ============================================================================
-- drop policies from generations table
-- ============================================================================

drop policy if exists "users can select own generations" on generations;
drop policy if exists "users can insert own generations" on generations;
drop policy if exists "users can update own generations" on generations;
drop policy if exists "users can delete own generations" on generations;

-- ============================================================================
-- drop policies from flashcards table
-- ============================================================================

drop policy if exists "users can select own flashcards" on flashcards;
drop policy if exists "users can insert own flashcards" on flashcards;
drop policy if exists "users can update own flashcards" on flashcards;
drop policy if exists "users can delete own flashcards" on flashcards;

-- ============================================================================
-- drop policies from generation_error_logs table
-- ============================================================================

drop policy if exists "users can select own error logs" on generation_error_logs;
drop policy if exists "users can insert own error logs" on generation_error_logs;
drop policy if exists "users can update own error logs" on generation_error_logs;
drop policy if exists "users can delete own error logs" on generation_error_logs;

