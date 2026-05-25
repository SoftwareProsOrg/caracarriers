"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortalLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    document.cookie = "portal_email=; path=/; max-age=0";
    router.push("/login");
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
