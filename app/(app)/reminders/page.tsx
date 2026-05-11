"use client";

import { useState, useMemo } from "react";
import { Bell, Mail, MessageCircle, Plus, Trash2, ToggleLeft, ToggleRight, AlertTriangle, Percent, IndianRupee, Clock, X, Bot, ChevronRight, ShieldAlert, Sparkles, Workflow, ArrowRight, Send } from "lucide-react";
import { useReminderStore } from "@/store/reminderStore";
import { useInvoiceStore } from "@/store/invoiceStore";
import { useClientIntelligence } from "@/hooks/useClientIntelligence";
import { useEmailStore, EmailTone, TONE_DESCRIPTIONS, TONE_LABELS } from "@/store/emailStore";
import { ReminderTrigger, ReminderChannel, ReminderTone, CURRENCY_SYMBOLS } from "@/types/invoice";
import { cn } from "@/lib/utils";
import { useAuditStore } from "@/store/auditStore";

const TRIGGER_LABELS: Record<ReminderTrigger, string> = {
  pre_due: "Before Due Date",
  due_date: "On Due Date",
  overdue: "After Due Date",
};

const CHANNEL_LABELS: Record<ReminderChannel, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  both: "Email + WhatsApp",
};

const CHANNEL_ICONS: Record<ReminderChannel, React.ReactNode> = {
  email: <Mail size={14} />,
  whatsapp: <MessageCircle size={14} />,
  both: <><Mail size={14} /><MessageCircle size={14} /></>,
};

export default function RemindersPage() {
  const { schedules, templates, lateFee, addSchedule, deleteSchedule, toggleSchedule, updateTemplate, setLateFee, recordSend } = useReminderStore();
  const { invoices } = useInvoiceStore();
  const { allIntelligence } = useClientIntelligence();
  const { log } = useAuditStore();
  const { smtp, defaultTone, setDefaultTone } = useEmailStore();
  const [scheduleModal, setScheduleModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<EmailTone>(defaultTone);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    trigger: "pre_due" as ReminderTrigger,
    daysOffset: 3,
    channel: "email" as ReminderChannel,
  });

  const [rules, setRules] = useState<{ id: string; condition: string; action: string; active: boolean }[]>([
    { id: "1", condition: "Invoice overdue > 14 days", action: "Add late fee + send firm reminder", active: true },
    { id: "2", condition: "Client risk score > 60", action: "Escalate to collections workflow", active: true },
    { id: "3", condition: "Invoice overdue > 30 days", action: "Notify founder + generate statement", active: false },
  ]);

  const overdueInvoices = useMemo(() =>
    invoices.filter((inv) => inv.status === "overdue").sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()),
  [invoices]);

  const agentActive = schedules.some((s) => s.active);
  const now = new Date();

  function handleAddSchedule(e: React.FormEvent) {
    e.preventDefault();
    addSchedule({ ...form, active: true });
    setScheduleModal(false);
    setForm({ trigger: "pre_due", daysOffset: 3, channel: "email" });
  }

  async function generateEmail(invoiceId: string, tone: EmailTone): Promise<{ subject: string; body: string } | null> {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return null;

    // Find client intelligence for behavioral context
    const intel = allIntelligence.find((i) =>
      i.client.name.toLowerCase() === invoice.bill_to.name.toLowerCase() ||
      i.client.email.toLowerCase() === invoice.bill_to.email.toLowerCase()
    )?.intelligence;

    const daysOverdue = invoice.due_date
      ? Math.max(0, Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)))
      : undefined;

    setGeneratingId(invoiceId);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice,
          tone,
          context: intel ? {
            riskScore: intel.riskScore,
            avgDaysLate: intel.avgDaysLate,
            daysOverdue,
          } : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) return { subject: data.subject, body: data.body };
      return null;
    } catch {
      return null;
    } finally {
      setGeneratingId(null);
    }
  }

  async function sendReminder(invoiceId: string, templateId: string) {
    if (!smtp) {
      alert("Email not configured. Go to Settings → Email to connect your email account.");
      return;
    }
    const invoice = invoices.find((i) => i.id === invoiceId);
    const template = templates.find((t) => t.id === templateId);
    if (!invoice || !template || !invoice.bill_to.email) {
      alert("Invoice or client email missing.");
      return;
    }
    setSendingId(invoiceId);
    let subject = template.subject;
    let body = template.body;

    // If tone is different from template default, generate with Gemini
    if (selectedTone !== "friendly" && selectedTone !== "firm") {
      const generated = await generateEmail(invoiceId, selectedTone);
      if (generated) {
        subject = generated.subject;
        body = generated.body;
      }
    }

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: invoice.bill_to.email,
          invoice,
          subject,
          body,
          fromName: invoice.from.name,
          smtp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        recordSend({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number || "Draft",
          clientEmail: invoice.bill_to.email,
          templateId: template.id,
          subject,
          status: "sent",
        });
        log("sent email reminder", `${invoice.invoice_number || "Draft"} → ${invoice.bill_to.email}`, invoice.id);
        alert(`Reminder sent to ${invoice.bill_to.email}`);
      } else {
        recordSend({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number || "Draft",
          clientEmail: invoice.bill_to.email,
          templateId: template.id,
          subject,
          status: "failed",
          error: data.error || "Unknown error",
        });
        log("failed to send reminder", `${invoice.invoice_number || "Draft"}`, invoice.id);
        alert(`Failed to send: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      recordSend({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number || "Draft",
        clientEmail: invoice.bill_to.email,
        templateId: template.id,
        subject,
        status: "failed",
        error: err instanceof Error ? err.message : "Network error",
      });
      log("failed to send reminder", `${invoice.invoice_number || "Draft"}`, invoice.id);
      alert("Network error sending reminder.");
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Reminder Automation</h1>
        <p className="text-sm text-gray-500 mt-1">
          {agentActive
            ? "Your AI payment assistant is active and monitoring invoices."
            : "Your payment assistant is paused. Enable schedules to activate."}
        </p>
      </div>

      {/* Email config alert */}
      {!smtp && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Email not configured. <a href="/settings" className="font-medium underline">Connect your email</a> to send reminders.
          </p>
        </div>
      )}

      {/* Tone selector */}
      <div className="section-card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Email Tone</h3>
          <span className="text-xs text-gray-400">{TONE_LABELS[selectedTone]}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {(["professional", "casual", "firm", "friendly", "urgent"] as EmailTone[]).map((tone) => (
            <button
              key={tone}
              onClick={() => { setSelectedTone(tone); setDefaultTone(tone); }}
              className={cn(
                "px-2 py-2 rounded-lg text-xs font-medium border transition-colors text-center",
                selectedTone === tone
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              )}
              title={TONE_DESCRIPTIONS[tone]}
            >
              {TONE_LABELS[tone]}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">{TONE_DESCRIPTIONS[selectedTone]}</p>
        {generatingId && (
          <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin inline-block" />
            Gemini is drafting your email…
          </p>
        )}
      </div>

      {/* Smart Collections Agent — Overdue Monitor */}
      {overdueInvoices.length > 0 && (
        <div className="section-card mb-6 border-l-4 border-l-rose-400">
          <div className="flex items-center gap-2 mb-3">
            <Bot size={16} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900">Smart Collections Agent</h3>
            <span className={cn("badge text-[10px] ml-auto", agentActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
              {agentActive ? "Active" : "Paused"}
            </span>
          </div>
          <div className="space-y-2">
            {overdueInvoices.slice(0, 5).map((inv) => {
              const daysOverdue = Math.max(0, Math.floor((now.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)));
              const intel = allIntelligence.find((i) =>
                i.client.name.toLowerCase() === inv.bill_to.name.toLowerCase() ||
                i.client.email.toLowerCase() === inv.bill_to.email.toLowerCase()
              )?.intelligence;
              const tone = intel?.preferredTone ?? "friendly";
              const channel = intel?.preferredChannel ?? "email";
              const escalation = daysOverdue > 14 ? "Late fee warning + escalation" : daysOverdue > 7 ? "Firm reminder" : "Friendly follow-up";
              return (
                <div key={inv.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                    <ShieldAlert size={14} className="text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{inv.invoice_number || "Draft"} · {inv.bill_to.name || "—"}</p>
                    <p className="text-xs text-gray-400">{daysOverdue} days overdue · {CURRENCY_SYMBOLS[inv.currency]}{inv.balance_due.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400 uppercase">AI Action</p>
                    <p className="text-xs font-medium text-indigo-700">{escalation}</p>
                    <p className="text-[10px] text-gray-400">{tone} tone · {channel}</p>
                  </div>
                  {inv.bill_to.email && (
                    <button
                      onClick={() => sendReminder(inv.id, daysOverdue > 7 ? "t-overdue-firm" : "t-due-friendly")}
                      disabled={sendingId === inv.id}
                      className={cn(
                        "p-2 rounded-lg transition-colors shrink-0",
                        sendingId === inv.id
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                      )}
                      title="Send email reminder now"
                    >
                      {sendingId === inv.id ? (
                        <span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin inline-block" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
            {overdueInvoices.length > 5 && (
              <p className="text-xs text-gray-400 text-center py-1">+{overdueInvoices.length - 5} more overdue invoices</p>
            )}
          </div>
        </div>
      )}

      {/* Global Schedules */}
      <div className="section-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Reminder Schedules</h3>
          <button onClick={() => setScheduleModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
            <Plus size={13} /> Add Schedule
          </button>
        </div>
        <div className="space-y-2">
          {schedules.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", s.active ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400")}>
                  <Bell size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{TRIGGER_LABELS[s.trigger]}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} />
                    {s.trigger === "pre_due" ? `${s.daysOffset} days before` : s.trigger === "overdue" ? `${s.daysOffset} days after` : "On the day"}
                    <span className="mx-1">·</span>
                    <span className="flex items-center gap-1">{CHANNEL_ICONS[s.channel]} {CHANNEL_LABELS[s.channel]}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleSchedule(s.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title={s.active ? "Pause" : "Resume"}>
                  {s.active ? <ToggleRight size={20} className="text-indigo-600" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => { if (confirm("Delete this schedule?")) deleteSchedule(s.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="section-card mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Message Templates</h3>
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("badge text-[10px]", t.tone === "friendly" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700")}>{t.tone}</span>
                  <span className="text-sm font-medium text-gray-800">{TRIGGER_LABELS[t.trigger]}</span>
                </div>
                <button onClick={() => setEditingTemplate(editingTemplate === t.id ? null : t.id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  {editingTemplate === t.id ? "Close" : "Edit"}
                </button>
              </div>
              {editingTemplate === t.id ? (
                <div className="px-4 py-3 space-y-3">
                  <div>
                    <label className="label-base">Subject</label>
                    <input className="input-base" value={t.subject} onChange={(e) => updateTemplate(t.id, { subject: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-base">Body</label>
                    <textarea className="input-base min-h-[100px]" value={t.body} onChange={(e) => updateTemplate(t.id, { body: e.target.value })} />
                  </div>
                  <p className="text-[10px] text-gray-400">Variables: {'{client_name}'}, {'{invoice_number}'}, {'{total}'}, {'{due_date}'}</p>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-700">{t.subject}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Late Fees */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900">Late Fee Setup</h3>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setLateFee({ ...lateFee, enabled: !lateFee.enabled })}
            className={cn("w-11 h-6 rounded-full transition-colors relative", lateFee.enabled ? "bg-indigo-600" : "bg-gray-300")}
          >
            <span className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", lateFee.enabled ? "translate-x-5" : "translate-x-0")} />
          </button>
          <span className="text-sm text-gray-700">{lateFee.enabled ? "Enabled" : "Disabled"}</span>
        </div>
        {lateFee.enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-base">Type</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setLateFee({ ...lateFee, type: "percentage" })} className={cn("flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors", lateFee.type === "percentage" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-600")}>
                  <Percent size={14} className="inline mr-1" /> Percentage
                </button>
                <button onClick={() => setLateFee({ ...lateFee, type: "fixed" })} className={cn("flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors", lateFee.type === "fixed" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-600")}>
                  <IndianRupee size={14} className="inline mr-1" /> Fixed
                </button>
              </div>
            </div>
            <div>
              <label className="label-base">Value</label>
              <input type="number" min={0} step={lateFee.type === "percentage" ? 0.1 : 1} className="input-base" value={lateFee.value} onChange={(e) => setLateFee({ ...lateFee, value: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label-base">Grace Period (days)</label>
              <input type="number" min={0} className="input-base" value={lateFee.gracePeriodDays} onChange={(e) => setLateFee({ ...lateFee, gracePeriodDays: Number(e.target.value) })} />
            </div>
          </div>
        )}
      </div>

      {/* Automation Rules */}
      <div className="section-card mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Workflow size={16} className="text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-900">Automation Rules</h3>
          <span className="badge bg-indigo-50 text-indigo-700 text-[10px] ml-2">Beta</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">IF-THEN rules that trigger automatically based on invoice and client behavior.</p>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border transition-all", rule.active ? "border-gray-100 bg-gray-50/50" : "border-gray-100 bg-gray-50/30 opacity-60")}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", rule.active ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400")}>
                <Sparkles size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-gray-500 uppercase">IF</span>
                  <span className="text-sm font-medium text-gray-800">{rule.condition}</span>
                  <ArrowRight size={12} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">THEN</span>
                  <span className="text-sm font-medium text-indigo-700">{rule.action}</span>
                </div>
              </div>
              <button
                onClick={() => setRules(rules.map((r) => r.id === rule.id ? { ...r, active: !r.active } : r))}
                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title={rule.active ? "Disable" : "Enable"}
              >
                {rule.active ? <ToggleRight size={20} className="text-indigo-600" /> : <ToggleLeft size={20} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Add Schedule</h3>
              <button onClick={() => setScheduleModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddSchedule} className="px-5 py-4 space-y-4">
              <div>
                <label className="label-base">Trigger</label>
                <select className="input-base" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value as ReminderTrigger })}>
                  <option value="pre_due">Before Due Date</option>
                  <option value="due_date">On Due Date</option>
                  <option value="overdue">After Due Date</option>
                </select>
              </div>
              {form.trigger !== "due_date" && (
                <div>
                  <label className="label-base">Days {form.trigger === "pre_due" ? "Before" : "After"}</label>
                  <input type="number" min={1} required className="input-base" value={form.daysOffset} onChange={(e) => setForm({ ...form, daysOffset: Number(e.target.value) })} />
                </div>
              )}
              <div>
                <label className="label-base">Channel</label>
                <select className="input-base" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as ReminderChannel })}>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="both">Email + WhatsApp</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setScheduleModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
