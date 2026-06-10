"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { User, MapPin, Lock, CreditCard, Bell } from "lucide-react";
import { updateProfile, addAddress } from "@/server/actions/user.actions";
import { changePassword } from "@/server/actions/auth.actions";
import { updateProfileSchema, addAddressSchema, changePasswordSchema, type UpdateProfileInput, type AddAddressInput, type ChangePasswordInput } from "@/lib/validations";
import { NIGERIAN_FACULTIES, NIGERIAN_HOSTELS } from "@/lib/constants";
import { AddressCard } from "@/components/unimart/AddressCard";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "@prisma/client";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "security", label: "Security", icon: Lock },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [pending, startTransition] = useTransition();

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: session?.user?.name ?? "", faculty: session?.user?.faculty ?? "", hostel: session?.user?.hostel ?? "" },
  });

  const addressForm = useForm<AddAddressInput>({ resolver: zodResolver(addAddressSchema) });
  const passwordForm = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const { data: addresses = [], refetch: refetchAddresses } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: async () => { const r = await fetch("/api/addresses"); return r.json(); },
  });

  async function onProfileSave(data: UpdateProfileInput) {
    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.error) { toast.error(result.error); return; }
      await update(data);
      toast.success("Profile updated!");
    });
  }

  async function onAddAddress(data: AddAddressInput) {
    startTransition(async () => {
      const result = await addAddress(data);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Address added!");
      addressForm.reset();
      refetchAddresses();
    });
  }

  async function onChangePassword(data: ChangePasswordInput) {
    startTransition(async () => {
      const result = await changePassword(data);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Password changed!");
      passwordForm.reset();
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? "var(--color-surface-2)" : "transparent",
              color: activeTab === tab.id ? "var(--color-text-1)" : "var(--color-text-3)",
              border: activeTab === tab.id ? "1px solid var(--color-border)" : "none",
            }}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="p-6 rounded-2xl space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
              {session?.user?.image && <Image src={session.user.image} alt="" fill className="object-cover" />}
            </div>
            <div>
              <p className="font-semibold">{session?.user?.name}</p>
              <p className="text-sm" style={{ color: "var(--color-text-3)" }}>{session?.user?.email}</p>
            </div>
          </div>
          <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full name</label>
              <input {...profileForm.register("name")}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
            </div>
            {[
              { name: "faculty" as const, label: "Faculty", options: NIGERIAN_FACULTIES },
              { name: "hostel" as const, label: "Hostel", options: NIGERIAN_HOSTELS },
            ].map(({ name, label, options }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <select {...profileForm.register(name)}
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                  style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
                  <option value="">Select {label.toLowerCase()}</option>
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <button type="submit" disabled={pending}
              className="h-11 px-6 rounded-2xl font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "var(--color-primary)", color: "#fff" }}>
              Save changes
            </button>
          </form>
        </div>
      )}

      {/* Addresses tab */}
      {activeTab === "addresses" && (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <AddressCard key={addr.id} address={addr} />
          ))}
          <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="font-semibold">Add new address</h2>
            <form onSubmit={addressForm.handleSubmit(onAddAddress)} className="space-y-3">
              {[
                { name: "label" as const, label: "Label *", placeholder: "e.g. Home, Hostel" },
                { name: "recipientName" as const, label: "Recipient name *", placeholder: "Full name" },
                { name: "phone" as const, label: "Phone number *", placeholder: "08012345678" },
                { name: "hostel" as const, label: "Hostel", placeholder: "Boys Hostel / Girls Hostel" },
                { name: "room" as const, label: "Room number", placeholder: "e.g. A14" },
                { name: "faculty" as const, label: "Faculty", placeholder: "e.g. Engineering" },
                { name: "pickupPoint" as const, label: "Pickup point", placeholder: "e.g. Main gate" },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-2)" }}>{label}</label>
                  <input {...addressForm.register(name)}
                    placeholder={placeholder}
                    className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                    style={{ background: "var(--color-surface-2)", border: `1px solid ${addressForm.formState.errors[name] ? "var(--color-danger)" : "var(--color-border)"}`, color: "var(--color-text-1)" }} />
                  {addressForm.formState.errors[name] && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-danger)" }}>{addressForm.formState.errors[name]?.message}</p>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-3">
                <input type="checkbox" {...addressForm.register("isDefault")} id="isDefault" />
                <label htmlFor="isDefault" className="text-sm">Set as default</label>
              </div>
              <button type="submit" disabled={pending}
                className="h-10 px-5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: "var(--color-primary)", color: "#fff" }}>
                Add address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Security tab */}
      {activeTab === "security" && (
        <div className="p-6 rounded-2xl space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="font-semibold">Change password</h2>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            {[
              { name: "currentPassword" as const, label: "Current password" },
              { name: "newPassword" as const, label: "New password" },
              { name: "confirmNewPassword" as const, label: "Confirm new password" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <input {...passwordForm.register(name)} type="password"
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                  style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
                {passwordForm.formState.errors[name] && (
                  <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{passwordForm.formState.errors[name]?.message}</p>
                )}
              </div>
            ))}
            <button type="submit" disabled={pending}
              className="h-11 px-6 rounded-2xl font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "var(--color-primary)", color: "#fff" }}>
              Update password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
