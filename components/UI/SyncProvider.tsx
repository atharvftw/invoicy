"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useInvoiceStore } from "@/store/invoiceStore";
import { useClientStore } from "@/store/clientStore";

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const fetchFromServer = useInvoiceStore((s) => s.fetchFromServer);
  const fetchClients = useClientStore((s) => s.fetchClients);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchFromServer();
      fetchClients();
    }
  }, [isLoaded, isSignedIn, fetchFromServer, fetchClients]);

  return <>{children}</>;
}
