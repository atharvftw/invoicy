"use client";

import { useState } from "react";
import { Check, Crown, Zap, Building2, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { usePlan } from "@/hooks/usePlan";
import { useRazorpay } from "@/hooks/useRazorpay";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
  const { planId: currentPlanId, isLoaded } = usePlan();
  const { user } = useUser();
  const { openCheckout, createOrder, verifyPayment, loading } = useRazorpay();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const planList = Object.values(PLANS);

  async function handleUpgrade(planId: "pro" | "enterprise") {
    setProcessingPlan(planId);
    try {
      const order = await createOrder(planId, billing);
      if (!order) return;

      await openCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        orderId: order.orderId,
        name: "Invoicy",
        description: `${PLANS[planId].name} — ${billing}`,
        prefill: {
          name: user?.fullName || user?.firstName || undefined,
          email: user?.primaryEmailAddress?.emailAddress || undefined,
          contact: user?.primaryPhoneNumber?.phoneNumber || undefined,
        },
        onSuccess: async (response) => {
          const verified = await verifyPayment(response);
          if (verified.success) {
            // Update user plan status
            await fetch("/api/user/update-plan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                planId,
                billing,
                paymentId: response.razorpay_payment_id,
              }),
            });
            // Reload user metadata
            await user?.reload();
            alert("Payment successful! Your plan has been upgraded.");
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        onDismiss: () => setProcessingPlan(null),
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setProcessingPlan(null);
    }
  }

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={24} />
      </div>
    );
  }

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
          Yearly <span className="text-[10px] text-green-600 font-semibold ml-1">Save 17%</span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planList.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPopular = plan.id === "pro";
          const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
          const displayPrice = price === 0 ? "₹0" : `₹${price.toLocaleString("en-IN")}`;
          const period = billing === "yearly" ? "/year" : "/month";

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border p-5 flex flex-col",
                isPopular
                  ? "border-indigo-200 bg-indigo-50/40 shadow-sm"
                  : "border-gray-100 bg-white"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isPopular ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500")}>
                  {plan.id === "free" && <Zap size={18} />}
                  {plan.id === "pro" && <Crown size={18} />}
                  {plan.id === "enterprise" && <Building2 size={18} />}
                </div>
                <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
              </div>

              <p className="text-sm text-gray-500 mb-3">{plan.description}</p>

              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">{displayPrice}</span>
                <span className="text-sm text-gray-400">{period}</span>
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

              {plan.id === "free" ? (
                <button
                  disabled={isCurrent}
                  className={cn(
                    "w-full py-2.5 rounded-lg text-sm font-semibold transition-colors",
                    isCurrent
                      ? "bg-gray-100 text-gray-400 cursor-default"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  )}
                >
                  {isCurrent ? "Current Plan" : "Downgrade"}
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id as "pro" | "enterprise")}
                  disabled={isCurrent || processingPlan === plan.id || loading}
                  className={cn(
                    "w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                    isCurrent
                      ? "bg-gray-100 text-gray-400 cursor-default"
                      : isPopular
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  )}
                >
                  {processingPlan === plan.id || loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
                </button>
              )}
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
