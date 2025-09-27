# 🔧 CONFIGURAÇÃO GOOGLE OAUTH - LOCALHOST

## ✅ **CONFIGURAÇÃO PARA DEVELOPMENT LOCAL**

### **1️⃣ GOOGLE CLOUD CONSOLE SETUP:**

```bash
# 1. Acesse: https://console.cloud.google.com/apis/credentials
# 2. Create OAuth 2.0 Client ID
# 3. Application type: Web Application

JAVASCRIPT ORIGINS (adicione ambos):
✅ http://localhost:5173
✅ https://autxxmhtadimwvprfsov.supabase.co

REDIRECT URIS (adicione ambos):
✅ http://localhost:5173/auth/callback  
✅ https://autxxmhtadimwvprfsov.supabase.co/auth/v1/callback
```

### **2️⃣ SUPABASE DASHBOARD CONFIGURATION:**

```bash
# 1. Acesse: Supabase Dashboard → Setting → Auth → Providers → Google
# 2. Enable ✅ Google Provider
# 3. Add Client ID e Client Secret do Google Console acima
# 4. Redirect URL configurada automaticamente pelas URIs do Supabase

REDIRECT URLS no Supabase:
✅ http://localhost:5173/  (detectado automaticamente)
✅ https://seu-projeto.vercel.app/ (produção)
```

### **3️⃣ GCFPOLO ADD Python CALLBACK (se necessário):**

```bash
# No vite.config.ts, verificar se tem config de proxy
# Ou adicionar redirect handling no AuthProvider
```

### **4️⃣ TESTS DEVALOPMENT (LOCALHOST):**

```bash
# Run dev environment:
npm run dev

# Navigate to: http://localhost:5173
# Click "Criar Owner with Google"  
# Deveria abrir Pop-up Google OAuth
# After auth → redirect para localhost:5173/
```

---

## 🚀 **ADDITIONAL TODO - LOCALHOST REDIRECT HANDLER**

Se precisar de um redirect handler local, criar página /auth/callback:

```typescript
// src/pages/AuthCallback.tsx (optional)
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle auth success/error aqui se necessário
    const handleAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('access_token');
      const error = urlParams.get('error');
      
      if (error) {
        console.error('Auth Error:', error);
        navigate('/', { replace: true });
      }
      if (token) {
        console.log('Auth Success token detected');
        navigate('/', { replace: true });
      }
    };
    handleAuthCallback();
  }, [navigate]);
  
  return <div>Carregando...</div>;
}
```

Mas o SigInWithOAuth call should handle redirect automatically via global React eggs authentication state.

