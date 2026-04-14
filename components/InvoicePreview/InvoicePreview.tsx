"use client";

import { Invoice, CURRENCY_SYMBOLS, InvoiceTheme } from "@/types/invoice";
import { formatDate } from "@/lib/utils";
import QRCodeComponent from "./QRCodeComponent";

const PREVIEW_THEME: Record<InvoiceTheme, { headerBg: string; balanceBg: string; accentColor: string; pageColor: string }> = {
  classic:   { headerBg: "#2d2d2d", balanceBg: "#f2f2f2", accentColor: "#2d2d2d", pageColor: "#ffffff" },
  minimal:   { headerBg: "#6b7280", balanceBg: "#f9fafb", accentColor: "#6b7280", pageColor: "#ffffff" },
  modern:    { headerBg: "#4f46e5", balanceBg: "#eef2ff", accentColor: "#4f46e5", pageColor: "#ffffff" },
  corporate: { headerBg: "#0f4c81", balanceBg: "#e8f0f8", accentColor: "#0f4c81", pageColor: "#ffffff" },
  retro:     { headerBg: "#92400e", balanceBg: "#fdf0e0", accentColor: "#92400e", pageColor: "#fdf6e3" },
};

interface Props {
  invoice: Invoice;
}

export default function InvoicePreview({ invoice }: Props) {
  const theme = PREVIEW_THEME[invoice.theme] ?? PREVIEW_THEME.classic;
  const sym = CURRENCY_SYMBOLS[invoice.currency];
  const fmt = (n: number) =>
    `${sym}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const discountAmount = invoice.subtotal * (invoice.discount / 100);
  const afterDiscount = invoice.subtotal - discountAmount;
  const taxAmount = afterDiscount * (invoice.tax / 100);
  const hasDiscount = invoice.discount > 0;
  const hasTax = invoice.tax > 0;
  const hasShipping = invoice.shipping > 0;
  const showSubtotal = hasDiscount || hasTax || hasShipping;

  const metaRows = [
    { label: "Date:", value: formatDate(invoice.date) },
    { label: "Payment Terms:", value: invoice.payment_terms },
    { label: "Due Date:", value: formatDate(invoice.due_date) },
    { label: "PO Number:", value: invoice.po_number },
  ].filter((r) => r.value && r.value.trim() !== "");

  return (
    <div
      className="paper rounded-lg w-full overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        padding: "32px 32px",
        fontSize: 11,
        color: "#2d2d2d",
        lineHeight: 1.5,
        boxSizing: "border-box",
        backgroundColor: theme.pageColor,
      }}
    >
      {/* ── TOP: Logo + INVOICE ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {invoice.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={invoice.logo} alt="Logo" style={{ maxWidth: 100, maxHeight: 60, objectFit: "contain" }} />
          ) : (
            <div style={{ width: 80 }} />
          )}
          {invoice.subtitle && (
            <div style={{ fontSize: 8, color: "#999", maxWidth: 120 }}>{invoice.subtitle}</div>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 1, color: "#1a1a1a", lineHeight: 1 }}>
            INVOICE
          </div>
          {invoice.invoice_number && (
            <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
              # {invoice.invoice_number}
            </div>
          )}
        </div>
      </div>

      {/* ── MIDDLE: From/BillTo (left) + Meta table (right) ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16 }}>

        {/* LEFT: From + Bill To — allow shrinking */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          {invoice.from.name && (
            <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 10, color: "#1a1a1a" }}>
              From {invoice.from.name},
            </div>
          )}
          <div>
            <div style={{ fontSize: 9, color: "#aaa", marginBottom: 2 }}>Bill To:</div>
            {invoice.bill_to.name ? (
              <div style={{ fontWeight: 700, fontSize: 11, color: "#1a1a1a" }}>{invoice.bill_to.name}</div>
            ) : (
              <div style={{ fontSize: 10, color: "#ccc", fontStyle: "italic" }}>Client name</div>
            )}
            {invoice.bill_to.address && (
              <div style={{ fontSize: 9, color: "#777", marginTop: 1 }}>{invoice.bill_to.address}</div>
            )}
            {invoice.bill_to.email && (
              <div style={{ fontSize: 9, color: "#777" }}>{invoice.bill_to.email}</div>
            )}
            {invoice.bill_to.phone && (
              <div style={{ fontSize: 9, color: "#777" }}>{invoice.bill_to.phone}</div>
            )}
          </div>
        </div>

        {/* RIGHT: Meta rows + Balance Due — fixed width, don't shrink */}
        <div style={{ flex: "0 0 200px", width: 200 }}>
          {metaRows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee",
                paddingTop: 5,
                paddingBottom: 5,
                gap: 8,
              }}
            >
              <span style={{ fontSize: 9, color: "#aaa", flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#1a1a1a", textAlign: "right" }}>{row.value}</span>
            </div>
          ))}

          {/* Balance Due */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: theme.balanceBg,
              padding: "7px 8px",
              marginTop: 3,
              gap: 8,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a", flexShrink: 0 }}>Balance Due:</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a", textAlign: "right" }}>{fmt(invoice.balance_due)}</span>
          </div>
        </div>
      </div>

      {/* ── LINE ITEMS TABLE ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
        <thead>
          <tr style={{ backgroundColor: theme.headerBg }}>
            <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 8, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Item
            </th>
            <th style={{ textAlign: "right", padding: "8px 10px", fontSize: 8, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5, width: 50 }}>
              Qty
            </th>
            <th style={{ textAlign: "right", padding: "8px 10px", fontSize: 8, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5, width: 70 }}>
              Rate
            </th>
            <th style={{ textAlign: "right", padding: "8px 10px", fontSize: 8, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5, width: 70 }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px 10px", fontWeight: 700, fontSize: 10, color: item.name ? "#1a1a1a" : "#ccc", fontStyle: item.name ? "normal" : "italic" }}>
                {item.name || "Item description"}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 10, color: "#666" }}>
                {item.quantity}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 10, color: "#666" }}>
                {fmt(item.rate)}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 10, color: "#1a1a1a" }}>
                {fmt(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── TOTALS ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24, marginTop: 4 }}>
        <div style={{ minWidth: 200 }}>
          {showSubtotal && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", gap: 24 }}>
              <span style={{ fontSize: 9, color: "#888" }}>Subtotal:</span>
              <span style={{ fontSize: 9, color: "#2d2d2d" }}>{fmt(invoice.subtotal)}</span>
            </div>
          )}
          {hasDiscount && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", gap: 24 }}>
              <span style={{ fontSize: 9, color: "#888" }}>Discount ({invoice.discount}%):</span>
              <span style={{ fontSize: 9, color: "#c00" }}>−{fmt(discountAmount)}</span>
            </div>
          )}
          {hasTax && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", gap: 24 }}>
              <span style={{ fontSize: 9, color: "#888" }}>Tax ({invoice.tax}%):</span>
              <span style={{ fontSize: 9, color: "#2d2d2d" }}>{fmt(taxAmount)}</span>
            </div>
          )}
          {hasShipping && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", gap: 24 }}>
              <span style={{ fontSize: 9, color: "#888" }}>Shipping:</span>
              <span style={{ fontSize: 9, color: "#2d2d2d" }}>{fmt(invoice.shipping)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", gap: 24 }}>
            <span style={{ fontSize: 9, color: "#888" }}>Total:</span>
            <span style={{ fontSize: 9, color: "#2d2d2d" }}>{fmt(invoice.total)}</span>
          </div>
          {invoice.amount_paid > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", gap: 24 }}>
              <span style={{ fontSize: 9, color: "#888" }}>Amount Paid:</span>
              <span style={{ fontSize: 9, color: "#2d2d2d" }}>{fmt(invoice.amount_paid)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER: Notes + Terms + QR ── */}
      {(invoice.notes || invoice.terms || invoice.payment_qr) && (
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
            borderTop: "1px solid #eee",
            paddingTop: 16,
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            {invoice.notes && (
              <div>
                <div style={{ fontSize: 8, color: "#aaa", marginBottom: 3 }}>{invoice.notes_label || "Notes"}:</div>
                <div style={{ fontSize: 9, color: "#2d2d2d", lineHeight: 1.6 }}>{invoice.notes}</div>
              </div>
            )}
            {invoice.terms && (
              <div>
                <div style={{ fontSize: 8, color: "#aaa", marginBottom: 3 }}>{invoice.terms_label || "Terms"}:</div>
                <div style={{ fontSize: 9, color: "#2d2d2d", lineHeight: 1.6 }}>{invoice.terms}</div>
              </div>
            )}
            {(invoice.custom_sections ?? []).filter(s => s.content).map((section) => (
              <div key={section.id}>
                <div style={{ fontSize: 8, color: "#aaa", marginBottom: 3 }}>{section.label || "Section"}:</div>
                <div style={{ fontSize: 9, color: "#2d2d2d", lineHeight: 1.6 }}>{section.content}</div>
              </div>
            ))}
          </div>
          {invoice.payment_qr && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
              <QRCodeComponent value={invoice.payment_qr} size={64} />
              <div style={{ fontSize: 8, color: "#aaa" }}>Scan to pay</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
