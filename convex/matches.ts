import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
            await ctx.db.insert("match_players", {
                match_id: matchId,
                player_id: playerId,
                team: "A"
            });
        }

        for (const playerId of teamB) {
            await ctx.db.insert("match_players", {
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

// Adicionar gol
export const addGoal = mutation({
    args: {
        matchId: v.id("matches"),
        playerId: v.id("players"),
        assistPlayerId: v.optional(v.id("players")),
        team: v.string(),
        minute: v.number(),
        roundNumber: v.number(),
        isOwnGoal: v.optional(v.boolean()),
        isPenalty: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        const { matchId, playerId, assistPlayerId, team, minute, roundNumber, isOwnGoal, isPenalty } = args;

        // Adicionar evento de gol
        const goalEventId = await ctx.db.insert("match_events", {
            match_id: matchId,
            type: "goal",
            player_id: playerId,
            assist_player_id: assistPlayerId,
            team,
            minute,
            round_number: roundNumber,
            is_own_goal: isOwnGoal || false,
            is_penalty: isPenalty || false,
            created_at: Date.now()
        });

        // Atualizar estatísticas do jogador
        const playerStats = await ctx.db
            .query("player_stats")
            .withIndex("by_player", q => q.eq("player_id", playerId))
            .first();

        if (playerStats) {
            await ctx.db.patch(playerStats._id, {
                goals: playerStats.goals + 1,
                updated_at: Date.now()
            });
        }

        // Atualizar estatísticas do assistente se houver
        if (assistPlayerId) {
            const assistStats = await ctx.db
                .query("player_stats")
                .withIndex("by_player", q => q.eq("player_id", assistPlayerId))
                .first();

            if (assistStats) {
                await ctx.db.patch(assistStats._id, {
                    assists: assistStats.assists + 1,
                    updated_at: Date.now()
                });
            }
        }

        return goalEventId;
    }
});

// Adicionar cartão
export const addCard = mutation({
    args: {
        matchId: v.id("matches"),
        playerId: v.id("players"),
        team: v.string(),
        minute: v.number(),
        roundNumber: v.number(),
        cardType: v.union(v.literal("yellow_card"), v.literal("red_card"))
    },
    handler: async (ctx, args) => {
        const { matchId, playerId, team, minute, roundNumber, cardType } = args;

        // Adicionar evento de cartão
        const cardEventId = await ctx.db.insert("match_events", {
            match_id: matchId,
            type: cardType,
            player_id: playerId,
            team,
            minute,
            round_number: roundNumber,
            created_at: Date.now()
        });

        // Atualizar estatísticas do jogador
        const playerStats = await ctx.db
            .query("player_stats")
            .withIndex("by_player", q => q.eq("player_id", playerId))
            .first();

        if (playerStats) {
            const updateData: any = { updated_at: Date.now() };
            if (cardType === "yellow_card") {
                updateData.yellow_cards = playerStats.yellow_cards + 1;
            } else {
                updateData.red_cards = playerStats.red_cards + 1;
            }

            await ctx.db.patch(playerStats._id, updateData);
        }

        return cardEventId;
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
            .query("match_players")
            .withIndex("by_match", q => q.eq("match_id", matchId))
            .collect();

        // Enriquecer com dados dos jogadores
        const enrichedPlayers = await Promise.all(
            matchPlayers.map(async (mp) => {
                const player = await ctx.db.get(mp.player_id);
                return {
                    ...mp,
                    player_name: player?.name || "Jogador",
                    player_email: player?.email,
                    player_position: player?.position
                };
            })
        );

        // Obter eventos da partida
        const events = await ctx.db
            .query("match_events")
            .withIndex("by_match", q => q.eq("match_id", matchId))
            .collect();

        // Calcular placar por time
        const score = events.reduce((acc, event) => {
            if (event.type === "goal") {
                acc[event.team] = (acc[event.team] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // Agrupar jogadores por time
        const playersByTeam = enrichedPlayers.reduce((acc, player) => {
            if (!acc[player.team]) acc[player.team] = [];
            acc[player.team].push(player);
            return acc;
        }, {} as Record<string, typeof enrichedPlayers>);

        return {
            match,
            players: enrichedPlayers,
            playersByTeam,
            events,
            score,
            totalEvents: events.length,
            goals: events.filter(e => e.type === "goal").length,
            assists: events.filter(e => e.type === "assist").length,
            yellowCards: events.filter(e => e.type === "yellow_card").length,
            redCards: events.filter(e => e.type === "red_card").length
        };
    }
});

// Obter histórico de eventos de uma partida
export const getMatchEvents = query({
    args: { matchId: v.id("matches") },
    handler: async (ctx, { matchId }) => {
        const events = await ctx.db
            .query("match_events")
            .withIndex("by_match", q => q.eq("match_id", matchId))
            .order("desc")
            .collect();

        // Enriquecer com dados dos jogadores
        const enrichedEvents = await Promise.all(
            events.map(async (event) => {
                const player = await ctx.db.get(event.player_id);
                const assistPlayer = event.assist_player_id ? await ctx.db.get(event.assist_player_id) : null;

                return {
                    ...event,
                    player_name: player?.name || "Jogador",
                    assist_player_name: assistPlayer?.name || null
                };
            })
        );

        return enrichedEvents;
    }
});
