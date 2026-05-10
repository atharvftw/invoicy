"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Bell,
  Percent,
  IndianRupee,
  Building2,
  Bot,
  ArrowRight,
  X,
} from "lucide-react";
import { useReminderStore } from "@/store/reminderStore";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "business", title: "Business Profile" },
  { id: "reminders", title: "Reminder Preferences" },
  { id: "latefees", title: "Late Fee Setup" },
  { id: "agent", title: "Smart Collections" },
  { id: "done", title: "All Set" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { schedules, addSchedule, lateFee, setLateFee } = useReminderStore();
  const [step, setStep] = useState(0);
  const [biz, setBiz] = useState({ name: "", email: "", gstin: "" });
  const [reminderPrefs, setReminderPrefs] = useState({ preDue: true, onDue: true, overdue: true, channel: "email" as "email" | "both" });
  const [lateFeeConfig, setLateFeeConfig] = useState({ enabled: false, type: "percentage" as "percentage" | "fixed", value: 1.5, grace: 7 });
  const [agentOn, setAgentOn] = useState(true);

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  function finish() {
    // Apply reminder schedules based on prefs
    if (reminderPrefs.preDue && !schedules.some((s) => s.trigger === "pre_due")) {
      addSchedule({ trigger: "pre_due", daysOffset: 3, channel: reminderPrefs.channel, active: true });
    }
    if (reminderPrefs.onDue && !schedules.some((s) => s.trigger === "due_date")) {
      addSchedule({ trigger: "due_date", daysOffset: 0, channel: reminderPrefs.channel, active: true });
    }
    if (reminderPrefs.overdue && !schedules.some((s) => s.trigger === "overdue")) {
      addSchedule({ trigger: "overdue", daysOffset: 3, channel: reminderPrefs.channel, active: true });
    }
    // Apply late fee config
    setLateFee({ enabled: lateFeeConfig.enabled, type: lateFeeConfig.type, value: lateFeeConfig.value, gracePeriodDays: lateFeeConfig.grace });
    router.push("/dashboard");
  }

  const isLast = step === STEPS.length - 1;
  const StepIcon = [Sparkles, Building2, Bell, Percent, Bot, CheckCircle2][step];

  return (
    <div className="max-w-lg mx-auto px-4 py-10 min-h-[80vh] flex flex-col">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                i <= step ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
              )}
            >
              {i < step ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 flex-1 rounded", i < step ? "bg-indigo-600" : "bg-gray-100")} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <StepIcon size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{STEPS[step].title}</h2>
            <p className="text-xs text-gray-400">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Let&apos;s set up your AI-powered payment assistant in under 2 minutes. We&apos;ll configure reminders, late fees, and smart collections so you get paid faster.
            </p>
            <div className="p-4 rounded-xl bg-gray-50 space-y-2">
              <FeatureRow icon={<Sparkles size={14} />} text="AI risk scoring for every client" />
              <FeatureRow icon={<Bell size={14} />} text="Automated email & WhatsApp reminders" />
              <FeatureRow icon={<Bot size={14} />} text="Smart collections escalation" />
              <FeatureRow icon={<Percent size={14} />} text="Late fee auto-calculation" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">This appears on every invoice you send.</p>
            <div>
              <label className="label-base">Business Name</label>
              <input className="input-base" value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} placeholder="Acme Pvt Ltd" />
            </div>
            <div>
              <label className="label-base">Business Email</label>
              <input type="email" className="input-base" value={biz.email} onChange={(e) => setBiz({ ...biz, email: e.target.value })} placeholder="billing@acme.com" />
            </div>
            <div>
              <label className="label-base">GSTIN</label>
              <input className="input-base" value={biz.gstin} onChange={(e) => setBiz({ ...biz, gstin: e.target.value.toUpperCase() })} placeholder="22AAAAA0000A1Z5" maxLength={15} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Choose when clients receive payment nudges.</p>
            <ToggleRow label="3 days before due date" checked={reminderPrefs.preDue} onChange={(v) => setReminderPrefs({ ...reminderPrefs, preDue: v })} />
            <ToggleRow label="On the due date" checked={reminderPrefs.onDue} onChange={(v) => setReminderPrefs({ ...reminderPrefs, onDue: v })} />
            <ToggleRow label="3 days after overdue" checked={reminderPrefs.overdue} onChange={(v) => setReminderPrefs({ ...reminderPrefs, overdue: v })} />
            <div className="pt-2">
              <label className="label-base">Default Channel</label>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => setReminderPrefs({ ...reminderPrefs, channel: "email" })} className={cn("flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors", reminderPrefs.channel === "email" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-600")}>Email</button>
                <button onClick={() => setReminderPrefs({ ...reminderPrefs, channel: "both" })} className={cn("flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors", reminderPrefs.channel === "both" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-600")}>Email + WhatsApp</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Automatically charge late fees on overdue invoices.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setLateFeeConfig({ ...lateFeeConfig, enabled: !lateFeeConfig.enabled })} className={cn("w-11 h-6 rounded-full transition-colors relative", lateFeeConfig.enabled ? "bg-indigo-600" : "bg-gray-300")}>
                <span className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", lateFeeConfig.enabled ? "translate-x-5" : "translate-x-0")} />
              </button>
              <span className="text-sm text-gray-700">{lateFeeConfig.enabled ? "Enabled" : "Disabled"}</span>
            </div>
            {lateFeeConfig.enabled && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setLateFeeConfig({ ...lateFeeConfig, type: "percentage" })} className={cn("flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors", lateFeeConfig.type === "percentage" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-600")}><Percent size={14} className="inline mr-1" /> Percentage</button>
                  <button onClick={() => setLateFeeConfig({ ...lateFeeConfig, type: "fixed" })} className={cn("flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors", lateFeeConfig.type === "fixed" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-600")}><IndianRupee size={14} className="inline mr-1" /> Fixed</button>
                </div>
                <div>
                  <label className="label-base">Value</label>
                  <input type="number" min={0} step={lateFeeConfig.type === "percentage" ? 0.1 : 1} className="input-base" value={lateFeeConfig.value} onChange={(e) => setLateFeeConfig({ ...lateFeeConfig, value: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label-base">Grace Period (days)</label>
                  <input type="number" min={0} className="input-base" value={lateFeeConfig.grace} onChange={(e) => setLateFeeConfig({ ...lateFeeConfig, grace: Number(e.target.value) })} />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">The AI agent monitors overdue invoices and escalates automatically.</p>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={16} className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-900">Collections Agent</span>
              </div>
              <p className="text-xs text-indigo-700 leading-relaxed">
                When an invoice goes overdue, the agent will:<br />
                1. Send a firm reminder using the client&apos;s preferred tone<br />
                2. Escalate to late-fee warning after 14 days<br />
                3. Flag high-risk clients for manual review
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setAgentOn(!agentOn)} className={cn("w-11 h-6 rounded-full transition-colors relative", agentOn ? "bg-indigo-600" : "bg-gray-300")}>
                <span className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", agentOn ? "translate-x-5" : "translate-x-0")} />
              </button>
              <span className="text-sm text-gray-700">{agentOn ? "Agent active" : "Agent paused"}</span>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Your payment assistant is ready</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              AI intelligence, automated reminders, and smart collections are now active. Create your first invoice to see it in action.
            </p>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between pt-6 mt-auto">
        <button
          onClick={back}
          disabled={step === 0}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", step === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50")}
        >
          Back
        </button>
        {isLast ? (
          <button
            onClick={finish}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            Go to Dashboard <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={next}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            Continue <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-gray-600">
      <span className="text-indigo-500">{icon}</span>
      {text}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50/50">
      <span className="text-sm text-gray-700">{label}</span>
      <button onClick={() => onChange(!checked)} className={cn("w-10 h-5 rounded-full transition-colors relative", checked ? "bg-indigo-600" : "bg-gray-300")}>
        <span className={cn("absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform", checked ? "translate-x-5" : "translate-x-0")} />
      </button>
    </div>
  );
}
