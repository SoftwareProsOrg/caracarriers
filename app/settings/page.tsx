import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { DemoDataControls } from "@/components/settings/demo-data-controls";

export default async function SettingsPage() {
  const auth = await getAuthContext();

  const [company, users] = auth
    ? await Promise.all([
        prisma.company.findUnique({ where: { id: auth.companyId } }),
        prisma.user.findMany({ where: { companyId: auth.companyId }, orderBy: { createdAt: "asc" } }),
      ])
    : [null, []];

  return (
    <>
      <Header title="Settings" subtitle="Company profile, users, and preferences" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
        {/* Company */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Profile</CardTitle>
            <CardDescription>Your brokerage&apos;s information shown on documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input defaultValue={company?.name ?? ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>MC Number</Label>
                <Input defaultValue={company?.mcNumber ?? ""} placeholder="MC-XXXXXX" readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DOT Number</Label>
                <Input defaultValue={company?.dotNumber ?? ""} placeholder="DOT-XXXXXXX" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={company?.phone ?? ""} placeholder="(555) 000-0000" readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business Address</Label>
              <Input
                defaultValue={[company?.address, company?.city, company?.state, company?.zip].filter(Boolean).join(", ")}
                placeholder="123 Freight Way, Houston, TX 77001"
                readOnly
              />
            </div>
            <p className="text-xs text-muted-foreground">Company profile editing coming soon.</p>
          </CardContent>
        </Card>

        <Separator />

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
            <CardDescription>Users with access to this workspace</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No team members yet. Users are added when they sign up.</p>
            ) : (
              <div className="divide-y divide-border">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="capitalize">{user.role.toLowerCase()}</Badge>
                      <span className={`h-2 w-2 rounded-full ${user.isActive ? "bg-success" : "bg-muted-foreground"}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Demo Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demo Data</CardTitle>
            <CardDescription>
              Seed the platform with sample loads, carriers, shippers, and invoices to explore the interface.
              Use &ldquo;Clear Demo Data&rdquo; to remove all demo records without affecting real data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DemoDataControls />
          </CardContent>
        </Card>

        <Separator />

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About This Platform</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>CaraCarriers TMS — Internal Operations Platform</p>
            <p>Developed by <span className="text-foreground font-medium">SoftwarePros Org</span></p>
            <p>200 E Van Buren Ave, Harlingen, TX 78550</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
