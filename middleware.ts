import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: any) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  const token = await getToken({ req, secret });
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Define protected routes that require authentication
  const protectedRoutes = ['/client', '/coach', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Check if user is trying to access a protected route
  if (isProtectedRoute) {
    // No token? Redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    // Get user role from token
    const roles: string[] = (token as any).roles ?? [];
    const roleIds: number[] = (token as any).roleIds ?? [];
    const isAdmin = roles.includes("admin") || roleIds.includes(3);

    const userRole = isAdmin ? "admin" : ((token as any).role || "client");

    // Role-based access control
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      // Non-admin trying to access admin routes - redirect to their dashboard
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, req.url));
    }

    if (pathname.startsWith('/coach') && userRole !== 'coach') {
      // Non-coach trying to access coach routes - redirect to their dashboard
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/client/dashboard', req.url));
      }
    }

    if (pathname.startsWith('/client') && userRole === 'admin') {
      // Admin trying to access client routes - redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    if (pathname.startsWith('/client') && userRole === 'coach') {
      // Coach trying to access client routes - redirect to coach dashboard
      return NextResponse.redirect(new URL('/coach/dashboard', req.url));
    }
  }

  // If user is authenticated and tries to access auth pages, redirect to their dashboard
  if (token && (pathname === '/auth' || pathname === '/auth')) {
    const userRole = (token as any).role || 'client';
    return NextResponse.redirect(new URL(`/${userRole}/dashboard`, req.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|admin/studio).*)',
  ],
}