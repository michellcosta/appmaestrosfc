# Como instalar e usar ngrok

## 1. Instalar ngrok

### Opção A: Download direto
1. Acesse: https://ngrok.com/download
2. Baixe a versão para Windows
3. Extraia o arquivo `ngrok.exe`
4. Coloque em uma pasta (ex: `C:\ngrok\`)

### Opção B: Via npm (se tiver Node.js)
```bash
npm install -g ngrok
```

## 2. Criar conta gratuita
1. Acesse: https://ngrok.com/signup
2. Crie uma conta gratuita
3. Pegue seu authtoken em: https://dashboard.ngrok.com/get-started/your-authtoken

## 3. Configurar authtoken
```bash
ngrok config add-authtoken SEU_AUTHTOKEN_AQUI
```

## 4. Usar ngrok
```bash
# No terminal, na pasta do projeto
ngrok http 5173
```

## 5. Adicionar URL do ngrok no Google Cloud Console
- Copie a URL que aparece (ex: https://abc123.ngrok.io)
- Adicione nas "Origens JavaScript autorizadas"
- Adicione https://abc123.ngrok.io/auth/callback nas "URIs de redirecionamento"

## 6. Acessar no celular
- Use a URL do ngrok no celular
- Exemplo: https://abc123.ngrok.io
