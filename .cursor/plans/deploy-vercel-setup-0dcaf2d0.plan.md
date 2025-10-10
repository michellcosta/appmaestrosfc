<!-- 0dcaf2d0-ac91-4b25-aaa0-9d16868c3d2a 259824de-f602-4515-855e-868efce4697e -->
# Deploy Vercel para Maestros FC

## Estratégia de Deploy

Vamos usar o **Vercel CLI** para fazer deploy direto do código local, ignorando o problema do GitHub Push Protection temporariamente. Depois do deploy funcionando, você pode testar pelo celular.

## Variáveis de Ambiente Necessárias

Baseado no código, precisamos configurar estas variáveis no Vercel:

1. **VITE_CONVEX_URL** - URL do Convex (já identificada: `https://expert-eagle-519.convex.cloud`)
2. **VITE_GOOGLE_CLIENT_ID** - Client ID do Google OAuth
3. **VITE_GOOGLE_CLIENT_SECRET** - Client Secret do Google OAuth
4. **VITE_OPENWEATHER_API_KEY** (opcional) - Para serviço de clima

## Etapas do Deploy

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Fazer Login no Vercel

```bash
vercel login
```

### 3. Deploy Inicial

```bash
vercel --prod
```

Durante o deploy, o CLI vai perguntar:

- Nome do projeto (sugerir: `maestros-fc` ou `nexus-play`)
- Se deseja linkar com projeto existente ou criar novo
- Configurações do projeto

### 4. Configurar Variáveis de Ambiente via CLI

Após o deploy inicial, configurar as variáveis:

```bash
vercel env add VITE_CONVEX_URL production
# Valor: https://expert-eagle-519.convex.cloud

vercel env add VITE_GOOGLE_CLIENT_ID production
# Valor: [seu client ID atual]

vercel env add VITE_GOOGLE_CLIENT_SECRET production
# Valor: [seu client secret atual]
```

### 5. Redeploy com Variáveis

```bash
vercel --prod
```

### 6. Atualizar Google Cloud Console

Após obter a URL do Vercel (ex: `https://maestros-fc.vercel.app`), adicionar nas credenciais OAuth:

**Authorized JavaScript origins:**

- `https://[seu-projeto].vercel.app`

**Authorized redirect URIs:**

- `https://[seu-projeto].vercel.app/auth/callback`

## Arquivos a Verificar

- `package.json` - Dependências já corretas (`@auth/core@^0.37.4` + `@convex-dev/auth@^0.0.90`)
- `vite.config.ts` - Já configurado com allowedHosts para ngrok
- `src/utils/googleAuth.ts` - Já adaptado para usar variáveis de ambiente
- `src/ConvexProvider.tsx` - Já configurado para usar VITE_CONVEX_URL

## Comandos a Executar

```bash
# 1. Instalar Vercel CLI globalmente
npm install -g vercel

# 2. Login no Vercel
vercel login

# 3. Deploy inicial
vercel --prod

# 4. Após deploy, obter a URL e configurar no Google Cloud Console

# 5. Configurar variáveis de ambiente (se não configuradas durante deploy)
vercel env add VITE_CONVEX_URL production
vercel env add VITE_GOOGLE_CLIENT_ID production
vercel env add VITE_GOOGLE_CLIENT_SECRET production

# 6. Redeploy se necessário
vercel --prod
```

## Notas Importantes

- O Vercel CLI vai criar um arquivo `.vercel` local - não commitar isso
- A URL gerada será algo como `https://[projeto].vercel.app`
- Após cada deploy, o Vercel mostra a URL de produção
- Você pode gerenciar o projeto em: https://vercel.com/dashboard

## Próximos Passos Após Deploy

1. Testar a URL do Vercel no celular
2. Verificar se o Google OAuth funciona
3. Verificar se o Convex conecta corretamente
4. Se tudo funcionar, resolver o problema do GitHub depois

### To-dos

- [ ] Instalar Vercel CLI globalmente
- [ ] Fazer login no Vercel via CLI
- [ ] Fazer deploy inicial no Vercel (prod)
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Atualizar Google Cloud Console com URL do Vercel
- [ ] Testar aplicação no celular via URL do Vercel