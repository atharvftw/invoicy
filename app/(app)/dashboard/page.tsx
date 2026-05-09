"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  FileText,
  Zap,
  Bell,
  Calendar,
} from "lucide-react";
import { useInvoiceStore } from "@/store/invoiceStore";
import {
  InvoiceStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  CURRENCY_SYMBOLS,
} from "@/types/invoice";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { invoices } = useInvoiceStore();

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalRevenue = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.total, 0);

    const monthlyRevenue = invoices
      .filter((i) => i.status === "paid" && new Date(i.date) >= monthStart)
      .reduce((sum, i) => sum + i.total, 0);

    const outstanding = invoices
      .filter((i) => i.status === "sent" || i.status === "partially_paid" || i.status === "overdue")
      .reduce((sum, i) => sum + i.balance_due, 0);

    const paidCount = invoices.filter((i) => i.status === "paid").length;
    const pendingCount = invoices.filter(
      (i) => i.status === "sent" || i.status === "partially_paid"
    ).length;
    const overdueCount = invoices.filter((i) => i.status === "overdue").length;

    return { totalRevenue, monthlyRevenue, outstanding, paidCount, pendingCount, overdueCount };
  }, [invoices]);

  const recentInvoices = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    [invoices]
  );

  const draftInvoices = useMemo(
    () => invoices.filter((i) => i.status === "draft").slice(0, 3),
    [invoices]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back — here&apos;s what&apos;s happening with your business.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
          icon={<TrendingUp size={16} className="text-green-600" />}
          accent="bg-green-50"
        />
        <StatCard
          label="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
          icon={<CheckCircle2 size={16} className="text-indigo-600" />}
          accent="bg-indigo-50"
        />
        <StatCard
          label="Outstanding"
          value={`₹${stats.outstanding.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
          icon={<Clock size={16} className="text-amber-600" />}
          accent="bg-amber-50"
        />
        <StatCard
          label="Overdue"
          value={`${stats.overdueCount}`}
          icon={<AlertCircle size={16} className="text-rose-600" />}
          accent="bg-rose-50"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Status breakdown */}
        <div className="section-card lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Invoice Status</h3>
          <div className="space-y-3">
            <StatusRow
              label="Paid"
              count={stats.paidCount}
              total={invoices.length}
              color="bg-green-500"
            />
            <StatusRow
              label="Pending"
              count={stats.pendingCount}
              total={invoices.length}
              color="bg-amber-500"
            />
            <StatusRow
              label="Overdue"
              count={stats.overdueCount}
              total={invoices.length}
              color="bg-rose-500"
            />
            <StatusRow
              label="Draft"
              count={draftInvoices.length}
              total={invoices.length}
              color="bg-gray-400"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-card lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickActionCard
              icon={<FileText size={18} className="text-indigo-600" />}
              label="Create Invoice"
              description="Draft a new invoice in seconds"
              onClick={() => router.push("/invoice/new")}
            />
            <QuickActionCard
              icon={<Bell size={18} className="text-amber-600" />}
              label="Send Reminders"
              description="Follow up on pending payments"
              onClick={() => router.push("/reminders")}
              disabled
            />
            <QuickActionCard
              icon={<Zap size={18} className="text-emerald-600" />}
              label="Setup Recurring"
              description="Automate repeat billing"
              onClick={() => router.push("/recurring")}
              disabled
            />
            <QuickActionCard
              icon={<Calendar size={18} className="text-blue-600" />}
              label="View Reports"
              description="Analyze revenue trends"
              onClick={() => router.push("/reports")}
              disabled
            />
          </div>

          {draftInvoices.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Drafts needing attention
              </p>
              <div className="space-y-2">
                {draftInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => router.push("/invoice/new")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-700 font-medium">
                        {inv.invoice_number || "Draft"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {inv.bill_to.name || "No client"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="section-card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentInvoices.length === 0 ? (
            <EmptyActivity />
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        inv.status === "paid"
                          ? "bg-green-50"
                          : inv.status === "overdue"
                          ? "bg-rose-50"
                          : inv.status === "draft"
                          ? "bg-gray-50"
                          : "bg-blue-50"
                      )}
                    >
                      <FileText
                        size={14}
                        className={cn(
                          inv.status === "paid"
                            ? "text-green-600"
                            : inv.status === "overdue"
                            ? "text-rose-600"
                            : inv.status === "draft"
                            ? "text-gray-500"
                            : "text-blue-600"
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {inv.invoice_number || "Draft"}
                      </p>
                      <p className="text-xs text-gray-400">{inv.bill_to.name || "—"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className={cn("badge text-[10px]", STATUS_COLORS[inv.status])}>
                      {STATUS_LABELS[inv.status]}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatDate(inv.created_at.split("T")[0])}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices Table */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Invoices</h3>
            <button
              onClick={() => router.push("/invoices")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {recentInvoices.length === 0 ? (
            <EmptyActivity />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">
                      Invoice
                    </th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2 pr-4">
                      Client
                    </th>
                    <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-2">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => router.push(`/invoice/${inv.id}`)}
                      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 pr-4">
                        <p className="text-sm font-medium text-gray-800">
                          {inv.invoice_number || "Draft"}
                        </p>
                        <p className="text-[11px] text-gray-400">{formatDate(inv.date)}</p>
                      </td>
                      <td className="py-2.5 pr-4">
                        <p className="text-sm text-gray-600 truncate max-w-[140px]">
                          {inv.bill_to.name || "—"}
                        </p>
                      </td>
                      <td className="py-2.5 text-right">
                        <p className="text-sm font-semibold text-gray-900 tabular-nums">
                          {CURRENCY_SYMBOLS[inv.currency]}
                          {inv.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                        <span className={cn("badge text-[10px] mt-1", STATUS_COLORS[inv.status])}>
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
    <div className="section-card flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", accent)}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-lg font-bold text-gray-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {count} <span className="text-gray-400 font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickActionCard({
  icon,
  label,
  description,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-left transition-all",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-white hover:border-indigo-200 hover:shadow-sm"
      )}
    >
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </button>
  );
}

function EmptyActivity() {
  return (
    <div className="text-center py-10">
      <p className="text-sm text-gray-400">No activity yet. Create your first invoice to get started.</p>
    </div>
  );
}
