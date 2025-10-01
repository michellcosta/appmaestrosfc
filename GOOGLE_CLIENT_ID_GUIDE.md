# 🔑 COMO ENCONTRAR O VITE_GOOGLE_CLIENT_ID

## **📋 GUIA PASSO-A-PASSO DETALHADO**

### **1️⃣ ACESSAR O GOOGLE CLOUD CONSOLE**
1. **Abra o navegador** e acesse: https://console.cloud.google.com
2. **Faça login** com sua conta Google
3. **Aceite os termos** se necessário

### **2️⃣ CRIAR OU SELECIONAR PROJETO**
**Se você NÃO tem projeto:**
1. Clique em **"Select a project"** (canto superior direito)
2. Clique em **"New Project"**
3. Digite o nome: **"nexus-play"**
4. Clique em **"Create"**
5. Aguarde a criação (1-2 minutos)

**Se você JÁ tem projeto:**
1. Clique em **"Select a project"** (canto superior direito)
2. Selecione seu projeto existente

### **3️⃣ NAVEGAR PARA CREDENTIALS**
1. No menu lateral esquerdo, clique em **"APIs & Services"**
2. Clique em **"Credentials"**
3. Você verá uma página com suas credenciais

### **4️⃣ CRIAR OAuth 2.0 CLIENT ID**
1. Clique em **"+ CREATE CREDENTIALS"** (canto superior)
2. Selecione **"OAuth 2.0 Client ID"**
3. Se for a primeira vez, você verá uma tela de configuração:
   - **Application type:** Web application
   - **Name:** Nexus Play
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
     - `http://localhost:5176`
     - `https://seu-dominio.vercel.app` (se tiver)
   - **Authorized redirect URIs:**
     - `http://localhost:5173/auth/callback`
     - `http://localhost:5176/auth/callback`
     - `https://seu-dominio.vercel.app/auth/callback` (se tiver)
4. Clique em **"Create"**

### **5️⃣ COPIAR O CLIENT ID**
1. Após criar, você verá uma popup com as credenciais
2. **COPIE o Client ID** (formato: 123456789-abcdefg.apps.googleusercontent.com)
3. **NÃO copie o Client Secret** (não precisamos)
4. Clique em **"OK"**

### **6️⃣ VERIFICAR SE ESTÁ CORRETO**
**O Client ID deve ter este formato:**
```
123456789-abcdefg.apps.googleusercontent.com
```

**Características:**
- ✅ Começa com números
- ✅ Tem hífen no meio
- ✅ Termina com `.apps.googleusercontent.com`
- ✅ Tem aproximadamente 40-50 caracteres

## **🔍 ONDE ENCONTRAR SE JÁ EXISTE**

### **Se você JÁ tem OAuth configurado:**
1. Vá para **APIs & Services > Credentials**
2. Procure por **"OAuth 2.0 Client IDs"**
3. Clique no nome do seu projeto
4. Copie o **Client ID**

### **Se você NÃO vê OAuth:**
1. Clique em **"+ CREATE CREDENTIALS"**
2. Selecione **"OAuth 2.0 Client ID"**
3. Siga os passos acima

## **⚠️ PROBLEMAS COMUNS**

### **"OAuth consent screen not configured"**
1. Vá para **APIs & Services > OAuth consent screen**
2. Escolha **"External"** (se for público)
3. Preencha os campos obrigatórios:
   - **App name:** Nexus Play
   - **User support email:** seu email
   - **Developer contact:** seu email
4. Clique em **"Save and Continue"**
5. Volte para **Credentials** e crie o OAuth

### **"APIs not enabled"**
1. Vá para **APIs & Services > Library**
2. Procure por **"Google+ API"**
3. Clique em **"Enable"**
4. Volte para **Credentials**

## **📱 ALTERNATIVA: USAR GOOGLE CLOUD MOBILE**

### **Se preferir usar o celular:**
1. Baixe o app **"Google Cloud Console"**
2. Faça login com sua conta
3. Siga os mesmos passos acima

## **🎯 RESUMO RÁPIDO**

**1. Acesse:** https://console.cloud.google.com
**2. Vá para:** APIs & Services > Credentials
**3. Clique em:** + CREATE CREDENTIALS > OAuth 2.0 Client ID
**4. Configure:** Web application com URLs de callback
**5. Copie:** O Client ID gerado

## **💡 DICA IMPORTANTE**

**O Client ID é público e pode ser exposto no frontend**
**O Client Secret é privado e deve ficar no backend**

**Para nosso caso, só precisamos do Client ID!**

## **🚀 PRÓXIMO PASSO**

**Após obter o Client ID:**
1. Cole aqui no chat
2. Vou configurar automaticamente
3. Testaremos a conexão
4. Validaremos o login



