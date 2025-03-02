// import { withAuth } from "next-auth/middleware"
// import { NextRequest, NextResponse } from "next/server"

// export default withAuth(
//   function middleware() {
//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         const { pathname } = req.nextUrl;

//         // Allow auth-related routes
//         if (
//           pathname.startsWith("/api/auth") ||
//           pathname === "/login" ||
//           pathname === "/register"
//         ) {
//           return true;
//         }

//         // Public routes
//         if (pathname === "/" || pathname.startsWith("/api/videos")) {
//           return true;
//         }
//         // All other routes require authentication
//         return !!token;
//       },
//     },
//   }
// );

// export const config = {
//     matcher: ["/dashboard/:path*", "/interview:path*", "/"],
// }