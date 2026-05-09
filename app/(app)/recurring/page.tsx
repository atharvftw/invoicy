"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Repeat,
  Plus,
  Search,
  Pause,
  Play,
  Trash2,
  Calendar,
  IndianRupee,
  ArrowRight,
  X,
} from "lucide-react";
import { useRecurringStore } from "@/store/recurringStore";
import { CURRENCY_SYMBOLS } from "@/types/invoice";
import { cn } from "@/lib/utils";

export default function RecurringPage() {
  const router = useRouter();
  const { schedules, addSchedule, deleteSchedule, toggleActive } = useRecurringStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    frequency: "monthly" as const,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    autoGenerate: true,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return schedules.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q)
    );
  }, [schedules, search]);

  const activeCount = schedules.filter((s) => s.active).length;
  const pausedCount = schedules.filter((s) => !s.active).length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.clientName.trim() || !form.amount) return;
    addSchedule({
      name: form.name,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      amount: Number(form.amount),
      currency: "INR",
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      active: true,
      autoGenerate: form.autoGenerate,
    });
    setForm({
      name: "",
      clientName: "",
      clientEmail: "",
      amount: "",
      frequency: "monthly",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      autoGenerate: true,
    });
    setModalOpen(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recurring Billing</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} active · {pausedCount} paused
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} /> New Schedule
        </button>
      </div>

      {/* Filters */}
      <div className="relative w-full sm:max-w-xs mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search schedules…"
          className="input-base pl-9"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState hasSchedules={schedules.length > 0} onAdd={() => setModalOpen(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-card">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Schedule</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Client</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Frequency</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Amount</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Repeat size={13} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="text-[11px] text-gray-400">Next: {s.nextDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-700">{s.clientName}</p>
                    {s.clientEmail && <p className="text-xs text-gray-400">{s.clientEmail}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="badge bg-gray-100 text-gray-600 capitalize">{s.frequency}</span>
                    {s.autoGenerate && <span className="ml-1.5 badge bg-green-50 text-green-700 text-[10px]">Auto</span>}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <p className="text-sm font-bold text-gray-900 tabular-nums">
                      {CURRENCY_SYMBOLS[s.currency]}{s.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={cn("badge text-[10px]", s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                      {s.active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => toggleActive(s.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title={s.active ? "Pause" : "Resume"}
                      >
                        {s.active ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this schedule?")) deleteSchedule(s.id); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">New Recurring Schedule</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
              <div>
                <label className="label-base">Schedule Name *</label>
                <input required className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Monthly Retainer" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Client Name *</label>
                  <input required className="input-base" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Client name" />
                </div>
                <div>
                  <label className="label-base">Client Email</label>
                  <input type="email" className="input-base" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} placeholder="email@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Amount (₹) *</label>
                  <input required type="number" min={0} className="input-base" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <label className="label-base">Frequency</label>
                  <select className="input-base" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Start Date *</label>
                  <input required type="date" className="input-base" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="label-base">End Date</label>
                  <input type="date" className="input-base" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="auto"
                  type="checkbox"
                  checked={form.autoGenerate}
                  onChange={(e) => setForm({ ...form, autoGenerate: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="auto" className="text-sm text-gray-700">Auto-generate invoice on each cycle</label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">Create Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasSchedules, onAdd }: { hasSchedules: boolean; onAdd: () => void }) {
  return (
    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-card">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
        <Repeat size={28} className="text-indigo-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{hasSchedules ? "No matching schedules" : "No recurring schedules"}</h3>
      <p className="text-sm text-gray-400 mb-5">{hasSchedules ? "Try adjusting your search" : "Set up automated repeat billing"}</p>
      {!hasSchedules && (
        <button onClick={onAdd} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Create Schedule</button>
      )}
    </div>
  );
}
