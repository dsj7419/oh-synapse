import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("Middleware - Token:", req.nextauth.token);
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      req.nextauth.token?.role !== "admin"
    ) {
   //   console.log("Middleware - Redirecting non-admin user");
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
   //     console.log("Middleware authorized callback - Token:", token);
        return !!token;
      },
    },
  }
);

export const config = { matcher: ["/admin/:path*"] };