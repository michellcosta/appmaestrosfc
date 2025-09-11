export type LatLng = { lat: number; lng: number };

export function haversine(a: LatLng, b: LatLng) {
  const R = 6371e3;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.lng - a.lng);
  const s =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c; // metros
}

export function withinRadius(center: LatLng, point: LatLng, radiusMeters: number): boolean {
  return haversine(center, point) <= radiusMeters;
}
