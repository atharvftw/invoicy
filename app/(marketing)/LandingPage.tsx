import Link from "next/link";
import {
  FileText, Sparkles, Check, ArrowRight, Mic, BrainCircuit,
  Bell, Shield, Crown, Building2, Zap, Lock, Mail,
} from "lucide-react";

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-4">
      {children}
    </span>
  );
}

function FeatureCard({ icon, title, desc, bullets }: { icon: React.ReactNode; title: string; desc: string; bullets: string[] }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-4 leading-relaxed">{desc}</p>
      <ul className="space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
            <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriceCard({ plan, price, period, description, features, popular, cta }: {
  plan: string; price: string; period: string; description: string;
  features: { text: string; included: boolean }[];
  popular?: boolean; cta: string;
}) {
  return (
    <div className={`relative p-6 rounded-2xl border flex flex-col ${popular ? "border-indigo-200 bg-indigo-50/40 shadow-sm" : "border-slate-100 bg-white"}`}>
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold uppercase tracking-wider">
          Most Popular
        </span>
      )}
      <h3 className="text-base font-bold text-slate-900 mb-1">{plan}</h3>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      <div className="mb-5">
        <span className="text-3xl font-extrabold text-slate-900">{price}</span>
        <span className="text-sm text-slate-400">{period}</span>
      </div>
      <ul className="space-y-2.5 mb-6 flex-1">
        {features.map((f) => (
          <li key={f.text} className={`flex items-start gap-2 text-sm ${f.included ? "text-slate-600" : "text-slate-300"}`}>
            <Check size={14} className={f.included ? "text-green-500 shrink-0 mt-0.5" : "text-slate-300 shrink-0 mt-0.5"} />
            {f.text}
          </li>
        ))}
      </ul>
      <Link
        href="/sign-up"
        className={`w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          popular ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <SectionBadge><Sparkles size={12} /> AI Voice-to-Invoice & Auto-Tax Intelligence</SectionBadge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Invoice with your voice.
            <br /><span className="text-indigo-600">Get paid on time.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-2xl mx-auto">
            Speak your invoice details — AI builds it instantly. Auto-detects GST rates & HSN codes.
            Smart follow-ups that adapt tone based on client behavior. Built for Indian freelancers and agencies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/sign-up" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Start Invoicing Free <ArrowRight size={16} />
            </Link>
            <Link href="#features" className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
              See How It Works
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span>No credit card</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Setup in 2 min</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>GST-ready</span>
          </div>
        </div>
      </section>

      {/* Social proof band */}
      <section className="bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Trusted by freelancers and agencies collecting <span className="text-indigo-600 font-bold">₹50 Million+</span> on time
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <SectionBadge><Zap size={12} /> The Solution</SectionBadge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">AI Edge. Three superpowers.</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Everything you need to bill clients, get paid faster, and look professional doing it.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Mic size={20} />}
            title="Voice-to-Invoice"
            desc="Just speak: 'Invoice Acme for website design, 50,000 plus GST, due in 15 days.' AI parses, calculates, and builds the full invoice."
            bullets={["Web Speech API powered", "Natural language parsing", "Instant line-item generation", "Works in Chrome & Edge"]}
          />
          <FeatureCard
            icon={<BrainCircuit size={20} />}
            title="Auto-Tax Intelligence"
            desc="AI suggests the correct GST rate and HSN/SAC code for every line item. No more manual tax lookups or compliance guesswork."
            bullets={["GST rate detection (0%, 5%, 12%, 18%, 28%)", "HSN for goods, SAC for services", "India-specific rules", "One-click apply"]}
          />
          <FeatureCard
            icon={<Bell size={20} />}
            title="Smart Follow-ups"
            desc="AI-generated emails that adapt tone based on client payment history. Firm for chronic late-payers. Gentle for VIPs."
            bullets={["5 tones: friendly, casual, professional, firm, urgent", "Client risk scoring", "Behavioral context in prompts", "Send via your own SMTP"]}
          />
        </div>
      </section>

      {/* Security */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <SectionBadge><Shield size={12} /> Security First</SectionBadge>
              <h2 className="text-3xl font-extrabold mb-4">Your data stays yours.</h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                We don&apos;t store your SMTP credentials. We don&apos;t sell your client data.
                Invoicy uses your browser&apos;s local storage by default — your invoices never touch our servers unless you choose to sync.
              </p>
              <ul className="space-y-3">
                {["AES-256 encryption at rest", "TLS 1.3 in transit", "Clerk authentication", "No data selling or ads"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <Lock size={14} className="text-emerald-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Mail size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Email sent via your SMTP</p>
                  <p className="text-xs text-slate-400">Gmail, Outlook, Zoho, or custom</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                <p>Invoicy connects to your email account to send reminders. We never see your password — it&apos;s stored securely in your browser.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <SectionBadge><Crown size={12} /> Pricing</SectionBadge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Simple pricing that pays for itself.</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Start free. Upgrade when AI starts saving you hours every week.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <PriceCard
            plan="Free"
            price="₹0"
            period="/forever"
            description="For solo freelancers getting started."
            features={[
              { text: "Up to 5 clients", included: true },
              { text: "10 invoices / month", included: true },
              { text: "PDF export", included: true },
              { text: "Basic templates", included: true },
              { text: "AI voice-to-invoice", included: false },
              { text: "Auto-tax intelligence", included: false },
              { text: "Smart follow-ups", included: false },
            ]}
            cta="Get Started Free"
          />
          <PriceCard
            plan="Pro"
            price="₹1,499"
            period="/month"
            description="For growing agencies that need automation."
            popular
            features={[
              { text: "Unlimited clients & invoices", included: true },
              { text: "AI voice-to-invoice", included: true },
              { text: "Auto-tax intelligence (GST/HSN)", included: true },
              { text: "Smart follow-ups (5 tones)", included: true },
              { text: "Client intelligence dashboard", included: true },
              { text: "Custom branding", included: true },
              { text: "Priority support", included: true },
            ]}
            cta="Upgrade to Pro"
          />
          <PriceCard
            plan="Enterprise"
            price="₹3,999"
            period="/month"
            description="For teams with custom workflows."
            features={[
              { text: "Everything in Pro", included: true },
              { text: "Team roles & permissions", included: true },
              { text: "Custom integrations", included: true },
              { text: "White-label client portal", included: true },
              { text: "Dedicated account manager", included: true },
              { text: "SLA & phone support", included: true },
              { text: "API access", included: true },
            ]}
            cta="Contact Sales"
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Frequently Asked Questions</h2>
          <p className="text-slate-500">Everything you need to know about Invoicy.</p>
        </div>
        <div className="space-y-4">
          {[
            { q: "How does voice-to-invoice work?", a: "Click the mic button on the invoice builder and speak naturally: 'Invoice Acme for website design, 50,000 rupees plus 18% GST, due in 15 days.' Our AI parses your speech into structured invoice data instantly." },
            { q: "Is my client data safe?", a: "Absolutely. We use Clerk for authentication, encrypt data in transit with TLS 1.3, and never sell or share your data. Your SMTP credentials stay in your browser's local storage." },
            { q: "Can I use my own email to send reminders?", a: "Yes. Connect your Gmail, Outlook, Zoho, or any SMTP server in Settings. Emails are sent from your address, so clients recognize the sender." },
            { q: "How does AI tax intelligence work?", a: "When you add a line item, click 'Suggest GST rate.' Our AI analyzes the description and returns the correct GST rate (0%, 5%, 12%, 18%, or 28%) plus the appropriate HSN or SAC code." },
            { q: "What payment methods do you accept?", a: "We accept UPI, credit/debit cards, and net banking via Razorpay. International cards are also supported." },
            { q: "Can I cancel anytime?", a: "Yes. You can cancel your subscription at any time and continue using your current plan until the end of the billing period. We also offer a 14-day money-back guarantee." },
          ].map((faq) => (
            <details key={faq.q} className="group p-4 rounded-xl border border-slate-100 bg-white open:shadow-sm transition-shadow">
              <summary className="flex items-center justify-between text-sm font-semibold text-slate-800 cursor-pointer list-none">
                {faq.q}
                <span className="text-slate-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to stop chasing payments?</h2>
          <p className="text-indigo-100 mb-8">Join hundreds of Indian freelancers and agencies using Invoicy to get paid faster.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
            Start Invoicing Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <FileText size={18} className="text-indigo-600" />
            Invoicy
          </div>
          <p className="text-xs text-slate-400">Built for India. GST-ready. AI-powered.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
