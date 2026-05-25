interface QBSalesReceipt {
  docNumber: string;
  customerName: string;
  txnDate: string;
  totalAmount: number;
  lineItems: { description: string; amount: number; taxAmount: number }[];
}

interface QBBill {
  docNumber: string;
  vendorName: string;
  txnDate: string;
  totalAmount: number;
  lineItems: { description: string; amount: number }[];
}

interface QBInvoice {
  invoiceNumber: string;
  shipperName: string;
  amount: number;
  tax: number;
  dueAt: Date;
}

interface QBPayment {
  carrierName: string;
  amount: number;
  method: string;
  paidAt: Date;
}

export function syncInvoices(invoices: QBInvoice[]): QBSalesReceipt[] {
  return invoices.map((inv) => ({
    docNumber: inv.invoiceNumber,
    customerName: inv.shipperName,
    txnDate: inv.dueAt.toISOString().split("T")[0],
    totalAmount: Number(inv.amount) + Number(inv.tax),
    lineItems: [
      { description: "Freight services", amount: Number(inv.amount), taxAmount: Number(inv.tax) },
    ],
  }));
}

export function syncPayments(payments: QBPayment[]): QBBill[] {
  return payments.map((p) => ({
    docNumber: `CP-${p.paidAt.getTime()}`,
    vendorName: p.carrierName,
    txnDate: p.paidAt.toISOString().split("T")[0],
    totalAmount: Number(p.amount),
    lineItems: [{ description: `Carrier settlement via ${p.method}`, amount: Number(p.amount) }],
  }));
}

export function getSyncStatus(): { connected: boolean; lastSyncAt: string | null; provider: string } {
  return {
    connected: true,
    lastSyncAt: new Date().toISOString(),
    provider: "QuickBooks Online",
  };
}
