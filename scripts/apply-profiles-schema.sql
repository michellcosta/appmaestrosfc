-- Script para aplicar o schema correto da tabela profiles
-- Execute este SQL no editor do Supabase

-- Primeiro, vamos verificar se a tabela existe e suas colunas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Se a tabela não tem as colunas corretas, vamos recriá-la
DROP TABLE IF EXISTS profiles CASCADE;

-- Criar a tabela profiles com o schema correto
CREATE TABLE profiles (
  id uuid primary key,
  email text not null unique,
  role text not null default 'player' check (role in ('owner','admin','aux','player')),
  membership text check (membership in ('mensalista','diarista')),
  position text check (position in ('Goleiro','Zagueiro','Meia','Atacante')),
  stars int2 check (stars between 0 and 10),
  notifications_enabled boolean not null default true,
  approved boolean not null default true,
  updated_at timestamptz default now()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "profiles: read self" ON profiles FOR SELECT USING ( auth.uid() = id );
CREATE POLICY "profiles: staff read" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role in ('owner','admin','aux'))
);
CREATE POLICY "profiles: update self" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: owner update all" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
);

-- Política para inserção (temporária - permitir inserção para testes)
CREATE POLICY "profiles: allow insert for testing" ON profiles FOR INSERT WITH CHECK (true);

-- Verificar se foi criada corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
