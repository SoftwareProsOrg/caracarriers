import { log } from "@/lib/logger";
import type { CarrierInfo } from "../types";

const DOTLOOKUP_BASE = "https://api.dotlookup.dev";

export async function lookupCarrierByDotNumber(dotNumber: string): Promise<CarrierInfo | null> {
  try {
    const res = await fetch(`${DOTLOOKUP_BASE}/carriers/${dotNumber}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      log.warn("DotLookup carrier lookup failed", {
        dotNumber,
        status: res.status,
      });
      return null;
    }

    const data = await res.json();
    return {
      name: data.legal_name ?? data.dba ?? data.legalName ?? "Unknown",
      mcNumber: data.mc_number ?? data.mcNumber,
      dotNumber: data.dot_number ?? data.dotNumber ?? dotNumber,
      legalName: data.legal_name ?? data.legalName,
      dba: data.dba,
      safetyRating: data.safety_rating ?? data.safetyRating,
      authorityStatus: data.authority_status ?? data.authorityStatus,
      city: data.city,
      state: data.state,
      phone: data.phone,
    };
  } catch (err) {
    log.warn("DotLookup request failed", err as Error);
    return null;
  }
}

export async function searchCarriersByName(name: string): Promise<CarrierInfo[]> {
  try {
    const res = await fetch(`${DOTLOOKUP_BASE}/carriers/name/${encodeURIComponent(name)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const results = Array.isArray(data) ? data : data.results ?? data.carriers ?? [];
    return results.map((c: Record<string, unknown>) => ({
      name: (c.legal_name ?? c.dba ?? c.legalName ?? "Unknown") as string,
      mcNumber: (c.mc_number ?? c.mcNumber) as string | undefined,
      dotNumber: (c.dot_number ?? c.dotNumber) as string | undefined,
      legalName: (c.legal_name ?? c.legalName) as string | undefined,
      dba: c.dba as string | undefined,
      safetyRating: (c.safety_rating ?? c.safetyRating) as string | undefined,
      authorityStatus: (c.authority_status ?? c.authorityStatus) as string | undefined,
      city: c.city as string | undefined,
      state: c.state as string | undefined,
      phone: c.phone as string | undefined,
    }));
  } catch (err) {
    log.warn("DotLookup search failed", err as Error);
    return [];
  }
}
