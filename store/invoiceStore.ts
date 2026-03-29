"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
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

        if (existing >= 0) {
          const updated = [...invoices];
          updated[existing] = { ...calculated, updated_at: now };
          set({ invoices: updated, currentInvoice: { ...calculated, updated_at: now } });
        } else {
          const newInv = { ...calculated, created_at: now, updated_at: now };
          set({ invoices: [...invoices, newInv], currentInvoice: newInv });
        }
        return calculated.id;
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
        set({ invoices: [...get().invoices, duplicate] });
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
      },

      updateStatus: (id, status) => {
        const updated = get().invoices.map((inv) =>
          inv.id === id ? { ...inv, status, updated_at: new Date().toISOString() } : inv
        );
        set({ invoices: updated });
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
