export type Currency = "INR" | "USD" | "EUR" | "GBP";
export type InvoiceStatus = "draft" | "sent" | "paid" | "partially_paid" | "overdue";
export type InvoiceTheme = "classic" | "minimal" | "modern" | "corporate" | "retro";

export interface Party {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface ShipTo {
  name: string;
  address: string;
}

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CustomSection {
  id: string;
  label: string;
  content: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  gstin?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Recurrence {
  frequency: "weekly" | "monthly" | "quarterly";
  nextDate: string;
  active: boolean;
}

export interface RecurringSchedule {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: Currency;
  frequency: "weekly" | "monthly" | "quarterly";
  startDate: string;
  endDate?: string;
  active: boolean;
  autoGenerate: boolean;
  lastGenerated?: string;
  nextDate: string;
  created_at: string;
}

export type ReminderChannel = "email" | "whatsapp" | "both";
export type ReminderTone = "friendly" | "firm";
export type ReminderTrigger = "pre_due" | "due_date" | "overdue";

export interface ReminderSchedule {
  id: string;
  trigger: ReminderTrigger;
  daysOffset: number; // days before/after trigger
  channel: ReminderChannel;
  active: boolean;
  created_at: string;
}

export interface ReminderTemplate {
  id: string;
  trigger: ReminderTrigger;
  tone: ReminderTone;
  subject: string;
  body: string;
  active: boolean;
}

export interface LateFeeConfig {
  enabled: boolean;
  type: "percentage" | "fixed";
  value: number;
  gracePeriodDays: number;
}

export interface PaymentTransaction {
  id: string;
  invoiceId?: string;
  clientName: string;
  amount: number;
  currency: Currency;
  method: "upi" | "bank_transfer" | "cash" | "card" | "other";
  reference?: string;
  date: string;
  matched: boolean;
  notes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  from: Party;
  bill_to: Party;
  ship_to?: ShipTo;
  items: LineItem[];
  subtotal: number;
  discount: number;       // percentage
  tax: number;            // percentage
  shipping: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  status: InvoiceStatus;
  notes: string;
  notes_label: string;
  terms: string;
  terms_label: string;
  custom_sections: CustomSection[];
  currency: Currency;
  theme: InvoiceTheme;
  payment_qr?: string;    // UPI ID or URL
  logo?: string;          // base64
  subtitle?: string;      // tagline below logo
  signature?: string;     // base64
  recurrence?: Recurrence;
  date: string;
  due_date: string;
  payment_terms: string;
  po_number: string;
  created_at: string;
  updated_at: string;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  INR: "INR ₹",
  USD: "USD $",
  EUR: "EUR €",
  GBP: "GBP £",
};

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  partially_paid: "Partially Paid",
  overdue: "Overdue",
};

export const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  partially_paid: "bg-amber-100 text-amber-700",
  overdue: "bg-rose-100 text-rose-700",
};

export function createEmptyInvoice(): Invoice {
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 30);

  return {
    id: "",
    invoice_number: "",
    from: { name: "", address: "", email: "", phone: "" },
    bill_to: { name: "", address: "", email: "", phone: "" },
    ship_to: undefined,
    items: [{ id: crypto.randomUUID(), name: "", quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    amount_paid: 0,
    balance_due: 0,
    status: "draft",
    notes: "",
    notes_label: "Notes",
    terms: "",
    terms_label: "Terms",
    custom_sections: [],
    currency: "INR",
    theme: "classic",
    payment_qr: "",
    logo: "",
    subtitle: "",
    signature: "",
    recurrence: undefined,
    date: now.toISOString().split("T")[0],
    due_date: due.toISOString().split("T")[0],
    payment_terms: "Net 30",
    po_number: "",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

export function calculateInvoiceTotals(invoice: Invoice): Invoice {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = subtotal * (invoice.discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (invoice.tax / 100);
  const total = afterDiscount + taxAmount + invoice.shipping;
  const balance_due = total - invoice.amount_paid;

  return {
    ...invoice,
    subtotal,
    total,
    balance_due,
  };
}
