"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Users,
  MoreVertical,
  Trash2,
  Edit3,
  FileText,
  Upload,
  Download,
  ArrowRight,
} from "lucide-react";
import { useClientStore } from "@/store/clientStore";
import { useInvoiceStore } from "@/store/invoiceStore";
import { Client } from "@/types/invoice";
import { cn } from "@/lib/utils";

export default function ClientsPage() {
  const router = useRouter();
  const { clients, addClient, deleteClient } = useClientStore();
  const { invoices } = useInvoiceStore();
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
    notes: "",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.gstin ?? "").toLowerCase().includes(q)
    );
  }, [clients, search]);

  const clientStats = useMemo(() => {
    const map = new Map<
      string,
      { total: number; paid: number; outstanding: number; invoiceCount: number }
    >();
    for (const inv of invoices) {
      const key = inv.bill_to.email || inv.bill_to.name;
      if (!key) continue;
      const existing = map.get(key) || { total: 0, paid: 0, outstanding: 0, invoiceCount: 0 };
      existing.total += inv.total;
      existing.paid += inv.amount_paid;
      existing.outstanding += inv.balance_due;
      existing.invoiceCount += 1;
      map.set(key, existing);
    }
    return map;
  }, [invoices]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addClient({ ...form });
    setForm({ name: "", email: "", phone: "", address: "", gstin: "", notes: "" });
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this client?")) deleteClient(id);
    setOpenMenu(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Plus size={15} /> Add Client
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="input-base pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            <Upload size={14} /> Import CSV
          </button>
          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState hasClients={clients.length > 0} onAdd={() => setModalOpen(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-card overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  Client
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  GSTIN
                </th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  Invoices
                </th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  Outstanding
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((client) => {
                const stats = clientStats.get(client.email || client.name) || {
                  total: 0,
                  paid: 0,
                  outstanding: 0,
                  invoiceCount: 0,
                };
                return (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600 font-semibold text-xs">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                          <p className="text-[11px] text-gray-400">{client.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-gray-600 font-mono">{client.gstin || "—"}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="text-sm font-medium text-gray-800">{stats.invoiceCount}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className={cn("text-sm font-medium tabular-nums", stats.outstanding > 0 ? "text-amber-600" : "text-gray-500")}>
                        ₹{stats.outstanding.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === client.id ? null : client.id);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreVertical size={14} />
                      </button>
                      {openMenu === client.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-2 top-full mt-1 z-20 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 min-w-[140px] animate-fade-up">
                            <MenuButton icon={<Edit3 size={13} />} label="Edit" onClick={() => { router.push(`/clients/${client.id}`); setOpenMenu(null); }} />
                            <MenuButton icon={<Trash2 size={13} />} label="Delete" onClick={() => handleDelete(client.id)} className="text-red-500" />
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Add Client</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <ArrowRight size={16} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
              <div>
                <label className="label-base">Name *</label>
                <input required className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Client name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Email</label>
                  <input type="email" className="input-base" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="label-base">Phone</label>
                  <input className="input-base" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" />
                </div>
              </div>
              <div>
                <label className="label-base">Address</label>
                <textarea className="input-base min-h-[60px]" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Billing address" />
              </div>
              <div>
                <label className="label-base">GSTIN</label>
                <input className="input-base" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} placeholder="22AAAAA0000A1Z5" maxLength={15} />
              </div>
              <div>
                <label className="label-base">Notes</label>
                <textarea className="input-base min-h-[60px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Internal notes…" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                  Save Client
                </button>
              </div>
            </form>
          </div>
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
      className={cn("w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors", className)}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ hasClients, onAdd }: { hasClients: boolean; onAdd: () => void }) {
  return (
    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-card">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
        <Users size={28} className="text-indigo-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {hasClients ? "No matching clients" : "No clients yet"}
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        {hasClients ? "Try adjusting your search" : "Add your first client to get started"}
      </p>
      {!hasClients && (
        <button onClick={onAdd} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
          Add Client
        </button>
      )}
    </div>
  );
}

