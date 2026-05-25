import type { LoadBoardSearchParams, LoadBoardResult, CarrierInfo } from "./types";
import { MockLoadBoardProvider } from "./providers/mock";
import { lookupCarrierByDotNumber, searchCarriersByName } from "./providers/fmcsa";

class LoadBoardService {
  private providers = [new MockLoadBoardProvider()];

  async search(params: LoadBoardSearchParams): Promise<LoadBoardResult> {
    const provider = this.providers[0];
    return provider.search(params);
  }

  async lookupCarrier(dotNumber: string): Promise<CarrierInfo | null> {
    return lookupCarrierByDotNumber(dotNumber);
  }

  async searchCarriers(name: string): Promise<CarrierInfo[]> {
    return searchCarriersByName(name);
  }
}

export const loadBoard = new LoadBoardService();
