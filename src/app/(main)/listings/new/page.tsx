"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type CreateProductInput } from "@/lib/validations";
import { createProduct } from "@/server/actions/product.actions";
import { PRODUCT_CATEGORIES, CATEGORY_VARIANTS } from "@/lib/constants";
import { TagInput } from "@/components/unimart/TagInput";
import { toast } from "sonner";
import Link from "next/link";
import { X, Plus, Wand2 } from "lucide-react";

type VariantDraft = { name: string; options: string[] };

export default function NewListingPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { isPerishable: false, stock: 1, status: "ACTIVE", tags: [], images: [] },
  });

  const selectedCategory = watch("category");
  const isPerishable = watch("isPerishable");
  const categoryPresets = selectedCategory ? (CATEGORY_VARIANTS[selectedCategory] ?? []) : [];
  const categoryLabel = PRODUCT_CATEGORIES.find((c) => c.value === selectedCategory)?.label ?? "";

  function addImageField() {
    if (imageUrls.length < 4) setImageUrls((prev) => [...prev, ""]);
  }

  function removeImageField(i: number) {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateImageUrl(i: number, val: string) {
    setImageUrls((prev) => { const n = [...prev]; n[i] = val; return n; });
  }

  function applyCategoryPresets() {
    setVariants(categoryPresets.map((p) => ({ name: p.name, options: [...p.options] })));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { name: "", options: [""] }]);
  }

  function removeVariant(vi: number) {
    setVariants((prev) => prev.filter((_, i) => i !== vi));
  }

  function updateVariantName(vi: number, name: string) {
    setVariants((prev) => prev.map((v, i) => (i === vi ? { ...v, name } : v)));
  }

  function addOption(vi: number) {
    setVariants((prev) => prev.map((v, i) => (i === vi ? { ...v, options: [...v.options, ""] } : v)));
  }

  function updateOption(vi: number, oi: number, val: string) {
    setVariants((prev) => prev.map((v, i) => i === vi ? { ...v, options: v.options.map((o, j) => (j === oi ? val : o)) } : v));
  }

  function removeOption(vi: number, oi: number) {
    setVariants((prev) => prev.map((v, i) => i === vi ? { ...v, options: v.options.filter((_, j) => j !== oi) } : v));
  }

  function onSubmit(data: CreateProductInput) {
    const validImages = imageUrls.filter((u) => {
      try { new URL(u); return true; } catch { return false; }
    });
    const validVariants = variants
      .filter((v) => v.name.trim() && v.options.some((o) => o.trim()))
      .map((v) => ({
        name: v.name.trim(),
        options: v.options.filter((o) => o.trim()).map((label) => ({ label, stock: 0 })),
      }));
    startTransition(async () => {
      const result = await createProduct({ ...data, tags, images: validImages, variants: validVariants });
      if (result.error) { toast.error(result.error); return; }
      toast.success("Product listed successfully!");
      router.push("/listings");
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/listings" className="text-sm mb-3 block" style={{ color: "var(--color-text-3)" }}>← Back to listings</Link>
        <h1 className="text-2xl font-bold">New listing</h1>
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
            <textarea {...register("description")} placeholder="Describe your product…" rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category *</label>
              <select {...register("category")}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: `1px solid ${errors.category ? "var(--color-danger)" : "var(--color-border)"}`, color: "var(--color-text-1)" }}>
                <option value="">Select category</option>
                {PRODUCT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {errors.category && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{errors.category.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select {...register("status")}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tags</label>
            <TagInput value={tags} onChange={setTags} placeholder="Add a tag, press Enter" />
          </div>
        </div>

        {/* Images */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="font-semibold">Product images</h2>
          <p className="text-xs" style={{ color: "var(--color-text-3)" }}>Paste image URLs (up to 4). Use direct links ending in .jpg, .png, etc.</p>
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
                <button type="button" onClick={() => removeImageField(i)}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--color-surface-2)", color: "var(--color-text-3)" }}>
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
              {errors.price && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Compare-at price (₦)</label>
              <input {...register("compareAtPrice", { valueAsNumber: true })} type="number" min={0} placeholder="Original price"
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Stock quantity *</label>
              <input {...register("stock", { valueAsNumber: true })} type="number" min={0}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">SKU</label>
              <input {...register("sku")} placeholder="Optional"
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">
                Variations
                <span className="font-normal text-xs ml-2" style={{ color: "var(--color-text-3)" }}>optional</span>
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-2)" }}>
                Add sizes, colours, or other options for buyers to pick from
              </p>
            </div>
            {categoryPresets.length > 0 && (
              <button
                type="button"
                onClick={applyCategoryPresets}
                className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-colors"
                style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
              >
                <Wand2 size={12} />
                Suggest for {categoryLabel}
              </button>
            )}
          </div>

          {variants.map((variant, vi) => (
            <div key={vi} className="p-4 rounded-xl space-y-3"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <input
                  value={variant.name}
                  onChange={(e) => updateVariantName(vi, e.target.value)}
                  placeholder="e.g. Size, Colour, Storage"
                  className="flex-1 h-9 px-3 rounded-lg text-sm font-medium outline-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}
                />
                <button type="button" onClick={() => removeVariant(vi)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ color: "var(--color-text-3)" }}>
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {variant.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-1 h-8 px-3 rounded-full text-xs"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                    <input
                      value={opt}
                      onChange={(e) => updateOption(vi, oi, e.target.value)}
                      placeholder="Option"
                      className="bg-transparent outline-none text-xs min-w-0"
                      style={{ color: "var(--color-text-1)", width: `${Math.max(opt.length, 6)}ch` }}
                    />
                    {variant.options.length > 1 && (
                      <button type="button" onClick={() => removeOption(vi, oi)}
                        style={{ color: "var(--color-text-3)", lineHeight: 1, marginLeft: 2 }}>
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addOption(vi)}
                  className="h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{ border: "1px dashed var(--color-border)", color: "var(--color-text-3)" }}>
                  <Plus size={11} /> Add
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addVariant}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--color-primary)" }}>
            <Plus size={15} /> Add variant type
          </button>
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
