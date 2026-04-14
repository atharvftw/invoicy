"use client";

import { useUser } from "@clerk/nextjs";

export function usePlan() {
  const { user, isLoaded } = useUser();
  const isPremium = isLoaded && user?.publicMetadata?.plan === "premium";
  return { isPremium, isLoaded };
}
