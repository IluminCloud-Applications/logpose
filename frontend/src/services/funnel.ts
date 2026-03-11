import { apiRequest } from "./api";

export interface FunnelStage {
  name: string;
  value: number;
}

export interface FunnelProduct {
  productId: string;
  productName: string;
  stages: FunnelStage[];
}

export async function fetchFunnelData(
  preset: string,
  dateStart?: string,
  dateEnd?: string,
): Promise<FunnelProduct[]> {
  const params = new URLSearchParams({ preset });
  if (dateStart) params.set("date_start", dateStart);
  if (dateEnd) params.set("date_end", dateEnd);
  return apiRequest<FunnelProduct[]>(`/funnel/data?${params.toString()}`);
}
