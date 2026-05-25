import Link from "next/link";
import { redirect } from "next/navigation";
import { Truck, LayoutDashboard, Package, FileText, Receipt, Settings, LogOut } from "lucide-react";
import { getPortalUser } from "@/lib/portal/session";
import { PortalLogoutButton } from "./logout-button";

const navLinks = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/loads", label: "Loads", icon: Package },
  { href: "/portal/documents", label: "Documents", icon: FileText },
  { href: "/portal/invoices", label: "Invoices", icon: Receipt },
  { href: "/portal/settings", label: "Settings", icon: Settings },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const portalUser = await getPortalUser();
  if (!portalUser) redirect("/portal-login");

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3 mr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900">CaraCarriers Portal</span>
        </div>

        <nav className="flex items-center gap-1 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{portalUser.name}</p>
            <p className="text-xs text-slate-500">{portalUser.shipper.name}</p>
          </div>
          <PortalLogoutButton />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
