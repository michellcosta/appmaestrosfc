import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar convite
export const create = mutation({
    args: {
        email: v.string(),
        role: v.string(),
        userId: v.string()
    },
    handler: async (ctx, { email, role, userId }) => {
        // Verificar se já existe convite pendente
        const existingInvite = await ctx.db
            .query("invites")
            .withIndex("by_email", q => q.eq("email", email))
            .filter(q => q.eq(q.field("status"), "pending"))
            .first();

        if (existingInvite) {
            throw new Error("Já existe um convite pendente para este email");
        }

        // Criar convite com expiração de 7 dias
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);

        return await ctx.db.insert("invites", {
            email,
            role,
            status: "pending",
            created_by: userId,
            created_at: Date.now(),
            expires_at: expiresAt
        });
    }
});

// Aceitar convite
export const accept = mutation({
    args: {
        inviteId: v.id("invites"),
        userId: v.string(),
        fullName: v.string()
    },
    handler: async (ctx, { inviteId, userId, fullName }) => {
        const invite = await ctx.db.get(inviteId);
        if (!invite) {
            throw new Error("Convite não encontrado");
        }

        if (invite.status !== "pending") {
            throw new Error("Convite já foi processado");
        }

        if (Date.now() > invite.expires_at) {
            throw new Error("Convite expirado");
        }

        // Atualizar status do convite
        await ctx.db.patch(inviteId, { status: "accepted" });

        // Criar perfil do usuário
        return await ctx.db.insert("profiles", {
            email: invite.email,
            full_name: fullName,
            role: invite.role,
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true
        });
    }
});

// Recusar convite
export const decline = mutation({
    args: { inviteId: v.id("invites") },
    handler: async (ctx, { inviteId }) => {
        return await ctx.db.patch(inviteId, { status: "declined" });
    }
});

// Listar convites
export const list = query({
    args: {
        status: v.optional(v.string()),
        createdBy: v.optional(v.string())
    },
    handler: async (ctx, { status, createdBy }) => {
        let query = ctx.db.query("invites");

        if (status) {
            query = query.withIndex("by_status", q => q.eq("status", status));
        }

        if (createdBy) {
            query = query.withIndex("by_created_by", q => q.eq("created_by", createdBy));
        }

        return await query.collect();
    }
});

// Obter convite por ID
export const get = query({
    args: { inviteId: v.id("invites") },
    handler: async (ctx, { inviteId }) => {
        return await ctx.db.get(inviteId);
    }
});

// Limpar convites expirados
export const cleanExpired = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const expiredInvites = await ctx.db
            .query("invites")
            .filter(q => q.lt(q.field("expires_at"), now))
            .collect();

        for (const invite of expiredInvites) {
            await ctx.db.patch(invite._id, { status: "expired" });
        }

        return expiredInvites.length;
    }
});
