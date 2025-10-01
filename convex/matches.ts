import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Criar partida
export const create = mutation({
  args: { 
    title: v.string(),
    date: v.number(),
    userId: v.string() 
  },
  handler: async (ctx, { title, date, userId }) => {
    return await ctx.db.insert("matches", {
      title,
      date,
      status: "pending",
      created_by: userId,
      created_at: Date.now()
    });
  }
});

// Sortear times
export const drawTeams = mutation({
  args: { 
    matchId: v.id("matches"), 
    playerIds: v.array(v.id("players")) 
  },
  handler: async (ctx, { matchId, playerIds }) => {
    // Embaralhar jogadores
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    const half = Math.ceil(shuffled.length / 2);
    
    const teamA = shuffled.slice(0, half);
    const teamB = shuffled.slice(half);
    
    // Adicionar jogadores aos times
    for (const playerId of teamA) {
      await ctx.db.insert("matchPlayers", {
        match_id: matchId,
        player_id: playerId,
        team: "A"
      });
    }
    
    for (const playerId of teamB) {
      await ctx.db.insert("matchPlayers", {
        match_id: matchId,
        player_id: playerId,
        team: "B"
      });
    }
    
    return { teamA, teamB };
  }
});

// Iniciar partida
export const start = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    return await ctx.db.patch(matchId, {
      status: "live",
      started_at: Date.now()
    });
  }
});

// Finalizar partida
export const end = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    return await ctx.db.patch(matchId, {
      status: "ended",
      ended_at: Date.now()
    });
  }
});

// Obter partida
export const get = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    return await ctx.db.get(matchId);
  }
});

// Listar partidas
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return await ctx.db
        .query("matches")
        .withIndex("by_status", q => q.eq("status", status))
        .collect();
    }
    return await ctx.db.query("matches").collect();
  }
});

// Obter visão ao vivo da partida
export const getLiveView = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const match = await ctx.db.get(matchId);
    if (!match) return null;
    
    // Obter jogadores da partida
    const matchPlayers = await ctx.db
      .query("matchPlayers")
      .withIndex("by_match", q => q.eq("match_id", matchId))
      .collect();
    
    // Enriquecer com dados dos jogadores
    const enrichedPlayers = await Promise.all(
      matchPlayers.map(async (mp) => {
        const player = await ctx.db.get(mp.player_id);
        return {
          ...mp,
          player_name: player?.name || "Jogador",
          player_email: player?.email
        };
      })
    );
    
    // Obter eventos da partida
    const events = await ctx.db
      .query("matchEvents")
      .withIndex("by_match", q => q.eq("match_id", matchId))
      .collect();
    
    // Calcular placar
    const score = events.reduce((acc, event) => {
      if (event.type === "goal") {
        acc[event.team] = (acc[event.team] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      match,
      players: enrichedPlayers,
      events,
      scoreA: score.A || 0,
      scoreB: score.B || 0
    };
  }
});
