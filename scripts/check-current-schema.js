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

async function checkCurrentSchema() {
    try {
        console.log('🔍 Verificando colunas atuais da tabela profiles...');

        // Tentar inserir um registro de teste para ver quais campos são aceitos
        const testId = crypto.randomUUID();
        const testData = {
            id: testId,
            email: 'teste@exemplo.com',
            role: 'player'
        };

        console.log('🧪 Testando inserção básica...');
        const { error: basicError } = await supabase
            .from('profiles')
            .insert(testData);

        if (basicError) {
            console.error('❌ Erro na inserção básica:', basicError.message);
        } else {
            console.log('✅ Inserção básica funcionou!');

            // Limpar o registro de teste
            await supabase
                .from('profiles')
                .delete()
                .eq('id', testId);

            console.log('🧹 Registro de teste removido');
        }

        // Testar campos adicionais um por um
        const fieldsToTest = ['position', 'stars', 'name', 'membership', 'approved', 'notifications_enabled'];

        for (const field of fieldsToTest) {
            const testDataWithField = {
                ...testData,
                id: crypto.randomUUID(),
                [field]: field === 'stars' ? 5 : field === 'approved' || field === 'notifications_enabled' ? true : 'teste'
            };

            const { error: fieldError } = await supabase
                .from('profiles')
                .insert(testDataWithField);

            if (fieldError) {
                if (fieldError.message.includes(`Could not find the '${field}' column`)) {
                    console.log(`❌ Campo '${field}' NÃO existe`);
                } else {
                    console.log(`⚠️  Campo '${field}' existe mas com erro:`, fieldError.message);
                }
            } else {
                console.log(`✅ Campo '${field}' existe e funciona!`);

                // Limpar
                await supabase
                    .from('profiles')
                    .delete()
                    .eq('id', testDataWithField.id);
            }
        }

        // Listar colunas usando uma query simples
        console.log('\n📋 Verificando colunas via query...');
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Erro ao listar colunas:', error.message);
        } else {
            console.log('✅ Query funcionou. Colunas disponíveis:');
            if (data && data.length > 0) {
                console.log(Object.keys(data[0]));
            } else {
                console.log('Tabela está vazia, mas existe');
            }
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

checkCurrentSchema();
