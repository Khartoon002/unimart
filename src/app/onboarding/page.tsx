"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Store, User, ChevronRight } from "lucide-react";
import { completeOnboarding } from "@/server/actions/user.actions";
import { onboardingBuyerSchema, onboardingMerchantSchema, type OnboardingBuyerInput, type OnboardingMerchantInput } from "@/lib/validations";
import { NIGERIAN_FACULTIES, NIGERIAN_HOSTELS } from "@/lib/constants";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0); // 0=role pick, 1=buyer details, 2=merchant details
  const [pending, startTransition] = useTransition();

  const buyerForm = useForm<OnboardingBuyerInput>({ resolver: zodResolver(onboardingBuyerSchema) });
  const merchantForm = useForm<OnboardingMerchantInput>({ resolver: zodResolver(onboardingMerchantSchema) });

  async function onBuyerSubmit(data: OnboardingBuyerInput) {
    startTransition(async () => {
      const result = await completeOnboarding(data, "BUYER");
      if (result.error) { toast.error(result.error); return; }
      await update({ onboardingDone: true });
      router.replace("/marketplace");
    });
  }

  async function onMerchantSubmit(data: OnboardingMerchantInput) {
    startTransition(async () => {
      const result = await completeOnboarding(data, "MERCHANT");
      if (result.error) { toast.error(result.error); return; }
      const merchantProfileId = (result.data as { merchantProfileId?: string })?.merchantProfileId;
      await update({ onboardingDone: true, activeRole: "MERCHANT", roles: ["BUYER", "MERCHANT"], merchantProfileId });
      router.replace("/dashboard");
    });
  }

  const steps = [
    // Step 0: Choose path
    <motion.div key="choose" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Welcome to UniMart</h1>
        <p className="mt-2" style={{ color: "var(--color-text-2)" }}>Let&rsquo;s set up your profile. How would you like to start?</p>
      </div>
      <div className="grid gap-4">
        {[
          { icon: User, title: "I'm a Buyer", desc: "Browse and buy from student merchants on campus", next: 1, color: "var(--color-primary)" },
          { icon: Store, title: "I'm a Seller", desc: "Set up your store and start earning from fellow students", next: 2, color: "var(--color-accent)" },
        ].map((opt) => (
          <button key={opt.next} onClick={() => setStep(opt.next)}
            className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all"
            style={{ background: "var(--color-surface)", border: "2px solid var(--color-border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = opt.color)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `color-mix(in srgb, ${opt.color} 12%, transparent)` }}>
              <opt.icon size={22} style={{ color: opt.color }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{opt.title}</p>
              <p className="text-sm mt-0.5" style={{ color: "var(--color-text-2)" }}>{opt.desc}</p>
            </div>
            <ChevronRight size={18} style={{ color: "var(--color-text-3)" }} />
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 1: Buyer details
    <motion.div key="buyer" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div>
        <button onClick={() => setStep(0)} className="text-sm mb-4" style={{ color: "var(--color-text-3)" }}>← Back</button>
        <h1 className="font-display text-2xl font-bold">Your delivery preferences</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-2)" }}>Help us personalize your experience</p>
      </div>
      <form onSubmit={buyerForm.handleSubmit(onBuyerSubmit)} className="space-y-4">
        {[
          { name: "faculty" as const, label: "Faculty", options: NIGERIAN_FACULTIES },
          { name: "hostel" as const, label: "Hostel / Hall of residence", options: NIGERIAN_HOSTELS },
        ].map(({ name, label, options }) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1.5">{label}</label>
            <select {...buyerForm.register(name)}
              className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
              <option value="">Select {label.toLowerCase()}</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {buyerForm.formState.errors[name] && (
              <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{buyerForm.formState.errors[name]?.message}</p>
            )}
          </div>
        ))}
        <button type="submit" disabled={pending}
          className="w-full h-12 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-opacity"
          style={{ background: "var(--color-primary)", color: "#fff", opacity: pending ? 0.7 : 1 }}>
          {pending ? "Setting up…" : "Start shopping"}
          {!pending && <ChevronRight size={16} />}
        </button>
      </form>
    </motion.div>,

    // Step 2: Merchant details
    <motion.div key="merchant" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div>
        <button onClick={() => setStep(0)} className="text-sm mb-4" style={{ color: "var(--color-text-3)" }}>← Back</button>
        <h1 className="font-display text-2xl font-bold">Set up your store</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-2)" }}>Tell buyers about your store</p>
      </div>
      <form onSubmit={merchantForm.handleSubmit(onMerchantSubmit)} className="space-y-4">
        {[
          { name: "storeName" as const, label: "Store name", placeholder: "e.g. Tunde's Snacks" },
          { name: "storeDescription" as const, label: "Short description (optional)", placeholder: "What do you sell?" },
          { name: "faculty" as const, label: "Faculty", placeholder: "" },
          { name: "hostel" as const, label: "Hostel / Location", placeholder: "" },
        ].map(({ name, label, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1.5">{label}</label>
            {name === "faculty" ? (
              <select {...merchantForm.register(name)}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
                <option value="">Select faculty</option>
                {NIGERIAN_FACULTIES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : name === "hostel" ? (
              <select {...merchantForm.register(name)}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
                <option value="">Select hostel</option>
                {NIGERIAN_HOSTELS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input {...merchantForm.register(name as "storeName" | "storeDescription")}
                placeholder={placeholder}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
            )}
            {merchantForm.formState.errors[name] && (
              <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
                {merchantForm.formState.errors[name]?.message as string}
              </p>
            )}
          </div>
        ))}
        <button type="submit" disabled={pending}
          className="w-full h-12 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-opacity"
          style={{ background: "var(--color-primary)", color: "#fff", opacity: pending ? 0.7 : 1 }}>
          {pending ? "Creating store…" : "Open my store"}
          {!pending && <Store size={16} />}
        </button>
      </form>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>
    </div>
  );
}
