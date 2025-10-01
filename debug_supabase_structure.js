#!/usr/bin/env node

/**
 * Script para analisar a estrutura do Supabase e identificar problemas
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://autxxmhtadimwvprfsov.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjYwNDU0NywiZXhwIjoyMDcyMTgwNTQ3fQ.do-8V40YZDCCkiGnkLWounzeReJTDEeqaF6OttG_zgc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function analyzeSupabaseStructure() {
  console.log('🔍 Analisando estrutura do Supabase...\n');

  try {
    // 1. Verificar se a tabela player_profiles existe
    console.log('1️⃣ Verificando tabela player_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('player_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Tabela player_profiles não existe ou erro:', profilesError.message);
      console.log('📝 Código do erro:', profilesError.code);
    } else {
      console.log('✅ Tabela player_profiles existe');
      console.log('📋 Estrutura:', JSON.stringify(profiles, null, 2));
    }

    // 2. Verificar estrutura da tabela memberships
    console.log('\n2️⃣ Verificando tabela memberships...');
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('*')
      .limit(1);
    
    if (membershipsError) {
      console.log('❌ Erro na tabela memberships:', membershipsError.message);
    } else {
      console.log('✅ Tabela memberships OK');
      console.log('📋 Estrutura:', JSON.stringify(memberships, null, 2));
    }

    // 3. Verificar função get_all_memberships
    console.log('\n3️⃣ Testando função get_all_memberships...');
    const { data: players, error: playersError } = await supabase.rpc('get_all_memberships');
    
    if (playersError) {
      console.log('❌ Erro na função get_all_memberships:', playersError.message);
      console.log('📝 Código do erro:', playersError.code);
    } else {
      console.log('✅ Função get_all_memberships OK');
      console.log(`📋 ${players.length} jogadores encontrados`);
      if (players.length > 0) {
        console.log('📋 Primeiro jogador:', JSON.stringify(players[0], null, 2));
      }
    }

    // 4. Verificar se existe coluna position na tabela player_profiles
    console.log('\n4️⃣ Verificando colunas da tabela player_profiles...');
    try {
      const { data: testQuery, error: testError } = await supabase
        .from('player_profiles')
        .select('position_text')
        .limit(1);
      
      if (testError) {
        console.log('❌ Coluna position_text não existe:', testError.message);
        console.log('📝 Código do erro:', testError.code);
      } else {
        console.log('✅ Coluna position_text existe');
      }
    } catch (err) {
      console.log('❌ Erro ao verificar coluna position_text:', err.message);
    }

    // 5. Verificar se existe coluna position (sem _text)
    console.log('\n5️⃣ Verificando coluna position (sem _text)...');
    try {
      const { data: testQuery2, error: testError2 } = await supabase
        .from('player_profiles')
        .select('position')
        .limit(1);
      
      if (testError2) {
        console.log('❌ Coluna position não existe:', testError2.message);
        console.log('📝 Código do erro:', testError2.code);
      } else {
        console.log('✅ Coluna position existe');
      }
    } catch (err) {
      console.log('❌ Erro ao verificar coluna position:', err.message);
    }

    console.log('\n🎯 Análise concluída!');
    console.log('\n📋 Resumo dos problemas encontrados:');
    console.log('1. Verifique se a tabela player_profiles foi criada corretamente');
    console.log('2. Verifique se a coluna position_text existe');
    console.log('3. Verifique se a função get_all_memberships está atualizada');

  } catch (error) {
    console.error('❌ Erro geral na análise:', error.message);
  }
}

// Executar análise
analyzeSupabaseStructure();



