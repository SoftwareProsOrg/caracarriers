function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function calculateEta(
  currentLat: number,
  currentLng: number,
  destLat: number,
  destLng: number,
  avgSpeedMph: number = 60
): Date {
  const R = 3959;
  const dLat = toRad(destLat - currentLat);
  const dLng = toRad(destLng - currentLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(currentLat)) *
      Math.cos(toRad(destLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const hours = distance / avgSpeedMph;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function formatEta(date: Date): string {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today ${time}`;
  if (isTomorrow) return `Tomorrow ${time}`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getTimeSinceLastUpdate(date: Date): {
  text: string;
  color: "green" | "yellow" | "red";
} {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  let text: string;
  if (diffMinutes < 1) text = "Just now";
  else if (diffMinutes < 60) text = `${diffMinutes}m ago`;
  else if (diffHours < 24) text = `${diffHours}h ago`;
  else text = `${diffDays}d ago`;

  const color = diffHours < 1 ? "green" : diffHours < 4 ? "yellow" : "red";

  return { text, color };
}
