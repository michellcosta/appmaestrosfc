# 🚀 Comandos Prontos - Deploy Vercel

## 📋 Copie e cole estes comandos em sequência:

---

## 1️⃣ Preparação Local (EXECUTE AGORA)

```bash
# Testar build local (já testamos, passou!)
npm run build

# Verificar status do Git
git status

# Adicionar todos os arquivos
git add .

# Commit com todas as mudanças
git commit -m "feat: Sistema completo - Unificação de dados, Dark mode profissional, Mobile-first e Login premium com framer-motion"

# Push para o GitHub
git push origin main
```

**⏳ Aguarde o push completar antes de continuar!**

---

## 2️⃣ Deploy no Vercel (INTERFACE WEB)

**Acesse:** https://vercel.com/new

**Siga os passos:**

1. Clique em "Import Git Repository"
2. Selecione: `nexus-play`
3. Configure:
   - **Project Name:** `maestros-fc`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables** (adicione estas 2):

```
VITE_CONVEX_URL=https://SEU-CONVEX-URL.convex.cloud
```

```
VITE_GOOGLE_CLIENT_ID=SEU-GOOGLE-CLIENT-ID.apps.googleusercontent.com
```

5. Clique em **"Deploy"**

---

## 3️⃣ Após Deploy - Atualizar Google OAuth

**Seu domínio será algo como:** `https://maestros-fc.vercel.app`

**Acesse:** https://console.cloud.google.com/apis/credentials

**No seu OAuth 2.0 Client ID, adicione:**

### Authorized redirect URIs:
```
https://SEU-DOMINIO.vercel.app/auth/callback
https://SEU-CONVEX-URL.convex.site/api/auth/callback/google
```

### Authorized JavaScript origins:
```
https://SEU-DOMINIO.vercel.app
```

**Clique em "Save"** e aguarde 5-10 minutos.

---

## 4️⃣ Testar o App

```
Acesse: https://maestros-fc.vercel.app
```

**Checklist:**
- [ ] Tela de login aparece com animações
- [ ] Login Google funciona
- [ ] Login Offline funciona
- [ ] Tema escuro/claro funciona
- [ ] Mobile responsivo
- [ ] Sortear times OK
- [ ] Gerenciar jogadores OK

---

## 🔧 Comandos Úteis (Vercel CLI)

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Linkar projeto local
vercel link

# Ver logs em tempo real
vercel logs --follow

# Deploy manual
vercel --prod

# Ver env vars
vercel env ls
```

---

## 📊 URLs Importantes

**Produção:** https://maestros-fc.vercel.app  
**Dashboard Vercel:** https://vercel.com/dashboard  
**Convex Dashboard:** https://dashboard.convex.dev  
**Google Cloud Console:** https://console.cloud.google.com/apis/credentials  

---

## 🎯 Próximos Deploys

**Automático:**
```bash
# Qualquer push em main dispara deploy
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

**Preview (Pull Request):**
- Crie PR → Vercel gera preview automaticamente
- URL: `https://maestros-fc-git-<branch>.vercel.app`

---

## 🆘 Se der erro...

### Erro: "Build failed"
```bash
# Testar build local
npm run build

# Ver logs detalhados no Vercel
vercel logs <deployment-url>
```

### Erro: "Convex não conecta"
```bash
# Verificar Convex
npx convex deploy

# Confirmar VITE_CONVEX_URL no Vercel
vercel env ls
```

### Erro: "Google OAuth 400"
- Aguardar 10 minutos após adicionar URIs
- Limpar cache do navegador
- Verificar domínio exato (com/sem `www`)

---

**🎉 Tudo pronto! Vamos colocar no ar! 🚀⚽**

