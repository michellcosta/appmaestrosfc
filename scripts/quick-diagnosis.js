#!/usr/bin/env node

/**
 * Diagnóstico Rápido do Maestros FC
 * Identifica problemas críticos em segundos
 */

import fs from 'fs';

console.log('🚀 DIAGNÓSTICO RÁPIDO - MAESTROS FC');
console.log('===================================\n');

// 1. Verificar arquivos críticos
console.log('📁 Verificando arquivos críticos...');
const criticalFiles = [
    'src/auth/OfflineAuthProvider.tsx',
    'src/pages/ManagePlayersSimple.tsx',
    'src/lib/supabase.ts',
    'package.json'
];

let criticalIssues = 0;
criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - CRÍTICO!`);
        criticalIssues++;
    }
});

// 2. Verificar configuração do Supabase
console.log('\n🔧 Verificando configuração Supabase...');
try {
    const supabaseConfig = fs.readFileSync('src/lib/supabase.ts', 'utf8');

    if (supabaseConfig.includes('VITE_SUPABASE_URL') && supabaseConfig.includes('VITE_SUPABASE_ANON_KEY')) {
        console.log('✅ Variáveis de ambiente configuradas');
    } else {
        console.log('❌ Variáveis de ambiente não configuradas - CRÍTICO!');
        criticalIssues++;
    }

    if (supabaseConfig.includes('auth:') || supabaseConfig.includes('createClient')) {
        console.log('✅ Sistema de autenticação configurado');
    } else {
        console.log('❌ Sistema de autenticação não configurado - CRÍTICO!');
        criticalIssues++;
    }
} catch (error) {
    console.log('❌ Erro ao verificar configuração Supabase - CRÍTICO!');
    criticalIssues++;
}

// 3. Verificar sistema de jogadores
console.log('\n👥 Verificando sistema de jogadores...');
try {
    const playerSystem = fs.readFileSync('src/pages/ManagePlayersSimple.tsx', 'utf8');

    if (playerSystem.includes('isTemporary')) {
        console.log('⚠️  Sistema usando jogadores temporários - PRECISA CORRIGIR');
    } else {
        console.log('✅ Sistema de jogadores configurado');
    }

    if (playerSystem.includes('RLS') || playerSystem.includes('row-level security')) {
        console.log('⚠️  Problemas de RLS detectados - PRECISA CORRIGIR');
    }

    if (playerSystem.includes('supabase.from(\'profiles\')') || playerSystem.includes('supabase.rpc') || playerSystem.includes('.from(\'profiles\')')) {
        console.log('✅ Conexão com tabela profiles configurada');
    } else {
        console.log('❌ Conexão com tabela profiles não encontrada - CRÍTICO!');
        criticalIssues++;
    }
} catch (error) {
    console.log('❌ Erro ao verificar sistema de jogadores - CRÍTICO!');
    criticalIssues++;
}

// 4. Verificar package.json
console.log('\n📦 Verificando dependências...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    const requiredDeps = ['react', 'typescript', '@supabase/supabase-js', 'zustand'];
    let missingDeps = 0;

    requiredDeps.forEach(dep => {
        if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
            console.log(`✅ ${dep}`);
        } else {
            console.log(`❌ ${dep} - CRÍTICO!`);
            missingDeps++;
        }
    });

    if (missingDeps > 0) {
        criticalIssues += missingDeps;
    }
} catch (error) {
    console.log('❌ Erro ao verificar package.json - CRÍTICO!');
    criticalIssues++;
}

// 5. Relatório final
console.log('\n📊 RELATÓRIO FINAL');
console.log('==================');

if (criticalIssues === 0) {
    console.log('🎉 SISTEMA OK! Nenhum problema crítico encontrado.');
    console.log('✅ Pronto para desenvolvimento e testes.');
} else {
    console.log(`🚨 ${criticalIssues} PROBLEMAS CRÍTICOS encontrados!`);
    console.log('❌ Sistema NÃO está pronto para produção.');
    console.log('\n🔧 AÇÕES NECESSÁRIAS:');
    console.log('1. Resolver problemas críticos listados acima');
    console.log('2. Executar: node scripts/analyze-system.js para análise completa');
    console.log('3. Configurar variáveis de ambiente');
    console.log('4. Testar sistema de autenticação');
    console.log('5. Implementar persistência real de dados');
}

console.log('\n💡 PRÓXIMOS PASSOS:');
console.log('1. npm run dev - Iniciar desenvolvimento');
console.log('2. Testar login offline como Owner');
console.log('3. Navegar para /manage-players');
console.log('4. Testar adição de jogadores');
console.log('5. Verificar persistência de dados');

console.log('\n🚀 Para análise completa: node scripts/analyze-system.js');
