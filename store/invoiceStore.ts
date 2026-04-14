"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId as uuidv4 } from "@/lib/uuid";
import {
  Invoice,
  createEmptyInvoice,
  calculateInvoiceTotals,
} from "@/types/invoice";

interface InvoiceStore {
  invoices: Invoice[];
  currentInvoice: Invoice;
  setCurrentInvoice: (invoice: Invoice) => void;
  updateCurrentInvoice: (updates: Partial<Invoice>) => void;
  saveCurrentInvoice: () => string;
  loadInvoice: (id: string) => void;
  newInvoice: () => void;
  deleteInvoice: (id: string) => void;
  duplicateInvoice: (id: string) => string;
  markAsPaid: (id: string) => void;
  updateStatus: (id: string, status: Invoice["status"]) => void;
  getNextInvoiceNumber: () => string;
  // DB sync
  fetchFromServer: () => Promise<void>;
  pushToServer: (invoice: Invoice) => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: [],
      currentInvoice: (() => {
        const inv = createEmptyInvoice();
        inv.id = uuidv4();
        inv.invoice_number = "INV-001";
        return inv;
      })(),

      setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),

      updateCurrentInvoice: (updates) => {
        const current = get().currentInvoice;
        const merged = { ...current, ...updates, updated_at: new Date().toISOString() };
        const calculated = calculateInvoiceTotals(merged);
        set({ currentInvoice: calculated });
      },

      saveCurrentInvoice: () => {
        const { currentInvoice, invoices } = get();
        const calculated = calculateInvoiceTotals(currentInvoice);
        const now = new Date().toISOString();
        const existing = invoices.findIndex((inv) => inv.id === calculated.id);

        let saved: Invoice;
        if (existing >= 0) {
          const updated = [...invoices];
          saved = { ...calculated, updated_at: now };
          updated[existing] = saved;
          set({ invoices: updated, currentInvoice: saved });
        } else {
          saved = { ...calculated, created_at: now, updated_at: now };
          set({ invoices: [...invoices, saved], currentInvoice: saved });
        }

        // Fire-and-forget sync to Turso
        get().pushToServer(saved);
        return calculated.id;
      },

      pushToServer: (invoice) => {
        fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoice),
        }).catch(() => {});
      },

      fetchFromServer: async () => {
        try {
          const res = await fetch("/api/invoices");
          if (!res.ok) return;
          const invoices: Invoice[] = await res.json();
          if (invoices.length > 0) {
            set({ invoices });
          }
        } catch {
          // offline — keep localStorage data
        }
      },

      loadInvoice: (id) => {
        const inv = get().invoices.find((i) => i.id === id);
        if (inv) set({ currentInvoice: { ...inv } });
      },

      newInvoice: () => {
        const inv = createEmptyInvoice();
        inv.id = uuidv4();
        inv.invoice_number = get().getNextInvoiceNumber();
        set({ currentInvoice: inv });
      },

      deleteInvoice: (id) => {
        set({ invoices: get().invoices.filter((i) => i.id !== id) });
        fetch(`/api/invoices/${id}`, { method: "DELETE" }).catch(() => {});
      },

      duplicateInvoice: (id) => {
        const inv = get().invoices.find((i) => i.id === id);
        if (!inv) return "";
        const now = new Date().toISOString();
        const newId = uuidv4();
        const duplicate: Invoice = {
          ...inv,
          id: newId,
          invoice_number: get().getNextInvoiceNumber(),
          status: "draft",
          created_at: now,
          updated_at: now,
          items: inv.items.map((item) => ({ ...item, id: uuidv4() })),
        };
        const updated = [...get().invoices, duplicate];
        set({ invoices: updated });
        get().pushToServer(duplicate);
        return newId;
      },

      markAsPaid: (id) => {
        const updated = get().invoices.map((inv) =>
          inv.id === id
            ? {
                ...inv,
                status: "paid" as const,
                amount_paid: inv.total,
                balance_due: 0,
                updated_at: new Date().toISOString(),
              }
            : inv
        );
        set({ invoices: updated });
        const paid = updated.find((i) => i.id === id);
        if (paid) get().pushToServer(paid);
      },

      updateStatus: (id, status) => {
        const updated = get().invoices.map((inv) =>
          inv.id === id ? { ...inv, status, updated_at: new Date().toISOString() } : inv
        );
        set({ invoices: updated });
        const changed = updated.find((i) => i.id === id);
        if (changed) get().pushToServer(changed);
      },

      getNextInvoiceNumber: () => {
        const { invoices } = get();
        const nums = invoices
          .map((inv) => {
            const match = inv.invoice_number.match(/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(Boolean);
        const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
        return `INV-${String(next).padStart(3, "0")}`;
      },
    }),
    {
      name: "invoicy-storage",
      partialize: (state) => ({
        invoices: state.invoices,
        currentInvoice: state.currentInvoice,
      }),
    }
  )
);
