"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreVertical,
  CheckCircle2,
  Copy,
  Trash2,
  Eye,
  Edit3,
  FileText,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import { useInvoiceStore } from "@/store/invoiceStore";
import {
  Invoice,
  InvoiceStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  CURRENCY_SYMBOLS,
} from "@/types/invoice";
import { formatDate, formatCurrency } from "@/lib/utils";

const ALL_STATUSES: InvoiceStatus[] = ["draft", "sent", "partially_paid", "paid"];

export default function HistoryPage() {
  const router = useRouter();
  const { invoices, deleteInvoice, duplicateInvoice, markAsPaid, loadInvoice } =
    useInvoiceStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Stats
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === "sent" || i.status === "partially_paid")
    .reduce((sum, i) => sum + i.balance_due, 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;

  // Filter
  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.bill_to.name.toLowerCase().includes(q) ||
      inv.from.name.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Sort newest first
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  function handleEdit(inv: Invoice) {
    loadInvoice(inv.id);
    router.push("/invoice/new");
  }

  function handleView(inv: Invoice) {
    loadInvoice(inv.id);
    router.push(`/invoice/${inv.id}`);
  }

  function handleDuplicate(id: string) {
    const newId = duplicateInvoice(id);
    if (newId) {
      loadInvoice(newId);
      router.push("/invoice/new");
    }
    setOpenMenu(null);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this invoice?")) {
      deleteInvoice(id);
    }
    setOpenMenu(null);
  }

  function handleMarkPaid(id: string) {
    markAsPaid(id);
    setOpenMenu(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 pt-14 lg:pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Invoice History</h1>
        <p className="text-sm text-gray-500 mt-1">
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Stats */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="section-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Received</p>
              <p className="text-sm font-bold text-gray-900">
                ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="section-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-sm font-bold text-gray-900">
                ₹{pendingAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="section-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Paid Invoices</p>
              <p className="text-sm font-bold text-gray-900">{paidCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices…"
            className="input-base pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <EmptyState hasInvoices={invoices.length > 0} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-card overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  Invoice
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  Client
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  Date
                </th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  Total
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  Status
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <FileText size={13} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {inv.invoice_number || "Draft"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {formatDate(inv.created_at.split("T")[0])}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-700 font-medium">
                      {inv.bill_to.name || "—"}
                    </p>
                    {inv.bill_to.email && (
                      <p className="text-xs text-gray-400">{inv.bill_to.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-600">{formatDate(inv.date)}</p>
                    {inv.due_date && (
                      <p className="text-xs text-gray-400">Due {formatDate(inv.due_date)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <p className="text-sm font-bold text-gray-900 tabular-nums">
                      {CURRENCY_SYMBOLS[inv.currency]}{inv.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    {inv.balance_due < inv.total && inv.balance_due > 0 && (
                      <p className="text-xs text-amber-600 tabular-nums">
                        {CURRENCY_SYMBOLS[inv.currency]}{inv.balance_due.toLocaleString("en-IN", { minimumFractionDigits: 2 })} due
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`badge ${STATUS_COLORS[inv.status]}`}>
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === inv.id ? null : inv.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100
                        opacity-60 sm:opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {openMenu === inv.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenu(null)}
                        />
                        <div className="absolute right-2 top-full mt-1 z-20 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 min-w-[160px] animate-fade-up">
                          <MenuButton
                            icon={<Edit3 size={13} />}
                            label="Edit"
                            onClick={() => { handleEdit(inv); setOpenMenu(null); }}
                          />
                          {inv.status !== "paid" && (
                            <MenuButton
                              icon={<CheckCircle2 size={13} />}
                              label="Mark as Paid"
                              onClick={() => handleMarkPaid(inv.id)}
                              className="text-green-600"
                            />
                          )}
                          <MenuButton
                            icon={<Copy size={13} />}
                            label="Duplicate"
                            onClick={() => handleDuplicate(inv.id)}
                          />
                          <div className="h-px bg-gray-100 my-1" />
                          <MenuButton
                            icon={<Trash2 size={13} />}
                            label="Delete"
                            onClick={() => handleDelete(inv.id)}
                            className="text-red-500"
                          />
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700
        hover:bg-gray-50 transition-colors ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ hasInvoices }: { hasInvoices: boolean }) {
  const router = useRouter();
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
        <FileText size={28} className="text-indigo-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {hasInvoices ? "No matching invoices" : "No invoices yet"}
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        {hasInvoices
          ? "Try adjusting your filters"
          : "Create your first invoice to get started"}
      </p>
      {!hasInvoices && (
        <button
          onClick={() => router.push("/invoice/new")}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg
            hover:bg-indigo-700 transition-colors"
        >
          Create Invoice
        </button>
      )}
    </div>
  );
}
