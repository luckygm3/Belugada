import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const papel = req.auth?.user?.papel;

  const isAdminRoute = pathname.startsWith("/admin");
  const isEmpresaRoute = pathname.startsWith("/empresa");

  if ((isAdminRoute || isEmpresaRoute) && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (isAdminRoute && papel !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (isEmpresaRoute && papel !== "EMPRESA") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/empresa/:path*"],
};