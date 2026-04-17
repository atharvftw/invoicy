"use client";

import { Client, Invoice, Party } from "@/types/invoice";
import { Input, Textarea } from "@/components/UI/Input";
import ClientAutocomplete from "@/components/UI/ClientAutocomplete";

interface Props {
  invoice: Invoice;
  onChange: (updates: Partial<Invoice>) => void;
}

function PartyFields({
  label,
  value,
  onUpdate,
}: {
  label: string;
  value: Party;
  onUpdate: (updates: Partial<Party>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <h4 className="text-xs font-semibold text-gray-500">{label}</h4>
      <Input
        label="Name / Company"
        value={value.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="Acme Corp"
      />
      <Textarea
        label="Address"
        value={value.address}
        onChange={(e) => onUpdate({ address: e.target.value })}
        placeholder="123 Main St, City, Country"
        rows={2}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Email"
          type="email"
          value={value.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
          placeholder="hello@company.com"
        />
        <Input
          label="Phone"
          type="tel"
          value={value.phone}
          onChange={(e) => onUpdate({ phone: e.target.value })}
          placeholder="+91 98765 43210"
        />
      </div>
    </div>
  );
}

export default function PartySection({ invoice, onChange }: Props) {
  return (
    <div className="section-card">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
        Parties
      </h3>

      <div className="flex flex-col sm:flex-row gap-0">
        <PartyFields
          label="From (You)"
          value={invoice.from}
          onUpdate={(updates) => onChange({ from: { ...invoice.from, ...updates } })}
        />

        {/* Divider — horizontal on mobile, vertical on desktop */}
        <div className="h-px bg-gray-100 my-4 sm:my-0 sm:w-px sm:h-auto sm:mx-5 sm:self-stretch shrink-0" />

        <div className="flex flex-col flex-1 min-w-0">
          <ClientAutocomplete
            onSelect={(client: Client) =>
              onChange({
                bill_to: {
                  name: client.name,
                  email: client.email,
                  address: client.address,
                  phone: client.phone,
                },
              })
            }
            currentName={invoice.bill_to.name}
            currentEmail={invoice.bill_to.email}
            currentAddress={invoice.bill_to.address}
            currentPhone={invoice.bill_to.phone}
          />
          <PartyFields
            label="Bill To (Client)"
            value={invoice.bill_to}
            onUpdate={(updates) => onChange({ bill_to: { ...invoice.bill_to, ...updates } })}
          />
        </div>
      </div>
    </div>
  );
}
