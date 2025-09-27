-- Migration: Sistema de Convites Melhorado
-- Data: 2025-01-27
-- Descrição: Sistema completo de convites com banco de dados, analytics e integrações

-- Tabela principal de convites
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mensalista', 'diarista', 'admin', 'aux')),
  email VARCHAR(255),
  phone VARCHAR(20),
  whatsapp_message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'accepted', 'expired', 'cancelled')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  analytics JSONB DEFAULT '{}'
);

-- Tabela para tracking de eventos de convite
CREATE TABLE IF NOT EXISTS invite_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'sent', 'delivered', 'opened', 'clicked', 'accepted', 'expired', 'cancelled')),
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para templates de mensagem
CREATE TABLE IF NOT EXISTS invite_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp', 'sms')),
  subject VARCHAR(200),
  content TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para campanhas de convite (convites em massa)
CREATE TABLE IF NOT EXISTS invite_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('mensalista', 'diarista', 'admin', 'aux')),
  template_id UUID REFERENCES invite_templates(id),
  target_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  accepted_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para participantes de campanhas
CREATE TABLE IF NOT EXISTS campaign_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES invite_campaigns(id) ON DELETE CASCADE,
  invite_id UUID NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
  email VARCHAR(255),
  phone VARCHAR(20),
  name VARCHAR(100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'accepted', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, invite_id)
);

-- Tabela para configurações de integração
CREATE TABLE IF NOT EXISTS integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('whatsapp', 'email', 'sms')),
  name VARCHAR(100) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, name)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_created_by ON invites(created_by);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);

CREATE INDEX IF NOT EXISTS idx_invite_events_invite_id ON invite_events(invite_id);
CREATE INDEX IF NOT EXISTS idx_invite_events_type ON invite_events(event_type);
CREATE INDEX IF NOT EXISTS idx_invite_events_created_at ON invite_events(created_at);

CREATE INDEX IF NOT EXISTS idx_invite_templates_type ON invite_templates(type);
CREATE INDEX IF NOT EXISTS idx_invite_templates_active ON invite_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON invite_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON invite_campaigns(created_by);

CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign_id ON campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_invite_id ON campaign_participants(invite_id);

CREATE INDEX IF NOT EXISTS idx_integration_settings_provider ON integration_settings(provider);
CREATE INDEX IF NOT EXISTS idx_integration_settings_active ON integration_settings(is_active);

-- RLS (Row Level Security)
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para invites
CREATE POLICY "Staff can view all invites" ON invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

CREATE POLICY "Users can view their own invites" ON invites
  FOR SELECT USING (
    created_by = auth.uid() OR 
    accepted_by = auth.uid()
  );

CREATE POLICY "Staff can create invites" ON invites
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

CREATE POLICY "Staff can update invites" ON invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Políticas RLS para invite_events
CREATE POLICY "Staff can view all invite events" ON invite_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

CREATE POLICY "System can insert invite events" ON invite_events
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para invite_templates
CREATE POLICY "Staff can manage invite templates" ON invite_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Políticas RLS para invite_campaigns
CREATE POLICY "Staff can manage campaigns" ON invite_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Políticas RLS para campaign_participants
CREATE POLICY "Staff can manage campaign participants" ON campaign_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Políticas RLS para integration_settings
CREATE POLICY "Staff can manage integration settings" ON integration_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Função para gerar código de convite único
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  -- Verificar se já existe
  IF EXISTS (SELECT 1 FROM invites WHERE code = result) THEN
    RETURN generate_invite_code(); -- Recursivo para gerar novo código
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para criar evento de convite
CREATE OR REPLACE FUNCTION create_invite_event(
  p_invite_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}',
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO invite_events (
    invite_id,
    event_type,
    event_data,
    user_agent,
    ip_address
  ) VALUES (
    p_invite_id,
    p_event_type,
    p_event_data,
    p_user_agent,
    p_ip_address
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar analytics do convite
CREATE OR REPLACE FUNCTION update_invite_analytics(p_invite_id UUID)
RETURNS VOID AS $$
DECLARE
  events_count INTEGER;
  last_opened TIMESTAMP WITH TIME ZONE;
  last_clicked TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Contar eventos por tipo
  SELECT COUNT(*) INTO events_count
  FROM invite_events 
  WHERE invite_id = p_invite_id;
  
  -- Buscar último evento de abertura
  SELECT MAX(created_at) INTO last_opened
  FROM invite_events 
  WHERE invite_id = p_invite_id AND event_type = 'opened';
  
  -- Buscar último evento de clique
  SELECT MAX(created_at) INTO last_clicked
  FROM invite_events 
  WHERE invite_id = p_invite_id AND event_type = 'clicked';
  
  -- Atualizar analytics
  UPDATE invites 
  SET analytics = jsonb_build_object(
    'total_events', events_count,
    'last_opened', last_opened,
    'last_clicked', last_clicked,
    'updated_at', NOW()
  )
  WHERE id = p_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar evento quando convite é criado
CREATE OR REPLACE FUNCTION trigger_create_invite_event()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_invite_event(NEW.id, 'created', jsonb_build_object('type', NEW.type));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_invite_event_trigger
  AFTER INSERT ON invites
  FOR EACH ROW EXECUTE FUNCTION trigger_create_invite_event();

-- Trigger para atualizar analytics quando evento é criado
CREATE OR REPLACE FUNCTION trigger_update_invite_analytics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_invite_analytics(NEW.invite_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invite_analytics_trigger
  AFTER INSERT ON invite_events
  FOR EACH ROW EXECUTE FUNCTION trigger_update_invite_analytics();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invite_templates_updated_at
  BEFORE UPDATE ON invite_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON invite_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_participants_updated_at
  BEFORE UPDATE ON campaign_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_settings_updated_at
  BEFORE UPDATE ON integration_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir templates padrão
INSERT INTO invite_templates (name, type, subject, content, variables, created_by) VALUES
(
  'WhatsApp Mensalista',
  'whatsapp',
  NULL,
  '🏆 *Convite Especial para o Maestros FC!* 🏆

Olá! Você foi convidado para se juntar ao nosso grupo exclusivo de futebol!

🎯 *Tipo:* Mensalista (R$ 50/mês)
📅 *Vantagens:* Acesso a todas as peladas do mês
🏟️ *Local:* Campo Renato Bazin, São Gonçalo
👥 *Grupo:* Apenas 25 jogadores por pelada

🔗 *Link para se juntar:*
{invite_link}

⏰ *Este convite expira em 24 horas!*

_Seja bem-vindo ao time dos Maestros!_ ⚽',
  '{"invite_link": "string", "expires_at": "datetime"}',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'WhatsApp Diarista',
  'whatsapp',
  NULL,
  '⚽ *Convite para Pelada no Maestros FC!* ⚽

Olá! Você foi convidado para uma pelada conosco!

🎯 *Tipo:* Diarista (R$ 15 por pelada)
📅 *Data:* {match_date}
🏟️ *Local:* Campo Renato Bazin, São Gonçalo
👥 *Vagas:* Limitadas

🔗 *Link para confirmar presença:*
{invite_link}

⏰ *Confirme até: {expires_at}*

_Te esperamos no campo!_ ⚽',
  '{"invite_link": "string", "match_date": "datetime", "expires_at": "datetime"}',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Email Padrão',
  'email',
  'Convite para o Maestros FC - {type}',
  'Olá!

Você foi convidado para se juntar ao Maestros FC!

Tipo: {type}
Link: {invite_link}
Expira em: {expires_at}

Atenciosamente,
Equipe Maestros FC',
  '{"type": "string", "invite_link": "string", "expires_at": "datetime"}',
  (SELECT id FROM auth.users LIMIT 1)
);

-- Comentários nas tabelas
COMMENT ON TABLE invites IS 'Sistema principal de convites com analytics e tracking';
COMMENT ON TABLE invite_events IS 'Eventos de tracking para analytics de convites';
COMMENT ON TABLE invite_templates IS 'Templates de mensagem para diferentes tipos de convite';
COMMENT ON TABLE invite_campaigns IS 'Campanhas de convite em massa';
COMMENT ON TABLE campaign_participants IS 'Participantes de campanhas de convite';
COMMENT ON TABLE integration_settings IS 'Configurações de integração (WhatsApp, Email, SMS)';
