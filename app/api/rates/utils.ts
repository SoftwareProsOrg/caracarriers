export type TrendDirection = "up" | "down" | "stable";

export function calculateTrend(
  rates: { rate: number; recordedAt: string }[]
): TrendDirection {
  if (rates.length < 3) return "stable";

  const sorted = [...rates].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  const firstAvg =
    firstHalf.reduce((a, r) => a + Number(r.rate), 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((a, r) => a + Number(r.rate), 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;
  const threshold = firstAvg * 0.03;

  if (diff > threshold) return "up";
  if (diff < -threshold) return "down";
  return "stable";
}
