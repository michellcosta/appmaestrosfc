/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as events from "../events.js";
import type * as forceUpdateOwner from "../forceUpdateOwner.js";
import type * as googleAuth from "../googleAuth.js";
import type * as http_auth from "../http/auth.js";
import type * as inviteSystem from "../inviteSystem.js";
import type * as invites from "../invites.js";
import type * as managedPlayers from "../managedPlayers.js";
import type * as matches from "../matches.js";
import type * as notifications from "../notifications.js";
import type * as playerStats from "../playerStats.js";
import type * as players from "../players.js";
import type * as profiles from "../profiles.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  attendance: typeof attendance;
  auth: typeof auth;
  events: typeof events;
  forceUpdateOwner: typeof forceUpdateOwner;
  googleAuth: typeof googleAuth;
  "http/auth": typeof http_auth;
  inviteSystem: typeof inviteSystem;
  invites: typeof invites;
  managedPlayers: typeof managedPlayers;
  matches: typeof matches;
  notifications: typeof notifications;
  playerStats: typeof playerStats;
  players: typeof players;
  profiles: typeof profiles;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
