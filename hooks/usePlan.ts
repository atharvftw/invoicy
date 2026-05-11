"use client";

import { useUser } from "@clerk/nextjs";

export type PlanId = "free" | "pro" | "enterprise";

export function usePlan() {
  const { user, isLoaded } = useUser();
  const planId = (user?.publicMetadata?.plan as PlanId) || "free";
  const isPro = planId === "pro" || planId === "enterprise";
  const isEnterprise = planId === "enterprise";
  // Backwards compat
  const isPremium = isPro || isEnterprise;
  return { planId, isPro, isEnterprise, isPremium, isLoaded };
}
