"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  History,
  Plus,
  BarChart2,
  Settings,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  Crown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useInvoiceStore } from "@/store/invoiceStore";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import { usePlan } from "@/hooks/usePlan";
import UpgradeButton from "@/components/UI/UpgradeButton";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { newInvoice } = useInvoiceStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { isPremium } = usePlan();
  const [settingsOpen, setSettingsOpen] = useState(false);

  function handleNew() {
    newInvoice();
    router.push("/invoice/new");
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      {/* Collapsed state */}
      {!sidebarOpen && (
        <div className="flex flex-col items-center py-4 px-2 border-r border-gray-100 bg-white gap-3 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Show sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
          <button
            onClick={handleNew}
            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            title="New Invoice"
          >
            <Plus size={16} />
          </button>
          <Link href="/invoice/new" title="Invoice Builder"
            className={cn("p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors", isActive("/invoice") && "text-indigo-600 bg-indigo-50")}>
            <FileText size={16} />
          </Link>
          <Link href="/history" title="History"
            className={cn("p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors", isActive("/history") && "text-indigo-600 bg-indigo-50")}>
            <History size={16} />
          </Link>
        </div>
      )}

      {/* Expanded sidebar */}
      {sidebarOpen && (
        <aside
          className="flex flex-col border-r border-gray-100 bg-white shrink-0"
          style={{ width: "var(--sidebar-width)" }}
        >
          {/* Logo + collapse */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
                <Zap size={14} className="text-white fill-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900 tracking-tight">Invoicy</span>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">Smart billing</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Hide sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          </div>

          {/* New Invoice CTA */}
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={handleNew}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                text-white text-sm font-semibold shadow-sm transition-all duration-150"
            >
              <Plus size={15} strokeWidth={2.5} />
              New Invoice
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 pt-2 space-y-0.5 overflow-y-auto">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Workspace
            </p>
            <Link href="/invoice/new" className={cn("sidebar-link", isActive("/invoice") && "active")}>
              <FileText size={16} />
              Invoice Builder
            </Link>
            <Link href="/history" className={cn("sidebar-link", isActive("/history") && "active")}>
              <History size={16} />
              History
            </Link>

            <div className="pt-2">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Coming Soon
              </p>
              <button className="sidebar-link w-full opacity-40 cursor-not-allowed" disabled>
                <BarChart2 size={16} />Analytics
              </button>

              {/* Settings — clickable, expands premium panel */}
              <button
                onClick={() => setSettingsOpen((v) => !v)}
                className={cn("sidebar-link w-full", settingsOpen && "active")}
              >
                <Settings size={16} />
                Settings
                <span className="ml-auto">
                  {settingsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
              </button>

              {settingsOpen && (
                <div className="mx-1 mb-1 mt-0.5 rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                  {isPremium ? (
                    <div className="flex items-center gap-2">
                      <Crown size={14} className="text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Premium active</p>
                        <p className="text-[10px] text-gray-400">Watermark removed · All themes unlocked</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Crown size={13} className="text-indigo-400" />
                        <p className="text-[11px] font-semibold text-gray-700">Upgrade to Premium</p>
                      </div>
                      <ul className="text-[10px] text-gray-500 space-y-0.5 mb-2 pl-1">
                        <li>· Remove PDF watermark</li>
                        <li>· All 5 invoice themes</li>
                        <li>· Recurring invoices</li>
                      </ul>
                      <UpgradeButton />
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>

          <div className="px-4 pb-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            <div className="text-[10px] text-gray-400">v1.0 · Invoicy</div>
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-[10px] text-indigo-600 font-medium hover:underline">
                  Sign in
                </button>
              </SignInButton>
            </Show>
          </div>
        </aside>
      )}
    </>
  );
}
