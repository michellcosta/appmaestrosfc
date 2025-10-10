# 🚀 Deploy Maestros FC no Vercel

## ✅ Checklist Pré-Deploy

### 1. Verificar Configurações Locais

- [ ] Código commitado no Git
- [ ] `vercel.json` existe (✅ já existe)
- [ ] `package.json` com script `build` (✅ já existe)
- [ ] Convex deployment ativo em `expert-eagle-519.convex.cloud`

### 2. Variáveis de Ambiente

**No Vercel, você precisará adicionar:**

```env
VITE_CONVEX_URL=https://SEU-CONVEX-URL.convex.cloud
VITE_GOOGLE_CLIENT_ID=SEU-GOOGLE-CLIENT-ID.apps.googleusercontent.com
```

**⚠️ IMPORTANTE:** `VITE_GOOGLE_CLIENT_SECRET` deve estar **APENAS** no Convex:
```bash
npx convex env set VITE_GOOGLE_CLIENT_SECRET SEU-GOOGLE-CLIENT-SECRET
npx convex deploy
```

---

## 🌐 Passo a Passo - Deploy no Vercel

### **Passo 1: Criar Projeto no Vercel**

1. Acesse: https://vercel.com/new
2. Escolha o repositório: `nexus-play`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `.` (raiz do projeto)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### **Passo 2: Adicionar Environment Variables**

Na mesma tela de configuração (ou depois em Settings → Environment Variables):

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_CONVEX_URL` | `https://SEU-CONVEX-URL.convex.cloud` | Production, Preview, Development |
| `VITE_GOOGLE_CLIENT_ID` | `SEU-GOOGLE-CLIENT-ID.apps.googleusercontent.com` | Production, Preview, Development |

**⚠️ NÃO adicione `VITE_GOOGLE_CLIENT_SECRET` no Vercel!** Ele já está no Convex.

### **Passo 3: Deploy!**

1. Clique em **"Deploy"**
2. Aguarde o build (~2-3 minutos)
3. Vercel vai gerar um domínio: `https://nexus-play.vercel.app`

---

## 🔧 Passo 4: Configurar Google OAuth

Após o deploy, você precisa atualizar as **Authorized Redirect URIs** no Google Cloud Console:

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Selecione seu **OAuth 2.0 Client ID**
3. Adicione nas **Authorized redirect URIs**:
   ```
   https://nexus-play.vercel.app/auth/callback
   https://expert-eagle-519.convex.site/api/auth/callback/google
   ```
4. Adicione nas **Authorized JavaScript origins**:
   ```
   https://nexus-play.vercel.app
   ```
5. Clique em **"Save"**

---

## 🧪 Passo 5: Testar o Deploy

### **Checklist de Testes:**

- [ ] Acesse `https://nexus-play.vercel.app`
- [ ] Login com Google funciona
- [ ] Login offline funciona (Owner/Admin)
- [ ] Navegação entre páginas
- [ ] Tema escuro/claro funciona
- [ ] Sortear times funciona
- [ ] Gerenciar jogadores carrega
- [ ] Mobile responsivo

### **Debug (se necessário):**

1. **Logs no Vercel:**
   - Project → Deployments → Última build → Logs
   
2. **Console do navegador:**
   - F12 → Console → Verificar erros
   
3. **Verificar env vars:**
   - Settings → Environment Variables → Confirmar valores

---

## 🔄 Passo 6: Automatizar Deploys

### **Deploy Automático:**

Qualquer push na branch `main` dispara novo deploy automaticamente.

### **Preview Deployments:**

Pull Requests geram deploys de preview automaticamente.

### **CLI (Opcional):**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Link do projeto
vercel link

# Adicionar env vars via CLI
vercel env add VITE_CONVEX_URL production
vercel env add VITE_GOOGLE_CLIENT_ID production

# Deploy manual
vercel --prod
```

---

## 🎯 Configurações Avançadas (Opcional)

### **Custom Domain:**

1. Settings → Domains → Add Domain
2. Configure DNS no seu registrador
3. Aguarde propagação (~24h)

### **Performance:**

Vercel já otimiza automaticamente:
- ✅ Edge caching
- ✅ Brotli compression
- ✅ HTTP/2
- ✅ CDN global

### **Analytics:**

1. Settings → Analytics → Enable
2. Monitore visitas, Core Web Vitals

---

## 🚨 Troubleshooting Comum

### **Problema: Tela branca no Vercel**

**Solução:**
```bash
# Verificar se dist/ está sendo gerado corretamente
npm run build
ls -la dist/

# Verificar vercel.json rewrites
# Deve ter: {"source": "/(.*)", "destination": "/index.html"}
```

### **Problema: "Convex não conecta"**

**Solução:**
- Verificar `VITE_CONVEX_URL` nas env vars
- Confirmar que Convex está deployado: `npx convex deploy`

### **Problema: "Google OAuth 400"**

**Solução:**
- Adicionar domínio Vercel nas Authorized URIs do Google
- Verificar `VITE_GOOGLE_CLIENT_ID`

### **Problema: "Build failed"**

**Solução:**
```bash
# Testar build localmente
npm run build

# Ver logs detalhados
vercel logs <deployment-url>
```

---

## 📊 Status Atual do Projeto

### **✅ Pronto para Deploy:**
- ✅ `vercel.json` configurado
- ✅ Build script: `npm run build`
- ✅ Output: `dist/`
- ✅ Convex: `expert-eagle-519.convex.cloud`
- ✅ Google OAuth configurado
- ✅ Código otimizado (mobile + dark mode)
- ✅ framer-motion instalado

### **📝 Variáveis a Adicionar no Vercel:**
1. `VITE_CONVEX_URL` → `https://expert-eagle-519.convex.cloud`
2. `VITE_GOOGLE_CLIENT_ID` → `999325053713-agf0sdhvntmerq7s56caqaisgeep3apv.apps.googleusercontent.com`

---

## 🎉 Próximos Passos

1. **Commit & Push** (se ainda não fez)
   ```bash
   git add .
   git commit -m "feat: Sistema completo com dark mode, mobile-first e login premium"
   git push origin main
   ```

2. **Acessar Vercel**
   - https://vercel.com/new
   - Importar repositório
   - Adicionar env vars
   - Deploy!

3. **Atualizar Google OAuth**
   - Adicionar domínio Vercel nas URIs

4. **Testar tudo**
   - Login
   - Navegação
   - Funcionalidades

---

**Está tudo pronto para ir ao ar! 🚀**

Quer que eu te ajude com algum passo específico ou posso preparar os comandos para você executar?

