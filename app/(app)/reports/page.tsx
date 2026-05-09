"use client";

import { useMemo, useState } from "react";
import { BarChart3, Download, TrendingUp, ArrowDownToLine, ArrowUpFromLine, FileText, Calendar } from "lucide-react";
import { useInvoiceStore } from "@/store/invoiceStore";
import { CURRENCY_SYMBOLS, InvoiceStatus } from "@/types/invoice";
import { cn } from "@/lib/utils";

type ReportTab = "overview" | "gst" | "clients";

export default function ReportsPage() {
  const { invoices } = useInvoiceStore();
  const [tab, setTab] = useState<ReportTab>("overview");

  // Monthly aggregation
  const monthly = useMemo(() => {
    const map = new Map<string, { paid: number; pending: number; overdue: number; count: number }>();
    for (const inv of invoices) {
      const key = inv.date.slice(0, 7); // YYYY-MM
      const existing = map.get(key) || { paid: 0, pending: 0, overdue: 0, count: 0 };
      existing.count += 1;
      if (inv.status === "paid") existing.paid += inv.total;
      else if (inv.status === "overdue") existing.overdue += inv.balance_due;
      else if (inv.status === "sent" || inv.status === "partially_paid") existing.pending += inv.balance_due;
      map.set(key, existing);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12);
  }, [invoices]);

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalPending = invoices
    .filter((i) => i.status === "sent" || i.status === "partially_paid")
    .reduce((s, i) => s + i.balance_due, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.balance_due, 0);
  const avgInvoice = invoices.length > 0 ? invoices.reduce((s, i) => s + i.total, 0) / invoices.length : 0;

  const clientPerformance = useMemo(() => {
    const map = new Map<string, { total: number; paid: number; count: number }>();
    for (const inv of invoices) {
      const key = inv.bill_to.name || "Unknown";
      const existing = map.get(key) || { total: 0, paid: 0, count: 0 };
      existing.total += inv.total;
      existing.paid += inv.amount_paid;
      existing.count += 1;
      map.set(key, existing);
    }
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [invoices]);

  function exportGST() {
    const rows = [
      ["Invoice Number", "Date", "Client", "GSTIN", "Place of Supply", "Subtotal", "CGST", "SGST", "IGST", "Total"],
      ...invoices.map((inv) => {
        const cgst = inv.tax > 0 ? inv.subtotal * (inv.tax / 100) * 0.5 : 0;
        const sgst = cgst;
        const igst = 0; // simplified
        return [
          inv.invoice_number,
          inv.date,
          inv.bill_to.name,
          "", // GSTIN not on invoice yet
          "",
          inv.subtotal.toFixed(2),
          cgst.toFixed(2),
          sgst.toFixed(2),
          igst.toFixed(2),
          inv.total.toFixed(2),
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gst-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxMonthly = Math.max(...monthly.map(([, v]) => Math.max(v.paid, v.pending, v.overdue)), 1);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Insights into your revenue, cash flow, and tax compliance.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-100 pb-1">
        <TabButton label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
        <TabButton label="GST Report" active={tab === "gst"} onClick={() => setTab("gst")} />
        <TabButton label="Client Insights" active={tab === "clients"} onClick={() => setTab("clients")} />
      </div>

      {tab === "overview" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard label="Total Revenue" value={`₹${totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`} icon={<TrendingUp size={16} className="text-green-600" />} accent="bg-green-50" />
            <StatCard label="Pending" value={`₹${totalPending.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`} icon={<ArrowDownToLine size={16} className="text-amber-600" />} accent="bg-amber-50" />
            <StatCard label="Overdue" value={`₹${totalOverdue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`} icon={<ArrowUpFromLine size={16} className="text-rose-600" />} accent="bg-rose-50" />
            <StatCard label="Avg Invoice" value={`₹${avgInvoice.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`} icon={<FileText size={16} className="text-indigo-600" />} accent="bg-indigo-50" />
          </div>

          {/* Monthly bar chart */}
          <div className="section-card mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Cash Flow</h3>
            {monthly.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No invoice data yet.</p>
            ) : (
              <div className="space-y-3">
                {monthly.map(([month, data]) => {
                  const [y, m] = month.split("-");
                  const label = `${new Date(Number(y), Number(m) - 1).toLocaleString("en-IN", { month: "short" })} ${y}`;
                  return (
                    <div key={month}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-xs font-medium text-gray-700">{data.count} invoices</span>
                      </div>
                      <div className="flex items-center gap-1 h-5">
                        <BarSegment width={Math.round((data.paid / maxMonthly) * 100)} color="bg-green-500" label={`₹${data.paid.toLocaleString("en-IN")}`} />
                        <BarSegment width={Math.round((data.pending / maxMonthly) * 100)} color="bg-amber-400" />
                        <BarSegment width={Math.round((data.overdue / maxMonthly) * 100)} color="bg-rose-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Paid</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Pending</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Overdue</span>
            </div>
          </div>
        </>
      )}

      {tab === "gst" && (
        <div className="section-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">GST-Ready Report</h3>
            <button onClick={exportGST} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
              <Download size={13} /> Export CSV
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">Download a CSV with invoice-level tax breakdowns for GST filing. CGST/SGST are auto-calculated from the invoice tax rate.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Invoice</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Date</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Client</th>
                  <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Subtotal</th>
                  <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">Tax</th>
                  <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.slice(0, 20).map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2.5 pr-4 text-sm font-medium text-gray-800">{inv.invoice_number || "Draft"}</td>
                    <td className="py-2.5 pr-4 text-sm text-gray-600">{inv.date}</td>
                    <td className="py-2.5 pr-4 text-sm text-gray-600">{inv.bill_to.name || "—"}</td>
                    <td className="py-2.5 pr-4 text-sm text-right tabular-nums">{CURRENCY_SYMBOLS[inv.currency]}{inv.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 pr-4 text-sm text-right tabular-nums">{inv.tax}%</td>
                    <td className="py-2.5 text-sm font-semibold text-right tabular-nums">{CURRENCY_SYMBOLS[inv.currency]}{inv.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "clients" && (
        <div className="section-card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Clients by Revenue</h3>
          {clientPerformance.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {clientPerformance.map((c, idx) => {
                const pct = c.total > 0 ? Math.round((c.paid / c.total) * 100) : 0;
                return (
                  <div key={c.name} className="flex items-center gap-4">
                    <div className="w-6 text-xs font-semibold text-gray-400 text-center">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800 truncate">{c.name}</span>
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">₹{c.total.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{c.count} invoices · {pct}% collected</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 text-sm font-medium transition-colors relative",
        active ? "text-indigo-700" : "text-gray-500 hover:text-gray-700"
      )}
    >
      {label}
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
    </button>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
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

function BarSegment({ width, color, label }: { width: number; color: string; label?: string }) {
  if (width <= 0) return null;
  return (
    <div className={cn("h-full rounded-sm min-w-[4px] transition-all relative group", color)} style={{ width: `${width}%` }}>
      {label && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] text-gray-600 bg-white border border-gray-100 rounded px-1.5 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {label}
        </span>
      )}
    </div>
  );
}
