/**
 * Script de Diagnóstico do Problema de Delete
 * Identifica exatamente o que está impedindo a exclusão
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔍 DIAGNOSTICANDO PROBLEMA DE DELETE...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDeleteIssue() {
  try {
    console.log('1️⃣ VERIFICANDO TABELAS EXISTENTES...');
    console.log('=====================================');
    
    // Verificar se a tabela memberships existe
    const { data: membershipsData, error: membershipsError } = await supabase
      .from('memberships')
      .select('*')
      .limit(1);
    
    if (membershipsError) {
      console.log('❌ Erro na tabela memberships:', membershipsError.message);
    } else {
      console.log('✅ Tabela memberships existe e acessível');
    }
    
    // Verificar se a tabela player_profiles existe
    const { data: profilesData, error: profilesError } = await supabase
      .from('player_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Erro na tabela player_profiles:', profilesError.message);
    } else {
      console.log('✅ Tabela player_profiles existe e acessível');
    }
    
    console.log('\n2️⃣ TESTANDO DELETE SIMPLES...');
    console.log('==============================');
    
    // Tentar deletar um registro de teste (se existir)
    const { data: testDelete, error: testDeleteError } = await supabase
      .from('memberships')
      .delete()
      .eq('user_id', 'test-id-that-does-not-exist')
      .select('*');
    
    if (testDeleteError) {
      console.log('❌ Erro no teste de delete:', testDeleteError.message);
      console.log('💡 Possíveis causas:');
      console.log('   - RLS policy bloqueando delete');
      console.log('   - Usuário não tem permissão');
      console.log('   - Tabela não existe');
    } else {
      console.log('✅ Teste de delete funcionou (nenhum registro deletado)');
    }
    
    console.log('\n3️⃣ VERIFICANDO RLS POLICIES...');
    console.log('==============================');
    
    // Verificar se conseguimos inserir (para testar RLS)
    const { data: testInsert, error: testInsertError } = await supabase
      .from('memberships')
      .insert({
        user_id: 'test-insert-id',
        group_id: 'test-group-id',
        role: 'test',
        status: 'active'
      })
      .select('*');
    
    if (testInsertError) {
      console.log('❌ Erro no teste de insert:', testInsertError.message);
      console.log('💡 RLS pode estar bloqueando operações');
    } else {
      console.log('✅ Teste de insert funcionou');
      
      // Limpar o registro de teste
      await supabase
        .from('memberships')
        .delete()
        .eq('user_id', 'test-insert-id');
    }
    
    console.log('\n4️⃣ VERIFICANDO ESTRUTURA DAS TABELAS...');
    console.log('======================================');
    
    // Verificar estrutura da tabela memberships
    const { data: membershipsStructure, error: membershipsStructureError } = await supabase
      .from('memberships')
      .select('*')
      .limit(1);
    
    if (membershipsStructureError) {
      console.log('❌ Erro ao verificar estrutura memberships:', membershipsStructureError.message);
    } else {
      console.log('✅ Estrutura da tabela memberships OK');
      if (membershipsStructure && membershipsStructure.length > 0) {
        console.log('📋 Campos encontrados:', Object.keys(membershipsStructure[0]));
      }
    }
    
    console.log('\n5️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    if (membershipsError) {
      console.log('❌ PROBLEMA: Tabela memberships não acessível');
      console.log('💡 SOLUÇÃO: Verificar RLS policies ou estrutura da tabela');
    } else if (testDeleteError) {
      console.log('❌ PROBLEMA: RLS policies bloqueando delete');
      console.log('💡 SOLUÇÃO: Verificar permissões do usuário ou RLS policies');
    } else {
      console.log('✅ DIAGNÓSTICO: Tudo parece estar funcionando');
      console.log('💡 PROBLEMA: Pode estar na interface ou na lógica do frontend');
    }
    
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Verificar se o usuário está logado corretamente');
    console.log('2. Verificar se o usuário tem permissão para deletar');
    console.log('3. Verificar se a interface está chamando a função corretamente');
    console.log('4. Testar delete diretamente no Supabase Dashboard');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar diagnóstico
diagnoseDeleteIssue();



