-- RLS / Policies
alter table app_settings_venue enable row level security;
alter table users enable row level security;
alter table matches enable row level security;
-- (continua igual ao patch que te passei antes)
