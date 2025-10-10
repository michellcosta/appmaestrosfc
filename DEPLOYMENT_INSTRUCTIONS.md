# 🚀 Instruções de Deploy - Sorteio de Times → Partida

## 📋 Resumo da Implementação

Esta feature integra **jogadores cadastrados** ao sistema de **Sortear times** e cria **Partidas** persistidas no Supabase com lançamento de gols.

---

## 🔗 Links Importantes

### GitHub

- **Branch**: `feat/sortear-times-partida`
- **PR**: [Criar PR aqui](https://github.com/michellcosta/appmaestrosfc/pull/new/feat/sortear-times-partida)
- **Commit**: `cd9e84f`

### Vercel

Após merge na `main`, a Vercel disparará o deploy automaticamente.

- **Preview URL**: Será gerada automaticamente após o PR ser aberto
- **Production URL**: Após merge na `main`

---

## ✅ Mudanças Implementadas

### 1. **Esquema de Banco de Dados (Supabase)**

**Arquivo**: [`supabase/migrations/20250105_matches_teams_goals.sql`](supabase/migrations/20250105_matches_teams_goals.sql)

Tabelas criadas:

- **`matches`**: Partidas criadas a partir do sorteio
- **`teams`**: Times por partida (Preto, Verde, Cinza, Vermelho)
- **`match_players`**: Jogadores alocados em times
- **`goals`**: Gols marcados durante as partidas

**RLS**: Habilitado com políticas básicas para `authenticated`

### 2. **Helpers de Banco (`src/lib/db.ts`)**

Funções tipadas:

```typescript
getPlayersByGroup(groupId?: string): Promise<Player[]>
createMatchWithTeams(params: CreateMatchParams): Promise<{ matchId: string }>
getMatchWithTeams(matchId: string): Promise<MatchBundle>
addGoal(input: AddGoalInput): Promise<void>
getMatchStats(matchId: string): Promise<MatchStats>
```

### 3. **Hook Adaptado (`src/hooks/useTeamDrawSupabase.ts`)**

- Persistência no Supabase ao sortear times
- Fallback para localStorage se Supabase falhar
- Integração com `usePlayers()` para jogadores aprovados

---

## 🛠️ Passos para Deploy

### 1️⃣ **Aplicar Migration no Supabase**

#### Opção A: Via CLI

```bash
npx supabase migration up
```

#### Opção B: Via Dashboard (Recomendado)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Navegue até **SQL Editor**
3. Copie e execute o conteúdo de [`supabase/migrations/20250105_matches_teams_goals.sql`](supabase/migrations/20250105_matches_teams_goals.sql)
4. Clique em **Run**

#### Verificação

Execute no SQL Editor para verificar se as tabelas foram criadas:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('matches', 'teams', 'match_players', 'goals');
```

Deve retornar 4 linhas.

---

### 2️⃣ **Configurar Variáveis de Ambiente na Vercel**

Certifique-se de que as seguintes variáveis estão configuradas no painel da Vercel:

- **`VITE_SUPABASE_URL`**: URL do projeto Supabase
- **`VITE_SUPABASE_ANON_KEY`**: Chave anônima do Supabase

#### Verificar Configuração

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Selecione o projeto **appmaestrosfc**
3. Navegue até **Settings → Environment Variables**
4. Confirme que as variáveis estão definidas

Se não estiverem, adicione-as:

```
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3️⃣ **Merge do PR e Deploy**

1. **Abrir PR**: [Criar PR aqui](https://github.com/michellcosta/appmaestrosfc/pull/new/feat/sortear-times-partida)
2. **Review**: Verificar mudanças no GitHub
3. **Merge**: Fazer merge na branch `main`
4. **Aguardar Deploy**: A Vercel disparará o deploy automaticamente
5. **Verificar URL de Preview**: Testar antes do merge (opcional)

---

## 🧪 Testes Manuais

### Checklist de Testes Funcionais

Execute os seguintes testes após o deploy:

#### 1. **Gerenciar Jogadores**

- [ ] Acessar página "Gerenciar jogadores"
- [ ] Confirmar que há pelo menos 10 jogadores ativos cadastrados
- [ ] Se não houver, cadastrar jogadores de teste

#### 2. **Sortear Times**

- [ ] Navegar para "Sortear times"
- [ ] Selecionar jogadores presentes (checkbox)
- [ ] Escolher número de times (2-4)
- [ ] Clicar em **Sortear**
- [ ] Verificar que times foram criados com jogadores distribuídos
- [ ] Clicar em **Confirmar** para criar partida

#### 3. **Partida e Gols**

- [ ] Acessar `/partida/[id]` (redirecionamento automático)
- [ ] Verificar que times e jogadores aparecem corretamente
- [ ] Registrar 2-3 gols:
  - Selecionar time
  - Selecionar jogador autor
  - (Opcional) Selecionar jogador assistência
  - Salvar gol
- [ ] Verificar que placar atualiza corretamente
- [ ] Verificar estatísticas dos jogadores

#### 4. **Persistência no Supabase**

- [ ] Recarregar a página da partida
- [ ] Confirmar que gols e placar permanecem salvos
- [ ] (Opcional) Verificar no SQL Editor do Supabase:

```sql
SELECT * FROM matches ORDER BY created_at DESC LIMIT 5;
SELECT * FROM teams WHERE match_id = 'ID_DA_PARTIDA';
SELECT * FROM goals WHERE match_id = 'ID_DA_PARTIDA';
```

---

## 📊 Status dos Testes

| Funcionalidade                        | Status | Observações                       |
| ------------------------------------- | ------ | --------------------------------- |
| Build TypeScript                      | ✅     | Sem erros de tipo                 |
| Migration SQL                         | ✅     | Esquema criado e validado         |
| Helpers `db.ts`                       | ✅     | Funções tipadas e testadas        |
| Hook `useTeamDrawSupabase`            | ✅     | Persistência Supabase + fallback  |
| Sortear times                         | 🟡     | Aguardando teste manual           |
| Criar partida                         | 🟡     | Aguardando teste manual           |
| Lançar gols                           | 🟡     | Aguardando teste manual (página existente) |
| Persistência Supabase                 | 🟡     | Aguardando teste manual           |

**Legenda**: ✅ Completo | 🟡 Aguardando testes | ❌ Falha

---

## 🚨 Troubleshooting

### Problema: Migration falha ao executar

**Solução**: Verifique se as tabelas `players` e `groups` já existem. Se não existirem, crie-as antes:

```sql
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  position TEXT,
  stars INT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Problema: Sorteio não salva no Supabase

**Solução**: Verifique:

1. Variáveis de ambiente estão corretas
2. RLS está habilitado e políticas criadas
3. Usuário está autenticado (token válido)
4. Console do navegador para erros de rede

### Problema: Jogadores não aparecem no sorteio

**Solução**: Verifique:

1. Jogadores estão com `active = true` no banco
2. Hook `usePlayers()` retorna jogadores aprovados
3. Função `getApprovedPlayers()` está filtrando corretamente

---

## 📝 Notas Técnicas

### Arquitetura

- **Framework**: Vite + React (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel (conectado ao GitHub)
- **RLS**: Habilitado com políticas para `authenticated`

### Estrutura de Dados

```
Match (Partida)
  ├── Teams (2-4 times)
  │   ├── Team A (Preto)
  │   ├── Team B (Verde)
  │   ├── Team C (Cinza)
  │   └── Team D (Vermelho)
  └── Players (distribuídos nos times)
      └── Goals (gols marcados)
```

### Fallback

Se a persistência no Supabase falhar, o sistema continuará funcionando com localStorage (comportamento anterior).

---

## 🤖 Gerado por

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub:

[https://github.com/michellcosta/appmaestrosfc/issues](https://github.com/michellcosta/appmaestrosfc/issues)
