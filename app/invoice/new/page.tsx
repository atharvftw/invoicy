"use client";

import { useCallback, useRef, useState } from "react";
import { Save, CheckCircle, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useInvoiceStore } from "@/store/invoiceStore";
import { useUIStore } from "@/store/uiStore";
import { Invoice } from "@/types/invoice";
import HeaderSection from "@/components/InvoiceBuilder/HeaderSection";
import PartySection from "@/components/InvoiceBuilder/PartySection";
import LineItems from "@/components/InvoiceBuilder/LineItems";
import Financials from "@/components/InvoiceBuilder/Financials";
import NotesSection from "@/components/InvoiceBuilder/NotesSection";
import InvoicePreview from "@/components/InvoicePreview/InvoicePreview";
import PDFDownloadButton from "@/components/InvoicePreview/PDFDownloadButton";
import GmailButton from "@/components/InvoicePreview/GmailButton";

const PREVIEW_WIDTH = 560;

export default function NewInvoicePage() {
  const { currentInvoice, updateCurrentInvoice, saveCurrentInvoice } = useInvoiceStore();
  const { previewOpen, togglePreview } = useUIStore();
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const onChange = useCallback(
    (updates: Partial<Invoice>) => {
      updateCurrentInvoice(updates);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        useInvoiceStore.getState().saveCurrentInvoice();
      }, 800);
    },
    [updateCurrentInvoice]
  );

  function handleSave() {
    saveCurrentInvoice();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex h-full">
      {/* LEFT: Form */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Invoice Builder</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              #{currentInvoice.invoice_number || "—"} · Auto-saved
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Preview toggle */}
            <button
              onClick={togglePreview}
              className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title={previewOpen ? "Hide preview" : "Show preview"}
            >
              {previewOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                saved
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {saved ? <CheckCircle size={14} /> : <Save size={14} />}
              {saved ? "Saved!" : "Save"}
            </button>
            <GmailButton invoice={currentInvoice} />
            <PDFDownloadButton invoice={currentInvoice} />
          </div>
        </div>

        {/* Form sections */}
        <div className="px-6 py-5 space-y-4 max-w-2xl">
          <HeaderSection invoice={currentInvoice} onChange={onChange} />
          <PartySection invoice={currentInvoice} onChange={onChange} />
          <LineItems invoice={currentInvoice} onChange={onChange} />
          <Financials invoice={currentInvoice} onChange={onChange} />
          <NotesSection invoice={currentInvoice} onChange={onChange} />
          <div className="pb-8" />
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      {previewOpen && (
        <div
          className="hidden lg:flex flex-col border-l border-gray-100 bg-gray-50/80 overflow-y-auto shrink-0"
          style={{ width: PREVIEW_WIDTH }}
        >
          <div className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-sm border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Preview
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Live
              </span>
              <button
                onClick={togglePreview}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                title="Hide preview"
              >
                <PanelRightClose size={14} />
              </button>
            </div>
          </div>

          <div className="p-5">
            <InvoicePreview invoice={currentInvoice} />
          </div>
        </div>
      )}
    </div>
  );
}
