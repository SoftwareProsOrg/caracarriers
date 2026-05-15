import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
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
                <Input defaultValue="CaraCarriers LLC" />
              </div>
              <div className="space-y-2">
                <Label>MC Number</Label>
                <Input defaultValue="MC-123456" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DOT Number</Label>
                <Input defaultValue="DOT-7891234" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="(713) 555-0100" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business Address</Label>
              <Input defaultValue="123 Freight Way, Houston, TX 77001" />
            </div>
            <Button size="sm">Save Changes</Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
            <CardDescription>Manage who has access to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {[
                { name: "Admin User", email: "admin@caracarriers.com", role: "Admin" },
                { name: "Sarah Lopez", email: "sarah@caracarriers.com", role: "Dispatcher" },
                { name: "James Park", email: "james@caracarriers.com", role: "Agent" },
              ].map((user) => (
                <div key={user.email} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{user.role}</Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4">Invite User</Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
