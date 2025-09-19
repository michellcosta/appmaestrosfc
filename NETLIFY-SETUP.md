# 🚀 Deploy no Netlify - Guia Completo

## 📋 **Passo a Passo:**

### **1. 🌐 Acesse o Netlify:**
- Vá em: https://netlify.com
- Clique em **"Sign up"**
- Escolha **"Sign up with GitHub"**

### **2. 🔗 Conecte seu Repositório:**
- Clique em **"New site from Git"**
- Escolha **"GitHub"**
- Selecione **"michell-oliveira/appmaestrosfc"**

### **3. ⚙️ Configurações de Build:**
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `18`

### **4. 🔑 Variáveis de Ambiente:**
Vá em **Site settings** > **Environment variables** e adicione:

```
VITE_SUPABASE_URL = https://autxxmhtadimwvprfsov.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig
```

### **5. 🚀 Deploy:**
- Clique em **"Deploy site"**
- Aguarde 2-3 minutos
- Seu app estará em: `https://appmaestrosfc.netlify.app`

## 🎉 **Vantagens do Netlify:**

✅ **Deploy automático** - toda vez que você fizer push no GitHub
✅ **URL personalizada** - pode mudar para `appmaestrosfc.netlify.app`
✅ **HTTPS automático** - segurança garantida
✅ **CDN global** - carrega rápido no mundo todo
✅ **Sem problemas** de MIME type ou roteamento
✅ **Logs detalhados** - fácil debug
✅ **Preview de branches** - testa antes de publicar

## 📱 **Teste Mobile:**
- ✅ Funciona perfeitamente no celular
- ✅ PWA ready
- ✅ Offline support
- ✅ Push notifications

## 🔧 **Se der problema:**
1. Verifique os logs em **Deploys** > **Deploy log**
2. Confirme se as variáveis de ambiente estão corretas
3. Teste localmente primeiro: `npm run dev`
