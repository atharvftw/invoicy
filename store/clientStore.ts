"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Client } from "@/types/invoice";

interface ClientStore {
  clients: Client[];
  fetchClients: () => Promise<void>;
  saveClient: (client: Omit<Client, "id" | "created_at">) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
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
      saveClient: async (data) => {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const client: Client = await res.json();
        set({ clients: [...get().clients, client] });
        return client;
      },
      deleteClient: async (id) => {
        set({ clients: get().clients.filter((c) => c.id !== id) });
        await fetch(`/api/clients/${id}`, { method: "DELETE" }).catch(() => {});
      },
    }),
    { name: "invoicy-clients" }
  )
);
