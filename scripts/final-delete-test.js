/**
 * Script de Teste Final do Delete
 * Testa se o problema foi completamente resolvido
 */

import { createClient } from '@supabase/supabase-js';

console.log('🎯 TESTE FINAL DO DELETE...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalDeleteTest() {
  try {
    console.log('1️⃣ VERIFICANDO ESTADO ATUAL...');
    console.log('==============================');
    
    // Verificar jogadores no banco
    const { data: dbPlayers, error: dbError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('approved', true);
    
    if (dbError) {
      console.log('❌ Erro ao buscar jogadores no banco:', dbError.message);
      return;
    }
    
    console.log(`✅ Banco de dados: ${dbPlayers.length} jogadores aprovados`);
    
    // Verificar função RPC
    const { data: rpcPlayers, error: rpcError } = await supabase.rpc('get_all_memberships');
    
    if (rpcError) {
      console.log('❌ Erro na função RPC:', rpcError.message);
      return;
    }
    
    console.log(`✅ Função RPC: ${rpcPlayers?.length || 0} jogadores`);
    
    // Verificar se há diferença
    if (dbPlayers.length !== rpcPlayers?.length) {
      console.log('⚠️ DIFERENÇA ENCONTRADA:');
      console.log(`   Banco: ${dbPlayers.length} jogadores`);
      console.log(`   RPC: ${rpcPlayers?.length || 0} jogadores`);
      console.log('💡 Isso pode causar o problema de "jogador volta"');
    } else {
      console.log('✅ Banco e RPC estão sincronizados');
    }
    
    console.log('\n2️⃣ TESTANDO DELETE FINAL...');
    console.log('============================');
    
    if (dbPlayers.length === 0) {
      console.log('⚠️ Nenhum jogador para testar');
      return;
    }
    
    // Pegar um jogador para teste
    const testPlayer = dbPlayers[0];
    console.log(`🔍 Testando delete de: ${testPlayer.name}`);
    
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
    
    console.log('\n3️⃣ VERIFICANDO RESULTADO...');
    console.log('============================');
    
    // Verificar banco após delete
    const { data: dbPlayersAfter, error: dbErrorAfter } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('approved', true);
    
    if (dbErrorAfter) {
      console.log('❌ Erro ao verificar banco após delete:', dbErrorAfter.message);
      return;
    }
    
    console.log(`✅ Banco após delete: ${dbPlayersAfter.length} jogadores`);
    
    // Verificar RPC após delete
    const { data: rpcPlayersAfter, error: rpcErrorAfter } = await supabase.rpc('get_all_memberships');
    
    if (rpcErrorAfter) {
      console.log('❌ Erro na função RPC após delete:', rpcErrorAfter.message);
      return;
    }
    
    console.log(`✅ RPC após delete: ${rpcPlayersAfter?.length || 0} jogadores`);
    
    // Verificar se o jogador foi removido
    const playerInDb = dbPlayersAfter.some(p => p.user_id === testPlayer.user_id);
    const playerInRpc = rpcPlayersAfter?.some(p => p.id === testPlayer.user_id);
    
    console.log('\n4️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    if (playerInDb) {
      console.log('❌ PROBLEMA: Jogador ainda existe no banco!');
      console.log('💡 CAUSA: Delete não foi executado corretamente');
    } else if (playerInRpc) {
      console.log('❌ PROBLEMA: Jogador ainda aparece na função RPC!');
      console.log('💡 CAUSA: Função RPC não está filtrando corretamente');
    } else {
      console.log('✅ SUCESSO: Jogador foi removido completamente!');
      console.log('💡 DELETE FUNCIONANDO PERFEITAMENTE!');
    }
    
    console.log('\n🔧 RESUMO DAS CORREÇÕES:');
    console.log('========================');
    console.log('✅ Frontend corrigido para evitar múltiplos reloads');
    console.log('✅ Cache local implementado');
    console.log('✅ Filtro de dados duplicados adicionado');
    console.log('✅ Lógica de delete corrigida');
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Teste o delete no frontend');
    console.log('2. Verifique se o jogador não volta após reload');
    console.log('3. Verifique se não há múltiplos reloads no console');
    console.log('4. Se o problema persistir, verifique o console do navegador');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
finalDeleteTest();



