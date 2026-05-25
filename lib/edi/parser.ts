import type { ParseResult, Edi204Parsed, Edi210Parsed, Edi214Parsed } from "./types";

function getSegment(raw: string, segmentId: string): string | null {
  const match = raw.match(new RegExp(`${segmentId}\\*[^~]*~`, "i"));
  return match ? match[0] : null;
}

function getElement(segment: string, position: number): string | undefined {
  const elements = segment.replace(/~$/, "").split("*");
  return elements[position];
}

export function parseEdi204(rawEdi: string): ParseResult<Edi204Parsed> {
  const errors: string[] = [];
  const n1Seg = getSegment(rawEdi, "N1");
  const n3Seg = getSegment(rawEdi, "N3");
  const n4Seg = getSegment(rawEdi, "N4");
  const b2Seg = getSegment(rawEdi, "B2");
  const g62Seg = getSegment(rawEdi, "G62");
  const at5Seg = getSegment(rawEdi, "AT5");
  const at8Seg = getSegment(rawEdi, "AT8");
  const refSeg = getSegment(rawEdi, "REF");

  const b2Elements = b2Seg?.replace(/~$/, "").split("*") ?? [];
  const n1Elements = n1Seg ? rawEdi.match(/N1\*[^~]*~/g) ?? [] : [];
  const g62Elements = g62Seg ? rawEdi.match(/G62\*[^~]*~/g) ?? [] : [];

  const originN4 = n4Seg && n1Elements.length > 0 ? n4Seg : null;
  const destN4 = n4Seg && n1Elements.length > 1 ? rawEdi.match(/N4\*[^~]*~/g)?.[1] ?? null : null;

  const origin: Edi204Parsed["origin"] = { city: "", state: "" };
  const destination: Edi204Parsed["destination"] = { city: "", state: "" };

  if (n4Seg) {
    const n4Elements = n4Seg.replace(/~$/, "").split("*");
    if (n1Elements.length > 0) {
      origin.city = n4Elements[1] ?? "";
      origin.state = n4Elements[2] ?? "";
      origin.zip = n4Elements[3] ?? undefined;
    }
    const secondN4 = rawEdi.match(/N4\*[^~]*~/g)?.[1];
    if (secondN4) {
      const destElements = secondN4.replace(/~$/, "").split("*");
      destination.city = destElements[1] ?? "";
      destination.state = destElements[2] ?? "";
      destination.zip = destElements[3] ?? undefined;
    } else {
      destination.city = n4Elements[1] ?? "";
      destination.state = n4Elements[2] ?? "";
      destination.zip = n4Elements[3] ?? undefined;
    }
  } else {
    errors.push("Missing N4 segment (location info)");
  }

  if (g62Elements.length > 0) {
    const firstG62 = g62Elements[0].replace(/~$/, "").split("*");
    if (firstG62[1] === "10" || firstG62[1] === "64") {
      origin.date = firstG62[2] ?? undefined;
      origin.time = firstG62[3] ?? undefined;
    }
    if (g62Elements.length > 1) {
      const secondG62 = g62Elements[1].replace(/~$/, "").split("*");
      if (secondG62[1] === "10" || secondG62[1] === "64") {
        destination.date = secondG62[2] ?? undefined;
        destination.time = secondG62[3] ?? undefined;
      }
    }
  }

  let commodity: string | undefined;
  let weight: number | undefined;
  let equipment: string | undefined;

  if (at5Seg) {
    const at5Elements = at5Seg.replace(/~$/, "").split("*");
    commodity = at5Elements[2] ?? undefined;
    equipment = at5Elements[1] ?? undefined;
  }

  if (at8Seg) {
    const at8Elements = at8Seg.replace(/~$/, "").split("*");
    weight = at8Elements[2] ? parseFloat(at8Elements[2]) : undefined;
  }

  const reference = refSeg ? getElement(refSeg, 2) : b2Elements[2] ?? undefined;

  const status: ParseResult<Edi204Parsed>["status"] = errors.length === 0 ? "success" : "partial";

  return {
    status,
    data: {
      ediType: "204",
      origin,
      destination,
      commodity,
      weight,
      equipment,
      reference,
    },
    raw: rawEdi,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function parseEdi210(rawEdi: string): ParseResult<Edi210Parsed> {
  const errors: string[] = [];
  const b3Seg = getSegment(rawEdi, "B3");
  const n9Seg = getSegment(rawEdi, "N9");
  const it1Segments = rawEdi.match(/IT1\*[^~]*~/g) ?? [];

  let invoiceNumber: string | undefined;
  let loadReference: string | undefined;
  let totalAmount: number | undefined;
  const lineItems: Edi210Parsed["lineItems"] = [];

  if (b3Seg) {
    const b3Elements = b3Seg.replace(/~$/, "").split("*");
    invoiceNumber = b3Elements[2] ?? undefined;
    totalAmount = b3Elements[4] ? parseFloat(b3Elements[4]) : undefined;
  } else {
    errors.push("Missing B3 segment (invoice header)");
  }

  if (n9Seg) {
    const n9Elements = n9Seg.replace(/~$/, "").split("*");
    loadReference = n9Elements[2] ?? undefined;
  }

  for (const it1 of it1Segments) {
    const elements = it1.replace(/~$/, "").split("*");
    lineItems.push({
      description: elements[2] ?? "",
      quantity: parseInt(elements[1] ?? "0", 10),
      rate: parseFloat(elements[3] ?? "0"),
      amount: parseFloat(elements[4] ?? "0"),
    });
  }

  const status: ParseResult<Edi210Parsed>["status"] = errors.length === 0 ? "success" : "partial";

  return {
    status,
    data: {
      ediType: "210",
      invoiceNumber,
      loadReference,
      totalAmount,
      lineItems,
    },
    raw: rawEdi,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function parseEdi214(rawEdi: string): ParseResult<Edi214Parsed> {
  const errors: string[] = [];
  const at7Seg = getSegment(rawEdi, "AT7");
  const n9Seg = getSegment(rawEdi, "N9");
  const n4Seg = getSegment(rawEdi, "N4");
  const msgSeg = getSegment(rawEdi, "MSG");

  let loadReference: string | undefined;
  let status: string | undefined;
  let location: string | undefined;
  let timestamp: string | undefined;
  let reason: string | undefined;

  if (n9Seg) {
    const n9Elements = n9Seg.replace(/~$/, "").split("*");
    loadReference = n9Elements[2] ?? undefined;
  }

  if (at7Seg) {
    const at7Elements = at7Seg.replace(/~$/, "").split("*");
    status = at7Elements[2] ?? undefined;
    timestamp = at7Elements[3] ?? undefined;
  } else {
    errors.push("Missing AT7 segment (status)");
  }

  if (n4Seg) {
    const n4Elements = n4Seg.replace(/~$/, "").split("*");
    location = `${n4Elements[1] ?? ""}, ${n4Elements[2] ?? ""}`;
  }

  if (msgSeg) {
    reason = getElement(msgSeg, 1) ?? undefined;
  }

  const statusType: ParseResult<Edi214Parsed>["status"] = errors.length === 0 ? "success" : "partial";

  return {
    status: statusType,
    data: {
      ediType: "214",
      loadReference,
      status,
      location,
      timestamp,
      reason,
    },
    raw: rawEdi,
    errors: errors.length > 0 ? errors : undefined,
  };
}
