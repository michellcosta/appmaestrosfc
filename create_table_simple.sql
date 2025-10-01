-- Script SQL simples para criar a tabela player_profiles
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela player_profiles
CREATE TABLE player_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  position_text text NOT NULL DEFAULT 'Meia',
  shirt_size text NOT NULL DEFAULT 'G',
  stars integer NOT NULL DEFAULT 5,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Habilitar RLS
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar política básica
CREATE POLICY "Enable all operations for all users" ON player_profiles
  FOR ALL USING (true);

-- 4. Verificar se a tabela foi criada
SELECT 'Tabela player_profiles criada com sucesso!' as status;



