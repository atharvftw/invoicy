"use client";

import { useState, useCallback } from "react";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    animation?: boolean;
  };
  theme?: {
    color?: string;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open(): void;
      close(): void;
    };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  const openCheckout = useCallback(
    async (options: {
      key: string;
      amount: number;
      currency: string;
      orderId: string;
      name: string;
      description: string;
      prefill?: { name?: string; email?: string; contact?: string };
      onSuccess: (response: RazorpayResponse) => void;
      onDismiss?: () => void;
    }) => {
      await loadRazorpayScript();
      if (!window.Razorpay) throw new Error("Razorpay not available");

      const rzp = new window.Razorpay({
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        order_id: options.orderId,
        name: options.name,
        description: options.description,
        prefill: options.prefill,
        handler: options.onSuccess,
        modal: {
          ondismiss: options.onDismiss,
        },
        theme: {
          color: "#6366F1",
        },
      });

      rzp.open();
    },
    []
  );

  async function createOrder(planId: "pro" | "enterprise", billing: "monthly" | "yearly") {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billing }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create order");
      return data as {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };
    } finally {
      setLoading(false);
    }
  }

  async function verifyPayment(response: RazorpayResponse) {
    const res = await fetch("/api/razorpay/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });
    const data = await res.json();
    return data as { success?: boolean; error?: string };
  }

  return { openCheckout, createOrder, verifyPayment, loading };
}
