import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  const token = await getToken({
    req,
    secret,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  const url = req.nextUrl;
  const pathname = url.pathname;

  const protectedRoutes = ["/client", "/coach", "/admin"];
  const isProtectedRoute = protectedRoutes.some((r) =>
    pathname.startsWith(r)
  );

  // Not signed in → redirect to /auth
  if (isProtectedRoute && !token) {
    const next = new URL("/auth", url.origin);
    next.searchParams.set("next", pathname);
    return NextResponse.redirect(next);
  }

  // Signed in but on /auth → redirect to dashboard
  if (token && pathname === "/auth") {
    const roles: string[] = (token as any).roles ?? [];
    const roleIds: number[] = (token as any).roleIds ?? [];
    const isAdmin = roles.includes("admin") || roleIds.includes(3);
    const userRole = isAdmin ? "admin" : ((token as any).role || "client");

    return NextResponse.redirect(new URL(`/${userRole}/dashboard`, url.origin));
  }

  // Role-based access control
  if (token && isProtectedRoute) {
    const roles: string[] = (token as any).roles ?? [];
    const roleIds: number[] = (token as any).roleIds ?? [];
    const isAdmin = roles.includes("admin") || roleIds.includes(3);
    const userRole = isAdmin ? "admin" : ((token as any).role || "client");

    if (pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, url.origin));
    }
    if (pathname.startsWith("/coach") && userRole !== "coach") {
      return NextResponse.redirect(
        new URL(userRole === "admin" ? "/admin/dashboard" : "/client/dashboard", url.origin)
      );
    }
    if (pathname.startsWith("/client") && userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", url.origin));
    }
    if (pathname.startsWith("/client") && userRole === "coach") {
      return NextResponse.redirect(new URL("/coach/dashboard", url.origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|admin/studio).*)"],
};
