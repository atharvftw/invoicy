# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js)
npm run build     # Production build
npm run lint      # ESLint via next lint
npm run start     # Start production server
```

No test runner is configured. There is a `.npmrc` with `legacy-peer-deps=true` for Clerk v7 compatibility — always use `npm install` (not `yarn` or `pnpm`).

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — Clerk auth
- `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` — Turso SQLite cloud DB

## Architecture

**Invoicy** is a Next.js 14 App Router invoice generator for freelancers. Key design decisions:

### Data Flow
State lives in **Zustand** (`/store/invoiceStore.ts`) and is persisted in a three-tier cascade:
1. In-memory Zustand state (instant UI updates)
2. `localStorage` via Zustand `persist` middleware (offline/reload resilience)
3. Turso SQLite via `/api/invoices` (cross-device persistence, debounced 800ms)

`SyncProvider` (`/components/UI/SyncProvider.tsx`) hydrates from Turso on mount and pushes changes debounced. All API routes are Clerk-protected and scope data by `userId`.

### Key Directories

- `/app/invoice/new` — Invoice Builder (main page): two-column layout with form (left) + live preview (right, `lg:` breakpoint only)
- `/app/invoice/[id]` — Read-only invoice view
- `/app/history` — Invoice list with search, filter, bulk actions
- `/app/api/invoices` — REST endpoints (GET/POST list, DELETE by id)
- `/components/InvoiceBuilder/` — Modular form sections (header, parties, line items, financials, notes)
- `/components/InvoicePreview/` — Live preview and PDF generation (`PDFDocument.tsx` uses `@react-pdf/renderer`, renamed to `PDFDoc` to avoid SWC collision)
- `/store/` — `invoiceStore.ts` (CRUD + sync), `uiStore.ts` (sidebar/preview toggles)
- `/types/invoice.ts` — Central data model, enums (currency, status, theme), utility functions
- `/lib/db.ts` — Turso client, `/lib/utils.ts` — formatting helpers

### PDF Generation
`@react-pdf/renderer` runs client-side only. The component is named `PDFDoc` (not `Document`) to avoid a conflict with the SWC compiler. `next.config.mjs` aliases `canvas` to an empty module for compatibility.

### Auth
Clerk middleware (`/middleware.ts`) protects all routes. API routes call `auth()` from `@clerk/nextjs/server` and reject requests without a `userId`.

### Styling
Tailwind CSS with DM Sans/Mono fonts. Custom grain texture overlay on `body`. No CSS modules — all Tailwind utility classes.
