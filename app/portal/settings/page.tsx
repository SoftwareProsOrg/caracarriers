import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortalUser } from "@/lib/portal/session";

export default async function PortalSettingsPage() {
  const portalUser = await getPortalUser();
  if (!portalUser) redirect("/portal-login");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your portal account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Name</p>
              <p className="text-sm font-medium text-slate-900">{portalUser.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900">{portalUser.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Company</p>
              <p className="text-sm font-medium text-slate-900">{portalUser.shipper.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Role</p>
              <p className="text-sm font-medium text-slate-900">Shipper</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
