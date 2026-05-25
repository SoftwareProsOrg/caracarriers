export interface LoadBoardSearchParams {
  origin?: string;
  destination?: string;
  equipmentType?: string;
  minRate?: number;
  maxWeight?: number;
  source?: "internal" | "external" | "all";
  limit?: number;
  offset?: number;
}

export interface LoadBoardLoad {
  id: string;
  loadNumber?: string;
  origin: { city: string; state: string; zip?: string };
  destination: { city: string; state: string; zip?: string };
  equipmentType: string;
  weight: number;
  pickupDate: string;
  deliveryDate: string;
  rate: number;
  commodity?: string;
  miles?: number;
  shipperName?: string;
  source: string;
}

export interface CarrierInfo {
  name: string;
  mcNumber?: string;
  dotNumber?: string;
  legalName?: string;
  dba?: string;
  safetyRating?: string;
  authorityStatus?: string;
  insuranceStatus?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

export interface LoadBoardResult {
  loads: LoadBoardLoad[];
  total: number;
  source: string;
}

export interface LoadBoardProvider {
  name: string;
  search(params: LoadBoardSearchParams): Promise<LoadBoardResult>;
}
