import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addGoal = mutation({
    args: { matchId: v.id("matches"), scorerId: v.id("players"), assistId: v.optional(v.id("players")), team: v.string(), userId: v.string() },
    handler: async (ctx, a) => {
        await ctx.db.insert("events", { ...a, type: "goal", at: Date.now() });
        const s = await ctx.db.query("playerStats").withIndex("by_player", q => q.eq("playerId", a.scorerId)).first();
        if (s) await ctx.db.patch(s._id, { goals: s.goals + 1, updatedAt: Date.now() });
        if (a.assistId) {
            const as = await ctx.db.query("playerStats").withIndex("by_player", q => q.eq("playerId", a.assistId!)).first();
            if (as) await ctx.db.patch(as._id, { assists: as.assists + 1, updatedAt: Date.now() });
        }
    }
});

export const rankingTop = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit = 100 }) => {
        const stats = await ctx.db.query("playerStats").collect();
        const withNames = await Promise.all(stats.map(async ps => {
            const p = await ctx.db.get(ps.playerId);
            return { id: ps.playerId, name: p?.name ?? "Jogador", goals: ps.goals, assists: ps.assists, updatedAt: ps.updatedAt };
        }));
        return withNames.sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.updatedAt - a.updatedAt).slice(0, limit);
    }
});
