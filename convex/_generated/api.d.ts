/**
 * Generated API types for Convex.
 */

import { GenericMutation, GenericQuery, GenericAction } from "convex/server";
import { DataModel } from "../schema";

// Import all functions
import type { 
  add as _add,
  listActive as _listActive,
  get as _get,
  update as _update,
  deactivate as _deactivate,
  getStats as _getStats,
  getRanking as _getRanking
} from "../players";

import type { 
  create as _createMatch,
  drawTeams as _drawTeams,
  start as _start,
  end as _end,
  get as _getMatch,
  list as _listMatches,
  getLiveView as _getLiveView
} from "../matches";

import type { 
  addGoal as _addGoal,
  addAssist as _addAssist,
  getMatchEvents as _getMatchEvents,
  getRanking as _getEventsRanking
} from "../events";

import type { 
  create as _createInvite,
  accept as _accept,
  decline as _decline,
  list as _listInvites,
  get as _getInvite,
  cleanExpired as _cleanExpired
} from "../invites";

export declare const api: {
  players: {
    add: GenericMutation<DataModel, Parameters<typeof _add>[0]>;
    listActive: GenericQuery<DataModel, Parameters<typeof _listActive>[0]>;
    get: GenericQuery<DataModel, Parameters<typeof _get>[0]>;
    update: GenericMutation<DataModel, Parameters<typeof _update>[0]>;
    deactivate: GenericMutation<DataModel, Parameters<typeof _deactivate>[0]>;
    getStats: GenericQuery<DataModel, Parameters<typeof _getStats>[0]>;
    getRanking: GenericQuery<DataModel, Parameters<typeof _getRanking>[0]>;
  };
  matches: {
    create: GenericMutation<DataModel, Parameters<typeof _createMatch>[0]>;
    drawTeams: GenericMutation<DataModel, Parameters<typeof _drawTeams>[0]>;
    start: GenericMutation<DataModel, Parameters<typeof _start>[0]>;
    end: GenericMutation<DataModel, Parameters<typeof _end>[0]>;
    get: GenericQuery<DataModel, Parameters<typeof _getMatch>[0]>;
    list: GenericQuery<DataModel, Parameters<typeof _listMatches>[0]>;
    getLiveView: GenericQuery<DataModel, Parameters<typeof _getLiveView>[0]>;
  };
  events: {
    addGoal: GenericMutation<DataModel, Parameters<typeof _addGoal>[0]>;
    addAssist: GenericMutation<DataModel, Parameters<typeof _addAssist>[0]>;
    getMatchEvents: GenericQuery<DataModel, Parameters<typeof _getMatchEvents>[0]>;
    getRanking: GenericQuery<DataModel, Parameters<typeof _getEventsRanking>[0]>;
  };
  invites: {
    create: GenericMutation<DataModel, Parameters<typeof _createInvite>[0]>;
    accept: GenericMutation<DataModel, Parameters<typeof _accept>[0]>;
    decline: GenericMutation<DataModel, Parameters<typeof _decline>[0]>;
    list: GenericQuery<DataModel, Parameters<typeof _listInvites>[0]>;
    get: GenericQuery<DataModel, Parameters<typeof _getInvite>[0]>;
    cleanExpired: GenericMutation<DataModel, Parameters<typeof _cleanExpired>[0]>;
  };
};
