"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";

export default function UpgradeButton() {
  const { user } = useUser();
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
      // Fire confetti then reload
      confetti({ particleCount: 180, spread: 120, origin: { y: 0.5 }, colors: ["#4f46e5", "#818cf8", "#a5b4fc", "#ffffff", "#fbbf24"] });
      confetti({ particleCount: 80, angle: 60, spread: 80, origin: { x: 0, y: 0.6 } });
      confetti({ particleCount: 80, angle: 120, spread: 80, origin: { x: 1, y: 0.6 } });
      await user?.reload();
      setTimeout(() => window.location.reload(), 2200);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Coupon code"
          className="min-w-0 flex-1 text-[11px] px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="shrink-0 text-[11px] px-2.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition-colors"
        >
          {loading ? "…" : "Apply"}
        </button>
      </div>
      {error && <p className="text-[10px] text-red-500 leading-tight">{error}</p>}
    </div>
  );
}
