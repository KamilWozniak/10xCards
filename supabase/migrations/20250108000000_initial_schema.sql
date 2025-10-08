-- Initial schema for 10x-cards application
-- This migration creates the core tables for flashcard management with AI generation support

-- ============================================
-- 1. CREATE TRIGGER FUNCTION FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- Table: generations
-- Stores AI generation sessions with statistics
CREATE TABLE generations (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model text NOT NULL,
  generated_count integer NOT NULL DEFAULT 0,
  accepted_unedited_count integer NOT NULL DEFAULT 0,
  accepted_edited_count integer NOT NULL DEFAULT 0,
  source_text_hash text NOT NULL,
  source_text_length integer NOT NULL,
  generation_time integer NOT NULL, -- time in milliseconds
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_source_text_length CHECK (source_text_length >= 1000 AND source_text_length <= 10000),
  CONSTRAINT valid_counts CHECK (
    generated_count >= 0 AND 
    accepted_unedited_count >= 0 AND 
    accepted_edited_count >= 0 AND
    (accepted_unedited_count + accepted_edited_count) <= generated_count
  )
);

-- Table: generation_error_logs
-- Stores errors that occurred during AI generation attempts
CREATE TABLE generation_error_logs (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model text NOT NULL,
  source_text_hash text NOT NULL,
  source_text_length integer NOT NULL,
  error_code text NOT NULL,
  error_message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_error_source_text_length CHECK (source_text_length >= 1000 AND source_text_length <= 10000)
);

-- Table: flashcards
-- Stores individual flashcards (both manually created and AI-generated)
CREATE TABLE flashcards (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id bigint REFERENCES generations(id) ON DELETE SET NULL,
  front text NOT NULL,
  back text NOT NULL,
  source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_source CHECK (source IN ('ai-full', 'ai-edited', 'manual')),
  CONSTRAINT non_empty_front CHECK (char_length(trim(front)) > 0),
  CONSTRAINT non_empty_back CHECK (char_length(trim(back)) > 0)
);

-- ============================================
-- 3. CREATE TRIGGERS FOR updated_at
-- ============================================

CREATE TRIGGER update_generations_updated_at 
  BEFORE UPDATE ON generations
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at 
  BEFORE UPDATE ON flashcards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. CREATE INDEXES
-- ============================================

-- Indexes for flashcards table
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_generation_id ON flashcards(generation_id) WHERE generation_id IS NOT NULL;
CREATE INDEX idx_flashcards_user_created ON flashcards(user_id, created_at DESC);

-- Indexes for generations table
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_user_created ON generations(user_id, created_at DESC);

-- Indexes for generation_error_logs table
CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs(user_id);
CREATE INDEX idx_generation_error_logs_created ON generation_error_logs(created_at DESC);

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE RLS POLICIES
-- ============================================

-- RLS Policies for generations table
CREATE POLICY "Users can view own generations" 
  ON generations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generations" 
  ON generations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations" 
  ON generations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations" 
  ON generations FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for generation_error_logs table
CREATE POLICY "Users can view own error logs" 
  ON generation_error_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own error logs" 
  ON generation_error_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own error logs" 
  ON generation_error_logs FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for flashcards table
CREATE POLICY "Users can view own flashcards" 
  ON flashcards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own flashcards" 
  ON flashcards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards" 
  ON flashcards FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards" 
  ON flashcards FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 7. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE generations IS 'Stores AI generation sessions with statistics about generated and accepted flashcards';
COMMENT ON TABLE generation_error_logs IS 'Logs errors that occur during AI flashcard generation attempts';
COMMENT ON TABLE flashcards IS 'Stores individual flashcards, both manually created and AI-generated';

COMMENT ON COLUMN flashcards.source IS 'Origin of flashcard: ai-full (accepted as-is), ai-edited (modified after generation), manual (created by user)';
COMMENT ON COLUMN flashcards.generation_id IS 'References the AI generation session if applicable, NULL for manually created flashcards';
COMMENT ON COLUMN generations.source_text_hash IS 'Hash of the source text to detect duplicate generation attempts';
COMMENT ON COLUMN generations.generation_time IS 'Time taken for AI generation in milliseconds';

