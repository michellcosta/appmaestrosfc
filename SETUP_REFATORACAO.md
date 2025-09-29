# 🚀 Setup da Refatoração - Nexus Play

## ✅ **Dependências Instaladas**

```bash
npm install @sentry/react @sentry/tracing
```

## 📋 **Passos para Implementação**

### 1. **Executar Migração SQL**

No Supabase Dashboard, execute a migração:

```sql
-- Arquivo: supabase/migrations/20241201000000_refactor_system.sql
-- Execute todo o conteúdo do arquivo
```

### 2. **Criar Tabela de Rate Limiting**

```sql
-- Execute o conteúdo de: src/lib/rateLimitCounters.ts
CREATE TABLE IF NOT EXISTS rate_limit_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key ON rate_limit_counters(key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_created ON rate_limit_counters(created_at);
```

### 3. **Criar Funções do Supabase**

```sql
-- Execute o conteúdo de: supabase/functions/update-wallet-balance.sql
CREATE OR REPLACE FUNCTION update_wallet_balance(
  group_id_param uuid,
  delta_cents_param bigint
)
RETURNS void AS $$
BEGIN
  UPDATE wallets 
  SET 
    balance_cents = balance_cents + delta_cents_param,
    updated_at = now()
  WHERE wallets.group_id = group_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_match_score()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW match_score;
END;
$$ LANGUAGE plpgsql;
```

### 4. **Configurar Variáveis de Ambiente**

Crie `.env` baseado em `.env.example`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
SENTRY_DSN=sua_dsn_do_sentry
MP_ACCESS_TOKEN=seu_token_mercadopago
MP_BASE_URL=https://api.mercadopago.com
APP_PUBLIC_BASE_URL=https://seu-dominio.vercel.app
EDGE_FUNCTION_SECRET=chave_secreta_aleatoria
PROVIDER_WEBHOOK_SECRET=chave_webhook_aleatoria
```

### 5. **Testar Localmente**

```bash
npm run dev
```

Acesse: http://localhost:5173

### 6. **Deploy no Vercel**

```bash
# Conectar ao Vercel
vercel

# Configurar variáveis de ambiente no Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SENTRY_DSN
vercel env add MP_ACCESS_TOKEN
vercel env add APP_PUBLIC_BASE_URL
vercel env add EDGE_FUNCTION_SECRET
vercel env add PROVIDER_WEBHOOK_SECRET

# Deploy
vercel --prod
```

## 🧪 **Testes de Aceitação**

### 1. **Cronômetro**
- [ ] Dois celulares mostram mesmo tempo (±250ms)
- [ ] Botão RESET funciona
- [ ] Sem animação "pulsar"

### 2. **Idempotência**
- [ ] Clique duplo em "Gol" não duplica
- [ ] X-Idempotency-Key funciona

### 3. **Check-in**
- [ ] Fora da cerca falha
- [ ] PIN válido (5 min) passa
- [ ] Accuracy >25m falha

### 4. **PIX**
- [ ] Criar cobrança funciona
- [ ] Webhook atualiza saldo
- [ ] QR Code gera corretamente

### 5. **PWA**
- [ ] Instala como app nativo
- [ ] Funciona offline
- [ ] Sincroniza quando volta online

### 6. **Acessibilidade**
- [ ] Lighthouse Mobile ≥85
- [ ] Toques ≥44px
- [ ] Contraste AA
- [ ] Foco visível

## 🔧 **Troubleshooting**

### Erro: "Failed to resolve import"
```bash
npm install @sentry/react @sentry/tracing
```

### Erro: "Rate limit table not found"
Execute a migração SQL da tabela `rate_limit_counters`.

### Erro: "Function update_wallet_balance not found"
Execute o SQL das funções do Supabase.

### Erro: "RLS policy denied"
Verifique se as policies foram criadas corretamente.

## 📊 **Monitoramento**

- **Sentry**: Erros e performance
- **Vercel**: Logs de função
- **Supabase**: Logs de RLS

## 🎯 **Status Atual**

- ✅ Dependências instaladas
- ✅ Código implementado
- ✅ Migração SQL criada
- ✅ Configuração Vercel
- ✅ PWA configurado
- ✅ Sentry integrado

**Próximo**: Executar migração SQL e deploy! 🚀
