export interface DealWithPayload {
  id: string;
  companyId: string;
  leadId: string | null;
  name: string;
  stage: string;
  value: number | null;
  probability: number;
  assignedTo: string | null;
  notes: string | null;
  expectedCloseDate: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StageConfig {
  key: string;
  label: string;
  color: string;
  borderColor: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "muted";
}

export const PIPELINE_STAGES: StageConfig[] = [
  { key: "lead", label: "Lead", color: "text-gray-500", borderColor: "border-t-gray-400", badgeVariant: "muted" },
  { key: "qualified", label: "Qualified", color: "text-blue-500", borderColor: "border-t-blue-400", badgeVariant: "info" },
  { key: "proposal", label: "Proposal", color: "text-yellow-500", borderColor: "border-t-yellow-400", badgeVariant: "warning" },
  { key: "negotiation", label: "Negotiation", color: "text-orange-500", borderColor: "border-t-orange-400", badgeVariant: "warning" },
  { key: "won", label: "Won", color: "text-green-500", borderColor: "border-t-green-400", badgeVariant: "success" },
  { key: "lost", label: "Lost", color: "text-red-500", borderColor: "border-t-red-400", badgeVariant: "destructive" },
];

export function getStageConfig(stage: string): StageConfig {
  return PIPELINE_STAGES.find((s) => s.key === stage) ?? PIPELINE_STAGES[0];
}

export function stageLabel(stage: string): string {
  return getStageConfig(stage).label;
}

export function computePipelineValue(deals: DealWithPayload[]): number {
  return deals
    .filter((d) => d.stage !== "lost")
    .reduce((sum, d) => sum + (d.value ?? 0), 0);
}

export function computeWonRevenue(deals: DealWithPayload[]): number {
  return deals
    .filter((d) => d.stage === "won")
    .reduce((sum, d) => sum + (d.value ?? 0), 0);
}

export function computeActiveDealCount(deals: DealWithPayload[]): number {
  return deals.filter((d) => d.stage !== "won" && d.stage !== "lost").length;
}

export function computeAverageDealSize(deals: DealWithPayload[]): number {
  const withValue = deals.filter((d) => d.value != null);
  if (withValue.length === 0) return 0;
  return withValue.reduce((sum, d) => sum + (d.value ?? 0), 0) / withValue.length;
}

export function groupDealsByStage(deals: DealWithPayload[]): Record<string, DealWithPayload[]> {
  const groups: Record<string, DealWithPayload[]> = {};
  for (const stage of PIPELINE_STAGES) {
    groups[stage.key] = [];
  }
  for (const deal of deals) {
    if (groups[deal.stage]) {
      groups[deal.stage].push(deal);
    }
  }
  return groups;
}
