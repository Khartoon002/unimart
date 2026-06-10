import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WithdrawButton } from "@/components/unimart/WithdrawButton";
import { formatPrice, formatDate } from "@/lib/utils";
import { Wallet, TrendingUp, Clock } from "lucide-react";

export default async function EarningsPage() {
  const session = await auth();
  if (!session?.user?.merchantProfileId) redirect("/onboarding");

  const [merchant, payouts, bankAccounts] = await Promise.all([
    prisma.merchantProfile.findUnique({
      where: { id: session.user.merchantProfileId },
      select: { pendingBalance: true, withdrawableBalance: true, totalEarned: true },
    }),
    prisma.transaction.findMany({
      where: { merchantId: session.user.merchantProfileId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.bankAccount.findMany({
      where: { merchantId: session.user.merchantProfileId },
    }),
  ]);

  if (!merchant) redirect("/onboarding");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold">Earnings</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: "Total revenue", value: formatPrice(merchant.totalEarned), color: "var(--color-success)" },
          { icon: Clock, label: "Pending escrow", value: formatPrice(merchant.pendingBalance), color: "var(--color-warning)" },
          { icon: Wallet, label: "Withdrawable", value: formatPrice(merchant.withdrawableBalance), color: "var(--color-primary)" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-4 rounded-2xl"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <Icon size={18} style={{ color, marginBottom: 8 }} />
            <p className="font-display text-xl font-bold">{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Withdraw section */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h2 className="font-semibold mb-4">Withdraw funds</h2>
        {bankAccounts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm mb-3" style={{ color: "var(--color-text-2)" }}>Add a bank account to withdraw your earnings</p>
            <a href="/settings/bank" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>Add bank account →</a>
          </div>
        ) : (
          <WithdrawButton
            balance={Number(merchant.withdrawableBalance)}
            bankAccounts={bankAccounts}
            merchantId={session.user.merchantProfileId}
          />
        )}
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="font-semibold mb-4">Transaction history</h2>
        {payouts.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--color-text-3)" }}>No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {payouts.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div>
                  <p className="text-sm font-medium capitalize">{tx.type.toLowerCase().replace("_", " ")}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>{formatDate(tx.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm" style={{ color: tx.type === "withdrawal" ? "var(--color-danger)" : "var(--color-success)" }}>
                    {tx.type === "withdrawal" ? "-" : "+"}{formatPrice(tx.amount)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-3)" }}>ref: {tx.reference.slice(-8)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
