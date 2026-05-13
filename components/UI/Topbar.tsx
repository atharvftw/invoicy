"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  FileText,
  Users,
  MessageSquareWarning,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useInvoiceStore } from "@/store/invoiceStore";
import { useUIStore } from "@/store/uiStore";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export default function Topbar() {
  const router = useRouter();
  const { invoices, newInvoice } = useInvoiceStore();
  const { sidebarOpen } = useUIStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setQuickOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchResults = query.trim()
    ? invoices.filter(
        (inv) =>
          inv.invoice_number.toLowerCase().includes(query.toLowerCase()) ||
          inv.bill_to.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  function handleNewInvoice() {
    newInvoice();
    setQuickOpen(false);
    router.push("/invoice/new");
  }

  const notifications = [
    { id: 1, text: "Invoice INV-003 marked as paid", time: "2m ago", read: false },
    { id: 2, text: "Reminder sent to Acme Corp", time: "1h ago", read: false },
    { id: 3, text: "New client 'Beta Ltd' added", time: "3h ago", read: true },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 h-14 flex items-center justify-between shrink-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
      {/* Left: breadcrumb spacing when sidebar is open on desktop */}
      <div className={cn("hidden lg:block", sidebarOpen ? "w-0" : "w-0")} />

      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ color: 'var(--text-tertiary)' }} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search invoices, clients…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
              placeholder:text-gray-400 transition-all"
            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          />
        </div>

        {searchOpen && query.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
            {searchResults.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400" style={{ color: 'var(--text-tertiary)' }}>No results</p>
            ) : (
              searchResults.slice(0, 6).map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => {
                    router.push(`/invoice/${inv.id}`);
                    setSearchOpen(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileText size={14} className="text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate" style={{ color: 'var(--text-primary)' }}>
                      {inv.invoice_number || "Draft"}
                    </p>
                    <p className="text-xs text-gray-400 truncate" style={{ color: 'var(--text-tertiary)' }}>{inv.bill_to.name || "—"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Quick Add */}
        <div ref={quickRef} className="relative">
          <button
            onClick={() => setQuickOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New</span>
          </button>
          {quickOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <QuickItem icon={<FileText size={14} />} label="Invoice" onClick={handleNewInvoice} />
              <QuickItem
                icon={<Users size={14} />}
                label="Client"
                onClick={() => {
                  setQuickOpen(false);
                  router.push("/clients");
                }}
              />
              <QuickItem
                icon={<MessageSquareWarning size={14} />}
                label="Reminder"
                onClick={() => {
                  setQuickOpen(false);
                  router.push("/reminders");
                }}
              />
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-sm font-semibold text-gray-800" style={{ color: 'var(--text-primary)' }}>Notifications</p>
                <button className="text-xs text-indigo-600 hover:underline">Mark all read</button>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors",
                    !n.read && "bg-indigo-50/40"
                  )}
                  style={{ color: 'var(--text-primary)' }}
                >
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.read ? "bg-gray-300" : "bg-indigo-500")} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700" style={{ color: 'var(--text-secondary)' }}>{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="pl-2 border-l border-gray-100" style={{ borderColor: 'var(--border-subtle)' }}>
          <UserButton />
        </div>
      </div>
    </header>
  );
}

function QuickItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700"
      style={{ color: 'var(--text-secondary)' }}
    >
      <span className="text-gray-400" style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      {label}
    </button>
  );
}
