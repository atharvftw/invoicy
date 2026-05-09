"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/uuid";
import { RecurringSchedule } from "@/types/invoice";

interface RecurringStore {
  schedules: RecurringSchedule[];
  addSchedule: (data: Omit<RecurringSchedule, "id" | "created_at" | "nextDate">) => RecurringSchedule;
  updateSchedule: (id: string, updates: Partial<Omit<RecurringSchedule, "id">>) => void;
  deleteSchedule: (id: string) => void;
  toggleActive: (id: string) => void;
}

function computeNextDate(dateStr: string, frequency: RecurringSchedule["frequency"]): string {
  const d = new Date(dateStr + "T00:00:00");
  if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
  else if (frequency === "quarterly") d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
}

export const useRecurringStore = create<RecurringStore>()(
  persist(
    (set, get) => ({
      schedules: [],
      addSchedule: (data) => {
        const now = new Date().toISOString();
        const schedule: RecurringSchedule = {
          id: generateId(),
          ...data,
          nextDate: computeNextDate(data.startDate, data.frequency),
          created_at: now,
        };
        set({ schedules: [...get().schedules, schedule] });
        return schedule;
      },
      updateSchedule: (id, updates) => {
        const updated = get().schedules.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        );
        set({ schedules: updated });
      },
      deleteSchedule: (id) => {
        set({ schedules: get().schedules.filter((s) => s.id !== id) });
      },
      toggleActive: (id) => {
        const updated = get().schedules.map((s) =>
          s.id === id ? { ...s, active: !s.active } : s
        );
        set({ schedules: updated });
      },
    }),
    { name: "invoicy-recurring" }
  )
);
