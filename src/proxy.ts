import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rolesForPath } from "@/lib/authorization";

export default auth((request) => {
  const user = request.auth?.user;
  const allowedRoles = rolesForPath(request.nextUrl.pathname);
  if (!user || !user.isActive) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) return NextResponse.redirect(new URL("/acesso-negado", request.url));
  return NextResponse.next();
});

export const config = { matcher: ["/chamados/:path*", "/fila/:path*", "/meus-atendimentos/:path*", "/admin/:path*"] };
