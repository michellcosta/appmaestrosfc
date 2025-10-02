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

async function testInsert() {
    console.log('🧪 Testando inserção de jogador...');

    // Verificar usuário atual
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        console.error('❌ Erro de autenticação:', authError.message);
        return;
    }

    if (!user) {
        console.error('❌ Nenhum usuário autenticado');
        return;
    }

    console.log('✅ Usuário autenticado:', user.email);

    // Teste 1: Inserção básica
    console.log('\n🧪 Teste 1: Inserção básica...');
    try {
        const testPlayer1 = {
            id: crypto.randomUUID(),
            email: `test-${Date.now()}@example.com`,
            role: 'player'
        };

        const { data: data1, error: error1 } = await supabase
            .from('profiles')
            .insert(testPlayer1)
            .select();

        if (error1) {
            console.error('❌ Erro no teste 1:', error1.message);
            console.error('   Código:', error1.code);
            console.error('   Detalhes:', error1.details);
        } else {
            console.log('✅ Teste 1 funcionou!');
            // Limpar
            await supabase.from('profiles').delete().eq('id', testPlayer1.id);
        }
    } catch (e) {
        console.error('❌ Erro inesperado no teste 1:', e.message);
    }

    // Teste 2: Inserção completa (como no app)
    console.log('\n🧪 Teste 2: Inserção completa...');
    try {
        const testPlayer2 = {
            id: crypto.randomUUID(),
            email: `test-complete-${Date.now()}@example.com`,
            role: 'player',
            membership: 'mensalista',
            position: 'Meia',
            stars: 5,
            approved: true,
            notifications_enabled: true
        };

        const { data: data2, error: error2 } = await supabase
            .from('profiles')
            .insert(testPlayer2)
            .select();

        if (error2) {
            console.error('❌ Erro no teste 2:', error2.message);
            console.error('   Código:', error2.code);
            console.error('   Detalhes:', error2.details);
        } else {
            console.log('✅ Teste 2 funcionou!');
            // Limpar
            await supabase.from('profiles').delete().eq('id', testPlayer2.id);
        }
    } catch (e) {
        console.error('❌ Erro inesperado no teste 2:', e.message);
    }

    // Teste 3: Verificar se o email específico já existe
    console.log('\n🧪 Teste 3: Verificar email específico...');
    try {
        const { data: existing, error: searchError } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', 'thiago@moreira.com');

        if (searchError) {
            console.error('❌ Erro na busca:', searchError.message);
        } else if (existing && existing.length > 0) {
            console.log('❌ Email já existe:', existing);
        } else {
            console.log('✅ Email não existe - pode ser usado');
        }
    } catch (e) {
        console.error('❌ Erro inesperado na busca:', e.message);
    }
}

testInsert();

