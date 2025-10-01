#!/usr/bin/env node

/**
 * Script para aplicar correções no Supabase
 * Executa as queries SQL necessárias para corrigir problemas de RLS
 */

import fs from 'fs';

console.log('🚀 APLICANDO CORREÇÕES NO SUPABASE - MAESTROS FC');
console.log('===============================================\n');

// Ler o arquivo de migração
const migrationFile = 'supabase/migrations/20241201000005_fix_rls_policies.sql';

if (!fs.existsSync(migrationFile)) {
    console.log('❌ Arquivo de migração não encontrado:', migrationFile);
    console.log('Execute primeiro: node scripts/fix-rls-issues.js');
    process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

console.log('📄 Conteúdo da migração:');
console.log('========================');
console.log(migrationSQL);
console.log('\n========================\n');

console.log('🎯 INSTRUÇÕES PARA APLICAR NO SUPABASE:');
console.log('======================================');
console.log('1. Acesse: https://supabase.com/dashboard');
console.log('2. Vá para o seu projeto: autxxmhtadimwvprfsov');
console.log('3. Clique em "SQL Editor" no menu lateral');
console.log('4. Cole o SQL acima na área de texto');
console.log('5. Clique em "Run" para executar');
console.log('6. Verifique se não há erros na execução');

console.log('\n🔍 VERIFICAÇÃO PÓS-APLICAÇÃO:');
console.log('============================');
console.log('1. Vá para "Table Editor" → "profiles"');
console.log('2. Verifique se consegue ver os dados');
console.log('3. Teste inserir um novo registro');
console.log('4. Teste atualizar um registro existente');
console.log('5. Teste deletar um registro');

console.log('\n🧪 TESTE NO APP:');
console.log('================');
console.log('1. npm run dev');
console.log('2. Login como Owner Teste');
console.log('3. Navegar para /manage-players');
console.log('4. Tentar adicionar um jogador');
console.log('5. Verificar se persiste após recarregar a página');

console.log('\n📋 SQL PARA COPIAR:');
console.log('===================');
console.log(migrationSQL);

console.log('\n💡 DICAS:');
console.log('=========');
console.log('• Se der erro de permissão, verifique se está logado como admin');
console.log('• Se der erro de RLS, as políticas podem não ter sido aplicadas');
console.log('• Sempre faça backup antes de executar queries em produção');
console.log('• Teste em ambiente de desenvolvimento primeiro');

console.log('\n🚀 Pronto para aplicar! Execute o SQL no Supabase Dashboard.');

