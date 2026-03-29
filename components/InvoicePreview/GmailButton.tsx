"use client";

import { Mail } from "lucide-react";
import { Invoice, CURRENCY_SYMBOLS } from "@/types/invoice";
import { formatDate } from "@/lib/utils";

interface Props {
  invoice: Invoice;
}

function buildEmailBody(invoice: Invoice): string {
  const sym = CURRENCY_SYMBOLS[invoice.currency];
  const clientName = invoice.bill_to.name || "there";
  const fromName = invoice.from.name || "Us";
  const itemNames = invoice.items
    .filter((i) => i.name)
    .map((i) => i.name)
    .join(", ");

  // Detect payment type from amount_paid vs total
  let paymentType = "";
  if (invoice.amount_paid === 0) {
    paymentType = "full payment";
  } else if (invoice.amount_paid >= invoice.total) {
    paymentType = "final payment";
  } else if (invoice.amount_paid > 0) {
    paymentType = "advance payment";
  } else {
    paymentType = "payment";
  }

  const lines: string[] = [];

  lines.push(`Hey ${clientName},`);
  lines.push("");
  lines.push(
    `Please find attached the invoice #${invoice.invoice_number || "—"} for the ${paymentType}${itemNames ? ` of ${itemNames}` : ""}.`
  );
  lines.push("");

  // Invoice summary
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`Invoice #: ${invoice.invoice_number || "—"}`);
  if (invoice.date) lines.push(`Date: ${formatDate(invoice.date)}`);
  if (invoice.due_date) lines.push(`Due Date: ${formatDate(invoice.due_date)}`);
  if (invoice.payment_terms) lines.push(`Terms: ${invoice.payment_terms}`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("");

  // Items
  if (invoice.items.filter((i) => i.name).length > 0) {
    lines.push("Items:");
    invoice.items
      .filter((i) => i.name)
      .forEach((item) => {
        lines.push(`  • ${item.name} — ${item.quantity} × ${sym}${item.rate} = ${sym}${item.amount}`);
      });
    lines.push("");
  }

  // Financials
  lines.push(`Total: ${sym}${invoice.total.toLocaleString("en-IN")}`);
  if (invoice.amount_paid > 0) {
    lines.push(`Amount Paid: ${sym}${invoice.amount_paid.toLocaleString("en-IN")}`);
  }
  lines.push(`Balance Due: ${sym}${invoice.balance_due.toLocaleString("en-IN")}`);
  lines.push("");

  // Payment link / QR
  if (invoice.payment_qr) {
    const isUrl = invoice.payment_qr.startsWith("http");
    if (isUrl) {
      lines.push(`💳 Payment Link: ${invoice.payment_qr}`);
    } else {
      lines.push(`💳 UPI ID: ${invoice.payment_qr}`);
    }
    lines.push("");
  }

  // Custom sections (bank details, IFSC, etc.)
  const allSections = [
    ...(invoice.notes ? [{ label: invoice.notes_label || "Notes", content: invoice.notes }] : []),
    ...(invoice.terms ? [{ label: invoice.terms_label || "Terms", content: invoice.terms }] : []),
    ...(invoice.custom_sections ?? []).filter((s) => s.content),
  ];

  if (allSections.length > 0) {
    allSections.forEach((section) => {
      lines.push(`${section.label}:`);
      lines.push(section.content);
      lines.push("");
    });
  }

  lines.push("Please feel free to reach out if you have any questions.");
  lines.push("");
  lines.push(`Best regards,`);
  lines.push(fromName);
  if (invoice.from.email) lines.push(invoice.from.email);
  if (invoice.from.phone) lines.push(invoice.from.phone);

  return lines.join("\n");
}

export default function GmailButton({ invoice }: Props) {
  function handleClick() {
    const to = invoice.bill_to.email || "";
    const subject = `Invoice #${invoice.invoice_number || "—"} from ${invoice.from.name || "Us"}`;
    const body = buildEmailBody(invoice);

    // Gmail compose URL
    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(to)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank");
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg
        bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50
        text-gray-700 text-sm font-medium shadow-sm
        transition-all duration-150"
      title="Send via Gmail"
    >
      <Mail size={15} className="text-red-500" />
      Email
    </button>
  );
}
