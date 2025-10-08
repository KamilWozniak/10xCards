-- RPC Functions for 10x-cards application
-- These functions can be called from the frontend via supabase.rpc()

-- ============================================
-- USER STATISTICS FUNCTIONS
-- ============================================

-- Get comprehensive user statistics
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_flashcards', (
      SELECT COUNT(*) 
      FROM flashcards 
      WHERE user_id = auth.uid()
    ),
    'flashcards_by_source', (
      SELECT json_object_agg(source, count)
      FROM (
        SELECT source, COUNT(*) as count
        FROM flashcards
        WHERE user_id = auth.uid()
        GROUP BY source
      ) sub
    ),
    'total_generations', (
      SELECT COUNT(*) 
      FROM generations 
      WHERE user_id = auth.uid()
    ),
    'total_flashcards_generated', (
      SELECT COALESCE(SUM(generated_count), 0)
      FROM generations
      WHERE user_id = auth.uid()
    ),
    'total_flashcards_accepted', (
      SELECT COALESCE(SUM(accepted_unedited_count + accepted_edited_count), 0)
      FROM generations
      WHERE user_id = auth.uid()
    ),
    'acceptance_rate', (
      SELECT COALESCE(
        ROUND(
          100.0 * SUM(accepted_unedited_count + accepted_edited_count) / 
          NULLIF(SUM(generated_count), 0),
          2
        ),
        0
      )
      FROM generations
      WHERE user_id = auth.uid()
    ),
    'edit_rate', (
      SELECT COALESCE(
        ROUND(
          100.0 * SUM(accepted_edited_count) / 
          NULLIF(SUM(accepted_unedited_count + accepted_edited_count), 0),
          2
        ),
        0
      )
      FROM generations
      WHERE user_id = auth.uid()
    ),
    'avg_generation_time_ms', (
      SELECT COALESCE(ROUND(AVG(generation_time)::numeric, 0), 0)
      FROM generations
      WHERE user_id = auth.uid()
    ),
    'total_errors', (
      SELECT COUNT(*)
      FROM generation_error_logs
      WHERE user_id = auth.uid()
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;

-- ============================================
-- FLASHCARD MANAGEMENT FUNCTIONS
-- ============================================

-- Bulk accept flashcards from a generation
-- Returns number of flashcards created
CREATE OR REPLACE FUNCTION bulk_accept_flashcards(
  p_generation_id bigint,
  p_flashcards json
)
RETURNS json AS $$
DECLARE
  flashcard json;
  inserted_count int := 0;
  result json;
BEGIN
  -- Verify the generation belongs to the current user
  IF NOT EXISTS (
    SELECT 1 FROM generations 
    WHERE id = p_generation_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Generation not found or access denied';
  END IF;

  -- Insert flashcards
  FOR flashcard IN SELECT * FROM json_array_elements(p_flashcards)
  LOOP
    INSERT INTO flashcards (
      user_id,
      generation_id,
      front,
      back,
      source
    ) VALUES (
      auth.uid(),
      p_generation_id,
      flashcard->>'front',
      flashcard->>'back',
      flashcard->>'source'
    );
    
    inserted_count := inserted_count + 1;
  END LOOP;

  -- Return result
  SELECT json_build_object(
    'success', true,
    'inserted_count', inserted_count,
    'generation_id', p_generation_id
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION bulk_accept_flashcards(bigint, json) TO authenticated;

-- ============================================
-- GENERATION ANALYTICS FUNCTIONS
-- ============================================

-- Get generation statistics grouped by model
CREATE OR REPLACE FUNCTION get_model_performance_stats()
RETURNS TABLE (
  model text,
  usage_count bigint,
  avg_generation_time_ms numeric,
  total_generated bigint,
  total_accepted bigint,
  acceptance_rate numeric,
  edit_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.model,
    COUNT(*)::bigint as usage_count,
    ROUND(AVG(g.generation_time)::numeric, 0) as avg_generation_time_ms,
    SUM(g.generated_count)::bigint as total_generated,
    SUM(g.accepted_unedited_count + g.accepted_edited_count)::bigint as total_accepted,
    ROUND(
      100.0 * SUM(g.accepted_unedited_count + g.accepted_edited_count) / 
      NULLIF(SUM(g.generated_count), 0),
      2
    ) as acceptance_rate,
    ROUND(
      100.0 * SUM(g.accepted_edited_count) / 
      NULLIF(SUM(g.accepted_unedited_count + g.accepted_edited_count), 0),
      2
    ) as edit_rate
  FROM generations g
  WHERE g.user_id = auth.uid()
  GROUP BY g.model
  ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_model_performance_stats() TO authenticated;

-- Get daily flashcard creation stats for the last N days
CREATE OR REPLACE FUNCTION get_daily_flashcard_stats(days_back int DEFAULT 7)
RETURNS TABLE (
  date date,
  total_count bigint,
  manual_count bigint,
  ai_full_count bigint,
  ai_edited_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(f.created_at) as date,
    COUNT(*)::bigint as total_count,
    COUNT(*) FILTER (WHERE f.source = 'manual')::bigint as manual_count,
    COUNT(*) FILTER (WHERE f.source = 'ai-full')::bigint as ai_full_count,
    COUNT(*) FILTER (WHERE f.source = 'ai-edited')::bigint as ai_edited_count
  FROM flashcards f
  WHERE f.user_id = auth.uid()
    AND f.created_at >= CURRENT_DATE - days_back
  GROUP BY DATE(f.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_daily_flashcard_stats(int) TO authenticated;

-- ============================================
-- ERROR ANALYTICS FUNCTIONS
-- ============================================

-- Get error frequency by error code
CREATE OR REPLACE FUNCTION get_error_frequency()
RETURNS TABLE (
  error_code text,
  error_count bigint,
  last_occurrence timestamptz,
  affected_models text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.error_code,
    COUNT(*)::bigint as error_count,
    MAX(e.created_at) as last_occurrence,
    array_agg(DISTINCT e.model) as affected_models
  FROM generation_error_logs e
  WHERE e.user_id = auth.uid()
  GROUP BY e.error_code
  ORDER BY error_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_error_frequency() TO authenticated;

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Delete all user data (for GDPR compliance - right to be forgotten)
-- This function deletes all user's flashcards, generations, and error logs
-- Note: The user account itself should be deleted via Supabase Auth
CREATE OR REPLACE FUNCTION delete_all_user_data()
RETURNS json AS $$
DECLARE
  deleted_flashcards int;
  deleted_generations int;
  deleted_errors int;
  result json;
BEGIN
  -- Delete flashcards
  DELETE FROM flashcards WHERE user_id = auth.uid();
  GET DIAGNOSTICS deleted_flashcards = ROW_COUNT;
  
  -- Delete generations
  DELETE FROM generations WHERE user_id = auth.uid();
  GET DIAGNOSTICS deleted_generations = ROW_COUNT;
  
  -- Delete error logs
  DELETE FROM generation_error_logs WHERE user_id = auth.uid();
  GET DIAGNOSTICS deleted_errors = ROW_COUNT;
  
  SELECT json_build_object(
    'success', true,
    'deleted_flashcards', deleted_flashcards,
    'deleted_generations', deleted_generations,
    'deleted_error_logs', deleted_errors
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_all_user_data() TO authenticated;

-- Check if source text hash already exists for user (prevent duplicate generations)
CREATE OR REPLACE FUNCTION check_duplicate_source(p_source_text_hash text)
RETURNS json AS $$
DECLARE
  existing_generation generations%ROWTYPE;
  result json;
BEGIN
  SELECT * INTO existing_generation
  FROM generations
  WHERE user_id = auth.uid() 
    AND source_text_hash = p_source_text_hash
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF existing_generation.id IS NOT NULL THEN
    SELECT json_build_object(
      'is_duplicate', true,
      'generation_id', existing_generation.id,
      'created_at', existing_generation.created_at,
      'generated_count', existing_generation.generated_count,
      'model', existing_generation.model
    ) INTO result;
  ELSE
    SELECT json_build_object(
      'is_duplicate', false
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_duplicate_source(text) TO authenticated;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION get_user_stats() IS 'Returns comprehensive statistics about user flashcards and generations';
COMMENT ON FUNCTION bulk_accept_flashcards(bigint, json) IS 'Accepts multiple flashcards from a generation in one transaction';
COMMENT ON FUNCTION get_model_performance_stats() IS 'Returns performance statistics grouped by LLM model';
COMMENT ON FUNCTION get_daily_flashcard_stats(int) IS 'Returns daily flashcard creation statistics for the last N days';
COMMENT ON FUNCTION get_error_frequency() IS 'Returns error frequency statistics grouped by error code';
COMMENT ON FUNCTION delete_all_user_data() IS 'Deletes all user data for GDPR compliance (right to be forgotten)';
COMMENT ON FUNCTION check_duplicate_source(text) IS 'Checks if source text has already been used for generation';

