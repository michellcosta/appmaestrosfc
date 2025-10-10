import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar convite
export const createInvite = mutation({
    args: {
        email: v.string(),
        role: v.string(),
        membership: v.optional(v.string()),
        createdBy: v.string(),
        expiresInDays: v.optional(v.number()) // padrão 7 dias
    },
    handler: async (ctx, { email, role, membership, createdBy, expiresInDays = 7 }) => {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = Date.now() + (expiresInDays * 24 * 60 * 60 * 1000);

        return await ctx.db.insert("invites", {
            email: email.toLowerCase(),
            role,
            membership,
            status: "pending",
            token,
            created_by: createdBy,
            created_at: Date.now(),
            expires_at: expiresAt,
            used_count: 0
        });
    }
});

// Aceitar convite
export const acceptInvite = mutation({
    args: {
        token: v.string(),
        userId: v.string()
    },
    handler: async (ctx, { token, userId }) => {
        const invite = await ctx.db
            .query("invites")
            .withIndex("by_token", q => q.eq("token", token))
            .first();

        if (!invite) {
            throw new Error("Convite não encontrado");
        }

        if (invite.status !== "pending") {
            throw new Error("Convite já foi usado ou expirado");
        }

        if (Date.now() > invite.expires_at) {
            throw new Error("Convite expirado");
        }

        // Atualizar status do convite
        await ctx.db.patch(invite._id, {
            status: "accepted",
            consumed_at: Date.now(),
            used_count: invite.used_count + 1
        });

        // Criar jogador baseado no convite
        const playerId = await ctx.db.insert("players", {
            name: invite.email.split('@')[0], // Nome temporário baseado no email
            email: invite.email,
            role: invite.role as any,
            membership: invite.membership as any,
            approved: true,
            notifications_enabled: true,
            created_by: invite.created_by,
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true
        });

        // Criar estatísticas iniciais
        await ctx.db.insert("player_stats", {
            player_id: playerId,
            goals: 0,
            assists: 0,
            matches_played: 0,
            victories: 0,
            draws: 0,
            defeats: 0,
            total_time_played: 0,
            yellow_cards: 0,
            red_cards: 0,
            average_rating: 0,
            man_of_match_count: 0,
            updated_at: Date.now()
        });

        return playerId;
    }
});

// Listar convites
export const listInvites = query({
    args: {
        status: v.optional(v.string()),
        createdBy: v.optional(v.string())
    },
    handler: async (ctx, { status, createdBy }) => {
        let query = ctx.db.query("invites");

        if (status) {
            query = query.withIndex("by_status", q => q.eq("status", status));
        } else if (createdBy) {
            query = query.withIndex("by_created_by", q => q.eq("created_by", createdBy));
        }

        const invites = await query.collect();

        // Enriquecer com dados do criador
        const enrichedInvites = await Promise.all(
            invites.map(async (invite) => {
                const creator = await ctx.db.get(invite.created_by as any);
                return {
                    ...invite,
                    creator_name: creator?.name || "Usuário"
                };
            })
        );

        return enrichedInvites;
    }
});

// Revogar convite
export const revokeInvite = mutation({
    args: { inviteId: v.id("invites") },
    handler: async (ctx, { inviteId }) => {
        return await ctx.db.patch(inviteId, {
            status: "declined"
        });
    }
});

// Validar token de convite
export const validateInviteToken = query({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        const invite = await ctx.db
            .query("invites")
            .withIndex("by_token", q => q.eq("token", token))
            .first();

        if (!invite) {
            return { valid: false, error: "Convite não encontrado" };
        }

        if (invite.status !== "pending") {
            return { valid: false, error: "Convite já foi usado" };
        }

        if (Date.now() > invite.expires_at) {
            return { valid: false, error: "Convite expirado" };
        }

        return {
            valid: true,
            invite: {
                email: invite.email,
                role: invite.role,
                membership: invite.membership,
                expiresAt: invite.expires_at
            }
        };
    }
});

// Obter estatísticas de convites
export const getInviteStats = query({
    args: {},
    handler: async (ctx) => {
        const invites = await ctx.db.query("invites").collect();

        const stats = {
            total: invites.length,
            pending: invites.filter(i => i.status === "pending").length,
            accepted: invites.filter(i => i.status === "accepted").length,
            declined: invites.filter(i => i.status === "declined").length,
            expired: invites.filter(i => i.status === "pending" && Date.now() > i.expires_at).length
        };

        return stats;
    }
});
