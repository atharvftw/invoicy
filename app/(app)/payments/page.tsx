"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Link2,
  Unlink,
  Trash2,
  Download,
  X,
  IndianRupee,
} from "lucide-react";
import { usePaymentStore } from "@/store/paymentStore";
import { useInvoiceStore } from "@/store/invoiceStore";
import { PaymentTransaction, CURRENCY_SYMBOLS } from "@/types/invoice";
import { cn } from "@/lib/utils";

const METHOD_LABELS: Record<PaymentTransaction["method"], string> = {
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  card: "Card",
  other: "Other",
};

export default function PaymentsPage() {
  const router = useRouter();
  const { transactions, addTransaction, deleteTransaction, matchToInvoice, unmatch } = usePaymentStore();
  const { invoices } = useInvoiceStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [matchModal, setMatchModal] = useState<string | null>(null);
  const [form, setForm] = useState({
    clientName: "",
    amount: "",
    method: "upi" as PaymentTransaction["method"],
    reference: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter(
      (t) =>
        !q ||
        t.clientName.toLowerCase().includes(q) ||
        t.reference?.toLowerCase().includes(q) ||
        METHOD_LABELS[t.method].toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const totalReceived = transactions.reduce((sum, t) => sum + t.amount, 0);
  const matchedCount = transactions.filter((t) => t.matched).length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName.trim() || !form.amount) return;
    addTransaction({
      clientName: form.clientName,
      amount: Number(form.amount),
      currency: "INR",
      method: form.method,
      reference: form.reference || undefined,
      date: form.date,
      matched: false,
      notes: form.notes || undefined,
    });
    setForm({ clientName: "", amount: "", method: "upi", reference: "", date: new Date().toISOString().split("T")[0], notes: "" });
    setModalOpen(false);
  }

  function exportCSV() {
    const rows = [
      ["Date", "Client", "Amount", "Currency", "Method", "Reference", "Matched", "Notes"],
      ...transactions.map((t) => [
        t.date,
        t.clientName,
        String(t.amount),
        t.currency,
        METHOD_LABELS[t.method],
        t.reference || "",
        t.matched ? "Yes" : "No",
        t.notes || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Payment Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">{transactions.length} transactions · ₹{totalReceived.toLocaleString("en-IN", { minimumFractionDigits: 0 })} received</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
            <Plus size={15} /> Add Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="section-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <IndianRupee size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Received</p>
              <p className="text-sm font-bold text-gray-900">₹{totalReceived.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="section-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Matched</p>
              <p className="text-sm font-bold text-gray-900">{matchedCount} / {transactions.length}</p>
            </div>
          </div>
          <div className="section-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <CreditCard size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Match</p>
              <p className="text-sm font-bold text-gray-900">{transactions.length - matchedCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative w-full sm:max-w-xs mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payments…" className="input-base pl-9" />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState hasPayments={transactions.length > 0} onAdd={() => setModalOpen(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-card overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Client</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Method</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Amount</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-700">{t.date}</p>
                    {t.reference && <p className="text-[11px] text-gray-400 font-mono">{t.reference}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-gray-800">{t.clientName}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="badge bg-gray-100 text-gray-600 text-[10px]">{METHOD_LABELS[t.method]}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{CURRENCY_SYMBOLS[t.currency]}{t.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {t.matched ? (
                      <span className="badge bg-green-100 text-green-700 text-[10px] flex items-center gap-1 justify-center">
                        <CheckCircle2 size={10} /> Matched
                      </span>
                    ) : (
                      <span className="badge bg-amber-100 text-amber-700 text-[10px]">Unmatched</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-all">
                      {t.matched ? (
                        <button onClick={() => unmatch(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Unmatch">
                          <Unlink size={14} />
                        </button>
                      ) : (
                        <button onClick={() => setMatchModal(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Match to invoice">
                          <Link2 size={14} />
                        </button>
                      )}
                      <button onClick={() => { if (confirm("Delete this transaction?")) deleteTransaction(t.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Record Payment</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
              <div>
                <label className="label-base">Client Name *</label>
                <input required className="input-base" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Who paid?" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Amount (₹) *</label>
                  <input required type="number" min={0} step={0.01} className="input-base" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <label className="label-base">Method</label>
                  <select className="input-base" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as PaymentTransaction["method"] })}>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Date *</label>
                  <input required type="date" className="input-base" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="label-base">Reference</label>
                  <input className="input-base" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="UTR / Txn ID" />
                </div>
              </div>
              <div>
                <label className="label-base">Notes</label>
                <textarea className="input-base min-h-[60px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes…" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match Modal */}
      {matchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Match to Invoice</h3>
              <button onClick={() => setMatchModal(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="px-5 py-3 space-y-2">
              {invoices.filter((i) => i.status !== "paid").length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No unpaid invoices to match.</p>
              ) : (
                invoices
                  .filter((i) => i.status !== "paid")
                  .map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => {
                        matchToInvoice(matchModal, inv.id);
                        setMatchModal(null);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{inv.invoice_number || "Draft"}</p>
                        <p className="text-xs text-gray-400">{inv.bill_to.name || "—"}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 tabular-nums">
                        {CURRENCY_SYMBOLS[inv.currency]}{inv.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasPayments, onAdd }: { hasPayments: boolean; onAdd: () => void }) {
  return (
    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-card">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
        <CreditCard size={28} className="text-indigo-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{hasPayments ? "No matching payments" : "No payments recorded"}</h3>
      <p className="text-sm text-gray-400 mb-5">{hasPayments ? "Try adjusting your search" : "Record your first payment to start tracking"}</p>
      {!hasPayments && (
        <button onClick={onAdd} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Record Payment</button>
      )}
    </div>
  );
}
