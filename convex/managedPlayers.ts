import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar jogador completo (para gerenciamento)
export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("owner"), v.literal("admin"), v.literal("aux"), v.literal("player")),
        membership: v.optional(v.union(v.literal("mensalista"), v.literal("diarista"))),
        position: v.optional(v.union(v.literal("Goleiro"), v.literal("Zagueiro"), v.literal("Meia"), v.literal("Atacante"))),
        stars: v.optional(v.number()),
        approved: v.optional(v.boolean()),
        notifications_enabled: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        // Verificar se email já existe
        const existing = await ctx.db
            .query("players")
            .withIndex("by_email", q => q.eq("email", args.email))
            .first();

        if (existing) {
            throw new Error("Email já está cadastrado. Use outro email.");
        }

        // Criar jogador
        const playerId = await ctx.db.insert("players", {
            name: args.name,
            email: args.email,
            role: args.role,
            membership: args.membership,
            position: args.position,
            stars: args.stars || 5,
            approved: args.approved !== undefined ? args.approved : true,
            notifications_enabled: args.notifications_enabled !== undefined ? args.notifications_enabled : true,
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true
        });

        return playerId;
    }
});

// Listar todos os jogadores (para gerenciamento)
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("players")
            .withIndex("by_active", q => q.eq("active", true))
            .order("desc")
            .collect();
    }
});

// Obter jogador por ID
export const get = query({
    args: { id: v.id("players") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    }
});

// Atualizar jogador completo
export const update = mutation({
    args: {
        id: v.id("players"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("aux"), v.literal("player"))),
        membership: v.optional(v.union(v.literal("mensalista"), v.literal("diarista"))),
        position: v.optional(v.union(v.literal("Goleiro"), v.literal("Zagueiro"), v.literal("Meia"), v.literal("Atacante"))),
        stars: v.optional(v.number()),
        approved: v.optional(v.boolean()),
        notifications_enabled: v.optional(v.boolean())
    },
    handler: async (ctx, { id, email, ...args }) => {
        // Se está mudando email, verificar se não existe
        if (email) {
            const existing = await ctx.db
                .query("players")
                .withIndex("by_email", q => q.eq("email", email))
                .first();

            if (existing && existing._id !== id) {
                throw new Error("Email já está cadastrado. Use outro email.");
            }
        }

        const updates: any = {
            ...args,
            updated_at: Date.now()
        };

        if (email) updates.email = email;

        return await ctx.db.patch(id, updates);
    }
});

// Excluir jogador (marcar como inativo)
export const remove = mutation({
    args: { id: v.id("players") },
    handler: async (ctx, { id }) => {
        return await ctx.db.patch(id, {
            active: false,
            updated_at: Date.now()
        });
    }
});

// Alternar aprovação
export const toggleApproval = mutation({
    args: { id: v.id("players") },
    handler: async (ctx, { id }) => {
        const player = await ctx.db.get(id);
        if (!player) {
            throw new Error("Jogador não encontrado");
        }

        return await ctx.db.patch(id, {
            approved: !player.approved,
            updated_at: Date.now()
        });
    }
});

// Filtrar jogadores por role
export const listByRole = query({
    args: { role: v.string() },
    handler: async (ctx, { role }) => {
        return await ctx.db
            .query("players")
            .withIndex("by_role", q => q.eq("role", role))
            .filter(q => q.eq(q.field("active"), true))
            .order("desc")
            .collect();
    }
});

// Filtrar jogadores por status de aprovação
export const listByApproval = query({
    args: { approved: v.boolean() },
    handler: async (ctx, { approved }) => {
        return await ctx.db
            .query("players")
            .withIndex("by_approved", q => q.eq("approved", approved))
            .filter(q => q.eq(q.field("active"), true))
            .order("desc")
            .collect();
    }
});

// Buscar jogadores por nome ou email
export const search = query({
    args: { term: v.string() },
    handler: async (ctx, { term }) => {
        const players = await ctx.db
            .query("players")
            .withIndex("by_active", q => q.eq("active", true))
            .collect();

        const searchTerm = term.toLowerCase();
        return players.filter(player =>
            player.name.toLowerCase().includes(searchTerm) ||
            player.email.toLowerCase().includes(searchTerm)
        );
    }
});

