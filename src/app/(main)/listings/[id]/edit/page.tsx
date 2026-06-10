"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createProductSchema, type CreateProductInput } from "@/lib/validations";
import { updateProduct, deleteProduct, toggleProductStatus } from "@/server/actions/product.actions";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { TagInput } from "@/components/unimart/TagInput";
import { toast } from "sonner";
import Link from "next/link";
import { Trash2, X, Plus } from "lucide-react";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const r = await fetch(`/api/products/${id}`);
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
  });

  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images?.length ? product.images : [""]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    values: product ? {
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      isPerishable: product.isPerishable,
      expiresAt: product.expiresAt ? new Date(product.expiresAt).toISOString().slice(0, 16) : undefined,
      tags: product.tags,
      images: product.images,
    } : undefined,
  });

  const isPerishable = watch("isPerishable");

  function onSubmit(data: CreateProductInput) {
    const validImages = imageUrls.filter((u) => {
      try { new URL(u); return true; } catch { return false; }
    });
    startTransition(async () => {
      const result = await updateProduct(id, { ...data, tags, images: validImages });
      if (result.error) { toast.error(result.error); return; }
      toast.success("Product updated!");
      router.push("/listings");
    });
  }

  function handleDelete() {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Listing deleted.");
      router.push("/listings");
    });
  }

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleProductStatus(id);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Status updated.");
    });
  }

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />)}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/listings" className="text-sm mb-3 block" style={{ color: "var(--color-text-3)" }}>← Back to listings</Link>
          <h1 className="font-display text-2xl font-bold">Edit listing</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleToggle} disabled={pending}
            className="h-9 px-4 rounded-xl text-sm font-semibold"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
            {product?.status === "ACTIVE" ? "Pause" : "Activate"}
          </button>
          <button onClick={handleDelete} disabled={pending}
            className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-sm font-semibold"
            style={{ border: "1px solid var(--color-danger)", color: "var(--color-danger)" }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="font-semibold">Basic info</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input {...register("title")} className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea {...register("description")} rows={4} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select {...register("category")} className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
              {PRODUCT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tags</label>
            <TagInput value={tags} onChange={setTags} />
          </div>
        </div>

        <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="font-semibold">Product images</h2>
          <p className="text-xs" style={{ color: "var(--color-text-3)" }}>Paste image URLs (up to 4). Use direct image links ending in .jpg, .png, etc.</p>
          {imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={url}
                onChange={(e) => setImageUrls((prev) => { const n = [...prev]; n[i] = e.target.value; return n; })}
                placeholder={`Image URL ${i + 1}`}
                className="flex-1 h-10 px-3 rounded-lg text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}
              />
              {url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  style={{ border: "1px solid var(--color-border)" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  onLoad={(e) => { e.currentTarget.style.display = "block"; }}
                />
              )}
              {imageUrls.length > 1 && (
                <button type="button" onClick={() => setImageUrls((p) => p.filter((_, idx) => idx !== i))} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-surface-2)", color: "var(--color-text-3)" }}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {imageUrls.length < 4 && (
            <button type="button" onClick={() => setImageUrls((p) => [...p, ""])} className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
              <Plus size={15} /> Add another image
            </button>
          )}
        </div>

        <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="font-semibold">Pricing & stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Price (₦) *</label>
              <input {...register("price", { valueAsNumber: true })} type="number" min={0}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Compare-at (₦)</label>
              <input {...register("compareAtPrice", { valueAsNumber: true })} type="number" min={0}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Stock *</label>
            <input {...register("stock", { valueAsNumber: true })} type="number" min={0}
              className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Fresh Market</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-2)" }}>Perishable / time-limited item</p>
            </div>
            <div onClick={() => setValue("isPerishable", !isPerishable)}
              className="w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer"
              style={{ background: isPerishable ? "var(--color-fresh)" : "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
              <div className="w-4 h-4 rounded-full transition-transform bg-white" style={{ transform: isPerishable ? "translateX(20px)" : "translateX(0)" }} />
            </div>
          </div>
          {isPerishable && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Expiry date & time</label>
              <input {...register("expiresAt")} type="datetime-local"
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
            </div>
          )}
        </div>

        <button type="submit" disabled={pending}
          className="w-full h-12 rounded-2xl font-semibold transition-opacity disabled:opacity-50"
          style={{ background: "var(--color-primary)", color: "#fff" }}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
