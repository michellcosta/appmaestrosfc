import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Obter estatísticas de um jogador
export const get = query({
    args: { playerId: v.id("players") },
    handler: async (ctx, { playerId }) => {
        const stats = await ctx.db
            .query("player_stats")
            .withIndex("by_player", q => q.eq("player_id", playerId))
            .first();

        if (!stats) {
            // Criar estatísticas iniciais se não existirem
            const playerId = await ctx.db.insert("player_stats", {
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
            return await ctx.db.get(playerId);
        }

        return stats;
    }
});

// Atualizar estatísticas do jogador
export const update = mutation({
    args: {
        playerId: v.id("players"),
        goals: v.optional(v.number()),
        assists: v.optional(v.number()),
        matches_played: v.optional(v.number()),
        victories: v.optional(v.number()),
        draws: v.optional(v.number()),
        defeats: v.optional(v.number()),
        total_time_played: v.optional(v.number()),
        yellow_cards: v.optional(v.number()),
        red_cards: v.optional(v.number()),
        average_rating: v.optional(v.number()),
        man_of_match_count: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { playerId, ...updates } = args;

        const existingStats = await ctx.db
            .query("player_stats")
            .withIndex("by_player", q => q.eq("player_id", playerId))
            .first();

        if (existingStats) {
            return await ctx.db.patch(existingStats._id, {
                ...updates,
                updated_at: Date.now()
            });
        } else {
            return await ctx.db.insert("player_stats", {
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
                ...updates,
                updated_at: Date.now()
            });
        }
    }
});

// Obter ranking de jogadores
export const getRanking = query({
    args: {
        limit: v.optional(v.number()),
        sortBy: v.optional(v.union(v.literal("goals"), v.literal("assists"), v.literal("matches_played")))
    },
    handler: async (ctx, { limit = 10, sortBy = "goals" }) => {
        const stats = await ctx.db
            .query("player_stats")
            .collect();

        // Enriquecer com dados do jogador
        const enrichedStats = await Promise.all(
            stats.map(async (stat) => {
                const player = await ctx.db.get(stat.player_id);
                return {
                    ...stat,
                    player_name: player?.name || "Jogador",
                    player_email: player?.email,
                    player_position: player?.position
                };
            })
        );

        // Ordenar por critério
        const sortedStats = enrichedStats.sort((a, b) => {
            switch (sortBy) {
                case "assists":
                    return b.assists - a.assists || b.goals - a.goals;
                case "matches_played":
                    return b.matches_played - a.matches_played || b.goals - a.goals;
                default:
                    return b.goals - a.goals || b.assists - a.assists;
            }
        });

        return sortedStats.slice(0, limit);
    }
});

// Obter estatísticas agregadas
export const getAggregated = query({
    args: {},
    handler: async (ctx) => {
        const stats = await ctx.db
            .query("player_stats")
            .collect();

        const totalPlayers = stats.length;
        const totalGoals = stats.reduce((sum, stat) => sum + stat.goals, 0);
        const totalAssists = stats.reduce((sum, stat) => sum + stat.assists, 0);
        const totalMatches = stats.reduce((sum, stat) => sum + stat.matches_played, 0);
        const totalVictories = stats.reduce((sum, stat) => sum + stat.victories, 0);
        const totalDraws = stats.reduce((sum, stat) => sum + stat.draws, 0);
        const totalDefeats = stats.reduce((sum, stat) => sum + stat.defeats, 0);

        return {
            totalPlayers,
            totalGoals,
            totalAssists,
            totalMatches,
            totalVictories,
            totalDraws,
            totalDefeats,
            averageGoalsPerPlayer: totalPlayers > 0 ? totalGoals / totalPlayers : 0,
            averageAssistsPerPlayer: totalPlayers > 0 ? totalAssists / totalPlayers : 0,
            averageMatchesPerPlayer: totalPlayers > 0 ? totalMatches / totalPlayers : 0
        };
    }
});
