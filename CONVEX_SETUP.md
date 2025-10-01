# 🚀 CONVEX SETUP - NEXUS PLAY

## **📋 Instruções para Configurar Convex**

### **1. Iniciar Convex Dev**
```bash
# Em um terminal SEPARADO, execute:
npx convex dev
```

### **2. Configurar Variáveis de Ambiente**
Após o Convex dev iniciar, você verá uma URL como:
```
https://xxxx.convex.cloud
```

Crie um arquivo `.env` na raiz do projeto com:
```env
VITE_CONVEX_URL=https://xxxx.convex.cloud
```

### **3. Testar Build**
```bash
npm run build
```

### **4. Testar Aplicação**
```bash
npm run dev
```

Acesse: http://localhost:5174/jogo

---

## **🎯 Funcionalidades Implementadas**

### **✅ Backend Convex:**
- ✅ Schema completo (players, matches, events, stats)
- ✅ Mutations para adicionar jogadores
- ✅ Queries para listar jogadores ativos
- ✅ Sistema de partidas com sorteio de times
- ✅ Eventos de gol com estatísticas
- ✅ Ranking automático

### **✅ Frontend:**
- ✅ Página `/jogo` com UI completa
- ✅ Adicionar jogadores
- ✅ Sortear times e iniciar partida
- ✅ Placar ao vivo
- ✅ Botões para marcar gols
- ✅ Ranking em tempo real

### **✅ Integração:**
- ✅ ConvexProvider configurado
- ✅ Rota `/jogo` adicionada
- ✅ Imports corretos

---

## **🧪 Como Testar**

1. **Acesse:** http://localhost:5174/jogo
2. **Adicione jogadores:** Digite nomes e clique "Adicionar"
3. **Inicie partida:** Clique "Sortear times & Iniciar"
4. **Marque gols:** Clique nos botões dos jogadores
5. **Veja o ranking:** Atualiza automaticamente

---

## **🔧 Troubleshooting**

### **Erro de Build:**
- Certifique-se que o Convex dev está rodando
- Verifique se a URL está correta no .env
- Execute `npm run build` novamente

### **Erro de Import:**
- Verifique se o arquivo `convex/_generated/api.js` existe
- Reinicie o Convex dev se necessário

---

## **📁 Arquivos Criados**

```
convex/
├── schema.ts
├── players.ts
├── matches.ts
└── events.ts

src/
├── ConvexProvider.tsx
└── pages/Jogo.tsx
```

**✅ NEXUS PLAY CONVEX IMPLEMENTADO COM SUCESSO!** 🚀
