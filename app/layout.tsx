import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Invoicy — Get Paid Faster | Smart Invoice & Payment Recovery",
  description:
    "Stop chasing payments. Invoicy automates invoice creation, WhatsApp reminders, smart follow-ups, and payment collection for freelancers, agencies & SMBs.",
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
