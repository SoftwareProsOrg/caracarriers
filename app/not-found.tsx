import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header title="404 - Not Found" subtitle="Page does not exist" />
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 rounded-full bg-muted p-4 text-muted-foreground">
          <FileQuestion className="h-12 w-12" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
          Page not found
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button variant="default" asChild>
          <a href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </a>
        </Button>
      </main>
    </div>
  );
}
