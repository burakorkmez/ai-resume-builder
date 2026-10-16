import { auth } from "@/lib/auth";

// Navigation guard only. Every server action re-checks the session before touching data.
export default auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: ["/dashboard/:path*", "/billing/:path*", "/account/:path*", "/resumes/:path*"],
};
