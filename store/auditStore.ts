"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/uuid";

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  targetId?: string;
  timestamp: string;
}

interface AuditStore {
  entries: AuditEntry[];
  log: (action: string, target: string, targetId?: string) => void;
  getRecent: (count: number) => AuditEntry[];
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      entries: [],
      log: (action, target, targetId) => {
        const entry: AuditEntry = {
          id: generateId(),
          actor: "You",
          action,
          target,
          targetId,
          timestamp: new Date().toISOString(),
        };
        set({ entries: [entry, ...get().entries].slice(0, 500) });
      },
      getRecent: (count) => get().entries.slice(0, count),
    }),
    { name: "invoicy-audit" }
  )
);
