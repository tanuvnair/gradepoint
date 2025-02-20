export { auth as middleware } from "@/auth";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const protectedRoutes = ["/dashboard", "/classes"];

    const isOnProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!req.auth && isOnProtectedRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*", "/classes/:path*"],
};
