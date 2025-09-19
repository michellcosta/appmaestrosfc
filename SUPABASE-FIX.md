# 🔧 Corrigir Erro 406/400 - Supabase

## 🚨 **Problema Identificado:**
- ✅ **Usuário logado:** michellcosta1269@gmail.com
- ❌ **Tabela `users` não existe**
- ❌ **Erro 406:** Tabela não encontrada
- ❌ **Erro 400:** Sintaxe incorreta

## 🛠️ **Solução Passo a Passo:**

### **1. 🌐 Acesse o Supabase Dashboard:**
- Vá em: https://supabase.com/dashboard
- **Selecione** seu projeto
- **Vá em:** SQL Editor

### **2. 📝 Execute o Script SQL:**
- **Copie** o conteúdo do arquivo `supabase-setup.sql`
- **Cole** no SQL Editor
- **Clique** em "Run" (▶️)

### **3. ✅ Verifique se Funcionou:**
- **Vá em:** Table Editor
- **Verifique** se a tabela `users` foi criada
- **Teste** o app novamente

## 🎯 **O que o Script Faz:**

1. **Cria tabela `users`** com campos necessários
2. **Configura RLS** (Row Level Security)
3. **Cria políticas** de acesso
4. **Função automática** para criar perfil
5. **Trigger** para criar usuário automaticamente

## 📱 **Após Executar:**

1. **Acesse:** https://appmaestrosfc.netlify.app/
2. **Vá para** o Perfil
3. **Deve funcionar** sem erros
4. **Usuário será** criado automaticamente como 'owner'

## 🔍 **Se Ainda Der Erro:**

1. **Verifique** se o script foi executado
2. **Confirme** se a tabela `users` existe
3. **Teste** novamente o app
4. **Me diga** se funcionou!

## 🚀 **Resultado Esperado:**
- ✅ **Login funcionando**
- ✅ **Perfil carregando**
- ✅ **Dashboard Owner** aparecendo
- ✅ **Sem erros** no console
