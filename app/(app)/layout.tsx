import Sidebar from "@/components/UI/Sidebar";
import SyncProvider from "@/components/UI/SyncProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SyncProvider>
      <div className="grain flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </SyncProvider>
  );
}
