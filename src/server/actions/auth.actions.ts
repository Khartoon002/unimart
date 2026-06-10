"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, changePasswordSchema, type RegisterInput, type ChangePasswordInput } from "@/lib/validations";
import { sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/resend";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types";

export async function registerUser(data: RegisterInput): Promise<ActionResult<{ userId: string }>> {
  try {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }

    const { name, email, password, matricNumber, faculty, hostel, wantsToSell, storeName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "An account with this email already exists" };

    const existingMatric = await prisma.user.findUnique({ where: { matricNumber } });
    if (existingMatric) {
      return {
        error:
          "This matric number is already linked to an account. Sign in to your existing account — you can upgrade to a seller account from your profile settings.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          matricNumber,
          faculty,
          hostel,
          roles: wantsToSell ? ["BUYER", "MERCHANT"] : ["BUYER"],
          activeRole: "BUYER",
        },
      });

      if (wantsToSell) {
        const merchantStoreName = storeName || `${name}'s Store`;
        await tx.merchantProfile.create({
          data: {
            userId: newUser.id,
            storeName: merchantStoreName,
          },
        });
      }

      return newUser;
    });

    try {
      await sendWelcomeEmail(email, name);
    } catch {
      // Non-critical: don't fail registration if email fails
    }

    return { data: { userId: user.id } };
  } catch (e) {
    console.error("registerUser error:", e);
    return { error: "Registration failed. Please try again." };
  }
}

export async function changePassword(data: ChangePasswordInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const parsed = changePasswordSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: "User not found" };

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) return { error: "Current password is incorrect" };

    const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return { data: null };
  } catch (e) {
    console.error("changePassword error:", e);
    return { error: "Failed to change password" };
  }
}

export async function forgotPassword(email: string): Promise<ActionResult> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.oTP.create({
        data: { userId: user.id, code, expiresAt },
      });

      await sendPasswordResetEmail(email, code);
    }

    // Always return success to prevent email enumeration
    return { data: null };
  } catch (e) {
    console.error("forgotPassword error:", e);
    return { error: "Failed to send reset email" };
  }
}

export async function updateActiveRole(role: "BUYER" | "MERCHANT"): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    if (!session.user.roles.includes(role)) {
      return { error: "You don't have this role" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { activeRole: role },
    });

    return { data: null };
  } catch (e) {
    console.error("updateActiveRole error:", e);
    return { error: "Failed to update role" };
  }
}
