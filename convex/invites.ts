import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar um novo convite
export const createInvite = mutation({
    args: {
        email: v.string(),
        role: v.string(),
        membership: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Não autenticado");

        // Verificar se o usuário tem permissão para criar convites
        const user = await ctx.db
            .query("profiles")
            .withIndex("by_email")
            .filter((q) => q.eq(q.field("email"), userId))
            .first();

        if (!user || !["owner", "admin", "aux"].includes(user.role)) {
            throw new Error("Sem permissão para criar convites");
        }

        // Verificar se já existe um convite pendente para este email
        const existingInvite = await ctx.db
            .query("invites")
            .withIndex("by_email")
            .filter((q) => q.eq(q.field("email"), args.email))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .first();

        if (existingInvite) {
            throw new Error("Já existe um convite pendente para este email");
        }

        // Gerar token único
        const token = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Criar convite
        const inviteId = await ctx.db.insert("invites", {
            email: args.email,
            role: args.role,
            membership: args.membership,
            status: "pending",
            token,
            created_by: userId,
            created_at: Date.now(),
            expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 dias
            used_count: 0,
        });

        return { inviteId, token };
    },
});

// Listar convites
export const listInvites = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Não autenticado");

        // Verificar se o usuário tem permissão
        const user = await ctx.db
            .query("profiles")
            .withIndex("by_email")
            .filter((q) => q.eq(q.field("email"), userId))
            .first();

        if (!user || !["owner", "admin", "aux"].includes(user.role)) {
            throw new Error("Sem permissão para listar convites");
        }

        return await ctx.db.query("invites").collect();
    },
});

// Validar token de convite
export const validateInviteToken = query({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const invite = await ctx.db
            .query("invites")
            .withIndex("by_token")
            .filter((q) => q.eq(q.field("token"), args.token))
            .first();

        if (!invite) {
            return { valid: false, error: "Convite não encontrado" };
        }

        if (invite.status !== "pending") {
            return { valid: false, error: "Convite já foi usado ou expirado" };
        }

        if (Date.now() > invite.expires_at) {
            return { valid: false, error: "Convite expirado" };
        }

        return { valid: true, invite };
    },
});

// Aceitar convite
export const acceptInvite = mutation({
    args: {
        token: v.string(),
        full_name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Não autenticado");

        // Validar token
        const invite = await ctx.db
            .query("invites")
            .withIndex("by_token")
            .filter((q) => q.eq(q.field("token"), args.token))
            .first();

        if (!invite) {
            throw new Error("Convite não encontrado");
        }

        if (invite.status !== "pending") {
            throw new Error("Convite já foi usado");
        }

        if (Date.now() > invite.expires_at) {
            throw new Error("Convite expirado");
        }

        // Criar perfil do usuário
        const profileId = await ctx.db.insert("profiles", {
            email: userId,
            full_name: args.full_name,
            role: invite.role,
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true,
        });

        // Marcar convite como aceito
        await ctx.db.patch(invite._id, {
            status: "accepted",
            consumed_at: Date.now(),
            used_count: invite.used_count + 1,
        });

        return { profileId, invite };
    },
});

// Revogar convite
export const revokeInvite = mutation({
    args: {
        inviteId: v.id("invites"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Não autenticado");

        // Verificar se o usuário tem permissão
        const user = await ctx.db
            .query("profiles")
            .withIndex("by_email")
            .filter((q) => q.eq(q.field("email"), userId))
            .first();

        if (!user || !["owner", "admin", "aux"].includes(user.role)) {
            throw new Error("Sem permissão para revogar convites");
        }

        // Marcar convite como revogado
        await ctx.db.patch(args.inviteId, {
            status: "declined",
            consumed_at: Date.now(),
        });

        return { success: true };
    },
});