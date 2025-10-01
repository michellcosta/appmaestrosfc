/**
 * Generated API for Convex.
 */

import * as players from "../players";
import * as matches from "../matches";
import * as events from "../events";
import * as invites from "../invites";

export const api = {
  players: {
    add: players.add,
    listActive: players.listActive,
    get: players.get,
    update: players.update,
    deactivate: players.deactivate,
    getStats: players.getStats,
    getRanking: players.getRanking,
  },
  matches: {
    create: matches.create,
    drawTeams: matches.drawTeams,
    start: matches.start,
    end: matches.end,
    get: matches.get,
    list: matches.list,
    getLiveView: matches.getLiveView,
  },
  events: {
    addGoal: events.addGoal,
    addAssist: events.addAssist,
    getMatchEvents: events.getMatchEvents,
    getRanking: events.getRanking,
  },
  invites: {
    create: invites.create,
    accept: invites.accept,
    decline: invites.decline,
    list: invites.list,
    get: invites.get,
    cleanExpired: invites.cleanExpired,
  },
};
