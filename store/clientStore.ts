"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/uuid";
import { Client } from "@/types/invoice";

interface ClientStore {
  clients: Client[];
  fetchClients: () => Promise<void>;
  addClient: (data: Omit<Client, "id" | "created_at" | "updated_at">) => Client;
  updateClient: (id: string, updates: Partial<Omit<Client, "id">>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],
      fetchClients: async () => {
        try {
          const res = await fetch("/api/clients");
          if (!res.ok) return;
          const clients: Client[] = await res.json();
          set({ clients });
        } catch {}
      },
      addClient: (data) => {
        const now = new Date().toISOString();
        const client: Client = {
          id: generateId(),
          ...data,
          created_at: now,
          updated_at: now,
        };
        set({ clients: [...get().clients, client] });
        // Fire-and-forget sync
        fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(client),
        }).catch(() => {});
        return client;
      },
      updateClient: (id, updates) => {
        const now = new Date().toISOString();
        const updated = get().clients.map((c) =>
          c.id === id ? { ...c, ...updates, updated_at: now } : c
        );
        set({ clients: updated });
        const client = updated.find((c) => c.id === id);
        if (client) {
          fetch("/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(client),
          }).catch(() => {});
        }
      },
      deleteClient: (id) => {
        set({ clients: get().clients.filter((c) => c.id !== id) });
        fetch(`/api/clients/${id}`, { method: "DELETE" }).catch(() => {});
      },
      getClient: (id) => get().clients.find((c) => c.id === id),
    }),
    { name: "invoicy-clients" }
  )
);
