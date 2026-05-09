import Sidebar from "@/components/UI/Sidebar";
import Topbar from "@/components/UI/Topbar";
import SyncProvider from "@/components/UI/SyncProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SyncProvider>
      <div className="grain flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto min-w-0">
            {children}
          </main>
        </div>
      </div>
    </SyncProvider>
  );
}
