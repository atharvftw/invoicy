"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building2,
  StickyNote,
} from "lucide-react";
import { useClientStore } from "@/store/clientStore";
import { useInvoiceStore } from "@/store/invoiceStore";
import { STATUS_LABELS, STATUS_COLORS, CURRENCY_SYMBOLS } from "@/types/invoice";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getClient } = useClientStore();
  const { invoices } = useInvoiceStore();
  const client = getClient(params.id);

  const clientInvoices = useMemo(
    () =>
      invoices.filter(
        (inv) =>
          inv.bill_to.email === client?.email || inv.bill_to.name === client?.name
      ),
    [invoices, client]
  );

  const stats = useMemo(() => {
    const total = clientInvoices.reduce((sum, i) => sum + i.total, 0);
    const paid = clientInvoices.reduce((sum, i) => sum + i.amount_paid, 0);
    const outstanding = clientInvoices.reduce((sum, i) => sum + i.balance_due, 0);
    const paidCount = clientInvoices.filter((i) => i.status === "paid").length;
    return { total, paid, outstanding, paidCount };
  }, [clientInvoices]);

  if (!client) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => router.push("/clients")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={14} /> Back to Clients
        </button>
        <div className="section-card text-center py-20">
          <p className="text-sm text-gray-400">Client not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <button
        onClick={() => router.push("/clients")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={14} /> Back to Clients
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600 font-bold text-xl">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail size={13} /> {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone size={13} /> {client.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Total Invoiced" value={`₹${stats.total.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`} icon={<TrendingUp size={16} className="text-indigo-600" />} accent="bg-indigo-50" />
        <StatCard label="Paid" value={`₹${stats.paid.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`} icon={<CheckCircle2 size={16} className="text-green-600" />} accent="bg-green-50" />
        <StatCard label="Outstanding" value={`₹${stats.outstanding.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`} icon={<Clock size={16} className="text-amber-600" />} accent="bg-amber-50" />
        <StatCard label="Invoices" value={`${clientInvoices.length}`} icon={<FileText size={16} className="text-gray-600" />} accent="bg-gray-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="section-card space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Building2 size={15} className="text-gray-400" /> Details
            </h3>
            <div className="space-y-3 text-sm">
              {client.gstin && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">GSTIN</p>
                  <p className="font-mono text-gray-700">{client.gstin}</p>
                </div>
              )}
              {client.address && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                    <MapPin size={11} /> Address
                  </p>
                  <p className="text-gray-700 whitespace-pre-line">{client.address}</p>
                </div>
              )}
              {client.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                    <StickyNote size={11} /> Internal Notes
                  </p>
                  <p className="text-gray-700 whitespace-pre-line">{client.notes}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Added</p>
                <p className="text-gray-700">{formatDate(client.created_at.split("T")[0])}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Invoice History */}
        <div className="lg:col-span-2">
          <div className="section-card">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Invoice History</h3>
            {clientInvoices.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No invoices for this client yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Invoice</th>
                      <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Date</th>
                      <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Total</th>
                      <th className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {clientInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => router.push(`/invoice/${inv.id}`)}
                        className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 pr-4">
                          <p className="text-sm font-medium text-gray-800">{inv.invoice_number || "Draft"}</p>
                        </td>
                        <td className="py-2.5 pr-4">
                          <p className="text-sm text-gray-600">{formatDate(inv.date)}</p>
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          <p className="text-sm font-semibold text-gray-900 tabular-nums">
                            {CURRENCY_SYMBOLS[inv.currency]}
                            {inv.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={cn("badge text-[10px]", STATUS_COLORS[inv.status])}>
                            {STATUS_LABELS[inv.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="section-card flex items-center gap-3">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", accent)}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-bold text-gray-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}
