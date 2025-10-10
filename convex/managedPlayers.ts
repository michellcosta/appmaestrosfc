import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Constantes de proteção para o owner principal
const MAIN_OWNER_EMAIL = 'michellcosta1269@gmail.com';
const MAIN_OWNER_NAME = 'Michell Oliveira';

// Função para verificar se é o owner principal
function isMainOwner(email: string, name?: string): boolean {
    return email === MAIN_OWNER_EMAIL || name === MAIN_OWNER_NAME;
}

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
            stars: args.stars || 10,
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
        const players = await ctx.db
            .query("players")
            .withIndex("by_active", q => q.eq("active", true))
            .order("desc")
            .collect();

        // Enriquecer com dados do profile
        const enriched = await Promise.all(
            players.map(async (player) => {
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_email")
                    .filter(q => q.eq(q.field("email"), player.email))
                    .first();

                return {
                    ...player,
                    profile_position: profile?.position,
                    profile_shirt_size: profile?.shirt_size,
                    profile_phone: profile?.phone,
                    profile_avatar_url: profile?.avatar_url,
                };
            })
        );

        return enriched;
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
    handler: async (ctx, { id, email, role, ...args }) => {
        // Buscar o jogador atual
        const currentPlayer = await ctx.db.get(id);
        if (!currentPlayer) {
            throw new Error("Jogador não encontrado");
        }

        // 🛡️ PROTEÇÃO: Verificar se é o owner principal
        if (isMainOwner(currentPlayer.email, currentPlayer.name)) {
            // Não permite alterar o role do owner principal
            if (role && role !== 'owner') {
                throw new Error("❌ Não é possível alterar o cargo do owner principal do sistema.");
            }
            // ✅ Removido: Agora pode alterar email, nome e outros dados pessoais
        }

        // Se está mudando email, verificar se não existe
        if (email && email !== currentPlayer.email) {
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
        if (role) updates.role = role;

        return await ctx.db.patch(id, updates);
    }
});

// Excluir jogador (marcar como inativo)
export const remove = mutation({
    args: { id: v.id("players") },
    handler: async (ctx, { id }) => {
        // Buscar o jogador atual
        const currentPlayer = await ctx.db.get(id);
        if (!currentPlayer) {
            throw new Error("Jogador não encontrado");
        }

        // 🛡️ PROTEÇÃO: Owner principal não pode ser removido
        if (isMainOwner(currentPlayer.email, currentPlayer.name)) {
            throw new Error("❌ Não é possível remover o owner principal do sistema.");
        }

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

        // 🛡️ PROTEÇÃO: Owner principal sempre aprovado
        if (isMainOwner(player.email, player.name)) {
            throw new Error("❌ O owner principal do sistema está sempre aprovado.");
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

// Sincronizar profile com player (criar player se não existir)
export const syncProfileToPlayer = mutation({
    args: {
        email: v.string(),
        name: v.string(),
        role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("aux"), v.literal("player"))),
    },
    handler: async (ctx, args) => {
        // Verificar se já existe um player com este email
        const existingPlayer = await ctx.db
            .query("players")
            .withIndex("by_email", q => q.eq("email", args.email))
            .first();

        // Se já existe, apenas atualizar e retornar
        if (existingPlayer) {
            await ctx.db.patch(existingPlayer._id, {
                name: args.name,
                updated_at: Date.now()
            });
            return existingPlayer._id;
        }

        // 🛡️ PROTEÇÃO: Michell Oliveira sempre como owner
        const finalRole = isMainOwner(args.email, args.name) ? 'owner' : (args.role || "player");

        // Se não existe, criar novo player
        const playerId = await ctx.db.insert("players", {
            name: args.name,
            email: args.email,
            role: finalRole,
            membership: "mensalista",
            stars: 10,
            approved: true,
            notifications_enabled: true,
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true
        });

        return playerId;
    }
});

// Atualizar campos do profile (posição e tamanho de camisa)
export const updateProfileFields = mutation({
    args: {
        email: v.string(),
        position: v.optional(v.string()),
        shirt_size: v.optional(v.string()),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, { email, position, shirt_size, phone }) => {
        // Validar tamanho de camisa (apenas G ou GG)
        if (shirt_size && !['G', 'GG'].includes(shirt_size)) {
            throw new Error('Tamanho de camisa inválido. Apenas G ou GG são permitidos.');
        }

        // Buscar profile pelo email
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_email")
            .filter(q => q.eq(q.field("email"), email))
            .first();

        if (!profile) {
            throw new Error("Perfil não encontrado para este email");
        }

        // Atualizar campos do profile
        const updateData: any = {
            updated_at: Date.now(),
        };

        if (position !== undefined) updateData.position = position;
        if (shirt_size !== undefined) updateData.shirt_size = shirt_size;
        if (phone !== undefined) updateData.phone = phone;

        await ctx.db.patch(profile._id, updateData);

        // Opcional: Atualizar position também na tabela players para compatibilidade
        if (position !== undefined) {
            const player = await ctx.db
                .query("players")
                .withIndex("by_email", q => q.eq("email", email))
                .first();

            if (player) {
                await ctx.db.patch(player._id, {
                    position,
                    updated_at: Date.now(),
                });
            }
        }

        return profile._id;
    },
});
