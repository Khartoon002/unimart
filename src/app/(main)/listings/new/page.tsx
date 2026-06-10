"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type CreateProductInput } from "@/lib/validations";
import { createProduct } from "@/server/actions/product.actions";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { TagInput } from "@/components/unimart/TagInput";
import { toast } from "sonner";
import Link from "next/link";
import { X, Plus } from "lucide-react";

export default function NewListingPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { isPerishable: false, stock: 1, tags: [], images: [] },
  });

  const isPerishable = watch("isPerishable");

  function addImageField() {
    if (imageUrls.length < 4) setImageUrls((prev) => [...prev, ""]);
  }

  function removeImageField(i: number) {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateImageUrl(i: number, val: string) {
    setImageUrls((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  }

  function onSubmit(data: CreateProductInput) {
    const validImages = imageUrls.filter((u) => {
      try { new URL(u); return true; } catch { return false; }
    });
    startTransition(async () => {
      const result = await createProduct({ ...data, tags, images: validImages });
      if (result.error) { toast.error(result.error); return; }
      toast.success("Product listed successfully!");
      router.push("/listings");
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/listings" className="text-sm mb-3 block" style={{ color: "var(--color-text-3)" }}>← Back to listings</Link>
        <h1 className="font-display text-2xl font-bold">New listing</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic info */}
        <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="font-semibold">Basic info</h2>

          <div>
            <label className="block text-sm font-medium mb-1.5">Product title *</label>
            <input {...register("title")} placeholder="e.g. Homemade Chin-chin (500g)"
              className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{ background: "var(--color-surface-2)", border: `1px solid ${errors.title ? "var(--color-danger)" : "var(--color-border)"}`, color: "var(--color-text-1)" }} />
            {errors.title && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea {...register("description")} placeholder="Describe your product…" rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select {...register("category")}
              className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{ background: "var(--color-surface-2)", border: `1px solid ${errors.category ? "var(--color-danger)" : "var(--color-border)"}`, color: "var(--color-text-1)" }}>
              <option value="">Select category</option>
              {PRODUCT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tags</label>
            <TagInput value={tags} onChange={setTags} placeholder="Add a tag, press Enter" />
          </div>
        </div>

        {/* Images */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="font-semibold">Product images</h2>
          <p className="text-xs" style={{ color: "var(--color-text-3)" }}>Paste image URLs (up to 4). Use direct image links ending in .jpg, .png, etc.</p>
          {imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={url}
                onChange={(e) => updateImageUrl(i, e.target.value)}
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
                <button type="button" onClick={() => removeImageField(i)} className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--color-surface-2)", color: "var(--color-text-3)" }}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {imageUrls.length < 4 && (
            <button type="button" onClick={addImageField} className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
              <Plus size={15} /> Add another image
            </button>
          )}
        </div>

        {/* Pricing & stock */}
        <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="font-semibold">Pricing & stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Price (₦) *</label>
              <input {...register("price", { valueAsNumber: true })} type="number" min={0} placeholder="0"
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: `1px solid ${errors.price ? "var(--color-danger)" : "var(--color-border)"}`, color: "var(--color-text-1)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Compare-at price (₦)</label>
              <input {...register("compareAtPrice", { valueAsNumber: true })} type="number" min={0} placeholder="Optional"
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Stock quantity *</label>
            <input {...register("stock", { valueAsNumber: true })} type="number" min={1}
              className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
          </div>
        </div>

        {/* Fresh Market */}
        <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Fresh Market</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-2)" }}>Enable for perishable / time-limited goods</p>
            </div>
            <div onClick={() => setValue("isPerishable", !isPerishable)}
              className="w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors"
              style={{ background: isPerishable ? "var(--color-fresh)" : "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
              <div className="w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: isPerishable ? "translateX(20px)" : "translateX(0)" }} />
            </div>
          </div>
          {isPerishable && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Expiry date & time *</label>
              <input {...register("expiresAt")} type="datetime-local"
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: `1px solid ${errors.expiresAt ? "var(--color-danger)" : "var(--color-border)"}`, color: "var(--color-text-1)" }} />
              {errors.expiresAt && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{errors.expiresAt.message as string}</p>}
            </div>
          )}
        </div>

        <button type="submit" disabled={pending}
          className="w-full h-12 rounded-2xl font-semibold transition-opacity disabled:opacity-50"
          style={{ background: "var(--color-primary)", color: "#fff" }}>
          {pending ? "Creating listing…" : "Create listing"}
        </button>
      </form>
    </div>
  );
}
