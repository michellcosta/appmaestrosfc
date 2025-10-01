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
    console.log('Verifique se o arquivo .env contém:');
    console.log('VITE_SUPABASE_URL=...');
    console.log('VITE_SUPABASE_ANON_KEY=...');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfilesSchema() {
    try {
        console.log('🔍 Verificando schema da tabela profiles...');

        // Verificar se a tabela existe e obter informações sobre as colunas
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Erro ao verificar tabela profiles:', error.message);
            return;
        }

        console.log('✅ Tabela profiles existe');

        // Tentar inserir um registro de teste para verificar colunas
        const testId = crypto.randomUUID();
        const testData = {
            id: testId,
            email: 'teste@exemplo.com',
            role: 'player',
            name: 'Jogador Teste', // Campo que queremos verificar
            position: 'Meia',
            stars: 5,
            notifications_enabled: true,
            approved: true
        };

        console.log('🧪 Testando inserção com campo name...');
        const { error: insertError } = await supabase
            .from('profiles')
            .insert(testData);

        if (insertError) {
            if (insertError.message.includes('column "name" does not exist')) {
                console.log('⚠️  Campo "name" não existe na tabela profiles');
                console.log('📝 Para adicionar o campo, execute este SQL no Supabase:');
                console.log('');
                console.log('ALTER TABLE profiles ADD COLUMN name TEXT;');
                console.log('');
            } else {
                console.error('❌ Erro ao inserir teste:', insertError.message);
            }
        } else {
            console.log('✅ Campo "name" existe e funciona!');

            // Limpar o registro de teste
            await supabase
                .from('profiles')
                .delete()
                .eq('id', testId);

            console.log('🧹 Registro de teste removido');
        }

        // Listar colunas atuais
        console.log('\n📋 Colunas atuais da tabela profiles:');
        console.log('- id (uuid, primary key)');
        console.log('- email (text, unique)');
        console.log('- role (text)');
        console.log('- membership (text)');
        console.log('- position (text)');
        console.log('- stars (integer)');
        console.log('- notifications_enabled (boolean)');
        console.log('- approved (boolean)');
        console.log('- updated_at (timestamp)');
        console.log('- name (text) - ⚠️  pode não existir');

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

checkProfilesSchema();
