import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { env } from "@/env";
import { db } from "@/server/db";

const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  },
  error: (message: string, error?: unknown) => console.error(message, error),
  warn: (message: string) => console.warn(message),
};

let sessionLogged = false;

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roles: string[];
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    roles: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roles?: string[];
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, token }) => {
      if (!sessionLogged) {
        logger.log("Session callback - Token:", JSON.stringify(token, null, 2));
        sessionLogged = true;
      }
      
      if (session?.user) {
        session.user.id = token.sub ?? "";
        session.user.roles = token.roles ?? [];
        
        logger.log("Session callback - Updated session:", JSON.stringify(session, null, 2));
      } else {
        logger.warn("Session callback - No user in session");
      }
      
      return session;
    },
    jwt: async ({ token, user, account }) => {
      try {
        if (account && user) {
          token.id = user.id;

          const userWithRoles = await db.user.findUnique({
            where: { id: user.id },
            include: { roles: { include: { role: true } } },
          });

          const viewerRole = await db.role.upsert({
            where: { name: 'viewer' },
            update: {},
            create: { name: 'viewer', description: 'Default role for all users' },
          });

          if (!userWithRoles || !userWithRoles.roles.some(ur => ur.role.name === 'viewer')) {
            await db.userRole.create({
              data: {
                userId: user.id,
                roleId: viewerRole.id,
              },
            });
            token.roles = ['viewer'];
          } else {
            token.roles = userWithRoles.roles.map(ur => ur.role.name);
          }

          if (String(user.id) === String(env.DISCORD_ELEVATED_USER_ID)) {
            const adminRole = await db.role.upsert({
              where: { name: 'admin' },
              update: {},
              create: { name: 'admin', description: 'Admin role with all permissions' },
            });
            await db.userRole.create({
              data: {
                userId: user.id,
                roleId: adminRole.id,
              },
            });
            token.roles.push('admin');
          }
        }

        if (token.id) {
          const userWithRoles = await db.user.findUnique({
            where: { id: token.id },
            include: { roles: { include: { role: true } } },
          });

          if (userWithRoles) {
            token.roles = userWithRoles.roles.map(ur => ur.role.name);
          } else {
            logger.warn(`JWT callback - User not found for id: ${token.id}`);
            token.roles = ['viewer'];
          }
        }

        logger.log("JWT callback - Token after processing:", JSON.stringify(token, null, 2));
        return token;
      } catch (error) {
        logger.error("JWT callback - Error:", error);
        return token;
      }
    },
  },
  adapter: PrismaAdapter(db) as unknown as NextAuthOptions["adapter"], 
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
};

export const getAuthSession = async () => {
  const session = await getServerSession(authOptions);
  logger.log("getAuthSession - Returned session:", JSON.stringify(session, null, 2));
  
  if (!session) {
    logger.warn("getAuthSession - No session found");
  } else if (!session.user) {
    logger.warn("getAuthSession - Session found but no user data");
  } else if (!session.user.id || !session.user.roles) {
    logger.warn(`getAuthSession - User data incomplete: ${JSON.stringify(session.user, null, 2)}`);
  }

  return session;
};
