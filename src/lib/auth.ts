import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "@/auth.config";
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
  ...authConfig,
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
});
