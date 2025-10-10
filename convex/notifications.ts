import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar notificação
export const createNotification = mutation({
    args: {
        user_id: v.string(),
        type: v.string(),
        title: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const notificationId = await ctx.db.insert("notifications", {
            user_id: args.user_id,
            type: args.type,
            title: args.title,
            message: args.message,
            read: false,
            created_at: Date.now(),
        });

        return notificationId;
    },
});

// Buscar notificações do usuário
export const getUserNotifications = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Não autenticado");

        return await ctx.db
            .query("notifications")
            .withIndex("by_user")
            .filter((q) => q.eq(q.field("user_id"), userId))
            .order("desc")
            .collect();
    },
});

// Marcar notificação como lida
export const markAsRead = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Não autenticado");

        // Verificar se a notificação pertence ao usuário
        const notification = await ctx.db.get(args.notificationId);
        if (!notification || notification.user_id !== userId) {
            throw new Error("Notificação não encontrada ou sem permissão");
        }

        await ctx.db.patch(args.notificationId, {
            read: true,
            read_at: Date.now(),
        });

        return { success: true };
    },
});

// Marcar todas as notificações como lidas
export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Não autenticado");

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user")
            .filter((q) => q.eq(q.field("user_id"), userId))
            .filter((q) => q.eq(q.field("read"), false))
            .collect();

        for (const notification of notifications) {
            await ctx.db.patch(notification._id, {
                read: true,
                read_at: Date.now(),
            });
        }

        return { success: true, count: notifications.length };
    },
});

// Deletar notificação
export const deleteNotification = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Não autenticado");

        // Verificar se a notificação pertence ao usuário
        const notification = await ctx.db.get(args.notificationId);
        if (!notification || notification.user_id !== userId) {
            throw new Error("Notificação não encontrada ou sem permissão");
        }

        await ctx.db.delete(args.notificationId);
        return { success: true };
    },
});

// Contar notificações não lidas
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return 0;

        const unreadNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_user")
            .filter((q) => q.eq(q.field("user_id"), userId))
            .filter((q) => q.eq(q.field("read"), false))
            .collect();

        return unreadNotifications.length;
    },
});
