"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  updateProfileSchema,
  addAddressSchema,
  onboardingBuyerSchema,
  onboardingMerchantSchema,
  type UpdateProfileInput,
  type AddAddressInput,
  type OnboardingBuyerInput,
  type OnboardingMerchantInput,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types";
import type { Address, User } from "@prisma/client";

export async function updateProfile(input: UpdateProfileInput): Promise<ActionResult<User>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const { name, bio, faculty, hostel, avatar, storeName, storeDescription, storeBanner } = parsed.data;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio: bio ?? null,
        faculty: faculty ?? null,
        hostel: hostel ?? null,
        avatar: avatar ?? null,
      },
    });

    if (session.user.roles.includes("MERCHANT") && (storeName || storeDescription || storeBanner !== undefined)) {
      await prisma.merchantProfile.update({
        where: { userId: session.user.id },
        data: {
          ...(storeName && { storeName }),
          ...(storeDescription && { storeDescription }),
          ...(storeBanner !== undefined && { storeBanner }),
        },
      });
    }

    revalidatePath("/profile");

    return { data: user };
  } catch (e) {
    console.error("updateProfile error:", e);
    return { error: "Failed to update profile" };
  }
}

export async function addAddress(input: AddAddressInput): Promise<ActionResult<Address>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const parsed = addAddressSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const data = parsed.data;

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        label: data.label,
        recipientName: data.recipientName,
        phone: data.phone,
        hostel: data.hostel ?? null,
        room: data.room ?? null,
        faculty: data.faculty ?? null,
        pickupPoint: data.pickupPoint ?? null,
        note: data.note ?? null,
        isDefault: data.isDefault,
      },
    });

    revalidatePath("/settings");

    return { data: address };
  } catch (e) {
    console.error("addAddress error:", e);
    return { error: "Failed to add address" };
  }
}

export async function updateAddress(id: string, input: AddAddressInput): Promise<ActionResult<Address>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const parsed = addAddressSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const address = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!address) return { error: "Address not found" };

    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: { ...parsed.data },
    });

    revalidatePath("/settings");

    return { data: updated };
  } catch (e) {
    console.error("updateAddress error:", e);
    return { error: "Failed to update address" };
  }
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const address = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!address) return { error: "Address not found" };

    await prisma.address.delete({ where: { id } });

    revalidatePath("/settings");

    return { data: null };
  } catch (e) {
    console.error("deleteAddress error:", e);
    return { error: "Failed to delete address" };
  }
}

export async function completeOnboarding(
  data: OnboardingBuyerInput | OnboardingMerchantInput,
  role: "BUYER" | "MERCHANT"
): Promise<ActionResult<{ merchantProfileId: string } | null>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    if (role === "BUYER") {
      const parsed = onboardingBuyerSchema.safeParse(data);
      if (!parsed.success) return { error: parsed.error.errors[0].message };

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          faculty: parsed.data.faculty,
          hostel: parsed.data.hostel,
          onboardingDone: true,
        },
      });
    } else {
      const parsed = onboardingMerchantSchema.safeParse(data);
      if (!parsed.success) return { error: parsed.error.errors[0].message };

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          faculty: parsed.data.faculty,
          hostel: parsed.data.hostel,
          onboardingDone: true,
          roles: { set: ["BUYER", "MERCHANT"] },
          activeRole: "MERCHANT",
        },
      });

      const merchant = await prisma.merchantProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          storeName: parsed.data.storeName,
          storeDescription: parsed.data.storeDescription ?? null,
        },
        update: {
          storeName: parsed.data.storeName,
          storeDescription: parsed.data.storeDescription ?? null,
        },
      });

      return { data: { merchantProfileId: merchant.id } };
    }

    revalidatePath("/onboarding");
    return { data: null };
  } catch (e) {
    console.error("completeOnboarding error:", e);
    return { error: "Failed to complete onboarding" };
  }
}

export async function toggleSavedProduct(productId: string): Promise<ActionResult<{ saved: boolean }>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const existing = await prisma.savedProduct.findUnique({
      where: {
        userId_productId: { userId: session.user.id, productId },
      },
    });

    if (existing) {
      await prisma.savedProduct.delete({ where: { id: existing.id } });
      revalidatePath("/saved");
      return { data: { saved: false } };
    }

    await prisma.savedProduct.create({
      data: { userId: session.user.id, productId },
    });

    revalidatePath("/saved");
    return { data: { saved: true } };
  } catch (e) {
    console.error("toggleSavedProduct error:", e);
    return { error: "Failed to update saved products" };
  }
}
