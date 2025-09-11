// ===============================
// src/types/index.ts
// ===============================
export type TeamColor = "blue" | "red" | "green" | "yellow" | "purple" | "orange" | "gray";


export type Player = {
id: string;
name: string;
number?: number;
avatarUrl?: string;
preferredPosition?: "GOL" | "DEF" | "MEI" | "ATA";
};


export type GoalEvent = {
id: string;
scorerId: string;
assistId?: string;
minute: number;
ownGoal?: boolean;
createdAt: string;
};


export type Venue = { name: string; address?: string; lat?: number; lng?: number };


export type Match = {
id: string;
date_time: Date | string;
venue: Venue;
max_players?: number;
homeColor?: TeamColor;
awayColor?: TeamColor;
goals?: GoalEvent[];
};


export type ChatMessage = {
id: string;
senderId: string;
text?: string;
createdAt: string;
};
