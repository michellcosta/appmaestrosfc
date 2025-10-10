import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

// Exportar funções do Google OAuth
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [Google],
});


import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query para obter o usuário atual
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        // Obter identidade do usuário (contém email, etc.)
        const identity = await ctx.auth.getUserIdentity();
        if (!identity || !identity.email) return null;

        const user = await ctx.db
            .query("profiles")
            .withIndex("by_email")
            .filter((q) => q.eq(q.field("email"), identity.email!))
            .first();

        return user;
    },
});

// Mutation para criar/atualizar perfil do usuário
export const upsertProfile = mutation({
    args: {
        email: v.string(),
        full_name: v.string(),
        role: v.optional(v.string()),
        membership: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Não autenticado");

        // Verificar se o perfil já existe
        const existingProfile = await ctx.db
            .query("profiles")
            .withIndex("by_email")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (existingProfile) {
            // Atualizar perfil existente
            await ctx.db.patch(existingProfile._id, {
                full_name: args.full_name,
                role: args.role || existingProfile.role,
                updated_at: Date.now(),
            });
            return existingProfile._id;
        } else {
            // Criar novo perfil
            const profileId = await ctx.db.insert("profiles", {
                email: args.email,
                full_name: args.full_name,
                role: args.role || "player",
                created_at: Date.now(),
                updated_at: Date.now(),
                active: true,
            });
            return profileId;
        }
    },
});

// Query para verificar se o usuário tem permissão
export const checkPermission = query({
    args: {
        requiredRole: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        // Obter identidade do usuário (contém email, etc.)
        const identity = await ctx.auth.getUserIdentity();
        if (!identity || !identity.email) return false;

        const user = await ctx.db
            .query("profiles")
            .withIndex("by_email")
            .filter((q) => q.eq(q.field("email"), identity.email!))
            .first();

        if (!user) return false;

        // Hierarquia de roles: owner > admin > aux > player
        const roleHierarchy = {
            owner: 4,
            admin: 3,
            aux: 2,
            player: 1,
        };

        const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
        const requiredLevel = roleHierarchy[args.requiredRole as keyof typeof roleHierarchy] || 0;

        return userLevel >= requiredLevel;
    },
});

// Query para obter todos os usuários (apenas para admins)
export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Não autenticado");

        // Obter identidade do usuário (contém email, etc.)
        const identity = await ctx.auth.getUserIdentity();
        if (!identity || !identity.email) throw new Error("Não autenticado");

        // Verificar se o usuário é admin ou owner
        const user = await ctx.db
            .query("profiles")
            .withIndex("by_email")
            .filter((q) => q.eq(q.field("email"), identity.email!))
            .first();

        if (!user || !["owner", "admin"].includes(user.role)) {
            throw new Error("Sem permissão para acessar esta funcionalidade");
        }

        return await ctx.db.query("profiles").collect();
    },
});
