/**
 * Generated types for Convex server functions.
 */

import { GenericMutation, GenericQuery, GenericAction } from "convex/server";
import { DataModel } from "../schema";

export declare const mutation: <ArgsValidator extends Record<string, any>>(
  func: (ctx: {
    db: import("convex/server").Database<DataModel>;
    auth: import("convex/server").Auth;
    scheduler: import("convex/server").Scheduler;
    storage: import("convex/server").Storage;
    runQuery: <QueryFunc extends GenericQuery<DataModel, any>>(
      query: QueryFunc,
      args: Parameters<QueryFunc>[1]
    ) => Promise<Awaited<ReturnType<QueryFunc>>>;
    runMutation: <MutationFunc extends GenericMutation<DataModel, any>>(
      mutation: MutationFunc,
      args: Parameters<MutationFunc>[1]
    ) => Promise<Awaited<ReturnType<MutationFunc>>>;
    runAction: <ActionFunc extends GenericAction<any>>(
      action: ActionFunc,
      args: Parameters<ActionFunc>[1]
    ) => Promise<Awaited<ReturnType<ActionFunc>>>;
  }, args: ArgsValidator) => Promise<any>
) => GenericMutation<DataModel, ArgsValidator>;

export declare const query: <ArgsValidator extends Record<string, any>>(
  func: (ctx: {
    db: import("convex/server").Database<DataModel>;
    auth: import("convex/server").Auth;
    scheduler: import("convex/server").Scheduler;
    storage: import("convex/server").Storage;
  }, args: ArgsValidator) => Promise<any>
) => GenericQuery<DataModel, ArgsValidator>;

export declare const action: <ArgsValidator extends Record<string, any>>(
  func: (ctx: {
    runQuery: <QueryFunc extends GenericQuery<DataModel, any>>(
      query: QueryFunc,
      args: Parameters<QueryFunc>[1]
    ) => Promise<Awaited<ReturnType<QueryFunc>>>;
    runMutation: <MutationFunc extends GenericMutation<DataModel, any>>(
      mutation: MutationFunc,
      args: Parameters<MutationFunc>[1]
    ) => Promise<Awaited<ReturnType<MutationFunc>>>;
    runAction: <ActionFunc extends GenericAction<any>>(
      action: ActionFunc,
      args: Parameters<ActionFunc>[1]
    ) => Promise<Awaited<ReturnType<ActionFunc>>>;
    scheduler: import("convex/server").Scheduler;
    storage: import("convex/server").Storage;
  }, args: ArgsValidator) => Promise<any>
) => GenericAction<ArgsValidator>;
