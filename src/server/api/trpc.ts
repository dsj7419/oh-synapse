import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError, z } from "zod"; 
import { getAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { logAction } from "@/utils/auditLogger";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import type { Prisma } from '@prisma/client'; 

type JsonObject = Record<string, unknown>;

const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  },
  error: console.error,
  warn: console.warn,
};

let hasLoggedSession = false;

export const createTRPCContext = async (opts: { headers: Headers, input?: JsonObject }) => {
  const session = await getAuthSession();

  if (!hasLoggedSession) {
  //  logger.log("Session in createTRPCContext:", JSON.stringify(session, null, 2));
    hasLoggedSession = true;
  }

  return {
    db,
    session,
    headers: opts.headers,
    input: opts.input ?? {},
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const end = Date.now();
  logger.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No session or user found" });
    }
    return next();
  });

export const loggedProcedure = protectedProcedure.use(async ({ ctx, next, path }) => {
  const result = await next();

  const input: Prisma.InputJsonValue = ctx.input ? JSON.parse(JSON.stringify(ctx.input)) as Prisma.InputJsonValue : {};
  const output: Prisma.InputJsonValue = result ? JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue : {};

  if (ctx.session?.user) {
    const { id: userId, name: username, roles } = ctx.session.user;
    const userRole = roles.join(", "); 

    await logAction({
      userId,
      username: username ?? "Unknown",
      userRole,
      action: `TRPC ${path}`,
      details: { input, output },
    });
  }

  return result;
});

export const paginatedProcedure = loggedProcedure
  .input(
    z.object({
      cursor: z.string().optional(),
      limit: z.number().optional().default(10),
    })
  )
  .query(async ({ ctx, input }) => {
    const { cursor, limit } = input;

    const auditLogs = await ctx.db.auditLog.findMany({
      take: limit + 1, 
      skip: cursor ? 1 : 0, 
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { timestamp: "desc" }, 
    });

    const hasMore = auditLogs.length > limit;
    const nextCursor = hasMore ? auditLogs.pop()?.id : null;

    return {
      items: auditLogs, 
      nextCursor,
    };
  });

const enforceUserHasRole = (allowedRoles: string[]) => {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user || !ctx.session.user.roles) {
      throw new TRPCError({ code: "FORBIDDEN", message: "User roles missing" });
    }
    
    if (!ctx.session.user.roles.some(role => allowedRoles.includes(role))) {
      throw new TRPCError({ code: "FORBIDDEN", message: "User does not have the required role" });
    }

    return next();
  });
};

export const adminProcedure = enforceUserHasRole(['admin']);
export const editorProcedure = enforceUserHasRole(['admin', 'editor', 'content_manager']);
export const moderatorProcedure = enforceUserHasRole(['admin', 'moderator']);
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;