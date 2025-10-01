import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Ler variáveis do arquivo .env manualmente
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente do Supabase não encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
    console.log('🔍 Verificando políticas RLS...');

    try {
        // Verificar políticas da tabela profiles
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `
        SELECT 
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'profiles'
        ORDER BY policyname;
      `
        });

        if (error) {
            console.error('❌ Erro ao verificar políticas:', error.message);
            console.log('💡 Tentando método alternativo...');

            // Método alternativo - tentar uma consulta simples
            const { data: testData, error: testError } = await supabase
                .from('profiles')
                .select('count')
                .limit(1);

            if (testError) {
                console.error('❌ Erro na consulta de teste:', testError.message);
                console.log('💡 Possível problema com RLS');
            } else {
                console.log('✅ Consulta básica funcionou');
            }

            return;
        }

        if (!data || data.length === 0) {
            console.log('❌ Nenhuma política RLS encontrada');
            console.log('💡 Tabela pode não ter RLS habilitado ou políticas configuradas');
            return;
        }

        console.log('✅ Políticas RLS encontradas:');
        data.forEach((policy, index) => {
            console.log(`\n${index + 1}. ${policy.policyname}`);
            console.log(`   Comando: ${policy.cmd}`);
            console.log(`   Roles: ${policy.roles || 'N/A'}`);
            console.log(`   Condição: ${policy.qual || 'N/A'}`);
            console.log(`   With Check: ${policy.with_check || 'N/A'}`);
        });

    } catch (e) {
        console.error('❌ Erro inesperado:', e.message);
    }
}

checkRLSPolicies();
