export const EDI_TYPES = {
  "204": { code: "204", name: "Motor Carrier Load Tender", description: "Load tender/shipment booking" },
  "210": { code: "210", name: "Motor Carrier Freight Details and Invoice", description: "Invoice for freight services" },
  "214": { code: "214", name: "Motor Carrier Shipment Status Message", description: "Shipment status update" },
  "990": { code: "990", name: "Response to a Load Tender", description: "Accept or reject a load tender" },
} as const;

export type EdiTypeCode = keyof typeof EDI_TYPES;

export interface ParseResult<T> {
  status: "success" | "partial" | "error";
  data: T;
  raw: string;
  errors?: string[];
}

export interface Edi204Parsed {
  ediType: "204";
  origin: {
    city: string;
    state: string;
    zip?: string;
    date?: string;
    time?: string;
  };
  destination: {
    city: string;
    state: string;
    zip?: string;
    date?: string;
    time?: string;
  };
  commodity?: string;
  weight?: number;
  equipment?: string;
  reference?: string;
}

export interface Edi210Parsed {
  ediType: "210";
  invoiceNumber?: string;
  loadReference?: string;
  totalAmount?: number;
  lineItems?: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

export interface Edi214Parsed {
  ediType: "214";
  loadReference?: string;
  status?: string;
  location?: string;
  timestamp?: string;
  reason?: string;
}

export interface Edi990Parsed {
  ediType: "990";
  accepted: boolean;
  loadReference?: string;
  reason?: string;
}
