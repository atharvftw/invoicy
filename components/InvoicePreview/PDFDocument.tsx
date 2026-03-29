"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Invoice, Currency } from "@/types/invoice";

// Helvetica doesn't support ₹ (U+20B9) or € (U+20AC) — use text fallbacks
const PDF_CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "Rs. ",
  USD: "$",
  EUR: "EUR ",
  GBP: "\u00a3",
};
import { formatDate } from "@/lib/utils";

const C = {
  dark: "#2d2d2d",
  mid: "#555555",
  light: "#888888",
  border: "#e0e0e0",
  balanceBg: "#f0f0f0",
  white: "#ffffff",
  page: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.dark,
    backgroundColor: C.page,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 52,
  },

  /* ── TOP HEADER ── */
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  logo: {
    maxWidth: 110,
    maxHeight: 70,
    objectFit: "contain",
  },
  logoPlaceholder: {
    width: 110,
  },
  logoSubtitle: {
    fontSize: 7,
    color: C.light,
    marginTop: 3,
    maxWidth: 120,
  },
  invoiceTitleBlock: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    letterSpacing: 1,
  },
  invoiceNumber: {
    fontSize: 13,
    color: C.mid,
    marginTop: 2,
  },

  /* ── MIDDLE: from/billto  +  meta table ── */
  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  fromBlock: {
    flexDirection: "column",
    gap: 6,
    maxWidth: 220,
  },
  fromName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 8,
  },
  billToLabel: {
    fontSize: 9,
    color: C.light,
    marginBottom: 2,
  },
  billToName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
  },
  billToDetail: {
    fontSize: 9,
    color: C.mid,
    marginTop: 1,
    lineHeight: 1.5,
  },

  /* Meta table (right side) */
  metaTable: {
    minWidth: 280,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 4,
    borderBottom: `1px solid ${C.border}`,
  },
  metaLabel: {
    fontSize: 9,
    color: C.light,
    width: 110,
    textAlign: "right",
    paddingRight: 16,
  },
  metaValue: {
    fontSize: 9,
    color: C.dark,
    fontFamily: "Helvetica-Bold",
    width: 130,
    textAlign: "right",
  },
  /* Balance Due highlighted row */
  balanceRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: C.balanceBg,
    paddingVertical: 6,
    marginTop: 2,
  },
  balanceLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    width: 110,
    textAlign: "right",
    paddingRight: 16,
  },
  balanceValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    width: 130,
    textAlign: "right",
  },

  /* ── LINE ITEMS TABLE ── */
  tableContainer: {
    marginBottom: 20,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: C.dark,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  thItem: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  thRight: {
    width: 72,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "right",
  },
  tableDataRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottom: `1px solid ${C.border}`,
  },
  tdItem: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
  },
  tdRight: {
    width: 72,
    fontSize: 10,
    color: C.mid,
    textAlign: "right",
  },
  tdAmount: {
    width: 72,
    fontSize: 10,
    color: C.dark,
    textAlign: "right",
  },

  /* ── TOTALS ── */
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    marginBottom: 28,
  },
  totalsBox: {
    minWidth: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: C.mid,
    paddingRight: 20,
  },
  totalValue: {
    fontSize: 9,
    color: C.dark,
  },

  /* ── FOOTER: notes + terms + QR ── */
  footerRow: {
    flexDirection: "row",
    gap: 32,
    alignItems: "flex-start",
  },
  footerTextBlock: {
    flex: 1,
    gap: 12,
  },
  footerSectionLabel: {
    fontSize: 9,
    color: C.light,
    marginBottom: 3,
  },
  footerSectionText: {
    fontSize: 9,
    color: C.dark,
    lineHeight: 1.6,
  },
  qrBlock: {
    alignItems: "center",
    gap: 4,
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  qrLabel: {
    fontSize: 7,
    color: C.light,
    textAlign: "center",
  },
});

interface Props {
  invoice: Invoice;
  qrDataUrl?: string;
}

export default function PDFDocument({ invoice, qrDataUrl }: Props) {
  const sym = PDF_CURRENCY_SYMBOLS[invoice.currency];
  const fmt = (n: number) =>
    `${sym}${n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── TOP: Logo + INVOICE title ── */}
        <View style={styles.topRow}>
          {/* Logo or empty space */}
          <View>
            {invoice.logo ? (
              <Image src={invoice.logo} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder} />
            )}
            {invoice.subtitle ? (
              <Text style={styles.logoSubtitle}>{invoice.subtitle}</Text>
            ) : null}
          </View>

          {/* INVOICE + # */}
          <View style={styles.invoiceTitleBlock}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            {invoice.invoice_number ? (
              <Text style={styles.invoiceNumber}># {invoice.invoice_number}</Text>
            ) : null}
          </View>
        </View>

        {/* ── MIDDLE: From/BillTo  +  Meta table ── */}
        <View style={styles.middleRow}>
          {/* Left: From + Bill To */}
          <View style={styles.fromBlock}>
            {invoice.from.name ? (
              <Text style={styles.fromName}>From {invoice.from.name},</Text>
            ) : null}

            <View>
              <Text style={styles.billToLabel}>Bill To:</Text>
              {invoice.bill_to.name ? (
                <Text style={styles.billToName}>{invoice.bill_to.name}</Text>
              ) : (
                <Text style={styles.billToDetail}>—</Text>
              )}
              {invoice.bill_to.address ? (
                <Text style={styles.billToDetail}>{invoice.bill_to.address}</Text>
              ) : null}
              {invoice.bill_to.email ? (
                <Text style={styles.billToDetail}>{invoice.bill_to.email}</Text>
              ) : null}
              {invoice.bill_to.phone ? (
                <Text style={styles.billToDetail}>{invoice.bill_to.phone}</Text>
              ) : null}
            </View>
          </View>

          {/* Right: meta table + balance due */}
          <View style={styles.metaTable}>
            {metaRows.map((row) => (
              <View key={row.label} style={styles.metaRow}>
                <Text style={styles.metaLabel}>{row.label}</Text>
                <Text style={styles.metaValue}>{row.value}</Text>
              </View>
            ))}
            {/* Balance Due highlighted row */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Balance Due:</Text>
              <Text style={styles.balanceValue}>{fmt(invoice.balance_due)}</Text>
            </View>
          </View>
        </View>

        {/* ── LINE ITEMS TABLE ── */}
        <View style={styles.tableContainer}>
          {/* Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={styles.thItem}>Item</Text>
            <Text style={styles.thRight}>Quantity</Text>
            <Text style={styles.thRight}>Rate</Text>
            <Text style={styles.thRight}>Amount</Text>
          </View>

          {/* Rows */}
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableDataRow}>
              <Text style={styles.tdItem}>{item.name || "—"}</Text>
              <Text style={styles.tdRight}>{item.quantity}</Text>
              <Text style={styles.tdRight}>{fmt(item.rate)}</Text>
              <Text style={styles.tdAmount}>{fmt(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* ── TOTALS ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            {showSubtotal && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>{fmt(invoice.subtotal)}</Text>
              </View>
            )}
            {hasDiscount && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount ({invoice.discount}%):</Text>
                <Text style={[styles.totalValue, { color: "#cc0000" }]}>
                  -{fmt(discountAmount)}
                </Text>
              </View>
            )}
            {hasTax && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoice.tax}%):</Text>
                <Text style={styles.totalValue}>{fmt(taxAmount)}</Text>
              </View>
            )}
            {hasShipping && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping:</Text>
                <Text style={styles.totalValue}>{fmt(invoice.shipping)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{fmt(invoice.total)}</Text>
            </View>
            {invoice.amount_paid > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Amount Paid:</Text>
                <Text style={styles.totalValue}>{fmt(invoice.amount_paid)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── FOOTER: Notes + Terms + QR ── */}
        {(invoice.notes || invoice.terms || (invoice.custom_sections ?? []).some(s => s.content) || (invoice.payment_qr && qrDataUrl)) && (
          <View style={styles.footerRow}>
            <View style={styles.footerTextBlock}>
              {invoice.notes ? (
                <View>
                  <Text style={styles.footerSectionLabel}>{invoice.notes_label || "Notes"}:</Text>
                  <Text style={styles.footerSectionText}>{invoice.notes}</Text>
                </View>
              ) : null}
              {invoice.terms ? (
                <View>
                  <Text style={styles.footerSectionLabel}>{invoice.terms_label || "Terms"}:</Text>
                  <Text style={styles.footerSectionText}>{invoice.terms}</Text>
                </View>
              ) : null}
              {(invoice.custom_sections ?? []).filter(s => s.content).map((section) => (
                <View key={section.id}>
                  <Text style={styles.footerSectionLabel}>{section.label || "Section"}:</Text>
                  <Text style={styles.footerSectionText}>{section.content}</Text>
                </View>
              ))}
            </View>

            {invoice.payment_qr && qrDataUrl ? (
              <View style={styles.qrBlock}>
                <Image src={qrDataUrl} style={styles.qrImage} />
                <Text style={styles.qrLabel}>Scan to pay</Text>
              </View>
            ) : null}
          </View>
        )}

      </Page>
    </Document>
  );
}
