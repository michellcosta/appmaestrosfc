-- ============================================
-- Nexus Play - TESTE DE CONEXÃO COM BANCO
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar se o usuário está logado
SELECT
  CASE
    WHEN auth.uid() IS NOT NULL THEN 'SUCESSO: Usuário logado'
    ELSE 'ERRO: Nenhum usuário logado'
  END as status_login;

-- 2. Verificar se há grupos
SELECT 
  COUNT(*) as total_groups,
  name,
  owner_id
FROM public.groups;

-- 3. Verificar se há memberships
SELECT 
  COUNT(*) as total_memberships,
  role,
  status
FROM public.memberships;

-- 4. Verificar se há carteiras
SELECT 
  COUNT(*) as total_wallets,
  balance_cents
FROM public.wallets;

-- 5. Verificar se há usuários no sistema
SELECT 
  COUNT(*) as total_users
FROM auth.users;

-- 6. Testar inserção de um grupo de teste
INSERT INTO public.groups(name, owner_id)
VALUES ('Grupo Teste', auth.uid())
ON CONFLICT DO NOTHING;

-- 7. Verificar se a inserção funcionou
SELECT 
  COUNT(*) as grupos_apos_teste
FROM public.groups;

-- ============================================
-- FIM - Teste de conexão
-- ============================================
