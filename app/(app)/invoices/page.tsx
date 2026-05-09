"use client";

import { useState, useCallback } from "react";
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
  Mail,
  Download,
  MessageCircle,
  Link as LinkIcon,
  Loader2,
  Send,
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
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";

const ALL_STATUSES: InvoiceStatus[] = ["draft", "sent", "partially_paid", "paid", "overdue"];

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, deleteInvoice, duplicateInvoice, markAsPaid, loadInvoice } =
    useInvoiceStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Stats
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === "sent" || i.status === "partially_paid" || i.status === "overdue")
    .reduce((sum, i) => sum + i.balance_due, 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

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

  function handleCopyLink(paymentQr: string, id: string) {
    const text = paymentQr || `${window.location.origin}/invoice/${id}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
    setOpenMenu(null);
  }

  function handleWhatsAppShare(inv: Invoice) {
    const phone = inv.bill_to.phone?.replace(/\D/g, "");
    const message = `Hi ${inv.bill_to.name || "there"},%0A%0APlease find your invoice *#${inv.invoice_number || "—"}* for *₹${inv.total.toLocaleString("en-IN")}*.%0A%0AView: ${window.location.origin}/invoice/${inv.id}%0A%0AThank you!`;
    const url = phone
      ? `https://wa.me/${phone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, "_blank");
    setOpenMenu(null);
  }

  function handleEmail(inv: Invoice) {
    const to = inv.bill_to.email || "";
    const subject = `Invoice #${inv.invoice_number || "—"} from ${inv.from.name || "Us"}`;
    const body = `Hey ${inv.bill_to.name || "there"},\n\nPlease find your invoice #${inv.invoice_number || "—"}.\n\nTotal: ₹${inv.total.toLocaleString("en-IN")}\n\nView online: ${window.location.origin}/invoice/${inv.id}\n\nBest regards,\n${inv.from.name || ""}`;
    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(to)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank");
    setOpenMenu(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
        <p className="text-sm text-gray-500 mt-1">
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Stats */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="section-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Received</p>
              <p className="text-sm font-bold text-gray-900">₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="section-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-sm font-bold text-gray-900">₹{pendingAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="section-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Paid</p>
              <p className="text-sm font-bold text-gray-900">{paidCount}</p>
            </div>
          </div>
          <div className="section-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
              <AlertIcon size={16} className="text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Overdue</p>
              <p className="text-sm font-bold text-gray-900">{overdueCount}</p>
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
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              statusFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              )}
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
          <table className="w-full min-w-[640px]">
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
                      {CURRENCY_SYMBOLS[inv.currency]}
                      {inv.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    {inv.balance_due < inv.total && inv.balance_due > 0 && (
                      <p className="text-xs text-amber-600 tabular-nums">
                        {CURRENCY_SYMBOLS[inv.currency]}
                        {inv.balance_due.toLocaleString("en-IN", { minimumFractionDigits: 2 })} due
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={cn("badge", STATUS_COLORS[inv.status])}>
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === inv.id ? null : inv.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {openMenu === inv.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                        <div className="absolute right-2 top-full mt-1 z-20 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 min-w-[200px] animate-fade-up">
                          <p className="px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                            Actions
                          </p>
                          <MenuButton icon={<Eye size={13} />} label="View" onClick={() => { handleView(inv); setOpenMenu(null); }} />
                          <MenuButton icon={<Edit3 size={13} />} label="Edit" onClick={() => { handleEdit(inv); setOpenMenu(null); }} />
                          {inv.status !== "paid" && (
                            <MenuButton icon={<CheckCircle2 size={13} />} label="Mark as Paid" onClick={() => handleMarkPaid(inv.id)} className="text-green-600" />
                          )}
                          <MenuButton icon={<Copy size={13} />} label="Duplicate" onClick={() => handleDuplicate(inv.id)} />
                          <div className="h-px bg-gray-100 my-1" />
                          <p className="px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                            Delivery
                          </p>
                          <MenuButton icon={<MessageCircle size={13} />} label="WhatsApp" onClick={() => handleWhatsAppShare(inv)} />
                          <MenuButton icon={<Mail size={13} />} label="Email (Gmail)" onClick={() => handleEmail(inv)} />
                          <MenuButton
                            icon={copiedId === inv.id ? <CheckCircle2 size={13} className="text-green-500" /> : <LinkIcon size={13} />}
                            label={copiedId === inv.id ? "Copied!" : "Copy Link"}
                            onClick={() => handleCopyLink(inv.payment_qr || "", inv.id)}
                          />
                          <PDFMenuItem invoice={inv} />
                          <div className="h-px bg-gray-100 my-1" />
                          <MenuButton icon={<Trash2 size={13} />} label="Delete" onClick={() => handleDelete(inv.id)} className="text-red-500" />
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
      className={cn(
        "w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors",
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function PDFMenuItem({ invoice }: { invoice: Invoice }) {
  const [loading, setLoading] = useState(false);
  const { isPremium } = usePlan();

  const handleDownload = useCallback(async () => {
    setLoading(true);
    try {
      let qrDataUrl: string | undefined;
      if (invoice.payment_qr) {
        const QRCode = (await import("qrcode")).default;
        qrDataUrl = await QRCode.toDataURL(invoice.payment_qr, { width: 144, margin: 1 });
      }
      const { pdf } = await import("@react-pdf/renderer");
      const { default: PDFDocument } = await import("@/components/InvoicePreview/PDFDocument");
      const { createElement } = await import("react");
      const doc = createElement(PDFDocument as any, { invoice, qrDataUrl, isPremium }); // eslint-disable-line
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
  }, [invoice, isPremium]);

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={13} className="animate-spin text-gray-400" /> : <Download size={13} />}
      {loading ? "Generating…" : "Download PDF"}
    </button>
  );
}

function AlertIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
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
        {hasInvoices ? "Try adjusting your filters" : "Create your first invoice to get started"}
      </p>
      {!hasInvoices && (
        <button
          onClick={() => router.push("/invoice/new")}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Create Invoice
        </button>
      )}
    </div>
  );
}

