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
} from "lucide-react";
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

  function handleNew() {
    newInvoice();
    router.push("/invoice/new");
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      {/* Collapsed state: just a slim toggle strip */}
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
          {/* Logo + collapse button */}
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
          <nav className="flex-1 px-3 pt-2 space-y-0.5">
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
              <button className="sidebar-link w-full opacity-40 cursor-not-allowed" disabled>
                <Settings size={16} />Settings
              </button>
            </div>
          </nav>

          {!isPremium && sidebarOpen && (
            <div className="px-3 pb-3">
              <UpgradeButton />
            </div>
          )}
          <div className="px-4 pb-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            <div className="text-[10px] text-gray-400">v2.0 · Mini Financial OS</div>
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
