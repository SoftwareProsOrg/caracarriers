import { Truck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">CaraCarriers</span>
        </div>

        <div>
          <blockquote className="text-2xl font-semibold leading-relaxed text-white">
            &ldquo;The complete platform built for freight brokers. Manage loads, carriers, and invoicing — all in one place.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-slate-400">
            Replacing scattered tools with a single source of truth for your brokerage.
          </p>
        </div>

        <div className="flex gap-6 text-sm text-slate-400">
          <span>Load Management</span>
          <span>Carrier Vetting</span>
          <span>Automated Invoicing</span>
          <span>DOT Compliance</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
