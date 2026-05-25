import { Truck } from "lucide-react";

export default function PortalLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=1200&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-950/85" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">CaraCarriers Portal</span>
        </div>

        <div className="relative z-10">
          <blockquote className="text-2xl font-semibold leading-relaxed text-white">
            &ldquo;Track your shipments, view invoices, and access documents — all in one place.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-slate-400">
            Your dedicated shipper portal for real-time load tracking and account management.
          </p>
        </div>

        <div className="relative z-10 flex gap-6 text-sm text-slate-400">
          <span>Real-Time Tracking</span>
          <span>Digital Documents</span>
          <span>Invoice History</span>
          <span>Shipment Alerts</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
