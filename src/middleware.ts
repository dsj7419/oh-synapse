import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const adminRoles = ["admin", "editor", "moderator", "content_manager"];

    // Admin route protection
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      !token?.roles?.some((role) => adminRoles.includes(role))
    ) {
      console.log("Middleware - Redirecting unauthorized user");
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  },
);

export const config = { matcher: ["/admin/:path*"] };
