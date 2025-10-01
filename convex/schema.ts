import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    players: defineTable({
        name: v.string(),
        createdBy: v.string(),
        createdAt: v.number(),
        active: v.optional(v.boolean()),
    }).index("by_active", ["active"]),

    matches: defineTable({
        status: v.string(), // "pending" | "live" | "ended"
        createdBy: v.string(),
        createdAt: v.number(),
        startedAt: v.optional(v.number()),
        endedAt: v.optional(v.number()),
    }).index("by_status", ["status"]),

    matchPlayers: defineTable({
        matchId: v.id("matches"),
        playerId: v.id("players"),
        team: v.string(), // "A" | "B"
    }).index("by_match", ["matchId"])
        .index("by_team", ["matchId", "team"]),

    events: defineTable({
        matchId: v.id("matches"),
        type: v.string(), // "goal"
        scorerId: v.id("players"),
        assistId: v.optional(v.id("players")),
        team: v.string(), // "A" | "B"
        at: v.number(),
        createdBy: v.string(),
    }).index("by_match", ["matchId"]),

    playerStats: defineTable({
        playerId: v.id("players"),
        goals: v.number(),
        assists: v.number(),
        updatedAt: v.number(),
    }).index("by_player", ["playerId"])
        .index("by_goals", ["goals"]),
});
