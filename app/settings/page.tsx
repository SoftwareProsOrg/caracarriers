import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { DemoDataControls } from "@/components/settings/demo-data-controls";
import { CompanyProfileForm } from "@/components/settings/company-profile-form";

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
        {company ? (
          <CompanyProfileForm company={company} />
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Sign in to manage company settings.
            </CardContent>
          </Card>
        )}

        <Separator />

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
