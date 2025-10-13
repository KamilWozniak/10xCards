-- migration: add test user for development
-- description: creates a test user in auth.users for development purposes
-- tables affected: auth.users
-- special notes: 
--   - this user will be used for development testing
--   - user_id: 1b80fade-ccb5-43e8-ba09-c2e07bd3ddf9

-- ============================================================================
-- insert test user into auth.users
-- ============================================================================

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values (
  '1b80fade-ccb5-43e8-ba09-c2e07bd3ddf9'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  null,
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- ============================================================================
-- insert corresponding identity record
-- ============================================================================

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) values (
  '1b80fade-ccb5-43e8-ba09-c2e07bd3ddf9'::uuid,
  '1b80fade-ccb5-43e8-ba09-c2e07bd3ddf9'::uuid,
  '1b80fade-ccb5-43e8-ba09-c2e07bd3ddf9',
  '{"sub": "1b80fade-ccb5-43e8-ba09-c2e07bd3ddf9", "email": "test@example.com", "email_verified": true, "phone_verified": false}',
  'email',
  now(),
  now(),
  now()
);
