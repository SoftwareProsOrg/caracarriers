export function getMapUrl(lat: number, lng: number): string {
  return `/api/map/static?center=${lat},${lng}&zoom=13&size=600x300`;
}

export function getMapEmbedUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/embed/v1/place?key=PLACEHOLDER&q=${lat},${lng}&center=${lat},${lng}&zoom=13`;
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}
