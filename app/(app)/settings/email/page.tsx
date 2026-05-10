"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, AlertTriangle, Send, ArrowLeft } from "lucide-react";
import { useEmailStore, EmailTone, TONE_DESCRIPTIONS, TONE_LABELS } from "@/store/emailStore";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "Gmail", host: "smtp.gmail.com", port: 465, secure: true },
  { label: "Outlook", host: "smtp-mail.outlook.com", port: 587, secure: false },
  { label: "Zoho", host: "smtp.zoho.com", port: 465, secure: true },
  { label: "Custom", host: "", port: 587, secure: false },
];

export default function EmailSettingsPage() {
  const router = useRouter();
  const { smtp, setSmtp, defaultTone, setDefaultTone, isConfigured } = useEmailStore();
  const [form, setForm] = useState({
    host: smtp?.host || "",
    port: smtp?.port || 587,
    secure: smtp?.secure ?? false,
    user: smtp?.user || "",
    password: smtp?.password || "",
    fromEmail: smtp?.fromEmail || "",
    fromName: smtp?.fromName || "",
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleTest() {
    if (!form.host || !form.user || !form.password || !form.fromEmail) {
      setTestResult({ success: false, message: "Fill in all required fields first." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.fromEmail,
          invoice: {
            id: "test",
            invoice_number: "TEST-001",
            from: { name: form.fromName, email: form.fromEmail, address: "", phone: "" },
            bill_to: { name: "Test Client", email: form.fromEmail, address: "", phone: "" },
            date: new Date().toISOString().split("T")[0],
            due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
            items: [{ id: "1", name: "Test Item", quantity: 1, amount: 1000 }],
            total: 1000,
            subtotal: 1000,
            tax: 0,
            discount: 0,
            shipping: 0,
            amount_paid: 0,
            balance_due: 1000,
            currency: "INR",
            status: "sent",
            theme: "classic",
            notes: "",
            custom: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            signature: null,
          },
          subject: "Test email from Invoicy",
          body: "Hi {client_name},\n\nThis is a test email to confirm your SMTP settings are working.\n\nThanks!",
          fromName: form.fromName,
          smtp: form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: `Test email sent to ${form.fromEmail}` });
      } else {
        setTestResult({ success: false, message: data.error || "Failed to send test email" });
      }
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : "Network error" });
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    setSmtp({
      host: form.host,
      port: Number(form.port),
      secure: form.secure,
      user: form.user,
      password: form.password,
      fromEmail: form.fromEmail,
      fromName: form.fromName,
    });
    setTestResult({ success: true, message: "Settings saved." });
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/settings")} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Email Settings</h1>
          <p className="text-sm text-gray-500">Connect your own email to send reminders</p>
        </div>
      </div>

      {/* Status */}
      <div className={cn("mb-4 p-3 rounded-xl border flex items-center gap-3", isConfigured() ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200")}>
        {isConfigured() ? <CheckCircle2 size={16} className="text-green-600 shrink-0" /> : <AlertTriangle size={16} className="text-amber-600 shrink-0" />}
        <p className={cn("text-sm", isConfigured() ? "text-green-800" : "text-amber-800")}>
          {isConfigured() ? "Email configured. Ready to send reminders." : "Email not configured. Enter your SMTP details below."}
        </p>
      </div>

      {/* Presets */}
      <div className="mb-4">
        <label className="label-base">Quick Setup</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setForm({ ...form, host: p.host, port: p.port, secure: p.secure })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                form.host === p.host && form.port === p.port
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">SMTP Host</label>
            <input className="input-base" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="smtp.gmail.com" />
          </div>
          <div>
            <label className="label-base">Port</label>
            <input type="number" className="input-base" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} placeholder="587" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="secure"
            type="checkbox"
            checked={form.secure}
            onChange={(e) => setForm({ ...form, secure: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="secure" className="text-sm text-gray-600">Use SSL/TLS (secure connection)</label>
        </div>
        <div>
          <label className="label-base">SMTP Username</label>
          <input className="input-base" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} placeholder="your@email.com" />
        </div>
        <div>
          <label className="label-base">SMTP Password / App Password</label>
          <input type="password" className="input-base" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          <p className="text-[11px] text-gray-400 mt-1">For Gmail, use an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">App Password</a>.</p>
        </div>
        <div>
          <label className="label-base">From Name</label>
          <input className="input-base" value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} placeholder="Acme Pvt Ltd" />
        </div>
        <div>
          <label className="label-base">From Email</label>
          <input type="email" className="input-base" value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} placeholder="billing@yourcompany.com" />
        </div>

        {/* Default Tone */}
        <div>
          <label className="label-base">Default Email Tone</label>
          <div className="grid grid-cols-5 gap-2 mt-1">
            {(["professional", "casual", "firm", "friendly", "urgent"] as EmailTone[]).map((tone) => (
              <button
                key={tone}
                onClick={() => setDefaultTone(tone)}
                className={cn(
                  "px-2 py-2 rounded-lg text-xs font-medium border transition-colors text-center",
                  defaultTone === tone
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
                title={TONE_DESCRIPTIONS[tone]}
              >
                {TONE_LABELS[tone]}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{TONE_DESCRIPTIONS[defaultTone]}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <Mail size={14} /> Save Settings
        </button>
        <button
          onClick={handleTest}
          disabled={testing}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors",
            testing
              ? "bg-gray-50 text-gray-300 cursor-not-allowed"
              : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-700"
          )}
        >
          {testing ? (
            <span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin inline-block" />
          ) : (
            <Send size={14} />
          )}
          Send Test
        </button>
      </div>

      {testResult && (
        <div className={cn("mt-3 p-3 rounded-xl border text-sm flex items-center gap-2", testResult.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800")}>
          {testResult.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {testResult.message}
        </div>
      )}

      {/* Gemini API Key */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Email Generation (Gemini)</h3>
        <p className="text-sm text-gray-500 mb-3">
          To use AI-generated email tones, add your Gemini API key as an environment variable:
        </p>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 font-mono text-xs text-gray-700">
          GEMINI_API_KEY=your_api_key_here
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google AI Studio</a>.
          Free tier: 1,500 requests/day with Gemini 2.0 Flash.
        </p>
      </div>
    </div>
  );
}
