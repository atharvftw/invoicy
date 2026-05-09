"use client";

import { useState } from "react";
import { UsersRound, Shield, Eye, User, Clock, Plus, Trash2, X } from "lucide-react";
import { useInvoiceStore } from "@/store/invoiceStore";
import { cn } from "@/lib/utils";

type Role = "admin" | "accountant" | "viewer";

const ROLE_LABELS: Record<Role, string> = { admin: "Admin", accountant: "Accountant", viewer: "Viewer" };
const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-indigo-100 text-indigo-700",
  accountant: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-600",
};

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: "1", name: "You (Owner)", email: "owner@company.com", role: "admin", joinedAt: new Date().toISOString() },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "viewer" as Role });
  const { invoices } = useInvoiceStore();

  const auditLog = invoices.slice(0, 20).map((inv) => ({
    id: inv.id,
    action: inv.status === "paid" ? "marked invoice as paid" : inv.status === "draft" ? "created invoice" : "sent invoice",
    target: inv.invoice_number || "Draft",
    time: inv.updated_at,
  }));

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setMembers([...members, { id: String(Date.now()), ...form, joinedAt: new Date().toISOString() }]);
    setForm({ name: "", email: "", role: "viewer" });
    setModalOpen(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Team Management</h1>
        <p className="text-sm text-gray-500 mt-1">{members.length} member{members.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Members */}
      <div className="section-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">User Directory</h3>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
            <Plus size={13} /> Invite
          </button>
        </div>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-xs">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("badge text-[10px]", ROLE_COLORS[m.role])}>{ROLE_LABELS[m.role]}</span>
                {m.id !== "1" && (
                  <button onClick={() => setMembers(members.filter((x) => x.id !== m.id))} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="section-card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Audit Log</h3>
        {auditLog.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {auditLog.map((log) => (
              <div key={log.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50/50">
                <Clock size={13} className="text-gray-400 shrink-0" />
                <p className="text-sm text-gray-700 flex-1">
                  <span className="font-medium">You</span> {log.action} <span className="font-medium">{log.target}</span>
                </p>
                <p className="text-xs text-gray-400 shrink-0">{new Date(log.time).toLocaleDateString("en-IN")}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Invite Team Member</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} className="px-5 py-4 space-y-4">
              <div>
                <label className="label-base">Name *</label>
                <input required className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div>
                <label className="label-base">Email *</label>
                <input required type="email" className="input-base" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" />
              </div>
              <div>
                <label className="label-base">Role</label>
                <select className="input-base" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                  <option value="admin">Admin — full access</option>
                  <option value="accountant">Accountant — invoices & payments</option>
                  <option value="viewer">Viewer — read only</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
