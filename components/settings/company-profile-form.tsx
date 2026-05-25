"use client";

import { useActionState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { updateCompany, type UpdateCompanyState } from "@/app/actions/settings";

interface CompanyProfileFormProps {
  company: {
    id: string;
    name: string;
    mcNumber: string | null;
    dotNumber: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    email: string | null;
    website: string | null;
  };
}

export function CompanyProfileForm({ company }: CompanyProfileFormProps) {
  const [state, action, isPending] = useActionState<UpdateCompanyState, FormData>(updateCompany, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company Profile</CardTitle>
        <CardDescription>Your brokerage&apos;s information shown on documents</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              Company profile updated successfully.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" name="name" defaultValue={company.name} required disabled={isPending} />
              {state?.fieldErrors?.name && (
                <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mcNumber">MC Number</Label>
              <Input id="mcNumber" name="mcNumber" defaultValue={company.mcNumber ?? ""} placeholder="MC-XXXXXX" disabled={isPending} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dotNumber">DOT Number</Label>
              <Input id="dotNumber" name="dotNumber" defaultValue={company.dotNumber ?? ""} placeholder="DOT-XXXXXXX" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={company.phone ?? ""} placeholder="(555) 000-0000" disabled={isPending} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={company.email ?? ""} placeholder="dispatch@caracarriers.com" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" defaultValue={company.website ?? ""} placeholder="https://caracarriers.com" disabled={isPending} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input id="address" name="address" defaultValue={company.address ?? ""} placeholder="123 Freight Way" disabled={isPending} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={company.city ?? ""} placeholder="Houston" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={company.state ?? ""} placeholder="TX" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" name="zip" defaultValue={company.zip ?? ""} placeholder="77001" disabled={isPending} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
