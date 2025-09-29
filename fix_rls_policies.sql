-- ============================================
-- Nexus Play - CORRIGIR POLÍTICAS RLS
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'memberships'
ORDER BY policyname;

-- 2. Remover todas as políticas problemáticas
DROP POLICY IF EXISTS memb_rw ON public.memberships;
DROP POLICY IF EXISTS memb_select ON public.memberships;
DROP POLICY IF EXISTS memb_insert ON public.memberships;
DROP POLICY IF EXISTS memb_update ON public.memberships;
DROP POLICY IF EXISTS memb_delete ON public.memberships;

-- 3. Criar políticas simples e seguras
CREATE POLICY memb_select ON public.memberships
FOR SELECT USING (
  auth.uid() IS NOT NULL
);

CREATE POLICY memb_insert ON public.memberships
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY memb_update ON public.memberships
FOR UPDATE USING (
  auth.uid() IS NOT NULL
);

CREATE POLICY memb_delete ON public.memberships
FOR DELETE USING (
  auth.uid() IS NOT NULL
);

-- 4. Verificar se as políticas foram criadas
SELECT 
  'Políticas criadas:' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'memberships'
ORDER BY policyname;

-- 5. Testar se a consulta funciona agora
SELECT 
  'Teste de consulta:' as status,
  COUNT(*) as total_memberships
FROM public.memberships;

-- 6. Verificar dados
SELECT 
  'Dados encontrados:' as status,
  m.role,
  m.user_id,
  m.created_at
FROM public.memberships m
ORDER BY m.created_at DESC
LIMIT 5;

-- ============================================
-- FIM - Políticas RLS corrigidas
-- ============================================
