"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function UpgradeButton() {
  const { user } = useUser();
  const [showInput, setShowInput] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscription/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Invalid code");
        return;
      }
      await user?.reload();
      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showInput) {
    return (
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Enter coupon code"
            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50"
            autoFocus
          />
          <button
            onClick={handleApply}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold transition-colors"
          >
            {loading ? "…" : "Apply"}
          </button>
        </div>
        {error && <p className="text-[10px] text-red-500">{error}</p>}
        <button
          onClick={() => { setShowInput(false); setError(""); setCode(""); }}
          className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
    >
      <span>⚡</span>
      <span>Upgrade to Premium</span>
    </button>
  );
}
