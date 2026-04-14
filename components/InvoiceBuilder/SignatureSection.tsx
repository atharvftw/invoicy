"use client";

import { useRef, useState } from "react";
import { useInvoiceStore } from "@/store/invoiceStore";

const MAX_SIZE_BYTES = 200 * 1024; // 200 KB

export default function SignatureSection() {
  const { currentInvoice, updateCurrentInvoice } = useInvoiceStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be 200 KB or smaller.");
      e.target.value = "";
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      updateCurrentInvoice({ signature: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  function handleClear() {
    updateCurrentInvoice({ signature: "" });
    if (inputRef.current) inputRef.current.value = "";
    setError("");
  }

  return (
    <div className="section-card space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Signature
      </h3>

      <div className="flex flex-col gap-3">
        {currentInvoice.signature ? (
          <div className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentInvoice.signature}
              alt="Signature preview"
              style={{ maxWidth: 160 }}
              className="rounded border border-gray-100 bg-gray-50 object-contain"
            />
            <button
              onClick={handleClear}
              className="self-start text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="self-start px-4 py-2 rounded-lg text-sm font-medium border border-gray-200
                bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600
                hover:bg-indigo-50 transition-all"
            >
              Upload Signature
            </button>
            <p className="text-xs text-gray-400">PNG, JPG, SVG — max 200 KB</p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
