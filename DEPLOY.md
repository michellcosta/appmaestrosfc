# 🚀 Guia de Deploy - App Maestros FC

## Opções de Deploy

### 1. 🏠 Desenvolvimento Local
```bash
npm run dev
```
Acesse: http://localhost:5173

### 2. 🌐 Netlify (Recomendado)
1. Conecte seu repositório GitHub ao Netlify
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`: https://autxxmhtadimwvprfsov.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig
3. Deploy automático!

### 3. 📄 GitHub Pages (GRATUITO - RECOMENDADO)

**Para Windows:**
```cmd
deploy-github.bat
```

**Para Linux/Mac:**
```bash
chmod +x deploy-github.sh
./deploy-github.sh
```

**Configuração no GitHub:**
1. Vá em Settings > Pages
2. Source: Deploy from a branch
3. Branch: gh-pages
4. Folder: / (root)
5. Salve e aguarde alguns minutos

### 4. 🔧 Vercel (Alternativo)
```bash
vercel --prod
```

## 🛠️ Configuração do Supabase

### 1. Habilitar Google OAuth
1. Acesse: https://supabase.com/dashboard
2. Vá em Authentication > Providers
3. Habilite Google
4. Configure:
   - Client ID: (do Google Cloud Console)
   - Client Secret: (do Google Cloud Console)
   - Redirect URLs: https://seu-dominio.com

### 2. Configurar Google Cloud Console
1. Acesse: https://console.cloud.google.com
2. Crie um projeto ou selecione existente
3. Habilite Google+ API
4. Configure OAuth consent screen
5. Crie credenciais OAuth 2.0
6. Adicione URLs autorizadas:
   - https://seu-dominio.com
   - https://seu-dominio.com/auth/callback

## 🐛 Troubleshooting

### Tela Branca
- Verifique se as variáveis de ambiente estão configuradas
- Teste localmente primeiro: `npm run dev`
- Verifique o console do navegador para erros

### Login com Google não funciona
- Verifique se o Google OAuth está habilitado no Supabase
- Confirme as URLs de redirecionamento
- Teste a página de debug: `/debug-auth`

### Problemas de Build
- Limpe o cache: `rm -rf node_modules package-lock.json && npm install`
- Verifique se todas as dependências estão instaladas
- Teste o build local: `npm run build`

## 📱 Teste Mobile

1. Acesse o app no celular
2. Teste o login com Google
3. Verifique se a dashboard do Owner aparece
4. Teste todas as funcionalidades

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com)
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com)
