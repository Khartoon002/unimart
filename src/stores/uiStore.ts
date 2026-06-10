"use client";

import { create } from "zustand";
import type { UserRole } from "@prisma/client";

interface UIStore {
  sidebarCollapsed: boolean;
  activeRole: UserRole;
  cartDrawerOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveRole: (role: UserRole) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  sidebarCollapsed: false,
  activeRole: "BUYER",
  cartDrawerOpen: false,

  toggleSidebar() {
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
  },

  setSidebarCollapsed(v) {
    set({ sidebarCollapsed: v });
  },

  setActiveRole(role) {
    set({ activeRole: role });
  },

  openCartDrawer() {
    set({ cartDrawerOpen: true });
  },

  closeCartDrawer() {
    set({ cartDrawerOpen: false });
  },
}));
