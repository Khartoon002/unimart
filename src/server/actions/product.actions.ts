"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProductSchema, type CreateProductInput } from "@/lib/validations";
import { syncProductToIndex, removeProductFromIndex } from "@/lib/meilisearch";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types";
import type { Product } from "@prisma/client";

export async function createProduct(input: CreateProductInput): Promise<ActionResult<Product>> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("MERCHANT")) {
    return { error: "Only merchants can create products" };
  }

  try {
    const parsed = createProductSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const data = parsed.data;

    const merchant = await prisma.merchantProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    });
    if (!merchant) return { error: "Merchant profile not found" };

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          merchantId: merchant.id,
          title: data.title,
          description: data.description ?? "",
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          category: data.category,
          tags: data.tags,
          images: data.images,
          stock: data.stock,
          sku: data.sku ?? null,
          status: data.status ?? "ACTIVE",
          isPerishable: data.isPerishable,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
      });

      if (data.variants && data.variants.length > 0) {
        for (const variant of data.variants) {
          await tx.productVariant.create({
            data: {
              productId: p.id,
              name: variant.name,
              options: {
                create: variant.options.map((opt) => ({
                  label: opt.label,
                  price: opt.price ?? null,
                  stock: opt.stock,
                })),
              },
            },
          });
        }
      }

      return p;
    });

    const productWithMerchant = await prisma.product.findUnique({
      where: { id: product.id },
      include: { merchant: { include: { user: true } } },
    });

    if (productWithMerchant) {
      await syncProductToIndex(productWithMerchant);
    }

    revalidatePath("/marketplace");
    revalidatePath("/listings");

    return { data: product };
  } catch (e) {
    console.error("createProduct error:", e);
    return { error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  input: Partial<CreateProductInput>
): Promise<ActionResult<Product>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!product) return { error: "Product not found" };
    if (product.merchant.userId !== session.user.id) return { error: "Unauthorized" };

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.description && { description: input.description }),
          ...(input.price != null && { price: input.price }),
          ...(input.compareAtPrice !== undefined && { compareAtPrice: input.compareAtPrice }),
          ...(input.category && { category: input.category }),
          ...(input.tags && { tags: input.tags }),
          ...(input.images && { images: input.images }),
          ...(input.stock != null && { stock: input.stock }),
          ...(input.sku !== undefined && { sku: input.sku }),
          ...(input.status && { status: input.status }),
          ...(input.isPerishable != null && { isPerishable: input.isPerishable }),
          ...(input.expiresAt !== undefined && {
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          }),
        },
      });

      if (input.variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        for (const variant of input.variants ?? []) {
          await tx.productVariant.create({
            data: {
              productId: id,
              name: variant.name,
              options: {
                create: variant.options.map((opt) => ({
                  label: opt.label,
                  price: opt.price ?? null,
                  stock: opt.stock,
                })),
              },
            },
          });
        }
      }

      return p;
    });

    const productWithMerchant = await prisma.product.findUnique({
      where: { id },
      include: { merchant: { include: { user: true } } },
    });

    if (productWithMerchant) {
      await syncProductToIndex(productWithMerchant);
    }

    revalidatePath("/marketplace");
    revalidatePath("/listings");
    revalidatePath(`/product/${id}`);

    return { data: updated };
  } catch (e) {
    console.error("updateProduct error:", e);
    return { error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!product) return { error: "Product not found" };
    if (product.merchant.userId !== session.user.id) return { error: "Unauthorized" };

    await prisma.product.update({
      where: { id },
      data: { status: "EXPIRED", stock: 0 },
    });

    await removeProductFromIndex(id);

    revalidatePath("/marketplace");
    revalidatePath("/listings");

    return { data: null };
  } catch (e) {
    console.error("deleteProduct error:", e);
    return { error: "Failed to delete product" };
  }
}

export async function toggleProductStatus(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { merchant: { include: { user: true } } },
    });

    if (!product) return { error: "Product not found" };
    if (product.merchant.userId !== session.user.id) return { error: "Unauthorized" };

    const newStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated = await prisma.product.update({
      where: { id },
      data: { status: newStatus },
    });

    const productWithMerchant = await prisma.product.findUnique({
      where: { id },
      include: { merchant: { include: { user: true } } },
    });
    if (productWithMerchant) {
      await syncProductToIndex(productWithMerchant);
    }

    revalidatePath("/listings");

    return { data: null };
  } catch (e) {
    console.error("toggleProductStatus error:", e);
    return { error: "Failed to toggle status" };
  }
}

export async function incrementProductView(id: string): Promise<void> {
  try {
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Non-critical
  }
}
