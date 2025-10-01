import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) =>
    ctx.db.insert("matches", { status: "pending", createdBy: userId, createdAt: Date.now() })
});

export const drawTeams = mutation({
  args: { matchId: v.id("matches"), playerIds: v.array(v.id("players")) },
  handler: async (ctx, { matchId, playerIds }) => {
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    const half = Math.ceil(shuffled.length / 2);
    const A = shuffled.slice(0, half), B = shuffled.slice(half);
    for (const id of A) await ctx.db.insert("matchPlayers", { matchId, playerId: id, team: "A" });
    for (const id of B) await ctx.db.insert("matchPlayers", { matchId, playerId: id, team: "B" });
    return { teamA: A, teamB: B };
  }
});

export const start = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    await ctx.db.patch(matchId, { status: "live", startedAt: Date.now() });
  }
});

export const end = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    await ctx.db.patch(matchId, { status: "ended", endedAt: Date.now() });
  }
});

export const liveView = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const match = await ctx.db.get(matchId);
    const rosterRaw = await ctx.db
      .query("matchPlayers")
      .withIndex("by_match", q => q.eq("matchId", matchId))
      .collect();

    // Enriquecer com nomes dos jogadores
    const roster = await Promise.all(
      rosterRaw.map(async (r) => {
        const p = await ctx.db.get(r.playerId);
        return { ...r, playerName: p?.name ?? "Jogador" };
      })
    );

    const evs = await ctx.db
      .query("events")
      .withIndex("by_match", q => q.eq("matchId", matchId))
      .collect();

    const score = evs.reduce((acc, e) => {
      if (e.type === "goal") acc[e.team] = (acc[e.team] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      match,
      roster, // agora cada item tem { playerName }
      events: evs,
      scoreA: score["A"] ?? 0,
      scoreB: score["B"] ?? 0,
    };
  }
});

export const api = {
  create,
  drawTeams,
  start,
  end,
  liveView
};