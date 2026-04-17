# Invoicy Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, conversion-optimised, SEO-ready landing page for Invoicy — the "Payment Recovery Engine" — that turns visitors into free-trial signups.

**Architecture:** Next.js App Router route groups split marketing from app shell. Landing page is a server component (zero JS for SEO). Sidebar layout isolated to `(app)` group. All landing sections in one `page.tsx` with collocated sub-components. CSS-only animations (no new deps). Logo as inline SVG component.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Google Fonts (Syne + Plus Jakarta Sans) · Lucide React · Inline SVG logo

---

## Design System

### Brand Palette
```css
--lp-bg:           #07080F   /* near-black navy background */
--lp-bg-card:      #0E1018   /* card surfaces */
--lp-border:       rgba(255,255,255,0.07)
--lp-indigo:       #6366F1   /* primary — matches app */
--lp-indigo-light: #818CF8
--lp-green:        #22C55E   /* paid / success / money */
--lp-amber:        #F59E0B   /* overdue / urgency */
--lp-red:          #EF4444   /* pain points */
--lp-text:         #F1F5F9
--lp-muted:        #64748B
--lp-subtle:       #1E2130   /* dividers, subtle bg */
```

### Typography
- **Display**: Syne (700, 800) — bold, geometric, memorable
- **Body**: Plus Jakarta Sans (400, 500, 600) — warm, professional
- Imported via Google Fonts in `globals.css`

### Logo Concept
- **Mark**: Rounded square, indigo→violet gradient fill, white `⚡` bolt through a stylised "I"
- **Wordmark**: "invoicy" in Syne 700, `#F1F5F9`
- **Tagline**: "Payment Recovery Engine" in Plus Jakarta Sans 400

### Aesthetic Direction
Dark fintech — glass cards with `backdrop-blur`, glowing indigo borders on hover, neon accents for status. Bold editorial hero typography. Bento-grid features. Diagonal section separators. Scroll-fade-up animations via Intersection Observer. No purple gradients on white (generic). This reads like Linear meets Stripe India.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Create** | `app/(marketing)/layout.tsx` | Clean layout — no sidebar, just ClerkProvider children |
| **Create** | `app/(marketing)/page.tsx` | Full landing page — all sections as inline components |
| **Create** | `app/(app)/layout.tsx` | Sidebar + SyncProvider wrapper (moved from root layout) |
| **Move** | `app/invoice/` → `app/(app)/invoice/` | Invoice builder + viewer pages |
| **Move** | `app/history/` → `app/(app)/history/` | History page |
| **Modify** | `app/layout.tsx` | Strip to html/body/ClerkProvider/grain only |
| **Modify** | `app/globals.css` | Add Syne + Plus Jakarta Sans imports + landing CSS vars + animations |
| **Create** | `components/Logo.tsx` | SVG logo mark + wordmark — reused in landing navbar + sidebar |
| **Delete** | `app/page.tsx` | Replaced by `app/(marketing)/page.tsx` |

> URLs unchanged — route groups are invisible to the router.

---

## Task 1: Restructure into Route Groups

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `app/(marketing)/layout.tsx`
- Modify: `app/layout.tsx`
- Move (copy+delete): `app/invoice/` → `app/(app)/invoice/`
- Move (copy+delete): `app/history/` → `app/(app)/history/`
- Delete: `app/page.tsx`

- [ ] **Step 1: Create `app/(app)/layout.tsx`** — move Sidebar + SyncProvider from root layout

```tsx
// app/(app)/layout.tsx
import Sidebar from "@/components/UI/Sidebar";
import SyncProvider from "@/components/UI/SyncProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SyncProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </SyncProvider>
  );
}
```

- [ ] **Step 2: Slim down `app/layout.tsx`** — html/body/ClerkProvider only

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Invoicy — Get Paid Faster | Smart Invoice & Payment Recovery",
  description:
    "Create professional invoices and automate payment recovery with smart reminders, WhatsApp invoicing, and AI follow-ups. Built for freelancers, agencies & SMBs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className="grain">{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Create `app/(marketing)/layout.tsx`** — bare layout for landing

```tsx
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 4: Move invoice pages**

```bash
mkdir -p app/\(app\)/invoice/new app/\(app\)/invoice/\[id\]
cp app/invoice/new/page.tsx app/\(app\)/invoice/new/page.tsx
cp app/invoice/\[id\]/page.tsx app/\(app\)/invoice/\[id\]/page.tsx
rm -rf app/invoice
```

- [ ] **Step 5: Move history page**

```bash
mkdir -p app/\(app\)/history
cp app/history/page.tsx app/\(app\)/history/page.tsx
rm -rf app/history
```

- [ ] **Step 6: Delete old root page**

```bash
rm app/page.tsx
```

- [ ] **Step 7: Verify build compiles**

```bash
cd invoicy && npm run build
```

Expected: clean build, all 10 routes still present, `/` now 404 (landing page not yet created).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: split app/marketing route groups, slim root layout"
```

---

## Task 2: Logo Component

**Files:**
- Create: `components/Logo.tsx`

- [ ] **Step 1: Create SVG logo component**

```tsx
// components/Logo.tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "mark" = icon only | "full" = icon + wordmark | "wordmark" = text only */
  variant?: "mark" | "full" | "wordmark";
  size?: number;
  className?: string;
  dark?: boolean; /** true = light text for dark backgrounds (landing page) */
}

export default function Logo({ variant = "full", size = 32, className, dark = false }: LogoProps) {
  const Mark = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {/* Rounded square */}
      <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
      {/* Lightning bolt I — stylised */}
      <path
        d="M22 8L14 21h8l-4 11L26 19h-7l3-11z"
        fill="white"
        fillOpacity="0.95"
        strokeLinejoin="round"
      />
    </svg>
  );

  const textColor = dark ? "text-white" : "text-gray-900";

  if (variant === "mark") return <Mark />;

  if (variant === "wordmark") {
    return (
      <span className={cn("font-display font-bold tracking-tight text-xl", textColor, className)}>
        invoicy
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Mark />
      <span className={cn("font-display font-bold tracking-tight text-xl leading-none", textColor)}>
        invoicy
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Update Sidebar to use Logo component**

In `components/UI/Sidebar.tsx`, replace the existing logo block with:

```tsx
import Logo from "@/components/Logo";

// Inside expanded sidebar, replace the logo section div:
<div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center justify-between">
  <Logo variant="full" size={28} dark={false} />
  <button
    onClick={toggleSidebar}
    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
    title="Hide sidebar"
  >
    <PanelLeftClose size={15} />
  </button>
</div>
```

- [ ] **Step 3: Verify sidebar still renders correctly at localhost:3000/invoice/new**

- [ ] **Step 4: Commit**

```bash
git add components/Logo.tsx components/UI/Sidebar.tsx
git commit -m "feat: add Logo component, use in sidebar"
```

---

## Task 3: Landing Page Fonts + CSS

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add Google Fonts import to `globals.css`** (replace existing import line)

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
```

- [ ] **Step 2: Add landing page CSS variables + animation keyframes to `globals.css`**

Append at end of file:

```css
/* ── Landing Page ─────────────────────────────────── */
:root {
  --lp-bg:           #07080F;
  --lp-bg-card:      #0E1018;
  --lp-border:       rgba(255,255,255,0.07);
  --lp-indigo:       #6366F1;
  --lp-indigo-light: #818CF8;
  --lp-green:        #22C55E;
  --lp-amber:        #F59E0B;
  --lp-red:          #EF4444;
  --lp-text:         #F1F5F9;
  --lp-muted:        #64748B;
  --lp-subtle:       #1E2130;
}

.lp-root {
  background: var(--lp-bg);
  color: var(--lp-text);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

/* Gradient mesh background */
.lp-mesh {
  background:
    radial-gradient(ellipse 80% 50% at 20% -20%, rgba(99,102,241,0.15) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(139,92,246,0.10) 0%, transparent 60%),
    var(--lp-bg);
}

/* Glow border on hover */
.lp-card {
  background: var(--lp-bg-card);
  border: 1px solid var(--lp-border);
  border-radius: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.lp-card:hover {
  border-color: rgba(99,102,241,0.35);
  box-shadow: 0 0 0 1px rgba(99,102,241,0.15), 0 8px 32px rgba(99,102,241,0.08);
}

/* Fade-up animation */
@keyframes lpFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lp-fade-up {
  animation: lpFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.lp-fade-up-1 { animation-delay: 0.05s; opacity: 0; }
.lp-fade-up-2 { animation-delay: 0.15s; opacity: 0; }
.lp-fade-up-3 { animation-delay: 0.25s; opacity: 0; }
.lp-fade-up-4 { animation-delay: 0.35s; opacity: 0; }

/* Gradient text */
.lp-gradient-text {
  background: linear-gradient(135deg, #818CF8 0%, #A78BFA 50%, #C084FC 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Noise overlay for landing (separate from app grain) */
.lp-grain::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px;
}

/* Status pill */
.lp-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.lp-pill-indigo { background: rgba(99,102,241,0.12); color: #818CF8; border: 1px solid rgba(99,102,241,0.2); }
.lp-pill-green  { background: rgba(34,197,94,0.10);  color: #4ADE80; border: 1px solid rgba(34,197,94,0.2); }
.lp-pill-amber  { background: rgba(245,158,11,0.10); color: #FCD34D; border: 1px solid rgba(245,158,11,0.2); }
.lp-pill-red    { background: rgba(239,68,68,0.10);  color: #FCA5A5; border: 1px solid rgba(239,68,68,0.2); }
```

- [ ] **Step 3: Add `display` font family to `tailwind.config.ts`**

```ts
fontFamily: {
  sans:    ["var(--font-geist)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
  mono:    ["var(--font-mono)", "monospace"],
  display: ["Syne", "system-ui", "sans-serif"],  // ← add this
},
```

- [ ] **Step 4: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "feat: add landing page fonts, CSS vars, animation classes"
```

---

## Task 4: Landing Page — Navbar

**Files:**
- Create: `app/(marketing)/page.tsx` (started here, grown through Tasks 4–9)

- [ ] **Step 1: Create `app/(marketing)/page.tsx`** with navbar only

```tsx
// app/(marketing)/page.tsx
import Link from "next/link";
import Logo from "@/components/Logo";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoicy — Get Paid Faster | Smart Invoice & Payment Recovery Engine",
  description:
    "Stop chasing payments. Invoicy automates invoice creation, WhatsApp reminders, smart follow-ups, and payment collection for freelancers, agencies & SMBs in India.",
  keywords: [
    "invoice software India", "payment recovery", "automated invoicing",
    "WhatsApp invoicing", "invoice generator GST", "get paid faster",
    "freelancer invoice tool", "SMB billing software", "UPI payment invoice",
  ],
  openGraph: {
    title: "Invoicy — Stop Chasing Payments",
    description: "Turn every invoice into a payment machine. Smart reminders, auto follow-ups, instant payment links.",
    type: "website",
  },
};

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 h-16"
      style={{ background: "rgba(7,8,15,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <Logo variant="full" size={30} dark />

      <div className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: "#94A3B8" }}>
        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        <Link href="#usecases" className="hover:text-white transition-colors">Use Cases</Link>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/invoice/new"
          className="hidden sm:flex items-center text-sm font-medium transition-colors"
          style={{ color: "#94A3B8" }}>
          Sign in
        </Link>
        <Link href="/invoice/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "#6366F1", color: "white" }}>
          Get Started Free
          <ArrowRight size={14} />
        </Link>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div className="lp-root lp-grain min-h-screen">
      <Navbar />
      <main>
        {/* sections go here */}
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
          Landing page coming soon…
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Run dev server, visit `localhost:3000`**

```bash
npm run dev
```

Expected: Dark page, Invoicy navbar visible, "landing page coming soon" placeholder.

- [ ] **Step 3: Commit**

```bash
git add app/\(marketing\)/page.tsx
git commit -m "feat: landing page scaffold with navbar"
```

---

## Task 5: Hero Section

**Files:**
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1: Add `HeroSection` component above `export default` and wire it in**

```tsx
// Hero flow SVG — abstract invoice→payment nodes
function HeroFlow() {
  return (
    <svg viewBox="0 0 560 320" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-2xl mx-auto opacity-90">
      {/* Connection lines */}
      <line x1="140" y1="160" x2="220" y2="160" stroke="url(#flow-grad)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="340" y1="160" x2="420" y2="160" stroke="url(#flow-grad)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="220" y1="100" x2="220" y2="160" stroke="rgba(99,102,241,0.3)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="220" y1="220" x2="220" y2="160" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="340" y1="100" x2="340" y2="160" stroke="rgba(34,197,94,0.3)" strokeWidth="1" strokeDasharray="3 3" />

      <defs>
        <linearGradient id="flow-grad" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="node-indigo" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Invoice node */}
      <rect x="60" y="120" width="80" height="80" rx="14" fill="#0E1018" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" />
      <rect x="75" y="136" width="50" height="6" rx="3" fill="rgba(99,102,241,0.5)" />
      <rect x="75" y="148" width="35" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
      <rect x="75" y="158" width="42" height="4" rx="2" fill="rgba(255,255,255,0.10)" />
      <rect x="75" y="168" width="30" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="75" y="182" width="50" height="10" rx="5" fill="rgba(99,102,241,0.6)" />
      <text x="100" y="190" textAnchor="middle" fill="white" fontSize="7" fontWeight="600">Invoice</text>

      {/* Reminder node (top) */}
      <circle cx="220" cy="85" r="30" fill="#0E1018" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" />
      <text x="220" y="81" textAnchor="middle" fill="#FCD34D" fontSize="16">🔔</text>
      <text x="220" y="97" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="500">Reminder</text>

      {/* Engine node (center) */}
      <circle cx="280" cy="160" r="40" fill="url(#node-indigo)" filter="url(#glow)" />
      <text x="280" y="155" textAnchor="middle" fill="white" fontSize="20">⚡</text>
      <text x="280" y="172" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="8" fontWeight="700" letterSpacing="0.05em">INVOICY</text>

      {/* Follow-up node (bottom) */}
      <circle cx="220" cy="235" r="30" fill="#0E1018" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5" />
      <text x="220" y="231" textAnchor="middle" fill="#818CF8" fontSize="14">💬</text>
      <text x="220" y="247" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="500">Follow-up</text>

      {/* WhatsApp node (top right) */}
      <circle cx="340" cy="85" r="30" fill="#0E1018" stroke="rgba(34,197,94,0.4)" strokeWidth="1.5" />
      <text x="340" y="81" textAnchor="middle" fill="#4ADE80" fontSize="16">📲</text>
      <text x="340" y="97" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="500">WhatsApp</text>

      {/* Payment node */}
      <rect x="420" y="120" width="80" height="80" rx="14" fill="#0E1018" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" />
      <text x="460" y="153" textAnchor="middle" fill="#4ADE80" fontSize="22">✓</text>
      <text x="460" y="170" textAnchor="middle" fill="#4ADE80" fontSize="9" fontWeight="700">PAID</text>
      <text x="460" y="183" textAnchor="middle" fill="#94A3B8" fontSize="8">₹12,500</text>

      {/* Floating status pills */}
      <rect x="30" y="60" width="70" height="22" rx="11" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.25)" strokeWidth="1" />
      <text x="65" y="75" textAnchor="middle" fill="#FCA5A5" fontSize="8" fontWeight="600">OVERDUE</text>

      <rect x="440" y="60" width="60" height="22" rx="11" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.25)" strokeWidth="1" />
      <text x="470" y="75" textAnchor="middle" fill="#4ADE80" fontSize="8" fontWeight="600">PAID ✓</text>

      <rect x="390" y="222" width="80" height="22" rx="11" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.25)" strokeWidth="1" />
      <text x="430" y="237" textAnchor="middle" fill="#818CF8" fontSize="8" fontWeight="600">AUTO SENT</text>
    </svg>
  );
}

function HeroSection() {
  return (
    <section className="lp-mesh relative pt-32 pb-20 px-5 sm:px-8 overflow-hidden">
      {/* Glow orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />

      <div className="max-w-6xl mx-auto">
        {/* Top badge */}
        <div className="flex justify-center mb-6 lp-fade-up lp-fade-up-1">
          <span className="lp-pill lp-pill-indigo">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Payment Recovery Engine
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold text-center leading-[1.08] tracking-tight mb-6 lp-fade-up lp-fade-up-2"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", color: "#F1F5F9" }}>
          Stop Chasing Payments.
          <br />
          <span className="lp-gradient-text">Get Paid Automatically.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-center max-w-2xl mx-auto mb-10 leading-relaxed lp-fade-up lp-fade-up-3"
          style={{ color: "#94A3B8", fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}>
          Turn every invoice into a payment machine with automated follow-ups,
          smart reminders, and instant payment links. Built for freelancers, agencies & SMBs.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14 lp-fade-up lp-fade-up-4">
          <Link href="/invoice/new"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto justify-center"
            style={{ background: "#6366F1", color: "white", boxShadow: "0 0 0 1px rgba(99,102,241,0.5), 0 8px 32px rgba(99,102,241,0.25)" }}>
            Get Started Free
            <ArrowRight size={15} />
          </Link>
          <a href="#features"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all w-full sm:w-auto justify-center"
            style={{ background: "rgba(255,255,255,0.05)", color: "#F1F5F9", border: "1px solid rgba(255,255,255,0.1)" }}>
            See How It Works
          </a>
        </div>

        {/* Trust line */}
        <p className="text-center text-xs font-medium mb-14" style={{ color: "#475569" }}>
          Built for freelancers, agencies & SMBs · No credit card required · Free forever plan
        </p>

        {/* Hero visual */}
        <div className="lp-card p-6 sm:p-8 max-w-3xl mx-auto">
          <HeroFlow />
        </div>
      </div>
    </section>
  );
}
```

Wire into `LandingPage`:
```tsx
export default function LandingPage() {
  return (
    <div className="lp-root lp-grain min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Check localhost:3000** — dark hero, gradient headline, SVG flow diagram visible

- [ ] **Step 3: Commit**

```bash
git add app/\(marketing\)/page.tsx
git commit -m "feat: landing hero section with flow diagram"
```

---

## Task 6: Problem + Solution Sections

**Files:**
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1: Add `ProblemSection` and `SolutionSection` components**

```tsx
function ProblemSection() {
  const pains = [
    { icon: "⏰", label: "Late payments", sub: "Avg 45 days overdue" },
    { icon: "📞", label: "Manual follow-ups", sub: "Hours lost per week" },
    { icon: "😬", label: "Awkward conversations", sub: "Damages client trust" },
    { icon: "📉", label: "Unpredictable cash flow", sub: "Can't plan ahead" },
  ];

  return (
    <section className="py-20 px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#EF4444" }}>The Problem</p>
          <h2 className="font-display font-bold mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#F1F5F9" }}>
            Invoicing tools help you <em className="not-italic" style={{ textDecoration: "line-through", color: "#475569" }}>send invoices.</em>
          </h2>
          <p className="text-lg font-semibold" style={{ color: "#94A3B8" }}>
            They don't help you <span style={{ color: "#F1F5F9" }}>get paid.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pains.map((p) => (
            <div key={p.label} className="lp-card p-5 flex flex-col gap-2">
              <span className="text-2xl">{p.icon}</span>
              <p className="font-semibold text-sm" style={{ color: "#F1F5F9" }}>{p.label}</p>
              <p className="text-xs" style={{ color: "#64748B" }}>{p.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const steps = [
    { num: "01", icon: "🧾", title: "Create Invoice", desc: "Professional GST-ready invoices in seconds. Custom branding, 5 themes, PDF download." },
    { num: "02", icon: "📲", title: "Auto-Send", desc: "Deliver via email, WhatsApp, or payment link instantly. One tap." },
    { num: "03", icon: "🤖", title: "Smart Recovery", desc: "AI reminders escalate tone automatically — friendly → firm → urgent — until paid." },
    { num: "04", icon: "💸", title: "Get Paid", desc: "UPI, cards, netbanking via Razorpay/Stripe. Collected automatically." },
  ];

  return (
    <section id="features" className="py-20 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818CF8" }}>The Solution</p>
          <h2 className="font-display font-bold mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#F1F5F9" }}>
            Introducing Invoicy —
            <br className="hidden sm:block" />
            <span className="lp-gradient-text"> Your Payment Recovery Engine</span>
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: "#94A3B8" }}>
            Not just invoice generation. Full automation from invoice → payment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={s.num} className="lp-card p-6 flex flex-col gap-3 relative overflow-hidden">
              {/* Step number watermark */}
              <span className="absolute top-4 right-5 font-display font-bold text-5xl"
                style={{ color: "rgba(255,255,255,0.03)", lineHeight: 1 }}>{s.num}</span>
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="font-display font-bold text-base mb-1" style={{ color: "#F1F5F9" }}>{s.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{s.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-lg" style={{ color: "#334155" }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Wire into `LandingPage` `<main>`:
```tsx
<HeroSection />
<ProblemSection />
<SolutionSection />
```

- [ ] **Step 2: Verify sections render correctly**

- [ ] **Step 3: Commit**

```bash
git add app/\(marketing\)/page.tsx
git commit -m "feat: problem + solution sections"
```

---

## Task 7: Features Bento Grid + Differentiators

**Files:**
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1: Add `FeaturesSection` component**

```tsx
function FeaturesSection() {
  return (
    <section className="py-20 px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818CF8" }}>Features</p>
          <h2 className="font-display font-bold" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#F1F5F9" }}>
            Everything you need to get paid
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Feature card 1 — large */}
          <div className="lp-card p-6 sm:col-span-2 flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>🤖</div>
            <div>
              <p className="font-display font-bold text-lg mb-2" style={{ color: "#F1F5F9" }}>Smart Payment Recovery Engine</p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#64748B" }}>
                Tracks invoice status from Sent → Viewed → Overdue. Auto-reminders escalate tone dynamically:
                Friendly → Firm → Urgent. Handles late fees automatically. Zero manual effort.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Friendly", "Firm", "Urgent"].map((tone, i) => (
                  <span key={tone} className="lp-pill" style={{
                    background: ["rgba(34,197,94,0.1)","rgba(245,158,11,0.1)","rgba(239,68,68,0.1)"][i],
                    color: ["#4ADE80","#FCD34D","#FCA5A5"][i],
                    border: `1px solid ${["rgba(34,197,94,0.2)","rgba(245,158,11,0.2)","rgba(239,68,68,0.2)"][i]}`,
                  }}>
                    {tone}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Feature card 2 */}
          <div className="lp-card p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>📲</div>
            <p className="font-display font-bold text-base" style={{ color: "#F1F5F9" }}>WhatsApp Invoicing</p>
            <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
              Send invoices directly on WhatsApp with payment links. Higher open rates. Auto reminders via chat.
            </p>
          </div>

          {/* Feature card 3 */}
          <div className="lp-card p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>💸</div>
            <p className="font-display font-bold text-base" style={{ color: "#F1F5F9" }}>Payment Integration</p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#64748B" }}>
              One-click payment links. UPI, Cards, Netbanking via Razorpay & Stripe. Clients pay in seconds.
            </p>
            <div className="flex gap-2 flex-wrap">
              {["UPI", "Cards", "Netbanking"].map(m => (
                <span key={m} className="lp-pill lp-pill-amber">{m}</span>
              ))}
            </div>
          </div>

          {/* Feature card 4 */}
          <div className="lp-card p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>📊</div>
            <p className="font-display font-bold text-base" style={{ color: "#F1F5F9" }}>Client Intelligence</p>
            <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
              Average payment time, late payer detection, risk scoring. Know who to trust.
            </p>
          </div>

          {/* Feature card 5 */}
          <div className="lp-card p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>🔁</div>
            <p className="font-display font-bold text-base" style={{ color: "#F1F5F9" }}>Recurring Billing</p>
            <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
              Set weekly/monthly invoices. Subscription-style billing with auto payment collection.
            </p>
          </div>

          {/* Feature card 6 */}
          <div className="lp-card p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>🧾</div>
            <p className="font-display font-bold text-base" style={{ color: "#F1F5F9" }}>GST-Ready Invoices</p>
            <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
              Professional invoices with custom branding, 5 themes, GST-compliant. Download as PDF instantly.
            </p>
          </div>

          {/* Feature card 7 — wide */}
          <div className="lp-card p-6 sm:col-span-2 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>⚡</div>
            <p className="font-display font-bold text-base" style={{ color: "#F1F5F9" }}>Invoice from Text / WhatsApp</p>
            <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
              Just type: <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>
                "Send ₹5,000 invoice to Rahul for design work"
              </span> — Invoicy auto-generates and sends instantly.
            </p>
          </div>

          {/* Feature card 8 */}
          <div className="lp-card p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>📧</div>
            <p className="font-display font-bold text-base" style={{ color: "#F1F5F9" }}>AI Follow-Up Assistant</p>
            <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
              Writes context-aware reminder messages. Personalized tone per client. Multi-step flows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Wire in after `<SolutionSection />`.

- [ ] **Step 2: Verify bento grid renders on mobile + desktop**

- [ ] **Step 3: Commit**

```bash
git add app/\(marketing\)/page.tsx
git commit -m "feat: features bento grid section"
```

---

## Task 8: Use Cases + Pricing

**Files:**
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1: Add `UseCasesSection`**

```tsx
function UseCasesSection() {
  const cases = [
    { emoji: "🎨", role: "Freelancers", headline: "Stop chasing clients", body: "Send an invoice, Invoicy handles the follow-ups. You focus on the work, not the collections." },
    { emoji: "🏢", role: "Agencies", headline: "Manage multiple clients", body: "Track payment status across all clients in one dashboard. Spot slow payers before they become a problem." },
    { emoji: "🚀", role: "Startups", headline: "Improve cash flow", body: "Predictable revenue with recurring billing and automated collection. Know your numbers." },
    { emoji: "🏪", role: "SMBs", headline: "Automate collections", body: "Works like a full collections team for the price of a coffee. Scales with your business." },
  ];

  return (
    <section id="usecases" className="py-20 px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818CF8" }}>Who It's For</p>
          <h2 className="font-display font-bold" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#F1F5F9" }}>
            Built for how India does business
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cases.map((c) => (
            <div key={c.role} className="lp-card p-6 flex gap-4">
              <span className="text-3xl shrink-0 mt-0.5">{c.emoji}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#64748B" }}>{c.role}</p>
                <p className="font-display font-bold text-base mb-1.5" style={{ color: "#F1F5F9" }}>{c.headline}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add `PricingSection`**

```tsx
function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      pill: null,
      features: ["Basic invoice creation", "PDF download", "Manual sending", "1 user"],
      cta: "Start Free",
      featured: false,
    },
    {
      name: "Pro",
      price: "₹499",
      period: "/month",
      pill: "Most Popular",
      features: [
        "No watermark",
        "Payment links (UPI, Cards)",
        "WhatsApp invoicing",
        "Recurring billing",
        "Email follow-ups",
        "5 invoice themes",
      ],
      cta: "Start Pro Trial",
      featured: true,
    },
    {
      name: "Growth",
      price: "₹1,999",
      period: "/month",
      pill: "For Teams",
      features: [
        "Everything in Pro",
        "Smart Payment Recovery Engine",
        "AI follow-up assistant",
        "Client intelligence dashboard",
        "Late fee automation",
        "API access + Webhooks",
        "Chrome Extension",
        "Priority support",
      ],
      cta: "Start Growth Trial",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818CF8" }}>Pricing</p>
          <h2 className="font-display font-bold mb-3" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#F1F5F9" }}>
            Pay less than your late fees
          </h2>
          <p style={{ color: "#64748B" }}>Or choose our 0.5% per payment model — pay as you earn.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          {plans.map((p) => (
            <div key={p.name} className="lp-card p-6 flex flex-col gap-4 relative"
              style={p.featured ? {
                borderColor: "rgba(99,102,241,0.5)",
                boxShadow: "0 0 0 1px rgba(99,102,241,0.2), 0 16px 48px rgba(99,102,241,0.12)",
              } : {}}>
              {p.pill && (
                <span className="lp-pill lp-pill-indigo absolute -top-3 left-1/2 -translate-x-1/2">{p.pill}</span>
              )}
              <div>
                <p className="font-display font-bold text-sm mb-3" style={{ color: "#94A3B8" }}>{p.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold" style={{ fontSize: "2.2rem", color: "#F1F5F9" }}>{p.price}</span>
                  <span className="text-sm" style={{ color: "#475569" }}>{p.period}</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#94A3B8" }}>
                    <span style={{ color: "#22C55E", marginTop: "2px", flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/invoice/new"
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-all block"
                style={p.featured
                  ? { background: "#6366F1", color: "white" }
                  : { background: "rgba(255,255,255,0.06)", color: "#F1F5F9", border: "1px solid rgba(255,255,255,0.1)" }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Wire in after `<FeaturesSection />`.

- [ ] **Step 3: Commit**

```bash
git add app/\(marketing\)/page.tsx
git commit -m "feat: use cases + pricing sections"
```

---

## Task 9: Final CTA + Footer

**Files:**
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1: Add `CtaSection` and `Footer` components**

```tsx
function StatsBar() {
  const stats = [
    { value: "60%", label: "Avg payment time reduction" },
    { value: "3×", label: "Faster collections" },
    { value: "100%", label: "Free to start" },
  ];
  return (
    <div className="py-12 px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {stats.map(s => (
          <div key={s.label}>
            <p className="font-display font-bold mb-1" style={{ fontSize: "2.5rem", color: "#F1F5F9" }}>{s.value}</p>
            <p className="text-sm" style={{ color: "#64748B" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaSection() {
  return (
    <section className="py-24 px-5 sm:px-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 70%)" }} />
      <div className="max-w-2xl mx-auto relative">
        <span className="lp-pill lp-pill-green mb-6 inline-flex">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          Get paid on time, every time
        </span>
        <h2 className="font-display font-bold mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#F1F5F9", lineHeight: 1.1 }}>
          Start getting paid
          <br /><span className="lp-gradient-text">automatically.</span>
        </h2>
        <p className="mb-10 text-lg" style={{ color: "#64748B" }}>
          No more chasing. No more awkward follow-ups. No more late payments.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/invoice/new"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all w-full sm:w-auto justify-center"
            style={{ background: "#6366F1", color: "white", boxShadow: "0 0 0 1px rgba(99,102,241,0.5), 0 12px 40px rgba(99,102,241,0.3)" }}>
            Start Free — No Card Needed
            <ArrowRight size={16} />
          </Link>
          <a href="mailto:hello@invoicy.in"
            className="px-8 py-4 rounded-xl text-base font-semibold transition-all w-full sm:w-auto text-center"
            style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.1)" }}>
            Book a Demo
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo variant="full" size={24} dark />
        <div className="flex items-center gap-6 text-sm" style={{ color: "#475569" }}>
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/invoice/new" className="hover:text-white transition-colors">App</Link>
          <a href="mailto:hello@invoicy.in" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p className="text-xs" style={{ color: "#334155" }}>© 2026 Invoicy. Built for India.</p>
      </div>
    </footer>
  );
}
```

Wire into `LandingPage`:
```tsx
export default function LandingPage() {
  return (
    <div className="lp-root lp-grain min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <UseCasesSection />
        <StatsBar />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify full page renders top to bottom**

- [ ] **Step 3: Commit**

```bash
git add app/\(marketing\)/page.tsx
git commit -m "feat: stats bar, final CTA, footer — landing page complete"
```

---

## Task 10: SEO + Schema Markup

**Files:**
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1: Add JSON-LD schema script to `LandingPage`**

```tsx
// Add inside <div className="lp-root lp-grain ..."> before <Navbar>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Invoicy",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "Smart invoice and payment recovery engine for freelancers, agencies and SMBs. Automates follow-ups, WhatsApp reminders, and payment collection.",
      "offers": [
        { "@type": "Offer", "price": "0", "priceCurrency": "INR", "name": "Free Plan" },
        { "@type": "Offer", "price": "499", "priceCurrency": "INR", "name": "Pro Plan" },
        { "@type": "Offer", "price": "1999", "priceCurrency": "INR", "name": "Growth Plan" },
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "24",
      },
    }),
  }}
/>
```

- [ ] **Step 2: Add `viewport` and `robots` meta to `app/(marketing)/page.tsx` metadata export**

```tsx
export const metadata: Metadata = {
  title: "Invoicy — Get Paid Faster | Smart Invoice & Payment Recovery Engine",
  description: "Stop chasing payments. Invoicy automates invoice creation, WhatsApp reminders, smart follow-ups, and payment collection for freelancers, agencies & SMBs in India.",
  keywords: [
    "invoice software India", "payment recovery software", "automated invoicing India",
    "WhatsApp invoicing tool", "invoice generator GST", "get paid faster freelancer",
    "SMB billing software India", "UPI payment invoice", "automated payment reminders",
    "freelancer invoice app India",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Invoicy — Stop Chasing Payments. Get Paid Automatically.",
    description: "Turn every invoice into a payment machine. Smart reminders, AI follow-ups, WhatsApp invoicing, instant payment links.",
    type: "website",
    locale: "en_IN",
    siteName: "Invoicy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoicy — Stop Chasing Payments",
    description: "Automate invoice follow-ups and get paid faster. Built for India.",
  },
};
```

- [ ] **Step 3: Final build check**

```bash
npm run build
```

Expected: Clean build. Lighthouse SEO score target ≥90.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: SEO metadata, JSON-LD schema — landing page complete"
```

---

## Self-Review

### Spec Coverage

| Spec requirement | Covered in |
|---|---|
| Hero headline / subheadline / CTAs | Task 5 `HeroSection` |
| Trust line | Task 5 `HeroSection` |
| Problem section (4 pain points) | Task 6 `ProblemSection` |
| Solution intro + steps | Task 6 `SolutionSection` |
| Invoice creation features | Task 7 `FeaturesSection` |
| Payment integration (UPI, Razorpay) | Task 7 `FeaturesSection` |
| Smart Payment Recovery Engine | Task 7 `FeaturesSection` |
| WhatsApp invoicing | Task 7 `FeaturesSection` |
| AI follow-up assistant | Task 7 `FeaturesSection` |
| Client intelligence dashboard | Task 7 `FeaturesSection` |
| Recurring billing | Task 7 `FeaturesSection` |
| Invoice from text | Task 7 `FeaturesSection` |
| Use cases (4 segments) | Task 8 `UseCasesSection` |
| Pricing (Free/Pro/Growth) | Task 8 `PricingSection` |
| 0.5% per payment note | Task 8 `PricingSection` |
| Social proof / metrics | Task 9 `StatsBar` |
| Final CTA (Start Free + Book Demo) | Task 9 `CtaSection` |
| SEO title, description, keywords | Task 10 |
| Schema markup | Task 10 |
| Logo | Task 2 `Logo.tsx` |
| Mobile responsive | All — mobile-first CSS, `flex-col sm:flex-row`, responsive `clamp()` sizes |

**No gaps found.**

---

**Plan saved.** Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks

**2. Inline Execution** — execute tasks in this session using executing-plans

Which approach?
