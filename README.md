# Maestros FC

PWA **Android-first** para organizar peladas do grupo fechado **Maestros FC**.  
Stack: **Vite + React + TypeScript + shadcn/ui**, **Supabase (Auth + Postgres + RLS + Edge Functions)** e deploy **Vercel**.

---

## ✨ Principais funcionalidades

- Login **Google** (somente): sem e-mail/senha.
- **Cores fixas de time:** Preto, Verde, Cinza, Vermelho.
- **Partida ao vivo**: cronômetro (10 min padrão), iniciar/pausar/recomeçar/encerrar, placar de **2 times em jogo**, gols (autor/assistência) e estatísticas da sessão.
- **Rodízio**: vencedor permanece; escolha do próximo adversário.
- **Histórico de Partidas**: por **Semana / Mês / Todos**.
- Base preparada para **Pix Copia e Cola**, convites, ranking e chat.

---

## 📦 Requisitos

- **Node.js 18+**
- **npm 9+**
- **Git Bash** (Windows) — recomendado
- Conta **Vercel**
- Projeto **Supabase** (Auth + DB + Functions)

> No Windows, use **Git Bash** para rodar comandos `bash`/`.sh` e evitar problemas de EOL.

---

## 🔧 Setup local (primeira vez)

```bash
# 1) instalar dependências
npm install

# 2) variáveis de ambiente (arquivo exemplo)
cp .env.example .env
# edite .env e preencha:
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
# VITE_SUPABASE_FUNCTIONS_URL= https://<PROJECT-REF>.functions.supabase.co

# 3) rodar em desenvolvimento
npm run dev
# acesse http://localhost:5173
# Force Vercel Deploy
