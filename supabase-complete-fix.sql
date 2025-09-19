-- =====================================================
-- SCRIPT COMPLETO PARA CORRIGIR O APP MAESTROS FC
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. CRIAR TABELA USERS (se não existir)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'aux', 'mensalista', 'diarista')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. HABILITAR RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. REMOVER POLÍTICAS EXISTENTES (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;

-- 4. CRIAR POLÍTICAS RLS
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can delete own profile" ON users
  FOR DELETE USING (auth.uid() = auth_id);

-- 5. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'owner'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. REMOVER TRIGGER EXISTENTE (se existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 7. CRIAR TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. REMOVER TRIGGER EXISTENTE (se existir)
DROP TRIGGER IF EXISTS handle_updated_at ON users;

-- 10. CRIAR TRIGGER PARA updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 11. CRIAR USUÁRIO PARA O MICHELL (se não existir)
INSERT INTO public.users (auth_id, email, name, role)
VALUES (
  '3e93694f-6e20-4874-a70e-83a3a565d45b',
  'michellcosta1269@gmail.com',
  'Michell Oliveira',
  'owner'
)
ON CONFLICT (auth_id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 12. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
SELECT 
  'Tabela users criada com sucesso!' as status,
  COUNT(*) as total_users
FROM users;

-- 13. MOSTRAR USUÁRIOS EXISTENTES
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users
ORDER BY created_at DESC;

-- =====================================================
-- SCRIPT EXECUTADO COM SUCESSO!
-- Agora teste o app: https://appmaestrosfc.netlify.app/
-- =====================================================
