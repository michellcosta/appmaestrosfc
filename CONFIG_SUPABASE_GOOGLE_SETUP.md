# 🔧 Configuração Google OAuth - Supabase + Vercel

## ✅ CHECKLIST DE CONFIGURAÇÃO NECESSÁRIA

### **1️⃣ SUPABASE DASHBOARD CONFIGURATION:**

#### **OAuth Settings:**
```
1. Acesse: https://supabase.com/dashboard/
2. Vá para: Authentication > Providers  
3. Selecione: Google
4. Habilitar: Google Provider
5. Configurar Client ID e Secret
```

#### **Redirect URLs (IMPORTANTE):**
```
✅ SITELIST Requirements:
• https://seu-projeto.vercel.app/auth/callback
• https://seu-projeto.vercel.app/
• http://localhost:3000/auth/callback (development)
• http://localhost:3000/ (development)

❌ ERRO COMUM: URL sem https://
❌ ERRO COMUM: URL sem /auth/callback
❌ ERRO COMUM: Domain diferente do deployment
```

#### **Google Cloud Console:**
```
1. Acesse: https://console.cloud.google.com/
2. Projeto → APIs & Services → Credentials  
3. Create OAuth 2.0 Client IDs:
   • Type: Web application
   • Authorized JavaScript origins: 
     - https://seu-projeto.vercel.app
     - https://tua-url.supabase.co
   • Authorized redirect URIs:
     - https://seu-projeto.vercel.app/auth/callback  
     - https://tua-url.supabase.co/auth/v1/callback
```

---

### **2️⃣ VERCEL ENVIRONMENT VARIABLES:**

#### **Variáveis Necessárias no Vercel:**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://autxxmhtadimwvprfsov.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth (se necessário)  
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Redirect URLs
NEXT_PUBLIC_SUPABASE_URL=https://autxxmhtadimwvprfsov.supabase.co
```

#### **Vercel Settings:**
```
1. Deploy na Vercel
2. Settings → Environment Variables
3. Configurar as variáveis acima 
4. Redeploy da aplicação
5. Verificar Domain em Production
```

---

### **3️⃣ GOOGLE OAUTH CREDENTIALS SETUP:**

#### **Google Cloud Console Steps:**
```
1. console.cloud.google.com
2. APIs & Services → Credentials → CREATE  
3. OAuth 2.0 Client → Web App
4. Configure:
   • Name: "Maestros OAuth"
   • Authorized origins:
     - https://seu-projeto.vercel.app
     - http://localhost:3000 (dev)
   • Authorized redirects:
     - https://tua-url.supabase.co/auth/v1/callback
     - https://seu-projeto.vercel.app/auth/callback
```

#### **Get Credentials & Configure Supabase:**
```
📁 Client ID: 1234567890-abc123.apps.googleusercontent.com  
📁 Client Secret: GOCSPX-abcdefg123456789  
❗ Add these TO Supabase Dashboard Auth Settings ❗
```

---

### **4️⃣ CÓDIGO FIXES (se necessário):**

#### **Verificar redirect URL fix:**
```typescript
// src/auth/OfflineAuthProvider.tsx
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`, // ✅ FUNCIONA
      // redirectTo: 'https://seu-projeto.vercel.app/does-not-exist', // ❌ ERRO  
    }
  });
};
```

---

### **5️⃣ DEBUG CHECKLIST:**

#### **Verificar no Browser Console:**
```
🔍 OAuth erro debugging:
1. Network tab → look for 500/404 auth requests  
2. See redirect errors despite setup  
3. Check if Supabase URL is correct  
4. Test OAuth URL generation manually
5. Verify credentials STEP by STEP
```

#### **Common Fixes:**
```
✅ JSON File Uploads: 
  • Don't manually upload the API JSON do Supabase interface
  • Do assim upload manual somente se FULL credentials  
 
✅ Header OsAuth2 correctly directed 
• Add: "origin" header = domain deployment     
✅ ns domain resolution between DevOps ⇌ integration  
 
✅ Disable "Test" Mode a acertar to "Live" Mode 
```

---

### **6️⃣ TESTING STEPS:**

```
1. Trigger the "Criar Owner com Google" button 
2. Should open Google OAuth popup
3. Auth → redirect back to home
4. Verify owner created us status  
5. Check logs if continuing errors on Supabase logs  
```

---

**❗ EM PRÓXIMOS STEPS - IF STILL NOT WORKING:**

**📝 Config Supabase AFTER Google Credentials on Vercel deployment:**
- Try delete Google credentials, re-add
- Re-check redirect URI in Supabase duplicate entries
- Any 500/404s in network tab during popup auth try

**🔧 Enhanced debugging steps if still stuck coming next** 


