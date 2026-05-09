"use client";

import { useState } from "react";
import { Settings, Building2, Mail, CreditCard, Crown, ArrowLeft, MessageCircle, CheckCircle2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "business", label: "Business Profile", icon: <Building2 size={16} /> },
  { id: "integrations", label: "Integrations", icon: <Mail size={16} /> },
  { id: "billing", label: "Billing", icon: <Crown size={16} /> },
];

export default function SettingsPage() {
  const router = useRouter();
  const { isPremium } = usePlan();
  const [activeTab, setActiveTab] = useState("business");
  const [saved, setSaved] = useState(false);
  const [business, setBusiness] = useState({
    companyName: "",
    gstin: "",
    address: "",
    phone: "",
    email: "",
  });

  const handleSaveBusiness = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
          <Settings size={18} className="text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your business profile, integrations, and billing.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tabs */}
        <div className="sm:w-56 shrink-0 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "business" && (
            <div className="section-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Business Profile</h2>
                <button
                  onClick={handleSaveBusiness}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    saved ? "bg-green-50 text-green-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                >
                  {saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                  {saved ? "Saved" : "Save Changes"}
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Configure your company name, GSTIN, address, and contact details. These appear on invoices.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Company Name</label>
                  <input className="input-base" value={business.companyName} onChange={(e) => setBusiness({ ...business, companyName: e.target.value })} placeholder="Your company name" />
                </div>
                <div>
                  <label className="label-base">GSTIN</label>
                  <input className="input-base" value={business.gstin} onChange={(e) => setBusiness({ ...business, gstin: e.target.value.toUpperCase() })} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-base">Address</label>
                  <textarea className="input-base min-h-[80px]" value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} placeholder="Registered business address" />
                </div>
                <div>
                  <label className="label-base">Phone</label>
                  <input className="input-base" value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} placeholder="+91 …" />
                </div>
                <div>
                  <label className="label-base">Email</label>
                  <input type="email" className="input-base" value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })} placeholder="billing@company.com" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="section-card space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Integrations</h2>
              <p className="text-sm text-gray-500">Connect WhatsApp Business, email SMTP, and payment gateways.</p>
              <div className="space-y-3">
                <IntegrationRow name="WhatsApp Business" icon={<MessageCircle size={16} className="text-green-500" />} status="not_connected" />
                <IntegrationRow name="Email SMTP" icon={<Mail size={16} className="text-blue-500" />} status="not_connected" />
                <IntegrationRow name="Razorpay" icon={<CreditCard size={16} className="text-indigo-500" />} status="not_connected" />
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="section-card space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Billing</h2>
              <p className="text-sm text-gray-500">Manage your Invoicy plan and subscription.</p>
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">{isPremium ? "Pro Plan" : "Free Plan"}</p>
                    <p className="text-xs text-indigo-600 mt-0.5">{isPremium ? "All features unlocked" : "Upgrade to Pro for ₹499/month"}</p>
                  </div>
                  {!isPremium && (
                    <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-400">PDF Watermark</p>
                  <p className="text-sm font-medium text-gray-700">{isPremium ? "Removed" : "Visible"}</p>
                </div>
                <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-400">Invoice Themes</p>
                  <p className="text-sm font-medium text-gray-700">{isPremium ? "All 5 themes" : "1 theme (Classic)"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntegrationRow({ name, icon, status }: { name: string; icon: React.ReactNode; status: "connected" | "not_connected" }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm font-medium text-gray-700">{name}</span>
      </div>
      {status === "connected" ? (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Connected</span>
      ) : (
        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Connect</button>
      )}
    </div>
  );
}
