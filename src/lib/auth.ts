import NextAuth, { CredentialsSignin } from "next-auth";
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

// Typed error subclasses — the code property is what NextAuth returns in result.error
class NoAccountError extends CredentialsSignin {
  code = "no_account";
}
class WrongPasswordError extends CredentialsSignin {
  code = "wrong_password";
}
class InvalidInputError extends CredentialsSignin {
  code = "invalid_input";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Support both AUTH_SECRET (v5 standard) and NEXTAUTH_SECRET (legacy) so
  // existing deployments that haven't renamed the env var still work.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new InvalidInputError();

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { merchantProfile: { select: { id: true } } },
        });

        if (!user) throw new NoAccountError();

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new WrongPasswordError();

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
