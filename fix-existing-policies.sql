-- Fix for existing policies error
-- This script drops existing policies and recreates them

-- Drop existing policies first
DROP POLICY IF EXISTS "venue_read_all" ON app_settings_venue;
DROP POLICY IF EXISTS "venue_write_owner" ON app_settings_venue;
DROP POLICY IF EXISTS "venue_insert_owner" ON app_settings_venue;
DROP POLICY IF EXISTS "users_select_self_or_admin" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;
DROP POLICY IF EXISTS "matches_select_all" ON matches;
DROP POLICY IF EXISTS "matches_cud_admin" ON matches;
DROP POLICY IF EXISTS "match_state_select_all" ON match_state;
DROP POLICY IF EXISTS "match_state_cud_ops" ON match_state;
DROP POLICY IF EXISTS "checkins_select_same_match" ON checkins;
DROP POLICY IF EXISTS "checkins_insert_self" ON checkins;
DROP POLICY IF EXISTS "checkins_update_admin" ON checkins;
DROP POLICY IF EXISTS "team_draw_select_all" ON team_draw;
DROP POLICY IF EXISTS "team_draw_cud_ops" ON team_draw;
DROP POLICY IF EXISTS "team_app_select_all" ON team_appearance;
DROP POLICY IF EXISTS "team_app_cud_ops" ON team_appearance;
DROP POLICY IF EXISTS "events_select_all" ON events;
DROP POLICY IF EXISTS "events_cud_ops" ON events;
DROP POLICY IF EXISTS "tb_select_all" ON tiebreaker_event;
DROP POLICY IF EXISTS "tb_cud_ops" ON tiebreaker_event;
DROP POLICY IF EXISTS "dr_select_self_or_admin" ON diarist_requests;
DROP POLICY IF EXISTS "dr_insert_self" ON diarist_requests;
DROP POLICY IF EXISTS "dr_update_admin" ON diarist_requests;
DROP POLICY IF EXISTS "pay_select_self_or_admin" ON payments;
DROP POLICY IF EXISTS "pay_block_cud_client" ON payments;
DROP POLICY IF EXISTS "credits_select_self_or_admin" ON credits;
DROP POLICY IF EXISTS "credits_block_cud_client" ON credits;
DROP POLICY IF EXISTS "notice_select_all" ON notice;
DROP POLICY IF EXISTS "notice_cud_admin" ON notice;
DROP POLICY IF EXISTS "tmpl_select_admin" ON notification_templates;
DROP POLICY IF EXISTS "tmpl_cud_owner" ON notification_templates;
DROP POLICY IF EXISTS "audit_select_admin" ON audit_log;
DROP POLICY IF EXISTS "audit_block_cud_client" ON audit_log;

-- Now recreate all policies
-- app_settings_venue: Owner lê/escreve; demais somente leitura
CREATE POLICY venue_read_all ON app_settings_venue
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY venue_write_owner ON app_settings_venue
FOR UPDATE USING (public.is_owner());
CREATE POLICY venue_insert_owner ON app_settings_venue
FOR INSERT WITH CHECK (public.is_owner());

-- users
CREATE POLICY users_select_self_or_admin ON users
FOR SELECT USING (public.is_admin_or_owner() OR auth.uid() = auth_id);

CREATE POLICY users_update_self ON users
FOR UPDATE USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Matches
CREATE POLICY matches_select_all ON matches
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY matches_cud_admin ON matches
FOR ALL USING (public.is_admin_or_owner())
WITH CHECK (public.is_admin_or_owner());

-- match_state (só admin/aux/owner mexe; todos leem)
CREATE POLICY match_state_select_all ON match_state
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY match_state_cud_ops ON match_state
FOR ALL USING (public.is_aux_admin_owner())
WITH CHECK (public.is_aux_admin_owner());

-- checkins
CREATE POLICY checkins_select_same_match ON checkins
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY checkins_insert_self ON checkins
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.id = user_id)
);

CREATE POLICY checkins_update_admin ON checkins
FOR UPDATE USING (public.is_admin_or_owner());

-- team_draw
CREATE POLICY team_draw_select_all ON team_draw
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY team_draw_cud_ops ON team_draw
FOR ALL USING (public.is_aux_admin_owner())
WITH CHECK (public.is_aux_admin_owner());

-- team_appearance
CREATE POLICY team_app_select_all ON team_appearance
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY team_app_cud_ops ON team_appearance
FOR ALL USING (public.is_aux_admin_owner())
WITH CHECK (public.is_aux_admin_owner());

-- events
CREATE POLICY events_select_all ON events
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY events_cud_ops ON events
FOR ALL USING (public.is_aux_admin_owner())
WITH CHECK (public.is_aux_admin_owner());

-- tiebreaker_event
CREATE POLICY tb_select_all ON tiebreaker_event
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY tb_cud_ops ON tiebreaker_event
FOR ALL USING (public.is_aux_admin_owner())
WITH CHECK (public.is_aux_admin_owner());

-- diarist_requests
CREATE POLICY dr_select_self_or_admin ON diarist_requests
FOR SELECT USING (
  public.is_aux_admin_owner() OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.id = user_id)
);

CREATE POLICY dr_insert_self ON diarist_requests
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.id = user_id)
);

CREATE POLICY dr_update_admin ON diarist_requests
FOR UPDATE USING (public.is_admin_or_owner())
WITH CHECK (public.is_admin_or_owner());

-- payments (somente service role atualiza status; cliente só lê o que é seu)
CREATE POLICY pay_select_self_or_admin ON payments
FOR SELECT USING (
  public.is_admin_or_owner() OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.id = user_id)
);

-- Não permitir insert/update/delete pelo cliente; apenas via Edge Functions (service role)
CREATE POLICY pay_block_cud_client ON payments
FOR ALL USING (false) WITH CHECK (false);

-- credits (somente leitura para o dono; escrita via functions)
CREATE POLICY credits_select_self_or_admin ON credits
FOR SELECT USING (
  public.is_admin_or_owner() OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.id = user_id)
);
CREATE POLICY credits_block_cud_client ON credits
FOR ALL USING (false) WITH CHECK (false);

-- notice
CREATE POLICY notice_select_all ON notice
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY notice_cud_admin ON notice
FOR ALL USING (public.is_admin_or_owner())
WITH CHECK (public.is_admin_or_owner());

-- notification_templates
CREATE POLICY tmpl_select_admin ON notification_templates
FOR SELECT USING (public.is_admin_or_owner());

CREATE POLICY tmpl_cud_owner ON notification_templates
FOR ALL USING (public.is_owner())
WITH CHECK (public.is_owner());

-- audit_log (somente admin/owner lê; escrita via service role)
CREATE POLICY audit_select_admin ON audit_log
FOR SELECT USING (public.is_admin_or_owner());

CREATE POLICY audit_block_cud_client ON audit_log
FOR ALL USING (false) WITH CHECK (false);
