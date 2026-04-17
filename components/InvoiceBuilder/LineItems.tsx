"use client";

import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Invoice, LineItem, CURRENCY_SYMBOLS } from "@/types/invoice";

interface Props {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
}

export default function LineItems({ invoice, onChange }: Props) {
  const symbol = CURRENCY_SYMBOLS[invoice.currency];

  function addItem() {
    const newItem: LineItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    onChange({ items: [...invoice.items, newItem] });
  }

  function removeItem(id: string) {
    if (invoice.items.length === 1) return;
    onChange({ items: invoice.items.filter((item) => item.id !== id) });
  }

  function updateItem(id: string, field: keyof LineItem, raw: string) {
    const updated = invoice.items.map((item) => {
      if (item.id !== id) return item;
      const value = field === "name" ? raw : (parseInt(raw, 10) || 0);
      const next = { ...item, [field]: value };
      if (field === "quantity" || field === "rate") {
        next.amount = (next.quantity as number) * (next.rate as number);
      }
      return next;
    });
    onChange({ items: updated });
  }

  return (
    <div className="section-card">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Line Items
      </h3>

      <div className="w-full overflow-x-auto">
        <table className="items-table w-full text-sm min-w-[420px]" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col />
            <col style={{ width: 68 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 32 }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left pb-2 pr-2">Item / Description</th>
              <th className="text-right pb-2 px-2">Qty</th>
              <th className="text-right pb-2 px-2">Rate ({symbol})</th>
              <th className="text-right pb-2 pl-2">Amount ({symbol})</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoice.items.map((item) => (
              <tr key={item.id} className="group">
                <td className="pr-2 py-2">
                  <input
                    className="input-base text-sm"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, "name", e.target.value)}
                    placeholder="Design services, consulting..."
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className="input-base text-sm text-center"
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className="input-base text-sm text-right"
                    type="number"
                    min="0"
                    step="1"
                    value={item.rate || ""}
                    onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                    placeholder="0"
                  />
                </td>
                <td className="pl-2 py-2">
                  <div className="input-base text-right text-gray-700 font-medium bg-gray-50 select-none tabular-nums">
                    {item.amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </td>
                <td className="pl-1 py-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50
                      transition-colors opacity-0 group-hover:opacity-100"
                    disabled={invoice.items.length === 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addItem}
        className="mt-3 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800
          font-medium transition-colors px-1 py-1.5 rounded-lg hover:bg-indigo-50"
      >
        <Plus size={15} strokeWidth={2.5} />
        Add Line Item
      </button>
    </div>
  );
}
