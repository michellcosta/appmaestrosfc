import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
    args: { name: v.string(), userId: v.string() },
    handler: async (ctx, { name, userId }) => {
        const playerId = await ctx.db.insert("players", {
            name, createdBy: userId, createdAt: Date.now(), active: true
        });
        await ctx.db.insert("playerStats", { playerId, goals: 0, assists: 0, updatedAt: Date.now() });
        return playerId;
    }
});

export const listActive = query({
    args: {},
    handler: async (ctx) =>
        ctx.db.query("players").withIndex("by_active", q => q.eq("active", true)).collect()
});

export const api = {
    add,
    listActive
};
