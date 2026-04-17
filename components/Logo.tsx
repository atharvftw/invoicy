"use client";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "mark" | "full" | "wordmark";
  size?: number;
  className?: string;
  dark?: boolean;
}

export default function Logo({ variant = "full", size = 32, className, dark = false }: LogoProps) {
  const Mark = () => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
      <path d="M22 8L14 21h8l-4 11L26 19h-7l3-11z" fill="white" fillOpacity="0.95" strokeLinejoin="round" />
    </svg>
  );

  const textColor = dark ? "text-white" : "text-gray-900";

  if (variant === "mark") return <Mark />;
  if (variant === "wordmark") {
    return <span className={cn("font-display font-bold tracking-tight text-xl", textColor, className)}>invoicy</span>;
  }
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Mark />
      <span className={cn("font-display font-bold tracking-tight text-xl leading-none", textColor)}>invoicy</span>
    </div>
  );
}
