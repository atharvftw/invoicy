"use client";

import { useMemo } from "react";
import { useInvoiceStore } from "@/store/invoiceStore";
import { usePaymentStore } from "@/store/paymentStore";
import { useClientStore } from "@/store/clientStore";
import { computeClientIntelligence, ClientIntelligence } from "@/lib/clientIntelligence";
import { Client } from "@/types/invoice";

export function useClientIntelligence(clientId?: string): {
  client?: Client;
  intelligence?: ClientIntelligence;
  allIntelligence: { client: Client; intelligence: ClientIntelligence }[];
} {
  const { clients } = useClientStore();
  const { invoices } = useInvoiceStore();
  const { transactions: payments } = usePaymentStore();

  const allIntelligence = useMemo(() => {
    return clients.map((client) => ({
      client,
      intelligence: computeClientIntelligence(client, invoices, payments),
    }));
  }, [clients, invoices, payments]);

  const result = useMemo(() => {
    if (!clientId) return { allIntelligence };
    const entry = allIntelligence.find((e) => e.client.id === clientId);
    return {
      client: entry?.client,
      intelligence: entry?.intelligence,
      allIntelligence,
    };
  }, [allIntelligence, clientId]);

  return result;
}
