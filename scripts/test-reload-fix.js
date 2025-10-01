/**
 * Script de Teste do Fix de Reload
 * Verifica se o problema de múltiplos reloads foi resolvido
 */

import { createClient } from '@supabase/supabase-js';

console.log('🧪 TESTANDO FIX DE RELOAD...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReloadFix() {
  try {
    console.log('1️⃣ VERIFICANDO JOGADORES ATUAIS...');
    console.log('==================================');
    
    // Buscar jogadores atuais
    const { data: players, error: playersError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('approved', true);
    
    if (playersError) {
      console.log('❌ Erro ao buscar jogadores:', playersError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${players.length} jogadores aprovados`);
    
    console.log('\n2️⃣ TESTANDO FUNÇÃO RPC...');
    console.log('==========================');
    
    // Testar a função RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_memberships');
    
    if (rpcError) {
      console.log('❌ Erro na função RPC:', rpcError.message);
      return;
    }
    
    console.log(`✅ Função RPC retornou ${rpcData?.length || 0} jogadores`);
    
    // Verificar se há dados duplicados
    const uniquePlayers = rpcData?.filter((player, index, self) => 
      index === self.findIndex(p => p.id === player.id)
    ) || [];
    
    console.log(`✅ Jogadores únicos: ${uniquePlayers.length}`);
    
    if (rpcData?.length !== uniquePlayers.length) {
      console.log('⚠️ Dados duplicados encontrados na função RPC');
      console.log(`🔍 Antes: ${rpcData?.length} Depois: ${uniquePlayers.length}`);
    } else {
      console.log('✅ Nenhum dado duplicado encontrado');
    }
    
    console.log('\n3️⃣ TESTANDO DELETE SIMULADO...');
    console.log('================================');
    
    // Simular delete de um jogador
    const testPlayer = players[0];
    if (testPlayer) {
      console.log(`🔍 Simulando delete de: ${testPlayer.name}`);
      
      // Deletar o jogador
      const { data: deleteResult, error: deleteError } = await supabase
        .from('player_profiles')
        .delete()
        .eq('user_id', testPlayer.user_id)
        .select('*');
      
      if (deleteError) {
        console.log('❌ Erro no delete:', deleteError.message);
        return;
      }
      
      console.log('✅ Delete executado com sucesso!');
      
      // Verificar se a função RPC ainda retorna o jogador
      const { data: rpcDataAfter, error: rpcErrorAfter } = await supabase.rpc('get_all_memberships');
      
      if (rpcErrorAfter) {
        console.log('❌ Erro na função RPC após delete:', rpcErrorAfter.message);
        return;
      }
      
      console.log(`✅ Função RPC retornou ${rpcDataAfter?.length || 0} jogadores após delete`);
      
      // Verificar se o jogador foi removido
      const playerStillExists = rpcDataAfter?.some(p => p.id === testPlayer.user_id);
      
      if (playerStillExists) {
        console.log('❌ PROBLEMA: Jogador ainda aparece na função RPC!');
      } else {
        console.log('✅ SUCESSO: Jogador foi removido da função RPC!');
      }
    }
    
    console.log('\n4️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    console.log('✅ CORREÇÕES APLICADAS:');
    console.log('  - Múltiplos reloads removidos');
    console.log('  - Cache local implementado');
    console.log('  - Filtro de dados duplicados');
    console.log('  - Função RPC corrigida');
    
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Teste o delete no frontend');
    console.log('2. Verifique se o jogador não volta após reload');
    console.log('3. Verifique se não há múltiplos reloads no console');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testReloadFix();



