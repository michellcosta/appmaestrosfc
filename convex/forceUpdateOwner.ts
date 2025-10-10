import { mutation } from "./_generated/server";

// Função para forçar atualização do Michell para owner
export const forceUpdateMichellToOwner = mutation({
    handler: async (ctx) => {
        try {
            console.log('🚀 FORÇANDO ATUALIZAÇÃO DO MICHELL PARA OWNER...');

            // Buscar perfil do Michell
            const profile = await ctx.db
                .query("profiles")
                .withIndex("by_email")
                .filter((q) => q.eq(q.field("email"), "michellcosta1269@gmail.com"))
                .first();

            if (profile) {
                console.log('📧 Perfil encontrado:', profile.email);
                console.log('🎯 Role atual:', profile.role);
                console.log('🎯 Membership atual:', profile.membership);

                // Forçar atualização para owner
                await ctx.db.patch(profile._id, {
                    role: "owner",
                    membership: "mensalista",
                    updated_at: Date.now(),
                });

                console.log('✅ MICHELL PROMOVIDO PARA OWNER!');
                console.log('🎉 Agora você tem acesso completo!');

                return {
                    success: true,
                    message: "Michell promovido para owner!",
                    profileId: profile._id
                };
            } else {
                console.log('❌ Perfil do Michell não encontrado');
                return { success: false, error: "Perfil não encontrado" };
            }
        } catch (error) {
            console.error('❌ Erro ao promover Michell:', error);
            throw error;
        }
    },
});

// Função para deletar perfil do Michell e permitir recriação como owner
export const deleteMichellProfile = mutation({
    handler: async (ctx) => {
        try {
            console.log('🗑️ DELETANDO PERFIL DO MICHELL PARA RECRIAÇÃO...');

            // Buscar perfil do Michell
            const profile = await ctx.db
                .query("profiles")
                .withIndex("by_email")
                .filter((q) => q.eq(q.field("email"), "michellcosta1269@gmail.com"))
                .first();

            if (profile) {
                console.log('📧 Perfil encontrado:', profile.email);
                console.log('🎯 Role atual:', profile.role);
                console.log('🗑️ Deletando perfil...');

                // Deletar perfil
                await ctx.db.delete(profile._id);

                console.log('✅ PERFIL DELETADO COM SUCESSO!');
                console.log('🎉 Agora você pode fazer login novamente como OWNER!');

                return {
                    success: true,
                    message: "Perfil deletado! Faça login novamente para ser criado como owner.",
                    deletedProfileId: profile._id
                };
            } else {
                console.log('❌ Perfil do Michell não encontrado');
                return { success: false, error: "Perfil não encontrado" };
            }
        } catch (error) {
            console.error('❌ Erro ao deletar perfil do Michell:', error);
            throw error;
        }
    },
});
