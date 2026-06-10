import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

// Edge-safe config: no Prisma, no bcrypt — used by middleware
export const authConfig = {
  trustHost: true,
  providers: [],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.id = u.id;
        token.roles = u.roles;
        token.activeRole = u.activeRole;
        token.onboardingDone = u.onboardingDone;
        token.merchantProfileId = u.merchantProfileId;
        token.faculty = u.faculty;
        token.hostel = u.hostel;
      }
      if (trigger === "update") {
        if (session?.activeRole) token.activeRole = session.activeRole as UserRole;
        if (session?.roles) token.roles = session.roles as UserRole[];
        if (session?.onboardingDone !== undefined) token.onboardingDone = session.onboardingDone;
        if (session?.merchantProfileId !== undefined) token.merchantProfileId = session.merchantProfileId;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as Record<string, unknown>;
      session.user.id = t.id as string;
      session.user.roles = t.roles as UserRole[];
      session.user.activeRole = t.activeRole as UserRole;
      session.user.onboardingDone = t.onboardingDone as boolean;
      session.user.merchantProfileId = t.merchantProfileId as string | null | undefined;
      session.user.faculty = t.faculty as string | null | undefined;
      session.user.hostel = t.hostel as string | null | undefined;
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
} satisfies NextAuthConfig;
