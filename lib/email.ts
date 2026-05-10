import { Invoice } from "@/types/invoice";

export interface EmailPayload {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Substitute template variables with invoice data.
 * Supported vars: {client_name}, {invoice_number}, {total}, {due_date}, {balance_due}, {currency}
 */
export function substituteTemplateVars(template: string, invoice: Invoice): string {
  const map: Record<string, string> = {
    "{client_name}": invoice.bill_to.name || "Valued Client",
    "{invoice_number}": invoice.invoice_number || "Draft",
    "{total}": invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    "{balance_due}": invoice.balance_due.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    "{currency}": invoice.currency,
    "{due_date}": invoice.due_date
      ? new Date(invoice.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : "N/A",
    "{invoice_date}": new Date(invoice.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
  };

  let result = template;
  for (const [key, value] of Object.entries(map)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

/**
 * Build a professional HTML email body from a plain-text template.
 */
export function buildHtmlEmail(subject: string, body: string, invoice: Invoice): string {
  const businessName = invoice.from.name || "Your Business";
  const businessEmail = invoice.from.email || "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { margin:0; padding:0; background:#f8f9fb; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
  .container { max-width:560px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.05); }
  .header { background:#4f46e5; padding:28px 24px; text-align:center; }
  .header h1 { color:#fff; margin:0; font-size:18px; font-weight:600; }
  .content { padding:24px; color:#374151; font-size:15px; line-height:1.6; }
  .content p { margin:0 0 14px; }
  .invoice-box { background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:16px; margin:18px 0; }
  .invoice-box table { width:100%; border-collapse:collapse; font-size:13px; }
  .invoice-box td { padding:4px 0; color:#4b5563; }
  .invoice-box td:first-child { width:40%; color:#9ca3af; }
  .invoice-box .total { font-weight:600; color:#111827; font-size:15px; }
  .footer { padding:20px 24px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px solid #f3f4f6; }
  .footer a { color:#4f46e5; text-decoration:none; }
  .cta { display:inline-block; margin-top:12px; padding:10px 20px; background:#4f46e5; color:#fff; text-decoration:none; border-radius:8px; font-size:14px; font-weight:500; }
</style>
</head>
<body>
  <div style="padding:24px 12px;">
    <div class="container">
      <div class="header">
        <h1>${businessName}</h1>
      </div>
      <div class="content">
        <p style="white-space:pre-wrap">${escapeHtml(body)}</p>
        <div class="invoice-box">
          <table>
            <tr><td>Invoice #</td><td>${invoice.invoice_number || "Draft"}</td></tr>
            <tr><td>Amount</td><td class="total">${invoice.currency} ${invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
            <tr><td>Due Date</td><td>${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-IN") : "N/A"}</td></tr>
            <tr><td>Balance Due</td><td>${invoice.currency} ${invoice.balance_due.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
          </table>
        </div>
      </div>
      <div class="footer">
        <p>This email was sent from Invoicy.</p>
        ${businessEmail ? `<p>Questions? Reply to ${businessEmail}</p>` : ""}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
