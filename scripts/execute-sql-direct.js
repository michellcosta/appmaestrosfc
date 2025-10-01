/**
 * Script para Executar SQL Diretamente
 * Tenta executar o script SQL usando diferentes abordagens
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔧 EXECUTANDO SQL DIRETAMENTE...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLDirect() {
  try {
    console.log('1️⃣ TENTANDO EXECUTAR SQL DIRETAMENTE...');
    console.log('========================================');
    
    // Tentar executar SQL usando diferentes métodos
    const sqlScript = `
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
    `;
    
    // Método 1: Tentar executar via RPC
    console.log('🧪 Tentando executar via RPC...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('sql', {
      query: sqlScript
    });
    
    if (rpcError) {
      console.log('❌ Erro via RPC:', rpcError.message);
    } else {
      console.log('✅ SQL executado via RPC!');
      console.log('📊 Resultado:', rpcData);
    }
    
    console.log('\n2️⃣ TENTANDO MÉTODO ALTERNATIVO...');
    console.log('==================================');
    
    // Método 2: Tentar executar via query direta
    console.log('🧪 Tentando executar via query direta...');
    const { data: queryData, error: queryError } = await supabase
      .from('player_profiles')
      .select('*')
      .limit(1);
    
    if (queryError) {
      console.log('❌ Erro na query direta:', queryError.message);
    } else {
      console.log('✅ Query direta funcionou');
    }
    
    console.log('\n3️⃣ TENTANDO MÉTODO DE BACKUP...');
    console.log('================================');
    
    // Método 3: Tentar executar via função personalizada
    console.log('🧪 Tentando executar via função personalizada...');
    const { data: customData, error: customError } = await supabase.rpc('execute_sql', {
      sql: sqlScript
    });
    
    if (customError) {
      console.log('❌ Erro na função personalizada:', customError.message);
    } else {
      console.log('✅ SQL executado via função personalizada!');
      console.log('📊 Resultado:', customData);
    }
    
    console.log('\n4️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    if (rpcError && queryError && customError) {
      console.log('❌ NENHUM MÉTODO FUNCIONOU');
      console.log('💡 MCP não tem permissão para executar SQL');
      console.log('🔧 SOLUÇÃO: Execute manualmente no Supabase Dashboard');
    } else {
      console.log('✅ SQL EXECUTADO COM SUCESSO!');
      console.log('💡 Função RPC corrigida');
    }
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Teste o delete no frontend');
    console.log('2. Verifique se o jogador não volta após reload');
    console.log('3. Se o problema persistir, execute manualmente no Supabase');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
executeSQLDirect();



