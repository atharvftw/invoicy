"use client";

import { useState, useRef, useEffect } from "react";
import { Client } from "@/types/invoice";
import { useClientStore } from "@/store/clientStore";

interface Props {
  onSelect: (client: Client) => void;
  currentName?: string;
  currentEmail?: string;
  currentAddress?: string;
  currentPhone?: string;
}

export default function ClientAutocomplete({
  onSelect,
  currentName,
  currentEmail,
  currentAddress,
  currentPhone,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clients = useClientStore((s) => s.clients);
  const saveClient = useClientStore((s) => s.saveClient);

  const filtered = query.trim()
    ? clients
        .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
    : [];

  const handleSelect = (client: Client) => {
    onSelect(client);
    setQuery("");
    setOpen(false);
  };

  const handleSave = async () => {
    if (!currentName) return;
    setSaving(true);
    try {
      const client = await saveClient({
        name: currentName,
        email: currentEmail ?? "",
        address: currentAddress ?? "",
        phone: currentPhone ?? "",
      });
      onSelect(client);
    } finally {
      setSaving(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative mb-2">
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search saved clients…"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-gray-400 placeholder-gray-400"
        />
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-md max-h-36 overflow-y-auto">
          {filtered.map((client) => (
            <li key={client.id}>
              <button
                type="button"
                onMouseDown={() => handleSelect(client)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex flex-col"
              >
                <span className="font-medium text-gray-800">{client.name}</span>
                {client.email && (
                  <span className="text-gray-400">{client.email}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Save as client */}
      {currentName && !saving && (
        <button
          type="button"
          onClick={handleSave}
          className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Save &quot;{currentName}&quot; as client
        </button>
      )}
      {saving && (
        <span className="mt-1 text-xs text-gray-400">Saving…</span>
      )}
    </div>
  );
}
