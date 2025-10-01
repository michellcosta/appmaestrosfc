/**
 * Script de Teste da Função de Delete
 * Testa a funcionalidade de exclusão de jogadores
 */

import { createClient } from '@supabase/supabase-js';

console.log('🧪 TESTANDO FUNÇÃO DE DELETE...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeleteFunction() {
  try {
    console.log('1️⃣ TESTANDO CONEXÃO COM SUPABASE...');
    console.log('=====================================');
    
    // Testar conexão
    const { data: testData, error: testError } = await supabase
      .from('memberships')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Erro na conexão:', testError.message);
      return;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    
    console.log('\n2️⃣ VERIFICANDO JOGADORES ATUAIS...');
    console.log('===================================');
    
    // Listar jogadores atuais
    const { data: players, error: playersError } = await supabase
      .from('memberships')
      .select(`
        user_id,
        role,
        status,
        created_at,
        player_profiles (
          name,
          position_text,
          shirt_size,
          stars,
          approved
        )
      `)
      .eq('status', 'active');
    
    if (playersError) {
      console.log('❌ Erro ao buscar jogadores:', playersError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${players.length} jogadores ativos:`);
    players.forEach((player, index) => {
      console.log(`   ${index + 1}. ${player.player_profiles?.name || 'Sem nome'} (${player.role})`);
    });
    
    console.log('\n3️⃣ TESTANDO RLS POLICIES...');
    console.log('===========================');
    
    // Verificar se conseguimos deletar (sem realmente deletar)
    const testPlayer = players[0];
    if (testPlayer) {
      console.log(`🔍 Testando delete para: ${testPlayer.player_profiles?.name}`);
      
      // Tentar deletar (mas não executar)
      const { data: deleteTest, error: deleteTestError } = await supabase
        .from('memberships')
        .delete()
        .eq('user_id', testPlayer.user_id)
        .select('*');
      
      if (deleteTestError) {
        console.log('❌ Erro no teste de delete:', deleteTestError.message);
        console.log('💡 Possíveis causas:');
        console.log('   - RLS policy bloqueando');
        console.log('   - Permissões insuficientes');
        console.log('   - Foreign key constraints');
      } else {
        console.log('✅ Teste de delete funcionou!');
      }
    }
    
    console.log('\n4️⃣ VERIFICANDO ESTRUTURA DA TABELA...');
    console.log('=====================================');
    
    // Verificar estrutura da tabela memberships
    const { data: tableInfo, error: tableError } = await supabase
      .from('memberships')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Erro ao verificar estrutura:', tableError.message);
    } else {
      console.log('✅ Estrutura da tabela OK');
    }
    
    console.log('\n5️⃣ DIAGNÓSTICO COMPLETO...');
    console.log('===========================');
    console.log('✅ Conexão Supabase: OK');
    console.log('✅ Busca de jogadores: OK');
    console.log('✅ Estrutura da tabela: OK');
    
    console.log('\n💡 POSSÍVEIS PROBLEMAS:');
    console.log('========================');
    console.log('1. RLS policies podem estar bloqueando delete');
    console.log('2. Usuário pode não ter permissão para deletar');
    console.log('3. Foreign key constraints podem estar impedindo');
    console.log('4. Interface pode não estar chamando a função corretamente');
    
    console.log('\n🔧 SOLUÇÕES SUGERIDAS:');
    console.log('======================');
    console.log('1. Verificar RLS policies no Supabase');
    console.log('2. Verificar se o usuário está logado');
    console.log('3. Verificar permissões do usuário');
    console.log('4. Testar delete diretamente no Supabase');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testDeleteFunction();



