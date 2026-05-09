import { Client, Invoice, PaymentTransaction, ReminderChannel, ReminderTone } from "@/types/invoice";

export interface ClientIntelligence {
  riskScore: number;
  riskLabel: "healthy" | "risky" | "critical";
  riskColor: string;
  avgDaysLate: number;
  totalInvoices: number;
  paidOnTime: number;
  paidLate: number;
  unpaidCount: number;
  collectionRate: number; // % of invoices collected
  totalBilled: number;
  totalPaid: number;
  preferredChannel: ReminderChannel;
  preferredTone: ReminderTone;
  suggestedActions: string[];
}

export function computeClientIntelligence(
  client: Client,
  invoices: Invoice[],
  payments: PaymentTransaction[]
): ClientIntelligence {
  const clientInvoices = invoices.filter(
    (inv) =>
      inv.bill_to.email.toLowerCase() === client.email.toLowerCase() ||
      inv.bill_to.name.toLowerCase() === client.name.toLowerCase()
  );

  const totalInvoices = clientInvoices.length;
  const paidInvoices = clientInvoices.filter((inv) => inv.status === "paid");
  const lateInvoices = clientInvoices.filter((inv) => inv.status === "overdue");
  const sentInvoices = clientInvoices.filter((inv) => inv.status === "sent" || inv.status === "partially_paid");

  // Calculate average days late
  let totalDaysLate = 0;
  let lateCount = 0;
  for (const inv of paidInvoices) {
    // Approximate: if paid, we don't know exact payment date, use transaction dates
    const relatedPayments = payments.filter(
      (p) =>
        p.clientName.toLowerCase() === client.name.toLowerCase() &&
        p.invoiceId === inv.id
    );
    if (relatedPayments.length > 0) {
      const latestPayment = relatedPayments.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      const due = new Date(inv.due_date);
      const paid = new Date(latestPayment.date);
      const diff = Math.max(0, (paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0) {
        totalDaysLate += diff;
        lateCount++;
      }
    }
  }

  // For overdue invoices, add days overdue to avg calculation
  const now = new Date();
  for (const inv of lateInvoices) {
    const due = new Date(inv.due_date);
    const diff = Math.max(0, (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    totalDaysLate += diff;
    lateCount++;
  }

  const avgDaysLate = lateCount > 0 ? Math.round(totalDaysLate / lateCount) : 0;

  // Risk score calculation (0-100)
  let riskScore = 0;
  if (totalInvoices > 0) {
    const overdueRatio = lateInvoices.length / totalInvoices;
    const unpaidRatio = (lateInvoices.length + sentInvoices.length) / totalInvoices;
    const lateSeverity = Math.min(avgDaysLate / 30, 1); // normalize to 30 days

    riskScore = Math.round(
      overdueRatio * 40 +       // 40% weight on overdue ratio
      unpaidRatio * 30 +        // 30% weight on unpaid ratio
      lateSeverity * 20 +       // 20% weight on how late
      (client.isVIP ? -20 : 0)  // VIP clients get risk reduction
    );
  }
  riskScore = Math.max(0, Math.min(100, riskScore));

  const riskLabel: ClientIntelligence["riskLabel"] =
    riskScore >= 60 ? "critical" : riskScore >= 30 ? "risky" : "healthy";

  const riskColor =
    riskLabel === "healthy"
      ? "bg-green-500"
      : riskLabel === "risky"
      ? "bg-amber-500"
      : "bg-rose-500";

  const totalBilled = clientInvoices.reduce((s, inv) => s + inv.total, 0);
  const totalPaid = clientInvoices.reduce((s, inv) => s + inv.amount_paid, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  // Determine preferred channel based on available data
  // Simplified: if client has WhatsApp-like phone, prefer WhatsApp
  // In real app, this would track opens/clicks
  const hasWhatsAppPhone = client.phone && /^[6-9]\d{9}$/.test(client.phone.replace(/\D/g, ""));
  const preferredChannel: ReminderChannel = hasWhatsAppPhone ? "whatsapp" : "email";

  // Determine preferred tone based on risk
  const preferredTone: ReminderTone =
    riskLabel === "critical" ? "firm" : "friendly";

  // Suggested actions
  const suggestedActions: string[] = [];
  if (riskLabel === "critical") {
    suggestedActions.push("Switch to firm tone immediately");
    suggestedActions.push("Escalate to collections workflow");
    if (client.isVIP) suggestedActions.push("VIP client — consider personal call");
  } else if (riskLabel === "risky") {
    suggestedActions.push("Send WhatsApp reminder — higher response rate");
    suggestedActions.push("Offer payment plan if balance is high");
  } else {
    suggestedActions.push("Standard friendly reminder cycle");
    if (hasWhatsAppPhone) suggestedActions.push("WhatsApp channel recommended for this client");
  }

  return {
    riskScore,
    riskLabel,
    riskColor,
    avgDaysLate,
    totalInvoices,
    paidOnTime: paidInvoices.length - lateCount,
    paidLate: lateCount,
    unpaidCount: lateInvoices.length + sentInvoices.length,
    collectionRate,
    totalBilled,
    totalPaid,
    preferredChannel,
    preferredTone,
    suggestedActions,
  };
}

export function getRiskBadgeColor(label: ClientIntelligence["riskLabel"]): string {
  switch (label) {
    case "healthy":
      return "bg-green-100 text-green-700 border-green-200";
    case "risky":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "critical":
      return "bg-rose-100 text-rose-700 border-rose-200";
  }
}

export function getRiskLabelText(label: ClientIntelligence["riskLabel"]): string {
  switch (label) {
    case "healthy":
      return "Healthy";
    case "risky":
      return "Risky";
    case "critical":
      return "Collection Risk";
  }
}
