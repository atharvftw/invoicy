import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/UI/Sidebar";
import SyncProvider from "@/components/UI/SyncProvider";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Invoicy — Smart Invoice Generator",
  description: "Create, manage and track invoices like a pro. Built for freelancers and agencies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/invoice/new">
      <html lang="en">
        <body className="grain">
          <SyncProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto min-w-0">
                {children}
              </main>
            </div>
          </SyncProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
