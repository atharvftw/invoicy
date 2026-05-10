"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/uuid";
import { ReminderSchedule, ReminderTemplate, LateFeeConfig, ReminderSendRecord, ReminderTrigger, ReminderChannel, ReminderTone } from "@/types/invoice";

interface ReminderStore {
  schedules: ReminderSchedule[];
  templates: ReminderTemplate[];
  lateFee: LateFeeConfig;
  sendHistory: ReminderSendRecord[];
  addSchedule: (data: Omit<ReminderSchedule, "id" | "created_at">) => void;
  deleteSchedule: (id: string) => void;
  toggleSchedule: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<Omit<ReminderTemplate, "id">>) => void;
  setLateFee: (config: LateFeeConfig) => void;
  recordSend: (record: Omit<ReminderSendRecord, "id" | "sentAt">) => void;
}

const defaultTemplates: ReminderTemplate[] = [
  {
    id: "t-pre-friendly",
    trigger: "pre_due",
    tone: "friendly",
    subject: "Friendly reminder: Invoice #{invoice_number} due soon",
    body: "Hi {client_name},\n\nJust a friendly heads-up that invoice #{invoice_number} for ₹{total} is due on {due_date}.\n\nThanks!",
    active: true,
  },
  {
    id: "t-due-friendly",
    trigger: "due_date",
    tone: "friendly",
    subject: "Invoice #{invoice_number} is due today",
    body: "Hi {client_name},\n\nInvoice #{invoice_number} for ₹{total} is due today. Please let us know if you need anything.\n\nThanks!",
    active: true,
  },
  {
    id: "t-overdue-firm",
    trigger: "overdue",
    tone: "firm",
    subject: "Overdue: Invoice #{invoice_number}",
    body: "Hi {client_name},\n\nInvoice #{invoice_number} for ₹{total} is now overdue. Please settle at your earliest convenience.\n\nRegards,",
    active: true,
  },
];

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      schedules: [
        { id: generateId(), trigger: "pre_due", daysOffset: 3, channel: "email", active: true, created_at: new Date().toISOString() },
        { id: generateId(), trigger: "due_date", daysOffset: 0, channel: "both", active: true, created_at: new Date().toISOString() },
        { id: generateId(), trigger: "overdue", daysOffset: 3, channel: "both", active: true, created_at: new Date().toISOString() },
      ],
      templates: defaultTemplates,
      lateFee: { enabled: false, type: "percentage", value: 1.5, gracePeriodDays: 7 },
      sendHistory: [],
      addSchedule: (data) => {
        const schedule: ReminderSchedule = {
          id: generateId(),
          ...data,
          created_at: new Date().toISOString(),
        };
        set({ schedules: [...get().schedules, schedule] });
      },
      deleteSchedule: (id) => {
        set({ schedules: get().schedules.filter((s) => s.id !== id) });
      },
      toggleSchedule: (id) => {
        set({
          schedules: get().schedules.map((s) =>
            s.id === id ? { ...s, active: !s.active } : s
          ),
        });
      },
      updateTemplate: (id, updates) => {
        set({
          templates: get().templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
      },
      setLateFee: (config) => set({ lateFee: config }),
      recordSend: (record) => {
        const fullRecord: ReminderSendRecord = {
          id: generateId(),
          ...record,
          sentAt: new Date().toISOString(),
        };
        set({ sendHistory: [fullRecord, ...get().sendHistory].slice(0, 200) });
      },
    }),
    { name: "invoicy-reminders" }
  )
);
