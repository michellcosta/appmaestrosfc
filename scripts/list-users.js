#!/usr/bin/env node

/**
 * Script para listar usuários do sistema Maestros FC
 * Busca usuários do localStorage e do Supabase
 */

import { createClient } from '@supabase/supabase-js';

console.log('👥 LISTANDO USUÁRIOS DO SISTEMA...');
console.log('=====================================');

// Configuração do Supabase
const supabaseUrl = 'https://autxxmhtadimwvprfsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
    try {
        console.log('🔍 Buscando usuários do Supabase...\n');

        // 1. Buscar da tabela profiles
        console.log('📋 USUÁRIOS DA TABELA PROFILES:');
        console.log('-------------------------------');

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false });

        if (profilesError) {
            console.log('❌ Erro ao buscar profiles:', profilesError.message);
        } else {
            if (profiles && profiles.length > 0) {
                profiles.forEach((profile, index) => {
                    console.log(`${index + 1}. ${profile.email || 'Sem email'}`);
                    console.log(`   ID: ${profile.id}`);
                    console.log(`   Role: ${profile.role || 'N/A'}`);
                    console.log(`   Membership: ${profile.membership || 'N/A'}`);
                    console.log(`   Position: ${profile.position || 'N/A'}`);
                    console.log(`   Stars: ${profile.stars || 'N/A'}`);
                    console.log(`   Notifications: ${profile.notifications_enabled ? 'Ativo' : 'Inativo'}`);
                    console.log(`   Updated: ${new Date(profile.updated_at).toLocaleString('pt-BR')}`);
                    console.log('');
                });
            } else {
                console.log('📭 Nenhum usuário encontrado na tabela profiles');
            }
        }

        // 2. Buscar da tabela users (se existir)
        console.log('\n📋 USUÁRIOS DA TABELA USERS:');
        console.log('-----------------------------');

        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (usersError) {
            console.log('❌ Erro ao buscar users:', usersError.message);
        } else {
            if (users && users.length > 0) {
                users.forEach((user, index) => {
                    console.log(`${index + 1}. ${user.name || 'Sem nome'} (${user.email || 'Sem email'})`);
                    console.log(`   ID: ${user.id}`);
                    console.log(`   Auth ID: ${user.auth_id || 'N/A'}`);
                    console.log(`   Role: ${user.role || 'N/A'}`);
                    console.log(`   Status: ${user.status || 'N/A'}`);
                    console.log(`   Posição: ${user.posicao || 'N/A'}`);
                    console.log(`   Estrelas: ${user.estrelas || 'N/A'}`);
                    console.log(`   Tamanho Camisa: ${user.tamanho_camisa || 'N/A'}`);
                    console.log(`   Aprovado: ${user.aprovado ? 'Sim' : 'Não'}`);
                    console.log(`   Criado: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
                    console.log('');
                });
            } else {
                console.log('📭 Nenhum usuário encontrado na tabela users');
            }
        }

        // 3. Buscar convites
        console.log('\n📋 CONVITES:');
        console.log('-------------');

        const { data: invites, error: invitesError } = await supabase
            .from('invites')
            .select('*')
            .order('created_at', { ascending: false });

        if (invitesError) {
            console.log('❌ Erro ao buscar invites:', invitesError.message);
        } else {
            if (invites && invites.length > 0) {
                invites.forEach((invite, index) => {
                    console.log(`${index + 1}. ${invite.email}`);
                    console.log(`   ID: ${invite.id}`);
                    console.log(`   Membership: ${invite.membership}`);
                    console.log(`   Status: ${invite.status}`);
                    console.log(`   Token: ${invite.token.substring(0, 8)}...`);
                    console.log(`   Usos: ${invite.used_count}/${invite.max_uses}`);
                    console.log(`   Criado: ${new Date(invite.created_at).toLocaleString('pt-BR')}`);
                    console.log(`   Consumido: ${invite.consumed_at ? new Date(invite.consumed_at).toLocaleString('pt-BR') : 'Não'}`);
                    console.log('');
                });
            } else {
                console.log('📭 Nenhum convite encontrado');
            }
        }

        // 4. Buscar pedidos de participação
        console.log('\n📋 PEDIDOS DE PARTICIPAÇÃO:');
        console.log('----------------------------');

        const { data: requests, error: requestsError } = await supabase
            .from('attendance_requests')
            .select('*')
            .order('requested_at', { ascending: false });

        if (requestsError) {
            console.log('❌ Erro ao buscar pedidos:', requestsError.message);
        } else {
            if (requests && requests.length > 0) {
                requests.forEach((request, index) => {
                    console.log(`${index + 1}. User ID: ${request.user_id}`);
                    console.log(`   ID: ${request.id}`);
                    console.log(`   Match ID: ${request.match_id}`);
                    console.log(`   Status: ${request.status}`);
                    console.log(`   Solicitado: ${new Date(request.requested_at).toLocaleString('pt-BR')}`);
                    console.log(`   Revisado: ${request.reviewed_at ? new Date(request.reviewed_at).toLocaleString('pt-BR') : 'Não'}`);
                    console.log(`   Revisado por: ${request.reviewed_by || 'N/A'}`);
                    console.log('');
                });
            } else {
                console.log('📭 Nenhum pedido de participação encontrado');
            }
        }

        // 5. Resumo
        console.log('\n📊 RESUMO:');
        console.log('===========');
        console.log(`👥 Profiles: ${profiles?.length || 0} usuários`);
        console.log(`👤 Users: ${users?.length || 0} usuários`);
        console.log(`📧 Invites: ${invites?.length || 0} convites`);
        console.log(`📝 Requests: ${requests?.length || 0} pedidos`);

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

// Executar
listUsers();

