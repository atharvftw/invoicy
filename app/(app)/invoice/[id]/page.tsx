"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3 } from "lucide-react";
import { useInvoiceStore } from "@/store/invoiceStore";
import { Invoice } from "@/types/invoice";
import InvoicePreview from "@/components/InvoicePreview/InvoicePreview";
import PDFDownloadButton from "@/components/InvoicePreview/PDFDownloadButton";

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const { invoices, loadInvoice } = useInvoiceStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const id = params.id as string;
    const found = invoices.find((i) => i.id === id);
    if (found) {
      setInvoice(found);
    }
  }, [params.id, invoices]);

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Invoice not found
      </div>
    );
  }

  function handleEdit() {
    if (invoice) {
      loadInvoice(invoice.id);
      router.push("/invoice/new");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Invoice #{invoice.invoice_number}
            </h1>
            <p className="text-xs text-gray-400">View only</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100
              hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
          >
            <Edit3 size={14} />
            Edit
          </button>
          <PDFDownloadButton invoice={invoice} />
        </div>
      </div>

      <InvoicePreview invoice={invoice} />
    </div>
  );
}
