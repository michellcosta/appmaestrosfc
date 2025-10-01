/**
 * Script de Teste de Consistência de Reload
 * Verifica se o problema de inconsistência foi resolvido
 */

import { createClient } from '@supabase/supabase-js';

console.log('🧪 TESTANDO CONSISTÊNCIA DE RELOAD...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReloadConsistency() {
  try {
    console.log('1️⃣ VERIFICANDO ESTADO ATUAL...');
    console.log('==============================');
    
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
    
    // Verificar se há diferença
    if (dbPlayers.length !== rpcPlayers?.length) {
      console.log('❌ PROBLEMA: Inconsistência entre banco e RPC!');
      console.log(`   Banco: ${dbPlayers.length} vs RPC: ${rpcPlayers?.length}`);
    } else {
      console.log('✅ Banco e RPC estão sincronizados');
    }
    
    console.log('\n2️⃣ TESTANDO FILTRO DE JOGADORES...');
    console.log('===================================');
    
    // Simular o filtro do frontend
    const uniquePlayers = rpcPlayers?.filter((player, index, self) => 
      index === self.findIndex(p => p.id === player.id)
    ) || [];
    
    console.log(`✅ Jogadores únicos: ${uniquePlayers.length}`);
    
    const approvedPlayers = uniquePlayers.filter(player => player.approved === true);
    console.log(`✅ Jogadores aprovados: ${approvedPlayers.length}`);
    
    if (approvedPlayers.length !== dbPlayers.length) {
      console.log('❌ PROBLEMA: Filtro não está funcionando corretamente!');
      console.log(`   Banco: ${dbPlayers.length} vs Filtrado: ${approvedPlayers.length}`);
    } else {
      console.log('✅ Filtro está funcionando corretamente');
    }
    
    console.log('\n3️⃣ TESTANDO DADOS DUPLICADOS...');
    console.log('==================================');
    
    if (rpcPlayers?.length !== uniquePlayers.length) {
      console.log('⚠️ Dados duplicados encontrados na função RPC');
      console.log(`🔍 Antes: ${rpcPlayers?.length} Depois: ${uniquePlayers.length}`);
    } else {
      console.log('✅ Nenhum dado duplicado encontrado');
    }
    
    console.log('\n4️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    if (dbPlayers.length !== rpcPlayers?.length) {
      console.log('❌ PROBLEMA: Função RPC não está sincronizada com banco');
      console.log('💡 CAUSA: Função RPC pode estar fazendo join com tabela diferente');
    } else if (approvedPlayers.length !== dbPlayers.length) {
      console.log('❌ PROBLEMA: Filtro de jogadores aprovados não está funcionando');
      console.log('💡 CAUSA: Campo approved pode estar inconsistente');
    } else {
      console.log('✅ TUDO FUNCIONANDO CORRETAMENTE!');
      console.log('💡 Problema pode estar na lógica de reload do frontend');
    }
    
    console.log('\n🔧 CORREÇÕES APLICADAS:');
    console.log('========================');
    console.log('✅ Logs de debug adicionados');
    console.log('✅ Filtro de jogadores aprovados implementado');
    console.log('✅ Lógica de reload melhorada');
    console.log('✅ Prevenção de múltiplos reloads');
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Teste o reload no frontend');
    console.log('2. Verifique os logs no console do navegador');
    console.log('3. Confirme se a inconsistência foi resolvida');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testReloadConsistency();



