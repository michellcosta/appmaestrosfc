/**
 * Script de Teste Final do Delete
 * Testa se o problema foi completamente resolvido
 */

import { createClient } from '@supabase/supabase-js';

console.log('🧪 TESTE FINAL DO DELETE...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeleteFinal() {
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
    
    if (players.length === 0) {
      console.log('⚠️ Nenhum jogador encontrado para testar');
      return;
    }
    
    // Pegar um jogador para teste (não o owner principal)
    const testPlayer = players.find(p => p.name !== 'michellcosta1269@gmail.com');
    
    if (!testPlayer) {
      console.log('⚠️ Apenas o owner principal encontrado - não pode ser deletado');
      return;
    }
    
    console.log(`🔍 Testando com: ${testPlayer.name} (${testPlayer.user_id})`);
    
    console.log('\n2️⃣ EXECUTANDO DELETE...');
    console.log('========================');
    
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
    console.log('📊 Registros deletados:', deleteResult?.length || 0);
    
    console.log('\n3️⃣ VERIFICANDO RESULTADO...');
    console.log('============================');
    
    // Verificar se o jogador foi removido do banco
    const { data: playersAfter, error: playersAfterError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('approved', true);
    
    if (playersAfterError) {
      console.log('❌ Erro ao verificar jogadores após delete:', playersAfterError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${playersAfter.length} jogadores após delete`);
    
    // Verificar se o jogador foi removido
    const playerStillExists = playersAfter.some(p => p.user_id === testPlayer.user_id);
    
    if (playerStillExists) {
      console.log('❌ PROBLEMA: Jogador ainda existe no banco!');
    } else {
      console.log('✅ SUCESSO: Jogador foi removido do banco!');
    }
    
    console.log('\n4️⃣ TESTANDO FUNÇÃO RPC...');
    console.log('==========================');
    
    // Testar se a função RPC retorna o jogador deletado
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_memberships');
    
    if (rpcError) {
      console.log('❌ Erro na função RPC:', rpcError.message);
      return;
    }
    
    console.log(`✅ Função RPC retornou ${rpcData?.length || 0} jogadores`);
    
    // Verificar se a função RPC retorna o jogador deletado
    const playerInRpc = rpcData?.some(p => p.id === testPlayer.user_id);
    
    if (playerInRpc) {
      console.log('❌ PROBLEMA: Função RPC ainda retorna o jogador deletado!');
    } else {
      console.log('✅ SUCESSO: Função RPC não retorna o jogador deletado!');
    }
    
    console.log('\n5️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    if (playerStillExists) {
      console.log('❌ PROBLEMA: Delete não persiste no banco');
      console.log('💡 CAUSA: RLS policies ou triggers podem estar impedindo');
    } else if (playerInRpc) {
      console.log('❌ PROBLEMA: Função RPC retorna dados antigos');
      console.log('💡 CAUSA: Função RPC pode estar fazendo cache');
    } else {
      console.log('✅ DELETE FUNCIONANDO PERFEITAMENTE!');
      console.log('💡 PROBLEMA: Pode estar na lógica de reload do frontend');
    }
    
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Teste o delete no frontend');
    console.log('2. Verifique se o jogador não volta após reload');
    console.log('3. Se o problema persistir, verifique o console do navegador');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testDeleteFinal();



