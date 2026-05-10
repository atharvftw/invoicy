"use client";

import { useState } from "react";
import { Check, Crown, Zap, Building2 } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "For freelancers just getting started",
    icon: <Zap size={18} />,
    features: [
      "Unlimited invoices",
      "PDF export with watermark",
      "3 email reminders/month",
      "Basic client management",
      "Dashboard analytics",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For growing businesses",
    icon: <Crown size={18} />,
    popular: true,
    features: [
      "Everything in Free",
      "Unlimited email reminders",
      "Remove PDF watermark",
      "5 invoice themes",
      "AI client intelligence",
      "Smart collections agent",
      "Automation rules",
      "Bulk CSV import/export",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    disabled: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹1,999",
    period: "/month",
    description: "For teams and agencies",
    icon: <Building2 size={18} />,
    features: [
      "Everything in Pro",
      "Team collaboration (up to 10)",
      "Custom integrations",
      "API access",
      "Dedicated account manager",
      "Custom reports & analytics",
      "White-label client portal",
      "SSO & advanced security",
    ],
    cta: "Contact Sales",
    disabled: false,
  },
];

export default function SubscriptionPage() {
  const { isPremium } = usePlan();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoicy Plans</h1>
        <p className="text-sm text-gray-500 mt-1">Choose the plan that fits your business</p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={cn("text-sm font-medium", billing === "monthly" ? "text-gray-900" : "text-gray-400")}>Monthly</span>
        <button
          onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
          className={cn("w-11 h-6 rounded-full transition-colors relative", billing === "yearly" ? "bg-indigo-600" : "bg-gray-300")}
        >
          <span className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", billing === "yearly" ? "translate-x-5" : "translate-x-0")} />
        </button>
        <span className={cn("text-sm font-medium", billing === "yearly" ? "text-gray-900" : "text-gray-400")}>
          Yearly <span className="text-[10px] text-green-600 font-semibold ml-1">Save 20%</span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === "free" && !isPremium;
          const yearlyPrice = billing === "yearly"
            ? `₹${Math.round(Number(plan.price.replace("₹", "").replace(",", "")) * 0.8 * 12).toLocaleString("en-IN")}`
            : plan.price;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border p-5 flex flex-col",
                plan.popular
                  ? "border-indigo-200 bg-indigo-50/40 shadow-sm"
                  : "border-gray-100 bg-white"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", plan.popular ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500")}>
                  {plan.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
              </div>

              <p className="text-sm text-gray-500 mb-3">{plan.description}</p>

              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">{billing === "yearly" && plan.id !== "free" ? yearlyPrice : plan.price}</span>
                <span className="text-sm text-gray-400">{plan.period}</span>
                {billing === "yearly" && plan.id !== "free" && (
                  <p className="text-[11px] text-gray-400">billed annually</p>
                )}
              </div>

              <ul className="space-y-2.5 mb-5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent || plan.disabled}
                className={cn(
                  "w-full py-2.5 rounded-lg text-sm font-semibold transition-colors",
                  isCurrent
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
                )}
              >
                {isCurrent ? "Current Plan" : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-sm font-medium text-gray-800 mb-1">Can I cancel anytime?</p>
            <p className="text-sm text-gray-500">Yes. You can cancel your subscription at any time and continue using your current plan until the end of the billing period.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-sm font-medium text-gray-800 mb-1">Do you offer refunds?</p>
            <p className="text-sm text-gray-500">We offer a 14-day money-back guarantee. If you&apos;re not satisfied, contact support for a full refund.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-sm font-medium text-gray-800 mb-1">What payment methods are accepted?</p>
            <p className="text-sm text-gray-500">We accept UPI, credit/debit cards, and net banking via Razorpay. International cards are also supported.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-sm font-medium text-gray-800 mb-1">Is my data secure?</p>
            <p className="text-sm text-gray-500">Yes. All data is encrypted in transit and at rest. We use industry-standard security practices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
