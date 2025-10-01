# 🔧 CONFIGURAR CONVEX - SOLUÇÃO TELA BRANCA

## **⚠️ PROBLEMA:**
```
VITE_CONVEX_URL não configurada no .env
```

## **🎯 SOLUÇÃO RÁPIDA:**

### **1. Aguarde o Convex dev iniciar**
O comando `npx convex dev` está rodando em background. Aguarde aparecer uma URL como:
```
https://xxxx.convex.cloud
```

### **2. Crie o arquivo .env na raiz do projeto**
Crie um arquivo chamado `.env` na pasta raiz com:

```env
# Convex Configuration
VITE_CONVEX_URL=https://xxxx.convex.cloud

# Supabase Configuration (existing)
VITE_SUPABASE_URL=https://autxxmhtadimwvprfsov.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig
```

### **3. Reinicie o servidor**
```bash
# Pare o servidor atual (Ctrl+C)
# Depois execute:
npm run dev
```

## **✅ RESULTADO ESPERADO:**
- ✅ Tela branca resolvida
- ✅ Aplicação funcionando
- ✅ Página /jogo acessível

---

## **🔍 VERIFICAÇÃO:**

### **Se ainda tiver problemas:**
1. **Verifique se o arquivo .env está na raiz**
2. **Verifique se a URL do Convex está correta**
3. **Reinicie o servidor após criar o .env**

### **URLs para testar:**
- **http://localhost:5173/** - Dashboard
- **http://localhost:5173/jogo** - Sistema de jogo

---

## **🎉 APÓS CONFIGURAR:**
A aplicação funcionará perfeitamente com:
- ✅ Sistema de jogadores
- ✅ Sorteio de times
- ✅ Partida ao vivo
- ✅ Ranking automático
