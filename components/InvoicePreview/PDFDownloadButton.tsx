"use client";

import { useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { Invoice } from "@/types/invoice";

interface Props {
  invoice: Invoice;
}

export default function PDFDownloadButton({ invoice }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    setLoading(true);
    try {
      // Generate QR data URL if needed
      let qrDataUrl: string | undefined;
      if (invoice.payment_qr) {
        const QRCode = (await import("qrcode")).default;
        qrDataUrl = await QRCode.toDataURL(invoice.payment_qr, {
          width: 144,
          margin: 1,
        });
      }

      // Dynamic import to avoid SSR issues
      const { pdf } = await import("@react-pdf/renderer");
      const { default: PDFDocument } = await import("./PDFDocument");
      const { createElement } = await import("react");

      // Cast to satisfy @react-pdf/renderer's strict DocumentProps typing
      const doc = createElement(PDFDocument as any, { invoice, qrDataUrl }); // eslint-disable-line
      const blob = await pdf(doc as any).toBlob(); // eslint-disable-line

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${invoice.invoice_number || "draft"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setLoading(false);
    }
  }, [invoice]);

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg
        bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
        text-white text-sm font-semibold shadow-sm
        transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Download size={15} />
      )}
      {loading ? "Generating…" : "Download PDF"}
    </button>
  );
}
