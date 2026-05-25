import { prisma } from "@/lib/prisma";

export interface AuthContext {
  userId: string;
  companyId: string;
  authId: string;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true, companyId: true, authId: true },
    });

    if (!dbUser) return null;
    if (!dbUser.authId) return null;

    return { userId: dbUser.id, companyId: dbUser.companyId, authId: dbUser.authId };
  } catch {
    return null;
  }
}
