# Variáveis de Ambiente - App Maestros FC

## Configuração no Vercel

### 1. Acesse o Dashboard Vercel
- Settings → Environment Variables

### 2. Adicione as seguintes variáveis:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://autxxmhtadimwvprfsov.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig

# App Environment
NODE_ENV=production
VITE_APP_ENV=production
```

### 3. Configuração por Ambiente:
- ✅ **Production** - Todas as variáveis
- ✅ **Preview** - Todas as variáveis  
- ✅ **Development** - Todas as variáveis

### 4. Após configurar:
- Faça um novo deploy
- As variáveis serão aplicadas automaticamente

## Variáveis Opcionais (Futuras):

```bash
# Google OAuth (se configurado)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Analytics (se configurado)
VITE_GA_TRACKING_ID=your_ga_tracking_id

# API Keys (se necessário)
VITE_API_BASE_URL=your_api_base_url
```

## Verificação:

Após o deploy, verifique no console do browser:
- ✅ "🔍 Supabase configurado:"
- ✅ "URL: https://autxxmhtadimwvprfsov.supabase.co"
- ✅ "Key: ✅ Definida"
