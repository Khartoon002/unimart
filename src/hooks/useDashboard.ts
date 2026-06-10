"use client";

import { useQuery } from "@tanstack/react-query";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/merchant/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    staleTime: 60_000,
    refetchInterval: 300_000,
  });
}

export function useMerchantOrders(status?: string) {
  return useQuery({
    queryKey: ["merchant-orders", status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : "";
      const res = await fetch(`/api/merchant/orders${params}`);
      if (!res.ok) throw new Error("Failed to fetch merchant orders");
      return res.json();
    },
    staleTime: 30_000,
  });
}
