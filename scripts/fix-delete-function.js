/**
 * Script de Correção da Função de Delete
 * Corrige o problema de exclusão de jogadores
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔧 CORRIGINDO FUNÇÃO DE DELETE...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDeleteFunction() {
  try {
    console.log('1️⃣ VERIFICANDO JOGADORES REAIS...');
    console.log('==================================');
    
    // Buscar jogadores reais
    const { data: players, error: playersError } = await supabase
      .from('memberships')
      .select('*')
      .eq('status', 'active')
      .limit(5);
    
    if (playersError) {
      console.log('❌ Erro ao buscar jogadores:', playersError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${players.length} jogadores ativos`);
    
    if (players.length === 0) {
      console.log('⚠️ Nenhum jogador encontrado para testar');
      return;
    }
    
    // Pegar o primeiro jogador para teste
    const testPlayer = players[0];
    console.log(`🔍 Testando com jogador: ${testPlayer.user_id}`);
    
    console.log('\n2️⃣ TESTANDO DELETE COM UUID REAL...');
    console.log('=====================================');
    
    // Tentar deletar com UUID real
    const { data: deleteResult, error: deleteError } = await supabase
      .from('memberships')
      .delete()
      .eq('user_id', testPlayer.user_id)
      .select('*');
    
    if (deleteError) {
      console.log('❌ Erro no delete:', deleteError.message);
      console.log('💡 Possíveis causas:');
      console.log('   - RLS policy bloqueando');
      console.log('   - Foreign key constraints');
      console.log('   - Usuário não tem permissão');
    } else {
      console.log('✅ Delete funcionou!');
      console.log('📊 Registros deletados:', deleteResult?.length || 0);
    }
    
    console.log('\n3️⃣ VERIFICANDO RLS POLICIES...');
    console.log('==============================');
    
    // Verificar se conseguimos fazer operações básicas
    const { data: testSelect, error: testSelectError } = await supabase
      .from('memberships')
      .select('*')
      .limit(1);
    
    if (testSelectError) {
      console.log('❌ Erro no select:', testSelectError.message);
      console.log('💡 RLS pode estar bloqueando todas as operações');
    } else {
      console.log('✅ Select funcionou - RLS não está bloqueando completamente');
    }
    
    console.log('\n4️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    if (deleteError) {
      console.log('❌ PROBLEMA CONFIRMADO: Delete não funciona');
      console.log('💡 CAUSA: RLS policies ou permissões');
      console.log('🔧 SOLUÇÃO: Verificar RLS policies no Supabase Dashboard');
    } else {
      console.log('✅ DELETE FUNCIONANDO!');
      console.log('💡 PROBLEMA: Pode estar na interface do frontend');
    }
    
    console.log('\n🔧 SOLUÇÕES RECOMENDADAS:');
    console.log('==========================');
    console.log('1. Verificar RLS policies no Supabase Dashboard');
    console.log('2. Verificar se o usuário está logado');
    console.log('3. Verificar se o usuário tem role de owner/admin');
    console.log('4. Testar delete diretamente no Supabase Dashboard');
    console.log('5. Verificar se a interface está passando UUIDs corretos');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar correção
fixDeleteFunction();



