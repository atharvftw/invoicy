"use client";

import { usePlan, PlanId } from "@/hooks/usePlan";
import { Lock } from "lucide-react";

interface PlanGateProps {
  requiredPlan: PlanId | "pro";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PlanGate({ requiredPlan, children, fallback }: PlanGateProps) {
  const { planId, isLoaded } = usePlan();

  if (!isLoaded) return null;

  const planHierarchy: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    enterprise: 2,
  };

  const hasAccess = planHierarchy[planId] >= planHierarchy[requiredPlan as PlanId];

  if (hasAccess) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative group">
      <div className="opacity-40 pointer-events-none select-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-10">
        <Lock size={20} className="text-gray-400 mb-1" />
        <p className="text-xs font-medium text-gray-500">
          {requiredPlan === "pro" ? "Pro plan required" : `${requiredPlan} plan required`}
        </p>
      </div>
    </div>
  );
}
