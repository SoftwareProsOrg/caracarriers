"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Package,
  Navigation,
  Truck,
  Building2,
  FileText,
  FolderOpen,
  Shield,
  BarChart3,
  Puzzle,
  Settings,
  ChevronRight,
  LogOut,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navGroups = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Load Board", href: "/load-board", icon: Search },
      { label: "Active Loads", href: "/loads", icon: Package },
      { label: "Dispatch Board", href: "/dispatch", icon: Navigation },
    ],
  },
  {
    label: "Relationships",
    items: [
      { label: "Carriers", href: "/carriers", icon: Truck },
      { label: "Shippers", href: "/shippers", icon: Building2 },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Invoicing", href: "/invoicing", icon: DollarSign },
      { label: "Documents", href: "/documents", icon: FolderOpen },
    ],
  },
  {
    label: "Compliance",
    items: [
      { label: "Compliance", href: "/compliance", icon: Shield },
      { label: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Integrations", href: "/integrations", icon: Puzzle },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Truck className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-active-foreground leading-none">CaraCarriers</p>
          <p className="text-xs text-sidebar-foreground mt-0.5">Broker Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className={groupIdx > 0 ? "pt-2" : ""}>
            {group.label && (
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-active text-sidebar-active-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-active/50 hover:text-sidebar-active-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-60" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-white text-xs font-bold">
              MT
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-active-foreground truncate">
              Michael Trevino
            </p>
            <p className="text-[11px] text-sidebar-foreground truncate">Admin</p>
          </div>
          <button className="text-sidebar-foreground hover:text-sidebar-active-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
