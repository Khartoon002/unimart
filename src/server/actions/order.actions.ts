"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations";
import { triggerEvent } from "@/lib/pusher-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculatePlatformFee, generateOrderRef } from "@/lib/utils";
import { DELIVERY_FEE } from "@/lib/constants";
import type { ActionResult } from "@/types";
import type { Order, OrderStatus } from "@prisma/client";

export async function createOrder(
  input: CreateOrderInput
): Promise<ActionResult<{ order: Order }>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const parsed = createOrderSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const { items, addressId, deliveryNote } = parsed.data;

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });
    if (!address) return { error: "Address not found" };

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      include: { merchant: true },
    });

    if (products.length !== productIds.length) {
      return { error: "One or more products are not available" };
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return { error: `Product not found: ${item.productId}` };
      if (product.stock < item.quantity) {
        return { error: `Insufficient stock for "${product.title}"` };
      }
    }

    // Group items by merchant
    const merchantId = products[0].merchantId;
    const allSameMerchant = products.every((p) => p.merchantId === merchantId);
    if (!allSameMerchant) {
      return { error: "All items in an order must be from the same merchant" };
    }

    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    const platformFee = calculatePlatformFee(subtotal);
    const total = subtotal + platformFee + DELIVERY_FEE;
    const reference = generateOrderRef();

    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          buyerId: session.user.id,
          merchantId,
          subtotal,
          platformFee,
          deliveryFee: DELIVERY_FEE,
          total,
          deliveryAddress: {
            label: address.label,
            recipientName: address.recipientName,
            phone: address.phone,
            hostel: address.hostel,
            room: address.room,
            faculty: address.faculty,
            pickupPoint: address.pickupPoint,
            note: address.note,
          },
          deliveryNote: deliveryNote ?? null,
          paystackRef: reference,
          items: {
            create: items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: Number(product.price),
                variantLabel: undefined,
              };
            }),
          },
          timeline: {
            create: [{ status: "PENDING", note: "Order created, awaiting payment" }],
          },
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return o;
    });

    revalidatePath("/orders");

    return { data: { order } };
  } catch (e) {
    console.error("createOrder error:", e);
    return { error: "Failed to create order" };
  }
}

export async function confirmPayment(orderId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { merchant: true, buyer: true },
    });

    if (!order) return { error: "Order not found" };
    if (order.buyerId !== session.user.id) return { error: "Unauthorized" };
    if (order.status !== "PENDING") return { error: "Order is not awaiting payment" };

    const merchantEarning = Number(order.subtotal) - Number(order.platformFee);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          timeline: { create: { status: "CONFIRMED", note: "Payment received" } },
        },
      });

      await tx.merchantProfile.update({
        where: { id: order.merchantId },
        data: { pendingBalance: { increment: merchantEarning } },
      });

      await tx.transaction.create({
        data: {
          merchantId: order.merchantId,
          type: "sale",
          amount: merchantEarning,
          reference: `PAYMENT-${orderId}`,
          orderId,
          balanceAfter: Number(order.merchant.pendingBalance) + merchantEarning,
          note: `Payment received for order ${orderId}`,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.merchant.userId,
          type: "NEW_ORDER",
          title: "New order received!",
          body: `Order ${orderId} has been paid and confirmed`,
          href: `/merchant-orders`,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.buyerId,
          type: "ORDER_CONFIRMED",
          title: "Order confirmed",
          body: `Your order is confirmed. The merchant will process it soon.`,
          href: `/orders/${orderId}`,
        },
      });
    });

    await triggerEvent(`private-user-${order.merchant.userId}`, "new-order", { orderId });
    await triggerEvent(`private-user-${order.buyerId}`, "order-updated", { orderId, status: "CONFIRMED" });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");

    return { data: null };
  } catch (e) {
    console.error("confirmPayment error:", e);
    return { error: "Payment confirmation failed" };
  }
}

export async function confirmDelivery(orderId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { merchant: true, items: true },
    });

    if (!order) return { error: "Order not found" };
    if (order.buyerId !== session.user.id) return { error: "Unauthorized" };
    if (order.status !== "SHIPPED") {
      return { error: "Order must be shipped before confirming delivery" };
    }

    const merchantEarnings = Number(order.subtotal) - Number(order.platformFee);
    const newBalance = Number(order.merchant.withdrawableBalance) + merchantEarnings;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "DELIVERED",
          escrowReleaseAt: new Date(),
          timeline: {
            create: { status: "DELIVERED", note: "Buyer confirmed delivery" },
          },
        },
      });

      await tx.merchantProfile.update({
        where: { id: order.merchantId },
        data: {
          withdrawableBalance: newBalance,
          pendingBalance: { decrement: merchantEarnings },
          totalEarned: { increment: merchantEarnings },
          totalSales: { increment: 1 },
        },
      });

      await tx.transaction.create({
        data: {
          merchantId: order.merchantId,
          type: "sale",
          amount: merchantEarnings,
          reference: `RELEASE-${orderId}`,
          orderId,
          balanceAfter: newBalance,
          note: `Escrow released for order ${orderId}`,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.merchant.userId,
          type: "PAYMENT_RECEIVED",
          title: "Payment received!",
          body: `₦${merchantEarnings.toLocaleString("en-NG")} credited to your account`,
          href: `/earnings`,
        },
      });
    });

    await triggerEvent(
      `private-user-${order.merchant.userId}`,
      "payment-received",
      { orderId, amount: merchantEarnings }
    );

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");

    return { data: null };
  } catch (e) {
    console.error("confirmDelivery error:", e);
    return { error: "Failed to confirm delivery" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { merchant: true, buyer: true },
    });

    if (!order) return { error: "Order not found" };
    if (order.merchant.userId !== session.user.id) return { error: "Unauthorized" };

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
      DISPUTED: ["CANCELLED", "DELIVERED"],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return { error: `Cannot transition from ${order.status} to ${status}` };
    }

    if (status === "CANCELLED" && !note) {
      return { error: "Cancellation reason is required" };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        timeline: {
          create: { status, note: note ?? undefined },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: status === "SHIPPED" ? "ORDER_SHIPPED" : "ORDER_CONFIRMED",
        title: `Order ${status.toLowerCase()}`,
        body: `Your order ${orderId} is now ${status.toLowerCase()}`,
        href: `/orders/${orderId}`,
      },
    });

    await triggerEvent(`private-user-${order.buyerId}`, "order-updated", {
      orderId,
      status,
      note,
    });

    revalidatePath(`/merchant-orders`);
    revalidatePath(`/orders/${orderId}`);

    return { data: null };
  } catch (e) {
    console.error("updateOrderStatus error:", e);
    return { error: "Failed to update order status" };
  }
}

export async function cancelOrder(orderId: string, note?: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { merchant: true, items: { include: { product: true } } },
    });

    if (!order) return { error: "Order not found" };

    const isbuyer = order.buyerId === session.user.id;
    const isMerchant = order.merchant.userId === session.user.id;
    if (!isbuyer && !isMerchant) return { error: "Unauthorized" };

    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return { error: "Order cannot be cancelled at this stage" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          timeline: {
            create: {
              status: "CANCELLED",
              note: note ?? "Order cancelled",
            },
          },
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });

    revalidatePath("/orders");
    revalidatePath("/merchant-orders");

    return { data: null };
  } catch (e) {
    console.error("cancelOrder error:", e);
    return { error: "Failed to cancel order" };
  }
}

export async function initiateWithdrawal(
  amount: number,
  bankAccountId: string
): Promise<ActionResult<{ transferCode: string }>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const merchant = await prisma.merchantProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!merchant) return { error: "Merchant profile not found" };
    if (!session.user.roles.includes("MERCHANT")) return { error: "Unauthorized" };

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, merchantId: merchant.id },
    });
    if (!bankAccount) return { error: "Bank account not found" };

    if (amount > Number(merchant.withdrawableBalance)) {
      return { error: "Insufficient balance" };
    }

    const newBalance = Number(merchant.withdrawableBalance) - amount;
    const mockTransferCode = `WD-${Date.now().toString(36).toUpperCase()}`;

    await prisma.$transaction(async (tx) => {
      await tx.merchantProfile.update({
        where: { id: merchant.id },
        data: { withdrawableBalance: newBalance },
      });

      await tx.transaction.create({
        data: {
          merchantId: merchant.id,
          type: "withdrawal",
          amount,
          reference: mockTransferCode,
          balanceAfter: newBalance,
          note: `Withdrawal to ${bankAccount.bankName} ${bankAccount.accountNumber}`,
        },
      });
    });

    revalidatePath("/earnings");

    return { data: { transferCode: mockTransferCode } };
  } catch (e) {
    console.error("initiateWithdrawal error:", e);
    return { error: "Withdrawal failed. Please try again." };
  }
}
