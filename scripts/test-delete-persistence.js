/**
 * Script de Teste de Persistência do Delete
 * Verifica se o delete realmente remove os dados do banco
 */

import { createClient } from '@supabase/supabase-js';

console.log('🧪 TESTANDO PERSISTÊNCIA DO DELETE...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeletePersistence() {
  try {
    console.log('1️⃣ VERIFICANDO DADOS ANTES DO DELETE...');
    console.log('========================================');
    
    // Buscar jogadores antes do delete
    const { data: playersBefore, error: beforeError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('approved', true);
    
    if (beforeError) {
      console.log('❌ Erro ao buscar jogadores:', beforeError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${playersBefore.length} jogadores antes do delete`);
    
    if (playersBefore.length === 0) {
      console.log('⚠️ Nenhum jogador encontrado para testar');
      return;
    }
    
    // Pegar o primeiro jogador para teste
    const testPlayer = playersBefore[0];
    console.log(`🔍 Testando com jogador: ${testPlayer.name} (${testPlayer.user_id})`);
    
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
    
    console.log('\n3️⃣ VERIFICANDO DADOS APÓS DELETE...');
    console.log('===================================');
    
    // Buscar jogadores após o delete
    const { data: playersAfter, error: afterError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('approved', true);
    
    if (afterError) {
      console.log('❌ Erro ao buscar jogadores após delete:', afterError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${playersAfter.length} jogadores após delete`);
    
    // Verificar se o jogador foi realmente removido
    const playerStillExists = playersAfter.some(p => p.user_id === testPlayer.user_id);
    
    if (playerStillExists) {
      console.log('❌ PROBLEMA: Jogador ainda existe após delete!');
      console.log('💡 Possíveis causas:');
      console.log('   - RLS policy está filtrando o delete');
      console.log('   - Delete não foi executado corretamente');
      console.log('   - Dados estão sendo restaurados por trigger');
    } else {
      console.log('✅ SUCESSO: Jogador foi removido do banco!');
    }
    
    console.log('\n4️⃣ VERIFICANDO FUNÇÃO RPC...');
    console.log('============================');
    
    // Verificar se a função RPC ainda retorna o jogador
    const { data: rpcResult, error: rpcError } = await supabase.rpc('get_all_memberships');
    
    if (rpcError) {
      console.log('❌ Erro na função RPC:', rpcError.message);
    } else {
      console.log(`✅ Função RPC retornou ${rpcResult?.length || 0} jogadores`);
      
      const playerInRpc = rpcResult?.some(p => p.id === testPlayer.user_id);
      
      if (playerInRpc) {
        console.log('❌ PROBLEMA: Função RPC ainda retorna o jogador deletado!');
        console.log('💡 CAUSA: Função RPC pode estar fazendo join com tabela diferente');
      } else {
        console.log('✅ SUCESSO: Função RPC não retorna o jogador deletado!');
      }
    }
    
    console.log('\n5️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    if (playerStillExists) {
      console.log('❌ PROBLEMA CONFIRMADO: Delete não persiste no banco');
      console.log('💡 SOLUÇÃO: Verificar RLS policies ou triggers');
    } else if (playerInRpc) {
      console.log('❌ PROBLEMA: Função RPC retorna dados antigos');
      console.log('💡 SOLUÇÃO: Verificar lógica da função RPC');
    } else {
      console.log('✅ DELETE FUNCIONANDO PERFEITAMENTE!');
      console.log('💡 PROBLEMA: Pode estar na lógica de reload do frontend');
    }
    
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Verificar se o delete persiste no banco');
    console.log('2. Verificar se a função RPC retorna dados corretos');
    console.log('3. Verificar se o frontend está fazendo reload desnecessário');
    console.log('4. Implementar cache local mais inteligente');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testDeletePersistence();



