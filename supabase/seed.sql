-- Seed data for local development and testing
-- This file creates sample data for testing the application

-- Note: This seed assumes you have at least one user created via Supabase Auth
-- You can create a test user in Supabase Studio or via the auth.signup endpoint

-- ============================================
-- SEED DATA
-- ============================================

-- For this seed to work, replace 'YOUR_USER_ID_HERE' with an actual user UUID
-- You can get this from Supabase Studio > Authentication > Users
-- Or create a test user first and use their ID

DO $$
DECLARE
  test_user_id uuid;
  gen1_id bigint;
  gen2_id bigint;
BEGIN
  -- Try to get existing user or create a note about needing one
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No users found in auth.users. Please create a user first via Supabase Auth.';
    RAISE NOTICE 'You can create a test user in Supabase Studio or via the API.';
    RAISE NOTICE 'Then run this seed file again.';
    RETURN;
  END IF;

  RAISE NOTICE 'Using user ID: %', test_user_id;

  -- ============================================
  -- Insert sample generations
  -- ============================================
  
  INSERT INTO generations (
    user_id,
    model,
    generated_count,
    accepted_unedited_count,
    accepted_edited_count,
    source_text_hash,
    source_text_length,
    generation_time,
    created_at
  ) VALUES 
  (
    test_user_id,
    'openai/gpt-4',
    10,
    7,
    2,
    'hash_abc123',
    5420,
    2340,
    NOW() - INTERVAL '3 days'
  ),
  (
    test_user_id,
    'anthropic/claude-3-sonnet',
    8,
    5,
    1,
    'hash_def456',
    3210,
    1890,
    NOW() - INTERVAL '1 day'
  )
  RETURNING id INTO gen1_id;

  -- Get the second generation ID
  SELECT id INTO gen2_id FROM generations 
  WHERE user_id = test_user_id 
  ORDER BY created_at DESC LIMIT 1 OFFSET 1;

  -- ============================================
  -- Insert sample flashcards from first generation
  -- ============================================
  
  INSERT INTO flashcards (user_id, generation_id, front, back, source, created_at) VALUES
  -- AI-generated, accepted as-is
  (test_user_id, gen1_id, 'Co to jest TypeScript?', 'TypeScript to nadzbiór JavaScript, który dodaje opcjonalne typowanie statyczne i kompiluje się do czystego JavaScript.', 'ai-full', NOW() - INTERVAL '3 days'),
  (test_user_id, gen1_id, 'Jakie są główne zalety TypeScript?', 'Lepsze wykrywanie błędów w czasie kompilacji, lepsza obsługa IDE, self-dokumentujący kod, łatwiejszy refactoring.', 'ai-full', NOW() - INTERVAL '3 days'),
  (test_user_id, gen1_id, 'Co to jest interface w TypeScript?', 'Interface to sposób definiowania kształtu obiektu, określający jakie właściwości i metody obiekt powinien mieć.', 'ai-full', NOW() - INTERVAL '3 days'),
  
  -- AI-generated, edited by user
  (test_user_id, gen1_id, 'Co to jest type guard?', 'Type guard to wyrażenie, które wykonuje sprawdzenie typu w runtime i zawęża typ w danym bloku kodu. Przykład: typeof x === "string"', 'ai-edited', NOW() - INTERVAL '3 days'),
  (test_user_id, gen1_id, 'Czym różni się type od interface?', 'Type może reprezentować typy prymitywne, unie i aliasy, podczas gdy interface służy głównie do definiowania kształtu obiektów. Interface można rozszerzać (extend), type używa przecięć (&).', 'ai-edited', NOW() - INTERVAL '3 days');

  -- ============================================
  -- Insert sample flashcards from second generation
  -- ============================================
  
  INSERT INTO flashcards (user_id, generation_id, front, back, source, created_at) VALUES
  (test_user_id, gen2_id, 'Co to jest Vue 3 Composition API?', 'To nowy sposób organizowania logiki komponentów w Vue 3, używający funkcji setup() zamiast options API. Zapewnia lepszą reużywalność kodu i wsparcie dla TypeScript.', 'ai-full', NOW() - INTERVAL '1 day'),
  (test_user_id, gen2_id, 'Co to jest ref w Vue 3?', 'ref() to funkcja tworząca reaktywną referencję do wartości. Aby uzyskać dostęp do wartości, używamy .value. W template wartość jest automatycznie rozpakowywana.', 'ai-full', NOW() - INTERVAL '1 day'),
  (test_user_id, gen2_id, 'Różnica między ref a reactive?', 'ref() działa z wartościami prymitywnymi i obiektami (wymaga .value), reactive() działa tylko z obiektami i nie wymaga .value. ref jest bardziej uniwersalny.', 'ai-edited', NOW() - INTERVAL '1 day');

  -- ============================================
  -- Insert manually created flashcards
  -- ============================================
  
  INSERT INTO flashcards (user_id, generation_id, front, back, source, created_at) VALUES
  (test_user_id, NULL, 'Co to jest Nuxt 3?', 'Nuxt 3 to framework oparty na Vue 3, zapewniający server-side rendering, file-based routing, auto-imports i wiele innych funkcji out-of-the-box.', 'manual', NOW() - INTERVAL '2 days'),
  (test_user_id, NULL, 'Co to jest Pinia?', 'Pinia to oficjalny store manager dla Vue.js, następca Vuex. Jest prostszy, ma lepsze wsparcie TypeScript i pełną integrację z Vue DevTools.', 'manual', NOW() - INTERVAL '12 hours'),
  (test_user_id, NULL, 'Co to jest Tailwind CSS?', 'Tailwind CSS to utility-first CSS framework, który dostarcza niskopoziomowe klasy użytkowe do budowania niestandardowych designów bez pisania CSS.', 'manual', NOW());

  -- ============================================
  -- Insert sample error logs
  -- ============================================
  
  INSERT INTO generation_error_logs (
    user_id,
    model,
    source_text_hash,
    source_text_length,
    error_code,
    error_message,
    created_at
  ) VALUES
  (
    test_user_id,
    'openai/gpt-3.5-turbo',
    'hash_error1',
    4500,
    'RATE_LIMIT_EXCEEDED',
    'Rate limit exceeded. Please try again in 60 seconds.',
    NOW() - INTERVAL '5 days'
  ),
  (
    test_user_id,
    'anthropic/claude-3-opus',
    'hash_error2',
    8900,
    'INVALID_REQUEST',
    'The model produced invalid JSON response. Please try again.',
    NOW() - INTERVAL '2 days'
  );

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Created 2 generations, 11 flashcards (5 ai-full, 3 ai-edited, 3 manual), and 2 error logs';
  
END $$;

