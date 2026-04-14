"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function UpgradeButton() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load payment. Check your connection.");
        return;
      }

      const res = await fetch("/api/subscription/create-order", { method: "POST" });
      if (!res.ok) throw new Error("Order creation failed");
      const { orderId, amount, currency } = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Invoicy",
        description: "InvoicyPremium — Remove watermark & unlock recurring invoices",
        order_id: orderId,
        prefill: {
          name: user?.fullName ?? "",
          email: user?.primaryEmailAddress?.emailAddress ?? "",
        },
        theme: { color: "#4f46e5" },
        handler: () => {
          // Reload to reflect updated Clerk metadata
          window.location.reload();
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
    >
      {loading ? (
        <span className="animate-pulse">Processing…</span>
      ) : (
        <>
          <span>⚡</span>
          <span>Upgrade to Premium — ₹299/mo</span>
        </>
      )}
    </button>
  );
}
