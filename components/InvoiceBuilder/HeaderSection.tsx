"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Invoice, InvoiceTheme } from "@/types/invoice";
import { Input, Select } from "@/components/UI/Input";

const THEMES: { value: InvoiceTheme; label: string; accent: string }[] = [
  { value: "classic", label: "Classic", accent: "#2d2d2d" },
  { value: "minimal", label: "Minimal", accent: "#6b7280" },
  { value: "modern", label: "Modern", accent: "#4f46e5" },
  { value: "corporate", label: "Corporate", accent: "#0f4c81" },
  { value: "retro", label: "Retro", accent: "#92400e" },
];

const PAYMENT_TERMS = [
  { value: "Due on Receipt", label: "Due on Receipt" },
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 45", label: "Net 45" },
  { value: "Net 60", label: "Net 60" },
  { value: "Custom", label: "Custom" },
];

interface Props {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
}

export default function HeaderSection({ invoice, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange({ logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="section-card">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Invoice Details
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Logo Upload */}
        <div className="col-span-2">
          <label className="label-base">Logo</label>
          <div className="flex items-center gap-3">
            {invoice.logo ? (
              <div className="relative w-20 h-14 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={invoice.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                <button
                  onClick={() => onChange({ logo: "" })}
                  className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5 shadow-sm border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <X size={10} className="text-gray-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300
                  text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50
                  transition-all duration-150"
              >
                <Upload size={14} />
                Upload Logo
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
          <Input
            value={invoice.subtitle || ""}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Tagline or subtitle (optional)"
          />
        </div>

        <Input
          label="Invoice Number"
          value={invoice.invoice_number}
          onChange={(e) => onChange({ invoice_number: e.target.value })}
          placeholder="INV-001"
        />

        <Select
          label="Currency"
          value={invoice.currency}
          onChange={(e) => onChange({ currency: e.target.value as Invoice["currency"] })}
          options={[
            { value: "INR", label: "INR ₹" },
            { value: "USD", label: "USD $" },
            { value: "EUR", label: "EUR €" },
            { value: "GBP", label: "GBP £" },
          ]}
        />

        <Input
          label="Invoice Date"
          type="date"
          value={invoice.date}
          onChange={(e) => onChange({ date: e.target.value })}
        />

        <Input
          label="Due Date"
          type="date"
          value={invoice.due_date}
          onChange={(e) => onChange({ due_date: e.target.value })}
        />

        <Select
          label="Payment Terms"
          value={invoice.payment_terms}
          onChange={(e) => onChange({ payment_terms: e.target.value })}
          options={PAYMENT_TERMS}
        />

        <Input
          label="PO Number"
          value={invoice.po_number}
          onChange={(e) => onChange({ po_number: e.target.value })}
          placeholder="Optional"
        />

        {/* Theme Selector */}
        <div className="col-span-2">
          <label className="label-base">Invoice Theme</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => onChange({ theme: t.value })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  invoice.theme === t.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: t.accent }}
                />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
