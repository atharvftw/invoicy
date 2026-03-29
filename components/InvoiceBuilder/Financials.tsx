"use client";

import { X } from "lucide-react";
import { Invoice, CURRENCY_SYMBOLS } from "@/types/invoice";

interface Props {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
}

export default function Financials({ invoice, onChange }: Props) {
  const symbol = CURRENCY_SYMBOLS[invoice.currency];

  const discountAmount = invoice.subtotal * (invoice.discount / 100);
  const afterDiscount = invoice.subtotal - discountAmount;
  const taxAmount = afterDiscount * (invoice.tax / 100);

  const showDiscount = invoice.discount > 0;
  const showTax = invoice.tax > 0;
  const showShipping = invoice.shipping > 0;

  return (
    <div className="section-card">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Totals
      </h3>

      <div className="flex flex-col gap-2 max-w-sm ml-auto">

        {/* Subtotal */}
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-500">Subtotal</span>
          <span className="text-sm font-medium text-gray-800 tabular-nums">
            {symbol}{invoice.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Discount row */}
        {showDiscount ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-20 shrink-0">Discount</span>
            <div className="flex items-center gap-1 flex-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={invoice.discount}
                onChange={(e) => onChange({ discount: parseFloat(e.target.value) || 0 })}
                className="input-base text-sm text-right"
                autoFocus
              />
              <span className="text-gray-400 text-sm shrink-0">%</span>
            </div>
            {discountAmount > 0 && (
              <span className="text-sm text-red-500 tabular-nums shrink-0 w-24 text-right">
                −{symbol}{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            )}
            <button
              onClick={() => onChange({ discount: 0 })}
              className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ) : null}

        {/* Tax row */}
        {showTax ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-20 shrink-0">Tax / GST</span>
            <div className="flex items-center gap-1 flex-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={invoice.tax}
                onChange={(e) => onChange({ tax: parseFloat(e.target.value) || 0 })}
                className="input-base text-sm text-right"
                autoFocus
              />
              <span className="text-gray-400 text-sm shrink-0">%</span>
            </div>
            {taxAmount > 0 && (
              <span className="text-sm text-gray-700 tabular-nums shrink-0 w-24 text-right">
                +{symbol}{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            )}
            <button
              onClick={() => onChange({ tax: 0 })}
              className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ) : null}

        {/* Shipping row */}
        {showShipping ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-20 shrink-0">Shipping</span>
            <div className="flex items-center gap-1 flex-1">
              <span className="text-gray-400 text-sm shrink-0">{symbol}</span>
              <input
                type="number"
                min="0"
                step="1"
                value={invoice.shipping}
                onChange={(e) => onChange({ shipping: parseFloat(e.target.value) || 0 })}
                className="input-base text-sm text-right"
                autoFocus
              />
            </div>
            <button
              onClick={() => onChange({ shipping: 0 })}
              className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ) : null}

        {/* Toggle buttons: + Discount  + Tax  + Shipping */}
        {(!showDiscount || !showTax || !showShipping) && (
          <div className="flex items-center gap-2 py-1 flex-wrap">
            {!showDiscount && (
              <button
                onClick={() => onChange({ discount: 0.01 })}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium
                  px-2.5 py-1 rounded-full border border-indigo-200 hover:border-indigo-400
                  bg-indigo-50 hover:bg-indigo-100 transition-all"
              >
                + Discount
              </button>
            )}
            {!showTax && (
              <button
                onClick={() => onChange({ tax: 0.01 })}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium
                  px-2.5 py-1 rounded-full border border-indigo-200 hover:border-indigo-400
                  bg-indigo-50 hover:bg-indigo-100 transition-all"
              >
                + Tax / GST
              </button>
            )}
            {!showShipping && (
              <button
                onClick={() => onChange({ shipping: 0.01 })}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium
                  px-2.5 py-1 rounded-full border border-indigo-200 hover:border-indigo-400
                  bg-indigo-50 hover:bg-indigo-100 transition-all"
              >
                + Shipping
              </button>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-2 mt-1 space-y-2">
          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900 tabular-nums">
              {symbol}{invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Amount Paid */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 shrink-0">Amount Paid</span>
            <div className="flex items-center gap-1 flex-1 justify-end">
              <span className="text-gray-400 text-sm">{symbol}</span>
              <input
                type="number"
                min="0"
                step="1"
                value={invoice.amount_paid || ""}
                onChange={(e) => onChange({ amount_paid: parseFloat(e.target.value) || 0 })}
                className="input-base text-sm text-right w-32"
                placeholder="0"
              />
            </div>
          </div>

          {/* Balance Due */}
          <div className="flex justify-between items-center pt-1 border-t border-gray-200">
            <span className="text-sm font-bold text-gray-900">Balance Due</span>
            <span className="text-base font-bold text-indigo-700 tabular-nums">
              {symbol}{invoice.balance_due.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-400">Status:</span>
          <div className="flex gap-1.5 flex-wrap">
            {(["draft", "sent", "partially_paid", "paid"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onChange({ status: s })}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                  invoice.status === s
                    ? s === "draft" ? "bg-gray-200 text-gray-700"
                      : s === "sent" ? "bg-blue-100 text-blue-700"
                      : s === "paid" ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                {s === "partially_paid" ? "Partial" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
