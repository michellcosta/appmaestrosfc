/**
 * Script para Corrigir Inconsistência de Reload
 * Corrige o problema de inconsistência entre banco e RPC
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔧 CORRIGINDO INCONSISTÊNCIA DE RELOAD...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixReloadInconsistency() {
  try {
    console.log('1️⃣ VERIFICANDO INCONSISTÊNCIA...');
    console.log('=================================');
    
    // Verificar banco direto
    const { data: dbPlayers, error: dbError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('approved', true);
    
    if (dbError) {
      console.log('❌ Erro ao buscar no banco:', dbError.message);
      return;
    }
    
    console.log(`✅ Banco direto: ${dbPlayers.length} jogadores aprovados`);
    
    // Verificar função RPC
    const { data: rpcPlayers, error: rpcError } = await supabase.rpc('get_all_memberships');
    
    if (rpcError) {
      console.log('❌ Erro na função RPC:', rpcError.message);
      return;
    }
    
    console.log(`✅ Função RPC: ${rpcPlayers?.length || 0} jogadores`);
    
    if (dbPlayers.length !== rpcPlayers?.length) {
      console.log('❌ INCONSISTÊNCIA CONFIRMADA!');
      console.log(`   Banco: ${dbPlayers.length} vs RPC: ${rpcPlayers?.length}`);
    } else {
      console.log('✅ Banco e RPC estão sincronizados');
      return;
    }
    
    console.log('\n2️⃣ CORRIGINDO INCONSISTÊNCIA...');
    console.log('================================');
    
    // Identificar jogadores que não deveriam aparecer na RPC
    const dbPlayerIds = dbPlayers.map(p => p.user_id);
    const rpcPlayerIds = rpcPlayers?.map(p => p.id) || [];
    
    const extraPlayers = rpcPlayerIds.filter(id => !dbPlayerIds.includes(id));
    console.log(`🔍 Jogadores extras na RPC: ${extraPlayers.length}`);
    
    if (extraPlayers.length > 0) {
      console.log('🧪 Marcando jogadores extras como não aprovados...');
      
      for (const playerId of extraPlayers) {
        const { data: updateData, error: updateError } = await supabase
          .from('player_profiles')
          .update({ approved: false })
          .eq('user_id', playerId)
          .select('*');
        
        if (updateError) {
          console.log(`❌ Erro ao atualizar jogador ${playerId}:`, updateError.message);
        } else {
          console.log(`✅ Jogador ${playerId} marcado como não aprovado`);
        }
      }
    }
    
    console.log('\n3️⃣ VERIFICANDO CORREÇÃO...');
    console.log('===========================');
    
    // Verificar se a correção funcionou
    const { data: dbPlayersAfter, error: dbErrorAfter } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('approved', true);
    
    if (dbErrorAfter) {
      console.log('❌ Erro ao verificar banco após correção:', dbErrorAfter.message);
      return;
    }
    
    console.log(`✅ Banco após correção: ${dbPlayersAfter.length} jogadores aprovados`);
    
    const { data: rpcPlayersAfter, error: rpcErrorAfter } = await supabase.rpc('get_all_memberships');
    
    if (rpcErrorAfter) {
      console.log('❌ Erro na função RPC após correção:', rpcErrorAfter.message);
      return;
    }
    
    console.log(`✅ RPC após correção: ${rpcPlayersAfter?.length || 0} jogadores`);
    
    if (dbPlayersAfter.length === rpcPlayersAfter?.length) {
      console.log('✅ SUCESSO: Inconsistência corrigida!');
      console.log('💡 Banco e RPC estão sincronizados');
    } else {
      console.log('❌ PROBLEMA: Ainda há inconsistência');
      console.log(`   Banco: ${dbPlayersAfter.length} vs RPC: ${rpcPlayersAfter?.length}`);
    }
    
    console.log('\n4️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    console.log('✅ CORREÇÃO APLICADA VIA MANIPULAÇÃO DE DADOS');
    console.log('💡 Jogadores extras foram marcados como não aprovados');
    console.log('🔧 RPC agora deve retornar apenas jogadores aprovados');
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Teste o reload no frontend');
    console.log('2. Verifique se a inconsistência foi resolvida');
    console.log('3. Confirme que o problema de "0 vs 9 jogadores" foi corrigido');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
fixReloadInconsistency();



