"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendForSignature } from "@/app/actions/documenso";

const signerRoles = ["SIGNER", "APPROVER", "CC", "VIEWER"] as const;
type SignerRole = (typeof signerRoles)[number];

const roleLabels: Record<SignerRole, string> = {
  SIGNER: "Carrier",
  APPROVER: "Shipper",
  CC: "Driver",
  VIEWER: "Viewer",
};

const schema = z.object({
  signerName: z.string().min(1, "Signer name is required"),
  signerEmail: z.string().email("Enter a valid email address"),
  signerRole: z.enum(signerRoles),
});

type FormValues = z.infer<typeof schema>;

export interface SendSignatureDialogProps {
  documentId: number;
  documentName: string;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function SendSignatureDialog({
  documentId,
  documentName,
  trigger,
  onSuccess,
}: SendSignatureDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      signerName: "",
      signerEmail: "",
      signerRole: "SIGNER",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = form;

  const selectedRole = useWatch({ control, name: "signerRole" });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setServerError(null);

    const result = await sendForSignature({
      documentId,
      signerName: values.signerName,
      signerEmail: values.signerEmail,
      signerRole: values.signerRole,
    });

    setSubmitting(false);

    if (result.success) {
      reset();
      setOpen(false);
      onSuccess?.();
    } else {
      setServerError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  function handleOpenChange(next: boolean) {
    if (!submitting) {
      setOpen(next);
      if (!next) {
        reset();
        setServerError(null);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Send for Signature</DialogTitle>
        <DialogDescription>{documentName}</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signerName">Signer Name</Label>
            <Input
              id="signerName"
              placeholder="John Smith"
              disabled={submitting}
              {...register("signerName")}
            />
            {errors.signerName && (
              <p className="text-xs text-destructive">
                {errors.signerName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signerEmail">Signer Email</Label>
            <Input
              id="signerEmail"
              type="email"
              placeholder="john@example.com"
              disabled={submitting}
              {...register("signerEmail")}
            />
            {errors.signerEmail && (
              <p className="text-xs text-destructive">
                {errors.signerEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Signer Role</Label>
            <div className="flex flex-wrap gap-2">
              {signerRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  disabled={submitting}
                  onClick={() => setValue("signerRole", role)}
                  className={[
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedRole === role
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-foreground hover:bg-secondary",
                  ].join(" ")}
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>
            {errors.signerRole && (
              <p className="text-xs text-destructive">
                {errors.signerRole.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Sending…" : "Send for Signature"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
