# 🔑 KEYS NECESSÁRIAS PARA NEXUS PLAY

## **📋 LISTA EXATA DO QUE PRECISA**

### **1️⃣ VITE_GOOGLE_CLIENT_ID (OBRIGATÓRIO)**
**O que é:** Client ID do Google OAuth para login
**Onde encontrar:**
1. Acesse: https://console.cloud.google.com
2. Vá para: APIs & Services > Credentials
3. Encontre: OAuth 2.0 Client ID
4. Copie: O Client ID (formato: 123456789-abcdefg.apps.googleusercontent.com)

**Formato esperado:**
```
VITE_GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
```

### **2️⃣ VITE_GA_MEASUREMENT_ID (OPCIONAL)**
**O que é:** ID do Google Analytics para métricas
**Onde encontrar:**
1. Acesse: https://analytics.google.com
2. Vá para: Admin > Property
3. Copie: Measurement ID (formato: G-XXXXXXXXXX)

**Formato esperado:**
```
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### **3️⃣ VITE_SENTRY_DSN (OPCIONAL)**
**O que é:** DSN do Sentry para error tracking
**Onde encontrar:**
1. Acesse: https://sentry.io
2. Vá para: Settings > Projects
3. Copie: DSN (formato: https://abc@123.ingest.sentry.io/456)

**Formato esperado:**
```
VITE_SENTRY_DSN="https://abc@123.ingest.sentry.io/456"
```

## **📋 KEYS JÁ CONFIGURADAS (NÃO PRECISA)**

### **✅ VITE_SUPABASE_URL**
```
VITE_SUPABASE_URL="https://autxxmhtadimwvprfsov.supabase.co"
```

### **✅ VITE_SUPABASE_ANON_KEY**
```
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig"
```

## **🎯 RESUMO DO QUE PRECISA**

**OBRIGATÓRIO:**
- ❌ **VITE_GOOGLE_CLIENT_ID** (para login com Google)

**OPCIONAL (mas recomendado):**
- ❌ **VITE_GA_MEASUREMENT_ID** (para analytics)
- ❌ **VITE_SENTRY_DSN** (para error tracking)

## **💡 COMO FORNECER**

**1. Cole cada key quando eu pedir**
**2. Vou configurar automaticamente**
**3. Testaremos as conexões**

## **🚀 VAMOS COMEÇAR**

**Cole a primeira key: VITE_GOOGLE_CLIENT_ID**



