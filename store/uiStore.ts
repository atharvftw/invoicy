"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  sidebarOpen: boolean;
  previewOpen: boolean;
  toggleSidebar: () => void;
  togglePreview: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      previewOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      togglePreview: () => set((s) => ({ previewOpen: !s.previewOpen })),
    }),
    { name: "invoicy-ui" }
  )
);
