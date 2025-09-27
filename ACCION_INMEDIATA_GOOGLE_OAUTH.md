# 🚨 PILHA AUTENTIC (ERRO RESOLUÇÃO GUIA) 

## 📋 CHECKLIST RÁPIDO TO DEBUG

### ✅ **HOJE PRECISAMOS VALIDAR:**
1. **Google OAuth Client já está criado?** (Verificar em G Cloud Console) 
2. **REDIRECT URI está configurado?** 
3. **Supabase provider habilitado no dashboard correto?**

---

## 🔧 **PASSO A PASSO EXECUTAR AGORA** 

### **1️⃣ SUPABASE CHECKLIST:** 
```
☑️ 1. Dashboard → Projects → autxxmhtadimwvprfsov  
☑️ 2. Settings → Auth → Providers → Google
☑️ 3. CLICK "Enable provider" → Toggle ON
☑️ 4. ADD Client ID & Secret (pegadas do Google)
☉ MISSING: Client ID ainda não está configurado ❌  
```

### **2️⃣ GOOGLE SETUP CRITICAL:**
```
□ 1. https://console.cloud.google.com/ 
□ 2. APIs & Services → Credentials 
□ 3. CREATE "OAuth 2.0 Client IDs" 
□ 4. WEB APPLICATION → add origins/redirects:  
   🔹 Origins: [seu_app.vercel.app] + supabase.co  
   🔹 Redirect: supabase.co/auth/v1/callback  
```

### **3️⃣ VERCEL TTENUE CHECK:** 
```bash
✅ ENV variables já configuradas no projeto
? Deploy settings correctly pointing?  
Subsequent new deploys will pick env vars.
```

---

## 📋 DEBUG EVENTS LOCALLY  

Teste Imediado:
```bash  
1 Abra Developer Tools
2 Navigate ao "Criar Owner with Google"  
3 Checkl console para errors:
   • popup_blocked / OAuth origin issues
   • "redirect" / google_oauth misconfig
   • CORS/preflight fails → domain mismatch logs 
```

If errors appear after GoC&S config set:
Redirect to /auth/callback is expected there.

## ▶ ️Next quick-check...
 Needs: Google OAuth Client TB cr numbers DO it via G Cloud dashboard ea boilerplate directly Config client todo Webserve.

 Alternatively confirm 
 WR Sure ê environment variables cabe up nesting credential files thereafter.
```


