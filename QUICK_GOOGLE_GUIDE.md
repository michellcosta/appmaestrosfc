# 🚀 GUIA RÁPIDO: GOOGLE CLIENT ID

## **📋 PASSOS SIMPLES**

### **1️⃣ ACESSAR**
- **URL:** https://console.cloud.google.com
- **Login:** Sua conta Google

### **2️⃣ PROJETO**
- **Se não tem:** "New Project" → "nexus-play" → "Create"
- **Se já tem:** Selecione o projeto existente

### **3️⃣ CREDENTIALS**
- **Menu:** APIs & Services > Credentials
- **Botão:** + CREATE CREDENTIALS
- **Tipo:** OAuth 2.0 Client ID

### **4️⃣ CONFIGURAR**
- **Type:** Web application
- **Name:** Nexus Play
- **Origins:** 
  - `http://localhost:5173`
  - `http://localhost:5176`
- **Redirects:**
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5176/auth/callback`

### **5️⃣ COPIAR**
- **Copie:** O Client ID (formato: 123456789-abcdefg.apps.googleusercontent.com)
- **NÃO copie:** O Client Secret

## **🔍 FORMATO CORRETO**
```
123456789-abcdefg.apps.googleusercontent.com
```

## **⚠️ SE DER ERRO**
1. **"OAuth consent screen not configured"**
   - Vá para: APIs & Services > OAuth consent screen
   - Configure: External, Nexus Play, seu email
   - Volte para Credentials

2. **"APIs not enabled"**
   - Vá para: APIs & Services > Library
   - Procure: Google+ API
   - Clique: Enable

## **🎯 RESUMO**
1. **Acesse:** console.cloud.google.com
2. **Vá para:** APIs & Services > Credentials
3. **Crie:** OAuth 2.0 Client ID
4. **Configure:** Web application
5. **Copie:** O Client ID

## **💡 DICA**
**O Client ID é público e seguro para usar no frontend!**



