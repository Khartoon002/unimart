"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReviewSchema, type CreateReviewInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult, ReviewWithBuyer } from "@/types";

export async function createReview(input: CreateReviewInput): Promise<ActionResult<ReviewWithBuyer>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const parsed = createReviewSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const { productId, orderId, rating, comment, images } = parsed.data;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: session.user.id,
        status: "DELIVERED",
        items: { some: { productId } },
      },
    });

    if (!order) {
      return { error: "You can only review products you've purchased and received" };
    }

    const existingReview = await prisma.review.findUnique({
      where: { buyerId_orderId: { buyerId: session.user.id, orderId } },
    });
    if (existingReview) return { error: "You've already reviewed this order" };

    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({
        data: {
          buyerId: session.user.id,
          productId,
          orderId,
          rating,
          comment,
          images: images ?? [],
          verifiedPurchase: true,
        },
        include: {
          buyer: { select: { id: true, name: true, avatar: true } },
        },
      });

      const allReviews = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: true,
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: allReviews._avg.rating ?? rating,
          reviewCount: allReviews._count,
        },
      });

      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { merchantId: true },
      });

      if (product) {
        const merchantReviews = await tx.review.aggregate({
          where: {
            product: { merchantId: product.merchantId },
          },
          _avg: { rating: true },
          _count: true,
        });

        await tx.merchantProfile.update({
          where: { id: product.merchantId },
          data: {
            rating: merchantReviews._avg.rating ?? rating,
            totalRatings: merchantReviews._count,
          },
        });

        const merchant = await tx.merchantProfile.findUnique({
          where: { id: product.merchantId },
          select: { userId: true },
        });

        if (merchant) {
          await tx.notification.create({
            data: {
              userId: merchant.userId,
              type: "NEW_REVIEW",
              title: "New review received",
              body: `You got a ${rating}-star review!`,
              href: `/listings/${productId}`,
            },
          });
        }
      }

      return r;
    });

    revalidatePath(`/product/${productId}`);

    return { data: review };
  } catch (e) {
    console.error("createReview error:", e);
    return { error: "Failed to submit review" };
  }
}
