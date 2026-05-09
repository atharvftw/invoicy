"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/uuid";
import { PaymentTransaction } from "@/types/invoice";

interface PaymentStore {
  transactions: PaymentTransaction[];
  addTransaction: (data: Omit<PaymentTransaction, "id" | "created_at">) => PaymentTransaction;
  updateTransaction: (id: string, updates: Partial<Omit<PaymentTransaction, "id">>) => void;
  deleteTransaction: (id: string) => void;
  matchToInvoice: (transactionId: string, invoiceId: string) => void;
  unmatch: (transactionId: string) => void;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransaction: (data) => {
        const tx: PaymentTransaction = {
          id: generateId(),
          ...data,
          created_at: new Date().toISOString(),
        };
        set({ transactions: [...get().transactions, tx] });
        return tx;
      },
      updateTransaction: (id, updates) => {
        set({
          transactions: get().transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
      },
      deleteTransaction: (id) => {
        set({ transactions: get().transactions.filter((t) => t.id !== id) });
      },
      matchToInvoice: (transactionId, invoiceId) => {
        set({
          transactions: get().transactions.map((t) =>
            t.id === transactionId ? { ...t, invoiceId, matched: true } : t
          ),
        });
      },
      unmatch: (transactionId) => {
        set({
          transactions: get().transactions.map((t) =>
            t.id === transactionId ? { ...t, invoiceId: undefined, matched: false } : t
          ),
        });
      },
    }),
    { name: "invoicy-payments" }
  )
);
