export interface RoutePoint {
  lat: number;
  lng: number;
  locationName: string;
}

const ROUTES: Record<string, RoutePoint[]> = {
  chicago_dallas: [
    { lat: 41.8781, lng: -87.6298, locationName: "Chicago, IL" },
    { lat: 41.2, lng: -87.8, locationName: "Near Kankakee, IL" },
    { lat: 40.5, lng: -88.3, locationName: "Near Champaign, IL" },
    { lat: 39.8, lng: -89.0, locationName: "Near Decatur, IL" },
    { lat: 39.1, lng: -89.7, locationName: "Near Litchfield, IL" },
    { lat: 38.6, lng: -90.2, locationName: "St. Louis, MO" },
    { lat: 38.0, lng: -90.8, locationName: "Near Festus, MO" },
    { lat: 37.3, lng: -91.5, locationName: "Near Salem, MO" },
    { lat: 36.5, lng: -92.3, locationName: "Near Mountain Home, AR" },
    { lat: 35.7, lng: -93.0, locationName: "Near Clarksville, AR" },
    { lat: 35.0, lng: -93.5, locationName: "Near Danville, AR" },
    { lat: 34.2, lng: -94.0, locationName: "Near De Queen, AR" },
    { lat: 33.5, lng: -94.8, locationName: "Near Texarkana, TX" },
    { lat: 32.8, lng: -96.8, locationName: "Dallas, TX" },
  ],
  atlanta_miami: [
    { lat: 33.749, lng: -84.388, locationName: "Atlanta, GA" },
    { lat: 33.2, lng: -84.0, locationName: "Near Griffin, GA" },
    { lat: 32.5, lng: -83.6, locationName: "Near Warner Robins, GA" },
    { lat: 31.8, lng: -83.3, locationName: "Near Tifton, GA" },
    { lat: 31.0, lng: -83.0, locationName: "Near Valdosta, GA" },
    { lat: 30.3, lng: -82.5, locationName: "Near Lake City, FL" },
    { lat: 29.8, lng: -82.0, locationName: "Near Gainesville, FL" },
    { lat: 29.2, lng: -81.5, locationName: "Near Ocala, FL" },
    { lat: 28.5, lng: -81.3, locationName: "Near Orlando, FL" },
    { lat: 27.8, lng: -80.8, locationName: "Near Melbourne, FL" },
    { lat: 27.2, lng: -80.4, locationName: "Near Fort Pierce, FL" },
    { lat: 26.5, lng: -80.2, locationName: "Near West Palm Beach, FL" },
    { lat: 25.7617, lng: -80.1918, locationName: "Miami, FL" },
  ],
  la_phoenix: [
    { lat: 34.0522, lng: -118.2437, locationName: "Los Angeles, CA" },
    { lat: 34.0, lng: -117.5, locationName: "Near San Bernardino, CA" },
    { lat: 33.8, lng: -116.5, locationName: "Near Palm Springs, CA" },
    { lat: 33.6, lng: -115.3, locationName: "Near Blythe, CA" },
    { lat: 33.5, lng: -114.0, locationName: "Near Quartzsite, AZ" },
    { lat: 33.5, lng: -113.1, locationName: "Near Tonopah, AZ" },
    { lat: 33.4, lng: -112.5, locationName: "Near Goodyear, AZ" },
    { lat: 33.4484, lng: -112.074, locationName: "Phoenix, AZ" },
  ],
  seattle_portland: [
    { lat: 47.6062, lng: -122.3321, locationName: "Seattle, WA" },
    { lat: 47.2, lng: -122.3, locationName: "Near Tacoma, WA" },
    { lat: 46.8, lng: -122.4, locationName: "Near Yelm, WA" },
    { lat: 46.3, lng: -122.5, locationName: "Near Winlock, WA" },
    { lat: 45.8, lng: -122.6, locationName: "Near Woodland, WA" },
    { lat: 45.5, lng: -122.6, locationName: "Vancouver, WA" },
    { lat: 45.5152, lng: -122.6784, locationName: "Portland, OR" },
  ],
};

export function getRandomRoute(): RoutePoint[] {
  const keys = Object.keys(ROUTES);
  const key = keys[Math.floor(Math.random() * keys.length)];
  return ROUTES[key];
}

export function getRouteProgress(route: RoutePoint[], progress: number): RoutePoint {
  const index = Math.min(Math.floor(progress * route.length), route.length - 1);
  return route[index];
}

export function generateMockLatLng(): { lat: number; lng: number; locationName: string } {
  const route = getRandomRoute();
  const progress = Math.random();
  const point = getRouteProgress(route, progress);

  const jitterLat = (Math.random() - 0.5) * 0.02;
  const jitterLng = (Math.random() - 0.5) * 0.02;

  return {
    lat: point.lat + jitterLat,
    lng: point.lng + jitterLng,
    locationName: point.locationName,
  };
}

export function generateMockSpeed(): number {
  return Math.floor(Math.random() * 30) + 45;
}

export function generateMockHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLng);
  let brng = Math.atan2(y, x);
  brng = (brng * 180) / Math.PI;
  return (brng + 360) % 360;
}
