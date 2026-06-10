"use client";

import { useState, useTransition } from "react";
import { initiateWithdrawal } from "@/server/actions/order.actions";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { BankAccount } from "@prisma/client";

interface Props {
  balance: number;
  bankAccounts: BankAccount[];
  merchantId: string;
}

export function WithdrawButton({ balance, bankAccounts, merchantId }: Props) {
  const [selectedBank, setSelectedBank] = useState(bankAccounts[0]?.id ?? "");
  const [amount, setAmount] = useState(balance);
  const [pending, startTransition] = useTransition();

  function handleWithdraw() {
    if (!selectedBank) { toast.error("Select a bank account"); return; }
    if (amount < 100) { toast.error("Minimum withdrawal is ₦100"); return; }
    if (amount > balance) { toast.error("Amount exceeds available balance"); return; }

    startTransition(async () => {
      const result = await initiateWithdrawal(amount, selectedBank);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Withdrawal initiated! Funds will arrive within 24 hours.");
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">Bank account</label>
        <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}
          className="w-full h-11 px-4 rounded-xl text-sm outline-none"
          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
          {bankAccounts.map((ba) => (
            <option key={ba.id} value={ba.id}>{ba.bankName} — {ba.accountNumber}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Amount (₦)</label>
        <input
          type="number"
          value={amount}
          min={100}
          max={balance}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full h-11 px-4 rounded-xl text-sm outline-none"
          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}
        />
        <p className="text-xs mt-1" style={{ color: "var(--color-text-3)" }}>Available: {formatPrice(balance)}</p>
      </div>
      <button onClick={handleWithdraw} disabled={pending || balance < 100}
        className="h-11 px-6 rounded-2xl font-semibold transition-opacity disabled:opacity-40"
        style={{ background: "var(--color-primary)", color: "#fff" }}>
        {pending ? "Processing…" : `Withdraw ${formatPrice(amount)}`}
      </button>
    </div>
  );
}
