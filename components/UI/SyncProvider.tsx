"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useInvoiceStore } from "@/store/invoiceStore";

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const fetchFromServer = useInvoiceStore((s) => s.fetchFromServer);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchFromServer();
    }
  }, [isLoaded, isSignedIn, fetchFromServer]);

  return <>{children}</>;
}
