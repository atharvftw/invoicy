# Invoicy Premium Launch — Implementation Plan

**Objective:** Ship freemium monetization, new themes, signature upload, and client management. Keep Next.js + Turso + Clerk — no backend migration.

**Stack:** Next.js 14, Clerk auth, Turso (libsql), Zustand, @react-pdf/renderer, Tailwind CSS
**Model:** Sonnet 4.6 for all implementation steps
**Total steps:** 7 (across 3 phases)
**Parallelizable:** Steps 2.1 + 2.2 can run in parallel after Step 1.3

---

## Dependency Order

```
Step 1.1 → Step 1.2 → Step 1.3
                              ↓
              Step 2.1 ──────→ Step 3.1
              Step 2.2 ──────↗
              Step 2.3 ──────→ Step 3.2
```

Phase 1 must complete before Phase 2. Steps 2.1, 2.2, 2.3 are independent of each other (parallel). Phase 3 depends on Phase 2.

---

## Phase 1 — Monetization Foundation

### Step 1.1 — Extend types and DB schema

**Context:** `Invoice` type is in `types/invoice.ts`. DB client is in `lib/db.ts`. Turso table currently: `invoices (id, user_id, data TEXT, created_at, updated_at)`. Need to add `signature` field to Invoice and a new `clients` table.

**Tasks:**
- In `types/invoice.ts`:
  - Add `signature?: string` (base64) to `Invoice` interface
  - Add `InvoiceTheme` values: `"modern" | "corporate" | "retro"` (total 5 themes)
  - Add `recurrence?: { frequency: "weekly" | "monthly" | "quarterly"; nextDate: string; active: boolean }` to `Invoice`
- Add `Client` interface and export:
  ```ts
  export interface Client {
    id: string;
    name: string;
    email: string;
    address: string;
    phone: string;
    created_at: string;
  }
  ```
- In `lib/db.ts`, add `initDB()` function that runs `CREATE TABLE IF NOT EXISTS` for:
  ```sql
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    address TEXT,
    phone TEXT,
    created_at TEXT
  );
  ```
- Call `initDB()` from `app/api/invoices/route.ts` GET handler (lazy init on first request)
- In `createEmptyInvoice()`, add `signature: ""` and `recurrence: undefined` to defaults

**Verification:** `npm run build` passes. No TypeScript errors.

**Exit criteria:** Build succeeds, `Client` type exported, `InvoiceTheme` has 5 values, `clients` table created on first API request.

---

### Step 1.2 — Razorpay subscription + Clerk plan metadata

**Context:** Clerk protects all routes via `middleware.ts`. User plan stored in `user.publicMetadata.plan`. Free tier = no plan set. Premium = `plan: "premium"`.

**Tasks:**
- Install: `npm install razorpay`
- Add env vars to `.env.local` (document in CLAUDE.md, not commit values):
  - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- Create `app/api/subscription/create-order/route.ts`:
  - POST handler: create Razorpay order for ₹299/month, return `{ orderId, amount, currency }`
  - Auth-protect with `auth()` from `@clerk/nextjs/server`
- Create `app/api/subscription/webhook/route.ts`:
  - POST handler: verify Razorpay webhook signature using `RAZORPAY_WEBHOOK_SECRET`
  - On `payment.captured` event: call Clerk Backend API to set `publicMetadata: { plan: "premium" }`
  - Use `@clerk/nextjs/server` `clerkClient().users.updateUser(userId, { publicMetadata: { plan: "premium" } })`
- Create `app/api/subscription/cancel/route.ts`:
  - POST: set Clerk metadata `plan: null`
- Create `components/UI/UpgradeButton.tsx`:
  - Loads Razorpay checkout script dynamically
  - On click: POST to `/api/subscription/create-order`, open Razorpay modal
  - On success: reload page (Clerk metadata will reflect premium)
- Create `hooks/usePlan.ts`:
  ```ts
  import { useUser } from "@clerk/nextjs";
  export function usePlan() {
    const { user } = useUser();
    const isPremium = user?.publicMetadata?.plan === "premium";
    return { isPremium };
  }
  ```

**Verification:** Razorpay test payment flow completes. Clerk metadata updates. `usePlan()` returns correct value.

**Exit criteria:** `usePlan().isPremium` returns `true` after test payment. Webhook updates Clerk metadata. No hardcoded keys in code.

---

### Step 1.3 — Watermark on free PDFs + plan gating in UI

**Context:** PDF is generated in `components/InvoicePreview/PDFDocument.tsx`. The `PDFDownloadButton.tsx` triggers download. `usePlan` hook from Step 1.2 available.

**Tasks:**
- In `PDFDocument.tsx`:
  - Add `isPremium?: boolean` prop
  - Add watermark style:
    ```ts
    watermark: {
      position: "absolute",
      bottom: 12,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 7,
      color: "#cccccc",
    }
    ```
  - Render at bottom of `<Page>` when `!isPremium`:
    ```jsx
    {!isPremium && (
      <Text style={styles.watermark} fixed>
        Made with Invoicy · invoicy.in · Upgrade to remove
      </Text>
    )}
    ```
- In `PDFDownloadButton.tsx`: consume `usePlan()`, pass `isPremium` to `PDFDocument`
- In `InvoicePreview.tsx` (live preview): show subtle "Made with Invoicy" footer text when `!isPremium`
- In `app/invoice/new/page.tsx` sidebar or header: show `<UpgradeButton />` when `!isPremium`
- Optionally: gate theme selection to Premium for themes beyond `classic` and `minimal` (soft gate — show lock icon, click opens upgrade modal)

**Verification:** Free user PDF has watermark. Premium user PDF has no watermark. `npm run build` passes.

**Exit criteria:** Watermark visible in downloaded PDF for free accounts. Hidden for premium. Upgrade button rendered in UI.

---

## Phase 2 — Retention Features

*(Steps 2.1, 2.2, 2.3 are independent — can be worked in parallel)*

### Step 2.1 — Signature upload

**Context:** `Invoice` type now has `signature?: string` (from Step 1.1). `InvoiceBuilder` has modular sections in `components/InvoiceBuilder/`. PDF rendered in `PDFDocument.tsx`.

**Tasks:**
- Create `components/InvoiceBuilder/SignatureSection.tsx`:
  - File input accepting PNG/JPG/SVG, max 200KB
  - On change: read as base64 via `FileReader`, call `updateCurrentInvoice({ signature: base64 })`
  - Show preview of uploaded signature (small `<img>` tag, 120px wide)
  - Show "Clear" button when signature is present
  - Validate: reject files > 200KB with inline error message
- Add `<SignatureSection />` to the bottom of `app/invoice/new/page.tsx` builder column, below `<NotesSection />`
- In `PDFDocument.tsx`:
  - Add signature rendering below the totals section and above the footer:
    ```jsx
    {invoice.signature && (
      <View style={styles.signatureBlock}>
        <Image src={invoice.signature} style={styles.signatureImage} />
        <Text style={styles.signatureLine}>Authorized Signature</Text>
      </View>
    )}
    ```
  - Add styles: `signatureBlock` (alignItems flex-end, marginBottom 16), `signatureImage` (maxWidth 160, maxHeight 60, objectFit contain), `signatureLine` (fontSize 8, color light, borderTop 1px solid border, paddingTop 4, marginTop 4)
- Signature stored as base64 in invoice JSON (already in Turso `data` column — no schema change needed)

**Verification:** Upload PNG, see preview in builder. Download PDF, see signature above footer. `npm run build` passes.

**Exit criteria:** Signature renders in PDF at correct position. 200KB limit enforced. Clear button works.

---

### Step 2.2 — Three new invoice themes

**Context:** `InvoiceTheme` now has 5 values (from Step 1.1): `classic`, `minimal`, `modern`, `corporate`, `retro`. `PDFDocument.tsx` currently uses one style set. `InvoicePreview.tsx` renders live preview.

**Tasks:**
- Refactor `PDFDocument.tsx` to accept theme and switch style sets:
  - Extract current styles as `classicStyles`
  - Add `modernStyles`: large colored accent bar at top (dark navy `#1a1a2e`), white text on header, sans-serif feel, colored "INVOICE" title in accent color
  - Add `corporateStyles`: formal, two-column layout feel, gray header with company name prominent, thin borders, Times-like feel (Helvetica-Bold for labels)
  - Add `retroStyles`: warm cream background (`#fdf6e3`), warm brown tones, decorative dividers, serif-like feel using Helvetica-Oblique for labels
  - Each theme = its own `StyleSheet.create({})` object; switch via `invoice.theme`
- In `components/InvoicePreview/InvoicePreview.tsx` (live HTML preview):
  - Apply theme-appropriate Tailwind classes based on `invoice.theme`
  - Create `THEME_CLASSES` map with header bg, accent color, table header bg per theme
- In `components/InvoiceBuilder/HeaderSection.tsx`:
  - Add theme selector: horizontal row of 5 labeled swatches/cards
  - Each shows theme name + small color preview chip
  - Active theme highlighted with ring
  - Themes beyond `minimal`: show premium lock icon if `!isPremium` (soft gate)

**Verification:** Switch themes in builder, live preview updates. PDF downloads with correct theme styling. All 5 themes render without errors.

**Exit criteria:** 3 new themes render correctly in both live preview and PDF. Theme selector in builder works. `npm run build` passes.

---

### Step 2.3 — Basic client management

**Context:** `clients` table created in Step 1.1. `Client` type exported from `types/invoice.ts`. `InvoiceBuilder/PartySection.tsx` handles "Bill To" fields.

**Tasks:**
- Create `app/api/clients/route.ts`:
  - GET: `SELECT * FROM clients WHERE user_id = ? ORDER BY name ASC` — return JSON array
  - POST: insert new client, return created client
- Create `app/api/clients/[id]/route.ts`:
  - DELETE: `DELETE FROM clients WHERE id = ? AND user_id = ?`
- Create `store/clientStore.ts` (Zustand, with localStorage persist):
  ```ts
  interface ClientStore {
    clients: Client[];
    fetchClients: () => Promise<void>;
    saveClient: (client: Omit<Client, "id" | "created_at">) => Promise<Client>;
    deleteClient: (id: string) => Promise<void>;
  }
  ```
  - `fetchClients`: GET `/api/clients`, set state
  - `saveClient`: POST `/api/clients`, optimistic update
  - `deleteClient`: DELETE `/api/clients/${id}`, optimistic update
- Create `components/UI/ClientAutocomplete.tsx`:
  - Text input with dropdown showing matching clients from store
  - On select: populate all Party fields (name, email, address, phone)
  - "Save as client" button when "From" fields are filled and no client selected
  - Debounce filter 150ms
- Add `<ClientAutocomplete />` to `components/InvoiceBuilder/PartySection.tsx` above "Bill To" name field
- Fetch clients on mount in `SyncProvider.tsx` (alongside `fetchFromServer`)

**Verification:** Add a client via "Save as client". Reload page. Select from autocomplete. Fields populate. `npm run build` passes.

**Exit criteria:** Client CRUD works end-to-end. Autocomplete filters correctly. Data persists to Turso.

---

## Phase 3 — Premium Features

*(Implement after first paying users confirmed)*

### Step 3.1 — Recurring invoices (Premium only)

**Context:** `Invoice.recurrence` field added in Step 1.1. `usePlan()` hook from Step 1.2. Trigger.dev for background jobs.

**Tasks:**
- Install: `npm install @trigger.dev/sdk@latest`
- Add env: `TRIGGER_SECRET_KEY`, `TRIGGER_API_URL`
- Create `trigger/recurringInvoices.ts`:
  - Define a scheduled Trigger.dev job: runs daily at 08:00 IST
  - Queries Turso for invoices where `recurrence.active = true` AND `recurrence.nextDate = today`
  - For each: clone invoice with new `invoice_number`, reset `status` to `"sent"`, update `nextDate` to next occurrence
  - Push cloned invoice via existing `/api/invoices` POST
- Add `RecurrenceSection.tsx` to InvoiceBuilder (below SignatureSection):
  - Toggle: "Make this a recurring invoice" (Premium only — show upgrade prompt if free)
  - When enabled: frequency selector (weekly / monthly / quarterly) + start date
  - Updates `invoice.recurrence` via `updateCurrentInvoice`
- Show recurring badge on History page for invoices with `recurrence.active = true`

**Verification:** Create recurring invoice. Manually trigger Trigger.dev job. Verify clone created with next invoice number.

**Exit criteria:** Recurring job clones invoice correctly. Premium gate blocks free users. History shows badge.

---

### Step 3.2 — Email automation with Resend

**Context:** Client email stored in `invoice.bill_to.email`. PDF generated client-side. Need server-side PDF generation for email attachment.

**Tasks:**
- Install: `npm install resend`
- Add env: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (e.g. `invoices@invoicy.in`)
- Create `lib/email.ts`:
  - `sendInvoiceEmail(invoice: Invoice, pdfBuffer: Buffer): Promise<void>`
  - Uses Resend SDK: send to `invoice.bill_to.email` with PDF attached
  - Subject: `Invoice #${invoice.invoice_number} from ${invoice.from.name}`
  - Body: simple HTML template with invoice summary, total, due date, "View Invoice" link
- Create `app/api/invoices/[id]/send/route.ts`:
  - POST: fetch invoice from Turso, generate PDF server-side using `@react-pdf/renderer` `renderToBuffer()`
  - Call `sendInvoiceEmail(invoice, buffer)`
  - Update invoice status to `"sent"` in Turso
- Add "Send Invoice" button in `InvoicePreview.tsx` action bar:
  - POST to `/api/invoices/${invoice.id}/send`
  - Show loading state, success toast, error handling
  - Only enabled when `invoice.bill_to.email` is set
- Recurring invoices (Step 3.1): auto-call send API after clone creation

**Note on server-side PDF:** `@react-pdf/renderer` supports `renderToBuffer` in Node.js. The `PDFDocument` component must be importable from a server route — ensure no `"use client"` at top of `PDFDocument.tsx` (it currently has one). Extract pure render logic to a separate file `lib/pdfRenderer.ts` without the client directive.

**Verification:** Click "Send Invoice". Email arrives with PDF attachment. Status updates to "sent".

**Exit criteria:** Email sends with correct PDF. Attachment renders correctly. Status updates in DB.

---

## Invariants (check after every step)

- [ ] `npm run build` passes (no TypeScript errors, no ESLint errors)
- [ ] Clerk auth still protects all routes
- [ ] Existing invoices in Turso are unaffected (backward-compatible JSON schema)
- [ ] `localStorage` data structure is compatible (Zustand persist key `"invoicy-storage"`)
- [ ] No API keys committed to git (check with `git diff --cached`)

---

## Environment Variables Summary

Add to `.env.local` as you complete each step:

| Step | Variable | Source |
|------|----------|--------|
| 1.2 | `RAZORPAY_KEY_ID` | Razorpay Dashboard |
| 1.2 | `RAZORPAY_KEY_SECRET` | Razorpay Dashboard |
| 1.2 | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as KEY_ID |
| 1.2 | `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Webhooks |
| 3.1 | `TRIGGER_SECRET_KEY` | trigger.dev dashboard |
| 3.2 | `RESEND_API_KEY` | resend.com dashboard |
| 3.2 | `RESEND_FROM_EMAIL` | Verified domain in Resend |

---

## Rollback Strategy

Each step is additive — new files + additive type changes. Rollback = delete new files and revert type additions. No destructive migrations (Turso `clients` table is `CREATE IF NOT EXISTS`).

If Step 1.2 (Razorpay) is broken: `usePlan()` defaults to `false` → all users get free tier experience. No data loss.

---

## Ship Order Summary

1. **Step 1.1** — Types + DB schema (30 min)
2. **Step 1.2** — Razorpay + Clerk plan metadata (2–3 hrs)
3. **Step 1.3** — Watermark + upgrade button (1 hr)
4. **Steps 2.1 + 2.2 + 2.3** — Parallel (signature + themes + clients) (3–4 hrs total)
5. **Step 3.1** — Recurring invoices (2 hrs, after revenue)
6. **Step 3.2** — Email automation (2 hrs, after recurring)

**ProductHunt launch target:** After Step 1.3 + 2.2 complete (watermark live, 5 themes, signature upload)
