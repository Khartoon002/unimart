"use client";

import { useQuery } from "@tanstack/react-query";
import type { OrderStatus } from "@prisma/client";

async function fetchOrders(status?: OrderStatus) {
  const params = status ? `?status=${status}` : "";
  const res = await fetch(`/api/orders${params}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export function useOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: ["orders", status],
    queryFn: () => fetchOrders(status),
    staleTime: 30_000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json();
    },
    enabled: !!id,
  });
}
