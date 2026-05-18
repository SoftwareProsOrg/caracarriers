import { Sidebar } from "@/components/layout/sidebar";

export default function LoadDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
