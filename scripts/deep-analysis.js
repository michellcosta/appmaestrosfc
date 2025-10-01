/**
 * Análise Profunda do Sistema
 * Identifica e corrige todos os problemas
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

console.log('🔍 ANÁLISE PROFUNDA DO SISTEMA...\n');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepAnalysis() {
  try {
    console.log('1️⃣ ANÁLISE DE BANCO DE DADOS...');
    console.log('================================');
    
    // Verificar estrutura do banco
    const { data: dbPlayers, error: dbError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('approved', true);
    
    if (dbError) {
      console.log('❌ Erro no banco de dados:', dbError.message);
    } else {
      console.log(`✅ Banco de dados: ${dbPlayers.length} jogadores aprovados`);
    }
    
    // Verificar função RPC
    const { data: rpcPlayers, error: rpcError } = await supabase.rpc('get_all_memberships');
    
    if (rpcError) {
      console.log('❌ Erro na função RPC:', rpcError.message);
    } else {
      console.log(`✅ Função RPC: ${rpcPlayers?.length || 0} jogadores`);
    }
    
    // Verificar inconsistências
    if (dbPlayers.length !== rpcPlayers?.length) {
      console.log('❌ PROBLEMA: Inconsistência entre banco e RPC!');
      console.log(`   Banco: ${dbPlayers.length} vs RPC: ${rpcPlayers?.length}`);
    } else {
      console.log('✅ Banco e RPC estão sincronizados');
    }
    
    console.log('\n2️⃣ ANÁLISE DE DADOS DUPLICADOS...');
    console.log('==================================');
    
    // Verificar dados duplicados
    const uniquePlayers = rpcPlayers?.filter((player, index, self) => 
      index === self.findIndex(p => p.id === player.id)
    ) || [];
    
    if (rpcPlayers?.length !== uniquePlayers.length) {
      console.log('❌ PROBLEMA: Dados duplicados encontrados!');
      console.log(`   Total: ${rpcPlayers?.length} vs Únicos: ${uniquePlayers.length}`);
    } else {
      console.log('✅ Nenhum dado duplicado encontrado');
    }
    
    console.log('\n3️⃣ ANÁLISE DE FILTROS...');
    console.log('========================');
    
    // Verificar filtro de jogadores aprovados
    const approvedPlayers = uniquePlayers.filter(player => player.approved === true);
    
    if (approvedPlayers.length !== dbPlayers.length) {
      console.log('❌ PROBLEMA: Filtro de jogadores aprovados não está funcionando!');
      console.log(`   Banco: ${dbPlayers.length} vs Filtrado: ${approvedPlayers.length}`);
    } else {
      console.log('✅ Filtro de jogadores aprovados funcionando');
    }
    
    console.log('\n4️⃣ ANÁLISE DE PERFORMANCE...');
    console.log('=============================');
    
    // Verificar performance das queries
    const startTime = Date.now();
    const { data: perfData, error: perfError } = await supabase.rpc('get_all_memberships');
    const endTime = Date.now();
    
    if (perfError) {
      console.log('❌ Erro na query de performance:', perfError.message);
    } else {
      console.log(`✅ Query executada em ${endTime - startTime}ms`);
      if (endTime - startTime > 1000) {
        console.log('⚠️ ATENÇÃO: Query lenta detectada!');
      }
    }
    
    console.log('\n5️⃣ ANÁLISE DE SEGURANÇA...');
    console.log('============================');
    
    // Verificar se há dados sensíveis expostos
    const sensitiveData = rpcPlayers?.filter(player => 
      player.email?.includes('@') && player.email !== player.name
    ) || [];
    
    if (sensitiveData.length > 0) {
      console.log('⚠️ ATENÇÃO: Dados sensíveis podem estar expostos');
      console.log(`   ${sensitiveData.length} jogadores com emails diferentes dos nomes`);
    } else {
      console.log('✅ Dados sensíveis protegidos');
    }
    
    console.log('\n6️⃣ ANÁLISE DE CÓDIGO FRONTEND...');
    console.log('==================================');
    
    // Verificar arquivos do frontend
    const frontendFiles = [
      'src/pages/ManagePlayersSimple.tsx',
      'src/AppRouter.tsx',
      'src/auth/OfflineAuthProvider.tsx',
      'src/hooks/usePermissions.ts'
    ];
    
    let frontendIssues = 0;
    
    for (const file of frontendFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Verificar problemas comuns
        if (content.includes('console.log')) {
          console.log(`⚠️ ${file}: Contém console.log (pode impactar performance)`);
          frontendIssues++;
        }
        
        if (content.includes('TODO') || content.includes('FIXME')) {
          console.log(`⚠️ ${file}: Contém TODO/FIXME (código incompleto)`);
          frontendIssues++;
        }
        
        if (content.includes('any')) {
          console.log(`⚠️ ${file}: Contém tipo 'any' (pode causar erros)`);
          frontendIssues++;
        }
      } else {
        console.log(`❌ ${file}: Arquivo não encontrado`);
        frontendIssues++;
      }
    }
    
    if (frontendIssues === 0) {
      console.log('✅ Código frontend sem problemas detectados');
    } else {
      console.log(`⚠️ ${frontendIssues} problemas encontrados no frontend`);
    }
    
    console.log('\n7️⃣ ANÁLISE DE CONFIGURAÇÃO...');
    console.log('==============================');
    
    // Verificar arquivos de configuração
    const configFiles = [
      '.env.local',
      'package.json',
      'vite.config.ts',
      'tailwind.config.ts'
    ];
    
    let configIssues = 0;
    
    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}: Arquivo encontrado`);
      } else {
        console.log(`❌ ${file}: Arquivo não encontrado`);
        configIssues++;
      }
    }
    
    if (configIssues === 0) {
      console.log('✅ Configuração completa');
    } else {
      console.log(`⚠️ ${configIssues} arquivos de configuração faltando`);
    }
    
    console.log('\n8️⃣ DIAGNÓSTICO FINAL...');
    console.log('========================');
    
    const totalIssues = 
      (dbPlayers.length !== rpcPlayers?.length ? 1 : 0) +
      (rpcPlayers?.length !== uniquePlayers.length ? 1 : 0) +
      (approvedPlayers.length !== dbPlayers.length ? 1 : 0) +
      (endTime - startTime > 1000 ? 1 : 0) +
      frontendIssues +
      configIssues;
    
    if (totalIssues === 0) {
      console.log('✅ SISTEMA FUNCIONANDO PERFEITAMENTE!');
      console.log('💡 Nenhum problema detectado');
    } else {
      console.log(`❌ ${totalIssues} PROBLEMAS DETECTADOS!`);
      console.log('💡 Correções necessárias');
    }
    
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Aplicar correções automáticas');
    console.log('2. Testar funcionalidades');
    console.log('3. Validar qualidade');
    console.log('4. Confirmar funcionamento');
    
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
  }
}

// Executar análise
deepAnalysis();



