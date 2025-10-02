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

async function checkExistingEmails() {
    console.log('🔍 Verificando emails existentes na tabela profiles...');

    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, role, approved, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar perfis:', error.message);
            return;
        }

        if (!profiles || profiles.length === 0) {
            console.log('✅ Nenhum perfil encontrado - tabela está vazia');
            return;
        }

        console.log(`✅ Encontrados ${profiles.length} perfis:`);
        console.log('');

        profiles.forEach((profile, index) => {
            console.log(`${index + 1}. ${profile.email}`);
            console.log(`   ID: ${profile.id}`);
            console.log(`   Role: ${profile.role}`);
            console.log(`   Aprovado: ${profile.approved}`);
            console.log(`   Criado: ${new Date(profile.created_at || 'N/A').toLocaleString()}`);
            console.log('');
        });

        // Verificar se o email específico existe
        const testEmail = 'thiago@moreira.com';
        const existingEmail = profiles.find(p => p.email === testEmail);

        if (existingEmail) {
            console.log(`❌ Email "${testEmail}" JÁ EXISTE:`);
            console.log(`   ID: ${existingEmail.id}`);
            console.log(`   Role: ${existingEmail.role}`);
            console.log('💡 Use outro email ou edite o existente');
        } else {
            console.log(`✅ Email "${testEmail}" está disponível`);
        }

    } catch (e) {
        console.error('❌ Erro inesperado:', e.message);
    }
}

checkExistingEmails();
