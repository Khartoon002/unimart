import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      roles: UserRole[];
      activeRole: UserRole;
      onboardingDone: boolean;
      merchantProfileId?: string | null;
      faculty?: string | null;
      hostel?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    roles: UserRole[];
    activeRole: UserRole;
    onboardingDone: boolean;
    merchantProfileId?: string | null;
    faculty?: string | null;
    hostel?: string | null;
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { merchantProfile: { select: { id: true } } },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          roles: user.roles,
          activeRole: user.activeRole,
          onboardingDone: user.onboardingDone,
          merchantProfileId: user.merchantProfile?.id ?? null,
          faculty: user.faculty ?? null,
          hostel: user.hostel ?? null,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.activeRole = user.activeRole;
        token.onboardingDone = user.onboardingDone;
        token.merchantProfileId = user.merchantProfileId;
        token.faculty = user.faculty;
        token.hostel = user.hostel;
      }
      if (trigger === "update") {
        if (session?.activeRole) token.activeRole = session.activeRole as UserRole;
        if (session?.roles) token.roles = session.roles as UserRole[];
        if (session?.onboardingDone !== undefined) token.onboardingDone = session.onboardingDone;
        if (session?.merchantProfileId !== undefined) token.merchantProfileId = session.merchantProfileId;
      }
      return token;
    },
    async session({ session, token }) {
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
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
