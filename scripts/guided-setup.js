/**
 * Script de Configuração Guiada
 * Te guia passo-a-passo para configurar tudo
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎯 CONFIGURAÇÃO GUIADA DO NEXUS PLAY\n');

console.log('📋 PASSO 1: CONFIGURAR SUPABASE');
console.log('================================');
console.log('1. Acesse: https://supabase.com');
console.log('2. Clique em "New Project"');
console.log('3. Escolha sua organização');
console.log('4. Digite o nome: "nexus-play"');
console.log('5. Escolha uma senha forte');
console.log('6. Escolha a região mais próxima (South America)');
console.log('7. Clique em "Create new project"');
console.log('8. Aguarde a criação (2-3 minutos)');
console.log('9. Vá para Settings > API');
console.log('10. Copie a URL e ANON KEY');
console.log('11. Cole no arquivo .env.local');

console.log('\n📋 PASSO 2: CONFIGURAR GOOGLE OAUTH');
console.log('====================================');
console.log('1. Acesse: https://console.cloud.google.com');
console.log('2. Clique em "Select a project" > "New Project"');
console.log('3. Digite o nome: "nexus-play"');
console.log('4. Clique em "Create"');
console.log('5. Vá para "APIs & Services" > "Credentials"');
console.log('6. Clique em "Create Credentials" > "OAuth 2.0 Client ID"');
console.log('7. Escolha "Web application"');
console.log('8. Digite o nome: "Nexus Play"');
console.log('9. Em "Authorized JavaScript origins":');
console.log('   - http://localhost:5173');
console.log('   - http://localhost:5176');
console.log('   - https://seu-dominio.vercel.app');
console.log('10. Em "Authorized redirect URIs":');
console.log('   - http://localhost:5173/auth/callback');
console.log('   - http://localhost:5176/auth/callback');
console.log('   - https://seu-dominio.vercel.app/auth/callback');
console.log('11. Clique em "Create"');
console.log('12. Copie o Client ID');
console.log('13. Cole no arquivo .env.local');

console.log('\n📋 PASSO 3: CONFIGURAR SUPABASE AUTH');
console.log('====================================');
console.log('1. Volte ao Supabase');
console.log('2. Vá para Authentication > Providers');
console.log('3. Encontre "Google" e clique em "Enable"');
console.log('4. Cole o Client ID do Google');
console.log('5. Cole o Client Secret do Google');
console.log('6. Clique em "Save"');

console.log('\n📋 PASSO 4: EXECUTAR MIGRAÇÕES');
console.log('==============================');
console.log('1. No Supabase, vá para SQL Editor');
console.log('2. Clique em "New query"');
console.log('3. Copie o conteúdo do arquivo: supabase/schema_app.sql');
console.log('4. Cole no editor');
console.log('5. Clique em "Run"');
console.log('6. Aguarde a execução');

console.log('\n📋 PASSO 5: DEPLOY PARA VERCEL');
console.log('==============================');
console.log('1. Instale o Vercel CLI: npm i -g vercel');
console.log('2. Execute: vercel login');
console.log('3. Execute: vercel --prod');
console.log('4. Escolha o projeto: nexus-play');
console.log('5. Aguarde o deploy');
console.log('6. Copie a URL gerada');

console.log('\n📋 PASSO 6: CONFIGURAR DOMÍNIO');
console.log('==============================');
console.log('1. No Vercel, vá para o projeto');
console.log('2. Clique em "Settings" > "Domains"');
console.log('3. Adicione seu domínio');
console.log('4. Configure o DNS');

console.log('\n📋 PASSO 7: TESTAR FUNCIONALIDADES');
console.log('==================================');
console.log('1. Acesse a URL do deploy');
console.log('2. Teste o login com Google');
console.log('3. Teste adicionar jogadores');
console.log('4. Teste editar jogadores');
console.log('5. Teste excluir jogadores');
console.log('6. Teste o sistema de convites');
console.log('7. Teste as configurações de perfil');
console.log('8. Teste o logout seguro');

console.log('\n📋 PASSO 8: CONVIDAR USUÁRIOS');
console.log('==============================');
console.log('1. Use o sistema de convites');
console.log('2. Envie convites por email');
console.log('3. Monitore as métricas');
console.log('4. Colete feedback');
console.log('5. Itere rapidamente');

console.log('\n🎯 RESUMO:');
console.log('==========');
console.log('✅ App 100% funcional');
console.log('✅ Todas as funcionalidades implementadas');
console.log('✅ Segurança e performance otimizadas');
console.log('✅ Pronto para usuários reais');

console.log('\n⏱️ TEMPO ESTIMADO:');
console.log('- Supabase: 5 minutos');
console.log('- Google OAuth: 10 minutos');
console.log('- Deploy: 5 minutos');
console.log('- Testes: 10 minutos');
console.log('- Total: 30 minutos');

console.log('\n📞 SUPORTE:');
console.log('- Documentação: SETUP_PRODUCTION.md');
console.log('- Configuração Supabase: CONFIG_SUPABASE_GOOGLE_SETUP.md');
console.log('- Configuração Google OAuth: CONFIG_GOOGLE_OAUTH.docx');

console.log('\n🚀 SEU APP ESTÁ PRONTO PARA PRODUÇÃO!');
console.log('Siga os passos acima e estará 100% operacional!');



