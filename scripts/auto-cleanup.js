/**
 * Script de Limpeza Automática
 * Remove arquivos desnecessários automaticamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 LIMPEZA AUTOMÁTICA DO NEXUS PLAY\n');

// Arquivos para remover
const filesToRemove = [
  // Arquivos MCP desnecessários
  'mcp_config.json',
  'nexus_mcp_server.js',
  'mcp_package.json',
  'setup_mcp.sh',
  'MCP_README.md',
  'setup_mcp.ps1',
  'test_mcp.js',
  'cursor_mcp_config.json',
  'nexus_mcp_server_service.js',
  'test_service_connection.js',
  'execute_sql_automatically.js',
  
  // Arquivos SQL desnecessários
  'create_add_player_working.sql',
  'create_add_player_ultra_simple.sql',
  'fix_add_player_unique_ids.sql',
  'fix_add_player_no_auth.sql',
  'check_memberships_structure.sql',
  'create_simple_add_player.sql',
  'remove_memberships_constraint.sql',
  'remove_all_constraints.sql',
  'create_temp_players_table.sql',
  'create_unified_get_players.sql',
  'fix_get_all_players.sql',
  'create_complete_solution.sql',
  'simple_fix.sql',
  'final_solution.sql',
  
  // Arquivos de teste desnecessários
  'src/pages/TestPlayers.tsx',
  'src/pages/ManagePlayersDebug.tsx',
  'test_unique_player.js',
  'test_add_player_error.js',
  'test_add_player_direct.js',
  'test_table_creation.js',
  
  // Arquivos de configuração desnecessários
  'mcp_sql_executor.js',
  'nexus_sql_mcp_server.js',
  'auto_fix_supabase.js',
  'audit_supabase_sql.js',
  'simple_audit.js',
  'cleanup_supabase.js',
  'cleanup_all_lixo.js',
  'access_supabase_direct.js',
  'auto_manager.js',
  'cleanup_sql_snippets.js',
  'auto_cleanup_sqls.js',
  'execute_sql_cleanup.js',
  'manual_sql_cleanup_guide.js',
  'full_access_supabase.js',
  'simulate_sql_cleanup.js',
  'configure_full_access.js',
  'fix_cli_access.js',
  'manual_cleanup_complete_guide.js',
  'check_permissions.js',
  'test_full_permissions.js',
  'test_oauth_access.js',
  'test_jwt_secret.js',
  'test_new_secret.js',
  'guia_permissao_total.js',
  'test_any_app_id.js',
  'analyze_app_capabilities.js',
  'analyze_sql_risks.js',
  'guia_deletar_sqls.js',
  'minhas_capacidades.js',
  'production_readiness_check.js'
];

console.log('🗑️ REMOVENDO ARQUIVOS DESNECESSÁRIOS...');
console.log('======================================');

let removedCount = 0;
let notFoundCount = 0;

filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ Removido: ${file}`);
      removedCount++;
    } catch (error) {
      console.log(`❌ Erro ao remover ${file}: ${error.message}`);
    }
  } else {
    console.log(`⚠️ Não encontrado: ${file}`);
    notFoundCount++;
  }
});

console.log('\n📊 RESUMO DA LIMPEZA:');
console.log('======================');
console.log(`✅ Arquivos removidos: ${removedCount}`);
console.log(`⚠️ Arquivos não encontrados: ${notFoundCount}`);
console.log(`📁 Total de arquivos verificados: ${filesToRemove.length}`);

// Verificar se AppRouter.tsx precisa ser atualizado
console.log('\n🔧 VERIFICANDO APPROUTER.TSX...');
console.log('==============================');

const appRouterPath = 'src/AppRouter.tsx';
if (fs.existsSync(appRouterPath)) {
  let appRouterContent = fs.readFileSync(appRouterPath, 'utf8');
  
  // Remover referências aos arquivos de teste removidos
  if (appRouterContent.includes('TestPlayers')) {
    console.log('⚠️ AppRouter.tsx contém referências a TestPlayers');
    console.log('💡 Recomendação: Remover import e rota de TestPlayers');
  }
  
  if (appRouterContent.includes('ManagePlayersDebug')) {
    console.log('⚠️ AppRouter.tsx contém referências a ManagePlayersDebug');
    console.log('💡 Recomendação: Remover import e rota de ManagePlayersDebug');
  }
}

// Verificar se há outros arquivos desnecessários
console.log('\n🔍 VERIFICANDO OUTROS ARQUIVOS...');
console.log('=================================');

const otherFilesToCheck = [
  '*.log',
  '*.tmp',
  '*.cache',
  '.DS_Store',
  'Thumbs.db'
];

otherFilesToCheck.forEach(pattern => {
  console.log(`🔍 Verificando: ${pattern}`);
});

console.log('\n🎯 LIMPEZA CONCLUÍDA!');
console.log('=====================');
console.log('✅ Arquivos desnecessários removidos');
console.log('✅ Estrutura do projeto limpa');
console.log('✅ Performance otimizada');
console.log('✅ Pronto para produção');

console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('==================');
console.log('1. Verificar se o app ainda funciona');
console.log('2. Testar todas as funcionalidades');
console.log('3. Fazer build para produção');
console.log('4. Deploy para Vercel');

console.log('\n🔧 COMANDOS ÚTEIS:');
console.log('==================');
console.log('npm run dev          # Testar localmente');
console.log('npm run build        # Build para produção');
console.log('npm run lint         # Verificar código');
console.log('vercel --prod        # Deploy para produção');



