-- Script para criar usuário Owner no Supabase
-- Execute este SQL no SQL Editor do Supabase

-- 1. Primeiro, vamos criar o usuário na tabela auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'seu-email@exemplo.com', -- SUBSTITUA pelo seu email
  crypt('senha-temporaria', gen_salt('bf')), -- SUBSTITUA pela senha que você quer
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- 2. Agora vamos criar o perfil na tabela users
INSERT INTO public.users (
  id,
  auth_id,
  email,
  name,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com'), -- SUBSTITUA pelo seu email
  'seu-email@exemplo.com', -- SUBSTITUA pelo seu email
  'Seu Nome Completo', -- SUBSTITUA pelo seu nome
  'owner',
  now(),
  now()
);

-- 3. Verificar se foi criado corretamente
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.created_at
FROM public.users u
WHERE u.email = 'seu-email@exemplo.com'; -- SUBSTITUA pelo seu email
