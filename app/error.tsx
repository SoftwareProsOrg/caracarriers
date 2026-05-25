"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header title="Something went wrong" subtitle="An unexpected error occurred" />
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 rounded-full bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
          Application Error
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          We encountered a problem while processing your request. This has been logged and we're looking into it.
        </p>
        <div className="flex gap-4">
          <Button variant="default" onClick={() => reset()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Return to Dashboard</a>
          </Button>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs font-mono text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </main>
    </div>
  );
}
