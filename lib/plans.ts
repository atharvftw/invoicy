export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercent: number;
  razorpayMonthlyId: string; // Plan ID from Razorpay dashboard
  razorpayYearlyId: string;
  features: string[];
  maxClients: number;
  maxInvoicesPerMonth: number;
  hasAI: boolean;
  hasEmailReminders: boolean;
  hasClientPortal: boolean;
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    description: "For solo freelancers getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscountPercent: 0,
    razorpayMonthlyId: "",
    razorpayYearlyId: "",
    features: [
      "Up to 5 clients",
      "10 invoices / month",
      "Basic invoice templates",
      "PDF export",
      "Email delivery",
    ],
    maxClients: 5,
    maxInvoicesPerMonth: 10,
    hasAI: false,
    hasEmailReminders: false,
    hasClientPortal: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For growing agencies that need automation",
    monthlyPrice: 1499,
    yearlyPrice: 14990,
    yearlyDiscountPercent: 17,
    razorpayMonthlyId: "plan_InvoicyProMonthly", // replace with actual Razorpay plan IDs
    razorpayYearlyId: "plan_InvoicyProYearly",
    features: [
      "Unlimited clients",
      "Unlimited invoices",
      "AI voice-to-invoice",
      "Auto-tax intelligence (GST/HSN)",
      "Smart follow-ups (AI tone)",
      "Client intelligence dashboard",
      "Custom branding & logo",
      "Priority support",
    ],
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    hasAI: true,
    hasEmailReminders: true,
    hasClientPortal: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams with custom workflows",
    monthlyPrice: 3999,
    yearlyPrice: 39990,
    yearlyDiscountPercent: 17,
    razorpayMonthlyId: "plan_InvoicyEnterpriseMonthly",
    razorpayYearlyId: "plan_InvoicyEnterpriseYearly",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations (ERP/CRM)",
      "Team roles & permissions",
      "White-label client portal",
      "SLA & phone support",
      "API access",
    ],
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    hasAI: true,
    hasEmailReminders: true,
    hasClientPortal: true,
  },
};

export type PlanId = keyof typeof PLANS;
