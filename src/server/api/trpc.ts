import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";

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
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerAuthSession();
 
  if (!hasLoggedSession) {
    logger.log("Session in createTRPCContext:", JSON.stringify(session, null, 2));
    hasLoggedSession = true;
  }

  return {
    db,
    session,
    headers: opts.headers,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  if (process.env.NODE_ENV === "development") {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  const result = await next();
  const end = Date.now();
  logger.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session) {
      logger.error("Protected procedure - No session found in context");
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No session found" });
    }
    if (!ctx.session.user) {
      logger.error("Protected procedure - No user found in session");
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No user found in session" });
    }
    if (!ctx.session.user.id || !ctx.session.user.roles) {
      logger.error("Protected procedure - Incomplete user data", {
        id: ctx.session.user.id,
        roles: ctx.session.user.roles
      });
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Incomplete user data" });
    }
    logger.log("Protected procedure - User authorized:", {
      id: ctx.session.user.id,
      roles: ctx.session.user.roles
    });
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

const enforceUserHasRole = (allowedRoles: string[]) => {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.session.user.roles.some(role => allowedRoles.includes(role))) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx });
  });
};

export const adminProcedure = enforceUserHasRole(['admin']);
export const editorProcedure = enforceUserHasRole(['admin', 'editor', 'content_manager']);
export const moderatorProcedure = enforceUserHasRole(['admin', 'moderator']);