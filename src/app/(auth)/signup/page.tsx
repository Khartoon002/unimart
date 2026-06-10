"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { registerUser } from "@/server/actions/auth.actions";
import { signIn } from "next-auth/react";
import { NIGERIAN_FACULTIES, NIGERIAN_HOSTELS } from "@/lib/constants";
import { Eye, EyeOff, Loader2, Store, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { wantsToSell: false },
  });

  const password = watch("password", "");
  const wantsToSell = watch("wantsToSell", false);

  const pwStrength = !password
    ? 0
    : password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
    ? 3
    : password.length >= 6
    ? 2
    : 1;
  const pwColors = ["", "var(--color-danger)", "var(--color-warning)", "var(--color-fresh)"];
  const pwLabels = ["", "Weak", "Fair", "Strong"];

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    setServerError("");
    setSuccess(false);
    try {
      const result = await registerUser(data);
      if (result.error) {
        setServerError(result.error);
        return;
      }

      // Account created — auto sign in
      setSuccess(true);
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/onboarding");
        router.refresh();
      } else {
        // Account was created but auto sign-in failed — send to login
        router.push("/login?registered=1");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const field = (hasError?: boolean) => ({
    background: "var(--color-surface-2)",
    border: `1px solid ${hasError ? "var(--color-danger)" : "var(--color-border)"}`,
    color: "var(--color-text-1)",
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-6">
          <span className="font-display text-3xl font-bold" style={{ color: "var(--color-primary)" }}>UniMart</span>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-2)" }}>Create your account</p>
        </div>

        <div
          className="rounded-2xl p-8 space-y-4"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-modal)" }}
        >
          {/* Error banner */}
          {serverError && (
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl text-sm"
              style={{ background: "var(--color-danger-soft)", border: "1px solid var(--color-danger)" }}
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-danger)" }} />
              <p style={{ color: "var(--color-danger)" }}>{serverError}</p>
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div
              className="flex items-center gap-3 p-3.5 rounded-xl text-sm"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid var(--color-fresh)" }}
            >
              <CheckCircle2 size={16} className="flex-shrink-0" style={{ color: "var(--color-fresh)" }} />
              <p style={{ color: "var(--color-fresh)" }}>Account created! Signing you in…</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name + Matric */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-2)" }}>Full name</label>
                <input
                  {...register("name")}
                  placeholder="Tunde Bakare"
                  className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                  style={field(!!errors.name)}
                />
                {errors.name && <p className="mt-1 text-xs" style={{ color: "var(--color-danger)" }}>{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-2)" }}>Matric number</label>
                <input
                  {...register("matricNumber")}
                  placeholder="19/ENG/123"
                  className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                  style={field(!!errors.matricNumber)}
                />
                {errors.matricNumber && <p className="mt-1 text-xs" style={{ color: "var(--color-danger)" }}>{errors.matricNumber.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-2)" }}>Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@university.edu.ng"
                className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                style={field(!!errors.email)}
              />
              {errors.email && <p className="mt-1 text-xs" style={{ color: "var(--color-danger)" }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-2)" }}>Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className="w-full h-10 px-3 pr-10 rounded-lg text-sm outline-none"
                  style={field(!!errors.password)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-3)" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password && (
                <div className="flex gap-1 mt-1.5 items-center">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all"
                      style={{ background: i <= pwStrength ? pwColors[pwStrength] : "var(--color-surface-2)" }} />
                  ))}
                  <span className="text-xs ml-1" style={{ color: pwColors[pwStrength] }}>{pwLabels[pwStrength]}</span>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs" style={{ color: "var(--color-danger)" }}>{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-2)" }}>Confirm password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                style={field(!!errors.confirmPassword)}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs" style={{ color: "var(--color-danger)" }}>{errors.confirmPassword.message}</p>}
            </div>

            {/* Faculty + Hostel */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-2)" }}>Faculty</label>
                <select {...register("faculty")} className="w-full h-10 px-3 rounded-lg text-sm outline-none" style={field(!!errors.faculty)}>
                  <option value="">Select…</option>
                  {NIGERIAN_FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                {errors.faculty && <p className="mt-1 text-xs" style={{ color: "var(--color-danger)" }}>{errors.faculty.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-2)" }}>Hostel</label>
                <select {...register("hostel")} className="w-full h-10 px-3 rounded-lg text-sm outline-none" style={field(!!errors.hostel)}>
                  <option value="">Select…</option>
                  {NIGERIAN_HOSTELS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                {errors.hostel && <p className="mt-1 text-xs" style={{ color: "var(--color-danger)" }}>{errors.hostel.message}</p>}
              </div>
            </div>

            {/* Seller toggle */}
            <label
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
              style={{
                background: wantsToSell ? "var(--color-accent-soft)" : "var(--color-surface-2)",
                border: `1px solid ${wantsToSell ? "var(--color-accent)" : "var(--color-border)"}`,
              }}
            >
              <input {...register("wantsToSell")} type="checkbox" className="hidden" />
              <div
                className="w-10 h-6 rounded-full flex items-center px-0.5 flex-shrink-0 transition-colors"
                style={{ background: wantsToSell ? "var(--color-accent)" : "var(--color-border)" }}
              >
                <div className="w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: wantsToSell ? "translateX(16px)" : "translateX(0)" }} />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Store size={16} style={{ color: wantsToSell ? "var(--color-accent)" : "var(--color-text-3)", flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: wantsToSell ? "var(--color-accent)" : "var(--color-text-1)" }}>I also want to sell on UniMart</p>
                  <p className="text-xs" style={{ color: "var(--color-text-3)" }}>Set up a store and start earning</p>
                </div>
              </div>
            </label>

            {/* Store name */}
            {wantsToSell && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-2)" }}>Store name (optional)</label>
                <input
                  {...register("storeName")}
                  placeholder="e.g. Tunde Tech Hub"
                  className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                  style={field()}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2 mt-2 transition-all"
              style={{ background: "var(--color-primary)", color: "#fff", opacity: loading || success ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Creating account…" : success ? "Redirecting…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: "var(--color-text-2)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--color-primary)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
