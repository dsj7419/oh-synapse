import NextAuth from "next-auth";
import { authOptions } from "@/server/auth";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
