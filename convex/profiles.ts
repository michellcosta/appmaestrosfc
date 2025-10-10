import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Função para criar/atualizar perfil sem autenticação (para Google OAuth)
export const upsertProfileFromGoogle = mutation({
  args: {
    email: v.string(),
    full_name: v.string(),
    role: v.optional(v.string()),
    membership: v.optional(v.string()),
    position: v.optional(v.string()),
    shirt_size: v.optional(v.string()),
    stars: v.optional(v.number()),
    picture: v.optional(v.string()), // URL da foto do Google
  },
  handler: async (ctx, args) => {
    try {
      console.log('��� Criando/atualizando perfil do Google:', args);

      // Verificar se o perfil já existe
      const existingProfile = await ctx.db
        .query("profiles")
        .withIndex("by_email")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();

      if (existingProfile) {
        // Verificar se é o owner principal
        const isOwner = args.email === "michellcosta1269@gmail.com";

        // NÃO ATUALIZAR role e membership se já for owner (proteger mudanças)
        const shouldPreserveOwnerRole = existingProfile.role === "owner" && existingProfile.email === "michellcosta1269@gmail.com";

        // Atualizar perfil existente
        await ctx.db.patch(existingProfile._id, {
          full_name: args.full_name,
          role: shouldPreserveOwnerRole ? "owner" : (isOwner ? "owner" : (args.role || existingProfile.role)),
          membership: shouldPreserveOwnerRole ? "mensalista" : (isOwner ? "mensalista" : (args.membership || existingProfile.membership)),
          position: args.position || existingProfile.position,
          shirt_size: args.shirt_size || existingProfile.shirt_size,
          stars: args.stars || existingProfile.stars,
          picture: args.picture || existingProfile.picture, // Atualizar foto do Google
          updated_at: Date.now(),
        });
        console.log('✅ Perfil atualizado:', existingProfile._id);
        return existingProfile._id;
      } else {
        // Verificar se é o owner principal
        const isOwner = args.email === "michellcosta1269@gmail.com";
        console.log('🔍 Verificando se é owner:', { email: args.email, isOwner });

        // Criar novo perfil
        const profileId = await ctx.db.insert("profiles", {
          email: args.email,
          full_name: args.full_name,
          role: isOwner ? "owner" : (args.role || "diarista"),
          membership: isOwner ? "mensalista" : (args.membership || "diarista"),
          position: args.position,
          shirt_size: args.shirt_size,
          stars: args.stars,
          picture: args.picture, // Salvar foto do Google
          created_at: Date.now(),
          updated_at: Date.now(),
          active: true,
        });
        console.log('✅ Perfil criado:', profileId, 'como', isOwner ? 'OWNER' : 'diarista');
        return profileId;
      }
    } catch (error) {
      console.error('❌ Erro ao criar/atualizar perfil:', error);
      throw error;
    }
  },
});

// Função para buscar perfil por email
export const getProfileByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_email")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    return profile;
  },
});

// Função para promover usuário para owner (temporária para correção)
export const promoteToOwner = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log('🔄 Promovendo usuário para owner:', args.email);

      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_email")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();

      if (profile) {
        await ctx.db.patch(profile._id, {
          role: "owner",
          membership: "mensalista",
          updated_at: Date.now(),
        });
        console.log('✅ Usuário promovido para owner:', profile._id);
        return { success: true, profileId: profile._id };
      } else {
        console.log('❌ Perfil não encontrado');
        return { success: false, error: "Perfil não encontrado" };
      }
    } catch (error) {
      console.error('❌ Erro ao promover usuário:', error);
      throw error;
    }
  },
});
