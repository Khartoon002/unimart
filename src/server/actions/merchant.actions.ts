"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addBankAccountSchema, type AddBankAccountInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types";
import type { BankAccount } from "@prisma/client";
import { NIGERIAN_BANKS } from "@/lib/constants";

export async function addBankAccount(input: AddBankAccountInput): Promise<ActionResult<BankAccount>> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("MERCHANT")) return { error: "Unauthorized" };

  try {
    const parsed = addBankAccountSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const { bankCode, accountNumber } = parsed.data;

    const merchant = await prisma.merchantProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!merchant) return { error: "Merchant profile not found" };

    const bank = NIGERIAN_BANKS.find((b) => b.code === bankCode);
    if (!bank) return { error: "Invalid bank" };

    // Mock account resolution — in production, verify via Paystack
    const mockAccountName = `Account ${accountNumber.slice(-4)}`;
    const mockRecipientCode = `RCP_${Date.now().toString(36).toUpperCase()}`;

    const existingAccounts = await prisma.bankAccount.count({ where: { merchantId: merchant.id } });

    const account = await prisma.bankAccount.create({
      data: {
        merchantId: merchant.id,
        bankCode,
        bankName: bank.name,
        accountNumber,
        accountName: mockAccountName,
        recipientCode: mockRecipientCode,
        isDefault: existingAccounts === 0,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/earnings");

    return { data: account };
  } catch (e) {
    console.error("addBankAccount error:", e);
    return { error: "Failed to add bank account. Please verify account details." };
  }
}

export async function deleteBankAccount(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const merchant = await prisma.merchantProfile.findUnique({ where: { userId: session.user.id } });
    if (!merchant) return { error: "Merchant profile not found" };

    const account = await prisma.bankAccount.findFirst({ where: { id, merchantId: merchant.id } });
    if (!account) return { error: "Account not found" };

    await prisma.bankAccount.delete({ where: { id } });

    revalidatePath("/settings");
    return { data: null };
  } catch (e) {
    console.error("deleteBankAccount error:", e);
    return { error: "Failed to delete bank account" };
  }
}

export async function getMerchantDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const merchant = await prisma.merchantProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true } } },
    });
    if (!merchant) return { error: "Merchant profile not found" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayRevenue, pendingOrders, activeListings, recentOrders, transactions, lowStock] =
      await Promise.all([
        prisma.order.aggregate({
          where: { merchantId: merchant.id, status: "DELIVERED", updatedAt: { gte: today } },
          _sum: { subtotal: true },
        }),
        prisma.order.count({
          where: { merchantId: merchant.id, status: { in: ["PENDING", "CONFIRMED"] } },
        }),
        prisma.product.count({ where: { merchantId: merchant.id, status: "ACTIVE" } }),
        prisma.order.findMany({
          where: { merchantId: merchant.id },
          include: {
            buyer: { select: { name: true, avatar: true } },
            items: { include: { product: { select: { title: true, images: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.transaction.findMany({
          where: { merchantId: merchant.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.product.findMany({
          where: { merchantId: merchant.id, status: "ACTIVE", stock: { lte: 5 } },
          select: { id: true, title: true, images: true, stock: true },
          take: 5,
        }),
      ]);

    // Revenue for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const revenueData = await prisma.$queryRaw<{ day: string; value: number }[]>`
      SELECT
        TO_CHAR("updatedAt", 'Dy') as day,
        COALESCE(SUM(subtotal), 0)::float as value
      FROM "Order"
      WHERE "merchantId" = ${merchant.id}
        AND status = 'DELIVERED'
        AND "updatedAt" >= ${sevenDaysAgo}
      GROUP BY TO_CHAR("updatedAt", 'Dy'), DATE_TRUNC('day', "updatedAt")
      ORDER BY DATE_TRUNC('day', "updatedAt")
    `;

    return {
      data: {
        merchant,
        stats: {
          todayRevenue: Number(todayRevenue._sum.subtotal ?? 0),
          pendingOrders,
          activeListings,
          rating: merchant.rating,
          withdrawableBalance: Number(merchant.withdrawableBalance),
          pendingBalance: Number(merchant.pendingBalance),
          totalEarned: Number(merchant.totalEarned),
        },
        recentOrders,
        transactions,
        lowStock,
        revenueChart: revenueData,
      },
    };
  } catch (e) {
    console.error("getMerchantDashboard error:", e);
    return { error: "Failed to load dashboard" };
  }
}