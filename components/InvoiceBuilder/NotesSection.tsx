"use client";

import { v4 as uuidv4 } from "uuid";
import { Invoice, CustomSection } from "@/types/invoice";
import { Input } from "@/components/UI/Input";
import { QrCode, Plus, X } from "lucide-react";

interface Props {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
}

function EditableSection({
  label,
  value,
  labelPlaceholder,
  contentPlaceholder,
  onLabelChange,
  onValueChange,
  onRemove,
}: {
  label: string;
  value: string;
  labelPlaceholder?: string;
  contentPlaceholder?: string;
  onLabelChange: (v: string) => void;
  onValueChange: (v: string) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 group/section">
      <div className="flex items-center gap-1">
        <input
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          className="text-xs font-semibold text-gray-600 bg-transparent border-none outline-none
            flex-1 hover:text-indigo-600 focus:text-indigo-600 transition-colors cursor-text
            placeholder:text-gray-300"
          placeholder={labelPlaceholder || "Section title..."}
        />
        {onRemove && (
          <button
            onClick={onRemove}
            className="opacity-0 group-hover/section:opacity-100 p-0.5 rounded text-gray-300
              hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
          >
            <X size={12} />
          </button>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={contentPlaceholder || "Add content..."}
        rows={3}
        className="input-base resize-none text-sm"
      />
    </div>
  );
}

export default function NotesSection({ invoice, onChange }: Props) {
  const sections = invoice.custom_sections ?? [];

  function addSection() {
    const newSection: CustomSection = { id: uuidv4(), label: "", content: "" };
    onChange({ custom_sections: [...sections, newSection] });
  }

  function updateSection(id: string, field: "label" | "content", value: string) {
    onChange({
      custom_sections: sections.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  }

  function removeSection(id: string) {
    onChange({ custom_sections: sections.filter((s) => s.id !== id) });
  }

  return (
    <div className="section-card space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Notes, Terms & Payment
      </h3>

      {/* Fixed Notes + Terms side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EditableSection
          label={invoice.notes_label}
          value={invoice.notes}
          labelPlaceholder="Notes"
          contentPlaceholder="Thank you for your business! Payment is appreciated within the due date."
          onLabelChange={(v) => onChange({ notes_label: v })}
          onValueChange={(v) => onChange({ notes: v })}
        />
        <EditableSection
          label={invoice.terms_label}
          value={invoice.terms}
          labelPlaceholder="Terms"
          contentPlaceholder="Late fee of 1.5% per month applies after due date."
          onLabelChange={(v) => onChange({ terms_label: v })}
          onValueChange={(v) => onChange({ terms: v })}
        />
      </div>

      {/* Custom sections */}
      {sections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-gray-100">
          {sections.map((section) => (
            <EditableSection
              key={section.id}
              label={section.label}
              value={section.content}
              labelPlaceholder="e.g. Bank Details, IFSC Code..."
              contentPlaceholder="Add details here..."
              onLabelChange={(v) => updateSection(section.id, "label", v)}
              onValueChange={(v) => updateSection(section.id, "content", v)}
              onRemove={() => removeSection(section.id)}
            />
          ))}
        </div>
      )}

      {/* Add section button */}
      <button
        onClick={addSection}
        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800
          font-medium transition-colors px-1 py-1 rounded-lg hover:bg-indigo-50"
      >
        <Plus size={14} strokeWidth={2.5} />
        Add Section
      </button>

      {/* QR Payment */}
      <div className="pt-1 border-t border-gray-100">
        <label className="label-base flex items-center gap-1.5">
          <QrCode size={12} />
          Payment QR (UPI ID or URL)
        </label>
        <Input
          value={invoice.payment_qr || ""}
          onChange={(e) => onChange({ payment_qr: e.target.value })}
          placeholder="yourname@upi  or  https://pay.stripe.com/..."
        />
        {invoice.payment_qr && (
          <p className="mt-1.5 text-xs text-indigo-600">
            ✓ QR code will appear in your invoice preview
          </p>
        )}
      </div>

      {/* Theme */}
      <div>
        <label className="label-base">Invoice Theme</label>
        <div className="flex gap-2">
          {(["classic", "minimal"] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => onChange({ theme })}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                invoice.theme === theme
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
