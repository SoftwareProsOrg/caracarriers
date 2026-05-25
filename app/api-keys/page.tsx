import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { maskApiKey } from "@/lib/api-keys";
import { CreateKeyDialog } from "@/components/api-keys/create-key-dialog";
import { ApiKeyCard } from "@/components/api-keys/api-key-card";

export default async function ApiKeysPage() {
  const auth = await getAuthContext();

  const apiKeys = auth
    ? await prisma.apiKey.findMany({
        where: { companyId: auth.companyId },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    : [];

  return (
    <>
      <Header title="API Keys" subtitle="Manage external API access" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{apiKeys.length} key{apiKeys.length !== 1 ? "s" : ""}</p>
          <CreateKeyDialog />
        </div>

        {apiKeys.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Key className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">No API keys yet</p>
              <p className="text-xs text-muted-foreground mb-4 max-w-sm">
                Create an API key to allow external applications to access the TMS API.
              </p>
              <CreateKeyDialog />
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <ApiKeyCard
                key={key.id}
                id={key.id}
                name={key.name}
                keyValue={key.key}
                permissions={key.permissions}
                lastUsedAt={key.lastUsedAt}
                expiresAt={key.expiresAt}
                createdAt={key.createdAt}
                isActive={key.isActive}
                maskedKey={maskApiKey(key.key)}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
