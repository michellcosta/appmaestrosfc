#!/usr/bin/env node

/**
 * Script de Análise Completa do Sistema Maestros FC
 * Executa análise automática do app, banco de dados e identifica problemas
 */

import fs from 'fs';

class SystemAnalyzer {
    constructor() {
        this.issues = [];
        this.recommendations = [];
        this.projectStructure = {};
    }

    // Analisar estrutura do projeto
    analyzeProjectStructure() {
        console.log('🔍 Analisando estrutura do projeto...');

        const criticalFiles = [
            'src/main.tsx',
            'src/AppRouter.tsx',
            'src/auth/OfflineAuthProvider.tsx',
            'src/pages/ManagePlayersSimple.tsx',
            'src/lib/supabase.ts',
            'supabase/schema_app.sql',
            'package.json',
            'vite.config.ts'
        ];

        criticalFiles.forEach(file => {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file} - Encontrado`);
                this.projectStructure[file] = 'exists';
            } else {
                console.log(`❌ ${file} - NÃO ENCONTRADO`);
                this.issues.push(`Arquivo crítico ausente: ${file}`);
            }
        });
    }

    // Analisar configuração do Supabase
    analyzeSupabaseConfig() {
        console.log('🔍 Analisando configuração do Supabase...');

        try {
            const supabaseConfig = fs.readFileSync('src/lib/supabase.ts', 'utf8');

            // Verificar se as variáveis estão configuradas
            if (!supabaseConfig.includes('VITE_SUPABASE_URL')) {
                this.issues.push('VITE_SUPABASE_URL não configurada');
            }

            if (!supabaseConfig.includes('VITE_SUPABASE_ANON_KEY')) {
                this.issues.push('VITE_SUPABASE_ANON_KEY não configurada');
            }

            // Verificar se há tratamento de erro
            if (!supabaseConfig.includes('error')) {
                this.recommendations.push('Implementar tratamento de erro no cliente Supabase');
            }

        } catch (error) {
            this.issues.push('Erro ao analisar configuração do Supabase');
        }
    }

    // Analisar sistema de autenticação
    analyzeAuthSystem() {
        console.log('🔍 Analisando sistema de autenticação...');

        try {
            const authProvider = fs.readFileSync('src/auth/OfflineAuthProvider.tsx', 'utf8');

            // Verificar funcionalidades críticas
            const authFeatures = [
                'signInOffline',
                'signInWithGoogle',
                'signOut',
                'localStorage',
                'useAuth'
            ];

            authFeatures.forEach(feature => {
                if (!authProvider.includes(feature)) {
                    this.issues.push(`Funcionalidade de auth ausente: ${feature}`);
                }
            });

            // Verificar tratamento de erros
            if (!authProvider.includes('try') || !authProvider.includes('catch')) {
                this.recommendations.push('Melhorar tratamento de erros no sistema de auth');
            }

        } catch (error) {
            this.issues.push('Erro ao analisar sistema de autenticação');
        }
    }

    // Analisar gerenciamento de jogadores
    analyzePlayerManagement() {
        console.log('🔍 Analisando sistema de gerenciamento de jogadores...');

        try {
            const playerManagement = fs.readFileSync('src/pages/ManagePlayersSimple.tsx', 'utf8');

            // Verificar funcionalidades críticas
            const playerFeatures = [
                'loadPlayers',
                'handleUpdatePlayer',
                'handleDelete',
                'supabase.from(\'profiles\')',
                'localStorage'
            ];

            playerFeatures.forEach(feature => {
                if (!playerManagement.includes(feature)) {
                    this.issues.push(`Funcionalidade de jogadores ausente: ${feature}`);
                }
            });

            // Verificar se há tratamento de RLS
            if (playerManagement.includes('RLS') || playerManagement.includes('row-level security')) {
                this.recommendations.push('Sistema tem problemas de RLS - implementar solução definitiva');
            }

            // Verificar se há jogadores temporários
            if (playerManagement.includes('isTemporary')) {
                this.issues.push('Sistema usando jogadores temporários - implementar persistência real');
            }

        } catch (error) {
            this.issues.push('Erro ao analisar sistema de jogadores');
        }
    }

    // Analisar package.json
    analyzeDependencies() {
        console.log('🔍 Analisando dependências...');

        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

            const requiredDeps = [
                'react',
                'typescript',
                'vite',
                '@supabase/supabase-js',
                'zustand',
                'react-router-dom'
            ];

            requiredDeps.forEach(dep => {
                if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
                    this.issues.push(`Dependência ausente: ${dep}`);
                }
            });

            // Verificar versões
            if (packageJson.dependencies.react && !packageJson.dependencies.react.includes('18')) {
                this.recommendations.push('Considerar atualizar React para versão 18');
            }

        } catch (error) {
            this.issues.push('Erro ao analisar package.json');
        }
    }

    // Gerar relatório final
    generateReport() {
        console.log('\n📊 RELATÓRIO DE ANÁLISE DO SISTEMA');
        console.log('=====================================');

        console.log('\n❌ PROBLEMAS CRÍTICOS:');
        this.issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue}`);
        });

        console.log('\n💡 RECOMENDAÇÕES:');
        this.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });

        console.log('\n🎯 PRÓXIMOS PASSOS:');
        console.log('1. Resolver problemas críticos primeiro');
        console.log('2. Implementar sistema de persistência real');
        console.log('3. Configurar RLS corretamente no Supabase');
        console.log('4. Testar fluxo completo de usuário');
        console.log('5. Preparar para produção');

        // Salvar relatório em arquivo
        const report = {
            timestamp: new Date().toISOString(),
            issues: this.issues,
            recommendations: this.recommendations,
            projectStructure: this.projectStructure
        };

        fs.writeFileSync('system-analysis-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Relatório salvo em: system-analysis-report.json');
    }

    // Executar análise completa
    async run() {
        console.log('🚀 Iniciando análise completa do sistema Maestros FC...\n');

        this.analyzeProjectStructure();
        this.analyzeSupabaseConfig();
        this.analyzeAuthSystem();
        this.analyzePlayerManagement();
        this.analyzeDependencies();

        this.generateReport();
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const analyzer = new SystemAnalyzer();
    analyzer.run().catch(console.error);
}

export default SystemAnalyzer;
