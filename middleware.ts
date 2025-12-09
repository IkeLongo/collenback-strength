import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: any) {
  const secret = process.env.AUTH_SECRET;

  const token = await getToken({ req, secret });
  const url = new URL(req.url);
  const pathname = url.pathname;

  // No token? Allow normal access
  if (!token) {
    return NextResponse.next();
  }

  const isAdmin = token.is_admin;

  // ✅ Redirect logic
  if (pathname === "/dashboard" || pathname === "/admin/dashboard") {
    // Admin trying to access non-admin dashboard
    if (pathname === "/dashboard" && isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Non-admin trying to access admin dashboard
    if (pathname === "/admin/dashboard" && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|admin/studio).*)',
  ],
}