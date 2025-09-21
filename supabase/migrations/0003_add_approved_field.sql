-- Adiciona campo approved para controle de aprovação de diaristas
-- Migração: 0003_add_approved_field.sql

-- Adicionar campo approved na tabela profiles
ALTER TABLE profiles 
ADD COLUMN approved boolean DEFAULT true;

-- Comentário sobre o campo
COMMENT ON COLUMN profiles.approved IS 'Campo para controle de aprovação de diaristas. true = aprovado, false = pendente de aprovação. Default true para compatibilidade com usuários existentes.';

-- Atualizar todos os usuários existentes como aprovados (para não quebrar o fluxo atual)
UPDATE profiles SET approved = true WHERE approved IS NULL;

-- Tornar o campo NOT NULL após a atualização
ALTER TABLE profiles 
ALTER COLUMN approved SET NOT NULL;

-- Criar índice para otimizar consultas por status de aprovação
CREATE INDEX idx_profiles_approved ON profiles(approved);

-- Criar índice composto para consultas de diaristas pendentes
CREATE INDEX idx_profiles_membership_approved ON profiles(membership, approved) 
WHERE membership = 'diarista';