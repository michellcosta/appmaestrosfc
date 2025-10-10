import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Adicionar gol
export const addGoal = mutation({
    args: {
        matchId: v.id("matches"),
        playerId: v.id("players"),
        team: v.string(),
        minute: v.number(),
        userId: v.string()
    },
    handler: async (ctx, { matchId, playerId, team, minute, userId }) => {
        // Adicionar evento
        await ctx.db.insert("matchEvents", {
            match_id: matchId,
            type: "goal",
            player_id: playerId,
            team,
            minute,
            created_at: Date.now()
        });

        // Atualizar estatísticas do jogador
        const stats = await ctx.db
            .query("playerStats")
            .withIndex("by_player", q => q.eq("player_id", playerId))
            .first();

        if (stats) {
            await ctx.db.patch(stats._id, {
                goals: stats.goals + 1,
                updated_at: Date.now()
            });
        }
    }
});

// Adicionar assistência
export const addAssist = mutation({
    args: {
        matchId: v.id("matches"),
        playerId: v.id("players"),
        team: v.string(),
        minute: v.number(),
        userId: v.string()
    },
    handler: async (ctx, { matchId, playerId, team, minute, userId }) => {
        // Adicionar evento
        await ctx.db.insert("matchEvents", {
            match_id: matchId,
            type: "assist",
            player_id: playerId,
            team,
            minute,
            created_at: Date.now()
        });

        // Atualizar estatísticas do jogador
        const stats = await ctx.db
            .query("playerStats")
            .withIndex("by_player", q => q.eq("player_id", playerId))
            .first();

        if (stats) {
            await ctx.db.patch(stats._id, {
                assists: stats.assists + 1,
                updated_at: Date.now()
            });
        }
    }
});

// Obter eventos da partida
export const getMatchEvents = query({
    args: { matchId: v.id("matches") },
    handler: async (ctx, { matchId }) => {
        const events = await ctx.db
            .query("matchEvents")
            .withIndex("by_match", q => q.eq("match_id", matchId))
            .collect();

        // Enriquecer com dados dos jogadores
        const enrichedEvents = await Promise.all(
            events.map(async (event) => {
                const player = await ctx.db.get(event.player_id);
                return {
                    ...event,
                    player_name: player?.name || "Jogador"
                };
            })
        );

        return enrichedEvents.sort((a, b) => a.minute - b.minute);
    }
});

// Obter ranking de jogadores
export const getRanking = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit = 10 }) => {
        const stats = await ctx.db
            .query("playerStats")
            .collect();

        // Enriquecer com dados dos jogadores
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
