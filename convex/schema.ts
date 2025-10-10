import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Tabela de usuários/profiles
    profiles: defineTable({
        email: v.string(),
        full_name: v.string(),
        role: v.string(), // 'owner', 'admin', 'aux', 'player', 'mensalista', 'diarista'
        membership: v.optional(v.string()), // 'mensalista', 'diarista'
        position: v.optional(v.string()),
        shirt_size: v.optional(v.string()),
        stars: v.optional(v.number()),
        picture: v.optional(v.string()), // URL da foto do Google
        created_at: v.number(),
        updated_at: v.number(),
        active: v.boolean(),
    }).index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_active", ["active"]),

    // Tabela de jogadores (atualizada para gerenciamento completo)
    players: defineTable({
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("owner"), v.literal("admin"), v.literal("aux"), v.literal("player")),
        membership: v.optional(v.union(v.literal("mensalista"), v.literal("diarista"))),
        position: v.optional(v.union(v.literal("Goleiro"), v.literal("Zagueiro"), v.literal("Meia"), v.literal("Atacante"))),
        stars: v.optional(v.number()),
        approved: v.boolean(),
        notifications_enabled: v.boolean(),
        created_by: v.optional(v.string()),
        created_at: v.number(),
        updated_at: v.number(),
        active: v.boolean(),
    }).index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_approved", ["approved"])
        .index("by_active", ["active"])
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


    // Tabela de estatísticas dos jogadores (expandida)
    player_stats: defineTable({
        player_id: v.id("players"),
        goals: v.number(),
        assists: v.number(),
        matches_played: v.number(),
        victories: v.number(),
        draws: v.number(),
        defeats: v.number(),
        total_time_played: v.number(), // em minutos
        yellow_cards: v.number(),
        red_cards: v.number(),
        average_rating: v.number(),
        man_of_match_count: v.number(),
        last_match_date: v.optional(v.number()),
        updated_at: v.number(),
    }).index("by_player", ["player_id"])
        .index("by_goals", ["goals"])
        .index("by_matches", ["matches_played"]),

    // Tabela de eventos da partida (expandida)
    match_events: defineTable({
        match_id: v.id("matches"),
        type: v.union(v.literal("goal"), v.literal("assist"), v.literal("yellow_card"), v.literal("red_card")),
        player_id: v.id("players"),
        assist_player_id: v.optional(v.id("players")),
        team: v.string(), // 'A', 'B', 'Preto', 'Verde', etc.
        minute: v.number(),
        round_number: v.number(),
        is_own_goal: v.optional(v.boolean()),
        is_penalty: v.optional(v.boolean()),
        created_at: v.number(),
    }).index("by_match", ["match_id"])
        .index("by_player", ["player_id"])
        .index("by_assist_player", ["assist_player_id"]),

    // Tabela de participação em partidas
    player_matches: defineTable({
        player_id: v.id("players"),
        match_id: v.id("matches"),
        team_color: v.string(),
        position: v.string(),
        minutes_played: v.number(),
        goals_scored: v.number(),
        assists: v.number(),
        yellow_cards: v.number(),
        red_cards: v.number(),
        rating: v.number(),
        is_man_of_match: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
    }).index("by_player", ["player_id"])
        .index("by_match", ["match_id"])
        .index("by_team", ["match_id", "team_color"]),

    // Tabela de convites (expandida)
    invites: defineTable({
        email: v.string(),
        role: v.string(),
        membership: v.optional(v.string()),
        status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("expired")),
        token: v.string(),
        created_by: v.string(),
        created_at: v.number(),
        expires_at: v.number(),
        consumed_at: v.optional(v.number()),
        used_count: v.number(),
    }).index("by_email", ["email"])
        .index("by_status", ["status"])
        .index("by_created_by", ["created_by"])
        .index("by_token", ["token"]),

    // Tabela de solicitações de presença
    attendance_requests: defineTable({
        user_id: v.string(),
        match_id: v.string(),
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
        requested_at: v.number(),
        reviewed_by: v.optional(v.string()),
        reviewed_at: v.optional(v.number()),
    }).index("by_user", ["user_id"])
        .index("by_match", ["match_id"])
        .index("by_status", ["status"]),

    // Tabela de solicitações de diarista
    diarist_requests: defineTable({
        user_id: v.string(),
        match_id: v.string(),
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
        requested_at: v.number(),
        reviewed_by: v.optional(v.string()),
        reviewed_at: v.optional(v.number()),
        payment_confirmed_at: v.optional(v.number()),
    }).index("by_user", ["user_id"])
        .index("by_match", ["match_id"])
        .index("by_status", ["status"]),

    // Tabela de notificações
    notifications: defineTable({
        user_id: v.string(),
        type: v.string(),
        title: v.string(),
        message: v.string(),
        read: v.boolean(),
        created_at: v.number(),
        read_at: v.optional(v.number()),
    }).index("by_user", ["user_id"])
        .index("by_read", ["read"])
        .index("by_type", ["type"]),
});
