"use client";

import { Users, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClientsPage() {
  const router = useRouter();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <div className="section-card text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <Users size={28} className="text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Clients</h3>
        <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
          The CRM module is under construction. Check back soon for client management, bulk imports, and payment history.
        </p>
      </div>
    </div>
  );
}
