# 🚀 GUIA DE CONFIGURAÇÃO PARA PRODUÇÃO

## **📋 CHECKLIST PARA USO REAL**

### **1️⃣ CONFIGURAÇÃO DO SUPABASE**

**Passo 1: Criar projeto no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e ANON KEY

**Passo 2: Configurar variáveis de ambiente**
```bash
# Criar arquivo .env.local
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

**Passo 3: Executar migrações**
```sql
-- Executar no SQL Editor do Supabase
-- Copiar e colar o conteúdo de supabase/schema_app.sql
```

### **2️⃣ CONFIGURAÇÃO DO GOOGLE OAUTH**

**Passo 1: Criar projeto no Google Cloud**
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative a Google+ API

**Passo 2: Configurar OAuth**
1. Vá para "APIs & Services" > "Credentials"
2. Crie "OAuth 2.0 Client ID"
3. Configure as URLs:
   - **Authorized JavaScript origins:** `http://localhost:5173`, `https://seu-dominio.com`
   - **Authorized redirect URIs:** `http://localhost:5173/auth/callback`, `https://seu-dominio.com/auth/callback`

**Passo 3: Configurar no Supabase**
1. Vá para Authentication > Providers
2. Ative Google Provider
3. Cole o Client ID e Client Secret

### **3️⃣ CONFIGURAÇÃO DE DEPLOY**

**Opção 1: Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Opção 2: Netlify**
```bash
# Build do projeto
npm run build

# Deploy da pasta dist
```

**Opção 3: GitHub Pages**
```bash
# Configurar GitHub Actions
# Deploy automático
```

### **4️⃣ CONFIGURAÇÃO DE MONITORAMENTO**

**Google Analytics:**
1. Criar conta no Google Analytics
2. Obter Measurement ID
3. Adicionar ao .env.local

**Sentry (Error Tracking):**
1. Criar conta no Sentry
2. Obter DSN
3. Adicionar ao .env.local

### **5️⃣ CONFIGURAÇÃO DE DOMÍNIO**

**Passo 1: Comprar domínio**
- Recomendado: Namecheap, GoDaddy, etc.

**Passo 2: Configurar DNS**
- Aponte para o serviço de deploy escolhido

**Passo 3: Configurar SSL**
- Automático na maioria dos serviços

### **6️⃣ TESTES FINAIS**

**Checklist de Testes:**
- [ ] Login com Google funciona
- [ ] Adicionar jogadores funciona
- [ ] Editar jogadores funciona
- [ ] Excluir jogadores funciona
- [ ] Sistema de convites funciona
- [ ] Configurações de perfil funcionam
- [ ] Logout seguro funciona
- [ ] Responsivo em mobile
- [ ] Performance está boa
- [ ] Analytics funcionando

### **7️⃣ CONFIGURAÇÕES DE SEGURANÇA**

**Supabase RLS:**
```sql
-- Verificar se todas as políticas estão ativas
SELECT * FROM pg_policies;
```

**Headers de Segurança:**
- Já configurados no vite.config.ts
- Verificar se estão sendo aplicados

**Rate Limiting:**
- Já implementado
- Verificar se está funcionando

### **8️⃣ BACKUP E RECUPERAÇÃO**

**Backup Automático:**
- Configurado no sistema
- Verificar se está funcionando

**Monitoramento:**
- Dashboard implementado
- Verificar métricas

### **9️⃣ DOCUMENTAÇÃO PARA USUÁRIOS**

**Criar documentação:**
- Como usar o sistema
- FAQ
- Suporte

### **🔟 LANÇAMENTO**

**Pré-lançamento:**
1. Testar com usuários beta
2. Coletar feedback
3. Corrigir bugs
4. Otimizar performance

**Lançamento:**
1. Comunicar para usuários
2. Monitorar métricas
3. Suporte ativo
4. Iterações rápidas

## **📞 SUPORTE**

**Em caso de problemas:**
1. Verificar logs do Supabase
2. Verificar logs do deploy
3. Verificar configurações
4. Contatar suporte

**Recursos úteis:**
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Google OAuth](https://developers.google.com/identity/protocols/oauth2)



