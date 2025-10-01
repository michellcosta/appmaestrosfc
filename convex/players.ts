import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Adicionar jogador
export const add = mutation({
  args: { 
    name: v.string(), 
    email: v.optional(v.string()),
    position: v.optional(v.string()),
    userId: v.string() 
  },
  handler: async (ctx, { name, email, position, userId }) => {
    const playerId = await ctx.db.insert("players", {
      name,
      email,
      position,
      created_by: userId,
      created_at: Date.now(),
      active: true
    });
    
    // Criar estatísticas iniciais
    await ctx.db.insert("playerStats", {
      player_id: playerId,
      goals: 0,
      assists: 0,
      matches_played: 0,
      updated_at: Date.now()
    });
    
    return playerId;
  }
});

// Listar jogadores ativos
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("players")
      .withIndex("by_active", q => q.eq("active", true))
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

// Atualizar jogador
export const update = mutation({
  args: { 
    id: v.id("players"), 
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    position: v.optional(v.string())
  },
  handler: async (ctx, { id, name, email, position }) => {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (position !== undefined) updates.position = position;
    
    return await ctx.db.patch(id, updates);
  }
});

// Desativar jogador
export const deactivate = mutation({
  args: { id: v.id("players") },
  handler: async (ctx, { id }) => {
    return await ctx.db.patch(id, { active: false });
  }
});

// Obter estatísticas do jogador
export const getStats = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    return await ctx.db
      .query("playerStats")
      .withIndex("by_player", q => q.eq("player_id", playerId))
      .first();
  }
});

// Ranking de jogadores
export const getRanking = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const stats = await ctx.db
      .query("playerStats")
      .withIndex("by_goals", q => q.gt("goals", 0))
      .collect();
    
    // Enriquecer com dados do jogador
    const enrichedStats = await Promise.all(
      stats.map(async (stat) => {
        const player = await ctx.db.get(stat.player_id);
        return {
          ...stat,
          player_name: player?.name || "Jogador",
          player_email: player?.email
        };
      })
    );
    
    return enrichedStats
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      .slice(0, limit);
  }
});
