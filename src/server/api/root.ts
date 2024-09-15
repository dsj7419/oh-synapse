import { createTRPCRouter, createCallerFactory } from "@/server/api/trpc";
import { roleRouter } from "@/server/api/routers/roleRouter";
import { recipeRouter } from "@/server/api/routers/recipe";
import { bonusStatRouter } from "@/server/api/routers/bonusStat";
import { categoryRouter } from "@/server/api/routers/category";
import { userRouter } from "@/server/api/routers/userRouter";
import { auditLogsRouter } from "./routers/auditLogs";
import { locationRouter } from "./routers/locationRouter";
import { playgroundRouter } from "./routers/playgroundRouter";

export const appRouter = createTRPCRouter({
  role: roleRouter,
  recipe: recipeRouter,
  bonusStat: bonusStatRouter,
  category: categoryRouter,
  user: userRouter,
  auditLogs: auditLogsRouter,
  location: locationRouter,
  playground: playgroundRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);