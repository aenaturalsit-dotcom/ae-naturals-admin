// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isStoreManager = token?.role === "STORE_MANAGER";

    // If they are authenticated but not an STORE_MANAGER, redirect to login with an error
    if (req.nextUrl.pathname.startsWith("/admin") && 
        req.nextUrl.pathname !== "/admin/login" && 
        !isStoreManager) {
      return NextResponse.redirect(new URL("/admin/login?error=AccessDenied", req.url));
    }
  },
  {
    callbacks: {
      // authorized returns true if the middleware function above should run.
      // If it returns false, next-auth automatically redirects to the sign-in page.
      authorized: ({ token, req }) => {
        // Always allow the login page to load
        if (req.nextUrl.pathname === "/admin/login") return true;
        // Require a token for everything else under /admin
        return !!token;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = { 
  // Standard matcher for all admin subroutes
  matcher: ["/admin/:path*"] 
};