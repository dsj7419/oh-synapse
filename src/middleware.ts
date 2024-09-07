import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;

    console.log("Middleware - Token:", token);

    // Admin route protection
    if (req.nextUrl.pathname.startsWith("/admin") && !token?.roles?.includes("admin")) {
      console.log("Middleware - Redirecting non-admin user");
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("Middleware authorized callback - Token:", token);
        return !!token; // Allow access only if a token is present
      },
    },
  }
);

export const config = { matcher: ["/admin/:path*"] };
