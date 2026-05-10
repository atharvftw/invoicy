"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EmailTone = "professional" | "casual" | "firm" | "friendly" | "urgent";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

interface EmailStore {
  smtp: SmtpConfig | null;
  defaultTone: EmailTone;
  logoUrl: string | null;
  setSmtp: (config: SmtpConfig | null) => void;
  setDefaultTone: (tone: EmailTone) => void;
  setLogoUrl: (url: string | null) => void;
  isConfigured: () => boolean;
}

export const useEmailStore = create<EmailStore>()(
  persist(
    (set, get) => ({
      smtp: null,
      defaultTone: "professional",
      logoUrl: null,
      setSmtp: (config) => set({ smtp: config }),
      setDefaultTone: (tone) => set({ defaultTone: tone }),
      setLogoUrl: (url) => set({ logoUrl: url }),
      isConfigured: () => {
        const s = get().smtp;
        return !!s && !!s.host && !!s.user && !!s.password && !!s.fromEmail;
      },
    }),
    { name: "invoicy-email" }
  )
);

export const TONE_DESCRIPTIONS: Record<EmailTone, string> = {
  professional: "Formal and respectful — ideal for enterprise clients",
  casual: "Relaxed and warm — good for long-term relationships",
  firm: "Direct and assertive — for overdue payments",
  friendly: "Cheerful and approachable — for pre-due nudges",
  urgent: "Serious and time-sensitive — for critical overdue",
};

export const TONE_LABELS: Record<EmailTone, string> = {
  professional: "Professional",
  casual: "Casual",
  firm: "Firm",
  friendly: "Friendly",
  urgent: "Urgent",
};
