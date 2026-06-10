"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Eye, EyeOff, Loader2, ShoppingBag, AlertCircle } from "lucide-react";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Incorrect email or password. Please check and try again.",
  OAuthAccountNotLinked: "This email is linked to a different sign-in method.",
  OAuthSignin: "Could not sign in with that provider. Try again.",
  OAuthCallback: "Sign-in was cancelled or failed. Try again.",
  SessionRequired: "You need to sign in to access that page.",
  Default: "Sign in failed. Please try again.",
};

function getErrorMessage(code: string | null): string {
  if (!code) return "";
  return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.Default;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("callbackUrl") ?? "/marketplace";

  // NextAuth redirects here with ?error= when auth fails server-side
  const urlError = params.get("error");

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string>(getErrorMessage(urlError));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    setAuthError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError(getErrorMessage(result.error));
      } else {
        router.push(from);
        router.refresh();
      }
    } catch {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <ShoppingBag size={28} style={{ color: "var(--color-primary)" }} />
            <span className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
              UniMart
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-2)" }}>
            Campus marketplace — buy and sell with confidence
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-modal)" }}
        >
          <h1 className="text-2xl font-semibold mb-6">Welcome back</h1>

          {/* Inline auth error banner */}
          {authError && (
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl mb-5 text-sm"
              style={{
                background: "var(--color-danger-soft)",
                border: "1px solid var(--color-danger)",
              }}
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-danger)" }} />
              <p style={{ color: "var(--color-danger)" }}>{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-text-2)" }}>
                Email address
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@university.edu.ng"
                className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--color-surface-2)",
                  border: `1px solid ${errors.email ? "var(--color-danger)" : "var(--color-border)"}`,
                  color: "var(--color-text-1)",
                }}
              />
              {errors.email && (
                <p className="mt-1 text-xs" style={{ color: "var(--color-danger)" }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-text-2)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--color-surface-2)",
                    border: `1px solid ${errors.password ? "var(--color-danger)" : "var(--color-border)"}`,
                    color: "var(--color-text-1)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-3)" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: "var(--color-danger)" }}>{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: "var(--color-primary)", color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: "var(--color-text-2)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold" style={{ color: "var(--color-primary)" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
