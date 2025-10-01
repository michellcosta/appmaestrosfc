/**
 * Script de Teste Final do Delete
 * Testa se o problema foi resolvido
 */

import { createClient } from '@supabase/supabase-js';

console.log('🧪 TESTE FINAL DO DELETE...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalDelete() {
  try {
    console.log('1️⃣ TESTANDO FUNÇÃO RPC ATUAL...');
    console.log('================================');
    
    // Testar a função RPC atual
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_memberships');
    
    if (rpcError) {
      console.log('❌ Erro na função RPC:', rpcError.message);
      return;
    }
    
    console.log(`✅ Função RPC retornou ${rpcData?.length || 0} jogadores`);
    
    // Filtrar apenas jogadores aprovados
    const approvedPlayers = rpcData?.filter(player => player.approved === true) || [];
    console.log(`✅ Jogadores aprovados: ${approvedPlayers.length}`);
    
    if (approvedPlayers.length === 0) {
      console.log('⚠️ Nenhum jogador aprovado encontrado');
      return;
    }
    
    console.log('\n2️⃣ TESTANDO DELETE COM FILTRO...');
    console.log('==================================');
    
    // Pegar um jogador para teste
    const testPlayer = approvedPlayers[0];
    console.log(`🔍 Testando com: ${testPlayer.name} (${testPlayer.id})`);
    
    // Deletar o jogador
    const { data: deleteResult, error: deleteError } = await supabase
      .from('player_profiles')
      .delete()
      .eq('user_id', testPlayer.id)
      .select('*');
    
    if (deleteError) {
      console.log('❌ Erro no delete:', deleteError.message);
      return;
    }
    
    console.log('✅ Delete executado com sucesso!');
    
    console.log('\n3️⃣ VERIFICANDO RESULTADO...');
    console.log('============================');
    
    // Testar a função RPC novamente
    const { data: rpcDataAfter, error: rpcErrorAfter } = await supabase.rpc('get_all_memberships');
    
    if (rpcErrorAfter) {
      console.log('❌ Erro na função RPC após delete:', rpcErrorAfter.message);
      return;
    }
    
    console.log(`✅ Função RPC retornou ${rpcDataAfter?.length || 0} jogadores após delete`);
    
    // Filtrar apenas jogadores aprovados
    const approvedPlayersAfter = rpcDataAfter?.filter(player => player.approved === true) || [];
    console.log(`✅ Jogadores aprovados após delete: ${approvedPlayersAfter.length}`);
    
    // Verificar se o jogador foi removido
    const playerStillExists = approvedPlayersAfter.some(p => p.id === testPlayer.id);
    
    if (playerStillExists) {
      console.log('❌ PROBLEMA: Jogador ainda aparece na lista!');
      console.log('💡 CAUSA: Função RPC não está filtrando corretamente');
    } else {
      console.log('✅ SUCESSO: Jogador foi removido da lista!');
    }
    
    console.log('\n4️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    if (playerStillExists) {
      console.log('❌ PROBLEMA: Função RPC precisa ser corrigida');
      console.log('💡 SOLUÇÃO: Executar o script fix-rpc-function.sql no Supabase');
    } else {
      console.log('✅ DELETE FUNCIONANDO PERFEITAMENTE!');
      console.log('💡 PROBLEMA: Pode estar na lógica de reload do frontend');
    }
    
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Se o problema persistir, execute fix-rpc-function.sql no Supabase');
    console.log('2. Teste o delete no frontend');
    console.log('3. Verifique se o jogador não volta após reload');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testFinalDelete();



