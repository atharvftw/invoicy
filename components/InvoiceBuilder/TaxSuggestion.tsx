"use client";

import { useState, useCallback } from "react";
import { Sparkles, Check, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaxSuggestionProps {
  description: string;
  onApply: (rate: number) => void;
}

export default function TaxSuggestion({ description, onApply }: TaxSuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    gstRate: number;
    hsnCode: string | null;
    sacCode: string | null;
    category: string;
    confidence: "high" | "medium" | "low";
    reason: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestion = useCallback(async () => {
    if (!description || description.length < 3) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tax-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSuggestion(data.data);
      } else {
        setError(data.error || "No suggestion found");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [description]);

  if (!description || description.length < 3) return null;

  if (suggestion) {
    const confidenceColor =
      suggestion.confidence === "high"
        ? "text-green-600 bg-green-50 border-green-200"
        : suggestion.confidence === "medium"
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-gray-500 bg-gray-50 border-gray-200";

    return (
      <div className={cn("mt-1.5 p-2.5 rounded-lg border text-xs", confidenceColor)}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} />
            <span className="font-medium">
              {suggestion.gstRate}% GST · {suggestion.hsnCode || suggestion.sacCode || "N/A"}
            </span>
            <span className="text-[10px] opacity-70">({suggestion.confidence})</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onApply(suggestion.gstRate);
                setSuggestion(null);
              }}
              className="p-1 rounded hover:bg-white/60 transition-colors"
              title="Apply this rate"
            >
              <Check size={12} />
            </button>
            <button
              onClick={() => setSuggestion(null)}
              className="p-1 rounded hover:bg-white/60 transition-colors"
              title="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
        </div>
        <p className="opacity-80 mb-0.5">{suggestion.category}</p>
        <p className="opacity-60 text-[10px]">{suggestion.reason}</p>
      </div>
    );
  }

  return (
    <div className="mt-1.5">
      {error ? (
        <div className="flex items-center gap-1.5 text-[11px] text-red-500">
          <AlertCircle size={11} />
          {error}
        </div>
      ) : (
        <button
          onClick={fetchSuggestion}
          disabled={loading}
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-medium transition-colors",
            loading ? "text-indigo-300" : "text-indigo-500 hover:text-indigo-700"
          )}
        >
          {loading ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Sparkles size={11} />
          )}
          {loading ? "Analyzing…" : "Suggest GST rate"}
        </button>
      )}
    </div>
  );
}
