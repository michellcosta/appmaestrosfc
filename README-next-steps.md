# Maestros FC — Patch de base

Cole estes arquivos nas seguintes pastas do seu projeto Vite + React + Tailwind + shadcn:

- `src/types/index.ts` — **centraliza tipos** (TeamColor, GoalEvent, TiebreakerEvent, DiaristRequest).
- `src/services/location.ts` — **Haversine** e helper `withinRadius` (Cheguei ≤ 30 m).
- `src/services/payments.ts` — **máquina de estados** do diarista (approved → paying → paid/full/credited).
- `src/components/ActionSheet.tsx` — Sheet simples para **Abrir Rota** (Maps/Waze).
- `src/components/match/GoalModal.tsx` — Modal **+ Gol** (autor/assist) para Partida.
- `src/components/chat/VoiceRecorder.tsx` — **gravação de áudio** (90s) para o Chat.
- `vercel.json` — reescrita para SPA na Vercel.

## Como integrar rapidamente
1. **Tipos**: em qualquer arquivo que use time, importe de `@/types` e remova enums duplicados.
2. **Cheguei**: use `withinRadius(current, venue, 30)` para habilitar/desabilitar o botão e exibir mensagens.
3. **Abrir Rota**: use `ActionSheet` com opções de Google Maps/Waze (abra deep link e, se falhar, fallback web).
4. **+ Gol**: abra `<GoalModal ... onConfirm={(author, assist)=>{ ... }} />` e, no confirm, atualize placar + `GoalEvent`.
5. **Chat voz**: use `<VoiceRecorder onAudioReady={(blob)=>{ /* upload + criar msg */ }} />` e renderize um `<audio controls>`.
6. **Financeiro**: use helpers de `payments.ts` para exibir **Pagar (Pix — Copiar)** somente após aprovado e iniciar **30:00** no clique.
7. **Vercel**: commit do `vercel.json` para evitar 404 nas rotas.

Dúvidas? Me envie `Matches.tsx`, `Match.tsx` e `Chat.tsx` que eu encaixo tudo pra você.
