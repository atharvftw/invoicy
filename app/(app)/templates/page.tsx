"use client";

import { useState } from "react";
import { Palette, Lock, Plus, X, Save } from "lucide-react";
import { useInvoiceStore } from "@/store/invoiceStore";
import { InvoiceTheme } from "@/types/invoice";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";

const THEMES: { id: InvoiceTheme; label: string; color: string; desc: string }[] = [
  { id: "classic", label: "Classic", color: "#2d2d2d", desc: "Timeless dark header" },
  { id: "minimal", label: "Minimal", color: "#6b7280", desc: "Clean and understated" },
  { id: "modern", label: "Modern", color: "#4f46e5", desc: "Indigo accent" },
  { id: "corporate", label: "Corporate", color: "#0f4c81", desc: "Professional blue" },
  { id: "retro", label: "Retro", color: "#92400e", desc: "Warm vintage tones" },
];

export default function TemplatesPage() {
  const { currentInvoice, updateCurrentInvoice } = useInvoiceStore();
  const { isPremium } = usePlan();
  const [savedItems, setSavedItems] = useState<{ name: string; rate: number }[]>([]);
  const [itemForm, setItemForm] = useState({ name: "", rate: "" });
  const [termsPreset, setTermsPreset] = useState("Net 30");

  const activeTheme = currentInvoice.theme;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Templates</h1>
        <p className="text-sm text-gray-500 mt-1">Customize invoice styling and reusable assets.</p>
      </div>

      {/* Invoice Themes */}
      <div className="section-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Invoice Themes</h3>
          {!isPremium && (
            <span className="badge bg-indigo-50 text-indigo-700 text-[10px]">Premium unlocks all themes</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const locked = !isPremium && t.id !== "classic";
            return (
              <button
                key={t.id}
                onClick={() => !locked && updateCurrentInvoice({ theme: t.id })}
                disabled={locked}
                className={cn(
                  "relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left",
                  activeTheme === t.id
                    ? "border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200"
                    : "border-gray-100 bg-white hover:border-gray-200",
                  locked && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="w-6 h-6 rounded-md shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="text-sm font-medium text-gray-800">{t.label}</span>
                  {locked && <Lock size={12} className="text-gray-400 ml-auto" />}
                </div>
                <p className="text-xs text-gray-400">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reusable Line Items */}
      <div className="section-card mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Reusable Line Items</h3>
        <div className="space-y-2 mb-4">
          {savedItems.length === 0 ? (
            <p className="text-sm text-gray-400">No saved items yet.</p>
          ) : (
            savedItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-sm font-medium text-gray-900">₹{item.rate.toLocaleString("en-IN")}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="input-base flex-1 text-sm"
            placeholder="Item name"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
          />
          <input
            className="input-base w-28 text-sm"
            type="number"
            placeholder="Rate"
            value={itemForm.rate}
            onChange={(e) => setItemForm({ ...itemForm, rate: e.target.value })}
          />
          <button
            onClick={() => {
              if (!itemForm.name || !itemForm.rate) return;
              setSavedItems([...savedItems, { name: itemForm.name, rate: Number(itemForm.rate) }]);
              setItemForm({ name: "", rate: "" });
            }}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Preset Terms */}
      <div className="section-card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Preset Payment Terms</h3>
        <div className="flex items-center gap-2">
          <input
            className="input-base flex-1 text-sm"
            value={termsPreset}
            onChange={(e) => setTermsPreset(e.target.value)}
          />
          <button
            onClick={() => updateCurrentInvoice({ payment_terms: termsPreset })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
          >
            <Save size={13} /> Apply
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Sets the default payment terms for new invoices.</p>
      </div>
    </div>
  );
}
