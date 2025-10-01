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

async function checkCurrentUser() {
    console.log('🔍 Verificando usuário atual...');

    // Verificar se há usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        console.error('❌ Erro de autenticação:', authError.message);
        return;
    }

    if (!user) {
        console.log('❌ Nenhum usuário autenticado');
        console.log('💡 Precisa fazer login primeiro');
        return;
    }

    console.log('✅ Usuário autenticado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);

    // Verificar perfil do usuário
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError.message);
        return;
    }

    if (!profile) {
        console.log('❌ Perfil não encontrado');
        console.log('💡 Usuário precisa ter um perfil na tabela profiles');
        return;
    }

    console.log('✅ Perfil encontrado:');
    console.log(`   Role: ${profile.role}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Aprovado: ${profile.approved}`);

    // Verificar se tem permissão para criar jogadores
    if (['owner', 'admin'].includes(profile.role)) {
        console.log('✅ Usuário tem permissão para criar jogadores');
    } else {
        console.log('❌ Usuário NÃO tem permissão para criar jogadores');
        console.log('💡 Precisa ser owner ou admin');
    }

    // Testar inserção
    console.log('\n🧪 Testando inserção...');
    try {
        const testPlayer = {
            id: crypto.randomUUID(),
            email: `test-${Date.now()}@example.com`,
            role: 'player',
            membership: 'mensalista',
            position: 'Meia',
            stars: 5,
            approved: true,
            notifications_enabled: true
        };

        const { data, error } = await supabase
            .from('profiles')
            .insert(testPlayer)
            .select();

        if (error) {
            console.error('❌ Erro na inserção de teste:', error.message);
            console.error('   Código:', error.code);
        } else {
            console.log('✅ Inserção de teste funcionou!');
            // Limpar o registro de teste
            await supabase.from('profiles').delete().eq('id', testPlayer.id);
            console.log('🧹 Registro de teste removido');
        }
    } catch (e) {
        console.error('❌ Erro inesperado no teste:', e.message);
    }
}

checkCurrentUser();
