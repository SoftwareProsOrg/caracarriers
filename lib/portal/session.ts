import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface PortalUserSession {
  id: string;
  email: string;
  name: string;
  shipperId: string;
  shipper: { id: string; name: string; city: string | null; state: string | null };
  companyId: string;
}

export async function getPortalUser(): Promise<PortalUserSession | null> {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get("portal_email")?.value;
    if (!email) return null;

    const portalUser = await prisma.portalUser.findUnique({
      where: { email },
      include: { shipper: { select: { id: true, name: true, city: true, state: true } } },
    });

    if (!portalUser || !portalUser.isActive) return null;

    return {
      id: portalUser.id,
      email: portalUser.email,
      name: portalUser.name,
      shipperId: portalUser.shipperId,
      shipper: portalUser.shipper,
      companyId: portalUser.companyId,
    };
  } catch {
    return null;
  }
}
