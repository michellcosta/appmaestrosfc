/**
 * Script para Corrigir RPC via MCP
 * Tenta corrigir a função RPC usando abordagens alternativas
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔧 CORRIGINDO RPC VIA MCP...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRpcViaMCP() {
  try {
    console.log('1️⃣ VERIFICANDO PROBLEMA ATUAL...');
    console.log('================================');
    
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
      console.log('❌ PROBLEMA CONFIRMADO: RPC retorna dados incorretos!');
      console.log(`   Banco: ${dbPlayers.length} vs RPC: ${rpcPlayers?.length}`);
    } else {
      console.log('✅ RPC está funcionando corretamente');
      return;
    }
    
    console.log('\n2️⃣ TENTANDO CORRIGIR VIA MCP...');
    console.log('=================================');
    
    // Tentar usar a função add_player para testar se conseguimos executar SQL
    console.log('🧪 Testando se MCP pode executar SQL...');
    
    const { data: testData, error: testError } = await supabase.rpc('add_player', {
      p_name: 'Teste RPC Fix',
      p_email: 'teste-rpc@fix.com',
      p_role: 'diarista',
      p_position: 'Meia',
      p_shirt_size: 'G'
    });
    
    if (testError) {
      console.log('❌ Erro ao testar MCP:', testError.message);
      console.log('💡 MCP pode não ter permissão para executar SQL');
    } else {
      console.log('✅ MCP funcionando - adicionando jogador de teste');
      
      // Deletar o jogador de teste
      const { data: deleteTest, error: deleteTestError } = await supabase
        .from('player_profiles')
        .delete()
        .eq('user_id', testData[0]?.id)
        .select('*');
      
      if (deleteTestError) {
        console.log('⚠️ Erro ao deletar jogador de teste:', deleteTestError.message);
      } else {
        console.log('✅ Jogador de teste removido');
      }
    }
    
    console.log('\n3️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    console.log('❌ PROBLEMA: Função RPC não está filtrando corretamente');
    console.log('💡 CAUSA: Função RPC pode estar fazendo join com tabela diferente');
    console.log('🔧 SOLUÇÃO: Precisa executar manualmente no Supabase Dashboard');
    
    console.log('\n📋 SCRIPT SQL PARA EXECUTAR MANUALMENTE:');
    console.log('======================================');
    console.log(`
-- Execute este SQL no Supabase Dashboard > SQL Editor

CREATE OR REPLACE FUNCTION get_all_memberships()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  role text,
  position text,
  stars integer,
  shirt_size text,
  approved boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.user_id as id,
    pp.name,
    COALESCE(au.email, '') as email,
    COALESCE(m.role, 'diarista') as role,
    pp.position_text as position,
    COALESCE(pp.stars, 5) as stars,
    COALESCE(pp.shirt_size, 'G') as shirt_size,
    COALESCE(pp.approved, true) as approved,
    COALESCE(pp.created_at, now()) as created_at
  FROM player_profiles pp
  LEFT JOIN memberships m ON pp.user_id = m.user_id
  LEFT JOIN auth.users au ON pp.user_id = au.id
  WHERE pp.approved = true
  ORDER BY pp.created_at DESC;
END;
$$;
    `);
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Execute o script SQL acima no Supabase Dashboard');
    console.log('2. Teste o delete no frontend');
    console.log('3. Verifique se o jogador não volta após reload');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
fixRpcViaMCP();



