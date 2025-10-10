# ✅ Checklist de Deploy - Maestros FC

## 🎯 Status Pré-Deploy

### ✅ Build Local
```bash
npm run build  # ✅ PASSOU! (10.02s)
```

### ✅ Arquivos Prontos
- ✅ `vercel.json` configurado
- ✅ `dist/` gerado com sucesso
- ✅ `package.json` com scripts corretos
- ✅ Convex deployado em `expert-eagle-519.convex.cloud`

---

## 📝 PASSO A PASSO VISUAL

### **1️⃣ Preparar Git (5 min)**

```bash
# Adicionar todos os arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: Sistema completo - Dark mode, Mobile-first, Login premium, Profile sync"

# Push para o GitHub
git push origin main
```

**⚠️ Aguarde o push completar antes de continuar!**

---

### **2️⃣ Criar Projeto no Vercel (3 min)**

1. **Acesse:** https://vercel.com/new

2. **Import Git Repository:**
   - Clique em "Import Git Repository"
   - Selecione: `nexus-play`
   - Clique em "Import"

3. **Configure o Projeto:**
   ```
   Project Name: maestros-fc (ou nexus-play)
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **⚠️ NÃO clique em Deploy ainda!** Vamos adicionar as env vars primeiro.

---

### **3️⃣ Adicionar Environment Variables (2 min)**

Na seção **"Environment Variables"**, adicione:

#### **Variável 1:**
```
Name:  VITE_CONVEX_URL
Value: https://SEU-CONVEX-URL.convex.cloud
```
- ✅ Marque: **Production**
- ✅ Marque: **Preview**
- ✅ Marque: **Development**

#### **Variável 2:**
```
Name:  VITE_GOOGLE_CLIENT_ID
Value: SEU-GOOGLE-CLIENT-ID.apps.googleusercontent.com
```
- ✅ Marque: **Production**
- ✅ Marque: **Preview**
- ✅ Marque: **Development**

**⚠️ IMPORTANTE:** NÃO adicione `VITE_GOOGLE_CLIENT_SECRET`! Ele já está no Convex.

---

### **4️⃣ Deploy! (2-3 min)**

1. Clique em **"Deploy"**
2. Aguarde o build (~2-3 minutos)
3. **🎉 Sucesso!** Vercel vai mostrar:
   ```
   ✅ Production: https://maestros-fc.vercel.app
   ```

**Anote esse domínio!** Você vai precisar dele no próximo passo.

---

### **5️⃣ Configurar Google OAuth (5 min)**

1. **Acesse:** https://console.cloud.google.com/apis/credentials

2. **Selecione:** Seu OAuth 2.0 Client ID

3. **Adicione nas "Authorized redirect URIs":**
   ```
   https://SEU-DOMINIO.vercel.app/auth/callback
   https://SEU-CONVEX-URL.convex.site/api/auth/callback/google
   ```

4. **Adicione nas "Authorized JavaScript origins":**
   ```
   https://SEU-DOMINIO.vercel.app
   ```

5. **Clique em "Save"**

**⚠️ Aguarde ~5 minutos para as mudanças propagarem no Google!**

---

### **6️⃣ Testar o App (5 min)**

Acesse: `https://maestros-fc.vercel.app`

#### **Checklist de Testes:**

**Login:**
- [ ] Tela de login aparece com animações
- [ ] Fundo animado funcionando
- [ ] Botão "Entrar com Google" clicável
- [ ] Login Google redireciona corretamente
- [ ] Login Offline (Owner/Admin) funciona

**Navegação:**
- [ ] Home carrega
- [ ] Tema escuro/claro funciona
- [ ] BottomNav não cobre conteúdo

**Funcionalidades:**
- [ ] Sortear times funciona
- [ ] Gerenciar jogadores carrega
- [ ] Coluna "Camisa" aparece
- [ ] Perfil salva dados no Convex

**Mobile:**
- [ ] Layouts em 1 coluna
- [ ] Modais responsivos
- [ ] Teclado não quebra

---

## 🔧 Troubleshooting

### **Problema: Tela branca**

**Diagnóstico:**
```bash
# Ver logs do Vercel
vercel logs <deployment-url>
```

**Solução:**
- Verificar env vars no Vercel
- Confirmar que `VITE_CONVEX_URL` está correto

---

### **Problema: "Convex não conecta"**

**Solução:**
1. Verificar `VITE_CONVEX_URL` no Vercel
2. Testar Convex: `npx convex deploy`
3. Verificar console do navegador (F12)

---

### **Problema: "Google OAuth 400"**

**Solução:**
1. Confirmar domínio Vercel nas Authorized URIs
2. Aguardar 5-10 minutos para propagação
3. Limpar cache do navegador

---

## 🚀 Deploy Automático

**Configurado automaticamente!**

- ✅ Push em `main` → Deploy em produção
- ✅ Pull Request → Deploy de preview
- ✅ Rollback automático em caso de erro

---

## 📊 Métricas Esperadas

**Build Time:** ~2-3 min  
**Bundle Size:** ~1.5 MB (gzipped: ~180 KB)  
**Lighthouse Score:** ~90-95  
**First Load:** ~2-3s  

---

## 🎉 Próximos Passos (Após Deploy)

1. **Domínio Customizado** (opcional):
   - Settings → Domains → Add Domain
   - Configure DNS: `CNAME` → `cname.vercel-dns.com`

2. **Analytics:**
   - Settings → Analytics → Enable
   - Monitore Core Web Vitals

3. **Monitoring:**
   - Settings → Monitoring → Enable
   - Alertas de erro em tempo real

---

## 📞 Suporte

**Documentação Vercel:** https://vercel.com/docs  
**Documentação Convex:** https://docs.convex.dev  

**Logs em tempo real:**
```bash
vercel logs --follow
```

---

**🎯 Tudo pronto! Bora colocar no ar! 🚀**

