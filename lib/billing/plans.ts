export interface PlanTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyLoads: number;
  users: number;
  features: string[];
  highlighted?: boolean;
  color: string;
}

export const PLANS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For small brokerages getting started",
    monthlyPrice: 299,
    annualPrice: 2990,
    monthlyLoads: 100,
    users: 3,
    color: "blue",
    features: [
      "Load lifecycle management",
      "Carrier & shipper management",
      "Basic dispatch board",
      "Document storage (BOL, POD, Rate Conf)",
      "Email notifications",
      "Load board (internal + mock)",
      "Standard reports",
      "Community support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "For growing brokerages scaling operations",
    monthlyPrice: 799,
    annualPrice: 7990,
    monthlyLoads: 500,
    users: 15,
    highlighted: true,
    color: "indigo",
    features: [
      "Everything in Starter",
      "Customer portal (shipper tracking)",
      "Real-time GPS tracking + ELD integration",
      "CRM + sales pipeline",
      "Rate engine + market intelligence",
      "EDI connectivity (204, 210, 214, 990)",
      "API keys for integrations",
      "Communications hub (notes, SMS, email)",
      "Accounting sync (QuickBooks, factoring)",
      "Accessorial charge management",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For high-volume brokerages and 3PLs",
    monthlyPrice: 1999,
    annualPrice: 19990,
    monthlyLoads: 2000,
    users: -1, // unlimited
    color: "purple",
    features: [
      "Everything in Professional",
      "Unlimited loads & users",
      "White-label customer portal",
      "Workflow automation engine",
      "AI dispatch assistant",
      "AI fraud detection",
      "EDI with all major retailers",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "SSO / SAML",
      "On-premise deployment option",
      "24/7 phone support",
    ],
  },
];

export function getPlanById(id: string): PlanTier | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanDisplayUsers(plan: PlanTier): string {
  return plan.users === -1 ? "Unlimited" : `Up to ${plan.users}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}
