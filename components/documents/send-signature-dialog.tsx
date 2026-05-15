"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  signerEmail: z.email("Enter a valid email address"),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      signerName: "",
      signerEmail: "",
      signerRole: "SIGNER",
    },
  });

  const selectedRole = watch("signerRole");

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
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg focus:outline-none">
          <Dialog.Title className="text-base font-semibold text-card-foreground">
            Send for Signature
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            {documentName}
          </Dialog.Description>

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
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm" disabled={submitting}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Sending…" : "Send for Signature"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
