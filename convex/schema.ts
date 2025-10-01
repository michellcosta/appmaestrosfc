import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela de usuários/profiles
  profiles: defineTable({
    email: v.string(),
    full_name: v.string(),
    role: v.string(), // 'owner', 'admin', 'player'
    created_at: v.number(),
    updated_at: v.number(),
    active: v.boolean(),
  }).index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["active"]),

  // Tabela de jogadores
  players: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    position: v.optional(v.string()),
    created_by: v.string(),
    created_at: v.number(),
    active: v.boolean(),
  }).index("by_active", ["active"])
    .index("by_created_by", ["created_by"]),

  // Tabela de partidas
  matches: defineTable({
    title: v.string(),
    date: v.number(),
    status: v.string(), // 'pending', 'live', 'ended'
    created_by: v.string(),
    created_at: v.number(),
    started_at: v.optional(v.number()),
    ended_at: v.optional(v.number()),
  }).index("by_status", ["status"])
    .index("by_date", ["date"]),

  // Tabela de participantes das partidas
  match_players: defineTable({
    match_id: v.id("matches"),
    player_id: v.id("players"),
    team: v.string(), // 'A' ou 'B'
  }).index("by_match", ["match_id"])
    .index("by_team", ["match_id", "team"]),

  // Tabela de eventos da partida (gols, assistências)
  match_events: defineTable({
    match_id: v.id("matches"),
    type: v.string(), // 'goal', 'assist'
    player_id: v.id("players"),
    team: v.string(),
    minute: v.number(),
    created_at: v.number(),
  }).index("by_match", ["match_id"])
    .index("by_player", ["player_id"]),

  // Tabela de estatísticas dos jogadores
  player_stats: defineTable({
    player_id: v.id("players"),
    goals: v.number(),
    assists: v.number(),
    matches_played: v.number(),
    updated_at: v.number(),
  }).index("by_player", ["player_id"])
    .index("by_goals", ["goals"]),

  // Tabela de convites
  invites: defineTable({
    email: v.string(),
    role: v.string(),
    status: v.string(), // 'pending', 'accepted', 'declined'
    created_by: v.string(),
    created_at: v.number(),
    expires_at: v.number(),
  }).index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_created_by", ["created_by"]),
});
