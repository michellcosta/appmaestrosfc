-- Renomear coluna "position" para "position_text" se a tabela já existir
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela player_profiles existe
SELECT 
  'Verificando tabela player_profiles' as info,
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'player_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Renomear coluna se existir
DO $$
BEGIN
  -- Verificar se a coluna "position" existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_profiles' 
      AND column_name = 'position'
      AND table_schema = 'public'
  ) THEN
    -- Renomear a coluna
    ALTER TABLE player_profiles RENAME COLUMN "position" TO position_text;
    RAISE NOTICE 'Coluna "position" renomeada para position_text';
  ELSE
    RAISE NOTICE 'Coluna "position" não encontrada ou já renomeada';
  END IF;
END $$;

-- 3. Verificar resultado
SELECT 
  'Verificando colunas após renomeação' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'player_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
