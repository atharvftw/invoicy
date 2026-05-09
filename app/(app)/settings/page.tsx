"use client";

import { useState } from "react";
import { Settings, Building2, Mail, CreditCard, Crown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "business", label: "Business Profile", icon: <Building2 size={16} /> },
  { id: "integrations", label: "Integrations", icon: <Mail size={16} /> },
  { id: "billing", label: "Billing", icon: <Crown size={16} /> },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("business");

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
              <h2 className="text-sm font-semibold text-gray-900">Business Profile</h2>
              <p className="text-sm text-gray-500">
                Configure your company name, GSTIN, address, and contact details. These will appear on your invoices.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Company Name</label>
                  <input className="input-base" placeholder="Your company name" />
                </div>
                <div>
                  <label className="label-base">GSTIN</label>
                  <input className="input-base" placeholder="22AAAAA0000A1Z5" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-base">Address</label>
                  <textarea className="input-base min-h-[80px]" placeholder="Registered business address" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="section-card space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Integrations</h2>
              <p className="text-sm text-gray-500">Connect WhatsApp Business, email SMTP, and payment gateways.</p>
              <div className="space-y-3">
                <IntegrationRow name="WhatsApp Business" status="not_connected" />
                <IntegrationRow name="Email SMTP" status="not_connected" />
                <IntegrationRow name="Razorpay" status="not_connected" />
                <IntegrationRow name="Stripe" status="not_connected" />
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
                    <p className="text-sm font-semibold text-indigo-900">Free Plan</p>
                    <p className="text-xs text-indigo-600 mt-0.5">Upgrade to Pro for ₹499/month</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntegrationRow({ name, status }: { name: string; status: "connected" | "not_connected" }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50">
      <span className="text-sm font-medium text-gray-700">{name}</span>
      {status === "connected" ? (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Connected</span>
      ) : (
        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Connect</button>
      )}
    </div>
  );
}
