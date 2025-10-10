import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar solicitação de presença
export const createAttendanceRequest = mutation({
    args: {
        userId: v.string(),
        matchId: v.string()
    },
    handler: async (ctx, { userId, matchId }) => {
        // Verificar se já existe uma solicitação para esta partida
        const existingRequest = await ctx.db
            .query("attendance_requests")
            .withIndex("by_user", q => q.eq("user_id", userId))
            .filter(q => q.eq(q.field("match_id"), matchId))
            .first();

        if (existingRequest) {
            throw new Error("Você já solicitou presença nesta partida");
        }

        return await ctx.db.insert("attendance_requests", {
            user_id: userId,
            match_id: matchId,
            status: "pending",
            requested_at: Date.now()
        });
    }
});

// Aprovar solicitação de presença
export const approveAttendanceRequest = mutation({
    args: {
        requestId: v.id("attendance_requests"),
        reviewedBy: v.string()
    },
    handler: async (ctx, { requestId, reviewedBy }) => {
        return await ctx.db.patch(requestId, {
            status: "approved",
            reviewed_by: reviewedBy,
            reviewed_at: Date.now()
        });
    }
});

// Rejeitar solicitação de presença
export const rejectAttendanceRequest = mutation({
    args: {
        requestId: v.id("attendance_requests"),
        reviewedBy: v.string()
    },
    handler: async (ctx, { requestId, reviewedBy }) => {
        return await ctx.db.patch(requestId, {
            status: "rejected",
            reviewed_by: reviewedBy,
            reviewed_at: Date.now()
        });
    }
});

// Listar solicitações de presença
export const listAttendanceRequests = query({
    args: {
        matchId: v.optional(v.string()),
        status: v.optional(v.string()),
        userId: v.optional(v.string())
    },
    handler: async (ctx, { matchId, status, userId }) => {
        let query = ctx.db.query("attendance_requests");

        if (matchId) {
            query = query.withIndex("by_match", q => q.eq("match_id", matchId));
        } else if (status) {
            query = query.withIndex("by_status", q => q.eq("status", status));
        } else if (userId) {
            query = query.withIndex("by_user", q => q.eq("user_id", userId));
        }

        const requests = await query.collect();

        // Enriquecer com dados do usuário e revisor
        const enrichedRequests = await Promise.all(
            requests.map(async (request) => {
                const user = await ctx.db
                    .query("players")
                    .withIndex("by_email", q => q.eq("email", request.user_id))
                    .first();

                const reviewer = request.reviewed_by ? await ctx.db
                    .query("players")
                    .withIndex("by_email", q => q.eq("email", request.reviewed_by))
                    .first() : null;

                return {
                    ...request,
                    user_name: user?.name || "Usuário",
                    user_email: user?.email,
                    reviewer_name: reviewer?.name || null
                };
            })
        );

        return enrichedRequests;
    }
});

// Obter estatísticas de presença
export const getAttendanceStats = query({
    args: {
        matchId: v.optional(v.string())
    },
    handler: async (ctx, { matchId }) => {
        let query = ctx.db.query("attendance_requests");

        if (matchId) {
            query = query.withIndex("by_match", q => q.eq("match_id", matchId));
        }

        const requests = await query.collect();

        const stats = {
            total: requests.length,
            pending: requests.filter(r => r.status === "pending").length,
            approved: requests.filter(r => r.status === "approved").length,
            rejected: requests.filter(r => r.status === "rejected").length
        };

        return stats;
    }
});
