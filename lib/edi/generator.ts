interface LoadLike {
  loadNumber: string;
  originCity: string;
  originState: string;
  originZip?: string | null;
  destCity: string;
  destState: string;
  destZip?: string | null;
  pickupDate: Date;
  deliveryDate: Date;
  commodity?: string | null;
  weight?: number | null;
  equipmentType?: string | null;
  poNumber?: string | null;
}

interface InvoiceLike {
  invoiceNumber: string;
  amount: number;
  tax?: number | null;
}

interface TrackingEventLike {
  status?: string | null;
  locationName?: string | null;
  recordedAt: Date;
}

function formatEdiDate(date: Date): string {
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}${m}${d}`;
}

function formatEdiTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}${m}`;
}

export function generateEdi204(load: LoadLike): string {
  const segments: string[] = [];

  segments.push("ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *" +
    `${formatEdiDate(new Date())}*${formatEdiTime(new Date())}*U*00401*000000001*0*P*>~`);
  segments.push("GS*SM*SENDER*RECEIVER*" +
    `${formatEdiDate(new Date())}*${formatEdiTime(new Date())}*1*X*004010~`);
  segments.push("ST*204*0001~");
  segments.push(`B2****${load.loadNumber}~`);

  if (load.poNumber) {
    segments.push(`REF*PO*${load.poNumber}~`);
  }

  segments.push(`N1*SH*SHIPPER~`);
  segments.push(`N3*${load.originCity}~`);
  segments.push(`N4*${load.originCity}*${load.originState}*${load.originZip ?? ""}~`);
  segments.push(`G62*10*${formatEdiDate(load.pickupDate)}*${formatEdiTime(load.pickupDate)}~`);

  segments.push(`N1*CN*CONSIGNEE~`);
  segments.push(`N4*${load.destCity}*${load.destState}*${load.destZip ?? ""}~`);
  segments.push(`G62*10*${formatEdiDate(load.deliveryDate)}*${formatEdiTime(load.deliveryDate)}~`);

  segments.push(`AT5*${load.equipmentType ?? "TL"}***${load.commodity ?? ""}~`);
  if (load.weight) {
    segments.push(`AT8****${load.weight}~`);
  }

  segments.push("SE*12*0001~");
  segments.push("GE*1*1~");
  segments.push("IEA*1*000000001~");

  return segments.join("\n");
}

export function generateEdi210(invoice: InvoiceLike): string {
  const segments: string[] = [];

  segments.push("ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *" +
    `${formatEdiDate(new Date())}*${formatEdiTime(new Date())}*U*00401*000000002*0*P*>~`);
  segments.push("GS*SM*SENDER*RECEIVER*" +
    `${formatEdiDate(new Date())}*${formatEdiTime(new Date())}*2*X*004010~`);
  segments.push("ST*210*0002~");
  segments.push(`B3****${invoice.invoiceNumber}****${invoice.amount.toFixed(2)}~`);
  segments.push(`IT1*1*1*EA****${invoice.amount.toFixed(2)}~`);

  if (invoice.tax) {
    segments.push(`IT1*2*1*EA****${invoice.tax.toFixed(2)}~`);
  }

  segments.push("SE*5*0002~");
  segments.push("GE*1*2~");
  segments.push("IEA*1*000000002~");

  return segments.join("\n");
}

export function generateEdi214(load: LoadLike, trackingEvent: TrackingEventLike): string {
  const segments: string[] = [];

  segments.push("ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *" +
    `${formatEdiDate(new Date())}*${formatEdiTime(new Date())}*U*00401*000000003*0*P*>~`);
  segments.push("GS*QM*SENDER*RECEIVER*" +
    `${formatEdiDate(new Date())}*${formatEdiTime(new Date())}*3*X*004010~`);
  segments.push("ST*214*0003~");
  segments.push(`N9*PO*${load.loadNumber}~`);
  segments.push(`AT7***${trackingEvent.status ?? "X1"}*${formatEdiDate(trackingEvent.recordedAt)}~`);
  segments.push(`N4*${load.destCity}*${load.destState}~`);

  if (trackingEvent.locationName) {
    segments.push(`MSG*${trackingEvent.locationName}~`);
  }

  segments.push("SE*6*0003~");
  segments.push("GE*1*3~");
  segments.push("IEA*1*000000003~");

  return segments.join("\n");
}
